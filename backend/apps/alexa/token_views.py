from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from django.conf import settings
from oauth2_provider.models import Application, Grant, AccessToken, RefreshToken
from oauth2_provider.settings import oauth2_settings
import base64
import logging
import json
import secrets
from datetime import timedelta

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class AlexaTokenView(View):
    """
    Manual token view that handles HTTP Basic Authentication from Alexa
    and manually generates tokens to bypass django-oauth-toolkit issues.
    """
    
    def post(self, request, *args, **kwargs):
        logger.info("Manual Alexa Token View called")
        
        # 1. Extract Credentials
        client_id = request.POST.get('client_id')
        client_secret = request.POST.get('client_secret')
        
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Basic '):
            try:
                encoded_credentials = auth_header.split(' ')[1]
                decoded_credentials = base64.b64decode(encoded_credentials).decode('utf-8')
                client_id, client_secret = decoded_credentials.split(':', 1)
                logger.info(f"Extracted credentials from Basic Auth")
            except Exception as e:
                logger.error(f"Error parsing Basic Auth: {e}")
                return JsonResponse({'error': 'invalid_client'}, status=401)
        
        if not client_id or not client_secret:
            return JsonResponse({'error': 'invalid_request', 'error_description': 'Missing credentials'}, status=400)

        # 2. Validate Client
        try:
            app = Application.objects.get(client_id=client_id)
            # Check secret (plain text comparison since we forced it)
            if app.client_secret != client_secret:
                logger.error("Client secret mismatch")
                return JsonResponse({'error': 'invalid_client'}, status=401)
        except Application.DoesNotExist:
            logger.error(f"App not found: {client_id}")
            return JsonResponse({'error': 'invalid_client'}, status=401)
            
        # 3. Handle Grant Type
        grant_type = request.POST.get('grant_type')
        if not grant_type:
            grant_type = 'authorization_code'  # Default for Alexa
            
        if grant_type == 'authorization_code':
            code = request.POST.get('code')
            if not code:
                return JsonResponse({'error': 'invalid_request', 'error_description': 'Missing code'}, status=400)
                
            try:
                grant = Grant.objects.get(code=code, application=app)
                if grant.expires < timezone.now():
                    return JsonResponse({'error': 'invalid_grant', 'error_description': 'Code expired'}, status=400)
                    
                # 4. Create Tokens
                user = grant.user
                scope = grant.scope
                
                # Access Token
                access_token = secrets.token_urlsafe(30)
                expires = timezone.now() + timedelta(seconds=oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS)
                
                AccessToken.objects.create(
                    user=user,
                    application=app,
                    token=access_token,
                    expires=expires,
                    scope=scope
                )
                
                # Refresh Token
                refresh_token = secrets.token_urlsafe(30)
                RefreshToken.objects.create(
                    user=user,
                    application=app,
                    token=refresh_token,
                    access_token=AccessToken.objects.get(token=access_token)
                )
                
                # Delete Grant (one-time use)
                grant.delete()
                
                # 5. Return Response
                return JsonResponse({
                    'access_token': access_token,
                    'token_type': 'Bearer',
                    'expires_in': oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
                    'refresh_token': refresh_token,
                    'scope': scope
                })
                
            except Grant.DoesNotExist:
                return JsonResponse({'error': 'invalid_grant', 'error_description': 'Invalid code'}, status=400)
                
        elif grant_type == 'refresh_token':
            # Handle refresh token flow if needed
            refresh_token_val = request.POST.get('refresh_token')
            try:
                rt = RefreshToken.objects.get(token=refresh_token_val, application=app)
                if rt.revoked:
                     return JsonResponse({'error': 'invalid_grant'}, status=400)
                     
                user = rt.user
                scope = rt.access_token.scope
                
                # New Access Token
                access_token = secrets.token_urlsafe(30)
                expires = timezone.now() + timedelta(seconds=oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS)
                
                AccessToken.objects.create(
                    user=user,
                    application=app,
                    token=access_token,
                    expires=expires,
                    scope=scope
                )
                
                # Rotate Refresh Token
                rt.revoked = timezone.now()
                rt.save()
                
                new_refresh_token = secrets.token_urlsafe(30)
                RefreshToken.objects.create(
                    user=user,
                    application=app,
                    token=new_refresh_token,
                    access_token=AccessToken.objects.get(token=access_token)
                )
                
                return JsonResponse({
                    'access_token': access_token,
                    'token_type': 'Bearer',
                    'expires_in': oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
                    'refresh_token': new_refresh_token,
                    'scope': scope
                })
                
            except RefreshToken.DoesNotExist:
                return JsonResponse({'error': 'invalid_grant'}, status=400)

        return JsonResponse({'error': 'unsupported_grant_type'}, status=400)

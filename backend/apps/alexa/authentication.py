from rest_framework import authentication
from rest_framework import exceptions
from oauth2_provider.models import AccessToken
from django.utils import timezone

class AlexaManualAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token_str = auth_header.split(' ')[1]
        
        try:
            token = AccessToken.objects.get(token=token_str)
            
            if token.expires < timezone.now():
                raise exceptions.AuthenticationFailed('Token expired')
                
            return (token.user, token)
            
        except AccessToken.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token')

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from oauth2_provider.views import AuthorizationView
from django.http import HttpResponse
import logging

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class AutoAuthorizationView(AuthorizationView):
    """
    Custom authorization view that automatically logs in the admin user
    and approves the OAuth2 authorization for Alexa.
    """
    
    def get(self, request, *args, **kwargs):
        logger.info(f"OAuth2 Authorization GET request: {request.GET}")
        
        # Auto-login with admin user if not authenticated
        if not request.user.is_authenticated:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # Get the first superuser (admin)
            admin_user = User.objects.filter(is_superuser=True).first()
            
            if admin_user:
                # Force login without password
                login(request, admin_user, backend='django.contrib.auth.backends.ModelBackend')
                logger.info(f"Auto-logged in user: {admin_user.username}")
        
        # Set allow to True automatically
        if 'allow' not in request.GET and 'allow' not in request.POST:
            # Create a mutable copy of GET
            request.GET = request.GET.copy()
            request.GET['allow'] = 'Authorize'
        
        # Now handle the authorization normally
        try:
            response = super().get(request, *args, **kwargs)
            logger.info(f"Authorization response status: {response.status_code}")
            return response
        except Exception as e:
            logger.error(f"Error in authorization: {e}")
            import traceback
            traceback.print_exc()
            return HttpResponse(f"Error: {str(e)}", status=500)
    
    def post(self, request, *args, **kwargs):
        logger.info(f"OAuth2 Authorization POST request")
        
        # Auto-login if needed
        if not request.user.is_authenticated:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            admin_user = User.objects.filter(is_superuser=True).first()
            
            if admin_user:
                login(request, admin_user, backend='django.contrib.auth.backends.ModelBackend')
        
        return super().post(request, *args, **kwargs)

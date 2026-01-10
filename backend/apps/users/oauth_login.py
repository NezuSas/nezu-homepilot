from django.http import HttpResponseRedirect
from django.views import View
from django.contrib.auth import login, get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class AutoLoginView(View):
    """
    Auto-login view for OAuth2 flow.
    Automatically logs in the admin user and redirects back to the original URL.
    """
    
    def get(self, request):
        # Auto-login with admin user
        User = get_user_model()
        admin_user = User.objects.filter(is_superuser=True).first()
        
        if admin_user:
            login(request, admin_user, backend='django.contrib.auth.backends.ModelBackend')
        
        # Redirect to the 'next' parameter or to /o/authorize/
        next_url = request.GET.get('next', '/o/authorize/')
        
        # Preserve all query parameters
        if '?' in next_url:
            redirect_url = next_url
        else:
            # Add query parameters from current request
            query_string = request.META.get('QUERY_STRING', '')
            if query_string:
                redirect_url = f"{next_url}?{query_string}"
            else:
                redirect_url = next_url
        
        return HttpResponseRedirect(redirect_url)

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from oauth2_provider.models import Application
from django.contrib.auth import get_user_model

User = get_user_model()

# Get or create admin user
try:
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        print("No superuser found. Creating 'admin' user...")
        user = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Superuser 'admin' created with password 'admin'")
        
    # Delete old app if exists
    Application.objects.filter(name="Alexa Smart Home").delete()
    
    # Create new OAuth Application with Resource Owner Password Credentials
    app = Application.objects.create(
        name="Alexa Smart Home",
        user=user,
        client_type=Application.CLIENT_CONFIDENTIAL,
        authorization_grant_type=Application.GRANT_PASSWORD,  # Changed to password grant
        skip_authorization=True
    )
    
    print(f"\nOAuth2 Application: {app.name}")
    print(f"Client ID: {app.client_id}")
    print(f"Client Secret: {app.client_secret}")
    print(f"\n=== IMPORTANT ===")
    print(f"Authorization Grant Type: Resource Owner Password Credentials")
    print(f"Token URL: <YOUR_NGROK_URL>/o/token/")
    print(f"\nFor Alexa Account Linking:")
    print(f"- Auth Grant Type: Auth Code Grant")
    print(f"- Access Token URI: https://b11ae7259782.ngrok-free.app/o/token/")
    print(f"- Client ID: {app.client_id}")
    print(f"- Client Secret: {app.client_secret}")
    print(f"- Client Authentication Scheme: HTTP Basic")
    print(f"\nNOTE: You may need to use 'Implicit Grant' instead if Auth Code doesn't work")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

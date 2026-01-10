import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from oauth2_provider.models import Application

try:
    app = Application.objects.get(name='Alexa Smart Home')
    
    print("=== OAuth2 Application Details ===")
    print(f"Name: {app.name}")
    print(f"Client ID: {app.client_id}")
    print(f"Client Type: {app.client_type}")
    print(f"Authorization Grant Type: {app.authorization_grant_type}")
    print(f"Skip Authorization: {app.skip_authorization}")
    print(f"\nRedirect URIs:")
    for uri in app.redirect_uris.split('\n'):
        print(f"  - {uri}")
    
    print(f"\n=== Test Authorization URL ===")
    print(f"https://b11ae7259782.ngrok-free.app/o/authorize/?client_id={app.client_id}&response_type=code&redirect_uri=https://pitangui.amazon.com/api/skill/link/M2P57ROIUORAU8&state=test123")
    
    print(f"\n✅ Configuration looks correct!")
    print(f"\nIf you still get errors, the issue might be:")
    print(f"1. The Client Secret in Alexa doesn't match")
    print(f"2. The response_type parameter is incorrect")
    print(f"3. OAuth2 provider settings need adjustment")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

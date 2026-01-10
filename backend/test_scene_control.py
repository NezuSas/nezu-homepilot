import os
import django
import requests
import secrets
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from oauth2_provider.models import Application, AccessToken
from django.contrib.auth import get_user_model
from oauth2_provider.settings import oauth2_settings
from apps.routines.models import NezuRoutine, RoutineAction

User = get_user_model()

def test_scene_control():
    try:
        # 1. Setup Data
        user = User.objects.filter(is_superuser=True).first()
        app = Application.objects.get(name='Alexa Smart Home')
        
        # Create a test routine if none exists
        routine, created = NezuRoutine.objects.get_or_create(name="Test Routine")
        if created:
            RoutineAction.objects.create(routine=routine, device_id="switch.test", action_type="turn_on")
            print("Created Test Routine")
            
        # 2. Create Token
        access_token = secrets.token_urlsafe(30)
        expires = timezone.now() + timedelta(seconds=oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS)
        AccessToken.objects.create(user=user, application=app, token=access_token, expires=expires, scope="read write")
        
        url = "http://127.0.0.1:8000/api/alexa/endpoint/"
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
        
        # 3. Test Discovery (Check if routine appears)
        print("\n--- Testing Discovery ---")
        discovery_payload = {
            "directive": {
                "header": {"namespace": "Alexa.Discovery", "name": "Discover", "payloadVersion": "3", "messageId": "1"},
                "payload": {"scope": {"type": "BearerToken", "token": access_token}}
            }
        }
        resp = requests.post(url, json=discovery_payload, headers=headers)
        print(f"Discovery Status: {resp.status_code}")
        if f"routine_{routine.id}" in resp.text:
            print("SUCCESS: Routine found in discovery response")
        else:
            print("FAILURE: Routine NOT found in discovery response")
            
        # 4. Test Activation
        print("\n--- Testing Activation ---")
        activate_payload = {
            "directive": {
                "header": {
                    "namespace": "Alexa.SceneController",
                    "name": "Activate",
                    "payloadVersion": "3",
                    "messageId": "2",
                    "correlationToken": "abc"
                },
                "endpoint": {
                    "scope": {"type": "BearerToken", "token": access_token},
                    "endpointId": f"routine_{routine.id}",
                    "cookie": {"routine_id": str(routine.id)}
                },
                "payload": {}
            }
        }
        resp = requests.post(url, json=activate_payload, headers=headers)
        print(f"Activation Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        
        if "ActivationStarted" in resp.text:
            print("SUCCESS: ActivationStarted event received")
        else:
            print("FAILURE: ActivationStarted event NOT received")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_scene_control()

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.alexa.services import handle_power_control

# Simulate Alexa sending a TurnOn request for device ID 78 (Gata)
directive = {
    "header": {
        "namespace": "Alexa.PowerController",
        "name": "TurnOn",
        "messageId": "test-123",
        "correlationToken": "test-token"
    },
    "endpoint": {
        "endpointId": "78",  # Gata's ID
        "scope": {
            "type": "BearerToken",
            "token": "test-token"
        }
    },
    "payload": {}
}

print("Simulating Alexa TurnOn request for Gata (ID: 78)...")
print(json.dumps(directive, indent=2))
print("\nResponse:")

try:
    response = handle_power_control(directive)
    print(json.dumps(response, indent=2))
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

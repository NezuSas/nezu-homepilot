import requests
import json

print("Testing individual device control (Gata - ID 78)")
print("=" * 60)

gata_request = {
    "directive": {
        "header": {
            "namespace": "Alexa.PowerController",
            "name": "TurnOn",
            "payloadVersion": "3",
            "messageId": "test-gata-456",
            "correlationToken": "test-token"
        },
        "endpoint": {
            "endpointId": "78",
            "scope": {
                "type": "BearerToken",
                "token": "test-token"
            }
        },
        "payload": {}
    }
}

try:
    response = requests.post(
        "http://localhost:8001/api/alexa/endpoint/",
        json=gata_request,
        headers={"Content-Type": "application/json"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"\nResponse Text:")
    print(response.text)
    
    if response.status_code == 200:
        print(f"\nJSON Response:")
        print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

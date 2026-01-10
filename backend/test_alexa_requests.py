import requests
import json

# Test 1: Control individual device (Gata - ID 78)
print("=" * 60)
print("TEST 1: Control individual device 'Gata' (ID: 78)")
print("=" * 60)

gata_request = {
    "directive": {
        "header": {
            "namespace": "Alexa.PowerController",
            "name": "TurnOn",
            "payloadVersion": "3",
            "messageId": "test-gata-123",
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
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"ERROR: {e}")

print("\n" + "=" * 60)
print("TEST 2: Control room 'Oficina' (ID: 3)")
print("=" * 60)

oficina_request = {
    "directive": {
        "header": {
            "namespace": "Alexa.PowerController",
            "name": "TurnOn",
            "payloadVersion": "3",
            "messageId": "test-oficina-123",
            "correlationToken": "test-token"
        },
        "endpoint": {
            "endpointId": "room_3",
            "cookie": {
                "room_id": "3",
                "type": "room"
            },
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
        json=oficina_request,
        headers={"Content-Type": "application/json"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"ERROR: {e}")

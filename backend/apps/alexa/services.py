import logging
import uuid
# from apps.devices.models import Device # Moved to individual functions to avoid circular/shadowing issues

logger = logging.getLogger(__name__)

def handle_directive(request_payload):
    # Alexa sends { "directive": { "header": ... } }
    directive = request_payload.get('directive', request_payload)
    
    header = directive.get('header', {})
    namespace = header.get('namespace')
    name = header.get('name')

    print(f"\n[ALEXA] Handling: {namespace}::{name}")
    logger.info(f"Handling directive: {namespace}::{name}")

    if namespace == 'Alexa.Discovery' and name == 'Discover':
        return handle_discovery()
    
    if namespace == 'Alexa.PowerController':
        return handle_power_control(directive)

    if namespace == 'Alexa.SceneController':
        return handle_scene_control(directive)

    return create_error_response(header, 'INVALID_DIRECTIVE', 'Directive not supported')

def handle_scene_control(directive):
    header = directive.get('header', {})
    endpoint = directive.get('endpoint', {})
    
    # Try to get from cookie first (most robust)
    routine_id = endpoint.get('cookie', {}).get('routine_id')
    
    if not routine_id:
        # Fallback: endpointId is "routine_{id}" or "routine_{id}_alias_{i}"
        endpoint_id = endpoint.get('endpointId', '')
        if endpoint_id.startswith('routine_'):
            # Extract ID part (everything after routine_ and before _alias_)
            parts = endpoint_id.replace('routine_', '').split('_alias_')
            routine_id = parts[0]
            
    name = header.get('name') # Activate
    
    if name != 'Activate':
         return create_error_response(header, 'INVALID_DIRECTIVE', 'Only Activate is supported for scenes')

    try:
        from apps.routines.services import RoutineService
        RoutineService.execute_routine(routine_id)
        
        # Response
        return {
            "context": {},
            "event": {
                "header": {
                    "namespace": "Alexa.SceneController",
                    "name": "ActivationStarted",
                    "payloadVersion": "3",
                    "messageId": header.get('messageId'),
                    "correlationToken": header.get('correlationToken')
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": endpoint.get('scope', {}).get('token')
                    },
                    "endpointId": endpoint.get('endpointId')
                },
                "payload": {
                    "cause": {
                        "type": "VOICE_INTERACTION"
                    },
                    "timestamp": "2017-02-03T16:20:50.52Z" # TODO: Real timestamp
                }
            }
        }

    except Exception as e:
        logger.error(f"Error executing scene: {e}")
        return create_error_response(header, 'INTERNAL_ERROR', str(e))

def handle_discovery():
    from apps.devices.models import Device
    devices = Device.objects.all()
    endpoints = []

    for device in devices:
        # Map Nezu device types to Alexa display categories
        display_categories = ['SWITCH']
        if device.type == 'light':
            display_categories = ['LIGHT']
        elif device.type == 'lock':
            display_categories = ['SMARTLOCK']
        
        # Capabilities
        capabilities = [
            {
                "type": "AlexaInterface",
                "interface": "Alexa",
                "version": "3"
            },
            {
                "type": "AlexaInterface",
                "interface": "Alexa.PowerController",
                "version": "3",
                "properties": {
                    "supported": [{"name": "powerState"}],
                    "proactivelyReported": True,
                    "retrievable": True
                }
            }
        ]

        endpoints.append({
            "endpointId": str(device.id),
            "manufacturerName": "Nezu HomePilot",
            "friendlyName": device.name,
            "description": f"{device.type} in {device.room}",
            "displayCategories": display_categories,
            "cookie": {
                "entity_id": device.entity_id
            },
            "capabilities": capabilities
        })
        logger.info(f"Alexa Discovery: Mapping device '{device.name}' (ID: {device.id})")

    logger.info("Starting Alexa Discovery...")
    
    # Add Routines as Scenes
    from apps.routines.models import NezuRoutine
    routines = NezuRoutine.objects.all()
    logger.info(f"Found {routines.count()} routines to discover.")
    
    for routine in routines:
        endpoints.append({
            "endpointId": f"routine_{routine.id}",
            "manufacturerName": "Nezu HomePilot",
            "friendlyName": routine.name,
            "description": "Nezu Routine",
            "displayCategories": ["SCENE_TRIGGER"],
            "cookie": {
                "routine_id": str(routine.id)
            },
            "capabilities": [
                {
                    "type": "AlexaInterface",
                    "interface": "Alexa",
                    "version": "3"
                },
                {
                    "type": "AlexaInterface",
                    "interface": "Alexa.SceneController",
                    "version": "3",
                    "supportsDeactivation": False
                }
            ]
        })

    # Add Rooms as controllable groups
    from apps.rooms.models import Room
    rooms = Room.objects.all()
    logger.info(f"Found {rooms.count()} rooms to discover.")
    
    for room in rooms:
        # Only expose rooms that have devices
        if room.device_count > 0:
            endpoints.append({
                "endpointId": f"room_{room.id}",
                "manufacturerName": "Nezu HomePilot",
                "friendlyName": room.name,
                "description": f"Room with {room.device_count} devices",
                "displayCategories": ["SWITCH"],  # Using SWITCH for room groups
                "cookie": {
                    "room_id": str(room.id),
                    "type": "room"
                },
                "capabilities": [
                    {
                        "type": "AlexaInterface",
                        "interface": "Alexa",
                        "version": "3"
                    },
                    {
                        "type": "AlexaInterface",
                        "interface": "Alexa.PowerController",
                        "version": "3",
                        "properties": {
                            "supported": [{"name": "powerState"}],
                            "proactivelyReported": False,
                            "retrievable": True
                        }
                    }
                ]
            })

    logger.info(f"Discovery complete. Returning {len(endpoints)} endpoints.")
    for ep in endpoints:
        logger.debug(f" - Endpoint: {ep.get('endpointId')}, Name: {ep.get('friendlyName')}")
    
    return {
        "event": {
            "header": {
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response",
                "payloadVersion": "3",
                "messageId": str(uuid.uuid4())
            },
            "payload": {
                "endpoints": endpoints
            }
        }
    }


def handle_power_control(directive):
    header = directive.get('header', {})
    endpoint = directive.get('endpoint', {})
    
    device_id = endpoint.get('endpointId')
    name = header.get('name')  # TurnOn or TurnOff
    
    # Check if it's a room
    room_id = endpoint.get('cookie', {}).get('room_id')
    endpoint_type = endpoint.get('cookie', {}).get('type')
    
    # Fallback parsing if cookie missing
    if not room_id and isinstance(device_id, str) and device_id.startswith('room_'):
        room_id = device_id.replace('room_', '')
        endpoint_type = 'room'
    
    # Handle room control
    if room_id and endpoint_type == 'room':
        try:
            from apps.rooms.models import Room
            from apps.devices.models import Device
            room = Room.objects.get(id=room_id)
            
            logger.info(f"Controlling room '{room.name}' via Alexa: {name}")
            
            target_state = True if name == 'TurnOn' else False
            
            devices_in_room = Device.objects.filter(room_obj=room)
            
            for device in devices_in_room:
                try:
                    from apps.devices.services import DeviceService
                    DeviceService.toggle_device(device.id, target_state)
                except Exception as e:
                    logger.error(f"Error toggling device {device.name}: {e}")
            
            return {
                "context": {
                    "properties": [{
                        "namespace": "Alexa.PowerController",
                        "name": "powerState",
                        "value": "ON" if target_state else "OFF",
                        "timeOfSample": "2017-02-03T16:20:50.52Z",
                        "uncertaintyInMilliseconds": 500
                    }]
                },
                "event": {
                    "header": {
                        "namespace": "Alexa",
                        "name": "Response",
                        "payloadVersion": "3",
                        "messageId": header.get('messageId'),
                        "correlationToken": header.get('correlationToken')
                    },
                    "endpoint": {
                        "scope": {
                            "type": "BearerToken",
                            "token": endpoint.get('scope', {}).get('token')
                        },
                        "endpointId": device_id
                    },
                    "payload": {}
                }
            }
        except Room.DoesNotExist:
            logger.error(f"Room not found with ID: {room_id}")
            return create_error_response(header, 'NO_SUCH_ENDPOINT', f'Room not found: {room_id}')
        except Exception as e:
            logger.error(f"Error controlling room: {e}")
            import traceback
            traceback.print_exc()
            return create_error_response(header, 'INTERNAL_ERROR', str(e))
    
    # Check if it's a routine
    routine_id = endpoint.get('cookie', {}).get('routine_id')
    
    if not routine_id and isinstance(device_id, str) and device_id.startswith('routine_'):
        routine_id = device_id.replace('routine_', '')

    if routine_id:
        try:
            logger.info(f"Executing routine {routine_id} via PowerController")
            if name == 'TurnOn':
                from apps.routines.services import RoutineService
                RoutineService.execute_routine(routine_id)
            
            return {
                "context": {
                    "properties": [
                        {
                            "namespace": "Alexa.PowerController",
                            "name": "powerState",
                            "value": "ON" if name == 'TurnOn' else "OFF",
                            "timeOfSample": "2017-02-03T16:20:50.52Z",
                            "uncertaintyInMilliseconds": 500
                        },
                        {
                            "namespace": "Alexa.EndpointHealth",
                            "name": "connectivity",
                            "value": {"value": "OK"},
                            "timeOfSample": "2017-02-03T16:20:50.52Z",
                            "uncertaintyInMilliseconds": 500
                        }
                    ]
                },
                "event": {
                    "header": {
                        "namespace": "Alexa",
                        "name": "Response",
                        "payloadVersion": "3",
                        "messageId": header.get('messageId'),
                        "correlationToken": header.get('correlationToken')
                    },
                    "endpoint": {
                        "scope": {
                            "type": "BearerToken",
                            "token": endpoint.get('scope', {}).get('token')
                        },
                        "endpointId": device_id
                    },
                    "payload": {}
                }
            }
        except Exception as e:
            logger.error(f"Error executing routine: {e}")
            return create_error_response(header, 'INTERNAL_ERROR', str(e))

    # Handle individual devices
    try:
        from apps.devices.models import Device
        logger.info(f"Controlling device with ID: {device_id}")
        device = Device.objects.get(id=device_id)
        
        from apps.devices.services import DeviceService
        target_state = True if name == 'TurnOn' else False
        DeviceService.toggle_device(device.id, target_state)
        
        return {
            "context": {
                "properties": [{
                    "namespace": "Alexa.PowerController",
                    "name": "powerState",
                    "value": "ON" if target_state else "OFF",
                    "timeOfSample": "2017-02-03T16:20:50.52Z",
                    "uncertaintyInMilliseconds": 500
                }]
            },
            "event": {
                "header": {
                    "namespace": "Alexa",
                    "name": "Response",
                    "payloadVersion": "3",
                    "messageId": header.get('messageId'),
                    "correlationToken": header.get('correlationToken')
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": endpoint.get('scope', {}).get('token')
                    },
                    "endpointId": str(device_id)
                },
                "payload": {}
            }
        }

    except Device.DoesNotExist:
        logger.error(f"Device not found with ID: {device_id}")
        return create_error_response(header, 'NO_SUCH_ENDPOINT', f'Device not found: {device_id}')
    except Exception as e:
        logger.error(f"Error controlling device: {e}")
        import traceback
        traceback.print_exc()
        return create_error_response(header, 'INTERNAL_ERROR', str(e))

def create_error_response(header, type, message):
    return {
        "event": {
            "header": {
                "namespace": "Alexa",
                "name": "ErrorResponse",
                "payloadVersion": "3",
                "messageId": header.get('messageId', str(uuid.uuid4())),
                "correlationToken": header.get('correlationToken')
            },
            "payload": {
                "type": type,
                "message": message
            }
        }
    }

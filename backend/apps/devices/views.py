from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Device
from .serializers import DeviceSerializer
from apps.core.services.ha_client import ha_client
from .services import DeviceService
from datetime import datetime

class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer

    def list(self, request, *args, **kwargs):
        # Sync with Home Assistant before listing
        try:
            ha_states = ha_client.get_states()
            # Create a lookup dict for faster access: {entity_id: state_obj}
            ha_states_map = {state['entity_id']: state for state in ha_states}
            
            devices = self.get_queryset()
            updated_count = 0
            
            for device in devices:
                if DeviceService.sync_device_from_ha(device, ha_states_map):
                    updated_count += 1
                        
            if updated_count > 0:
                print(f"Synced {updated_count} devices from Home Assistant")
                
        except Exception as e:
            print(f"Error syncing with HA during list: {e}")
            # Continue even if sync fails, returning cached data
            
        return super().list(request, *args, **kwargs)


    @action(detail=False, methods=['post'])
    def batch_toggle(self, request):
        """
        Toggle multiple devices at once.
        Payload: { "ids": ["1", "2"], "isOn": true }
        """
        ids = request.data.get('ids', [])
        is_on = request.data.get('isOn', False)
        
        if not ids:
            return Response({"error": "No ids provided"}, status=400)
            
        updated_devices = []
        
        for device_id in ids:
            try:
                device = DeviceService.toggle_device(device_id, is_on)
                updated_devices.append(DeviceSerializer(device).data)
            except Exception as e:
                print(f"Error toggling device {device_id} in batch: {e}")
                
        return Response(updated_devices)

    @action(detail=False, methods=['post'])
    def sync(self, request):
        """
        Manually sync all devices from Home Assistant.
        Returns detailed summary of changes.
        """
        try:
            # Get all devices from Home Assistant
            ha_states = ha_client.get_states()
            ha_states_map = {state['entity_id']: state for state in ha_states}
            
            # Get current devices in our database
            existing_devices = {device.entity_id: device for device in Device.objects.all()}
            
            new_count = 0
            updated_count = 0
            removed_count = 0
            
            # Check for new and updated devices
            for entity_id, ha_state in ha_states_map.items():
                # Supported domains
                domain = entity_id.split('.')[0]
                if domain not in ['light', 'switch', 'sensor', 'binary_sensor', 'climate', 'lock']:
                    # print(f"Skipping unsupported domain: {domain} for {entity_id}")
                    continue
                    
                if entity_id in existing_devices:
                    # Update existing device
                    device = existing_devices[entity_id]
                    if DeviceService.sync_device_from_ha(device, ha_states_map):
                        updated_count += 1
                else:
                    # Create new device
                    try:
                        attributes = ha_state.get('attributes', {})
                        device_type = domain
                        if domain == 'binary_sensor':
                            device_type = 'sensor'
                            
                        Device.objects.create(
                            entity_id=entity_id,
                            name=attributes.get('friendly_name', entity_id),
                            type=device_type,
                            is_on=ha_state.get('state') not in ['off', 'unavailable', 'unknown', 'closed', 'locked'],
                            is_online=ha_state.get('state') not in ['unavailable', 'unknown'],
                            # Ignore HA area, set as Unassigned for Nezu control
                            room='' 
                        )
                        new_count += 1
                    except Exception as e:
                        print(f"Error creating device {entity_id}: {e}")
            
            # Check for removed devices (devices in DB but not in HA)
            ha_entity_ids = set(ha_states_map.keys())
            for entity_id, device in existing_devices.items():
                if entity_id not in ha_entity_ids:
                    device.delete()
                    removed_count += 1
            
            # Get updated device list
            devices = Device.objects.all()
            serialized_devices = DeviceSerializer(devices, many=True).data
            
            return Response({
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'summary': {
                    'total': len(devices),
                    'new': new_count,
                    'updated': updated_count,
                    'removed': removed_count
                },
                'devices': serialized_devices
            })
            
        except Exception as e:
            print(f"Error during manual sync: {e}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from .models import Device
from apps.core.services.ha_client import ha_client

class DeviceService:
    @staticmethod
    def send_ha_command(device, is_on):
        """
        Send the turn_on/turn_off command to Home Assistant.
        """
        if device.entity_id:
            domain = device.ha_domain
            service = 'turn_on' if is_on else 'turn_off'
            service_data = {'entity_id': device.entity_id}
            
            if domain == 'lock':
                service = 'unlock' if is_on else 'lock'
                
            if domain in ['light', 'switch', 'lock']:
                ha_client.call_service(domain, service, service_data)
                print(f"Sent command to HA: {domain}.{service} for {device.entity_id}")

    @staticmethod
    def toggle_device(device_id, is_on):
        """
        Toggle a device on/off. The signal will handle HA sync.
        """
        try:
            device = Device.objects.get(id=device_id)
            
            # Update local state
            from django.utils import timezone
            if device.is_on != is_on:
                device.is_on = is_on
                device.last_user_command = timezone.now()
                device.save(update_fields=['is_on', 'last_user_command'])
                        
            return device
        except Exception as e:
            print(f"Error toggling device {device_id}: {e}")
            raise e

    @staticmethod
    def sync_device_from_ha(device, ha_states_map):
        """
        Sync a single device state from Home Assistant data.
        """
        if device.entity_id and device.entity_id in ha_states_map:
            # Grace period: Don't sync if updated BY USER in the last 5 seconds
            # This prevents overwriting optimistic updates with stale HA data
            from django.utils import timezone
            import datetime
            
            if device.last_user_command:
                now = timezone.now()
                # Ensure last_user_command is aware
                if timezone.is_naive(device.last_user_command):
                    device.last_user_command = timezone.make_aware(device.last_user_command)
                    
                if (now - device.last_user_command).total_seconds() < 5:
                    return False

            ha_state = ha_states_map[device.entity_id]
            state_str = ha_state.get('state', 'off')
            
            # Determine availability
            is_online = state_str not in ['unavailable', 'unknown']
            
            # Determine is_on based on domain and state string
            is_on = state_str not in ['off', 'unavailable', 'unknown', 'closed', 'locked']
            
            # Update if changed
            has_changes = False
            
            if device.is_online != is_online:
                device.is_online = is_online
                has_changes = True
                
            if device.is_on != is_on:
                device.is_on = is_on
                has_changes = True
            
            # Update value (for sensors)
            if device.value != state_str:
                device.value = state_str
                has_changes = True
            
            # Update unit (for sensors)
            attributes = ha_state.get('attributes', {})
            unit = attributes.get('unit_of_measurement', '')
            if device.unit != unit:
                device.unit = unit
                has_changes = True
                
            # Update attributes (location, battery, etc)
            # Ensure we keep our clean name in the local attributes storage
            # to prevent HA from reverting it in our database views.
            attributes['friendly_name'] = device.name
            
            if device.attributes != attributes:
                print(f"[DEBUG] Sync: Device={device.id}, Name='{device.name}', Old Attr Name='{device.attributes.get('friendly_name')}', New Attr Name='{attributes.get('friendly_name')}'")
                device.attributes = attributes
                has_changes = True

            if has_changes:
                # Set flag to prevent signal from sending command back to HA
                device._from_ha_sync = True
                device.save(update_fields=['is_on', 'is_online', 'value', 'unit', 'attributes'])
                return True
        return False

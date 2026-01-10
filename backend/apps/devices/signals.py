from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Device
from apps.core.services.ha_client import ha_client

@receiver(pre_save, sender=Device)
def track_previous_state(sender, instance, **kwargs):
    """
    Track the previous state of is_on and name to detect changes.
    """
    if instance.pk:
        try:
            old_instance = Device.objects.get(pk=instance.pk)
            instance._old_is_on = old_instance.is_on
            instance._old_name = old_instance.name
            print(f"[DEBUG] Pre-save: ID={instance.id}, Old Name='{old_instance.name}', New Name='{instance.name}'")
        except Device.DoesNotExist:
            instance._old_is_on = None
            instance._old_name = None
            
    # Mirror name to attributes['friendly_name'] for consistency in the JSON field
    if not instance.attributes:
        instance.attributes = {}
    instance.attributes['friendly_name'] = instance.name

    # Sync room_obj name to legacy room field
    if instance.room_obj:
        instance.room = instance.room_obj.name
    elif instance.room_obj_id is None:
        instance.room = ''

@receiver(post_save, sender=Device)
def sync_to_home_assistant(sender, instance, created, **kwargs):
    """
    Send command to Home Assistant when is_on or name changes.
    """
    # Skip if this update came from a HA sync
    if getattr(instance, '_from_ha_sync', False):
        return

    # Check if is_on changed
    old_is_on = getattr(instance, '_old_is_on', None)
    
    if not created and old_is_on != instance.is_on:
        # Send command
        if instance.entity_id:
            domain = instance.ha_domain or instance.entity_id.split('.')[0]
            service = 'turn_on' if instance.is_on else 'turn_off'
            service_data = {'entity_id': instance.entity_id}
            
            if domain == 'lock':
                service = 'unlock' if instance.is_on else 'lock'
                
            if domain in ['light', 'switch', 'lock']:
                try:
                    ha_client.call_service(domain, service, service_data)
                    print(f"Signal: Sent command to HA: {domain}.{service} for {instance.entity_id}")
                except Exception as e:
                    print(f"Signal: Error sending command to HA: {e}")

    # Check if name changed
    old_name = getattr(instance, '_old_name', None)
    if not created and old_name != instance.name:
        if instance.entity_id:
            try:
                ha_client.update_entity_name(instance.entity_id, instance.name)
                print(f"Signal: Updated name in HA for {instance.entity_id} to {instance.name}")
            except Exception as e:
                print(f"Signal: Error updating name in HA: {e}")

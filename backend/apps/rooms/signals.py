from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Room


@receiver(post_save, sender=Room)
def update_device_room_field(sender, instance, created, **kwargs):
    """
    When a Room's name is updated, update the 'room' field (CharField)
    of all devices assigned to this room via room_obj (ForeignKey).
    
    This keeps the legacy 'room' field in sync with the Room object's name.
    """
    if not created:  # Only on update, not on creation
        # Import here to avoid circular imports
        from apps.devices.models import Device
        
        # Get all devices assigned to this room
        devices = Device.objects.filter(room_obj=instance)
        
        # Update the 'room' field to match the Room's name
        updated_count = 0
        for device in devices:
            if device.room != instance.name:
                device.room = instance.name
                device.save(update_fields=['room'])
                updated_count += 1
        
        if updated_count > 0:
            print(f"Updated {updated_count} devices to room '{instance.name}'")

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.devices.models import Device
from apps.rooms.models import Room

# Find Estudio room
estudio = Room.objects.get(name='Estudio')

# Update all devices in Estudio to have room field = 'Estudio'
devices_in_estudio = Device.objects.filter(room_obj=estudio)
updated = 0

for device in devices_in_estudio:
    if device.room != 'Estudio':
        device.room = 'Estudio'
        device.save(update_fields=['room'])
        updated += 1
        print(f"Updated {device.name}: room field changed to 'Estudio'")

print(f"\nTotal updated: {updated} devices")

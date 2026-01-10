import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.devices.models import Device
from apps.rooms.models import Room

# Find Estudio room
estudio = Room.objects.filter(name='Estudio').first()
if estudio:
    print(f"Estudio Room (ID: {estudio.id})")
    print(f"  Name: '{estudio.name}'")
    print(f"  Device count: {estudio.device_count}")
    
    # Check devices assigned to this room via room_obj
    devices_in_estudio = Device.objects.filter(room_obj=estudio)
    print(f"\nDevices assigned to Estudio via room_obj:")
    for d in devices_in_estudio:
        print(f"  - {d.name} (room field: '{d.room}', room_obj: {d.room_obj.name if d.room_obj else 'None'})")
else:
    print("Estudio NOT FOUND")

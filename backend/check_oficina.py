import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.rooms.models import Room
from apps.devices.models import Device

# Find Oficina
oficina = Room.objects.filter(name__icontains='oficina').first()
if oficina:
    print(f"Oficina Room:")
    print(f"  ID: {oficina.id}")
    print(f"  Name: '{oficina.name}'")
    print(f"  Device count: {oficina.device_count}")
    print(f"\nDevices in Oficina:")
    devices = Device.objects.filter(room_obj=oficina)
    for d in devices:
        print(f"  - {d.name} (ID: {d.id}, entity: {d.entity_id})")
else:
    print("Oficina NOT FOUND")

# Check all rooms
print("\n\nAll Rooms:")
for r in Room.objects.all():
    print(f"  {r.id}: {r.name} ({r.device_count} devices)")

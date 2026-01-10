import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.devices.models import Device

# Find Gata
gata_devices = Device.objects.filter(name__icontains='gata')
print(f"Found {gata_devices.count()} devices with 'gata' in name:")
for d in gata_devices:
    print(f"  ID: {d.id}, Name: '{d.name}', Entity: {d.entity_id}")

# List all devices
print("\nAll devices:")
for d in Device.objects.all()[:20]:
    print(f"  ID: {d.id}, Name: '{d.name}'")

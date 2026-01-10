import os
import sys
import django

# Add project root to path
sys.path.append('C:\\Users\\ocuen\\Developer\\Nezu\\nezu-homepilot\\backend')

# Set settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from apps.devices.models import Device

try:
    entity_id = 'switch.sonoff_100177eb58_4'
    device = Device.objects.filter(entity_id=entity_id).first()
    
    if device:
        print(f"FOUND IN DB: {device.name} (ID: {device.id})")
        print(f"  Room: {device.room}")
        print(f"  Room Obj: {device.room_obj}")
    else:
        print(f"NOT FOUND IN DB: {entity_id}")
        
except Exception as e:
    print(f"Error: {e}")

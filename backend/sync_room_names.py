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
    print("Syncing room names from room_obj...")
    devices = Device.objects.filter(room_obj__isnull=False)
    count = 0
    for device in devices:
        if device.room != device.room_obj.name:
            device.room = device.room_obj.name
            device.save(update_fields=['room'])
            count += 1
            
    print(f"Successfully synced room names for {count} devices.")
        
except Exception as e:
    print(f"Error: {e}")

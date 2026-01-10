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
    print("Clearing legacy room fields...")
    # Update all devices to have empty room string
    # We preserve room_obj (the actual relationship) if it exists, 
    # but the user asked for the 'room' column to be 'Sin Asignar' (empty/null)
    # to avoid confusion with HA areas.
    
    count = Device.objects.update(room='')
    print(f"Successfully cleared legacy room field for {count} devices.")
        
except Exception as e:
    print(f"Error: {e}")

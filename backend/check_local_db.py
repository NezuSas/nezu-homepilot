import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.rooms.models import Room, Zone
from apps.devices.models import Device
from apps.users.models import User, DashboardLayout
from apps.routines.models import NezuRoutine

print(f"Users: {User.objects.count()}")
print(f"Zones: {Zone.objects.count()}")
print(f"Rooms: {Room.objects.count()}")
print(f"Devices: {Device.objects.count()}")
print(f"Dashboard Layouts: {DashboardLayout.objects.count()}")
print(f"Routines: {NezuRoutine.objects.count()}")

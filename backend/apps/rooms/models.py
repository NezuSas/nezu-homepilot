from django.db import models
from apps.users.models import User


class Zone(models.Model):
    """
    Zone represents a logical grouping of rooms (e.g., 'First Floor', 'Second Floor', 'Outdoor').
    """
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, default='home', help_text='Lucide icon name')
    color = models.CharField(max_length=7, default='#3b82f6', help_text='Hex color code')
    order = models.IntegerField(default=0, help_text='Display order')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='zones')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def room_count(self):
        return self.rooms.count()


class Room(models.Model):
    """
    Room represents a physical room in the house (e.g., 'Living Room', 'Kitchen', 'Bedroom 1').
    Syncs with Home Assistant Areas.
    """
    name = models.CharField(max_length=100)
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, blank=True, related_name='rooms')
    icon = models.CharField(max_length=50, default='door-open', help_text='Lucide icon name')
    color = models.CharField(max_length=7, default='#6366f1', help_text='Hex color code')
    order = models.IntegerField(default=0, help_text='Display order')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rooms')
    
    # Home Assistant Integration
    ha_area_id = models.CharField(
        max_length=100, 
        null=True, 
        blank=True, 
        unique=True,
        help_text='Home Assistant Area ID for synchronization'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def device_count(self):
        return self.devices.count()
    
    @property
    def is_synced_with_ha(self):
        """Check if this room is synced with Home Assistant"""
        return bool(self.ha_area_id)

from django.db import models


class Device(models.Model):
    DEVICE_TYPES = (
        ('light', 'Light'),
        ('switch', 'Switch'),
        ('sensor', 'Sensor'),
        ('climate', 'Climate'),
        ('lock', 'Lock'),
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=DEVICE_TYPES)
    
    # Legacy room field (kept for backward compatibility)
    room = models.CharField(max_length=100)
    
    # New room relationship
    room_obj = models.ForeignKey(
        'rooms.Room', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='devices',
        help_text='Room this device belongs to'
    )
    
    # User relationship (for multi-user support)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='devices',
        help_text='Owner of this device'
    )
    
    is_on = models.BooleanField(default=False)
    value = models.CharField(max_length=255, blank=True, null=True)
    unit = models.CharField(max_length=20, blank=True, null=True)
    is_online = models.BooleanField(default=True)
    
    # Home Assistant Integration
    entity_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    ha_domain = models.CharField(max_length=20, null=True, blank=True)
    attributes = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_user_command = models.DateTimeField(null=True, blank=True, help_text='Timestamp of last user-initiated command')

    def __str__(self):
        return f"{self.name} ({self.room})"

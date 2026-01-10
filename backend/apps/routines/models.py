from django.db import models

class Scene(models.Model):
    TYPE_CHOICES = [
        ('scene', 'Scene'),
        ('script', 'Script'),
    ]

    name = models.CharField(max_length=255)
    entity_id = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    icon = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class NezuRoutine(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    aliases = models.TextField(default="[]", blank=True)  # Stored as JSON string
    icon = models.CharField(max_length=100, default="Play")
    color = models.CharField(max_length=20, default="blue")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class RoutineTrigger(models.Model):
    TRIGGER_TYPES = [
        ('time', 'Time'),
        ('device_state', 'Device State'),
        ('sun', 'Sun Position'),
    ]
    
    routine = models.ForeignKey(NezuRoutine, related_name='triggers', on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TRIGGER_TYPES)
    
    # For device triggers
    entity_id = models.CharField(max_length=100, blank=True, null=True)
    condition = models.CharField(max_length=20, blank=True, null=True) # ==, !=, >, <
    value = models.CharField(max_length=100, blank=True, null=True) # 'on', '10:00', 'sunset'
    
    # For time triggers
    time = models.TimeField(blank=True, null=True)
    days = models.CharField(max_length=50, default="daily") # daily, weekdays, weekends, or json list of days

    def __str__(self):
        return f"{self.type} - {self.routine.name}"

class RoutineAction(models.Model):
    routine = models.ForeignKey(NezuRoutine, related_name='actions', on_delete=models.CASCADE)
    device_id = models.CharField(max_length=100, blank=True, null=True)  # HA entity_id
    action_type = models.CharField(max_length=100)  # turn_on, turn_off, delay, scene, notify
    
    # Flexible data for complex actions (brightness, color, message)
    data = models.JSONField(default=dict, blank=True)
    
    # Legacy fields (keep for backward compatibility if needed, or migrate)
    value = models.IntegerField(default=0)  
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

from django.contrib import admin
from .models import Device

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'room', 'is_on', 'is_online', 'created_at')
    list_filter = ('type', 'room', 'is_on', 'is_online')
    search_fields = ('name', 'room')
    list_editable = ('is_on', 'is_online')
    ordering = ('-created_at',)

from django.contrib import admin
from .models import Room, Zone


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'icon', 'color', 'order', 'room_count', 'created_at']
    list_filter = ['user', 'created_at']
    search_fields = ['name', 'user__username']
    ordering = ['user', 'order', 'name']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'zone', 'user', 'icon', 'color', 'order', 'device_count', 'created_at']
    list_filter = ['zone', 'user', 'created_at']
    search_fields = ['name', 'user__username', 'zone__name']
    ordering = ['user', 'order', 'name']

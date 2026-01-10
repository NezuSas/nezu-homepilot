from rest_framework import serializers
from .models import Device

class DeviceSerializer(serializers.ModelSerializer):
    isOn = serializers.BooleanField(source='is_on', required=False)
    isOnline = serializers.BooleanField(source='is_online', required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    room_name = serializers.CharField(source='room_obj.name', read_only=True)

    class Meta:
        model = Device
        fields = ['id', 'entity_id', 'name', 'type', 'room', 'room_obj', 'room_name', 'isOn', 'value', 'unit', 'isOnline', 'attributes', 'createdAt', 'updatedAt']

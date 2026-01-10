from rest_framework import serializers
from .models import Room, Zone


class ZoneSerializer(serializers.ModelSerializer):
    roomCount = serializers.IntegerField(source='room_count', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Zone
        fields = ['id', 'name', 'icon', 'color', 'order', 'roomCount', 'createdAt', 'updatedAt']
        read_only_fields = ['id', 'createdAt', 'updatedAt']

    def create(self, validated_data):
        # Automatically assign the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RoomSerializer(serializers.ModelSerializer):
    deviceCount = serializers.IntegerField(source='device_count', read_only=True)
    zoneName = serializers.CharField(source='zone.name', read_only=True, allow_null=True)
    haAreaId = serializers.CharField(source='ha_area_id', read_only=True, allow_null=True)
    isSyncedWithHa = serializers.BooleanField(source='is_synced_with_ha', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'zone', 'zoneName', 'icon', 'color', 'order', 'deviceCount', 'haAreaId', 'isSyncedWithHa', 'createdAt', 'updatedAt']
        read_only_fields = ['id', 'createdAt', 'updatedAt', 'haAreaId', 'isSyncedWithHa']

    def create(self, validated_data):
        # Automatically assign the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate_zone(self, value):
        # Ensure zone belongs to the current user
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError("Zone does not belong to you")
        return value

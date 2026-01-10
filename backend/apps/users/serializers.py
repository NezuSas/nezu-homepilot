from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DashboardLayout

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'theme_preference', 'wallpaper')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('email', 'password', 'name')

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        name = validated_data.get('name', '')
        
        # Generate username from email
        username = email.split('@')[0]
        
        # Handle name splitting
        name_parts = name.split(' ', 1) if name else ['', '']
        first_name = name_parts[0] if len(name_parts) > 0 else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'theme_preference', 'wallpaper')

class DashboardLayoutSerializer(serializers.ModelSerializer):
    layout = serializers.JSONField()
    cards = serializers.JSONField()
    
    class Meta:
        model = DashboardLayout
        fields = ('layout', 'cards', 'updated_at')
        read_only_fields = ('updated_at',)
    
    def to_representation(self, instance):
        """Convert TextField JSON strings to Python objects"""
        import json
        data = super().to_representation(instance)
        data['layout'] = json.loads(instance.layout) if isinstance(instance.layout, str) else instance.layout
        data['cards'] = json.loads(instance.cards) if isinstance(instance.cards, str) else instance.cards
        return data
    
    def to_internal_value(self, data):
        """Convert Python objects to JSON strings for TextField storage"""
        import json
        validated_data = super().to_internal_value(data)
        if 'layout' in validated_data:
            validated_data['layout'] = json.dumps(validated_data['layout'])
        if 'cards' in validated_data:
            validated_data['cards'] = json.dumps(validated_data['cards'])
        return validated_data

import json
from rest_framework import serializers
from .models import Scene, NezuRoutine, RoutineAction, RoutineTrigger

class SceneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scene
        fields = '__all__'

class RoutineTriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutineTrigger
        fields = ['id', 'type', 'entity_id', 'condition', 'value', 'time', 'days']

class RoutineActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoutineAction
        fields = ['id', 'device_id', 'action_type', 'value', 'data', 'order']

class NezuRoutineSerializer(serializers.ModelSerializer):
    triggers = RoutineTriggerSerializer(many=True, required=False)
    actions = RoutineActionSerializer(many=True, required=False)
    aliases = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = NezuRoutine
        fields = ['id', 'name', 'description', 'aliases', 'icon', 'color', 'is_active', 'triggers', 'actions']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        try:
            ret['aliases'] = json.loads(instance.aliases) if instance.aliases else []
        except:
            ret['aliases'] = []
        return ret

    def create(self, validated_data):
        triggers_data = validated_data.pop('triggers', [])
        actions_data = validated_data.pop('actions', [])
        aliases_data = validated_data.pop('aliases', [])
        
        validated_data['aliases'] = json.dumps(aliases_data)
        
        routine = NezuRoutine.objects.create(**validated_data)
        
        for trigger_data in triggers_data:
            RoutineTrigger.objects.create(routine=routine, **trigger_data)
            
        for action_data in actions_data:
            RoutineAction.objects.create(routine=routine, **action_data)
            
        return routine

    def update(self, instance, validated_data):
        triggers_data = validated_data.pop('triggers', None)
        actions_data = validated_data.pop('actions', None)
        aliases_data = validated_data.pop('aliases', None)
        
        # Update routine fields
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        if aliases_data is not None:
            instance.aliases = json.dumps(aliases_data)
        instance.icon = validated_data.get('icon', instance.icon)
        instance.color = validated_data.get('color', instance.color)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        
        # Update triggers if provided
        if triggers_data is not None:
            instance.triggers.all().delete()
            for trigger_data in triggers_data:
                RoutineTrigger.objects.create(routine=instance, **trigger_data)
        
        # Update actions if provided
        if actions_data is not None:
            instance.actions.all().delete()
            for action_data in actions_data:
                RoutineAction.objects.create(routine=instance, **action_data)
        
        return instance

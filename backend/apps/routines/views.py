from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Scene, NezuRoutine
from .serializers import SceneSerializer, NezuRoutineSerializer
from apps.core.services.ha_client import ha_client

class SceneViewSet(viewsets.ModelViewSet):
    queryset = Scene.objects.all()
    serializer_class = SceneSerializer

    def list(self, request, *args, **kwargs):
        """
        Sync scenes/scripts from HA before listing
        """
        try:
            states = ha_client.get_states()
            active_entity_ids = []
            
            for state in states:
                entity_id = state.get('entity_id', '')
                domain = entity_id.split('.')[0]
                
                if domain in ['scene', 'automation']:
                    attributes = state.get('attributes', {})
                    friendly_name = attributes.get('friendly_name', entity_id)
                    icon = attributes.get('icon', '')
                    
                    scene, created = Scene.objects.get_or_create(
                        entity_id=entity_id,
                        defaults={
                            'name': friendly_name,
                            'type': domain,
                            'icon': icon
                        }
                    )
                    
                    if not created:
                        scene.type = domain
                        scene.icon = icon
                        scene.save()
                    active_entity_ids.append(entity_id)
            
            # Delete scenes that are no longer in HA
            deleted_count, _ = Scene.objects.exclude(entity_id__in=active_entity_ids).delete()
            if deleted_count > 0:
                print(f"Deleted {deleted_count} stale scenes/automations")
                
        except Exception as e:
            print(f"Error syncing scenes: {e}")

        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """
        Execute a scene or automation
        """
        scene = self.get_object()
        domain = scene.entity_id.split('.')[0]
        
        try:
            if domain == 'automation':
                ha_client.call_service('automation', 'trigger', {'entity_id': scene.entity_id})
            else:
                ha_client.call_service('scene', 'turn_on', {'entity_id': scene.entity_id})
                
            return Response({'status': 'executed', 'entity_id': scene.entity_id})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class NezuRoutineViewSet(viewsets.ModelViewSet):
    queryset = NezuRoutine.objects.all()
    serializer_class = NezuRoutineSerializer

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        routine = self.get_object()
        
        try:
            from .services import RoutineService
            results = RoutineService.execute_routine(routine.id)
            return Response({'status': 'executed', 'results': results})
            
        except Exception as e:
            return Response(
                {'error': str(e), 'routine': routine.name}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

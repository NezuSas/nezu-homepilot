from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Room, Zone
from .serializers import RoomSerializer, ZoneSerializer
from apps.devices.models import Device


class ZoneViewSet(viewsets.ModelViewSet):
    serializer_class = ZoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Zone.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """
        Bulk reorder zones.
        Payload: [{"id": 1, "order": 0}, {"id": 2, "order": 1}, ...]
        """
        items = request.data.get('items', [])
        
        for item in items:
            try:
                zone = Zone.objects.get(id=item['id'], user=request.user)
                zone.order = item['order']
                zone.save(update_fields=['order'])
            except Zone.DoesNotExist:
                pass
        
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def toggle_all(self, request, pk=None):
        """
        Toggle all devices in all rooms within this zone.
        Payload: {"isOn": true/false}
        """
        zone = self.get_object()
        is_on = request.data.get('isOn', False)
        
        # Get all rooms in this zone
        rooms = zone.rooms.all()
        
        # Get all devices in these rooms
        devices = Device.objects.filter(room_obj__in=rooms)
        
        # Update all devices and send commands to HA
        from apps.devices.services import DeviceService
        updated_count = 0
        
        for device in devices:
            try:
                # Update local state
                if device.is_on != is_on:
                    device.is_on = is_on
                    device.save(update_fields=['is_on'])
                    updated_count += 1
                
                # Send command to HA
                DeviceService.send_ha_command(device, is_on)
            except Exception as e:
                print(f"Error toggling device {device.entity_id}: {e}")
        
        return Response({
            'status': 'success',
            'updated': updated_count,
            'isOn': is_on
        })


class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Room.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """
        Bulk reorder rooms.
        Payload: [{"id": 1, "order": 0}, {"id": 2, "order": 1}, ...]
        """
        items = request.data.get('items', [])
        
        for item in items:
            try:
                room = Room.objects.get(id=item['id'], user=request.user)
                room.order = item['order']
                room.save(update_fields=['order'])
            except Room.DoesNotExist:
                pass
        
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def toggle_all(self, request, pk=None):
        """
        Toggle all devices in this room.
        Payload: {"isOn": true/false}
        """
        room = self.get_object()
        is_on = request.data.get('isOn', False)
        
        # Get all devices in this room
        devices = Device.objects.filter(room_obj=room)
        
        # Update all devices and send commands to HA
        from apps.devices.services import DeviceService
        updated_count = 0
        
        for device in devices:
            try:
                # Update local state
                if device.is_on != is_on:
                    device.is_on = is_on
                    device.save(update_fields=['is_on'])
                    updated_count += 1
                
                # Send command to HA
                DeviceService.send_ha_command(device, is_on)
            except Exception as e:
                print(f"Error toggling device {device.entity_id}: {e}")
        
        return Response({
            'status': 'success',
            'updated': updated_count,
            'isOn': is_on
        })

    @action(detail=True, methods=['get'])
    def devices(self, request, pk=None):
        """
        Get all devices in this room.
        """
        room = self.get_object()
        devices = Device.objects.filter(room_obj=room)
        
        from apps.devices.serializers import DeviceSerializer
        serializer = DeviceSerializer(devices, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def sync_with_ha(self, request):
        """
        Sync all Home Assistant Areas to Nezu Rooms.
        Creates/updates rooms based on HA Areas and assigns devices automatically.
        Falls back to creating rooms from existing device data if HA Areas not available.
        """
        from apps.core.services.ha_client import ha_client
        from .services import RoomSyncService
        
        try:
            # Try syncing from HA Areas first
            stats = RoomSyncService.sync_areas_from_ha(ha_client, request.user)
            
            # If no rooms were created/updated, try alternative method
            if stats['created'] == 0 and stats['updated'] == 0:
                print("No areas from HA, trying to sync from existing devices...")
                stats = RoomSyncService.sync_from_existing_devices(request.user)
            
            return Response({
                'status': 'success',
                'message': 'Rooms synced successfully',
                'stats': stats
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

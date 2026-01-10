"""
Service for synchronizing Home Assistant Areas with Nezu Rooms
"""
from apps.rooms.models import Room
from apps.devices.models import Device


# Icon mapping based on common area names
AREA_NAME_TO_ICON = {
    # Living spaces
    'living room': 'sofa',
    'living': 'sofa',
    'sala': 'sofa',
    'lounge': 'sofa',
    
    # Bedrooms
    'bedroom': 'bed',
    'master bedroom': 'bed',
    'dormitorio': 'bed',
    'cuarto': 'bed',
    'habitacion': 'bed',
    
    # Kitchen
    'kitchen': 'utensils',
    'cocina': 'utensils',
    
    # Bathroom
    'bathroom': 'bath',
    'baño': 'bath',
    'bath': 'bath',
    
    # Office
    'office': 'lightbulb',
    'oficina': 'lightbulb',
    'study': 'lightbulb',
    'estudio': 'lightbulb',
    
    # Entertainment
    'media room': 'tv',
    'tv room': 'tv',
    'theater': 'tv',
    
    # Utility
    'garage': 'car',
    'garaje': 'car',
    'laundry': 'warehouse',
    'lavanderia': 'warehouse',
    
    # Outdoor
    'garden': 'trees',
    'jardin': 'trees',
    'patio': 'trees',
    'yard': 'trees',
    
    # Hallway
    'hallway': 'door-open',
    'hall': 'door-open',
    'pasillo': 'door-open',
    'corridor': 'door-open',
    
    # Gym
    'gym': 'dumbbell',
    'gimnasio': 'dumbbell',
    'exercise': 'dumbbell',
}


def get_icon_for_area_name(area_name: str) -> str:
    """
    Map area name to appropriate icon.
    Returns default 'door-open' if no match found.
    """
    area_lower = area_name.lower().strip()
    
    # Direct match
    if area_lower in AREA_NAME_TO_ICON:
        return AREA_NAME_TO_ICON[area_lower]
    
    # Partial match (e.g., "Master Bedroom" contains "bedroom")
    for key, icon in AREA_NAME_TO_ICON.items():
        if key in area_lower:
            return icon
    
    return 'door-open'


class RoomSyncService:
    """Service for syncing Home Assistant Areas with Nezu Rooms"""
    
    @staticmethod
    def sync_areas_from_ha(ha_client, user):
        """
        Sync all Home Assistant Areas to Nezu Rooms for a specific user.
        
        Args:
            ha_client: Home Assistant client instance
            user: User instance to sync rooms for
            
        Returns:
            dict: Statistics about the sync operation
        """
        stats = {
            'created': 0,
            'updated': 0,
            'unchanged': 0,
            'devices_assigned': 0,
        }
        
        try:
            # Get all areas from Home Assistant
            ha_areas = ha_client.get_areas()
            
            print(f"DEBUG: Got {len(ha_areas)} areas from HA")
            
            for ha_area in ha_areas:
                # HA returns areas with different field names depending on version
                area_id = ha_area.get('area_id') or ha_area.get('id')
                area_name = ha_area.get('name', 'Unknown Area')
                
                if not area_id:
                    print(f"DEBUG: Skipping area without ID: {ha_area}")
                    continue
                
                print(f"DEBUG: Processing area: {area_name} (ID: {area_id})")
                
                # Get or create room
                room, created = Room.objects.get_or_create(
                    ha_area_id=area_id,
                    defaults={
                        'name': area_name,
                        'icon': get_icon_for_area_name(area_name),
                        'color': '#6366f1',  # Default indigo
                        'user': user,
                    }
                )
                
                if created:
                    stats['created'] += 1
                    print(f"DEBUG: Created room: {area_name}")
                else:
                    # Update name if changed in HA
                    if room.name != area_name:
                        room.name = area_name
                        room.icon = get_icon_for_area_name(area_name)
                        room.save()
                        stats['updated'] += 1
                        print(f"DEBUG: Updated room: {area_name}")
                    else:
                        stats['unchanged'] += 1
                        print(f"DEBUG: Room unchanged: {area_name}")
                
                # Assign devices to this room
                devices_assigned = RoomSyncService._assign_devices_to_room(
                    ha_client, room, area_id, user
                )
                stats['devices_assigned'] += devices_assigned
                
        except Exception as e:
            print(f"Error syncing areas from HA: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        return stats
    
    @staticmethod
    def sync_from_existing_devices(user):
        """
        Create rooms from existing devices that have room information.
        This is an alternative when HA Areas API is not available.
        
        Args:
            user: User instance to sync rooms for
            
        Returns:
            dict: Statistics about the sync operation
        """
        stats = {
            'created': 0,
            'updated': 0,
            'unchanged': 0,
            'devices_assigned': 0,
        }
        
        try:
            # Get all devices for this user
            devices = Device.objects.filter(user=user)
            
            # Group devices by their room field (legacy string field)
            room_groups = {}
            for device in devices:
                if device.room and device.room.strip():
                    room_name = device.room.strip()
                    if room_name not in room_groups:
                        room_groups[room_name] = []
                    room_groups[room_name].append(device)
            
            print(f"DEBUG: Found {len(room_groups)} unique rooms from devices")
            
            # Create Room objects for each unique room name
            for room_name, devices_in_room in room_groups.items():
                print(f"DEBUG: Processing room '{room_name}' with {len(devices_in_room)} devices")
                
                # Check if room already exists
                room, created = Room.objects.get_or_create(
                    name=room_name,
                    user=user,
                    defaults={
                        'icon': get_icon_for_area_name(room_name),
                        'color': '#6366f1',
                    }
                )
                
                if created:
                    stats['created'] += 1
                    print(f"DEBUG: Created room: {room_name}")
                else:
                    stats['unchanged'] += 1
                    print(f"DEBUG: Room already exists: {room_name}")
                
                # Assign devices to this room
                for device in devices_in_room:
                    if device.room_obj != room:
                        device.room_obj = room
                        device.save(update_fields=['room_obj'])
                        stats['devices_assigned'] += 1
                        
        except Exception as e:
            print(f"Error syncing from existing devices: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        return stats
    
    @staticmethod
    def _assign_devices_to_room(ha_client, room, area_id, user):
        """
        Assign all devices in a Home Assistant Area to the corresponding Nezu Room.
        
        Args:
            ha_client: Home Assistant client instance
            room: Room instance
            area_id: Home Assistant Area ID
            user: User instance
            
        Returns:
            int: Number of devices assigned
        """
        assigned_count = 0
        
        try:
            # Get all entities in this area
            entities_in_area = ha_client.get_entities_in_area(area_id)
            
            for entity_id in entities_in_area:
                try:
                    # Find device in Nezu by entity_id
                    device = Device.objects.get(entity_id=entity_id, user=user)
                    
                    # Assign to room if not already assigned
                    if device.room_obj != room:
                        device.room_obj = room
                        device.save(update_fields=['room_obj'])
                        assigned_count += 1
                        
                except Device.DoesNotExist:
                    # Device not in Nezu yet, will be synced later
                    pass
                    
        except Exception as e:
            print(f"Error assigning devices to room {room.name}: {e}")
        
        return assigned_count
    
    @staticmethod
    def sync_device_area(ha_client, device, user):
        """
        Sync a single device's area assignment from Home Assistant.
        Called during device sync.
        
        Args:
            ha_client: Home Assistant client instance
            device: Device instance
            user: User instance
        """
        try:
            # Get device info from HA
            entity_info = ha_client.get_entity(device.entity_id)
            area_id = entity_info.get('area_id')
            
            if area_id:
                # Find or create room for this area
                room = Room.objects.filter(ha_area_id=area_id, user=user).first()
                
                if room and device.room_obj != room:
                    device.room_obj = room
                    device.save(update_fields=['room_obj'])
                    
        except Exception as e:
            print(f"Error syncing device area for {device.entity_id}: {e}")

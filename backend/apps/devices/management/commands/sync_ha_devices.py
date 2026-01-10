from django.core.management.base import BaseCommand
from apps.core.services.ha_client import ha_client
from apps.devices.models import Device

class Command(BaseCommand):
    help = 'Sync devices from Home Assistant'

    def handle(self, *args, **options):
        self.stdout.write('Fetching devices from Home Assistant...')
        
        try:
            # 1. Fetch all states
            states = ha_client.get_states()
            
            # 2. Fetch areas for all entities using a template
            # We construct a JSON object mapping entity_id -> area_name
            template = """
            {
            {% for state in states %}
              "{{ state.entity_id }}": "{{ area_name(state.entity_id) or 'Sin Asignar' }}"{% if not loop.last %},{% endif %}
            {% endfor %}
            }
            """
            self.stdout.write('Fetching area information...')
            areas_json = ha_client.render_template(template)
            import json
            entity_areas = json.loads(areas_json)

            count_created = 0
            count_updated = 0
            
            SUPPORTED_DOMAINS = {
                'light': 'light',
                'switch': 'switch',
                'sensor': 'sensor',
                'binary_sensor': 'sensor',
                'climate': 'climate',
                'lock': 'lock'
            }

            for state in states:
                entity_id = state['entity_id']
                domain = entity_id.split('.')[0]
                
                if domain in SUPPORTED_DOMAINS:
                    attributes = state.get('attributes', {})
                    friendly_name = attributes.get('friendly_name', entity_id)
                    
                    # Determine values
                    is_on = state['state'] == 'on'
                    value = state['state'] if domain == 'sensor' else None
                    unit = attributes.get('unit_of_measurement')
                    
                    # Get area from our map
                    area = entity_areas.get(entity_id, 'Sin Asignar')
                    if area == 'Sin Asignar':
                         # Fallback: Try to guess from name if no area assigned in HA
                         # e.g. "Kitchen Light" -> "Kitchen" (Simple heuristic, maybe risky)
                         pass

                    # Use update_or_create but handle name separately to avoid overwriting user changes
                    device, created = Device.objects.get_or_create(
                        entity_id=entity_id,
                        defaults={
                            'name': friendly_name,
                            'type': SUPPORTED_DOMAINS[domain],
                            'ha_domain': domain,
                            'room': area,
                            'is_on': is_on,
                            'value': value,
                            'unit': unit,
                            'is_online': state['state'] != 'unavailable'
                        }
                    )
                    
                    if not created:
                        # For existing devices, update everything EXCEPT the name
                        device.type = SUPPORTED_DOMAINS[domain]
                        device.ha_domain = domain
                        device.room = area
                        device.is_on = is_on
                        device.value = value
                        device.unit = unit
                        device.is_online = state['state'] != 'unavailable'
                        device.save()
                    
                    if created:
                        count_created += 1
                        self.stdout.write(self.style.SUCCESS(f'Created: {friendly_name} in {area}'))
                    else:
                        count_updated += 1
                        # self.stdout.write(f'Updated: {friendly_name} in {area}')

            self.stdout.write(self.style.SUCCESS(f'Sync complete. Created: {count_created}, Updated: {count_updated}'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error syncing devices: {e}'))

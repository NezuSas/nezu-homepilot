from django.core.management.base import BaseCommand
from apps.core.services.ha_client import ha_client
import json

class Command(BaseCommand):
    help = 'Test connection to Home Assistant and list entities'

    def handle(self, *args, **options):
        self.stdout.write('Testing connection to Home Assistant...')
        
        if ha_client.check_connection():
            self.stdout.write(self.style.SUCCESS('Successfully connected to Home Assistant!'))
            
            self.stdout.write('Fetching states...')
            try:
                states = ha_client.get_states()
                count = len(states)
                self.stdout.write(f'Found {count} entities.')
                
                if count > 0:
                    self.stdout.write('First 5 entities:')
                    for state in states[:5]:
                        self.stdout.write(f"- {state['entity_id']}: {state['state']} ({state.get('attributes', {}).get('friendly_name', 'No name')})")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error fetching states: {e}'))
        else:
            self.stdout.write(self.style.ERROR('Failed to connect to Home Assistant. Check URL and Token.'))

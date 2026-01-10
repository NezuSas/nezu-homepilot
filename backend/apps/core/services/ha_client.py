import requests
from django.conf import settings
from typing import Dict, Any, List, Optional

class HomeAssistantClient:
    def __init__(self):
        self.base_url = getattr(settings, 'HOMEASSISTANT_URL', 'http://homeassistant.local:8123')
        self.token = getattr(settings, 'HOMEASSISTANT_TOKEN', '')
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def _get(self, endpoint: str) -> requests.Response:
        """Helper for GET requests"""
        url = f"{self.base_url}/api/{endpoint}"
        try:
            response = requests.get(url, headers=self.headers, timeout=5)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            print(f"Error connecting to HA: {e}")
            raise

    def _post(self, endpoint: str, data: Dict[str, Any] = None) -> requests.Response:
        """Helper for POST requests"""
        url = f"{self.base_url}/api/{endpoint}"
        try:
            response = requests.post(url, headers=self.headers, json=data or {}, timeout=5)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            print(f"Error posting to HA: {e}")
            raise

    def check_connection(self) -> bool:
        """Check if we can connect to HA API"""
        try:
            response = self._get("")
            return response.status_code == 200
        except:
            return False

    def get_states(self) -> List[Dict[str, Any]]:
        """Get all states from HA"""
        response = self._get("states")
        return response.json()

    def get_state(self, entity_id: str) -> Dict[str, Any]:
        """Get state of a specific entity"""
        response = self._get(f"states/{entity_id}")
        return response.json()

    def call_service(self, domain: str, service: str, service_data: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Call a service in HA (e.g. turn_on light)"""
        response = self._post(f"services/{domain}/{service}", service_data)
        return response.json()

    def render_template(self, template: str) -> str:
        """Render a Jinja2 template in HA"""
        response = self._post("template", {"template": template})
        return response.text

    def get_persons(self) -> List[Dict[str, Any]]:
        """Get all person entities from HA"""
        states = self.get_states()
        return [state for state in states if state['entity_id'].startswith('person.')]
    
    def get_areas(self) -> List[Dict[str, Any]]:
        """
        Get all areas from Home Assistant.
        Since area_registry/list may not be available in all versions,
        we'll extract areas from the device registry.
        """
        try:
            # Try the direct endpoint first
            response = self._get("config/area_registry/list")
            return response.json()
        except Exception as e:
            print(f"Area registry endpoint not available, trying alternative method: {e}")
            
            # Alternative: Get areas from states
            try:
                states = self.get_states()
                areas = {}
                
                for state in states:
                    attributes = state.get('attributes', {})
                    # Check if entity has area information in attributes
                    if 'area' in attributes:
                        area_name = attributes['area']
                        if area_name and area_name not in areas:
                            # Create a synthetic area object
                            areas[area_name] = {
                                'area_id': area_name.lower().replace(' ', '_'),
                                'name': area_name,
                                'id': area_name.lower().replace(' ', '_')
                            }
                
                return list(areas.values())
            except Exception as e2:
                print(f"Failed to get areas from states: {e2}")
                return []
    
    def get_entities_in_area(self, area_id: str) -> List[str]:
        """
        Get all entity IDs in a specific area.
        Returns list of entity_ids.
        """
        try:
            # Get all entities
            response = self._get("config/entity_registry/list")
            entities = response.json()
            
            # Filter by area_id
            return [
                entity['entity_id'] 
                for entity in entities 
                if entity.get('area_id') == area_id
            ]
        except Exception as e:
            print(f"Error getting entities in area {area_id}: {e}")
            return []
    
    def get_entity(self, entity_id: str) -> Dict[str, Any]:
        """
        Get entity registry information including area_id.
        Different from get_state which only returns current state.
        """
        try:
            response = self._get("config/entity_registry/list")
            entities = response.json()
            
            for entity in entities:
                if entity.get('entity_id') == entity_id:
                    return entity
            
            return {}
        except Exception as e:
            print(f"Error getting entity {entity_id}: {e}")
            return {}

    def update_entity_name(self, entity_id: str, new_name: str) -> bool:
        """
        Update the name of an entity in Home Assistant permanently.
        Tries the entity registry update first, then falls back to state update.
        """
        try:
            # 1. Try permanent update via entity registry
            # Note: This is an internal API that often uses the same token.
            response = self._post("config/entity_registry/update", {
                "entity_id": entity_id,
                "name": new_name
            })
            if response.status_code in [200, 201]:
                print(f"Permanently updated registry name for {entity_id} to {new_name}")
                return True
        except Exception as e:
            print(f"Registry update failed, falling back to state update: {e}")

        # 2. Fallback to ephemeral state update
        try:
            current_state = self.get_state(entity_id)
            if not current_state:
                return False
                
            state = current_state.get('state')
            attributes = current_state.get('attributes', {})
            attributes['friendly_name'] = new_name
            
            response = self._post(f"states/{entity_id}", {
                "state": state,
                "attributes": attributes
            })
            return response.status_code in [200, 201]
        except Exception as e:
            print(f"Error updating entity state in HA: {e}")
            return False

# Singleton instance
ha_client = HomeAssistantClient()

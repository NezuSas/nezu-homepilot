from .models import NezuRoutine
from apps.core.services.ha_client import ha_client

class RoutineService:
    @staticmethod
    def execute_routine(routine_id):
        """
        Execute a NezuRoutine by iterating through its actions and calling HA services.
        """
        try:
            routine = NezuRoutine.objects.get(id=routine_id)
            results = []
            
            print(f"Executing routine: {routine.name} with {routine.actions.count()} actions")
            
            for action in routine.actions.all():
                print(f"Processing action: {action.device_id} - {action.action_type}")
                
                if action.action_type == 'delay':
                    import time
                    delay_seconds = action.value
                    print(f"Waiting for {delay_seconds} seconds...")
                    time.sleep(delay_seconds)
                    results.append({
                        'action_id': action.id,
                        'type': 'delay',
                        'status': 'success'
                    })
                    continue

                domain = action.device_id.split('.')[0]
                service = action.action_type
                
                print(f"Calling HA service: {domain}.{service} for {action.device_id}")
                ha_client.call_service(domain, service, {'entity_id': action.device_id})
                
                results.append({
                    'action_id': action.id,
                    'device_id': action.device_id,
                    'status': 'success'
                })
                
            print(f"Routine executed successfully: {len(results)} actions completed")
            return results
            
        except Exception as e:
            print(f"Error executing routine {routine_id}: {str(e)}")
            raise e

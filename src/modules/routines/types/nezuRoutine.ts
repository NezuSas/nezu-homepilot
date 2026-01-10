export interface RoutineTrigger {
  id?: number;
  type: 'time' | 'device_state' | 'sun';
  entity_id?: string;
  condition?: string;
  value?: string;
  time?: string;
  days?: string;
}

export interface RoutineAction {
  id?: number;
  device_id?: string;
  action_type: string;
  value?: number;
  data?: Record<string, any>;
  order: number;
}

export interface NezuRoutine {
  id?: number;
  name: string;
  description?: string;
  aliases?: string[];
  icon: string;
  color: string;
  is_active: boolean;
  triggers: RoutineTrigger[];
  actions: RoutineAction[];
}

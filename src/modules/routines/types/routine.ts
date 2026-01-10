export interface Scene {
  id: number;
  name: string;
  entity_id: string;
  type: 'scene' | 'script' | 'automation';
  icon?: string;
}

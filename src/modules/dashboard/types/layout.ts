export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CardConfig {
  id: string;
  type: 'device' | 'summary' | 'scene' | 'room' | 'routine';
  deviceId?: string;
  roomName?: string;
  sceneId?: string;
  routineId?: string;
  customIcon?: string; // Lucide icon name
}

export interface DashboardLayout {
  layout: LayoutItem[];
  cards: CardConfig[];
  updated_at: string;
}

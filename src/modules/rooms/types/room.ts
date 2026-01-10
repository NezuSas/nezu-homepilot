export interface Room {
  id: string;
  name: string;
  zone?: string;
  zoneName?: string;
  icon: string;
  color: string;
  order: number;
  deviceCount: number;
  haAreaId?: string;
  isSyncedWithHa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  roomCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomData {
  name: string;
  zone?: string;
  icon: string;
  color: string;
}

export interface CreateZoneData {
  name: string;
  icon: string;
  color: string;
}

export interface ReorderItem {
  id: string;
  order: number;
}

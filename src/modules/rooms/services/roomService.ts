import api from "../../core/services/api";
import { Room, Zone, CreateRoomData, CreateZoneData, ReorderItem } from "../types/room";

export const roomService = {
  // Room CRUD
  getRooms: async (): Promise<Room[]> => {
    const response = await api.get<Room[]>("/rooms/");
    return response.data;
  },

  createRoom: async (data: CreateRoomData): Promise<Room> => {
    const response = await api.post<Room>("/rooms/", data);
    return response.data;
  },

  updateRoom: async (id: string, data: Partial<CreateRoomData>): Promise<Room> => {
    const response = await api.put<Room>(`/rooms/${id}/`, data);
    return response.data;
  },

  deleteRoom: async (id: string): Promise<void> => {
    await api.delete(`/rooms/${id}/`);
  },

  reorderRooms: async (items: ReorderItem[]): Promise<void> => {
    await api.post("/rooms/reorder/", { items });
  },

  toggleAllDevices: async (id: string, isOn: boolean): Promise<void> => {
    await api.post(`/rooms/${id}/toggle_all/`, { isOn });
  },

  getRoomDevices: async (id: string) => {
    const response = await api.get(`/rooms/${id}/devices/`);
    return response.data;
  },

  // Zone CRUD
  getZones: async (): Promise<Zone[]> => {
    const response = await api.get<Zone[]>("/zones/");
    return response.data;
  },

  createZone: async (data: CreateZoneData): Promise<Zone> => {
    const response = await api.post<Zone>("/zones/", data);
    return response.data;
  },

  updateZone: async (id: string, data: Partial<CreateZoneData>): Promise<Zone> => {
    const response = await api.put<Zone>(`/zones/${id}/`, data);
    return response.data;
  },

  deleteZone: async (id: string): Promise<void> => {
    await api.delete(`/zones/${id}/`);
  },

  reorderZones: async (items: ReorderItem[]): Promise<void> => {
    await api.post("/zones/reorder/", { items });
  },

  toggleAllZoneDevices: async (id: string, isOn: boolean): Promise<void> => {
    await api.post(`/zones/${id}/toggle_all/`, { isOn });
  },
  
  // Home Assistant Sync
  syncWithHomeAssistant: async (): Promise<{ status: string; message: string; stats: any }> => {
    const response = await api.post("/rooms/sync_with_ha/");
    return response.data;
  },
};

import api from "../../core/services/api";
import { Device } from "../types/device";

export const deviceService = {
  getDevices: async (): Promise<Device[]> => {
    const response = await api.get<Device[]>("/devices/");
    return response.data;
  },

  toggleDevice: async (id: string, isOn: boolean): Promise<Device> => {
    const response = await api.patch<Device>(`/devices/${id}/`, { isOn });
    return response.data;
  },

  updateDevice: async (id: string, data: Partial<Device>): Promise<Device> => {
    const response = await api.patch<Device>(`/devices/${id}/`, data);
    return response.data;
  },

  createDevice: async (data: Omit<Device, "id" | "isOnline">): Promise<Device> => {
    const response = await api.post<Device>("/devices/", { ...data, isOnline: true });
    return response.data;
  },

  batchToggle: async (ids: string[], isOn: boolean): Promise<Device[]> => {
    const response = await api.post<Device[]>("/devices/batch_toggle/", { ids, isOn });
    return response.data;
  },
};

import api from "../../core/services/api";
import { Device } from "../../devices/types/device";

export interface SyncSummary {
  total: number;
  new: number;
  updated: number;
  removed: number;
}

export interface SyncResponse {
  status: string;
  timestamp: string;
  summary: SyncSummary;
  devices: Device[];
}

export const deviceSyncService = {
  syncDevices: async (): Promise<SyncResponse> => {
    const response = await api.post<SyncResponse>("/devices/sync/");
    return response.data;
  },

  getLastSyncTime: (): string | null => {
    return localStorage.getItem("last_device_sync");
  },

  setLastSyncTime: (timestamp: string) => {
    localStorage.setItem("last_device_sync", timestamp);
  }
};

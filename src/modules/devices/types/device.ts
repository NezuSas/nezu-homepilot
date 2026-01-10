export type DeviceType = "light" | "switch" | "sensor" | "climate" | "lock";

export interface Device {
  id: string;
  entity_id?: string;
  name: string;
  type: DeviceType;
  room: string;
  isOn: boolean;
  value?: number | string;
  unit?: string;
  isOnline: boolean;
  attributes?: Record<string, any>;
}

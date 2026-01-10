import { Device } from "../types/device";
import { DeviceCard } from "./DeviceCard";
import { BatteryCard } from "./BatteryCard";
import { MapCard } from "./MapCard";
import { StorageCard } from "./StorageCard";
import { SensorCard } from "./SensorCard";

interface DeviceGridProps {
  devices: Device[];
  onToggle?: (id: string, isOn: boolean) => void;
  onUpdate?: (id: string, data: Partial<Device>) => Promise<void>;
}

export function DeviceGrid({ devices, onToggle, onUpdate }: DeviceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map((device) => {
        const name = device.name.toLowerCase();
        const value = typeof device.value === 'string' ? parseFloat(device.value) : (device.value || 0);
        const isNumeric = !isNaN(value);

        // Check if device is a battery sensor (must be numeric and not "State")
        const isBattery = device.type === 'sensor' && isNumeric && (
          device.unit === '%' || 
          (name.includes('battery') || name.includes('batería'))
        ) && !name.includes('state') && !name.includes('estado');

        if (isBattery) {
          return <BatteryCard key={device.id} device={device} />;
        }

        // Check for Storage
        if (name.includes('storage') || name.includes('almacenamiento')) {
           return <StorageCard key={device.id} device={device} />;
        }

        // Check if device has location (either lat/lon or Location array)
        const hasLocation = (device.attributes?.latitude && device.attributes?.longitude) || 
                           (Array.isArray(device.attributes?.Location) && device.attributes.Location.length === 2);

        if (hasLocation) {
          return <MapCard key={device.id} device={device} />;
        }

        // Default sensor card
        if (device.type === 'sensor') {
          return <SensorCard key={device.id} device={device} />;
        }

        return <DeviceCard key={device.id} device={device} onToggle={onToggle} onUpdate={onUpdate} />;
      })}
    </div>
  );
}

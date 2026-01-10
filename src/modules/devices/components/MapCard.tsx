"use client";

import * as React from "react";
import { Device } from "../types/device";
import { Card, CardContent } from "../../core/components/Card";
import { cn } from "../../core/utils/cn";
import dynamic from 'next/dynamic';
import { WifiOff } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface MapCardProps {
  device: Device;
}

export function MapCard({ device }: MapCardProps) {
  let lat = device.attributes?.latitude;
  let lon = device.attributes?.longitude;

  // Handle "Location" array format [lat, lon]
  if (!lat && !lon && Array.isArray(device.attributes?.Location) && device.attributes.Location.length === 2) {
    lat = device.attributes.Location[0];
    lon = device.attributes.Location[1];
  }
  
  // Default to a safe location if missing (though this component shouldn't render if missing)
  const position: [number, number] = [lat || 0, lon || 0];

  // Fix for default marker icon in Leaflet with Next.js
  React.useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      // @ts-ignore
      import('leaflet').then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
  }, []);

  if (!lat || !lon) return null;

  return (
    <Card className={cn(
      "group cursor-default transition-all duration-500 border-0 overflow-hidden h-[220px]",
      "hover:scale-[1.01] hover:shadow-2xl",
      !device.isOnline && "opacity-60 grayscale",
      "shadow-xl shadow-slate-300/50 dark:shadow-black/50"
    )}>
      <div className="h-full w-full relative">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="h-full w-full z-0"
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={position}>
            <Popup>
              {device.name}
            </Popup>
          </Marker>
        </MapContainer>

        {/* Glassmorphic Overlay Info */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-4 z-[400]",
          "bg-white/80 dark:bg-slate-900/80",
          "backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50",
          "transition-all duration-300"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                {device.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                {device.attributes?.friendly_name || device.room}
              </p>
            </div>
            {!device.isOnline && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/30">
                <WifiOff className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

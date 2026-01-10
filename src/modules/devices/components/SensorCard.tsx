"use client";

import * as React from "react";
import { Device } from "../types/device";
import { Card, CardContent } from "../../core/components/Card";
import { cn } from "../../core/utils/cn";
import { 
  Wifi, 
  Activity, 
  Sun, 
  Moon, 
  Clock, 
  Calendar, 
  Footprints, 
  Ruler, 
  Signal, 
  Smartphone,
  Sunrise,
  Sunset,
  Info
} from "lucide-react";

interface SensorCardProps {
  device: Device;
}

export function SensorCard({ device }: SensorCardProps) {
  const name = device.name.toLowerCase();
  const value = device.value;

  // Icon mapping logic
  const getIcon = () => {
    if (name.includes('ssid') || name.includes('wifi') || name.includes('connection')) return <Wifi className="w-6 h-6" />;
    if (name.includes('activity') || name.includes('focus')) return <Activity className="w-6 h-6" />;
    
    // Sun specific
    if (name.includes('dawn') || name.includes('rising')) return <Sunrise className="w-6 h-6" />;
    if (name.includes('setting') || name.includes('dusk')) return <Sunset className="w-6 h-6" />;
    if (name.includes('midnight')) return <Moon className="w-6 h-6" />;
    if (name.includes('noon') || name.includes('sun')) return <Sun className="w-6 h-6" />;
    
    if (name.includes('moon')) return <Moon className="w-6 h-6" />;
    if (name.includes('steps') || name.includes('pasos')) return <Footprints className="w-6 h-6" />;
    if (name.includes('distance') || name.includes('distancia')) return <Ruler className="w-6 h-6" />;
    if (name.includes('signal') || name.includes('bssid')) return <Signal className="w-6 h-6" />;
    if (name.includes('app version') || name.includes('device')) return <Smartphone className="w-6 h-6" />;
    if (name.includes('time') || name.includes('date')) return <Clock className="w-6 h-6" />;
    
    return <Info className="w-6 h-6" />;
  };

  // Color logic - now with gradients
  const getIconGradientClass = () => {
    if (name.includes('dawn') || name.includes('rising')) return "from-orange-500 to-amber-600";
    if (name.includes('setting') || name.includes('dusk')) return "from-indigo-500 to-purple-600";
    if (name.includes('midnight') || name.includes('moon')) return "from-slate-500 to-slate-700";
    if (name.includes('noon') || name.includes('sun')) return "from-yellow-400 to-orange-500";
    if (name.includes('wifi') || name.includes('ssid')) return "from-blue-500 to-cyan-600";
    if (name.includes('steps')) return "from-emerald-500 to-teal-600";
    
    return "from-slate-500 to-slate-600";
  };

  // Value formatting logic
  const getFormattedValue = () => {
    if (!value) return "Unknown";
    
    // Check if it's a date string (ISO format)
    if (typeof value === 'string' && 
       (value.includes('T') || value.includes('-')) && 
       !isNaN(Date.parse(value)) && 
       value.length > 10) {
      try {
        const date = new Date(value);
        // If it's today, show time only
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        // Otherwise show date and time
        return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return value;
      }
    }
    
    return value;
  };

  return (
    <Card 
      className={cn(
        "group cursor-default transition-all duration-500 border-0 overflow-hidden",
        "hover:scale-[1.02] hover:shadow-xl",
        !device.isOnline && "opacity-60 grayscale",
        // Light mode
        "bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50",
        "shadow-md shadow-slate-200/50",
        // Dark mode
        "dark:from-slate-800/90 dark:via-slate-850/90 dark:to-slate-900/90",
        "dark:shadow-xl dark:shadow-black/30",
        "backdrop-blur-xl"
      )}
    >
      <CardContent className="p-5 flex items-center gap-4 h-full min-h-[110px] relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent dark:from-slate-400/5" />
        
        {/* Icon with gradient */}
        <div className="relative z-10">
          <div className={cn(
            "p-3.5 rounded-2xl transition-all duration-300",
            "bg-gradient-to-br shadow-lg",
            "group-hover:scale-110 group-hover:shadow-xl",
            getIconGradientClass()
          )}>
            <div className="text-white">
              {getIcon()}
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0 relative z-10">
          <h3 className="font-semibold text-xs text-slate-500 dark:text-slate-400 truncate mb-1 uppercase tracking-wide">
            {device.name}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <p className="text-xl font-bold text-slate-800 dark:text-white truncate">
              {getFormattedValue()}
            </p>
            {device.unit && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {device.unit}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

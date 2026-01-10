"use client";

import * as React from "react";
import { Device } from "../types/device";
import { Card, CardContent } from "../../core/components/Card";
import { cn } from "../../core/utils/cn";
import { HardDrive, WifiOff } from "lucide-react";

interface StorageCardProps {
  device: Device;
}

export function StorageCard({ device }: StorageCardProps) {
  // Parse value to number (handling "35.09% available" etc)
  const rawValue = typeof device.value === 'string' ? parseFloat(device.value) : (device.value || 0);
  const percentage = Math.min(Math.max(rawValue, 0), 100);

  return (
    <Card 
      className={cn(
        "group cursor-default transition-all duration-500 border-0 overflow-hidden",
        "hover:scale-[1.02] hover:shadow-2xl",
        !device.isOnline && "opacity-60 grayscale",
        // Light mode
        "bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50",
        "shadow-lg shadow-purple-200/30",
        // Dark mode
        "dark:from-slate-800/90 dark:via-indigo-950/40 dark:to-slate-900/90",
        "dark:shadow-2xl dark:shadow-indigo-950/50",
        "backdrop-blur-xl"
      )}
    >
      <CardContent className="p-6 flex flex-col justify-between h-full min-h-[180px] relative overflow-hidden">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 dark:from-purple-500/10 dark:via-indigo-500/10 dark:to-blue-500/10" />
        
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 dark:group-hover:bg-indigo-400/30 transition-all duration-700" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              "bg-gradient-to-br from-purple-500 to-indigo-600",
              "shadow-lg shadow-purple-500/30 dark:shadow-purple-500/50",
              "group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/40"
            )}>
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            {!device.isOnline && (
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <WifiOff className="w-4 h-4 text-red-500 dark:text-red-400" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white mb-1 transition-colors">
              {device.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
              {device.room}
            </p>

            <div className="flex items-end justify-between mb-3">
              <span className={cn(
                "text-3xl font-bold bg-gradient-to-br bg-clip-text text-transparent",
                "from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400"
              )}>
                {percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Available
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  "bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500",
                  "shadow-lg shadow-indigo-500/50",
                  "relative overflow-hidden"
                )}
                style={{ width: `${percentage}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                     style={{ 
                       backgroundSize: '200% 100%',
                       animation: 'shimmer 2s infinite'
                     }} 
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

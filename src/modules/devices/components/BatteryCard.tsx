"use client";

import * as React from "react";
import { Device } from "../types/device";
import { Card, CardContent } from "../../core/components/Card";
import { cn } from "../../core/utils/cn";
import { Battery, BatteryWarning, WifiOff } from "lucide-react";

interface BatteryCardProps {
  device: Device;
}

export function BatteryCard({ device }: BatteryCardProps) {
  // Parse value to number
  let parsedValue = typeof device.value === 'string' ? parseFloat(device.value) : (device.value || 0);
  if (isNaN(parsedValue)) {
    parsedValue = 0;
  }
  const percentage = Math.min(Math.max(parsedValue, 0), 100);

  // Gauge configuration
  const radius = 40;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI; // Semi-circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color logic based on percentage
  const getColor = (p: number) => {
    if (p <= 20) return "text-red-500 dark:text-red-500";
    if (p <= 50) return "text-yellow-500 dark:text-yellow-400";
    return "text-blue-500 dark:text-blue-400";
  };

  const colorClass = getColor(percentage);

  return (
    <Card 
      className={cn(
        "group cursor-default transition-all duration-500 border-0 overflow-hidden",
        "hover:scale-[1.02] hover:shadow-2xl",
        !device.isOnline && "opacity-60 grayscale",
        // Light mode
        "bg-gradient-to-br from-white via-slate-50 to-slate-100",
        "shadow-lg shadow-slate-200/50",
        // Dark mode
        "dark:from-slate-800/90 dark:via-slate-900/90 dark:to-slate-950/90",
        "dark:shadow-2xl dark:shadow-black/50",
        "backdrop-blur-xl"
      )}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[180px] relative overflow-hidden">
        {/* Animated gradient background */}
        <div className={cn(
          "absolute inset-0 opacity-10 dark:opacity-20 transition-opacity duration-700",
          "bg-gradient-to-br",
          percentage <= 20 && "from-red-500 via-red-400 to-orange-500",
          percentage > 20 && percentage <= 50 && "from-yellow-500 via-amber-400 to-orange-500",
          percentage > 50 && "from-blue-500 via-cyan-400 to-teal-500"
        )} />

        {/* Glow effect */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-40 h-40 rounded-full blur-3xl transition-all duration-700",
          "opacity-20 dark:opacity-30 group-hover:opacity-30 dark:group-hover:opacity-40",
          percentage <= 20 && "bg-red-500",
          percentage > 20 && percentage <= 50 && "bg-yellow-500",
          percentage > 50 && "bg-blue-500"
        )} />

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Gauge */}
          <div className="relative w-48 h-24 flex items-end justify-center mb-3">
            <svg
              height="100%"
              width="100%"
              viewBox="0 0 100 50"
              className="overflow-visible drop-shadow-lg"
            >
              {/* Background Track */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-200 dark:text-slate-700 transition-colors"
                strokeLinecap="round"
              />
              {/* Progress Track with gradient */}
              <defs>
                <linearGradient id={`batteryGradient-${device.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  {percentage <= 20 && (
                    <>
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f97316" />
                    </>
                  )}
                  {percentage > 20 && percentage <= 50 && (
                    <>
                      <stop offset="0%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </>
                  )}
                  {percentage > 50 && (
                    <>
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </>
                  )}
                </linearGradient>
              </defs>
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke={`url(#batteryGradient-${device.id})`}
                strokeWidth={strokeWidth + 1}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Percentage Text */}
            <div className="absolute bottom-0 flex flex-col items-center">
              <span className={cn(
                "text-4xl font-bold tracking-tighter transition-colors",
                "bg-gradient-to-br bg-clip-text text-transparent",
                percentage <= 20 && "from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400",
                percentage > 20 && percentage <= 50 && "from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400",
                percentage > 50 && "from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400"
              )}>
                {percentage}%
              </span>
            </div>
          </div>

          {/* Device Name */}
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center mt-2 truncate w-full px-2 transition-colors">
            {device.name}
          </h3>
          
          {/* Status Icon/Text */}
          <div className="flex items-center gap-1.5 mt-2">
            {!device.isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                <span className="text-xs font-medium text-red-500 dark:text-red-400">Offline</span>
              </>
            ) : percentage <= 20 ? (
              <>
                <BatteryWarning className="w-3.5 h-3.5 text-red-500 dark:text-red-400 animate-pulse" />
                <span className="text-xs font-medium text-red-500 dark:text-red-400">Low Battery</span>
              </>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{device.room}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

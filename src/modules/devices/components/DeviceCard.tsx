"use client";

import * as React from "react";
import { Device } from "../types/device";
import { Card, CardContent } from "../../core/components/Card";
import { cn } from "../../core/utils/cn";
import { Lightbulb, Power, Thermometer, Lock, DoorOpen, Fan, WifiOff, Zap, Home, Star, Sun, Moon, Cloud, Heart, Trash2, Pencil, Check, X } from "lucide-react";

interface DeviceCardProps {
  device: Device;
  onToggle?: (id: string, isOn: boolean) => void;
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, data: Partial<Device>) => Promise<void>;
  customIcon?: string;
}

export function DeviceCard({ device, onToggle, onRemove, onUpdate, customIcon }: DeviceCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(device.name);
  const [isSaving, setIsSaving] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditName(device.name);
  };

  const handleSaveEdit = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editName.trim() === device.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate?.(device.id, { name: editName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating device name:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = () => {
    // Icon mapping
    const iconMap: Record<string, React.ReactNode> = {
      Lightbulb: <Lightbulb className={cn("h-6 w-6", device.isOn ? "text-yellow-600 dark:text-yellow-400 fill-yellow-500/20" : "text-slate-400")} />,
      Zap: <Zap className={cn("h-6 w-6", device.isOn ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />,
      Home: <Home className={cn("h-6 w-6", device.isOn ? "text-green-600 dark:text-green-400" : "text-slate-400")} />,
      Star: <Star className={cn("h-6 w-6", device.isOn ? "text-yellow-600 dark:text-yellow-400 fill-yellow-500/20" : "text-slate-400")} />,
      Sun: <Sun className={cn("h-6 w-6", device.isOn ? "text-orange-600 dark:text-orange-400" : "text-slate-400")} />,
      Moon: <Moon className={cn("h-6 w-6", device.isOn ? "text-indigo-600 dark:text-indigo-400 fill-indigo-500/20" : "text-slate-400")} />,
      Cloud: <Cloud className={cn("h-6 w-6", device.isOn ? "text-sky-600 dark:text-sky-400" : "text-slate-400")} />,
      Heart: <Heart className={cn("h-6 w-6", device.isOn ? "text-rose-600 dark:text-rose-400 fill-rose-500/20" : "text-slate-400")} />,
    };

    // If custom icon is set, use it
    if (customIcon && iconMap[customIcon]) {
      return iconMap[customIcon];
    }

    // Default icons based on device type
    switch (device.type) {
      case "light":
        return <Lightbulb className={cn("h-6 w-6", device.isOn ? "text-yellow-600 dark:text-yellow-400 fill-yellow-500/20" : "text-slate-400")} />;
      case "climate":
        return <Thermometer className="h-6 w-6 text-orange-500" />;
      case "lock":
        return <Lock className={cn("h-6 w-6", device.isOn ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")} />;
      case "sensor":
        return <DoorOpen className="h-6 w-6 text-blue-500" />;
      case "switch":
        return <Fan className={cn("h-6 w-6", device.isOn ? "animate-spin text-blue-500" : "text-slate-400")} />;
      default:
        return <Power className="h-6 w-6" />;
    }
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-500 border-0 overflow-hidden relative",
        "hover:scale-[1.02] active:scale-[0.98]",
        !device.isOnline && "opacity-60 grayscale cursor-not-allowed",
        device.isOn 
          ? cn(
              // Light mode - ON
              "bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50",
              "shadow-lg shadow-blue-200/50 ring-1 ring-blue-400/30",
              "hover:shadow-xl hover:shadow-blue-300/60",
              // Dark mode - ON
              "dark:from-slate-800/90 dark:via-blue-950/40 dark:to-slate-900/90",
              "dark:shadow-xl dark:shadow-blue-950/50 dark:ring-blue-500/30",
              "backdrop-blur-xl"
            )
          : cn(
              // Light mode - OFF
              "bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50",
              "shadow-md shadow-slate-200/50",
              "hover:shadow-lg hover:shadow-slate-300/50",
              // Dark mode - OFF
              "dark:from-slate-800/80 dark:via-slate-850/80 dark:to-slate-900/80",
              "dark:shadow-lg dark:shadow-black/30",
              "backdrop-blur-xl"
            )
      )}
      onClick={() => {
        if (!device.isOnline || isEditing) return;
        onToggle?.(device.id, !device.isOn);
      }}
    >
      <div className="absolute top-2 right-2 flex gap-1 z-20">
        {onRemove && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(device.id);
            }}
            className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
            title="Remove from room"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="p-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
            title="Edit name"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      <CardContent className="p-5 flex items-center justify-between h-full min-h-[100px] relative overflow-hidden">
        {/* Gradient background effect */}
        {device.isOn && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent dark:from-blue-500/10 dark:via-cyan-500/10" />
        )}
        
        {/* Glow effect when ON */}
        {device.isOn && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-500/30 dark:group-hover:bg-blue-400/30 transition-all duration-700" />
        )}

        <div className="flex items-center gap-4 relative z-10 w-full pr-12">
          <div className={cn(
            "p-3.5 rounded-2xl transition-all duration-300 shrink-0",
            "shadow-lg",
            device.isOn 
              ? cn(
                  "bg-gradient-to-br from-blue-500 to-cyan-600",
                  "shadow-blue-500/30 dark:shadow-blue-500/50",
                  "group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/40"
                )
              : cn(
                  "bg-slate-200 dark:bg-slate-700",
                  "shadow-slate-300/30 dark:shadow-slate-900/50"
                )
          )}>
            <div className={device.isOn ? "text-white" : ""}>
              {getIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit(e as any);
                  }}
                  className={cn(
                    "w-full bg-white dark:bg-slate-800 border border-blue-500 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                    device.isOn ? "text-slate-800 dark:text-white" : "text-slate-700 dark:text-slate-300"
                  )}
                  disabled={isSaving}
                />
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="p-1 rounded-md bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h3 className={cn(
                  "font-bold text-sm transition-colors mb-0.5 break-words whitespace-normal",
                  device.isOn ? "text-slate-800 dark:text-white" : "text-slate-700 dark:text-slate-300"
                )}>
                  {device.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{device.room || "Sin Asignar"}</p>
              </>
            )}
          </div>
        </div>
        
        <div className="text-right relative z-10 shrink-0">
          {!device.isOnline ? (
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <WifiOff className="h-4 w-4 text-red-500 dark:text-red-400" />
            </div>
          ) : (
            <>
              {device.value && !isEditing && (
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {device.value}{device.unit}
                </span>
              )}
              {!device.value && !isEditing && (
                <div className={cn(
                  "w-11 h-6 rounded-full relative transition-all duration-300 shadow-inner",
                  device.isOn 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 shadow-blue-500/50" 
                    : "bg-slate-300 dark:bg-slate-700"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-300",
                    device.isOn ? "left-6" : "left-1"
                  )} />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

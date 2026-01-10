"use client";

import * as React from "react";
import { Room } from "../types/room";
import { Card, CardContent } from "../../core/components/Card";
import { cn } from "../../core/utils/cn";
import { 
  Power, 
  Edit, 
  Trash2, 
  GripVertical,
  Home,
  Bed,
  Utensils,
  Bath,
  Sofa,
  DoorOpen,
  Lightbulb
} from "lucide-react";
import * as Icons from "lucide-react";

interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
  onToggleAll?: (room: Room, isOn: boolean) => void;
  onClick?: (room: Room) => void;
  isDragging?: boolean;
}

// Icon mapping
const ROOM_ICONS: Record<string, React.ReactNode> = {
  'home': <Home className="w-6 h-6" />,
  'bed': <Bed className="w-6 h-6" />,
  'utensils': <Utensils className="w-6 h-6" />,
  'bath': <Bath className="w-6 h-6" />,
  'sofa': <Sofa className="w-6 h-6" />,
  'door-open': <DoorOpen className="w-6 h-6" />,
  'lightbulb': <Lightbulb className="w-6 h-6" />,
};

export function RoomCard({ 
  room, 
  onEdit, 
  onDelete, 
  onToggleAll, 
  onClick,
  isDragging = false 
}: RoomCardProps) {
  const [isTogglingAll, setIsTogglingAll] = React.useState(false);

  const handleToggleAll = async (e: React.MouseEvent, isOn: boolean) => {
    e.stopPropagation();
    if (!onToggleAll) return;
    
    setIsTogglingAll(true);
    try {
      await onToggleAll(room, isOn);
    } finally {
      setIsTogglingAll(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(room);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(room);
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-500 border-0 overflow-hidden",
        "hover:scale-[1.02] hover:shadow-xl",
        isDragging && "opacity-50 scale-95",
        // Light mode
        "bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50",
        "shadow-lg shadow-slate-200/50",
        // Dark mode
        "dark:from-slate-800/90 dark:via-slate-850/90 dark:to-slate-900/90",
        "dark:shadow-xl dark:shadow-black/30",
        "backdrop-blur-xl"
      )}
      onClick={() => onClick?.(room)}
    >
      <CardContent className="p-6 relative overflow-hidden min-h-[180px] flex flex-col">
        {/* Gradient background effect */}
        <div 
          className="absolute inset-0 opacity-10 dark:opacity-20 transition-opacity duration-700"
          style={{
            background: `linear-gradient(135deg, ${room.color}40 0%, ${room.color}10 100%)`
          }}
        />

        {/* Drag handle */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab active:cursor-grabbing z-10">
          <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center mb-4">
          <div 
            className={cn(
              "p-4 rounded-2xl transition-all duration-300 shadow-lg",
              "group-hover:scale-110 group-hover:shadow-xl"
            )}
            style={{
              background: `linear-gradient(135deg, ${room.color} 0%, ${room.color}CC 100%)`,
              boxShadow: `0 10px 30px ${room.color}40`
            }}
          >
            <div className="text-white">
              {(() => {
                // @ts-ignore
                const IconComponent = (Icons as any)[room.icon] || 
                                    (Icons as any)[room.icon?.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')] ||
                                    (Icons as any)['Home'];
                return IconComponent ? <IconComponent className="w-6 h-6" /> : <Icons.Home className="w-6 h-6" />;
              })()}
            </div>
          </div>
        </div>

        {/* Room info */}
        <div className="relative z-10 flex-1 flex flex-col items-center">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white text-center mb-1 transition-colors">
            {room.name}
          </h3>
          {room.zoneName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
              {room.zoneName}
            </p>
          )}
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
            <Lightbulb className="w-4 h-4" />
            <span className="font-semibold">{room.deviceCount}</span>
            <span className="text-xs">devices</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="relative z-10 flex items-center justify-center gap-2 mt-4">
          <button
            onClick={(e) => handleToggleAll(e, true)}
            disabled={isTogglingAll}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
              "hover:bg-emerald-200 dark:hover:bg-emerald-900/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Turn all on"
          >
            <Power className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => handleToggleAll(e, false)}
            disabled={isTogglingAll}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
              "hover:bg-slate-200 dark:hover:bg-slate-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Turn all off"
          >
            <Power className="w-4 h-4" />
          </button>

          {onEdit && (
            <button
              onClick={handleEdit}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                "hover:bg-blue-200 dark:hover:bg-blue-900/50"
              )}
              title="Edit room"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                "hover:bg-red-200 dark:hover:bg-red-900/50"
              )}
              title="Delete room"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

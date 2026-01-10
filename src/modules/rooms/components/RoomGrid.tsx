"use client";

import * as React from "react";
import { Room } from "../types/room";
import { RoomCard } from "./RoomCard";
import { Plus } from "lucide-react";
import { cn } from "../../core/utils/cn";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RoomGridProps {
  rooms: Room[];
  onAddRoom?: () => void;
  onEditRoom?: (room: Room) => void;
  onDeleteRoom?: (room: Room) => void;
  onToggleAll?: (room: Room, isOn: boolean) => void;
  onRoomClick?: (room: Room) => void;
  onReorder?: (rooms: Room[]) => void;
  isLoading?: boolean;
}

function SortableRoomCard({ 
  room, 
  onEdit, 
  onDelete, 
  onToggleAll, 
  onClick 
}: { 
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
  onToggleAll?: (room: Room, isOn: boolean) => void;
  onClick?: (room: Room) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: room.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RoomCard
        room={room}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleAll={onToggleAll}
        onClick={onClick}
        isDragging={isDragging}
      />
    </div>
  );
}

export function RoomGrid({
  rooms,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onToggleAll,
  onRoomClick,
  onReorder,
  isLoading = false,
}: RoomGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rooms.findIndex((r) => r.id === active.id);
      const newIndex = rooms.findIndex((r) => r.id === over.id);

      const newRooms = arrayMove(rooms, oldIndex, newIndex);
      onReorder?.(newRooms);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[180px] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Plus className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            No rooms yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Create your first room to organize your devices
          </p>
          {onAddRoom && (
            <button
              onClick={onAddRoom}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold transition-all duration-200",
                "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
                "hover:from-blue-600 hover:to-purple-700",
                "shadow-lg hover:shadow-xl",
                "transform hover:scale-105"
              )}
            >
              Create Room
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rooms.map(r => r.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <SortableRoomCard
                key={room.id}
                room={room}
                onEdit={onEditRoom}
                onDelete={onDeleteRoom}
                onToggleAll={onToggleAll}
                onClick={onRoomClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Floating Add Button */}
      {onAddRoom && (
        <button
          onClick={onAddRoom}
          className={cn(
            "fixed bottom-8 right-8 w-16 h-16 rounded-full",
            "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
            "shadow-2xl hover:shadow-3xl",
            "transform hover:scale-110 transition-all duration-300",
            "flex items-center justify-center",
            "z-50"
          )}
          title="Add Room"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RoomGrid } from "../components/RoomGrid";
import { AddRoomModal } from "../components/AddRoomModal";
import { Toast } from "../../core/components/Toast";
import { Room, Zone, CreateRoomData } from "../types/room";
import { roomService } from "../services/roomService";
import { LayoutGrid, Plus } from "lucide-react";
import { cn } from "../../core/utils/cn";

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [zones, setZones] = React.useState<Zone[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);
  const [selectedZone, setSelectedZone] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; details?: string; type: "success" | "error" | "info" } | null>(null);

  // Load rooms and zones
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roomsData, zonesData] = await Promise.all([
        roomService.getRooms(),
        roomService.getZones(),
      ]);
      setRooms(roomsData);
      setZones(zonesData);
    } catch (error) {
      console.error("Failed to load rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (data: CreateRoomData) => {
    const newRoom = await roomService.createRoom(data);
    setRooms([...rooms, newRoom]);
  };

  const handleEditRoom = async (room: Room) => {
    setEditingRoom(room);
    setIsAddModalOpen(true);
  };

  const handleUpdateRoom = async (data: CreateRoomData) => {
    if (!editingRoom) return;
    
    try {
      const updatedRoom = await roomService.updateRoom(editingRoom.id, data);
      setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
      setEditingRoom(null);
    } catch (error) {
      console.error("Failed to update room:", error);
      throw error;
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete "${room.name}"?`)) return;
    
    try {
      await roomService.deleteRoom(room.id);
      setRooms(rooms.filter((r) => r.id !== room.id));
      setToast({
        message: "Room deleted successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Failed to delete room:", error);
      setToast({
        message: "Failed to delete room",
        details: "Please try again later",
        type: "error"
      });
    }
  };

  const handleToggleAll = async (room: Room, isOn: boolean) => {
    try {
      await roomService.toggleAllDevices(room.id, isOn);
      setToast({
        message: `Turned all devices ${isOn ? 'on' : 'off'}`,
        details: `in ${room.name}`,
        type: "success"
      });
    } catch (error) {
      console.error("Failed to toggle devices:", error);
      setToast({
        message: "Failed to toggle devices",
        type: "error"
      });
    }
  };

  const handleRoomClick = (room: Room) => {
    router.push(`/rooms/${room.id}`);
  };

  const handleReorder = async (newRooms: Room[]) => {
    // Optimistic update
    setRooms(newRooms);

    // Update order in backend
    try {
      const items = newRooms.map((room, index) => ({
        id: room.id,
        order: index,
      }));
      await roomService.reorderRooms(items);
    } catch (error) {
      console.error("Failed to reorder rooms:", error);
      // Revert on error
      loadData();
    }
  };

  // Filter rooms by selected zone
  const filteredRooms = selectedZone
    ? rooms.filter((r) => r.zone === selectedZone)
    : rooms;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Habitaciones
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Organize your devices by room and control them together
          </p>
        </div>

        {/* Zone Tabs */}
        {zones.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedZone(null)}
              className={cn(
                "px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap",
                selectedZone === null
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              All Rooms
            </button>
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={cn(
                  "px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap",
                  selectedZone === zone.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                {zone.name} ({zone.roomCount})
              </button>
            ))}
          </div>
        )}

        {/* Room Grid */}
        <RoomGrid
          rooms={filteredRooms}
          onAddRoom={() => setIsAddModalOpen(true)}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
          onToggleAll={handleToggleAll}
          onRoomClick={handleRoomClick}
          onReorder={handleReorder}
          isLoading={isLoading}
        />

        {/* Add/Edit Room Modal */}
        <AddRoomModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingRoom(null);
          }}
          onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom}
          zones={zones}
          editingRoom={editingRoom}
        />
        
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            details={toast.details}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

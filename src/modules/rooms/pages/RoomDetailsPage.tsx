"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Room } from "../types/room";
import { roomService } from "../services/roomService";
import { AssignDevicesModal } from "../components/AssignDevicesModal";
import { ConfirmationModal } from "../../core/components/ConfirmationModal";
import { ArrowLeft, Plus, Power } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "../../core/utils/cn";
import { DeviceCard } from "../../devices/components/DeviceCard";
import api from "../../core/services/api";

interface RoomDetailsPageProps {
  roomId: string;
}

export default function RoomDetailsPage({ roomId }: RoomDetailsPageProps) {
  const router = useRouter();
  const [room, setRoom] = React.useState<Room | null>(null);
  const [devices, setDevices] = React.useState<any[]>([]);
  const [allDevices, setAllDevices] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  
  // Confirmation Modal State
  const [deviceToRemove, setDeviceToRemove] = React.useState<string | null>(null);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    loadRoomDetails();
  }, [roomId]);

  const loadRoomDetails = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [roomsData, devicesData, allDevicesData] = await Promise.all([
        roomService.getRooms(),
        roomService.getRoomDevices(roomId),
        api.get("/devices/").then(res => res.data),
      ]);
      
      const currentRoom = roomsData.find(r => String(r.id) === roomId);
      setRoom(currentRoom || null);
      setDevices(devicesData);
      setAllDevices(allDevicesData);
    } catch (error) {
      console.error("Failed to load room details:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleDevicesRefresh = () => {
    loadRoomDetails(true);
  };

  const handleToggleAll = async (isOn: boolean) => {
    if (!room) return;
    
    // Optimistic update
    const previousDevices = [...devices];
    setDevices(devices.map(d => ({ ...d, isOn })));

    try {
      await roomService.toggleAllDevices(room.id, isOn);
      // Wait a moment to ensure backend/HA processing is complete before verifying
      setTimeout(() => loadRoomDetails(true), 500);
    } catch (error) {
      console.error("Failed to toggle devices:", error);
      // Revert on error
      setDevices(previousDevices);
    }
  };

  const handleAssignDevices = async (deviceIds: string[]) => {
    try {
      // Update each device to assign it to this room
      await Promise.all(
        deviceIds.map(deviceId =>
          api.patch(`/devices/${deviceId}/`, { room_obj: roomId })
        )
      );
      
      // Reload room details
      await loadRoomDetails();
    } catch (error) {
      console.error("Failed to assign devices:", error);
      throw error;
    }
  };

  const handleToggleDevice = async (deviceId: string, isOn: boolean) => {
    try {
      // Optimistic update
      setDevices(devices.map(d => 
        d.id === deviceId ? { ...d, isOn } : d
      ));

      await api.patch(`/devices/${deviceId}/`, { isOn });
    } catch (error) {
      console.error("Failed to toggle device:", error);
      // Revert on error
      loadRoomDetails();
    }
  };

  const handleRemoveClick = (deviceId: string) => {
    setDeviceToRemove(deviceId);
  };

  const handleConfirmRemove = async () => {
    if (!deviceToRemove) return;
    
    setIsRemoving(true);
    try {
      // Optimistic update
      setDevices(devices.filter(d => d.id !== deviceToRemove));
      
      await api.patch(`/devices/${deviceToRemove}/`, { room_obj: null });
      
      // Reload to ensure consistency
      loadRoomDetails(true);
      setDeviceToRemove(null);
    } catch (error) {
      console.error("Failed to remove device:", error);
      loadRoomDetails();
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Room not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rooms</span>
          </button>

            <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center">
              <div className="flex items-center gap-4">
                <div
                  className="p-4 rounded-2xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${room.color} 0%, ${room.color}CC 100%)`,
                  }}
                >
                  <div className="w-16 h-16 text-white flex items-center justify-center">
                    {(() => {
                      // @ts-ignore
                      const IconComponent = (Icons as any)[room.icon?.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') || 'Home'];
                      return IconComponent ? <IconComponent className="w-10 h-10" /> : <Icons.Home className="w-10 h-10" />;
                    })()}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {room.name}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {devices.length} devices
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className={cn(
                    "px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial",
                    "bg-blue-500 hover:bg-blue-600 text-white shadow-lg text-sm"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Assign Devices</span>
                  <span className="sm:hidden">Assign</span>
                </button>
                <button
                  onClick={() => handleToggleAll(true)}
                  className={cn(
                    "px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial",
                    "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg text-sm"
                  )}
                >
                  <Power className="w-4 h-4" />
                  <span className="hidden sm:inline">All On</span>
                  <span className="sm:hidden">On</span>
                </button>
                <button
                  onClick={() => handleToggleAll(false)}
                  className={cn(
                    "px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial",
                    "bg-slate-500 hover:bg-slate-600 text-white shadow-lg text-sm"
                  )}
                >
                  <Power className="w-4 h-4" />
                  <span className="hidden sm:inline">All Off</span>
                  <span className="sm:hidden">Off</span>
                </button>
              </div>
            </div>
        </div>

        {/* Devices Grid */}
        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Plus className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                No devices yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Assign devices to this room to see them here
              </p>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Assign Devices
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {devices.map((device) => (
              <DeviceCard 
                key={device.id} 
                device={device} 
                onToggle={handleToggleDevice}
                onRemove={handleRemoveClick}
              />
            ))}
          </div>
        )}
        
        {/* Assign Devices Modal */}
        <AssignDevicesModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          roomId={roomId}
          roomName={room.name}
          onAssign={handleAssignDevices}
          allDevices={allDevices}
          assignedDeviceIds={devices.map(d => d.id)}
          onDevicesRefresh={handleDevicesRefresh}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!deviceToRemove}
          onClose={() => setDeviceToRemove(null)}
          onConfirm={handleConfirmRemove}
          title="Remove Device"
          message="Are you sure you want to remove this device from the room? It will still be available in the main device list."
          confirmText="Remove"
          variant="danger"
          isLoading={isRemoving}
        />
      </div>
    </div>
  );
}

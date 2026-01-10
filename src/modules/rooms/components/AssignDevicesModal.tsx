"use client";

import * as React from "react";
import { X, Search, RefreshCw } from "lucide-react";
import { cn } from "../../core/utils/cn";
import api from "../../core/services/api";

interface Device {
  id: string;
  name: string;
  entity_id: string;
  room?: string;
  room_obj?: string | null;
  room_name?: string;
}

interface AssignDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  onAssign: (deviceIds: string[]) => Promise<void>;
  allDevices: Device[];
  assignedDeviceIds: string[];
  onDevicesRefresh?: () => void;
}

export function AssignDevicesModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  onAssign,
  allDevices,
  assignedDeviceIds,
  onDevicesRefresh,
}: AssignDevicesModalProps) {
  const [selectedDevices, setSelectedDevices] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Filter devices that are not assigned to this room
  const availableDevices = allDevices.filter(
    (device) => !assignedDeviceIds.includes(device.id)
  );

  // Filter by search query
  const filteredDevices = availableDevices.filter((device) => {
    const normalize = (str: string) => 
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    return normalize(device.name).includes(normalize(searchQuery)) || 
           normalize(device.entity_id).includes(normalize(searchQuery));
  });

  const handleToggleDevice = (deviceId: string) => {
    const newSelected = new Set(selectedDevices);
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId);
    } else {
      newSelected.add(deviceId);
    }
    setSelectedDevices(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedDevices.size === 0) return;

    setIsSubmitting(true);
    try {
      await onAssign(Array.from(selectedDevices));
      setSelectedDevices(new Set());
      setSearchQuery("");
      onClose();
    } catch (error) {
      console.error("Failed to assign devices:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post("/devices/sync/");
      // Trigger refresh of devices list in parent
      if (onDevicesRefresh) {
        onDevicesRefresh();
      }
    } catch (error) {
      console.error("Failed to sync devices:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Assign Devices
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Add devices to {roomName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "text-slate-600 dark:text-slate-400",
                "hover:bg-slate-100 dark:hover:bg-slate-700",
                isSyncing && "animate-spin"
              )}
              title="Sync with Home Assistant"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Device List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredDevices.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              {searchQuery ? "No devices found" : "All devices are already assigned"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDevices.map((device) => (
                <label
                  key={device.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all",
                    selectedDevices.has(device.id)
                      ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                      : "bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedDevices.has(device.id)}
                    onChange={() => handleToggleDevice(device.id)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {device.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {device.room_name ? (
                        <span className="text-blue-500 dark:text-blue-400">
                          Currently in: {device.room_name}
                        </span>
                      ) : (
                        device.entity_id
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {selectedDevices.size} device{selectedDevices.size !== 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedDevices.size === 0 || isSubmitting}
              className={cn(
                "px-6 py-2 rounded-lg font-semibold transition-all",
                selectedDevices.size === 0 || isSubmitting
                  ? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              )}
            >
              {isSubmitting ? "Assigning..." : "Assign Devices"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../core/utils/cn";
import { CreateRoomData, Zone } from "../types/room";
import { ROOM_ICONS, ROOM_COLORS } from "../constants/roomOptions";
import * as Icons from "lucide-react";

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomData) => Promise<void>;
  zones?: Zone[];
  editingRoom?: { id: string; name: string; icon: string; color: string; zone?: string } | null;
}

export function AddRoomModal({ isOpen, onClose, onSubmit, zones = [], editingRoom = null }: AddRoomModalProps) {
  const [formData, setFormData] = React.useState<CreateRoomData>({
    name: "",
    icon: "door-open",
    color: "#6366f1",
    zone: undefined,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [iconResults, setIconResults] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Update form data when editing room changes
  React.useEffect(() => {
    if (editingRoom) {
      setFormData({
        name: editingRoom.name,
        icon: editingRoom.icon,
        color: editingRoom.color,
        zone: editingRoom.zone,
      });
    } else {
      setFormData({
        name: "",
        icon: "door-open",
        color: "#6366f1",
        zone: undefined,
      });
    }
  }, [editingRoom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Room name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        icon: "door-open",
        color: "#6366f1",
        zone: undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create room");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl p-6 shadow-2xl",
          "bg-white dark:bg-slate-900",
          "border border-slate-200 dark:border-slate-700",
          "transform transition-all duration-300"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {editingRoom ? "Edit Room" : "Create Room"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Living Room"
              className={cn(
                "w-full px-4 py-3 rounded-xl border transition-colors",
                "bg-white dark:bg-slate-800",
                "border-slate-300 dark:border-slate-600",
                "focus:border-blue-500 dark:focus:border-blue-400",
                "focus:ring-2 focus:ring-blue-500/20",
                "text-slate-900 dark:text-white",
                "placeholder:text-slate-400"
              )}
            />
          </div>

          {/* Zone Selection */}
          {zones.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Zone (Optional)
              </label>
              <select
                value={formData.zone || ""}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value || undefined })}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border transition-colors",
                  "bg-white dark:bg-slate-800",
                  "border-slate-300 dark:border-slate-600",
                  "focus:border-blue-500 dark:focus:border-blue-400",
                  "focus:ring-2 focus:ring-blue-500/20",
                  "text-slate-900 dark:text-white"
                )}
              >
                <option value="">No Zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Icon Picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Icon
              </label>
              {formData.icon && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  <span>Selected:</span>
                  {(() => {
                    // Try to find the icon component
                    const IconComponent = (Icons as any)[formData.icon] || 
                                        (Icons as any)[formData.icon.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')];
                    return IconComponent ? <IconComponent className="w-4 h-4 text-blue-500" /> : null;
                  })()}
                  <span className="font-medium text-slate-900 dark:text-white">{formData.icon}</span>
                </div>
              )}
            </div>
            
            {/* Icon Search */}
            <div className="relative mb-4">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                placeholder="Search icons (e.g. bed, wifi, game)..."
                className={cn(
                  "w-full pl-9 pr-4 py-2 rounded-xl border text-sm transition-colors",
                  "bg-slate-50 dark:bg-slate-800",
                  "border-slate-200 dark:border-slate-700",
                  "focus:border-blue-500 dark:focus:border-blue-400",
                  "focus:ring-2 focus:ring-blue-500/20",
                  "text-slate-900 dark:text-white",
                  "placeholder:text-slate-400"
                )}
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  setSearchQuery(query);
                  
                  // If empty, clear results
                  if (!query) {
                    setIconResults([]);
                    return;
                  }
                  
                  // Search all Lucide icons
                  const matches = Object.keys(Icons)
                    .filter(name => name.toLowerCase().includes(query))
                    .slice(0, 60) // Limit results for performance
                    .map(name => ({
                      id: name, // Use PascalCase name as ID for custom icons
                      label: name,
                      icon: name
                    }));
                  setIconResults(matches);
                }}
              />
            </div>

            <div className="min-h-[100px] max-h-48 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              {iconResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500 dark:text-slate-400">
                  {searchQuery ? (
                    <>
                      <Icons.SearchX className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No icons found</p>
                    </>
                  ) : (
                    <>
                      <Icons.Search className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Start typing to search icons</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {iconResults.map((iconOption) => {
                    const IconComponent = (Icons as any)[iconOption.icon];
                    if (!IconComponent) return null;
                    
                    const isSelected = formData.icon === iconOption.id || 
                                     (formData.icon && formData.icon.toLowerCase() === iconOption.id.toLowerCase().replace(/-/g, ''));

                    return (
                      <button
                        key={iconOption.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconOption.id })}
                        className={cn(
                          "p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
                          "border-2",
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                        )}
                        title={iconOption.label}
                      >
                        <IconComponent className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {iconResults.length > 0 && (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-right">
                {iconResults.length} icons found
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ROOM_COLORS.map((colorOption) => (
                <button
                  key={colorOption.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: colorOption.hex })}
                  className={cn(
                    "w-10 h-10 rounded-xl transition-all duration-200",
                    "border-2",
                    formData.color === colorOption.hex
                      ? "border-slate-900 dark:border-white scale-110"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: colorOption.hex }}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-semibold transition-colors",
                "bg-slate-100 dark:bg-slate-800",
                "text-slate-700 dark:text-slate-300",
                "hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-semibold transition-all",
                "bg-gradient-to-r from-blue-500 to-purple-600",
                "text-white",
                "hover:from-blue-600 hover:to-purple-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg hover:shadow-xl"
              )}
            >
              {isSubmitting ? (editingRoom ? "Updating..." : "Creating...") : (editingRoom ? "Update Room" : "Create Room")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

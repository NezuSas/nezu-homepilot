"use client";

import * as React from "react";
import { DeviceGrid } from "../../devices/components/DeviceGrid";
import { AddDeviceModal } from "../../devices/components/AddDeviceModal";
import { deviceService } from "../../devices/services/deviceService";
import { deviceSyncService } from "../../devices/services/deviceSyncService";
import { Device } from "../../devices/types/device";
import { Button } from "../../core/components/Button";
import { Plus, RefreshCw } from "lucide-react";
import { Toast, ToastType } from "../../core/components/Toast";

export function DevicesPage() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const loadDevices = async () => {
    try {
      const data = await deviceService.getDevices();
      setDevices(data);
    } catch (error) {
      console.error("Error loading devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadDevices();
  }, []);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await deviceSyncService.syncDevices();
      const summary = result.summary;
      
      let message = `Sincronización completada. Total: ${summary.total}`;
      if (summary.new > 0) message += `, Nuevos: ${summary.new}`;
      if (summary.updated > 0) message += `, Actualizados: ${summary.updated}`;
      if (summary.removed > 0) message += `, Eliminados: ${summary.removed}`;
      
      showToast(message, "success");
      deviceSyncService.setLastSyncTime(result.timestamp);
      
      // Reload devices to show changes
      await loadDevices();
    } catch (error) {
      console.error("Error syncing devices:", error);
      showToast("Error al sincronizar con Home Assistant", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggle = async (id: string) => {
    const device = devices.find(d => d.id === id);
    if (!device) return;

    try {
      const updated = await deviceService.toggleDevice(id, !device.isOn);
      setDevices(prev => prev.map(d => d.id === id ? updated : d));
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  const handleUpdateDevice = async (id: string, data: Partial<Device>) => {
    try {
      const updated = await deviceService.updateDevice(id, data);
      setDevices(prev => prev.map(d => d.id === id ? updated : d));
      showToast("Dispositivo actualizado correctamente", "success");
    } catch (error) {
      console.error("Error updating device:", error);
      showToast("Error al actualizar el dispositivo", "error");
      throw error;
    }
  };

  const handleDeviceCreated = (newDevice: Device) => {
    setDevices(prev => [...prev, newDevice]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dispositivos</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestiona todos tus dispositivos inteligentes</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleSync} disabled={isSyncing} variant="outline" className="flex-1 sm:flex-initial">
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-initial">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Agregar Dispositivo</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando dispositivos...</p>
      ) : devices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No hay dispositivos configurados</p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleSync} disabled={isSyncing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar con Home Assistant
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Manualmente
            </Button>
          </div>
        </div>
      ) : (

        <div className="space-y-8">
          {/* Online Devices */}
          {Object.entries(
            devices
              .filter(d => d.isOnline)
              .reduce((acc, device) => {
                const room = device.room || "Sin Asignar";
                if (!acc[room]) acc[room] = [];
                acc[room].push(device);
                return acc;
              }, {} as Record<string, Device[]>)
          ).map(([room, roomDevices]) => (
            <section key={room} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {room}
                </h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {roomDevices.length}
                </span>
              </div>
              <DeviceGrid devices={roomDevices} onToggle={handleToggle} onUpdate={handleUpdateDevice} />
            </section>
          ))}

          {/* Offline Devices Section */}
          {devices.some(d => !d.isOnline) && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer list-none text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 group-open:rotate-90 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                  <span className="font-medium">Dispositivos No Disponibles</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    {devices.filter(d => !d.isOnline).length}
                  </span>
                </summary>
                
                <div className="mt-6 space-y-8 opacity-90">
                  {Object.entries(
                    devices
                      .filter(d => !d.isOnline)
                      .reduce((acc, device) => {
                        const room = device.room || "Sin Asignar";
                        if (!acc[room]) acc[room] = [];
                        acc[room].push(device);
                        return acc;
                      }, {} as Record<string, Device[]>)
                  ).map(([room, roomDevices]) => (
                    <section key={`offline-${room}`} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <h2 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                          {room}
                        </h2>
                      </div>
                      <DeviceGrid devices={roomDevices} onToggle={() => {}} onUpdate={handleUpdateDevice} />
                    </section>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      )}

      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleDeviceCreated}
      />
      
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      )}
    </div>
  );
}

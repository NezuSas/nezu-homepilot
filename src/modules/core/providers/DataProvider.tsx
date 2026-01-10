"use client";

import * as React from "react";
import { Device } from "../../devices/types/device";
import { Scene } from "../../routines/types/routine";
import { deviceService } from "../../devices/services/deviceService";
import { routineService } from "../../routines/services/routineService";

import { NezuRoutine } from "../../routines/types/nezuRoutine";

interface DataContextType {
  devices: Device[];
  scenes: Scene[];
  routines: NezuRoutine[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  toggleDevice: (id: string, isOn: boolean) => Promise<void>;
  executeScene: (sceneId: number) => Promise<void>;
  executeRoutine: (routineId: number) => Promise<void>;
  batchToggle: (ids: string[], isOn: boolean) => Promise<void>;
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [routines, setRoutines] = React.useState<NezuRoutine[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const pendingUpdates = React.useRef(new Set<string>());

  const loadData = React.useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const [devicesData, scenesData, routinesData] = await Promise.all([
        deviceService.getDevices(),
        routineService.getScenes(),
        routineService.getNezuRoutines()
      ]);

      const onlineLights = devicesData.filter(d => 
        d.isOnline && 
        (d.type === 'light' || d.type === 'switch') &&
        d.room && 
        d.room !== "Sin Asignar"
      );

      setDevices(prev => {
        if (pendingUpdates.current.size === 0) {
          const isDifferent = JSON.stringify(prev) !== JSON.stringify(onlineLights);
          return isDifferent ? onlineLights : prev;
        }

        return onlineLights.map(newDevice => {
          if (pendingUpdates.current.has(newDevice.id)) {
            const currentDevice = prev.find(d => d.id === newDevice.id);
            return currentDevice || newDevice;
          }
          return newDevice;
        });
      });

      setScenes(scenesData);
      setRoutines(routinesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Polling
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      loadData(false);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [loadData]);

  const toggleDevice = async (id: string, isOn: boolean) => {
    pendingUpdates.current.add(id);

    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, isOn };
      }
      return d;
    }));

    try {
      await deviceService.toggleDevice(id, isOn);
      setTimeout(() => {
        pendingUpdates.current.delete(id);
      }, 2000);
    } catch (error) {
      console.error("Error toggling device:", error);
      pendingUpdates.current.delete(id);
      setDevices(prev => prev.map(d => {
        if (d.id === id) {
          return { ...d, isOn: !isOn };
        }
        return d;
      }));
    }
  };

  const batchToggle = async (ids: string[], isOn: boolean) => {
    ids.forEach(id => pendingUpdates.current.add(id));

    setDevices(prev => prev.map(d => {
      if (ids.includes(d.id)) {
        return { ...d, isOn };
      }
      return d;
    }));

    try {
      await deviceService.batchToggle(ids, isOn);
      setTimeout(() => {
        ids.forEach(id => pendingUpdates.current.delete(id));
      }, 2000);
    } catch (error) {
      console.error("Error in batch toggle:", error);
      loadData(false);
      ids.forEach(id => pendingUpdates.current.delete(id));
    }
  };

  const executeScene = async (sceneId: number) => {
    try {
      await routineService.executeScene(sceneId);
      loadData(false);
    } catch (error) {
      console.error("Error executing scene:", error);
    }
  };

  const executeRoutine = async (routineId: number) => {
    try {
      await routineService.executeNezuRoutine(routineId);
      loadData(false);
    } catch (error) {
      console.error("Error executing routine:", error);
    }
  };

  const value = React.useMemo(() => ({
    devices,
    scenes,
    routines,
    isLoading,
    refreshData: () => loadData(false),
    toggleDevice,
    executeScene,
    executeRoutine,
    batchToggle
  }), [devices, scenes, routines, isLoading, loadData]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

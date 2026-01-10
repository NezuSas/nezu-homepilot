"use client";

import * as React from "react";
import { Device } from "../../devices/types/device";
import { CardConfig } from "../types/layout";
import { Scene } from "../../routines/types/routine";
import { NezuRoutine } from "../../routines/types/nezuRoutine";
import { X, Plus, Play, Layers } from "lucide-react";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  routines: NezuRoutine[];
  scenes: Scene[];
  existingCards: CardConfig[];
  onAddCard: (card: CardConfig) => void;
}

export function AddCardModal({
  isOpen,
  onClose,
  devices,
  routines,
  scenes,
  existingCards,
  onAddCard,
}: AddCardModalProps) {
  const [activeTab, setActiveTab] = React.useState<'devices' | 'routines' | 'scenes'>('devices');

  if (!isOpen) return null;

  // Filter out items that are already in the dashboard
  const existingDeviceIds = existingCards
    .filter(c => c.type === 'device')
    .map(c => c.deviceId);
  
  const existingRoutineIds = existingCards
    .filter(c => c.type === 'routine')
    .map(c => c.routineId);

  const existingSceneIds = existingCards
    .filter(c => c.type === 'scene')
    .map(c => c.sceneId);
  
  const availableDevices = devices.filter(d => d.isOnline && !existingDeviceIds.includes(d.id));
  const availableRoutines = routines.filter(r => !existingRoutineIds.includes(String(r.id)));
  const availableScenes = scenes.filter(s => !existingSceneIds.includes(String(s.id)));

  const handleAddDevice = (device: Device) => {
    onAddCard({
      id: `device-${device.id}`,
      type: 'device',
      deviceId: device.id,
    });
    onClose();
  };

  const handleAddRoutine = (routine: NezuRoutine) => {
    onAddCard({
      id: `routine-${routine.id}`,
      type: 'routine',
      routineId: String(routine.id),
    });
    onClose();
  };

  const handleAddScene = (scene: Scene) => {
    onAddCard({
      id: `scene-${scene.id}`,
      type: 'scene',
      sceneId: String(scene.id),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Agregar Tarjeta
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-6">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'devices'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Dispositivos
          </button>
          <button
            onClick={() => setActiveTab('routines')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'routines'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Rutinas
          </button>
          <button
            onClick={() => setActiveTab('scenes')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'scenes'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Escenas
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'devices' && (
            availableDevices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                  No hay dispositivos disponibles.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableDevices.map(device => (
                  <button
                    key={device.id}
                    onClick={() => handleAddDevice(device)}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                  >
                    <div className={`p-3 rounded-full ${
                      device.type === 'light' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {device.type === 'light' ? (
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {device.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {device.room}
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            )
          )}

          {activeTab === 'routines' && (
            availableRoutines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                  No hay rutinas disponibles.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableRoutines.map(routine => (
                  <button
                    key={routine.id}
                    onClick={() => handleAddRoutine(routine)}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                  >
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {routine.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {routine.actions.length} acciones
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            )
          )}

          {activeTab === 'scenes' && (
            availableScenes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                  No hay escenas disponibles.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableScenes.map(scene => (
                  <button
                    key={scene.id}
                    onClick={() => handleAddScene(scene)}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                  >
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                      <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {scene.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Home Assistant Scene
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

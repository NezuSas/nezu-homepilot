"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Clock, Zap, Sun, Trash2, Play, Settings } from "lucide-react";
import { cn } from "../../core/utils/cn";
import { NezuRoutine, RoutineTrigger, RoutineAction } from "../types/nezuRoutine";
import { routineService } from "../services/routineService";
import { deviceService } from "../../devices/services/deviceService";
import { Device } from "../../devices/types/device";
import { ROOM_ICONS, ROOM_COLORS } from "../../rooms/constants/roomOptions";
import * as Icons from "lucide-react";

interface RoutineBuilderPageProps {
  routineId?: string;
}

export default function RoutineBuilderPage({ routineId }: RoutineBuilderPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(!!routineId);
  const [isSaving, setIsSaving] = React.useState(false);
  const [devices, setDevices] = React.useState<Device[]>([]);
  
  const [routine, setRoutine] = React.useState<NezuRoutine>({
    name: "",
    description: "",
    icon: "Zap",
    color: "#6366f1",
    is_active: true,
    triggers: [],
    actions: [],
    aliases: []
  });

  React.useEffect(() => {
    loadData();
  }, [routineId]);

  const loadData = async () => {
    try {
      const devicesData = await deviceService.getDevices();
      setDevices(devicesData);

      if (routineId) {
        const routines = await routineService.getNezuRoutines();
        const found = routines.find(r => String(r.id) === routineId);
        if (found) {
          setRoutine(found);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!routine.name) return;
    setIsSaving(true);
    try {
      if (routineId) {
        await routineService.updateNezuRoutine(routine);
      } else {
        await routineService.createNezuRoutine(routine);
      }
      router.push("/routines");
    } catch (error) {
      console.error("Failed to save routine:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTrigger = (type: 'time' | 'device_state') => {
    const newTrigger: RoutineTrigger = {
      type,
      days: "daily",
      condition: "==",
      value: "on"
    };
    setRoutine({ ...routine, triggers: [...routine.triggers, newTrigger] });
  };

  const addAction = () => {
    const newAction: RoutineAction = {
      action_type: "turn_on",
      order: routine.actions.length,
      data: {}
    };
    setRoutine({ ...routine, actions: [...routine.actions, newAction] });
  };

  const removeTrigger = (index: number) => {
    const newTriggers = [...routine.triggers];
    newTriggers.splice(index, 1);
    setRoutine({ ...routine, triggers: newTriggers });
  };

  const removeAction = (index: number) => {
    const newActions = [...routine.actions];
    newActions.splice(index, 1);
    setRoutine({ ...routine, actions: newActions });
  };

  const updateTrigger = (index: number, updates: Partial<RoutineTrigger>) => {
    const newTriggers = [...routine.triggers];
    newTriggers[index] = { ...newTriggers[index], ...updates };
    setRoutine({ ...routine, triggers: newTriggers });
  };

  const updateAction = (index: number, updates: Partial<RoutineAction>) => {
    const newActions = [...routine.actions];
    newActions[index] = { ...newActions[index], ...updates };
    setRoutine({ ...routine, actions: newActions });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{routineId ? "Edit Routine" : "New Routine"}</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !routine.name}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        
        {/* Basic Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            Basic Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={routine.name}
                onChange={e => setRoutine({ ...routine, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                placeholder="e.g. Good Morning"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={routine.description || ""}
                onChange={e => setRoutine({ ...routine, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                placeholder="Optional description"
              />
            </div>
          </div>
        </div>

        {/* Triggers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              When...
            </h2>
            <div className="flex gap-2">
              <button onClick={() => addTrigger('time')} className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">
                + Time
              </button>
              <button onClick={() => addTrigger('device_state')} className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">
                + Device
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {routine.triggers.length === 0 && (
              <p className="text-slate-500 text-sm italic">No triggers added. This routine will only run manually.</p>
            )}
            {routine.triggers.map((trigger, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 relative group">
                <button onClick={() => removeTrigger(idx)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                
                {trigger.type === 'time' && (
                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="text-sm font-medium block mb-1">Time</span>
                      <input
                        type="time"
                        value={trigger.time || ""}
                        onChange={e => updateTrigger(idx, { time: e.target.value })}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
                      />
                    </div>
                  </div>
                )}

                {trigger.type === 'device_state' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Device State</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select
                        value={trigger.entity_id || ""}
                        onChange={e => updateTrigger(idx, { entity_id: e.target.value })}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
                      >
                        <option value="">Select Device</option>
                        {devices.map(d => (
                          <option key={d.id} value={d.entity_id}>{d.name}</option>
                        ))}
                      </select>
                      <select
                        value={trigger.condition || "=="}
                        onChange={e => updateTrigger(idx, { condition: e.target.value })}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
                      >
                        <option value="==">Equals</option>
                        <option value="!=">Not Equals</option>
                      </select>
                      <select
                        value={trigger.value || "on"}
                        onChange={e => updateTrigger(idx, { value: e.target.value })}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
                      >
                        <option value="on">On</option>
                        <option value="off">Off</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Then...
            </h2>
            <button onClick={addAction} className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">
              + Add Action
            </button>
          </div>

          <div className="space-y-4">
            {routine.actions.length === 0 && (
              <p className="text-slate-500 text-sm italic">No actions defined.</p>
            )}
            {routine.actions.map((action, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 relative group">
                <button onClick={() => removeAction(idx)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    value={action.device_id || ""}
                    onChange={e => updateAction(idx, { device_id: e.target.value })}
                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
                  >
                    <option value="">Select Device</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.entity_id}>{d.name}</option>
                    ))}
                  </select>
                  <select
                    value={action.action_type}
                    onChange={e => updateAction(idx, { action_type: e.target.value })}
                    className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
                  >
                    <option value="turn_on">Turn On</option>
                    <option value="turn_off">Turn Off</option>
                    <option value="toggle">Toggle</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

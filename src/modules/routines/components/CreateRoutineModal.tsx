"use client";

import * as React from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Device } from "../../devices/types/device";
import { NezuRoutine, RoutineAction } from "../types/nezuRoutine";

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routine: NezuRoutine) => Promise<void>;
  devices: Device[];
}

export function CreateRoutineModal({ isOpen, onClose, onSave, devices }: CreateRoutineModalProps) {
  const [name, setName] = React.useState("");
  const [aliases, setAliases] = React.useState("");
  const [icon, setIcon] = React.useState("Play");
  const [color, setColor] = React.useState("blue");
  const [actions, setActions] = React.useState<RoutineAction[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleAddAction = () => {
    setActions([...actions, { device_id: "", action_type: "turn_on", order: actions.length }]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleActionChange = (index: number, field: keyof RoutineAction, value: string) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], [field]: value };
    setActions(newActions);
  };

  const handleSave = async () => {
    if (!name.trim() || actions.length === 0) return;

    setIsSaving(true);
    try {
      await onSave({ 
        name, 
        aliases: aliases.split(',').map(a => a.trim()).filter(a => a),
        icon, 
        color, 
        is_active: true,
        triggers: [],
        actions 
      });
      // Reset form
      setName("");
      setAliases("");
      setIcon("Play");
      setColor("blue");
      setActions([]);
      onClose();
    } catch (error) {
      console.error("Error saving routine:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crear Rutina</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nombre de la Rutina
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Modo Noche"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

          </div>

          {/* Aliases */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nombres Alternativos (separados por coma)
            </label>
            <input
              type="text"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="Ej: Buenas Noches, A dormir, Hora de descansar"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {['blue', 'purple', 'green', 'orange', 'pink'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg bg-${c}-500 ${color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Acciones
              </label>
              <button
                onClick={handleAddAction}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar Acción
              </button>
            </div>

            <div className="space-y-3">
              {actions.map((action, index) => (
                <div key={index} className="flex gap-3 items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex-1">
                    <select
                      value={action.device_id}
                      onChange={(e) => handleActionChange(index, 'device_id', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="">Seleccionar dispositivo</option>
                      {devices.map((device) => (
                        <option key={device.id} value={device.entity_id || device.id}>
                          {device.name} ({device.room})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <select
                      value={action.action_type}
                      onChange={(e) => handleActionChange(index, 'action_type', e.target.value as 'turn_on' | 'turn_off')}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="turn_on">Encender</option>
                      <option value="turn_off">Apagar</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleRemoveAction(index)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {actions.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No hay acciones. Haz clic en "Agregar Acción" para comenzar.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || actions.length === 0 || isSaving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Guardando..." : "Guardar Rutina"}
          </button>
        </div>
      </div>
    </div>
  );
}

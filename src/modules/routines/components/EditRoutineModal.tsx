"use client";

import * as React from "react";
import { NezuRoutine, RoutineAction } from "../types/nezuRoutine";
import { Device } from "../../devices/types/device";
import { X, Plus, Trash2, Save, GripVertical } from "lucide-react";
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: NezuRoutine | null;
  devices: Device[];
  onSave: (routine: NezuRoutine) => void;
}

interface SortableActionItemProps {
  action: RoutineAction;
  index: number;
  devices: Device[];
  onRemove: () => void;
  onChange: (field: keyof RoutineAction, value: string) => void;
}

function SortableActionItem({ action, index, devices, onRemove, onChange }: SortableActionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `action-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing pt-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        {action.action_type === 'delay' ? (
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Tiempo de espera (segundos)
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={action.value || 1}
                onChange={(e) => onChange("value", e.target.value)}
                className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={action.action_type}
                onChange={(e) => onChange("action_type", e.target.value)}
                className="w-1/3 px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="turn_on">Encender</option>
                <option value="turn_off">Apagar</option>
                <option value="delay">Espera</option>
              </select>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Dispositivo
              </label>
              <select
                value={action.device_id}
                onChange={(e) => onChange("device_id", e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar dispositivo</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.entity_id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Acción
              </label>
              <select
                value={action.action_type}
                onChange={(e) => onChange("action_type", e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="turn_on">Encender</option>
                <option value="turn_off">Apagar</option>
                <option value="delay">Espera</option>
              </select>
            </div>
          </>
        )}
      </div>
      <button
        onClick={onRemove}
        className="p-2 mt-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function EditRoutineModal({
  isOpen,
  onClose,
  routine,
  devices,
  onSave,
}: EditRoutineModalProps) {
  const [name, setName] = React.useState("");
  const [aliases, setAliases] = React.useState("");
  const [color, setColor] = React.useState("blue");
  const [icon, setIcon] = React.useState("Play");
  const [actions, setActions] = React.useState<RoutineAction[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (routine) {
      setName(routine.name);
      setAliases(routine.aliases ? routine.aliases.join(', ') : "");
      setColor(routine.color || "blue");
      setIcon(routine.icon || "Play");
      setActions(routine.actions || []);
    }
  }, [routine]);

  if (!isOpen || !routine) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActions((items) => {
        const oldIndex = items.findIndex((_, i) => `action-${i}` === active.id);
        const newIndex = items.findIndex((_, i) => `action-${i}` === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddAction = () => {
    setActions([
      ...actions,
      {
        device_id: "",
        action_type: "turn_on",
        order: actions.length,
      },
    ]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleActionChange = (
    index: number,
    field: keyof RoutineAction,
    value: string
  ) => {
    const newActions = [...actions];
    
    // If changing action_type, handle special cases
    if (field === 'action_type') {
      if (value === 'delay') {
        // Switching to delay: clear device_id and set default value
        newActions[index] = {
          ...newActions[index],
          action_type: value,
          device_id: '',
          value: 1,
        };
      } else {
        // Switching from delay to device action: clear value
        newActions[index] = {
          ...newActions[index],
          action_type: value,
          value: 0,
        };
      }
    } else {
      newActions[index] = { ...newActions[index], [field]: value };
    }
    
    setActions(newActions);
  };

  const handleSave = () => {
    // Update order field for all actions based on their current position
    const actionsWithOrder = actions.map((action, index) => ({
      ...action,
      order: index,
    }));
    
    onSave({
      ...routine,
      name,
      aliases: aliases.split(',').map(a => a.trim()).filter(a => a),
      color,
      icon,
      actions: actionsWithOrder,
    });
    onClose();
  };

  const colors = [
    { name: "Azul", value: "blue" },
    { name: "Verde", value: "green" },
    { name: "Rojo", value: "red" },
    { name: "Amarillo", value: "yellow" },
    { name: "Morado", value: "purple" },
    { name: "Rosa", value: "pink" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Editar Rutina
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nombre de la Rutina
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
              placeholder="Ej: Buenas noches"
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
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
              placeholder="Ej: Buenas Noches, A dormir"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((c) => {
                const isSelected = color === c.value;
                const colorClasses: Record<string, string> = {
                  blue: isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "",
                  green: isSelected ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "",
                  red: isSelected ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "",
                  yellow: isSelected ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : "",
                  purple: isSelected ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "",
                  pink: isSelected ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20" : "",
                };
                
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? colorClasses[c.value]
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Acciones ({actions.length})
              </label>
              <button
                onClick={handleAddAction}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {actions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                No hay acciones. Agrega al menos una acción.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={actions.map((_, i) => `action-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {actions.map((action, index) => (
                      <SortableActionItem
                        key={`action-${index}`}
                        action={action}
                        index={index}
                        devices={devices}
                        onRemove={() => handleRemoveAction(index)}
                        onChange={(field, value) => handleActionChange(index, field, value)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || actions.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

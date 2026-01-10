"use client";

import * as React from "react";
import { CardConfig } from "../types/layout";
import { X, Save, Lightbulb, Zap, Home, Star, Sun, Moon, Cloud, Heart } from "lucide-react";

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardConfig | null;
  onSave: (card: CardConfig) => void;
}

const ICON_OPTIONS = [
  { name: "Bombilla", icon: Lightbulb, value: "Lightbulb" },
  { name: "Rayo", icon: Zap, value: "Zap" },
  { name: "Casa", icon: Home, value: "Home" },
  { name: "Estrella", icon: Star, value: "Star" },
  { name: "Sol", icon: Sun, value: "Sun" },
  { name: "Luna", icon: Moon, value: "Moon" },
  { name: "Nube", icon: Cloud, value: "Cloud" },
  { name: "Corazón", icon: Heart, value: "Heart" },
];

export function EditCardModal({
  isOpen,
  onClose,
  card,
  onSave,
}: EditCardModalProps) {
  const [customIcon, setCustomIcon] = React.useState<string>("");

  React.useEffect(() => {
    if (card) {
      setCustomIcon(card.customIcon || "");
    }
  }, [card]);

  if (!isOpen || !card) return null;

  const handleSave = () => {
    onSave({
      ...card,
      customIcon: customIcon || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Editar Tarjeta
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Icono Personalizado
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setCustomIcon(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      customIcon === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <IconComponent className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {option.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {customIcon && (
              <button
                onClick={() => setCustomIcon("")}
                className="mt-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Usar icono por defecto
              </button>
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
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

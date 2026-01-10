"use client";

import * as React from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { CardConfig } from "../types/layout";
import { DeviceCard } from "../../devices/components/DeviceCard";
import { Scene } from "../../routines/types/routine";
import { NezuRoutine } from "../../routines/types/nezuRoutine";
import { Device } from "../../devices/types/device";
import { X, Edit, Play, Layers } from "lucide-react";

interface CustomizableGridProps {
  layout: Layout[];
  cards: CardConfig[];
  devices: Device[];
  routines?: NezuRoutine[];
  scenes?: Scene[];
  isEditMode: boolean;
  onLayoutChange: (layout: Layout[]) => void;
  onRemoveCard: (cardId: string) => void;
  onEditCard?: (card: CardConfig) => void;
  onToggleDevice: (id: string, isOn: boolean) => void;
  onExecuteRoutine?: (id: number) => void;
  onExecuteScene?: (id: number) => void;
}

export function CustomizableGrid({
  layout,
  cards,
  devices,
  routines = [],
  scenes = [],
  isEditMode,
  onLayoutChange,
  onRemoveCard,
  onEditCard,
  onToggleDevice,
  onExecuteRoutine,
  onExecuteScene,
}: CustomizableGridProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(1200);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const renderCard = (card: CardConfig) => {
    switch (card.type) {
      case 'device':
        const device = devices.find(d => d.id === card.deviceId);
        if (!device) return <div className="p-4 text-slate-500">Device not found</div>;
        return <DeviceCard device={device} onToggle={onToggleDevice} customIcon={card.customIcon} />;
      
      case 'routine':
        const routine = routines.find(r => String(r.id) === card.routineId);
        if (!routine) return <div className="p-4 text-slate-500">Routine not found</div>;
        return (
          <button
            onClick={() => onExecuteRoutine && routine.id !== undefined && onExecuteRoutine(routine.id)}
            className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-95 text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-purple-100">{routine.actions.length} acciones</span>
            </div>
            <h3 className="font-semibold text-white truncate">{routine.name}</h3>
          </button>
        );

      case 'scene':
        const scene = scenes.find(s => String(s.id) === card.sceneId);
        if (!scene) return <div className="p-4 text-slate-500">Scene not found</div>;
        return (
          <button
            onClick={() => onExecuteScene && onExecuteScene(scene.id)}
            className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-95 text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-indigo-100">Escena</span>
            </div>
            <h3 className="font-semibold text-white truncate">{scene.name}</h3>
          </button>
        );

      case 'summary':
        const activeDevicesCount = devices.filter(d => d.isOn).length;
        return (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-xl p-4 shadow-lg shadow-blue-500/20 h-full flex flex-col justify-center text-white">
            <div className="text-4xl font-bold mb-1">{activeDevicesCount}</div>
            <div className="text-sm font-medium text-blue-100">Dispositivos Activos</div>
          </div>
        );
      
      default:
        return <div className="p-4">Unknown card type</div>;
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={containerWidth}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {cards.map(card => (
          <div key={card.id} className="relative group/card">
            {isEditMode && (
              <div className="absolute top-2 right-2 z-20 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                <div className="drag-handle cursor-move p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                </div>
                {onEditCard && card.type === 'device' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCard(card);
                    }}
                    className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCard(card.id);
                  }}
                  className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {renderCard(card)}
            {isEditMode && (
              <div className="absolute inset-0 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl pointer-events-none opacity-50" />
            )}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}

"use client";

import * as React from "react";
import { WelcomeHeader } from "../components/WelcomeHeader";
import { DeviceGrid } from "../../devices/components/DeviceGrid";
import { Device } from "../../devices/types/device";
import { authService } from "../../auth/services/authService";
import { Scene } from "../../routines/types/routine";
import { CustomizableGrid } from "../components/CustomizableGrid";
import { AddCardModal } from "../components/AddCardModal";
import { EditCardModal } from "../components/EditCardModal";
import { dashboardLayoutService } from "../services/dashboardLayoutService";
import { LayoutItem, CardConfig } from "../types/layout";
import { Settings, Save, Plus } from "lucide-react";
import { useData } from "../../core/providers/DataProvider";

export function DashboardPage() {
  const { devices: allDevices, scenes, routines, isLoading: isDataLoading, toggleDevice, executeScene, executeRoutine, batchToggle, refreshData } = useData();
  const devices = allDevices.filter(d => d.isOnline);
  
  const [userName, setUserName] = React.useState("Usuario");
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [layout, setLayout] = React.useState<LayoutItem[]>([]);
  const [cards, setCards] = React.useState<CardConfig[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = React.useState(false);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<CardConfig | null>(null);
  const [isLayoutLoading, setIsLayoutLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLayoutLoading(true);
        // Load user
        const user = await authService.me();
        setUserName(user.first_name || user.username);

        // Load dashboard layout
        try {
          const dashboardLayout = await dashboardLayoutService.getLayout();
          if (dashboardLayout && dashboardLayout.layout && dashboardLayout.layout.length > 0) {
            setLayout(dashboardLayout.layout);
            setCards(dashboardLayout.cards);
          } else {
            const defaultCards: CardConfig[] = [
              { id: 'summary-card', type: 'summary' },
            ];
            
            // If devices are already loaded, we can add them
            if (devices.length > 0) {
               devices.filter(d => d.isOnline && (d.type === 'light' || d.type === 'switch') && d.room && d.room !== "Sin Asignar")
               .slice(0, 8).forEach(device => {
                 defaultCards.push({
                    id: `device-${device.id}`,
                    type: 'device' as const,
                    deviceId: device.id,
                 });
               });
            }

            const defaultLayout: LayoutItem[] = defaultCards.map((card, index) => ({
              i: card.id,
              x: (index % 4) * 3,
              y: Math.floor(index / 4),
              w: 3,
              h: 1,
            }));
            setLayout(defaultLayout);
            setCards(defaultCards);
          }
        } catch (error) {
          console.error("Error loading dashboard layout:", error);
          // Generate default layout on error
          const defaultCards: CardConfig[] = [
            { id: 'summary-card', type: 'summary' },
          ];
          const defaultLayout: LayoutItem[] = [{
            i: 'summary-card',
            x: 0,
            y: 0,
            w: 3,
            h: 1,
          }];
          setLayout(defaultLayout);
          setCards(defaultCards);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLayoutLoading(false);
      }
    };

    loadDashboardData();
  }, []); // Run once on mount. Devices are handled by DataProvider.

  const handleToggle = async (id: string, isOn: boolean) => {
    await toggleDevice(id, isOn);
  };

  const handleExecuteScene = async (scene: Scene) => {
    await executeScene(scene.id);
  };

  const handleMasterLightsToggle = async () => {
    const lights = devices.filter(d => d.type === 'light');
    const lightsOn = lights.filter(d => d.isOn);
    const targetState = lightsOn.length === 0; 
    const ids = lights.map(d => d.id);
    await batchToggle(ids, targetState);
  };

  const handleMasterSwitchesToggle = async () => {
    const switches = devices.filter(d => d.type === 'switch');
    const switchesOn = switches.filter(d => d.isOn);
    const targetState = switchesOn.length === 0; 
    const ids = switches.map(d => d.id);
    await batchToggle(ids, targetState);
  };

  const activeDevicesCount = devices.filter(d => d.isOn).length;

  const handleSaveLayout = async () => {
    try {
      setIsSaving(true);
      await dashboardLayoutService.saveLayout(layout, cards);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving layout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  };

  const handleRemoveCard = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    setLayout(prev => prev.filter(l => l.i !== cardId));
  };

  const handleAddCard = (card: CardConfig) => {
    const maxY = layout.length > 0 ? Math.max(...layout.map(l => l.y)) : 0;
    const newLayout: LayoutItem = {
      i: card.id,
      x: 0,
      y: maxY + 1,
      w: 3,
      h: 1,
    };
    
    setCards(prev => [...prev, card]);
    setLayout(prev => [...prev, newLayout]);
  };

  const handleEditCard = (card: CardConfig) => {
    setSelectedCard(card);
    setIsEditCardModalOpen(true);
  };

  const handleUpdateCard = (updatedCard: CardConfig) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setIsEditCardModalOpen(false);
    setSelectedCard(null);
  };

  const handleTurnOffRoom = async (roomName: string) => {
    const roomDevices = devices.filter(d => d.room === roomName && (d.type === 'light' || d.type === 'switch'));
    const devicesOn = roomDevices.filter(d => d.isOn);
    
    if (devicesOn.length === 0) return;
    
    const ids = devicesOn.map(d => d.id);
    try {
      await batchToggle(ids, false);
    } catch (error) {
      console.error(`Error turning off room ${roomName}:`, error);
      await refreshData();
    }
  };

  const isLoading = isLayoutLoading || (isDataLoading && devices.length === 0);

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <WelcomeHeader userName={userName} />
        <div className="flex gap-2 w-full sm:w-auto">
          {isEditMode && (
            <>
              <button
                onClick={() => setIsAddCardModalOpen(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20 text-sm flex-1 sm:flex-initial"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Agregar Tarjeta</span>
                <span className="sm:hidden">Agregar</span>
              </button>
              <button
                onClick={handleSaveLayout}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50 font-medium text-sm flex-1 sm:flex-initial"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          )}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm flex-1 sm:flex-initial ${
              isEditMode
                ? "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20"
            }`}
          >
            {isEditMode ? (
              <>
                Cancelar
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Editar Dashboard</span>
                <span className="sm:hidden">Editar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Master Controls */}
      {!isEditMode && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={handleMasterLightsToggle}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap"
          >
            <div className={`w-2 h-2 rounded-full ${devices.some(d => d.type === 'light' && d.isOn) ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
            {devices.some(d => d.type === 'light' && d.isOn) ? 'Apagar Luces' : 'Encender Luces'}
          </button>
          <button
            onClick={handleMasterSwitchesToggle}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap"
          >
            <div className={`w-2 h-2 rounded-full ${devices.some(d => d.type === 'switch' && d.isOn) ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
            {devices.some(d => d.type === 'switch' && d.isOn) ? 'Apagar Switches' : 'Encender Switches'}
          </button>
        </div>
      )}
      
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isEditMode ? 'Modo Edición - Arrastra las tarjetas' : 'Mi Dashboard'}
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">{activeDevicesCount} dispositivos activos</span>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 animate-pulse">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-4" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ) : cards.length === 0 ? (
          <div className="space-y-6">
            {/* Summary Card in Empty State */}
            <div className="max-w-sm mx-auto">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-xl p-6 shadow-lg shadow-blue-500/20 text-white transform transition-all hover:scale-105">
                <div className="text-5xl font-bold mb-2">{activeDevicesCount}</div>
                <div className="text-lg font-medium text-blue-100">Dispositivos Activos</div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Settings className="w-8 h-8 animate-spin-slow" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Personaliza tu espacio
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                Agrega tarjetas para tus dispositivos favoritos y ten el control total de tu hogar.
              </p>
              <button
                onClick={() => {
                  setIsEditMode(true);
                  setIsAddCardModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 font-medium"
              >
                <Plus className="w-5 h-5" />
                Agregar Tarjetas
              </button>
            </div>
          </div>
        ) : (
          <CustomizableGrid
            layout={layout}
            cards={cards}
            devices={devices}
            routines={routines}
            scenes={scenes}
            isEditMode={isEditMode}
            onLayoutChange={handleLayoutChange}
            onRemoveCard={handleRemoveCard}
            onEditCard={handleEditCard}
            onToggleDevice={handleToggle}
            onExecuteRoutine={executeRoutine}
            onExecuteScene={executeScene}
          />
        )}
      </section>

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        devices={devices}
        routines={routines}
        scenes={scenes}
        existingCards={cards}
        onAddCard={handleAddCard}
      />

      <EditCardModal
        isOpen={isEditCardModalOpen}
        onClose={() => {
          setIsEditCardModalOpen(false);
          setSelectedCard(null);
        }}
        card={selectedCard}
        onSave={handleUpdateCard}
      />

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Mis Dispositivos</h2>
        {isLoading ? (
          <p className="text-slate-500 dark:text-slate-400">Cargando dispositivos...</p>
        ) : devices.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No hay dispositivos configurados.</p>
        ) : (
        <div className="space-y-8">
          {Object.entries(
            devices.reduce((acc, device) => {
              const room = device.room || "Sin Asignar";
              // Skip unassigned devices for dashboard
              if (room === "Sin Asignar") return acc;
              
              if (!acc[room]) acc[room] = [];
              acc[room].push(device);
              return acc;
            }, {} as Record<string, Device[]>)
          ).sort().map(([room, roomDevices]) => {
            // Sort: ON devices first, then alphabetical by name
            const sortedDevices = [...roomDevices].sort((a, b) => {
              if (a.isOn === b.isOn) {
                return a.name.localeCompare(b.name);
              }
              return a.isOn ? -1 : 1;
            });

            const activeInRoom = roomDevices.filter(d => d.isOn).length;

            return (
            <section key={room} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {room}
                  </h2>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {roomDevices.length}
                  </span>
                </div>
                
                {activeInRoom > 0 && (
                  <button
                    onClick={() => handleTurnOffRoom(room)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-100 bg-red-50 dark:bg-red-500/20 dark:border dark:border-red-500/30 backdrop-blur-md rounded-full hover:bg-red-100 dark:hover:bg-red-500/30 transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    Apagar {activeInRoom}
                  </button>
                )}
              </div>
              <DeviceGrid devices={sortedDevices} onToggle={handleToggle} />
            </section>
            );
          })}
          
          {devices.filter(d => d.room && d.room !== "Sin Asignar").length === 0 && (
             <p className="text-slate-500 dark:text-slate-400">No hay luces o interruptores activos en áreas asignadas.</p>
          )}
        </div>
        )}
      </section>
    </div>
  );
}

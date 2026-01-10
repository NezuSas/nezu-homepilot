"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { WelcomeHeader } from "../../dashboard/components/WelcomeHeader";
import { authService } from "../../auth/services/authService";
import { routineService } from "../services/routineService";
import { Scene } from "../types/routine";
import { NezuRoutine } from "../types/nezuRoutine";
import { Plus, Trash2, Edit, Play } from "lucide-react";

export function RoutinesPage() {
  const router = useRouter();
  const [scenes, setScenes] = React.useState<Scene[]>([]);
  const [nezuRoutines, setNezuRoutines] = React.useState<NezuRoutine[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userName, setUserName] = React.useState("Usuario");

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const user = await authService.me();
        setUserName(user.first_name || user.username);

        const [scenesData, routinesData] = await Promise.all([
          routineService.getScenes(),
          routineService.getNezuRoutines(),
        ]);

        setScenes(scenesData);
        setNezuRoutines(routinesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExecuteScene = async (scene: Scene) => {
    try {
      await routineService.executeScene(scene.id);
    } catch (error) {
      console.error("Error executing scene:", error);
    }
  };

  const handleExecuteNezuRoutine = async (e: React.MouseEvent, routine: NezuRoutine) => {
    e.stopPropagation(); // Prevent navigation
    if (!routine.id) return;
    try {
      await routineService.executeNezuRoutine(routine.id);
    } catch (error) {
      console.error("Error executing routine:", error);
    }
  };

  const handleDeleteRoutine = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this routine?")) return;
    try {
      await routineService.deleteNezuRoutine(id);
      setNezuRoutines(nezuRoutines.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting routine:", error);
    }
  };

  const scenesList = scenes.filter(s => s.type === 'scene');
  const automationsList = scenes.filter(s => s.type === 'automation');

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <WelcomeHeader userName={userName} />

      {/* Custom Routines Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Mis Rutinas</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {nezuRoutines.length}
            </span>
          </div>
          <button
            onClick={() => router.push('/routines/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Rutina
          </button>
        </div>

        {isLoading ? (
          <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
        ) : nezuRoutines.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No has creado rutinas personalizadas aún.</p>
            <button
              onClick={() => router.push('/routines/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Primera Rutina
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nezuRoutines.map((routine) => (
              <div 
                key={routine.id} 
                className="relative group cursor-pointer"
                onClick={() => router.push(`/routines/${routine.id}`)}
              >
                <div className={`w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 text-left`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-${routine.color}-100 dark:bg-${routine.color}-900/30 text-${routine.color}-600 dark:text-${routine.color}-400`}>
                      <Play className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{routine.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 pl-1 mb-2">
                    {routine.actions.length} acciones
                    {routine.triggers.length > 0 && ` • ${routine.triggers.length} triggers`}
                  </div>
                  
                  {/* Quick Execute Button */}
                  <button
                    onClick={(e) => handleExecuteNezuRoutine(e, routine)}
                    className="w-full py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Ejecutar
                  </button>
                </div>

                {routine.id && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => handleDeleteRoutine(e, routine.id!)}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Scenes Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Escenas</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {scenesList.length}
          </span>
        </div>
        
        {isLoading ? (
          <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
        ) : scenesList.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No hay escenas configuradas.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scenesList.map((scene) => (
              <button
                key={scene.id}
                onClick={() => handleExecuteScene(scene)}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                    <Play className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{scene.name}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                  Escena
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Automations Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Automatizaciones</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {automationsList.length}
          </span>
        </div>
        
        {isLoading ? (
          <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
        ) : automationsList.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No hay automatizaciones disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {automationsList.map((scene) => (
              <button
                key={scene.id}
                onClick={() => handleExecuteScene(scene)}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                    <Play className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{scene.name}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                  Automatización
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

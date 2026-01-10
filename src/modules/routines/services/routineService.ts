import api from '../../core/services/api';
import { Scene } from '../types/routine';
import { NezuRoutine } from '../types/nezuRoutine';

export const routineService = {
  getScenes: async (): Promise<Scene[]> => {
    const response = await api.get('/scenes/');
    return response.data;
  },

  executeScene: async (id: number): Promise<void> => {
    await api.post(`/scenes/${id}/execute/`);
  },

  // Custom Nezu Routines
  getNezuRoutines: async (): Promise<NezuRoutine[]> => {
    const response = await api.get('/nezu-routines/');
    return response.data;
  },

  createNezuRoutine: async (routine: NezuRoutine): Promise<NezuRoutine> => {
    const response = await api.post('/nezu-routines/', routine);
    return response.data;
  },

  executeNezuRoutine: async (id: number): Promise<void> => {
    await api.post(`/nezu-routines/${id}/execute/`);
  },

  updateNezuRoutine: async (routine: NezuRoutine): Promise<NezuRoutine> => {
    const response = await api.put(`/nezu-routines/${routine.id}/`, routine);
    return response.data;
  },

  deleteNezuRoutine: async (id: number): Promise<void> => {
    await api.delete(`/nezu-routines/${id}/`);
  },
};

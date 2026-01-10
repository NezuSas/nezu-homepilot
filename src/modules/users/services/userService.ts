import api from "../../core/services/api";
import { User } from "../../auth/services/authService";

export const userService = {
  syncUsers: async (): Promise<{ status: string; count: number; message: string }> => {
    const response = await api.post("/auth/sync/");
    return response.data;
  },
  
  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/auth/list/");
    return response.data;
  },

  createUser: async (userData: { username: string; email: string; password: string; first_name: string }): Promise<User> => {
    const response = await api.post("/auth/register/", userData);
    return response.data.user;
  },

  deleteUser: async (userId: number): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/auth/delete/${userId}/`);
    return response.data;
  }
};

import api from "../../core/services/api";
import { LoginFormData } from "../components/LoginForm";
import { RegisterFormData } from "../components/RegisterForm";
import Cookies from "js-cookie";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  theme_preference?: 'light' | 'dark';
  wallpaper?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login/", credentials);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register/", data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me/");
    return response.data;
  },

  setAuth: (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    Cookies.set("token", token, { expires: 7 }); // 7 days
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("theme");
    Cookies.remove("token");
    Cookies.remove("user");
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>("/auth/me/", data);
    const updatedUser = response.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });
    return updatedUser;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post("/auth/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  requestPasswordReset: async (email: string): Promise<{ status: string }> => {
    const response = await api.post("/auth/password-reset/", { email });
    return response.data;
  },

  confirmPasswordReset: async (data: any): Promise<{ status: string }> => {
    const response = await api.post("/auth/password-reset-confirm/", data);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me/");
    return response.data;
  },
};

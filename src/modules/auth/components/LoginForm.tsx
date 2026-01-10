"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../core/components/Button";
import { Input } from "../../core/components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../services/authService";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      authService.setAuth(response.token, response.user);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.detail || "Credenciales inválidas o error de conexión";
      setError("root", { 
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Correo Electrónico
        </label>
        <Input
          id="email"
          type="email"
          placeholder="nombre@ejemplo.com"
          error={errors.email?.message}
          className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
          {...register("email")}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Contraseña
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            error={errors.password?.message}
            className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40" 
        isLoading={isLoading}
      >
        Iniciar Sesión
      </Button>
      {errors.root && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.root.message}</p>
        </div>
      )}
      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          Regístrate aquí
        </Link>
      </div>
    </form>
  );
}

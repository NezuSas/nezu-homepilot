"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../core/components/Button";
import { Input } from "../../core/components/Input";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "../services/authService";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!uid || !token) {
      setError("root", { message: "Faltan datos de recuperación en la URL" });
      return;
    }

    setIsLoading(true);
    try {
      await authService.confirmPasswordReset({
        uid,
        token,
        new_password: data.password,
      });
      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      const errorMessage = error?.response?.data?.error || "El enlace ha expirado o es inválido";
      setError("root", { message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">¡Contraseña restablecida!</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tu contraseña ha sido actualizada. Serás redirigido al inicio de sesión en unos segundos...
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => router.push("/login")}
          className="w-full"
        >
          Ir al Login ahora
        </Button>
      </div>
    );
  }

  if (!uid || !token) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
        <p className="text-sm text-red-600 dark:text-red-400">
          Enlace de recuperación inválido. Por favor, solicita uno nuevo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Nueva Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            error={errors.password?.message}
            className="h-12 pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-slate-400"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Confirmar Contraseña
        </label>
        <Input
          id="confirmPassword"
          type="password"
          error={errors.confirmPassword?.message}
          className="h-12"
          {...register("confirmPassword")}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
        isLoading={isLoading}
      >
        Cambiar Contraseña
      </Button>

      {errors.root && (
        <p className="text-sm text-red-600 text-center">{errors.root.message}</p>
      )}
    </form>
  );
}

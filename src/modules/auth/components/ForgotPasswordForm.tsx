"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../core/components/Button";
import { Input } from "../../core/components/Input";
import Link from "next/link";
import { authService } from "../services/authService";

const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const errorMessage = error?.response?.data?.error || "Error al solicitar el restablecimiento";
      setError("root", { message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            Si el correo está registrado, recibirás las instrucciones en unos minutos.
          </p>
        </div>
        <Link 
          href="/login"
          className="inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Correo Electrónico
        </label>
        <Input
          id="email"
          type="email"
          placeholder="nombre@ejemplo.com"
          error={errors.email?.message}
          className="h-12 bg-white/50 dark:bg-slate-900/50"
          {...register("email")}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
        isLoading={isLoading}
      >
        Enviar Instrucciones
      </Button>
      {errors.root && (
        <p className="text-sm text-red-600 text-center">{errors.root.message}</p>
      )}
      <div className="text-center">
        <Link 
          href="/login"
          className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
        >
          Atrás al inicio de sesión
        </Link>
      </div>
    </form>
  );
}

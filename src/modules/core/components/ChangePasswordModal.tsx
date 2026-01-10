"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../core/components/Modal";
import { Button } from "../../core/components/Button";
import { authService } from "../../auth/services/authService";

const passwordSchema = z.object({
  old_password: z.string().min(1, "Contraseña actual requerida"),
  new_password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirm_password: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setSuccessMessage("");
    try {
      await authService.changePassword(data.old_password, data.new_password);
      setSuccessMessage("Contraseña actualizada correctamente");
      setTimeout(() => {
        onClose();
        reset();
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error(error);
      setError("root", { message: "Error al cambiar contraseña. Verifica tu contraseña actual." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSuccessMessage("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cambiar Contraseña">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Contraseña Actual
          </label>
          <input
            {...register("old_password")}
            type="password"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.old_password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.old_password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nueva Contraseña
          </label>
          <input
            {...register("new_password")}
            type="password"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.new_password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.new_password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Confirmar Nueva Contraseña
          </label>
          <input
            {...register("confirm_password")}
            type="password"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.confirm_password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirm_password.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
        )}

        {successMessage && (
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            Cambiar Contraseña
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../core/components/Modal";
import { Button } from "../../core/components/Button";
import { deviceService } from "../services/deviceService";
import { Device, DeviceType } from "../types/device";

const deviceSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  type: z.enum(["light", "switch", "sensor", "climate", "lock"]),
  room: z.string().min(1, "Habitación requerida"),
  isOn: z.boolean(),
  value: z.string().optional(),
  unit: z.string().optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (device: Device) => void;
}

export function AddDeviceModal({ isOpen, onClose, onSuccess }: AddDeviceModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      room: "",
      isOn: false,
      type: "light",
      value: "",
      unit: "",
    },
  });

  const onSubmit = async (data: DeviceFormData) => {
    setIsLoading(true);
    try {
      const newDevice = await deviceService.createDevice(data);
      onSuccess(newDevice);
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      setError("root", { message: "Error al crear dispositivo" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Dispositivo">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nombre del Dispositivo
          </label>
          <input
            {...register("name")}
            type="text"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Luz Sala"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tipo
          </label>
          <select
            {...register("type")}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="light">Luz</option>
            <option value="switch">Interruptor</option>
            <option value="sensor">Sensor</option>
            <option value="climate">Clima</option>
            <option value="lock">Cerradura</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
          )}
        </div>

        {/* Room */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Habitación
          </label>
          <input
            {...register("room")}
            type="text"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Sala"
          />
          {errors.room && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.room.message}</p>
          )}
        </div>

        {/* Initial State */}
        <div className="flex items-center gap-2">
          <input
            {...register("isOn")}
            type="checkbox"
            id="isOn"
            className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isOn" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Encender al crear
          </label>
        </div>

        {/* Value (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Valor (Opcional)
            </label>
            <input
              {...register("value")}
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 22"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Unidad (Opcional)
            </label>
            <input
              {...register("unit")}
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: °C"
            />
          </div>
        </div>

        {/* Error Message */}
        {errors.root && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
        )}

        {/* Actions */}
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
            Crear Dispositivo
          </Button>
        </div>
      </form>
    </Modal>
  );
}

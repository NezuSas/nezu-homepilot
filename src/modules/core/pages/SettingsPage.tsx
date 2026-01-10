"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../core/components/Card";
import { Button } from "../../core/components/Button";
import { Input } from "../../core/components/Input";
import { ChangePasswordModal } from "../../core/components/ChangePasswordModal";
import { WallpaperSelector } from "../../settings/components/WallpaperSelector";
import { useTheme } from "../../core/providers/ThemeProvider";

export function SettingsPage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const { activeTheme, setTheme } = useTheme();

  const themes = [
    { id: 'none' as const, name: 'Sin Tema', emoji: '🚫', description: 'Sin efectos especiales' },
    { id: 'christmas' as const, name: 'Navidad', emoji: '🎄', description: 'Nieve, estrellas y regalos' },
    { id: 'halloween' as const, name: 'Halloween', emoji: '🎃', description: 'Murciélagos y fantasmas' },
    { id: 'spring' as const, name: 'Primavera', emoji: '🌸', description: 'Flores de cerezo' },
    { id: 'summer' as const, name: 'Verano', emoji: '🏖️', description: 'Playa y olas' },
    { id: 'autumn' as const, name: 'Otoño', emoji: '🍁', description: 'Hojas cayendo' },
    { id: 'newyear' as const, name: 'Año Nuevo', emoji: '🎆', description: 'Fuegos artificiales' },
    { id: 'valentine' as const, name: 'San Valentín', emoji: '💝', description: 'Corazones y rosas' },
  ];

  return (
    <div className="space-y-6">
      {/* General Section */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Configuración general de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Nombre de Usuario
            </label>
            <Input placeholder="Tu nombre" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Correo Electrónico
            </label>
            <Input type="email" placeholder="tu@email.com" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Gestiona cómo recibes notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium dark:text-white">Notificaciones Push</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Recibe notificaciones en tiempo real
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>
            Mantén tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsPasswordModalOpen(true)}>
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>
            Personaliza la apariencia de tu dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selector */}
          <div>
            <label className="block text-sm font-semibold mb-3 dark:text-white">
              Temas Estacionales
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    activeTheme === theme.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{theme.emoji}</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    {theme.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {theme.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <WallpaperSelector />
        </CardContent>
      </Card>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}

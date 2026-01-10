"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../core/components/Card";
import { Button } from "../../core/components/Button";
import { authService, User } from "../../auth/services/authService";
import { EditProfileModal } from "../../core/components/EditProfileModal";
import { Pencil } from "lucide-react";

export function UsersPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const handleUserUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Usuarios</h1>
        <p className="text-slate-500 dark:text-slate-400">Gestiona los usuarios de tu hogar</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tu Perfil</span>
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nombre</p>
                  <p className="font-medium dark:text-white">{user.first_name} {user.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-medium dark:text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Usuario</p>
                  <p className="font-medium dark:text-white">{user.username}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Hogar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Funcionalidad de gestión de usuarios familiares próximamente...
            </p>
          </CardContent>
        </Card>
      </div>

      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSuccess={handleUserUpdated}
        />
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { WelcomeHeader } from "../../dashboard/components/WelcomeHeader";
import { authService, User } from "../../auth/services/authService";
import { userService } from "../services/userService";
import { RefreshCw, Users, Mail, UserCircle, Calendar, Shield, Trash2, UserPlus } from "lucide-react";
import { CreateUserModal } from "../components/CreateUserModal";

export function UsersPage() {
  const [userName, setUserName] = React.useState("Usuario");
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncResult, setSyncResult] = React.useState<{ count: number; message: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authService.me();
        setUserName(user.first_name || user.username);
        setCurrentUser(user);

        // Load all users if admin
        const isUserAdmin = user.username === 'oscar' || user.email?.includes('nezuecuador.com');
        if (isUserAdmin) {
          const users = await userService.getUsers();
          setAllUsers(users);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadData();
  }, []);

  const handleSyncUsers = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await userService.syncUsers();
      setSyncResult(result);
      // Reload users after sync
      const users = await userService.getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("Error syncing users:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${username}"?`)) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      // Reload users after deletion
      const users = await userService.getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar el usuario");
    }
  };

  const handleCreateUser = async (userData: { username: string; email: string; password: string; first_name: string }) => {
    try {
      await userService.createUser(userData);
      setIsCreateModalOpen(false);
      // Reload users after creation
      const users = await userService.getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error al crear el usuario");
    }
  };

  // Check if user is admin (you can adjust this logic based on your needs)
  const isAdmin = currentUser?.username === 'oscar' || currentUser?.email?.includes('nezuecuador.com');

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <WelcomeHeader userName={userName} />

      {/* User Profile Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Mi Perfil</h2>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <UserCircle className="w-12 h-12" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                  {currentUser?.first_name || currentUser?.username || 'Usuario'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">@{currentUser?.username}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{currentUser?.email}</span>
                </div>
                
                {isAdmin && (
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Administrador</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Section - Only visible to admins */}
      {isAdmin && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Gestión de Usuarios</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              Admin
            </span>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Sincronizar con Home Assistant</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 max-w-md">
                  Importa los usuarios configurados en tu instancia de Home Assistant. 
                  Se crearán cuentas locales para cada persona encontrada.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg mb-4 w-fit">
                  <span>⚠️ Contraseña por defecto: <strong>Nezu123!</strong></span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <button
              onClick={handleSyncUsers}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Usuarios'}
            </button>

            {syncResult && (
              <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                <p className="font-medium">¡Sincronización completada!</p>
                <p className="text-sm">{syncResult.message}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* User List - Only visible to admins */}
      {isAdmin && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Todos los Usuarios</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {allUsers.length}
              </span>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Crear Usuario
            </button>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Correo Electrónico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <UserCircle className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {user.first_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(user.username === 'oscar' || user.email?.includes('nezuecuador.com')) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Usuario
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { PREDEFINED_WALLPAPERS, RECOMMENDED_DIMENSIONS } from "../../core/constants/wallpapers";
import { authService } from "../../auth/services/authService";
import { Upload, Check } from "lucide-react";
import api from "../../core/services/api";

export function WallpaperSelector() {
  const [currentWallpaper, setCurrentWallpaper] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const loadWallpaper = async () => {
      try {
        const user = await authService.me();
        setCurrentWallpaper(user.wallpaper || 'default');
      } catch (error) {
        console.error("Error loading wallpaper:", error);
      }
    };
    loadWallpaper();
  }, []);

  const handleSelectPredefined = async (wallpaperId: string) => {
    try {
      await authService.updateProfile({ wallpaper: wallpaperId });
      setCurrentWallpaper(wallpaperId);
      window.location.reload(); // Reload to apply new wallpaper
    } catch (error) {
      console.error("Error updating wallpaper:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > RECOMMENDED_DIMENSIONS.maxSize * 1024 * 1024) {
      alert(`La imagen es demasiado grande. Máximo ${RECOMMENDED_DIMENSIONS.maxSize}MB`);
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Formato no válido. Use JPG, PNG o WebP');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('wallpaper', file);

      const response = await api.post('/auth/upload-wallpaper/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCurrentWallpaper(response.data.wallpaper);
      window.location.reload(); // Reload to apply new wallpaper
    } catch (error: any) {
      console.error("Error uploading wallpaper:", error);
      alert(error.response?.data?.error || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Fondo de Pantalla</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Elige un fondo predefinido o sube tu propia imagen
        </p>
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg w-fit">
          <span>💡 Dimensiones recomendadas: {RECOMMENDED_DIMENSIONS.width}x{RECOMMENDED_DIMENSIONS.height} ({RECOMMENDED_DIMENSIONS.aspectRatio})</span>
        </div>
      </div>

      {/* Predefined Wallpapers */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Fondos Predefinidos</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PREDEFINED_WALLPAPERS.map((wallpaper) => (
            <button
              key={wallpaper.id}
              onClick={() => handleSelectPredefined(wallpaper.id)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                currentWallpaper === wallpaper.id
                  ? 'border-blue-500 ring-2 ring-blue-500/50'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <div
                className="w-full h-full"
                style={{ background: wallpaper.preview }}
              />
              {currentWallpaper === wallpaper.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-2 py-1">
                <p className="text-xs text-white font-medium truncate">{wallpaper.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Upload */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Subir Imagen Personalizada</h4>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {isUploading ? 'Subiendo...' : 'Seleccionar Imagen'}
          </span>
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Formatos: JPG, PNG, WebP • Tamaño máximo: {RECOMMENDED_DIMENSIONS.maxSize}MB
        </p>
      </div>
    </div>
  );
}

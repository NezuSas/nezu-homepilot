"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "../../core/utils/cn";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  details?: string;
  onClose: () => void;
}

export function Toast({ message, type = "success", details, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: "border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/20",
    error: "border-red-500/20 bg-red-50 dark:bg-red-900/20",
    info: "border-blue-500/20 bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-md rounded-xl border-2 p-4 shadow-2xl backdrop-blur-xl",
        "animate-in slide-in-from-top-5 fade-in duration-300",
        colors[type]
      )}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">{message}</p>
          {details && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{details}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

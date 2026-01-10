"use client";

import {
  Home,
  Settings,
  Smartphone,
  Users,
  LogOut,
  Moon,
  Sun,
  PlayCircle,
  Menu,
  X,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "../../core/utils/cn";
import { authService } from "../../auth/services/authService";
import * as React from "react";

import { Logo } from "../../core/components/Logo";
import { AnimatedBackground } from "../../core/components/AnimatedBackground";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    const initTheme = async () => {
      // 1. Check local storage first (fastest)
      const localTheme = localStorage.getItem("theme");
      if (localTheme === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }

      // 2. Check backend user preference
      try {
        const user = await authService.me();
        if (user.theme_preference) {
          const isDarkPref = user.theme_preference === 'dark';
          setIsDark(isDarkPref);
          if (isDarkPref) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
          } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
          }
        }
      } catch (error) {
        console.error("Failed to sync theme preference:", error);
      }
    };
    initTheme();
  }, []);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Save to backend
    try {
      await authService.updateProfile({ 
        theme_preference: newTheme ? 'dark' : 'light' 
      });
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const navItems = [
    { icon: Home, label: "Inicio", href: "/dashboard" },
    { icon: Smartphone, label: "Dispositivos", href: "/devices" },
    { icon: LayoutGrid, label: "Habitaciones", href: "/rooms" },
    { icon: PlayCircle, label: "Rutinas", href: "/routines" },
    { icon: Users, label: "Usuarios", href: "/users" },
    { icon: Settings, label: "Configuración", href: "/settings" },
  ];

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  // Touch handling for swipe
  const touchStart = React.useRef<number | null>(null);
  const touchEnd = React.useRef<number | null>(null);

  // Mouse handling for drag
  const mouseStart = React.useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && !isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
    if (isRightSwipe && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    mouseStart.current = e.clientX;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!mouseStart.current) return;
    const distance = mouseStart.current - e.clientX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && !isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
    if (isRightSwipe && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
    mouseStart.current = null;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors relative">
      <AnimatedBackground />
      {/* Sidebar Desktop */}
      <aside
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        className={cn(
          "hidden md:flex flex-col bg-white/15 dark:bg-slate-900/15 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 h-screen sticky top-0 transition-all duration-300 select-none",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center gap-3">
          <Logo className={cn("transition-all duration-300", isSidebarCollapsed ? "h-8 w-8" : "h-10")} />
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-10 group"
          aria-label={isSidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <div className="absolute inset-0 rounded-lg bg-slate-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <svg
            className="w-4 h-4 text-slate-600 dark:text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white",
                  isSidebarCollapsed && "justify-center"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors",
              isSidebarCollapsed && "justify-center"
            )}
            title={
              isSidebarCollapsed
                ? isDark
                  ? "Tema Claro"
                  : "Tema Oscuro"
                : undefined
            }
          >
            {isDark ? (
              <Sun className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Moon className="h-5 w-5 flex-shrink-0" />
            )}
            {!isSidebarCollapsed && (isDark ? "Tema Claro" : "Tema Oscuro")}
          </button>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors",
              isSidebarCollapsed && "justify-center"
            )}
            title={isSidebarCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isSidebarCollapsed && "Cerrar Sesión"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 flex justify-around px-1 py-2 z-50 shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-1 min-w-0 flex-1",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-full px-0.5 leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "../../core/components/Button";
import { Card } from "../../core/components/Card";
import { useTheme } from "../../core/providers/ThemeProvider";

interface WelcomeHeaderProps {
  userName?: string;
}

export function WelcomeHeader({ userName = "Usuario" }: WelcomeHeaderProps) {
  const { activeTheme } = useTheme();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(true);
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const hours = new Date().getHours();
  
  let greeting = "Buenos días";
  if (hours >= 12) greeting = "Buenas tardes";
  if (hours >= 19) greeting = "Buenas noches";

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (hasUnread) setHasUnread(false);
  };

  return (
    <header className="flex items-center justify-between py-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{greeting}, {userName}</h1>
        <p className="text-slate-500 dark:text-slate-400">Bienvenido a tu hogar inteligente</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={notificationRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full w-10 h-10 p-0 relative"
            onClick={toggleNotifications}
          >
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            {hasUnread && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] md:w-80 z-50 -mr-14 md:mr-0">
              <Card className="p-4 shadow-xl border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
                <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Notificaciones</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm border border-blue-100 dark:border-blue-800/30">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-blue-900 dark:text-blue-100">Bienvenido</p>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400">Ahora</span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">NEZU S.A.S les da la bienvenida.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
        
        <div className="relative">
          {activeTheme !== 'none' && (
            <div className="absolute -top-4 -right-1 text-2xl z-10 filter drop-shadow-md transform -rotate-12 animate-bounce-slow">
              {activeTheme === 'christmas' && '🎅'}
              {activeTheme === 'halloween' && '🧙'}
              {activeTheme === 'spring' && '🌸'}
              {activeTheme === 'summer' && '🏖️'}
              {activeTheme === 'autumn' && '🍁'}
              {activeTheme === 'newyear' && '🎉'}
              {activeTheme === 'valentine' && '💕'}
            </div>
          )}
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm">
            {userName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}

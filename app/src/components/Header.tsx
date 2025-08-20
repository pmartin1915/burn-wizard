import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun,
  Download,
  Menu
} from 'lucide-react';
import { useWizardStore } from '@/store/useWizardStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onNavigateToSettings?: () => void;
  onToggleMobileSidebar?: () => void;
  className?: string;
}

// Define BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Header({ sidebarCollapsed: _sidebarCollapsed, onNavigateToSettings, onToggleMobileSidebar, className }: HeaderProps) {
  const { settings, updateSettings } = useWizardStore();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);

  // Handle online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle PWA install prompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const goToSettings = () => {
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  return (
    <header className={cn(
      'sticky top-0 z-30 medical-header border-b',
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* App Title */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger menu - only visible on mobile */}
          {onToggleMobileSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobileSidebar}
              className="lg:hidden focus-ring touch-target"
              title="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* App icon and title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-10 h-10 wizard-logo-flame cursor-pointer"
                style={{ 
                  imageRendering: 'pixelated',
                  imageRendering: '-moz-crisp-edges',
                  imageRendering: 'crisp-edges'
                }}
                title="Burn Wizard"
              />
              <div className="absolute -inset-1 bg-primary/10 rounded-full -z-10 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <div>
              <h1 className="burn-wizard-heading-md text-primary hover:text-primary/80 transition-colors duration-200">
                Burn Wizard
              </h1>
              <p className="burn-wizard-body-sm hidden sm:block">
                Educational burn assessment tool
              </p>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Indicator */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Offline</span>
              </div>
            )}
          </div>

          {/* Install App Button */}
          {installPrompt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInstallClick}
              className="hidden sm:flex burn-wizard-secondary-button focus-ring touch-target"
            >
              <Download className="h-4 w-4 mr-1" />
              Install App
            </Button>
          )}

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            title={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="focus-ring touch-target"
          >
            {settings.darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToSettings}
            title="Open settings"
            className="focus-ring touch-target"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
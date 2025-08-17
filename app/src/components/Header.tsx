import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun,
  Download
} from 'lucide-react';
import { useWizardStore } from '@/store/useWizardStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarCollapsed: boolean;
  className?: string;
}

export default function Header({ sidebarCollapsed, className }: HeaderProps) {
  const { settings, updateSettings } = useWizardStore();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);

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
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
    // This would trigger navigation to settings
    // For now, we'll just show it's available
    console.log('Navigate to settings');
  };

  return (
    <header className={cn(
      'sticky top-0 z-30 bg-background border-b border-border',
      'transition-all duration-300 ease-in-out',
      // Adjust left margin based on sidebar state
      'lg:ml-0',
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* App Title */}
        <div className="flex items-center gap-4">
          {/* Title adjusts based on sidebar collapse state */}
          <div>
            <h1 className="text-xl font-bold">Burn Wizard</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Educational burn assessment tool
            </p>
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
              className="hidden sm:flex"
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
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
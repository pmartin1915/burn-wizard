import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWizardStore } from './store/useWizardStore';
import { SafetyBanner } from './core/safety';
import Home from './routes/Home';
import Review from './routes/Review';
import Settings from './routes/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { enabled: false }, // Disable network queries for offline-first
  },
});

type Route = 'home' | 'review' | 'settings';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const { settings } = useWizardStore();

  React.useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const renderRoute = () => {
    switch (currentRoute) {
      case 'home':
        return <Home onNavigate={setCurrentRoute} />;
      case 'review':
        return <Review onNavigate={setCurrentRoute} />;
      case 'settings':
        return <Settings onNavigate={setCurrentRoute} />;
      default:
        return <Home onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <SafetyBanner />
        
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Burn Wizard</h1>
                <p className="text-sm text-muted-foreground">Clinical tool for burn assessment and fluid management</p>
              </div>
              
              <nav className="flex gap-2">
                <button
                  onClick={() => setCurrentRoute('home')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentRoute === 'home' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Assessment
                </button>
                <button
                  onClick={() => setCurrentRoute('review')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentRoute === 'review' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Review
                </button>
                <button
                  onClick={() => setCurrentRoute('settings')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentRoute === 'settings' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {renderRoute()}
        </main>

        {/* Footer */}
        <footer className="border-t bg-card mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Burn Wizard v0.1.0 - Educational Tool Only</p>
            <p className="mt-1">Always verify calculations with institutional protocols and clinical judgment</p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWizardStore } from './store/useWizardStore';
import { SafetyBanner } from './core/safety';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './routes/Home';
import Review from './routes/Review';
import Settings from './routes/Settings';
import DressingGuide from './components/DressingGuide';
import AnalgesiaTips from './components/AnalgesiaTips';
import NotePreview from './components/NotePreview';
import { cn } from './lib/utils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { enabled: false }, // Disable network queries for offline-first
  },
});

type TabRoute = 'tbsa' | 'procedure' | 'discharge' | 'history';

function App() {
  const [currentTab, setCurrentTab] = useState<TabRoute>('tbsa');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { settings } = useWizardStore();

  React.useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'tbsa':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Home onNavigate={() => {}} />
            </div>
          </div>
        );
      case 'procedure':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Procedure Documentation</h2>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <Review onNavigate={() => {}} />
                <DressingGuide />
                <AnalgesiaTips />
              </div>
              <div>
                <NotePreview />
              </div>
            </div>
          </div>
        );
      case 'discharge':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Discharge Planning</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <DressingGuide />
                <AnalgesiaTips />
              </div>
              <div>
                <NotePreview />
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings & History</h2>
            <Settings onNavigate={() => {}} />
          </div>
        );
      default:
        return <Home onNavigate={() => {}} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <SafetyBanner />
        
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileOpen={mobileSidebarOpen}
          onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Main Layout */}
        <div className={cn(
          'min-h-screen transition-all duration-300 ease-in-out',
          // Adjust layout based on sidebar state
          'lg:ml-0',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}>
          {/* Header */}
          <Header 
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Main Content */}
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {renderTabContent()}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-card/50 mt-12">
            <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
              <p>Burn Wizard v0.1.0 - Educational Tool Only</p>
              <p className="mt-1">Always verify calculations with institutional protocols and clinical judgment</p>
            </div>
          </footer>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWizardStore } from './store/useWizardStore';
import { SafetyBanner } from './core/safety';
import { initializeSecurity } from './core/security-simple';
import { sessionManager } from './core/sessionManager';
import { getEncryptionStatus } from './core/encryption-simple';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './routes/Home';
import Review from './routes/Review';
import Settings from './routes/Settings';
import DressingGuide from './components/DressingGuide';
import AnalgesiaTips from './components/AnalgesiaTips';
import NotePreview from './components/NotePreview';
import ClinicalScenarios from './components/ClinicalScenarios';
import InteractiveTutorial from './components/InteractiveTutorial';
import { cn } from './lib/utils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { enabled: false }, // Disable network queries for offline-first
  },
});

type TabRoute = 'tbsa' | 'scenarios' | 'tutorials' | 'procedure' | 'discharge' | 'history' | 'settings';

function App() {
  const [currentTab, setCurrentTab] = useState<TabRoute>('tbsa');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { settings } = useWizardStore();

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Initialize security and encryption systems on app start
  useEffect(() => {
    const initSecurity = async () => {
      try {
        // Initialize basic security
        await initializeSecurity();
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Security system initialized successfully');
        }
        
        // Initialize session management (includes encryption)
        const sessionStarted = await sessionManager.startSession();
        if (sessionStarted) {
          const encryptionStatus = getEncryptionStatus();
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔒 Session started with encryption: ${encryptionStatus.available ? 'enabled' : 'disabled'}`);
          }
        }
      } catch (error) {
        console.error('❌ Security initialization failed:', error);
      }
    };
    
    initSecurity();
    
    // Cleanup on unmount
    return () => {
      sessionManager.endSession('manual');
    };
  }, []);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'tbsa':
        return (
          <div className="space-y-6">
            <Home onNavigate={() => {}} />
          </div>
        );
      case 'scenarios':
        return (
          <div className="space-y-6">
            <ClinicalScenarios />
          </div>
        );
      case 'tutorials':
        return null; // Content is now handled in the main content area
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
            <h2 className="text-2xl font-bold">Patient History</h2>
            <p className="text-muted-foreground">Previous assessments and patient records will be displayed here.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <Settings onNavigate={(route) => setCurrentTab(route)} />
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
          onTabChange={(tab) => setCurrentTab(tab as TabRoute)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileOpen={mobileSidebarOpen}
          onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Main Layout */}
        <div className={cn(
          'transition-all duration-300 ease-in-out',
          // Adjust layout based on sidebar state (fixed sidebar on desktop only)
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}>
          {/* Header */}
          <Header 
            sidebarCollapsed={sidebarCollapsed}
            onNavigateToSettings={() => setCurrentTab('settings')}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          {/* Main Content */}
          <main className="content-section min-h-[calc(100vh-theme(spacing.16))] pb-24">
            <div className="max-w-7xl mx-auto">
              <div className="tab-content-enter prose-spacing">
                {renderTabContent()}
              </div>
              
              {/* Interactive Tutorials Section */}
              {currentTab === 'tutorials' && (
                <div className="mt-8">
                  <InteractiveTutorial onNavigate={(tab) => setCurrentTab(tab as TabRoute)} />
                </div>
              )}
              
              {/* Interactive Tutorials for other tabs - constrained to match reference width */}
              {currentTab !== 'tutorials' && (
                <div className="mt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div></div>
                    <div className="max-w-md">
                      <InteractiveTutorial className="max-w-none" onNavigate={(tab) => setCurrentTab(tab as TabRoute)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-card/50 mt-auto">
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
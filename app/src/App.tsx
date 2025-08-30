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
import Tutorials from './routes/Tutorials';
import DressingGuide from './components/DressingGuide';
import AnalgesiaTips from './components/AnalgesiaTips';
import NotePreview from './components/NotePreview';
import ClinicalScenarios from './components/ClinicalScenarios';
import { GuidedTour } from './components/ui/GuidedTour';
import { TourErrorBoundary } from './components/ui/TourErrorBoundary';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { SaveStatusIndicator } from './components/ui/SaveStatusIndicator';
import { LiveAnnouncerProvider } from './components/ui/LiveAnnouncer';
import { SkipLinks } from './components/ui/SkipLinks';
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { useAutoSave } from './hooks/useAutoSave';
import { exportAssessment } from './utils/dataExport';
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
  const [showTour, setShowTour] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const store = useWizardStore();
  const { settings, markGuidedTourSeen } = store;

  // Auto-save functionality
  const { saveInfo, manualSave, hasUnsavedChanges } = useAutoSave({
    enabled: true,
    debounceDelay: 2000,
    periodicInterval: 30000,
    onSave: (success) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(success ? '✅ Auto-save successful' : '❌ Auto-save failed');
      }
    },
    onError: (error) => {
      console.error('💾 Auto-save error:', error);
    }
  });

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Initialize security and handle session recovery
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
            console.log('🔄 Session recovery: Store will be rehydrated from encrypted storage');
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

  const handleStartTour = () => {
    setShowTour(true);
  };

  const handleTourComplete = () => {
    markGuidedTourSeen();
    setShowTour(false);
  };

  const handleTourClose = () => {
    setShowTour(false);
  };

  const handleExportAssessment = (format: 'json' | 'csv' | 'txt' = 'json') => {
    try {
      exportAssessment(store, format, 'assessment-only');
      console.log(`📄 Assessment exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Global keyboard shortcuts for navigation
  useKeyboardShortcuts([
    {
      ...SHORTCUTS.NAVIGATE_TBSA,
      action: () => setCurrentTab('tbsa'),
    },
    {
      ...SHORTCUTS.NAVIGATE_SCENARIOS,
      action: () => setCurrentTab('scenarios'),
    },
    {
      ...SHORTCUTS.NAVIGATE_TUTORIALS,
      action: () => setCurrentTab('tutorials'),
    },
    {
      ...SHORTCUTS.NAVIGATE_PROCEDURE,
      action: () => setCurrentTab('procedure'),
    },
    {
      ...SHORTCUTS.NAVIGATE_DISCHARGE,
      action: () => setCurrentTab('discharge'),
    },
    {
      ...SHORTCUTS.NAVIGATE_HISTORY,
      action: () => setCurrentTab('history'),
    },
    {
      ...SHORTCUTS.NAVIGATE_SETTINGS,
      action: () => setCurrentTab('settings'),
    },
    {
      ...SHORTCUTS.SHOW_HELP,
      action: () => setShowKeyboardHelp(true),
    },
    {
      ...SHORTCUTS.SAVE,
      action: () => {
        manualSave();
        console.log('💾 Manual save triggered');
      },
    },
  ], {
    enabled: true,
    context: 'global',
  });

  const renderTabContent = () => {
    switch (currentTab) {
      case 'tbsa':
        return (
          <div className="space-y-6">
            <Home onNavigate={() => {}} onStartTour={handleStartTour} />
          </div>
        );
      case 'scenarios':
        return (
          <div className="space-y-6">
            <ClinicalScenarios />
          </div>
        );
      case 'tutorials':
        return <Tutorials onNavigate={(tab) => setCurrentTab(tab as TabRoute)} onStartTour={handleStartTour} />;
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
      <LiveAnnouncerProvider>
        <div className="min-h-screen bg-background text-foreground">
        <SkipLinks />
        <SafetyBanner />
        
        {/* Sidebar Navigation */}
        <Sidebar
          id="navigation"
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
            saveInfo={saveInfo}
            onManualSave={manualSave}
            onExportAssessment={handleExportAssessment}
          />

          {/* Main Content */}
          <main 
            id="main-content"
            className="content-section min-h-[calc(100vh-theme(spacing.16))] pb-24"
            role="main"
            aria-label="Burn assessment application content"
            tabIndex={-1}
          >
            <div className="max-w-7xl mx-auto">
              <div className="tab-content-enter prose-spacing">
                {renderTabContent()}
              </div>
              
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

        {/* Guided Tour - Global component that persists across tabs */}
        <TourErrorBoundary onError={handleTourClose}>
          <GuidedTour 
            isOpen={showTour}
            onClose={handleTourClose}
            onComplete={handleTourComplete}
            onNavigate={(tab) => setCurrentTab(tab as TabRoute)}
          />
        </TourErrorBoundary>

        {/* Keyboard Shortcuts Help Modal */}
        <KeyboardShortcutsModal 
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />

      </div>
      </LiveAnnouncerProvider>
    </QueryClientProvider>
  );
}

export default App;

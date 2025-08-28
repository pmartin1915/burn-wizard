import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Calculator, 
  FileText, 
  GraduationCap, 
  History, 
  Settings,
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'tbsa',
    label: 'TBSA Assessment',
    icon: Calculator,
    description: 'Body map and burn percentage calculation'
  },
  {
    id: 'scenarios',
    label: 'Clinical Scenarios',
    icon: GraduationCap,
    description: 'Practice with realistic training cases'
  },
  {
    id: 'tutorials',
    label: 'Interactive Tutorials',
    icon: BookOpen,
    description: 'Step-by-step guided learning experience'
  },
  {
    id: 'procedure',
    label: 'Procedure Note',
    icon: FileText,
    description: 'Burn care procedure documentation'
  },
  {
    id: 'discharge',
    label: 'Discharge Teaching',
    icon: GraduationCap,
    description: 'Patient education and home care'
  },
  {
    id: 'history',
    label: 'Patient History',
    icon: History,
    description: 'Previous assessments and notes'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Security, preferences, and configuration'
  }
];

export default function Sidebar({
  currentTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onToggleMobile,
  className
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        // Always fixed positioning to avoid layout flow issues
        'fixed left-0 top-0 h-full bg-card/95 backdrop-blur-md border-r border-border z-50 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none',
        // Desktop visibility and width
        'lg:translate-x-0',
        isCollapsed ? 'w-20' : 'w-64',
        // Mobile behavior
        'lg:block',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <h2 className="burn-wizard-heading-sm">Navigation</h2>
            )}
            
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMobile}
              className="lg:hidden focus-ring touch-target"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden lg:flex focus-ring touch-target"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    // Close mobile sidebar when item is selected
                    if (isMobileOpen) {
                      onToggleMobile();
                    }
                  }}
                  data-tab={item.id}
                  data-tour={item.id === 'scenarios' ? 'scenarios' : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left touch-target',
                    'transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:translate-x-1 hover:shadow-sm',
                    'focus-ring animate-scale-in',
                    'active:scale-95 active:translate-x-0',
                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md translate-x-1',
                    isCollapsed && 'justify-center px-2 hover:translate-x-0'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  )} />
                  
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={cn(
                        'text-xs',
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {!isCollapsed && (
              <Card className="p-3">
                <div className="text-xs text-center text-muted-foreground">
                  <div className="font-medium text-foreground mb-1">Educational Tool</div>
                  <div>Always verify with institutional protocols</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMobile}
        className="fixed top-4 left-4 z-40 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}
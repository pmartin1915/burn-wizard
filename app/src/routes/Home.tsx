import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, X } from 'lucide-react';
import { useWizardStore } from '@/store/useWizardStore';
import InputForm from '@/components/InputForm';
import BodyMap from '@/components/BodyMap';
import BurnDepthChart from '@/components/BurnDepthChart';
import FluidCalculationTimeline from '@/components/FluidCalculationTimeline';
import BodyRegionHeatMap from '@/components/BodyRegionHeatMap';

interface HomeProps {
  onNavigate: (route: 'home' | 'review' | 'settings' | 'tutorials') => void;
  onStartTour: () => void;
}

export default function Home({ onNavigate, onStartTour }: HomeProps) {
  const { tutorials, markGuidedTourSeen } = useWizardStore();
  const [showWelcome, setShowWelcome] = React.useState(!tutorials.hasSeenGuidedTour);

  const dismissWelcome = () => {
    setShowWelcome(false);
    markGuidedTourSeen();
  };

  return (
    <div className="mobile-section-spacing">
      {/* Page Header with Context - Mobile Optimized */}
      <div className="mobile-card animate-fade-in-up float-subtle">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl">🔥</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="mobile-title text-primary mb-2">Burn Assessment Wizard</h1>
            <p className="mobile-body">
              Complete the patient information and select affected body regions to calculate TBSA and generate a comprehensive burn management plan.
            </p>
          </div>
        </div>
      </div>

      {/* First-Time User Welcome Banner - Mobile Optimized */}
      {showWelcome && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 animate-fade-in-up mobile-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mobile-subtitle text-blue-900 dark:text-blue-100 mb-2">
                    👋 Welcome to Burn Wizard!
                  </h3>
                  <p className="mobile-body text-blue-800 dark:text-blue-200 mb-4">
                    New to burn assessment? Start with our <strong>Getting Started Tutorial</strong> to learn how to navigate the interface, 
                    use the body map, and calculate TBSA in just 5 minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button 
                      onClick={onStartTour} 
                      className="mobile-button-primary bg-blue-600 hover:bg-blue-700 text-white touch-feedback"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Tutorial (5 min)
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={dismissWelcome} 
                      className="mobile-button-secondary touch-feedback-subtle"
                    >
                      I'll explore on my own
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissWelcome}
                className="touch-target text-blue-600 hover:text-blue-700 dark:text-blue-300 touch-feedback-subtle self-start sm:self-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Assessment Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2 mobile-component-spacing">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="animate-fade-in-up animate-stagger-1" data-element="patient-info">
              <InputForm onReviewClick={() => onNavigate('review')} />
            </div>
            <div className="animate-fade-in-up animate-stagger-2" data-element="body-map">
              <BodyMap />
            </div>
          </div>
        </div>
        
        {/* Data Visualization Sidebar - Mobile: Below main content */}
        <div className="mobile-component-spacing lg:space-y-6">
          <div className="animate-fade-in-up animate-stagger-3">
            <BurnDepthChart />
          </div>
          <div className="animate-fade-in-up animate-stagger-3">
            <FluidCalculationTimeline />
          </div>
          <div className="animate-fade-in-up animate-stagger-4">
            <BodyRegionHeatMap />
          </div>
        </div>
      </div>
    </div>
  );
}

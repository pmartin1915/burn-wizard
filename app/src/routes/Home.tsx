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
    <div className="space-y-8">
      {/* Page Header with Context */}
      <div className="burn-wizard-card-primary rounded-card p-6 animate-fade-in-up float-subtle">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h1 className="burn-wizard-heading-lg text-primary mb-2">Burn Assessment Wizard</h1>
            <p className="burn-wizard-body-sm max-w-2xl">
              Complete the patient information and select affected body regions to calculate TBSA and generate a comprehensive burn management plan.
            </p>
          </div>
        </div>
      </div>

      {/* First-Time User Welcome Banner */}
      {showWelcome && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    👋 Welcome to Burn Wizard!
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 mb-4 max-w-2xl">
                    New to burn assessment? Start with our <strong>Getting Started Tutorial</strong> to learn how to navigate the interface, 
                    use the body map, and calculate TBSA in just 5 minutes.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button onClick={onStartTour} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Start Tutorial (5 min)
                    </Button>
                    <Button variant="outline" onClick={dismissWelcome} size="sm">
                      I'll explore on my own
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissWelcome}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Assessment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-fade-in-up animate-stagger-1" data-element="patient-info">
              <InputForm onReviewClick={() => onNavigate('review')} />
            </div>
            <div className="animate-fade-in-up animate-stagger-2" data-element="body-map">
              <BodyMap />
            </div>
          </div>
        </div>
        
        {/* Data Visualization Sidebar */}
        <div className="space-y-6">
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

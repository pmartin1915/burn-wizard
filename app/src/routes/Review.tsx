import React from 'react';
import { Button } from '@/components/ui/button';
import FluidPlan from '@/components/FluidPlan';

interface ReviewProps {
  onNavigate: (route: 'home' | 'review' | 'settings') => void;
}

export default function Review({ onNavigate }: ReviewProps) {
  return (
    <div className="space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 animate-fade-in-up">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('home')}
          className="burn-wizard-secondary-button focus-ring touch-target self-start"
        >
          ← Back to Assessment
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-sm">✓</span>
          </div>
          <h1 className="burn-wizard-heading-lg text-primary">Burn Management Plan</h1>
        </div>
      </div>
      
      {/* Success Indicator */}
      <div className="burn-wizard-card status-safe rounded-card p-4 animate-fade-in-up animate-stagger-1">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <div>
            <p className="burn-wizard-body font-medium text-green-800">Assessment Complete</p>
            <p className="burn-wizard-body-sm text-green-700">Review your burn management recommendations below</p>
          </div>
        </div>
      </div>
      
      {/* Management Plan Content */}
      <div className="animate-fade-in-up animate-stagger-2">
        <FluidPlan />
      </div>
    </div>
  );
}
import React from 'react';
import InputForm from '@/components/InputForm';
import BodyMap from '@/components/BodyMap';
import BurnDepthChart from '@/components/BurnDepthChart';
import FluidCalculationTimeline from '@/components/FluidCalculationTimeline';
import BodyRegionHeatMap from '@/components/BodyRegionHeatMap';

interface HomeProps {
  onNavigate: (route: 'home' | 'review' | 'settings') => void;
}

export default function Home({ onNavigate }: HomeProps) {
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

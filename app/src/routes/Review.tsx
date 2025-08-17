import React from 'react';
import { Button } from '@/components/ui/button';
import FluidPlan from '@/components/FluidPlan';

interface ReviewProps {
  onNavigate: (route: 'home' | 'review' | 'settings') => void;
}

export default function Review({ onNavigate }: ReviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => onNavigate('home')}>
          ← Back to Assessment
        </Button>
        <h1 className="text-2xl font-bold">Burn Management Plan</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <FluidPlan />
      </div>
    </div>
  );
}
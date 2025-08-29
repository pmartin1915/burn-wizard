import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play } from 'lucide-react';

interface TutorialsProps {
  onNavigate: (route: string) => void;
  onStartTour: () => void;
}

export default function Tutorials({ onNavigate: _onNavigate, onStartTour }: TutorialsProps) {

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="burn-wizard-card-primary rounded-card p-6 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-2xl" />
          </div>
          <div>
            <h1 className="burn-wizard-heading-lg text-primary mb-2">Interactive Tutorials</h1>
            <p className="burn-wizard-body-sm max-w-2xl">
              Learn how to use Burn Wizard with our guided tour. Perfect for new users or anyone wanting a quick refresher.
            </p>
          </div>
        </div>
      </div>

      {/* Guided Tour Card */}
      <Card className="burn-wizard-card animate-fade-in-up animate-stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-orange-600" />
            Getting Started with Burn Wizard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Take a guided tour through the essential features of Burn Wizard. You'll learn how to:
          </p>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
              Enter patient information for accurate calculations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
              Use the interactive body map to mark burn regions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
              Understand real-time TBSA calculations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
              Practice with clinical scenarios
            </li>
          </ul>

          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={onStartTour}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Guided Tour (5 min)
            </Button>
            <span className="text-xs text-muted-foreground">
              Interactive • User-paced • Can be skipped anytime
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="burn-wizard-card animate-fade-in-up animate-stagger-2">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Educational Tool Reminder</h3>
          <p className="text-sm text-muted-foreground">
            Burn Wizard is designed for educational purposes and training. Always verify calculations 
            with institutional protocols and clinical judgment. This tool should not replace proper 
            medical training or clinical decision-making.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

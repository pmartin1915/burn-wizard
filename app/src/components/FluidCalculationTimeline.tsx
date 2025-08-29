import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useWizardStore } from '@/store/useWizardStore';

interface TimelineStage {
  id: string;
  label: string;
  timeRange: string;
  percentage: number;
  status: 'completed' | 'active' | 'pending';
  fluidAmount?: number;
  description: string;
}

export function FluidCalculationTimeline() {
  const { fluidResult } = useWizardStore();

  const stages: TimelineStage[] = React.useMemo(() => {
    if (!fluidResult || !fluidResult.parkland.totalMl) {
      return [
        {
          id: 'assessment',
          label: 'Initial Assessment',
          timeRange: '0-1 hr',
          percentage: 0,
          status: 'pending',
          description: 'Complete patient information and TBSA calculation'
        },
        {
          id: 'first8',
          label: 'First 8 Hours',
          timeRange: '0-8 hrs',
          percentage: 0,
          status: 'pending',
          description: 'First half of 24-hour fluid requirement'
        },
        {
          id: 'second16',
          label: 'Next 16 Hours',
          timeRange: '8-24 hrs',
          percentage: 0,
          status: 'pending',
          description: 'Second half of 24-hour fluid requirement'
        }
      ];
    }

    const first8HrFluid = fluidResult.parkland.first8hMl;
    const second16HrFluid = fluidResult.parkland.next16hMl;

    return [
      {
        id: 'assessment',
        label: 'Assessment Complete',
        timeRange: '0-1 hr',
        percentage: 100,
        status: 'completed',
        description: 'Patient information and TBSA calculated'
      },
      {
        id: 'first8',
        label: 'First 8 Hours',
        timeRange: '0-8 hrs',
        percentage: 50,
        status: 'active',
        fluidAmount: first8HrFluid,
        description: 'Give half of 24-hour requirement rapidly'
      },
      {
        id: 'second16',
        label: 'Next 16 Hours',
        timeRange: '8-24 hrs',
        percentage: 25,
        status: 'pending',
        fluidAmount: second16HrFluid,
        description: 'Give remaining fluid at steady rate'
      }
    ];
  }, [fluidResult]);

  return (
    <Card className="burn-wizard-card animate-fade-in-up">
      <CardHeader>
        <CardTitle className="burn-wizard-heading-sm">Fluid Management Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div 
              key={stage.id}
              className={cn(
                "relative animate-slide-in-right",
                `animate-stagger-${Math.min(index + 1, 3)}`
              )}
            >
              {/* Connection line */}
              {index < stages.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-muted" />
              )}
              
              <div className="flex items-start gap-4">
                {/* Status indicator */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  stage.status === 'completed' ? "bg-green-100 border-green-500 text-green-700" :
                  stage.status === 'active' ? "bg-primary/10 border-primary text-primary" :
                  "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}>
                  {stage.status === 'completed' ? (
                    <span className="font-bold">✓</span>
                  ) : stage.status === 'active' ? (
                    <span className="font-bold">{index + 1}</span>
                  ) : (
                    <span className="font-bold">{index + 1}</span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="burn-wizard-body font-semibold">{stage.label}</h4>
                    <span className="burn-wizard-body-sm text-muted-foreground font-medium">
                      {stage.timeRange}
                    </span>
                  </div>
                  
                  <p className="burn-wizard-body-sm text-muted-foreground mb-3">
                    {stage.description}
                  </p>
                  
                  {stage.fluidAmount && (
                    <div className="bg-primary/5 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="burn-wizard-body-sm font-medium">Fluid Volume:</span>
                        <span className="burn-wizard-body font-bold text-primary">
                          {Math.round(stage.fluidAmount)} mL
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="burn-wizard-body-sm font-medium">Rate:</span>
                        <span className="burn-wizard-body-sm text-muted-foreground">
                          {stage.id === 'first8' 
                            ? `${Math.round(stage.fluidAmount / 8)} mL/hr`
                            : `${Math.round(stage.fluidAmount / 16)} mL/hr`
                          }
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        stage.status === 'completed' ? "bg-green-500" :
                        stage.status === 'active' ? "bg-primary" :
                        "bg-muted-foreground/30"
                      )}
                      style={{ 
                        width: `${stage.status === 'pending' ? 0 : stage.percentage}%`,
                        boxShadow: stage.status !== 'pending' ? '0 0 8px currentColor' : 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Summary */}
          {fluidResult && (
            <div className="pt-4 border-t border-border animate-fade-in-up animate-stagger-3">
              <div className="bg-gradient-surface rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="burn-wizard-body font-semibold">Total 24-Hour Fluid</span>
                  <span className="data-metric-small text-primary">
                    {Math.round(fluidResult.parkland.totalMl)} mL
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="burn-wizard-body-sm text-muted-foreground">First 8 hrs</div>
                    <div className="burn-wizard-body font-bold text-primary">
                      {Math.round(fluidResult.parkland.first8hMl)} mL
                    </div>
                  </div>
                  <div>
                    <div className="burn-wizard-body-sm text-muted-foreground">Next 16 hrs</div>
                    <div className="burn-wizard-body font-bold text-primary">
                      {Math.round(fluidResult.parkland.next16hMl)} mL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FluidCalculationTimeline;
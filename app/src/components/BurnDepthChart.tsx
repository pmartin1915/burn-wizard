import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useWizardStore } from '@/store/useWizardStore';
import { getBurnDepthInfo } from '@/constants/burnDepth';
import type { BurnDepth } from '@/domain/types';

interface DepthData {
  depth: BurnDepth;
  count: number;
  percentage: number;
  color: string;
  name: string;
}

export function BurnDepthChart() {
  const { regionSelections } = useWizardStore();
  
  const depthData = React.useMemo(() => {
    const depths: Record<BurnDepth, number> = {
      'superficial': 0,
      'superficial-partial': 0, 
      'deep-partial': 0,
      'full-thickness': 0
    };
    
    const totalSelections = regionSelections.filter(s => s.fraction > 0).length;
    
    regionSelections
      .filter(s => s.fraction > 0)
      .forEach(selection => {
        if (selection.depth) {
          depths[selection.depth]++;
        }
      });

    const data: DepthData[] = Object.entries(depths).map(([depth, count]) => {
      const depthInfo = getBurnDepthInfo(depth as BurnDepth);
      return {
        depth: depth as BurnDepth,
        count,
        percentage: totalSelections > 0 ? (count / totalSelections) * 100 : 0,
        color: depthInfo.color,
        name: depthInfo.name
      };
    }).filter(item => item.count > 0);

    return data;
  }, [regionSelections]);

  if (depthData.length === 0) {
    return (
      <Card className="burn-wizard-card animate-fade-in-up">
        <CardHeader>
          <CardTitle className="burn-wizard-heading-sm">Burn Depth Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">📊</span>
            </div>
            <p className="burn-wizard-body-sm">Select burn regions to see depth distribution</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...depthData.map(d => d.count));

  return (
    <Card className="burn-wizard-card animate-fade-in-up">
      <CardHeader>
        <CardTitle className="burn-wizard-heading-sm">Burn Depth Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {depthData.map((item, index) => (
            <div 
              key={item.depth} 
              className={cn(
                "animate-slide-in-right",
                `animate-stagger-${Math.min(index + 1, 3)}`
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="burn-wizard-body font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="burn-wizard-body-sm font-bold text-primary">
                    {item.count} region{item.count !== 1 ? 's' : ''}
                  </span>
                  <div className="burn-wizard-body-sm text-muted-foreground">
                    {Math.round(item.percentage)}%
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${(item.count / maxCount) * 100}%`,
                    boxShadow: `0 0 8px ${item.color}40`
                  }}
                />
              </div>
            </div>
          ))}
          
          {/* Summary */}
          <div className="pt-4 border-t border-border animate-fade-in-up animate-stagger-3">
            <div className="flex justify-between items-center">
              <span className="burn-wizard-body-sm font-medium">Total Affected Regions</span>
              <span className="burn-wizard-body font-bold text-primary">
                {depthData.reduce((sum, item) => sum + item.count, 0)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BurnDepthChart;
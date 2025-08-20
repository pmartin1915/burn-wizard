import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useWizardStore } from '@/store/useWizardStore';
import { getBurnDepthInfo } from '@/constants/burnDepth';
import type { RegionKey, BurnDepth } from '@/domain/types';

interface RegionHeatData {
  region: RegionKey;
  label: string;
  fraction: number;
  depth?: BurnDepth;
  intensity: number; // 0-1 for heat map intensity
  color: string;
}

const BODY_REGIONS: Array<{ key: RegionKey; label: string; group: string }> = [
  { key: 'Head', label: 'Head', group: 'Head & Neck' },
  { key: 'Neck', label: 'Neck', group: 'Head & Neck' },
  { key: 'Ant_Trunk', label: 'Chest', group: 'Trunk' },
  { key: 'Post_Trunk', label: 'Back', group: 'Trunk' },
  { key: 'R_U_Arm', label: 'R Upper Arm', group: 'Arms' },
  { key: 'L_U_Arm', label: 'L Upper Arm', group: 'Arms' },
  { key: 'R_L_Arm', label: 'R Lower Arm', group: 'Arms' },
  { key: 'L_L_Arm', label: 'L Lower Arm', group: 'Arms' },
  { key: 'R_Hand', label: 'R Hand', group: 'Hands' },
  { key: 'L_Hand', label: 'L Hand', group: 'Hands' },
  { key: 'R_Buttock', label: 'R Buttock', group: 'Lower Body' },
  { key: 'L_Buttock', label: 'L Buttock', group: 'Lower Body' },
  { key: 'R_Thigh', label: 'R Thigh', group: 'Legs' },
  { key: 'L_Thigh', label: 'L Thigh', group: 'Legs' },
  { key: 'R_Leg', label: 'R Leg', group: 'Legs' },
  { key: 'L_Leg', label: 'L Leg', group: 'Legs' },
  { key: 'R_Foot', label: 'R Foot', group: 'Feet' },
  { key: 'L_Foot', label: 'L Foot', group: 'Feet' },
];

export function BodyRegionHeatMap() {
  const { regionSelections } = useWizardStore();

  const heatData = React.useMemo(() => {
    const maxFraction = Math.max(...regionSelections.map(s => s.fraction), 0.01);
    
    // Severity scores for burn depths (higher = more severe)
    const depthSeverity: Record<BurnDepth, number> = {
      'superficial': 1,
      'superficial-partial': 2,
      'deep-partial': 3,
      'full-thickness': 4
    };
    
    const data: RegionHeatData[] = BODY_REGIONS.map(region => {
      const selection = regionSelections.find(s => s.region === region.key);
      const fraction = selection?.fraction || 0;
      const intensity = fraction / maxFraction;
      
      // Color based on burn depth
      let color = '#6B7280'; // gray for no burn
      if (selection?.depth) {
        const depthInfo = getBurnDepthInfo(selection.depth);
        color = depthInfo.color;
      } else if (fraction > 0) {
        // Default gradient based on intensity
        const red = Math.min(255, 100 + Math.round(intensity * 155));
        const green = Math.max(50, 200 - Math.round(intensity * 150));
        color = `rgb(${red}, ${green}, 50)`;
      }

      // Calculate combined score for sorting (severity * involvement)
      const severityScore = selection?.depth ? depthSeverity[selection.depth] : 0;
      const combinedScore = severityScore * fraction;

      return {
        region: region.key,
        label: region.label,
        fraction,
        depth: selection?.depth,
        intensity,
        color,
        combinedScore
      };
    }).filter(item => item.fraction > 0)
      .sort((a, b) => {
        // Primary sort by combined score (severity * involvement)
        if (b.combinedScore !== a.combinedScore) {
          return b.combinedScore - a.combinedScore;
        }
        // Secondary sort by fraction for ties
        return b.fraction - a.fraction;
      });

    return data;
  }, [regionSelections]);

  const groupedData = React.useMemo(() => {
    const groups = BODY_REGIONS.reduce((acc, region) => {
      if (!acc[region.group]) {
        acc[region.group] = [];
      }
      
      const heatItem = heatData.find(h => h.region === region.key);
      if (heatItem) {
        acc[region.group].push(heatItem);
      }
      
      return acc;
    }, {} as Record<string, RegionHeatData[]>);

    // Only return groups that have data
    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [heatData]);

  if (heatData.length === 0) {
    return (
      <Card className="burn-wizard-card animate-fade-in-up">
        <CardHeader>
          <CardTitle className="burn-wizard-heading-sm">Body Region Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">🔥</span>
            </div>
            <p className="burn-wizard-body-sm">Select burn regions to see heat map visualization</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="burn-wizard-card animate-fade-in-up">
      <CardHeader>
        <CardTitle className="burn-wizard-heading-sm">Body Region Heat Map</CardTitle>
        <p className="burn-wizard-body-sm text-muted-foreground">
          Regions ranked by burn severity and involvement
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {groupedData.map(([groupName, items], groupIndex) => (
            <div 
              key={groupName}
              className={cn(
                "animate-slide-in-right",
                `animate-stagger-${Math.min(groupIndex + 1, 3)}`
              )}
            >
              <h4 className="burn-wizard-body font-semibold text-primary mb-3">
                {groupName}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {items.map((item, _index) => (
                  <div 
                    key={item.region}
                    className="relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: `linear-gradient(90deg, ${item.color}20 0%, ${item.color}${Math.round(item.intensity * 40 + 10).toString(16)} ${item.fraction * 100}%, transparent ${item.fraction * 100 + 10}%)`,
                      borderColor: item.color + '40'
                    }}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full border shadow-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="burn-wizard-body font-medium">
                            {item.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="burn-wizard-body font-bold text-primary">
                            {Math.round(item.fraction * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {item.depth && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="burn-wizard-body-sm text-muted-foreground">
                            Depth:
                          </span>
                          <span className="burn-wizard-body-sm font-medium">
                            {getBurnDepthInfo(item.depth).name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Intensity overlay */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-10"
                      style={{
                        background: `radial-gradient(circle at center, ${item.color} 0%, transparent 70%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Heat Map Legend */}
          <div className="pt-4 border-t border-border animate-fade-in-up">
            <div className="space-y-3">
              <h4 className="burn-wizard-body-sm font-semibold">Heat Map Legend</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"/>
                  <span>25-50% involvement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600"/>
                  <span>75-100% involvement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BodyRegionHeatMap;

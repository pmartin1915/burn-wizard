import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/store/useWizardStore';
import { calcTbsa } from '@/domain/tbsa';
import type { RegionKey, BurnFraction } from '@/domain/types';

const BODY_REGIONS: Array<{ key: RegionKey; label: string }> = [
  { key: 'headAnterior', label: 'Head (Front)' },
  { key: 'headPosterior', label: 'Head (Back)' },
  { key: 'torsoAnterior', label: 'Chest' },
  { key: 'torsoPosterior', label: 'Back' },
  { key: 'armRightAnterior', label: 'R Arm (Front)' },
  { key: 'armLeftAnterior', label: 'L Arm (Front)' },
  { key: 'thighRightAnterior', label: 'R Thigh (Front)' },
  { key: 'thighLeftAnterior', label: 'L Thigh (Front)' },
  { key: 'legRightAnterior', label: 'R Leg (Front)' },
  { key: 'legLeftAnterior', label: 'L Leg (Front)' },
  { key: 'handRight', label: 'R Hand' },
  { key: 'handLeft', label: 'L Hand' },
  { key: 'footRight', label: 'R Foot' },
  { key: 'footLeft', label: 'L Foot' },
  { key: 'perineum', label: 'Perineum' },
];

const FRACTION_OPTIONS: BurnFraction[] = [0, 0.25, 0.5, 0.75, 1];

export default function BodyMap() {
  const { regionSelections, patientData, setRegionSelection } = useWizardStore();
  
  const currentTbsa = React.useMemo(() => {
    try {
      if (regionSelections.length > 0) {
        const result = calcTbsa(patientData.ageMonths, regionSelections);
        return result.tbsaPct;
      }
      return 0;
    } catch {
      return 0;
    }
  }, [patientData.ageMonths, regionSelections]);

  const getRegionFraction = (regionKey: RegionKey): BurnFraction => {
    const selection = regionSelections.find(s => s.region === regionKey);
    return selection?.fraction || 0;
  };

  const getButtonColor = (fraction: BurnFraction): string => {
    switch (fraction) {
      case 0: return 'bg-gray-100 text-gray-600 border-gray-300';
      case 0.25: return 'bg-yellow-200 text-yellow-800 border-yellow-400';
      case 0.5: return 'bg-orange-300 text-orange-800 border-orange-500';
      case 0.75: return 'bg-red-400 text-red-800 border-red-600';
      case 1: return 'bg-red-600 text-white border-red-800';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const handleRegionClick = (regionKey: RegionKey) => {
    const currentFraction = getRegionFraction(regionKey);
    const currentIndex = FRACTION_OPTIONS.indexOf(currentFraction);
    const nextIndex = (currentIndex + 1) % FRACTION_OPTIONS.length;
    const nextFraction = FRACTION_OPTIONS[nextIndex];
    
    setRegionSelection(regionKey, nextFraction);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Body Map</span>
          <span className="text-lg font-bold text-blue-600">
            TBSA: {currentTbsa}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>0%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
              <span>25%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-300 border border-orange-500 rounded"></div>
              <span>50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-400 border border-red-600 rounded"></div>
              <span>75%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-600 border border-red-800 rounded"></div>
              <span>100%</span>
            </div>
          </div>

          {/* Body Regions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {BODY_REGIONS.map((region) => {
              const fraction = getRegionFraction(region.key);
              const colorClass = getButtonColor(fraction);
              
              return (
                <button
                  key={region.key}
                  type="button"
                  onClick={() => handleRegionClick(region.key)}
                  className={`p-3 rounded-md border text-sm font-medium transition-colors hover:opacity-80 ${colorClass}`}
                  title={`${region.label}: ${Math.round(fraction * 100)}%`}
                  aria-label={`${region.label}: ${Math.round(fraction * 100)}% involvement`}
                >
                  <div className="text-center">
                    <div className="font-medium">{region.label}</div>
                    <div className="text-xs mt-1">{Math.round(fraction * 100)}%</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground text-center">
            Click regions to cycle through burn percentages (0% → 25% → 50% → 75% → 100%)
          </p>

          {/* Selected Regions List */}
          {regionSelections.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Regions:</h4>
              <div className="space-y-1 text-sm">
                {regionSelections
                  .filter(s => s.fraction > 0)
                  .map((selection) => {
                    const region = BODY_REGIONS.find(r => r.key === selection.region);
                    return (
                      <div key={selection.region} className="flex justify-between">
                        <span>{region?.label}</span>
                        <span className="font-medium">{Math.round(selection.fraction * 100)}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Clear All Button */}
          {regionSelections.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                regionSelections.forEach(selection => {
                  setRegionSelection(selection.region, 0);
                });
              }}
              className="w-full"
            >
              Clear All Selections
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
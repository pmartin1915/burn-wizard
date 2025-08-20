/**
 * BodyMap Component - Interactive Burn Assessment Interface
 * 
 * CLINICAL PURPOSE:
 * This component provides the primary interface for burn assessment using
 * the Lund-Browder method. Users can select body regions and specify:
 * - Burn involvement fraction (0%, 25%, 50%, 75%, 100%)
 * - Burn depth classification (superficial, partial, full-thickness)
 * 
 * COMPONENT ARCHITECTURE:
 * - Uses Zustand store for state management (useWizardStore)
 * - Real-time TBSA calculation with calculateTBSA() function
 * - Visual feedback with color-coded selection buttons
 * - Integrates with burn depth classification system
 * 
 * UI/UX FEATURES:
 * - Grid layout of clickable body region buttons
 * - Color intensity indicates burn fraction involvement
 * - Live TBSA percentage display
 * - Burn depth selector for clinical accuracy
 * 
 * AI Development Notes:
 * - regionSelections array stores all user selections
 * - BODY_REGIONS constant maps UI labels to clinical region keys
 * - Color coding: none=gray, 25%=light, 50%=medium, 75%=dark, 100%=darkest
 * - Real-time calculation prevents need for separate "calculate" step
 * - Accessible design with proper button focus states
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/store/useWizardStore';
import { calculateTBSA } from '@/domain/tbsa';
import { getBurnDepthInfo } from '@/constants/burnDepth';
import InteractiveSVGBodyMap from './InteractiveSVGBodyMap';
import BurnDepthChart from './BurnDepthChart';
import { CircularProgress } from '@/components/ui/circular-progress';
import { cn } from '@/lib/utils';
import type { RegionKey, BurnFraction, BurnDepth } from '@/domain/types';

const BODY_REGIONS: Array<{ key: RegionKey; label: string }> = [
  { key: 'Head', label: 'Head' },
  { key: 'Neck', label: 'Neck' },
  { key: 'Ant_Trunk', label: 'Chest' },
  { key: 'Post_Trunk', label: 'Back' },
  { key: 'R_U_Arm', label: 'R Upper Arm' },
  { key: 'L_U_Arm', label: 'L Upper Arm' },
  { key: 'R_L_Arm', label: 'R Lower Arm' },
  { key: 'L_L_Arm', label: 'L Lower Arm' },
  { key: 'R_Hand', label: 'R Hand' },
  { key: 'L_Hand', label: 'L Hand' },
  { key: 'R_Buttock', label: 'R Buttock' },
  { key: 'L_Buttock', label: 'L Buttock' },
  { key: 'Genitalia', label: 'Genitalia' },
  { key: 'R_Thigh', label: 'R Thigh' },
  { key: 'L_Thigh', label: 'L Thigh' },
  { key: 'R_Leg', label: 'R Leg' },
  { key: 'L_Leg', label: 'L Leg' },
  { key: 'R_Foot', label: 'R Foot' },
  { key: 'L_Foot', label: 'L Foot' },
];

const FRACTION_OPTIONS: BurnFraction[] = [0, 0.25, 0.5, 0.75, 1];

export default function BodyMap() {
  const { regionSelections, patientData, setRegionSelection } = useWizardStore();
  const [selectedDepth, setSelectedDepth] = React.useState<BurnDepth>('superficial-partial');
  const [viewMode, setViewMode] = React.useState<'svg' | 'grid'>('svg');
  
  const currentTbsa = React.useMemo(() => {
    try {
      const result = calculateTBSA(patientData.ageMonths, regionSelections);
      return result.tbsaPct;
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
      case 0: return 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
      case 0.25: return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700';
      case 0.5: return 'bg-orange-200 text-orange-800 border-orange-400 hover:bg-orange-300 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-600';
      case 0.75: return 'bg-red-300 text-red-800 border-red-500 hover:bg-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-500';
      case 1: return 'bg-red-500 text-white border-red-600 hover:bg-red-600 dark:bg-red-700 dark:border-red-800';
      default: return 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
    }
  };

  const handleRegionClick = (regionKey: RegionKey) => {
    const currentFraction = getRegionFraction(regionKey);
    const currentIndex = FRACTION_OPTIONS.indexOf(currentFraction);
    const nextIndex = (currentIndex + 1) % FRACTION_OPTIONS.length;
    const nextFraction = FRACTION_OPTIONS[nextIndex];
    
    setRegionSelection(regionKey, nextFraction, nextFraction > 0 ? selectedDepth : undefined);
  };

  // Show SVG view by default, with option to switch to grid
  if (viewMode === 'svg') {
    return <InteractiveSVGBodyMap onToggleView={() => setViewMode('grid')} currentTbsa={currentTbsa} />;
  }

  return (
    <Card className="w-full burn-wizard-card">
      <CardHeader>
        <CardTitle className="burn-wizard-heading-md mb-4">Body Region Assessment</CardTitle>
        
        {/* TBSA Display Card with Circular Progress */}
        <div className="burn-wizard-card-primary rounded-card p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="burn-wizard-heading-sm text-primary mb-2">Total Body Surface Area</h3>
              <p className="burn-wizard-body-sm text-primary/70 mb-4">Current calculation based on selections</p>
              
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                currentTbsa === 0 ? "bg-gray-100 text-gray-600" :
                currentTbsa < 10 ? "status-safe" :
                currentTbsa < 20 ? "status-warning" :
                "status-critical"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  currentTbsa === 0 ? "bg-gray-400" :
                  currentTbsa < 10 ? "bg-green-500" :
                  currentTbsa < 20 ? "bg-amber-500" :
                  "bg-red-500"
                )} />
                {currentTbsa === 0 ? "No burns selected" :
                 currentTbsa < 10 ? "Minor burn" :
                 currentTbsa < 20 ? "Moderate burn" :
                 "Major burn"}
              </div>
            </div>
            
            <div className="flex-shrink-0" data-element="tbsa-display">
              <CircularProgress
                value={currentTbsa}
                size={140}
                strokeWidth={12}
                color={
                  currentTbsa === 0 ? 'primary' :
                  currentTbsa < 10 ? 'success' :
                  currentTbsa < 20 ? 'warning' :
                  'danger'
                }
                label="TBSA"
                className="float-gentle"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('svg')}
            className="burn-wizard-secondary-button focus-ring text-xs"
          >
            🧑‍⚕️ Diagram View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Burn Depth Selector */}
          <div className="p-3 bg-muted/50 rounded-md" data-field="burn-depth">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Select Burn Depth for New Selections:</label>
              <select 
                value={selectedDepth} 
                onChange={(e) => setSelectedDepth(e.target.value as BurnDepth)}
                className="w-full p-2 border border-border rounded-md bg-background text-sm"
                data-field="burn-depth-selector"
              >
                <option value="superficial">Superficial (1st Degree) - Red, dry, painful</option>
                <option value="superficial-partial">Superficial Partial (2nd Degree) - Blisters, very painful</option>
                <option value="deep-partial">Deep Partial (2nd Degree) - Less sensation</option>
                <option value="full-thickness">Full Thickness (3rd Degree) - No sensation</option>
              </select>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs p-3 bg-muted/30 rounded-md border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted border border-border rounded shadow-sm"></div>
              <span className="font-medium">0%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded shadow-sm dark:bg-amber-900/30 dark:border-amber-700"></div>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 border border-orange-400 rounded shadow-sm dark:bg-orange-900/40 dark:border-orange-600"></div>
              <span className="font-medium">50%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 border border-red-500 rounded shadow-sm dark:bg-red-900/50 dark:border-red-500"></div>
              <span className="font-medium">75%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border border-red-600 rounded shadow-sm dark:bg-red-700 dark:border-red-800"></div>
              <span className="font-medium text-primary">100%</span>
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
                  data-region={region.key}
                  className={`burn-region-button p-3 rounded-md text-sm font-medium ${colorClass}`}
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
            <div className="space-y-3">
              <h4 className="burn-wizard-heading-sm">Selected Regions</h4>
              <div className="space-y-2">
                {regionSelections
                  .filter(s => s.fraction > 0)
                  .map((selection, index) => {
                    const region = BODY_REGIONS.find(r => r.key === selection.region);
                    const depthInfo = selection.depth ? getBurnDepthInfo(selection.depth) : null;
                    return (
                      <div key={selection.region} className={cn(
                        "burn-wizard-card rounded-card p-3 animate-scale-in",
                        `animate-stagger-${Math.min(index + 1, 3)}`
                      )}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="burn-wizard-body font-medium">{region?.label}</div>
                            {depthInfo && (
                              <div className="burn-wizard-body-sm text-muted-foreground">{depthInfo.name}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary">{Math.round(selection.fraction * 100)}%</span>
                          </div>
                        </div>
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
              className="w-full burn-wizard-secondary-button focus-ring touch-target"
            >
              Clear All Selections
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
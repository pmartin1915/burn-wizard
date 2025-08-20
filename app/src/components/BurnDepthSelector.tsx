import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/store/useWizardStore';
import { calculateTBSA } from '@/domain/tbsa';
import { getBurnDepthInfo, getAllBurnDepths, requiresBurnCenter } from '@/constants/burnDepth';
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

interface RegionCardProps {
  region: { key: RegionKey; label: string };
  selection: { fraction: BurnFraction; depth?: BurnDepth } | null;
  onSelectionChange: (fraction: BurnFraction, depth: BurnDepth) => void;
}

function RegionCard({ region, selection, onSelectionChange }: RegionCardProps) {
  const [selectedDepth, setSelectedDepth] = React.useState<BurnDepth>('superficial-partial');
  const burnDepths = getAllBurnDepths();

  const currentFraction = selection?.fraction || 0;
  const currentDepth = selection?.depth || 'superficial-partial';

  const handleFractionClick = () => {
    const currentIndex = FRACTION_OPTIONS.indexOf(currentFraction);
    const nextIndex = (currentIndex + 1) % FRACTION_OPTIONS.length;
    const nextFraction = FRACTION_OPTIONS[nextIndex];
    
    if (nextFraction > 0) {
      onSelectionChange(nextFraction, selectedDepth);
    } else {
      onSelectionChange(0, 'superficial-partial');
    }
  };

  const handleDepthChange = (depth: BurnDepth) => {
    setSelectedDepth(depth);
    if (currentFraction > 0) {
      onSelectionChange(currentFraction, depth);
    }
  };

  const depthInfo = getBurnDepthInfo(currentDepth);
  const fractionColor = currentFraction === 0 ? '#F3F4F6' : depthInfo.color;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{region.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Fraction Selector */}
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFractionClick}
            className="w-full h-12 font-bold text-lg"
            style={{ 
              backgroundColor: fractionColor,
              borderColor: currentFraction > 0 ? depthInfo.color : '#D1D5DB'
            }}
          >
            {Math.round(currentFraction * 100)}%
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Click to cycle percentage
          </p>
        </div>

        {/* Depth Selector */}
        {currentFraction > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">Burn Depth:</p>
            <div className="grid grid-cols-1 gap-1">
              {burnDepths.map((depthInfo) => (
                <Button
                  key={depthInfo.depth}
                  variant={selectedDepth === depthInfo.depth ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleDepthChange(depthInfo.depth)}
                  className="h-8 text-xs justify-start p-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2 border"
                    style={{ backgroundColor: depthInfo.color }}
                  />
                  {depthInfo.name.split(' (')[0]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Current Selection Info */}
        {currentFraction > 0 && (
          <div className="text-xs space-y-1 p-2 bg-muted/50 rounded">
            <div className="font-medium">{depthInfo.name}</div>
            <div className="text-muted-foreground">{depthInfo.appearance}</div>
            <div className="text-muted-foreground">Healing: {depthInfo.healingTime}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BurnDepthSelector() {
  const { regionSelections, patientData, setRegionSelection } = useWizardStore();
  
  const currentTbsa = React.useMemo(() => {
    try {
      if (regionSelections.length > 0) {
        const result = calculateTBSA(patientData.ageMonths, regionSelections);
        return result.tbsaPct;
      }
      return 0;
    } catch {
      return 0;
    }
  }, [patientData.ageMonths, regionSelections]);

  // Calculate burn center transfer recommendations
  const transferRecommendations = React.useMemo(() => {
    const recommendations: string[] = [];
    
    regionSelections.forEach(selection => {
      if (selection.fraction > 0 && selection.depth) {
        const regionTbsa = (selection.fraction * currentTbsa) / regionSelections.reduce((sum, s) => sum + s.fraction, 0) || 0;
        if (requiresBurnCenter(selection.depth, regionTbsa)) {
          const region = BODY_REGIONS.find(r => r.key === selection.region);
          const depthInfo = getBurnDepthInfo(selection.depth);
          recommendations.push(`${region?.label}: ${depthInfo.name} (${Math.round(regionTbsa)}% TBSA)`);
        }
      }
    });
    
    return recommendations;
  }, [regionSelections, currentTbsa]);

  const getRegionSelection = (regionKey: RegionKey) => {
    const selection = regionSelections.find(s => s.region === regionKey);
    return selection ? { fraction: selection.fraction, depth: selection.depth || 'superficial-partial' } : null;
  };

  const handleSelectionChange = (regionKey: RegionKey, fraction: BurnFraction, depth: BurnDepth) => {
    setRegionSelection(regionKey, fraction, depth);
  };

  return (
    <div className="space-y-6">
      {/* TBSA Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Burn Assessment Summary</span>
            <span className="tbsa-display" data-element="tbsa-display">
              TBSA: {currentTbsa}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transferRecommendations.length > 0 && (
            <div className="burn-wizard-warning" data-element="transfer-recommendation">
              <h4 className="font-medium mb-2">⚠️ Consider Burn Center Transfer</h4>
              <ul className="text-sm space-y-1">
                {transferRecommendations.map((rec, idx) => (
                  <li key={idx}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Body Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {BODY_REGIONS.map((region) => (
          <RegionCard
            key={region.key}
            region={region}
            selection={getRegionSelection(region.key)}
            onSelectionChange={(fraction, depth) => handleSelectionChange(region.key, fraction, depth)}
          />
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Burn Depth Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getAllBurnDepths().map((depthInfo) => (
              <div key={depthInfo.depth} className="flex items-start gap-3 p-3 border rounded-md">
                <div 
                  className="w-4 h-4 rounded-full border mt-1 flex-shrink-0"
                  style={{ backgroundColor: depthInfo.color }}
                />
                <div className="space-y-1">
                  <div className="font-medium text-sm">{depthInfo.name}</div>
                  <div className="text-xs text-muted-foreground">{depthInfo.description}</div>
                  <div className="text-xs">
                    <span className="font-medium">Appearance:</span> {depthInfo.appearance}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Healing:</span> {depthInfo.healingTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clear All Button */}
      {regionSelections.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              regionSelections.forEach(selection => {
                setRegionSelection(selection.region, 0);
              });
            }}
          >
            Clear All Selections
          </Button>
        </div>
      )}
    </div>
  );
}
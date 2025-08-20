import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/store/useWizardStore';
import { calculateTBSA } from '@/domain/tbsa';
import { getBurnDepthInfo } from '@/constants/burnDepth';
import { getBodyAreaPercentage } from '@/constants/lundBrowder';
import type { RegionKey, BurnFraction, BurnDepth } from '@/domain/types';

const FRACTION_OPTIONS: BurnFraction[] = [0, 0.25, 0.5, 0.75, 1];

interface SVGBodyMapProps {
  className?: string;
  onToggleView?: () => void;
  currentTbsa?: number;
}

export default function InteractiveSVGBodyMap({ className, onToggleView: _onToggleView, currentTbsa }: SVGBodyMapProps) {
  const { regionSelections, patientData, setRegionSelection, updateAllRegionDepths } = useWizardStore();
  const [selectedDepth, setSelectedDepth] = React.useState<BurnDepth>('superficial-partial');
  const [viewOrientation, setViewOrientation] = React.useState<'anterior' | 'posterior'>('anterior');

  const displayTbsa = React.useMemo(() => {
    // Use TBSA passed from parent (main BodyMap) if available, otherwise calculate
    if (currentTbsa !== undefined) {
      return currentTbsa;
    }
    
    try {
      const result = calculateTBSA(patientData.ageMonths, regionSelections);
      return result.tbsaPct;
    } catch {
      return 0;
    }
  }, [currentTbsa, patientData.ageMonths, regionSelections]);

  const getRegionFraction = (regionKey: RegionKey): BurnFraction => {
    const selection = regionSelections.find(s => s.region === regionKey);
    return selection?.fraction || 0;
  };

  const getRegionColor = (fraction: BurnFraction): string => {
    switch (fraction) {
      case 0: return '#f1f5f9'; // Light gray
      case 0.25: return '#fef3c7'; // Light amber
      case 0.5: return '#fed7aa'; // Light orange  
      case 0.75: return '#fca5a5'; // Light red
      case 1: return '#f87171'; // Red
      default: return '#f1f5f9';
    }
  };

  const getRegionStroke = (fraction: BurnFraction): string => {
    return fraction > 0 ? '#0f766e' : '#94a3b8'; // Teal when selected, gray when not
  };

  const handleRegionClick = (regionKey: RegionKey) => {
    const currentFraction = getRegionFraction(regionKey);
    const currentIndex = FRACTION_OPTIONS.indexOf(currentFraction);
    const nextIndex = (currentIndex + 1) % FRACTION_OPTIONS.length;
    const nextFraction = FRACTION_OPTIONS[nextIndex];
    
    setRegionSelection(regionKey, nextFraction, nextFraction > 0 ? selectedDepth : undefined);
  };

  // Define SVG paths for different orientations
  const getRegionPath = (regionKey: RegionKey): string => {
    if (viewOrientation === 'anterior') {
      // Anterior (front) view paths
      switch (regionKey) {
        case 'Head': return "M 180 30 Q 200 10 220 30 Q 235 45 230 70 Q 225 85 200 90 Q 175 85 170 70 Q 165 45 180 30 Z"; // Anterior head (face)
        case 'Neck': return "M 190 90 Q 200 95 210 90 L 215 110 L 185 110 Z";
        case 'Ant_Trunk': return "M 170 110 Q 200 105 230 110 L 240 200 Q 200 210 160 200 Z";
        case 'Post_Trunk': return "M 80 80 Q 120 75 130 100 L 125 140 Q 115 150 85 145 Q 75 135 80 110 Z"; // Keep in upper left for now
        case 'R_U_Arm': return "M 240 120 Q 260 125 270 140 L 275 180 Q 265 185 250 180 L 245 145 Z";
        case 'L_U_Arm': return "M 160 120 Q 140 125 130 140 L 125 180 Q 135 185 150 180 L 155 145 Z";
        case 'R_L_Arm': return "M 270 180 Q 280 185 285 200 L 290 240 Q 280 245 265 240 L 260 205 Z";
        case 'L_L_Arm': return "M 130 180 Q 120 185 115 200 L 110 240 Q 120 245 135 240 L 140 205 Z";
        case 'R_Hand': return "M 285 240 Q 295 245 300 260 Q 295 275 285 270 Q 275 265 280 250 Z";
        case 'L_Hand': return "M 115 240 Q 105 245 100 260 Q 105 275 115 270 Q 125 265 120 250 Z";
        case 'R_Buttock': return "M 210 200 Q 225 205 235 220 Q 230 235 215 230 Q 205 225 210 210 Z";
        case 'L_Buttock': return "M 190 200 Q 175 205 165 220 Q 170 235 185 230 Q 195 225 190 210 Z";
        case 'Genitalia': return "M 190 230 Q 200 235 210 230 Q 205 245 195 240 Z";
        case 'R_Thigh': return "M 210 240 Q 230 245 240 280 L 235 340 Q 225 345 210 340 L 205 280 Z";
        case 'L_Thigh': return "M 190 240 Q 170 245 160 280 L 165 340 Q 175 345 190 340 L 195 280 Z";
        case 'R_Leg': return "M 235 340 Q 245 345 250 380 L 245 480 Q 235 485 225 480 L 230 380 Z";
        case 'L_Leg': return "M 165 340 Q 155 345 150 380 L 155 480 Q 165 485 175 480 L 170 380 Z";
        case 'R_Foot': return "M 245 480 Q 255 485 265 500 Q 260 515 245 510 Q 235 505 240 490 Z"; // Anterior right foot
        case 'L_Foot': return "M 155 480 Q 145 485 135 500 Q 140 515 155 510 Q 165 505 160 490 Z"; // Anterior left foot
        default: return "";
      }
    } else {
      // Posterior (back) view paths - modified for back view
      switch (regionKey) {
        case 'Head': return "M 185 35 Q 200 15 215 35 Q 225 50 220 65 Q 215 80 200 85 Q 185 80 180 65 Q 175 50 185 35 Z"; // Posterior head (back of head, slightly smaller)
        case 'Neck': return "M 190 90 Q 200 95 210 90 L 215 110 L 185 110 Z"; // Same neck
        case 'Ant_Trunk': return "M 80 80 Q 120 75 130 100 L 125 140 Q 115 150 85 145 Q 75 135 80 110 Z"; // Move to upper left (now represents front from back view)
        case 'Post_Trunk': return "M 170 110 Q 200 105 230 110 L 240 200 Q 200 210 160 200 Z"; // Main torso area now represents back
        case 'R_U_Arm': return "M 160 120 Q 140 125 130 140 L 125 180 Q 135 185 150 180 L 155 145 Z"; // Flip arms for back view
        case 'L_U_Arm': return "M 240 120 Q 260 125 270 140 L 275 180 Q 265 185 250 180 L 245 145 Z";
        case 'R_L_Arm': return "M 130 180 Q 120 185 115 200 L 110 240 Q 120 245 135 240 L 140 205 Z"; // Flip forearms
        case 'L_L_Arm': return "M 270 180 Q 280 185 285 200 L 290 240 Q 280 245 265 240 L 260 205 Z";
        case 'R_Hand': return "M 115 240 Q 105 245 100 260 Q 105 275 115 270 Q 125 265 120 250 Z"; // Flip hands
        case 'L_Hand': return "M 285 240 Q 295 245 300 260 Q 295 275 285 270 Q 275 265 280 250 Z";
        case 'R_Buttock': return "M 190 200 Q 175 205 165 220 Q 170 235 185 230 Q 195 225 190 210 Z"; // Flip buttocks
        case 'L_Buttock': return "M 210 200 Q 225 205 235 220 Q 230 235 215 230 Q 205 225 210 210 Z";
        case 'Genitalia': return "M 190 230 Q 200 235 210 230 Q 205 245 195 240 Z"; // Same genitalia (not visible from back but keep for consistency)
        case 'R_Thigh': return "M 190 240 Q 170 245 160 280 L 165 340 Q 175 345 190 340 L 195 280 Z"; // Flip thighs
        case 'L_Thigh': return "M 210 240 Q 230 245 240 280 L 235 340 Q 225 345 210 340 L 205 280 Z";
        case 'R_Leg': return "M 165 340 Q 155 345 150 380 L 155 480 Q 165 485 175 480 L 170 380 Z"; // Flip legs
        case 'L_Leg': return "M 235 340 Q 245 345 250 380 L 245 480 Q 235 485 225 480 L 230 380 Z";
        case 'R_Foot': return "M 160 485 Q 150 490 140 505 Q 145 520 160 515 Q 170 510 165 495 Z"; // Posterior right foot (flipped and slightly different shape)
        case 'L_Foot': return "M 240 485 Q 250 490 260 505 Q 255 520 240 515 Q 230 510 235 495 Z"; // Posterior left foot (flipped and slightly different shape)
        default: return "";
      }
    }
  };

  const RegionPath = ({ 
    regionKey, 
    label 
  }: { 
    regionKey: RegionKey; 
    label: string; 
  }) => {
    const fraction = getRegionFraction(regionKey);
    const fillColor = getRegionColor(fraction);
    const strokeColor = getRegionStroke(fraction);
    const pathData = getRegionPath(regionKey);

    if (!pathData) return null;

    return (
      <g>
        <path
          d={pathData}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2"
          data-region={regionKey}
          className="cursor-pointer transition-all duration-200 hover:stroke-primary hover:stroke-4"
          onClick={() => handleRegionClick(regionKey)}
        />
        <title>{`${label}: ${Math.round(fraction * 100)}%`}</title>
      </g>
    );
  };

  return (
    <div className={`space-y-4 ${className}`} data-element="body-map">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-lg font-semibold">Interactive Body Map</span>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewOrientation(viewOrientation === 'anterior' ? 'posterior' : 'anterior')}
                className="text-xs whitespace-nowrap"
              >
                🔄 {viewOrientation === 'anterior' ? 'Show Back' : 'Show Front'}
              </Button>
              <span className="tbsa-display font-medium text-primary whitespace-nowrap" data-element="tbsa-display">
                TBSA: {displayTbsa}%
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Burn Depth Selector */}
            <div className="p-3 bg-muted/30 rounded-md border">
              <div className="flex flex-col space-y-2">
                <label htmlFor="burn-depth-selector" className="text-sm font-medium">Select Burn Depth for All Selections:</label>
                <select 
                  id="burn-depth-selector"
                  title="Select burn depth classification for new selections"
                  value={selectedDepth} 
                  onChange={(e) => {
                    const newDepth = e.target.value as BurnDepth;
                    setSelectedDepth(newDepth);
                    updateAllRegionDepths(newDepth);
                  }}
                  className="w-full p-2 border border-border rounded-md bg-background text-sm medical-input"
                  data-field="burn-depth-selector"
                >
                  <option value="superficial">Superficial (1st Degree) - Red, dry, painful</option>
                  <option value="superficial-partial">Superficial Partial (2nd Degree) - Blisters, very painful</option>
                  <option value="deep-partial">Deep Partial (2nd Degree) - Less sensation</option>
                  <option value="full-thickness">Full Thickness (3rd Degree) - No sensation</option>
                </select>
              </div>
            </div>

            {/* Info Box - Anterior/Posterior Clarification */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 text-sm">💡</span>
                <div className="text-sm">
                  <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Understanding Front & Back Regions
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                    Each body region (chest/back, arms, legs) has separate front and back sides that count as individual TBSA percentages. 
                    Use the <span className="font-medium">🔄 rotate button</span> to select both sides if burns extend completely around the body part.
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive SVG Body Map */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-background to-muted/30 p-6 rounded-lg border shadow-sm">
                <svg
                  viewBox="0 0 400 600"
                  className="w-full max-w-md h-auto svg-body-map"
                >
                  {/* Head */}
                  <RegionPath
                    regionKey="Head"
                    label="Head"
                  />
                  
                  {/* Neck */}
                  <RegionPath
                    regionKey="Neck"
                    label="Neck"
                  />

                  {/* Anterior Trunk (Chest) */}
                  <RegionPath
                    regionKey="Ant_Trunk"
                    label="Chest"
                  />

                  {/* Posterior Trunk (Back) - positioned at upper left for visibility */}
                  <RegionPath
                    regionKey="Post_Trunk"
                    label="Back"
                  />

                  {/* Right Upper Arm */}
                  <RegionPath
                    regionKey="R_U_Arm"
                    label="R Upper Arm"
                  />

                  {/* Left Upper Arm */}
                  <RegionPath
                    regionKey="L_U_Arm"
                    label="L Upper Arm"
                  />

                  {/* Right Lower Arm */}
                  <RegionPath
                    regionKey="R_L_Arm"
                    label="R Lower Arm"
                  />

                  {/* Left Lower Arm */}
                  <RegionPath
                    regionKey="L_L_Arm"
                    label="L Lower Arm"
                  />

                  {/* Right Hand */}
                  <RegionPath
                    regionKey="R_Hand"
                    label="R Hand"
                  />

                  {/* Left Hand */}
                  <RegionPath
                    regionKey="L_Hand"
                    label="L Hand"
                  />

                  {/* Right Buttock */}
                  <RegionPath
                    regionKey="R_Buttock"
                    label="R Buttock"
                  />

                  {/* Left Buttock */}
                  <RegionPath
                    regionKey="L_Buttock"
                    label="L Buttock"
                  />

                  {/* Genitalia */}
                  <RegionPath
                    regionKey="Genitalia"
                    label="Genitalia"
                  />

                  {/* Right Thigh */}
                  <RegionPath
                    regionKey="R_Thigh"
                    label="R Thigh"
                  />

                  {/* Left Thigh */}
                  <RegionPath
                    regionKey="L_Thigh"
                    label="L Thigh"
                  />

                  {/* Right Leg */}
                  <RegionPath
                    regionKey="R_Leg"
                    label="R Leg"
                  />

                  {/* Left Leg */}
                  <RegionPath
                    regionKey="L_Leg"
                    label="L Leg"
                  />

                  {/* Right Foot */}
                  <RegionPath
                    regionKey="R_Foot"
                    label="R Foot"
                  />

                  {/* Left Foot */}
                  <RegionPath
                    regionKey="L_Foot"
                    label="L Foot"
                  />

                  {/* Orientation labels for clarity */}
                  {viewOrientation === 'anterior' ? (
                    <>
                      <text x="105" y="115" textAnchor="middle" className="fill-current text-xs font-medium opacity-70" pointerEvents="none">
                        BACK
                      </text>
                      <text x="200" y="40" textAnchor="middle" className="fill-current text-sm font-bold opacity-80" pointerEvents="none">
                        FRONT VIEW
                      </text>
                    </>
                  ) : (
                    <>
                      <text x="105" y="115" textAnchor="middle" className="fill-current text-xs font-medium opacity-70" pointerEvents="none">
                        FRONT
                      </text>
                      <text x="200" y="40" textAnchor="middle" className="fill-current text-sm font-bold opacity-80" pointerEvents="none">
                        BACK VIEW
                      </text>
                    </>
                  )}

                  {/* Body outline for reference */}
                  <path
                    d="M 180 30 Q 200 10 220 30 Q 235 45 230 70 Q 225 85 200 90 Q 175 85 170 70 Q 165 45 180 30 Z M 190 90 Q 200 95 210 90 L 230 110 Q 240 120 270 140 L 285 200 Q 295 245 300 260 Q 295 275 285 270 Q 280 265 285 240 L 250 380 L 265 500 Q 260 515 245 510 Q 235 505 240 490 L 245 480 L 235 340 L 240 280 Q 235 245 240 200 L 160 200 Q 165 245 160 280 L 165 340 L 155 480 L 160 490 Q 165 505 155 510 Q 140 515 135 500 L 150 380 L 115 240 Q 105 275 100 260 Q 105 245 115 240 L 130 180 Q 140 125 170 110 Z"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                </svg>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center p-3 bg-primary/5 rounded-md border border-primary/20">
              <p className="text-sm font-medium text-primary">
                Click on body regions to select burn involvement
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Each click cycles: 0% → 25% → 50% → 75% → 100%
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-xs p-3 bg-muted/30 rounded-md border">
              {FRACTION_OPTIONS.map((fraction) => (
                <div key={fraction} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border-2 shadow-sm legend-color-square"
                    style={{ 
                      '--legend-bg-color': getRegionColor(fraction),
                      '--legend-border-color': getRegionStroke(fraction)
                    } as React.CSSProperties}
                  />
                  <span className="font-medium">{Math.round(fraction * 100)}%</span>
                </div>
              ))}
            </div>

            {/* Selected Regions List */}
            {regionSelections.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Regions:</h4>
                <div className="space-y-1 text-sm">
                  {regionSelections
                    .filter(s => s.fraction > 0)
                    .map((selection) => {
                      const depthInfo = selection.depth ? getBurnDepthInfo(selection.depth) : null;
                      const ageYears = patientData.ageMonths / 12;
                      const basePercentage = getBodyAreaPercentage(selection.region, ageYears);
                      const contributedTbsa = basePercentage * selection.fraction;
                      // Get proper region label with anterior/posterior context
                      const getRegionDisplayName = (regionKey: RegionKey): string => {
                        const baseRegionMap: Record<RegionKey, string> = {
                          'Head': 'Head',
                          'Neck': 'Neck', 
                          'Ant_Trunk': 'Chest (Anterior)',
                          'Post_Trunk': 'Back (Posterior)',
                          'R_U_Arm': 'Right Upper Arm',
                          'L_U_Arm': 'Left Upper Arm',
                          'R_L_Arm': 'Right Lower Arm', 
                          'L_L_Arm': 'Left Lower Arm',
                          'R_Hand': 'Right Hand',
                          'L_Hand': 'Left Hand',
                          'R_Buttock': 'Right Buttock',
                          'L_Buttock': 'Left Buttock',
                          'Genitalia': 'Genitalia',
                          'R_Thigh': 'Right Thigh',
                          'L_Thigh': 'Left Thigh',
                          'R_Leg': 'Right Leg',
                          'L_Leg': 'Left Leg',
                          'R_Foot': 'Right Foot',
                          'L_Foot': 'Left Foot'
                        };
                        
                        const baseName = baseRegionMap[regionKey] || regionKey.replace(/_/g, ' ');
                        
                        // Add anterior/posterior context for head and feet based on current view
                        if (regionKey === 'Head') {
                          return `${viewOrientation === 'anterior' ? 'Anterior' : 'Posterior'} Head`;
                        }
                        if (regionKey === 'R_Foot') {
                          return `${viewOrientation === 'anterior' ? 'Anterior' : 'Posterior'} Right Foot`;
                        }
                        if (regionKey === 'L_Foot') {
                          return `${viewOrientation === 'anterior' ? 'Anterior' : 'Posterior'} Left Foot`;
                        }
                        
                        return baseName;
                      };
                      const regionLabel = getRegionDisplayName(selection.region);
                      
                      return (
                        <div key={selection.region} className="p-3 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-primary">{regionLabel}</div>
                              {depthInfo && (
                                <div className="text-xs text-muted-foreground mt-1">{depthInfo.name}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.round(selection.fraction * 100)}% of {basePercentage}% = <span className="font-medium text-primary">{contributedTbsa.toFixed(1)}% TBSA</span>
                              </div>
                            </div>
                            <span className="font-bold text-primary text-lg ml-3">{Math.round(selection.fraction * 100)}%</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  Droplets, 
  Heart, 
  Shield, 
  Eye,
  Hand,
  Footprints
} from 'lucide-react';
import { useWizardStore } from '@/store/useWizardStore';
import { DRESSING_RECOMMENDATIONS, DRESSING_PRINCIPLES, WOUND_RED_FLAGS } from '@/constants/dressing';
import type { RegionKey } from '@/domain/types';

interface DressingGuideProps {
  className?: string;
}

const REGION_MAPPING: Record<string, RegionKey[]> = {
  face: ['headAnterior', 'headPosterior'],
  hands: ['handRight', 'handLeft'],
  arms: ['armRightAnterior', 'armRightPosterior', 'armLeftAnterior', 'armLeftPosterior', 'forearmRightAnterior', 'forearmRightPosterior', 'forearmLeftAnterior', 'forearmLeftPosterior'],
  torso: ['torsoAnterior', 'torsoPosterior', 'neckAnterior', 'neckPosterior'],
  legs: ['thighRightAnterior', 'thighRightPosterior', 'thighLeftAnterior', 'thighLeftPosterior', 'legRightAnterior', 'legRightPosterior', 'legLeftAnterior', 'legLeftPosterior'],
  feet: ['footRight', 'footLeft'],
  perineum: ['perineum']
};

const REGION_ICONS: Record<string, React.ComponentType<any>> = {
  face: Eye,
  hands: Hand,
  arms: Shield,
  torso: Heart,
  legs: Shield,
  feet: Footprints,
  perineum: AlertTriangle
};

export default function DressingGuide({ className }: DressingGuideProps) {
  const { regionSelections, patientData } = useWizardStore();
  
  // Determine which regions have burns
  const affectedRegions = React.useMemo(() => {
    const selectedRegions = regionSelections
      .filter(sel => sel.fraction > 0)
      .map(sel => sel.region);
    
    const affectedAreas: string[] = [];
    
    Object.entries(REGION_MAPPING).forEach(([area, regions]) => {
      const hasAffectedRegion = regions.some(region => selectedRegions.includes(region));
      if (hasAffectedRegion) {
        affectedAreas.push(area);
      }
    });
    
    return affectedAreas;
  }, [regionSelections]);

  const isSpecialSiteAffected = React.useMemo(() => {
    return Object.entries(patientData.specialSites).some(([site, affected]) => affected);
  }, [patientData.specialSites]);

  if (affectedRegions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Select burn regions to see specific dressing recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Affected Regions Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dressing Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {affectedRegions.map((region) => {
            const recommendation = DRESSING_RECOMMENDATIONS[region];
            const Icon = REGION_ICONS[region];
            
            return (
              <div key={region} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-1 text-primary" />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium">{recommendation.region}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Primary Dressing:</p>
                        <p className="font-medium">{recommendation.primary}</p>
                      </div>
                      
                      {recommendation.secondary && (
                        <div>
                          <p className="text-muted-foreground mb-1">Secondary Dressing:</p>
                          <p className="font-medium">{recommendation.secondary}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-muted-foreground mb-1">Change Frequency:</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recommendation.frequency}
                        </p>
                      </div>
                      
                      {recommendation.notes && (
                        <div className="md:col-span-2">
                          <p className="text-muted-foreground mb-1">Special Notes:</p>
                          <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            {recommendation.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Special Sites Alert */}
      {isSpecialSiteAffected && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              Special Sites Involved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-orange-600 dark:text-orange-400">
                The following special sites require additional consideration:
              </p>
              <ul className="text-sm space-y-1">
                {Object.entries(patientData.specialSites)
                  .filter(([_, affected]) => affected)
                  .map(([site]) => (
                    <li key={site} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      <span className="capitalize">{site}</span>
                    </li>
                  ))}
              </ul>
              <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Consider specialist consultation (plastic surgery, ophthalmology, urology) 
                  for burns involving face, hands, feet, perineum, or major joints.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Principles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            General Dressing Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {DRESSING_PRINCIPLES.map((principle, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>{principle}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Educational Note:</strong> These are general principles only. 
              Always follow institutional protocols and physician orders for specific dressing types and frequencies.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            Warning Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">
            Contact healthcare provider immediately if any of these signs occur:
          </p>
          <ul className="space-y-2">
            {WOUND_RED_FLAGS.map((flag, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            Emergency Contact: {{BURN_TEAM_PHONE}}
          </Button>
        </CardContent>
      </Card>

      {/* Educational Disclaimer */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="p-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Educational Disclaimer:</strong> These dressing recommendations are for educational purposes only. 
            Actual wound care must be individualized based on burn depth, patient factors, and institutional protocols. 
            Always verify with supervising clinicians and current best practice guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
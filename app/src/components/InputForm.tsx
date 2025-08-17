import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWizardStore } from '@/store/useWizardStore';
import { calcTbsa } from '@/domain/tbsa';
import { calcFluids } from '@/domain/fluids';

interface InputFormProps {
  onReviewClick: () => void;
}

export default function InputForm({ onReviewClick }: InputFormProps) {
  const { patientData, regionSelections, setPatientData, setTbsaResult, setFluidResult } = useWizardStore();

  const handleInputChange = (field: string, value: any) => {
    setPatientData({ [field]: value });
  };

  const handleSpecialSiteChange = (site: string, checked: boolean) => {
    setPatientData({
      specialSites: {
        ...patientData.specialSites,
        [site]: checked,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Calculate TBSA
      const tbsaResult = calcTbsa(patientData.ageMonths, regionSelections);
      setTbsaResult(tbsaResult);

      // Calculate fluids
      const fluidResult = calcFluids({
        weightKg: patientData.weightKg,
        tbsaPct: tbsaResult.tbsaPct,
        hoursSinceInjury: patientData.hoursSinceInjury,
      });
      setFluidResult(fluidResult);

      onReviewClick();
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Please check your inputs and try again.');
    }
  };

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age Section */}
          <div className="space-y-2">
            <Label htmlFor="ageMonths">Age (months)</Label>
            <Input
              id="ageMonths"
              type="number"
              min="0"
              max="1200"
              value={patientData.ageMonths}
              onChange={(e) => handleInputChange('ageMonths', parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          {/* Weight Section */}
          <div className="space-y-2">
            <Label htmlFor="weightKg">Weight (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              min="0.5"
              max="300"
              step="0.1"
              value={patientData.weightKg}
              onChange={(e) => handleInputChange('weightKg', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Hours Since Injury */}
          <div className="space-y-2">
            <Label htmlFor="hoursSinceInjury">Hours Since Injury</Label>
            <Input
              id="hoursSinceInjury"
              type="number"
              min="0"
              max="168"
              step="0.5"
              value={patientData.hoursSinceInjury}
              onChange={(e) => handleInputChange('hoursSinceInjury', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Mechanism */}
          <div className="space-y-2">
            <Label htmlFor="mechanism">Mechanism of Injury</Label>
            <Input
              id="mechanism"
              placeholder="e.g., scalding, flame, contact"
              value={patientData.mechanism || ''}
              onChange={(e) => handleInputChange('mechanism', e.target.value)}
            />
          </div>

          {/* Special Sites */}
          <div className="space-y-2">
            <Label>Special Areas Involved</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(patientData.specialSites).map(([site, checked]) => (
                <label key={site} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => handleSpecialSiteChange(site, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{site}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Current TBSA Display */}
          {currentTbsa > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm font-medium">
                Current TBSA: <span className="text-lg font-bold">{currentTbsa}%</span>
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            Review Burn Plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
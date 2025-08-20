import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWizardStore } from '@/store/useWizardStore';
import { calculateTBSA } from '@/domain/tbsa';
import { calculateFluids } from '@/domain/fluids';
import { 
  sanitizeAgeInput, 
  sanitizeWeightInput, 
  sanitizeHoursInput,
  sanitizeStringInput,
  validatePatientData 
} from '@/domain/validation';
import { handleError, ValidationError } from '@/core/errorHandling';

interface InputFormProps {
  onReviewClick: () => void;
}

export default function InputForm({ onReviewClick }: InputFormProps) {
  const { patientData, regionSelections, setPatientData, setTbsaResult, setFluidResult } = useWizardStore();
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [ageUnit, setAgeUnit] = useState<'months' | 'years'>('months');

  // Helper to get displayed age value based on current unit
  const getDisplayedAge = () => {
    if (ageUnit === 'years') {
      return Math.round((patientData.ageMonths / 12) * 10) / 10; // Round to 1 decimal
    }
    return patientData.ageMonths;
  };

  // Helper to convert displayed age to months for storage
  const convertToMonths = (displayedAge: number) => {
    if (ageUnit === 'years') {
      return Math.round(displayedAge * 12);
    }
    return Math.round(displayedAge);
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    try {
      let sanitizedValue = value;
      
      // Apply field-specific sanitization
      switch (field) {
        case 'ageMonths': {
          // Convert displayed age to months before sanitizing
          const ageInMonths = convertToMonths(typeof value === 'string' ? parseFloat(value) || 0 : Number(value));
          sanitizedValue = sanitizeAgeInput(ageInMonths);
          break;
        }
        case 'weightKg':
          sanitizedValue = sanitizeWeightInput(value);
          break;
        case 'hoursSinceInjury':
          sanitizedValue = sanitizeHoursInput(value);
          break;
        case 'mechanism':
          sanitizedValue = sanitizeStringInput(value, {
            maxLength: 100,
            allowedChars: /^[a-zA-Z0-9\s.,\-()]+$/,
            fieldName: 'Mechanism of injury'
          });
          break;
        default:
          // For unknown fields, apply basic sanitization
          if (typeof value === 'string') {
            sanitizedValue = sanitizeStringInput(value, {
              maxLength: 50,
              fieldName: field
            });
          }
      }
      
      // Clear any existing error for this field
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      
      setPatientData({ [field]: sanitizedValue });
    } catch (error) {
      const validationError = handleError(error);
      setFieldErrors(prev => ({
        ...prev,
        [field]: validationError.userMessage
      }));
    }
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
      // Clear previous validation errors
      setValidationErrors([]);
      setFieldErrors({});
      
      // Comprehensive patient data validation
      const validation = validatePatientData(patientData);
      
      if (!validation.isValid) {
        const errors = validation.errors.map(error => handleError(new Error(error)));
        setValidationErrors(errors);
        
        // Set field-specific errors for better UX
        errors.forEach(error => {
          if (error.field) {
            setFieldErrors(prev => ({
              ...prev,
              [error.field!]: error.userMessage
            }));
          }
        });
        
        return; // Don't proceed with calculations
      }
      
      // Check if any field-level errors exist
      if (Object.keys(fieldErrors).length > 0) {
        return; // Don't proceed if there are field errors
      }
      
      // Additional safety check: ensure region selections exist
      if (regionSelections.length === 0) {
        setValidationErrors([handleError(new Error('At least one body region must be selected'))]);
        return;
      }
      
      // Calculate TBSA with enhanced error handling
      const tbsaResult = calculateTBSA(patientData.ageMonths, regionSelections);
      setTbsaResult(tbsaResult);
      
      // Show validation warnings if any
      if (tbsaResult.validation?.warnings.length) {
        console.warn('TBSA Clinical Warnings:', tbsaResult.validation.warnings);
      }

      // Calculate fluids with enhanced error handling
      const fluidResult = calculateFluids({
        weightKg: patientData.weightKg,
        tbsaPct: tbsaResult.tbsaPct,
        hoursSinceInjury: patientData.hoursSinceInjury,
      });
      setFluidResult(fluidResult);
      
      // Show fluid warnings if any
      if (fluidResult.validation?.warnings.length) {
        console.warn('Fluid Calculation Clinical Warnings:', fluidResult.validation.warnings);
      }

      onReviewClick();
    } catch (error) {
      const validationError = handleError(error);
      setValidationErrors([validationError]);
      
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Calculation error:', error);
      }
    }
  };

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

  return (
    <Card className="w-full burn-wizard-card animate-fade-in-up" data-element="patient-info">
      <CardHeader>
        <CardTitle className="burn-wizard-heading-md">Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-2">Please correct the following:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error.userMessage}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Age Section with Unit Toggle */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Label htmlFor="ageInput" className="flex-shrink-0">Age</Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAgeUnit('months')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    ageUnit === 'months' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Months
                </button>
                <button
                  type="button"
                  onClick={() => setAgeUnit('years')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    ageUnit === 'years' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Years
                </button>
              </div>
            </div>
            <Input
              id="ageInput"
              data-field="age"
              type="number"
              min="0"
              max={ageUnit === 'years' ? "100" : "1200"}
              step={ageUnit === 'years' ? "0.1" : "1"}
              value={getDisplayedAge()}
              onChange={(e) => handleInputChange('ageMonths', parseFloat(e.target.value) || 0)}
              className={`w-full ${fieldErrors.ageMonths ? 'border-red-500' : ''}`}
              placeholder={ageUnit === 'years' ? 'e.g., 2.5' : 'e.g., 30'}
            />
            <p className="text-xs text-muted-foreground">
              {ageUnit === 'years' ? 'Decimal values accepted (e.g., 2.5 years)' : 'Enter age in months'}
            </p>
            {fieldErrors.ageMonths && (
              <p className="text-sm text-red-600">{fieldErrors.ageMonths}</p>
            )}
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
              className={fieldErrors.weightKg ? 'border-red-500' : ''}
            />
            {fieldErrors.weightKg && (
              <p className="text-sm text-red-600">{fieldErrors.weightKg}</p>
            )}
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
              className={fieldErrors.hoursSinceInjury ? 'border-red-500' : ''}
            />
            {fieldErrors.hoursSinceInjury && (
              <p className="text-sm text-red-600">{fieldErrors.hoursSinceInjury}</p>
            )}
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
          <div className="space-y-2" data-field="special-sites">
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

          <Button type="submit" className="w-full burn-wizard-primary-button focus-ring touch-target" size="lg">
            Review Burn Plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
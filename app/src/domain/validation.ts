import { z } from 'zod';
import type { RegionKey, BurnFraction } from './types';

const VALID_FRACTIONS: BurnFraction[] = [0, 0.25, 0.5, 0.75, 1];

const VALID_REGIONS: RegionKey[] = [
  'Head',
  'Neck',
  'Ant_Trunk',
  'Post_Trunk',
  'R_Buttock',
  'L_Buttock',
  'Genitalia',
  'R_U_Arm',
  'L_U_Arm',
  'R_L_Arm',
  'L_L_Arm',
  'R_Hand',
  'L_Hand',
  'R_Thigh',
  'L_Thigh',
  'R_Leg',
  'L_Leg',
  'R_Foot',
  'L_Foot',
];

// Clinical range constants for validation
export const CLINICAL_RANGES = {
  AGE_MONTHS: { min: 0, max: 1200 },      // 0-100 years
  WEIGHT_KG: { min: 0.5, max: 300 },     // 0.5kg-300kg (premie to extreme obesity)
  TBSA_PERCENT: { min: 0, max: 100 },    // 0-100% body surface area
  HOURS_SINCE_INJURY: { min: 0, max: 168 }, // 0-7 days (168 hours)
  URINE_OUTPUT: { min: 0, max: 500 },    // 0-500ml/hr reasonable range
  HEART_RATE: { min: 30, max: 220 },     // Clinical heart rate range
  SYSTOLIC_BP: { min: 60, max: 250 },    // Clinical blood pressure range
  DIASTOLIC_BP: { min: 30, max: 150 },   // Clinical blood pressure range
  OXYGEN_SAT: { min: 70, max: 100 },     // Clinical oxygen saturation range
} as const;

export const regionSelectionSchema = z.object({
  region: z.enum(VALID_REGIONS as [RegionKey, ...RegionKey[]]),
  fraction: z.number().refine((val) => VALID_FRACTIONS.includes(val as BurnFraction)),
});

export const patientDataSchema = z.object({
  ageMonths: z.number()
    .min(CLINICAL_RANGES.AGE_MONTHS.min, 'Age cannot be negative')
    .max(CLINICAL_RANGES.AGE_MONTHS.max, 'Age exceeds maximum (100 years)')
    .refine(val => !isNaN(val) && isFinite(val), 'Age must be a valid number'),
  weightKg: z.number()
    .min(CLINICAL_RANGES.WEIGHT_KG.min, 'Weight must be at least 0.5kg')
    .max(CLINICAL_RANGES.WEIGHT_KG.max, 'Weight exceeds maximum (300kg)')
    .refine(val => !isNaN(val) && isFinite(val), 'Weight must be a valid number'),
  hoursSinceInjury: z.number()
    .min(CLINICAL_RANGES.HOURS_SINCE_INJURY.min, 'Hours since injury cannot be negative')
    .max(CLINICAL_RANGES.HOURS_SINCE_INJURY.max, 'Hours since injury exceeds maximum (7 days)')
    .refine(val => !isNaN(val) && isFinite(val), 'Hours since injury must be a valid number'),
  mechanism: z.string().optional(),
  specialSites: z.object({
    face: z.boolean(),
    hands: z.boolean(),
    feet: z.boolean(),
    perineum: z.boolean(),
    majorJoints: z.boolean(),
  }),
});

export const fluidParamsSchema = z.object({
  weightKg: z.number()
    .min(CLINICAL_RANGES.WEIGHT_KG.min, 'Weight must be at least 0.5kg')
    .max(CLINICAL_RANGES.WEIGHT_KG.max, 'Weight exceeds maximum (300kg)')
    .refine(val => !isNaN(val) && isFinite(val), 'Weight must be a valid number'),
  tbsaPct: z.number()
    .min(CLINICAL_RANGES.TBSA_PERCENT.min, 'TBSA cannot be negative')
    .max(CLINICAL_RANGES.TBSA_PERCENT.max, 'TBSA cannot exceed 100%')
    .refine(val => !isNaN(val) && isFinite(val), 'TBSA must be a valid number'),
  hoursSinceInjury: z.number()
    .min(CLINICAL_RANGES.HOURS_SINCE_INJURY.min, 'Hours since injury cannot be negative')
    .max(CLINICAL_RANGES.HOURS_SINCE_INJURY.max, 'Hours since injury exceeds maximum (7 days)')
    .refine(val => !isNaN(val) && isFinite(val), 'Hours since injury must be a valid number'),
});

// Advanced clinical validation schemas
export const vitalsSchema = z.object({
  heartRate: z.number()
    .min(CLINICAL_RANGES.HEART_RATE.min, 'Heart rate too low (minimum 30 bpm)')
    .max(CLINICAL_RANGES.HEART_RATE.max, 'Heart rate too high (maximum 220 bpm)')
    .optional(),
  systolicBP: z.number()
    .min(CLINICAL_RANGES.SYSTOLIC_BP.min, 'Systolic BP too low (minimum 60 mmHg)')
    .max(CLINICAL_RANGES.SYSTOLIC_BP.max, 'Systolic BP too high (maximum 250 mmHg)')
    .optional(),
  diastolicBP: z.number()
    .min(CLINICAL_RANGES.DIASTOLIC_BP.min, 'Diastolic BP too low (minimum 30 mmHg)')
    .max(CLINICAL_RANGES.DIASTOLIC_BP.max, 'Diastolic BP too high (maximum 150 mmHg)')
    .optional(),
  oxygenSat: z.number()
    .min(CLINICAL_RANGES.OXYGEN_SAT.min, 'Oxygen saturation too low (minimum 70%)')
    .max(CLINICAL_RANGES.OXYGEN_SAT.max, 'Oxygen saturation too high (maximum 100%)')
    .optional(),
}).refine(data => {
  // Additional validation: systolic > diastolic if both provided
  if (data.systolicBP && data.diastolicBP) {
    return data.systolicBP > data.diastolicBP;
  }
  return true;
}, {
  message: 'Systolic blood pressure must be higher than diastolic',
  path: ['systolicBP']
});

export const urineOutputSchema = z.object({
  mlPerHr: z.number()
    .min(CLINICAL_RANGES.URINE_OUTPUT.min, 'Urine output cannot be negative')
    .max(CLINICAL_RANGES.URINE_OUTPUT.max, 'Urine output exceeds reasonable maximum (500ml/hr)')
    .refine(val => !isNaN(val) && isFinite(val), 'Urine output must be a valid number'),
});

/**
 * Validates region selection array
 */
export function validateRegionSelections(selections: unknown[]): boolean {
  try {
    selections.forEach((selection) => {
      regionSelectionSchema.parse(selection);
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates patient data with detailed error reporting
 */
export function validatePatientData(data: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[] 
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const validatedData = patientDataSchema.parse(data);
    
    // Generate clinical warnings for edge cases
    if (validatedData.ageMonths < 12) {
      warnings.push('Infant patient (< 1 year): Consider neonatal burn protocols');
    }
    
    if (validatedData.weightKg < 3) {
      warnings.push('Very low weight (< 3kg): Verify weight accuracy and consider specialized protocols');
    }
    
    if (validatedData.weightKg > 150) {
      warnings.push('High weight (> 150kg): Consider bariatric considerations for fluid management');
    }
    
    if (validatedData.hoursSinceInjury > 24) {
      warnings.push('Injury > 24 hours ago: Parkland formula primarily intended for first 24 hours');
    }
    
    return { isValid: true, errors: [], warnings };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      errors.push(...(error as { errors: { message: string }[] }).errors.map((e: { message: string }) => e.message));
    } else {
      errors.push('Invalid patient data format');
    }
    return { isValid: false, errors, warnings: [] };
  }
}

/**
 * Validates TBSA calculation inputs with clinical context
 */
export function validateTBSAInputs(ageMonths: number, totalTbsa: number): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Age validation
  if (ageMonths < CLINICAL_RANGES.AGE_MONTHS.min || ageMonths > CLINICAL_RANGES.AGE_MONTHS.max) {
    errors.push(`Age must be between 0 and 100 years`);
  }
  
  // TBSA validation with clinical context
  if (totalTbsa < 0 || totalTbsa > 100) {
    errors.push('Total TBSA must be between 0% and 100%');
  }
  
  // Clinical warnings
  if (totalTbsa > 90) {
    warnings.push('TBSA > 90%: Extremely severe burn, consider comfort care consultation');
  } else if (totalTbsa > 60) {
    warnings.push('TBSA > 60%: Major burn, requires burn center care');
  } else if (totalTbsa > 30) {
    warnings.push('TBSA > 30%: Significant burn, consider burn center consultation');
  } else if (totalTbsa > 15 && ageMonths < 60) {
    warnings.push('TBSA > 15% in child: Consider burn center consultation');
  }
  
  if (totalTbsa < 1 && totalTbsa > 0) {
    warnings.push('Very small burn area: Verify region selections are accurate');
  }
  
  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validates fluid calculation inputs with clinical warnings
 */
export function validateFluidInputs(
  weightKg: number, 
  tbsaPct: number, 
  hoursSinceInjury: number
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    fluidParamsSchema.parse({ weightKg, tbsaPct, hoursSinceInjury });
    
    // Clinical warnings for fluid management
    if (tbsaPct < 10) {
      warnings.push('TBSA < 10%: Parkland formula typically reserved for burns ≥ 10% TBSA');
    }
    
    if (weightKg < 10) {
      warnings.push('Weight < 10kg: Consider pediatric fluid management protocols');
    }
    
    if (hoursSinceInjury > 8) {
      warnings.push('Injury > 8 hours: Past peak resuscitation phase, adjust rates accordingly');
    }
    
    if (hoursSinceInjury > 24) {
      warnings.push('Injury > 24 hours: Consider maintenance fluids primarily');
    }
    
    // Calculate total fluid for warning
    const totalMl = 4 * weightKg * tbsaPct;
    if (totalMl > 20000) {
      warnings.push('Very high fluid volume: Monitor for fluid overload, consider modified protocols');
    }
    
    return { isValid: true, errors: [], warnings };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      errors.push(...(error as { errors: { message: string }[] }).errors.map((e: { message: string }) => e.message));
    } else {
      errors.push('Invalid fluid calculation parameters');
    }
    return { isValid: false, errors, warnings: [] };
  }
}

/**
 * Input sanitization utilities for security hardening
 */

/**
 * Sanitizes and validates numeric input
 * @param input - Raw input value
 * @param options - Validation options
 * @returns Sanitized number or throws error
 */
export function sanitizeNumericInput(
  input: unknown,
  options: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
    fieldName: string;
  }
): number {
  const { min, max, allowDecimals = true, fieldName } = options;
  
  // Type coercion safety
  if (input === null || input === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  
  // Handle string inputs (from form fields)
  let numValue: number;
  if (typeof input === 'string') {
    // Remove whitespace and check for empty string
    const trimmed = input.trim();
    if (trimmed === '') {
      throw new Error(`${fieldName} cannot be empty`);
    }
    
    // Check for malicious input patterns
    if (!/^-?\d*\.?\d*$/.test(trimmed)) {
      throw new Error(`${fieldName} contains invalid characters`);
    }
    
    numValue = Number(trimmed);
  } else if (typeof input === 'number') {
    numValue = input;
  } else {
    throw new Error(`${fieldName} must be a number`);
  }
  
  // Validate the number
  if (!Number.isFinite(numValue)) {
    throw new Error(`${fieldName} must be a finite number`);
  }
  
  if (Number.isNaN(numValue)) {
    throw new Error(`${fieldName} is not a valid number`);
  }
  
  // Decimal validation
  if (!allowDecimals && !Number.isInteger(numValue)) {
    throw new Error(`${fieldName} must be a whole number`);
  }
  
  // Range validation
  if (min !== undefined && numValue < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== undefined && numValue > max) {
    throw new Error(`${fieldName} must not exceed ${max}`);
  }
  
  return numValue;
}

/**
 * Sanitizes string input to prevent injection attacks
 * @param input - Raw string input
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeStringInput(
  input: unknown,
  options: {
    maxLength?: number;
    allowedChars?: RegExp;
    fieldName: string;
  }
): string {
  const { maxLength, allowedChars, fieldName } = options;
  
  if (typeof input !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  
  // Basic length validation
  if (maxLength && input.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }
  
  // Character validation
  if (allowedChars && !allowedChars.test(input)) {
    throw new Error(`${fieldName} contains invalid characters`);
  }
  
  // Remove potentially dangerous characters
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  return sanitized;
}

/**
 * Validates and sanitizes patient age input
 * @param input - Raw age input
 * @returns Sanitized age in months
 */
export function sanitizeAgeInput(input: unknown): number {
  return sanitizeNumericInput(input, {
    min: CLINICAL_RANGES.AGE_MONTHS.min,
    max: CLINICAL_RANGES.AGE_MONTHS.max,
    allowDecimals: true,
    fieldName: 'Age'
  });
}

/**
 * Validates and sanitizes weight input
 * @param input - Raw weight input
 * @returns Sanitized weight in kg
 */
export function sanitizeWeightInput(input: unknown): number {
  return sanitizeNumericInput(input, {
    min: CLINICAL_RANGES.WEIGHT_KG.min,
    max: CLINICAL_RANGES.WEIGHT_KG.max,
    allowDecimals: true,
    fieldName: 'Weight'
  });
}

/**
 * Validates and sanitizes TBSA percentage input
 * @param input - Raw TBSA input
 * @returns Sanitized TBSA percentage
 */
export function sanitizeTBSAInput(input: unknown): number {
  return sanitizeNumericInput(input, {
    min: CLINICAL_RANGES.TBSA_PERCENT.min,
    max: CLINICAL_RANGES.TBSA_PERCENT.max,
    allowDecimals: true,
    fieldName: 'TBSA Percentage'
  });
}

/**
 * Validates and sanitizes hours since injury input
 * @param input - Raw hours input
 * @returns Sanitized hours since injury
 */
export function sanitizeHoursInput(input: unknown): number {
  return sanitizeNumericInput(input, {
    min: CLINICAL_RANGES.HOURS_SINCE_INJURY.min,
    max: CLINICAL_RANGES.HOURS_SINCE_INJURY.max,
    allowDecimals: true,
    fieldName: 'Hours since injury'
  });
}

/**
 * Validates vital signs with clinical interpretation
 */
export function validateVitals(vitals: {
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  oxygenSat?: number;
}): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    vitalsSchema.parse(vitals);
    
    // Clinical interpretation warnings
    if (vitals.heartRate && vitals.heartRate > 100) {
      warnings.push('Tachycardia: Monitor for signs of shock or pain');
    }
    
    if (vitals.systolicBP && vitals.systolicBP < 90) {
      warnings.push('Hypotension: May indicate inadequate resuscitation');
    }
    
    if (vitals.oxygenSat && vitals.oxygenSat < 95) {
      warnings.push('Low oxygen saturation: Consider respiratory complications');
    }
    
    return { isValid: true, errors: [], warnings };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      errors.push(...(error as { errors: { message: string }[] }).errors.map((e: { message: string }) => e.message));
    } else {
      errors.push('Invalid vital signs data');
    }
    return { isValid: false, errors, warnings: [] };
  }
}
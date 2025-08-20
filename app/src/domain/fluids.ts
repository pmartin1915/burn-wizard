/**
 * Fluid Resuscitation and Management Module
 * 
 * This module implements the Parkland Formula and comprehensive fluid management
 * protocols for burn patients. It includes:
 * 
 * 1. PARKLAND FORMULA: 4ml/kg × %TBSA × weight(kg)
 *    - First 8 hours: 50% of total (higher capillary leak)
 *    - Next 16 hours: 50% of total (maintenance phase)
 * 
 * 2. MONITORING PROTOCOLS:
 *    - Urine output targets: 30-50ml/hr (adults >20kg)
 *    - Rate adjustments: ±20% based on urine output
 *    - Vital sign stability: HR <60, BP >90/60, SaO2 >90%
 * 
 * 3. FLUID TYPES:
 *    - Resuscitation: Lactated Ringers (LR)
 *    - Maintenance: D5 1/2 NS + 20mEq KCl/L
 * 
 * 4. EDUCATIONAL FEATURES:
 *    - Clinical decision support
 *    - Protocol explanations
 *    - Safety validation
 * 
 * AI Development Notes:
 * - All functions are pure and deterministic
 * - Comprehensive test coverage in __tests__/fluids.test.ts
 * - Time calculations are critical - test edge cases
 * - Weight thresholds affect protocol selection (>20kg vs pediatric)
 * - Hospital-validated protocols - maintain clinical accuracy
 */

import type { FluidResult, FluidPhase } from './types';
import { round1 } from '@/lib/utils';
import { validateFluidInputs } from './validation';

/**
 * Calculates maintenance fluid requirements using Holliday-Segar (4-2-1) method
 * @param weightKg - Patient weight in kg
 * @returns Maintenance fluid rate in ml/hr
 */
function calcMaintenanceFluids(weightKg: number): number {
  if (weightKg <= 0) throw new Error('Weight must be positive');
  
  let maintenanceMlPerHr = 0;
  
  // First 10kg: 4 ml/kg/hr
  if (weightKg <= 10) {
    maintenanceMlPerHr = weightKg * 4;
  } else if (weightKg <= 20) {
    // First 10kg: 4 ml/kg/hr, next 10kg: 2 ml/kg/hr
    maintenanceMlPerHr = 10 * 4 + (weightKg - 10) * 2;
  } else {
    // First 10kg: 4 ml/kg/hr, next 10kg: 2 ml/kg/hr, remaining: 1 ml/kg/hr
    maintenanceMlPerHr = 10 * 4 + 10 * 2 + (weightKg - 20) * 1;
  }
  
  return round1(maintenanceMlPerHr);
}

/**
 * Calculates fluid resuscitation using Parkland formula with temporal adjustments
 * @param params - Calculation parameters
 * @returns Comprehensive fluid calculation result
 */
export function calculateFluids(params: {
  weightKg: number;
  tbsaPct: number;
  hoursSinceInjury: number;
}): FluidResult {
  const { weightKg, tbsaPct, hoursSinceInjury } = params;
  
  // Enhanced input validation with centralized validators
  const validation = validateFluidInputs(weightKg, tbsaPct, hoursSinceInjury);
  
  if (!validation.isValid) {
    throw new Error(`Fluid calculation validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Additional safety checks for malformed inputs
  if (!Number.isFinite(weightKg) || !Number.isFinite(tbsaPct) || !Number.isFinite(hoursSinceInjury)) {
    throw new Error('All input parameters must be finite numbers');
  }
  
  // Prevent negative or extreme values that passed basic validation
  if (weightKg <= 0) throw new Error('Weight must be positive');
  if (tbsaPct < 0 || tbsaPct > 100) throw new Error('TBSA must be between 0 and 100');
  if (hoursSinceInjury < 0) throw new Error('Hours since injury cannot be negative');
  
  // Parkland formula: 4 ml × weight(kg) × %TBSA
  const totalMl = 4 * weightKg * tbsaPct;
  const first8hMl = totalMl / 2;
  const next16hMl = totalMl / 2;
  
  // Calculate what should have been delivered by now
  let deliveredFirst8hMl = 0;
  let remainingFirst8hMl = first8hMl;
  let remainingNext16hMl = next16hMl;
  let currentPhase: FluidPhase = 'first8';
  let rateNowMlPerHr = 0;
  
  if (hoursSinceInjury < 8) {
    // Still in first 8 hours
    deliveredFirst8hMl = (hoursSinceInjury / 8) * first8hMl;
    remainingFirst8hMl = first8hMl - deliveredFirst8hMl;
    rateNowMlPerHr = remainingFirst8hMl / (8 - hoursSinceInjury);
    currentPhase = 'first8';
  } else if (hoursSinceInjury <= 24) {
    // In second phase (8-24 hours)
    deliveredFirst8hMl = first8hMl;
    remainingFirst8hMl = 0;
    
    const hoursIntoSecondPhase = hoursSinceInjury - 8;
    const deliveredNext16hMl = (hoursIntoSecondPhase / 16) * next16hMl;
    remainingNext16hMl = next16hMl - deliveredNext16hMl;
    rateNowMlPerHr = remainingNext16hMl / (24 - hoursSinceInjury);
    currentPhase = 'next16';
  } else {
    // Beyond 24 hours - switch to maintenance only
    deliveredFirst8hMl = first8hMl;
    remainingFirst8hMl = 0;
    remainingNext16hMl = 0;
    rateNowMlPerHr = 0;
    currentPhase = 'next16';
  }
  
  // Generate timeline for visualization
  const timeline = [];
  for (let hour = 0; hour <= 24; hour++) {
    let targetCumulativeMl = 0;
    let phase: FluidPhase = 'first8';
    
    if (hour < 8) {
      targetCumulativeMl = (hour / 8) * first8hMl;
      phase = 'first8';
    } else {
      targetCumulativeMl = first8hMl + ((hour - 8) / 16) * next16hMl;
      phase = 'next16';
    }
    
    timeline.push({
      hourFromInjury: hour,
      targetCumulativeMl: round1(targetCumulativeMl),
      phase,
    });
  }
  
  // Calculate maintenance fluids
  const maintenanceMlPerHr = calcMaintenanceFluids(weightKg);
  
  // Generate notice for small burns
  let notice: string | undefined;
  if (tbsaPct < 10) {
    notice = 'Note: Parkland formula is typically indicated for burns ≥10% TBSA. Consider local protocol for smaller burns.';
  }
  
  // Log warnings for clinical awareness (in development mode)
  if (validation.warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('Fluid Calculation Clinical Warnings:', validation.warnings);
  }

  return {
    parkland: {
      totalMl: round1(totalMl),
      first8hMl: round1(first8hMl),
      next16hMl: round1(next16hMl),
      deliveredFirst8hMl: round1(deliveredFirst8hMl),
      remainingFirst8hMl: round1(Math.max(0, remainingFirst8hMl)),
      remainingNext16hMl: round1(Math.max(0, remainingNext16hMl)),
      rateNowMlPerHr: round1(Math.max(0, rateNowMlPerHr)),
      phase: currentPhase,
    },
    maintenance: {
      mlPerHr: maintenanceMlPerHr,
      method: '4-2-1',
    },
    timeline,
    notice,
    validation: {
      warnings: validation.warnings,
      clinicalFlags: validation.warnings.length > 0
    }
  };
}

/**
 * Converts ml/hr rate to ml/kg/hr for weight-based dosing
 * @param mlPerHr - Rate in ml/hr
 * @param weightKg - Patient weight in kg
 * @returns Rate in ml/kg/hr
 */
export function convertToMlPerKgPerHr(mlPerHr: number, weightKg: number): number {
  if (weightKg <= 0) throw new Error('Weight must be positive');
  return round1(mlPerHr / weightKg);
}

/**
 * Estimates urine output target (0.5-1 ml/kg/hr for adults, 1-2 ml/kg/hr for children)
 * @param weightKg - Patient weight in kg
 * @param ageMonths - Patient age in months
 * @returns Target urine output range in ml/hr
 */
/**
 * Adjusts IV fluid rate based on urine output monitoring per protocol
 * @param currentRateMlPerHr - Current IV fluid rate in ml/hr  
 * @param urineOutputMlPerHr - Current urine output in ml/hr
 * @returns New recommended IV fluid rate and adjustment recommendation
 */
export function adjustFluidRateByUrineOutput(
  currentRateMlPerHr: number, 
  urineOutputMlPerHr: number
): {
  newRateMlPerHr: number;
  adjustment: 'increase' | 'maintain' | 'decrease';
  reason: string;
} {
  if (currentRateMlPerHr < 0) throw new Error('Current rate must be non-negative');
  if (urineOutputMlPerHr < 0) throw new Error('Urine output must be non-negative');
  
  if (urineOutputMlPerHr < 30) {
    return {
      newRateMlPerHr: round1(currentRateMlPerHr * 1.2),
      adjustment: 'increase',
      reason: 'Urine output <30ml/hr - Increase IV rate by 20%'
    };
  } else if (urineOutputMlPerHr > 50) {
    return {
      newRateMlPerHr: round1(currentRateMlPerHr * 0.8),
      adjustment: 'decrease', 
      reason: 'Urine output >50ml/hr - Decrease IV rate by 20%'
    };
  } else {
    return {
      newRateMlPerHr: currentRateMlPerHr,
      adjustment: 'maintain',
      reason: 'Urine output 30-50ml/hr - Maintain current IV rate'
    };
  }
}

/**
 * Assesses patient stability based on vital signs per protocol
 * @param vitals - Patient vital signs
 * @returns Stability assessment and recommendations
 */
export function assessVitalStability(vitals: {
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  oxygenSat?: number;
}): {
  isStable: boolean;
  unstableReasons: string[];
  recommendations: string[];
} {
  const unstableReasons: string[] = [];
  const recommendations: string[] = [];
  
  // Protocol targets: HR <60, BP >90/60, SaO2 >90
  if (vitals.heartRate !== undefined && vitals.heartRate >= 60) {
    unstableReasons.push('Heart rate ≥60 bpm');
    recommendations.push('Monitor heart rate - target <60 bpm');
  }
  
  if (vitals.systolicBP !== undefined && vitals.systolicBP <= 90) {
    unstableReasons.push('Systolic BP ≤90 mmHg');
    recommendations.push('Monitor blood pressure - target >90/60 mmHg');
  }
  
  if (vitals.diastolicBP !== undefined && vitals.diastolicBP <= 60) {
    unstableReasons.push('Diastolic BP ≤60 mmHg'); 
    recommendations.push('Monitor blood pressure - target >90/60 mmHg');
  }
  
  if (vitals.oxygenSat !== undefined && vitals.oxygenSat <= 90) {
    unstableReasons.push('Oxygen saturation ≤90%');
    recommendations.push('Monitor oxygen saturation - target >90%');
  }
  
  const isStable = unstableReasons.length === 0;
  
  if (isStable) {
    recommendations.push('Patient vitally stable - continue hourly monitoring');
  }
  
  return {
    isStable,
    unstableReasons,
    recommendations
  };
}

/**
 * Protocol-based urine output target (30-50ml/hr for >20kg patients)
 * @param weightKg - Patient weight in kg
 * @param ageMonths - Patient age in months (for weight-based calculation if <20kg)
 * @returns Target urine output range in ml/hr
 */
export function calcUrineOutputTarget(weightKg: number, ageMonths: number): { min: number; max: number; method: string } {
  if (weightKg <= 0) throw new Error('Weight must be positive');
  if (ageMonths < 0) throw new Error('Age cannot be negative');
  
  // Protocol specifies 30-50ml/hr for patients >20kg
  if (weightKg > 20) {
    return {
      min: 30,
      max: 50, 
      method: 'protocol (>20kg)'
    };
  }
  
  // For smaller patients, use weight-based calculation
  let minMlPerKgPerHr: number;
  let maxMlPerKgPerHr: number;
  
  if (ageMonths < 180) { // Under 15 years
    minMlPerKgPerHr = 1;
    maxMlPerKgPerHr = 2;
  } else {
    minMlPerKgPerHr = 0.5;
    maxMlPerKgPerHr = 1;
  }
  
  return {
    min: round1(minMlPerKgPerHr * weightKg),
    max: round1(maxMlPerKgPerHr * weightKg),
    method: 'weight-based (≤20kg)'
  };
}

/**
 * Determines appropriate fluid types based on clinical protocol
 * @param isResuscitation - Whether this is resuscitation vs maintenance fluid
 * @param canToleratePO - Whether patient can tolerate oral intake
 * @returns Fluid type recommendations
 */
export function getFluidTypeRecommendation(
  isResuscitation: boolean,
  canToleratePO: boolean = false
): {
  primaryFluid: string;
  route: string;
  notes: string;
} {
  if (isResuscitation) {
    return {
      primaryFluid: 'LR (Lactated Ringers)',
      route: 'IV',
      notes: 'Primary fluid for burn resuscitation - calculate based on time from injury'
    };
  } else {
    return {
      primaryFluid: 'D5 1/2 NS + 20mEq KCl/L',
      route: canToleratePO ? 'PO (preferred)' : 'IV',
      notes: 'Maintenance fluid - oral preferred if patient tolerates, IV if not'
    };
  }
}

/**
 * Comprehensive burn fluid management assessment following clinical protocol
 * 
 * This is the main integrated function that combines all fluid management protocols:
 * 
 * WORKFLOW:
 * 1. Calculate Parkland formula requirements
 * 2. Determine appropriate urine output targets  
 * 3. Assess need for fluid rate adjustments
 * 4. Evaluate vital sign stability
 * 5. Recommend fluid types and routes
 * 6. Generate clinical recommendations
 * 
 * CLINICAL DECISION LOGIC:
 * - Weight >20kg: Use adult protocol (30-50ml/hr urine target)
 * - Weight ≤20kg: Use pediatric modifications
 * - Vital instability: Consider maintenance fluids
 * - Time-based phases: Adjust recommendations by injury timeline
 * 
 * EDUCATIONAL VALUE:
 * - Provides complete protocol guidance
 * - Explains clinical rationale
 * - Includes safety considerations
 * - Documents all decision points
 * 
 * @param params - Complete patient and monitoring data
 * @returns Comprehensive assessment with all clinical recommendations
 * 
 * AI Development Notes:
 * - This function integrates all other fluid management functions
 * - Test with various patient scenarios (infant, child, adult)
 * - Modify protocolRecommendations array to add new guidance
 * - All clinical logic is evidence-based and hospital-validated
 */
export function assessBurnFluidManagement(params: {
  weightKg: number;
  tbsaPct: number;
  ageMonths: number;
  hoursSinceInjury: number;
  currentIVRateMlPerHr: number;
  urineOutputMlPerHr: number;
  vitals: {
    heartRate?: number;
    systolicBP?: number;
    diastolicBP?: number;
    oxygenSat?: number;
  };
  canToleratePO?: boolean;
}): {
  parklandCalculation: ReturnType<typeof calculateFluids>;
  urineOutputTarget: ReturnType<typeof calcUrineOutputTarget>;
  fluidRateAdjustment: ReturnType<typeof adjustFluidRateByUrineOutput>;
  vitalStability: ReturnType<typeof assessVitalStability>;
  resuscitationFluid: ReturnType<typeof getFluidTypeRecommendation>;
  maintenanceFluid: ReturnType<typeof getFluidTypeRecommendation>;
  needsMaintenanceFluid: boolean;
  protocolRecommendations: string[];
  clinicalNotes: string[];
} {
  const {
    weightKg,
    tbsaPct,
    ageMonths,
    hoursSinceInjury,
    currentIVRateMlPerHr,
    urineOutputMlPerHr,
    vitals,
    canToleratePO = false
  } = params;

  // Core calculations
  const parklandCalculation = calculateFluids({ weightKg, tbsaPct, hoursSinceInjury });
  const urineOutputTarget = calcUrineOutputTarget(weightKg, ageMonths);
  const fluidRateAdjustment = adjustFluidRateByUrineOutput(currentIVRateMlPerHr, urineOutputMlPerHr);
  const vitalStability = assessVitalStability(vitals);
  
  // Fluid type recommendations
  const resuscitationFluid = getFluidTypeRecommendation(true, false);
  const maintenanceFluid = getFluidTypeRecommendation(false, canToleratePO);
  
  // Determine if maintenance fluid is needed (weight unstable or specific protocol criteria)
  const needsMaintenanceFluid = !vitalStability.isStable || weightKg <= 20;
  
  // Generate protocol recommendations
  const protocolRecommendations: string[] = [];
  const clinicalNotes: string[] = [];
  
  // Weight threshold check
  if (weightKg > 20) {
    clinicalNotes.push('Patient >20kg - using adult burn protocol');
    protocolRecommendations.push('Monitor urine output hourly (target: 30-50ml/hr)');
  } else {
    clinicalNotes.push('Patient ≤20kg - consider pediatric modifications to protocol');
  }
  
  // Urine output assessment
  if (urineOutputMlPerHr < urineOutputTarget.min || urineOutputMlPerHr > urineOutputTarget.max) {
    protocolRecommendations.push(`Urine output (${urineOutputMlPerHr}ml/hr) outside target range (${urineOutputTarget.min}-${urineOutputTarget.max}ml/hr)`);
    protocolRecommendations.push(fluidRateAdjustment.reason);
  } else {
    protocolRecommendations.push('Urine output within target range - continue current monitoring');
  }
  
  // Vital stability recommendations
  protocolRecommendations.push(...vitalStability.recommendations);
  
  // Maintenance fluid recommendations
  if (needsMaintenanceFluid) {
    protocolRecommendations.push(`Consider adding maintenance fluid: ${maintenanceFluid.primaryFluid} at ${parklandCalculation.maintenance.mlPerHr}ml/hr`);
    protocolRecommendations.push(`Route: ${maintenanceFluid.route}`);
  }
  
  // Time-based recommendations
  if (hoursSinceInjury < 8) {
    clinicalNotes.push('Currently in first 8 hours - critical resuscitation phase');
    protocolRecommendations.push('Monitor closely - majority of fluid given in first 8 hours');
  } else if (hoursSinceInjury <= 24) {
    clinicalNotes.push('Currently in 8-24 hour phase - transition period');
    protocolRecommendations.push('Consider transitioning to maintenance-focused management');
  } else {
    clinicalNotes.push('Beyond 24 hours - maintenance phase');
    protocolRecommendations.push('Primary focus on maintenance fluid requirements');
  }
  
  // Documentation reminders
  protocolRecommendations.push('Document hourly urine output, fluid rate changes, and rationale');
  
  return {
    parklandCalculation,
    urineOutputTarget,
    fluidRateAdjustment,
    vitalStability,
    resuscitationFluid,
    maintenanceFluid,
    needsMaintenanceFluid,
    protocolRecommendations,
    clinicalNotes
  };
}

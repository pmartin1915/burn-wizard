import type { FluidResult, FluidPhase } from './types';
import { round1 } from '@/lib/utils';

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
export function calcFluids(params: {
  weightKg: number;
  tbsaPct: number;
  hoursSinceInjury: number;
}): FluidResult {
  const { weightKg, tbsaPct, hoursSinceInjury } = params;
  
  // Input validation
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
  
  if (hoursSinceInjury <= 8) {
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
    
    if (hour <= 8) {
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
export function calcUrineOutputTarget(weightKg: number, ageMonths: number): { min: number; max: number } {
  if (weightKg <= 0) throw new Error('Weight must be positive');
  if (ageMonths < 0) throw new Error('Age cannot be negative');
  
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
  };
}
import { describe, it, expect } from 'vitest';
import { 
  calculateFluids, 
  calcUrineOutputTarget, 
  adjustFluidRateByUrineOutput,
  assessVitalStability,
  getFluidTypeRecommendation,
  assessBurnFluidManagement
} from '../fluids';

describe('calculateFluids', () => {
  it('should calculate Parkland formula correctly for infant example', () => {
    const result = calculateFluids({
      weightKg: 8,
      tbsaPct: 12,
      hoursSinceInjury: 2,
    });
    
    expect(result.parkland.totalMl).toBeCloseTo(384, 1);
    expect(result.parkland.first8hMl).toBeCloseTo(192, 1);
    expect(result.parkland.next16hMl).toBeCloseTo(192, 1);
    expect(result.maintenance.mlPerHr).toBeCloseTo(32, 1); // 4*8
  });

  it('should calculate correctly for adolescent at 10h', () => {
    const result = calculateFluids({
      weightKg: 60,
      tbsaPct: 20,
      hoursSinceInjury: 10,
    });
    
    expect(result.parkland.totalMl).toBeCloseTo(4800, 1);
    expect(result.parkland.phase).toBe('next16');
    expect(result.parkland.deliveredFirst8hMl).toBeCloseTo(2400, 1);
    expect(result.maintenance.mlPerHr).toBeCloseTo(100, 1); // 40+20+40
  });

  it('should provide notice for small burns', () => {
    const result = calculateFluids({
      weightKg: 70,
      tbsaPct: 8,
      hoursSinceInjury: 1,
    });
    
    expect(result.notice).toContain('10% TBSA');
  });

  it('should handle edge cases', () => {
    expect(() => calculateFluids({ weightKg: 0, tbsaPct: 10, hoursSinceInjury: 0 })).toThrow();
    expect(() => calculateFluids({ weightKg: 70, tbsaPct: -1, hoursSinceInjury: 0 })).toThrow();
    expect(() => calculateFluids({ weightKg: 70, tbsaPct: 101, hoursSinceInjury: 0 })).toThrow();
  });
});

describe('calcUrineOutputTarget', () => {
  it('should use protocol targets for patients >20kg', () => {
    const adult = calcUrineOutputTarget(70, 300); // 25 year old, 70kg
    expect(adult.min).toBe(30);
    expect(adult.max).toBe(50);
    expect(adult.method).toBe('protocol (>20kg)');
  });
  
  it('should use weight-based calculation for patients ≤20kg', () => {
    const child = calcUrineOutputTarget(15, 60); // 5 year old, 15kg  
    expect(child.min).toBe(15);
    expect(child.max).toBe(30);
    expect(child.method).toBe('weight-based (≤20kg)');
  });
});

describe('adjustFluidRateByUrineOutput', () => {
  it('should increase rate by 20% when urine output <30ml/hr', () => {
    const result = adjustFluidRateByUrineOutput(100, 25);
    expect(result.newRateMlPerHr).toBe(120);
    expect(result.adjustment).toBe('increase');
    expect(result.reason).toContain('20%');
  });
  
  it('should maintain rate when urine output 30-50ml/hr', () => {
    const result = adjustFluidRateByUrineOutput(100, 40);
    expect(result.newRateMlPerHr).toBe(100);
    expect(result.adjustment).toBe('maintain');
  });
  
  it('should decrease rate by 20% when urine output >50ml/hr', () => {
    const result = adjustFluidRateByUrineOutput(100, 60);
    expect(result.newRateMlPerHr).toBe(80);
    expect(result.adjustment).toBe('decrease');
  });
});

describe('assessVitalStability', () => {
  it('should identify stable patient', () => {
    const result = assessVitalStability({
      heartRate: 55,
      systolicBP: 95,
      diastolicBP: 65,
      oxygenSat: 95
    });
    expect(result.isStable).toBe(true);
    expect(result.unstableReasons).toHaveLength(0);
  });
  
  it('should identify unstable vital signs', () => {
    const result = assessVitalStability({
      heartRate: 125,  // Tachycardia - concerning in burn patients
      systolicBP: 85,   // Hypotension
      oxygenSat: 88     // Hypoxemia
    });
    expect(result.isStable).toBe(false);
    expect(result.unstableReasons).toHaveLength(3);
  });
});

describe('getFluidTypeRecommendation', () => {
  it('should recommend LR for resuscitation', () => {
    const result = getFluidTypeRecommendation(true, false);
    expect(result.primaryFluid).toBe('LR (Lactated Ringers)');
    expect(result.route).toBe('IV');
  });
  
  it('should recommend D5 1/2 NS + KCl for maintenance', () => {
    const result = getFluidTypeRecommendation(false, true);
    expect(result.primaryFluid).toBe('D5 1/2 NS + 20mEq KCl/L');
    expect(result.route).toBe('PO (preferred)');
  });
});

// Comprehensive test coverage for complex scenarios
describe('assessBurnFluidManagement', () => {
  it('should provide complete clinical assessment for pediatric patient', () => {
    const params = {
      weightKg: 15,
      tbsaPct: 18,
      ageMonths: 48, // 4 years old
      hoursSinceInjury: 3,
      currentIVRateMlPerHr: 50,
      urineOutputMlPerHr: 20,
      vitals: {
        heartRate: 55,
        systolicBP: 95,
        diastolicBP: 65,
        oxygenSat: 96
      },
      canToleratePO: false
    };

    const result = assessBurnFluidManagement(params);
    
    // Verify all components are present
    expect(result.parklandCalculation).toBeDefined();
    expect(result.urineOutputTarget).toBeDefined();
    expect(result.fluidRateAdjustment).toBeDefined();
    expect(result.vitalStability).toBeDefined();
    expect(result.protocolRecommendations).toBeInstanceOf(Array);
    expect(result.clinicalNotes).toBeInstanceOf(Array);
    
    // Should need maintenance fluid for pediatric patient
    expect(result.needsMaintenanceFluid).toBe(true);
    
    // Should identify low urine output
    expect(result.fluidRateAdjustment.adjustment).toBe('increase');
  });

  it('should handle adult patient with stable vitals', () => {
    const params = {
      weightKg: 70,
      tbsaPct: 25,
      ageMonths: 300, // 25 years old
      hoursSinceInjury: 6,
      currentIVRateMlPerHr: 200,
      urineOutputMlPerHr: 40,
      vitals: {
        heartRate: 55,
        systolicBP: 110,
        diastolicBP: 70,
        oxygenSat: 98
      },
      canToleratePO: false
    };

    const result = assessBurnFluidManagement(params);
    
    // Adult protocol should be used
    expect(result.urineOutputTarget.method).toBe('protocol (>20kg)');
    expect(result.urineOutputTarget.min).toBe(30);
    expect(result.urineOutputTarget.max).toBe(50);
    
    // Stable vitals should be detected
    expect(result.vitalStability.isStable).toBe(true);
    
    // Urine output within range
    expect(result.fluidRateAdjustment.adjustment).toBe('maintain');
  });
});

// Performance and accuracy testing
describe('Calculation Performance', () => {
  it('should calculate fluids quickly for multiple scenarios', () => {
    const startTime = performance.now();
    
    // Run 1000 fluid calculations
    for (let i = 0; i < 1000; i++) {
      calculateFluids({
        weightKg: 50 + (i % 50), // Vary weight
        tbsaPct: 10 + (i % 30),  // Vary TBSA
        hoursSinceInjury: i % 24 // Vary time
      });
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Should complete 1000 calculations in under 100ms
    expect(totalTime).toBeLessThan(100);
  });

  it('should be deterministic across multiple runs', () => {
    const params = {
      weightKg: 25,
      tbsaPct: 15,
      hoursSinceInjury: 4
    };
    
    const result1 = calculateFluids(params);
    const result2 = calculateFluids(params);
    
    expect(result1.parkland.totalMl).toBe(result2.parkland.totalMl);
    expect(result1.parkland.rateNowMlPerHr).toBe(result2.parkland.rateNowMlPerHr);
    expect(result1.maintenance.mlPerHr).toBe(result2.maintenance.mlPerHr);
  });
});

// Edge case testing
describe('Edge Cases and Clinical Boundaries', () => {
  it('should handle minimum weight patient', () => {
    const result = calculateFluids({
      weightKg: 0.5, // Minimum viable weight
      tbsaPct: 20,
      hoursSinceInjury: 0
    });
    
    expect(result.parkland.totalMl).toBe(40); // 4 * 0.5 * 20 = 40ml
    expect(result.maintenance.mlPerHr).toBe(2); // 4 * 0.5 = 2ml/hr
  });

  it('should handle maximum TBSA scenario', () => {
    const result = calculateFluids({
      weightKg: 70,
      tbsaPct: 100, // Maximum possible TBSA
      hoursSinceInjury: 0
    });
    
    expect(result.parkland.totalMl).toBe(28000); // 4 * 70 * 100 = 28,000ml
    expect(result.parkland.first8hMl).toBe(14000);
    expect(result.parkland.next16hMl).toBe(14000);
  });

  it('should handle time progression correctly', () => {
    const baseParams = {
      weightKg: 20,
      tbsaPct: 20,
    };
    
    // Test at different time points
    const at0h = calculateFluids({ ...baseParams, hoursSinceInjury: 0 });
    const at4h = calculateFluids({ ...baseParams, hoursSinceInjury: 4 });
    const at8h = calculateFluids({ ...baseParams, hoursSinceInjury: 8 });
    const at12h = calculateFluids({ ...baseParams, hoursSinceInjury: 12 });
    const at24h = calculateFluids({ ...baseParams, hoursSinceInjury: 24 });
    const beyond24h = calculateFluids({ ...baseParams, hoursSinceInjury: 30 });
    
    // Total should remain constant
    expect(at0h.parkland.totalMl).toBe(1600); // 4 * 20 * 20
    expect(at8h.parkland.totalMl).toBe(1600);
    expect(at24h.parkland.totalMl).toBe(1600);
    
    // Phase transitions
    expect(at0h.parkland.phase).toBe('first8');
    expect(at4h.parkland.phase).toBe('first8');
    expect(at8h.parkland.phase).toBe('next16');
    expect(at12h.parkland.phase).toBe('next16');
    
    // Delivered amounts should increase
    expect(at0h.parkland.deliveredFirst8hMl).toBe(0);
    expect(at4h.parkland.deliveredFirst8hMl).toBe(400); // Half of 800
    expect(at8h.parkland.deliveredFirst8hMl).toBe(800); // Full first 8h
    
    // Beyond 24h should have no remaining resuscitation
    expect(beyond24h.parkland.rateNowMlPerHr).toBe(0);
  });

  it('should provide appropriate notices for small burns', () => {
    const smallBurn = calculateFluids({
      weightKg: 70,
      tbsaPct: 8, // Below 10% threshold
      hoursSinceInjury: 0
    });
    
    const largeBurn = calculateFluids({
      weightKg: 70,
      tbsaPct: 15, // Above 10% threshold
      hoursSinceInjury: 0
    });
    
    expect(smallBurn.notice).toContain('10% TBSA');
    expect(largeBurn.notice).toBeUndefined();
  });
});

// Clinical validation against published examples
describe('Clinical Reference Validation', () => {
  it('should match published Parkland example 1', () => {
    // Example: 70kg adult with 30% TBSA
    const result = calculateFluids({
      weightKg: 70,
      tbsaPct: 30,
      hoursSinceInjury: 0
    });
    
    expect(result.parkland.totalMl).toBe(8400); // 4 * 70 * 30
    expect(result.parkland.first8hMl).toBe(4200);
    expect(result.parkland.next16hMl).toBe(4200);
    expect(result.parkland.rateNowMlPerHr).toBe(525); // 4200/8
  });

  it('should match published Parkland example 2', () => {
    // Example: 20kg child with 20% TBSA at 2 hours post-injury
    const result = calculateFluids({
      weightKg: 20,
      tbsaPct: 20,
      hoursSinceInjury: 2
    });
    
    expect(result.parkland.totalMl).toBe(1600); // 4 * 20 * 20
    expect(result.parkland.first8hMl).toBe(800);
    
    // At 2h, should have delivered 200ml (800 * 2/8)
    expect(result.parkland.deliveredFirst8hMl).toBe(200);
    expect(result.parkland.remainingFirst8hMl).toBe(600);
    
    // Remaining rate: 600ml over 6 hours = 100ml/hr
    expect(result.parkland.rateNowMlPerHr).toBe(100);
  });

  it('should calculate maintenance fluids using 4-2-1 rule', () => {
    // Test various weights against 4-2-1 rule
    const scenarios = [
      { weight: 5, expected: 20 },    // 5 * 4 = 20
      { weight: 15, expected: 50 },   // 10*4 + 5*2 = 40+10 = 50
      { weight: 25, expected: 65 },   // 10*4 + 10*2 + 5*1 = 40+20+5 = 65
      { weight: 50, expected: 90 },   // 10*4 + 10*2 + 30*1 = 40+20+30 = 90
    ];
    
    scenarios.forEach(({ weight, expected }) => {
      const result = calculateFluids({
        weightKg: weight,
        tbsaPct: 10,
        hoursSinceInjury: 0
      });
      
      expect(result.maintenance.mlPerHr).toBe(expected);
      expect(result.maintenance.method).toBe('4-2-1');
    });
  });
});

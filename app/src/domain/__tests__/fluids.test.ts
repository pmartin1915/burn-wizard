import { describe, it, expect } from 'vitest';
import { calcFluids, calcUrineOutputTarget } from '../fluids';

describe('calcFluids', () => {
  it('should calculate Parkland formula correctly for infant example', () => {
    const result = calcFluids({
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
    const result = calcFluids({
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
    const result = calcFluids({
      weightKg: 70,
      tbsaPct: 8,
      hoursSinceInjury: 1,
    });
    
    expect(result.notice).toContain('10% TBSA');
  });

  it('should handle edge cases', () => {
    expect(() => calcFluids({ weightKg: 0, tbsaPct: 10, hoursSinceInjury: 0 })).toThrow();
    expect(() => calcFluids({ weightKg: 70, tbsaPct: -1, hoursSinceInjury: 0 })).toThrow();
    expect(() => calcFluids({ weightKg: 70, tbsaPct: 101, hoursSinceInjury: 0 })).toThrow();
  });
});

describe('calcUrineOutputTarget', () => {
  it('should return correct targets for children vs adults', () => {
    const child = calcUrineOutputTarget(20, 60); // 5 year old, 20kg
    expect(child.min).toBe(20);
    expect(child.max).toBe(40);
    
    const adult = calcUrineOutputTarget(70, 300); // 25 year old, 70kg
    expect(adult.min).toBe(35);
    expect(adult.max).toBe(70);
  });
});
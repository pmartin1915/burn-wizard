import { describe, it, expect } from 'vitest';
import { calcAgeBand, calcTbsa } from '../tbsa';
import type { RegionSelection } from '../types';

describe('calcAgeBand', () => {
  it('should return correct age bands', () => {
    expect(calcAgeBand(6)).toBe('infant');
    expect(calcAgeBand(24)).toBe('1to4');
    expect(calcAgeBand(72)).toBe('5to9');
    expect(calcAgeBand(144)).toBe('10to14');
    expect(calcAgeBand(240)).toBe('15plus');
  });

  it('should handle edge cases', () => {
    expect(calcAgeBand(0)).toBe('infant');
    expect(calcAgeBand(12)).toBe('infant');
    expect(calcAgeBand(13)).toBe('1to4');
    expect(calcAgeBand(1200)).toBe('15plus');
  });

  it('should throw for invalid ages', () => {
    expect(() => calcAgeBand(-1)).toThrow();
    expect(() => calcAgeBand(1201)).toThrow();
  });
});

describe('calcTbsa', () => {
  it('should calculate correct TBSA for infant', () => {
    const selections: RegionSelection[] = [
      { region: 'headAnterior', fraction: 1 },
      { region: 'armRightAnterior', fraction: 0.5 },
    ];
    
    const result = calcTbsa(6, selections);
    expect(result.ageBand).toBe('infant');
    expect(result.tbsaPct).toBeCloseTo(10.5, 1); // 9.5 + 1.0
  });

  it('should calculate correct TBSA for adult', () => {
    const selections: RegionSelection[] = [
      { region: 'torsoAnterior', fraction: 1 },
      { region: 'armRightAnterior', fraction: 1 },
    ];
    
    const result = calcTbsa(300, selections);
    expect(result.ageBand).toBe('15plus');
    expect(result.tbsaPct).toBeCloseTo(15, 1); // 13 + 2
  });

  it('should handle fractional involvement', () => {
    const selections: RegionSelection[] = [
      { region: 'headAnterior', fraction: 0.25 },
      { region: 'headPosterior', fraction: 0.75 },
    ];
    
    const result = calcTbsa(300, selections);
    expect(result.tbsaPct).toBeCloseTo(4.5, 1); // 4.5 * 0.25 + 4.5 * 0.75
  });

  it('should return zero for no selections', () => {
    const result = calcTbsa(300, []);
    expect(result.tbsaPct).toBe(0);
  });
});
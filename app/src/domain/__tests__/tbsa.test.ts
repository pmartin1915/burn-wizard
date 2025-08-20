import { describe, it, expect } from 'vitest';
import { calculateAgeGroup, calculateTBSA, getRegionPercent, getAllRegionPercents } from '../tbsa';
import type { RegionSelection, BurnFraction, BodyArea, RegionKey } from '../types';
import { LUND_BROWDER_PERCENTAGES } from '@/constants/lundBrowder';

describe('calculateAgeGroup', () => {
  it('should return correct age groups', () => {
    expect(calculateAgeGroup(6)).toBe('0');  // 0.5 years
    expect(calculateAgeGroup(24)).toBe('1'); // 2 years
    expect(calculateAgeGroup(72)).toBe('5'); // 6 years
    expect(calculateAgeGroup(144)).toBe('10'); // 12 years
    expect(calculateAgeGroup(240)).toBe('Adult'); // 20 years
  });

  it('should handle edge cases', () => {
    expect(calculateAgeGroup(0)).toBe('0');
    expect(calculateAgeGroup(12)).toBe('1'); // Exactly 1 year
    expect(calculateAgeGroup(13)).toBe('1'); // Just over 1 year
    expect(calculateAgeGroup(1200)).toBe('Adult'); // 100 years
  });

  it('should throw for invalid ages', () => {
    expect(() => calculateAgeGroup(-1)).toThrow();
    expect(() => calculateAgeGroup(1201)).toThrow();
  });
});

describe('calculateTBSA', () => {
  it('should calculate correct TBSA for infant', () => {
    const selections: RegionSelection[] = [
      { region: 'Head', fraction: 1, depth: 'superficial-partial' },
      { region: 'R_U_Arm', fraction: 0.5, depth: 'superficial-partial' },
    ];
    
    const result = calculateTBSA(6, selections);
    expect(result.ageGroup).toBe('0');
    expect(result.tbsaPct).toBeCloseTo(21, 1); // 19 + 2 (4 * 0.5)
  });

  it('should calculate correct TBSA for adult', () => {
    const selections: RegionSelection[] = [
      { region: 'Ant_Trunk', fraction: 1, depth: 'deep-partial' },
      { region: 'R_U_Arm', fraction: 1, depth: 'full-thickness' },
    ];
    
    const result = calculateTBSA(300, selections);
    expect(result.ageGroup).toBe('Adult');
    expect(result.tbsaPct).toBeCloseTo(17, 1); // 13 + 4
  });

  it('should handle fractional involvement', () => {
    const selections: RegionSelection[] = [
      { region: 'Head', fraction: 0.25, depth: 'superficial' },
      { region: 'Neck', fraction: 0.75, depth: 'superficial-partial' },
    ];
    
    const result = calculateTBSA(300, selections);
    expect(result.tbsaPct).toBeCloseTo(3.25, 1); // 7 * 0.25 + 2 * 0.75 = 1.75 + 1.5
  });

  it('should return zero for no selections', () => {
    const result = calculateTBSA(300, []);
    expect(result.tbsaPct).toBe(0);
  });

  // Comprehensive Clinical Reference Validation
  describe('Clinical Reference Validation', () => {
    it('should demonstrate age-related head percentage changes', () => {
      const headOnlySelection: RegionSelection[] = [
        { region: 'Head', fraction: 1 }
      ];
      
      // Test head percentages across all age groups
      const infantResult = calculateTBSA(6, headOnlySelection);    // 6 months
      const toddlerResult = calculateTBSA(36, headOnlySelection);  // 3 years
      const childResult = calculateTBSA(84, headOnlySelection);    // 7 years
      const teenResult = calculateTBSA(192, headOnlySelection);    // 16 years
      const adultResult = calculateTBSA(300, headOnlySelection);   // 25 years
      
      expect(infantResult.tbsaPct).toBe(19);  // Infant: 19%
      expect(toddlerResult.tbsaPct).toBe(17); // Toddler: 17%
      expect(childResult.tbsaPct).toBe(13);   // Child: 13%
      expect(teenResult.tbsaPct).toBe(9);     // Teen: 9%
      expect(adultResult.tbsaPct).toBe(7);    // Adult: 7%
    });

    it('should demonstrate age-related thigh percentage changes', () => {
      const thighSelection: RegionSelection[] = [
        { region: 'R_Thigh', fraction: 1 },
        { region: 'L_Thigh', fraction: 1 }
      ];
      
      const infantResult = calculateTBSA(6, thighSelection);    // 6 months
      const adultResult = calculateTBSA(300, thighSelection);   // 25 years
      
      expect(infantResult.tbsaPct).toBe(11);   // Infant: 5.5% × 2 = 11%
      expect(adultResult.tbsaPct).toBe(19);    // Adult: 9.5% × 2 = 19%
    });

    it('should handle all valid fractions correctly', () => {
      const fractions = [0, 0.25, 0.5, 0.75, 1.0];
      const expectedResults = [0, 3.3, 6.5, 9.8, 13]; // Using Ant_Trunk (13%) for adult
      
      fractions.forEach((fraction, index) => {
        const selections: RegionSelection[] = [
          { region: 'Ant_Trunk', fraction: fraction as BurnFraction }
        ];
        
        const result = calculateTBSA(300, selections); // Adult
        expect(result.tbsaPct).toBeCloseTo(expectedResults[index], 1);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should validate region selections', () => {
      const invalidSelections = [
        { region: 'InvalidRegion' as RegionKey, fraction: 1 as BurnFraction },
      ];
      
      expect(() => calculateTBSA(300, invalidSelections)).toThrow('Invalid region: InvalidRegion');
    });

    it('should validate fraction values', () => {
      const invalidFractions = [
        { region: 'Head', fraction: 1.5 },  // > 1.0
        { region: 'Head', fraction: -0.1 }, // < 0
        { region: 'Head', fraction: 0.3 },  // Not a valid increment
      ];
      
      invalidFractions.forEach(selection => {
        expect(() => calculateTBSA(300, [selection as RegionSelection])).toThrow(/Invalid fraction/);
      });
    });

    it('should handle maximum theoretical burn scenario', () => {
      const allRegions: RegionSelection[] = Object.keys(LUND_BROWDER_PERCENTAGES).map(region => ({
        region: region as RegionKey,
        fraction: 1
      }));
      
      const result = calculateTBSA(300, allRegions); // Adult
      
      // Should approximate 100% (allowing for rounding)
      expect(result.tbsaPct).toBeGreaterThan(95);
      expect(result.tbsaPct).toBeLessThanOrEqual(100);
    });
  });

  // Clinical workflow scenarios
  describe('Clinical Workflow Integration', () => {
    it('should support emergency department pediatric scenario', () => {
      // Scenario: 3-year-old with scalding burn
      const edScenario: RegionSelection[] = [
        { region: 'Head', fraction: 0.5 },       // Partial head involvement
        { region: 'Ant_Trunk', fraction: 0.75 }, // Significant trunk burn
        { region: 'R_U_Arm', fraction: 1 },      // Full arm involvement
        { region: 'L_U_Arm', fraction: 0.5 },    // Partial arm involvement
      ];
      
      const result = calculateTBSA(36, edScenario); // 3 years = 36 months
      
      expect(result.ageGroup).toBe('1'); // Toddler group
      
      // Calculate expected: (17*0.5) + (13*0.75) + (4*1) + (4*0.5)
      // = 8.5 + 9.75 + 4 + 2 = 24.25 → rounds to 24.3%
      expect(result.tbsaPct).toBeCloseTo(24.3, 1);
    });

    it('should support adult trauma scenario', () => {
      // Scenario: 35-year-old with flame burn
      const traumaScenario: RegionSelection[] = [
        { region: 'Head', fraction: 0.5 },       // Partial head/face
        { region: 'Neck', fraction: 1 },         // Full neck
        { region: 'Ant_Trunk', fraction: 1 },    // Full anterior trunk
        { region: 'R_U_Arm', fraction: 1 },      // Full right arm
        { region: 'R_L_Arm', fraction: 1 },      // Full right forearm
        { region: 'R_Hand', fraction: 1 },       // Full right hand
      ];
      
      const result = calculateTBSA(420, traumaScenario); // 35 years = 420 months
      
      expect(result.ageGroup).toBe('Adult');
      
      // Calculate expected: (7*0.5) + 2 + 13 + 4 + 3 + 2.5 = 28%
      expect(result.tbsaPct).toBe(28);
    });
  });
});

// Additional test coverage for exported functions
describe('getRegionPercent', () => {
  it('should return correct percentages for each age group', () => {
    // Test head region across all ages (most variable)
    expect(getRegionPercent('Head', 0.5)).toBe(19);   // 6 months → infant
    expect(getRegionPercent('Head', 3)).toBe(17);     // 3 years → toddler
    expect(getRegionPercent('Head', 7)).toBe(13);     // 7 years → child
    expect(getRegionPercent('Head', 12)).toBe(11);    // 12 years → adolescent
    expect(getRegionPercent('Head', 16)).toBe(9);     // 16 years → teen
    expect(getRegionPercent('Head', 25)).toBe(7);     // 25 years → adult
  });

  it('should handle constant regions correctly', () => {
    const constantRegions: BodyArea[] = ['Neck', 'Ant_Trunk', 'R_U_Arm', 'Genitalia'];
    const ages = [0.5, 3, 7, 12, 16, 25];
    
    constantRegions.forEach(region => {
      const expectedValue = getRegionPercent(region, 25); // Get adult value
      ages.forEach(age => {
        expect(getRegionPercent(region, age)).toBe(expectedValue);
      });
    });
  });
});

describe('getAllRegionPercents', () => {
  it('should return all regions for given age', () => {
    const adultPercentages = getAllRegionPercents(25);
    
    // Verify we have all expected regions
    expect(Object.keys(adultPercentages)).toHaveLength(Object.keys(LUND_BROWDER_PERCENTAGES).length);
    
    // Spot check key values
    expect(adultPercentages.Head).toBe(7);
    expect(adultPercentages.Ant_Trunk).toBe(13);
    expect(adultPercentages.R_Thigh).toBe(9.5);
  });

  it('should show age-related differences', () => {
    const infantPercentages = getAllRegionPercents(0.5);
    const adultPercentages = getAllRegionPercents(25);
    
    // Head decreases with age
    expect(infantPercentages.Head).toBeGreaterThan(adultPercentages.Head);
    
    // Thighs increase with age
    expect(adultPercentages.R_Thigh).toBeGreaterThan(infantPercentages.R_Thigh);
    
    // Constant regions remain the same
    expect(infantPercentages.Neck).toBe(adultPercentages.Neck);
  });
});

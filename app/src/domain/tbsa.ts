/**
 * TBSA (Total Body Surface Area) Calculation Module
 * 
 * This module implements the Lund-Browder method for calculating burn size,
 * which accounts for age-specific changes in body proportions. This is the
 * gold standard for pediatric burn assessment.
 * 
 * Key Clinical Concepts:
 * - Head percentage decreases with age (19% infant → 7% adult)
 * - Leg percentages increase to compensate for head changes
 * - Age groups: 0 (0-<1yr), 1 (1-<5yr), 5 (5-<10yr), 10 (10-<15yr), 15 (15-<18yr), Adult (18+yr)
 * - Only partial and full-thickness burns count toward TBSA
 * 
 * AI Development Notes:
 * - All functions are pure and side-effect free
 * - Comprehensive test coverage in __tests__/tbsa.test.ts
 * - Age boundary logic is critical - test thoroughly if modified
 * - Types are defined in ./types.ts for consistency
 */

import type { AgeGroup, RegionSelection, TbsaResult, BodyArea } from './types';
import { LUND_BROWDER_PERCENTAGES, getBodyAreaPercentage } from '@/constants/lundBrowder';
import { round1 } from '@/lib/utils';
import { validateTBSAInputs } from './validation';

/**
 * Determines age group from age in months - matches hospital chart
 * 
 * CRITICAL: Age boundaries must align with getBodyAreaPercentage() in constants/lundBrowder.ts
 * 
 * Age Group Boundaries (tested extensively):
 * - '0': Birth to <1 year (0-11.99 months)
 * - '1': 1 to <5 years (12-59.99 months) 
 * - '5': 5 to <10 years (60-119.99 months)
 * - '10': 10 to <15 years (120-179.99 months)
 * - '15': 15 to <18 years (180-215.99 months)
 * - 'Adult': 18+ years (216+ months)
 * 
 * @param ageMonths - Age in months (0-1200, max ~100 years)
 * @returns Age group string matching Lund-Browder chart categories
 * 
 * AI Development Notes:
 * - This function is heavily tested - see tbsa.test.ts line 14-24
 * - Age boundaries are based on hospital clinical charts
 * - Changes here MUST be synchronized with lundBrowder.ts
 */
export function calculateAgeGroup(ageMonths: number): AgeGroup {
  // Input validation with clinical context
  if (ageMonths < 0) throw new Error('Age cannot be negative');
  if (ageMonths > 1200) throw new Error('Age exceeds maximum (100 years)');

  const ageYears = ageMonths / 12;
  
  // Age group boundaries - CRITICAL to match hospital charts
  if (ageYears < 1) return '0';    // Infants: 0-<1 year
  if (ageYears < 5) return '1';    // Toddlers: 1-<5 years
  if (ageYears < 10) return '5';   // Children: 5-<10 years
  if (ageYears < 15) return '10';  // Pre-teens: 10-<15 years
  if (ageYears < 18) return '15';  // Teens: 15-<18 years
  return 'Adult';                  // Adults: 18+ years
}

/**
 * Validates region selections for proper format
 * @param selections - Array of region selections to validate
 */
function validateSelections(selections: RegionSelection[]): void {
  const validFractions = [0, 0.25, 0.5, 0.75, 1];
  const validRegions = Object.keys(LUND_BROWDER_PERCENTAGES) as BodyArea[];

  for (const selection of selections) {
    if (!validRegions.includes(selection.region)) {
      throw new Error(`Invalid region: ${selection.region}`);
    }
    if (!validFractions.includes(selection.fraction)) {
      throw new Error(`Invalid fraction: ${selection.fraction}. Must be 0, 0.25, 0.5, 0.75, or 1`);
    }
  }
}

/**
 * Calculates total body surface area (TBSA) percentage using Lund-Browder method
 * 
 * This is the main calculation function that:
 * 1. Determines patient age group
 * 2. Gets age-appropriate percentages for each body region
 * 3. Applies fractional burn involvement (0, 0.25, 0.5, 0.75, 1.0)
 * 4. Sums all partial percentages to get total TBSA
 * 
 * Clinical Example:
 * - 5-year-old child with 50% involvement of head region
 * - Head = 13% for age group '5'
 * - 13% × 0.5 = 6.5% TBSA contribution
 * 
 * @param ageMonths - Patient age in months (determines body proportions)
 * @param selections - Array of regions with burn depth and fractional involvement
 * @returns Complete TBSA result with total percentage and regional breakdown
 * 
 * AI Development Notes:
 * - Function is pure and deterministic
 * - All regions initialized to 0, then selectively updated
 * - Validation occurs before calculation via validateSelections()
 * - Uses round1() utility to prevent floating point display issues
 * - Test cases cover infant, child, and adult scenarios
 */
export function calculateTBSA(ageMonths: number, selections: RegionSelection[]): TbsaResult {
  // Validate age bounds and handle edge cases first
  if (!Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > 1200) {
    throw new Error(`Invalid age: ${ageMonths} months. Age must be between 0 and 1200 months (100 years)`);
  }
  
  // Apply original validation for specific error messages
  validateSelections(selections);
  
  // Enhanced input validation for edge cases not caught by original validation
  if (!Array.isArray(selections)) {
    throw new Error('Region selections must be an array');
  }
  
  const ageGroup = calculateAgeGroup(ageMonths);
  const ageYears = ageMonths / 12;
  const breakdown: Record<BodyArea, number> = {} as Record<BodyArea, number>;
  
  // Initialize all regions to 0
  Object.keys(LUND_BROWDER_PERCENTAGES).forEach((region) => {
    breakdown[region as BodyArea] = 0;
  });
  
  // Calculate TBSA for each selected region with enhanced validation
  let totalTbsa = 0;
  
  for (const selection of selections) {
    // Additional safety checks
    if (!selection || typeof selection !== 'object') {
      throw new Error('Invalid selection object');
    }
    
    const regionPercent = getBodyAreaPercentage(selection.region, ageYears);
    const adjustedPercent = regionPercent * selection.fraction;
    
    // Prevent NaN or infinite values
    if (!Number.isFinite(adjustedPercent)) {
      throw new Error(`Invalid calculation result for region ${selection.region}`);
    }
    
    breakdown[selection.region] = round1(adjustedPercent);
    totalTbsa += adjustedPercent;
  }
  
  // Final validation of calculated TBSA
  const finalTbsa = round1(totalTbsa);
  const validation = validateTBSAInputs(ageMonths, finalTbsa);
  
  if (!validation.isValid) {
    throw new Error(`TBSA calculation validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Log warnings for clinical awareness (in development mode)
  if (validation.warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('TBSA Clinical Warnings:', validation.warnings);
  }
  
  return {
    tbsaPct: finalTbsa,
    breakdown,
    ageGroup,
    validation: {
      warnings: validation.warnings,
      clinicalFlags: validation.warnings.length > 0
    }
  };
}

/**
 * Gets the base percentage for a region at a given age
 * @param region - Body region
 * @param ageYears - Patient age in years
 * @returns Base percentage for the region
 */
export function getRegionPercent(region: BodyArea, ageYears: number): number {
  return getBodyAreaPercentage(region, ageYears);
}

/**
 * Gets all regions with their base percentages for an age
 * @param ageYears - Patient age in years
 * @returns Record of regions and their percentages
 */
export function getAllRegionPercents(ageYears: number): Record<BodyArea, number> {
  const result: Record<BodyArea, number> = {} as Record<BodyArea, number>;
  
  Object.keys(LUND_BROWDER_PERCENTAGES).forEach((region) => {
    result[region as BodyArea] = getBodyAreaPercentage(region, ageYears);
  });
  
  return result;
}

// Legacy function for backward compatibility
export function calcAgeBand(ageMonths: number): AgeGroup {
  return calculateAgeGroup(ageMonths);
}

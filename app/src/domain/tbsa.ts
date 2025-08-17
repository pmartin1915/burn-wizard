import type { AgeBand, RegionSelection, TbsaResult, RegionKey } from './types';
import { LUND_BROWDER_MAP } from '@/constants/lundBrowder';
import { AGE_BAND_DEFINITIONS } from '@/constants/ageBands';
import { round1 } from '@/lib/utils';

/**
 * Determines age band from age in months
 * @param ageMonths - Age in months (0-1200)
 * @returns Age band for TBSA calculations
 */
export function calcAgeBand(ageMonths: number): AgeBand {
  if (ageMonths < 0) throw new Error('Age cannot be negative');
  if (ageMonths > 1200) throw new Error('Age exceeds maximum (100 years)');

  const bands = Object.entries(AGE_BAND_DEFINITIONS) as [AgeBand, typeof AGE_BAND_DEFINITIONS[AgeBand]][];
  
  for (const [band, definition] of bands) {
    if (ageMonths >= definition.minMonths && ageMonths <= definition.maxMonths) {
      return band;
    }
  }
  
  // Fallback to adult for edge cases
  return '15plus';
}

/**
 * Validates region selections for proper format
 * @param selections - Array of region selections to validate
 */
function validateSelections(selections: RegionSelection[]): void {
  const validFractions = [0, 0.25, 0.5, 0.75, 1];
  const validRegions = Object.keys(LUND_BROWDER_MAP) as RegionKey[];

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
 * @param ageMonths - Patient age in months
 * @param selections - Array of region selections with fractional involvement
 * @returns TBSA calculation result with breakdown by region
 */
export function calcTbsa(ageMonths: number, selections: RegionSelection[]): TbsaResult {
  validateSelections(selections);
  
  const ageBand = calcAgeBand(ageMonths);
  const breakdown: Record<RegionKey, number> = {} as Record<RegionKey, number>;
  
  // Initialize all regions to 0
  Object.keys(LUND_BROWDER_MAP).forEach((region) => {
    breakdown[region as RegionKey] = 0;
  });
  
  // Calculate TBSA for each selected region
  let totalTbsa = 0;
  
  for (const selection of selections) {
    const regionPercent = LUND_BROWDER_MAP[selection.region][ageBand];
    const adjustedPercent = regionPercent * selection.fraction;
    
    breakdown[selection.region] = round1(adjustedPercent);
    totalTbsa += adjustedPercent;
  }
  
  return {
    tbsaPct: round1(totalTbsa),
    breakdown,
    ageBand,
  };
}

/**
 * Gets the base percentage for a region at a given age
 * @param region - Body region
 * @param ageBand - Patient age band
 * @returns Base percentage for the region
 */
export function getRegionPercent(region: RegionKey, ageBand: AgeBand): number {
  return LUND_BROWDER_MAP[region][ageBand];
}

/**
 * Gets all regions with their base percentages for an age band
 * @param ageBand - Patient age band
 * @returns Record of regions and their percentages
 */
export function getAllRegionPercents(ageBand: AgeBand): Record<RegionKey, number> {
  const result: Record<RegionKey, number> = {} as Record<RegionKey, number>;
  
  Object.entries(LUND_BROWDER_MAP).forEach(([region, ageMap]) => {
    result[region as RegionKey] = ageMap[ageBand];
  });
  
  return result;
}
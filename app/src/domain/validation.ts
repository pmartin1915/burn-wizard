import { z } from 'zod';
import type { RegionKey, BurnFraction } from './types';

const VALID_FRACTIONS: BurnFraction[] = [0, 0.25, 0.5, 0.75, 1];

const VALID_REGIONS: RegionKey[] = [
  'headAnterior',
  'headPosterior',
  'neckAnterior',
  'neckPosterior',
  'torsoAnterior',
  'torsoPosterior',
  'armRightAnterior',
  'armRightPosterior',
  'armLeftAnterior',
  'armLeftPosterior',
  'forearmRightAnterior',
  'forearmRightPosterior',
  'forearmLeftAnterior',
  'forearmLeftPosterior',
  'handRight',
  'handLeft',
  'thighRightAnterior',
  'thighRightPosterior',
  'thighLeftAnterior',
  'thighLeftPosterior',
  'legRightAnterior',
  'legRightPosterior',
  'legLeftAnterior',
  'legLeftPosterior',
  'footRight',
  'footLeft',
  'perineum',
];

export const regionSelectionSchema = z.object({
  region: z.enum(VALID_REGIONS as [RegionKey, ...RegionKey[]]),
  fraction: z.enum(VALID_FRACTIONS as [BurnFraction, ...BurnFraction[]]),
});

export const patientDataSchema = z.object({
  ageMonths: z.number().min(0).max(1200), // 0-100 years
  weightKg: z.number().min(0.5).max(300),
  hoursSinceInjury: z.number().min(0).max(168), // max 1 week
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
  weightKg: z.number().min(0.5).max(300),
  tbsaPct: z.number().min(0).max(100),
  hoursSinceInjury: z.number().min(0).max(168),
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
 * Validates patient data
 */
export function validatePatientData(data: unknown): boolean {
  try {
    patientDataSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}
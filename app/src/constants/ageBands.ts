import type { AgeGroup } from '@/domain/types';

/**
 * Age band definitions and helpers
 */
export const AGE_BAND_DEFINITIONS: Record<AgeGroup, { label: string; minMonths: number; maxMonths: number }> = {
  '0': {
    label: 'Infant (0-1 year)',
    minMonths: 0,
    maxMonths: 11,
  },
  '1': {
    label: 'Toddler (1-5 years)',
    minMonths: 12,
    maxMonths: 59,
  },
  '5': {
    label: 'Child (5-10 years)',
    minMonths: 60,
    maxMonths: 119,
  },
  '10': {
    label: 'Adolescent (10-15 years)',
    minMonths: 120,
    maxMonths: 179,
  },
  '15': {
    label: 'Teen (15-18 years)',
    minMonths: 180,
    maxMonths: 215,
  },
  'Adult': {
    label: 'Adult (18+ years)',
    minMonths: 216,
    maxMonths: 1200,
  },
};

/**
 * Quick age presets for common ages
 */
export const COMMON_AGE_PRESETS = [
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
  { label: '2 years', months: 24 },
  { label: '5 years', months: 60 },
  { label: '10 years', months: 120 },
  { label: '15 years', months: 180 },
  { label: '25 years', months: 300 },
  { label: '40 years', months: 480 },
];
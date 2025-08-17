import type { AgeBand } from '@/domain/types';

/**
 * Age band definitions and helpers
 */
export const AGE_BAND_DEFINITIONS: Record<AgeBand, { label: string; minMonths: number; maxMonths: number }> = {
  infant: {
    label: 'Infant (0-12 months)',
    minMonths: 0,
    maxMonths: 12,
  },
  '1to4': {
    label: 'Toddler (1-4 years)',
    minMonths: 13,
    maxMonths: 48,
  },
  '5to9': {
    label: 'Child (5-9 years)',
    minMonths: 49,
    maxMonths: 108,
  },
  '10to14': {
    label: 'Adolescent (10-14 years)',
    minMonths: 109,
    maxMonths: 168,
  },
  '15plus': {
    label: 'Adult (15+ years)',
    minMonths: 169,
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
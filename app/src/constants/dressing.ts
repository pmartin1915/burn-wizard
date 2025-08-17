import type { DressingRecommendation } from '@/domain/types';

/**
 * Generic dressing recommendations by body region
 * TODO: Replace/expand per local guidance - these are educational placeholders
 */
export const DRESSING_RECOMMENDATIONS: Record<string, DressingRecommendation> = {
  face: {
    region: 'Face/Scalp',
    primary: 'Topical antimicrobial (per protocol)',
    secondary: 'Open to air or non-adherent dressing',
    frequency: 'Daily assessment',
    notes: 'Consider ophthalmology consult for periorbital burns',
  },
  hands: {
    region: 'Hands',
    primary: 'Topical antimicrobial',
    secondary: 'Non-adherent gauze, individual finger wrapping',
    frequency: 'Daily dressing changes',
    notes: 'Maintain hand in position of function, elevation',
  },
  arms: {
    region: 'Arms/Forearms',
    primary: 'Topical antimicrobial',
    secondary: 'Non-adherent gauze, gauze wrap',
    frequency: 'Daily to twice daily',
    notes: 'Maintain range of motion',
  },
  torso: {
    region: 'Torso',
    primary: 'Topical antimicrobial',
    secondary: 'Non-adherent gauze, ABD pads',
    frequency: 'Daily dressing changes',
    notes: 'Monitor for respiratory complications',
  },
  legs: {
    region: 'Legs/Thighs',
    primary: 'Topical antimicrobial',
    secondary: 'Non-adherent gauze, gauze wrap',
    frequency: 'Daily dressing changes',
    notes: 'Elevation when possible',
  },
  feet: {
    region: 'Feet',
    primary: 'Topical antimicrobial',
    secondary: 'Non-adherent gauze, individual toe wrapping',
    frequency: 'Daily dressing changes',
    notes: 'Non-weight bearing, elevation',
  },
  perineum: {
    region: 'Perineum/Genitals',
    primary: 'Topical antimicrobial (per protocol)',
    secondary: 'Non-adherent dressing',
    frequency: 'Frequent assessment and cleaning',
    notes: 'Consider urology consult, catheter management',
  },
};

/**
 * General dressing principles
 */
export const DRESSING_PRINCIPLES = [
  'Clean technique for dressing changes',
  'Remove loose, non-viable tissue',
  'Apply topical antimicrobial as prescribed',
  'Use non-adherent primary dressing',
  'Secure with gauze wrap (not tape on burned skin)',
  'Elevate extremities when possible',
  'Document wound appearance, drainage, odor',
];

/**
 * Red flag signs requiring immediate attention
 */
export const WOUND_RED_FLAGS = [
  'Signs of infection (increased pain, fever, purulent drainage)',
  'Loss of sensation or circulation',
  'Compartment syndrome signs',
  'Failure to heal or worsening appearance',
  'Systemic signs of sepsis',
];
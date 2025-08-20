import { BurnDepth } from '../domain/types';

/**
 * Burn depth classifications with clinical characteristics
 */
export interface BurnDepthInfo {
  depth: BurnDepth;
  name: string;
  description: string;
  appearance: string;
  sensation: string;
  healingTime: string;
  color: string; // For UI visual coding
}

export const BURN_DEPTH_INFO: Record<BurnDepth, BurnDepthInfo> = {
  'superficial': {
    depth: 'superficial',
    name: 'Superficial (1st Degree)',
    description: 'Epidermis only, like mild sunburn',
    appearance: 'Red, dry, no blisters',
    sensation: 'Painful',
    healingTime: '3-6 days',
    color: 'hsl(var(--burn-superficial))' // Enhanced soft pink
  },
  'superficial-partial': {
    depth: 'superficial-partial',
    name: 'Superficial Partial Thickness (2nd Degree)',
    description: 'Epidermis and upper dermis',
    appearance: 'Red, moist, blisters present',
    sensation: 'Very painful',
    healingTime: '1-3 weeks',
    color: 'hsl(var(--burn-superficial-partial))' // Enhanced warm peach
  },
  'deep-partial': {
    depth: 'deep-partial',
    name: 'Deep Partial Thickness (2nd Degree)',
    description: 'Epidermis and deep dermis',
    appearance: 'White/red, less moist, may blister',
    sensation: 'Decreased sensation',
    healingTime: '3-8 weeks',
    color: 'hsl(var(--burn-deep-partial))' // Enhanced golden yellow
  },
  'full-thickness': {
    depth: 'full-thickness',
    name: 'Full Thickness (3rd Degree)',
    description: 'Through all skin layers',
    appearance: 'White, charred, or leathery',
    sensation: 'No sensation',
    healingTime: 'Requires grafting',
    color: 'hsl(var(--burn-full-thickness))' // Enhanced light gray
  }
};

/**
 * Get burn depth information
 */
export function getBurnDepthInfo(depth: BurnDepth): BurnDepthInfo {
  return BURN_DEPTH_INFO[depth];
}

/**
 * Get all burn depths for selection
 */
export function getAllBurnDepths(): BurnDepthInfo[] {
  return Object.values(BURN_DEPTH_INFO);
}

/**
 * Determine if burn depth typically requires transfer to burn center
 */
export function requiresBurnCenter(depth: BurnDepth, tbsaPct: number): boolean {
  switch (depth) {
    case 'superficial':
      return false;
    case 'superficial-partial':
      return tbsaPct > 10; // >10% partial thickness in adults
    case 'deep-partial':
      return tbsaPct > 5; // >5% deep partial thickness
    case 'full-thickness':
      return tbsaPct > 2; // >2% full thickness
    default:
      return false;
  }
}
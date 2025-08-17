/**
 * Age bands for Lund-Browder TBSA calculations
 */
export type AgeBand = 'infant' | '1to4' | '5to9' | '10to14' | '15plus';

/**
 * Body regions used in burn assessment
 */
export type RegionKey =
  | 'headAnterior'
  | 'headPosterior'
  | 'neckAnterior'
  | 'neckPosterior'
  | 'torsoAnterior'
  | 'torsoPosterior'
  | 'armRightAnterior'
  | 'armRightPosterior'
  | 'armLeftAnterior'
  | 'armLeftPosterior'
  | 'forearmRightAnterior'
  | 'forearmRightPosterior'
  | 'forearmLeftAnterior'
  | 'forearmLeftPosterior'
  | 'handRight'
  | 'handLeft'
  | 'thighRightAnterior'
  | 'thighRightPosterior'
  | 'thighLeftAnterior'
  | 'thighLeftPosterior'
  | 'legRightAnterior'
  | 'legRightPosterior'
  | 'legLeftAnterior'
  | 'legLeftPosterior'
  | 'footRight'
  | 'footLeft'
  | 'perineum';

/**
 * Fractional involvement of a body region (0.25 increments)
 */
export type BurnFraction = 0 | 0.25 | 0.5 | 0.75 | 1;

/**
 * Selection of a body region with fractional involvement
 */
export interface RegionSelection {
  region: RegionKey;
  fraction: BurnFraction;
}

/**
 * Patient demographics for calculations
 */
export interface PatientData {
  ageMonths: number;
  weightKg: number;
  hoursSinceInjury: number;
  mechanism?: string;
  specialSites: {
    face: boolean;
    hands: boolean;
    feet: boolean;
    perineum: boolean;
    majorJoints: boolean;
  };
}

/**
 * TBSA calculation result
 */
export interface TbsaResult {
  tbsaPct: number;
  breakdown: Record<RegionKey, number>;
  ageBand: AgeBand;
}

/**
 * Fluid calculation phases
 */
export type FluidPhase = 'first8' | 'next16';

/**
 * Fluid resuscitation calculation result
 */
export interface FluidResult {
  parkland: {
    totalMl: number;
    first8hMl: number;
    next16hMl: number;
    deliveredFirst8hMl: number;
    remainingFirst8hMl: number;
    remainingNext16hMl: number;
    rateNowMlPerHr: number;
    phase: FluidPhase;
  };
  maintenance: {
    mlPerHr: number;
    method: '4-2-1';
  };
  timeline: Array<{
    hourFromInjury: number;
    targetCumulativeMl: number;
    phase: FluidPhase;
  }>;
  notice?: string;
}

/**
 * Burn note template data
 */
export interface BurnNoteData {
  patient: PatientData;
  tbsa: TbsaResult;
  fluids: FluidResult;
  regions: RegionSelection[];
  timestamp: Date;
}

/**
 * Dressing recommendation
 */
export interface DressingRecommendation {
  region: string;
  primary: string;
  secondary?: string;
  frequency: string;
  notes?: string;
}

/**
 * Unit preferences
 */
export interface UnitPreferences {
  weight: 'kg' | 'lb';
  temperature: 'celsius' | 'fahrenheit';
}

/**
 * Application settings
 */
export interface AppSettings {
  units: UnitPreferences;
  language: 'en' | 'es';
  darkMode: boolean;
}
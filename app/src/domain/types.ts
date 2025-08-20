/**
 * Age groups for Lund-Browder TBSA calculations - matches hospital chart
 */
export type AgeGroup = '0' | '1' | '5' | '10' | '15' | 'Adult';

/**
 * Body regions used in burn assessment - matches hospital chart structure
 */
export type BodyArea = 
  | 'Head'
  | 'Neck'
  | 'Ant_Trunk'
  | 'Post_Trunk'
  | 'R_Buttock'
  | 'L_Buttock'
  | 'Genitalia'
  | 'R_U_Arm'
  | 'L_U_Arm'
  | 'R_L_Arm'
  | 'L_L_Arm'
  | 'R_Hand'
  | 'L_Hand'
  | 'R_Thigh'
  | 'L_Thigh'
  | 'R_Leg'
  | 'L_Leg'
  | 'R_Foot'
  | 'L_Foot';

// Legacy type for backward compatibility
export type RegionKey = BodyArea;

/**
 * Fractional involvement of a body region (0.25 increments)
 */
export type BurnFraction = 0 | 0.25 | 0.5 | 0.75 | 1;

/**
 * Burn depth classification
 */
export type BurnDepth = 'superficial' | 'superficial-partial' | 'deep-partial' | 'full-thickness';

/**
 * Selection of a body region with fractional involvement and burn depth
 */
export interface RegionSelection {
  region: BodyArea;
  fraction: BurnFraction;
  depth?: BurnDepth; // Optional for backward compatibility
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
 * TBSA calculation result with enhanced validation
 */
export interface TbsaResult {
  tbsaPct: number;
  breakdown: Record<BodyArea, number>;
  ageGroup: AgeGroup;
  validation?: {
    warnings: string[];
    clinicalFlags: boolean;
  };
}

/**
 * Fluid calculation phases
 */
export type FluidPhase = 'first8' | 'next16';

/**
 * Fluid resuscitation calculation result with enhanced validation
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
  validation?: {
    warnings: string[];
    clinicalFlags: boolean;
  };
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
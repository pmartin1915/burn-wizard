/**
 * Lund and Browder Chart - Age-Specific Body Surface Area Percentages
 * 
 * CLINICAL REFERENCE VALIDATION:
 * These values have been verified against multiple clinical sources:
 * 
 * PRIMARY REFERENCE:
 * Lund CC, Browder NC. The estimation of areas of burns. 
 * Surg Gynecol Obstet. 1944;79:352-358.
 * 
 * VALIDATION SOURCES:
 * - Advanced Burn Life Support (ABLS) Course Manual 2018
 * - American Burn Association Practice Guidelines
 * - Children's Hospital burn assessment protocols
 * - Sheridan RL. Burns in children. Clin Pediatr Emerg Med. 2005
 * 
 * CLINICAL NOTES:
 * - Head percentage decreases significantly with age (19% → 7%)
 * - Thigh percentages increase to compensate (5.5% → 9.5%)
 * - Trunk, arms, hands remain constant across all ages
 * - Age boundaries align with standard pediatric growth charts
 * 
 * VERIFICATION STATUS: ✅ Clinically validated (2025-08-18)
 * LAST REVIEWED: 2025-08-18
 * REVIEWED BY: Perry Martin, Clinical SME
 */

export interface LundBrowderData {
  [bodyArea: string]: {
    [ageGroup: string]: number;
  };
}

export const LUND_BROWDER_PERCENTAGES: LundBrowderData = {
  // Head percentages change dramatically with age - CLINICALLY CRITICAL
  // Validated against ABLS manual and pediatric burn literature
  "Head": {
    "0": 19,    // Infant (0-1yr): Large head relative to body
    "1": 17,    // Toddler (1-5yr): Head still proportionally large
    "5": 13,    // Child (5-10yr): Approaching adult proportions
    "10": 11,   // Adolescent (10-15yr): Near adult head size
    "15": 9,    // Teen (15-18yr): Almost adult proportions
    "Adult": 7  // Adult (18+yr): Standard adult head proportion
  },

  // Neck - constant across all ages
  "Neck": {
    "0": 2,
    "1": 2,
    "5": 2,
    "10": 2,
    "15": 2,
    "Adult": 2
  },

  // Trunk areas - constant across all ages
  "Ant_Trunk": {
    "0": 13,
    "1": 13,
    "5": 13,
    "10": 13,
    "15": 13,
    "Adult": 13
  },

  "Post_Trunk": {
    "0": 13,
    "1": 13,
    "5": 13,
    "10": 13,
    "15": 13,
    "Adult": 13
  },

  // Buttocks - constant across all ages
  "R_Buttock": {
    "0": 2.5,
    "1": 2.5,
    "5": 2.5,
    "10": 2.5,
    "15": 2.5,
    "Adult": 2.5
  },

  "L_Buttock": {
    "0": 2.5,
    "1": 2.5,
    "5": 2.5,
    "10": 2.5,
    "15": 2.5,
    "Adult": 2.5
  },

  // Genitalia - constant across all ages
  "Genitalia": {
    "0": 1,
    "1": 1,
    "5": 1,
    "10": 1,
    "15": 1,
    "Adult": 1
  },

  // Arms - constant across all ages
  "R_U_Arm": {
    "0": 4,
    "1": 4,
    "5": 4,
    "10": 4,
    "15": 4,
    "Adult": 4
  },

  "L_U_Arm": {
    "0": 4,
    "1": 4,
    "5": 4,
    "10": 4,
    "15": 4,
    "Adult": 4
  },

  "R_L_Arm": {
    "0": 3,
    "1": 3,
    "5": 3,
    "10": 3,
    "15": 3,
    "Adult": 3
  },

  "L_L_Arm": {
    "0": 3,
    "1": 3,
    "5": 3,
    "10": 3,
    "15": 3,
    "Adult": 3
  },

  // Hands - constant across all ages
  "R_Hand": {
    "0": 2.5,
    "1": 2.5,
    "5": 2.5,
    "10": 2.5,
    "15": 2.5,
    "Adult": 2.5
  },

  "L_Hand": {
    "0": 2.5,
    "1": 2.5,
    "5": 2.5,
    "10": 2.5,
    "15": 2.5,
    "Adult": 2.5
  },

  // Thighs - age-dependent (increase with age) - COMPENSATES FOR HEAD CHANGES
  // Critical: These percentages increase as head decreases to maintain 100% total
  "R_Thigh": {
    "0": 5.5,    // Infant: Smaller thighs relative to body
    "1": 6.5,    // Toddler: Growing leg proportion
    "5": 8,      // Child: Increasing leg length
    "10": 8.5,   // Adolescent: Nearly adult proportions
    "15": 9,     // Teen: Close to adult proportions
    "Adult": 9.5 // Adult: Full adult leg proportion
  },

  "L_Thigh": {
    "0": 5.5,    // Mirror of right thigh - bilateral symmetry
    "1": 6.5,
    "5": 8,
    "10": 8.5,
    "15": 9,
    "Adult": 9.5
  },

  // Legs - age-dependent (increase with age)
  "R_Leg": {
    "0": 5,
    "1": 5,
    "5": 5.5,
    "10": 6,
    "15": 6.5,
    "Adult": 7
  },

  "L_Leg": {
    "0": 5,
    "1": 5,
    "5": 5.5,
    "10": 6,
    "15": 6.5,
    "Adult": 7
  },

  // Feet - constant across all ages
  "R_Foot": {
    "0": 3.5,
    "1": 3.5,
    "5": 3.5,
    "10": 3.5,
    "15": 3.5,
    "Adult": 3.5
  },

  "L_Foot": {
    "0": 3.5,
    "1": 3.5,
    "5": 3.5,
    "10": 3.5,
    "15": 3.5,
    "Adult": 3.5
  }
};

// Helper function to get percentage for a body area at a specific age
export function getBodyAreaPercentage(bodyArea: string, ageYears: number): number {
  const areaData = LUND_BROWDER_PERCENTAGES[bodyArea];
  if (!areaData) {
    throw new Error(`Unknown body area: ${bodyArea}`);
  }

  // Determine age group
  let ageGroup: string;
  if (ageYears < 1) {
    ageGroup = "0";
  } else if (ageYears < 5) {
    ageGroup = "1";
  } else if (ageYears < 10) {
    ageGroup = "5";
  } else if (ageYears < 15) {
    ageGroup = "10";
  } else if (ageYears < 18) {
    ageGroup = "15";
  } else {
    ageGroup = "Adult";
  }

  return areaData[ageGroup];
}

// Validation function to ensure total percentages are reasonable
export function validateTotalPercentage(selectedAreas: Record<string, boolean>, ageYears: number): number {
  let total = 0;
  
  for (const [area, isSelected] of Object.entries(selectedAreas)) {
    if (isSelected) {
      total += getBodyAreaPercentage(area, ageYears);
    }
  }
  
  return total;
}

// Age group boundaries for reference
export const AGE_GROUPS = {
  "Infant (0-1yr)": { min: 0, max: 1 },
  "Toddler (1-5yr)": { min: 1, max: 5 },
  "Child (5-10yr)": { min: 5, max: 10 },
  "Adolescent (10-15yr)": { min: 10, max: 15 },
  "Teen (15-18yr)": { min: 15, max: 18 },
  "Adult (18+yr)": { min: 18, max: 999 }
};

// Clinical notes for educational display and validation
export const CLINICAL_NOTES = {
  head_variation: "Head percentage decreases significantly with age (19% infant → 7% adult)",
  thigh_leg_variation: "Thigh and leg percentages increase with age to compensate for head changes",
  constant_areas: "Trunk, arms, hands, and feet remain constant across all age groups",
  total_validation: "Total body surface area should equal 100% when all areas selected",
  clinical_validation: "All percentages verified against Advanced Burn Life Support (ABLS) protocols",
  age_boundaries: "Age group boundaries: 0-1yr, 1-5yr, 5-10yr, 10-15yr, 15-18yr, 18+yr",
  bilateral_symmetry: "Right and left body parts have identical percentages",
  pediatric_emphasis: "Pediatric patients have proportionally larger heads and smaller legs"
};

/**
 * Validates that all age group percentages sum to approximately 100%
 * Used for clinical constant verification
 */
export function validateTotalPercentages(): { ageGroup: string; total: number; valid: boolean }[] {
  const results: { ageGroup: string; total: number; valid: boolean }[] = [];
  
  const ageGroups = ['0', '1', '5', '10', '15', 'Adult'];
  
  for (const ageGroup of ageGroups) {
    let total = 0;
    
    // Sum all body regions for this age group
    Object.values(LUND_BROWDER_PERCENTAGES).forEach(regionData => {
      total += regionData[ageGroup] || 0;
    });
    
    // Allow small tolerance for rounding differences
    const valid = Math.abs(total - 100) < 1.0;
    
    results.push({
      ageGroup: ageGroup === 'Adult' ? 'Adult (18+)' : `${ageGroup} years`,
      total: Math.round(total * 10) / 10, // Round to 1 decimal
      valid
    });
  }
  
  return results;
}

/**
 * Clinical reference validation - can be run during testing
 * Ensures our constants match published clinical standards
 */
export function validateClinicalConstants(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check total percentages for each age group
  const totals = validateTotalPercentages();
  
  totals.forEach(({ ageGroup, total, valid }) => {
    if (!valid) {
      errors.push(`${ageGroup}: Total percentage is ${total}%, should be ~100%`);
    }
  });
  
  // Verify head percentage progression (should decrease with age)
  const headPercentages = [19, 17, 13, 11, 9, 7]; // Expected progression
  const actualHead = Object.values(LUND_BROWDER_PERCENTAGES.Head);
  
  for (let i = 0; i < headPercentages.length; i++) {
    if (actualHead[i] !== headPercentages[i]) {
      errors.push(`Head percentage mismatch at index ${i}: expected ${headPercentages[i]}%, got ${actualHead[i]}%`);
    }
  }
  
  // Verify thigh percentage progression (should increase with age)
  const thighPercentages = [5.5, 6.5, 8, 8.5, 9, 9.5]; // Expected progression
  const actualThigh = Object.values(LUND_BROWDER_PERCENTAGES.R_Thigh);
  
  for (let i = 0; i < thighPercentages.length; i++) {
    if (actualThigh[i] !== thighPercentages[i]) {
      errors.push(`Thigh percentage mismatch at index ${i}: expected ${thighPercentages[i]}%, got ${actualThigh[i]}%`);
    }
  }
  
  // Verify bilateral symmetry
  const bilateralPairs = [
    ['R_Buttock', 'L_Buttock'],
    ['R_U_Arm', 'L_U_Arm'],
    ['R_L_Arm', 'L_L_Arm'],
    ['R_Hand', 'L_Hand'],
    ['R_Thigh', 'L_Thigh'],
    ['R_Leg', 'L_Leg'],
    ['R_Foot', 'L_Foot']
  ];
  
  bilateralPairs.forEach(([right, left]) => {
    const rightPercentages = LUND_BROWDER_PERCENTAGES[right];
    const leftPercentages = LUND_BROWDER_PERCENTAGES[left];
    
    Object.keys(rightPercentages).forEach(ageGroup => {
      if (rightPercentages[ageGroup] !== leftPercentages[ageGroup]) {
        errors.push(`Bilateral asymmetry: ${right} and ${left} differ at age ${ageGroup}`);
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
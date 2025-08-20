import React from 'react';

export const SAFETY_DISCLAIMER = `
⚠️ EDUCATIONAL TOOL ONLY: This application provides educational calculations and is not intended for direct patient care, diagnosis, or treatment decisions. Always verify with institutional protocols and clinical judgment.
`;

export const COMPREHENSIVE_DISCLAIMER = `
IMPORTANT MEDICAL DISCLAIMER

This educational tool is provided for learning and reference purposes only. It is NOT intended for:
- Direct patient care or clinical decision-making
- Diagnosis, treatment, or medical advice  
- Replacement of professional medical judgment
- Emergency medical situations

LIMITATIONS:
- Calculations are estimates and must be verified
- Individual patient factors may require modifications
- Local protocols and institutional guidelines take precedence
- Tool accuracy depends on correct data input

PROFESSIONAL RESPONSIBILITY:
- Patient care decisions remain the responsibility of qualified healthcare providers
- Clinical judgment and medical training are irreplaceable
- Always consult appropriate specialists when available
- Verify all calculations with multiple sources

USE AT YOUR OWN RISK:
- No warranty is provided for accuracy or completeness
- Users assume full responsibility for any application of information
- Neither the developers nor distributors are liable for outcomes
`;

export const SCOPE_STATEMENT = `
This tool is designed for educational and documentation support only. It does not diagnose, prescribe medications, or replace clinical decision-making. All calculations must be verified with local protocols.
`;

export const DATA_SAFETY_NOTICE = `
All data remains on your device. No patient information is transmitted over the network. Use the "Clear Local Data" function to remove all stored information.
`;

export const CLINICAL_LIMITATIONS = {
  general: [
    'Educational tool only - not for direct patient care',
    'Calculations are estimates requiring clinical verification', 
    'Individual patient factors may necessitate protocol modifications',
    'Local institutional guidelines take precedence'
  ],
  
  parklandFormula: [
    'Parkland formula provides initial fluid estimate only',
    'Actual fluid needs may vary significantly from calculations',
    'Requires continuous monitoring and adjustment based on patient response',
    'Not appropriate for all burn types or patient populations'
  ],
  
  tbsaAssessment: [
    'TBSA assessment requires clinical expertise and experience',
    'Burn depth may evolve over time requiring reassessment',
    'Chart-based estimates may not account for all anatomical variations',
    'Accuracy depends on proper technique and clinical judgment'
  ],
  
  monitoringProtocols: [
    'Monitoring protocols are guidelines, not absolute rules',
    'Patient response may require deviations from standard protocols',
    'Equipment accuracy and proper technique are essential',
    'Clinical correlation is required for all measurements'
  ]
};

export const LEGAL_WARNINGS = {
  liability: 'Users assume full responsibility for any application of this educational content',
  accuracy: 'No warranty provided for accuracy, completeness, or fitness for any purpose',
  updates: 'Medical knowledge evolves - verify current best practices',
  jurisdiction: 'Legal requirements and medical standards vary by jurisdiction'
};

export const EMERGENCY_NOTICE = `
🚨 EMERGENCY SITUATIONS:
This tool is NOT appropriate for emergency care. In emergency situations:
- Call emergency services immediately
- Follow ATLS/ABLS protocols
- Transport to appropriate facility
- Begin immediate life-saving interventions
- This tool should NOT delay emergency care
`;

export const PROFESSIONAL_STANDARDS = {
  training: 'Proper medical training is required for burn management',
  certification: 'Consider ABLS or equivalent certification for burn care providers',
  collaboration: 'Multidisciplinary team approach is essential for optimal outcomes',
  documentation: 'Maintain thorough documentation of all assessments and decisions',
  quality: 'Regular quality improvement review of burn care practices recommended'
};

/**
 * Get appropriate disclaimer level based on context
 */
export function getContextualDisclaimer(context: 'calculation' | 'assessment' | 'monitoring' | 'educational'): string {
  const baseDisclaimer = '⚠️ Educational Tool Only - Verify All Information - Not for Direct Patient Care';
  
  const contextualAdditions: Record<string, string> = {
    calculation: ' - Calculations require clinical verification and may need adjustment',
    assessment: ' - Assessment accuracy depends on proper training and technique', 
    monitoring: ' - Monitoring protocols are guidelines requiring clinical judgment',
    educational: ' - Content is for learning purposes and may not reflect current best practices'
  };
  
  return baseDisclaimer + (contextualAdditions[context] || '');
}

/**
 * Enhanced safety validation for clinical calculations
 */
export function validateClinicalInputs(inputs: {
  weightKg?: number;
  ageMonths?: number; 
  tbsaPct?: number;
  hoursSinceInjury?: number;
}): {
  isValid: boolean;
  warnings: string[];
  criticalAlerts: string[];
} {
  const warnings: string[] = [];
  const criticalAlerts: string[] = [];
  let isValid = true;
  
  // Weight validation
  if (inputs.weightKg !== undefined) {
    if (inputs.weightKg < 3) {
      criticalAlerts.push('Extremely low weight - verify accuracy');
      isValid = false;
    } else if (inputs.weightKg < 10) {
      warnings.push('Low weight - consider pediatric protocols');
    } else if (inputs.weightKg > 200) {
      warnings.push('High weight - consider bariatric considerations');
    }
  }
  
  // Age validation  
  if (inputs.ageMonths !== undefined) {
    if (inputs.ageMonths < 1) {
      criticalAlerts.push('Neonatal patient - specialized care required');
    } else if (inputs.ageMonths < 12) {
      warnings.push('Infant patient - consider pediatric burn center');
    }
  }
  
  // TBSA validation
  if (inputs.tbsaPct !== undefined) {
    if (inputs.tbsaPct > 50) {
      criticalAlerts.push('Large burn - requires burn center management');
    } else if (inputs.tbsaPct > 20) {
      warnings.push('Significant burn - consider burn center consultation');
    }
  }
  
  // Time validation
  if (inputs.hoursSinceInjury !== undefined && inputs.hoursSinceInjury > 24) {
    warnings.push('Delayed presentation - Parkland formula may not apply');
  }
  
  return { isValid, warnings, criticalAlerts };
}

export function SafetyBanner() {
  return React.createElement(
    'div',
    { className: 'burn-wizard-disclaimer text-center py-2 px-4' },
    '⚠️ Educational Tool Only - Not for Direct Patient Care - Verify All Calculations'
  );
}
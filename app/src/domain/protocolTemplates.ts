/**
 * Protocol Explanation Templates
 * Educational content for burn management protocols
 */

export interface ProtocolTemplate {
  id: string;
  title: string;
  summary: string;
  sections: {
    title: string;
    content: string;
    keyPoints?: string[];
    clinicalPearls?: string[];
    warnings?: string[];
  }[];
  references?: string[];
}

/**
 * Parkland Formula Protocol Template
 */
export const parklandProtocolTemplate: ProtocolTemplate = {
  id: 'parkland-formula',
  title: 'Parkland Formula for Burn Fluid Resuscitation',
  summary: 'Evidence-based protocol for calculating and managing fluid resuscitation in burn patients >20kg with ≥10% TBSA burns.',
  
  sections: [
    {
      title: 'Formula Components',
      content: 'The Parkland Formula calculates total fluid requirements for the first 24 hours post-burn injury using patient weight and burn extent.',
      keyPoints: [
        'Formula: 4ml/kg × %TBSA × weight(kg)',
        'First 8 hours: Give half the total volume',
        'Next 16 hours: Give remaining half',
        'Time calculated from injury, not admission'
      ],
      clinicalPearls: [
        'Use actual body weight, not ideal weight',
        'TBSA should be accurately assessed using age-appropriate charts',
        'Start timing from injury occurrence, not hospital arrival'
      ]
    },

    {
      title: 'Fluid Type Selection',
      content: 'Appropriate fluid selection is crucial for optimal resuscitation outcomes.',
      keyPoints: [
        'Primary: Lactated Ringers (LR) for resuscitation',
        'Maintenance: D5 1/2 NS + 20mEq KCl/L if needed',
        'Route: IV for resuscitation, PO preferred for maintenance'
      ],
      clinicalPearls: [
        'LR most closely matches extracellular fluid composition',
        'Avoid D5W or hypotonic solutions for resuscitation',
        'Normal saline may cause hyperchloremic acidosis'
      ],
      warnings: [
        'Never use glucose-containing solutions for primary resuscitation',
        'Monitor electrolytes closely with large volume resuscitation'
      ]
    },

    {
      title: 'Monitoring Parameters',
      content: 'Systematic monitoring ensures appropriate fluid management and early detection of complications.',
      keyPoints: [
        'Urine output: Primary monitoring parameter',
        'Target: 30-50ml/hr for adults >20kg',
        'Vital signs: HR <120, BP >90/60, SaO2 >90%',
        'Hourly assessments and documentation'
      ],
      clinicalPearls: [
        'Urine output is more reliable than vital signs for burn resuscitation',
        'Trend is more important than single measurements',
        'Consider indwelling catheter for accurate measurement'
      ]
    },

    {
      title: 'Rate Adjustment Protocol',
      content: 'Systematic approach to adjusting fluid rates based on physiologic response.',
      keyPoints: [
        'Urine output <30ml/hr → Increase rate by 20%',
        'Urine output 30-50ml/hr → Maintain current rate',
        'Urine output >50ml/hr → Decrease rate by 20%',
        'Reassess hourly after any rate change'
      ],
      clinicalPearls: [
        '20% adjustments provide meaningful change without dramatic swings',
        'Small frequent adjustments better than large infrequent ones',
        'Document rationale for all rate changes'
      ],
      warnings: [
        'Avoid chasing single low urine output values',
        'Consider other causes if rate adjustments ineffective'
      ]
    }
  ],

  references: [
    'Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874-94.',
    'American Burn Association. Advanced Burn Life Support Course. Chicago: American Burn Association; 2018.'
  ]
};

/**
 * TBSA Assessment Protocol Template  
 */
export const tbsaProtocolTemplate: ProtocolTemplate = {
  id: 'tbsa-assessment',
  title: 'Total Body Surface Area (TBSA) Assessment Using Lund-Browder Chart',
  summary: 'Age-specific method for accurate burn size assessment critical for fluid resuscitation calculations.',
  
  sections: [
    {
      title: 'Age-Specific Considerations',
      content: 'Body proportions change significantly with age, requiring age-appropriate assessment tools.',
      keyPoints: [
        'Head percentage decreases with age (19% infant → 7% adult)',
        'Leg percentages increase with age to compensate',
        'Use patient age at time of injury',
        'Round to nearest age group for chart selection'
      ],
      clinicalPearls: [
        'Infants have proportionally larger heads',
        'Adult proportions reached around age 15-18',
        'Use actual age, not developmental age'
      ]
    },

    {
      title: 'Assessment Technique',  
      content: 'Systematic approach to burn depth and area assessment.',
      keyPoints: [
        'Assess each body region separately',
        'Estimate fractional involvement (0%, 25%, 50%, 75%, 100%)',
        'Document burn depth for each region',
        'Consider only partial and full-thickness burns'
      ],
      warnings: [
        'Do not include superficial (first-degree) burns in TBSA calculations',
        'Reassess periodically as burn depth may evolve'
      ]
    }
  ]
};

/**
 * Burn Depth Assessment Template
 */
export const burnDepthTemplate: ProtocolTemplate = {
  id: 'burn-depth',
  title: 'Burn Depth Classification and Assessment',
  summary: 'Systematic approach to classifying burn depth for treatment planning and prognosis.',
  
  sections: [
    {
      title: 'Classification System',
      content: 'Modern burn depth classification based on tissue involvement and healing potential.',
      keyPoints: [
        'Superficial: Epidermis only (sunburn-like)',
        'Superficial Partial: Papillary dermis involvement',
        'Deep Partial: Reticular dermis involvement', 
        'Full Thickness: Through dermis to subcutaneous tissue'
      ]
    },

    {
      title: 'Clinical Assessment',
      content: 'Physical examination findings guide depth assessment.',
      keyPoints: [
        'Appearance: Color, texture, moisture',
        'Sensation: Pain response to light touch',
        'Capillary refill: Blanching response',
        'Hair follicles: Intact vs destroyed'
      ],
      clinicalPearls: [
        'Deep partial may appear superficial initially',
        'Serial assessments improve accuracy',
        'When in doubt, treat as deeper burn'
      ]
    }
  ]
};

/**
 * Patient Safety and Legal Considerations
 */
export const safetyProtocolTemplate: ProtocolTemplate = {
  id: 'safety-legal',
  title: 'Patient Safety and Legal Considerations',
  summary: 'Important safety measures and legal disclaimers for burn care education.',
  
  sections: [
    {
      title: 'Clinical Limitations',
      content: 'Understanding the limitations of educational tools and protocols.',
      keyPoints: [
        'Educational tool only - not replacement for clinical judgment',
        'Protocols are guidelines, not absolute rules',
        'Individual patient factors may require modifications',
        'Always consult appropriate specialists when available'
      ],
      warnings: [
        'This tool does not replace medical training or clinical experience',
        'Patient care decisions remain the responsibility of the treating physician',
        'Local protocols and institutional guidelines take precedence'
      ]
    },

    {
      title: 'Documentation Requirements',
      content: 'Proper documentation protects patients and providers.',
      keyPoints: [
        'Document all assessments and calculations',
        'Record rationale for treatment decisions',
        'Note any deviations from standard protocols',
        'Include time stamps for all interventions'
      ]
    },

    {
      title: 'When to Seek Additional Help',
      content: 'Recognition of situations requiring specialist consultation.',
      keyPoints: [
        'Burns >20% TBSA in adults',
        'Burns >10% TBSA in children',
        'Electrical or chemical burns',
        'Respiratory involvement or circumferential burns'
      ]
    }
  ]
};

/**
 * Get protocol template by ID
 */
export function getProtocolTemplate(id: string): ProtocolTemplate | undefined {
  const templates = [
    parklandProtocolTemplate,
    tbsaProtocolTemplate, 
    burnDepthTemplate,
    safetyProtocolTemplate
  ];
  
  return templates.find(template => template.id === id);
}

/**
 * Get all available protocol templates
 */
export function getAllProtocolTemplates(): ProtocolTemplate[] {
  return [
    parklandProtocolTemplate,
    tbsaProtocolTemplate,
    burnDepthTemplate,
    safetyProtocolTemplate
  ];
}

/**
 * Generate educational content for specific clinical scenario
 */
export function generateEducationalContent(scenario: {
  patientWeight: number;
  tbsaPct: number;
  currentPhase: 'assessment' | 'resuscitation' | 'monitoring';
}): {
  relevantTemplates: ProtocolTemplate[];
  keyEducationalPoints: string[];
  clinicalPearls: string[];
} {
  const relevantTemplates: ProtocolTemplate[] = [];
  const keyEducationalPoints: string[] = [];
  const clinicalPearls: string[] = [];
  
  // Always include safety considerations
  relevantTemplates.push(safetyProtocolTemplate);
  
  if (scenario.currentPhase === 'assessment') {
    relevantTemplates.push(tbsaProtocolTemplate, burnDepthTemplate);
    keyEducationalPoints.push(
      'Accurate TBSA assessment is critical for fluid calculations',
      'Use age-appropriate assessment tools',
      'Document both depth and area for each region'
    );
  }
  
  if (scenario.currentPhase === 'resuscitation' || scenario.currentPhase === 'monitoring') {
    relevantTemplates.push(parklandProtocolTemplate);
    
    if (scenario.patientWeight > 20 && scenario.tbsaPct >= 10) {
      keyEducationalPoints.push(
        'Standard Parkland formula applies to this patient',
        'Monitor urine output as primary endpoint',
        'Expect to give majority of fluid in first 8 hours'
      );
    } else {
      keyEducationalPoints.push(
        'Consider pediatric modifications for smaller patients',
        'May not require formal fluid resuscitation if TBSA <10%',
        'Use weight-based urine output targets if applicable'
      );
    }
  }
  
  // Add scenario-specific clinical pearls
  if (scenario.tbsaPct > 20) {
    clinicalPearls.push('Large burns may require transfer to burn center');
  }
  
  if (scenario.patientWeight < 20) {
    clinicalPearls.push('Pediatric patients have higher risk of both under- and over-resuscitation');
  }
  
  return {
    relevantTemplates,
    keyEducationalPoints,
    clinicalPearls
  };
}
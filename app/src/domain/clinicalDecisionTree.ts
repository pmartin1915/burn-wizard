/**
 * Clinical Decision Tree for Burn Fluid Management
 * 
 * This module provides interactive clinical decision support following
 * evidence-based burn management protocols. It's designed for educational
 * purposes to teach proper clinical decision-making sequences.
 * 
 * SYSTEM ARCHITECTURE:
 * - Tree-based navigation with decision nodes
 * - Branch logic based on patient data
 * - Educational explanations for each decision point
 * - Integration with main fluid management functions
 * 
 * CLINICAL WORKFLOW SUPPORTED:
 * 1. Initial Assessment (weight/age/TBSA screening)
 * 2. Parkland Calculation (if indicated)
 * 3. Resuscitation Initiation (fluid type/rate)
 * 4. Hourly Monitoring (urine output assessment)
 * 5. Rate Adjustments (±20% protocol)
 * 6. Vital Sign Assessment (stability indicators)
 * 7. Maintenance Considerations (additional fluids)
 * 
 * EDUCATIONAL FEATURES:
 * - Step-by-step protocol guidance
 * - Clinical rationale explanations
 * - Decision point justifications
 * - Safety reminders and warnings
 * 
 * AI Development Notes:
 * - Decision nodes are stateless and reusable
 * - Navigation logic in navigateDecisionTree() function
 * - Add new nodes by extending parklandDecisionTree array
 * - All branches include clinical rationale for education
 * - System designed for teaching, not direct patient care
 */

export interface DecisionNode {
  id: string;
  question: string;
  type: 'assessment' | 'action' | 'endpoint';
  criteria?: {
    condition: string;
    threshold?: number;
    operator?: '<' | '>' | '<=' | '>=' | '=';
  };
  branches?: {
    condition: string;
    nextNodeId?: string;
    action?: string;
    rationale?: string;
  }[];
  recommendations?: string[];
  clinicalNotes?: string[];
}

/**
 * Parkland Formula Decision Tree
 */
export const parklandDecisionTree: DecisionNode[] = [
  {
    id: 'initial-assessment',
    question: 'Initial Patient Assessment',
    type: 'assessment',
    branches: [
      {
        condition: 'Weight >20kg AND TBSA ≥10%',
        nextNodeId: 'calculate-parkland',
        rationale: 'Adult burn protocol indicated for significant burns'
      },
      {
        condition: 'Weight ≤20kg OR TBSA <10%',
        nextNodeId: 'pediatric-considerations',
        rationale: 'Consider pediatric modifications or alternative protocols'
      }
    ],
    clinicalNotes: [
      'Assess patient weight, age, and total body surface area burned',
      'Consider time from injury for fluid calculation timing'
    ]
  },
  
  {
    id: 'calculate-parkland',
    question: 'Calculate Initial Parkland Formula',
    type: 'action',
    branches: [
      {
        condition: 'Formula: 4ml/kg × %TBSA × weight(kg)',
        nextNodeId: 'start-resuscitation',
        action: 'Divide total by 8 for first 8-hour rate'
      }
    ],
    recommendations: [
      'Use Lactated Ringers (LR) as primary resuscitation fluid',
      'Calculate based on actual time from injury, not admission time'
    ]
  },

  {
    id: 'start-resuscitation',
    question: 'Initiate Fluid Resuscitation',
    type: 'action',
    branches: [
      {
        condition: 'Start IV at calculated rate',
        nextNodeId: 'hourly-monitoring',
        action: 'Begin hourly monitoring protocol'
      }
    ],
    recommendations: [
      'Start LR at calculated ml/hr rate',
      'Ensure accurate IV pump settings',
      'Document start time and rate'
    ]
  },

  {
    id: 'hourly-monitoring',
    question: 'Hourly Urine Output Assessment',
    type: 'assessment',
    criteria: {
      condition: 'Urine output measurement',
      threshold: 30,
      operator: '<'
    },
    branches: [
      {
        condition: 'Urine output <30ml/hr',
        nextNodeId: 'increase-rate',
        rationale: 'Inadequate fluid resuscitation - increase rate'
      },
      {
        condition: 'Urine output 30-50ml/hr',
        nextNodeId: 'maintain-rate',
        rationale: 'Optimal urine output - continue current management'
      },
      {
        condition: 'Urine output >50ml/hr',
        nextNodeId: 'decrease-rate',
        rationale: 'Excessive fluid administration - reduce rate'
      }
    ],
    clinicalNotes: [
      'Target urine output: 30-50ml/hr for adults >20kg',
      'Use weight-based targets for pediatric patients'
    ]
  },

  {
    id: 'increase-rate',
    question: 'Increase IV Fluid Rate',
    type: 'action',
    branches: [
      {
        condition: 'Increase current rate by 20%',
        nextNodeId: 'vital-sign-check',
        action: 'Document new rate and rationale'
      }
    ],
    recommendations: [
      'Calculate: New rate = Current rate × 1.2',
      'Continue hourly monitoring',
      'Reassess in 1 hour'
    ]
  },

  {
    id: 'decrease-rate',
    question: 'Decrease IV Fluid Rate',
    type: 'action',
    branches: [
      {
        condition: 'Decrease current rate by 20%',
        nextNodeId: 'vital-sign-check',
        action: 'Document new rate and rationale'
      }
    ],
    recommendations: [
      'Calculate: New rate = Current rate × 0.8',
      'Monitor for signs of under-resuscitation',
      'Continue hourly monitoring'
    ]
  },

  {
    id: 'maintain-rate',
    question: 'Maintain Current Rate',
    type: 'action',
    branches: [
      {
        condition: 'Continue current IV rate',
        nextNodeId: 'vital-sign-check',
        action: 'Document stable urine output'
      }
    ],
    recommendations: [
      'No rate change needed',
      'Continue hourly monitoring',
      'Document optimal response'
    ]
  },

  {
    id: 'vital-sign-check',
    question: 'Assess Vital Sign Stability',
    type: 'assessment',
    branches: [
      {
        condition: 'HR <60, BP >90/60, SaO2 >90%',
        nextNodeId: 'stable-continue',
        rationale: 'Patient vitally stable - continue protocol'
      },
      {
        condition: 'Any vital sign outside target',
        nextNodeId: 'consider-interventions',
        rationale: 'Vital instability requires additional assessment'
      }
    ],
    clinicalNotes: [
      'Monitor heart rate, blood pressure, oxygen saturation',
      'Weight stability affects fluid management decisions'
    ]
  },

  {
    id: 'stable-continue',
    question: 'Patient Stable - Continue Protocol',
    type: 'endpoint',
    recommendations: [
      'Continue hourly urine output monitoring',
      'Maintain current fluid management',
      'Reassess hourly per protocol',
      'Document stable vital signs'
    ]
  },

  {
    id: 'consider-interventions',
    question: 'Consider Additional Interventions',
    type: 'assessment',
    branches: [
      {
        condition: 'Weight unstable or pediatric patient',
        nextNodeId: 'maintenance-fluids',
        rationale: 'May need maintenance fluids in addition to resuscitation'
      },
      {
        condition: 'Persistent vital instability',
        nextNodeId: 'clinical-consultation',
        rationale: 'Consider other causes or additional interventions'
      }
    ]
  },

  {
    id: 'maintenance-fluids',
    question: 'Consider Maintenance Fluids',
    type: 'action',
    recommendations: [
      'Calculate maintenance using 4-2-1 method',
      'Use D5 1/2 NS + 20mEq KCl/L',
      'Prefer oral route if patient tolerates',
      'Add to existing Parkland rate (do not replace)'
    ],
    clinicalNotes: [
      'Maintenance is separate from resuscitation fluid',
      'Required when normal metabolism needs are not met'
    ]
  },

  {
    id: 'pediatric-considerations',
    question: 'Pediatric Protocol Modifications',
    type: 'endpoint',
    recommendations: [
      'Consider weight-based urine output targets (1-2ml/kg/hr)',
      'Use pediatric fluid management protocols',
      'Monitor more frequently if weight <20kg',
      'Consult pediatric burn specialist if available'
    ],
    clinicalNotes: [
      'Pediatric patients have different fluid requirements',
      'Higher risk of both under- and over-resuscitation'
    ]
  },

  {
    id: 'clinical-consultation',
    question: 'Clinical Consultation Required',
    type: 'endpoint',
    recommendations: [
      'Contact burn specialist or intensivist',
      'Consider other causes of instability',
      'Review burn depth and area assessments',
      'Consider invasive monitoring if available'
    ]
  }
];

/**
 * Navigates the decision tree based on patient data
 * @param patientData - Current patient assessment data
 * @returns Current decision node and next steps
 */
export function navigateDecisionTree(patientData: {
  weightKg: number;
  tbsaPct: number;
  urineOutputMlPerHr?: number;
  vitals?: {
    heartRate?: number;
    systolicBP?: number;
    diastolicBP?: number;
    oxygenSat?: number;
  };
}): {
  currentNode: DecisionNode;
  applicableBranches: DecisionNode['branches'];
  nextRecommendations: string[];
} {
  // Start with initial assessment
  let currentNodeId = 'initial-assessment';
  
  // Navigate based on patient data
  if (patientData.weightKg > 20 && patientData.tbsaPct >= 10) {
    currentNodeId = 'hourly-monitoring';
  } else {
    currentNodeId = 'pediatric-considerations';
  }
  
  // If we have urine output data, determine appropriate action
  if (patientData.urineOutputMlPerHr !== undefined) {
    if (patientData.urineOutputMlPerHr < 30) {
      currentNodeId = 'increase-rate';
    } else if (patientData.urineOutputMlPerHr > 50) {
      currentNodeId = 'decrease-rate';
    } else {
      currentNodeId = 'maintain-rate';
    }
  }
  
  const currentNode = parklandDecisionTree.find(node => node.id === currentNodeId)!;
  
  return {
    currentNode,
    applicableBranches: currentNode.branches || [],
    nextRecommendations: currentNode.recommendations || []
  };
}

/**
 * Gets educational explanation for a specific decision point
 */
export function getDecisionExplanation(nodeId: string): {
  title: string;
  explanation: string;
  keyPoints: string[];
  clinicalRationale: string;
} {
  const explanations: Record<string, ReturnType<typeof getDecisionExplanation>> = {
    'hourly-monitoring': {
      title: 'Hourly Urine Output Monitoring',
      explanation: 'Urine output is the most reliable indicator of adequate fluid resuscitation in burn patients. It reflects tissue perfusion and helps guide fluid rate adjustments.',
      keyPoints: [
        'Target: 30-50ml/hr for adults >20kg',
        'Measure accurately every hour',
        'Adjust fluid rate based on output',
        'Document all changes with rationale'
      ],
      clinicalRationale: 'Urine output reflects renal perfusion, which correlates with overall tissue perfusion in burn patients. It is more reliable than vital signs alone for guiding fluid resuscitation.'
    },
    
    'increase-rate': {
      title: '20% Rate Increase Protocol',
      explanation: 'When urine output falls below 30ml/hr, increase the IV fluid rate by 20% to improve tissue perfusion.',
      keyPoints: [
        'Calculate: New rate = Current rate × 1.2',
        'Reassess urine output in 1 hour',
        'Monitor for fluid overload signs',
        'Document change and rationale'
      ],
      clinicalRationale: 'A 20% increase provides meaningful fluid increase without risking rapid fluid overload. This graduated approach allows for safe titration.'
    },
    
    'vital-sign-check': {
      title: 'Vital Sign Stability Assessment',
      explanation: 'Vital signs provide additional confirmation of adequate resuscitation beyond urine output monitoring.',
      keyPoints: [
        'Target HR <60 bpm',
        'Target BP >90/60 mmHg', 
        'Target SaO2 >90%',
        'Consider weight stability'
      ],
      clinicalRationale: 'Stable vital signs in conjunction with adequate urine output confirm successful fluid resuscitation and tissue perfusion.'
    }
  };
  
  return explanations[nodeId] || {
    title: 'Clinical Decision Point',
    explanation: 'Follow protocol guidelines for optimal patient care.',
    keyPoints: ['Assess patient status', 'Follow clinical protocols', 'Document decisions'],
    clinicalRationale: 'Evidence-based protocols improve patient outcomes in burn care.'
  };
}
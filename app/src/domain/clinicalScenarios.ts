/**
 * Clinical Scenarios for Burn Wizard Training
 * 
 * Educational case studies for medical training and assessment.
 * Each scenario provides realistic patient data and expected outcomes.
 */

import type { PatientData, RegionSelection } from './types';

export interface ClinicalScenario {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'pediatric' | 'adult' | 'elderly' | 'special';
  
  // Scenario details
  description: string;
  backstory: string;
  presentingComplaint: string;
  physicalExam: string;
  
  // Patient data
  patientData: PatientData;
  burnRegions: RegionSelection[];
  
  // Educational content
  learningObjectives: string[];
  keyTeachingPoints: string[];
  clinicalPearls: string[];
  commonMistakes: string[];
  
  // Expected outcomes
  expectedTbsa: number;
  expectedFluidRate: number;
  expectedTransfer: boolean;
  
  // References and follow-up
  references?: string[];
  followUpQuestions?: string[];
}

export const CLINICAL_SCENARIOS: ClinicalScenario[] = [
  {
    id: 'pediatric-scald',
    title: 'Pediatric Scald Burn',
    difficulty: 'beginner',
    category: 'pediatric',
    
    description: 'A 2-year-old child presents with scald burns after pulling a pot of boiling water from the stove.',
    backstory: 'The child was in the kitchen with mother when they grabbed the handle of a pot containing boiling water. The accident occurred 30 minutes ago.',
    presentingComplaint: 'Child is crying, with obvious burns to face, chest, and right arm. Mother states child pulled pot of boiling water down.',
    physicalExam: 'Alert, crying child. Burns appear superficial partial-thickness with blisters forming. Face shows erythema and early blistering. Right arm and anterior chest involved.',
    
    patientData: {
      ageMonths: 24, // 2 years old
      weightKg: 12,
      hoursSinceInjury: 0.5,
      mechanism: 'Scald - boiling water',
      specialSites: {
        face: true,
        hands: false,
        feet: false,
        perineum: false,
        majorJoints: false,
      },
    },
    
    burnRegions: [
      { region: 'Head', fraction: 0.5, depth: 'superficial-partial' },
      { region: 'Ant_Trunk', fraction: 0.25, depth: 'superficial-partial' },
      { region: 'R_U_Arm', fraction: 0.75, depth: 'superficial-partial' },
    ],
    
    learningObjectives: [
      'Apply pediatric Lund-Browder calculations',
      'Recognize high-risk anatomical locations (face)',
      'Understand scald burn patterns in children',
      'Calculate appropriate fluid resuscitation for pediatric patients',
    ],
    
    keyTeachingPoints: [
      'Pediatric head represents larger % of BSA (17% at age 2)',
      'Face burns require burn center evaluation',
      'Scald burns often show splash patterns',
      'Consider non-accidental trauma in pediatric burns',
    ],
    
    clinicalPearls: [
      'Always assess for airway involvement with face burns',
      'Document burn pattern and mechanism carefully',
      'Pediatric patients dehydrate faster than adults',
      'Pain management is critical for pediatric patients',
    ],
    
    commonMistakes: [
      'Using adult BSA percentages for children',
      'Underestimating fluid requirements',
      'Missing the need for burn center transfer',
      'Inadequate pain control',
    ],
    
    expectedTbsa: 12, // Approximate based on age-specific calculations
    expectedFluidRate: 120, // ml/hr initially
    expectedTransfer: true, // Due to face involvement
    
    references: [
      'American Burn Association Burn Center Referral Criteria',
      'Pediatric Advanced Life Support Guidelines',
    ],
    
    followUpQuestions: [
      'What factors make this case high-risk?',
      'When would you consider intubation?',
      'What are red flags for non-accidental trauma?',
    ],
  },

  {
    id: 'adult-flame',
    title: 'Adult Flame Burn - House Fire',
    difficulty: 'intermediate',
    category: 'adult',
    
    description: 'A 35-year-old male presents with flame burns after escaping a house fire.',
    backstory: 'Patient was trapped in bedroom during house fire for approximately 5 minutes before escaping through window. Fire department on scene.',
    presentingComplaint: 'Burns to back, arms, and legs. Patient reports difficulty breathing and hoarse voice.',
    physicalExam: 'Alert male with extensive burns. Voice hoarse, singed nasal hairs visible. Deep partial-thickness burns to posterior trunk and extremities.',
    
    patientData: {
      ageMonths: 420, // 35 years old
      weightKg: 80,
      hoursSinceInjury: 1,
      mechanism: 'Flame - house fire with smoke inhalation',
      specialSites: {
        face: false,
        hands: true,
        feet: false,
        perineum: false,
        majorJoints: true,
      },
    },
    
    burnRegions: [
      { region: 'Post_Trunk', fraction: 0.75, depth: 'deep-partial' },
      { region: 'R_U_Arm', fraction: 1, depth: 'deep-partial' },
      { region: 'L_U_Arm', fraction: 1, depth: 'deep-partial' },
      { region: 'R_L_Arm', fraction: 0.5, depth: 'deep-partial' },
      { region: 'L_L_Arm', fraction: 0.5, depth: 'deep-partial' },
      { region: 'R_Hand', fraction: 1, depth: 'full-thickness' },
      { region: 'L_Hand', fraction: 1, depth: 'full-thickness' },
    ],
    
    learningObjectives: [
      'Recognize inhalation injury signs and symptoms',
      'Calculate complex multi-region TBSA',
      'Understand fluid resuscitation in major burns',
      'Identify burn center transfer criteria',
    ],
    
    keyTeachingPoints: [
      'Inhalation injury triples mortality risk',
      'Voice changes indicate upper airway involvement',
      'Deep burns require surgical intervention',
      'Escharotomy may be needed for circumferential burns',
    ],
    
    clinicalPearls: [
      'Early intubation for suspected inhalation injury',
      'Monitor for compartment syndrome in extremities',
      'Aggressive fluid resuscitation needed',
      'Consider carbon monoxide poisoning',
    ],
    
    commonMistakes: [
      'Delaying airway management',
      'Underestimating inhalation injury',
      'Inadequate fluid resuscitation',
      'Missing compartment syndrome',
    ],
    
    expectedTbsa: 28,
    expectedFluidRate: 448, // ml/hr for first 8 hours
    expectedTransfer: true,
    
    references: [
      'American Burn Association Practice Guidelines',
      'Inhalation Injury Management Guidelines',
    ],
    
    followUpQuestions: [
      'What are indications for early intubation?',
      'How do you assess for compartment syndrome?',
      'When is escharotomy indicated?',
    ],
  },

  {
    id: 'elderly-scald',
    title: 'Elderly Scald - Bathtub Accident',
    difficulty: 'intermediate',
    category: 'elderly',
    
    description: 'An 82-year-old woman with dementia sustained scald burns in bathtub.',
    backstory: 'Patient has mild dementia and lives with daughter. Found in bathtub with hot water running. Estimated exposure time 10-15 minutes.',
    presentingComplaint: 'Daughter found patient sitting in hot water, unable to get out of tub. Burns to lower body and back.',
    physicalExam: 'Confused elderly female with extensive lower body burns. Some areas appear full-thickness. Patient unable to provide reliable history.',
    
    patientData: {
      ageMonths: 984, // 82 years old  
      weightKg: 55,
      hoursSinceInjury: 2,
      mechanism: 'Prolonged hot water immersion - accidental',
      specialSites: {
        face: false,
        hands: false,
        feet: true,
        perineum: true,
        majorJoints: false,
      },
    },
    
    burnRegions: [
      { region: 'Post_Trunk', fraction: 0.5, depth: 'full-thickness' },
      { region: 'R_Buttock', fraction: 1, depth: 'full-thickness' },
      { region: 'L_Buttock', fraction: 1, depth: 'full-thickness' },
      { region: 'Genitalia', fraction: 1, depth: 'full-thickness' },
      { region: 'R_Thigh', fraction: 0.75, depth: 'deep-partial' },
      { region: 'L_Thigh', fraction: 0.75, depth: 'deep-partial' },
      { region: 'R_Foot', fraction: 1, depth: 'superficial-partial' },
      { region: 'L_Foot', fraction: 1, depth: 'superficial-partial' },
    ],
    
    learningObjectives: [
      'Recognize unique challenges in elderly burn patients',
      'Understand immersion burn patterns',
      'Address capacity and consent issues',
      'Consider prognosis in elderly patients',
    ],
    
    keyTeachingPoints: [
      'Elderly patients have thinner skin - burns deeper',
      'Prolonged immersion causes deeper injuries',
      'Dementia affects pain perception and escape ability',
      'Higher mortality risk in elderly patients',
    ],
    
    clinicalPearls: [
      'Conservative approach may be appropriate',
      'Family discussion about goals of care essential',
      'Infection risk higher in elderly',
      'Consider safeguarding concerns',
    ],
    
    commonMistakes: [
      'Aggressive resuscitation without considering prognosis',
      'Missing safeguarding issues',
      'Inadequate family communication',
      'Underestimating burn depth',
    ],
    
    expectedTbsa: 22,
    expectedFluidRate: 242, // Lower due to elderly physiology
    expectedTransfer: true,
    
    references: [
      'Geriatric Burn Management Guidelines',
      'Adult Protective Services Guidelines',
    ],
    
    followUpQuestions: [
      'How does age affect burn management decisions?',
      'What are the safeguarding considerations?',
      'How do you determine goals of care?',
    ],
  },

  {
    id: 'chemical-burn',
    title: 'Chemical Burn - Industrial Accident',
    difficulty: 'advanced',
    category: 'special',
    
    description: 'A 28-year-old factory worker exposed to concentrated sodium hydroxide (lye).',
    backstory: 'Industrial accident during maintenance work. Patient splashed with 50% sodium hydroxide solution. Irrigation started immediately at scene.',
    presentingComplaint: 'Severe burning pain to face, hands, and anterior chest. Ongoing irrigation for 45 minutes.',
    physicalExam: 'Alert male in severe pain. Skin appears leathery in some areas. Continuous irrigation ongoing. No respiratory distress currently.',
    
    patientData: {
      ageMonths: 336, // 28 years old
      weightKg: 75,
      hoursSinceInjury: 1,
      mechanism: 'Chemical burn - Sodium hydroxide (50% concentration)',
      specialSites: {
        face: true,
        hands: true,
        feet: false,
        perineum: false,
        majorJoints: false,
      },
    },
    
    burnRegions: [
      { region: 'Head', fraction: 0.25, depth: 'deep-partial' },
      { region: 'Ant_Trunk', fraction: 0.5, depth: 'full-thickness' },
      { region: 'R_Hand', fraction: 1, depth: 'full-thickness' },
      { region: 'L_Hand', fraction: 1, depth: 'full-thickness' },
      { region: 'R_U_Arm', fraction: 0.25, depth: 'deep-partial' },
      { region: 'L_U_Arm', fraction: 0.25, depth: 'deep-partial' },
    ],
    
    learningObjectives: [
      'Understand chemical burn pathophysiology',
      'Learn appropriate decontamination procedures',
      'Recognize ongoing tissue damage in chemical burns',
      'Apply specialized chemical burn management',
    ],
    
    keyTeachingPoints: [
      'Alkali burns (like NaOH) cause deeper tissue damage than acids',
      'Irrigation should continue until pH normalizes',
      'Chemical burns continue damaging tissue after exposure',
      'Some chemicals require specific antidotes',
    ],
    
    clinicalPearls: [
      'Remove all contaminated clothing and jewelry',
      'Check pH of irrigation runoff water',
      'Consider systemic toxicity with large exposures',
      'Document chemical name and concentration if known',
    ],
    
    commonMistakes: [
      'Inadequate irrigation duration',
      'Not checking pH of runoff water',
      'Missing eye involvement',
      'Underestimating systemic effects',
    ],
    
    expectedTbsa: 16,
    expectedFluidRate: 240,
    expectedTransfer: true,
    
    references: [
      'Chemical Burn Management Guidelines',
      'NIOSH Chemical Safety Guidelines',
    ],
    
    followUpQuestions: [
      'How long should irrigation continue?',
      'What are signs of systemic toxicity?',
      'How do alkali burns differ from acid burns?',
    ],
  },

  {
    id: 'electrical-burn',
    title: 'High-Voltage Electrical Burn',
    difficulty: 'advanced',
    category: 'special',
    
    description: 'A 22-year-old electrician contacted high-voltage power lines.',
    backstory: 'Apprentice electrician working on power lines contacted 15,000V line. Found unconscious, now alert. Entry wound on right hand, exit wound on left foot.',
    presentingComplaint: 'Small entry and exit wounds but patient reports chest pain and muscle aches throughout body.',
    physicalExam: 'Alert male with small charred areas on right hand and left foot. Minimal visible injury but concerning mechanism.',
    
    patientData: {
      ageMonths: 264, // 22 years old
      weightKg: 70,
      hoursSinceInjury: 0.5,
      mechanism: 'High-voltage electrical injury - 15,000V',
      specialSites: {
        face: false,
        hands: true,
        feet: true,
        perineum: false,
        majorJoints: false,
      },
    },
    
    burnRegions: [
      { region: 'R_Hand', fraction: 0.25, depth: 'full-thickness' }, // Entry point
      { region: 'L_Foot', fraction: 0.25, depth: 'full-thickness' }, // Exit point
    ],
    
    learningObjectives: [
      'Understand electrical injury pathophysiology',
      'Recognize hidden internal injuries',
      'Learn electrical burn monitoring requirements',
      'Apply cardiac and renal monitoring protocols',
    ],
    
    keyTeachingPoints: [
      'Electrical injuries cause internal damage not visible externally',
      'Current travels along path of least resistance',
      'Cardiac arrhythmias and rhabdomyolysis are major risks',
      'TBSA calculation misleading in electrical burns',
    ],
    
    clinicalPearls: [
      'All high-voltage injuries require cardiac monitoring',
      'Check CK levels for rhabdomyolysis',
      'Monitor urine output closely',
      'Compartment syndrome risk in extremities',
    ],
    
    commonMistakes: [
      'Relying on visible burn area for severity assessment',
      'Missing cardiac monitoring',
      'Not checking for rhabdomyolysis',
      'Inadequate fluid resuscitation',
    ],
    
    expectedTbsa: 2, // Misleadingly low
    expectedFluidRate: 150, // May need more due to internal injury
    expectedTransfer: true, // Always for high-voltage
    
    references: [
      'Electrical Injury Management Guidelines',
      'American Heart Association Arrhythmia Protocols',
    ],
    
    followUpQuestions: [
      'Why is visible TBSA misleading in electrical burns?',
      'What cardiac monitoring is required?',
      'How do you assess for compartment syndrome?',
    ],
  },
];

// Utility functions for scenario management
export function getScenariosByDifficulty(difficulty: ClinicalScenario['difficulty']): ClinicalScenario[] {
  return CLINICAL_SCENARIOS.filter(scenario => scenario.difficulty === difficulty);
}

export function getScenariosByCategory(category: ClinicalScenario['category']): ClinicalScenario[] {
  return CLINICAL_SCENARIOS.filter(scenario => scenario.category === category);
}

export function getScenarioById(id: string): ClinicalScenario | undefined {
  return CLINICAL_SCENARIOS.find(scenario => scenario.id === id);
}

export function getAllScenarios(): ClinicalScenario[] {
  return CLINICAL_SCENARIOS;
}
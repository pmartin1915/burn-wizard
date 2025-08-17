/**
 * Discharge teaching content for burn patients
 * TODO: Customize per institutional protocols
 */

export const DISCHARGE_TEACHING_TOPICS = {
  woundCare: {
    title: 'Wound Care at Home',
    points: [
      'Keep dressing clean and dry',
      'Change dressing as directed (typically daily)',
      'Gently clean with mild soap and water',
      'Apply prescribed topical medication',
      'Watch for signs of infection',
    ],
  },
  
  bathing: {
    title: 'Bathing and Hygiene',
    points: [
      'Short, lukewarm showers preferred over baths',
      'Use mild, unscented soap',
      'Gently pat dry, do not rub',
      'Avoid scrubbing or picking at healing skin',
    ],
  },
  
  sunProtection: {
    title: 'Sun Protection',
    points: [
      'Protect healing skin from sun exposure',
      'Use SPF 30+ sunscreen for 1-2 years',
      'Wear protective clothing over healed areas',
      'New skin is more sensitive to burning',
    ],
  },
  
  painManagement: {
    title: 'Pain Management',
    points: [
      'Take prescribed pain medication as directed',
      'Over-the-counter acetaminophen or ibuprofen as needed',
      'Elevation and ice may help with swelling',
      'Contact provider if pain worsens significantly',
    ],
  },
  
  mobilityExercise: {
    title: 'Movement and Exercise',
    points: [
      'Gentle range of motion exercises as tolerated',
      'Avoid prolonged immobility',
      'Physical therapy referral if indicated',
      'Return to activities gradually',
    ],
  },
  
  followUp: {
    title: 'Follow-up Care',
    points: [
      'Return to clinic as scheduled',
      'Keep all follow-up appointments',
      'Contact burn team with concerns',
      'Know when to seek emergency care',
    ],
  },
};

export const WHEN_TO_CALL_PROVIDER = [
  'Signs of infection (fever, increased pain, pus, red streaking)',
  'Wound not healing or getting worse',
  'New or worsening pain',
  'Nausea, vomiting, or inability to keep fluids down',
  'Any concerns about healing process',
];

export const EMERGENCY_SIGNS = [
  'High fever (>101.5°F)',
  'Severe increase in pain',
  'Signs of severe infection or sepsis',
  'Difficulty breathing',
  'Loss of function in burned area',
];
/**
 * UI copy and text constants for the Burn Wizard application
 * Centralized location for all user-facing text to support internationalization
 */

export const APP_METADATA = {
  name: 'Burn Wizard',
  tagline: 'Clinical tool for burn assessment and fluid management',
  version: '0.1.0',
  description: 'Educational burn assessment and documentation support tool'
};

export const SAFETY_COPY = {
  banner: '⚠️ Educational Tool Only - Not for Direct Patient Care - Verify All Calculations',
  disclaimer: 'This application is for educational purposes only. It does not diagnose, prescribe medications, or replace clinical decision-making.',
  verification: 'Always verify calculations with institutional protocols and clinical judgment.',
  scope: 'This tool is designed for educational and documentation support only.',
  dataPrivacy: 'All data remains on your device. No patient information is transmitted over the network.'
};

export const NAVIGATION_COPY = {
  sidebar: {
    title: 'Navigation',
    collapse: 'Collapse sidebar',
    expand: 'Expand sidebar',
    close: 'Close menu'
  },
  tabs: {
    tbsa: {
      title: 'TBSA Assessment',
      description: 'Body map and burn percentage calculation'
    },
    procedure: {
      title: 'Procedure Note',
      description: 'Burn care procedure documentation'
    },
    discharge: {
      title: 'Discharge Teaching',
      description: 'Patient education and home care'
    },
    history: {
      title: 'Patient History',
      description: 'Previous assessments and notes'
    }
  }
};

export const FORM_COPY = {
  patientInfo: {
    title: 'Patient Information',
    ageLabel: 'Age (months)',
    weightLabel: 'Weight (kg)',
    hoursLabel: 'Hours Since Injury',
    mechanismLabel: 'Mechanism of Injury',
    mechanismPlaceholder: 'e.g., scalding, flame, contact',
    specialSitesLabel: 'Special Areas Involved',
    submitButton: 'Review Burn Plan'
  },
  bodyMap: {
    title: 'Body Map',
    instructions: 'Click regions to cycle through burn percentages (0% → 25% → 50% → 75% → 100%)',
    selectedRegions: 'Selected Regions:',
    clearAll: 'Clear All Selections',
    tbsaDisplay: 'TBSA: {percentage}%'
  },
  validation: {
    ageRequired: 'Age is required',
    ageRange: 'Age must be between 0 and 1200 months',
    weightRequired: 'Weight is required',
    weightRange: 'Weight must be between 0.5 and 300 kg',
    hoursRequired: 'Hours since injury is required',
    hoursRange: 'Hours since injury must be between 0 and 168'
  }
};

export const CALCULATIONS_COPY = {
  tbsa: {
    title: 'TBSA Calculation',
    noBurns: 'No burns selected',
    currentTbsa: 'Current TBSA: {percentage}%',
    ageBand: 'Age Band: {band}',
    breakdown: 'Region Breakdown'
  },
  fluids: {
    title: 'Fluid Resuscitation Plan',
    noCalculation: 'Complete patient assessment to view fluid plan.',
    parklandTitle: 'Parkland Formula (Educational)',
    maintenanceTitle: 'Maintenance Fluids',
    monitoringTitle: 'Monitoring Targets',
    totalResuscitation: 'Total Resuscitation',
    currentRate: 'Current Rate Needed',
    first8Hours: 'First 8 Hours',
    next16Hours: 'Next 16 Hours',
    urineOutput: 'Urine Output Goal',
    timeline: 'Fluid Timeline',
    notice: 'Note: Parkland formula is typically indicated for burns ≥10% TBSA. Consider local protocol for smaller burns.'
  }
};

export const COMPONENTS_COPY = {
  dressingGuide: {
    title: 'Dressing Recommendations',
    noRegions: 'Select burn regions to see specific dressing recommendations',
    specialSites: 'Special Sites Involved',
    generalPrinciples: 'General Dressing Principles',
    warningTitle: 'Warning Signs',
    warningSubtitle: 'Contact healthcare provider immediately if any of these signs occur:',
    emergencyContact: 'Emergency Contact: {contact}',
    primaryDressing: 'Primary Dressing:',
    secondaryDressing: 'Secondary Dressing:',
    changeFrequency: 'Change Frequency:',
    specialNotes: 'Special Notes:'
  },
  analgesiaTips: {
    title: 'Pain Management Guidelines',
    overview: 'Pain Management Overview',
    assessmentScales: 'Recommended Pain Assessment Scales',
    strategies: 'Pain Management Strategies',
    medications: 'Medication Classes (Educational Reference)',
    escalation: 'When to Escalate Pain Management',
    patientAge: 'Patient Age:',
    tbsaInvolved: 'TBSA Involved:',
    expectedPain: 'Expected Pain Level:',
    assessmentFrequency: 'Assessment Frequency: Every 15-30 minutes during acute phase, hourly when stable, and before/after interventions.'
  },
  notePreview: {
    title: 'Clinical Note Generator',
    noData: 'Complete patient assessment to generate clinical notes',
    noDataDescription: 'Enter patient information and select burn regions to enable note generation',
    showPreview: 'Show Preview',
    hidePreview: 'Hide Preview',
    copy: 'Copy Note',
    copied: 'Copied!',
    download: 'Download',
    copyClipboard: 'Copy to Clipboard',
    downloadText: 'Download as Text File',
    placeholdersTitle: 'Template Placeholders',
    placeholdersDescription: 'The generated notes contain placeholders marked with {{PLACEHOLDER_NAME}} that need to be completed with specific clinical information:'
  }
};

export const SETTINGS_COPY = {
  title: 'Settings',
  dataManagement: 'Data Management',
  dataDescription: 'All data is stored locally on your device. No information is transmitted to external servers.',
  clearData: 'Clear All Local Data',
  clearConfirm: 'Are you sure you want to clear all data? This cannot be undone.',
  safetyInfo: 'Safety Information',
  units: 'Units',
  language: 'Language',
  theme: 'Theme',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode'
};

export const STATUS_COPY = {
  online: 'Online',
  offline: 'Offline',
  installing: 'Installing...',
  installApp: 'Install App',
  updateAvailable: 'Update Available',
  updateReady: 'App Updated - Restart to Apply'
};

export const ERROR_COPY = {
  calculationError: 'Calculation error occurred. Please check your inputs and try again.',
  clipboardError: 'Failed to copy to clipboard. Please try again.',
  storageError: 'Failed to save data locally. Please check your browser settings.',
  networkError: 'Network error occurred. The app will continue to work offline.',
  generalError: 'An unexpected error occurred. Please refresh the page and try again.'
};

export const ACCESSIBILITY_COPY = {
  skipToMain: 'Skip to main content',
  openMenu: 'Open navigation menu',
  closeMenu: 'Close navigation menu',
  toggleDarkMode: 'Toggle dark mode',
  toggleSidebar: 'Toggle sidebar',
  selectRegion: 'Select burn region: {region}',
  regionSelected: 'Region {region} selected with {percentage}% involvement',
  pageTitle: '{page} - Burn Wizard'
};

export const FOOTER_COPY = {
  version: 'Burn Wizard v{version} - Educational Tool Only',
  reminder: 'Always verify calculations with institutional protocols and clinical judgment',
  copyright: '© {year} Burn Wizard. For educational use only.'
};

/**
 * Helper function to interpolate variables into copy strings
 */
export function interpolate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

/**
 * Age band labels for display
 */
export const AGE_BAND_LABELS: Record<string, string> = {
  infant: 'Infant (0-12 months)',
  '1to4': 'Toddler (1-4 years)',
  '5to9': 'Child (5-9 years)',
  '10to14': 'Adolescent (10-14 years)',
  '15plus': 'Adult (15+ years)'
};

/**
 * Pain level descriptions
 */
export const PAIN_LEVELS: Record<string, string> = {
  minimal: 'Minimal',
  mild: 'Mild to Moderate',
  moderate: 'Moderate to Severe',
  severe: 'Severe'
};

/**
 * Quick age presets for display
 */
export const AGE_PRESET_LABELS = [
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
  { label: '2 years', months: 24 },
  { label: '5 years', months: 60 },
  { label: '10 years', months: 120 },
  { label: '15 years', months: 180 },
  { label: '25 years', months: 300 },
  { label: '40 years', months: 480 }
];
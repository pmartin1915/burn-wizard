/**
 * Interactive Tutorial System for Burn Wizard
 * 
 * Provides step-by-step guidance for new users to learn the system.
 * Each tutorial step includes instructions, targets, and validation.
 */

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector or element ID to highlight (primary target)
  additionalTargets?: string[]; // Additional elements to highlight with secondary styling
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'input' | 'navigate' | 'observe';
  validation?: {
    type: 'element' | 'value' | 'route' | 'custom';
    criteria: Record<string, unknown>;
  };
  skippable?: boolean;
  emphasize?: boolean; // Show with special highlighting
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'assessment' | 'scenarios' | 'advanced';
  estimatedTime: number; // in minutes
  prerequisites?: string[];
  steps: TutorialStep[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Burn Wizard',
    description: 'Learn the basics of burn assessment and navigation',
    category: 'basics',
    estimatedTime: 5,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Burn Wizard! 🧙‍♂️',
        content: `Welcome to Burn Wizard, your comprehensive tool for burn assessment and education. 
        
This tutorial will guide you through the essential features in just 5 minutes. You'll learn how to:

• Navigate the interface
• Assess burn severity using the body map  
• Calculate TBSA (Total Body Surface Area)
• Understand fluid resuscitation protocols

Ready to become a burn assessment wizard? Let's begin!`,
        position: 'center',
        action: 'observe',
        emphasize: true,
      },
      {
        id: 'navigation',
        title: 'Navigation Sidebar',
        content: `This sidebar contains all the main features of Burn Wizard:

• **TBSA Assessment** - Interactive body map for burn evaluation
• **Clinical Scenarios** - Practice with realistic cases  
• **Procedure Note** - Documentation and reporting
• **Settings** - Customize your experience

Click on the TBSA Assessment Tab or press next to continue.`,
        target: '[data-tab="tbsa"]',
        position: 'bottom',
        action: 'click',
        validation: {
          type: 'route',
          criteria: { route: 'tbsa' }
        },
      },
      {
        id: 'patient-data',
        title: 'Patient Information',
        content: `First, we need patient information for accurate calculations.

Age is crucial because children have different body proportions than adults. The Lund-Browder method automatically adjusts percentages based on age.

The entire Patient Information panel is highlighted, with special attention to the age input field where you can specify the patient's age in months.`,
        target: '[data-element="patient-info"]',
        additionalTargets: ['[data-field="age"]'],
        position: 'right', 
        action: 'observe',
        emphasize: true,
      },
      {
        id: 'body-map-intro',
        title: 'Interactive Body Map',
        content: `This is the heart of Burn Wizard - the interactive body map!

You can choose between two views:
• **🧑‍⚕️ SVG Diagram** - Visual anatomical representation (currently shown)
• **📊 Grid View** - Button-based region selection (click "🧑‍⚕️ Diagram View" to switch)

Both views work the same way. Click on any body region to select burn involvement. Each click cycles through: 0% → 25% → 50% → 75% → 100%

The entire Interactive Body Map is highlighted, with special focus on the **Head** region. Click on the Head to try it out!`,
        target: '[data-region="Head"]',
        additionalTargets: ['[data-element="body-map"]'],
        position: 'top',
        action: 'click',
      },
      {
        id: 'tbsa-calculation',
        title: 'Real-time TBSA Calculation',
        content: `Great job! When you click on body regions, notice how the TBSA percentage updates automatically.

Burn Wizard calculates Total Body Surface Area in real-time using the medically-accurate Lund-Browder method. The calculation considers:

• Patient age (pediatric vs adult proportions)  
• Burn depth classification
• Fractional involvement of each region

The highlighted **TBSA display** shows your current total percentage. You can try clicking the chest area to see how different regions contribute different percentages.`,
        target: '[data-element="tbsa-display"]',
        position: 'bottom',
        action: 'observe',
      },
      {
        id: 'burn-depth',
        title: 'Burn Depth Classification',
        content: `Burn depth is crucial for proper treatment. Burn Wizard supports four classifications:

• **Superficial (1st degree)** - Red, dry, painful (like sunburn)
• **Superficial Partial (2nd degree)** - Blisters, very painful  
• **Deep Partial (2nd degree)** - Less sensation, may need grafting
• **Full Thickness (3rd degree)** - No sensation, requires grafting

Select the appropriate depth before marking burn regions. Different depths have different treatment requirements and affect transfer decisions.`,
        target: '[data-field="burn-depth-selector"]',
        position: 'right',
        action: 'observe',
      },
      {
        id: 'scenarios-preview',
        title: 'Clinical Scenarios',
        content: `Ready to practice? The Clinical Scenarios section provides realistic training cases:

• **Pediatric cases** with age-specific considerations
• **Adult trauma** scenarios with complex injuries
• **Special situations** like chemical and electrical burns

Each scenario includes learning objectives, teaching points, and expected outcomes. Perfect for medical education!

Click on **Clinical Scenarios** to explore this feature.`,
        target: '[data-tab="scenarios"]',
        position: 'right',
        action: 'click',
        validation: {
          type: 'route',
          criteria: { route: 'scenarios' }
        },
      },
      {
        id: 'completion',
        title: 'Tutorial Complete! 🎉',
        content: `Congratulations! You've mastered the basics of Burn Wizard.

**What you've learned:**
• Navigation and interface basics
• Patient data entry and age considerations  
• Interactive body map usage
• Real-time TBSA calculations
• Burn depth classifications
• Clinical scenarios for practice

**Next steps:**
• Try the clinical scenarios to practice
• Explore the procedure documentation
• Customize settings to your preference

You're now ready to use Burn Wizard for burn assessment and education. Happy learning! 🧙‍♂️✨`,
        position: 'center',
        action: 'observe',
        emphasize: true,
      },
    ],
  },

  {
    id: 'advanced-assessment',
    title: 'Advanced Burn Assessment',
    description: 'Master complex burn evaluation techniques',
    category: 'assessment', 
    estimatedTime: 8,
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'intro',
        title: 'Advanced Assessment Techniques',
        content: `This tutorial covers advanced burn assessment skills used by burn specialists.

You'll learn:
• Complex multi-region burn evaluation
• Special anatomical considerations
• Burn center transfer criteria
• Fluid resuscitation monitoring
• Documentation best practices

This builds on the basics tutorial - make sure you're comfortable with those concepts first.`,
        position: 'center',
        action: 'observe',
        emphasize: true,
      },
      {
        id: 'special-sites',
        title: 'High-Risk Anatomical Areas',
        content: `Certain body areas require special consideration:

• **Face/Neck** - Airway compromise risk
• **Hands/Feet** - Functional impairment  
• **Perineum** - Infection and contracture risk
• **Major Joints** - Movement limitation
• **Circumferential burns** - Compartment syndrome risk

These areas often require burn center evaluation regardless of TBSA percentage. The patient data form tracks these special sites.`,
        target: '[data-field="special-sites"]',
        position: 'left',
        action: 'observe',
      },
      {
        id: 'transfer-criteria',
        title: 'Burn Center Transfer Decision',
        content: `Not all burns require burn center care, but certain criteria mandate transfer:

• Partial thickness >10% TBSA in adults (>5% in children)
• Full thickness >5% TBSA
• Burns involving face, hands, feet, genitalia, perineum, major joints
• Chemical or electrical burns
• Inhalation injury
• Burn + trauma where burn poses greatest risk

Burn Wizard automatically identifies cases requiring burn center evaluation based on established criteria.`,
        target: '[data-element="transfer-recommendation"]',
        position: 'top',
        action: 'observe',
      },
      // More advanced steps would continue here...
    ],
  },

  {
    id: 'scenario-walkthrough',
    title: 'Clinical Scenario Walkthrough', 
    description: 'Step-by-step guide through a realistic case',
    category: 'scenarios',
    estimatedTime: 10,
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'scenario-intro',
        title: 'Learning Through Scenarios',
        content: `Clinical scenarios are the best way to develop burn assessment skills.

This tutorial will walk you through a complete case from initial presentation to final documentation. You'll learn:

• How to approach a burn case systematically
• Critical thinking in burn assessment
• Documentation and communication
• Quality assurance and learning points

Let's work through the "Pediatric Scald Burn" scenario together.`,
        position: 'center',
        action: 'observe',
        emphasize: true,
      },
      // More scenario-specific steps would continue...
    ],
  },
];

// Utility functions
export function getTutorialById(id: string): Tutorial | undefined {
  return TUTORIALS.find(tutorial => tutorial.id === id);
}

export function getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
  return TUTORIALS.filter(tutorial => tutorial.category === category);
}

export function getAvailableTutorials(completedTutorials: string[] = []): Tutorial[] {
  return TUTORIALS.filter(tutorial => {
    if (!tutorial.prerequisites) return true;
    return tutorial.prerequisites.every(prereq => completedTutorials.includes(prereq));
  });
}

export function getNextStep(tutorialId: string, currentStepId: string): TutorialStep | null {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) return null;
  
  const currentIndex = tutorial.steps.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === tutorial.steps.length - 1) return null;
  
  return tutorial.steps[currentIndex + 1];
}

export function getPreviousStep(tutorialId: string, currentStepId: string): TutorialStep | null {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) return null;
  
  const currentIndex = tutorial.steps.findIndex(step => step.id === currentStepId);
  if (currentIndex <= 0) return null;
  
  return tutorial.steps[currentIndex - 1];
}

/**
 * Validates if a tutorial step's completion criteria have been met
 * @param step - The tutorial step to validate
 * @param currentContext - Context object with current app state
 * @returns boolean indicating if step validation passed
 */
export function validateTutorialStep(
  step: TutorialStep, 
  currentContext: {
    currentRoute?: string;
    patientData?: Record<string, unknown>;
    regionSelections?: unknown[];
    elementValue?: string;
  }
): boolean {
  if (!step.validation) {
    return true; // No validation required
  }

  switch (step.validation.type) {
    case 'route':
      const expectedRoute = step.validation.criteria.route;
      return currentContext.currentRoute === expectedRoute;
      
    case 'element':
      // Check if target element exists and optionally has specific attributes
      const element = step.target ? document.querySelector(step.target) : null;
      if (!element) return false;
      
      if (step.validation.criteria.hasClass) {
        return element.classList.contains(step.validation.criteria.hasClass as string);
      }
      return true;
      
    case 'value':
      // Validate that certain values are present (e.g., patient data entered)
      const requiredFields = step.validation.criteria.fields as string[];
      if (requiredFields && currentContext.patientData) {
        return requiredFields.every(field => {
          const value = (currentContext.patientData as Record<string, unknown>)[field];
          return value !== null && value !== undefined && value !== '';
        });
      }
      return true;
      
    case 'custom':
      // Custom validation logic for complex scenarios
      const validationFn = step.validation.criteria.validator as Function;
      return validationFn ? validationFn(currentContext) : true;
      
    default:
      return true;
  }
}

/**
 * Checks if a tutorial step should auto-advance based on validation
 * @param step - The tutorial step to check
 * @param currentContext - Current app state context
 * @returns boolean indicating if step should auto-advance
 */
// Track when steps were first reached to prevent immediate auto-advance
const stepStartTimes = new Map<string, number>();

export function shouldAutoAdvanceStep(
  step: TutorialStep,
  currentContext: {
    currentRoute?: string;
    patientData?: Record<string, unknown>;
    regionSelections?: unknown[];
  }
): boolean {
  // Only auto-advance if there's validation and it passes
  if (!step.validation) return false;
  
  // Track when this step was first encountered
  const stepKey = `${step.id}`;
  if (!stepStartTimes.has(stepKey)) {
    stepStartTimes.set(stepKey, Date.now());
    return false; // Don't auto-advance immediately on first encounter
  }
  
  // Require minimum time on step before auto-advancing (prevents instant completion)
  const stepStartTime = stepStartTimes.get(stepKey)!;
  const timeSinceStart = Date.now() - stepStartTime;
  const minimumStepTime = 1500; // 1.5 seconds minimum
  
  if (timeSinceStart < minimumStepTime) {
    return false;
  }
  
  // Auto-advance for navigation-based steps
  if (step.validation.type === 'route' && step.action === 'click') {
    return validateTutorialStep(step, currentContext);
  }
  
  return false;
}

// Clear step timings when tutorials start/end
export function clearStepTimings() {
  stepStartTimes.clear();
}
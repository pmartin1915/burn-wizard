# Burn Wizard - Codebase Architecture Guide

## 📁 **Complete Directory Structure**

```
burn-wizard/
├── AI_HANDOFF_GUIDE.md           # Complete AI development guide
├── PROJECT_STATUS.md             # Current roadmap and status  
├── start-burn-wizard.bat         # One-click launch script
├── README.md                     # Project overview and setup
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Build system configuration
│
├── app/                         # Main application code
│   ├── public/                  # Static assets (PWA manifests, icons)
│   ├── index.html              # Application entry point
│   │
│   └── src/                    # Source code
│       ├── main.tsx            # React app initialization
│       ├── App.tsx             # Root component with routing
│       │
│       ├── components/         # React UI components
│       │   ├── BodyMap.tsx     # Interactive burn region selector
│       │   ├── Header.tsx      # Navigation and branding
│       │   ├── Sidebar.tsx     # Menu navigation
│       │   ├── AnalgesiaTips.tsx      # Pain management content
│       │   ├── DressingGuide.tsx      # Wound care guidance
│       │   ├── BurnDepthSelector.tsx  # Depth classification UI
│       │   ├── AuthenticationDialog.tsx  # Security framework
│       │   ├── SecuritySettings.tsx      # Security options
│       │   └── ui/             # Reusable UI primitives
│       │       ├── badge.tsx   # Status indicators
│       │       ├── dialog.tsx  # Modal dialogs
│       │       └── switch.tsx  # Toggle switches
│       │
│       ├── domain/             # Pure clinical calculation functions
│       │   ├── tbsa.ts         # Lund-Browder TBSA calculations
│       │   ├── fluids.ts       # Parkland formula & monitoring
│       │   ├── types.ts        # TypeScript interface definitions
│       │   ├── validation.ts   # Input validation schemas
│       │   ├── notes.ts        # Clinical documentation templates
│       │   ├── clinicalDecisionTree.ts    # Interactive protocol guidance
│       │   ├── protocolTemplates.ts       # Educational content system
│       │   ├── documentationGenerator.ts  # Report generation
│       │   └── __tests__/      # Comprehensive test suite
│       │       ├── tbsa.test.ts    # TBSA calculation tests
│       │       └── fluids.test.ts  # Fluid management tests
│       │
│       ├── constants/          # Clinical data and configuration
│       │   ├── lundBrowder.ts  # Hospital-extracted body proportions
│       │   ├── burnDepth.ts    # Burn classification definitions
│       │   └── copy.ts         # UI text and messaging
│       │
│       ├── core/               # Core system functionality
│       │   ├── safety.ts       # Disclaimers & safety validation
│       │   └── security-simple.ts  # Authentication framework
│       │
│       ├── lib/                # Shared utilities
│       │   └── utils.ts        # Helper functions (rounding, formatting)
│       │
│       ├── routes/             # Page-level components
│       │   └── Settings.tsx    # Application settings interface
│       │
│       └── store/              # State management
│           └── useWizardStore.ts   # Zustand store with persistence
│
├── docs/                       # Additional documentation
│   ├── Medical_Data_Verification.md
│   ├── Risk_Register.md
│   └── SRS.md
│
└── scripts/                    # Build and utility scripts
```

## 🏗️ **Architectural Patterns**

### 1. Domain-Driven Design
```typescript
// Pure functions in domain layer
domain/
├── tbsa.ts      // Core TBSA calculations
├── fluids.ts    // Parkland formula logic
└── types.ts     // Shared interfaces
```

**Benefits:**
- Business logic separated from UI
- Pure functions are easily testable
- Clinical calculations are reusable
- No side effects in core domain

### 2. Component-Based UI
```typescript
// React components with clear responsibilities
components/
├── BodyMap.tsx       // Burn region selection
├── Header.tsx        // Navigation
└── ui/              // Reusable primitives
```

**Benefits:**
- Modular and maintainable
- Reusable UI components
- Clear separation of concerns
- Accessible design patterns

### 3. Centralized State Management
```typescript
// Zustand store with persistence
store/useWizardStore.ts
├── Patient data
├── Region selections  
├── Application settings
└── Local persistence
```

**Benefits:**
- Single source of truth
- Automatic local storage
- Type-safe state updates
- Offline-first design

## 🧮 **Core Calculation Flows**

### TBSA Calculation Flow
```
User Input → RegionSelection[] → calcTbsa() → TbsaResult
    ↓              ↓                ↓           ↓
[region,      [validated     [age-specific  [tbsaPct,
fraction,      inputs]        percentages]   breakdown,
depth]                                       ageGroup]
```

### Fluid Management Flow
```
Patient Data → calcFluids() → FluidResult
     ↓              ↓            ↓
[weight,kg,    [Parkland     [timeline,
tbsa%,         formula       rates,
hours]         applied]      phases]

Monitoring Data → assessBurnFluidManagement() → Complete Assessment
       ↓                      ↓                         ↓
[urine output,        [integrated          [recommendations,
vitals,               analysis]            adjustments,
current rate]                              safety notes]
```

## 🎯 **Key Integration Points**

### 1. Clinical Calculations ↔ UI Components
```typescript
// BodyMap.tsx uses calcTbsa for real-time updates
const currentTbsa = React.useMemo(() => {
  return calcTbsa(patientData.ageMonths, regionSelections);
}, [patientData.ageMonths, regionSelections]);
```

### 2. State Management ↔ Domain Logic
```typescript
// Store provides data, domain functions process it
const { patientData, regionSelections } = useWizardStore();
const tbsaResult = calcTbsa(patientData.ageMonths, regionSelections);
```

### 3. Educational System ↔ Clinical Functions
```typescript
// Decision tree integrates with fluid calculations
const assessment = assessBurnFluidManagement({...params});
const decisionNode = navigateDecisionTree(patientData);
```

## 🧪 **Testing Strategy**

### Unit Tests (20 tests total)
```
__tests__/
├── tbsa.test.ts     # Age groups, TBSA calculations, edge cases
└── fluids.test.ts   # Parkland formula, monitoring, adjustments
```

**Coverage Areas:**
- Age group boundary conditions
- Clinical calculation accuracy  
- Input validation and error handling
- Edge cases (extreme values, empty data)
- Integration between functions

### Test Execution
```bash
npm test           # Run all tests
npm run typecheck  # Validate TypeScript
npm run lint       # Code quality checks
```

## 🛡️ **Safety & Security Architecture**

### Multi-Level Safety System
```
1. Input Validation (validation.ts)
   ├── Zod schemas for type safety
   ├── Clinical range checking
   └── Error message guidance

2. Clinical Validation (safety.ts)  
   ├── Weight/age/TBSA warnings
   ├── Protocol compliance checks
   └── Critical alert system

3. Educational Disclaimers
   ├── Contextual warnings per feature
   ├── Comprehensive legal disclaimers
   └── Professional responsibility reminders

4. Authentication Framework (security-simple.ts)
   ├── User authentication system
   └── Security settings management
```

## 🔄 **Data Flow Patterns**

### User Interaction Flow
```
1. User Input (BodyMap, Settings)
   ↓
2. State Update (useWizardStore)
   ↓  
3. Domain Calculation (tbsa.ts, fluids.ts)
   ↓
4. Result Display (UI Components)
   ↓
5. Educational Content (Decision Tree, Templates)
```

### Offline-First Architecture
```
Browser Storage ↔ Zustand Store ↔ React Components
      ↓                ↓              ↓
[IndexedDB/        [In-memory      [Real-time
LocalStorage]       state]         updates]
```

## 📚 **Educational System Architecture**

### 1. Interactive Decision Tree
```
clinicalDecisionTree.ts
├── Decision nodes with branching logic
├── Clinical rationale for each decision
├── Integration with patient data
└── Educational explanations
```

### 2. Protocol Templates
```
protocolTemplates.ts  
├── Comprehensive protocol explanations
├── Clinical pearls and key points
├── Safety considerations
└── Educational content generation
```

### 3. Documentation Generator
```
documentationGenerator.ts
├── Clinical report generation
├── Educational scenario creation
├── Comprehensive case documentation
└── Export functionality
```

## 🚀 **Development Workflow**

### Development Environment Setup
```bash
# 1. Launch application
double-click start-burn-wizard.bat

# 2. Development commands  
npm run dev        # Development server
npm test          # Test suite
npm run build     # Production build
npm run typecheck # Type validation
```

### Code Quality Pipeline
```
1. TypeScript Strict Mode
   ├── Full type safety
   ├── Compile-time error detection
   └── IntelliSense support

2. ESLint + Prettier
   ├── Code style consistency
   ├── Best practice enforcement
   └── Automatic formatting

3. Comprehensive Testing
   ├── Domain function unit tests
   ├── Integration testing
   └── Edge case validation
```

## 🎭 **AI Development Guidelines**

### When Adding New Features:
1. **Follow Architecture Patterns** - Use existing patterns
2. **Maintain Test Coverage** - Add tests for new functionality
3. **Preserve Safety Systems** - Keep all disclaimers and warnings
4. **Document Clinical Rationale** - Explain medical reasoning
5. **Validate Against Protocols** - Ensure clinical accuracy

### When Modifying Existing Code:
1. **Run Full Test Suite** - Ensure nothing breaks
2. **Check Age Boundaries** - Critical for TBSA accuracy
3. **Verify Clinical Logic** - Maintain hospital-grade accuracy
4. **Update Documentation** - Keep comments current
5. **Test Edge Cases** - Verify extreme value handling

### Common Development Patterns:
```typescript
// 1. Pure domain functions
export function clinicalCalculation(input: Type): Result {
  // Validation
  if (input < 0) throw new Error('Clinical context error');
  
  // Calculation  
  const result = /* clinical logic */;
  
  // Return with proper typing
  return { value: round1(result), notes: ['Educational context'] };
}

// 2. React component integration
const Component = () => {
  const { storeData } = useWizardStore();
  const result = clinicalCalculation(storeData);
  return <div>{result.value}</div>;
};

// 3. Educational content addition
const educationalTemplate = {
  title: 'Clinical Concept',
  explanation: 'Educational content',
  keyPoints: ['Learning objectives'],
  clinicalPearls: ['Practice insights']
};
```

---

**This architecture supports the dual goals of clinical accuracy and educational value while maintaining the highest safety standards for medical educational tools.**

*Last Updated: Current development session*  
*Architecture Status: ✅ Production-ready foundation established*
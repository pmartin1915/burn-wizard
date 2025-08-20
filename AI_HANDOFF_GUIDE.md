# AI Development Handoff Guide
## Burn Wizard - Pediatric Clinical Educational Tool

This document provides comprehensive guidance for AI assistants (Cline/Deepseek/Claude Code/etc.) taking over development of this burn management educational application.

## 🎯 **Project Overview**

### Primary Purpose
Educational tool for teaching pediatric burn assessment and fluid management protocols. **NOT** for direct patient care.

### Key Clinical Features Implemented
- **TBSA Assessment**: Age-specific Lund-Browder calculations
- **Parkland Formula**: Complete fluid resuscitation protocol with monitoring
- **Educational Workflows**: Decision trees, protocol explanations, documentation generation
- **Safety Framework**: Comprehensive disclaimers and input validation

## 📁 **Critical File Architecture**

### Core Domain Logic (`/app/src/domain/`)
```
domain/
├── tbsa.ts              # TBSA calculations (Lund-Browder method)
├── fluids.ts            # Parkland formula + monitoring protocols  
├── types.ts             # TypeScript interfaces for all clinical data
├── validation.ts        # Input validation schemas
├── clinicalDecisionTree.ts    # Interactive protocol guidance
├── protocolTemplates.ts       # Educational content templates
├── documentationGenerator.ts  # Clinical report generation
└── __tests__/          # Comprehensive test suite (20 tests)
```

### Constants (`/app/src/constants/`)
```
constants/
├── lundBrowder.ts      # Hospital-extracted body proportion data
├── burnDepth.ts        # Burn classification definitions
└── copy.ts            # UI text and messages
```

### Safety & Core (`/app/src/core/`)
```
core/
├── safety.ts          # Disclaimers, legal warnings, input validation
└── security-simple.ts # Authentication framework
```

## 🧬 **Core Clinical Logic Explained**

### 1. TBSA Calculation (`tbsa.ts`)
```typescript
// Main function flow:
calcTbsa(ageMonths, selections) {
  1. validateSelections() - Check input format
  2. calcAgeGroup(ageMonths) - Determine age category  
  3. For each selection:
     - Get region percentage for age
     - Apply fractional involvement
     - Add to breakdown
  4. Sum all contributions
  5. Return {tbsaPct, breakdown, ageGroup}
}
```

**Critical Age Boundaries:**
- '0': 0-<1 year (0-11.99 months)
- '1': 1-<5 years (12-59.99 months)  
- '5': 5-<10 years (60-119.99 months)
- '10': 10-<15 years (120-179.99 months)
- '15': 15-<18 years (180-215.99 months)
- 'Adult': 18+ years (216+ months)

**Must synchronize with:** `lundBrowder.ts` age group boundaries

### 2. Fluid Calculations (`fluids.ts`)
```typescript
// Parkland Formula Implementation:
4ml/kg × %TBSA × weight(kg) = Total 24h fluid
├── First 8 hours: 50% of total
└── Next 16 hours: 50% of total

// Monitoring Protocol:
- Target urine output: 30-50ml/hr (adults >20kg)
- Adjustments: ±20% based on urine output
- Vital targets: HR <60, BP >90/60, SaO2 >90%
```

### 3. Educational System (`clinicalDecisionTree.ts`, `protocolTemplates.ts`)
- Interactive decision tree for protocol guidance
- Educational templates explaining clinical concepts
- Documentation generator for comprehensive reports

## 🧪 **Testing Strategy**

### Test Coverage: 20/20 Tests Passing
```bash
npm test  # Runs complete test suite
```

### Key Test Files:
- `/app/src/domain/__tests__/tbsa.test.ts` - TBSA calculations
- `/app/src/domain/__tests__/fluids.test.ts` - Parkland formula & monitoring

### Critical Test Scenarios:
1. **Age Group Boundaries** - Test exact age thresholds
2. **TBSA Edge Cases** - Infant vs adult proportions
3. **Fluid Monitoring** - Urine output adjustment logic
4. **Input Validation** - Error handling for invalid data

## 🎨 **UI Component Structure**

### Key Components (`/app/src/components/`)
```
components/
├── BodyMap.tsx            # Interactive body region selector
├── BurnDepthSelector.tsx  # Depth classification UI
├── Header.tsx            # Navigation and branding
├── Sidebar.tsx           # Navigation menu
├── AnalgesiaTips.tsx     # Pain management content
├── DressingGuide.tsx     # Wound care guidance
└── ui/                   # Reusable UI primitives
```

### State Management (`/app/src/store/`)
- **Zustand store** with local persistence
- **Type-safe** state management
- **Offline-first** data handling

## 🔧 **Development Workflow**

### Quick Start
```bash
# Launch application  
double-click start-burn-wizard.bat
# OR manually:
npm install && npm run dev
```

### Development Commands
```bash
npm run dev        # Development server (http://localhost:5173)
npm run build      # Production build
npm test          # Run test suite
npm run lint      # Code quality checks
npm run typecheck # TypeScript validation
```

### Code Quality Standards
- **TypeScript strict mode** required
- **ESLint + Prettier** compliance  
- **100% test coverage** for domain functions
- **JSDoc documentation** for all public functions
- **Comprehensive error handling** with clinical context

## ⚠️ **Critical Safety Considerations**

### Educational Scope
- **ALWAYS** maintain educational disclaimers
- **NEVER** remove safety warnings
- **NEVER** suggest direct patient care use
- **ALWAYS** encourage clinical supervision

### Legal Requirements  
- Comprehensive disclaimers in `safety.ts`
- Contextual warnings throughout UI
- Input validation with clinical alerts
- Professional standards documentation

## 🚀 **Current Development Status**

### ✅ COMPLETED (Phase 1 & 2)
- Core TBSA and fluid calculations
- Complete Parkland protocol implementation
- Educational workflow system
- Comprehensive safety framework
- Production-ready clinical accuracy

### 🚧 IN PROGRESS (Phase 3)
- Enhanced body map with SVG graphics
- Mobile navigation improvements  
- Additional clinical content integration

### 📋 PLANNED (Phase 4)
- Interactive tutorials and case studies
- Multi-language support
- Advanced export capabilities
- Clinical validation with experts

## 🎯 **AI Development Guidelines**

### When Modifying Clinical Logic:
1. **ALWAYS** run tests after changes: `npm test`
2. **VERIFY** age boundaries remain synchronized
3. **MAINTAIN** clinical accuracy against hospital protocols
4. **PRESERVE** educational disclaimers and safety warnings
5. **DOCUMENT** changes with clinical rationale

### When Adding Features:
1. **FOLLOW** domain-driven architecture patterns
2. **CREATE** comprehensive tests first (TDD approach)
3. **ENSURE** accessibility compliance (ARIA, keyboard nav)
4. **MAINTAIN** offline-first PWA capabilities
5. **INCLUDE** appropriate educational context

### When Debugging:
1. **CHECK** test suite first: `npm test`
2. **VERIFY** TypeScript compilation: `npm run typecheck`
3. **REVIEW** browser console for runtime errors
4. **VALIDATE** clinical calculations against known values
5. **TEST** edge cases (age boundaries, extreme values)

## 📚 **Key Learning Resources**

### Clinical References
- American Burn Association protocols
- Lund-Browder methodology papers
- Parkland formula original research
- Pediatric burn management guidelines

### Technical Documentation
- `/docs/` folder for detailed architecture
- `PROJECT_STATUS.md` for current roadmap
- `README.md` for setup instructions
- Individual file JSDoc comments

### Code Examples
```typescript
// Example: Adding new clinical calculation
export function newClinicalFunction(
  param1: number,
  param2: ClinicalType
): ResultType {
  // 1. Input validation
  if (param1 < 0) throw new Error('Clinical validation message');
  
  // 2. Clinical calculation
  const result = /* calculation logic */;
  
  // 3. Return with proper typing
  return {
    value: round1(result),
    clinicalNotes: ['Educational context'],
    disclaimer: 'Educational use only'
  };
}
```

## 🤖 **AI Collaboration Tips**

### Best Practices:
- **READ** existing tests to understand expected behavior
- **ASK** for clinical validation when uncertain
- **PRESERVE** all safety and educational context
- **MAINTAIN** code quality and documentation standards
- **TEST** thoroughly before considering work complete

### Red Flags to Avoid:
- Removing safety disclaimers
- Changing age boundaries without testing
- Adding direct patient care features
- Breaking existing test coverage
- Bypassing input validation

### Success Metrics:
- All tests pass: `npm test`
- TypeScript compiles cleanly: `npm run typecheck`
- Application launches successfully: `npm run dev`
- Clinical calculations remain accurate
- Educational context preserved

---

**Remember**: This is an educational tool with real clinical implications. Maintain the highest standards for accuracy, safety, and professional responsibility. When in doubt, err on the side of caution and educational disclaimers.

*Last Updated: Current development session*
*AI Handoff Ready: ✅ All critical documentation complete*
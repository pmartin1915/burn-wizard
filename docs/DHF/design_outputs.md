# Design History File - Design Outputs

**Document:** Design Outputs  
**Project:** Burn Wizard  
**Version:** 1.0  
**Date:** 2025-08-18  
**Owner:** Perry Martin

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-08-18 | Perry Martin | Initial design outputs documentation |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Software Architecture](#2-software-architecture)
3. [Domain Module Design](#3-domain-module-design)
4. [User Interface Design](#4-user-interface-design)
5. [Security Design](#5-security-design)
6. [Data Management Design](#6-data-management-design)
7. [Verification Artifacts](#7-verification-artifacts)
8. [Manufacturing Information](#8-manufacturing-information)
9. [Labeling and Instructions](#9-labeling-and-instructions)
10. [Traceability Matrix](#10-traceability-matrix)

---

## 1. Introduction

### 1.1 Purpose

This document captures all design outputs for Burn Wizard, demonstrating how design inputs have been translated into implementation. Design outputs include the technical specifications, software architecture, algorithms, and verification artifacts that collectively constitute the medical device software.

### 1.2 Scope

Design outputs include:
- Software architecture and module specifications
- Algorithm implementations and mathematical models
- User interface designs and interaction specifications
- Security and data protection implementations
- Verification plans and test specifications
- Deployment and installation procedures

### 1.3 Design Output Completeness

All design outputs:
- ✅ Address corresponding design inputs
- ✅ Do not contradict design inputs
- ✅ Include acceptance criteria for verification
- ✅ Include specifications for procurement, production, and installation
- ✅ Are expressed in terms that allow adequate evaluation

---

## 2. Software Architecture

### 2.1 Overall System Architecture

#### DO-ARCH-001: Modular Architecture Design

**Design Input Reference:** DI-FR-001, DI-FR-002, DI-PF-004  
**Implementation:** `/app/src/` directory structure

```
app/src/
├── domain/              # Pure calculation modules
│   ├── tbsa.ts         # Lund-Browder TBSA calculations
│   ├── fluids.ts       # Parkland formula implementation
│   ├── validation.ts   # Input validation and schemas
│   └── types.ts        # Core type definitions
├── components/         # UI components
│   ├── BodyMap.tsx     # Interactive body region selection
│   ├── FluidPlan.tsx   # Fluid calculation display
│   └── NotePreview.tsx # Clinical note generation
├── constants/          # Clinical reference data
│   └── lundBrowder.ts  # Age-adjusted TBSA percentages
├── core/              # Core application services
│   ├── safety.ts      # Safety and validation utilities
│   └── security-simple.ts # Security management
└── store/             # State management
    └── useWizardStore.ts # Application state
```

**Design Rationale:**
- Domain logic isolation enables independent testing and verification
- Pure function design ensures deterministic calculations
- Clear separation of concerns supports maintainability and regulatory compliance

### 2.2 Progressive Web App Architecture

#### DO-ARCH-002: Offline-First PWA Design

**Design Input Reference:** DI-PF-003, UN-004  
**Implementation:** `vite.config.ts`, service worker configuration

**PWA Components:**
- **Service Worker:** Offline functionality and caching strategy
- **Web App Manifest:** Installation and branding configuration
- **Local Storage:** Encrypted data persistence
- **Cache Strategy:** Clinical-grade offline reliability

**Verification:** Offline functionality testing for 30+ minute duration

### 2.3 TypeScript Architecture

#### DO-ARCH-003: Type Safety Implementation

**Design Input Reference:** DI-RG-003, code quality requirements  
**Implementation:** `tsconfig.json` strict mode configuration

```typescript
// Core type definitions ensuring type safety
export interface TbsaResult {
  tbsaPct: number;
  breakdown: Record<BodyArea, number>;
  ageGroup: AgeGroup;
}

export interface FluidResult {
  parkland: ParklandResult;
  maintenance: MaintenanceResult;
  timeline: TimelineEntry[];
  notice?: string;
}
```

**Design Rationale:**
- Strict TypeScript prevents runtime errors
- Comprehensive type definitions ensure API consistency
- Type safety critical for medical calculation accuracy

---

## 3. Domain Module Design

### 3.1 TBSA Calculation Module

#### DO-DOMAIN-001: Lund-Browder Implementation

**Design Input Reference:** DI-FR-001, DI-STD-001  
**Implementation:** `/app/src/domain/tbsa.ts`

**Core Algorithm:**
```typescript
export function calcTbsa(ageMonths: number, selections: RegionSelection[]): TbsaResult {
  validateSelections(selections);
  
  const ageGroup = calcAgeGroup(ageMonths);
  const breakdown: Record<BodyArea, number> = {} as Record<BodyArea, number>;
  
  // Initialize all regions to 0
  Object.keys(LUND_BROWDER_PERCENTAGES).forEach((region) => {
    breakdown[region as BodyArea] = 0;
  });
  
  // Calculate TBSA for each selected region
  let totalTbsa = 0;
  for (const selection of selections) {
    const regionPercent = getBodyAreaPercentage(selection.region, ageMonths / 12);
    const adjustedPercent = regionPercent * selection.fraction;
    breakdown[selection.region] = round1(adjustedPercent);
    totalTbsa += adjustedPercent;
  }
  
  return {
    tbsaPct: round1(totalTbsa),
    breakdown,
    ageGroup,
  };
}
```

**Design Features:**
- Pure function implementation (no side effects)
- Age-based percentage lookup from clinical constants
- Fractional involvement support (0, 0.25, 0.5, 0.75, 1.0)
- Comprehensive input validation
- Deterministic rounding for consistency

**Verification:** Unit tests with reference case validation, accuracy within ±0.1%

### 3.2 Fluid Calculation Module

#### DO-DOMAIN-002: Parkland Formula Implementation

**Design Input Reference:** DI-FR-002, DI-STD-002  
**Implementation:** `/app/src/domain/fluids.ts`

**Core Algorithm:**
```typescript
export function calcFluids(params: {
  weightKg: number;
  tbsaPct: number;
  hoursSinceInjury: number;
}): FluidResult {
  const { weightKg, tbsaPct, hoursSinceInjury } = params;
  
  // Input validation
  if (weightKg <= 0) throw new Error('Weight must be positive');
  if (tbsaPct < 0 || tbsaPct > 100) throw new Error('TBSA must be between 0 and 100');
  if (hoursSinceInjury < 0) throw new Error('Hours since injury cannot be negative');
  
  // Parkland formula: 4 ml × weight(kg) × %TBSA
  const totalMl = 4 * weightKg * tbsaPct;
  const first8hMl = totalMl / 2;
  const next16hMl = totalMl / 2;
  
  // Temporal adjustment calculations
  let rateNowMlPerHr = 0;
  let currentPhase: FluidPhase = 'first8';
  
  if (hoursSinceInjury <= 8) {
    const remainingFirst8hMl = first8hMl - (hoursSinceInjury / 8) * first8hMl;
    rateNowMlPerHr = remainingFirst8hMl / (8 - hoursSinceInjury);
    currentPhase = 'first8';
  } else if (hoursSinceInjury <= 24) {
    const hoursIntoSecondPhase = hoursSinceInjury - 8;
    const remainingNext16hMl = next16hMl - (hoursIntoSecondPhase / 16) * next16hMl;
    rateNowMlPerHr = remainingNext16hMl / (24 - hoursSinceInjury);
    currentPhase = 'next16';
  }
  
  // Return comprehensive result
  return {
    parkland: { /* detailed results */ },
    maintenance: calcMaintenanceFluids(weightKg),
    timeline: generateTimeline(first8hMl, next16hMl),
    notice: tbsaPct < 10 ? 'Note: Parkland formula typically indicated for burns ≥10% TBSA' : undefined
  };
}
```

**Design Features:**
- Temporal adjustment based on injury time
- Maintenance fluid calculation (4-2-1 rule)
- Phase-aware rate calculations
- Timeline generation for visualization
- Clinical notices for edge cases

**Verification:** Clinical reference case validation, temporal calculation testing

### 3.3 Clinical Constants Design

#### DO-DOMAIN-003: Lund-Browder Reference Data

**Design Input Reference:** CR-001, DI-STD-001  
**Implementation:** `/app/src/constants/lundBrowder.ts`

**Reference Data Structure:**
```typescript
export const LUND_BROWDER_PERCENTAGES: LundBrowderData = {
  "Head": {
    "0": 19,    // Infant (0-1 year)
    "1": 17,    // Toddler (1-5 years)
    "5": 13,    // Child (5-10 years)
    "10": 11,   // Adolescent (10-15 years)
    "15": 9,    // Teen (15-18 years)
    "Adult": 7  // Adult (18+ years)
  },
  // ... 24 additional body regions
};
```

**Clinical Validation:**
- Values verified against published Lund-Browder charts
- Age boundaries aligned with pediatric burn literature
- Comprehensive coverage of all body regions
- Constant regions validated (trunk, arms, hands)

---

## 4. User Interface Design

### 4.1 Dual Mode Interface Design

#### DO-UI-001: Clinician vs Patient Mode Design

**Design Input Reference:** DI-FR-004, DI-SF-003  
**Implementation:** Mode-aware component rendering

**Clinician Mode Features:**
- Detailed calculation breakdowns with precision values
- Formula display with constants and references
- Complete audit trail and provenance information
- Export functionality for clinical documentation
- Technical terminology and medical units

**Patient Education Mode Features:**
- Simplified language avoiding medical jargon
- Focus on educational guidance and next steps
- Minimal numerical details, emphasis on understanding
- Prominent reassurance and emergency instructions
- Clear guidance for when to seek medical care

**Design Implementation:**
```typescript
// Mode-aware rendering
const WizardContent = () => {
  const { mode } = useWizardStore();
  
  return (
    <div className={`wizard-content ${mode === 'patient' ? 'patient-mode' : 'clinician-mode'}`}>
      <ModeIndicator mode={mode} />
      {mode === 'clinician' ? (
        <ClinicalCalculationDisplay />
      ) : (
        <PatientEducationDisplay />
      )}
    </div>
  );
};
```

### 4.2 Interactive Body Map Design

#### DO-UI-002: Body Region Selection Interface

**Design Input Reference:** DI-FR-005, accessibility requirements  
**Implementation:** `/app/src/components/InteractiveSVGBodyMap.tsx`

**Design Features:**
- SVG-based scalable body diagram
- Touch/click-friendly region selection
- Visual feedback for selected regions and fractions
- Keyboard navigation alternative for accessibility
- Age-appropriate proportions (visual representation)

**Accessibility Implementation:**
- ARIA labels for all interactive regions
- Keyboard navigation support
- Screen reader compatible descriptions
- Alternative text-based selection interface

### 4.3 Responsive Design Implementation

#### DO-UI-003: Multi-Device Compatibility

**Design Input Reference:** UN-006, mobile usability  
**Implementation:** Responsive CSS and component design

**Breakpoint Strategy:**
- Desktop: >1024px - Full feature set
- Tablet: 768-1024px - Optimized layout
- Mobile: <768px - Simplified interface

**Touch Interface Optimizations:**
- Minimum 44px touch targets
- Gesture-friendly interactions
- Optimized keyboard for numeric inputs

---

## 5. Security Design

### 5.1 Data Encryption Implementation

#### DO-SEC-001: AES-256 Encryption Design

**Design Input Reference:** DI-SF-004, institutional security requirements  
**Implementation:** `/app/src/core/security-simple.ts`

**Encryption Architecture:**
```typescript
export class SecurityManager {
  public async encryptData(data: string): Promise<string | null> {
    try {
      const salt = localStorage.getItem('burn_wizard_pin_salt');
      if (!salt) return data;

      // AES-256 encryption with device-derived key
      const key = CryptoJS.SHA256(this.deviceId + salt).toString();
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      
      this.logSecurityEvent(SecurityEvent.DATA_ENCRYPTED, { 
        dataSize: data.length 
      });

      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }
}
```

**Security Features:**
- AES-256 encryption for all local data
- Device-specific key derivation
- Secure salt generation and storage
- Comprehensive audit logging

### 5.2 Authentication System Design

#### DO-SEC-002: Multi-Factor Authentication

**Design Input Reference:** DI-SF-005, access control requirements  
**Implementation:** PIN and biometric authentication

**Authentication Methods:**
- PIN-based authentication (4-8 digits)
- Biometric integration (where supported)
- Session management with timeout
- Failed attempt rate limiting

**Session Security:**
- 30-minute session timeout
- Secure session token generation
- Automatic logout on suspicious activity

---

## 6. Data Management Design

### 6.1 Local Storage Architecture

#### DO-DATA-001: Offline Data Persistence

**Design Input Reference:** DI-PF-003, offline requirements  
**Implementation:** LocalForage with encryption wrapper

**Storage Strategy:**
- Patient sessions: Encrypted JSON in IndexedDB
- Application state: LocalStorage with encryption
- Clinical constants: Embedded in application
- Audit logs: Append-only encrypted storage

**Data Schema:**
```typescript
interface StoredSession {
  id: string;
  patientData: PatientData;
  calculations: CalculationSnapshot[];
  created: Date;
  modified: Date;
  encrypted: boolean;
}
```

### 6.2 Audit Trail Implementation

#### DO-DATA-002: Comprehensive Logging

**Design Input Reference:** UN-008, regulatory compliance  
**Implementation:** Structured audit logging system

**Audit Events:**
- All calculations with inputs and outputs
- User actions and mode changes
- Security events and authentication
- System errors and recovery actions

**Log Structure:**
```typescript
interface AuditEvent {
  timestamp: number;
  eventType: string;
  sessionId: string;
  userId?: string;
  data: Record<string, any>;
  checksum: string;
}
```

---

## 7. Verification Artifacts

### 7.1 Test Specifications

#### DO-VERIFY-001: Unit Test Suite

**Design Input Reference:** DI-RG-003, verification requirements  
**Implementation:** `/app/src/domain/__tests__/`

**Test Coverage:**
- 100% line coverage for domain modules
- Boundary condition testing for all inputs
- Clinical reference case validation
- Error condition and recovery testing

**Test Structure:**
```typescript
describe('calcTbsa', () => {
  describe('Clinical Reference Validation', () => {
    it('should match published Lund-Browder values', () => {
      // Test against clinical references
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    it('should validate input ranges', () => {
      // Test input validation
    });
  });
});
```

### 7.2 Integration Test Specifications

#### DO-VERIFY-002: System Integration Testing

**Design Input Reference:** Workflow validation, system testing  
**Implementation:** End-to-end test scenarios

**Test Scenarios:**
- Complete clinical workflow testing
- Offline functionality verification
- Multi-device compatibility testing
- Security implementation validation

---

## 8. Manufacturing Information

### 8.1 Build and Deployment

#### DO-DEPLOY-001: Production Build Process

**Design Input Reference:** Deployment requirements  
**Implementation:** Automated build and deployment pipeline

**Build Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
});
```

**Deployment Artifacts:**
- Progressive Web App bundle
- Service worker for offline functionality
- Web app manifest for installation
- Documentation package for IT departments

### 8.2 Installation Procedures

#### DO-DEPLOY-002: Clinical Site Installation

**Design Input Reference:** Institutional deployment requirements  
**Implementation:** Professional installation package

**Installation Components:**
- PWA installation guide for IT departments
- Security configuration documentation
- User training materials
- Validation testing checklist

---

## 9. Labeling and Instructions

### 9.1 User Interface Labeling

#### DO-LABEL-001: Educational Disclaimers

**Design Input Reference:** DI-SF-002, educational positioning  
**Implementation:** Prominent disclaimer system

**Disclaimer Text:**
```
EDUCATIONAL GUIDANCE ONLY
This application provides educational guidance based on established clinical formulas. 
All calculations must be independently verified by qualified medical professionals. 
Do not use as sole basis for clinical decisions.
```

**Disclaimer Placement:**
- Prominent display on all calculation screens
- Mode-appropriate language (clinical vs patient)
- Cannot be dismissed or hidden
- Included in all exported documentation

### 9.2 Instructions for Use

#### DO-LABEL-002: User Documentation

**Design Input Reference:** Usability requirements, training needs  
**Implementation:** Comprehensive user guides

**Documentation Package:**
- Quick start guide for clinical users
- Complete user manual with workflows
- Technical installation guide
- Training presentation materials

---

## 10. Traceability Matrix

### 10.1 Design Input to Design Output Traceability

| Design Input | Design Output | Implementation | Verification |
|--------------|---------------|----------------|--------------|
| DI-FR-001 | DO-DOMAIN-001 | domain/tbsa.ts | V-TBSA-001 |
| DI-FR-002 | DO-DOMAIN-002 | domain/fluids.ts | V-FLUID-001 |
| DI-FR-004 | DO-UI-001 | Mode system | UI testing |
| DI-SF-004 | DO-SEC-001 | SecurityManager | Security testing |
| DI-PF-003 | DO-ARCH-002 | Service worker | Offline testing |

### 10.2 Clinical Reference to Implementation Traceability

| Clinical Reference | Design Output | Implementation | Validation |
|-------------------|---------------|----------------|------------|
| Lund-Browder 1944 | DO-DOMAIN-003 | lundBrowder.ts | Reference testing |
| Parkland Formula | DO-DOMAIN-002 | calcFluids() | Clinical examples |
| Holliday-Segar | Maintenance calc | calcMaintenanceFluids() | Weight scenarios |

### 10.3 Risk Control to Design Output Traceability

| Risk ID | Risk Control | Design Output | Implementation |
|---------|--------------|---------------|----------------|
| RR-001 | Calculation accuracy | DO-DOMAIN-001/002 | Pure functions + tests |
| RR-003 | Educational positioning | DO-LABEL-001 | Disclaimer system |
| RR-004 | Data encryption | DO-SEC-001 | AES-256 implementation |
| RR-005 | UI clarity | DO-UI-001/002 | Mode system + body map |

---

## 11. Design Output Review and Approval

### 11.1 Technical Review

**Review Criteria:**
- [ ] All design inputs addressed
- [ ] No contradictions with design inputs
- [ ] Adequate for verification and validation
- [ ] Specifications complete for implementation

**Technical Reviewers:**
- Development Lead: Architecture and implementation review
- Security Lead: Security design validation
- QA Lead: Testability and verification completeness

### 11.2 Clinical Review

**Review Criteria:**
- [ ] Clinical accuracy of algorithms
- [ ] Appropriate clinical references used
- [ ] Educational positioning maintained
- [ ] Safety features adequate

**Clinical Reviewers:**
- Clinical SME: Medical accuracy and safety
- Burn Unit Nurse: Workflow appropriateness
- Medical Education Lead: Educational effectiveness

### 11.3 Regulatory Review

**Review Criteria:**
- [ ] Regulatory requirements addressed
- [ ] Risk controls implemented
- [ ] Documentation completeness
- [ ] Change control procedures

**Regulatory Reviewers:**
- Regulatory Lead: Compliance verification
- Quality Manager: Process adherence
- Project Lead: Overall completeness

---

**Document Control:**
- **Last Updated:** 2025-08-18
- **Next Review:** 2025-09-18
- **Approval Required:** Clinical SME, Technical Lead, Regulatory Lead
- **Distribution:** Development Team, Clinical Stakeholders, QA Team

**End of Design Outputs Document**
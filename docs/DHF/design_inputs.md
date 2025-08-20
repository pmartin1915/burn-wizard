# Design History File - Design Inputs

**Document:** Design Inputs  
**Project:** Burn Wizard  
**Version:** 1.0  
**Date:** 2025-08-18  
**Owner:** Perry Martin

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-08-18 | Perry Martin | Initial design inputs documentation |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [User Needs](#2-user-needs)
3. [Intended Use](#3-intended-use)
4. [Functional Requirements](#4-functional-requirements)
5. [Performance Requirements](#5-performance-requirements)
6. [Safety Requirements](#6-safety-requirements)
7. [Regulatory Requirements](#7-regulatory-requirements)
8. [Standards and Guidelines](#8-standards-and-guidelines)
9. [Clinical References](#9-clinical-references)
10. [Traceability](#10-traceability)

---

## 1. Introduction

### 1.1 Purpose

This document captures all design inputs for Burn Wizard, serving as the foundation for design outputs and verification activities. Design inputs represent the physical and performance requirements of the device that form the basis for device design.

### 1.2 Scope

Design inputs include:
- User needs and intended use statements
- Functional and performance requirements
- Safety and regulatory requirements
- Applicable standards and clinical references
- Interface and usability requirements

### 1.3 Design Input Sources

| Source | Type | Reference |
|--------|------|-----------|
| Clinical Literature | Medical Standards | Lund-Browder, Parkland Formula publications |
| Hospital Workflows | User Needs | Clinical staff interviews and observations |
| Regulatory Guidelines | Compliance | FDA guidance, ISO 14971, IEC 62366 |
| Institution Requirements | IT/Security | Hospital IT security standards |
| Risk Analysis | Safety | Risk Register (ISO 14971 format) |

---

## 2. User Needs

### 2.1 Primary User Needs

#### UN-001: Accurate Burn Assessment
**Source:** Clinical staff interviews, emergency department workflow analysis  
**Need:** "We need a reliable way to calculate burn size percentages for pediatric patients that accounts for age-related body proportion changes."  
**Rationale:** Traditional methods prone to error, especially for pediatric cases where head/body proportions change significantly with age.

#### UN-002: Rapid Fluid Calculation
**Source:** Burn unit nurses, emergency medicine physicians  
**Need:** "We need quick, accurate fluid resuscitation calculations that account for time since injury and provide clear guidance."  
**Rationale:** Time-critical decisions in emergency settings require fast, accurate calculations with minimal chance for human error.

#### UN-003: Educational Documentation
**Source:** Medical education coordinators, family education needs  
**Need:** "We need educational materials that explain burn assessment and treatment in appropriate language for families and training purposes."  
**Rationale:** Patient education improves compliance and outcomes; staff education improves competency and confidence.

#### UN-004: Offline Reliability
**Source:** Hospital IT departments, clinical workflow analysis  
**Need:** "The application must work reliably even when network connectivity is intermittent or unavailable."  
**Rationale:** Clinical environments often have unreliable network connectivity; patient care cannot depend on network availability.

#### UN-005: Data Security
**Source:** Hospital compliance officers, HIPAA requirements  
**Need:** "Any patient data must be encrypted and protected according to hospital security standards."  
**Rationale:** Regulatory compliance and patient privacy protection are mandatory for clinical applications.

### 2.2 Secondary User Needs

#### UN-006: Multi-Device Compatibility
**Source:** Clinical mobility requirements  
**Need:** Application accessible on desktop, tablet, and mobile devices  
**Rationale:** Clinical workflows involve movement between different workstations and mobile devices

#### UN-007: Integration Readiness
**Source:** Hospital IT strategic planning  
**Need:** Architecture that supports future EMR integration  
**Rationale:** Long-term goal to integrate with electronic medical record systems

#### UN-008: Audit Trail
**Source:** Regulatory compliance, quality assurance  
**Need:** Complete record of all calculations and user actions  
**Rationale:** Clinical accountability, regulatory compliance, and quality improvement

---

## 3. Intended Use

### 3.1 Intended Use Statement

**Primary Intended Use:**
Burn Wizard is intended for use as an educational tool by healthcare professionals to support burn assessment and fluid management education in pediatric and adult patients. The application provides educational guidance based on established clinical formulas (Lund-Browder, Parkland) and is designed to supplement, not replace, clinical judgment.

**Intended User Population:**
- Licensed healthcare professionals (nurses, physicians, residents)
- Medical students and nursing students (supervised use)
- Patients and families (patient education mode only)

**Intended Use Environment:**
- Hospital emergency departments
- Burn units and intensive care units
- Outpatient burn clinics
- Medical education settings
- Home/family education settings

### 3.2 Contraindications and Limitations

**Explicit Exclusions:**
- Not intended for direct patient diagnosis or treatment
- Not intended for automated medical order generation
- Not intended as a substitute for clinical judgment
- Not intended for unsupervised use by non-medical personnel

**Clinical Limitations:**
- Educational guidance only, requires clinical verification
- Based on standard formulas that may not apply to all clinical situations
- Requires accurate user input for reliable output
- Does not account for individual patient comorbidities

---

## 4. Functional Requirements

### 4.1 Core Calculation Functions

#### DI-FR-001: TBSA Calculation
**Source:** Lund-Browder clinical method, pediatric burn literature  
**Requirement:** System shall calculate total body surface area percentage using age-adjusted Lund-Browder tables  
**Acceptance Criteria:**
- Accuracy within ±0.1% of published reference values
- Support for 6 age groups (0, 1-5, 5-10, 10-15, 15-18, 18+ years)
- Fractional involvement support (0, 0.25, 0.5, 0.75, 1.0)
- 25 anatomical regions per Lund-Browder standard

#### DI-FR-002: Fluid Resuscitation Calculation
**Source:** Parkland formula, burn resuscitation protocols  
**Requirement:** System shall calculate fluid resuscitation requirements using Parkland formula with temporal adjustments  
**Acceptance Criteria:**
- 4ml × weight(kg) × %TBSA formula implementation
- Temporal adjustment based on hours since injury
- First 8 hours vs next 16 hours calculation
- Maintenance fluid calculation using 4-2-1 rule

#### DI-FR-003: Session Management
**Source:** Clinical workflow requirements  
**Requirement:** System shall maintain patient sessions with calculation history  
**Acceptance Criteria:**
- Create, read, update, delete patient sessions
- Persistent storage across application restarts
- Audit trail of all calculations
- Export capability for clinical documentation

### 4.2 User Interface Functions

#### DI-FR-004: Dual Mode Operation
**Source:** User safety analysis, educational positioning  
**Requirement:** System shall provide distinct modes for clinician and patient use  
**Acceptance Criteria:**
- Clinician mode: detailed calculations, provenance, technical terms
- Patient mode: simplified language, educational focus, basic guidance
- Clear mode indication, difficult to confuse
- Mode-appropriate disclaimers and warnings

#### DI-FR-005: Interactive Body Map
**Source:** Usability requirements, visual burn assessment  
**Requirement:** System shall provide interactive body diagram for region selection  
**Acceptance Criteria:**
- Touch/click-friendly region selection
- Visual feedback for selected regions
- Accessibility alternative (keyboard navigation)
- Age-appropriate region sizing representation

---

## 5. Performance Requirements

### 5.1 Response Time Requirements

#### DI-PF-001: Calculation Performance
**Source:** Clinical workflow analysis, user experience requirements  
**Requirement:** All domain calculations shall complete within 100 milliseconds  
**Rationale:** Real-time clinical decision support requires immediate feedback  
**Test Method:** Automated performance testing with 1000+ calculation iterations

#### DI-PF-002: Application Launch Time
**Source:** Clinical workflow efficiency requirements  
**Requirement:** Progressive Web App shall launch within 3 seconds on target devices  
**Rationale:** Emergency situations require rapid application availability  
**Test Method:** Automated launch time measurement across device types

### 5.2 Reliability Requirements

#### DI-PF-003: Offline Operation Duration
**Source:** Clinical environment analysis, network reliability studies  
**Requirement:** Application shall maintain full functionality for minimum 30 minutes without network connectivity  
**Rationale:** Clinical environments have unreliable network connectivity  
**Test Method:** Automated offline testing with network simulation

#### DI-PF-004: Calculation Accuracy
**Source:** Medical device accuracy standards  
**Requirement:** All calculations shall be deterministic and repeatable  
**Rationale:** Medical calculations must be consistent and reliable  
**Test Method:** Repeated calculation testing, reference value validation

---

## 6. Safety Requirements

### 6.1 Risk Mitigation Requirements

#### DI-SF-001: Error Prevention
**Source:** Risk analysis (RR-001, RR-002)  
**Requirement:** System shall validate all user inputs and prevent clinically dangerous values  
**Acceptance Criteria:**
- Age range validation (0-100 years)
- Weight range validation (0.5-300 kg)
- TBSA range validation (0-100%)
- Clear error messages with guidance

#### DI-SF-002: Educational Positioning
**Source:** Risk analysis (RR-003), regulatory strategy  
**Requirement:** All clinical outputs shall be clearly labeled as educational guidance only  
**Acceptance Criteria:**
- Prominent educational disclaimers on all calculation screens
- No machine-readable order formats
- Visible calculation provenance and formulas
- Clear instructions for clinical verification

#### DI-SF-003: Mode Clarity
**Source:** Risk analysis (RR-014), user safety  
**Requirement:** Current user mode shall be clearly indicated at all times  
**Acceptance Criteria:**
- Persistent mode indicator in UI header
- Distinct color schemes for each mode
- Confirmation required for mode switching
- Mode-appropriate content and language

### 6.2 Data Protection Requirements

#### DI-SF-004: Data Encryption
**Source:** Risk analysis (RR-004), institutional security requirements  
**Requirement:** All local data storage shall use AES-256 encryption  
**Acceptance Criteria:**
- AES-256 encryption implementation verified
- Secure key derivation and management
- Encrypted data unreadable without proper authentication
- Secure data wiping capability

#### DI-SF-005: Access Control
**Source:** Security requirements, privacy protection  
**Requirement:** System shall provide optional device-level authentication  
**Acceptance Criteria:**
- PIN-based authentication support
- Biometric authentication integration (where available)
- Session timeout after inactivity
- Authentication failure rate limiting

---

## 7. Regulatory Requirements

### 7.1 Medical Device Requirements

#### DI-RG-001: Risk Management
**Source:** ISO 14971 Medical Device Risk Management  
**Requirement:** Design shall implement risk controls for all identified hazards  
**Acceptance Criteria:**
- Risk register maintained per ISO 14971
- Risk controls implemented and verified
- Residual risk assessment documented
- Post-market surveillance plan established

#### DI-RG-002: Usability Engineering
**Source:** IEC 62366 Medical Device Usability  
**Requirement:** Design shall incorporate usability engineering process  
**Acceptance Criteria:**
- Use-related risk analysis completed
- Formative usability testing conducted
- Summative usability testing planned
- Use errors identified and mitigated

### 7.2 Software Requirements

#### DI-RG-003: Software Lifecycle Process
**Source:** IEC 62304 Medical Device Software  
**Requirement:** Software development shall follow structured lifecycle process  
**Acceptance Criteria:**
- Software safety classification documented
- Software requirements specification maintained
- Architecture and detailed design documented
- Verification and validation plan executed

#### DI-RG-004: Change Control
**Source:** Quality management requirements  
**Requirement:** All changes to medical logic shall be controlled and documented  
**Acceptance Criteria:**
- Change control procedures established
- Clinical review required for medical content changes
- Verification testing required for all changes
- Documentation updates maintained

---

## 8. Standards and Guidelines

### 8.1 Clinical Standards

#### DI-STD-001: Lund-Browder Method
**Source:** Lund CC, Browder NC. The estimation of areas of burns. Surg Gynecol Obstet. 1944  
**Requirement:** TBSA calculations shall conform to published Lund-Browder age-adjusted tables  
**Implementation:** Age-specific percentage constants in `/app/src/constants/lundBrowder.ts`

#### DI-STD-002: Parkland Formula
**Source:** Baxter CR, Shires T. Physiological response to crystalloid resuscitation. Ann N Y Acad Sci. 1968  
**Requirement:** Fluid calculations shall implement standard Parkland formula: 4ml × weight(kg) × %TBSA  
**Implementation:** Parkland calculation in `/app/src/domain/fluids.ts`

#### DI-STD-003: Maintenance Fluids
**Source:** Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957  
**Requirement:** Maintenance fluid calculations shall use 4-2-1 rule  
**Implementation:** Maintenance calculation in calcMaintenanceFluids()

### 8.2 Technical Standards

#### DI-STD-004: Web Accessibility
**Source:** WCAG 2.1 AA Guidelines  
**Requirement:** User interface shall conform to WCAG 2.1 AA accessibility standards  
**Scope:** Critical application functions and navigation

#### DI-STD-005: Progressive Web App
**Source:** W3C PWA specifications  
**Requirement:** Application shall implement PWA standards for offline functionality  
**Implementation:** Service worker, web app manifest, offline caching

---

## 9. Clinical References

### 9.1 Primary Clinical References

#### CR-001: Burn Assessment
- **Lund CC, Browder NC.** The estimation of areas of burns. Surg Gynecol Obstet. 1944;79:352-358.
- **Hettiaratchy S, Dziewulski P.** ABC of burns: pathophysiology and types of burns. BMJ. 2004;328(7453):1427-1429.
- **Jeschke MG, et al.** Burn care: The first 24 hours and beyond. Curr Probl Surg. 2017;54(7):378-414.

#### CR-002: Fluid Resuscitation
- **Baxter CR, Shires T.** Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150:874-894.
- **Pham TN, et al.** American Burn Association practice guidelines burn shock resuscitation. J Burn Care Res. 2008;29(1):257-266.
- **Sen S, et al.** Review of burn research for the year 2018. J Burn Care Res. 2019;40(6):911-938.

### 9.2 Pediatric-Specific References

#### CR-003: Pediatric Considerations
- **Sheridan RL.** Burns in children: Epidemiology, pathophysiology, and treatment. Clin Pediatr Emerg Med. 2005;6(4):206-212.
- **Kraft R, et al.** Burn size and survival probability in paediatric patients in modern burn care: a prospective observational cohort study. Lancet. 2012;379(9820):1013-1021.

---

## 10. Traceability

### 10.1 Design Input to Requirements Traceability

| Design Input | SRS Requirement | Implementation | Verification |
|--------------|-----------------|----------------|--------------|
| UN-001 | FR-002 | domain/tbsa.ts | V-TBSA-001 |
| UN-002 | FR-003 | domain/fluids.ts | V-FLUID-001 |
| UN-003 | FR-004 | UI Mode System | VAL-PATIENT-001 |
| UN-004 | NFR-004 | Service Worker | Offline Testing |
| UN-005 | FR-006 | SecurityManager | V-SEC-001 |
| DI-SF-001 | SR-002 | Input validation | Error testing |
| DI-SF-002 | SR-001 | UI disclaimers | Safety validation |

### 10.2 Clinical Reference to Implementation Traceability

| Clinical Reference | Constant/Formula | Implementation Location | Verification |
|-------------------|------------------|-------------------------|--------------|
| Lund-Browder 1944 | Age-adjusted % | lundBrowder.ts | Reference testing |
| Parkland Formula | 4ml×kg×%TBSA | fluids.ts calcFluids() | Clinical examples |
| Holliday-Segar | 4-2-1 rule | calcMaintenanceFluids() | Weight scenarios |

---

## 11. Design Input Management

### 11.1 Change Control Process

1. **Design Input Change Request**
   - Source identification and justification
   - Impact analysis on existing design
   - Clinical review requirement assessment
   - Risk assessment update

2. **Review and Approval**
   - Clinical SME review for medical content
   - Technical review for implementation impact
   - Regulatory review for compliance impact
   - Project lead approval

3. **Implementation and Verification**
   - Design output update
   - Implementation modification
   - Verification testing execution
   - Documentation update

### 11.2 Design Input Validation

- Clinical SME review and approval
- Reference validation against published literature
- User needs validation through stakeholder interviews
- Regulatory requirement validation through compliance review

---

**Document Control:**
- **Last Updated:** 2025-08-18
- **Next Review:** 2025-09-18
- **Approval Required:** Clinical SME, Regulatory Lead, Project Lead
- **Distribution:** Development Team, Clinical Stakeholders, Regulatory Team

**End of Design Inputs Document**
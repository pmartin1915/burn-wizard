# Burn Wizard — Master Document

**Version:** 0.1 (Draft)
**Owner:** Perry Martin
**Date:** 2025-08-17

---

## Executive Summary

A single-source, comprehensive master document to guide the development, validation, regulatory planning, security, and pilot deployment of *Burn Wizard*: a pediatric burn assessment and educational fluid-management application built as a Progressive Web App (PWA) with an Electron desktop distribution. This document organizes vision, scope, timeline, architecture, regulation & compliance, testing, deployment, and communication artifacts so the project remains auditable and actionable.

---

## Table of Contents

1. Vision & Goals
2. Scope & Exclusions
3. Stakeholders & Roles
4. High-level Requirements
5. Architecture & Code Wireframe
6. Regulatory & Compliance Plan
7. Risk Register (top hazards + mitigations)
8. Verification & Validation Plan
9. Usability & Human Factors
10. Security & Privacy
11. Deployment, Packaging & Offline Strategy
12. Pilot Plan & Metrics
13. Documentation & Deliverables (DHF, SRS, etc.)
14. Templates (cover emails, consent, disclaimers)
15. Roadmap & Timeline (15-week pilot path)
16. Next Steps & Action Items

---

## 1. Vision & Goals

**Vision:** Create a trustworthy, evidence-based, auditable clinical toolkit for pediatric burn assessment and fluid guidance that supports clinicians and educates families while maintaining safety and regulatory rigor.

**Primary goals (pilot):**

* Provide accurate TBSA calculation using Lund-Browder age-adjusted tables.
* Produce Parkland formula educational fluid guidance with provenance and guardrails.
* Support offline-first operation (local-only mode) for pilot deployments.
* Maintain auditability, documentation, and secure local storage.
* Ensure the product is designed and documented following medical software best-practices.

---

## 2. Scope & Exclusions

**In scope (pilot):**

* Desktop Electron app + PWA for offline mobile view.
* TBSA calculation via interactive body map (Lund-Browder).
* Parkland formula educational outputs (volumes, time-splits) with explicit provenance.
* Clinical note templates (educational) and export as PDF/CSV for manual copy into EMR.
* Local-only data persistence with optional encrypted backups.

**Explicit exclusions (pilot):**

* Direct EMR integration or auto-ordering of medications/fluids.
* Any automatic cloud sync (unless explicitly enabled later with a BAA).
* Real-time telemetry to external analytics during pilot.

---

## 3. Stakeholders & Roles

**Project lead:** Perry Martin (clinical lead)
**Clinical SME:** pediatric burn nurse(s), burn surgeons
**Developers:** frontend (React/TypeScript), domain (TS), Electron integration
**QA/Test:** unit tests (Vitest), clinical verification team
**Security/IT contact:** institutional security officer (to be appointed)
**Regulatory lead:** (to be appointed; could be external consultant for pre-submission)

---

## 4. High-level Requirements

### Functional Requirements (examples)

* FR-001: The app shall accept patient age, weight, gender, and region selections and compute TBSA as a percentage using Lund-Browder.
* FR-002: The app shall compute fluid guidance using Parkland formula when user requests it, display formula and constants, and present guidance as educational output only.
* FR-003: The app shall persist patient sessions locally and store calculation snapshots with timestamps.
* FR-004: The app shall provide a ‘Clinician mode’ and a ‘Patient education mode’ with different levels of detail.

### Non-Functional Requirements

* NFR-001: Strict TypeScript `strict` mode for codebase.
* NFR-002: Domain modules must have 100% unit-test coverage.
* NFR-003: App must run fully offline in local-only mode for at least 30 days without connectivity.
* NFR-004: Encrypted local storage (AES-256), with optional device PIN.
* NFR-005: Maintain traceability (requirements ⇄ tests ⇄ risk controls).

---

## 5. Architecture & Code Wireframe

### File / Module Structure (recommended)

```
app/src/
├── components/
│   ├── BodyMap/BodyMap.tsx
│   ├── FluidPlan/FluidPlan.tsx
│   ├── InputForm.tsx
│   └── layout/
├── constants/
│   └── lundBrowder.ts
├── core/
│   └── safety.ts
├── domain/
│   ├── tbsa.ts
│   ├── fluids.ts
│   ├── validation.ts
│   └── types.ts
├── lib/
├── store/
│   └── useWizardStore.ts
├── routes/
└── electron/
    ├── main.js
    └── preload.js
```

### Domain Module Wireframes (TypeScript signatures)

```ts
// domain/tbsa.ts
export interface TBSAInput { ageYears: number; regions: Record<string, number>; }
export interface TBSAResult { tbsaPercent: number; breakdown: Record<string, number>; provenance: string; }
export function calculateTBSA(input: TBSAInput): TBSAResult { /* pure function */ }

// domain/fluids.ts
export interface FluidInput { weightKg: number; tbsaPercent: number; resuscitationFormula?: 'parkland' }
export interface FluidResult { total24hMl: number; first8hMl: number; remainder16hMl: number; notes: string; provenance: string }
export function calculateFluids(input: FluidInput): FluidResult { /* pure function */ }
```

**Key engineering principles:** keep domain functions pure, well-documented, and thoroughly unit tested.

---

## 6. Regulatory & Compliance Plan

**High-level classification posture:** Plan as if SaMD, and implement UI mitigations to reduce regulatory friction for pilot.

**Minimum documentation to produce now:**

* Regulatory Classification Document (this document is the master record)
* Software Requirements Specification (SRS)
* Risk Management Plan (ISO 14971 style)
* Design History File (DHF) skeleton
* Verification & Validation Plan

**Design choices to limit regulatory burden:**

* All outputs labeled educational; no machine-readable orders; provenance visible.

---

## 7. Risk Register (ISO 14971-style — expanded)

Below is an ISO 14971-style risk register expanded from the Master Document's top-20 hazards. Each entry contains: **ID**, **Hazard**, **Cause**, **Potential Effect(s)**, **Severity (S)**, **Probability (P)**, **Initial Risk Rating (S×P)**, **Existing Controls**, **Additional Recommended Controls**, **Residual Risk (Low/Medium/High)**, **Risk Owner**, **Verification Method**, and **Status**.

> **Severity legend (qualitative):** Negligible / Minor / Moderate / Major / Severe
>
> **Probability legend (qualitative):** Rare / Unlikely / Possible / Likely / Very Likely

### RR-001

* **Hazard:** Incorrect TBSA calculation
* **Cause:** Bug in Lund-Browder constants or region-mapping logic
* **Potential Effect(s):** Under/overestimation of burn size → incorrect clinical interpretation or fluid guidance
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** Pure domain function (`domain/tbsa.ts`), unit tests placeholder, provenance displayed in UI
* **Additional Recommended Controls:** 1) Peer code review; 2) Independent reference-case verification (10+ clinical reference cases); 3) Automated regression tests with CI; 4) Release gating for domain changes
* **Residual Risk:** Medium
* **Risk Owner:** Domain Lead / Clinical SME
* **Verification Method:** Unit tests vs reference table; regression test suite; code review sign-off
* **Status:** Open — mitigation actions required

### RR-002

* **Hazard:** Wrong weight units entered (kg vs lb)
* **Cause:** User input error or unclear UI
* **Potential Effect(s):** Incorrect fluid calculations (over/under-resuscitation)
* **Severity:** Severe
* **Probability:** Possible
* **Initial Risk Rating:** Severe × Possible = HIGH
* **Existing Controls:** UI shows units; some validation
* **Additional Recommended Controls:** 1) Force metric units (kg) for pilot; 2) Prominent unit label & helper tooltip; 3) Input mask and sanity checks (e.g., weight < 1kg or > 300kg flagged); 4) Confirmation step for out-of-range values
* **Residual Risk:** Low
* **Risk Owner:** UI Lead
* **Verification Method:** Manual UI tests; automated input validation tests
* **Status:** Mitigation planned

### RR-003

* **Hazard:** Users treat app outputs as definitive orders
* **Cause:** User misunderstanding, UI ambiguity, or habit
* **Potential Effect(s):** Clinicians execute fluids/orders without independent verification → patient harm
* **Severity:** Severe
* **Probability:** Possible
* **Initial Risk Rating:** Severe × Possible = HIGH
* **Existing Controls:** Educational disclaimers; no machine-readable orders in pilot
* **Additional Recommended Controls:** 1) Persistent, context-aware warnings before any clinical-use labeling; 2) Require manual confirmation acknowledging clinician responsibility; 3) Mode separation (Clinician vs Patient) with explicit text; 4) Training materials emphasizing non-prescriptive nature
* **Residual Risk:** Medium
* **Risk Owner:** Clinical Lead
* **Verification Method:** Usability testing assessing user interpretation; review of exported note language
* **Status:** Open — implement UI confirmations

### RR-004

* **Hazard:** Local device theft / lost device with unencrypted data
* **Cause:** Physical loss of device containing local sessions
* **Potential Effect(s):** Exposure of patient-identifiable information (PHI)
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** Option for encrypted storage noted
* **Additional Recommended Controls:** 1) Enforce AES-256 encryption at rest; 2) Optional PIN or OS-level biometric lock; 3) Auto-lock after inactivity; 4) Wipe option; 5) Guidance to not store real patient identifiers during pilot
* **Residual Risk:** Low
* **Risk Owner:** Security Lead
* **Verification Method:** Penetration tests; manual verification of encrypted files on disk
* **Status:** Mitigation required / high priority

### RR-005

* **Hazard:** Unclear UI leads to mis-clicks or wrong region selection
* **Cause:** Poorly designed interactive body map or insufficient accessibility
* **Potential Effect(s):** Incorrect TBSA inputs → wrong calculations
* **Severity:** Moderate
* **Probability:** Likely
* **Initial Risk Rating:** Moderate × Likely = HIGH
* **Existing Controls:** BodyMap component concept; accessibility note
* **Additional Recommended Controls:** 1) Improve hit targets; 2) Add keyboard alternatives; 3) Provide region labels and preview of selected percentages; 4) Undo/confirm step before finalizing TBSA
* **Residual Risk:** Medium
* **Risk Owner:** UX Lead / Clinical SME
* **Verification Method:** Formative usability tests; A/B testing of map interactions
* **Status:** Open — usability iteration planned

### RR-006

* **Hazard:** Software update introduces regression in calculations
* **Cause:** Uncontrolled code changes without adequate regression testing
* **Potential Effect(s):** Silent incorrect results deployed to users
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** CI pipeline (planned), unit tests (planned)
* **Additional Recommended Controls:** 1) Mandatory domain test suite with 100% coverage gating; 2) Signed releases; 3) Rollback strategy and staged rollouts; 4) Change control log in DHF
* **Residual Risk:** Medium
* **Risk Owner:** Engineering Lead
* **Verification Method:** CI test reports; release verification checklist
* **Status:** Open — CI policies to be implemented

### RR-007

* **Hazard:** Data loss during offline→sync (future functionality)
* **Cause:** Conflict resolution bugs or failed sync
* **Potential Effect(s):** Missing session data; inconsistent records
* **Severity:** Moderate
* **Probability:** Possible
* **Initial Risk Rating:** Moderate × Possible = MEDIUM
* **Existing Controls:** Local-only pilot (no sync) reduces exposure
* **Additional Recommended Controls:** 1) If sync added later: conflict resolution strategy, versioning, audit trail of sync events; 2) Local backup/export features
* **Residual Risk:** Low (for pilot)
* **Risk Owner:** Backend/Sync Lead
* **Verification Method:** Integration tests; simulated sync failure tests
* **Status:** Low priority (out-of-scope for pilot)

### RR-008

* **Hazard:** Incorrect age entry leading to wrong Lund-Browder band
* **Cause:** User error or ambiguous age input
* **Potential Effect(s):** Mis-assigned region percentages, incorrect TBSA
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** Age input field
* **Additional Recommended Controls:** 1) Age input validation and age-band auto-suggestion; 2) Tooltip explaining bands; 3) Confirmation step for pediatric age ranges
* **Residual Risk:** Medium
* **Risk Owner:** Clinical Lead
* **Verification Method:** Unit tests covering age-band boundaries; manual clinical review
* **Status:** Mitigation planned

### RR-009

* **Hazard:** Numerical overflow, precision, or rounding errors
* **Cause:** Poor numeric handling or incorrect rounding rules
* **Potential Effect(s):** Slightly incorrect fluid/tbsa outputs that could affect clinical decisions
* **Severity:** Minor
* **Probability:** Possible
* **Initial Risk Rating:** Minor × Possible = MEDIUM
* **Existing Controls:** Developer note to round appropriately
* **Additional Recommended Controls:** 1) Use robust numeric libraries or standardized rounding functions; 2) Document rounding rules and display rounded + raw values where appropriate; 3) Test edge cases
* **Residual Risk:** Low
* **Risk Owner:** Engineering Lead
* **Verification Method:** Unit tests for numeric edge cases
* **Status:** Open

### RR-010

* **Hazard:** Regulatory misclassification (underestimating need for SaMD controls)
* **Cause:** Misinterpretation of CDS exclusion criteria or feature creep
* **Potential Effect(s):** Non-compliance with FDA requirements; enforcement actions or forced redesign
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** Regulatory Classification Document drafted
* **Additional Recommended Controls:** 1) Engage regulatory consultant or submit FDA pre-submission (Q-Submission) if commercialization planned; 2) Maintain DHF and traceability; 3) Limit prescriptive outputs in pilot
* **Residual Risk:** Medium
* **Risk Owner:** Project Lead / Regulatory Lead
* **Verification Method:** Regulatory review; pre-submission feedback (if obtained)
* **Status:** Open — plan for pre-submission if product evolves

### RR-011

* **Hazard:** PHI leakage via exported notes
* **Cause:** Exports include identifiers by default
* **Potential Effect(s):** Unauthorized disclosure of PHI
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** Export with redaction option noted
* **Additional Recommended Controls:** 1) Default to redacted exports; 2) Explicit consent prompt for PII inclusion; 3) Audit trail of exports; 4) Local-only export storage until user confirms removal
* **Residual Risk:** Low
* **Risk Owner:** Privacy Lead
* **Verification Method:** Manual export tests; review of exported files
* **Status:** Mitigation planned

### RR-012

* **Hazard:** Vulnerability in third-party dependency
* **Cause:** Outdated npm packages or supply-chain vulnerability
* **Potential Effect(s):** Remote code execution, data exfiltration
* **Severity:** Severe
* **Probability:** Possible
* **Initial Risk Rating:** Severe × Possible = HIGH
* **Existing Controls:** Planned dependency scanning
* **Additional Recommended Controls:** 1) Use Dependabot/Snyk; 2) Pin package versions; 3) Regular security audits; 4) Minimal use of native modules in Electron
* **Residual Risk:** Medium
* **Risk Owner:** Security Lead
* **Verification Method:** Vulnerability scan reports; dependency audit log
* **Status:** Open — security tooling to be enabled

### RR-013

* **Hazard:** Inadequate test coverage of domain code
* **Cause:** Insufficient unit tests or lack of domain testcases
* **Potential Effect(s):** Undetected logic errors
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** Requirement in SRS for domain 100% coverage
* **Additional Recommended Controls:** 1) Enforce test coverage gates in CI; 2) Create canonical clinical test vectors; 3) Peer reviews for test suites
* **Residual Risk:** Low
* **Risk Owner:** QA Lead
* **Verification Method:** CI coverage reports
* **Status:** Open — CI to be configured

### RR-014

* **Hazard:** Clinician confusion due to different product modes
* **Cause:** Poorly differentiated UI between Clinician and Patient modes
* **Potential Effect(s):** Misinterpretation of results, misuse
* **Severity:** Moderate
* **Probability:** Likely
* **Initial Risk Rating:** Moderate × Likely = HIGH
* **Existing Controls:** Mode toggle planned
* **Additional Recommended Controls:** 1) Distinct color schemes and persistent mode banners; 2) Mode-specific onboarding; 3) Mode-locked critical actions (require re-authentication to switch)
* **Residual Risk:** Medium
* **Risk Owner:** UX Lead
* **Verification Method:** Usability testing across modes
* **Status:** Open

### RR-015

* **Hazard:** Failure to record audit trail
* **Cause:** Logging disabled or storage failure
* **Potential Effect(s):** Lack of traceability for clinical decision-making and incident investigation
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** Audit logging requirement in SRS
* **Additional Recommended Controls:** 1) Append-only audit logs; 2) Exportable, tamper-evident logs; 3) Backup of logs in encrypted form
* **Residual Risk:** Low
* **Risk Owner:** Engineering Lead
* **Verification Method:** Manual log inspection and automated tests
* **Status:** Open — implement logging

### RR-016

* **Hazard:** Incorrect Parkland timing due to timezone/clock misconfig
* **Cause:** Device clock mis-set or use of local time vs injury time
* **Potential Effect(s):** Mistimed fluid administration guidance
* **Severity:** Major
* **Probability:** Rare
* **Initial Risk Rating:** Major × Rare = MEDIUM
* **Existing Controls:** Time input optional; timestamps saved
* **Additional Recommended Controls:** 1) Encourage user to enter time of injury explicitly; 2) Display times with timezone and UTC fallback; 3) Warn when device clock differs widely from NTP time
* **Residual Risk:** Low
* **Risk Owner:** Engineering Lead
* **Verification Method:** Test cases with different timezones and manual verification
* **Status:** Low priority

### RR-017

* **Hazard:** Accessibility barriers for screen-reader users
* **Cause:** Insufficient ARIA labels or non-semantic elements
* **Potential Effect(s):** Users with disabilities cannot use app effectively
* **Severity:** Moderate
* **Probability:** Possible
* **Initial Risk Rating:** Moderate × Possible = MEDIUM
* **Existing Controls:** Accessibility requirement noted
* **Additional Recommended Controls:** 1) WCAG 2.1 AA conformance on critical screens; 2) Accessibility review and remediation; 3) Keyboard-only interaction support for BodyMap
* **Residual Risk:** Low
* **Risk Owner:** UX Lead
* **Verification Method:** Accessibility audit and assistive tech testing
* **Status:** Open

### RR-018

* **Hazard:** Incomplete or missing clinical references for formulas
* **Cause:** Insufficient documentation in DHF or UI
* **Potential Effect(s):** Reduced trust; regulatory challenge
* **Severity:** Moderate
* **Probability:** Possible
* **Initial Risk Rating:** Moderate × Possible = MEDIUM
* **Existing Controls:** CLAUDE.md references and appendix notes
* **Additional Recommended Controls:** 1) Compile authoritative references (Lund-Browder, Parkland original publications, review articles); 2) Link references in UI; 3) Reference list in DHF
* **Residual Risk:** Low
* **Risk Owner:** Clinical Lead
* **Verification Method:** Document audit; UI review for provenance links
* **Status:** Open

### RR-019

* **Hazard:** Patient uses app unsupervised and misinterprets guidance
* **Cause:** Availability of Patient mode with medical terms or numbers
* **Potential Effect(s):** Patient delay in seeking care or inappropriate self-treatment
* **Severity:** Severe
* **Probability:** Possible
* **Initial Risk Rating:** Severe × Possible = HIGH
* **Existing Controls:** Patient mode simplified; disclaimers
* **Additional Recommended Controls:** 1) Further restrict numerical details in Patient mode; 2) Prominent guidance to seek clinician care and emergency instructions; 3) Include decision trees for red-flag symptoms
* **Residual Risk:** Medium
* **Risk Owner:** Clinical Lead
* **Verification Method:** Patient-facing usability tests; review of patient-mode content
* **Status:** Open

### RR-020

* **Hazard:** Unclear liability or inadequate disclaimers
* **Cause:** Legal language missing or insufficient
* **Potential Effect(s):** Legal exposure to developer/organization
* **Severity:** Major
* **Probability:** Possible
* **Initial Risk Rating:** Major × Possible = HIGH
* **Existing Controls:** Basic disclaimers in CLAUDE.md and UI notes
* **Additional Recommended Controls:** 1) Legal review of Terms & Conditions and disclaimers; 2) Prominent in-app disclaimer prior to clinical use; 3) Training materials with explicit clinician responsibility statements
* **Residual Risk:** Low
* **Risk Owner:** Project Lead / Legal Counsel
* **Verification Method:** Legal sign-off and review notes
* **Status:** Open — obtain legal review

---

**How this register should be used:**

* Each RR-### should be expanded into a formal Risk Management File entry with numeric scoring (if required by institutional policy), traceability to requirements and verification tests, and a sign-off by the named Risk Owner.
* Use the residual risk column to decide whether further mitigation is required before pilot sign-off. Any remaining High residual risks must be accepted and signed off at an organizational level prior to clinical pilot.

## 8. Verification & Validation Plan (summary)

**Verification (unit-level):**

* Unit tests for all domain functions, target 100% coverage for domain modules.
* Regression tests with synthetic cases and known reference outputs.

**Validation (clinical):**

* Clinician-led scenario tests (10–20 sample cases) verifying UI clarity and output interpretation.
* Accept/reject criteria defined in V\&V plan (e.g., TBSA accuracy within +/- X% vs reference; clinician interpretation success rate > Y%).

**Traceability:** Requirements ⇄ tests ⇄ risk mitigations mapping maintained in a matrix.

---

## 9. Usability & Human Factors

* Conduct formative usability testing early (prototype): 5–8 clinicians for heuristic findings.
* Summative usability prior to pilot: representative users and realistic task scenarios. Document use errors and mitigations per IEC 62366 approach.
* Onboarding: in-app guided tour, explicit confirmation flows for clinical-use steps.

---

## 10. Security & Privacy

**Pilot posture:** local-only mode; encrypted at rest; no telemetry.

**Controls:**

* AES-256 encryption for local DB/files.
* Optional device PIN; integrate Windows biometric APIs where available for desktop.
* Export redaction: PII removed by default; export requires explicit confirmation and reason.
* Dependency security: Snyk/Dependabot, CI vulnerability scanning.
* Signed updates for Electron builds.

**If PHI stored:** follow institutional HIPAA policies; require BAA for any third-party cloud.

---

## 11. Deployment, Packaging & Offline Strategy

**Desktop:** Electron distribution; signed installers for Windows; portable option available.
**PWA:** offline-first service worker; local IndexedDB cache; manifest and icons.
**Offline strategy:** local storage + backup/export; clear instructions for restoring on new device.
**Updates:** signed update packages; staged rollouts.

---

## 12. Pilot Plan & Metrics

**Pilot scope:** \~15-week development → pilot site readiness by target date.

**Pilot metrics:**

* Clinical usability: % tasks completed without assistance.
* Accuracy: TBSA calc deviations vs manual Lund-Browder reference.
* Safety events: number of near-miss events attributable to app use.
* Adoption: number of clinicians using app during pilot.

**Training:** 1–2 hour session + quick reference card; short video demo.

---

## 13. Documentation & Deliverables (DHF, SRS, etc.)

**Minimum DHF contents:**

* Design inputs (SRS)
* Design outputs (architecture, code wireframes)
* Risk management file
* Verification & validation reports
* Usability testing records
* Release notes & change history

**Deliverables to produce now:** SRS scaffold, Risk Register starter, V\&V plan, Usability plan, Clinician training checklist, Installer build, and a one-page compliance/IT summary (for sign-off).

---

## 14. Templates

### Cover email to compliance / IT

```
Subject: Request for Pilot Review — Burn Wizard (Local-only pilot)

Hello [Name],

We are requesting a review and pilot sign-off for Burn Wizard, an educational pediatric burn assessment app. Attached: one-page compliance summary, Regulatory Classification Document, SRS scaffold, and Risk Register starter.

Pilot mode: local-only (no telemetry), encrypted local storage. We request your guidance on: storing patient identifiers, device policies (PIN/biometric), and any institutional requirements for pilot deployment.

Thank you,
Perry Martin
```

### Disclaimers (short)

`Burn Wizard provides educational guidance only. It is not a substitute for clinical judgment. Do not use outputs as authoritative orders.`

---

## 15. Roadmap & 15-week Timeline (detailed)

**Week 0 (this week):** Finalize Master Document, confirm pilot requirements with compliance.
**Weeks 1–4:** SRS, risk plan, domain module implementation (TBSA + fluids), unit tests.
**Weeks 5–8:** UI components (BodyMap, FluidPlan), offline storage, security features.
**Weeks 9–11:** Usability testing (formative + iterative fixes), V\&V tests.
**Weeks 12–13:** Build installers, DHF assembly, final verification.
**Weeks 14–15:** Pilot packaging, staff training materials, pilot go/no-go.

---

## 16. Next Steps & Action Items (for immediate follow-up)

* [ ] I will generate the **SRS scaffold** and place it in the repo (`/docs/SRS.md`).
* [ ] I will generate the **Risk Register starter** (expand each hazard to include severity, probability, controls).
* [ ] I will draft the **V\&V test cases** for domain modules and produce sample Vitest tests.
* [ ] Confirm institutional point-of-contact for security & compliance.

---

## Appendix A — Quick reference: TBSA + Parkland formulas (developer notes)

* **Lund-Browder:** age-based percentage table used to compute TBSA by region; use constants table in `constants/lundBrowder.ts`.
* **Parkland (example):** Total 24h fluid = 4 ml × bodyweight (kg) × %TBSA (use adult/pediatric adjustments where appropriate). First half in first 8 hours from time of injury; remainder over next 16 hours. Present as educational guidance only.

---

## Appendix B — Where to store artifacts in the repo

```
/docs/
  ├── MASTER_DOCUMENT.md    # this file
  ├── SRS.md
  ├── RISK_REGISTER.md
  ├── V&V_PLAN.md
  └── DHF/
       ├── design_inputs.md
       ├── design_outputs.md
       └── test_reports/
```

---

\*\*End of Master Document (Draft).

## SRS Scaffold (to be saved as `/docs/SRS.md`)

**Document:** Software Requirements Specification (SRS) — Burn Wizard

**Version:** 0.1
**Owner:** Perry Martin
**Location:** `/docs/SRS.md`

---

### 1. Introduction

#### 1.1 Purpose

This SRS describes the functional and non-functional requirements for Burn Wizard — an educational pediatric burn assessment and fluid-guidance application intended to operate as a Progressive Web App (PWA) and an Electron desktop application in local-only (offline) and optionally connected modes. The SRS will be used as a primary design input for implementation, verification, and regulatory traceability.

#### 1.2 Scope

The system provides: interactive TBSA calculation (Lund-Browder), Parkland-derived fluid guidance (educational), patient/session persistence (local), clinician and patient-facing presentation modes, exportable clinical notes (PDF/CSV), and offline operation. EMR integration, automatic order creation, and cloud sync are out-of-scope for the pilot.

#### 1.3 Definitions, Acronyms, Abbreviations

* TBSA: Total Body Surface Area
* PWA: Progressive Web App
* DHF: Design History File
* SRS: Software Requirements Specification
* PHI: Protected Health Information
* SaMD: Software as a Medical Device

---

### 2. Overall Description

#### 2.1 Product Perspective

Burn Wizard is a modular React + TypeScript application with pure domain modules for medical logic, a UI layer, and optional Electron shell. The application will be offline-first with local persistence (IndexedDB/Electron-local DB) and will be built with strict TypeScript, unit-tested domain code, and CI pipelines for linting & testing.

#### 2.2 User Classes and Characteristics

* Clinician: trained provider (nurse, physician) who will use Clinician Mode to view detailed calculations and provenance.
* Patient / Family: non-clinical users who will use Patient Education Mode for general guidance and next steps.
* Admin / IT: installs and configures the desktop application for pilot sites.

#### 2.3 Operating Environment

* Desktop: Windows 11 primary target (Electron). Support for macOS optional for future build.
* Mobile: PWA running on iOS/Android browsers (offline-first via service worker).
* Offline-first: Must function without network connectivity; local-only pilot mode required.

#### 2.4 Design & Implementation Constraints

* Must run in strict TypeScript mode.
* Domain logic must be implemented as pure functions and located in `/app/src/domain/`.
* No automatic cloud telemetry during pilot.
* All medical outputs must visibly include provenance and citations.

---

### 3. System Features & Functional Requirements

Each functional requirement has an ID (FR-###), brief description, inputs, outputs, preconditions, postconditions, and acceptance criteria.

#### FR-001: Patient Session Management

* Description: Create, edit, save, and delete patient sessions locally.
* Inputs: patient alias (optional), age, weight (kg), sex, session notes, region selections.
* Outputs: saved session record with timestamp and calculation snapshots.
* Preconditions: App in local-only mode or authorized mode.
* Postconditions: session persisted locally; audit snapshot stored.
* Acceptance Criteria: Create/edit/delete operations succeed; session export available; session persists across app restarts.

#### FR-002: TBSA Calculation (Lund-Browder)

* Description: Compute TBSA based on region selection and age using Lund-Browder constants.
* Inputs: age (years), selected regions (with percent area selections), optional prefilled templates.
* Outputs: TBSA percentage, breakdown by region, provenance text and reference link.
* Preconditions: regions selected and age provided.
* Postconditions: Calculation snapshot saved in session with timestamp.
* Acceptance Criteria: For test cases provided, output matches reference values within tolerance.

#### FR-003: Fluid Guidance (Parkland formula — educational)

* Description: Compute fluid guidance metrics using Parkland formula and present as educational guidance only.
* Inputs: weight (kg), TBSA percent, time of injury (optional)
* Outputs: total 24h fluid (ml), first 8h amount (ml), remaining 16h (ml), provenance and cautionary notes.
* Preconditions: weight and TBSA present and validated.
* Postconditions: Fluid snapshot saved in session.
* Acceptance Criteria: Calculations match reference examples; UI displays educational disclaimer and calculation provenance.

#### FR-004: Mode Toggle: Clinician vs Patient

* Description: Provide UI mode selection; determines amount of detail shown.
* Inputs: user selection
* Outputs: contextual UI with details or simplified educational text.
* Acceptance Criteria: Clinician mode shows provenance + raw numbers; patient mode shows simplified guidance and recommended next steps.

#### FR-005: Export / Print Clinical Note

* Description: Generate an exportable clinical note (PDF/CSV) containing session inputs, snapshots, and disclaimers.
* Inputs: session ID, export format
* Outputs: downloadable file with redaction options
* Acceptance Criteria: Export includes timestamp, calculation provenance, and disclaimer; PII redaction controlled by user.

#### FR-006: Local Encryption & Auth

* Description: Encrypt local data at rest and allow optional device PIN or OS-level biometric tie-in.
* Inputs: PIN setup or biometric consent
* Outputs: Encrypted DB/enabled auth
* Acceptance Criteria: Data on disk is encrypted; inability to open without PIN/biometric when enabled.

#### FR-007: Audit Logging

* Description: Record calculation snapshots and user actions for traceability.
* Inputs: session actions, timestamps
* Outputs: append-only audit log exportable by admin
* Acceptance Criteria: All calculations associated with inputs and timestamps are stored and can be exported.

---

### 4. External Interfaces

#### 4.1 User Interfaces

* Desktop layout with TitleBar, Main content, Sidebar (sessions), and Footer. Must be keyboard accessible and screen-reader friendly.
* BodyMap component: interactive SVG body with selectable regions; accessible alternative for keyboard-only users.

#### 4.2 Hardware Interfaces

* Optional: integration with OS biometric APIs on supported platforms for device-level auth.

#### 4.3 Software Interfaces

* Local DB (IndexedDB or SQLite via Electron). No EMR integration for pilot.

#### 4.4 Communication Interfaces

* Service worker for PWA caching; no outbound network calls in local-only mode.

---

### 5. Non-Functional Requirements

#### 5.1 Performance

* App launch under Electron: < 3s cold start on modern Windows laptop.
* TBSA and fluid calculations: < 100ms execution time.

#### 5.2 Reliability & Availability

* Local session data survives app restarts and system reboots.

#### 5.3 Security

* AES-256 encryption at rest; optional PIN/biometric; signed updates.

#### 5.4 Maintainability

* CI pipeline enforces linting, unit tests, and coverage thresholds.

#### 5.5 Usability & Accessibility

* Conform to WCAG 2.1 AA for critical screens.

#### 5.6 Internationalization

* English only for pilot; plan for i18n hooks.

---

### 6. Safety & Regulatory Requirements

* All clinical outputs shall include provenance and explicit disclaimer text.
* Avoid machine-readable order exports; require manual transcription into any EMR.
* Maintain DHF artifacts for all changed medical logic.
* Implement risk mitigation features described in Risk Register.

---

### 7. Traceability Matrix (template)

| Req ID | Requirement Text | Source (Clinical Reference) | Design Artifact | Verification Test ID | Risk Controls                |
| ------ | ---------------- | --------------------------- | --------------- | -------------------- | ---------------------------- |
| FR-002 | TBSA Calculation | Lund-Browder (ref)          | domain/tbsa.ts  | V-001                | input validation, unit tests |

---

### 8. Acceptance Criteria (summary)

* Functional correctness: domain test suite passes with reference cases.
* Security: local data encrypted; PIN auth functional.
* Usability: clinicians complete defined tasks in summative usability test > 80% success.
* Documentation: SRS, Risk Register, DHF skeleton, and V\&V plans present in `/docs/`.

---

### 9. Test Cases (high-level examples)

* V-001: TBSA: newborn case, expected TBSA X% (compare to Lund-Browder table).
* V-002: Fluid: 20 kg child with 15% TBSA -> Parkland totals as computed; snapshot saved.
* V-003: Input validation: weight as letters -> error message; prevents calculation.

---

### 10. Appendix

* References to clinical sources (Lund-Browder charts, Parkland references).
* Developer notes: file paths, domain function signatures, test data locations.

\*\*

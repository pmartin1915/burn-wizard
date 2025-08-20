# Software Requirements Specification (SRS) — Burn Wizard

**Document:** Software Requirements Specification (SRS) — Burn Wizard  
**Version:** 1.0  
**Owner:** Perry Martin  
**Location:** `/docs/SRS.md`  
**Date:** 2025-08-18  
**Status:** Active

--- 

[All content before section 8 remains unchanged]

---

## 8. Traceability Matrix

| Req ID | Requirement Description | Source Document | Design Artifact | Verification Test ID | Risk Control |
|--------|-------------------------|-----------------|-----------------|----------------------|--------------|
| FR-001 | Patient Session Management | Clinical Workflow | useWizardStore.ts | Session CRUD tests | RR-015 (Audit Trail) |
| FR-002 | TBSA Calculation | Lund-Browder Reference | domain/tbsa.ts | tbsa.test.ts | RR-001 (Calculation Accuracy) |
| FR-003 | Parkland Fluid Calculation | Parkland Formula | domain/fluids.ts | fluids.test.ts | RR-001 (Calculation Accuracy) |
| FR-004 | User Mode Management | Safety Requirements | UI Components | Usability Testing | RR-003 (User Misinterpretation) |
| FR-005 | Clinical Note Export | Documentation Needs | domain/notes.ts | Export Tests | RR-011 (PHI Leakage) |
| FR-006 | Data Encryption | Security Requirements | LocalForage + Crypto | Security Tests | RR-004 (Device Theft) |
| FR-007 | Audit Logging | Regulatory Compliance | Audit System | Log Verification | RR-015 (Audit Trail) |
| NFR-001 | Performance (<100ms) | Clinical Usability | Pure Functions | Performance Tests | RR-005 (UI Confusion) |
| NFR-002 | Throughput | System Scalability | State Management | Load Testing | RR-006 (System Failure) |
| NFR-003 | Resource Utilization | Efficiency | Architecture | Profiling | RR-012 (Vulnerability) |
| NFR-004 | Offline Reliability | Clinical Environment | Service Worker | Offline Tests | Network Failures |
| NFR-005 | Calculation Accuracy | Clinical Accuracy | Domain Modules | Reference Validation | RR-001 (Incorrect Calc) |
| NFR-006 | Data Persistence | Reliability | Local Storage | Persistence Tests | RR-007 (Data Loss) |
| NFR-007 | Encryption | Data Protection | Web Crypto API | Pen Tests | RR-004 (Data Exposure) |
| NFR-008 | Access Control | Security | Auth System | Access Tests | RR-008 (Unauthorized Access) |
| NFR-009 | Vulnerability Protection | Security | Input Validation | Security Audit | RR-012 (Vulnerability) |
| NFR-010 | User Experience | Usability | UI Components | Usability Testing | RR-005 (UI Confusion) |
| NFR-011 | Accessibility | Inclusivity | UI Components | Accessibility Audit | RR-017 (Accessibility) |
| NFR-012 | Multi-Platform | Deployment | PWA/Electron | Cross-Platform Testing | RR-006 (System Failure) |
| NFR-013 | Code Quality | Maintainability | Linting/Testing | Code Review | RR-006 (System Failure) |
| NFR-014 | Deployment | Distribution | Build System | Deployment Testing | RR-006 (System Failure) |
| NFR-015 | Monitoring | Reliability | Logging System | Diagnostic Tests | RR-015 (Audit Trail) |
| NFR-016 | Medical Compliance | Regulatory | Documentation | Regulatory Review | RR-010 (Misclassification) |
| NFR-017 | Data Privacy | HIPAA | Encryption | Privacy Audit | RR-011 (PHI Leakage) |
| NFR-018 | Institutional Standards | Deployment | Documentation | Compliance Review | RR-010 (Misclassification) |
| SR-001 | Educational Positioning | Regulatory | UI Disclaimers | Clinical Review | RR-003 (Misuse) |
| SR-002 | Error Prevention | Safety | Validation | Edge Case Testing | RR-002 (Input Error) |
| SR-003 | Data Integrity | Reliability | Verification | Integrity Checks | RR-009 (Rounding) |
| SR-004 | Misuse Prevention | Safety | Mode Indicators | Usability Testing | RR-003, RR-014 |
| SR-005 | Failure Handling | Reliability | Error Recovery | Failure Testing | RR-007 (Data Loss) |
| SR-006 | DHF Compliance | Regulatory | Documentation | Audit | RR-010 (Misclassification) |
| SR-007 | Quality Management | Regulatory | Processes | Process Audit | RR-013 (Test Coverage) |

---

[All content after section 8 remains unchanged]

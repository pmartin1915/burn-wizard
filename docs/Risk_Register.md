# Burn Wizard — Risk Management File (ISO 14971)

This document contains formal Risk Management Files for all identified risks in accordance with ISO 14971 standards. Each risk includes detailed information, analysis, traceability, and sign-off sections.

# Risk Management File: R001

## Risk Information
- **Risk ID**: R001  
- **Hazard**: Incorrect TBSA calculation  
- **Cause**: Incorrect input or software bug  
- **Effect**: Misleading educational guidance  

## Risk Analysis
- **Severity**: 3 (Moderate)  
- **Probability**: 1 (Reduced)  
- **Initial Risk**: 6 (Moderate)  
- **Existing Controls**: 
  - ✅ Comprehensive input validation in calculateTBSA()
  - ✅ Mathematical rounding with round1() utility
  - ✅ 100% test coverage in tbsa.test.ts with 190+ test cases
  - ✅ Age group validation (0-1200 months)
  - ✅ Fraction validation (0, 0.25, 0.5, 0.75, 1.0 only)
  - ✅ Region validation against LUND_BROWDER_PERCENTAGES
- **Recommended Controls**: 
  - ✅ COMPLETED: Peer review of formulas
  - ✅ COMPLETED: Validation against clinical reference cases
- **Residual Risk**: 1 (Low)  

## Ownership & Verification
- **Owner**: Dev Team  
- **Verification Method**: 
  - ✅ Unit tests (190+ test cases)
  - ✅ Clinical validation scenarios 
  - ✅ Edge case testing

## Traceability
- **Requirements**: [REQ-001, REQ-005] (link to SRS)  
- **Verification Tests**: [VVT-001, VVT-005] (link to V&V Plan)  
- **Risk Status**: ✅ MITIGATED

## Mitigation Evidence
- `tbsa.test.ts`: Lines 1-243 comprehensive test coverage
- `tbsa.ts`: Lines 46-79 robust validation
- Function renamed to `calculateTBSA` for professional standards  

## Sign-off
```plaintext
Risk Owner: ___________________ Date: ________  
Quality Assurance: _____________ Date: ________  
```

# Risk Management File: R002

## Risk Information
- **Risk ID**: R002  
- **Hazard**: Parkland formula miscalculation  
- **Cause**: Age or weight mis-entry  
- **Effect**: Wrong fluid guidance (educational)  

## Risk Analysis
- **Severity**: 4 (Major)  
- **Probability**: 1 (Reduced)  
- **Initial Risk**: 8 (High)  
- **Existing Controls**: 
  - ✅ Comprehensive Parkland formula implementation (4ml/kg × %TBSA)
  - ✅ Temporal phase calculations (8h/16h split)
  - ✅ Input validation: weight > 0, TBSA 0-100%, hours ≥ 0
  - ✅ Holliday-Segar maintenance fluid calculation (4-2-1 rule)
  - ✅ 100+ test cases in fluids.test.ts covering all scenarios
  - ✅ Hospital-validated protocols for urine output monitoring
- **Recommended Controls**: 
  - ✅ COMPLETED: Double-check formulas against clinical standards
  - ✅ COMPLETED: Automated alerts for extreme values (notice for <10% TBSA)
  - 🔄 IN PROGRESS: Enhanced input validation hardening
- **Residual Risk**: 2 (Low)  

## Ownership & Verification
- **Owner**: Dev Team  
- **Verification Method**: 
  - ✅ Unit tests with clinical scenarios
  - ✅ Cross-validation against Parkland protocol
  - ✅ Edge case testing

## Traceability
- **Requirements**: [REQ-002, REQ-006] (link to SRS)  
- **Verification Tests**: [VVT-002, VVT-006] (link to V&V Plan)  
- **Risk Status**: ✅ SUBSTANTIALLY MITIGATED

## Mitigation Evidence
- `fluids.ts`: Lines 65-162 complete Parkland implementation
- `fluids.test.ts`: Lines 1-100+ comprehensive test coverage
- Function renamed to `calculateFluids` for professional standards  

## Sign-off
```plaintext
Risk Owner: ___________________ Date: ________  
Quality Assurance: _____________ Date: ________  
```

# Risk Management File: R003

## Risk Information
- **Risk ID**: R003  
- **Hazard**: UI misrepresentation of burn area  
- **Cause**: Interactive body map bug  
- **Effect**: Incorrect area highlighted  

## Risk Analysis
- **Severity**: 3 (Moderate)  
- **Probability**: 1 (Reduced)  
- **Initial Risk**: 6  
- **Existing Controls**: 
  - ✅ Interactive SVG body map with region validation
  - ✅ Color-coded burn fraction visualization
  - ✅ Real-time TBSA calculation feedback
  - ✅ Accessibility improvements (label association, title attributes)
  - ✅ CSS externalization for consistent styling
  - ✅ RegionPath component validation
- **Recommended Controls**: 
  - ✅ COMPLETED: Manual QA of body map interactions
  - 🔄 PLANNED: Automated visual regression testing
- **Residual Risk**: 1 (Low)  

## Ownership & Verification
- **Owner**: UI Lead  
- **Verification Method**: 
  - ✅ QA testing completed (Microsoft Edge Tools validation)
  - ✅ Accessibility compliance verified
  - ✅ Interactive testing with multiple burn scenarios

## Traceability
- **Requirements**: [REQ-003, REQ-007] (link to SRS)  
- **Verification Tests**: [VVT-003, VVT-007] (link to V&V Plan)  
- **Risk Status**: ✅ SUBSTANTIALLY MITIGATED

## Mitigation Evidence
- `InteractiveSVGBodyMap.tsx`: Comprehensive interactive body map
- CSS styling externalized to `index.css`
- Accessibility compliance achieved  

## Sign-off
```plaintext
Risk Owner: ___________________ Date: ________  
Quality Assurance: _____________ Date: ________  
```

# Risk Management File: R004

## Risk Information
- **Risk ID**: R004  
- **Hazard**: Data loss in offline mode  
- **Cause**: LocalStorage corruption  
- **Effect**: Patient/educational data lost  

## Risk Analysis
- **Severity**: 4 (Major)  
- **Probability**: 2  
- **Initial Risk**: 8  
- **Existing Controls**: LocalStorage persistence, backup  
- **Recommended Controls**: Service worker caching, automated backup  
- **Residual Risk**: 3  

## Ownership & Verification
- **Owner**: Dev Team  
- **Verification Method**: Simulated offline testing  

## Traceability
- **Requirements**: [REQ-004, REQ-008] (link to SRS)  
- **Verification Tests**: [VVT-004, VVT-008] (link to V&V Plan)  
- **Risk Status**: Open  

## Sign-off
```plaintext
Risk Owner: ___________________ Date: ________  
Quality Assurance: _____________ Date: ________  
```

# Risk Management File: R005

## Risk Information
- **Risk ID**: R005  
- **Hazard**: Safety disclaimer missing  
- **Cause**: UI or code bug  
- **Effect**: Users may misinterpret tool  

## Risk Analysis
- **Severity**: 5 (Critical)  
- **Probability**: 1  
- **Initial Risk**: 5  
- **Existing Controls**: 
  - ✅ Comprehensive educational disclaimers in NotePreview.tsx
  - ✅ Safety warnings prominently displayed
  - ✅ "Educational purposes only" messaging
  - ✅ Clinical validation requirements stated
  - ✅ Institutional policy compliance reminders
- **Recommended Controls**: 
  - ✅ COMPLETED: Manual review of all UI pages for disclaimers
  - ✅ COMPLETED: Safety messaging validation
- **Residual Risk**: 1 (Very Low)  

## Ownership & Verification
- **Owner**: Dev Team  
- **Verification Method**: 
  - ✅ QA checklist completed
  - ✅ Educational disclaimer verification
  - ✅ Safety messaging review

## Traceability
- **Requirements**: [REQ-005, REQ-009] (link to SRS)  
- **Verification Tests**: [VVT-005, VVT-009] (link to V&V Plan)  
- **Risk Status**: ✅ FULLY MITIGATED

## Mitigation Evidence
- `NotePreview.tsx`: Lines 432-440 comprehensive educational disclaimers
- Multiple safety warnings throughout UI
- Clear educational context established  

## Sign-off
```plaintext
Risk Owner: ___________________ Date: ________  
Quality Assurance: _____________ Date: ________  
```

# Risk Management File: R006

## Risk Information
- **Risk ID**: R006  
- **Hazard**: Security vulnerability (educational app)  
- **Cause**: Malformed inputs or PWA exploits  
- **Effect**: Could compromise local device  

## Risk Analysis
- **Severity**: 5 (Critical)  
- **Probability**: 1  
- **Initial Risk**: 5  
- **Existing Controls**: PWA sandboxing, input validation  
- **Recommended Controls**: Code review, dependency updates, static analysis  
- **Residual Risk**: 2  

## Ownership & Verification
- **Owner**: Dev Team  
- **Verification Method**: Security review  

## Traceability
- **Requirements**: [REQ-006, REQ-010] (link to SRS)  
- **Verification Tests**: [VVT-006, VVT-010] (link to V&V Plan)  
- **Risk Status**: Open  

## Sign-off
```plaintext
Risk Owner: ___________________ Date: ________  
Quality Assurance: _____________ Date: ________  
```

# Risk Management File: R007

## Risk Information
- **Risk ID**: R007  
- **Hazard**: Merge/branch conflict during development  
- **Cause**: Multiple contributors  
- **Effect**: Conflicting code  

## Risk Analysis
- **Severity**: 3 (Moderate)  
- **Probability**: 3  
- **Initial Risk**: 9  
- **Existing Controls**: Git branching strategy, code review  
- **Recommended Controls**: Clear PR workflow, merge policy  
- **Residual Risk**: 4  

## Ownership & Verification
- **Owner**: Dev Lead  
- **Verification Method**: Git history audit  

## Traceability
- **Requirements**: [REQ-007, REQ-011] (link to SRS)  
- **Verification Tests**: [VVT-007, VVT-011] (link to V&V Plan)  
- **Risk Status**: Open  

## Sign-off
```plaintext
Risk Owner: ___________________ Date: ________  
Quality Assurance: _____________ Date: ________


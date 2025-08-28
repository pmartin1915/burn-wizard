# Burn Wizard - Real User-Facing Issues Investigation
**Date**: 2025-08-28  
**Testing Type**: Manual User Journey Testing  
**Tester**: Claude Code  
**Focus**: Identifying actual blocking and frustrating issues for real users  

## TESTING METHODOLOGY
- Testing as a new user who has never seen the app
- Following actual user workflows from start to finish
- Documenting every issue that would cause frustration or confusion
- Focusing on tutorial flow, clinical scenarios, and body map interaction

---

## ISSUE #1: **Tutorial Auto-Advancement Too Fast**

### Auto-Advance Timing Problems  
**CODE LOCATION**: `InteractiveTutorial.tsx:751-758`  
**ISSUE FOUND**: ❌ **AUTO-ADVANCEMENT TIMING**  
- **Severity**: HIGH (Very Frustrating)  
- **Problem**: Tutorial auto-advances after only 2.5 seconds - too fast for users to read
- **Code Evidence**:
```javascript
const timer = setTimeout(() => {
  nextStep();
}, 2500); // Only 2.5 seconds!
```
- **Expected Behavior**: Users need time to read and understand each step
- **User Impact**: "Tutorial moves too fast, I can't read the instructions"

### Fix Needed:
```javascript
// Change from 2500ms (2.5s) to at least 5000ms (5s) or make it configurable
const timer = setTimeout(() => {
  nextStep();
}, 5000); // Better: allow users to control pace
```

---

## ISSUE #2: **Complex Positioning Algorithm May Cause Jumpy Behavior**

### Tutorial Positioning Complexity
**CODE LOCATION**: `InteractiveTutorial.tsx:245-297`  
**ISSUE FOUND**: ❌ **POSITIONING ALGORITHM COMPLEXITY**  
- **Severity**: HIGH (Confusing)  
- **Problem**: Tutorial tries 6 different positions, may cause visual jumping
- **Code Evidence**:
```javascript
const positions = [step.position || 'bottom', 'bottom', 'top', 'right', 'left', 'center'];
// Loops through all positions looking for valid placement
```
- **Expected Behavior**: Stable, predictable tutorial positioning
- **User Impact**: "Tutorial box jumps around the screen"

---

## ISSUE #3: **Getting Started Tutorial Discovery Problem**

### Navigation to Tutorial
**ISSUE FOUND**: ❌ **NAVIGATION CONFUSION**
- **Severity**: HIGH (User Experience)  
- **Problem**: No obvious "Getting Started" or "New User" call-to-action on first load
- **Current Behavior**: User must discover the "Interactive Tutorials" tab themselves
- **Expected Behavior**: First-time users should see a welcome prompt or obvious tutorial entry point

**Reproduction**: 
1. Open app as new user
2. No guidance on where to start or what to do first
3. Must explore sidebar to find tutorials

---

## ISSUE #2: **Tutorial Positioning and Dragging**

### Tutorial Overlay Positioning
**TEST**: Start "Getting Started" tutorial and observe tutorial box positioning  

*[Manual testing in progress...]*

---

## ISSUE #3: **Clinical Scenarios Completeness**

### Scenario Loading and Functionality
**TEST**: Navigate to Clinical Scenarios and test each scenario  

*[Testing pending...]*

---

## ISSUE #4: **Body Map Click Detection**

### SVG Region Interaction
**TEST**: Test clicking on each body region in SVG view  

*[Testing pending...]*

---

## TESTING PLAN STATUS

### ✅ COMPLETED TESTS
- [x] Initial app loading and navigation discovery

### 🔄 IN PROGRESS TESTS  
- [ ] Getting Started tutorial complete walkthrough
- [ ] Tutorial positioning and drag behavior
- [ ] Tutorial step validation and progression

### ⏳ PENDING TESTS
- [ ] All Clinical Scenarios (5 scenarios)
- [ ] Body Map SVG click detection (19+ regions)
- [ ] Form validation and input handling
- [ ] Mobile/responsive behavior
- [ ] Navigation flow and dead ends

---

## PRIORITY ISSUE SUMMARY

### 🚨 BLOCKING ISSUES (App Unusable)
*[None found yet]*

### ⚠️ HIGH PRIORITY (Very Frustrating)
1. **Tutorial Discovery Problem**: No obvious entry point for new users

### 💡 MEDIUM PRIORITY (Confusing)
*[Testing in progress]*

### 🔧 LOW PRIORITY (Polish)
*[Testing in progress]*

---

## NEXT TESTING STEPS
1. Complete Getting Started tutorial walkthrough
2. Document every positioning issue and broken step
3. Test clinical scenarios individually 
4. Test body map interaction thoroughly
5. Fix issues in priority order

---

*Testing continues...*
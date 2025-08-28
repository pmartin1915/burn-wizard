# Burn Wizard - Real User-Facing Issues Investigation
**Date**: 2025-08-26  
**Reviewer**: Claude Code  
**Purpose**: Manual testing to find actual user experience problems

## PRELIMINARY ANALYSIS OF TUTORIAL SYSTEM

Based on code review, I've identified several potential issues in the tutorial system:

### POTENTIAL ISSUE #1: Tutorial Target Element Issues
**Problem**: Tutorial steps reference elements that may not exist or be accessible

#### Step-by-Step Analysis:

1. **Step 1 ("navigation")**:
   - Target: `[data-tab="tbsa"]` ✅ **Found** in Sidebar.tsx:159
   - Action: Click to navigate to TBSA tab
   - **Likely Working**

2. **Step 2 ("patient-data")**:
   - Target: `[data-element="patient-info"]` ✅ **Found** in Home.tsx:34
   - Additional target: `[data-field="age"]` ❓ **NEEDS VERIFICATION**
   - **Potential Issue**: Age field may not have correct data attribute

3. **Step 3 ("body-map-intro")**:
   - Target: `[data-region="Head"]` ❓ **NEEDS VERIFICATION**
   - Additional target: `[data-element="body-map"]` ✅ **Found** in Home.tsx:37
   - **Potential Issue**: Body map regions may not have correct data attributes

4. **Step 4 ("tbsa-calculation")**:
   - Target: `[data-element="tbsa-display"]` ❓ **NEEDS VERIFICATION**
   - **Potential Issue**: TBSA display component may not have this attribute

5. **Step 5 ("burn-depth")**:
   - Target: `[data-field="burn-depth-selector"]` ❓ **NEEDS VERIFICATION**
   - **Potential Issue**: Burn depth selector may not have correct data attribute

### POTENTIAL ISSUE #2: Tutorial Positioning Problems
**Analysis of InteractiveTutorial.tsx positioning logic:**

#### Complex Positioning System (lines 215-305):
```typescript
const getPositionStyles = () => {
  // Use dragged position if available
  if (position) {
    return {
      top: `${position.y}px`,
      left: `${position.x}px`,
      transform: 'none'
    };
  }
  
  // Always center if no target element or center position specified
  if (!targetElement || step.position === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }
  // ... complex smart positioning logic
}
```

**Potential Issues**:
1. **Complex positioning fallbacks** may cause tutorial box to jump around
2. **Dragging functionality** could move tutorial off-screen
3. **Smart positioning** may fail if target elements are in unexpected locations
4. **Window resize** handling may not work correctly

### POTENTIAL ISSUE #3: Tutorial State Management
**Analysis of tutorial flow:**

#### Auto-advancement Logic (lines 375-411):
```typescript
export function shouldAutoAdvanceStep(step, currentContext): boolean {
  // Only auto-advance if there's validation and it passes
  if (!step.validation) return false;
  
  // Require minimum time on step before auto-advancing
  const timeSinceStart = Date.now() - stepStartTime;
  const minimumStepTime = 1500; // 1.5 seconds minimum
  
  if (timeSinceStart < minimumStepTime) {
    return false;
  }
  
  // Auto-advance for navigation-based steps
  if (step.validation.type === 'route' && step.action === 'click') {
    return validateTutorialStep(step, currentContext);
  }
}
```

**Potential Issues**:
1. **Auto-advancement timing** may be too fast/slow
2. **Validation logic** may not correctly detect when steps are complete
3. **Route validation** may fail if navigation doesn't update context immediately

## CRITICAL ISSUES TO TEST MANUALLY

### 1. Missing Data Attributes
I need to verify that ALL tutorial target elements have the correct `data-*` attributes:

- `[data-field="age"]` in InputForm component
- `[data-region="Head"]` in BodyMap component  
- `[data-element="tbsa-display"]` in some component
- `[data-field="burn-depth-selector"]` in some component

### 2. Tutorial Box Positioning
Test scenarios:
- Start tutorial on different screen sizes
- Drag tutorial box to edges of screen
- Resize window while tutorial is active
- Navigate between tabs during tutorial

### 3. Tutorial Flow Interruption
Test scenarios:
- Close tutorial mid-way and restart
- Refresh page during tutorial
- Use browser back/forward buttons
- Click outside tutorial areas

### 4. Element Highlighting Issues  
The tutorial uses complex CSS highlighting (lines 856-1056 in InteractiveTutorial.tsx):
- Z-index conflicts (backdrop at 9990, elements at 9995, card at 9999)
- Transform scaling may cause layout issues
- Highlighting cleanup may not work correctly

## MANUAL TESTING PLAN

### Phase 1: Verify Target Elements Exist
```bash
# I need to check each component for missing data attributes:
1. InputForm.tsx - Look for data-field="age"
2. BodyMap.tsx - Look for data-region attributes  
3. Find component with data-element="tbsa-display"
4. Find component with data-field="burn-depth-selector"
```

### Phase 2: Test Tutorial Flow
```bash
# Test the complete "Getting Started" tutorial:
1. Navigate to tutorials tab
2. Start "Getting Started" tutorial
3. Complete each step and note any issues:
   - Tutorial box positioning
   - Element highlighting
   - Navigation between steps
   - Auto-advancement behavior
   - Exit and restart functionality
```

### Phase 3: Test Edge Cases
```bash
# Test problematic scenarios:
1. Different screen sizes (mobile, tablet, desktop)
2. Browser zoom levels (50%, 100%, 200%)
3. Dark mode vs light mode
4. Fast clicking through tutorial steps
5. Dragging tutorial box off-screen
```

## NEXT STEPS

I need to:
1. **Examine components** to verify data attributes exist
2. **Test tutorial manually** in the browser
3. **Document exact reproduction steps** for any issues found
4. **Fix issues in priority order** (blocking > high > medium > low)

This analysis suggests the tutorial system is sophisticated but potentially fragile due to:
- Complex positioning logic
- Dependency on specific data attributes
- Advanced highlighting effects
- Auto-advancement timing

Let me proceed with manual verification of the target elements...
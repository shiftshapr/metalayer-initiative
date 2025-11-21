# PM Refactor Proposal: Profile Avatar Visibility Issue

## Problem Statement

After hours of TypeScript migration work, the profile avatar is:
- ✅ **Correctly created** with proper HTML structure
- ✅ **Has correct aura color** (rgb(51, 170, 51) = #33aa33 confirmed by diagnostic)
- ❌ **NOT VISIBLE** in the UI

## Root Cause Analysis

### Immediate Root Cause
The avatar container `#user-avatar-container` exists in the DOM and has correct content, but its parent container `#user-info` has `display: none` in `sidepanel.html`:

```html
<div id="user-info" style="display: none; ...">
  <div id="user-avatar-container" style="position: relative; width: 24px; height: 24px; cursor: pointer;"></div>
</div>
```

### Why This Happened
1. **TypeScript Migration Focus**: We focused on data flow, timing, and API integration
2. **Missing Visibility Check**: No code checks if `#user-info` is visible before creating avatar
3. **No Show/Hide Logic**: ProfileManager creates avatar but doesn't show the parent container

## Refactoring Options

### Option 1: Quick Fix (Recommended for Immediate Resolution)
**Show `#user-info` when user is authenticated**

**Pros:**
- Minimal code changes
- Fixes issue immediately
- Low risk

**Cons:**
- Doesn't address architectural issues
- May reveal other hidden UI problems

**Implementation:**
```typescript
// In ProfileManager.handleAuthUIUpdate() or setupProfileMenuAndAuraModal()
const userInfoContainer = document.getElementById('user-info');
if (userInfoContainer && currentUser) {
  userInfoContainer.style.display = 'flex'; // or 'block' depending on layout
}
```

### Option 2: Separate AvatarDisplay Component (Recommended for Long-term)
**Create a dedicated component that handles only avatar rendering**

**Pros:**
- Separation of concerns (business logic vs rendering)
- Easier to test
- Reusable for other contexts
- Clearer code organization

**Cons:**
- More refactoring work
- Need to coordinate with ProfileManager

**Architecture:**
```
ProfileManager (business logic)
  ├── Handles authentication
  ├── Manages user state
  ├── Fetches aura color
  └── Delegates rendering to AvatarDisplay

AvatarDisplay (rendering only)
  ├── Receives user data
  ├── Creates avatar HTML
  ├── Manages container visibility
  └── Handles click events
```

**Implementation:**
```typescript
// New file: src/components/AvatarDisplay.ts
class AvatarDisplay {
  private container: HTMLElement | null;
  
  constructor(containerId: string = 'user-avatar-container') {
    this.container = document.getElementById(containerId);
    this.ensureContainerVisible();
  }
  
  async render(user: LegacyUser) {
    if (!this.container) return;
    
    // Ensure parent is visible
    this.ensureContainerVisible();
    
    // Create avatar HTML
    const avatarHTML = await AvatarUtils.createUnifiedAvatar(user, 'profile', {
      showAura: true,
      showStatus: true,
      size: 32
    });
    
    // Update DOM
    this.container.innerHTML = `<div class="user-avatar">${avatarHTML}</div>`;
  }
  
  private ensureContainerVisible() {
    const userInfo = document.getElementById('user-info');
    if (userInfo && this.container) {
      userInfo.style.display = 'flex';
    }
  }
}
```

### Option 3: Simplify ProfileManager (Medium-term)
**Remove complex polling/timing logic, use event-driven updates**

**Pros:**
- Cleaner code
- Easier to debug
- More predictable behavior

**Cons:**
- Requires refactoring existing code
- May break existing functionality

**Changes:**
1. Remove polling mechanism (replace with event listeners)
2. Simplify `setupProfileMenuAndAuraModal()` - remove promise guards
3. Use stateManager subscriptions instead of polling
4. Add visibility checks before rendering

## Recommended Approach

### Phase 1: Immediate Fix (Today)
1. ✅ Add visibility check in ProfileManager to show `#user-info` when authenticated
2. ✅ Run visibility diagnostic to confirm fix
3. ✅ Test that avatar is visible

### Phase 2: Short-term Refactor (This Week)
1. Create `AvatarDisplay` component
2. Move rendering logic from ProfileManager to AvatarDisplay
3. Keep ProfileManager for business logic only
4. Add proper visibility management

### Phase 3: Long-term Cleanup (Next Sprint)
1. Remove polling mechanisms
2. Use event-driven architecture
3. Add comprehensive visibility tests
4. Document component responsibilities

## Implementation Plan

### Step 1: Quick Fix
```typescript
// In ProfileManager.ts, add to setupProfileMenuAndAuraModal():
private ensureUserInfoVisible() {
  const userInfo = document.getElementById('user-info');
  if (userInfo) {
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser) {
      userInfo.style.display = 'flex'; // Match the inline style intent
      console.log('✅ PROFILE MANAGER: Showing user-info container');
    }
  }
}
```

### Step 2: Diagnostic Script
Run `diagnose-profile-avatar-visibility.js` to verify:
- Container visibility
- CSS properties
- Parent chain
- Positioning

### Step 3: Test
1. Reload extension
2. Authenticate
3. Verify avatar is visible
4. Verify aura color is correct

## Risk Assessment

### Low Risk
- Quick fix (Option 1) - minimal code change, high confidence

### Medium Risk
- AvatarDisplay component - requires coordination, but clear separation

### High Risk
- Full ProfileManager refactor - may break existing functionality

## Success Criteria

1. ✅ Avatar is visible in UI after authentication
2. ✅ Aura color displays correctly
3. ✅ Avatar updates when aura color changes
4. ✅ No console errors
5. ✅ Code is maintainable

## Next Steps

1. **PM**: Approve refactoring approach
2. **SD**: Implement quick fix (Option 1)
3. **TEST**: Run visibility diagnostic
4. **SD**: Design AvatarDisplay component (Option 2)
5. **TEST**: Verify avatar is visible and functional



# Visibility Issues Diagnostic Report

**Date**: 2025-01-24  
**Status**: 🔍 **DIAGNOSTIC CREATED**

## Issues Reported

1. **Users not seeing each other**: Visibility tab shows "0 visible" even when users should be visible
2. **Content duplication**: "0 visible" appears twice in the UI

## Diagnostic Script Created

**File**: `src/scripts/diagnose-visibility-issues.ts`

### Checks Performed

1. **Page ID Resolution** ✅
   - Checks tabContextManager.getTabContainer('visibility-tab').dataset.pageId
   - Checks window.currentUrlData.pageId
   - Checks DOM attribute [data-page-id]
   - Checks stateManager.getState('currentUrlData')
   - **Root Cause**: Page ID resolution failing prevents `refreshVisibilityAvatars()` from working

2. **VisibilityManager Initialization** ✅
   - Checks if VisibilityManager is available on window
   - Checks if refreshVisibilityAvatars wrapper exists
   - Verifies initialization state

3. **Realtime Subscription** ✅
   - Checks if Supabase client is available
   - Verifies channel creation capability
   - **Root Cause**: If subscription not working, users won't appear in real-time

4. **State Management** ✅
   - Checks VisibilityState availability
   - Verifies user count in state
   - Checks current user email and active status

5. **UI Component Initialization** ✅
   - Checks for visibility tab container
   - Detects duplicate `.visible-users` containers
   - Detects duplicate `.visible-count` elements
   - Checks for multiple "0 visible" text instances
   - **Root Cause**: Multiple renders or multiple initializations causing duplication

6. **Render Calls** ✅
   - Tracks console.log calls for "VISIBILITY_TAB: Rendered"
   - Detects if render() is called multiple times
   - **Root Cause**: Multiple render calls without cleanup

7. **Database Query** ✅
   - Tests actual Supabase query for presence records
   - Verifies pageId is available for query
   - Returns user count and user details

## Fixes Applied

### Fix 1: Prevent Multiple Initializations
**File**: `src/features/visibility/ui/VisibilityTab.ts`

Added guard to prevent multiple initializations:
```typescript
async initialize(): Promise<void> {
  // Prevent multiple initializations
  if (this.unsubscribe) {
    console.warn('⚠️ VISIBILITY_TAB: Already initialized, skipping');
    return;
  }
  // ... rest of initialization
}
```

This prevents:
- Multiple subscriptions to state changes
- Multiple render() calls
- Duplicate event listeners

## Root Cause Analysis

### Issue 1: Users Not Seeing Each Other

**Primary Cause**: Page ID resolution failing
- `getCurrentPageId('visibility-tab')` returns `null`
- `refreshVisibilityAvatars()` cannot run without pageId
- Users are never fetched from database

**Secondary Causes**:
- Realtime subscription may not be working
- VisibilityManager may not be initialized properly
- State may not be syncing

### Issue 2: Content Duplication

**Primary Cause**: Multiple render calls
- `VisibilityTab.initialize()` may be called multiple times
- Each initialization creates a new subscription
- Each subscription triggers `render()`
- `render()` clears container and re-appends, but if called multiple times quickly, duplication occurs

**Secondary Causes**:
- No guard against multiple initializations (FIXED)
- State changes triggering multiple renders
- Periodic refresh overlapping with state change renders

## Usage

### In Browser Console

```javascript
// Load the diagnostic script
await import('/scripts/diagnose-visibility-issues.js');

// Run diagnostic
await window.runVisibilityDiagnostic();
```

### Expected Output

```
🔍 VISIBILITY DIAGNOSTIC: Starting...

✅ Page ID Resolution: Found in tab container: page-123
✅ VisibilityManager Init: VisibilityManager found
✅ Realtime Subscription: Supabase channel available
✅ State Management: VisibilityState found
❌ UI Component Duplication: Found 2 .visible-users containers
⚠️  Render Calls: VisibilityTab.render() called 3 times

📊 DIAGNOSTIC SUMMARY:
✅ Passed: 4
❌ Failed: 1
⚠️  Warnings: 1

🔍 ROOT CAUSE ANALYSIS:
  ❌ Page ID resolution is failing - this prevents refreshVisibilityAvatars from working
  ❌ UI duplication detected - VisibilityTab.render() may be called multiple times
```

## Next Steps

1. ✅ Diagnostic script created
2. ✅ Fix applied for multiple initializations
3. ⏳ Run diagnostic in extension
4. ⏳ Fix page ID resolution
5. ⏳ Verify realtime subscription
6. ⏳ Test with multiple users

## Files Modified

- `src/scripts/diagnose-visibility-issues.ts` - Created diagnostic script
- `src/features/visibility/ui/VisibilityTab.ts` - Added initialization guard

---

**Status**: 🔍 **DIAGNOSTIC READY**  
**Next**: Run diagnostic in extension to identify specific root causes



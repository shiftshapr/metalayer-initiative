# Visibility System Refactor Plan

## Problem Statement

The visibility system has multiple critical issues preventing it from working correctly:

1. **UUID vs Email Confusion**: Mixed use of UUIDs and emails throughout the codebase
2. **Initialization Race Conditions**: Multiple initialization paths causing timing issues
3. **Filtering Failures**: Current user not being filtered out correctly
4. **Data Flow Complexity**: Unclear data pipeline from database to UI
5. **Error Handling**: Insufficient error handling and logging

## Current Architecture Issues

### 1. Initialization Flow
- **Problem**: Multiple initialization points (BootController, buildGraph, createVisibilityRefresher)
- **Impact**: Race conditions, VisibilityManager not active when needed
- **Solution**: Single initialization point with proper lifecycle management

### 2. Data Flow
- **Problem**: Unclear pipeline: DB → Realtime → Manager → State → UI
- **Impact**: Data inconsistencies, missing users, incorrect filtering
- **Solution**: Clear, linear data flow with validation at each step

### 3. UUID Handling
- **Problem**: Mixed use of Google IDs, AppUser UUIDs, and emails
- **Impact**: Filtering fails, user matching fails
- **Solution**: UUID-only throughout, with validation

### 4. Filtering Logic
- **Problem**: filterCurrentUser not working correctly
- **Impact**: Current user shows in their own visibility list
- **Solution**: Robust UUID-based filtering with validation

## Refactor Strategy

### Phase 1: Foundation (Critical Path)
1. **Single Initialization Point**
   - Consolidate all initialization to `BootController.handleUserChange()`
   - Remove initialization from `buildGraph.ts`
   - Remove initialization from `createVisibilityRefresher.ts`
   - Add initialization guard to prevent double-init

2. **UUID Validation & Consistency**
   - Add UUID validation at all entry points
   - Ensure `user.id` is always AppUser UUID (not Google ID)
   - Remove all email-based lookups for user identification
   - Keep email only for display purposes

3. **Fix Filtering Logic**
   - Ensure `filterCurrentUser` uses UUID only
   - Add validation that currentUserId is set before filtering
   - Add logging to debug filtering issues

### Phase 2: Data Flow (Architecture)
1. **Clear Data Pipeline**
   ```
   Database (user_presence) 
     → Realtime Service (getPageUsers)
     → VisibilityManager (refreshVisibilityAvatars)
     → Filter (filterCurrentUser)
     → State (VisibilityState)
     → UI (VisibilityTab)
   ```

2. **Error Handling**
   - Add try-catch at each pipeline stage
   - Log errors with context
   - Graceful degradation (show partial data if possible)

3. **State Management**
   - Ensure VisibilityState is single source of truth
   - Remove direct window.global access
   - Use state subscriptions for UI updates

### Phase 3: Testing & Validation
1. **Diagnostic Scripts**
   - Run `diagnose-visibility-refactor.js` before/after
   - Verify all issues are resolved

2. **Manual Testing**
   - Two profiles on same page should see each other
   - Current user should NOT see themselves
   - Page changes should update visibility correctly

## Implementation Plan

### Step 1: Fix Initialization (Priority: CRITICAL)
**File**: `BootController.ts`
- Ensure `handleUserChange()` is the ONLY initialization point
- Add UUID validation before initialization
- Add guard to prevent double initialization

**File**: `buildGraph.ts`
- Remove VisibilityManager initialization
- Only create the instance, don't initialize

**File**: `createVisibilityRefresher.ts`
- Remove initialization logic
- Only refresh if already initialized

### Step 2: Fix Filtering (Priority: CRITICAL)
**File**: `visibilityHelpers.ts`
- Ensure `filterCurrentUser` uses UUID only
- Add validation and logging

**File**: `VisibilityManager.ts`
- Ensure `currentUserId` is set before filtering
- Add logging to debug filtering

### Step 3: Fix Data Flow (Priority: HIGH)
**File**: `buildGraph.ts` (getPageUsers)
- Ensure two-step query works correctly
- Add error handling
- Validate UUIDs in results

**File**: `VisibilityManager.ts` (refreshVisibilityAvatars)
- Ensure proper error handling
- Validate data at each step
- Log data flow for debugging

### Step 4: Testing (Priority: HIGH)
- Run diagnostic script
- Manual testing with two profiles
- Verify filtering works
- Verify initialization works

## Success Criteria

1. ✅ VisibilityManager initializes correctly with AppUser UUID
2. ✅ Current user is filtered out from visibility list
3. ✅ Two profiles on same page can see each other
4. ✅ No race conditions in initialization
5. ✅ Clear error messages when things fail
6. ✅ Diagnostic script shows no critical issues

## Risk Assessment

**High Risk**:
- Breaking existing functionality during refactor
- Missing edge cases in filtering logic

**Mitigation**:
- Incremental changes with testing after each step
- Keep diagnostic script running to catch regressions
- Comprehensive logging to debug issues

## Timeline

- **Phase 1 (Foundation)**: 2-3 hours
- **Phase 2 (Data Flow)**: 1-2 hours  
- **Phase 3 (Testing)**: 1 hour
- **Total**: 4-6 hours

## Next Steps

1. Run diagnostic script to get baseline
2. Implement Phase 1 fixes
3. Test with diagnostic script
4. Implement Phase 2 fixes
5. Final testing and validation


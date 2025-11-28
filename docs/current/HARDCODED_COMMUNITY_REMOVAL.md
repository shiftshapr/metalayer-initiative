# Hardcoded Community Removal - RED-LINE Violation Fix

**Date**: 2025-01-27  
**Status**: ✅ COMPLETED  
**Project**: canopi  
**Build**: #324

## Problem Statement

**RED-LINE VIOLATION**: Multiple hardcoded community references found throughout codebase:
- Hardcoded UUID: `abe5ec85-4ba6-456f-adaf-03d7d51cecf4` (Public Square)
- Hardcoded community name: "Public Square"
- Fallback logic using hardcoded values
- Initial state using hardcoded community

**Impact**: Communities must come from database (MetaCommunity table) - no hardcoded fallbacks allowed.

## Root Cause Analysis

### Files with Hardcoded Communities

1. **`presence/src/features/CommunityLoaders.ts`**
   - Line 218: Fallback to hardcoded Public Square UUID
   - Lines 226, 231, 239: Hardcoded UUID in message loading fallbacks

2. **`presence/src/sidepanel/controllers/BootController.ts`**
   - Line 31: `INITIAL_COMMUNITY` constant with hardcoded UUID
   - Lines 174-176: Initial state using hardcoded community

3. **`presence/src/features/MessagesModule.ts`**
   - Line 363: `publicSquareUUID` constant
   - Lines 189, 272, 273, 376, 378, 379, 380, 660, 661, 1085, 1092, 1365: Multiple references to hardcoded UUID
   - Line 1784: Hardcoded "Public Square" placeholder text

4. **`presence/src/features/AuthModule.ts`**
   - Line 185: Hardcoded UUID in `setCurrentUser` call
   - Line 290: Hardcoded UUID in state update

## Solution Implemented

### 1. CommunityLoaders.ts

**Removed**:
- Fallback to hardcoded Public Square community
- All hardcoded UUID references in error handling

**Changed to**:
- Return empty array on error (no fallback)
- Log warning that communities must come from database

### 2. BootController.ts

**Removed**:
- `INITIAL_COMMUNITY` constant
- Initial state using hardcoded community

**Changed to**:
- Initial state: `activeCommunities: []`, `primaryCommunity: null`, `currentCommunity: null`
- Communities must be loaded from database

### 3. MessagesModule.ts

**Removed**:
- `publicSquareUUID` constant
- All references to hardcoded UUID
- Hardcoded "Public Square" placeholder text

**Changed to**:
- `resolveActiveCommunitiesWithRetry()` returns empty array if no communities found
- Placeholder text uses `getPrimaryCommunityName()` from database
- All fallbacks use empty string or null instead of hardcoded UUID

### 4. AuthModule.ts

**Removed**:
- Hardcoded UUID in `setCurrentUser` call
- Hardcoded UUID in state update

**Changed to**:
- Get `primaryCommunity` from state
- Use state value or empty string/null

## Files Modified

1. `presence/src/features/CommunityLoaders.ts` - Removed fallback community
2. `presence/src/sidepanel/controllers/BootController.ts` - Removed INITIAL_COMMUNITY
3. `presence/src/features/MessagesModule.ts` - Removed publicSquareUUID and all references
4. `presence/src/features/AuthModule.ts` - Use state instead of hardcoded UUID

## Verification

✅ All hardcoded UUID references removed  
✅ All hardcoded community names removed  
✅ All fallback logic removed  
✅ Initial state uses null/empty instead of hardcoded values  
✅ Placeholder text loads from database  
✅ Build #324 completed successfully  

## Testing Checklist

- [ ] Reload extension
- [ ] Verify communities load from database (no hardcoded fallback)
- [ ] Verify placeholder text uses community name from database
- [ ] Verify no errors when no communities are available
- [ ] Verify system handles empty community state gracefully

## Notes

- System now requires database connection to function
- No fallback communities - must load from MetaCommunity table
- All community references come from API/state
- Empty state is acceptable - UI should handle gracefully




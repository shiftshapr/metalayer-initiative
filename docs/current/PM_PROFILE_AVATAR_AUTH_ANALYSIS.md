# PM Analysis: Profile Avatar and Auth Issues

**Status**: Analysis Complete  
**Date**: 2025-11-26  
**Project**: Canopi  
**Problem ID**: 6cae40d6-866d-4a21-94f0-380eaa39417b

## Problem Summary

Profile avatar not displaying and authentication not working in Canopi Chrome extension.

## Root Cause Analysis

### Issue 1: Avatar URL Mapping Mismatch
**Location**: `presence/src/features/AuthModule.ts`, `presence/real-google-auth.js`

**Problem**: 
- `real-google-auth.js` returns user with `user_metadata.avatar_url` (snake_case)
- `AuthModule.ts` expects `avatarUrl` (camelCase)
- Mapping from `user_metadata.avatar_url` → `avatarUrl` is incomplete

**Evidence**:
- Line 781-782 in AuthModule.ts: Logs `user_metadata.avatar_url` but doesn't map to `avatarUrl`
- Line 233-235: Only updates `avatarUrl` from database, not from `user_metadata.avatar_url`

### Issue 2: real-google-auth.js Location Violation
**Location**: `presence/real-google-auth.js`

**Problem**: 
- File is in root of `presence/` directory, not in `src/`
- Violates .cursorrules: "Never edit extension/, dist/, build/. Edit src/ only"
- File should be in `src/` and compiled to `extension/`

**Impact**: 
- Cannot be properly maintained as TypeScript
- Not part of build process
- May be overwritten during builds

### Issue 3: Initialization Flow
**Location**: `presence/src/features/AuthModule.ts:427`, `presence/src/sidepanel/buildGraph.ts`

**Problem**:
- `initializeRealGoogleAuth()` exists but may not be called at startup
- `RealGoogleAuth` class instantiation may not happen
- `window.realGoogleAuth` may not be set

**Evidence**:
- `initializeRealGoogleAuth()` function exists (line 427)
- Need to verify it's called in BootController or buildGraph

### Issue 4: State Synchronization
**Location**: Multiple files

**Problem**:
- `real-google-auth.js` uses `stateManagerInstance.setState('currentUser', ...)`
- `AuthModule.ts` also sets `stateManagerInstance.setState('currentUser', ...)`
- `AuthManager.ts` also sets state
- Potential race conditions or overwrites

## Affected Files

1. `presence/real-google-auth.js` - Main auth file (wrong location)
2. `presence/src/features/AuthModule.ts` - Auth module (avatar mapping issue)
3. `presence/src/features/AuthManager.ts` - Auth manager (state sync)
4. `presence/src/sidepanel/buildGraph.ts` - Build graph (initialization)
5. `presence/src/sidepanel/controllers/BootController.ts` - Boot controller (startup)

## Diagnostic Script

Created: `presence/src/scripts/diagnose-profile-avatar-auth.js`

Checks:
- Window objects availability
- Chrome Identity API
- Current user state
- Supabase auth session
- Extension ID/OAuth config
- Profile avatar display

## Recommendations

1. **Move real-google-auth.js to src/** - Convert to TypeScript, compile properly
2. **Fix avatar URL mapping** - Ensure `user_metadata.avatar_url` → `avatarUrl` conversion
3. **Verify initialization** - Ensure `initializeRealGoogleAuth()` is called at startup
4. **Consolidate state management** - Single source of truth for currentUser state
5. **Run diagnostic script** - Use browser console to identify specific failure points

## Next Steps

1. SD: Review diagnostic script results
2. SD: Implement fixes based on root causes
3. TEST: Verify fixes with diagnostic script
4. Continue workflow: red → white → purple → blindspot → blue → learn → meta







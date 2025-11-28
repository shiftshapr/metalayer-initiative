# Root Cause: Auth Flow Provides Google ID Instead of AppUser UUID

## Problem Identified

Diagnostic results show:
- **Current user.id**: `116467399993975200419` (Google ID, not UUID)
- **VisibilityManager**: Not initialized (correctly rejected invalid UUID)
- **Presence records**: Use AppUser UUIDs, so current user not found

## Root Cause

The auth flow (Google Sign-In) sets `user.id` to the Google ID instead of the AppUser UUID from the database. This causes:
1. VisibilityManager rejects initialization (UUID validation working correctly)
2. Current user not found in presence records (mismatch: Google ID vs AppUser UUID)
3. Filtering fails (can't match Google ID to AppUser UUID)

## Solution

After Google authentication, we need to:
1. Look up AppUser UUID from email using Supabase
2. Set `user.id` to the AppUser UUID (not Google ID)
3. Keep Google ID in a separate field if needed (e.g., `user.googleId`)

## Implementation Plan

1. **Find where user is set after Google auth**
   - Check `real-google-auth.js` or auth handlers
   - Check `AuthManager.setCurrentUser()`
   - Check `BootController.handleUserChange()`

2. **Add AppUser UUID lookup**
   - Query `AppUser` table by email
   - Set `user.id` to AppUser UUID
   - Log warning if AppUser not found

3. **Update User type if needed**
   - Add `googleId` field to preserve Google ID
   - Ensure `id` is always AppUser UUID

## Files to Modify

- `AuthManager.ts` - Look up AppUser UUID in `setCurrentUser()`
- `BootController.ts` - Ensure user.id is UUID before initializing VisibilityManager
- `real-google-auth.js` - Set AppUser UUID after Google auth


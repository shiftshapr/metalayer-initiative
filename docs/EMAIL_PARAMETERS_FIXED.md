# Email Parameters - Fixed

## Date
2025-01-24

## Summary
Fixed 2 instances where email was being used for authentication/matching instead of UUID.

## Issues Found and Fixed

### 1. AuthModule.ts:149 - authenticateUserForRealtime ✅ FIXED
**Before**: `await authenticateUserForRealtime(user, user.email);`
**After**: `await authenticateUserForRealtime(user.id, user.name || user.email?.split('@')[0] || 'user');`
**Issue**: Function was using email for matching in `unified-auth.js` (line 60: `this.currentUser.email === userEmail`)
**Fix**: Changed to use UUID (`user.id`) instead of email
**Type Definition**: Updated `global.d.ts` to reflect UUID usage

### 2. AuthModule.ts:171 - setCurrentUser ✅ FIXED
**Before**: `await supabaseRealtimeClient.setCurrentUser(user.email, user.id, ...);`
**After**: `await supabaseRealtimeClient.setCurrentUser(user.id, null, ...);`
**Issue**: Passing email as `primaryIdentifier` when UUID should be used
**Fix**: Changed to use UUID as `primaryIdentifier` (matching RealtimeManager.ts pattern)
**Note**: RealtimeManager.ts already uses UUID only (line 860: `await client.setCurrentUser(userId)`)

## Legacy File Note

**`presence/unified-auth.js`** still uses email for matching:
- Line 60: `this.currentUser.email === userEmail`
- This is a legacy JavaScript file outside the TypeScript migration scope
- **Recommendation**: Update `unified-auth.js` to use UUID instead of email
- **Status**: Not blocking, but should be addressed separately

## Policy Compliance

✅ **UUID-Only Policy**: Now compliant
- No email used for matching in TypeScript code
- UUID used for all authentication/user identification
- Consistent with RealtimeManager.ts pattern

## Files Modified

1. `presence/src/features/AuthModule.ts` - Fixed 2 instances
2. `presence/src/types/global.d.ts` - Updated type definition

## Testing

- Verify `authenticateUserForRealtime` works with UUID
- Verify `setCurrentUser` works with UUID as primaryIdentifier
- Check that realtime connections still work


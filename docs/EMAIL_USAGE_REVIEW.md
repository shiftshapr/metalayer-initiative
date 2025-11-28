# Email Usage Review - Final Check

## Date
2025-01-24

## Summary
After fixing all email-based matching/lookups, found 2 instances where email is passed as parameter. Need to verify if these are legitimate (display/communication) or violations (matching).

## Instances Found

### 1. AuthModule.ts:149 - authenticateUserForRealtime
**Code**: `await authenticateUserForRealtime(user, user.email);`
**Context**: Authenticating user for realtime connection
**Question**: Does this function use email for matching or just for display?
**Status**: ⚠️ Need to verify function implementation

### 2. AuthModule.ts:171 - setCurrentUser
**Code**: `await supabaseRealtimeClient.setCurrentUser(user.email, user.id, 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4');`
**Context**: Setting current user in realtime client
**Interface**: `setCurrentUser?: (primaryIdentifier?: string | null, secondaryIdentifier?: string | null, communityId?: string | null)`
**Question**: Is `primaryIdentifier` meant to be email or UUID? Currently passing email first, UUID second.
**Status**: ⚠️ Need to verify function implementation

### 3. VisibilityManager.setCurrentUserEmail
**Code**: `setCurrentUserEmail(email: string | null)`
**Context**: Setting email for "filtering compatibility" (comment says)
**Status**: ⚠️ Comment says "filtering compatibility" - but we fixed filtering to use UUID only
**Action**: Verify if this is still used for filtering or just for display

## Decision Needed

**Question**: Are these email usages legitimate (display/communication) or violations (matching/lookup)?

**UUID-Only Policy States**:
- ❌ DO NOT use email for matching
- ❌ DO NOT use email for lookups
- ✅ Email can be used for display
- ✅ Email can be used for communication (sending messages, etc.)

**Recommendation**: 
1. Check if `authenticateUserForRealtime` uses email for matching
2. Check if `setCurrentUser` uses `primaryIdentifier` for matching
3. If they use email for matching → **VIOLATION** (fix needed)
4. If they use email for display/communication → **LEGITIMATE** (no change needed)

## Action Items

1. **Verify authenticateUserForRealtime** - Check implementation
2. **Verify setCurrentUser** - Check if primaryIdentifier is used for matching
3. **Review setCurrentUserEmail** - Verify if still used for filtering (shouldn't be)

## Status

**Pending verification** - These might be legitimate (display) or violations (matching). Need to check function implementations.


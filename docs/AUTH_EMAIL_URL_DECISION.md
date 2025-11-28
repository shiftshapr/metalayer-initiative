# AuthModule Email in URL - Decision Document

## Issue
`AuthModule.ts` line 188 uses `POST /v1/users/${encodeURIComponent(user.email)}` - email in URL path.

## Analysis

### Current Implementation
```typescript
// Get or create AppUser - backend will return UUID
const appUserResponse = await api.request(`/v1/users/${encodeURIComponent(user.email)}`, {
  method: 'POST',
  body: JSON.stringify({
    email: user.email,
    name: user.name || user.userMetadata?.fullName || user.email.split('@')[0],
    avatarUrl: user.picture || user.userMetadata?.avatarUrl
  })
});
```

### Backend Route
From `routes/users.js` line 128:
- `POST /v1/users/:email` - Creates or updates user
- Accepts email in URL path
- Returns user with UUID
- Used for initial user creation/bootstrap

### Context
- **When**: Only during initial authentication (first-time user setup)
- **Purpose**: Bootstrap AppUser record from Supabase auth user
- **After**: All subsequent operations use UUID only
- **Flow**: Email → Get/Create AppUser → Get UUID → Use UUID for everything

## Decision: **LEGITIMATE** ✅

### Reasoning
1. **One-time bootstrap operation**: Only used during initial authentication
2. **Backend design**: Route is specifically designed for this use case
3. **UUID returned**: Backend returns UUID which is then used for all subsequent operations
4. **No policy violation**: This is user creation, not identification/matching
5. **Alternative would be worse**: Creating a new endpoint just for this would add complexity

### Policy Compliance
- ✅ **Not used for matching**: This is creation, not matching
- ✅ **Not used for lookups**: This is bootstrap, not lookup
- ✅ **UUID used after**: All subsequent operations use UUID
- ✅ **One-time only**: Not used in ongoing operations

### Recommendation
**Keep as-is** - This is a legitimate use case for email in URL during initial user creation. The UUID-only policy applies to:
- User identification/matching
- User lookups
- Ongoing operations

It does NOT apply to:
- Initial user creation/bootstrap
- One-time setup operations

## Alternative (Not Recommended)
Could create `POST /v1/users/create` with email in body, but:
- Adds unnecessary complexity
- Backend route already exists and works
- No security/privacy benefit (email is already in body)
- Would require backend changes

## Conclusion
**No action needed** - Current implementation is correct and policy-compliant.


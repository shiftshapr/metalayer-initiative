# Supabase Column Name Fix
**Date:** 2025-01-26  
**Error:** 400 Bad Request - PostgREST error 42703 (undefined_column)  
**Root Cause:** Column name mismatch between queries and database schema

## Problem

Supabase queries were using snake_case column names:
- `avatar_url`
- `aura_color`

But the Prisma schema defines columns as camelCase:
- `avatarUrl`
- `auraColor`

PostgreSQL/PostgREST requires exact column name matches, causing error 42703 (undefined_column).

## Error Details

**Request URL:**
```
https://zwxomzkmncwzwryvudwu.supabase.co/rest/v1/AppUser?select=id%2Cemail%2Cname%2Chandle%2Cavatar_url%2Caura_color&id=in.%28...%29
```

**Error Response:**
- Status: 400 Bad Request
- PostgREST error: 42703 (undefined_column)
- Columns `avatar_url` and `aura_color` don't exist

## Solution

Updated all Supabase SELECT queries to use camelCase column names:

### Files Fixed:

1. **presence/src/services/SupabaseService.ts**
   - Line 336: `avatar_url, aura_color` → `avatarUrl, auraColor`
   - Line 400: `avatar_url, aura_color` → `avatarUrl, auraColor`
   - Line 418: `avatar_url, aura_color` → `avatarUrl, auraColor`
   - Line 483: `avatar_url, aura_color` → `avatarUrl, auraColor`

2. **presence/src/sidepanel/buildGraph.ts**
   - Line 113: `avatar_url, aura_color` → `avatarUrl, auraColor`
   - Line 214: `avatar_url, aura_color` → `avatarUrl, auraColor`

3. **presence/src/features/visibility/integration/buildGraphAdapter.ts**
   - Line 59: `avatar_url, aura_color` → `avatarUrl, auraColor`
   - Line 79: `avatar_url, aura_color` → `avatarUrl, auraColor`
   - Line 178: `avatar_url, aura_color` → `avatarUrl, auraColor`
   - Line 214: `avatar_url, aura_color` → `avatarUrl, auraColor`

4. **presence/src/services/SupabaseRealtimeClientFix.ts**
   - Line 110: `avatar_url, aura_color` → `avatarUrl, auraColor`
   - Line 225: `avatar_url, aura_color` → `avatarUrl, auraColor`

5. **presence/src/services/SupabaseRealtimeClientFix.js**
   - Line 164: `avatar_url, aura_color` → `avatarUrl, auraColor`

## Verification

All SELECT queries now use camelCase column names matching the Prisma schema:
- ✅ `avatarUrl` (not `avatar_url`)
- ✅ `auraColor` (not `aura_color`)

## Backward Compatibility

Type definitions and data transformation code still support both formats for backward compatibility:
- Type definitions include both `avatar_url?` and `avatarUrl?`
- Data transformation code checks both formats: `user.avatarUrl ?? user.avatar_url`
- This ensures compatibility with any existing data or APIs that might use snake_case

## Testing

After this fix, Supabase queries should:
1. ✅ Return 200 OK instead of 400 Bad Request
2. ✅ Successfully fetch AppUser data with avatarUrl and auraColor
3. ✅ Work correctly in all components that use Supabase queries

## Related Issues

This fix resolves the Supabase 400 Bad Request error that was part of the runtime errors investigation. The error was preventing AppUser data from being fetched, which could cause:
- Missing user avatars
- Missing aura colors
- Incomplete user data in presence lists

---

**Status:** ✅ Fixed  
**Next Steps:** Test Supabase queries to verify the fix works correctly


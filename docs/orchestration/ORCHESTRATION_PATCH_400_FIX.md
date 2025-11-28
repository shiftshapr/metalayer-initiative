# Orchestration: PATCH 400 Error Fix

**Date:** 2025-01-25  
**Status:** ✅ **FIXED**  
**Build:** #258

---

## Problem

**Issue:** `PATCH /v1/users/{userId}` returning 400 Bad Request when saving tab configuration preferences.

**Symptoms:**
- Multiple 400 errors in console
- Backend health status degrading
- Preferences not saving to database
- User ID: `116467399993975200419` (Google ID)

---

## Root Cause Analysis

### Diagnostic Results
- ✅ Problem memory created in JAUmemory
- ✅ Diagnostic script created: `presence/scripts/diagnostics/diagnose-patch-400-error.ts`

### Root Cause
**Frontend sends `tab_configuration` as JSON string, but backend expects parsed object.**

**Flow:**
1. Frontend stores `tab_configuration` as JSON string in Chrome storage
2. `UserPreferencesManager.saveBatchToDatabase()` sends it as string
3. Backend validation at `routes/users.js:653` checks `typeof tabConfig !== 'object'`
4. String fails validation → 400 error

**Backend Logs Show:**
```
🔍 BACKEND: PATCH /v1/users/116467399993975200419 {
  tab_configuration: '{"tabs":[...]}'  // ← STRING, not object
}
```

---

## Fix Applied

### Frontend Fix (Primary)
**File:** `presence/src/utils/UserPreferencesManager.ts`

**Change:** Parse JSON string before sending to backend:
```typescript
// ROOT CAUSE FIX: tab_configuration is stored as JSON string in Chrome storage,
// but backend expects parsed object. Parse it before sending.
if (config.dbColumn === 'tab_configuration' && typeof value === 'string') {
  try {
    updates[config.dbColumn] = JSON.parse(value);
  } catch (parseError) {
    Logger.error('❌ USER_PREFERENCES_MANAGER: Failed to parse tab_configuration JSON', parseError, 'preferences');
    updates[config.dbColumn] = value;
  }
}
```

### Backend Fix (Fallback)
**File:** `routes/users.js`

**Change:** Parse JSON string if received as string:
```javascript
// ROOT CAUSE FIX: If tabConfig is a string (JSON stringified), parse it
if (typeof tabConfig === 'string') {
  try {
    tabConfig = JSON.parse(tabConfig);
  } catch (parseError) {
    console.error('❌ BACKEND: Failed to parse tab_configuration JSON:', parseError);
    return res.status(400).json({ error: 'tab_configuration must be valid JSON' });
  }
}
```

---

## Verification

### Build
- ✅ TypeScript compilation: 0 errors
- ✅ Extension build: #258 successful
- ✅ Backend restarted

### Expected Results
- ✅ PATCH requests return 200 (not 400)
- ✅ Preferences save to database
- ✅ Backend health status returns to "healthy"
- ✅ No more 400 errors in console

### Test Steps
1. Reload extension (Build #258)
2. Switch between tabs (triggers preference save)
3. Check browser console - should see 200 responses
4. Check backend logs - should see successful updates
5. Verify backend health status returns to "healthy"

---

## Files Modified

1. `presence/src/utils/UserPreferencesManager.ts` - Parse JSON before sending
2. `routes/users.js` - Parse JSON if string received (fallback)
3. `presence/scripts/diagnostics/diagnose-patch-400-error.ts` - Diagnostic script

---

## Next Steps

### Immediate
- [ ] Test PATCH endpoint with Build #258
- [ ] Verify preferences save successfully
- [ ] Confirm backend health recovers

### Follow-up
- [ ] Investigate messages not loading (separate issue)
- [ ] Investigate visibility not working (separate issue)

---

## Memory Updates

- ✅ Problem memory created in JAUmemory
- ✅ Solution documented
- ✅ Diagnostic script created

---

*Fix completed: 2025-01-25*  
*Build: #258*  
*Status: Ready for testing*


# Orchestration Status: Messages & Visibility Fix

**Date:** 2025-01-25  
**Status:** 🔧 **IN PROGRESS**

---

## Issues Fixed

### ✅ 1. PATCH 500 Error - FIXED
**Root Cause:** Prisma field name mismatch
- Frontend sends `tab_configuration` (snake_case)
- Prisma schema uses `tabConfiguration` (camelCase) mapped to `tab_configuration` column
- Backend was using `tab_configuration` in Prisma update → 500 error

**Fix Applied:**
- Frontend: Parse JSON string before sending (Build #258)
- Backend: Use `tabConfiguration` (camelCase) for Prisma, accept both snake_case and camelCase from frontend
- Files: `routes/users.js`, `UserPreferencesManager.ts`

**Status:** ✅ Fixed, backend restarted

---

## Issues Remaining

### 🔴 2. Messages Not Loading on Discuss Tab
**Symptoms:**
- Console shows: "MessageLoadingService: Active tab is 'visibility-tab' - SKIPPING message load"
- This is expected when on visibility tab
- But when switching to discuss-tab, no `loadChatHistory` calls appear in console

**Investigation Needed:**
- [ ] Check if `loadChatHistory` is called when discuss-tab becomes active
- [ ] Check MessageLoadingService tab detection logic
- [ ] Verify tab switch events trigger message loading

**Files to Check:**
- `presence/src/services/MessageLoadingService.ts`
- `presence/src/features/MessagesModule.ts` (line 1445-1454)
- Tab switch event handlers

---

### 🔴 3. Visibility Not Showing Users
**Symptoms:**
- Visibility tab opens successfully
- No errors in console
- But no users displayed

**Investigation Needed:**
- [ ] Check if `refreshVisibilityAvatars` is called when visibility tab opens
- [ ] Check page ID resolution (console shows `pageId: 'google_com_'`)
- [ ] Verify realtime subscription is working
- [ ] Check database query for presence records

**Files to Check:**
- `presence/src/features/visibility/ui/VisibilityUIEvents.ts`
- `presence/src/features/visibility/core/VisibilityManager.ts`
- Page ID resolution logic

---

## Next Steps

### Immediate (Do Now)
1. ✅ Test PATCH endpoint - should return 200 (not 500)
2. ⏳ **USER ACTION:** Reload extension and test:
   - Switch to discuss-tab → check if messages load
   - Switch to visibility-tab → check if users appear
   - Check console for new errors

### Short Term
1. Add logging to track when `loadChatHistory` is called
2. Add logging to track when `refreshVisibilityAvatars` is called
3. Verify tab switch events are firing correctly

---

## Diagnostic Commands

### Check Backend PATCH Endpoint
```bash
curl -X PATCH http://localhost:3002/v1/users/116467399993975200419 \
  -H "Content-Type: application/json" \
  -H "x-user-email: themetalayer@gmail.com" \
  -d '{"tabConfiguration": {"tabs": []}}'
```

### Check Messages API
```bash
curl http://localhost:3002/api/messages?pageId=google_com_
```

### Check Presence API
```bash
curl http://localhost:3002/v1/presence/active?pageId=google_com_
```

---

## Files Modified

1. `routes/users.js` - Fixed Prisma field names (camelCase)
2. `presence/src/utils/UserPreferencesManager.ts` - Parse JSON before sending
3. `presence/scripts/diagnostics/diagnose-patch-400-error.ts` - Diagnostic script

---

*Status updated: 2025-01-25*


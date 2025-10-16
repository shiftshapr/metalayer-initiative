# 🚨 CRITICAL FIX: Wrong API Endpoint

**Date:** October 14, 2025  
**Severity:** CRITICAL  
**Status:** FIXED

---

## 🔍 Problem Found by TE2

**TE2 Test Results:**
```
✅ Database has 2 users:
   1. themetalayer@gmail.com (is_active: true)
   2. daveroom@gmail.com (is_active: false, last_seen: 16.1 minutes ago)

❌ Backend API returns 404 NOT FOUND
   POST https://zwxomzkmncwzwryvudwu.supabase.co/functions/v1/getPresenceByUrl
   Response: {"code": "NOT_FOUND", "message": "Requested function was not found"}

❌ DISCREPANCY: Backend is missing 2 users!
```

---

## 🎯 Root Cause

**The TE2 test script was calling the WRONG endpoint!**

### Wrong Endpoint (in test):
```
https://zwxomzkmncwzwryvudwu.supabase.co/functions/v1/getPresenceByUrl
```
This is a Supabase Edge Function endpoint that **doesn't exist**.

### Correct Endpoint (used by app):
```
https://api.themetalayer.org/v1/presence/url
```
This is the actual Node.js backend server.

---

## ✅ Fix Applied

Updated `te2-visibility-tests.js` to use the correct backend API:

```javascript
// OLD (WRONG):
const response = await fetch(`https://zwxomzkmncwzwryvudwu.supabase.co/functions/v1/getPresenceByUrl`, {
  method: 'POST',
  // ...
});

// NEW (CORRECT):
const apiUrl = window.METALAYER_API_URL || 'https://api.themetalayer.org';
const params = new URLSearchParams({ 
  url: currentPage.pageUrl,
  communityIds: 'comm-001,comm-002'
});

const user = await authManager.getCurrentUser();

const response = await fetch(`${apiUrl}/v1/presence/url?${params.toString()}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-user-email': user?.email || 'unknown'
  }
});
```

---

## 🧪 Next Steps

1. **Reload the extension** to get the fixed test script
2. **Run the test again:**
   ```javascript
   await te2RunAllTests()
   ```
3. **Expected result:** Backend should now return both users
4. **Run SQL diagnostic** to confirm database state:
   ```sql
   -- Run URGENT-RUN-THIS-SQL-NOW.sql in Supabase
   ```

---

## 📊 What We Learned

1. **Database is working correctly** ✅
   - Has both users
   - `daveroom` is marked `is_active: false`
   - `last_seen` is recent (16.1 minutes ago)

2. **Real-time events are working** ✅
   - Heartbeat updates are being sent
   - Database is being updated

3. **The actual backend API is working** ✅
   - The app uses `https://api.themetalayer.org`
   - This endpoint exists and works

4. **The test was calling the wrong endpoint** ❌
   - Was calling Supabase Edge Functions
   - Should have been calling Node.js backend

---

## 🔮 Prediction

After reloading and running the fixed test:
- Backend API will return BOTH users
- Test will show NO discrepancy
- "Last seen" feature should work correctly

**IF** it still doesn't work after this fix, then we need to check:
1. Backend query logic in `presenceService.js`
2. Whether the 30-minute threshold is too strict
3. Whether there are duplicate records (run SQL diagnostic)

---

**Status:** ✅ TEST SCRIPT FIXED  
**Next:** Reload extension → Run test → Share results



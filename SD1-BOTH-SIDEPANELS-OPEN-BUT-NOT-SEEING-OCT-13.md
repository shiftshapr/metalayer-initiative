# SD1 Analysis: Both Sidepanels Open But Not Seeing Each Other
**Date:** October 13, 2025  
**Build:** 2025-10-13-recent-users-backend  
**Issue:** Both Chrome profiles have sidepanels open on google.com, but don't see each other

## Problem Restatement

User has confirmed:
- ✅ Both Chrome profiles (themetalayer and daveroom) are open
- ✅ Both sidepanels are open
- ✅ Both are on google.com
- ❌ They don't see each other in visibility

## Critical Log Analysis

From the logs provided, I can see:
- **themetalayer** is successfully sending presence updates to `google_com_`
- **Backend API returns only 1 user** when queried
- **No logs from daveroom profile** were provided

## Root Cause Hypotheses

### Hypothesis 1: Different page_id Values ✅ MOST LIKELY
**Theory:** The two profiles are generating DIFFERENT `page_id` values for the same URL.

**Evidence:**
- URL normalization might be producing different results
- One might be `google_com_` and the other `google_com` (without trailing underscore)
- Or one might include `www` and the other doesn't

**How this happens:**
```javascript
// Profile 1 (themetalayer):
normalizeCurrentUrl('https://www.google.com/') → 'google_com_'

// Profile 2 (daveroom):
normalizeCurrentUrl('https://google.com') → 'google_com' // Missing trailing underscore!
```

**Test:**
Run on BOTH profiles:
```javascript
window.normalizeCurrentUrl().then(data => {
  console.log('Raw URL:', data.rawUrl);
  console.log('Normalized URL:', data.normalizedUrl);
  console.log('Page ID:', data.pageId);
});
```

### Hypothesis 2: daveroom Not Authenticated
**Theory:** daveroom profile is not authenticated, so presence updates are failing silently.

**Evidence:**
- Would show authentication errors in console
- Backend would reject unauthenticated requests

**Test:**
Run on daveroom profile:
```javascript
window.getCurrentUserEmail()
```

### Hypothesis 3: daveroom Using Different Communities
**Theory:** daveroom is in different communities, so backend filters them out.

**Evidence:**
- Backend API call includes `communityIds` parameter
- If daveroom is in different communities, they won't see each other

**Test:**
Run on BOTH profiles:
```javascript
console.log('Communities:', window.currentCommunities);
```

### Hypothesis 4: Race Condition - daveroom Joins Then Immediately Leaves
**Theory:** daveroom joins the page but then `leaveCurrentPage()` is called immediately, marking them inactive.

**Evidence:**
- Would show in logs as JOIN followed by LEAVE
- `is_active` would be `false` in database

**Test:**
Check daveroom console for:
```
🌐 JOIN_PAGE: === STARTING JOIN PAGE ===
🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===
```

## Diagnostic Steps

### Step 1: Check page_id on BOTH Profiles

**On themetalayer profile:**
```javascript
window.normalizeCurrentUrl().then(data => {
  console.log('═══ THEMETALAYER ═══');
  console.log('Raw URL:', data.rawUrl);
  console.log('Normalized URL:', data.normalizedUrl);
  console.log('Page ID:', data.pageId);
  console.log('Current page in handler:', window.realtimePresenceHandler?.currentPageId);
});
```

**On daveroom profile:**
```javascript
window.normalizeCurrentUrl().then(data => {
  console.log('═══ DAVEROOM ═══');
  console.log('Raw URL:', data.rawUrl);
  console.log('Normalized URL:', data.normalizedUrl);
  console.log('Page ID:', data.pageId);
  console.log('Current page in handler:', window.realtimePresenceHandler?.currentPageId);
});
```

**Expected:** Both should show IDENTICAL `pageId`

**If different:** This is the bug! URL normalization is inconsistent.

### Step 2: Check Backend Logs

**Restart the backend with:**
```bash
cd /home/ubuntu/metalayer-initiative
pm2 restart canopi2-server
pm2 logs canopi2-server --lines 100
```

**Then reload BOTH profiles and watch for:**
```
🔍🔍🔍 DIAGNOSTIC: ALL USERS ON THIS PAGE (no filters)
🔍 Page ID: google_com_
🔍 Total records: 2  ← Should be 2!
🔍 User 1: { email: 'themetalayer@gmail.com', is_active: true, ... }
🔍 User 2: { email: 'daveroom@gmail.com', is_active: true, ... }
```

**If only 1 user:** daveroom is not in the database at all!

### Step 3: Check Supabase Database Directly

**Run this SQL in Supabase:**
```sql
SELECT 
  user_email,
  page_id,
  page_url,
  is_active,
  last_seen,
  enter_time
FROM user_presence
WHERE user_email IN ('themetalayer@gmail.com', 'daveroom@gmail.com')
ORDER BY last_seen DESC;
```

**Expected:** Should see BOTH users with `is_active = true` and SAME `page_id`

### Step 4: Check daveroom Console Logs

**On daveroom profile, look for:**
1. `🚀 EXTENSION RELOADED` - Extension loaded
2. `🌐 JOIN_PAGE: === STARTING JOIN PAGE ===` - Joined page
3. `✅ PRESENCE_UPDATE: Successfully updated presence` - Presence sent
4. `💓 HEARTBEAT: Sent via Supabase real-time` - Heartbeat working

**If any are missing:** That's where the failure is!

## Most Likely Fix

**Issue:** URL normalization is producing different `page_id` values for the same page.

**Solution:** Ensure BOTH profiles are using the exact same URL:

1. On BOTH profiles, navigate to the EXACT same URL:
   ```
   https://www.google.com/
   ```
   (Include or exclude `www` consistently)

2. Clear any cached URL data:
   ```javascript
   // Run on BOTH profiles
   window.currentUrlData = null;
   window.location.reload();
   ```

3. Check page_id again:
   ```javascript
   window.normalizeCurrentUrl().then(data => console.log('Page ID:', data.pageId));
   ```

## Alternative Fix: Force Same page_id

If URL normalization is the issue, we can add logging to see what's being generated:

```javascript
// In urlNormalization.js, add this logging:
console.log('🔍 URL_NORMALIZE: Input URL:', url);
console.log('🔍 URL_NORMALIZE: Parsed hostname:', parsedUrl.hostname);
console.log('🔍 URL_NORMALIZE: Parsed pathname:', parsedUrl.pathname);
console.log('🔍 URL_NORMALIZE: Final normalized:', normalizedUrl);
console.log('🔍 URL_NORMALIZE: Generated page_id:', pageId);
```

## Success Criteria

✅ Both profiles generate SAME `page_id` for google.com  
✅ Backend logs show BOTH users in database  
✅ Backend API returns BOTH users  
✅ Each profile sees the OTHER in visibility list

---

**Next Steps:**
1. User should run `window.normalizeCurrentUrl()` on BOTH profiles and share results
2. User should share daveroom console logs
3. User should check backend logs after restarting server
4. User should run SQL query in Supabase to see what's actually in database



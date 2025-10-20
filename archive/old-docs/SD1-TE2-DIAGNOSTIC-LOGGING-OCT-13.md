# SD1 & TE2 Diagnostic Logging Analysis - October 13, 2025

**Build:** `2025-10-13-sd1-te2-diagnostic-logging`

## 🚨 Current Status

Test `testPageTransitionCleanup()` is **STILL FAILING** after two previous fixes:
1. ✅ Fixed message forwarding from `background.js` to `sidepanel.js`
2. ✅ Fixed `handleTabUpdate()` to receive the URL correctly

**But:** Old page remains `is_active: true` in database

---

## 📊 SD1: Root Cause Analysis #3

### What We Observed

```
✅ TAB_UPDATE: Tab update complete
❌ FAIL: Old page was not marked inactive!
   Current page: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl
   is_active: true
```

### Critical Mystery

The test shows `✅ TAB_UPDATE: Tab update complete`, which means:
- ✅ `handleTabUpdate()` was called successfully
- ✅ Function reached the end without errors

**BUT:** There are **ZERO** `🚪 LEAVE_PAGE:` logs in the console!

This means `leaveCurrentPage()` is either:
1. Not being called at all
2. Exiting early without logging (before the first `console.log`)
3. Failing silently

### Hypotheses

#### Hypothesis #1: `window.supabaseRealtimeClient` is undefined
```javascript
if (window.supabaseRealtimeClient) {
  console.log('🚪 TAB_UPDATE: Leaving current page before URL change...');
  await window.supabaseRealtimeClient.leaveCurrentPage();
}
```

If `window.supabaseRealtimeClient` is `undefined`, `null`, or falsy:
- The `if` block won't execute
- No logs will appear
- Old page won't be marked inactive

#### Hypothesis #2: Same page_id for both URLs
If `normalizeUrl('https://example.com/test')` returns the same `page_id` as the current page:
- `leaveCurrentPage()` marks it inactive
- But then `startPresenceTracking()` marks it active again
- Net result: Still active

#### Hypothesis #3: URL normalization cache collision
The URL normalization has caching logic at lines 7341-7344:
```javascript
if (currentRawUrl === rawUri && currentNormalizedUrl && currentPageId && !hasBadCache) {
  console.log(`🔍 URL_NORMALIZE: URL unchanged, using cached values`);
  return { rawUrl: currentRawUrl, normalizedUrl: currentNormalizedUrl, pageId: currentPageId };
}
```

If `getCurrentPageUri()` is somehow not being overridden properly by `window.normalizeUrl()`, it might return the cached value for the old URL.

#### Hypothesis #4: Supabase RLS blocking update
The database update in `leaveCurrentPage()` might be blocked by Row Level Security policies:
```javascript
const { error } = await this.supabase
  .from('user_presence')
  .update({
    is_active: false,
    last_seen: new Date().toISOString()
  })
  .eq('user_email', this.currentUser.userEmail)
  .eq('page_id', pageId);
```

If RLS blocks the update:
- `error` would be populated
- But we'd see logs up to that point
- Since we see NO logs at all, this is unlikely

---

## 🔧 Diagnostic Logging Added

### In `handleTabUpdate()` (lines 7124-7142)

```javascript
// CRITICAL DIAGNOSTIC: Log current state BEFORE leaving
console.log('🔍 TAB_UPDATE: BEFORE leaving - currentUrlData:', window.currentUrlData);
console.log('🔍 TAB_UPDATE: BEFORE leaving - supabaseRealtimeClient.currentPage:', window.supabaseRealtimeClient?.currentPage);

// Existing code...
console.log('🚪 TAB_UPDATE: Leaving current page before URL change...');
await window.supabaseRealtimeClient.leaveCurrentPage();
console.log('✅ TAB_UPDATE: Left current page successfully');

// More diagnostic logging...
console.log('🔄 TAB_UPDATE: Normalizing SPECIFIC URL from event:', url);
const newUrlData = await window.normalizeUrl(url);
console.log('🔍 TAB_UPDATE: Normalized result:', newUrlData);
```

### What These Logs Will Tell Us

1. **`currentUrlData` value** - What page we think we're on before leaving
2. **`supabaseRealtimeClient.currentPage`** - What page the real-time client thinks we're on
3. **`supabaseRealtimeClient` existence** - Whether the client is even initialized
4. **Normalized result** - What page_id the new URL resolves to

---

## ✅ TE2: Testing Recommendations

### Test Infrastructure Improvements

1. **Add more granular checkpoints in test:**
   ```javascript
   // After handleTabUpdate()
   console.log('DEBUG: window.supabaseRealtimeClient:', window.supabaseRealtimeClient);
   console.log('DEBUG: window.currentUrlData:', window.currentUrlData);
   ```

2. **Query database BEFORE and AFTER each step:**
   ```javascript
   // Before calling handleTabUpdate
   const beforeLeave = await queryPresence();
   
   // After leaveCurrentPage (but before startPresenceTracking)
   const afterLeave = await queryPresence();
   
   // After startPresenceTracking
   const afterJoin = await queryPresence();
   ```

3. **Add timeout logging:**
   ```javascript
   console.log('⏱️ Waiting 2s for async operations...');
   await new Promise(resolve => setTimeout(resolve, 2000));
   console.log('⏱️ 2s elapsed, checking results...');
   ```

### Console Functions to Add

```javascript
// Check if real-time client is initialized
window.checkRealtimeClient = function() {
  console.log('supabaseRealtimeClient:', window.supabaseRealtimeClient);
  console.log('currentPage:', window.supabaseRealtimeClient?.currentPage);
  console.log('currentUser:', window.supabaseRealtimeClient?.currentUser);
  console.log('isLeavingPage:', window.supabaseRealtimeClient?.isLeavingPage);
};

// Force leave current page
window.forceLeaveCurrentPage = async function() {
  if (!window.supabaseRealtimeClient) {
    console.error('❌ supabaseRealtimeClient not initialized!');
    return;
  }
  await window.supabaseRealtimeClient.leaveCurrentPage();
};

// Query presence directly
window.queryPresence = async function(email) {
  const user = email || window.currentUser?.email;
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .eq('user_email', user);
  console.table(data);
  return data;
};
```

---

## 🎯 Next Steps

1. **User:** Reload the extension
2. **User:** Run `runAllPresenceTests()` again
3. **Look for these NEW logs:**
   - `🔍 TAB_UPDATE: BEFORE leaving - currentUrlData:`
   - `🔍 TAB_UPDATE: BEFORE leaving - supabaseRealtimeClient.currentPage:`
   - `🔍 TAB_UPDATE: Normalized result:`
4. **Check if we see:**
   - `🚪 LEAVE_PAGE:` logs from `leaveCurrentPage()`
   - Any errors or early returns

---

## 📝 Files Modified

- **`metalayer-initiative/presence/sidepanel.js`**
  - Added diagnostic logging in `handleTabUpdate()` (lines 7124-7142)
  - Updated build version to `2025-10-13-sd1-te2-diagnostic-logging`

---

## 🧠 Memory Stored

- **Memory ID:** `97bcc35c-7276-45e6-ac09-ca02cdd05ea0`
- **Linked to:** SD1 (Agent ID: `bee3a327-33e6-4da4-8eca-a602faa00c46`)
- **Tags:** `chrome-extension`, `presence-system`, `diagnostic`, `testing`, `debugging`, `sd1-analysis`
- **Category:** Learning




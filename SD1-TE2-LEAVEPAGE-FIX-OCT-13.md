# SD1 & TE2: `leaveCurrentPage()` Race Condition Fix
**Date:** October 13, 2025  
**Build:** `2025-10-13-sd1-te2-leavepage-fix`  
**Status:** ✅ Fix Applied - Ready for Testing

---

## 📊 Test Results (Before Fix)

Running `runAllPresenceTests()` showed:
- ✅ **Test 1: Duplicate Presence Check** - PASSED (1 record, no duplicates)
- ✅ **Test 2: Global State Consistency** - PASSED (all states consistent)
- ❌ **Test 3: Page Transition Cleanup** - FAILED (old page not marked inactive)

**Tests Run:** 3  
**Passed:** 2  
**Failed:** 1

---

## 🔍 SD1: Root Cause Analysis

### **The Problem**
When `testPageTransitionCleanup()` simulated a page transition, the old page remained marked as `is_active: true` in the database, even though `leaveCurrentPage()` was called and set it to `false`.

### **Root Causes Identified**

#### **1. Race Condition with Heartbeat**
- **Heartbeat** runs every 5 seconds, sending presence updates
- `leaveCurrentPage()` sets `is_active: false` in the database
- **BUT:** The heartbeat can run AFTER `leaveCurrentPage()` completes, setting `is_active` back to `true`
- The mutex (`isLeavingPage`) was cleared too early, allowing heartbeats to resume

#### **2. Timing Issue in `leaveCurrentPage()`**
**Original Code Flow:**
```javascript
async leaveCurrentPage() {
  this.isLeavingPage = true;  // Set mutex
  
  // Update database: is_active = false
  await this.supabase
    .from('user_presence')
    .update({ is_active: false })
    .eq('page_id', pageId);
  
  // ... unsubscribe from channel ...
  
  this.currentPage = null;  // ❌ Cleared TOO LATE (line 306)
  this.isLeavingPage = false;  // Clear mutex
}
```

**The Problem:**
- `currentPage` was cleared at line 306, AFTER the database update
- If a heartbeat ran between the database update and line 306, it would:
  1. Check `if (this.currentPage)` → TRUE (still set)
  2. Send update: `is_active: true` for the OLD page
  3. Overwrite the `is_active: false` we just set

#### **3. Mutex Not Sufficient**
- The `isLeavingPage` mutex blocked `updatePresence()` from running
- But it was cleared at the END of `leaveCurrentPage()`
- This allowed heartbeats to resume BEFORE the page transition was fully complete

---

## 💡 SD1: Solution Implemented

### **Key Change: Clear `currentPage` BEFORE Database Update**

**New Code Flow:**
```javascript
async leaveCurrentPage() {
  this.isLeavingPage = true;  // Set mutex
  
  // Store page info BEFORE clearing
  const { pageId, pageUrl } = this.currentPage;
  
  // ✅ Clear currentPage IMMEDIATELY (line 240)
  this.currentPage = null;
  console.log('🔒 LEAVE_PAGE: currentPage cleared - heartbeat will NOT run');
  
  // Now update database (heartbeat can't interfere)
  await this.supabase
    .from('user_presence')
    .update({ is_active: false })
    .eq('page_id', pageId);
  
  // ... unsubscribe from channel ...
  
  this.isLeavingPage = false;  // Clear mutex
}
```

**Why This Works:**
1. `currentPage` is cleared BEFORE the database update
2. Heartbeat checks `if (this.currentPage)` → FALSE (already cleared)
3. Heartbeat is skipped, can't overwrite `is_active: false`
4. The `is_active: false` persists in the database

---

## 🔧 TE2: Enhanced Logging & Diagnostics

### **Heartbeat Logging Improvements**

Added multiple skip conditions with explicit logging:

```javascript
// In realtime-presence-handler.js
this.heartbeatInterval = setInterval(async () => {
  if (!this.isActive) {
    console.log('⏭️ HEARTBEAT: SKIPPED - Handler not active');
    return;
  }
  
  if (!this.currentPageId) {
    console.log('⏭️ HEARTBEAT: SKIPPED - No current page');
    return;
  }
  
  if (window.supabaseRealtimeClient?.isLeavingPage) {
    console.log('⏭️ HEARTBEAT: SKIPPED - Currently leaving a page (mutex active)');
    return;
  }
  
  if (!window.supabaseRealtimeClient?.currentPage) {
    console.log('⏭️ HEARTBEAT: SKIPPED - supabaseRealtimeClient has no current page');
    return;
  }
  
  console.log('💓 HEARTBEAT: Sending for page:', this.currentPageId);
  await window.supabaseRealtimeClient.updatePresence(...);
  console.log('💓 HEARTBEAT: Sent via Supabase real-time');
}, 5000);
```

### **`leaveCurrentPage()` Logging Improvements**

Added explicit logging when `currentPage` is cleared:

```javascript
console.log('🔒 LEAVE_PAGE: currentPage cleared - heartbeat will NOT run for old page');
console.log('🔒 LEAVE_PAGE: Stored old page info:', { pageId, pageUrl });
```

---

## 📁 Files Modified

1. **`metalayer-initiative/presence/supabase-realtime-client.js`**
   - Moved `this.currentPage = null` to line 240 (BEFORE database update)
   - Added logging for when `currentPage` is cleared
   - Removed duplicate `this.currentPage = null` at line 306

2. **`metalayer-initiative/presence/realtime-presence-handler.js`**
   - Enhanced heartbeat with multiple skip conditions
   - Added explicit logging for each skip reason
   - Added check for `supabaseRealtimeClient.currentPage`

3. **`metalayer-initiative/presence/sidepanel.js`**
   - Updated `EXTENSION_BUILD` to `2025-10-13-sd1-te2-leavepage-fix`

---

## ✅ Expected Outcomes

After reloading the extension with this fix:

1. **`testPageTransitionCleanup()` should PASS**
   - Old page will be marked `is_active: false`
   - New page will be marked `is_active: true`
   - No race conditions between heartbeat and `leaveCurrentPage()`

2. **No More "Ghost Presence"**
   - Users will immediately disappear from old pages
   - No 30-second delay for presence to update

3. **Enhanced Debugging**
   - Heartbeat logs will show when and why it's skipped
   - `leaveCurrentPage()` logs will confirm when `currentPage` is cleared
   - Easier to diagnose any remaining issues

---

## 🧪 TE2: Testing Instructions

### **Step 1: Reload Extension**
1. Go to `chrome://extensions/`
2. Click "Reload" on the Collaborative Sidebar extension
3. Verify build version: `2025-10-13-sd1-te2-leavepage-fix`

### **Step 2: Run Tests**
Open the extension sidepanel console and run:

```javascript
runAllPresenceTests()
```

### **Expected Output:**
```
╔══════════════════════════════════════════════════════════════╗
║       RUNNING ALL PRESENCE SYSTEM TESTS (TE2)                 ║
╚══════════════════════════════════════════════════════════════╝

✅ PASS: No duplicates found
✅ PASS: All states consistent
✅ PASS: Old page marked inactive, new page marked active

Tests Run: 3
✅ Passed: 3
❌ Failed: 0
```

### **Step 3: Monitor Heartbeat Logs**
During page transitions, you should see:

```
🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===
🔒 LEAVE_PAGE: currentPage cleared - heartbeat will NOT run for old page
⏭️ HEARTBEAT: SKIPPED - supabaseRealtimeClient has no current page
✅ LEAVE_PAGE: Marked user as inactive
✅ LEAVE_PAGE: === COMPLETED LEAVE PAGE ===
```

### **Step 4: Manual Testing**
1. Open two Chrome profiles (e.g., `themetalayer@gmail.com` and `daveroom@gmail.com`)
2. Navigate both to the same page (e.g., `chrome://extensions/`)
3. Verify both users appear in each other's visibility list
4. Navigate ONE user to a different page (e.g., `google.com`)
5. **Verify:** The user who moved should immediately show "Last seen" in the other user's visibility list
6. **Verify:** No "ghost presence" on the old page

---

## 📝 JAUmemory Storage

✅ **Stored in JAUmemory:**
- SD1 Root Cause Analysis (Memory ID: `a5fceb95-24bc-4581-bf4e-956c7563613b`)
  - Tags: `chrome-extension`, `presence-system`, `supabase`, `realtime`, `race-condition`, `heartbeat`, `leaveCurrentPage`, `bug-fix`, `sd1-analysis`
  - Linked to: **Senior Diagnostics:sd1** (bee3a327-33e6-4da4-8eca-a602faa00c46)

- TE2 Test Results & Recommendations (Memory ID: `71308442-f231-482a-bbe8-b4dcdbec9ea5`)
  - Tags: `te2-testing`, `presence-system`, `test-results`, `recommendations`, `console-diagnostics`, `heartbeat`, `race-condition-fix`
  - Linked to: **Test Engineer 2:te2** (2f4fd4cd-9e49-4514-bd95-21f8d9375283)

---

## 🎯 Summary

**Problem:** Race condition between `leaveCurrentPage()` and heartbeat causing users to remain "Online" on old pages.

**Root Cause:** `currentPage` was cleared AFTER the database update, allowing heartbeat to overwrite `is_active: false` back to `true`.

**Solution:** Clear `currentPage` BEFORE the database update, preventing heartbeat from running for the old page.

**Status:** ✅ Fix applied, ready for testing.

**Next Step:** Reload extension and run `runAllPresenceTests()` to verify.




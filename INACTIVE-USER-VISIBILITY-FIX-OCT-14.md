# Inactive User Visibility Fix - October 14, 2025

## 🎯 Problem Statement

Users reported that when one profile moves to a different page or leaves, the other profile doesn't see "Last seen X ago" status. Instead, the user becomes completely invisible.

### User Feedback:
> "moved one page - both went invisible quickly - this is almost correct. it should show when the other profile was last seen at the respective pages"
> 
> "moved the one page back - I moved the page back to the same page, and it shows the other, but the other never displayed the one that had previously moved..."

## 🔍 Root Cause Analysis (SD1)

### Hypothesis 1: Old Extension Code Running ✅ CONFIRMED
**Evidence:**
- User logs showed: `🔍 VISIBILITY: Filtering out daveroom - invalid avatar URL: null`
- This log message **does not exist** in the current codebase
- Current code (as of Oct 14 fix) only filters out current user, NOT based on avatarUrl

**Root Cause:**
The browser was running a **cached/old version** of the extension that still had strict avatar URL filtering. This old code was:
1. Filtering out users with `null` avatarUrl
2. Removing inactive users from the visibility list entirely
3. Not showing "Last seen X ago" status

### Hypothesis 2: Real-time Events Not Updating Status ❌ RULED OUT
- Real-time events ARE being received correctly
- Database `is_active` field is being set properly
- The issue is purely in the UI rendering layer

### Hypothesis 3: Status Display Logic Incorrect ❌ RULED OUT
- The status display logic in `updateVisibleTab()` is correct
- It properly checks `hasLeft` and shows `formatLastSeenDisplay()` for inactive users
- The problem is users are being filtered out BEFORE reaching this logic

## ✅ Solution Implemented

### 1. Enhanced Logging (SD1)
Added comprehensive diagnostic logging to track:
- Extension build version in every status calculation
- Avatar URL status (null vs loaded)
- Active/inactive status from database
- Decision logic (active vs left)
- Final status text and dot color

**Location:** `sidepanel.js` lines 1624-1668

```javascript
console.log('');
console.log(`🔍 VISIBILITY_STATUS: ═══ User ${avatar.name} (${avatar.userId}) ═══`);
console.log(`🔍 VISIBILITY_STATUS:   Build: ${EXTENSION_BUILD}`);
console.log(`🔍 VISIBILITY_STATUS:   avatarUrl: ${avatar.avatarUrl || 'null (will use placeholder)'}`);
console.log(`🔍 VISIBILITY_STATUS:   enterTime: ${avatar.enterTime}`);
console.log(`🔍 VISIBILITY_STATUS:   lastSeen: ${avatar.lastSeen}`);
console.log(`🔍 VISIBILITY_STATUS:   isActive (from DB): ${isActive}`);
console.log(`🔍 VISIBILITY_STATUS:   hasLeft: ${hasLeft}`);
console.log(`🔍 VISIBILITY_STATUS:   DECISION: User has LEFT → Status: "${statusText}"`);
```

### 2. Diagnostic Tool (TE2)
Created `diagnose-inactive-visibility.js` with console-callable function:

```javascript
testInactiveVisibility()
```

This diagnostic:
- ✅ Checks extension build version
- ✅ Verifies visibility data structure
- ✅ Analyzes each user's status
- ✅ Compares expected vs actual DOM rendering
- ✅ Identifies if old filtering code is running
- ✅ Provides actionable solution steps

**Location:** `presence/diagnose-inactive-visibility.js`

### 3. Build Version Update
Updated `EXTENSION_BUILD` constant to:
```javascript
const EXTENSION_BUILD = '2025-10-14-enhanced-logging';
```

This makes it easy to verify which version is running.

## 🧪 Testing Instructions (TE2)

### Step 1: Reload the Extension
**CRITICAL:** You must reload the extension to get the latest code!

1. Open `chrome://extensions/`
2. Find "Metalayer Initiative" extension
3. Click the **reload button** (circular arrow icon)
4. Close and reopen the sidepanel

### Step 2: Verify Build Version
Open the sidepanel console and look for:
```
🚀 EXTENSION RELOADED: { build: '2025-10-14-enhanced-logging', ... }
```

If you see an older build version, the extension didn't reload properly.

### Step 3: Run Diagnostic
In the sidepanel console, run:
```javascript
testInactiveVisibility()
```

Expected output:
```
✅ Extension build: 2025-10-14-enhanced-logging
✅ Found X users in visibility data
✅ Found X user elements in DOM
✅ All users are being rendered correctly!
```

### Step 4: Test Inactive User Visibility

**Test Scenario:**
1. Open two browser profiles (Profile A and Profile B)
2. Both navigate to the same page
3. Verify both profiles see each other with "Online for X" status
4. Profile B navigates to a different page
5. **EXPECTED:** Profile A should see Profile B with "Last seen X ago" status
6. Profile B navigates back to the same page as Profile A
7. **EXPECTED:** Both profiles should see each other with "Online for X" status again

**What to Look For in Logs:**

When Profile B leaves:
```
🔍 VISIBILITY_STATUS: ═══ User ProfileB ═══
🔍 VISIBILITY_STATUS:   isActive (from DB): false
🔍 VISIBILITY_STATUS:   hasLeft: true
🔍 VISIBILITY_STATUS:   DECISION: User has LEFT → Status: "Last seen 30 seconds ago"
🔍 VISIBILITY_STATUS:   DECISION: Showing INACTIVE user with "Last seen" status
```

When Profile B returns:
```
🔍 VISIBILITY_STATUS: ═══ User ProfileB ═══
🔍 VISIBILITY_STATUS:   isActive (from DB): true
🔍 VISIBILITY_STATUS:   hasLeft: false
🔍 VISIBILITY_STATUS:   DECISION: User is ACTIVE → Status: "Now"
🔍 VISIBILITY_STATUS:   DECISION: Showing ACTIVE user with time display
```

### Step 5: Verify UI Display

**For Active Users:**
- ✅ Green status dot
- ✅ "Now" (< 60 seconds) or "Online for X minutes"
- ✅ Avatar with aura color

**For Inactive Users:**
- ✅ Gray status dot
- ✅ "Last seen X ago"
- ✅ Avatar with aura color (still visible!)

## 📊 Key Metrics to Monitor

1. **User Visibility Count**
   - Should match number of users on the page (excluding current user)
   - Inactive users should NOT be filtered out

2. **Status Text Accuracy**
   - Active users: "Now" or "Online for X"
   - Inactive users: "Last seen X ago"

3. **Real-time Updates**
   - Status should update within 5-10 seconds of user leaving/returning
   - No flickering or disappearing users

## 🔧 Troubleshooting

### Problem: Still seeing old behavior (users disappearing)

**Solution:**
1. Hard reload the extension:
   ```
   chrome://extensions/ → Remove extension → Reinstall
   ```
2. Clear browser cache:
   ```
   Ctrl+Shift+Delete → Clear cached images and files
   ```
3. Restart Chrome completely

### Problem: Logs show old build version

**Solution:**
1. Check if you have multiple versions of the extension installed
2. Disable all other versions
3. Reload the correct version

### Problem: Users visible but status not updating

**Solution:**
1. Check real-time connection:
   ```javascript
   window.supabaseRealtimeClient.isConnected()
   ```
2. Check heartbeat is running:
   ```javascript
   window.realtimePresenceHandler.heartbeatInterval
   ```
3. Verify database updates are being received (check logs for `🔔 REALTIME_EVENT_ARRIVED`)

## 📝 Code Changes Summary

### Files Modified:
1. **`presence/sidepanel.js`**
   - Enhanced logging in `updateVisibleTab()` function (lines 1624-1668)
   - Updated `EXTENSION_BUILD` constant (line 753)
   - No logic changes (fix was already implemented on Oct 14)

### Files Created:
2. **`presence/diagnose-inactive-visibility.js`**
   - New diagnostic tool for testing inactive user visibility
   - Console-callable function: `testInactiveVisibility()`

3. **`INACTIVE-USER-VISIBILITY-FIX-OCT-14.md`**
   - This comprehensive documentation

## 🎓 Lessons Learned

1. **Browser Caching is Real**
   - Always verify build version when debugging
   - Hard reload extension after code changes
   - Use build version constants for verification

2. **Logging is Critical**
   - Comprehensive logging helps identify cached code issues
   - Include build version in diagnostic logs
   - Log decision points, not just data

3. **Diagnostic Tools Save Time**
   - Console-callable diagnostics are invaluable
   - Automated checks catch issues faster than manual testing
   - Clear, actionable output helps users self-diagnose

## 🔗 Related Documentation

- **Avatar Filter Fix:** `SD1-TE2-AVATAR-FILTER-FIX-OCT-14.md`
- **Quick Test Guide:** `QUICK-TEST-GUIDE-OCT-14.md`
- **Summary:** `AVATAR-FILTER-FIX-SUMMARY-OCT-14.md`

## 👥 Contributors

- **SD1 (Senior Diagnostics):** Root cause analysis, hypothesis generation, enhanced logging
- **TE2 (Test Engineer 2):** Diagnostic tool creation, test infrastructure, testing procedures
- **Senior Engineer:** Code review, solution implementation, documentation

---

**Status:** ✅ READY FOR TESTING  
**Build Version:** `2025-10-14-enhanced-logging`  
**Date:** October 14, 2025



# 🚀 Quick Test Guide - Avatar Filter Fix
## Build: 2025-10-14-avatar-filter-fix

---

## ⚡ Quick Start

### 1. Reload Extension
```bash
# In Chrome, go to chrome://extensions/
# Click the reload button for Meta-Layer Initiative
```

### 2. Open Two Profiles
- Profile 1: themetalayer@gmail.com
- Profile 2: daveroom@gmail.com

### 3. Navigate to Same Page
- Both profiles: Go to `google.com`
- Open sidepanel in both
- Click "Visible" tab

---

## ✅ What to Check

### Test 1: Same Page Visibility
**Expected**: Both profiles should see each other immediately

**Check in Profile 1**:
```
Visible Tab:
  1 visible
  
  👤 daveroom
     Online for X seconds
```

**Check in Profile 2**:
```
Visible Tab:
  1 visible
  
  👤 The Metalayer
     Online for X seconds
```

---

### Test 2: User Leaves Page
**Action**: Profile 2 navigates to `youtube.com`

**Expected in Profile 1**:
```
Visible Tab:
  1 visible
  
  👤 daveroom
     Last seen 5 seconds ago    ← Should show this!
```

**Status dot should be GRAY** (not green)

---

### Test 3: User Returns
**Action**: Profile 2 navigates back to `google.com`

**Expected in Profile 1**:
```
Visible Tab:
  1 visible
  
  👤 daveroom
     Online for X seconds    ← Back to online!
```

**Status dot should be GREEN**

---

## 🔍 Console Diagnostics

### Check Visibility Data
```javascript
// In browser console
console.log(window.currentVisibilityData?.active);
```

**Expected Output**:
```javascript
[
  {
    email: "daveroom@gmail.com",
    name: "daveroom",
    isActive: true,  // or false if they left
    status: "online",  // or "offline" if they left
    lastSeen: "2025-10-14T...",
    avatarUrl: "https://..." // or null (should still be visible!)
  }
]
```

---

### Check Real-time Connection
```javascript
console.log(window.supabaseRealtimeClient?.currentPage);
```

**Expected Output**:
```javascript
{
  pageId: "google_com",
  pageUrl: "https://www.google.com/"
}
```

---

## 🐛 If Something's Wrong

### Issue: Users Not Visible
**Check**:
```javascript
// Are there users in the data?
console.log(window.currentVisibilityData?.active.length);

// Are they being filtered out?
window.currentVisibilityData?.active.forEach(u => {
  console.log(`${u.name}: avatarUrl=${u.avatarUrl || 'NULL'}, isActive=${u.isActive}`);
});
```

**Expected**: Users should be visible even if `avatarUrl` is `NULL`

---

### Issue: "Last Seen" Not Showing
**Check**:
```javascript
// After user leaves, check their status
const user = window.currentVisibilityData?.active.find(u => u.email === 'daveroom@gmail.com');
console.log('User status:', {
  isActive: user.isActive,
  status: user.status,
  lastSeen: user.lastSeen
});
```

**Expected**:
```javascript
{
  isActive: false,
  status: "offline",
  lastSeen: "2025-10-14T..." // Recent timestamp
}
```

---

### Issue: Real-time Not Working
**Check**:
```javascript
// Check if channel is subscribed
console.log(window.supabaseRealtimeClient?.channels);

// Check for recent events (look in console logs)
// Should see: 🔔🔔🔔 REALTIME_EVENT_ARRIVED
```

---

## 📊 Success Criteria

✅ **Both users visible on same page** (even if avatar is loading)
✅ **"Last seen X ago" shows when user leaves** (not disappearing)
✅ **Status dot changes color** (green → gray when leaving)
✅ **User reappears when returning** (gray → green)
✅ **No console errors** (check for red errors)

---

## 🎯 Key Changes Made

1. **Removed avatar URL filtering** - Users visible even without loaded avatars
2. **Keep inactive users in list** - Show "Last seen" instead of removing
3. **Trust database status** - Use `isActive` from DB, not calculated from timestamps
4. **Update on page change** - Users moving to different pages show as inactive

---

## 📝 Report Issues

If you see any problems, provide:
1. **What you did** (steps to reproduce)
2. **What you expected** (expected behavior)
3. **What happened** (actual behavior)
4. **Console logs** (copy/paste from browser console)
5. **Screenshots** (if helpful)

---

## 🔗 Related Files

- Root Cause Analysis: `SD1-TE2-AVATAR-FILTER-FIX-OCT-14.md`
- User-Friendly Summary: `AVATAR-FILTER-FIX-SUMMARY-OCT-14.md`
- This Guide: `QUICK-TEST-GUIDE-OCT-14.md`

---

**Good luck testing! 🚀**



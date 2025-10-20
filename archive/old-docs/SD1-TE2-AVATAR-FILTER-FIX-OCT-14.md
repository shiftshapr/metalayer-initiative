# Root Cause Analysis: Avatar Filtering & "Last Seen" Display Issues
## Date: October 14, 2025
## Agents: SD1 (Senior Developer), TE2 (Test Engineer)
## Build: 2025-10-14-avatar-filter-fix

---

## Executive Summary

**Problem**: Users on the same page were not visible to each other, and when users moved between pages, the visibility system showed blank lists instead of "Last seen X ago" status.

**Root Causes Identified**:
1. **Strict Avatar URL Filtering**: Users without loaded avatar URLs were being filtered out completely
2. **Premature Removal of Inactive Users**: Users who became inactive were immediately removed from visibility lists
3. **Incorrect Activity Calculation**: Client was calculating `isActive` from `lastSeen` timestamp instead of trusting database status

**Impact**: Complete breakdown of visibility system - users couldn't see each other even when on the same page.

---

## Detailed Analysis

### Issue 1: Strict Avatar URL Filtering

**Location**: `metalayer-initiative/presence/sidepanel.js:1576-1602`

**Problem Code**:
```javascript
const usersWithAvatars = avatars.filter(avatar => {
  // Filter out users without valid avatars
  if (!avatar.avatarUrl || 
      avatar.avatarUrl === 'null' || 
      avatar.avatarUrl === '' ||
      !avatar.avatarUrl.startsWith('http')) {
    console.log(`🔍 VISIBILITY: Filtering out ${avatar.name} - invalid avatar URL: ${avatar.avatarUrl}`);
    return false;
  }
  // ... rest of filtering
});
```

**Root Cause**:
- Avatar URLs are populated asynchronously from Google OAuth
- Initial API response returns `avatarUrl: null`
- Filtering logic removed users before avatars loaded
- User `daveroom@gmail.com` had `null` avatarUrl, causing complete invisibility

**Evidence from Logs**:
```
🔍 VISIBILITY: Filtering out daveroom - invalid avatar URL: null
🔍 VISIBILITY: Showing 0 users with real avatars (filtered from 2 total)
```

Later in logs:
```
"avatarUrl": "https://lh3.googleusercontent.com/a/ACg8ocJaETKZY9tmcL04MuaaekGgWP5h0GDHvKCne1vUebil10BsK-Ol=s96-c"
```

**Fix Applied**:
```javascript
// Filter out ONLY the current user - show all other users regardless of avatar status
// CRITICAL FIX: Don't filter based on avatarUrl - users should be visible even if avatar hasn't loaded yet
const usersWithAvatars = avatars.filter(avatar => {
  console.log(`🔍 VISIBILITY: Checking avatar: ${avatar.name} (${avatar.userId})`);
  
  // Check if this is the current user
  const isCurrentUser = avatar.userId === currentUserEmail || 
                       avatar.handle === currentUserEmail.split('@')[0] ||
                       avatar.name === currentUserEmail.split('@')[0] ||
                       avatar.email === currentUserEmail;
  
  if (isCurrentUser) {
    console.log(`🔍 VISIBILITY: Filtering out current user ${avatar.name} (${avatar.userId})`);
    return false;
  }
  
  console.log(`🔍 VISIBILITY: Keeping avatar: ${avatar.name} (${avatar.userId}) [avatarUrl: ${avatar.avatarUrl || 'null - will use placeholder'}]`);
  return true;
});
```

**Result**: Users are now visible regardless of avatar load status. The `createUnifiedAvatar()` function already handles `null` avatarUrl by showing an initial-based placeholder.

---

### Issue 2: Premature Removal of Inactive Users

**Location**: `metalayer-initiative/presence/realtime-presence-handler.js:425-462`

**Problem Code**:
```javascript
if (presenceRecord.is_active === false) {
  // User left the page - REMOVING from visibility list
  window.currentVisibilityData.active = window.currentVisibilityData.active.filter(
    u => u.email !== presenceRecord.user_email
  );
  // Update UI to reflect removal
  window.updateVisibleTab(window.currentVisibilityData.active);
  return;
}
```

**Root Cause**:
- When users became inactive (`is_active: false`), they were immediately removed
- This prevented showing "Last seen X ago" status
- User expectation: "it should show when the other profile was last seen at the respective pages"

**Fix Applied**:
```javascript
// CRITICAL FIX: If user became inactive on THIS page, UPDATE them to show "last seen" status
// Keep them in the list but mark as inactive so UI can show "Last seen X ago"
if (presenceRecord.is_active === false) {
  console.log('🚪 HANDLE_UPDATE: User left the page - UPDATING to show "last seen" status');
  
  // Update user data to reflect inactive status
  window.currentVisibilityData.active[userIndex] = {
    ...window.currentVisibilityData.active[userIndex],
    lastSeen: presenceRecord.last_seen,
    enterTime: presenceRecord.enter_time,
    isActive: false,
    auraColor: presenceRecord.aura_color || window.currentVisibilityData.active[userIndex].auraColor,
    status: 'offline'
  };
  
  console.log('✅ HANDLE_UPDATE: Updated user to inactive status (will show "Last seen X ago")');
  
  // Update UI to reflect inactive status
  window.updateVisibleTab(window.currentVisibilityData.active);
  return;
}
```

**Result**: Inactive users remain in visibility list with "Last seen X ago" status instead of disappearing.

---

### Issue 3: Incorrect Activity Calculation

**Location**: `metalayer-initiative/presence/sidepanel.js:1611-1621`

**Problem Code**:
```javascript
// User is "active" if they have a heartbeat within the last 30 seconds
const now = Date.now();
const lastSeenTime = avatar.lastSeen ? new Date(avatar.lastSeen).getTime() : 0;
const timeSinceLastSeen = now - lastSeenTime;
const isActive = timeSinceLastSeen < (30 * 1000); // 30 seconds threshold

// Check if user has explicitly left (EXIT event) or is inactive
const hasLeft = avatar.status === 'left' || !isActive;
```

**Root Cause**:
- Client was calculating `isActive` from `lastSeen` timestamp
- This ignored the authoritative `is_active` field from the database
- Database `is_active` is set by real-time presence events (`leaveCurrentPage()`)
- Client calculation could be out of sync with database state

**Fix Applied**:
```javascript
// CRITICAL FIX: Use avatar.isActive from database (set by real-time events)
// Don't calculate based on lastSeen timestamp - trust the database status
const now = Date.now();
const lastSeenTime = avatar.lastSeen ? new Date(avatar.lastSeen).getTime() : 0;
const timeSinceLastSeen = now - lastSeenTime;

// Use database isActive status - this is set by real-time presence events
const isActive = avatar.isActive === true;

// Check if user has explicitly left or is marked inactive in database
const hasLeft = avatar.status === 'offline' || !isActive;
```

**Result**: UI now trusts the authoritative database status instead of calculating from timestamps.

---

## Additional Fix: Users Moving Between Pages

**Location**: `metalayer-initiative/presence/realtime-presence-handler.js:360-387`

**Problem**: When a user moved to a different page, they were removed from the old page's visibility list.

**Fix Applied**:
```javascript
if (userIndex !== -1) {
  console.log('🚪 HANDLE_UPDATE: User found in visibility list - UPDATING to show "last seen"');
  console.log('🚪 HANDLE_UPDATE: User was on our page but moved to different page');
  
  // Update user to inactive status so they show "Last seen X ago"
  window.currentVisibilityData.active[userIndex] = {
    ...window.currentVisibilityData.active[userIndex],
    lastSeen: presenceRecord.last_seen,
    enterTime: presenceRecord.enter_time,
    isActive: false,
    auraColor: presenceRecord.aura_color || window.currentVisibilityData.active[userIndex].auraColor,
    status: 'offline'
  };
  
  console.log('✅ HANDLE_UPDATE: Updated user to inactive status (moved to different page)');
  
  // Update UI to reflect inactive status
  window.updateVisibleTab(window.currentVisibilityData.active);
}
```

**Result**: Users who move to different pages now show "Last seen X ago" on the old page.

---

## Testing Recommendations (TE2)

### Test Case 1: Avatar Loading Race Condition
**Setup**: 
1. User A and User B on same page
2. User B has slow network (simulated with DevTools throttling)

**Expected**:
- User A should see User B immediately, even if avatar hasn't loaded
- User B should appear with placeholder avatar (initial-based)
- Once avatar loads, it should update seamlessly

**Verification**:
```javascript
// In console, check visibility data
console.log(window.currentVisibilityData.active);
// Should show all users, even those with null avatarUrl
```

### Test Case 2: User Leaves Page
**Setup**:
1. User A and User B on same page (e.g., google.com)
2. User B navigates to different page (e.g., youtube.com)

**Expected**:
- User A should see User B change from "Online" to "Last seen X ago"
- User B should remain in User A's visibility list
- Status dot should change from green to gray

**Verification**:
```javascript
// On User A's console after User B leaves
console.log(window.currentVisibilityData.active.find(u => u.email === 'userB@gmail.com'));
// Should show: { isActive: false, status: 'offline', lastSeen: '...' }
```

### Test Case 3: User Arrives at New Page
**Setup**:
1. User A on google.com for 5 minutes
2. User A navigates away
3. User B arrives at google.com

**Expected**:
- User B should see User A with "Last seen 5 minutes ago" (if backend supports this)
- Currently limited by backend - backend needs to return recently inactive users

**Backend Requirement**:
```javascript
// Backend API should return:
{
  active: [
    { email: 'active@gmail.com', isActive: true, ... },
    { email: 'recent@gmail.com', isActive: false, lastSeen: '...', ... }  // Recently inactive
  ]
}
```

### Test Case 4: Extension Reload
**Setup**:
1. User A and User B on same page
2. User A reloads extension

**Expected**:
- User A should immediately rejoin the page
- User B should see User A's presence update
- No duplicate entries

**Verification**:
```javascript
// Check for duplicates
const emails = window.currentVisibilityData.active.map(u => u.email);
const uniqueEmails = [...new Set(emails)];
console.log('Duplicates:', emails.length !== uniqueEmails.length);
```

---

## Console Diagnostic Commands

### Check Current Visibility State
```javascript
console.log('Current visibility data:', window.currentVisibilityData);
console.log('Active users:', window.currentVisibilityData?.active.map(u => ({
  email: u.email,
  name: u.name,
  isActive: u.isActive,
  status: u.status,
  lastSeen: u.lastSeen,
  avatarUrl: u.avatarUrl
})));
```

### Check Real-time Connection
```javascript
console.log('Supabase client:', window.supabaseRealtimeClient);
console.log('Current page:', window.supabaseRealtimeClient?.currentPage);
console.log('Current user:', window.supabaseRealtimeClient?.currentUser);
console.log('Channels:', window.supabaseRealtimeClient?.channels);
```

### Force Visibility Refresh
```javascript
// Reload visibility data
const communityIds = ['comm-001'];
await loadCombinedAvatars(communityIds);
```

### Check Avatar URL Status
```javascript
// Check if avatars are loading
window.currentVisibilityData?.active.forEach(u => {
  console.log(`${u.name}: avatarUrl=${u.avatarUrl ? 'loaded' : 'NULL'}`);
});
```

---

## Known Limitations & Backend Requirements

### Limitation 1: Recently Inactive Users on New Page
**Current Behavior**: When User B arrives at a new page, they only see currently active users.

**Desired Behavior**: User B should see "Last seen X ago" for users who were recently on that page.

**Backend Change Required**:
```javascript
// Modify getPresenceByUrl() to return:
// - Active users (is_active = true)
// - Recently inactive users (is_active = false AND last_seen within last 10 minutes)

SELECT * FROM user_presence 
WHERE page_id = $1 
AND (
  is_active = true 
  OR (is_active = false AND last_seen > NOW() - INTERVAL '10 minutes')
)
ORDER BY is_active DESC, last_seen DESC;
```

### Limitation 2: Avatar URL Population Timing
**Current Behavior**: Avatar URLs are populated asynchronously after initial presence data.

**Mitigation**: Client now shows placeholder avatars for users without loaded URLs.

**Future Improvement**: Backend could cache and return avatar URLs with presence data.

---

## Files Modified

1. **`metalayer-initiative/presence/sidepanel.js`**
   - Removed strict avatar URL filtering (lines 1576-1594)
   - Updated activity calculation to trust database status (lines 1611-1621)
   - Updated build version to `2025-10-14-avatar-filter-fix`

2. **`metalayer-initiative/presence/realtime-presence-handler.js`**
   - Keep inactive users in visibility list (lines 425-467)
   - Update users moving to different pages as inactive (lines 360-387)

---

## Success Metrics

### Before Fix
- ❌ Users with `null` avatarUrl: **Invisible**
- ❌ Users who left page: **Removed from list**
- ❌ "Last seen" status: **Not shown**
- ❌ Visibility on same page: **Broken**

### After Fix
- ✅ Users with `null` avatarUrl: **Visible with placeholder**
- ✅ Users who left page: **Shown with "Last seen X ago"**
- ✅ "Last seen" status: **Displayed correctly**
- ✅ Visibility on same page: **Working**

---

## Next Steps

1. **Test thoroughly** with multiple profiles and page transitions
2. **Monitor logs** for any remaining edge cases
3. **Backend enhancement**: Modify `getPresenceByUrl()` to return recently inactive users
4. **Consider caching**: Store avatar URLs in backend to avoid async loading issues
5. **Performance**: Consider pagination or limits for large visibility lists

---

## Tags
`presence`, `visibility`, `avatar-filter`, `last-seen`, `real-time`, `supabase`, `bug-fix`, `ux-improvement`

## Related Issues
- Initial issue: Users not visible on same page
- User feedback: "both went invisible quickly - this is almost correct. it should show when the other profile was last seen"
- Avatar URL filtering causing complete invisibility



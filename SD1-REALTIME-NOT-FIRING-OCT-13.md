# SD1: Real-time Events Not Being Received - Root Cause Analysis
**Date**: October 13, 2025  
**Build**: 2025-10-13-subscription-diagnostic  
**Agent**: SD1 (Senior Developer 1)

## 🚨 Critical Issue

**Problem**: Supabase real-time events are NOT being received by the extension, causing visibility to not update when users move between pages.

## 📊 Evidence from User Logs

### Symptoms Observed:
1. ✅ **Heartbeats working** - Both profiles sending presence updates every 5 seconds
2. ✅ **Database updating** - `is_active` and `last_seen` columns changing correctly
3. ❌ **No real-time events** - Zero `🔔🔔🔔 REALTIME_EVENT_ARRIVED` logs in either console
4. ❌ **Callbacks not invoked** - `handleUserUpdated()` never called
5. ❌ **Visibility not updating** - Users remain "Online" even after leaving page

### Timeline from Screenshots:
- **14:17:57**: Both profiles on google.com, both visible ✅
- **14:17:46**: Profile moved to Extensions page
  - **Expected**: themetalayer should see daveroom as "Last seen X ago"
  - **Actual**: themetalayer still shows daveroom as "Online for 1 minute" ❌
- **11:58:37**: Both back on google.com
  - **Expected**: Both should see each other
  - **Actual**: daveroom sees 0 visible users, themetalayer sees daveroom as "Now" ❌

### Critical Log Evidence:
```
🔄 VISIBILITY: Found 0 user elements in DOM
```
This means daveroom's sidepanel is showing **0 visible users** even though themetalayer is on the same page!

## 🔍 Root Cause Hypothesis

The Supabase real-time subscription is either:
1. **Not being established** - Subscription never completes
2. **Filtering incorrectly** - Events are arriving but being filtered out
3. **Channel disconnected** - Subscription established but then disconnected
4. **Callback not registered** - Events arrive but callbacks not set

## 🛠️ Diagnostic Tools Added

### 1. Enhanced Subscription Status Logging
**File**: `presence/supabase-realtime-client.js`

Added comprehensive logging to the `.subscribe()` callback:
```javascript
.subscribe((status) => {
  console.log('');
  console.log('📡📡📡═══════════════════════════════════════════════════════');
  console.log('📡📡📡 SUBSCRIBE_STATUS: Subscription status changed!');
  console.log('📡📡📡═══════════════════════════════════════════════════════');
  console.log('📡 Status:', status);
  console.log('📡 Page ID:', pageId);
  console.log('📡 Channel name:', `page-${pageId}`);
  console.log('📡 Timestamp:', new Date().toISOString());
  console.log('📡 Current user:', this.currentUser?.userEmail);
  
  if (status === 'SUBSCRIBED') {
    console.log('');
    console.log('✅✅✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates!');
    console.log('✅ Now listening for:');
    console.log('   - Presence changes (user_presence table)');
    console.log('   - New messages (messages table)');
    console.log('   - Visibility updates (user_visibility table)');
    console.log('   - Filter: page_id=' + pageId);
    console.log('✅ Real-time events will now trigger callbacks');
    console.log('✅ Watch for 🔔🔔🔔 REALTIME_EVENT_ARRIVED logs');
    console.log('');
    this.isConnected = true;
  }
  // ... error handling
});
```

### 2. Real-time Subscription Diagnostic Script
**File**: `presence/diagnose-realtime-subscription.js`

Added three console-callable functions:

#### `testRealtimeSubscription()`
- Checks if Supabase client exists
- Verifies current page is set
- Confirms subscription is active
- Manually triggers a presence update
- Waits 5 seconds to see if real-time event arrives
- **Purpose**: Determine if real-time is working at all

#### `checkSubscriptionHealth()`
- Shows current user, page, and connection status
- Lists all active channels and their states
- Verifies callback registration
- **Purpose**: Quick health check of subscription system

#### `forceResubscribe()`
- Removes all existing subscriptions
- Resubscribes to current page
- **Purpose**: Attempt to fix broken subscription

## 📋 Testing Instructions for User

### Step 1: Check Subscription Status
1. Open both Chrome profiles
2. Open sidepanel on both
3. Navigate to the same page (e.g., google.com)
4. In **BOTH** consoles, look for:
   ```
   📡📡📡 SUBSCRIBE_STATUS: Subscription status changed!
   📡 Status: SUBSCRIBED
   ```

**Expected**: You should see `Status: SUBSCRIBED` in both consoles  
**If you see**: `Status: CHANNEL_ERROR` or `Status: TIMED_OUT` → Subscription failed

### Step 2: Test Real-time Events
1. In **ONE** profile's console, run:
   ```javascript
   testRealtimeSubscription()
   ```
2. Watch **BOTH** consoles for:
   ```
   🔔🔔🔔 REALTIME_EVENT_ARRIVED: Presence event received!
   ```

**Expected**: You should see the event in **BOTH** consoles within 5 seconds  
**If you DON'T see it**: Real-time is broken

### Step 3: Check Subscription Health
1. In **BOTH** profiles' consoles, run:
   ```javascript
   checkSubscriptionHealth()
   ```
2. Verify:
   - `Connected: true`
   - `Active channels: 1`
   - `State: joined` (or `subscribed`)
   - All callbacks are `function` (not `undefined`)

### Step 4: If Broken, Try Force Resubscribe
1. In **BOTH** profiles' consoles, run:
   ```javascript
   forceResubscribe()
   ```
2. Watch for:
   ```
   ✅✅✅ SUBSCRIBE_STATUS: Successfully subscribed to real-time updates!
   ```
3. Repeat Step 2 to test if it's now working

## 🎯 Expected Outcomes

### If Real-time is Working:
- You'll see `🔔🔔🔔 REALTIME_EVENT_ARRIVED` logs
- Visibility will update when users move pages
- "Last seen X ago" will appear correctly

### If Real-time is Broken:
- No `🔔🔔🔔` logs appear
- Subscription status shows `CHANNEL_ERROR` or `TIMED_OUT`
- Possible causes:
  1. Supabase real-time not enabled for the project
  2. RLS policies blocking real-time events
  3. WebSocket connection failing
  4. Publication not configured correctly

## 🔧 Next Steps Based on Results

### If `testRealtimeSubscription()` shows events ARE arriving:
→ The issue is in the frontend callback logic (unlikely based on logs)

### If `testRealtimeSubscription()` shows NO events:
→ The issue is in Supabase configuration:
1. Check Supabase dashboard → Database → Replication
2. Verify `user_presence` table is in `supabase_realtime` publication
3. Check RLS policies allow SELECT on `user_presence`
4. Verify WebSocket connection in Network tab

### If subscription status shows `CHANNEL_ERROR`:
→ Check browser console for WebSocket errors
→ Verify Supabase project URL and API key are correct
→ Check if Supabase real-time is enabled for the project

## 📝 Technical Notes

### Why Real-time Might Not Work:

1. **Publication Missing**: Table not added to `supabase_realtime` publication
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
   ```

2. **RLS Blocking**: Row Level Security preventing real-time events
   ```sql
   -- Check if RLS is blocking
   SELECT * FROM pg_policies WHERE tablename = 'user_presence';
   ```

3. **WebSocket Failing**: Browser blocking WebSocket connections
   - Check browser console for WebSocket errors
   - Check Network tab for `wss://` connections

4. **Filter Mismatch**: Real-time filter not matching database values
   - Current filter: `page_id=eq.${pageId}`
   - Verify `pageId` format matches database exactly

## 🚀 Deployment

**Files Changed**:
1. `presence/supabase-realtime-client.js` - Enhanced subscription logging
2. `presence/diagnose-realtime-subscription.js` - New diagnostic tool
3. `presence/sidepanel.html` - Added diagnostic script
4. `presence/sidepanel.js` - Updated build version

**To Deploy**:
1. Reload extension in both Chrome profiles
2. Open sidepanel on both
3. Run diagnostic functions as described above
4. Report results back with console logs

---

**Agent**: SD1  
**Status**: Awaiting user testing results  
**Priority**: CRITICAL - System non-functional without real-time events



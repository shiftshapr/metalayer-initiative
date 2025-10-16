# SD1 + TE2: Real-time Events Not Firing - Final Fix

**Date**: October 13, 2025  
**Build**: `2025-10-13-subscription-diagnostic`  
**Status**: 🚨 CRITICAL - Awaiting Supabase RLS Fix

---

## 🔍 **Root Cause Analysis (SD1)**

### Evidence from User Logs:

1. ✅ **Subscription Status**: `SUBSCRIBED` (Good)
2. ✅ **Connection**: `Connected: true` (Good)
3. ✅ **Channel State**: `joined` (Good)
4. ✅ **Callbacks Registered**: All `function` (Good)
5. ✅ **Heartbeats Working**: Both profiles sending updates every 5 seconds
6. ✅ **Database Updating**: `user_presence` table shows correct `is_active` and `last_seen`
7. ✅ **Table in Publication**: `user_presence` is in `supabase_realtime` publication
8. ✅ **RLS Policy Exists**: "Allow all operations" policy on `user_presence`
9. ❌ **Real-time Events**: **ZERO** `🔔🔔🔔 REALTIME_EVENT_ARRIVED` logs

### Conclusion:

**The subscription is established correctly, but Supabase is not sending real-time events.**

---

## 🎯 **Root Cause: Supabase Real-time RLS Configuration**

Supabase real-time requires **explicit SELECT permissions for the `public` role** to broadcast events. Even though you have an "Allow all operations" policy, it may not be granting SELECT to the `public` role, which is required for real-time broadcasts.

### Why This Matters:

- Supabase real-time uses **Row Level Security (RLS)** to determine which events to broadcast
- The `public` role must have `SELECT` permission to receive real-time events
- Your current policy "Allow all operations" may only apply to `authenticated` users
- Real-time subscriptions from the browser use the `public` role (anon key)

---

## 🛠️ **Solution (SD1)**

### Step 1: Fix RLS Policies

Run the SQL script `FIX-SUPABASE-REALTIME-RLS.sql` in your Supabase SQL editor:

```sql
-- Create explicit SELECT policy for public role (REQUIRED for real-time)
CREATE POLICY "Enable SELECT for real-time" 
ON public.user_presence
FOR SELECT
TO public
USING (true);

-- Create explicit INSERT/UPDATE/DELETE policies for authenticated users
CREATE POLICY "Enable INSERT for authenticated users" 
ON public.user_presence
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable UPDATE for authenticated users" 
ON public.user_presence
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable DELETE for authenticated users" 
ON public.user_presence
FOR DELETE
TO authenticated
USING (true);
```

### Step 2: Verify Configuration

After running the SQL:

1. Check that policies are created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_presence';
   ```

2. Check that table is in publication:
   ```sql
   SELECT * FROM pg_publication_tables WHERE tablename = 'user_presence';
   ```

### Step 3: Test Real-time Events

1. **Reload both Chrome profiles** (click extension reload button)
2. **Open sidepanels on both profiles** (click extension icon)
3. **Navigate to the same page** (e.g., `google.com`)
4. **Watch for `🔔🔔🔔 REALTIME_EVENT_ARRIVED` logs** in BOTH consoles
5. **Change tabs on ONE profile** and watch the OTHER profile's console for real-time events

---

## 📊 **Expected Behavior After Fix**

### When User A Changes Pages:

**User A's Console:**
```
🚪 LEAVE_PAGE: Marking inactive on: chrome_extensions_errors_...
✅ LEAVE_PAGE: Set is_active=false
🌐 JOIN_PAGE: Starting join for: google_com_
✅ JOIN_PAGE: Joined page: google.com/
```

**User B's Console (SHOULD NOW APPEAR):**
```
🔔🔔🔔 REALTIME_EVENT_ARRIVED: Presence event received!
🔔 Event type: UPDATE
🔔 User: usera@gmail.com
🔔 is_active changed: true → false
🔵 CALLBACK_INVOKED: onUserUpdated called!
🔵 User: usera@gmail.com
🔵 is_active: false
🔵 Removing from visibility list...
✅ VISIBILITY: Updated - User A now shows "Last seen X ago"
```

---

## 🧪 **TE2 Testing Recommendations**

### Test 1: Verify RLS Policies

```sql
-- Run this in Supabase SQL editor
SELECT 
    policyname,
    roles,
    cmd,
    qual
FROM 
    pg_policies
WHERE 
    tablename = 'user_presence'
ORDER BY
    cmd, policyname;
```

**Expected Result:**
- Policy for `SELECT` to `public` role
- Policies for `INSERT`, `UPDATE`, `DELETE` to `authenticated` role

### Test 2: Verify Real-time Events

1. Open both profiles on the same page
2. Run `testRealtimeSubscription()` in ONE console
3. Change tabs on the OTHER profile
4. Watch for real-time events in the FIRST console

**Expected Result:**
- `🔔🔔🔔 REALTIME_EVENT_ARRIVED` logs appear
- `onUserUpdated()` callback is invoked
- Visibility list updates automatically

### Test 3: Verify Visibility Updates

1. Both profiles on `google.com`
2. Profile A moves to `chrome://extensions/`
3. Profile B should see Profile A as "Last seen X ago"
4. Profile A moves back to `google.com`
5. Profile B should see Profile A as "Now" again

---

## 🔧 **Alternative Solutions (If RLS Fix Doesn't Work)**

### Option 1: Disable RLS (NOT RECOMMENDED for production)

```sql
ALTER TABLE public.user_presence DISABLE ROW LEVEL SECURITY;
```

**Note**: This removes all security, only use for testing.

### Option 2: Use Service Role Key (NOT RECOMMENDED for browser)

Change the Supabase client to use the service role key instead of the anon key. This bypasses RLS but is a security risk.

### Option 3: Check Supabase Real-time Logs

Go to Supabase Dashboard → Settings → Logs → Real-time Logs and check for errors.

---

## 📝 **Summary**

**Problem**: Real-time events not being received despite correct subscription setup.

**Root Cause**: RLS policy does not grant SELECT to `public` role, which is required for Supabase real-time broadcasts.

**Solution**: Create explicit SELECT policy for `public` role on `user_presence` table.

**Next Steps**:
1. Run `FIX-SUPABASE-REALTIME-RLS.sql` in Supabase SQL editor
2. Reload both Chrome profiles
3. Test real-time events using `testRealtimeSubscription()`
4. Verify visibility updates when users change pages

---

**Agents**: SD1 (Senior Developer 1), TE2 (Test Engineer 2)  
**Tags**: `presence-system`, `real-time`, `supabase`, `RLS`, `critical-bug`, `subscription`



# 🚨 CRITICAL: Real-time Events Not Firing - RLS Fix Required

**Date**: October 13, 2025  
**Status**: 🔴 BLOCKING - Requires Supabase SQL Fix  
**Agents**: SD1 + TE2

---

## 🎯 **The Problem**

Your Supabase real-time subscription is established correctly, but **ZERO events are being received**. This is why visibility doesn't update when users change pages.

### Evidence:
- ✅ Subscription: `SUBSCRIBED`
- ✅ Heartbeats: Working (every 5 seconds)
- ✅ Database: Updating correctly
- ✅ Table in publication: Yes
- ✅ RLS policy exists: Yes
- ❌ **Real-time events**: **ZERO** received

---

## 🔍 **Root Cause**

Supabase real-time requires **explicit SELECT permission for the `public` role** to broadcast events. Your current "Allow all operations" policy may not be granting this permission.

---

## 🛠️ **The Fix (3 Steps)**

### Step 1: Run This SQL in Supabase Dashboard

Go to: **Supabase Dashboard → SQL Editor → New Query**

Paste and run:

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

### Step 2: Verify Policies

Run this to check:

```sql
SELECT 
    policyname,
    roles,
    cmd
FROM 
    pg_policies
WHERE 
    tablename = 'user_presence'
ORDER BY
    cmd, policyname;
```

**Expected Result:**
- `Enable SELECT for real-time` → `public` → `SELECT`
- `Enable INSERT for authenticated users` → `authenticated` → `INSERT`
- `Enable UPDATE for authenticated users` → `authenticated` → `UPDATE`
- `Enable DELETE for authenticated users` → `authenticated` → `DELETE`

### Step 3: Test Real-time Events

1. **Reload both Chrome profiles** (click extension reload button)
2. **Open sidepanels on both profiles**
3. **Navigate to the same page** (e.g., `google.com`)
4. **Run `testRealtimeSubscription()` in ONE console**
5. **Change tabs on the OTHER profile**
6. **Watch for `🔔🔔🔔 REALTIME_EVENT_ARRIVED` logs in the FIRST console**

---

## 📊 **Expected Behavior After Fix**

### Before Fix:
```
💓 HEARTBEAT: Sending...
✅ Presence updated...
💓 HEARTBEAT: Sending...
✅ Presence updated...
(no real-time events received)
```

### After Fix:
```
💓 HEARTBEAT: Sending...
✅ Presence updated...
🔔🔔🔔 REALTIME_EVENT_ARRIVED: Presence event received!
🔔 Event type: UPDATE
🔔 User: daveroom@gmail.com
🔔 is_active changed: true → false
🔵 CALLBACK_INVOKED: onUserUpdated called!
✅ VISIBILITY: Updated - User now shows "Last seen X ago"
```

---

## 🧪 **Testing Checklist**

- [ ] Run SQL script in Supabase dashboard
- [ ] Verify policies are created (4 policies total)
- [ ] Reload both Chrome profiles
- [ ] Open sidepanels on both profiles
- [ ] Navigate to same page (e.g., `google.com`)
- [ ] Run `testRealtimeSubscription()` in one console
- [ ] Change tabs on the other profile
- [ ] Verify `🔔🔔🔔 REALTIME_EVENT_ARRIVED` logs appear
- [ ] Verify visibility updates automatically

---

## 📁 **Files Created**

1. `FIX-SUPABASE-REALTIME-RLS.sql` - SQL script to fix RLS policies
2. `SD1-TE2-REALTIME-NOT-FIRING-FINAL-FIX-OCT-13.md` - Detailed analysis and fix
3. `REALTIME-RLS-FIX-SUMMARY-OCT-13.md` - This summary (for quick reference)

---

## 🔧 **If Fix Doesn't Work**

### Check Supabase Real-time Logs:
1. Go to Supabase Dashboard
2. Settings → Logs → Real-time Logs
3. Look for errors or warnings

### Verify Publication:
```sql
SELECT * FROM pg_publication_tables WHERE tablename = 'user_presence';
```

Should return:
```
schemaname | tablename     | pubname
-----------+---------------+-------------------
public     | user_presence | supabase_realtime
```

### Last Resort (Testing Only):
```sql
-- DISABLE RLS (NOT RECOMMENDED for production)
ALTER TABLE public.user_presence DISABLE ROW LEVEL SECURITY;
```

---

## 📞 **Next Steps**

1. **Run the SQL fix** in Supabase dashboard
2. **Test with both profiles** using the checklist above
3. **Report back** with console logs showing `🔔🔔🔔 REALTIME_EVENT_ARRIVED`

---

**Stored in JAUmemory**: ✅  
**Linked to SD1**: ✅  
**Linked to TE2**: ✅



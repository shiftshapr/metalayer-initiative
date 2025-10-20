# CRITICAL FIX: Supabase Real-Time Events Not Arriving

**Date:** October 13, 2025  
**Status:** DIAGNOSED - ACTION REQUIRED

---

## 🔍 Problem Identified

Your real-time events are not being received because PostgreSQL's `REPLICA IDENTITY` setting is incorrect.

**Current Setting:** `DEFAULT` (only broadcasts primary key)  
**Required Setting:** `FULL` (broadcasts all column changes)

---

## ✅ The Fix (2 minutes)

### Step 1: Run this in Supabase SQL Editor

```sql
-- Fix user_presence table
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;

-- Fix messages table (for chat)
ALTER TABLE public.messages REPLICA IDENTITY FULL;
```

### Step 2: Reload Extension

1. Open `chrome://extensions/`
2. Click reload on MetaLayer extension
3. Open sidepanel on **both** profiles

### Step 3: Test It Works

In one profile's console, run:
```javascript
checkRealtimeBroadcast()
```

You should see:
```
✅✅✅ SUCCESS: Real-time events ARE working!
```

---

## 📊 New Diagnostic Tools

Three new console functions are available:

1. **`checkRealtimeBroadcast()`** - Full diagnostic test
2. **`checkReplicaIdentity()`** - Check current setting
3. **`stressTestRealtime()`** - Test with multiple updates

---

## 🎯 What This Fixes

After applying this fix, you should see:
- ✅ Users on same page see each other **immediately**
- ✅ Users leaving pages trigger **"Last seen X ago"** updates
- ✅ Console shows `🔔🔔🔔 REALTIME_EVENT_ARRIVED` logs
- ✅ Visibility updates in **real-time** without polling

---

## 📚 Documentation

Full technical analysis: `SD1-TE2-REPLICA-IDENTITY-ROOT-CAUSE-OCT-13.md`  
SQL fix script: `FIX-SUPABASE-REALTIME-REPLICA-IDENTITY.sql`  
Diagnostic tool: `diagnose-realtime-broadcast.js`

---

## ❓ Why Did This Happen?

PostgreSQL uses "REPLICA IDENTITY" to determine what data to include when broadcasting changes via logical replication (which Supabase Realtime uses).

- **DEFAULT:** Only includes primary key → Supabase doesn't know what changed → **No events sent**
- **FULL:** Includes all columns → Supabase knows exactly what changed → **Events broadcast**

This is a PostgreSQL configuration issue, not a bug in your code or Supabase's code.

---

## 🚨 Important

You **MUST** reload the extension after running the SQL fix to establish a new real-time connection.

---

**Run the SQL fix, reload the extension, and test with `checkRealtimeBroadcast()`**



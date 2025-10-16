# Page Subscription Flow - How It Works

## 🎯 Your Question
> "By the way, when a profile changes page, does it change the page it is subscribed to?"

## ✅ Short Answer
**YES!** When a user navigates to a different page, the system:
1. **Unsubscribes** from the old page's channel
2. **Subscribes** to the new page's channel
3. **Marks the user as inactive** on the old page in the database

This ensures users only receive real-time events for the page they're currently viewing.

---

## 📊 Detailed Flow

### Step-by-Step Process

#### 1. **User Navigates to New Page**
Triggered by: `chrome.tabs.onUpdated` or `chrome.tabs.onActivated`

**Location:** `sidepanel.js` lines 7082-7086
```javascript
// Leave current page before switching
if (window.supabaseRealtimeClient) {
  console.log('🚪 TAB_CHANGE: Leaving current page before switching...');
  await window.supabaseRealtimeClient.leaveCurrentPage();
  console.log('✅ TAB_CHANGE: Left current page successfully');
}
```

#### 2. **Leave Current Page**
**Location:** `supabase-realtime-client.js` lines 233-332

**What Happens:**
```javascript
async leaveCurrentPage() {
  // A. Set mutex to prevent heartbeat race conditions
  this.isLeavingPage = true;
  
  // B. Store old page info
  const { pageId, pageUrl } = this.currentPage;
  
  // C. Clear currentPage IMMEDIATELY (stops heartbeat)
  this.currentPage = null;
  
  // D. Mark user as INACTIVE in database
  await this.supabase
    .from('user_presence')
    .update({
      is_active: false,
      last_seen: new Date().toISOString()
    })
    .eq('user_email', this.currentUser.userEmail)
    .eq('page_id', pageId);
  
  // E. UNSUBSCRIBE from old page's channel
  if (this.channels.has(pageId)) {
    const channel = this.channels.get(pageId);
    await this.supabase.removeChannel(channel);  // ← THIS IS KEY!
    this.channels.delete(pageId);
  }
  
  // F. Clear mutex
  this.isLeavingPage = false;
}
```

**Key Points:**
- ✅ **Unsubscribes from old channel** (line 318)
- ✅ **Marks user as inactive** in database (lines 273-280)
- ✅ **Clears currentPage** to stop heartbeat (line 262)
- ✅ **Uses mutex** to prevent race conditions (lines 239, 331)

#### 3. **Subscribe to New Page**
**Location:** `supabase-realtime-client.js` lines 337-415

**What Happens:**
```javascript
async subscribeToPageUpdates(pageId) {
  // A. Check if already subscribed (shouldn't be, but safety check)
  if (this.channels.has(pageId)) {
    const oldChannel = this.channels.get(pageId);
    await this.supabase.removeChannel(oldChannel);
    this.channels.delete(pageId);
  }
  
  // B. Create NEW channel for new page
  const channel = this.supabase
    .channel(`page-${pageId}`)  // ← NEW CHANNEL!
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'user_presence',
        filter: `page_id=eq.${pageId}`  // ← FILTER BY NEW PAGE!
      },
      (payload) => {
        this.handlePresenceUpdate(payload);
      }
    )
    .subscribe();
  
  // C. Store new channel
  this.channels.set(pageId, channel);
}
```

**Key Points:**
- ✅ **Creates new channel** for new page (line 358)
- ✅ **Filters events** by new page_id (line 365)
- ✅ **Stores channel** in Map for later cleanup (line 447)

#### 4. **Update Presence on New Page**
**Location:** `supabase-realtime-client.js` lines 147-220

**What Happens:**
```javascript
await this.updatePresence(pageId, pageUrl);
// This marks user as ACTIVE on the NEW page
```

---

## 🔄 Example: User Moves from Google to YouTube

### Initial State
```
User: themetalayer@gmail.com
Current Page: google.com (page_id: google_com_)
Subscribed Channels: ['google_com_']
Database: { page_id: 'google_com_', is_active: true }
```

### Step 1: Navigate to YouTube
```javascript
// Triggered by tab change
handleTabChange(youtubeTabId);
```

### Step 2: Leave Google
```javascript
await supabaseRealtimeClient.leaveCurrentPage();

// What happens:
// 1. currentPage = null (stops heartbeat)
// 2. Database UPDATE: { page_id: 'google_com_', is_active: false, last_seen: '2025-10-14T17:30:00Z' }
// 3. supabase.removeChannel(googleChannel) ← UNSUBSCRIBE!
// 4. channels.delete('google_com_')
```

**Result:**
```
Subscribed Channels: [] (empty!)
Database (google.com): { page_id: 'google_com_', is_active: false, last_seen: '2025-10-14T17:30:00Z' }
```

### Step 3: Subscribe to YouTube
```javascript
await supabaseRealtimeClient.subscribeToPageUpdates('youtube_com_');

// What happens:
// 1. Create new channel: 'page-youtube_com_'
// 2. Filter: page_id=eq.youtube_com_
// 3. channels.set('youtube_com_', youtubeChannel)
```

**Result:**
```
Subscribed Channels: ['youtube_com_'] ← NEW!
```

### Step 4: Update Presence on YouTube
```javascript
await supabaseRealtimeClient.updatePresence('youtube_com_', 'youtube.com');

// What happens:
// Database INSERT/UPDATE: { page_id: 'youtube_com_', is_active: true, enter_time: '2025-10-14T17:30:05Z' }
```

**Final State:**
```
User: themetalayer@gmail.com
Current Page: youtube.com (page_id: youtube_com_)
Subscribed Channels: ['youtube_com_']
Database (google.com): { page_id: 'google_com_', is_active: false, last_seen: '2025-10-14T17:30:00Z' }
Database (youtube.com): { page_id: 'youtube_com_', is_active: true, enter_time: '2025-10-14T17:30:05Z' }
```

---

## 🎯 Why This Matters

### 1. **Prevents Duplicate Events**
If you didn't unsubscribe from the old page, you'd receive events for BOTH pages:
- ❌ Events from google.com (old page)
- ❌ Events from youtube.com (new page)
- ❌ Confusion and bugs!

### 2. **Reduces Server Load**
Only subscribing to the current page means:
- ✅ Fewer WebSocket connections
- ✅ Fewer database queries
- ✅ Less bandwidth usage

### 3. **Enables "Last Seen" Feature**
By marking the user as `is_active: false` on the old page:
- ✅ Other users on google.com see "Last seen X ago"
- ✅ Backend can return inactive users with the fix we just made!

### 4. **Prevents "Ghost Presence"**
Without unsubscribing and marking inactive:
- ❌ User would appear active on google.com for 30+ seconds
- ❌ Other users would see stale presence data
- ❌ "Last seen" wouldn't work

---

## 🔍 How to Verify

### Check Active Channels
Run in console:
```javascript
window.supabaseRealtimeClient.channels.keys()
// Should show: ['current_page_id']
// NOT: ['old_page_id', 'new_page_id']
```

### Check Database
```sql
SELECT user_email, page_id, is_active, last_seen 
FROM user_presence 
WHERE user_email = 'themetalayer@gmail.com'
ORDER BY last_seen DESC;
```

**Expected:**
```
| user_email              | page_id        | is_active | last_seen           |
|-------------------------|----------------|-----------|---------------------|
| themetalayer@gmail.com  | youtube_com_   | true      | 2025-10-14 17:30:05 |
| themetalayer@gmail.com  | google_com_    | false     | 2025-10-14 17:30:00 |
```

### Check Logs
Look for these sequences in console:
```
🚪 TAB_CHANGE: Leaving current page before switching...
🚪 LEAVE_PAGE: === STARTING LEAVE PAGE ===
✅ LEAVE_PAGE: Marked themetalayer@gmail.com as inactive on google_com_
✅ LEAVE_PAGE: Unsubscribed from channel: page-google_com_
📡 SUBSCRIBE: === STARTING SUBSCRIPTION SETUP ===
📡 SUBSCRIBE: Creating channel: page-youtube_com_
✅ SUBSCRIBE: Successfully subscribed to page-youtube_com_
```

---

## 🐛 What Could Go Wrong

### Problem 1: Not Unsubscribing
**Symptom:** Receiving events from multiple pages
**Cause:** `removeChannel()` not called
**Fix:** Ensure `leaveCurrentPage()` is called before navigation

### Problem 2: Race Condition
**Symptom:** Heartbeat updates old page after leaving
**Cause:** Heartbeat runs between leaving and subscribing
**Fix:** Mutex (`isLeavingPage`) prevents this (already implemented)

### Problem 3: Subscription Leak
**Symptom:** Memory usage grows over time
**Cause:** Old channels not cleaned up
**Fix:** Always call `removeChannel()` before creating new one

---

## 📝 Summary

**Q: Does the system change subscriptions when changing pages?**

**A: YES!**

1. ✅ **Unsubscribes** from old page channel
2. ✅ **Marks user as inactive** on old page
3. ✅ **Subscribes** to new page channel
4. ✅ **Marks user as active** on new page

This ensures:
- ✅ Users only receive events for their current page
- ✅ "Last seen" feature works correctly
- ✅ No ghost presence or stale data
- ✅ Efficient resource usage

**The system is working as designed!** 🎉

---

**Related Files:**
- `supabase-realtime-client.js` - Subscription management
- `sidepanel.js` - Tab change handling
- `realtime-presence-handler.js` - Event processing

**Date:** October 14, 2025



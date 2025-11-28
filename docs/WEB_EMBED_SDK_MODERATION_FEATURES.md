# Web-Embed SDK Moderation Features

## Overview

This document outlines user blocking, message/thread hiding, and extension user choice features for the Web-Embed SDK.

---

## 1. Block Users Feature

### 1.1 Block User Interface

**Location**: Canopi Details → "Blocked Users" tab

```
┌─────────────────────────────────────────────────────────────┐
│ Blocked Users - Meta Layer Initiative                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Blocked users cannot post messages or interact in this     │
│ Canopi. They can still view content unless messages are    │
│ hidden.                                                    │
│                                                             │
│ Current Blocked Users                                      │
│ ─────────────────────────────────────                      │
│                                                             │
│ [Avatar] John Doe                          [Unblock]      │
│ john@example.com                                           │
│ Blocked by: Daveed Benjamin                                │
│ Blocked on: Nov 24, 2024                                   │
│ Reason: Spam                                               │
│                                                             │
│ [Avatar] Jane Smith                        [Unblock]       │
│ jane@example.com                                           │
│ Blocked by: Daveed Benjamin                                │
│ Blocked on: Nov 23, 2024                                   │
│ Reason: Harassment                                         │
│                                                             │
│ Block User                                                 │
│ ─────────────────────────────────────                      │
│ Search for user:                                           │
│ [Type name or email...                    ] [Search]      │
│                                                             │
│ [Search Results]                                           │
│ [Avatar] Sarah Wilson                      [Block User]    │
│ sarah@example.com                                          │
│                                                             │
│ Block Reason (optional):                                    │
│ [Textarea for reason...                   ]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Block User Behavior

**When User is Blocked:**
- ❌ Cannot post new messages
- ❌ Cannot reply to messages
- ❌ Cannot react to messages
- ❌ Cannot edit their messages
- ✅ Can still view messages (unless hidden)
- ✅ Can still see their own messages (unless hidden)

**Block Actions:**
- **Block**: User is blocked from interacting
- **Block & Hide**: User is blocked AND all their messages are hidden
- **Block & Delete**: User is blocked AND all their messages are deleted

### 1.3 Block User API

```javascript
// Block user
POST /api/embeds/instances/:id/blocked-users
{
  "userId": "uuid",
  "reason": "Spam",
  "action": "block" | "block-and-hide" | "block-and-delete"
}

// Unblock user
DELETE /api/embeds/instances/:id/blocked-users/:userId

// List blocked users
GET /api/embeds/instances/:id/blocked-users

// Check if user is blocked
GET /api/embeds/instances/:id/blocked-users/:userId/status
```

### 1.4 Database Schema

```sql
CREATE TABLE canopi_embed_blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  action VARCHAR(20) DEFAULT 'block' CHECK (action IN ('block', 'block-and-hide', 'block-and-delete')),
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(instance_id, user_id)
);

CREATE INDEX idx_blocked_users_instance ON canopi_embed_blocked_users(instance_id);
CREATE INDEX idx_blocked_users_user ON canopi_embed_blocked_users(user_id);
```

### 1.5 Block Check in Message Flow

```javascript
// Before allowing message post
async function canUserPost(userId, canopiId) {
  const blocked = await db.query(`
    SELECT * FROM canopi_embed_blocked_users
    WHERE instance_id = $1 AND user_id = $2
  `, [canopiId, userId]);
  
  if (blocked.length > 0) {
    throw new Error('User is blocked from this Canopi');
  }
  
  return true;
}
```

---

## 2. Hide Messages/Threads Feature

### 2.1 Hide Message Interface

**Location**: Message actions menu or Canopi Details → "Hidden Content" tab

```
┌─────────────────────────────────────────────────────────────┐
│ Hidden Messages & Threads - Meta Layer Initiative           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Hidden content is not visible to regular users but can be  │
│ viewed by admins. Hidden messages can be restored.        │
│                                                             │
│ Hidden Messages                                             │
│ ─────────────────────────────────────                      │
│                                                             │
│ "This is a spam message"                    [Restore]       │
│ By: John Doe | Hidden: Nov 24, 2024                        │
│ Reason: Spam                                               │
│                                                             │
│ "Another hidden message"                    [Restore]       │
│ By: Jane Smith | Hidden: Nov 23, 2024                     │
│ Reason: Off-topic                                          │
│                                                             │
│ Hidden Threads                                             │
│ ─────────────────────────────────────                      │
│                                                             │
│ Thread: "Discussion about X"                 [Restore]      │
│ Started by: John Doe | Hidden: Nov 24, 2024                │
│ Reason: Spam                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Hide Message Actions

**From Message Menu:**
- Hide this message
- Hide this thread (all replies)
- Hide all messages from user
- Hide and block user

**Hide Options:**
- **Hide from all users**: Message not visible to anyone except admins
- **Hide from non-admins**: Regular users can't see, admins can
- **Hide and delete**: Remove from database (irreversible)

### 2.3 Hide Message API

```javascript
// Hide message
POST /api/embeds/instances/:id/hidden-content
{
  "type": "message" | "thread" | "user-messages",
  "targetId": "message-id" | "thread-id" | "user-id",
  "reason": "Spam",
  "action": "hide" | "hide-from-non-admins" | "hide-and-delete"
}

// Restore hidden content
DELETE /api/embeds/instances/:id/hidden-content/:id

// List hidden content
GET /api/embeds/instances/:id/hidden-content
```

### 2.4 Database Schema

```sql
CREATE TABLE canopi_embed_hidden_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('message', 'thread', 'user-messages')),
  target_id UUID NOT NULL, -- message_id, thread_id, or user_id
  hidden_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  action VARCHAR(20) DEFAULT 'hide' CHECK (action IN ('hide', 'hide-from-non-admins', 'hide-and-delete')),
  hidden_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(instance_id, content_type, target_id)
);

CREATE INDEX idx_hidden_content_instance ON canopi_embed_hidden_content(instance_id);
CREATE INDEX idx_hidden_content_type_target ON canopi_embed_hidden_content(content_type, target_id);
```

### 2.5 Hide Check in Message Display

```javascript
// When loading messages
async function filterHiddenMessages(messages, canopiId, userId) {
  const user = await getUser(userId);
  const isAdmin = await isCanopiAdmin(userId, canopiId);
  
  // Get hidden content
  const hidden = await db.query(`
    SELECT content_type, target_id, action
    FROM canopi_embed_hidden_content
    WHERE instance_id = $1
  `, [canopiId]);
  
  const hiddenMessages = new Set();
  const hiddenThreads = new Set();
  const hiddenUsers = new Set();
  
  hidden.forEach(h => {
    if (h.content_type === 'message') {
      hiddenMessages.add(h.target_id);
    } else if (h.content_type === 'thread') {
      hiddenThreads.add(h.target_id);
    } else if (h.content_type === 'user-messages') {
      hiddenUsers.add(h.target_id);
    }
  });
  
  // Filter messages
  return messages.filter(msg => {
    // Admins can see all (unless action is hide-and-delete)
    if (isAdmin) {
      const hideRecord = hidden.find(h => 
        (h.content_type === 'message' && h.target_id === msg.id) ||
        (h.content_type === 'thread' && h.target_id === msg.thread_id) ||
        (h.content_type === 'user-messages' && h.target_id === msg.user_id)
      );
      
      if (hideRecord && hideRecord.action === 'hide-and-delete') {
        return false; // Even admins can't see deleted
      }
      return true; // Admins can see hidden content
    }
    
    // Regular users can't see hidden content
    if (hiddenMessages.has(msg.id)) return false;
    if (hiddenThreads.has(msg.thread_id)) return false;
    if (hiddenUsers.has(msg.user_id)) return false;
    
    return true;
  });
}
```

---

## 3. Extension User Choice: Load with Restrictions

### 3.1 Extension Detection & Prompt

**When Extension Detects Web Embed:**

```javascript
// In extension content script
function detectWebEmbed() {
  const embedScript = document.querySelector('script[data-canopi-id]');
  if (!embedScript) return;
  
  const canopiId = embedScript.getAttribute('data-canopi-id');
  
  // Check if user has preference
  const preference = getUserPreference(`canopi-${canopiId}-restrictions`);
  
  if (preference === null) {
    // First time - show prompt
    showRestrictionPrompt(canopiId);
  } else if (preference === 'with-restrictions') {
    // Load with restrictions
    loadEmbedWithRestrictions(canopiId);
  } else {
    // Load without restrictions (or don't load)
    loadEmbedWithoutRestrictions(canopiId);
  }
}
```

### 3.2 Restriction Prompt UI

**Modal shown when extension detects embed:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ⚠️ Canopi Embed Detected                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   This page has a Canopi embed that may have content      │
│   restrictions applied (blocked users, hidden messages).   │
│                                                             │
│   How would you like to load this embed?                  │
│                                                             │
│   ○ Load with restrictions (default)                      │
│     Respect blocked users and hidden content              │
│                                                             │
│   ● Load without restrictions                             │
│     Show all content, including blocked/hidden            │
│                                                             │
│   ○ Don't load embed                                      │
│     Skip this embed entirely                              │
│                                                             │
│   ☑ Remember my choice for this Canopi                    │
│                                                             │
│   [Cancel]  [Continue]                                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Restriction Preference Storage

```javascript
// Store user preference
function setRestrictionPreference(canopiId, choice) {
  const key = `canopi-${canopiId}-restrictions`;
  chrome.storage.sync.set({ [key]: choice });
  
  // Also store globally if "remember for all"
  if (rememberForAll) {
    chrome.storage.sync.set({ 'canopi-default-restrictions': choice });
  }
}

// Get user preference
async function getRestrictionPreference(canopiId) {
  const key = `canopi-${canopiId}-restrictions`;
  const result = await chrome.storage.sync.get([key, 'canopi-default-restrictions']);
  
  return result[key] || result['canopi-default-restrictions'] || 'with-restrictions';
}
```

### 3.4 Loading with Restrictions

```javascript
// Load embed with restrictions applied
async function loadEmbedWithRestrictions(canopiId) {
  // Get blocked users and hidden content
  const restrictions = await fetch(`/api/embeds/config/${canopiId}/restrictions`);
  
  // Pass restrictions to embed SDK
  window.canopiConfig = {
    canopiId,
    restrictions: {
      blockedUsers: restrictions.blockedUsers,
      hiddenMessages: restrictions.hiddenMessages,
      hiddenThreads: restrictions.hiddenThreads,
      hiddenUsers: restrictions.hiddenUsers
    },
    applyRestrictions: true
  };
  
  // Load embed SDK
  loadEmbedSDK();
}
```

### 3.5 Loading without Restrictions

```javascript
// Load embed without restrictions
async function loadEmbedWithoutRestrictions(canopiId) {
  // Load embed with no restrictions
  window.canopiConfig = {
    canopiId,
    restrictions: null,
    applyRestrictions: false
  };
  
  // Load embed SDK
  loadEmbedSDK();
}
```

### 3.6 Embed SDK Restriction Handling

```javascript
// In embed SDK
class CanopiEmbed {
  constructor(config) {
    this.config = config;
    this.restrictions = config.restrictions || null;
    this.applyRestrictions = config.applyRestrictions !== false;
  }
  
  async loadMessages() {
    const messages = await this.fetchMessages();
    
    if (this.applyRestrictions && this.restrictions) {
      return this.filterRestrictedContent(messages);
    }
    
    return messages; // Show all
  }
  
  filterRestrictedContent(messages) {
    return messages.filter(msg => {
      // Filter blocked users
      if (this.restrictions.blockedUsers?.includes(msg.user_id)) {
        return false;
      }
      
      // Filter hidden messages
      if (this.restrictions.hiddenMessages?.includes(msg.id)) {
        return false;
      }
      
      // Filter hidden threads
      if (msg.thread_id && this.restrictions.hiddenThreads?.includes(msg.thread_id)) {
        return false;
      }
      
      // Filter hidden user messages
      if (this.restrictions.hiddenUsers?.includes(msg.user_id)) {
        return false;
      }
      
      return true;
    });
  }
  
  canUserPost(userId) {
    if (!this.applyRestrictions) return true;
    
    // Check if user is blocked
    if (this.restrictions?.blockedUsers?.includes(userId)) {
      return false;
    }
    
    return true;
  }
}
```

---

## 4. Public Restrictions API

### 4.1 Get Restrictions Endpoint

```
GET /api/embeds/config/:canopiId/restrictions
```

**Response:**
```json
{
  "canopiId": "abc123",
  "blockedUsers": ["user-id-1", "user-id-2"],
  "hiddenMessages": ["msg-id-1", "msg-id-2"],
  "hiddenThreads": ["thread-id-1"],
  "hiddenUsers": ["user-id-3"],
  "lastUpdated": "2024-11-24T12:00:00Z"
}
```

**Note**: This endpoint is public (no auth required) because restrictions are meant to be applied client-side. The actual content filtering happens in the SDK.

### 4.2 Restrictions Cache

```javascript
// Cache restrictions for performance
const restrictionsCache = new Map();

async function getRestrictions(canopiId) {
  // Check cache
  const cached = restrictionsCache.get(canopiId);
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.data; // Cache for 1 minute
  }
  
  // Fetch from API
  const restrictions = await fetch(`/api/embeds/config/${canopiId}/restrictions`);
  
  // Update cache
  restrictionsCache.set(canopiId, {
    data: restrictions,
    timestamp: Date.now()
  });
  
  return restrictions;
}
```

---

## 5. Admin UI Updates

### 5.1 Message Actions Menu

**Add to message context menu:**

```
┌─────────────────────────────────┐
│ [Message Actions]                │
├─────────────────────────────────┤
│ Reply                            │
│ React                            │
│ Share                            │
│ ─────────────────────────────── │
│ Hide this message               │
│ Hide this thread                │
│ Hide all from user              │
│ Block user                      │
│ ─────────────────────────────── │
│ Report                          │
└─────────────────────────────────┘
```

### 5.2 User Actions Menu

**Add to user profile/hover menu:**

```
┌─────────────────────────────────┐
│ [User Actions]                   │
├─────────────────────────────────┤
│ View Profile                     │
│ Send Message                     │
│ ─────────────────────────────── │
│ Block User                       │
│ Hide All Messages               │
│ Block & Hide All                │
└─────────────────────────────────┘
```

### 5.3 Moderation Dashboard

**New tab in Canopi Details:**

```
┌─────────────────────────────────────────────────────────────┐
│ Moderation - Meta Layer Initiative                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Blocked Users] [Hidden Content] [Recent Actions]          │
│                                                             │
│ Quick Actions                                                │
│ ─────────────────────────────────────                      │
│ [Block User] [Hide Message] [Hide Thread]                 │
│                                                             │
│ Recent Moderation Actions                                   │
│ ─────────────────────────────────────                      │
│ Nov 24, 2024 - Blocked user: John Doe                      │
│ Nov 24, 2024 - Hid message: "Spam message"                │
│ Nov 23, 2024 - Hid thread: "Discussion about X"            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Database Schema Updates

### 6.1 Blocked Users Table

```sql
CREATE TABLE canopi_embed_blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  action VARCHAR(20) DEFAULT 'block' CHECK (action IN ('block', 'block-and-hide', 'block-and-delete')),
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(instance_id, user_id)
);

CREATE INDEX idx_blocked_users_instance ON canopi_embed_blocked_users(instance_id);
CREATE INDEX idx_blocked_users_user ON canopi_embed_blocked_users(user_id);
```

### 6.2 Hidden Content Table

```sql
CREATE TABLE canopi_embed_hidden_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('message', 'thread', 'user-messages')),
  target_id UUID NOT NULL,
  hidden_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  action VARCHAR(20) DEFAULT 'hide' CHECK (action IN ('hide', 'hide-from-non-admins', 'hide-and-delete')),
  hidden_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(instance_id, content_type, target_id)
);

CREATE INDEX idx_hidden_content_instance ON canopi_embed_hidden_content(instance_id);
CREATE INDEX idx_hidden_content_type_target ON canopi_embed_hidden_content(content_type, target_id);
```

---

## 7. API Endpoints

### 7.1 Block User Endpoints

```
POST   /api/embeds/instances/:id/blocked-users      - Block user
DELETE /api/embeds/instances/:id/blocked-users/:userId - Unblock user
GET    /api/embeds/instances/:id/blocked-users      - List blocked users
GET    /api/embeds/instances/:id/blocked-users/:userId/status - Check if blocked
```

### 7.2 Hide Content Endpoints

```
POST   /api/embeds/instances/:id/hidden-content    - Hide content
DELETE /api/embeds/instances/:id/hidden-content/:id - Restore content
GET    /api/embeds/instances/:id/hidden-content     - List hidden content
```

### 7.3 Restrictions Endpoint

```
GET    /api/embeds/config/:canopiId/restrictions    - Get restrictions (public)
```

---

## 8. Extension Integration

### 8.1 Content Script Updates

```javascript
// In extension content script
(function() {
  'use strict';
  
  // Detect embed script
  const embedScript = document.querySelector('script[data-canopi-id]');
  if (!embedScript) return;
  
  const canopiId = embedScript.getAttribute('data-canopi-id');
  
  // Check user preference
  chrome.storage.sync.get([`canopi-${canopiId}-restrictions`], (result) => {
    const preference = result[`canopi-${canopiId}-restrictions`];
    
    if (preference === null) {
      // Show prompt
      showRestrictionPrompt(canopiId);
    } else {
      // Apply preference
      applyRestrictionPreference(canopiId, preference);
    }
  });
  
  function showRestrictionPrompt(canopiId) {
    // Create modal
    const modal = createModal({
      title: 'Canopi Embed Detected',
      content: getPromptHTML(),
      buttons: [
        { text: 'Cancel', action: () => modal.remove() },
        { text: 'Continue', action: () => handleChoice(canopiId) }
      ]
    });
    
    document.body.appendChild(modal);
  }
  
  function handleChoice(canopiId) {
    const choice = document.querySelector('input[name="restriction-choice"]:checked').value;
    const remember = document.querySelector('#remember-choice').checked;
    
    // Store preference
    chrome.storage.sync.set({
      [`canopi-${canopiId}-restrictions`]: choice
    });
    
    // Apply choice
    applyRestrictionPreference(canopiId, choice);
  }
  
  function applyRestrictionPreference(canopiId, choice) {
    if (choice === 'dont-load') {
      // Remove embed script
      embedScript.remove();
      return;
    }
    
    // Modify embed script to include restriction preference
    embedScript.setAttribute('data-restrictions', choice);
    
    // If choice is 'without-restrictions', add flag
    if (choice === 'without-restrictions') {
      embedScript.setAttribute('data-ignore-restrictions', 'true');
    }
  }
})();
```

### 8.2 Background Script Updates

```javascript
// Listen for restriction preference changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    Object.keys(changes).forEach(key => {
      if (key.startsWith('canopi-') && key.endsWith('-restrictions')) {
        // Notify content scripts of preference change
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              type: 'restriction-preference-changed',
              canopiId: key.replace('canopi-', '').replace('-restrictions', ''),
              preference: changes[key].newValue
            });
          });
        });
      }
    });
  }
});
```

---

## 9. Implementation Checklist

### Phase 1: Block Users
- [ ] Create blocked_users table
- [ ] Build block user UI
- [ ] Implement block/unblock API
- [ ] Add block check to message posting
- [ ] Add block check to reactions/replies
- [ ] Test block functionality

### Phase 2: Hide Messages/Threads
- [ ] Create hidden_content table
- [ ] Build hide content UI
- [ ] Implement hide/restore API
- [ ] Add hide check to message loading
- [ ] Add hide actions to message menu
- [ ] Test hide functionality

### Phase 3: Restrictions API
- [ ] Create public restrictions endpoint
- [ ] Implement restrictions caching
- [ ] Add restrictions to embed config
- [ ] Test restrictions API

### Phase 4: Extension Integration
- [ ] Update content script to detect embeds
- [ ] Create restriction prompt modal
- [ ] Implement preference storage
- [ ] Add preference management UI
- [ ] Test extension integration

### Phase 5: Embed SDK Updates
- [ ] Add restrictions handling to SDK
- [ ] Implement content filtering
- [ ] Add restriction flags to config
- [ ] Test with/without restrictions
- [ ] Performance optimization

---

**Status**: Ready for Implementation  
**Priority**: High - Core moderation features







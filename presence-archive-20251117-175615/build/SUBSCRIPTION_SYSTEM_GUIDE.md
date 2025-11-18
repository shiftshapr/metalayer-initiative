# Subscription System - Complete Guide

## Overview

The subscription system distinguishes between **personal** and **subscription-based** notifications, allowing users to control what they're notified about.

---

## 🎯 **Notification Categories**

### **Personal Notifications**
Direct to you - always enabled (can't be unsubscribed):
- **Mentions** - Someone @mentions you
- **Replies** - Someone replies to your message  
- **Room Invites** - You're invited to a room
- **System Alerts** - Account/system notifications

### **Subscription-Based Notifications**
From content you follow - requires subscription:
- **New Messages** - Messages in subscribed rooms
- **Friend Aura Changes** - Aura changes of subscribed friends
- **Community Activity** - Activity in subscribed communities

---

## 📦 **Subscription Manager API**

### Initialize

```typescript
import { subscriptionManager } from './features/SubscriptionManager';

// Initialize with user ID
await subscriptionManager.initialize('user-123');
```

### Subscribe to Content

```typescript
// Subscribe to a room
const subscription = await subscriptionManager.subscribe({
  targetType: 'room',
  targetId: 'room-456',
  targetName: 'General Chat',
  preferences: {
    enabled: true,
    sound: true,
    desktop: true,
    priority: 'medium'
  }
});

// Subscribe to a user (friend)
await subscriptionManager.subscribe({
  targetType: 'user',
  targetId: 'user-789',
  targetName: 'John Doe'
});

// Subscribe to a timeline
await subscriptionManager.subscribe({
  targetType: 'timeline',
  targetId: 'timeline-abc',
  targetName: 'Tech News'
});
```

### Auto-Subscribe

```typescript
// Auto-subscribe when joining a room
await subscriptionManager.autoSubscribe(
  'room',
  'room-456',
  'General Chat',
  'Joined room'
);
```

### Check Subscription

```typescript
// Check if subscribed
const isSubscribed = subscriptionManager.isSubscribed('room', 'room-456');

// Find subscription
const subscription = subscriptionManager.findSubscription('room', 'room-456');
```

### Manage Subscriptions

```typescript
// Update subscription
await subscriptionManager.updateSubscription(subscription.id, {
  preferences: {
    enabled: true,
    sound: false,  // Disable sound
    priority: 'low'  // Lower priority
  }
});

// Mute temporarily (1 hour)
await subscriptionManager.muteSubscription(subscription.id, 3600000);

// Unmute
await subscriptionManager.unmuteSubscription(subscription.id);

// Disable
await subscriptionManager.disableSubscription(subscription.id);

// Enable
await subscriptionManager.enableSubscription(subscription.id);

// Unsubscribe
await subscriptionManager.unsubscribe(subscription.id);

// Or unsubscribe by target
await subscriptionManager.unsubscribeByTarget('room', 'room-456');
```

### Query Subscriptions

```typescript
// Get all subscriptions
const all = subscriptionManager.getSubscriptions();

// Get active subscriptions
const active = subscriptionManager.getSubscriptions({
  active: true
});

// Get subscriptions by type
const rooms = subscriptionManager.getSubscriptions({
  targetType: 'room'
});

// Get enabled subscriptions
const enabled = subscriptionManager.getSubscriptions({
  enabled: true,
  includeMuted: false
});

// Search subscriptions
const results = subscriptionManager.getSubscriptions({
  search: 'general',
  limit: 10
});
```

### Bulk Operations

```typescript
// Bulk subscribe
const result = await subscriptionManager.bulkSubscribe([
  { targetType: 'room', targetId: 'room-1', targetName: 'Room 1' },
  { targetType: 'room', targetId: 'room-2', targetName: 'Room 2' },
  { targetType: 'user', targetId: 'user-1', targetName: 'User 1' }
]);

console.log(`Subscribed to ${result.count} targets`);

// Bulk unsubscribe
await subscriptionManager.bulkUnsubscribe([
  'sub-123',
  'sub-456',
  'sub-789'
]);
```

### Statistics

```typescript
const stats = subscriptionManager.getStats();

console.log('Total subscriptions:', stats.total);
console.log('Active:', stats.active);
console.log('Muted:', stats.muted);
console.log('Auto-subscribed:', stats.autoSubscribed);
console.log('By type:', stats.byType);
```

### Events

```typescript
// Listen for subscription events
subscriptionManager.on('subscription:created', (payload) => {
  console.log('New subscription:', payload.subscription);
});

subscriptionManager.on('subscription:muted', (payload) => {
  console.log('Subscription muted:', payload.subscription);
});

subscriptionManager.on('subscription:deleted', (payload) => {
  console.log('Unsubscribed:', payload.subscription);
});
```

---

## 🔔 **Notification Integration**

### Show Notification with Subscription

```typescript
import { notificationManager } from './features/NotificationManager';

// Personal notification (always shows if type enabled)
await notificationManager.showNotification('MENTION', {
  title: '@you in #general',
  message: 'John mentioned you',
  source: {
    category: 'personal'
  }
});

// Subscription-based notification (checks subscription)
await notificationManager.showNotification('MESSAGE_NEW', {
  title: 'New message in #general',
  message: 'Sarah: Hello everyone!',
  source: {
    category: 'subscription',
    targetType: 'room',
    targetId: 'room-456',
    targetName: 'General Chat'
  }
});
```

### Notification Filtering Logic

The system automatically:
1. ✅ **Personal notifications**: Always show (if type enabled)
2. ✅ **Subscription notifications**: Check subscription first
   - Is user subscribed to target?
   - Is subscription active?
   - Is subscription enabled?
   - Is subscription muted?
   - Are specific notification types disabled?
   - Apply subscription priority override

---

## 🎨 **UI Integration Examples**

### Room Subscription Toggle

```typescript
// In room UI
async function toggleRoomSubscription(roomId: string, roomName: string) {
  const isSubscribed = subscriptionManager.isSubscribed('room', roomId);
  
  if (isSubscribed) {
    // Unsubscribe
    await subscriptionManager.unsubscribeByTarget('room', roomId);
    showToast('Unsubscribed from ' + roomName);
  } else {
    // Subscribe
    await subscriptionManager.subscribe({
      targetType: 'room',
      targetId: roomId,
      targetName: roomName
    });
    showToast('Subscribed to ' + roomName);
  }
}
```

### Friend Subscription

```typescript
// When adding friend
async function onFriendAdded(userId: string, userName: string) {
  // Auto-subscribe to friend's activity
  await subscriptionManager.autoSubscribe(
    'user',
    userId,
    userName,
    'Added as friend'
  );
}
```

### Subscription Settings Panel

```typescript
// Display user's subscriptions
function renderSubscriptions() {
  const subscriptions = subscriptionManager.getSubscriptions({
    active: true
  });
  
  return subscriptions.map(sub => `
    <div class="subscription-item">
      <div class="subscription-info">
        <strong>${sub.targetName}</strong>
        <span>${sub.targetType}</span>
      </div>
      <div class="subscription-controls">
        <button onclick="muteSubscription('${sub.id}')">Mute</button>
        <button onclick="unsubscribe('${sub.id}')">Unsubscribe</button>
      </div>
    </div>
  `).join('');
}
```

---

## 📊 **Subscription Types**

| Type | Description | Example |
|------|-------------|---------|
| `room` | Subscribe to room activity | Messages in #general |
| `thread` | Subscribe to thread replies | Replies in a conversation |
| `user` | Subscribe to user activity | Friend's aura changes, visibility |
| `community` | Subscribe to community events | New members, announcements |
| `timeline` | Subscribe to timeline updates | New posts in followed timeline |
| `page` | Subscribe to page changes | Page visibility changes |
| `topic` | Subscribe to topic/tag | Posts tagged with #tech |
| `search` | Subscribe to search results | New results for "AI news" |
| `mention` | Subscribe to mentions of term | Mentions of "project alpha" |

---

## 🔄 **Workflow Examples**

### Example 1: User Joins Room

```typescript
async function onUserJoinRoom(roomId: string, roomName: string) {
  // 1. Auto-subscribe user to room
  await subscriptionManager.autoSubscribe(
    'room',
    roomId,
    roomName,
    'Joined room'
  );
  
  // 2. User will now receive notifications for room messages
  // (if MESSAGE_NEW notification type is enabled)
}
```

### Example 2: User Leaves Room

```typescript
async function onUserLeaveRoom(roomId: string) {
  // 1. Unsubscribe from room
  await subscriptionManager.unsubscribeByTarget('room', roomId);
  
  // 2. User will no longer receive room notifications
}
```

### Example 3: Mute Room for 1 Hour

```typescript
async function muteRoomForOneHour(roomId: string) {
  // 1. Find subscription
  const subscription = subscriptionManager.findSubscription('room', roomId);
  
  if (subscription) {
    // 2. Mute for 1 hour (3600000 ms)
    await subscriptionManager.muteSubscription(subscription.id, 3600000);
    
    // 3. User won't receive notifications until mute expires
  }
}
```

### Example 4: Custom Notification Preferences per Room

```typescript
async function setRoomNotificationPreferences(
  roomId: string,
  preferences: {
    sound?: boolean;
    desktop?: boolean;
    priority?: 'high' | 'medium' | 'low';
  }
) {
  const subscription = subscriptionManager.findSubscription('room', roomId);
  
  if (subscription) {
    await subscriptionManager.updateSubscription(subscription.id, {
      preferences: {
        ...subscription.preferences,
        ...preferences
      }
    });
  }
}

// Usage
await setRoomNotificationPreferences('room-456', {
  sound: false,  // No sound for this room
  priority: 'low'  // Low priority notifications
});
```

---

## 🎯 **Best Practices**

### 1. Auto-Subscribe Appropriately
```typescript
// ✅ Good: Auto-subscribe when user explicitly joins
await subscriptionManager.autoSubscribe('room', roomId, roomName, 'Joined room');

// ❌ Bad: Auto-subscribe without user action
// Don't auto-subscribe to things user didn't explicitly join
```

### 2. Provide Subscription Controls
```typescript
// ✅ Good: Give users control
<button onclick="toggleSubscription()">
  {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
</button>

// ❌ Bad: Hide subscription controls
// Always let users manage their subscriptions
```

### 3. Respect Subscription Settings
```typescript
// ✅ Good: Check subscription before showing notification
await notificationManager.showNotification('MESSAGE_NEW', {
  ...data,
  source: {
    category: 'subscription',
    targetType: 'room',
    targetId: roomId
  }
});

// ❌ Bad: Show notification without checking subscription
// System will block it anyway, but wastes resources
```

### 4. Use Meaningful Target Names
```typescript
// ✅ Good: Descriptive names
await subscriptionManager.subscribe({
  targetType: 'room',
  targetId: 'room-123',
  targetName: 'General Chat - Project Alpha'
});

// ❌ Bad: Generic names
await subscriptionManager.subscribe({
  targetType: 'room',
  targetId: 'room-123',
  targetName: 'Room'
});
```

---

## 🔍 **Debugging**

### Check Subscription Status
```typescript
// Debug why notification wasn't shown
const subscription = subscriptionManager.findSubscription('room', 'room-456');

if (!subscription) {
  console.log('Not subscribed to room');
} else if (!subscription.active) {
  console.log('Subscription is inactive');
} else if (!subscription.preferences.enabled) {
  console.log('Subscription is disabled');
} else if (subscription.preferences.mutedUntil && subscription.preferences.mutedUntil > Date.now()) {
  console.log('Subscription is muted');
} else {
  console.log('Subscription is active and should show notifications');
}
```

### List All Subscriptions
```typescript
// See what user is subscribed to
const subscriptions = subscriptionManager.getSubscriptions();
console.table(subscriptions.map(sub => ({
  type: sub.targetType,
  id: sub.targetId,
  name: sub.targetName,
  active: sub.active,
  enabled: sub.preferences.enabled,
  muted: sub.preferences.mutedUntil ? 'Yes' : 'No'
})));
```

---

## 📝 **TypeScript Types**

All types are fully typed for TypeScript:

```typescript
import {
  Subscription,
  SubscriptionTargetType,
  SubscriptionFilter,
  CreateSubscriptionOptions,
  UpdateSubscriptionOptions,
  SubscriptionStats,
  NotificationSource,
  NotificationCategory
} from './types';
```

---

## 🚀 **Summary**

The subscription system provides:

✅ **Clear distinction** between personal and subscription-based notifications  
✅ **Granular control** over what users are notified about  
✅ **Per-subscription preferences** (sound, desktop, priority)  
✅ **Temporary muting** for subscriptions  
✅ **Auto-subscription** for seamless UX  
✅ **Bulk operations** for efficiency  
✅ **Event system** for integration  
✅ **Full TypeScript support** for type safety  

Users can now:
- Subscribe/unsubscribe to rooms, users, communities, timelines, etc.
- Customize notification preferences per subscription
- Mute subscriptions temporarily
- Manage all subscriptions in one place
- Receive only relevant notifications

**The system automatically checks subscriptions before showing notifications, ensuring users only see what they want to see!**




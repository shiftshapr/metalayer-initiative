# Notification Types - Real-World Examples

## How to Add Custom Notification Types

This guide shows practical examples of notification types you can add to your system.

---

## 📱 **Social Notifications**

### 1. Reaction Received
```typescript
// Type definition
| 'REACTION_RECEIVED'

// Configuration
{
  id: 'REACTION_RECEIVED',
  name: 'Reactions',
  description: 'Get notified when someone reacts to your message',
  icon: '⭐',
  enabled: true,
  sound: false,
  desktop: true,
  priority: 'low'
}

// Usage
await notificationManager.showNotification('REACTION_RECEIVED', {
  title: 'Sarah reacted to your message',
  message: '❤️ Love this!',
  anchor: {
    target: '[data-message-id="msg-123"]',
    highlightStyle: 'glow'
  },
  data: {
    authorName: 'Sarah',
    reaction: '❤️',
    messageId: 'msg-123'
  }
});
```

### 2. Friend Request
```typescript
// Type definition
| 'FRIEND_REQUEST'

// Configuration
{
  id: 'FRIEND_REQUEST',
  name: 'Friend Requests',
  description: 'Get notified when someone sends a friend request',
  icon: '🤝',
  enabled: true,
  sound: false,
  desktop: true,
  priority: 'medium'
}

// Usage
await notificationManager.showNotification('FRIEND_REQUEST', {
  title: 'New friend request',
  message: 'John Doe wants to connect with you',
  url: 'https://canopi.app/friends/requests',
  data: {
    userId: 'user-john',
    userName: 'John Doe'
  }
});
```

### 3. Profile View
```typescript
// Type definition
| 'PROFILE_VIEW'

// Configuration
{
  id: 'PROFILE_VIEW',
  name: 'Profile Views',
  description: 'Get notified when someone views your profile',
  icon: '👀',
  enabled: false,
  sound: false,
  desktop: false,
  priority: 'low'
}

// Usage
await notificationManager.showNotification('PROFILE_VIEW', {
  title: 'Someone viewed your profile',
  message: '3 people viewed your profile today',
  url: 'https://canopi.app/profile/analytics',
  data: {
    viewCount: 3,
    viewers: ['user-1', 'user-2', 'user-3']
  }
});
```

---

## 💬 **Messaging Notifications**

### 4. Direct Message
```typescript
// Type definition
| 'DIRECT_MESSAGE'

// Configuration
{
  id: 'DIRECT_MESSAGE',
  name: 'Direct Messages',
  description: 'Get notified about private messages',
  icon: '✉️',
  enabled: true,
  sound: true,
  desktop: true,
  priority: 'high'
}

// Usage
await notificationManager.showNotification('DIRECT_MESSAGE', {
  title: 'New DM from Sarah',
  message: 'Hey, can we talk?',
  url: 'https://canopi.app/messages/dm-123',
  anchor: {
    target: '[data-dm-id="dm-123"]',
    highlightStyle: 'pulse'
  },
  priority: 'high',
  data: {
    authorName: 'Sarah',
    authorId: 'user-sarah',
    dmId: 'dm-123'
  }
});
```

### 5. Thread Reply
```typescript
// Type definition
| 'THREAD_REPLY'

// Configuration
{
  id: 'THREAD_REPLY',
  name: 'Thread Replies',
  description: 'Get notified about replies in threads you follow',
  icon: '🧵',
  enabled: true,
  sound: true,
  desktop: true,
  priority: 'medium'
}

// Usage
await notificationManager.showNotification('THREAD_REPLY', {
  title: 'New reply in thread',
  message: 'Mike replied: "I agree with this!"',
  url: 'https://canopi.app/rooms/general',
  anchor: {
    target: '[data-thread-id="thread-456"]',
    highlightStyle: 'pulse'
  },
  data: {
    threadId: 'thread-456',
    authorName: 'Mike',
    replyContent: 'I agree with this!'
  }
});
```

### 6. Message Edit
```typescript
// Type definition
| 'MESSAGE_EDITED'

// Configuration
{
  id: 'MESSAGE_EDITED',
  name: 'Message Edits',
  description: 'Get notified when someone edits a message you replied to',
  icon: '✏️',
  enabled: false,
  sound: false,
  desktop: false,
  priority: 'low'
}

// Usage
await notificationManager.showNotification('MESSAGE_EDITED', {
  title: 'Message edited',
  message: 'John edited their message',
  anchor: {
    target: '[data-message-id="msg-789"]',
    highlightStyle: 'border'
  },
  data: {
    messageId: 'msg-789',
    authorName: 'John',
    editedAt: Date.now()
  }
});
```

---

## 📅 **Event & Calendar Notifications**

### 7. Event Reminder
```typescript
// Type definition
| 'EVENT_REMINDER'

// Configuration
{
  id: 'EVENT_REMINDER',
  name: 'Event Reminders',
  description: 'Get notified about upcoming events',
  icon: '📅',
  enabled: true,
  sound: true,
  desktop: true,
  priority: 'high'
}

// Usage
await notificationManager.showNotification('EVENT_REMINDER', {
  title: 'Event starting soon',
  message: 'Team meeting starts in 15 minutes',
  url: 'https://canopi.app/events/meeting-123',
  priority: 'high',
  data: {
    eventId: 'meeting-123',
    eventName: 'Team Meeting',
    startTime: Date.now() + 900000 // 15 min
  }
});
```

### 8. Event Invitation
```typescript
// Type definition
| 'EVENT_INVITATION'

// Configuration
{
  id: 'EVENT_INVITATION',
  name: 'Event Invitations',
  description: 'Get notified when invited to events',
  icon: '🎉',
  enabled: true,
  sound: true,
  desktop: true,
  priority: 'medium'
}

// Usage
await notificationManager.showNotification('EVENT_INVITATION', {
  title: 'Event invitation',
  message: 'Sarah invited you to "Project Launch Party"',
  url: 'https://canopi.app/events/party-456',
  data: {
    eventId: 'party-456',
    eventName: 'Project Launch Party',
    invitedBy: 'Sarah',
    eventDate: '2025-12-01'
  }
});
```

---

## 🏆 **Gamification Notifications**

### 9. Achievement Unlocked
```typescript
// Type definition
| 'ACHIEVEMENT_UNLOCKED'

// Configuration
{
  id: 'ACHIEVEMENT_UNLOCKED',
  name: 'Achievements',
  description: 'Get notified when you unlock achievements',
  icon: '🏆',
  enabled: true,
  sound: true,
  desktop: true,
  priority: 'low'
}

// Usage
await notificationManager.showNotification('ACHIEVEMENT_UNLOCKED', {
  title: 'Achievement Unlocked!',
  message: '🏆 First Message - Send your first message',
  url: 'https://canopi.app/profile/achievements',
  data: {
    achievementId: 'first-message',
    achievementName: 'First Message',
    points: 10
  }
});
```

### 10. Level Up
```typescript
// Type definition
| 'LEVEL_UP'

// Configuration
{
  id: 'LEVEL_UP',
  name: 'Level Up',
  description: 'Get notified when you level up',
  icon: '⬆️',
  enabled: true,
  sound: true,
  desktop: true,
  priority: 'medium'
}

// Usage
await notificationManager.showNotification('LEVEL_UP', {
  title: 'Level Up!',
  message: 'Congratulations! You reached level 5',
  url: 'https://canopi.app/profile',
  data: {
    newLevel: 5,
    previousLevel: 4,
    reward: 'New badge unlocked'
  }
});
```

### 11. Streak Milestone
```typescript
// Type definition
| 'STREAK_MILESTONE'

// Configuration
{
  id: 'STREAK_MILESTONE',
  name: 'Streak Milestones',
  description: 'Get notified about activity streaks',
  icon: '🔥',
  enabled: true,
  sound: false,
  desktop: true,
  priority: 'low'
}

// Usage
await notificationManager.showNotification('STREAK_MILESTONE', {
  title: '🔥 7-day streak!',
  message: 'You\'ve been active for 7 days in a row!',
  url: 'https://canopi.app/profile/stats',
  data: {
    streakDays: 7,
    milestone: 'week'
  }
});
```

---

## 🔔 **System & Admin Notifications**

### 12. System Maintenance
```typescript
// Type definition
| 'SYSTEM_MAINTENANCE'

// Configuration
{
  id: 'SYSTEM_MAINTENANCE',
  name: 'System Maintenance',
  description: 'Get notified about scheduled maintenance',
  icon: '🔧',
  enabled: true,
  sound: false,
  desktop: true,
  priority: 'high'
}

// Usage
await notificationManager.showNotification('SYSTEM_MAINTENANCE', {
  title: 'Scheduled Maintenance',
  message: 'System will be down for maintenance at 2 AM',
  priority: 'high',
  data: {
    maintenanceStart: '2025-12-01T02:00:00Z',
    maintenanceEnd: '2025-12-01T04:00:00Z',
    duration: '2 hours'
  }
});
```

### 13. Security Alert
```typescript
// Type definition
| 'SECURITY_ALERT'

// Configuration
{
  id: 'SECURITY_ALERT',
  name: 'Security Alerts',
  description: 'Get notified about security issues',
  icon: '🔒',
  enabled: true,
  sound: true,
  desktop: true,
  priority: 'high'
}

// Usage
await notificationManager.showNotification('SECURITY_ALERT', {
  title: 'Security Alert',
  message: 'New login from unknown device',
  url: 'https://canopi.app/security',
  priority: 'high',
  data: {
    device: 'iPhone 12',
    location: 'San Francisco, CA',
    timestamp: Date.now()
  }
});
```

### 14. Update Available
```typescript
// Type definition
| 'UPDATE_AVAILABLE'

// Configuration
{
  id: 'UPDATE_AVAILABLE',
  name: 'Updates',
  description: 'Get notified about app updates',
  icon: '🆙',
  enabled: true,
  sound: false,
  desktop: false,
  priority: 'low'
}

// Usage
await notificationManager.showNotification('UPDATE_AVAILABLE', {
  title: 'Update Available',
  message: 'Version 2.0 is now available',
  data: {
    version: '2.0.0',
    releaseNotes: 'New features and bug fixes',
    downloadUrl: 'https://canopi.app/download'
  }
});
```

---

## 📊 **Analytics & Reports**

### 15. Weekly Summary
```typescript
// Type definition
| 'WEEKLY_SUMMARY'

// Configuration
{
  id: 'WEEKLY_SUMMARY',
  name: 'Weekly Summary',
  description: 'Get your weekly activity summary',
  icon: '📊',
  enabled: true,
  sound: false,
  desktop: true,
  priority: 'low'
}

// Usage
await notificationManager.showNotification('WEEKLY_SUMMARY', {
  title: 'Your Week in Review',
  message: 'You sent 42 messages and received 156 reactions',
  url: 'https://canopi.app/analytics/weekly',
  data: {
    messagesSent: 42,
    reactionsReceived: 156,
    activeRooms: 8,
    newFriends: 3
  }
});
```

---

## 🎯 **Custom Business Logic**

### 16. Conditional Priority Example
```typescript
// In determinePriority() method
case 'DIRECT_MESSAGE':
  // High priority for DMs from VIP users
  if (data.data?.isVIP) {
    return 'high';
  }
  // Medium priority for regular users
  return 'medium';

case 'REACTION_RECEIVED':
  // High priority if reaction is from friend
  if (data.data?.isFriend) {
    return 'medium';
  }
  // Low priority otherwise
  return 'low';
```

### 17. Time-Based Priority
```typescript
case 'EVENT_REMINDER':
  const minutesUntilEvent = data.data?.minutesUntil || 0;
  
  // High priority if event starts soon
  if (minutesUntilEvent <= 15) {
    return 'high';
  }
  // Medium priority if event starts within an hour
  if (minutesUntilEvent <= 60) {
    return 'medium';
  }
  // Low priority otherwise
  return 'low';
```

---

## 🔄 **Batch Notifications**

### 18. Grouped Notifications
```typescript
// Multiple reactions grouped into one
await notificationManager.showNotification('REACTIONS_SUMMARY', {
  title: 'Multiple reactions',
  message: '5 people reacted to your message',
  anchor: {
    target: '[data-message-id="msg-123"]',
    highlightStyle: 'glow'
  },
  data: {
    messageId: 'msg-123',
    reactions: [
      { user: 'Sarah', emoji: '❤️' },
      { user: 'John', emoji: '👍' },
      { user: 'Mike', emoji: '🔥' },
      { user: 'Lisa', emoji: '⭐' },
      { user: 'Tom', emoji: '💯' }
    ],
    totalCount: 5
  }
});
```

---

## 📝 **Quick Reference**

### Priority Guidelines

| Priority | When to Use | Behavior |
|----------|-------------|----------|
| **High** | Urgent, time-sensitive, direct actions | Desktop always, sound always, 10s duration |
| **Medium** | Important but not urgent | Desktop if enabled, sound if enabled, 5s |
| **Low** | Nice-to-know, ambient updates | No desktop, no sound, 3s |

### Icon Categories

| Category | Examples |
|----------|----------|
| **Messages** | 💬 📨 ✉️ 📧 💌 |
| **Social** | 👥 🤝 👋 🎉 ⭐ |
| **Events** | 📅 ⏰ 🎯 🔔 |
| **Alerts** | ⚠️ 🚨 ⚡ 🔥 |
| **System** | 🔧 🔒 🆙 📊 |
| **Gamification** | 🏆 🔥 ⬆️ 💯 |

---

## 🚀 **Next Steps**

1. Choose notification types relevant to your app
2. Add them to the type definition
3. Configure their behavior
4. Test with real data
5. Adjust priorities based on user feedback

**Remember:** TypeScript will catch any typos or missing configurations automatically!




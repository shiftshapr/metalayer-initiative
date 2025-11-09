# NOTIFICATIONS & CONTENT ANCHOR - IMPLEMENTATION PLAN

**Date:** 2025-11-09  
**Project:** Metalayer Initiative - Presence Extension  
**Objective:** Complete notification system implementation with Content Anchor feature

---

## EXECUTIVE SUMMARY

This document outlines the comprehensive implementation plan for completing the notification system in the Presence extension, including the new **Content Anchor** feature that enables deep linking and highlighting of specific content when users interact with notifications.

### Current State
- ✅ Basic notification infrastructure exists
- ✅ NotificationHistoryManager class implemented
- ✅ UI components in place (icon, badge, modal)
- ⚠️ NotificationManager class partially implemented
- ❌ Chrome desktop notifications not integrated
- ❌ Content Anchor feature not implemented
- ❌ Notification preferences incomplete

### Target State
- ✅ Fully functional notification system
- ✅ Chrome desktop notifications with permissions
- ✅ Content Anchor for deep linking to content
- ✅ Complete notification preferences UI
- ✅ Comprehensive test coverage
- ✅ Full documentation

---

## PART 1: CONTENT ANCHOR FEATURE

### 1.1 Feature Definition

**Content Anchor** is a deep-linking system that allows notifications to:
1. Navigate to specific URLs/pages
2. Automatically scroll to target content
3. Highlight the target element with visual feedback
4. Maintain focus on the anchored content
5. Provide smooth user experience when jumping to content

### 1.2 Use Cases

#### Use Case 1: Message Notification
```
User receives notification: "John replied to your message"
User clicks notification → 
  1. Opens Canopi tab
  2. Navigates to correct room/thread
  3. Scrolls to John's reply message
  4. Highlights the message with glow effect
  5. Auto-dismisses highlight after 3 seconds
```

#### Use Case 2: Aura Change Notification
```
User receives notification: "Sarah changed their aura color"
User clicks notification →
  1. Opens Canopi tab
  2. Navigates to People or Community view
  3. Scrolls to Sarah's profile card
  4. Highlights Sarah's avatar with pulse effect
  5. Shows aura color change animation
```

#### Use Case 3: Mention Notification
```
User receives notification: "You were mentioned in #general"
User clicks notification →
  1. Opens Canopi tab
  2. Switches to #general room
  3. Scrolls to the mention
  4. Highlights the message
  5. Focuses the reply input
```

### 1.3 Technical Architecture

#### Components

1. **ContentAnchorManager** (New Class)
   - Manages navigation and anchoring logic
   - Handles URL parsing and routing
   - Coordinates with NavigationManager
   - Manages highlight animations

2. **AnchorHighlighter** (New Class)
   - Applies visual highlights to elements
   - Manages animation timing
   - Handles different highlight styles
   - Cleans up after highlighting

3. **AnchorNavigator** (New Class)
   - Handles URL navigation
   - Manages tab switching
   - Coordinates with Chrome tabs API
   - Handles scroll positioning

#### Data Structure

```javascript
{
  type: 'MESSAGE_NEW',
  title: 'New message from John',
  message: 'Hey, check this out!',
  url: 'https://canopi.app/rooms/general',
  anchor: {
    target: '[data-message-id="msg-123"]',  // CSS selector
    targetId: 'msg-123',                     // Element ID
    targetType: 'message',                   // Type: message, profile, room, etc.
    scrollBehavior: 'smooth',                // Scroll behavior
    highlightStyle: 'pulse',                 // Highlight animation
    highlightDuration: 3000,                 // Duration in ms
    autoFocus: true,                         // Focus element after highlight
    metadata: {                              // Additional context
      roomId: 'room-456',
      threadId: 'thread-789',
      authorId: 'user-john'
    }
  }
}
```

### 1.4 Implementation Steps

#### Step 1: Create ContentAnchorManager
```javascript
class ContentAnchorManager {
  constructor() {
    this.activeAnchors = new Map();
    this.highlighter = new AnchorHighlighter();
    this.navigator = new AnchorNavigator();
  }
  
  async navigateToAnchor(anchorData) {
    // 1. Navigate to URL
    // 2. Wait for page load
    // 3. Find target element
    // 4. Scroll to element
    // 5. Apply highlight
    // 6. Handle focus
  }
  
  async highlightElement(selector, style, duration) {
    // Apply visual highlight to element
  }
  
  async scrollToElement(selector, behavior) {
    // Smooth scroll to element
  }
}
```

#### Step 2: Create AnchorHighlighter
```javascript
class AnchorHighlighter {
  applyHighlight(element, style, duration) {
    // Add highlight class/animation
    // Set timeout for removal
    // Return promise that resolves when done
  }
  
  removeHighlight(element) {
    // Remove highlight class/animation
  }
  
  getHighlightStyles() {
    return {
      pulse: 'anchor-highlight-pulse',
      glow: 'anchor-highlight-glow',
      flash: 'anchor-highlight-flash',
      border: 'anchor-highlight-border'
    };
  }
}
```

#### Step 3: Create AnchorNavigator
```javascript
class AnchorNavigator {
  async navigateToUrl(url, openInNewTab = false) {
    // Handle URL navigation
    // Manage tab switching
    // Wait for page load
  }
  
  async waitForElement(selector, timeout = 5000) {
    // Wait for element to appear in DOM
    // Return element or timeout
  }
  
  async scrollToElement(element, behavior = 'smooth') {
    // Scroll element into view
    // Handle offset for fixed headers
  }
}
```

#### Step 4: Add CSS Animations
```css
/* Highlight Animations */
@keyframes anchor-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
}

@keyframes anchor-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
}

.anchor-highlight-pulse {
  animation: anchor-pulse 1.5s ease-in-out 2;
  border: 2px solid #3b82f6;
  border-radius: 8px;
}

.anchor-highlight-glow {
  animation: anchor-glow 2s ease-in-out 2;
  border-radius: 8px;
}
```

#### Step 5: Integrate with NotificationManager
```javascript
class NotificationManager {
  async showNotification(type, data) {
    // Create notification
    // Add anchor data
    // Register click handler
    
    notification.onclick = async () => {
      if (data.anchor) {
        await window.contentAnchorManager.navigateToAnchor(data.anchor);
      }
    };
  }
}
```

---

## PART 2: NOTIFICATION MANAGER COMPLETION

### 2.1 Missing Methods Implementation

#### getAllNotificationTypes()
```javascript
getAllNotificationTypes() {
  return [
    {
      id: 'MESSAGE_NEW',
      name: 'New Messages',
      description: 'Get notified when someone sends a message',
      icon: '💬',
      enabled: true,
      sound: true,
      desktop: true
    },
    {
      id: 'MENTION',
      name: 'Mentions',
      description: 'Get notified when someone mentions you',
      icon: '🗣️',
      enabled: true,
      sound: true,
      desktop: true
    },
    {
      id: 'REPLY',
      name: 'Replies',
      description: 'Get notified when someone replies to your message',
      icon: '↩️',
      enabled: true,
      sound: true,
      desktop: true
    },
    {
      id: 'FRIEND_AURA_CHANGE',
      name: 'Friend Aura Changes',
      description: 'Get notified when friends change their aura',
      icon: '✨',
      enabled: false,
      sound: false,
      desktop: false
    },
    {
      id: 'COMMUNITY_JOIN',
      name: 'Community Activity',
      description: 'Get notified about community events',
      icon: '👥',
      enabled: false,
      sound: false,
      desktop: false
    },
    {
      id: 'ROOM_INVITE',
      name: 'Room Invitations',
      description: 'Get notified when invited to rooms',
      icon: '🚪',
      enabled: true,
      sound: true,
      desktop: true
    }
  ];
}
```

#### setEnabled()
```javascript
async setEnabled(notificationType, enabled) {
  try {
    // Get current settings
    const settings = await this.getSettings();
    
    // Update setting
    if (!settings.types) settings.types = {};
    settings.types[notificationType] = {
      ...settings.types[notificationType],
      enabled: enabled
    };
    
    // Save settings
    await this.saveSettings(settings);
    
    this.log('INFO', `Notification type ${notificationType} ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    this.log('ERROR', 'Error setting notification enabled state:', error);
    throw error;
  }
}
```

#### showNotification()
```javascript
async showNotification(type, data) {
  try {
    // Check if notification type is enabled
    const settings = await this.getSettings();
    const typeSettings = settings.types?.[type];
    
    if (!typeSettings?.enabled) {
      this.log('DEBUG', `Notification type ${type} is disabled`);
      return;
    }
    
    // Create notification data
    const notificationData = this.buildNotificationData(type, data);
    
    // Show desktop notification if enabled
    if (typeSettings.desktop && this.hasPermission()) {
      await this.showDesktopNotification(notificationData);
    }
    
    // Add to history
    if (window.notificationHistory) {
      await window.notificationHistory.addNotification(notificationData);
    }
    
    // Play sound if enabled
    if (typeSettings.sound) {
      this.playNotificationSound(type);
    }
    
    // Update badge
    this.updateBadge();
    
    this.log('INFO', `Notification shown: ${type}`);
  } catch (error) {
    this.log('ERROR', 'Error showing notification:', error);
    throw error;
  }
}
```

### 2.2 Chrome Desktop Notifications

#### Permission Handling
```javascript
async requestPermission() {
  try {
    if (!('Notification' in window)) {
      this.log('WARN', 'Desktop notifications not supported');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  } catch (error) {
    this.log('ERROR', 'Error requesting notification permission:', error);
    return false;
  }
}

hasPermission() {
  return 'Notification' in window && Notification.permission === 'granted';
}
```

#### Desktop Notification Display
```javascript
async showDesktopNotification(data) {
  try {
    if (!this.hasPermission()) {
      this.log('WARN', 'No permission for desktop notifications');
      return;
    }
    
    const notification = new Notification(data.title, {
      body: data.message,
      icon: '/images/icon128.png',
      badge: '/images/icon48.png',
      tag: data.id,
      requireInteraction: false,
      silent: false,
      data: {
        url: data.url,
        anchor: data.anchor
      }
    });
    
    // Handle click
    notification.onclick = async () => {
      notification.close();
      
      // Navigate to URL with anchor
      if (data.anchor) {
        await window.contentAnchorManager.navigateToAnchor(data.anchor);
      } else if (data.url) {
        await chrome.tabs.create({ url: data.url });
      }
    };
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    
    this.log('INFO', 'Desktop notification shown:', data.title);
  } catch (error) {
    this.log('ERROR', 'Error showing desktop notification:', error);
  }
}
```

### 2.3 Notification Settings Storage

```javascript
async getSettings() {
  try {
    const result = await chrome.storage.local.get('notificationSettings');
    return result.notificationSettings || this.getDefaultSettings();
  } catch (error) {
    this.log('ERROR', 'Error getting settings:', error);
    return this.getDefaultSettings();
  }
}

async saveSettings(settings) {
  try {
    await chrome.storage.local.set({ notificationSettings: settings });
    this.log('INFO', 'Settings saved');
  } catch (error) {
    this.log('ERROR', 'Error saving settings:', error);
    throw error;
  }
}

getDefaultSettings() {
  return {
    enabled: true,
    sound: true,
    desktop: true,
    types: this.getAllNotificationTypes().reduce((acc, type) => {
      acc[type.id] = {
        enabled: type.enabled,
        sound: type.sound,
        desktop: type.desktop
      };
      return acc;
    }, {})
  };
}
```

---

## PART 3: INTEGRATION POINTS

### 3.1 CanopiModule Integration

#### Message Events
```javascript
// In CanopiModule.js - Add to message handlers

// New message
async handleNewMessage(message) {
  // Existing code...
  
  // Add notification with anchor
  if (window.notificationManager) {
    await window.notificationManager.showNotification('MESSAGE_NEW', {
      authorName: message.user_email,
      content: message.content,
      authorId: message.user_id,
      url: window.location.href,
      anchor: {
        target: `[data-message-id="${message.id}"]`,
        targetId: message.id,
        targetType: 'message',
        highlightStyle: 'pulse',
        metadata: {
          roomId: message.room_id,
          threadId: message.thread_id
        }
      }
    });
  }
}

// Reply to message
async handleReply(parentMessage, replyMessage) {
  // Existing code...
  
  // Notify parent message author
  if (window.notificationManager && parentMessage.user_id !== currentUserId) {
    await window.notificationManager.showNotification('REPLY', {
      authorName: replyMessage.user_email,
      content: replyMessage.content,
      parentContent: parentMessage.content,
      url: window.location.href,
      anchor: {
        target: `[data-message-id="${replyMessage.id}"]`,
        targetId: replyMessage.id,
        targetType: 'reply',
        highlightStyle: 'glow'
      }
    });
  }
}
```

### 3.2 RealtimeManager Integration

```javascript
// In RealtimeManager.js - Update realtime handlers

handleRealtimeMessage(payload) {
  // Existing code...
  
  // Add notification with anchor
  if (window.notificationManager) {
    window.notificationManager.showNotification('MESSAGE_NEW', {
      authorName: payload.new.user_email,
      content: payload.new.content,
      url: this.buildMessageUrl(payload.new),
      anchor: {
        target: `[data-message-id="${payload.new.id}"]`,
        targetId: payload.new.id,
        targetType: 'message',
        highlightStyle: 'pulse'
      }
    });
  }
}
```

### 3.3 NavigationManager Integration

```javascript
// In NavigationManager.js - Add anchor support

async navigateToUrl(url, anchor = null) {
  try {
    // Navigate to URL
    await this.performNavigation(url);
    
    // If anchor provided, handle it
    if (anchor && window.contentAnchorManager) {
      await window.contentAnchorManager.navigateToAnchor(anchor);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
}
```

---

## PART 4: TESTING STRATEGY

### 4.1 Unit Tests

```javascript
// Test NotificationManager
describe('NotificationManager', () => {
  test('should initialize correctly', async () => {
    const manager = new NotificationManager();
    await manager.initialize();
    expect(manager.isInitialized).toBe(true);
  });
  
  test('should get all notification types', () => {
    const manager = new NotificationManager();
    const types = manager.getAllNotificationTypes();
    expect(types.length).toBeGreaterThan(0);
    expect(types[0]).toHaveProperty('id');
    expect(types[0]).toHaveProperty('enabled');
  });
  
  test('should enable/disable notification types', async () => {
    const manager = new NotificationManager();
    await manager.setEnabled('MESSAGE_NEW', false);
    const settings = await manager.getSettings();
    expect(settings.types.MESSAGE_NEW.enabled).toBe(false);
  });
});

// Test ContentAnchorManager
describe('ContentAnchorManager', () => {
  test('should navigate to anchor', async () => {
    const manager = new ContentAnchorManager();
    const anchor = {
      target: '[data-test="element"]',
      highlightStyle: 'pulse'
    };
    await manager.navigateToAnchor(anchor);
    // Verify navigation and highlight
  });
  
  test('should highlight element', async () => {
    const manager = new ContentAnchorManager();
    const element = document.createElement('div');
    await manager.highlighter.applyHighlight(element, 'pulse', 3000);
    expect(element.classList.contains('anchor-highlight-pulse')).toBe(true);
  });
});
```

### 4.2 Integration Tests

```javascript
// Test full notification flow
describe('Notification Flow', () => {
  test('should show notification and navigate on click', async () => {
    // 1. Trigger notification
    await window.notificationManager.showNotification('MESSAGE_NEW', {
      authorName: 'Test User',
      content: 'Test message',
      anchor: { target: '[data-test="msg"]' }
    });
    
    // 2. Verify notification appears
    const notification = document.querySelector('.notification-item');
    expect(notification).toBeTruthy();
    
    // 3. Click notification
    notification.click();
    
    // 4. Verify navigation and highlight
    await waitFor(() => {
      const highlighted = document.querySelector('.anchor-highlight-pulse');
      expect(highlighted).toBeTruthy();
    });
  });
});
```

### 4.3 Manual Test Cases

#### Test Case 1: Desktop Notification Permission
1. Open extension
2. Go to Settings → Notifications
3. Click "Enable Desktop Notifications"
4. Verify browser permission prompt appears
5. Grant permission
6. Verify setting is saved

#### Test Case 2: Content Anchor Navigation
1. Receive notification for new message
2. Click notification
3. Verify:
   - Correct tab opens/focuses
   - Page scrolls to message
   - Message highlights with pulse effect
   - Highlight fades after 3 seconds

#### Test Case 3: Notification Preferences
1. Go to Settings → Notifications
2. Disable "New Messages" notifications
3. Send a test message
4. Verify no notification appears
5. Re-enable notifications
6. Send another test message
7. Verify notification appears

---

## PART 5: IMPLEMENTATION TIMELINE

### Phase 1: Core Infrastructure (Days 1-2)
- ✅ Create ContentAnchorManager class
- ✅ Create AnchorHighlighter class
- ✅ Create AnchorNavigator class
- ✅ Add CSS animations for highlights
- ✅ Basic anchor navigation working

### Phase 2: NotificationManager Completion (Days 3-4)
- ✅ Implement getAllNotificationTypes()
- ✅ Implement setEnabled()
- ✅ Implement showNotification()
- ✅ Add Chrome desktop notifications
- ✅ Add permission handling
- ✅ Settings storage implementation

### Phase 3: Integration (Days 5-6)
- ✅ Integrate with CanopiModule
- ✅ Integrate with RealtimeManager
- ✅ Integrate with NavigationManager
- ✅ Update notification history system
- ✅ Add anchor data to all notifications

### Phase 4: Testing (Days 7-8)
- ✅ Write unit tests
- ✅ Write integration tests
- ✅ Manual testing
- ✅ Bug fixes
- ✅ Performance optimization

### Phase 5: Documentation & Polish (Day 9)
- ✅ Update documentation
- ✅ Create user guide
- ✅ Code cleanup
- ✅ Final review

---

## PART 6: FILE STRUCTURE

```
/home/ubuntu/metalayer-initiative/presence/
├── features/
│   ├── NotificationManager.js (UPDATE)
│   ├── ContentAnchorManager.js (NEW)
│   ├── AnchorHighlighter.js (NEW)
│   ├── AnchorNavigator.js (NEW)
│   ├── CanopiModule.js (UPDATE)
│   ├── RealtimeManager.js (UPDATE)
│   └── NavigationManager.js (UPDATE)
├── styles/
│   └── anchor-highlights.css (NEW)
├── tests/
│   ├── NotificationManager.test.js (NEW)
│   ├── ContentAnchorManager.test.js (NEW)
│   └── notification-flow.test.js (NEW)
├── docs/
│   ├── NOTIFICATIONS_USER_GUIDE.md (NEW)
│   └── CONTENT_ANCHOR_SPEC.md (NEW)
└── sidepanel.html (UPDATE)
```

---

## PART 7: SECURITY CONSIDERATIONS

### 7.1 Content Anchor Security
- ✅ Validate all anchor targets (CSS selectors)
- ✅ Sanitize URLs before navigation
- ✅ Prevent XSS through anchor data
- ✅ Validate element existence before highlighting
- ✅ Rate limit anchor navigation requests

### 7.2 Notification Security
- ✅ Validate notification data
- ✅ Sanitize notification content
- ✅ Prevent notification spam
- ✅ Secure storage of notification history
- ✅ Proper permission handling

### 7.3 Privacy Considerations
- ✅ User consent for desktop notifications
- ✅ Clear notification data retention policy
- ✅ Option to clear notification history
- ✅ No sensitive data in notification content
- ✅ Respect user's notification preferences

---

## PART 8: PERFORMANCE OPTIMIZATION

### 8.1 Notification Performance
- Debounce rapid notifications
- Batch notification updates
- Lazy load notification history
- Limit stored notifications (max 100)
- Efficient DOM updates

### 8.2 Anchor Performance
- Cache element selectors
- Optimize scroll calculations
- Efficient highlight animations (CSS only)
- Cleanup after highlighting
- Prevent memory leaks

### 8.3 Storage Optimization
- Compress notification data
- Periodic cleanup of old notifications
- Efficient indexing for searches
- Minimize storage writes

---

## PART 9: ACCESSIBILITY

### 9.1 Screen Reader Support
- ARIA labels for notification elements
- Announce new notifications
- Keyboard navigation for notification list
- Focus management for anchored content

### 9.2 Keyboard Navigation
- Tab through notifications
- Enter to open notification
- Escape to close modal
- Arrow keys for navigation

### 9.3 Visual Accessibility
- High contrast mode support
- Adjustable highlight intensity
- Respect prefers-reduced-motion
- Color-blind friendly highlights

---

## PART 10: NEXT STEPS

### Immediate Actions
1. ✅ Review and approve this implementation plan
2. ⏳ Create ContentAnchorManager class
3. ⏳ Complete NotificationManager implementation
4. ⏳ Add CSS animations
5. ⏳ Begin integration work

### Questions for Clarification
1. **Content Anchor Behavior**: Should anchored content remain highlighted until user interacts with it, or auto-fade?
   - **Recommendation**: Auto-fade after 3 seconds for better UX

2. **Notification Sounds**: Should we implement custom notification sounds?
   - **Recommendation**: Use browser default sounds initially, add custom sounds later

3. **Notification Priority**: Should some notifications have higher priority than others?
   - **Recommendation**: Yes, implement priority levels (high, medium, low)

4. **Offline Behavior**: How should notifications work when user is offline?
   - **Recommendation**: Queue notifications and show when back online

5. **Cross-Tab Synchronization**: Should notifications sync across multiple tabs?
   - **Recommendation**: Yes, use chrome.storage for sync

---

## APPENDIX A: API REFERENCE

### ContentAnchorManager API
```javascript
// Navigate to anchored content
await contentAnchorManager.navigateToAnchor({
  target: '[data-message-id="123"]',
  targetId: '123',
  targetType: 'message',
  scrollBehavior: 'smooth',
  highlightStyle: 'pulse',
  highlightDuration: 3000,
  autoFocus: true
});

// Highlight element directly
await contentAnchorManager.highlightElement(
  '[data-message-id="123"]',
  'pulse',
  3000
);

// Scroll to element
await contentAnchorManager.scrollToElement(
  '[data-message-id="123"]',
  'smooth'
);
```

### NotificationManager API
```javascript
// Show notification
await notificationManager.showNotification('MESSAGE_NEW', {
  authorName: 'John Doe',
  content: 'Hello!',
  url: 'https://canopi.app/rooms/general',
  anchor: { target: '[data-message-id="123"]' }
});

// Get notification types
const types = notificationManager.getAllNotificationTypes();

// Enable/disable notification type
await notificationManager.setEnabled('MESSAGE_NEW', false);

// Request permission
const granted = await notificationManager.requestPermission();
```

---

## APPENDIX B: NOTIFICATION TYPES

| Type | Icon | Default Enabled | Desktop | Sound | Description |
|------|------|----------------|---------|-------|-------------|
| MESSAGE_NEW | 💬 | ✅ | ✅ | ✅ | New message in any room |
| MENTION | 🗣️ | ✅ | ✅ | ✅ | User is mentioned |
| REPLY | ↩️ | ✅ | ✅ | ✅ | Reply to user's message |
| FRIEND_AURA_CHANGE | ✨ | ❌ | ❌ | ❌ | Friend changes aura |
| COMMUNITY_JOIN | 👥 | ❌ | ❌ | ❌ | Community activity |
| ROOM_INVITE | 🚪 | ✅ | ✅ | ✅ | Invited to room |

---

## APPENDIX C: HIGHLIGHT STYLES

| Style | Animation | Duration | Use Case |
|-------|-----------|----------|----------|
| pulse | Box shadow pulse | 1.5s × 2 | Messages, replies |
| glow | Glowing effect | 2s × 2 | Important content |
| flash | Quick flash | 0.5s × 3 | Urgent notifications |
| border | Animated border | 2s × 1 | Subtle highlights |

---

## CONCLUSION

This implementation plan provides a comprehensive roadmap for completing the notification system with the Content Anchor feature. The plan follows the Canopi collaboration workflow and includes all necessary components for a production-ready implementation.

**Estimated Effort:** 9 days  
**Priority:** High  
**Dependencies:** None  
**Risk Level:** Low

**Ready to proceed with implementation.**

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-09  
**Author:** AI Assistant  
**Status:** PENDING APPROVAL



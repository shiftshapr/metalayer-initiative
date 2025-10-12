/**
 * Modular Notification Manager
 * Handles Chrome notifications with database-stored preferences
 */

class NotificationManager {
  constructor() {
    this.notificationTypes = {
      MESSAGE_NEW: {
        id: 'message_new',
        name: 'New Messages',
        description: 'Get notified when new messages are posted',
        defaultEnabled: true,
        icon: '💬'
      },
      MESSAGE_MENTION: {
        id: 'message_mention',
        name: '@Mentions',
        description: 'Get notified when someone mentions you',
        defaultEnabled: true,
        icon: '🔔'
      },
      COMMUNITY_JOIN: {
        id: 'community_join',
        name: 'Community Joins',
        description: 'Get notified when someone joins your community',
        defaultEnabled: false,
        icon: '👥'
      },
      FRIEND_AURA_CHANGE: {
        id: 'friend_aura_change',
        name: 'Friend Aura Changes',
        description: 'Get notified when friends change their aura color',
        defaultEnabled: false,
        icon: '🎨'
      }
    };
    
    this.preferences = new Map();
    this.initialized = false;
    
    console.log('🔔 NOTIFICATION MANAGER: Initialized with', Object.keys(this.notificationTypes).length, 'notification types');
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('🔔 NOTIFICATION MANAGER: Initializing...');
      
      // Load notification preferences from storage
      await this.loadPreferences();
      
      // Request notification permission
      await this.requestPermission();
      
      this.initialized = true;
      console.log('🔔 NOTIFICATION MANAGER: Initialized successfully');
    } catch (error) {
      console.error('🔔 NOTIFICATION MANAGER: Initialization failed:', error);
    }
  }

  async requestPermission() {
    try {
      const permission = await chrome.notifications.getPermissionLevel();
      console.log('🔔 NOTIFICATION MANAGER: Current permission level:', permission);
      
      if (permission === 'denied') {
        console.warn('🔔 NOTIFICATION MANAGER: Notifications are denied by user');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔔 NOTIFICATION MANAGER: Error checking notification permission:', error);
      return false;
    }
  }

  async loadPreferences() {
    try {
      const result = await chrome.storage.local.get(['notificationPreferences']);
      const stored = result.notificationPreferences || {};
      
      // Initialize preferences with defaults
      for (const [type, config] of Object.entries(this.notificationTypes)) {
        this.preferences.set(config.id, stored[config.id] ?? config.defaultEnabled);
      }
      
      console.log('🔔 NOTIFICATION MANAGER: Loaded preferences:', Object.fromEntries(this.preferences));
    } catch (error) {
      console.error('🔔 NOTIFICATION MANAGER: Error loading preferences:', error);
      // Fall back to defaults
      for (const [type, config] of Object.entries(this.notificationTypes)) {
        this.preferences.set(config.id, config.defaultEnabled);
      }
    }
  }

  async savePreferences() {
    try {
      const preferences = Object.fromEntries(this.preferences);
      await chrome.storage.local.set({ notificationPreferences: preferences });
      console.log('🔔 NOTIFICATION MANAGER: Saved preferences:', preferences);
    } catch (error) {
      console.error('🔔 NOTIFICATION MANAGER: Error saving preferences:', error);
    }
  }

  isEnabled(notificationType) {
    return this.preferences.get(notificationType) ?? false;
  }

  async setEnabled(notificationType, enabled) {
    this.preferences.set(notificationType, enabled);
    await this.savePreferences();
    console.log(`🔔 NOTIFICATION MANAGER: ${notificationType} ${enabled ? 'enabled' : 'disabled'}`);
  }

  async showNotification(type, data) {
    if (!this.initialized) {
      console.warn('🔔 NOTIFICATION MANAGER: Not initialized, skipping notification');
      return;
    }

    const config = this.notificationTypes[type];
    if (!config) {
      console.warn('🔔 NOTIFICATION MANAGER: Unknown notification type:', type);
      return;
    }

    if (!this.isEnabled(config.id)) {
      console.log(`🔔 NOTIFICATION MANAGER: ${config.name} notifications are disabled`);
      return;
    }

    try {
      const notification = this.createNotification(config, data);
      await chrome.notifications.create(notification);
      console.log(`🔔 NOTIFICATION MANAGER: ${config.name} notification sent`);
    } catch (error) {
      console.error('🔔 NOTIFICATION MANAGER: Error showing notification:', error);
    }
  }

  createNotification(config, data) {
    const notificationId = `${config.id}_${Date.now()}`;
    
    return {
      type: 'basic',
      iconUrl: 'images/icon48.png',
      title: this.getNotificationTitle(config, data),
      message: this.getNotificationMessage(config, data),
      contextMessage: 'Canopi',
      buttons: this.getNotificationButtons(config, data),
      requireInteraction: false,
      silent: false
    };
  }

  getNotificationTitle(config, data) {
    switch (config.id) {
      case 'message_new':
        return `💬 New message from ${data.authorName || 'Someone'}`;
      case 'message_mention':
        return `🔔 ${data.authorName || 'Someone'} mentioned you`;
      case 'community_join':
        return `👥 ${data.userName || 'Someone'} joined your community`;
      case 'friend_aura_change':
        return `🎨 ${data.userName || 'A friend'} changed their aura`;
      default:
        return config.name;
    }
  }

  getNotificationMessage(config, data) {
    switch (config.id) {
      case 'message_new':
        return data.content ? data.content.substring(0, 100) + (data.content.length > 100 ? '...' : '') : 'New message';
      case 'message_mention':
        return data.content ? data.content.substring(0, 100) + (data.content.length > 100 ? '...' : '') : 'You were mentioned';
      case 'community_join':
        return `${data.userName || 'Someone'} joined ${data.communityName || 'your community'}`;
      case 'friend_aura_change':
        return `${data.userName || 'A friend'} changed their aura to ${data.auraColor || 'a new color'}`;
      default:
        return config.description;
    }
  }

  getNotificationButtons(config, data) {
    const buttons = [];
    
    // Add "View" button for messages
    if (config.id === 'message_new' || config.id === 'message_mention') {
      buttons.push({ title: 'View Message' });
    }
    
    // Add "View Profile" button for user-related notifications
    if (config.id === 'community_join' || config.id === 'friend_aura_change') {
      buttons.push({ title: 'View Profile' });
    }
    
    return buttons;
  }

  // Add new notification type dynamically
  addNotificationType(type, config) {
    this.notificationTypes[type] = config;
    this.preferences.set(config.id, config.defaultEnabled);
    console.log(`🔔 NOTIFICATION MANAGER: Added new notification type: ${config.name}`);
  }

  // Get all notification types for settings UI
  getAllNotificationTypes() {
    return Object.entries(this.notificationTypes).map(([type, config]) => ({
      type,
      ...config,
      enabled: this.isEnabled(config.id)
    }));
  }

  // Handle notification click events
  async handleNotificationClick(notificationId, buttonIndex) {
    console.log('🔔 NOTIFICATION MANAGER: Notification clicked:', notificationId, buttonIndex);
    
    // Parse notification type from ID
    const type = notificationId.split('_')[0];
    
    switch (type) {
      case 'message':
        // Focus on the side panel or open it
        await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
        break;
      case 'community':
        // Open community settings or profile
        console.log('🔔 NOTIFICATION MANAGER: Opening community view');
        break;
      default:
        console.log('🔔 NOTIFICATION MANAGER: Unknown notification type clicked');
    }
  }
}

// Global notification manager instance
window.notificationManager = new NotificationManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager.initialize();
  });
} else {
  window.notificationManager.initialize();
}

console.log('🔔 NOTIFICATION MANAGER: Module loaded');
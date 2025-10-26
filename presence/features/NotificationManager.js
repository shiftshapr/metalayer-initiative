/**
 * NOTIFICATION MANAGER - Notifications and Alerts
 * Handles all notification functionality
 */

class NotificationManager {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }

  /**
   * Initialize NotificationManager module
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'NotificationManager already initialized');
      return;
    }

    this.log('INFO', 'Initializing NotificationManager...');
    
    try {
      // TODO: Initialize notification systems here
      
      this.isInitialized = true;
      this.log('INFO', 'NotificationManager initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize NotificationManager:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  log(level, message, ...args) {
    if (this.logLevel === 'SILENT') return;
    
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[NotificationManager] [${level}] ${message}`, ...args);
    }
  }
}

// ===== NOTIFICATION FUNCTIONS (Move from sidepanel.js) =====
// TODO: Move these functions from sidepanel.js:

function showNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  

// Initialize notification settings UI
async function initializeNotificationSettings() {
    try {
      console.log('🔔 SETTINGS: Initializing notification settings UI...');
      
      const settingsContainer = document.getElementById('notification-settings');
      if (!settingsContainer) {
        console.warn('🔔 SETTINGS: Notification settings container not found');
        return;
      }
      
      if (!window.notificationManager) {
        console.warn('🔔 SETTINGS: Notification manager not available');
        return;
      }
      
      // Wait for notification manager to initialize
      await window.notificationManager.initialize();
      
      // Get all notification types
      const notificationTypes = window.notificationManager.getAllNotificationTypes();
      
      // Clear existing content
      settingsContainer.innerHTML = '';
      
      // Create notification items
      notificationTypes.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.innerHTML = `
          <div class="notification-info">
            <div class="notification-icon">${notification.icon}</div>
            <div class="notification-details">
              <h5>${notification.name}</h5>
              <p>${notification.description}</p>
            </div>
          </div>
          <label class="notification-toggle">
            <input type="checkbox" ${notification.enabled ? 'checked' : ''} 
                   data-notification-type="${notification.id}">
            <span class="notification-slider"></span>
          </label>
        `;
        
        settingsContainer.appendChild(notificationItem);
      });
      
      // Add event listeners for toggles
      const toggles = settingsContainer.querySelectorAll('.notification-toggle input');
      toggles.forEach(toggle => {
        toggle.addEventListener('change', async (e) => {
          const notificationType = e.target.dataset.notificationType;
          const enabled = e.target.checked;
          
          console.log(`🔔 SETTINGS: ${notificationType} ${enabled ? 'enabled' : 'disabled'}`, null, 'general');
          
          await window.notificationManager.setEnabled(notificationType, enabled);
        });
      });
      
      console.log('🔔 SETTINGS: Notification settings UI initialized');
    } catch (error) {
      console.error('🔔 SETTINGS: Error initializing notification settings:', error);
    }
  }

// Initialize notification icon in header
function initializeNotificationIcon() {
    try {
      console.log('🔔 ICON: Initializing notification icon...');
      
      const notificationIcon = document.getElementById('notification-icon');
      if (!notificationIcon) {
        console.warn('🔔 ICON: Notification icon not found');
        return;
      }
      
      // Add click handler to open settings
      notificationIcon.addEventListener('click', () => {
        console.log('🔔 ICON: Notification icon clicked');
        
        // Switch to Settings tab
        const settingsTab = document.querySelector('[data-tab="settings-tab"]');
        if (settingsTab) {
          settingsTab.click();
        }
      });
      
      // Add hover effect
      notificationIcon.addEventListener('mouseenter', () => {
        notificationIcon.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        notificationIcon.style.borderRadius = '4px';
      });
      
      notificationIcon.addEventListener('mouseleave', () => {
        notificationIcon.style.backgroundColor = 'transparent';
      });
      
      console.log('🔔 ICON: Notification icon initialized');
    } catch (error) {
      console.error('🔔 ICON: Error initializing notification icon:', error);
    }
  }
  
  // Show notification badge
  function showNotificationBadge() {
    try {
      const badge = document.getElementById('notification-badge');
      if (badge) {
        badge.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          badge.style.display = 'none';
        }, 5000);
      }
    } catch (error) {
      console.error('🔔 BADGE: Error showing notification badge:', error);
    }
  }
  
  // Test notification system (for debugging)
  window.testNotification = async function(type = 'MESSAGE_NEW') {
    try {
      console.log('🔔 TEST: Testing notification system...');
      
      if (!window.notificationManager) {
        console.error('🔔 TEST: Notification manager not available');
        return;
      }
      
      const testData = {
        MESSAGE_NEW: {
          authorName: 'Test User',
          content: 'This is a test message notification',
          authorEmail: window.currentUser?.email || 'user@example.com'
        },
        FRIEND_AURA_CHANGE: {
          userName: 'Test Friend',
          auraColor: '#ff0000',
          userEmail: 'friend@example.com'
        }
      };
      
      await window.notificationManager.showNotification(type, testData[type] || testData.MESSAGE_NEW);
      showNotificationBadge();
      
      console.log('🔔 TEST: Test notification sent');
    } catch (error) {
      console.error('🔔 TEST: Error testing notification:', error);
    }
  };
  
  // Test notification icon visibility
  window.testNotificationIcon = function() {
    try {
      console.log('🔔 ICON TEST: Testing notification icon visibility...');
      
      const notificationIcon = document.getElementById('notification-icon');
      if (!notificationIcon) {
        console.error('🔔 ICON TEST: Notification icon not found in DOM');
        return;
      }
      
      console.log('🔔 ICON TEST: Notification icon found:', notificationIcon);
      console.log('🔔 ICON TEST: Icon display style:', notificationIcon.style.display);
      console.log('🔔 ICON TEST: Icon computed style:', window.getComputedStyle(notificationIcon).display);
      
      // Make sure it's visible
      notificationIcon.style.display = 'block';
      notificationIcon.style.visibility = 'visible';
      
      // Test badge
      const badge = document.getElementById('notification-badge');
      if (badge) {
        badge.style.display = 'block';
        badge.textContent = '1';
        console.log('🔔 ICON TEST: Badge shown');
      }
      
      console.log('🔔 ICON TEST: Notification icon should now be visible');
    } catch (error) {
      console.error('🔔 ICON TEST: Error testing notification icon:', error);
    }
  };
  
  // Comprehensive notification system test
  window.testFullNotificationSystem = async function() {
    try {
      console.log('🔔 FULL TEST: Testing complete notification system...');
      
      // 1. Test notification icon visibility
      console.log('🔔 FULL TEST: Step 1 - Testing notification icon...');
      window.testNotificationIcon();
      
      // 2. Test Chrome desktop notification
      console.log('🔔 FULL TEST: Step 2 - Testing Chrome desktop notification...');
      await window.testNotification('MESSAGE_NEW');
      
      // 3. Test notification badge
      console.log('🔔 FULL TEST: Step 3 - Testing notification badge...');
      showNotificationBadge();
      
      // 4. Test notification history modal
      console.log('🔔 FULL TEST: Step 4 - Testing notification history modal...');
      window.openNotificationsModal();
      
      console.log('🔔 FULL TEST: Complete notification system test finished');
      console.log('🔔 FULL TEST: You should see:');
      console.log('  - A Chrome desktop notification popup');
      console.log('  - A red badge on the notification icon');
      console.log('  - The notifications modal should be open');
      console.log('  - Click the notification icon to open notifications');
      
    } catch (error) {
      console.error('🔔 FULL TEST: Error testing notification system:', error);
    }
  };
  
  // Enhanced Notification History System
  class NotificationHistoryManager {
    constructor() {
      this.notifications = [];
      this.maxNotifications = 100;
      this.storageKey = 'notificationHistory';
      this.initialize();
    }
    
    async initialize() {
      try {
        // Load existing notifications from storage
        const storageData = await getState(this.storageKey);
        const result = { [this.storageKey]: storageData };
        this.notifications = result[this.storageKey] || [];
        console.log('🔔 HISTORY: Loaded', this.notifications.length, 'notifications from storage');
      } catch (error) {
        console.error('🔔 HISTORY: Error loading notifications:', error);
        this.notifications = [];
      }
    }
    
    async addNotification(notification) {
      try {
        const notificationData = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          url: notification.url,
          target: notification.target, // Element selector or ID to highlight
          timestamp: Date.now(),
          read: false,
          data: notification.data || {}
        };
        
        // Add to beginning of array (most recent first)
        this.notifications.unshift(notificationData);
        
        // Keep only max notifications
        if (this.notifications.length > this.maxNotifications) {
          this.notifications = this.notifications.slice(0, this.maxNotifications);
        }
        
        // Save to storage
        await this.saveNotifications();
        
        // Update UI if modal is open
        this.updateNotificationsUI();
        
        // Update badge
        this.updateBadge();
        
        console.log('🔔 HISTORY: Added notification:', notificationData.title);
      } catch (error) {
        console.error('🔔 HISTORY: Error adding notification:', error);
      }
    }
    
    async markAsRead(notificationId) {
      try {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
          await this.saveNotifications();
          this.updateNotificationsUI();
          this.updateBadge();
          console.log('🔔 HISTORY: Marked notification as read:', notificationId);
        }
      } catch (error) {
        console.error('🔔 HISTORY: Error marking notification as read:', error);
      }
    }
    
    async markAllAsRead() {
      try {
        this.notifications.forEach(notification => {
          notification.read = true;
        });
        await this.saveNotifications();
        this.updateNotificationsUI();
        this.updateBadge();
        console.log('🔔 HISTORY: Marked all notifications as read');
      } catch (error) {
        console.error('🔔 HISTORY: Error marking all notifications as read:', error);
      }
    }
    
    async clearAll() {
      try {
        this.notifications = [];
        await this.saveNotifications();
        this.updateNotificationsUI();
        this.updateBadge();
        console.log('🔔 HISTORY: Cleared all notifications');
      } catch (error) {
        console.error('🔔 HISTORY: Error clearing notifications:', error);
      }
    }
    
    async saveNotifications() {
      try {
        if (typeof window.setState === 'function') {
          await window.setState(this.storageKey, this.notifications);
        }
      } catch (error) {
        console.error('🔔 HISTORY: Error saving notifications:', error);
      }
    }
    
    updateNotificationsUI() {
      const notificationsList = document.getElementById('notifications-list');
      const noNotifications = document.getElementById('no-notifications');
      
      if (!notificationsList) return;
      
      if (this.notifications.length === 0) {
        notificationsList.style.display = 'none';
        noNotifications.style.display = 'block';
        return;
      }
      
      notificationsList.style.display = 'block';
      noNotifications.style.display = 'none';
      
      // Clear existing notifications
      notificationsList.innerHTML = '';
      
      // Add each notification
      this.notifications.forEach((notification, index) => {
        const notificationElement = this.createNotificationElement(notification, index);
        notificationsList.appendChild(notificationElement);
      });
    }
    
    createNotificationElement(notification, index) {
      const element = document.createElement('div');
      element.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
      element.dataset.notificationId = notification.id;
      
      // Add slide-in animation for new notifications
      if (index < 3) { // Only animate first 3 notifications
        element.classList.add('notification-slide-in');
      }
      
      const timeAgo = this.getTimeAgo(notification.timestamp);
      const icon = this.getNotificationIcon(notification.type);
      
      element.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
          <div class="notification-meta">
            <span class="notification-time">${timeAgo}</span>
            ${notification.url ? `<span class="notification-url" title="${notification.url}">${this.truncateUrl(notification.url)}</span>` : ''}
          </div>
          <div class="notification-actions">
            ${notification.url ? `<button class="notification-action-btn primary" data-action="navigate" data-url="${notification.url}" data-target="${notification.target || ''}">Go to Page</button>` : ''}
            <button class="notification-action-btn" data-action="mark-read" data-id="${notification.id}">Mark Read</button>
            <button class="notification-action-btn" data-action="dismiss" data-id="${notification.id}">Dismiss</button>
          </div>
        </div>
      `;
      
      // Add click handlers
      this.addNotificationHandlers(element, notification);
      
      return element;
    }
    
    addNotificationHandlers(element, notification) {
      // Click on notification item
      element.addEventListener('click', (e) => {
        if (e.target.closest('.notification-action-btn')) return; // Don't trigger on buttons
        
        this.handleNotificationClick(notification);
      });
      
      // Action buttons
      element.querySelectorAll('.notification-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          
          switch (action) {
            case 'navigate':
              this.navigateToUrl(btn.dataset.url, btn.dataset.target);
              break;
            case 'mark-read':
              this.markAsRead(btn.dataset.id);
              break;
            case 'dismiss':
              this.dismissNotification(btn.dataset.id);
              break;
          }
        });
      });
    }
    
    async handleNotificationClick(notification) {
      try {
        // Mark as read
        await this.markAsRead(notification.id);
        
        // Navigate if URL exists
        if (notification.url) {
          this.navigateToUrl(notification.url, notification.target);
        }
      } catch (error) {
        console.error('🔔 HISTORY: Error handling notification click:', error);
      }
    }
    
    async navigateToUrl(url, target) {
      try {
        console.log('🔔 NAVIGATION: Navigating to:', url, 'target:', target);
        
        // Use the abstracted navigation system
        if (window.navigationManager) {
          await window.navigationManager.navigateToUrl(url, target);
        } else {
          // Fallback: simple navigation
          await chrome.tabs.create({ url: url });
        }
      } catch (error) {
        console.error('🔔 NAVIGATION: Error navigating to URL:', error);
      }
    }
    
    async dismissNotification(notificationId) {
      try {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        await this.saveNotifications();
        this.updateNotificationsUI();
        this.updateBadge();
        console.log('🔔 HISTORY: Dismissed notification:', notificationId);
      } catch (error) {
        console.error('🔔 HISTORY: Error dismissing notification:', error);
      }
    }
    
    updateBadge() {
      const unreadCount = this.notifications.filter(n => !n.read).length;
      const badge = document.getElementById('notification-badge');
      const userMenuBadge = document.getElementById('user-menu-notification-badge');
      
      if (badge) {
        if (unreadCount > 0) {
          badge.style.display = 'block';
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
        } else {
          badge.style.display = 'none';
        }
      }
      
      if (userMenuBadge) {
        if (unreadCount > 0) {
          userMenuBadge.style.display = 'block';
          userMenuBadge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
        } else {
          userMenuBadge.style.display = 'none';
        }
      }
    }
    
    getTimeAgo(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    }
    
    getNotificationIcon(type) {
      const icons = {
        'MESSAGE_NEW': '💬',
        'MENTION': '🗣️',
        'COMMUNITY_JOIN': '👥',
        'FRIEND_AURA_CHANGE': '✨',
        'default': '🔔'
      };
      return icons[type] || icons.default;
    }
    
    truncateUrl(url) {
      if (url.length <= 30) return url;
      return url.substring(0, 27) + '...';
    }
  }


// Enhanced notification system integration
function initializeEnhancedNotifications() {
    try {
      console.log('🔔 ENHANCED: Initializing enhanced notification system...');
      
      // Add notifications button to profile dropdown
      const notificationsBtn = document.getElementById('notifications-btn');
      if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
          window.openNotificationsModal();
        });
      }
      
      // Override the existing showNotification function to also add to history
      const originalShowNotification = window.showNotification;
      window.showNotification = function(message, type = 'info', url = null, target = null) {
        // Call original function
        if (originalShowNotification) {
          originalShowNotification(message);
        }
        
        // Add to notification history if available
        if (window.notificationHistory && window.notificationHistory.addNotification) {
          window.notificationHistory.addNotification({
            type: type,
            title: type === 'info' ? 'Notification' : type.charAt(0).toUpperCase() + type.slice(1),
            message: message,
            url: url,
            target: target
          });
        }
      };
      
      // Enhanced WebSocket message handling
      const originalHandleWebSocketMessage = window.handleWebSocketMessage;
      window.handleWebSocketMessage = function(data) {
        // Call original function
        if (originalHandleWebSocketMessage) {
          originalHandleWebSocketMessage(data);
        }
        
        // Add to notification history based on message type
        switch (data.type) {
          case 'MESSAGE_NEW':
            window.notificationHistory.addNotification({
              type: 'MESSAGE_NEW',
              title: `💬 New message from ${data.message?.author?.name || 'Someone'}`,
              message: data.message?.content || 'New message',
              url: data.url || window.location.href,
              target: `[data-message-id="${data.message?.id}"]`
            });
            break;
            
          case 'AURA_COLOR_CHANGED':
            if (data.userEmail !== window.currentUser?.email) {
              window.notificationHistory.addNotification({
                type: 'FRIEND_AURA_CHANGE',
                title: `✨ ${data.userName || data.userEmail} changed their aura`,
                message: `Their new aura color is ${data.auraColor}`,
                url: data.url || window.location.href,
                target: `[data-user-email="${data.userEmail}"]`
              });
            }
            break;
        }
      };
      
      console.log('🔔 ENHANCED: Enhanced notification system initialized');
    } catch (error) {
      console.error('🔔 ENHANCED: Error initializing enhanced notifications:', error);
    }
  }
  
  // Initialize enhanced notifications when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedNotifications);
  } else {
    initializeEnhancedNotifications();
  }


// Test notification system (for debugging)
window.testNotification = async function(type = 'MESSAGE_NEW') {
  try {
    console.log('🔔 TEST: Testing notification system...');
    
    if (!window.notificationManager) {
      console.error('🔔 TEST: Notification manager not available');
      return;
    }
    
    const testData = {
      MESSAGE_NEW: {
        authorName: 'Test User',
        content: 'This is a test message notification',
        authorEmail: window.currentUser?.email || 'user@example.com'
      },
      FRIEND_AURA_CHANGE: {
        userName: 'Test Friend',
        auraColor: '#ff0000',
        userEmail: 'friend@example.com'
      }
    };
    
    await window.notificationManager.showNotification(type, testData[type] || testData.MESSAGE_NEW);
    showNotificationBadge();
    
    console.log('🔔 TEST: Test notification sent');
  } catch (error) {
    console.error('🔔 TEST: Error testing notification:', error);
  }
};

// Test notification icon visibility
window.testNotificationIcon = function() {
  try {
    console.log('🔔 ICON TEST: Testing notification icon visibility...');
    
    const notificationIcon = document.getElementById('notification-icon');
    if (!notificationIcon) {
      console.error('🔔 ICON TEST: Notification icon not found in DOM');
      return;
    }
    
    console.log('🔔 ICON TEST: Notification icon found:', notificationIcon);
    console.log('🔔 ICON TEST: Icon display style:', notificationIcon.style.display);
    console.log('🔔 ICON TEST: Icon computed style:', window.getComputedStyle(notificationIcon).display);
    
    // Make sure it's visible
    notificationIcon.style.display = 'block';
    notificationIcon.style.visibility = 'visible';
    
    // Test badge
    const badge = document.getElementById('notification-badge');
    if (badge) {
      badge.style.display = 'block';
      badge.textContent = '1';
      console.log('🔔 ICON TEST: Badge shown');
    }
    
    console.log('🔔 ICON TEST: Notification icon should now be visible');
  } catch (error) {
    console.error('🔔 ICON TEST: Error testing notification icon:', error);
  }
};

// Comprehensive notification system test
window.testFullNotificationSystem = async function() {
  try {
    console.log('🔔 FULL TEST: Testing complete notification system...');
    
    // 1. Test notification icon visibility
    console.log('🔔 FULL TEST: Step 1 - Testing notification icon...');
    window.testNotificationIcon();
    
    // 2. Test Chrome desktop notification
    console.log('🔔 FULL TEST: Step 2 - Testing Chrome desktop notification...');
    await window.testNotification('MESSAGE_NEW');
    
    // 3. Test notification badge
    console.log('🔔 FULL TEST: Step 3 - Testing notification badge...');
    showNotificationBadge();
    
    // 4. Test notification history modal
    console.log('🔔 FULL TEST: Step 4 - Testing notification history modal...');
    window.openNotificationsModal();
    
    console.log('🔔 FULL TEST: Complete notification system test finished');
    console.log('🔔 FULL TEST: You should see:');
    console.log('  - A Chrome desktop notification popup');
    console.log('  - A red badge on the notification icon');
    console.log('  - The notification history modal open');
    console.log('  - A notification in the history list');
  } catch (error) {
    console.error('🔔 FULL TEST: Error testing notification system:', error);
  }
};

// Open notifications modal
window.openNotificationsModal = function() {
    try {
      console.log('🔔 MODAL: Opening notifications modal...');
      
      const modal = document.getElementById('notifications-modal');
      if (!modal) {
        console.error('🔔 MODAL: Notifications modal not found');
        return;
      }
      
      // Show modal
      modal.style.display = 'flex';
      
      // Update notifications UI
      window.notificationHistory.updateNotificationsUI();
      
      // Add event listeners for modal actions
      const markAllReadBtn = document.getElementById('mark-all-read-btn');
      const clearAllBtn = document.getElementById('clear-all-btn');
      const closeBtn = modal.querySelector('.close-button');
      
      if (markAllReadBtn) {
        markAllReadBtn.onclick = () => window.notificationHistory.markAllAsRead();
      }
      
      if (clearAllBtn) {
        clearAllBtn.onclick = () => window.notificationHistory.clearAll();
      }
      
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.style.display = 'none';
        };
      }
      
      // Close modal when clicking outside
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      };
      
      console.log('🔔 MODAL: Notifications modal opened');
    } catch (error) {
      console.error('🔔 MODAL: Error opening notifications modal:', error);
    }
  };


// Export for global access
window.NotificationManager = NotificationManager;

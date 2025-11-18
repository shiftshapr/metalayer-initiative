/**
 * NOTIFICATION MANAGER - Complete TypeScript Implementation
 * Handles all notification functionality with priority, offline queue, and content anchoring
 */
import { Logger } from '../utils/Logger';

type NotificationPriority = 'high' | 'medium' | 'low';

interface NotificationTypeSettings {
    id?: string;
    name?: string;
    description?: string;
    icon?: string;
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    priority?: NotificationPriority;
    category?: string;
}

interface NotificationSettings {
    enabled?: boolean;
    desktop?: boolean;
    sound?: boolean;
    types?: Record<string, NotificationTypeSettings>;
    anchor?: Record<string, any>;
    offline?: Record<string, any>;
    doNotDisturb?: boolean;
    [key: string]: any;
}

interface NotificationSourceMeta {
    category?: string;
    targetType?: string;
    targetId?: string;
    subscriptionId?: string;
}

interface NotificationHistoryEntry {
    id: string;
    type: string;
    title: string;
    message: string;
    url?: string;
    anchor?: string;
    contentAnchor?: string;
    priority?: NotificationPriority;
    timestamp: number;
    read?: boolean;
    queued?: boolean;
    clickedAt?: number;
    data?: Record<string, unknown>;
    source?: NotificationSourceMeta;
}

type NotificationQueueItem = NotificationHistoryEntry & { retries?: number; queuedAt?: number };
type NotificationEventCallback = (payload?: any) => void;
/**
 * NotificationManager class
 * Manages notifications, permissions, settings, and content anchoring
 */
export class NotificationManager {
    private isInitialized: boolean;
    private settings: NotificationSettings | null;
    private history: NotificationHistoryEntry[];
    private queue: NotificationQueueItem[];
    private maxHistorySize: number;
    private maxQueueSize: number;
    private storageKey: string;
    private historyKey: string;
    private queueKey: string;
    private eventListeners: Map<string, Set<NotificationEventCallback>>;
    private isOnline: boolean;
    private logger: Logger;
    constructor() {
        this.isInitialized = false;
        this.settings = null;
        this.history = [];
        this.queue = [];
        this.maxHistorySize = 100;
        this.maxQueueSize = 50;
        this.storageKey = 'notificationSettings';
        this.historyKey = 'notificationHistory';
        this.queueKey = 'notificationQueue';
        this.eventListeners = new Map();
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.logger = new Logger();
        this.setupOnlineOfflineListeners();
    }
    /**
     * Initialize NotificationManager
     */
    async initialize() {
        if (this.isInitialized) {
            this.logger.warn('NotificationManager already initialized');
            return;
        }
        this.logger.info('Initializing NotificationManager...');
        try {
            // Load settings
            await this.loadSettings();
            // Load history
            await this.loadHistory();
            // Load queue
            await this.loadQueue();
            // Request permission if needed
            if (this.settings?.desktop && !this.hasPermission()) {
                await this.requestPermission();
            }
            // Process queued notifications if online
            if (this.isOnline && this.queue.length > 0) {
                await this.processQueue();
            }
            this.isInitialized = true;
            this.logger.info('NotificationManager initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize NotificationManager:', error);
            throw error;
        }
    }
    /**
     * Get all notification types with their configurations
     */
    getAllNotificationTypes() {
        return [
            // PERSONAL NOTIFICATIONS (direct to user)
            {
                id: 'MENTION',
                name: 'Mentions',
                description: 'Get notified when someone mentions you',
                icon: '🗣️',
                enabled: true,
                sound: true,
                desktop: true,
                priority: 'high',
                category: 'personal'
            },
            {
                id: 'REPLY',
                name: 'Replies',
                description: 'Get notified when someone replies to your message',
                icon: '↩️',
                enabled: true,
                sound: true,
                desktop: true,
                priority: 'high',
                category: 'personal'
            },
            {
                id: 'ROOM_INVITE',
                name: 'Room Invitations',
                description: 'Get notified when invited to rooms',
                icon: '🚪',
                enabled: true,
                sound: true,
                desktop: true,
                priority: 'high',
                category: 'personal'
            },
            {
                id: 'SYSTEM_ALERT',
                name: 'System Alerts',
                description: 'Important system notifications',
                icon: '⚠️',
                enabled: true,
                sound: true,
                desktop: true,
                priority: 'high',
                category: 'personal'
            },
            // SUBSCRIPTION-BASED NOTIFICATIONS (from followed content)
            {
                id: 'MESSAGE_NEW',
                name: 'New Messages',
                description: 'Get notified about messages in subscribed rooms',
                icon: '💬',
                enabled: true,
                sound: true,
                desktop: true,
                priority: 'medium',
                category: 'subscription'
            },
            {
                id: 'FRIEND_AURA_CHANGE',
                name: 'Friend Aura Changes',
                description: 'Get notified when subscribed friends change their aura',
                icon: '✨',
                enabled: false,
                sound: false,
                desktop: false,
                priority: 'low',
                category: 'subscription'
            },
            {
                id: 'COMMUNITY_JOIN',
                name: 'Community Activity',
                description: 'Get notified about activity in subscribed communities',
                icon: '👥',
                enabled: false,
                sound: false,
                desktop: false,
                priority: 'low',
                category: 'subscription'
            }
        ];
    }
    /**
     * Enable or disable a notification type
     */
    async setEnabled(notificationType, enabled) {
        try {
            if (!this.settings) {
                await this.loadSettings();
            }
            if (!this.settings) {
                throw new Error('Settings not loaded');
            }
            // Update setting
            if (!this.settings.types) {
                this.settings.types = {};
            }
            this.settings.types[notificationType] = {
                ...this.settings.types[notificationType],
                enabled,
                sound: this.settings.types[notificationType]?.sound ?? true,
                desktop: this.settings.types[notificationType]?.desktop ?? true
            };
            // Save settings
            await this.saveSettings();
            this.logger.info(`Notification type ${notificationType} ${enabled ? 'enabled' : 'disabled'}`);
            // Emit event
            this.emitEvent('settings:changed', { settings: this.settings });
        }
        catch (error) {
            this.logger.error('Error setting notification enabled state:', error);
            throw error;
        }
    }
    /**
     * Show a notification
     */
    async showNotification(type, data) {
        try {
            // Check if online
            if (!this.isOnline) {
                return await this.queueNotification(type, data);
            }
            // Check if notification type is enabled
            const typeSettings = this.settings?.types?.[type];
            if (!typeSettings?.enabled) {
                this.logger.debug(`Notification type ${type} is disabled`);
                return null;
            }
            // Build notification data
            const notification = this.buildNotificationData(type, data);
            // Check subscription if this is a subscription-based notification
            if (notification.source?.category === 'subscription') {
                const shouldShow = await this.checkSubscription(notification);
                if (!shouldShow) {
                    this.logger.debug(`Notification blocked by subscription settings`);
                    return null;
                }
            }
            // Determine priority
            const priority = this.determinePriority(type, data);
            notification.priority = priority;
            // Show desktop notification if enabled
            if (typeSettings.desktop && this.hasPermission()) {
                await this.showDesktopNotification(notification);
            }
            // Add to history
            await this.addToHistory(notification);
            // Play sound if enabled
            if (typeSettings.sound && this.settings?.sound) {
                this.playNotificationSound(type);
            }
            // Update badge
            this.updateBadge();
            // Emit event
            this.emitEvent('notification:shown', { notification });
            this.logger.info(`Notification shown: ${type}`, notification);
            return notification;
        }
        catch (error) {
            this.logger.error('Error showing notification:', error);
            throw error;
        }
    }
    /**
     * Queue notification for offline processing
     */
    async queueNotification(type, data) {
        const notification = this.buildNotificationData(type, data);
        notification.queued = true;
        const queuedNotification = {
            ...notification,
            queuedAt: Date.now(),
            retryCount: 0
        };
        this.queue.push(queuedNotification);
        // Limit queue size
        if (this.queue.length > this.maxQueueSize) {
            this.queue = this.queue.slice(-this.maxQueueSize);
        }
        await this.saveQueue();
        this.logger.info(`Notification queued: ${type}`);
        this.emitEvent('notification:queued', { notification: queuedNotification });
        return notification;
    }
    /**
     * Process queued notifications
     */
    async processQueue() {
        if (this.queue.length === 0)
            return;
        this.logger.info(`Processing ${this.queue.length} queued notifications...`);
        // Sort by priority and time
        this.queue.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority || 'medium'];
            const bPriority = priorityOrder[b.priority || 'medium'];
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            return a.queuedAt - b.queuedAt;
        });
        // Show summary notification
        this.showQueueSummary();
        // Process each notification
        for (const notification of this.queue) {
            try {
                await this.showNotification(notification.type, notification);
                await this.delay(500); // Stagger notifications
            }
            catch (error) {
                this.logger.error('Error processing queued notification:', error);
            }
        }
        // Clear queue
        this.queue = [];
        await this.saveQueue();
    }
    /**
     * Show queue summary notification
     */
    showQueueSummary() {
        const highPriority = this.queue.filter(n => n.priority === 'high').length;
        const total = this.queue.length;
        const message = `You're back online! ${total} notification${total > 1 ? 's' : ''} ` +
            `${highPriority > 0 ? `(${highPriority} important)` : ''}`;
        this.showToastNotification(message);
    }
    /**
     * Show toast notification (in-app)
     */
    showToastNotification(message) {
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
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    /**
     * Show desktop notification
     */
    async showDesktopNotification(notification) {
        try {
            if (!this.hasPermission()) {
                this.logger.warn('No permission for desktop notifications');
                return;
            }
            const desktopNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/images/icon128.png',
                badge: '/images/icon48.png',
                tag: notification.id,
                requireInteraction: notification.priority === 'high',
                silent: false,
                data: {
                    url: notification.url,
                    anchor: notification.anchor
                }
            });
            // Handle click
            desktopNotification.onclick = async () => {
                desktopNotification.close();
                await this.handleNotificationClick(notification);
            };
            // Auto-close after duration based on priority
            const duration = notification.priority === 'high' ? 10000 : 5000;
            setTimeout(() => desktopNotification.close(), duration);
            this.logger.info('Desktop notification shown:', notification.title);
        }
        catch (error) {
            this.logger.error('Error showing desktop notification:', error);
        }
    }
    /**
     * Handle notification click
     */
    async handleNotificationClick(notification) {
        try {
            // Mark as read
            await this.markAsRead(notification.id);
            // Emit click event
            this.emitEvent('notification:clicked', { notification });
            // Navigate with anchor if provided
            if (notification.anchor) {
                await this.navigateToAnchor(notification.anchor, notification.url);
            }
            else if (notification.url) {
                await chrome.tabs.create({ url: notification.url });
            }
        }
        catch (error) {
            this.logger.error('Error handling notification click:', error);
        }
    }
    /**
     * Navigate to notification anchor
     */
    async navigateToAnchor(anchor, url) {
        try {
            this.logger.info('Navigating to anchor:', anchor);
            // If URL provided, navigate first
            if (url) {
                // Check if URL is already open in a tab
                const tabs = await chrome.tabs.query({ url });
                if (tabs.length > 0 && tabs[0].id) {
                    // Focus existing tab
                    await chrome.tabs.update(tabs[0].id, { active: true });
                    await chrome.windows.update(tabs[0].windowId, { focused: true });
                }
                else {
                    // Open new tab
                    await chrome.tabs.create({ url });
                }
                // Wait for page to load
                await this.delay(1000);
            }
            // Send message to content script to handle anchoring
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'NAVIGATE_TO_ANCHOR',
                    anchor
                });
            }
            this.emitEvent('anchor:navigated', { anchor });
        }
        catch (error) {
            this.logger.error('Error navigating to anchor:', error);
        }
    }
    /**
     * Request notification permission
     */
    async requestPermission() {
        try {
            if (!('Notification' in window)) {
                this.logger.warn('Desktop notifications not supported');
                return false;
            }
            if (Notification.permission === 'granted') {
                return true;
            }
            if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                const granted = permission === 'granted';
                this.emitEvent('permission:changed', {
                    permission: permission
                });
                return granted;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Error requesting notification permission:', error);
            return false;
        }
    }
    /**
     * Check if has notification permission
     */
    hasPermission() {
        return 'Notification' in window && Notification.permission === 'granted';
    }
    /**
     * Get current settings
     */
    async getSettings() {
        if (!this.settings) {
            await this.loadSettings();
        }
        return this.settings || this.getDefaultSettings();
    }
    /**
     * Update settings
     */
    async updateSettings(settings) {
        try {
            if (!this.settings) {
                await this.loadSettings();
            }
            this.settings = {
                ...this.settings,
                ...settings
            };
            await this.saveSettings();
            this.emitEvent('settings:changed', { settings: this.settings });
            this.logger.info('Settings updated');
        }
        catch (error) {
            this.logger.error('Error updating settings:', error);
            throw error;
        }
    }
    /**
     * Get notification history
     */
    async getHistory(filter) {
        let history = [...this.history];
        if (filter) {
            // Apply filters
            if (filter.type) {
                const types = Array.isArray(filter.type) ? filter.type : [filter.type];
                history = history.filter(n => types.includes(n.type));
            }
            if (filter.priority) {
                const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
                history = history.filter(n => n.priority && priorities.includes(n.priority));
            }
            if (filter.read !== undefined) {
                history = history.filter(n => n.read === filter.read);
            }
            if (filter.timeRange) {
                history = history.filter(n => n.timestamp >= filter.timeRange.start &&
                    n.timestamp <= filter.timeRange.end);
            }
            // Sort
            if (filter.sortBy) {
                history.sort((a, b) => {
                    let aVal, bVal;
                    switch (filter.sortBy) {
                        case 'timestamp':
                            aVal = a.timestamp;
                            bVal = b.timestamp;
                            break;
                        case 'priority':
                            const priorityOrder = { high: 3, medium: 2, low: 1 };
                            aVal = priorityOrder[a.priority || 'medium'];
                            bVal = priorityOrder[b.priority || 'medium'];
                            break;
                        case 'type':
                            aVal = a.type;
                            bVal = b.type;
                            break;
                        default:
                            return 0;
                    }
                    return filter.sort === 'asc' ? aVal - bVal : bVal - aVal;
                });
            }
            // Limit
            if (filter.limit) {
                history = history.slice(0, filter.limit);
            }
        }
        return history;
    }
    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        try {
            const notification = this.history.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                notification.clickedAt = Date.now();
                await this.saveHistory();
                this.updateBadge();
                this.emitEvent('notification:read', { notification });
                this.logger.info('Notification marked as read:', notificationId);
            }
        }
        catch (error) {
            this.logger.error('Error marking notification as read:', error);
        }
    }
    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        try {
            this.history.forEach(notification => {
                notification.read = true;
            });
            await this.saveHistory();
            this.updateBadge();
            this.logger.info('All notifications marked as read');
        }
        catch (error) {
            this.logger.error('Error marking all notifications as read:', error);
        }
    }
    /**
     * Clear all notifications
     */
    async clearAll() {
        try {
            this.history = [];
            await this.saveHistory();
            this.updateBadge();
            this.logger.info('All notifications cleared');
        }
        catch (error) {
            this.logger.error('Error clearing notifications:', error);
        }
    }
    /**
     * Get notification statistics
     */
    getStats() {
        const stats = {
            total: this.history.length,
            unread: this.history.filter(n => !n.read).length,
            byPriority: {
                high: this.history.filter(n => n.priority === 'high').length,
                medium: this.history.filter(n => n.priority === 'medium').length,
                low: this.history.filter(n => n.priority === 'low').length
            },
            byType: {},
            queued: this.queue.length,
            avgResponseTime: 0
        };
        // Count by type
        this.history.forEach(n => {
            stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        });
        // Calculate average response time
        const clickedNotifications = this.history.filter(n => n.clickedAt);
        if (clickedNotifications.length > 0) {
            const totalResponseTime = clickedNotifications.reduce((sum, n) => sum + (n.clickedAt - n.timestamp), 0);
            stats.avgResponseTime = totalResponseTime / clickedNotifications.length;
        }
        return stats;
    }
    /**
     * Update notification badge
     */
    updateBadge() {
        const unreadCount = this.history.filter(n => !n.read).length;
        const highPriorityCount = this.history.filter(n => !n.read && n.priority === 'high').length;
        const badge = {
            count: unreadCount,
            highPriorityCount,
            visible: unreadCount > 0
        };
        // Update badge UI
        const badgeElement = document.getElementById('notification-badge');
        const userMenuBadge = document.getElementById('user-menu-notification-badge');
        if (badgeElement) {
            if (badge.visible) {
                badgeElement.style.display = 'block';
                badgeElement.textContent = badge.count > 99 ? '99+' : badge.count.toString();
            }
            else {
                badgeElement.style.display = 'none';
            }
        }
        if (userMenuBadge) {
            if (badge.visible) {
                userMenuBadge.style.display = 'block';
                userMenuBadge.textContent = badge.count > 99 ? '99+' : badge.count.toString();
            }
            else {
                userMenuBadge.style.display = 'none';
            }
        }
        this.emitEvent('badge:updated', { badge });
    }
    /**
     * Play notification sound
     */
    playNotificationSound(type) {
        try {
            // Use browser's default notification sound
            // In future, can add custom sounds per type
            const audio = new Audio();
            audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77OeeSwwPUKXh8LdjHAU2jdXwyXkqBSd3xfDckD0JFF2z6OqnUxELRp3e8bllHgU=';
            audio.play().catch(() => {
                // Ignore errors (user might not have interacted with page yet)
            });
        }
        catch (error) {
            this.logger.debug('Could not play notification sound:', error);
        }
    }
    /**
     * Build notification data from input
     */
    buildNotificationData(type: string, data: any): NotificationHistoryEntry {
        const typeConfig = this.getAllNotificationTypes().find(t => t.id === type);
        const notification: NotificationHistoryEntry = {
            id: data.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            title: data.title || typeConfig?.name || type,
            message: data.message || '',
            url: data.url,
            anchor: data.anchor,
            contentAnchor: data.contentAnchor,
            priority: data.priority || typeConfig?.priority || 'medium',
            timestamp: data.timestamp || Date.now(),
            read: data.read || false,
            queued: data.queued || false,
            data: data.data
        };
        return notification;
    }
    /**
     * Determine notification priority based on type and data
     */
    determinePriority(type, data) {
        // If priority explicitly set, use it
        if (data.priority) {
            return data.priority;
        }
        // Determine based on type
        switch (type) {
            case 'MENTION':
            case 'REPLY':
            case 'ROOM_INVITE':
            case 'SYSTEM_ALERT':
                return 'high';
            case 'MESSAGE_NEW':
                return 'medium';
            case 'FRIEND_AURA_CHANGE':
            case 'COMMUNITY_JOIN':
                return 'low';
            default:
                return 'medium';
        }
    }
    /**
     * Add notification to history
     */
    async addToHistory(notification) {
        const historyEntry = {
            ...notification,
            shownAsDesktop: this.hasPermission()
        };
        this.history.unshift(historyEntry);
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(0, this.maxHistorySize);
        }
        await this.saveHistory();
    }
    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(this.storageKey);
            this.settings = result[this.storageKey] || this.getDefaultSettings();
            this.logger.info('Settings loaded');
        }
        catch (error) {
            this.logger.error('Error loading settings:', error);
            this.settings = this.getDefaultSettings();
        }
    }
    /**
     * Save settings to storage
     */
    async saveSettings() {
        try {
            await chrome.storage.local.set({ [this.storageKey]: this.settings });
            this.logger.info('Settings saved');
        }
        catch (error) {
            this.logger.error('Error saving settings:', error);
        }
    }
    /**
     * Get default settings
     */
    getDefaultSettings() {
        const types = this.getAllNotificationTypes().reduce<Record<string, NotificationTypeSettings>>((acc, type) => {
            acc[type.id] = {
                id: type.id,
                enabled: type.enabled,
                sound: type.sound,
                desktop: type.desktop,
                priority: type.priority as NotificationPriority,
                category: type.category
            };
            return acc;
        }, {});
        return {
            enabled: true,
            sound: true,
            desktop: true,
            types,
            anchor: {
                highlightDuration: 3000,
                highlightStyle: 'pulse',
                scrollBehavior: 'smooth',
                autoFocus: true
            },
            doNotDisturb: false,
            offline: {
                enabled: true,
                maxQueueSize: 50
            }
        };
    }
    /**
     * Load history from storage
     */
    async loadHistory() {
        try {
            const result = await chrome.storage.local.get(this.historyKey);
            this.history = (result[this.historyKey] as NotificationHistoryEntry[]) || [];
            this.logger.info(`Loaded ${this.history.length} notifications from history`);
        }
        catch (error) {
            this.logger.error('Error loading history:', error);
            this.history = [];
        }
    }
    /**
     * Save history to storage
     */
    async saveHistory() {
        try {
            await chrome.storage.local.set({ [this.historyKey]: this.history });
        }
        catch (error) {
            this.logger.error('Error saving history:', error);
        }
    }
    /**
     * Load queue from storage
     */
    async loadQueue() {
        try {
            const result = await chrome.storage.local.get(this.queueKey);
            this.queue = (result[this.queueKey] as NotificationQueueItem[]) || [];
            this.logger.info(`Loaded ${this.queue.length} queued notifications`);
        }
        catch (error) {
            this.logger.error('Error loading queue:', error);
            this.queue = [];
        }
    }
    /**
     * Save queue to storage
     */
    async saveQueue() {
        try {
            await chrome.storage.local.set({ [this.queueKey]: this.queue });
        }
        catch (error) {
            this.logger.error('Error saving queue:', error);
        }
    }
    /**
     * Setup online/offline listeners
     */
    setupOnlineOfflineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.logger.info('Back online');
            if (this.queue.length > 0) {
                this.processQueue();
            }
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.logger.info('Went offline');
        });
    }
    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }
    /**
     * Remove event listener
     */
    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.delete(callback);
        }
    }
    /**
     * Emit event
     */
    emitEvent(event, data = {}) {
        const payload = {
            event,
            timestamp: Date.now(),
            ...data
        };
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(payload);
                }
                catch (error) {
                    this.logger.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Check if notification should be shown based on subscription settings
     */
    async checkSubscription(notification) {
        try {
            // If no subscription manager available, allow notification
            if (typeof window === 'undefined' || !window.subscriptionManager) {
                return true;
            }
            const subscriptionManager = window.subscriptionManager;
            const source = notification.source;
            if (!source || !source.subscriptionId) {
                // No subscription info, check by target
                if (source?.targetType && source?.targetId) {
                    const subscription = subscriptionManager.findSubscription(source.targetType, source.targetId);
                    if (!subscription) {
                        return false; // Not subscribed
                    }
                    // Check if subscription is active and enabled
                    if (!subscription.active || !subscription.preferences.enabled) {
                        return false;
                    }
                    // Check if muted
                    if (subscription.preferences.mutedUntil && subscription.preferences.mutedUntil > Date.now()) {
                        return false;
                    }
                    // Check subscription-specific notification type preferences
                    if (subscription.preferences.types && subscription.preferences.types[notification.type] === false) {
                        return false;
                    }
                    return true;
                }
                // No target info, allow notification
                return true;
            }
            // Get subscription by ID
            const subscription = subscriptionManager.getSubscription(source.subscriptionId);
            if (!subscription) {
                return false; // Subscription not found
            }
            // Check if subscription is active and enabled
            if (!subscription.active || !subscription.preferences.enabled) {
                return false;
            }
            // Check if muted
            if (subscription.preferences.mutedUntil && subscription.preferences.mutedUntil > Date.now()) {
                return false;
            }
            // Check subscription-specific notification type preferences
            if (subscription.preferences.types && subscription.preferences.types[notification.type] === false) {
                return false;
            }
            // Apply subscription priority override if set
            if (subscription.preferences.priority) {
                notification.priority = subscription.preferences.priority;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error checking subscription:', error);
            return true; // Allow notification on error
        }
    }
    /**
     * Get notifications by category
     */
    async getNotificationsByCategory(category) {
        return this.history.filter(n => n.source?.category === category);
    }
    /**
     * Utility: delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// Export singleton instance
export const notificationManager = new NotificationManager();

declare global {
    interface Window {
        subscriptionManager?: {
            isSubscribed?: (subscriptionId: string) => Promise<boolean> | boolean;
            findSubscription?: (targetType: string, targetId: string) => any;
            getSubscription?: (subscriptionId: string) => any;
        };
    }
}

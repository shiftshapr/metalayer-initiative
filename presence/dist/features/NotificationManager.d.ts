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
type NotificationEventCallback = (payload?: any) => void;
/**
 * NotificationManager class
 * Manages notifications, permissions, settings, and content anchoring
 */
export declare class NotificationManager {
    private isInitialized;
    private settings;
    private history;
    private queue;
    private maxHistorySize;
    private maxQueueSize;
    private storageKey;
    private historyKey;
    private queueKey;
    private eventListeners;
    private isOnline;
    private logger;
    constructor();
    /**
     * Initialize NotificationManager
     */
    initialize(): Promise<void>;
    /**
     * Get all notification types with their configurations
     */
    getAllNotificationTypes(): {
        id: string;
        name: string;
        description: string;
        icon: string;
        enabled: boolean;
        sound: boolean;
        desktop: boolean;
        priority: string;
        category: string;
    }[];
    /**
     * Enable or disable a notification type
     */
    setEnabled(notificationType: string, enabled: boolean): Promise<void>;
    /**
     * Show a notification
     */
    showNotification(type: string, data: any): Promise<NotificationHistoryEntry | null>;
    /**
     * Queue notification for offline processing
     */
    queueNotification(type: string, data: any): Promise<NotificationHistoryEntry>;
    /**
     * Process queued notifications
     */
    processQueue(): Promise<void>;
    /**
     * Show queue summary notification
     */
    showQueueSummary(): void;
    /**
     * Show toast notification (in-app)
     */
    showToastNotification(message: string): void;
    /**
     * Show desktop notification
     */
    showDesktopNotification(notification: NotificationHistoryEntry): Promise<void>;
    /**
     * Handle notification click
     */
    handleNotificationClick(notification: NotificationHistoryEntry): Promise<void>;
    /**
     * Navigate to notification anchor
     */
    navigateToAnchor(anchor: string, url?: string): Promise<void>;
    /**
     * Request notification permission
     */
    requestPermission(): Promise<boolean>;
    /**
     * Check if has notification permission
     */
    hasPermission(): boolean;
    /**
     * Get current settings
     */
    getSettings(): Promise<NotificationSettings | {
        enabled: boolean;
        sound: boolean;
        desktop: boolean;
        types: Record<string, NotificationTypeSettings>;
        anchor: {
            highlightDuration: number;
            highlightStyle: string;
            scrollBehavior: string;
            autoFocus: boolean;
        };
        doNotDisturb: boolean;
        offline: {
            enabled: boolean;
            maxQueueSize: number;
        };
    }>;
    /**
     * Update settings
     */
    updateSettings(settings: Partial<NotificationSettings>): Promise<void>;
    /**
     * Get notification history
     */
    getHistory(filter?: {
        type?: string | string[];
        priority?: NotificationPriority | NotificationPriority[];
        read?: boolean;
        queued?: boolean;
        timeRange?: {
            start: number;
            end: number;
        };
        limit?: number;
        sort?: 'asc' | 'desc';
        sortBy?: 'timestamp' | 'priority' | 'type';
    }): Promise<NotificationHistoryEntry[]>;
    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string): Promise<void>;
    /**
     * Mark all notifications as read
     */
    markAllAsRead(): Promise<void>;
    /**
     * Clear all notifications
     */
    clearAll(): Promise<void>;
    /**
     * Get notification statistics
     */
    getStats(): {
        total: number;
        unread: number;
        byPriority: {
            high: number;
            medium: number;
            low: number;
        };
        byType: Record<string, number>;
        queued: number;
        avgResponseTime: number;
    };
    /**
     * Update notification badge
     */
    updateBadge(): void;
    /**
     * Play notification sound
     */
    playNotificationSound(type: string): void;
    /**
     * Build notification data from input
     */
    buildNotificationData(type: string, data: any): NotificationHistoryEntry;
    /**
     * Determine notification priority based on type and data
     */
    determinePriority(type: string, data: any): NotificationPriority;
    /**
     * Add notification to history
     */
    addToHistory(notification: NotificationHistoryEntry): Promise<void>;
    /**
     * Load settings from storage
     */
    loadSettings(): Promise<void>;
    /**
     * Save settings to storage
     */
    saveSettings(): Promise<void>;
    /**
     * Get default settings
     */
    getDefaultSettings(): {
        enabled: boolean;
        sound: boolean;
        desktop: boolean;
        types: Record<string, NotificationTypeSettings>;
        anchor: {
            highlightDuration: number;
            highlightStyle: string;
            scrollBehavior: string;
            autoFocus: boolean;
        };
        doNotDisturb: boolean;
        offline: {
            enabled: boolean;
            maxQueueSize: number;
        };
    };
    /**
     * Load history from storage
     */
    loadHistory(): Promise<void>;
    /**
     * Save history to storage
     */
    saveHistory(): Promise<void>;
    /**
     * Load queue from storage
     */
    loadQueue(): Promise<void>;
    /**
     * Save queue to storage
     */
    saveQueue(): Promise<void>;
    /**
     * Setup online/offline listeners
     */
    setupOnlineOfflineListeners(): void;
    /**
     * Add event listener
     */
    on(event: string, callback: NotificationEventCallback): void;
    /**
     * Remove event listener
     */
    off(event: string, callback: NotificationEventCallback): void;
    /**
     * Emit event
     */
    emitEvent(event: string, data?: any): void;
    /**
     * Check if notification should be shown based on subscription settings
     */
    checkSubscription(notification: NotificationHistoryEntry): Promise<boolean>;
    /**
     * Get notifications by category
     */
    getNotificationsByCategory(category: string): Promise<NotificationHistoryEntry[]>;
    /**
     * Utility: delay
     */
    delay(ms: number): Promise<void>;
}
export declare const notificationManager: NotificationManager;
declare global {
    interface Window {
        subscriptionManager?: {
            isSubscribed?: (subscriptionId: string) => Promise<boolean> | boolean;
            findSubscription?: (targetType: string, targetId: string) => any;
            getSubscription?: (subscriptionId: string) => any;
        };
    }
}
export {};
//# sourceMappingURL=NotificationManager.d.ts.map
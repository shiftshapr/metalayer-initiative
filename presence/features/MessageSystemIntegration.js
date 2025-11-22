/**
 * MessageSystemIntegration - Wires together MessageStore, MessageLoader, and UI
 *
 * Integrates with existing CanopiModule and message display code
 */
import { messageStore } from '../services/MessageStore.js';
import { messageLoader } from '../components/MessageLoader.js';
import { initializeRealtimeSubscriptionService } from '../services/RealtimeSubscriptionService.js';
export class MessageSystemIntegration {
    constructor() {
        this.currentPageId = null;
        this.currentParentId = null;
    }
    /**
     * Initialize the integration
     */
    async initialize(config) {
        try {
            // Initialize real-time subscription service
            this.realtimeService = initializeRealtimeSubscriptionService(config.supabaseClient);
            await this.realtimeService.initialize();
            // Set error notification callback
            if (config.showNotification) {
                this.realtimeService.setErrorNotificationCallback(config.showNotification);
            }
            // Store callbacks
            this.onMessageUpdateCallback = config.onMessageUpdate;
            this.onErrorCallback = config.onError;
            // Subscribe to MessageStore updates
            messageStore.on('update', (data) => {
                if (data.key && this.onMessageUpdateCallback) {
                    const [pageId, parentIdStr] = data.key.split('|');
                    const parentId = parentIdStr === 'null' ? null : parentIdStr;
                    console.log('📝 MessageSystemIntegration: Update event received', { 
                        key: data.key, 
                        pageId, 
                        parentId, 
                        currentPageId: this.currentPageId, 
                        currentParentId: this.currentParentId,
                        messageCount: data.data?.items?.length 
                    });
                    // Update UI if it matches current view OR if it's a new message (real-time)
                    if (pageId === this.currentPageId && parentId === this.currentParentId) {
                        console.log('📝 MessageSystemIntegration: Calling onMessageUpdateCallback with', data.data.items.length, 'messages');
                        this.onMessageUpdateCallback(data.data.items);
                    } else {
                        console.log('📝 MessageSystemIntegration: Update for different page/parent, skipping UI update');
                    }
                }
            });
            messageStore.on('error', (data) => {
                if (this.onErrorCallback) {
                    this.onErrorCallback(new Error(data.error?.message || 'Unknown error'));
                }
            });
            console.log('✅ MessageSystemIntegration: Initialized');
            return true;
        }
        catch (error) {
            console.error('❌ MessageSystemIntegration: Initialization failed:', error);
            return false;
        }
    }
    /**
     * Load messages for default view
     */
    async loadDefaultView(pageId, options = {}) {
        this.currentPageId = pageId;
        this.currentParentId = null;
        try {
            // Subscribe to real-time updates for this page
            await this.realtimeService.subscribeToPage({
                pageId,
                communityId: options.communityId || 'comm-001',
                onError: this.onErrorCallback
            });
            // Load messages
            const messages = await messageLoader.loadDefault({
                pageId,
                parentId: null,
                limit: options.limit || 10,
                includeTopReply: true,
                communityId: options.communityId || 'comm-001',
                showSpinner: true,
                onUpdate: this.onMessageUpdateCallback,
                onError: this.onErrorCallback
            });
            return messages;
        }
        catch (error) {
            console.error('MessageSystemIntegration: Error loading default view:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback(error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
    }
    /**
     * Load messages for focus mode
     */
    async loadFocusMode(pageId, focusParentId, options = {}) {
        this.currentPageId = pageId;
        this.currentParentId = focusParentId;
        try {
            // Subscribe to real-time updates
            await this.realtimeService.subscribeToPage({
                pageId,
                communityId: options.communityId || 'comm-001',
                onError: this.onErrorCallback
            });
            // Load focus mode messages
            const result = await messageLoader.loadFocus({
                pageId,
                focusParentId,
                limit: options.limit || 10,
                communityId: options.communityId || 'comm-001',
                showSpinner: true,
                onUpdate: this.onMessageUpdateCallback,
                onError: this.onErrorCallback
            });
            return result;
        }
        catch (error) {
            console.error('MessageSystemIntegration: Error loading focus mode:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback(error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
    }
    /**
     * Handle tab/page change
     */
    async handlePageChange(newPageId, communityId = 'comm-001') {
        // Unsubscribe from old page
        if (this.currentPageId && this.currentPageId !== newPageId) {
            this.realtimeService.unsubscribeFromPage(this.currentPageId);
            messageLoader.cleanupLazyLoading();
        }
        // Update current page
        this.currentPageId = newPageId;
        this.currentParentId = null;
        // Load new page messages
        await this.loadDefaultView(newPageId, { communityId });
    }
    /**
     * Clean up resources
     */
    destroy() {
        if (this.realtimeService) {
            this.realtimeService.unsubscribeAll();
        }
        messageLoader.destroy();
        this.currentPageId = null;
        this.currentParentId = null;
    }
}
// Export singleton instance (will be initialized)
let messageSystemIntegration = null;
export function getMessageSystemIntegration() {
    return messageSystemIntegration;
}
export function initializeMessageSystemIntegration(config) {
    if (!messageSystemIntegration) {
        messageSystemIntegration = new MessageSystemIntegration();
    }
    return messageSystemIntegration.initialize(config).then(() => messageSystemIntegration);
}

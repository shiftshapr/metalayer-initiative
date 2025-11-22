/**
 * MessageSystemIntegration - Wires together MessageStore, MessageLoader, and UI
 *
 * Integrates with existing CanopiModule and message display code
 */
import { messageStore } from '../services/MessageStore.js';
export class MessageSystemIntegration {
    constructor() {
        this.currentPageId = null;
        this.currentParentId = null;
        this.realtimeService = null;
        // MessageLoader will be injected via config
        this.messageLoader = {};
    }
    async initialize(config) {
        try {
            // Initialize real-time subscription service
            if (config.initializeRealtimeSubscriptionService) {
                this.realtimeService = config.initializeRealtimeSubscriptionService(config.supabaseClient);
                await this.realtimeService.initialize();
            }
            // Set error notification callback
            if (config.showNotification && this.realtimeService) {
                this.realtimeService.setErrorNotificationCallback(config.showNotification);
            }
            // Store callbacks
            this.onMessageUpdateCallback = config.onMessageUpdate;
            this.onErrorCallback = config.onError;
            // Store messageLoader if provided
            if (config.messageLoader) {
                this.messageLoader = config.messageLoader;
            }
            // Subscribe to MessageStore updates
            messageStore.on('update', (data) => {
                const typedData = data;
                if (typedData.key && this.onMessageUpdateCallback) {
                    const [pageId, parentIdStr] = typedData.key.split('|');
                    const parentId = parentIdStr === 'null' ? null : parentIdStr;
                    if (pageId === this.currentPageId && parentId === this.currentParentId) {
                        this.onMessageUpdateCallback(typedData.data?.items || []);
                    }
                }
            });
            messageStore.on('error', (data) => {
                const typedData = data;
                if (this.onErrorCallback) {
                    this.onErrorCallback(new Error(typedData.error?.message || 'Unknown error'));
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
    async loadDefaultView(pageId, options = {}) {
        this.currentPageId = pageId;
        this.currentParentId = null;
        try {
            // Subscribe to real-time updates for this page
            if (this.realtimeService) {
                await this.realtimeService.subscribeToPage({
                    pageId,
                    communityId: options.communityId || 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4',
                    onError: this.onErrorCallback
                });
            }
            // ROOT CAUSE FIX: Prevent duplicate onUpdate callbacks
            // MessageLoader's onUpdate will trigger MessageStore updates, which trigger our callback
            // But we also return messages directly, so we need to avoid double-rendering
            let messagesLoaded = false;
            const onUpdateWrapper = (messages) => {
                if (!messagesLoaded && this.onMessageUpdateCallback) {
                    // Only call callback once
                    messagesLoaded = true;
                    this.onMessageUpdateCallback(messages);
                }
            };
            // Load messages
            const messages = await this.messageLoader.loadDefault({
                pageId,
                parentId: null,
                limit: options.limit || 10,
                includeTopReply: true,
                communityId: options.communityId || 'comm-001',
                showSpinner: true,
                onUpdate: onUpdateWrapper,
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
    async loadFocusMode(pageId, focusParentId, options = {}) {
        this.currentPageId = pageId;
        this.currentParentId = focusParentId;
        try {
            // Subscribe to real-time updates
            if (this.realtimeService) {
                await this.realtimeService.subscribeToPage({
                    pageId,
                    communityId: options.communityId || 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4',
                    onError: this.onErrorCallback
                });
            }
            // Load focus mode messages
            const result = await this.messageLoader.loadFocus({
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
    async handlePageChange(newPageId, communityId = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4') {
        // Unsubscribe from old page
        if (this.currentPageId && this.currentPageId !== newPageId && this.realtimeService) {
            this.realtimeService.unsubscribeFromPage(this.currentPageId);
            this.messageLoader.cleanupLazyLoading();
        }
        // Update current page
        this.currentPageId = newPageId;
        this.currentParentId = null;
        // Load new page messages
        await this.loadDefaultView(newPageId, { communityId });
    }
    destroy() {
        if (this.realtimeService) {
            this.realtimeService.unsubscribeAll();
        }
        this.messageLoader.destroy();
        this.currentPageId = null;
        this.currentParentId = null;
    }
}
// Export singleton instance (will be initialized)
let messageSystemIntegration = null;
export function getMessageSystemIntegration() {
    return messageSystemIntegration;
}
export async function initializeMessageSystemIntegration(config) {
    if (!messageSystemIntegration) {
        messageSystemIntegration = new MessageSystemIntegration();
    }
    await messageSystemIntegration.initialize(config);
    return messageSystemIntegration;
}

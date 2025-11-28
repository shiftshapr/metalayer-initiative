/**
 * MessageSystemIntegration - Wires together MessageStore, MessageLoader, and UI
 *
 * Integrates with existing CanopiModule and message display code
 */
import { messageStore } from '../services/MessageStore.js';
import { initializeSupabaseRealtimeServices } from '../services/SupabaseRealtimeClientFix.js';
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
export class MessageSystemIntegration {
    constructor() {
        this.currentPageId = null;
        this.currentParentId = null;
        this.realtimeService = null;
        this.initialized = false;
        this.messageStoreListenersAttached = false;
        this.cleanupStoreListeners = [];
        this.handleMessageStoreUpdate = (data) => {
            if (!this.onMessageUpdateCallback) {
                return;
            }
            const typedData = data;
            if (!typedData.key) {
                return;
            }
            const [pageId, parentIdStr] = typedData.key.split('|');
            const parentId = parentIdStr === 'null' ? null : parentIdStr;
            if (pageId === this.currentPageId && parentId === this.currentParentId) {
                this.onMessageUpdateCallback(typedData.data?.items || []);
            }
        };
        this.handleMessageStoreError = (data) => {
            if (!this.onErrorCallback) {
                return;
            }
            const typedData = data;
            this.onErrorCallback(new Error(typedData.error?.message || 'Unknown error'));
        };
        this.messageLoader = {};
    }
    attachMessageStoreListeners() {
        if (this.messageStoreListenersAttached) {
            return;
        }
        this.messageStoreListenersAttached = true;
        this.cleanupStoreListeners.push(messageStore.on('update', this.handleMessageStoreUpdate), messageStore.on('error', this.handleMessageStoreError));
    }
    async initialize(config) {
        if (this.initialized) {
            Logger.debug('ℹ️ MessageSystemIntegration: initialize() skipped (already initialized)', null, 'general');
            return true;
        }
        try {
            if (config.initializeRealtimeSubscriptionService) {
                this.realtimeService = config.initializeRealtimeSubscriptionService(config.supabaseClient);
                await this.realtimeService.initialize();
            }
            else {
                const realtimeService = await initializeSupabaseRealtimeServices({
                    supabaseClient: config.supabaseClient
                });
                if (realtimeService) {
                    this.realtimeService = realtimeService;
                }
                else {
                    Logger.warn('⚠️ MessageSystemIntegration: Supabase realtime service unavailable; skipping realtime subscriptions', null, 'general');
                }
            }
            if (config.showNotification && this.realtimeService) {
                this.realtimeService.setErrorNotificationCallback(config.showNotification);
            }
            this.onMessageUpdateCallback = config.onMessageUpdate;
            this.onErrorCallback = config.onError;
            if (config.messageLoader) {
                this.messageLoader = config.messageLoader;
            }
            this.attachMessageStoreListeners();
            Logger.debug('✅ MessageSystemIntegration: Initialized', null, 'general');
            this.initialized = true;
            return true;
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'initialize',
                    component: 'MessageSystemIntegration'
                }
            });
            return false;
        }
    }
    isReady() {
        return this.initialized;
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
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'loadDefaultView',
                    component: 'MessageSystemIntegration',
                    pageId,
                    communityId: options.communityId
                }
            });
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
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'loadFocusMode',
                    component: 'MessageSystemIntegration',
                    pageId,
                    focusParentId
                }
            });
            if (this.onErrorCallback) {
                this.onErrorCallback(error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
    }
    async handlePageChange(newPageId, communityId = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4') {
        try {
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
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'handlePageChange',
                    component: 'MessageSystemIntegration',
                    newPageId,
                    communityId
                }
            });
        }
    }
    destroy() {
        if (this.realtimeService) {
            this.realtimeService.unsubscribeAll();
        }
        this.cleanupStoreListeners.splice(0).forEach(unsubscribe => {
            try {
                unsubscribe();
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'destroyCleanup',
                        component: 'MessageSystemIntegration'
                    }
                });
            }
        });
        this.messageStoreListenersAttached = false;
        this.initialized = false;
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
    try {
        if (!messageSystemIntegration) {
            messageSystemIntegration = new MessageSystemIntegration();
        }
        if (!messageSystemIntegration.isReady()) {
            await messageSystemIntegration.initialize(config);
        }
        return messageSystemIntegration;
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'initializeMessageSystemIntegration',
                component: 'MessageSystemIntegration'
            }
        });
        throw error;
    }
}
export function destroyMessageSystemIntegration() {
    if (!messageSystemIntegration) {
        return;
    }
    messageSystemIntegration.destroy();
    messageSystemIntegration = null;
    Logger.debug('🧹 MessageSystemIntegration: Destroyed singleton instance', null, 'general');
}
const messageSystemIntegrationApi = {
    getMessageSystemIntegration,
    initializeMessageSystemIntegration,
    destroyMessageSystemIntegration
};
export { messageSystemIntegrationApi };
export default messageSystemIntegrationApi;

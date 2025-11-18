/**
 * MessageLoader - Handles message loading with overlay spinner and lazy loading
 *
 * Workflow:
 * - Default: Show spinner → Load first page → Hide spinner → Lazy load rest
 * - Focus: Show spinner → Load parent → Load replies → Hide spinner → Lazy load rest
 */
import { messageStore } from '../services/MessageStore.js';
import { overlaySpinner } from './OverlaySpinner.js';
export class MessageLoader {
    constructor() {
        this.sentinelObserver = null;
        this.sentinelElement = null;
        this.currentPageId = null;
        this.currentParentId = null;
        this.isLoading = false;
    }
    /**
     * Load messages for default view (parentId = null)
     */
    async loadDefault(options) {
        const { pageId, limit = 10, includeTopReply = true, communityId = 'comm-001', showSpinner = true, onUpdate, onError } = options;
        this.currentPageId = pageId;
        this.currentParentId = null;
        try {
            // Show spinner immediately
            if (showSpinner) {
                overlaySpinner.show('Loading messages...');
            }
            // Load first page
            const response = await messageStore.load(pageId, null, {
                limit,
                includeTopReply,
                communityId
            });
            // Wait for first page to be loaded
            const firstPageMessages = response.items;
            // Hide spinner after first page
            if (showSpinner) {
                overlaySpinner.hide();
            }
            // Notify UI
            if (onUpdate) {
                onUpdate(firstPageMessages);
            }
            // Setup lazy loading for rest
            if (response.hasMore) {
                this.setupLazyLoading(pageId, null, onUpdate, onError);
            }
            return firstPageMessages;
        }
        catch (error) {
            if (showSpinner) {
                overlaySpinner.hide();
            }
            const err = error instanceof Error ? error : new Error(String(error));
            if (onError) {
                onError(err);
            }
            throw err;
        }
    }
    /**
     * Load messages for focus mode (parentId specified)
     */
    async loadFocus(options) {
        const { pageId, focusParentId, limit = 10, communityId = 'comm-001', showSpinner = true, onUpdate, onError } = options;
        this.currentPageId = pageId;
        this.currentParentId = focusParentId;
        try {
            // Show spinner immediately
            if (showSpinner) {
                overlaySpinner.show('Loading message thread...');
            }
            // Load parent message
            const parentResponse = await messageStore.load(pageId, null, {
                limit: 100, // Get enough to find parent
                includeTopReply: false,
                communityId
            });
            const parent = parentResponse.items.find(m => m.id === focusParentId);
            if (!parent) {
                // Try fetching parent directly
                const parentData = await fetch(`/api/messages/${focusParentId}`);
                if (!parentData.ok) {
                    throw new Error('Parent message not found');
                }
                const parentMessage = await parentData.json();
                // Use the fetched parent
            }
            // Load replies
            const repliesResponse = await messageStore.load(pageId, focusParentId, {
                limit,
                includeTopReply: false,
                communityId
            });
            // Hide spinner after first page of replies
            if (showSpinner) {
                overlaySpinner.hide();
            }
            const replies = repliesResponse.items;
            // Notify UI
            if (onUpdate) {
                onUpdate(replies);
            }
            // Setup lazy loading for additional replies
            if (repliesResponse.hasMore) {
                this.setupLazyLoading(pageId, focusParentId, onUpdate, onError);
            }
            return {
                parent: parent || repliesResponse.parent,
                replies
            };
        }
        catch (error) {
            if (showSpinner) {
                overlaySpinner.hide();
            }
            const err = error instanceof Error ? error : new Error(String(error));
            if (onError) {
                onError(err);
            }
            throw err;
        }
    }
    /**
     * Setup IntersectionObserver for lazy loading
     */
    setupLazyLoading(pageId, parentId, onUpdate, onError) {
        // Clean up existing observer
        this.cleanupLazyLoading();
        // Find or create sentinel element
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) {
            console.warn('MessageLoader: .chat-messages container not found');
            return;
        }
        // Create sentinel element
        this.sentinelElement = document.createElement('div');
        this.sentinelElement.className = 'message-load-sentinel';
        this.sentinelElement.setAttribute('data-scroll-sentinel', 'true');
        messagesContainer.appendChild(this.sentinelElement);
        // Create IntersectionObserver
        this.sentinelObserver = new IntersectionObserver(async (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && !this.isLoading) {
                    const status = messageStore.getStatus(pageId, parentId);
                    if (status === 'ready') {
                        this.isLoading = true;
                        try {
                            const response = await messageStore.loadNextPage(pageId, parentId);
                            if (response && response.items.length > 0) {
                                // Notify UI of new messages
                                if (onUpdate) {
                                    const allMessages = messageStore.get(pageId, parentId);
                                    if (allMessages) {
                                        onUpdate(allMessages.items);
                                    }
                                }
                            }
                            // If exhausted, stop observing
                            if (messageStore.getStatus(pageId, parentId) === 'exhausted') {
                                this.cleanupLazyLoading();
                            }
                        }
                        catch (error) {
                            console.error('MessageLoader: Error loading next page:', error);
                            if (onError) {
                                onError(error instanceof Error ? error : new Error(String(error)));
                            }
                        }
                        finally {
                            this.isLoading = false;
                        }
                    }
                }
            }
        }, {
            root: messagesContainer,
            rootMargin: '100px', // Start loading 100px before sentinel is visible
            threshold: 0.1
        });
        // Start observing
        this.sentinelObserver.observe(this.sentinelElement);
    }
    /**
     * Clean up lazy loading observer
     */
    cleanupLazyLoading() {
        if (this.sentinelObserver) {
            this.sentinelObserver.disconnect();
            this.sentinelObserver = null;
        }
        if (this.sentinelElement && this.sentinelElement.parentNode) {
            this.sentinelElement.parentNode.removeChild(this.sentinelElement);
            this.sentinelElement = null;
        }
        this.isLoading = false;
    }
    /**
     * Clean up all resources
     */
    destroy() {
        this.cleanupLazyLoading();
        this.currentPageId = null;
        this.currentParentId = null;
    }
}
// Export singleton instance
export const messageLoader = new MessageLoader();

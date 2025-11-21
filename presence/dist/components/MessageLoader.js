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
     * Load messages for the default (top-level) view.
     */
    async loadDefault(options) {
        const { pageId, limit = 10, includeTopReply = true, communityId = 'comm-001', showSpinner = true, onUpdate, onError } = options;
        this.currentPageId = pageId;
        this.currentParentId = null;
        try {
            if (showSpinner) {
                overlaySpinner.show('Loading messages…');
            }
            const response = await messageStore.load(pageId, null, {
                limit,
                includeTopReply,
                communityId
            });
            if (showSpinner) {
                overlaySpinner.hide();
            }
            const firstPageMessages = response.items;
            if (onUpdate) {
                onUpdate(firstPageMessages);
            }
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
     * Load messages for focus mode (replies to a parent).
     */
    async loadFocus(options) {
        const { pageId, focusParentId, limit = 10, communityId = 'comm-001', showSpinner = true, onUpdate, onError } = options;
        this.currentPageId = pageId;
        this.currentParentId = focusParentId;
        try {
            if (showSpinner) {
                overlaySpinner.show('Loading message thread…');
            }
            const parentResponse = await messageStore.load(pageId, null, {
                limit: 100,
                includeTopReply: false,
                communityId
            });
            const parent = parentResponse.items.find((item) => item.id === focusParentId) || parentResponse.parent || null;
            const repliesResponse = await messageStore.load(pageId, focusParentId, {
                limit,
                includeTopReply: false,
                communityId
            });
            if (showSpinner) {
                overlaySpinner.hide();
            }
            const replies = repliesResponse.items;
            if (onUpdate) {
                onUpdate(replies);
            }
            if (repliesResponse.hasMore) {
                this.setupLazyLoading(pageId, focusParentId, onUpdate, onError);
            }
            return {
                parent,
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
     * Configure IntersectionObserver to lazy load additional pages.
     */
    setupLazyLoading(pageId, parentId, onUpdate, onError) {
        if (typeof document === 'undefined')
            return;
        this.cleanupLazyLoading();
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) {
            console.warn('MessageLoader: .chat-messages container not found');
            return;
        }
        this.sentinelElement = document.createElement('div');
        this.sentinelElement.className = 'message-load-sentinel';
        this.sentinelElement.setAttribute('data-scroll-sentinel', 'true');
        messagesContainer.appendChild(this.sentinelElement);
        this.sentinelObserver = new IntersectionObserver(async (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && !this.isLoading) {
                    const status = messageStore.getStatus(pageId, parentId);
                    if (status === 'ready') {
                        this.isLoading = true;
                        try {
                            const response = await messageStore.loadNextPage(pageId, parentId);
                            if (response && response.items.length > 0) {
                                if (onUpdate) {
                                    const allMessages = messageStore.get(pageId, parentId);
                                    if (allMessages) {
                                        onUpdate(allMessages.items);
                                    }
                                }
                            }
                            if (messageStore.getStatus(pageId, parentId) === 'exhausted') {
                                this.cleanupLazyLoading();
                            }
                        }
                        catch (error) {
                            console.error('MessageLoader: Error loading next page:', error);
                            if (onError) {
                                const err = error instanceof Error ? error : new Error(String(error));
                                onError(err);
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
            rootMargin: '100px',
            threshold: 0.1
        });
        this.sentinelObserver.observe(this.sentinelElement);
    }
    /**
     * Clean up lazy loading observers.
     */
    cleanupLazyLoading() {
        if (this.sentinelObserver) {
            this.sentinelObserver.disconnect();
            this.sentinelObserver = null;
        }
        if (this.sentinelElement?.parentNode) {
            this.sentinelElement.parentNode.removeChild(this.sentinelElement);
        }
        this.sentinelElement = null;
        this.isLoading = false;
    }
    /**
     * Destroy loader resources.
     */
    destroy() {
        this.cleanupLazyLoading();
        this.currentPageId = null;
        this.currentParentId = null;
    }
}
export const messageLoader = new MessageLoader();

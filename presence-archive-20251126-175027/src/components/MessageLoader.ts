import { messageStore } from '../services/MessageStore.js';
import type { Message } from '../types/index.js';
import { overlaySpinner } from './OverlaySpinner.js';

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';

interface BaseOptions {
  pageId: string;
  communityId?: string;
  showSpinner?: boolean;
  onUpdate?: (messages: Message[]) => void;
  onError?: (error: Error) => void;
}

export interface LoadDefaultOptions extends BaseOptions {
  limit?: number;
  includeTopReply?: boolean;
}

export interface LoadFocusOptions extends BaseOptions {
  focusParentId: string;
  limit?: number;
}

interface LoadResponse {
  items: Message[];
  hasMore: boolean;
  nextCursor: string | null;
  parent?: Message | null;
}

export class MessageLoader {
  private sentinelObserver: IntersectionObserver | null = null;
  private sentinelElement: HTMLElement | null = null;
  private isLoading = false;

  /**
   * Load messages for the default (top-level) view.
   */
  async loadDefault(options: LoadDefaultOptions): Promise<Message[]> {
    const {
      pageId,
      limit = 10,
      includeTopReply = true,
      communityId = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4',
      showSpinner = true,
      onUpdate,
      onError
    } = options;


    try {
      if (showSpinner) {
        overlaySpinner.show('Loading messages…');
      }

      const response = await messageStore.load(pageId, null, {
        limit,
        includeTopReply,
        communityId
      }) as LoadResponse;

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
    } catch (error: unknown) {
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
  async loadFocus(options: LoadFocusOptions): Promise<{ parent: Message | null; replies: Message[] }> {
    const {
      pageId,
      focusParentId,
      limit = 10,
      communityId = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4',
      showSpinner = true,
      onUpdate,
      onError
    } = options;


    try {
      if (showSpinner) {
        overlaySpinner.show('Loading message thread…');
      }

      const parentResponse = await messageStore.load(pageId, null, {
        limit: 100,
        includeTopReply: false,
        communityId
      }) as LoadResponse;
      const parent = parentResponse.items.find((item) => item.id === focusParentId) || parentResponse.parent || null;

      const repliesResponse = await messageStore.load(pageId, focusParentId, {
        limit,
        includeTopReply: false,
        communityId
      }) as LoadResponse;

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
    } catch (error: unknown) {
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
  private setupLazyLoading(
    pageId: string,
    parentId: string | null,
    onUpdate?: (messages: Message[]) => void,
    onError?: (error: Error) => void
  ): void {
    if (typeof document === 'undefined') return;

    this.cleanupLazyLoading();

    const messagesContainer = document.querySelector('.chat-messages') as HTMLElement | null;
    if (!messagesContainer) {
      Logger.warn('MessageLoader: .chat-messages container not found', null, 'messages');
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
                    onUpdate(allMessages.items as Message[]);
                  }
                }
              }
              if (messageStore.getStatus(pageId, parentId) === 'exhausted') {
                this.cleanupLazyLoading();
              }
            } catch (error: unknown) {
              Logger.error('MessageLoader: Error loading next page', error, 'messages');
              handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'MessageLoader',
            pageId
            }
        });;
              if (onError) {
                const err = error instanceof Error ? error : new Error(String(error));
                onError(err);
              }
            
    } finally {
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
  cleanupLazyLoading(): void {
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
  destroy(): void {
    this.cleanupLazyLoading();
  }
}

export const messageLoader = new MessageLoader();


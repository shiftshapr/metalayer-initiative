/**
 * MessageSystemIntegration - Wires together MessageStore, MessageLoader, and UI
 *
 * Integrates with existing CanopiModule and message display code
 */

import { messageStore } from '../services/MessageStore.js';
import type { Message } from '../types/index.js';
import type { SupabaseClient } from '../types/index.js';
import { initializeSupabaseRealtimeServices } from '../services/SupabaseRealtimeClientFix.js';

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
interface MessageLoader {
  loadDefault: (options: LoadDefaultOptions) => Promise<Message[]>;
  loadFocus: (options: LoadFocusOptions) => Promise<Message[] | { parent: Message | null; replies: Message[] }>;
  cleanupLazyLoading: () => void;
  destroy: () => void;
}

interface LoadDefaultOptions {
  pageId: string;
  parentId: string | null;
  limit?: number;
  includeTopReply?: boolean;
  communityId?: string;
  showSpinner?: boolean;
  onUpdate?: (messages: Message[]) => void;
  onError?: (error: Error) => void;
}

interface LoadFocusOptions {
  pageId: string;
  focusParentId: string;
  limit?: number;
  communityId?: string;
  showSpinner?: boolean;
  onUpdate?: (messages: Message[]) => void;
  onError?: (error: Error) => void;
}

interface RealtimeService {
  initialize: () => Promise<boolean | void>;
  subscribeToPage: (options: { pageId: string; communityId: string; onError?: (error: Error) => void }) => Promise<boolean | void>;
  unsubscribeFromPage: (pageId: string) => void;
  unsubscribeAll: () => void;
  setErrorNotificationCallback: (callback: (message: string) => void) => void;
}

interface MessageSystemIntegrationConfig {
  supabaseClient: SupabaseClient;
  showNotification?: (message: string) => void;
  onMessageUpdate?: (messages: Message[]) => void;
  onError?: (error: Error) => void;
  messageLoader?: MessageLoader;
  initializeRealtimeSubscriptionService?: (client: SupabaseClient) => RealtimeService;
}

export class MessageSystemIntegration {
  private currentPageId: string | null = null;
  private currentParentId: string | null = null;
  private realtimeService: RealtimeService | null = null;
  private onMessageUpdateCallback?: (messages: Message[]) => void;
  private onErrorCallback?: (error: Error) => void;
  private messageLoader: MessageLoader;
  private initialized = false;
  private messageStoreListenersAttached = false;
  private readonly cleanupStoreListeners: Array<() => void> = [];

  constructor() {
    this.messageLoader = {} as MessageLoader;
  }

  private readonly handleMessageStoreUpdate = (data: unknown): void => {
    if (!this.onMessageUpdateCallback) {
      return;
    }
    const typedData = data as { key?: string; data?: { items: Message[] } };
    if (!typedData.key) {
      return;
    }
    const [pageId, parentIdStr] = typedData.key.split('|');
    const parentId = parentIdStr === 'null' ? null : parentIdStr;
    if (pageId === this.currentPageId && parentId === this.currentParentId) {
      this.onMessageUpdateCallback(typedData.data?.items || []);
    }
  };

  private readonly handleMessageStoreError = (data: unknown): void => {
    if (!this.onErrorCallback) {
      return;
    }
    const typedData = data as { error?: { message?: string } };
    this.onErrorCallback(new Error(typedData.error?.message || 'Unknown error'));
  };

  private attachMessageStoreListeners(): void {
    if (this.messageStoreListenersAttached) {
      return;
    }
    this.messageStoreListenersAttached = true;
    this.cleanupStoreListeners.push(
      messageStore.on('update', this.handleMessageStoreUpdate),
      messageStore.on('error', this.handleMessageStoreError)
    );
  }

  async initialize(config: MessageSystemIntegrationConfig): Promise<boolean> {
    if (this.initialized) {
      Logger.debug('ℹ️ MessageSystemIntegration: initialize() skipped (already initialized)', null, 'general');
      return true;
    }
    try {
      if (config.initializeRealtimeSubscriptionService) {
        this.realtimeService = config.initializeRealtimeSubscriptionService(config.supabaseClient);
        await this.realtimeService.initialize();
      } else {
        const realtimeService = await initializeSupabaseRealtimeServices({
          supabaseClient: config.supabaseClient
        });
        if (realtimeService) {
          this.realtimeService = realtimeService;
        } else {
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
    } catch (error: unknown) {
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

  isReady(): boolean {
    return this.initialized;
  }

  async loadDefaultView(pageId: string, options: { limit?: number; communityId?: string } = {}): Promise<Message[]> {
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
      const onUpdateWrapper = (messages: Message[]) => {
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
    } catch (error: unknown) {
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

  async loadFocusMode(pageId: string, focusParentId: string, options: { limit?: number; communityId?: string } = {}): Promise<Message[] | { replies: Message[]; parent: Message | null }> {
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
    } catch (error: unknown) {
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

  async handlePageChange(newPageId: string, communityId = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4'): Promise<void> {
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
    } catch (error: unknown) {
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

  destroy(): void {
    if (this.realtimeService) {
      this.realtimeService.unsubscribeAll();
    }
    this.cleanupStoreListeners.splice(0).forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error: unknown) {
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
let messageSystemIntegration: MessageSystemIntegration | null = null;

export function getMessageSystemIntegration(): MessageSystemIntegration | null {
  return messageSystemIntegration;
}

export async function initializeMessageSystemIntegration(config: MessageSystemIntegrationConfig): Promise<MessageSystemIntegration> {
  try {
    if (!messageSystemIntegration) {
      messageSystemIntegration = new MessageSystemIntegration();
    }
    if (!messageSystemIntegration.isReady()) {
      await messageSystemIntegration.initialize(config);
    }
    return messageSystemIntegration;
  } catch (error: unknown) {
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

export function destroyMessageSystemIntegration(): void {
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

export {
  messageSystemIntegrationApi
};

export default messageSystemIntegrationApi;

export type MessageSystemIntegrationType = MessageSystemIntegration;

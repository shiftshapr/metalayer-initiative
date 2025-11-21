/**
 * MessageSystemIntegration - Wires together MessageStore, MessageLoader, and UI
 * 
 * Integrates with existing CanopiModule and message display code
 */

import { messageStore } from '../services/MessageStore.js';
import { messageLoader } from '../components/MessageLoader.js';
import { initializeRealtimeSubscriptionService } from '../services/RealtimeSubscriptionService.js';
import type { Message } from '../services/MessageStore.js';

export interface IntegrationConfig {
  supabaseClient: any;
  onMessageUpdate?: (messages: Message[]) => void;
  onError?: (error: Error) => void;
  showNotification?: (message: string) => void;
}

export class MessageSystemIntegration {
  private realtimeService: any;
  private currentPageId: string | null = null;
  private currentParentId: string | null = null;
  private onMessageUpdateCallback?: (messages: Message[]) => void;
  private onErrorCallback?: (error: Error) => void;

  /**
   * Initialize the integration
   */
  async initialize(config: IntegrationConfig): Promise<boolean> {
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
      messageStore.on('update', (data: any) => {
        if (data.key && this.onMessageUpdateCallback) {
          const [pageId, parentIdStr] = data.key.split('|');
          const parentId = parentIdStr === 'null' ? null : parentIdStr;
          
          if (pageId === this.currentPageId && parentId === this.currentParentId) {
            this.onMessageUpdateCallback(data.data.items);
          }
        }
      });

      messageStore.on('error', (data: any) => {
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error(data.error?.message || 'Unknown error'));
        }
      });

      console.log('✅ MessageSystemIntegration: Initialized');
      return true;

    } catch (error) {
      console.error('❌ MessageSystemIntegration: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Load messages for default view
   */
  async loadDefaultView(pageId: string, options: {
    limit?: number;
    communityId?: string;
  } = {}): Promise<Message[]> {
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

    } catch (error) {
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
  async loadFocusMode(
    pageId: string,
    focusParentId: string,
    options: {
      limit?: number;
      communityId?: string;
    } = {}
  ): Promise<{ parent: Message; replies: Message[] }> {
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

    } catch (error) {
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
  async handlePageChange(newPageId: string, communityId: string = 'comm-001'): Promise<void> {
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
  destroy(): void {
    if (this.realtimeService) {
      this.realtimeService.unsubscribeAll();
    }
    messageLoader.destroy();
    this.currentPageId = null;
    this.currentParentId = null;
  }
}

// Export singleton instance (will be initialized)
let messageSystemIntegration: MessageSystemIntegration | null = null;

export function getMessageSystemIntegration(): MessageSystemIntegration | null {
  return messageSystemIntegration;
}

export function initializeMessageSystemIntegration(config: IntegrationConfig): Promise<MessageSystemIntegration> {
  if (!messageSystemIntegration) {
    messageSystemIntegration = new MessageSystemIntegration();
  }
  return messageSystemIntegration.initialize(config).then(() => messageSystemIntegration!);
}




/**
 * RealtimeSubscriptionService - Handles Supabase real-time subscriptions only
 * 
 * Separated from write logic for cleaner architecture.
 * Uses anon key + RLS for secure, filtered subscriptions.
 */

import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { messageStore } from './MessageStore.js';
import type { StoreMessage } from './MessageStore.js';

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
export interface SubscriptionConfig {
  pageId: string;
  communityId?: string;
  onError?: (error: Error) => void;
}

export class RealtimeSubscriptionService {
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();
  private isInitialized: boolean = false;
  private errorNotificationCallback?: (message: string) => void;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (!this.supabase || !this.supabase.realtime) {
      Logger.error('RealtimeSubscriptionService: Supabase client not available', null, 'general');
      return false;
    }

    this.isInitialized = true;
    Logger.debug('✅ RealtimeSubscriptionService: Initialized', null, 'general');
    return true;
  }

  /**
   * Subscribe to messages for a page
   */
  async subscribeToPage(config: SubscriptionConfig): Promise<boolean> {
    const { pageId, onError } = config;

    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
    }

    // Unsubscribe from existing channel for this page if any
    this.unsubscribeFromPage(pageId);

    try {
      const channelName = `messages:${pageId}`;
      
      // Use proper Supabase channel type - channels support method chaining
      const channel = this.supabase.channel(channelName);

      // Set up INSERT listener
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `page_id=eq.${pageId}`
        },
        (payload: { new?: unknown; old?: unknown }) => {
          const inserted = payload.new as StoreMessage | undefined;
          if (inserted) {
            this.handleMessageInsert(inserted);
          }
        }
      );

      // Set up UPDATE listener
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `page_id=eq.${pageId}`
        },
        (payload: { new?: unknown; old?: unknown }) => {
          const updated = payload.new as StoreMessage | undefined;
          if (updated) {
            this.handleMessageUpdate(updated);
          }
        }
      );

      // Set up DELETE listener
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `page_id=eq.${pageId}`
        },
        (payload: { new?: unknown; old?: unknown }) => {
          const removed = payload.old as StoreMessage | undefined;
          if (removed) {
            this.handleMessageDelete(removed);
          }
        }
      );

      channel.subscribe((status: string, err?: Error) => {
        if (err) {
          Logger.error('RealtimeSubscriptionService: Subscription error:', err, 'general');
          if (onError) {
            onError(err);
          }
          this.showNotification('Real-time connection error. Some updates may be delayed.');
        } else if (status === 'SUBSCRIBED') {
          Logger.debug(`✅ RealtimeSubscriptionService: Subscribed to ${channelName}`, null, 'general');
        }
      });

      this.channels.set(pageId, channel as unknown as RealtimeChannel);
      return true;

    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'RealtimeSubscriptionService',
            pageId
            }
        });;
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      return false;
    
    }
  }

  /**
   * Unsubscribe from a page
   */
  unsubscribeFromPage(pageId: string): void {
    const channel = this.channels.get(pageId);
    if (channel) {
      // Supabase client has removeChannel method
      const supabaseWithRemove = this.supabase as unknown as { removeChannel?: (channel: unknown) => void };
      if (supabaseWithRemove && typeof supabaseWithRemove.removeChannel === 'function') {
        supabaseWithRemove.removeChannel(channel);
      } else {
        // Fallback: unsubscribe from channel directly
        if (typeof (channel as { unsubscribe?: () => void }).unsubscribe === 'function') {
          (channel as { unsubscribe: () => void }).unsubscribe();
        }
      }
      this.channels.delete(pageId);
      Logger.debug(`✅ RealtimeSubscriptionService: Unsubscribed from ${pageId}`, null, 'general');
    }
  }

  /**
   * Unsubscribe from all pages
   */
  unsubscribeAll(): void {
    for (const [pageId] of this.channels) {
      this.unsubscribeFromPage(pageId);
    }
  }

  /**
   * Handle message insert (new message)
   */
  private handleMessageInsert(message: StoreMessage): void {
    Logger.debug('📨 RealtimeSubscriptionService: New message:', message.id, 'general');
    
    // Dispatch event for MessageStore to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('realtime-message', {
        detail: message
      }));
    }

    // Also update MessageStore directly
    messageStore['handleRealtimeMessage'](message as Partial<StoreMessage> & { page_id?: string; parent_id?: string });
  }

  /**
   * Handle message update
   */
  private handleMessageUpdate(message: StoreMessage): void {
    Logger.debug('✏️ RealtimeSubscriptionService: Message updated:', message.id, 'general');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('realtime-message-updated', {
        detail: message
      }));
    }

    // Update MessageStore
    messageStore['handleRealtimeUpdate'](message as Partial<StoreMessage> & { updated_at?: string });
  }

  /**
   * Handle message delete
   */
  private handleMessageDelete(message: StoreMessage): void {
    Logger.debug('🗑️ RealtimeSubscriptionService: Message deleted:', message.id, 'general');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('realtime-message-deleted', {
        detail: message
      }));
    }

    // Update MessageStore
    const messageId = (message && typeof message === 'object' && 'id' in message ? (message as { id?: string }).id : undefined) || (message && typeof message === 'object' && 'message_id' in message ? (message as { message_id?: string }).message_id : undefined);
    if (messageId && typeof messageId === 'string') {
      messageStore['handleRealtimeDelete'](messageId);
    }
  }

  /**
   * Show notification (if callback is set)
   */
  private showNotification(message: string): void {
    if (this.errorNotificationCallback) {
      this.errorNotificationCallback(message);
    } else if (typeof window !== 'undefined' && (window as Window & { showNotification?: (message: string, options?: Record<string, unknown>) => void }).showNotification) {
      (window as Window & { showNotification?: (message: string, options?: Record<string, unknown>) => void }).showNotification!(message);
    }
  }

  /**
   * Set error notification callback
   */
  setErrorNotificationCallback(callback: (message: string) => void): void {
    this.errorNotificationCallback = callback;
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(pageId: string): 'subscribed' | 'unsubscribed' | 'error' {
    return this.channels.has(pageId) ? 'subscribed' : 'unsubscribed';
  }
}

// Export singleton (will be initialized with Supabase client)
let realtimeSubscriptionService: RealtimeSubscriptionService | null = null;

export function initializeRealtimeSubscriptionService(supabaseClient: SupabaseClient): RealtimeSubscriptionService {
  if (!realtimeSubscriptionService) {
    realtimeSubscriptionService = new RealtimeSubscriptionService(supabaseClient);
  }
  return realtimeSubscriptionService;
}

export function getRealtimeSubscriptionService(): RealtimeSubscriptionService | null {
  return realtimeSubscriptionService;
}

export const supabaseRealtimeApi = {
  RealtimeSubscriptionService,
  initializeRealtimeSubscriptionService,
  getRealtimeSubscriptionService
};

export default supabaseRealtimeApi;


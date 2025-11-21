/**
 * RealtimeSubscriptionService - Handles Supabase real-time subscriptions only
 * 
 * Separated from write logic for cleaner architecture.
 * Uses anon key + RLS for secure, filtered subscriptions.
 */

import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { PresenceData } from '../types/index.js';
import { messageStore, Message as StoreMessage } from './MessageStore.js';

// Channel filter type for subscription filtering
type ChannelFilter = (data: StoreMessage | PresenceData) => boolean;

// Subscription options interface
interface SubscriptionOptions {
  filter?: ChannelFilter;
  onError?: (error: Error) => void;
  onSubscribe?: () => void;
  onUnsubscribe?: () => void;
}

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
      console.error('RealtimeSubscriptionService: Supabase client not available');
      return false;
    }

    this.isInitialized = true;
    console.log('✅ RealtimeSubscriptionService: Initialized');
    return true;
  }

  /**
   * Subscribe to messages for a page
   */
  async subscribeToPage(config: SubscriptionConfig): Promise<boolean> {
    const { pageId, communityId = 'comm-001', onError } = config;

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
      
      const channelBase = this.supabase.channel(channelName) as unknown as {
        on: (event: string, filter: { event: string; schema: string; table: string; filter?: string }, callback: (payload: unknown) => void) => unknown;
        subscribe: (callback: (status: string, err?: Error) => void) => unknown;
      };

      const channelChain = channelBase
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          },
          (payload: unknown) => {
            const p = payload as { new: StoreMessage };
            this.handleMessageInsert(p.new);
          }
        ) as { on: (event: string, filter: { event: string; schema: string; table: string; filter?: string }, callback: (payload: unknown) => void) => unknown; subscribe: (callback: (status: string, err?: Error) => void) => unknown };

      const channel = (channelChain
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          },
          (payload: unknown) => {
            const p = payload as { new: StoreMessage };
            this.handleMessageUpdate(p.new);
          }
        ) as { on: (event: string, filter: { event: string; schema: string; table: string; filter?: string }, callback: (payload: unknown) => void) => unknown; subscribe: (callback: (status: string, err?: Error) => void) => unknown })
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          },
          (payload: unknown) => {
            const p = payload as { old: StoreMessage };
            this.handleMessageDelete(p.old);
          }
        ) as { subscribe: (callback: (status: string, err?: Error) => void) => unknown };

      channel.subscribe((status: string, err?: Error) => {
        if (err) {
          console.error('RealtimeSubscriptionService: Subscription error:', err);
          if (onError) {
            onError(err);
          }
          this.showNotification('Real-time connection error. Some updates may be delayed.');
        } else if (status === 'SUBSCRIBED') {
          console.log(`✅ RealtimeSubscriptionService: Subscribed to ${channelName}`);
        }
      });

      this.channels.set(pageId, channelBase as unknown as RealtimeChannel);
      return true;

    } catch (error) {
      console.error('RealtimeSubscriptionService: Error subscribing:', error);
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
      const supabaseWithRemove = this.supabase as SupabaseClient & { removeChannel?: (channel: RealtimeChannel) => void };
      supabaseWithRemove.removeChannel?.(channel);
      this.channels.delete(pageId);
      console.log(`✅ RealtimeSubscriptionService: Unsubscribed from ${pageId}`);
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
    console.log('📨 RealtimeSubscriptionService: New message:', message.id);
    
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
    console.log('✏️ RealtimeSubscriptionService: Message updated:', message.id);
    
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
    console.log('🗑️ RealtimeSubscriptionService: Message deleted:', message.id);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('realtime-message-deleted', {
        detail: message
      }));
    }

    // Update MessageStore
    messageStore['handleRealtimeDelete'](message as { id?: string; message_id?: string });
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


/**
 * MessageRealtimeManager - Real-time message updates
 * 
 * Handles:
 * - New messages (regular/quote)
 * - Message updates (edit, delete)
 * - Reaction count updates
 * - Reply count updates
 */

import type { Message } from '../../types/index.js';
import { Logger } from '../../utils/Logger.js';

export interface MessageRealtimeManagerOptions {
  supabaseClient: unknown;
  pageId: string;
  communityId: string;
  onNewMessage: (message: Message) => void;
  onMessageUpdate: (message: Message) => void;
  onReactionUpdate: (messageId: string, count: number) => void;
}

interface SupabaseClient {
  channel: (name: string) => SupabaseChannel;
}

interface SupabaseChannel {
  on: (event: string, filter: Record<string, unknown>, callback: (payload: unknown) => void) => SupabaseChannel;
  subscribe: (callback?: (status: string) => void) => { unsubscribe: () => void };
}

/**
 * MessageRealtimeManager - Manages real-time subscriptions
 */
export class MessageRealtimeManager {
  private subscriptions: Array<() => void> = [];
  private messagesChannel: SupabaseChannel | null = null;
  private reactionsChannel: SupabaseChannel | null = null;

  constructor(private options: MessageRealtimeManagerOptions) {}

  /**
   * Initialize real-time subscriptions
   */
  async initialize(): Promise<void> {
    Logger.debug('MessageRealtimeManager: Initializing...', { 
      pageId: this.options.pageId,
      communityId: this.options.communityId
    }, 'messages');

    const supabase = this.options.supabaseClient as SupabaseClient | null;
    if (!supabase || typeof supabase.channel !== 'function') {
      Logger.warn('MessageRealtimeManager: Supabase client not available', null, 'messages');
      return;
    }

    try {
      // Subscribe to messages table changes
      this.messagesChannel = supabase.channel(`messages:${this.options.pageId}:${this.options.communityId}`);
      
      // Listen for new messages (INSERT)
      this.messagesChannel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `page_id=eq.${this.options.pageId}`
        },
        (payload: unknown) => {
          Logger.debug('MessageRealtimeManager: New message received', { payload }, 'messages');
          const typedPayload = payload as { new?: Record<string, unknown> };
          if (typedPayload?.new) {
            const message = this.transformMessagePayload(typedPayload.new);
            if (message) {
              this.options.onNewMessage(message);
            }
          }
        }
      );

      // Listen for message updates (UPDATE)
      this.messagesChannel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `page_id=eq.${this.options.pageId}`
        },
        (payload: unknown) => {
          Logger.debug('MessageRealtimeManager: Message updated', { payload }, 'messages');
          const typedPayload = payload as { new?: Record<string, unknown> };
          if (typedPayload?.new) {
            const message = this.transformMessagePayload(typedPayload.new);
            if (message) {
              this.options.onMessageUpdate(message);
            }
          }
        }
      );

      // Listen for message deletions (DELETE)
      this.messagesChannel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `page_id=eq.${this.options.pageId}`
        },
        (payload: unknown) => {
          Logger.debug('MessageRealtimeManager: Message deleted', { payload }, 'messages');
          const typedPayload = payload as { old?: Record<string, unknown> };
          if (typedPayload?.old) {
            const message = this.transformMessagePayload(typedPayload.old);
            if (message) {
              // Mark as deleted
              message.content = '[Deleted]';
              this.options.onMessageUpdate(message);
            }
          }
        }
      );

      // Subscribe to channel
      const messagesSubscription = this.messagesChannel.subscribe((status) => {
        Logger.debug('MessageRealtimeManager: Messages channel status', { status }, 'messages');
      });

      this.subscriptions.push(() => {
        if (messagesSubscription?.unsubscribe) {
          messagesSubscription.unsubscribe();
        }
      });

      // Subscribe to reactions table for count updates
      this.reactionsChannel = supabase.channel(`reactions:${this.options.pageId}`);
      
      // Listen for reaction changes
      this.reactionsChannel.on(
        'postgres_changes',
        {
          event: '*', // INSERT or DELETE
          schema: 'public',
          table: 'reactions'
        },
        async (payload: unknown) => {
          Logger.debug('MessageRealtimeManager: Reaction changed', { payload }, 'messages');
          const typedPayload = payload as { new?: { message_id?: string }; old?: { message_id?: string } };
          const messageId = typedPayload?.new?.message_id || typedPayload?.old?.message_id;
          if (messageId) {
            // Fetch updated reaction count
            const count = await this.getReactionCount(messageId);
            this.options.onReactionUpdate(messageId, count);
          }
        }
      );

      const reactionsSubscription = this.reactionsChannel.subscribe((status) => {
        Logger.debug('MessageRealtimeManager: Reactions channel status', { status }, 'messages');
      });

      this.subscriptions.push(() => {
        if (reactionsSubscription?.unsubscribe) {
          reactionsSubscription.unsubscribe();
        }
      });

      Logger.debug('MessageRealtimeManager: Real-time subscriptions initialized', null, 'messages');
    } catch (error) {
      Logger.error('MessageRealtimeManager: Error initializing subscriptions', error, 'messages');
    }
  }

  /**
   * Transform Supabase message payload to Message format
   */
  private transformMessagePayload(payload: Record<string, unknown>): Message | null {
    if (!payload || !payload.id) {
      return null;
    }

    // Get author data (may be in AppUser relation)
    const appUser = payload.AppUser as { id?: string; name?: string; handle?: string; avatar_url?: string; aura_color?: string } | undefined;
    const authorId = String(payload.user_id || payload.userId || appUser?.id || '');

    const parentIdValue = payload.parent_id || payload.parentId;
    const parentId = parentIdValue === null || parentIdValue === undefined || parentIdValue === 'null' 
      ? null 
      : String(parentIdValue);
    
    const createdAtValue = payload.created_at || payload.createdAt;
    const createdAt = createdAtValue instanceof Date 
      ? createdAtValue.toISOString() 
      : typeof createdAtValue === 'string' 
        ? createdAtValue 
        : new Date().toISOString();
    
    const updatedAtValue = payload.updated_at || payload.updatedAt;
    const updatedAt = updatedAtValue instanceof Date 
      ? updatedAtValue.toISOString() 
      : typeof updatedAtValue === 'string' 
        ? updatedAtValue 
        : new Date().toISOString();
    
    const optionalContentValue = payload.optional_content || payload.optionalContent;
    const optionalContent = optionalContentValue === null || optionalContentValue === undefined 
      ? null 
      : String(optionalContentValue);
    
    return {
      id: String(payload.id),
      content: String(payload.content || ''),
      authorId,
      communityId: String(payload.community_id || payload.communityId || this.options.communityId),
      pageId: String(payload.page_id || payload.pageId || this.options.pageId),
      parentId,
      author: appUser ? {
        id: appUser.id,
        name: appUser.name,
        handle: appUser.handle,
        avatarUrl: appUser.avatar_url,
        auraColor: appUser.aura_color
      } : undefined,
      createdAt,
      updatedAt,
      optionalContent
    };
  }

  /**
   * Get reaction count for a message
   */
  private async getReactionCount(messageId: string): Promise<number> {
    try {
      const supabase = this.options.supabaseClient as SupabaseClient | null;
      if (!supabase) return 0;

      // Query reactions count
      const query = (supabase as { from?: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => Promise<{ data?: unknown[]; error?: unknown }> } } }).from;
      if (!query) return 0;

      const result = await query('reactions')
        .select('id')
        .eq('message_id', messageId);

      if (result.error) {
        Logger.warn('MessageRealtimeManager: Error fetching reaction count', { error: result.error }, 'messages');
        return 0;
      }

      return Array.isArray(result.data) ? result.data.length : 0;
    } catch (error) {
      Logger.warn('MessageRealtimeManager: Exception fetching reaction count', { error }, 'messages');
      return 0;
    }
  }

  /**
   * Destroy subscriptions
   */
  destroy(): void {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    
    if (this.messagesChannel) {
      this.messagesChannel = null;
    }
    
    if (this.reactionsChannel) {
      this.reactionsChannel = null;
    }
    
    Logger.debug('MessageRealtimeManager: Destroyed', null, 'messages');
  }
}


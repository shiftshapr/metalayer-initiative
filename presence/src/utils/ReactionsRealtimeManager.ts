/**
 * REACTIONS REALTIME MANAGER - Following Working Message Pattern
 * Extends the working message system pattern for reactions features
 */

import { Logger } from './Logger.js';
import type { SupabaseClient } from '../types/index.js';

interface LoggerInterface {
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
}

interface User {
  id: string;
  email?: string;
  communityId: string;
}

interface Status {
  isConnected: boolean;
  isConnecting: boolean;
  currentPageId: string | null;
  user: string | null;
  channels: string[];
}

 
export class ReactionsRealtimeManager {
  public isConnected: boolean = false;
  private isConnecting: boolean = false;
  private currentPageId: string | null = null;
  private user: User | null = null;
  private supabase: SupabaseClient | null = null;
  public channels: Map<string, unknown> = new Map();
  private _processedEvents: Set<string> = new Set();
  private logger: LoggerInterface;

  constructor() {
    this.logger = this._createLogger();
  }

  /**
   * Initialize with Supabase client
   */
  async initialize(supabaseClient: SupabaseClient): Promise<boolean> {
    if (!supabaseClient) {
      this.logger.error('Supabase client required');
      return false;
    }

    this.supabase = supabaseClient;
    this.logger.info('ReactionsRealtimeManager initialized');
    return true;
  }

  /**
   * Set user for real-time operations
   */
  setUser(userId: string, communityId = 'comm-001'): boolean {
    if (!userId) {
      this.logger.error('User ID is required');
      return false;
    }

    this.user = {
      id: userId,
      communityId: communityId,
    };

    this.logger.info(`User set: ${userId}`);
    return true;
  }

  /**
   * Join a page for real-time reactions updates
   */
  async joinPage(pageUrl: string): Promise<boolean> {
    if (!this.user) {
      this.logger.error('User must be set before joining page');
      return false;
    }

    if (this.isConnecting) {
      this.logger.warn('Already connecting to page');
      return false;
    }

    try {
      this.isConnecting = true;
      this.logger.info(`Joining page for reactions: ${pageUrl}`);

      // Normalize page URL (same as message system)
      const normalizedUrl = await this._normalizeUrl(pageUrl);
      this.currentPageId = normalizedUrl;

      // Subscribe to Postgres Changes for reactions
      await this._setupReactionsSubscription(normalizedUrl);

      this.isConnected = true;
      this.isConnecting = false;

      this.logger.info('Page joined for reactions successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to join page for reactions:', error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Setup Postgres Changes subscription for reactions
   */
  private async _setupReactionsSubscription(pageId: string): Promise<void> {
    try {
      const channelName = `reactions-${pageId}`;

      if (!this.supabase) {
        this.logger.error('Supabase client not initialized');
        return;
      }
      const channel = this.supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reactions',
          },
          (payload?: { eventType?: string; new?: unknown; old?: unknown }) => {
            if (payload) {
              this._handleReactionChange(
                payload as { eventType?: string; new?: { id: string }; old?: { id: string } }
              );
            }
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
      this.logger.info(`Reactions subscription started for page: ${pageId}`);
    } catch (error) {
      this.logger.error('Failed to setup reactions subscription:', error);
      throw error;
    }
  }

  /**
   * Handle reaction changes from Postgres
   */
  private _handleReactionChange(payload: {
    eventType?: string;
    new?: { id: string };
    old?: { id: string };
  }): void {
    const eventId = `reaction-${payload.new?.id || payload.old?.id}-${Date.now()}`;

    // Prevent duplicate processing
    if (this._processedEvents.has(eventId)) {
      return;
    }
    this._processedEvents.add(eventId);

    this.logger.info('Reaction change received:', payload);
    this.logger.info(
      `Real-time ${payload.eventType || 'UNKNOWN'} event for reaction:`,
      payload.new?.id || payload.old?.id
    );

    // COMP METHOD: Delegate to the existing global handler
    const windowWithHandler = window as Window & { handleReactionChange?: (payload: { eventType?: string; new?: { id: string }; old?: { id: string } }) => void };
    if (typeof windowWithHandler.handleReactionChange === 'function') {
      this.logger.info('Delegating to window.handleReactionChange');
      windowWithHandler.handleReactionChange(payload);
    } else {
      this.logger.warn('window.handleReactionChange not available, emitting event');
      this._emitReactionEvent(payload);
    }
  }

  /**
   * Emit reaction event
   */
  private _emitReactionEvent(payload: { eventType?: string; new?: unknown; old?: unknown }): void {
    // Use the same pattern as the working message system
    // Try ES6 import first, fallback to window for legacy code
    // Note: Using window fallback here to avoid potential circular dependencies
    // This is safe as realtimeFoundation is initialized early in the lifecycle
    let realtimeFoundation: { emit: (event: string, data: unknown) => void } | null = null;
    const windowWithRealtime = window as Window & { realtimeFoundation?: { emit: (event: string, data: unknown) => void } };
    if (windowWithRealtime.realtimeFoundation) {
      realtimeFoundation = windowWithRealtime.realtimeFoundation;
    }

    if (realtimeFoundation && typeof realtimeFoundation.emit === 'function') {
      realtimeFoundation.emit('reaction-realtime-update', {
        type: payload.eventType || 'UPDATE',
        data: payload.new || payload.old,
        pageId: this.currentPageId,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, reactionType: string): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    if (!this.user) {
      this.logger.error('User not set');
      return false;
    }

    try {
      this.logger.info(`Adding reaction: ${reactionType} to message: ${messageId}`);

      // COMP METHOD: Use API instead of direct Supabase calls
      // Backend uses authenticated user from headers - don't send user_id in body
      const windowWithApi = window as Window & {
        api?: { request: (url: string, options: { method: string; body: string }) => Promise<{ success?: boolean; action?: string }> };
      };
      if (typeof windowWithApi.api !== 'undefined' && windowWithApi.api?.request) {
        const result = await windowWithApi.api.request('/v1/reactions', {
          method: 'POST',
          body: JSON.stringify({
            messageId: messageId,
            emoji: reactionType,
          }),
        });

        if (result && (result.success || result.action)) {
          this.logger.info('Reaction added successfully via API:', result);
          return true;
        } else {
          this.logger.error('API failed to add reaction:', result);
          return false;
        }
      } else {
        this.logger.error('API module not available');
        return false;
      }
    } catch (error) {
      this.logger.error('Error adding reaction:', error);
      return false;
    }
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId: string, reactionType: string): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    if (!this.user) {
      this.logger.error('User not set');
      return false;
    }

    try {
      this.logger.info(`Removing reaction: ${reactionType} from message: ${messageId}`);

      // COMP METHOD: Use API instead of direct Supabase calls
      // Backend uses authenticated user from headers - don't send user_id in body
      const windowWithApi = window as Window & {
        api?: { request: (url: string, options: { method: string; body: string }) => Promise<{ success?: boolean; action?: string }> };
      };
      if (typeof windowWithApi.api !== 'undefined' && windowWithApi.api?.request) {
        const result = await windowWithApi.api.request('/v1/reactions', {
          method: 'POST',
          body: JSON.stringify({
            messageId: messageId,
            emoji: reactionType,
          }),
        });

        if (result && (result.success || result.action)) {
          this.logger.info('Reaction removed successfully via API:', result);
          return true;
        } else {
          this.logger.error('API failed to remove reaction:', result);
          return false;
        }
      } else {
        this.logger.error('API module not available');
        return false;
      }
    } catch (error) {
      this.logger.error('Error removing reaction:', error);
      return false;
    }
  }

  /**
   * Get reactions for a message
   */
  async getReactions(messageId: string): Promise<unknown> {
    if (!this.isConnected) {
      this.logger.error('Not connected to any page');
      return false;
    }

    if (!this.supabase) {
      this.logger.error('Supabase client not initialized');
      return false;
    }

    try {
      this.logger.info(`Getting reactions for message: ${messageId}`);

      const { data, error } = await this.supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        this.logger.error('Failed to get reactions:', error);
        return false;
      }

      this.logger.info('Reactions retrieved successfully:', data);
      return data;
    } catch (error) {
      this.logger.error('Error getting reactions:', error);
      return false;
    }
  }

  /**
   * Normalize URL (same as message system)
   */
  private async _normalizeUrl(url: string): Promise<string> {
    try {
      // Use the same normalization as the working message system
      const windowWithNormalize = window as Window & {
        normalizeUrl?: (url: string) => Promise<{ pageId?: string }>;
      };
      if (typeof windowWithNormalize.normalizeUrl === 'function') {
        const result = await windowWithNormalize.normalizeUrl(url);
        return result.pageId || url;
      }

      // Fallback normalization
      const urlObj = new URL(url);
      const normalized = urlObj.hostname + urlObj.pathname;
      return normalized.replace(/[.\/]/g, '_');
    } catch (_error) {
      this.logger.warn('Failed to normalize URL, using as-is:', url);
      return url;
    }
  }

  /**
   * Create logger
   */
  private _createLogger(): LoggerInterface {
    return {
      info: (message: string, data?: unknown) =>
        Logger.info(`[ReactionsRealtimeManager] ${message}`, data, 'reactions-realtime'),
      warn: (message: string, data?: unknown) =>
        Logger.warn(`[ReactionsRealtimeManager] ${message}`, data, 'reactions-realtime'),
      error: (message: string, data?: unknown) =>
        Logger.error(`[ReactionsRealtimeManager] ${message}`, data, 'reactions-realtime'),
      debug: (message: string, data?: unknown) =>
        Logger.debug(`[ReactionsRealtimeManager] ${message}`, data, 'reactions-realtime'),
    };
  }

  /**
   * Get connection status
   */
  getStatus(): Status {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      currentPageId: this.currentPageId,
      user: this.user ? this.user.email || this.user.id : null,
      channels: Array.from(this.channels.keys()),
    };
  }
}

// Export for use
if (typeof window !== 'undefined') {
  const windowWithReactions = window as Window & {
    ReactionsRealtimeManager?: typeof ReactionsRealtimeManager;
  };
  windowWithReactions.ReactionsRealtimeManager = ReactionsRealtimeManager;
}

/**
 * Timeline Real-time Manager
 * Manages Supabase real-time subscriptions for timeline updates
 */

import type { 
  SupabaseClient, 
  SupabaseChannel, 
  SupabaseRealtimePayload,
  Activity,
  ActivityType,
  VisibilityType
} from '../types';
import type { TimelineManager } from './TimelineManager';

export class TimelineRealtime {
  private client: SupabaseClient | null;
  private timelineManager: TimelineManager;
  private subscriptions: Map<string, SupabaseChannel[]>;

  constructor(supabaseClient: SupabaseClient | null, timelineManager: TimelineManager) {
    this.client = supabaseClient;
    this.timelineManager = timelineManager;
    this.subscriptions = new Map(); // userId -> Subscription[]
  }

  /**
   * Subscribe to real-time updates for a user
   */
  async subscribeToUser(userId: string): Promise<void> {
    if (this.subscriptions.has(userId)) {
      console.log(`Already subscribed to user ${userId}`);
      return;
    }

    const subscriptions: SupabaseChannel[] = [];

    try {
      // Subscribe to messages
      const messagesSub = await this.subscribeToMessages(userId);
      if (messagesSub) subscriptions.push(messagesSub);

      // Subscribe to reactions
      const reactionsSub = await this.subscribeToReactions(userId);
      if (reactionsSub) subscriptions.push(reactionsSub);

      // Subscribe to bookmarks
      const bookmarksSub = await this.subscribeToBookmarks(userId);
      if (bookmarksSub) subscriptions.push(bookmarksSub);

      // Subscribe to profile updates (audit logs)
      const profileSub = await this.subscribeToProfileUpdates(userId);
      if (profileSub) subscriptions.push(profileSub);

      // Subscribe to community memberships
      const communitySub = await this.subscribeToCommunityJoins(userId);
      if (communitySub) subscriptions.push(communitySub);

      this.subscriptions.set(userId, subscriptions);
      console.log(`Subscribed to real-time updates for user ${userId}`);

    } catch (error) {
      console.error(`Error subscribing to user ${userId}:`, error);
      // Clean up partial subscriptions
      subscriptions.forEach(sub => sub?.unsubscribe());
    }
  }

  /**
   * Unsubscribe from user updates
   */
  unsubscribeFromUser(userId: string): void {
    const subscriptions = this.subscriptions.get(userId);
    if (subscriptions) {
      subscriptions.forEach(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
      this.subscriptions.delete(userId);
      console.log(`Unsubscribed from user ${userId}`);
    }
  }

  /**
   * Subscribe to messages
   */
  async subscribeToMessages(userId: string): Promise<SupabaseChannel | null> {
    try {
      // Use Supabase realtime channel
      if (!this.client || !this.client.channel) {
        console.warn('Supabase client not available for realtime subscriptions');
        return null;
      }

      const channel = this.client.channel(`timeline:${userId}:messages`);
      
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${userId}`
      }, (payload: SupabaseRealtimePayload) => {
        this.handleMessageEvent(userId, payload);
      });

      const status = await channel.subscribe();
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to messages for user ${userId}`);
        return channel;
      }
      return null;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return null;
    }
  }

  /**
   * Subscribe to reactions
   */
  async subscribeToReactions(userId: string): Promise<SupabaseChannel | null> {
    try {
      if (!this.client || !this.client.channel) {
        console.warn('Supabase client not available for realtime subscriptions');
        return null;
      }

      const channel = this.client.channel(`timeline:${userId}:reactions`);
      
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `user_id=eq.${userId}`
      }, (payload: SupabaseRealtimePayload) => {
        this.handleReactionEvent(userId, payload);
      });

      const status = await channel.subscribe();
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to reactions for user ${userId}`);
        return channel;
      }
      return null;
    } catch (error) {
      console.error('Error subscribing to reactions:', error);
      return null;
    }
  }

  /**
   * Subscribe to bookmarks
   */
  async subscribeToBookmarks(userId: string): Promise<SupabaseChannel | null> {
    try {
      if (!this.client || !this.client.channel) {
        console.warn('Supabase client not available for realtime subscriptions');
        return null;
      }

      const channel = this.client.channel(`timeline:${userId}:bookmarks`);
      
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookmarks',
        filter: `user_id=eq.${userId}`
      }, (payload: SupabaseRealtimePayload) => {
        this.handleBookmarkEvent(userId, payload);
      });

      const status = await channel.subscribe();
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to bookmarks for user ${userId}`);
        return channel;
      }
      return null;
    } catch (error) {
      console.error('Error subscribing to bookmarks:', error);
      return null;
    }
  }

  /**
   * Subscribe to profile updates
   */
  async subscribeToProfileUpdates(userId: string): Promise<SupabaseChannel | null> {
    try {
      if (!this.client || !this.client.channel) {
        console.warn('Supabase client not available for realtime subscriptions');
        return null;
      }

      const channel = this.client.channel(`timeline:${userId}:profile`);
      
      channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_audit_logs',
        filter: `user_id=eq.${userId}`
      }, (payload: SupabaseRealtimePayload) => {
        this.handleProfileUpdateEvent(userId, payload);
      });

      const status = await channel.subscribe();
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to profile updates for user ${userId}`);
        return channel;
      }
      return null;
    } catch (error) {
      console.error('Error subscribing to profile updates:', error);
      return null;
    }
  }

  /**
   * Subscribe to community joins
   */
  async subscribeToCommunityJoins(userId: string): Promise<SupabaseChannel | null> {
    try {
      if (!this.client || !this.client.channel) {
        console.warn('Supabase client not available for realtime subscriptions');
        return null;
      }

      const channel = this.client.channel(`timeline:${userId}:communities`);
      
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'MetaCommunityMembership',
        filter: `userId=eq.${userId}`
      }, (payload: SupabaseRealtimePayload) => {
        this.handleCommunityJoinEvent(userId, payload);
      });

      const status = await channel.subscribe();
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to community joins for user ${userId}`);
        return channel;
      }
      return null;
    } catch (error) {
      console.error('Error subscribing to community joins:', error);
      return null;
    }
  }

  /**
   * Handle message event
   */
  private handleMessageEvent(userId: string, payload: SupabaseRealtimePayload): void {
    const activity = this.normalizeMessageEvent(payload);
    if (activity) {
      this.timelineManager.addActivity(userId, activity);
    }
  }

  /**
   * Handle reaction event
   */
  private handleReactionEvent(userId: string, payload: SupabaseRealtimePayload): void {
    const activity = this.normalizeReactionEvent(payload);
    if (activity) {
      if (payload.eventType === 'DELETE') {
        this.timelineManager.removeActivity(userId, activity.id);
      } else {
        this.timelineManager.addActivity(userId, activity);
      }
    }
  }

  /**
   * Handle bookmark event
   */
  private handleBookmarkEvent(userId: string, payload: SupabaseRealtimePayload): void {
    const activity = this.normalizeBookmarkEvent(payload);
    if (activity) {
      if (payload.eventType === 'DELETE') {
        this.timelineManager.removeActivity(userId, activity.id);
      } else {
        this.timelineManager.addActivity(userId, activity);
      }
    }
  }

  /**
   * Handle profile update event
   */
  private handleProfileUpdateEvent(userId: string, payload: SupabaseRealtimePayload): void {
    const activity = this.normalizeProfileUpdateEvent(payload);
    if (activity) {
      this.timelineManager.addActivity(userId, activity);
    }
  }

  /**
   * Handle community join event
   */
  private handleCommunityJoinEvent(userId: string, payload: SupabaseRealtimePayload): void {
    const activity = this.normalizeCommunityJoinEvent(payload);
    if (activity) {
      this.timelineManager.addActivity(userId, activity);
    }
  }

  /**
   * Normalize message event to timeline activity
   */
  private normalizeMessageEvent(payload: SupabaseRealtimePayload): Activity | null {
    if (payload.eventType === 'DELETE' || !payload.new) {
      return null; // Deletions handled separately
    }

    return {
      id: payload.new.id,
      type: 'message' as ActivityType,
      userId: payload.new.user_id,
      timestamp: payload.new.created_at as string,
      visibility: this.determineMessageVisibility(payload.new.community_id) as VisibilityType,
      data: {
        content: payload.new.content,
        communityId: payload.new.community_id
      }
    };
  }

  /**
   * Normalize reaction event
   */
  private normalizeReactionEvent(payload: SupabaseRealtimePayload): Activity | null {
    if (!payload.new) return null;

    return {
      id: payload.new.id,
      type: 'reaction' as ActivityType,
      userId: payload.new.user_id,
      timestamp: payload.new.created_at as string,
      visibility: 'public' as VisibilityType,
      data: {
        emoji: payload.new.emoji,
        messageId: payload.new.message_id
      }
    };
  }

  /**
   * Normalize bookmark event
   */
  private normalizeBookmarkEvent(payload: SupabaseRealtimePayload): Activity | null {
    if (!payload.new) return null;

    return {
      id: payload.new.id,
      type: 'bookmark' as ActivityType,
      userId: payload.new.user_id,
      timestamp: payload.new.created_at as string,
      visibility: 'private' as VisibilityType,
      data: {
        messageId: payload.new.message_id
      }
    };
  }

  /**
   * Normalize profile update event
   */
  private normalizeProfileUpdateEvent(payload: SupabaseRealtimePayload): Activity | null {
    if (!payload.new) return null;

    return {
      id: payload.new.id,
      type: 'profileUpdate' as ActivityType,
      userId: payload.new.user_id,
      timestamp: payload.new.created_at as string,
      visibility: this.determineProfileUpdateVisibility(payload.new.field_name) as VisibilityType,
      data: {
        fieldName: payload.new.field_name,
        oldValue: payload.new.old_value,
        newValue: payload.new.new_value,
        changeType: payload.new.change_type
      }
    };
  }

  /**
   * Normalize community join event
   */
  private normalizeCommunityJoinEvent(payload: SupabaseRealtimePayload): Activity | null {
    if (!payload.new) return null;

    return {
      id: payload.new.id,
      type: 'communityJoin' as ActivityType,
      userId: payload.new.userId,
      timestamp: payload.new.joinedAt as string,
      visibility: 'community' as VisibilityType,
      data: {
        communityId: payload.new.metaCommunityId,
        isActive: payload.new.isActive
      }
    };
  }

  /**
   * Determine message visibility
   */
  private determineMessageVisibility(communityId: string | null | undefined): VisibilityType {
    const publicSquareId = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4';
    return communityId === publicSquareId ? 'public' : 'community';
  }

  /**
   * Determine profile update visibility
   */
  private determineProfileUpdateVisibility(fieldName: string | null | undefined): VisibilityType {
    const publicFields = ['headline', 'displayName'];
    return fieldName && publicFields.includes(fieldName) ? 'public' : 'private';
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach((subs, userId) => {
      this.unsubscribeFromUser(userId);
    });
  }
}









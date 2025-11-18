/**
 * SUBSCRIPTION MANAGER - Notification Subscription Management
 * Manages user subscriptions to rooms, users, communities, timelines, etc.
 */

import {
  Subscription,
  SubscriptionFilter,
  SubscriptionEvent,
  SubscriptionEventPayload,
  SubscriptionStats,
  SubscriptionTargetType,
  CreateSubscriptionOptions,
  UpdateSubscriptionOptions,
  BulkSubscriptionResult
} from '../types/subscriptions';
import { Logger } from '../utils/Logger';

/**
 * SubscriptionManager class
 * Manages notification subscriptions for various targets
 */
export class SubscriptionManager {
  private logger: Logger;
  private isInitialized: boolean = false;
  private subscriptions: Map<string, Subscription> = new Map();
  private storageKey: string = 'notificationSubscriptions';
  private eventListeners: Map<SubscriptionEvent, Set<(payload: SubscriptionEventPayload) => void>> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Initialize SubscriptionManager
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('SubscriptionManager already initialized');
      return;
    }

    this.logger.info('Initializing SubscriptionManager...');

    try {
      this.currentUserId = userId;
      
      // Load subscriptions from storage
      await this.loadSubscriptions();

      this.isInitialized = true;
      this.logger.info(`SubscriptionManager initialized with ${this.subscriptions.size} subscriptions`);
    } catch (error) {
      this.logger.error('Failed to initialize SubscriptionManager:', error);
      throw error;
    }
  }

  /**
   * Create a new subscription
   */
  async subscribe(options: CreateSubscriptionOptions): Promise<Subscription> {
    try {
      if (!this.currentUserId) {
        throw new Error('User ID not set. Call initialize() first.');
      }

      // Check if subscription already exists
      const existing = this.findSubscription(options.targetType, options.targetId);
      if (existing) {
        this.logger.info('Subscription already exists, updating it');
        return await this.updateSubscription(existing.id, {
          active: true,
          preferences: options.preferences
        });
      }

      // Create new subscription
      const subscription: Subscription = {
        id: this.generateSubscriptionId(),
        userId: this.currentUserId,
        targetType: options.targetType,
        targetId: options.targetId,
        targetName: options.targetName,
        active: true,
        preferences: {
          enabled: true,
          sound: true,
          desktop: true,
          ...options.preferences
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: options.metadata
      };

      // Store subscription
      this.subscriptions.set(subscription.id, subscription);
      await this.saveSubscriptions();

      // Emit event
      this.emitEvent('subscription:created', subscription);

      this.logger.info(`Subscription created: ${subscription.targetType}:${subscription.targetId}`);
      return subscription;
    } catch (error) {
      this.logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(
    subscriptionId: string,
    options: UpdateSubscriptionOptions
  ): Promise<Subscription> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      // Update fields
      if (options.active !== undefined) {
        subscription.active = options.active;
      }

      if (options.preferences) {
        subscription.preferences = {
          ...subscription.preferences,
          ...options.preferences
        };
      }

      if (options.metadata) {
        subscription.metadata = {
          ...subscription.metadata,
          ...options.metadata
        };
      }

      subscription.updatedAt = Date.now();

      // Save
      await this.saveSubscriptions();

      // Emit event
      this.emitEvent('subscription:updated', subscription);

      this.logger.info(`Subscription updated: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Delete a subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      // Remove from map
      this.subscriptions.delete(subscriptionId);
      await this.saveSubscriptions();

      // Emit event
      this.emitEvent('subscription:deleted', subscription);

      this.logger.info(`Subscription deleted: ${subscriptionId}`);
    } catch (error) {
      this.logger.error('Error deleting subscription:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe by target
   */
  async unsubscribeByTarget(targetType: SubscriptionTargetType, targetId: string): Promise<void> {
    const subscription = this.findSubscription(targetType, targetId);
    if (subscription) {
      await this.unsubscribe(subscription.id);
    }
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Find subscription by target
   */
  findSubscription(targetType: SubscriptionTargetType, targetId: string): Subscription | undefined {
    return Array.from(this.subscriptions.values()).find(
      sub => sub.targetType === targetType && sub.targetId === targetId
    );
  }

  /**
   * Check if subscribed to target
   */
  isSubscribed(targetType: SubscriptionTargetType, targetId: string): boolean {
    const subscription = this.findSubscription(targetType, targetId);
    return subscription?.active && subscription?.preferences.enabled || false;
  }

  /**
   * Get all subscriptions with optional filter
   */
  getSubscriptions(filter?: SubscriptionFilter): Subscription[] {
    let subscriptions = Array.from(this.subscriptions.values());

    if (filter) {
      // Filter by target type
      if (filter.targetType) {
        const types = Array.isArray(filter.targetType) ? filter.targetType : [filter.targetType];
        subscriptions = subscriptions.filter(sub => types.includes(sub.targetType));
      }

      // Filter by active status
      if (filter.active !== undefined) {
        subscriptions = subscriptions.filter(sub => sub.active === filter.active);
      }

      // Filter by enabled status
      if (filter.enabled !== undefined) {
        subscriptions = subscriptions.filter(sub => sub.preferences.enabled === filter.enabled);
      }

      // Filter by target ID
      if (filter.targetId) {
        subscriptions = subscriptions.filter(sub => sub.targetId === filter.targetId);
      }

      // Search by target name
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        subscriptions = subscriptions.filter(sub =>
          sub.targetName?.toLowerCase().includes(searchLower)
        );
      }

      // Exclude muted (unless explicitly included)
      if (!filter.includeMuted) {
        const now = Date.now();
        subscriptions = subscriptions.filter(sub =>
          !sub.preferences.mutedUntil || sub.preferences.mutedUntil < now
        );
      }

      // Limit results
      if (filter.limit) {
        subscriptions = subscriptions.slice(0, filter.limit);
      }
    }

    return subscriptions;
  }

  /**
   * Mute subscription temporarily
   */
  async muteSubscription(subscriptionId: string, durationMs: number): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      subscription.preferences.mutedUntil = Date.now() + durationMs;
      subscription.updatedAt = Date.now();

      await this.saveSubscriptions();
      this.emitEvent('subscription:muted', subscription);

      this.logger.info(`Subscription muted: ${subscriptionId} for ${durationMs}ms`);
    } catch (error) {
      this.logger.error('Error muting subscription:', error);
      throw error;
    }
  }

  /**
   * Unmute subscription
   */
  async unmuteSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      delete subscription.preferences.mutedUntil;
      subscription.updatedAt = Date.now();

      await this.saveSubscriptions();
      this.emitEvent('subscription:unmuted', subscription);

      this.logger.info(`Subscription unmuted: ${subscriptionId}`);
    } catch (error) {
      this.logger.error('Error unmuting subscription:', error);
      throw error;
    }
  }

  /**
   * Enable subscription
   */
  async enableSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      subscription.preferences.enabled = true;
      subscription.updatedAt = Date.now();

      await this.saveSubscriptions();
      this.emitEvent('subscription:enabled', subscription);

      this.logger.info(`Subscription enabled: ${subscriptionId}`);
    } catch (error) {
      this.logger.error('Error enabling subscription:', error);
      throw error;
    }
  }

  /**
   * Disable subscription
   */
  async disableSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      subscription.preferences.enabled = false;
      subscription.updatedAt = Date.now();

      await this.saveSubscriptions();
      this.emitEvent('subscription:disabled', subscription);

      this.logger.info(`Subscription disabled: ${subscriptionId}`);
    } catch (error) {
      this.logger.error('Error disabling subscription:', error);
      throw error;
    }
  }

  /**
   * Bulk subscribe to multiple targets
   */
  async bulkSubscribe(targets: CreateSubscriptionOptions[]): Promise<BulkSubscriptionResult> {
    const result: BulkSubscriptionResult = {
      count: 0,
      subscriptionIds: [],
      errors: []
    };

    for (const target of targets) {
      try {
        const subscription = await this.subscribe(target);
        result.count++;
        result.subscriptionIds.push(subscription.id);
      } catch (error) {
        result.errors?.push({
          subscriptionId: `${target.targetType}:${target.targetId}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Bulk unsubscribe
   */
  async bulkUnsubscribe(subscriptionIds: string[]): Promise<BulkSubscriptionResult> {
    const result: BulkSubscriptionResult = {
      count: 0,
      subscriptionIds: [],
      errors: []
    };

    for (const id of subscriptionIds) {
      try {
        await this.unsubscribe(id);
        result.count++;
        result.subscriptionIds.push(id);
      } catch (error) {
        result.errors?.push({
          subscriptionId: id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return result;
  }

  /**
   * Get subscription statistics
   */
  getStats(): SubscriptionStats {
    const subscriptions = Array.from(this.subscriptions.values());
    const now = Date.now();

    const stats: SubscriptionStats = {
      total: subscriptions.length,
      active: subscriptions.filter(sub => sub.active).length,
      muted: subscriptions.filter(sub =>
        sub.preferences.mutedUntil && sub.preferences.mutedUntil > now
      ).length,
      byType: {},
      autoSubscribed: subscriptions.filter(sub => sub.metadata?.autoSubscribed).length
    };

    // Count by type
    subscriptions.forEach(sub => {
      stats.byType[sub.targetType] = (stats.byType[sub.targetType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Auto-subscribe to target (e.g., when joining room)
   */
  async autoSubscribe(
    targetType: SubscriptionTargetType,
    targetId: string,
    targetName?: string,
    reason?: string
  ): Promise<Subscription> {
    return await this.subscribe({
      targetType,
      targetId,
      targetName,
      metadata: {
        autoSubscribed: true,
        reason: reason || 'Auto-subscribed'
      }
    });
  }

  /**
   * Load subscriptions from storage
   */
  private async loadSubscriptions(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.storageKey);
      const data = result[this.storageKey] as Subscription[] || [];
      
      // Filter by current user
      const userSubscriptions = data.filter(sub => sub.userId === this.currentUserId);
      
      // Load into map
      this.subscriptions.clear();
      userSubscriptions.forEach(sub => {
        this.subscriptions.set(sub.id, sub);
      });

      this.logger.info(`Loaded ${this.subscriptions.size} subscriptions`);
    } catch (error) {
      this.logger.error('Error loading subscriptions:', error);
      this.subscriptions.clear();
    }
  }

  /**
   * Save subscriptions to storage
   */
  private async saveSubscriptions(): Promise<void> {
    try {
      const subscriptions = Array.from(this.subscriptions.values());
      await chrome.storage.local.set({ [this.storageKey]: subscriptions });
    } catch (error) {
      this.logger.error('Error saving subscriptions:', error);
    }
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add event listener
   */
  on(event: SubscriptionEvent, callback: (payload: SubscriptionEventPayload) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  off(event: SubscriptionEvent, callback: (payload: SubscriptionEventPayload) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Emit event
   */
  private emitEvent(event: SubscriptionEvent, subscription: Subscription): void {
    const payload: SubscriptionEventPayload = {
      event,
      subscription,
      timestamp: Date.now()
    };

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          this.logger.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();




/**
 * SUBSCRIPTION MANAGER - Notification Subscription Management
 * Manages user subscriptions to rooms, users, communities, timelines, etc.
 */
import { Subscription, SubscriptionFilter, SubscriptionEvent, SubscriptionEventPayload, SubscriptionStats, SubscriptionTargetType, CreateSubscriptionOptions, UpdateSubscriptionOptions, BulkSubscriptionResult } from '../types/subscriptions';
/**
 * SubscriptionManager class
 * Manages notification subscriptions for various targets
 */
export declare class SubscriptionManager {
    private logger;
    private isInitialized;
    private subscriptions;
    private storageKey;
    private eventListeners;
    private currentUserId;
    constructor();
    /**
     * Initialize SubscriptionManager
     */
    initialize(userId: string): Promise<void>;
    /**
     * Create a new subscription
     */
    subscribe(options: CreateSubscriptionOptions): Promise<Subscription>;
    /**
     * Update an existing subscription
     */
    updateSubscription(subscriptionId: string, options: UpdateSubscriptionOptions): Promise<Subscription>;
    /**
     * Delete a subscription
     */
    unsubscribe(subscriptionId: string): Promise<void>;
    /**
     * Unsubscribe by target
     */
    unsubscribeByTarget(targetType: SubscriptionTargetType, targetId: string): Promise<void>;
    /**
     * Get subscription by ID
     */
    getSubscription(subscriptionId: string): Subscription | undefined;
    /**
     * Find subscription by target
     */
    findSubscription(targetType: SubscriptionTargetType, targetId: string): Subscription | undefined;
    /**
     * Check if subscribed to target
     */
    isSubscribed(targetType: SubscriptionTargetType, targetId: string): boolean;
    /**
     * Get all subscriptions with optional filter
     */
    getSubscriptions(filter?: SubscriptionFilter): Subscription[];
    /**
     * Mute subscription temporarily
     */
    muteSubscription(subscriptionId: string, durationMs: number): Promise<void>;
    /**
     * Unmute subscription
     */
    unmuteSubscription(subscriptionId: string): Promise<void>;
    /**
     * Enable subscription
     */
    enableSubscription(subscriptionId: string): Promise<void>;
    /**
     * Disable subscription
     */
    disableSubscription(subscriptionId: string): Promise<void>;
    /**
     * Bulk subscribe to multiple targets
     */
    bulkSubscribe(targets: CreateSubscriptionOptions[]): Promise<BulkSubscriptionResult>;
    /**
     * Bulk unsubscribe
     */
    bulkUnsubscribe(subscriptionIds: string[]): Promise<BulkSubscriptionResult>;
    /**
     * Get subscription statistics
     */
    getStats(): SubscriptionStats;
    /**
     * Auto-subscribe to target (e.g., when joining room)
     */
    autoSubscribe(targetType: SubscriptionTargetType, targetId: string, targetName?: string, reason?: string): Promise<Subscription>;
    /**
     * Load subscriptions from storage
     */
    private loadSubscriptions;
    /**
     * Save subscriptions to storage
     */
    private saveSubscriptions;
    /**
     * Generate unique subscription ID
     */
    private generateSubscriptionId;
    /**
     * Add event listener
     */
    on(event: SubscriptionEvent, callback: (payload: SubscriptionEventPayload) => void): void;
    /**
     * Remove event listener
     */
    off(event: SubscriptionEvent, callback: (payload: SubscriptionEventPayload) => void): void;
    /**
     * Emit event
     */
    private emitEvent;
}
export declare const subscriptionManager: SubscriptionManager;
//# sourceMappingURL=SubscriptionManager.d.ts.map
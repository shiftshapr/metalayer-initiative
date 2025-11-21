/**
 * Subscription System Type Definitions
 * Types for managing notification subscriptions
 */

/**
 * Notification category - distinguishes personal vs subscription-based
 */
export type NotificationCategory = 'personal' | 'subscription';

/**
 * Subscription target types
 */
export type SubscriptionTargetType =
  | 'room'           // Subscribe to room activity
  | 'thread'         // Subscribe to thread replies
  | 'user'           // Subscribe to user activity (friend visibility, aura changes)
  | 'community'      // Subscribe to community events
  | 'timeline'       // Subscribe to timeline updates
  | 'page'           // Subscribe to page changes (visibility)
  | 'topic'          // Subscribe to topic/tag
  | 'search'         // Subscribe to search query results
  | 'mention';       // Subscribe to mentions of a term

/**
 * Subscription data
 */
export interface Subscription {
  /** Unique subscription ID */
  id: string;
  
  /** User ID who owns this subscription */
  userId: string;
  
  /** Type of target being subscribed to */
  targetType: SubscriptionTargetType;
  
  /** ID of the target (roomId, userId, communityId, etc.) */
  targetId: string;
  
  /** Optional: Name/description of target */
  targetName?: string;
  
  /** Whether subscription is active */
  active: boolean;
  
  /** Notification preferences for this subscription */
  preferences: {
    /** Enable notifications for this subscription */
    enabled: boolean;
    
    /** Notification priority override */
    priority?: 'high' | 'medium' | 'low';
    
    /** Enable sound */
    sound: boolean;
    
    /** Enable desktop notifications */
    desktop: boolean;
    
    /** Mute temporarily (until timestamp) */
    mutedUntil?: number;
    
    /** Specific notification types to enable/disable */
    types?: {
      [key: string]: boolean;
    };
  };
  
  /** When subscription was created */
  createdAt: number;
  
  /** When subscription was last updated */
  updatedAt: number;
  
  /** Additional metadata */
  metadata?: {
    /** Auto-subscribed (e.g., when joining room) */
    autoSubscribed?: boolean;
    
    /** Subscription reason */
    reason?: string;
    
    /** Related subscriptions */
    relatedSubscriptions?: string[];
    
    [key: string]: any;
  };
}

/**
 * Subscription filter for querying
 */
export interface SubscriptionFilter {
  /** Filter by target type */
  targetType?: SubscriptionTargetType | SubscriptionTargetType[];
  
  /** Filter by active status */
  active?: boolean;
  
  /** Filter by enabled status */
  enabled?: boolean;
  
  /** Filter by target ID */
  targetId?: string;
  
  /** Search by target name */
  search?: string;
  
  /** Include muted subscriptions */
  includeMuted?: boolean;
  
  /** Limit results */
  limit?: number;
}

/**
 * Subscription event types
 */
export type SubscriptionEvent =
  | 'subscription:created'
  | 'subscription:updated'
  | 'subscription:deleted'
  | 'subscription:muted'
  | 'subscription:unmuted'
  | 'subscription:enabled'
  | 'subscription:disabled';

/**
 * Subscription event payload
 */
export interface SubscriptionEventPayload {
  event: SubscriptionEvent;
  subscription: Subscription;
  timestamp: number;
}

/**
 * Subscription statistics
 */
export interface SubscriptionStats {
  /** Total subscriptions */
  total: number;
  
  /** Active subscriptions */
  active: number;
  
  /** Muted subscriptions */
  muted: number;
  
  /** By target type */
  byType: {
    [key in SubscriptionTargetType]?: number;
  };
  
  /** Auto-subscribed count */
  autoSubscribed: number;
}

/**
 * Notification source - links notification to subscription or marks as personal
 */
export interface NotificationSource {
  /** Category: personal or subscription-based */
  category: NotificationCategory;
  
  /** If subscription-based, the subscription ID */
  subscriptionId?: string;
  
  /** If subscription-based, the target type */
  targetType?: SubscriptionTargetType;
  
  /** If subscription-based, the target ID */
  targetId?: string;
  
  /** If subscription-based, the target name */
  targetName?: string;
}

/**
 * Subscription creation options
 */
export interface CreateSubscriptionOptions {
  targetType: SubscriptionTargetType;
  targetId: string;
  targetName?: string;
  preferences?: Partial<Subscription['preferences']>;
  metadata?: Subscription['metadata'];
}

/**
 * Subscription update options
 */
export interface UpdateSubscriptionOptions {
  active?: boolean;
  preferences?: Partial<Subscription['preferences']>;
  metadata?: Subscription['metadata'];
}

/**
 * Bulk subscription operation result
 */
export interface BulkSubscriptionResult {
  /** Number of subscriptions affected */
  count: number;
  
  /** IDs of affected subscriptions */
  subscriptionIds: string[];
  
  /** Any errors that occurred */
  errors?: Array<{
    subscriptionId: string;
    error: string;
  }>;
}







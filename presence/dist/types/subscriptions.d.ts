/**
 * Subscription Type Definitions
 */
export interface SubscriptionPreferences {
    mutedUntil?: number;
    notifyOnMention?: boolean;
    notifyOnReply?: boolean;
    enabled?: boolean;
    [key: string]: unknown;
}
export interface SubscriptionMetadata {
    autoSubscribed?: boolean;
    source?: string;
    [key: string]: unknown;
}
export interface Subscription {
    id: string;
    targetId: string;
    targetType: SubscriptionTargetType;
    targetName?: string;
    active: boolean;
    preferences: SubscriptionPreferences;
    metadata?: SubscriptionMetadata;
    createdAt: number;
    updatedAt: number;
    [key: string]: unknown;
}
export type SubscriptionTargetType = 'room' | 'user' | 'community' | 'timeline' | 'message' | string;
export interface SubscriptionFilter {
    targetId?: string;
    targetType?: SubscriptionTargetType;
    active?: boolean;
    search?: string;
    includeMuted?: boolean;
    [key: string]: unknown;
}
export type SubscriptionEvent = 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
export interface SubscriptionEventPayload {
    subscription: Subscription;
    event: SubscriptionEvent;
    [key: string]: unknown;
}
export interface SubscriptionStats {
    total: number;
    active: number;
    muted: number;
    byType: Record<string, number>;
    autoSubscribed: number;
    [key: string]: unknown;
}
export interface CreateSubscriptionOptions {
    targetId: string;
    targetType: SubscriptionTargetType;
    targetName?: string;
    active?: boolean;
    preferences?: Partial<SubscriptionPreferences>;
    metadata?: SubscriptionMetadata;
    [key: string]: unknown;
}
export interface UpdateSubscriptionOptions {
    active?: boolean;
    preferences?: Partial<SubscriptionPreferences>;
    metadata?: Partial<SubscriptionMetadata>;
    [key: string]: unknown;
}
export interface BulkSubscriptionResult {
    created: number;
    updated: number;
    failed: number;
    errors: Array<{
        id: string;
        error: string;
    }>;
    [key: string]: unknown;
}
export type { PresenceData } from './index.js';
//# sourceMappingURL=subscriptions.d.ts.map
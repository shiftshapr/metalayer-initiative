/**
 * Visibility Manager
 * Handles visibility rules and permission checking
 */
import type { Activity, ActivityType, VisibilityType, TimelineData } from '../types';
export declare class VisibilityManager {
    private currentUserId;
    private userCommunities;
    constructor(currentUserId: string | null, userCommunities?: string[]);
    /**
     * Check if activity is visible to current user
     */
    isVisible(activity: Activity, targetUserId: string): boolean;
    /**
     * Filter timeline based on visibility
     */
    filterTimeline(timeline: TimelineData, targetUserId: string): TimelineData;
    /**
     * Check if users share communities
     */
    isInSameCommunity(targetUserId: string): boolean;
    /**
     * Update user communities
     */
    updateCommunities(communities: string[]): void;
    /**
     * Get visibility setting for activity type
     */
    getVisibilitySetting(activityType: ActivityType, targetUserId: string): VisibilityType;
}
//# sourceMappingURL=VisibilityManager.d.ts.map
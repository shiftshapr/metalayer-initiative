/**
 * Timeline Manager
 * Core state management for timelines
 */
import type { TimelineData, Activity, TimelineFilters, PersistenceType, DateRange, TimelineEvent, TimelineEventData } from '../types';
export declare class TimelineManager {
    private timelines;
    private currentProfileId;
    private multiProfileIds;
    private filters;
    private listeners;
    constructor();
    /**
     * Set timeline for a user
     */
    setTimeline(userId: string, timelineData: TimelineData): void;
    /**
     * Get timeline for a user
     */
    getTimeline(userId: string): TimelineData | null;
    /**
     * Add activity to timeline (for real-time updates)
     */
    addActivity(userId: string, activity: Activity): void;
    /**
     * Remove activity from timeline
     */
    removeActivity(userId: string, activityId: string): void;
    /**
     * Update activity in timeline
     */
    updateActivity(userId: string, activityId: string, updates: Partial<Activity>): void;
    /**
     * Apply filters to timeline
     */
    applyFilters(filters: Partial<TimelineFilters>): void;
    /**
     * Merge multiple timelines chronologically
     */
    mergeTimelines(userIds: string[]): TimelineData;
    /**
     * Calculate date range from persistence setting
     */
    calculateDateRange(persistence: PersistenceType): DateRange;
    /**
     * Get searchable text from activity
     */
    getSearchableText(activity: Activity): string;
    /**
     * Event emitter methods
     */
    on(event: TimelineEvent, callback: (data: TimelineEventData) => void): void;
    off(event: TimelineEvent, callback: (data: TimelineEventData) => void): void;
    private emit;
}
//# sourceMappingURL=TimelineManager.d.ts.map
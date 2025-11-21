/**
 * Timeline Manager
 * Core state management for timelines
 */

import type { 
  TimelineData, 
  Activity, 
  TimelineFilters, 
  PersistenceType, 
  DateRange,
  TimelineEvent,
  TimelineEventData
} from '../types';

export class TimelineManager {
  private timelines: Map<string, TimelineData>;
  private currentProfileId: string | null;
  private multiProfileIds: string[];
  private filters: TimelineFilters;
  private listeners: Map<TimelineEvent, Array<(data: TimelineEventData) => void>>;

  constructor() {
    this.timelines = new Map(); // userId -> TimelineData
    this.currentProfileId = null;
    this.multiProfileIds = [];
    this.filters = {
      persistence: 'all',
      community: null,
      activityTypes: [],
      search: ''
    };
    this.listeners = new Map(); // event -> [callbacks]
  }

  /**
   * Set timeline for a user
   */
  setTimeline(userId: string, timelineData: TimelineData): void {
    this.timelines.set(userId, timelineData);
    this.emit('timeline:loaded', { userId, timeline: timelineData });
  }

  /**
   * Get timeline for a user
   */
  getTimeline(userId: string): TimelineData | null {
    return this.timelines.get(userId) || null;
  }

  /**
   * Add activity to timeline (for real-time updates)
   */
  addActivity(userId: string, activity: Activity): void {
    const timeline = this.timelines.get(userId);
    if (!timeline) {
      return;
    }

    // Add activity at the beginning (newest first)
    timeline.activities.unshift(activity);
    
    // Sort chronologically
    timeline.activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Update pagination
    timeline.pagination.total += 1;

    this.emit('timeline:updated', { userId, activity });
  }

  /**
   * Remove activity from timeline
   */
  removeActivity(userId: string, activityId: string): void {
    const timeline = this.timelines.get(userId);
    if (!timeline) {
      return;
    }

    timeline.activities = timeline.activities.filter(
      a => a.id !== activityId
    );

    timeline.pagination.total -= 1;

    this.emit('timeline:updated', { userId, activityId });
  }

  /**
   * Update activity in timeline
   */
  updateActivity(userId: string, activityId: string, updates: Partial<Activity>): void {
    const timeline = this.timelines.get(userId);
    if (!timeline) {
      return;
    }

    const index = timeline.activities.findIndex(a => a.id === activityId);
    if (index !== -1) {
      timeline.activities[index] = {
        ...timeline.activities[index],
        ...updates
      };
      this.emit('timeline:updated', { userId, activityId });
    }
  }

  /**
   * Apply filters to timeline
   */
  applyFilters(filters: Partial<TimelineFilters>): void {
    this.filters = { ...this.filters, ...filters };
    this.emit('filters:changed', { filters: this.filters });
  }

  /**
   * Merge multiple timelines chronologically
   */
  mergeTimelines(userIds: string[]): TimelineData {
    const allActivities: Activity[] = [];

    userIds.forEach(userId => {
      const timeline = this.timelines.get(userId);
      if (timeline) {
        timeline.activities.forEach(activity => {
          allActivities.push({
            ...activity,
            sourceUserId: userId
          });
        });
      }
    });

    // Sort chronologically (newest first)
    allActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      activities: allActivities,
      pagination: {
        total: allActivities.length,
        page: 1,
        limit: allActivities.length,
        totalPages: 1
      }
    };
  }

  /**
   * Calculate date range from persistence setting
   */
  calculateDateRange(persistence: PersistenceType): DateRange {
    const now = new Date();
    let start: Date;

    switch (persistence) {
      case '1d':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        start = new Date(0);
        break;
    }

    return { start, end: now };
  }

  /**
   * Get searchable text from activity
   */
  getSearchableText(activity: Activity): string {
    switch (activity.type) {
      case 'message':
        return activity.data?.content || '';
      case 'profileUpdate':
        return `${activity.data?.fieldName || ''} ${activity.data?.oldValue || ''} ${activity.data?.newValue || ''}`;
      case 'communityJoin':
        return activity.data?.community?.name || '';
      default:
        return JSON.stringify(activity.data || {});
    }
  }

  /**
   * Event emitter methods
   */
  on(event: TimelineEvent, callback: (data: TimelineEventData) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: TimelineEvent, callback: (data: TimelineEventData) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: TimelineEvent, data: TimelineEventData): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}









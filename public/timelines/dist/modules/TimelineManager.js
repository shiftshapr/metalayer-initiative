/**
 * Timeline Manager
 * Core state management for timelines
 */
export class TimelineManager {
    constructor() {
        this.timelines = new Map(); // userId -> TimelineData
        this.currentProfileId = null;
        this.multiProfileIds = [];
        this.filters = {
            persistence: 'all',
            communities: [],
            activityTypes: [],
            search: ''
        };
        this.listeners = new Map(); // event -> [callbacks]
    }
    /**
     * Set timeline for a user
     */
    setTimeline(userId, timelineData) {
        this.timelines.set(userId, timelineData);
        this.emit('timeline:loaded', { userId, timeline: timelineData });
    }
    /**
     * Get timeline for a user
     */
    getTimeline(userId) {
        return this.timelines.get(userId) || null;
    }
    /**
     * Add activity to timeline (for real-time updates)
     */
    addActivity(userId, activity) {
        const timeline = this.timelines.get(userId);
        if (!timeline) {
            return;
        }
        // Add activity at the beginning (newest first)
        timeline.activities.unshift(activity);
        // Sort chronologically
        timeline.activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        // Update pagination
        timeline.pagination.total += 1;
        this.emit('timeline:updated', { userId, activity });
    }
    /**
     * Remove activity from timeline
     */
    removeActivity(userId, activityId) {
        const timeline = this.timelines.get(userId);
        if (!timeline) {
            return;
        }
        timeline.activities = timeline.activities.filter(a => a.id !== activityId);
        timeline.pagination.total -= 1;
        this.emit('timeline:updated', { userId, activityId });
    }
    /**
     * Update activity in timeline
     */
    updateActivity(userId, activityId, updates) {
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
    applyFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.emit('filters:changed', { filters: this.filters });
    }
    /**
     * Merge multiple timelines chronologically
     */
    mergeTimelines(userIds) {
        const allActivities = [];
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
        allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
    calculateDateRange(persistence) {
        const now = new Date();
        let start;
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
    getSearchableText(activity) {
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
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
}
//# sourceMappingURL=TimelineManager.js.map
/**
 * Visibility Manager
 * Handles visibility rules and permission checking
 */

import type { Activity, ActivityType, VisibilityType, TimelineData } from '../types';

export class VisibilityManager {
  private currentUserId: string | null;
  private userCommunities: string[];

  constructor(currentUserId: string | null, userCommunities: string[] = []) {
    this.currentUserId = currentUserId;
    this.userCommunities = userCommunities;
  }

  /**
   * Check if activity is visible to current user
   */
  isVisible(activity: Activity, targetUserId: string): boolean {
    const visibility = activity.visibility;

    switch (visibility) {
      case 'public':
        return true;
      
      case 'community':
        return this.isInSameCommunity(targetUserId);
      
      case 'private':
        return this.currentUserId === targetUserId;
      
      case 'group':
        // TODO: When group-level visibility ships, consult the group membership table (TBD) before allowing access.
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Filter timeline based on visibility
   */
  filterTimeline(timeline: TimelineData, targetUserId: string): TimelineData {
    if (!timeline || !timeline.activities) {
      return timeline;
    }

    const filtered = timeline.activities.filter(activity => {
      return this.isVisible(activity, targetUserId);
    });

    return {
      ...timeline,
      activities: filtered,
      pagination: {
        ...timeline.pagination,
        total: filtered.length
      }
    };
  }

  /**
   * Check if users share communities
   */
  isInSameCommunity(targetUserId: string): boolean {
    // TODO: Implement community membership check by comparing `this.userCommunities` (populated from `/api/communities/me`)
    //       with the target user's communities fetched from the backend when the timeline loads.
    return false;
  }

  /**
   * Update user communities
   */
  updateCommunities(communities: string[]): void {
    this.userCommunities = communities;
  }

  /**
   * Get visibility setting for activity type
   */
  getVisibilitySetting(activityType: ActivityType, targetUserId: string): VisibilityType {
    // TODO: Pull default visibility from user preferences (once stored) with fallbacks defined in product spec.
    const defaults: Record<ActivityType, VisibilityType> = {
      message: 'public', // Public Square messages are public
      reaction: 'public',
      bookmark: 'private',
      profileUpdate: 'public', // Some fields are public
      communityJoin: 'community',
      statusChange: 'community',
      auraChange: 'public',
      messageEdit: 'public',
      messageDelete: 'public',
      threadCreate: 'public',
      login: 'private',
      streak: 'public',
      // visibilityTime is not in ActivityType, skip it
    };

    return defaults[activityType] || 'private';
  }
}


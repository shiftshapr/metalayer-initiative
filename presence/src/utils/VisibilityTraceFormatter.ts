/**
 * VISIBILITY TRACE FORMATTER
 * Centralized utility for formatting visibility time traces
 * 
 * Handles:
 * - Active user time display ("Just arrived", "Online for X mins", etc.)
 * - Last seen time display ("Just left", "Last seen X hours ago", etc.)
 * - Trace limit enforcement (0 = hide, -1 = unlimited, positive = days)
 */

import { Logger } from './Logger.js';

export interface TraceLimitConfig {
  limit: number; // 0 = hide, -1 = unlimited, positive = days
}

export class VisibilityTraceFormatter {
  /**
   * Format time display for active user on same page
   * Formats: "Just arrived" (0-59s), "Online for X min(s)" (1-59m), "Online for X hour(s)" (1-23h), 
   *          "Online for X day(s)" (1-364d), "Online for X year(s)" (365+d)
   */
  static formatActiveTime(enterTime: string | null | undefined): string {
    if (!enterTime) {
      return 'Unknown';
    }

    try {
      const now = new Date();
      const enterDate = new Date(enterTime);
      const diffMs = now.getTime() - enterDate.getTime();

      // Handle negative time (future dates)
      if (diffMs < 0) {
        return 'Just arrived';
      }

      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffYears = Math.floor(diffDays / 365);

      // 0-59 seconds: "Just arrived"
      if (diffSeconds < 60) {
        return 'Just arrived';
      }
      // 1-59 minutes: "Online for X min(s)"
      else if (diffMinutes < 60) {
        return `Online for ${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`;
      }
      // 1-23 hours: "Online for X hour(s)"
      else if (diffHours < 24) {
        return `Online for ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
      }
      // 1-364 days: "Online for X day(s)"
      else if (diffDays < 365) {
        return `Online for ${diffDays} day${diffDays === 1 ? '' : 's'}`;
      }
      // 365+ days: "Online for X year(s)"
      else {
        return `Online for ${diffYears} year${diffYears === 1 ? '' : 's'}`;
      }
    } catch (error) {
      Logger.warn?.('⚠️ VisibilityTraceFormatter: Error formatting active time', error);
      return 'Unknown';
    }
  }

  /**
   * Format last seen display for user who left page
   * Formats: "Just left" (0-59s), "Last seen X min(s) ago" (1-59m), "Last seen X hour(s) ago" (1-23h),
   *          "Last seen X day(s) ago" (1-364d), "Last seen X year(s) ago" (365+d)
   * 
   * Respects trace limit: returns empty string if limit exceeded or limit is 0
   */
  static formatLastSeen(
    lastSeen: string | null | undefined,
    config: TraceLimitConfig
  ): string {
    // If limit is 0, hide all traces
    if (config.limit === 0) {
      return '';
    }

    if (!lastSeen) {
      // If unlimited, show "Last seen unknown", otherwise hide
      return config.limit === -1 ? 'Last seen unknown' : '';
    }

    try {
      const now = new Date();
      const lastSeenDate = new Date(lastSeen);
      const diffMs = now.getTime() - lastSeenDate.getTime();

      // Handle negative time (future dates)
      if (diffMs < 0) {
        return 'Just left';
      }

      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffYears = Math.floor(diffDays / 365);

      // Check trace limit (if not unlimited)
      if (config.limit !== -1 && config.limit > 0) {
        if (diffDays > config.limit) {
          // Outside trace limit - hide
          return '';
        }
      }

      // 0-59 seconds: "Just left"
      if (diffSeconds < 60) {
        return 'Just left';
      }
      // 1-59 minutes: "Last seen X min(s) ago"
      else if (diffMinutes < 60) {
        return `Last seen ${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
      }
      // 1-23 hours: "Last seen X hour(s) ago"
      else if (diffHours < 24) {
        return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      }
      // 1-364 days: "Last seen X day(s) ago"
      else if (diffDays < 365) {
        return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      }
      // 365+ days: "Last seen X year(s) ago"
      else {
        return `Last seen ${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
      }
    } catch (error) {
      Logger.warn?.('⚠️ VisibilityTraceFormatter: Error formatting last seen', error);
      // If unlimited, show error message, otherwise hide
      return config.limit === -1 ? 'Last seen unknown' : '';
    }
  }

  /**
   * Check if trace should be shown based on limit
   * Returns true if trace should be displayed, false if it should be hidden
   */
  static shouldShowTrace(
    lastSeen: string | null | undefined,
    config: TraceLimitConfig
  ): boolean {
    // If limit is 0, never show traces
    if (config.limit === 0) {
      return false;
    }

    // If unlimited, always show (if lastSeen exists)
    if (config.limit === -1) {
      return true;
    }

    // If no lastSeen, don't show
    if (!lastSeen) {
      return false;
    }

    try {
      const now = new Date();
      const lastSeenDate = new Date(lastSeen);
      const diffMs = now.getTime() - lastSeenDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Show only if within limit
      return diffDays <= config.limit;
    } catch (error) {
      Logger.warn?.('⚠️ VisibilityTraceFormatter: Error checking trace limit', error);
      return false;
    }
  }
}

export default VisibilityTraceFormatter;




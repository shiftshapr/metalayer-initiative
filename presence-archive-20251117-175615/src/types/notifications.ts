/**
 * Notification System Type Definitions
 * Types for notification management, priority, and content anchoring
 */

import { ContentAnchor } from './anchors';
import { NotificationSource } from './subscriptions';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'high' | 'medium' | 'low';

/**
 * Notification types
 */
export type NotificationType =
  | 'MESSAGE_NEW'
  | 'MENTION'
  | 'REPLY'
  | 'FRIEND_AURA_CHANGE'
  | 'COMMUNITY_JOIN'
  | 'ROOM_INVITE'
  | 'SYSTEM_ALERT';

/**
 * Notification highlight styles
 */
export type HighlightStyle = 'pulse' | 'glow' | 'flash' | 'border';

/**
 * Scroll behavior for navigation
 */
export type ScrollBehavior = 'smooth' | 'instant' | 'auto';

/**
 * Notification anchor for deep linking
 */
export interface NotificationAnchor {
  /** CSS selector for target element */
  target: string;
  
  /** Element ID for quick lookup */
  targetId?: string;
  
  /** Type of target (message, profile, room, etc.) */
  targetType?: string;
  
  /** Scroll behavior when navigating */
  scrollBehavior?: ScrollBehavior;
  
  /** Highlight style to apply */
  highlightStyle?: HighlightStyle;
  
  /** Duration to show highlight (ms), -1 for persistent */
  highlightDuration?: number;
  
  /** Auto-focus element after highlighting */
  autoFocus?: boolean;
  
  /** Additional metadata for context */
  metadata?: {
    roomId?: string;
    threadId?: string;
    authorId?: string;
    communityId?: string;
    [key: string]: any;
  };
}

/**
 * Notification data structure
 */
export interface NotificationData {
  /** Unique notification ID */
  id: string;
  
  /** Notification type */
  type: NotificationType;
  
  /** Notification title */
  title: string;
  
  /** Notification message */
  message: string;
  
  /** URL to navigate to */
  url?: string;
  
  /** Anchor for deep linking */
  anchor?: NotificationAnchor;
  
  /** Content anchor (if notification is about anchored content) */
  contentAnchor?: ContentAnchor;
  
  /** Priority level */
  priority?: NotificationPriority;
  
  /** Timestamp when notification was created */
  timestamp: number;
  
  /** Whether notification has been read */
  read: boolean;
  
  /** Whether notification was queued while offline */
  queued?: boolean;
  
  /** Source: personal or subscription-based */
  source?: NotificationSource;
  
  /** Additional data specific to notification type */
  data?: {
    authorName?: string;
    authorId?: string;
    content?: string;
    auraColor?: string;
    userName?: string;
    userId?: string;
    roomId?: string;
    communityId?: string;
    [key: string]: any;
  };
}

/**
 * Notification type configuration
 */
export interface NotificationTypeConfig {
  /** Unique identifier */
  id: NotificationType;
  
  /** Display name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Icon emoji */
  icon: string;
  
  /** Whether enabled by default */
  enabled: boolean;
  
  /** Whether sound is enabled */
  sound: boolean;
  
  /** Whether desktop notifications are enabled */
  desktop: boolean;
  
  /** Default priority */
  priority?: NotificationPriority;
  
  /** Category: personal or subscription */
  category: 'personal' | 'subscription';
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  /** Global enable/disable */
  enabled: boolean;
  
  /** Global sound enable/disable */
  sound: boolean;
  
  /** Global desktop notifications enable/disable */
  desktop: boolean;
  
  /** Per-type settings */
  types: {
    [key in NotificationType]?: {
      enabled: boolean;
      sound: boolean;
      desktop: boolean;
      priority?: NotificationPriority;
    };
  };
  
  /** Content anchor settings */
  anchor?: {
    /** Highlight duration (ms), -1 for persistent */
    highlightDuration: number;
    
    /** Highlight style */
    highlightStyle: HighlightStyle;
    
    /** Scroll behavior */
    scrollBehavior: ScrollBehavior;
    
    /** Auto-focus after highlighting */
    autoFocus: boolean;
  };
  
  /** Do Not Disturb mode */
  doNotDisturb?: boolean;
  
  /** Offline queue settings */
  offline?: {
    /** Enable offline queuing */
    enabled: boolean;
    
    /** Maximum queue size */
    maxQueueSize: number;
  };
}

/**
 * Notification history entry
 */
export interface NotificationHistoryEntry extends NotificationData {
  /** When notification was dismissed */
  dismissedAt?: number;
  
  /** When notification was clicked */
  clickedAt?: number;
  
  /** Whether notification was shown as desktop notification */
  shownAsDesktop?: boolean;
}

/**
 * Notification queue item (for offline queuing)
 */
export interface QueuedNotification extends NotificationData {
  /** When notification was queued */
  queuedAt: number;
  
  /** Number of retry attempts */
  retryCount?: number;
}

/**
 * Notification permission state
 */
export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * Notification click event data
 */
export interface NotificationClickEvent {
  /** Notification ID */
  notificationId: string;
  
  /** Button index (if action button was clicked) */
  buttonIndex?: number;
  
  /** Timestamp of click */
  timestamp: number;
}

/**
 * Notification badge data
 */
export interface NotificationBadge {
  /** Number of unread notifications */
  count: number;
  
  /** Number of high priority notifications */
  highPriorityCount: number;
  
  /** Whether to show badge */
  visible: boolean;
}

/**
 * Highlight animation state
 */
export interface HighlightState {
  /** Element being highlighted */
  element: HTMLElement;
  
  /** Highlight style applied */
  style: HighlightStyle;
  
  /** Start time */
  startTime: number;
  
  /** Duration (ms) */
  duration: number;
  
  /** Timeout ID for cleanup */
  timeoutId?: number;
  
  /** Animation frame ID */
  animationId?: number;
}

/**
 * Navigation state for anchor navigation
 */
export interface NavigationState {
  /** Current URL */
  currentUrl: string;
  
  /** Target URL */
  targetUrl?: string;
  
  /** Navigation in progress */
  navigating: boolean;
  
  /** Active anchor */
  activeAnchor?: NotificationAnchor;
  
  /** Active highlight */
  activeHighlight?: HighlightState;
}

/**
 * Notification manager events
 */
export type NotificationEvent =
  | 'notification:created'
  | 'notification:shown'
  | 'notification:clicked'
  | 'notification:dismissed'
  | 'notification:read'
  | 'notification:queued'
  | 'notification:dequeued'
  | 'settings:changed'
  | 'permission:changed'
  | 'badge:updated'
  | 'anchor:navigated'
  | 'anchor:highlighted';

/**
 * Notification event payload
 */
export interface NotificationEventPayload {
  event: NotificationEvent;
  notification?: NotificationData;
  settings?: NotificationSettings;
  permission?: NotificationPermission;
  badge?: NotificationBadge;
  anchor?: NotificationAnchor;
  error?: Error;
  timestamp: number;
}

/**
 * Notification builder for creating notifications
 */
export interface NotificationBuilder {
  setType(type: NotificationType): NotificationBuilder;
  setTitle(title: string): NotificationBuilder;
  setMessage(message: string): NotificationBuilder;
  setUrl(url: string): NotificationBuilder;
  setAnchor(anchor: NotificationAnchor): NotificationBuilder;
  setContentAnchor(anchor: ContentAnchor): NotificationBuilder;
  setPriority(priority: NotificationPriority): NotificationBuilder;
  setData(data: any): NotificationBuilder;
  build(): NotificationData;
}

/**
 * Notification filter for querying notifications
 */
export interface NotificationFilter {
  /** Filter by type */
  type?: NotificationType | NotificationType[];
  
  /** Filter by priority */
  priority?: NotificationPriority | NotificationPriority[];
  
  /** Filter by read status */
  read?: boolean;
  
  /** Filter by queued status */
  queued?: boolean;
  
  /** Filter by time range */
  timeRange?: {
    start: number;
    end: number;
  };
  
  /** Limit results */
  limit?: number;
  
  /** Sort order */
  sort?: 'asc' | 'desc';
  
  /** Sort by field */
  sortBy?: 'timestamp' | 'priority' | 'type';
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  /** Total notifications */
  total: number;
  
  /** Unread notifications */
  unread: number;
  
  /** By priority */
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  
  /** By type */
  byType: {
    [key in NotificationType]?: number;
  };
  
  /** Queued notifications */
  queued: number;
  
  /** Average response time (time to click) */
  avgResponseTime?: number;
}


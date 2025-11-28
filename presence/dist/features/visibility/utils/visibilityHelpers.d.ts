/**
 * VISIBILITY HELPERS - Shared Utility Functions
 *
 * Consolidates user normalization and helper functions.
 * Phase 1: Foundation - Utility Functions
 */
import type { VisibilityUser } from '../core/VisibilityTypes.js';
import type { User } from '../../../types/index.js';
/**
 * Normalize visibility users
 * Ensures all users have required fields and consistent formatting
 *
 * @param users - Array of users to normalize
 * @returns Normalized array of VisibilityUser objects
 */
export declare function normalizeVisibilityUsers(users: VisibilityUser[]): VisibilityUser[];
/**
 * Filter out current user from visibility list
 * UUID ONLY - uses UUID for filtering, email parameter is deprecated
 *
 * @param users - Array of users to filter
 * @param currentUserEmail - DEPRECATED: Ignored, kept for backward compatibility
 * @param currentUserId - Current user's UUID (required for filtering)
 * @returns Filtered array without current user
 */
export declare function filterCurrentUser(users: VisibilityUser[], _currentUserEmail: string | null, // DEPRECATED: Kept for backward compatibility, not used
currentUserId?: string | null): VisibilityUser[];
/**
 * Format last seen display text
 *
 * @param lastSeen - ISO date string or null
 * @returns Formatted "Last seen X ago" string
 */
export declare function formatLastSeenDisplay(lastSeen: string | null | undefined): string;
/**
 * Format time display for active users
 *
 * @param enterTime - ISO date string or null
 * @returns Formatted "Online for X" string
 */
export declare function formatTimeDisplay(enterTime: string | null | undefined): string;
/**
 * Check if user is active on the same page
 *
 * @param user - User to check
 * @param currentPageId - Current page ID
 * @returns True if user is active and on the same page
 */
export declare function isUserActiveOnPage(user: VisibilityUser, currentPageId: string | null): boolean;
/**
 * Get user status text based on activity and page
 *
 * @param user - User to get status for
 * @param currentPageId - Current page ID
 * @returns Status text string
 */
export declare function getUserStatusText(user: VisibilityUser, currentPageId: string | null): string;
/**
 * Create a VisibilityUser from a User object
 *
 * @param user - User object to convert
 * @param pageId - Optional page ID
 * @returns VisibilityUser object
 */
export declare function createVisibilityUser(user: User, pageId?: string): VisibilityUser;
//# sourceMappingURL=visibilityHelpers.d.ts.map
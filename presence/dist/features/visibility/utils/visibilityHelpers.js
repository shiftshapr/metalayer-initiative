/**
 * VISIBILITY HELPERS - Shared Utility Functions
 *
 * Consolidates user normalization and helper functions.
 * Phase 1: Foundation - Utility Functions
 */
import { AVATAR_FALLBACK_COLOR } from '../../../core/ConfigModule.js';
import { formatUserDisplayName, formatUserHandle, getAvatarUrlWithFallback, getAuraColorValue, getUserIdentity } from '../../../utils/Fallbacks.js';
/**
 * Normalize visibility users
 * Ensures all users have required fields and consistent formatting
 *
 * @param users - Array of users to normalize
 * @returns Normalized array of VisibilityUser objects
 */
export function normalizeVisibilityUsers(users) {
    return users.map(user => ({
        ...user,
        id: getUserIdentity(user),
        name: formatUserDisplayName(user),
        handle: user.handle || formatUserDisplayName(user),
        avatarUrl: getAvatarUrlWithFallback(user),
        auraColor: getAuraColorValue(user)
    }));
}
/**
 * Filter out current user from visibility list
 * UUID ONLY - uses UUID for filtering, email parameter is deprecated
 *
 * @param users - Array of users to filter
 * @param currentUserEmail - DEPRECATED: Ignored, kept for backward compatibility
 * @param currentUserId - Current user's UUID (required for filtering)
 * @returns Filtered array without current user
 */
export function filterCurrentUser(users, _currentUserEmail, // DEPRECATED: Kept for backward compatibility, not used
currentUserId) {
    if (!currentUserId) {
        return users; // No UUID provided, return all users
    }
    // UUID ONLY - filter by UUID only, email parameter is ignored
    return users.filter(user => {
        return !(user.id && String(user.id) === String(currentUserId));
    });
}
/**
 * Format last seen display text
 *
 * @param lastSeen - ISO date string or null
 * @returns Formatted "Last seen X ago" string
 */
export function formatLastSeenDisplay(lastSeen) {
    if (!lastSeen) {
        return 'Last seen unknown';
    }
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMs < 0) {
        return 'Last seen just now';
    }
    if (diffSeconds < 60) {
        return `Last seen ${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
    }
    else if (diffMinutes < 60) {
        return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }
    else if (diffHours < 24) {
        return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    else {
        return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
}
/**
 * Format time display for active users
 *
 * @param enterTime - ISO date string or null
 * @returns Formatted "Online for X" string
 */
export function formatTimeDisplay(enterTime) {
    if (!enterTime) {
        return 'Unknown';
    }
    const now = new Date();
    const enterDate = new Date(enterTime);
    const diffMs = now.getTime() - enterDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMs < 0) {
        return 'Now';
    }
    if (diffSeconds < 60) {
        return 'Now';
    }
    else if (diffMinutes < 60) {
        return `Online for ${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`;
    }
    else {
        const hours = Math.floor(diffMinutes / 60);
        return `Online for ${hours} hour${hours === 1 ? '' : 's'}`;
    }
}
/**
 * Check if user is active on the same page
 *
 * @param user - User to check
 * @param currentPageId - Current page ID
 * @returns True if user is active and on the same page
 */
export function isUserActiveOnPage(user, currentPageId) {
    const userPageId = user.pageId || user.page_id; // Support both during migration
    if (!user.isActive || !currentPageId || !userPageId) {
        return false;
    }
    return userPageId === currentPageId;
}
/**
 * Get user status text based on activity and page
 *
 * @param user - User to get status for
 * @param currentPageId - Current page ID
 * @returns Status text string
 */
export function getUserStatusText(user, currentPageId) {
    // Check if user is active on the same page
    const isActiveOnPage = isUserActiveOnPage(user, currentPageId);
    if (isActiveOnPage) {
        // User is active and on the same page - show "Online"
        return 'Online';
    }
    else {
        const userPageId = user.pageId || user.page_id; // Support both during migration
        if (user.isActive && userPageId && userPageId !== currentPageId) {
            // User is active but on a different page - show "last seen" for that page
            return formatLastSeenDisplay(user.lastSeen || null);
        }
        else if (user.lastSeen) {
            // User is not active - show "last seen"
            return formatLastSeenDisplay(user.lastSeen);
        }
        else {
            // No information available
            return 'Last seen unknown';
        }
    }
}
/**
 * Create a VisibilityUser from a User object
 *
 * @param user - User object to convert
 * @param pageId - Optional page ID
 * @returns VisibilityUser object
 */
export function createVisibilityUser(user, pageId) {
    return {
        id: getUserIdentity(user),
        email: user.email,
        name: formatUserDisplayName(user),
        handle: formatUserHandle(user),
        avatarUrl: getAvatarUrlWithFallback(user),
        auraColor: getAuraColorValue(user, AVATAR_FALLBACK_COLOR),
        communityId: (typeof window !== 'undefined' &&
            window.activeCommunities?.[0]) || undefined,
        pageId: pageId, // camelCase - standardized per .cursorrules
        ...user
    };
}

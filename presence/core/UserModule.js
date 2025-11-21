/**
 * USER MODULE - User State Management
 * TypeScript + ES6 Module for current user state
 */
// Import stateManagerInstance (TypeScript migration - no longer using window.currentUser)
import { stateManagerInstance } from './StateManager.js';

// Current user state (private) - DEPRECATED: Use stateManager instead
let currentUser = null;
/**
 * Normalize user data from Supabase/auth sources to our standardized format
 * Transforms snake_case fields (user_metadata.avatar_url) to camelCase (avatarUrl)
 */
function normalizeUser(user) {
    if (!user)
        return null;
    // Extract and normalize from Supabase user_metadata if present
    const userMetadata = user.user_metadata;
    // Boundary transform: Supabase user_metadata (snake_case) → internal camelCase fields
    const normalizedAvatarUrl = user.avatarUrl || userMetadata?.avatar_url || user.picture;
    const normalizedName = user.name || userMetadata?.full_name;
    return {
        id: user.id,
        name: normalizedName || user.name,
        email: user.email,
        avatarUrl: normalizedAvatarUrl,
        handle: user.handle,
        communityId: user.communityId,
        lastSeen: user.lastSeen,
        status: user.status,
        auraColor: user.auraColor,
        auraIntensity: user.auraIntensity,
        isActive: user.isActive,
        userMetadata: userMetadata // Keep raw metadata for compatibility, but don't use it directly
    };
}
/**
 * Get the current authenticated user
 * ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
 */
export function getCurrentUser() {
    return stateManagerInstance?.getState?.('currentUser') || currentUser;
}
/**
 * Set the current authenticated user
 * Automatically normalizes Supabase user_metadata fields to standardized format
 */
export function setCurrentUser(user) {
    // Normalize user data if it contains Supabase fields
    const normalized = user ? normalizeUser(user) : null;
    currentUser = normalized; // Keep for backward compat with Object.defineProperty
    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
    if (stateManagerInstance?.setState) {
        stateManagerInstance.setState('currentUser', normalized);
    }
}
/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return currentUser !== null && currentUser.id !== undefined;
}
// ROOT CAUSE FIX: Expose getter/setter on window that uses stateManager (TypeScript migration)
if (typeof window !== 'undefined') {
    // Initialize from stateManager if available
    const stateUser = stateManagerInstance?.getState?.('currentUser');
    if (stateUser) {
        currentUser = stateUser;
    }
    // Expose getter/setter on window that uses stateManager
    Object.defineProperty(window, 'currentUser', {
        get: () => stateManagerInstance?.getState?.('currentUser') || currentUser,
        set: (user) => setCurrentUser(user),
        configurable: true
    });
}

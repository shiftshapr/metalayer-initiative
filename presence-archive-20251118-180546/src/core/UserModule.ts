/**
 * USER MODULE - User State Management
 * TypeScript + ES6 Module for current user state
 */

import { User } from '../types/index.js';

// Current user state (private)
let currentUser: User | null = null;

/**
 * Normalize user data from Supabase/auth sources to our standardized format
 * Transforms snake_case fields (user_metadata.avatar_url) to camelCase (avatarUrl)
 */
function normalizeUser(user: any): User | null {
  if (!user) return null;
  
  // Extract and normalize from Supabase user_metadata if present
  const userMetadata = (user as any).user_metadata;
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
 */
export function getCurrentUser(): User | null {
  return currentUser;
}

/**
 * Set the current authenticated user
 * Automatically normalizes Supabase user_metadata fields to standardized format
 */
export function setCurrentUser(user: User | any | null): void {
  // Normalize user data if it contains Supabase fields
  const normalized = user ? normalizeUser(user) : null;
  currentUser = normalized;
  
  // Also set on window for backward compatibility during migration
  if (typeof window !== 'undefined') {
    window.currentUser = normalized;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return currentUser !== null && currentUser.id !== undefined;
}

// Export to window for backward compatibility during migration
if (typeof window !== 'undefined') {
  // Initialize from window if already set
  if (window.currentUser) {
    currentUser = window.currentUser;
  }
  
  // Expose getter/setter on window
  Object.defineProperty(window, 'currentUser', {
    get: () => currentUser,
    set: (user: User | null) => setCurrentUser(user),
    configurable: true
  });
}


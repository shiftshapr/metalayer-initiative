/**
 * UserModule - User management utilities
 */

import type { User } from '../types/index.js';
import { stateManagerInstance } from './StateManager.js';

function normalizeUser(user: User | null | undefined): User | null {
  if (!user) return null;
  
  // Extract and normalize from Supabase user_metadata if present
  const userMetadata = (user as { user_metadata?: { avatar_url?: string; full_name?: string; [key: string]: unknown } }).user_metadata;
  
  // Boundary transform: Supabase user_metadata (snake_case) → internal camelCase fields
  const normalizedAvatarUrl = user.avatarUrl || userMetadata?.avatar_url || (user as { picture?: string }).picture;
  const normalizedName = user.name || userMetadata?.full_name;
  
  return {
    id: user.id || user.userId || (user as { user_id?: string }).user_id,
    name: normalizedName || user.name,
    email: user.email,
    avatarUrl: normalizedAvatarUrl,
    handle: user.handle,
    communityId: (user as { communityId?: string }).communityId,
    lastSeen: (user as { lastSeen?: string }).lastSeen,
    status: (user as { status?: string }).status,
    auraColor: user.auraColor || (user as { aura_color?: string }).aura_color,
    auraIntensity: (user as { auraIntensity?: number }).auraIntensity,
    isActive: (user as { isActive?: boolean }).isActive,
    headline: user.headline,
    displayName: user.displayName || (user as { display_name?: string }).display_name || user.name,
    userId: user.userId || (user as { user_id?: string }).user_id || user.id,
    communities: user.communities,
    // Keep raw metadata for compatibility, but don't use it directly
    user_metadata: userMetadata
  } as User;
}

export function getCurrentUser(): User | null {
  // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
  const currentUser = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUser) {
    return normalizeUser(currentUser);
  }
  return null;
}

export function setCurrentUser(user: User | null): void {
  // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
  const normalized = normalizeUser(user);
  stateManagerInstance.setState('currentUser', normalized);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

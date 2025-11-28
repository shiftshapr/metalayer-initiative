/**
 * Fallback utility functions
 * Helper functions for safe property access with defaults
 */

import type { User } from '../types/index.js';

/**
 * Returns a stable identifier for a user, falling back to email and finally a provided default.
 */
export function getUserIdentity(source: User | null | undefined, fallback = 'unknown-user'): string {
  if (source?.id) return source.id;
  if (source?.email) return source.email;
  return fallback;
}

/**
 * Formats a display name using available properties. Falls back to email prefix or explicit default.
 */
export function formatUserDisplayName(source: User | null | undefined, fallback = 'Unknown'): string {
  if (source?.name) return source.name;
  if (source?.handle) return source.handle;
  const email = source?.email;
  if (typeof email === 'string' && email.includes('@')) {
    const prefix = email.split('@')[0];
    if (prefix) return prefix;
  }
  return fallback;
}

/**
 * Formats a user handle by stripping spaces and lowercasing.
 */
export function formatUserHandle(source: User | null | undefined, fallback = 'unknown'): string {
  const base = formatUserDisplayName(source, fallback);
  return base ? base.replace(/\s+/g, '').toLowerCase() : fallback;
}

/**
 * Ensures message content is a string. Returns fallback when undefined/null.
 */
export function ensureMessageContent(source: { content?: string } | null | undefined, fallback = ''): string {
  const content = source?.content;
  return typeof content === 'string' ? content : fallback;
}

/**
 * Returns the user's aura color with a fallback.
 */
export function getAuraColorValue(source: User | null | undefined, fallback = '#aaaaaa'): string {
  return (source?.auraColor && source.auraColor.trim() !== '') ? source.auraColor : fallback;
}

/**
 * Returns the user's avatar URL with a fallback.
 */
export function getAvatarUrlWithFallback(source: User | null | undefined, fallback = '/icons/default-user.svg'): string {
  return source?.avatarUrl || fallback;
}

/**
 * Formats an author name from a user object or message author.
 * Alias for formatUserDisplayName for consistency.
 */
export function formatAuthorName(source: User | { name?: string; handle?: string; email?: string } | null | undefined, fallback = 'Unknown'): string {
  return formatUserDisplayName(source as User | null | undefined, fallback);
}

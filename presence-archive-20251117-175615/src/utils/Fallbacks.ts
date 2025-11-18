import { Message, User } from '../types/index.js';

type IdentitySource = {
  id?: string | null;
  email?: string | null;
};

type DisplayNameSource = {
  name?: string | null;
  email?: string | null;
  handle?: string | null;
};

type AuraSource = {
  auraColor?: string | null;
};

type AvatarSource = {
  avatarUrl?: string | null;
};

/**
 * Returns a stable identifier for a user, falling back to email and finally a provided default.
 */
export function getUserIdentity(source?: IdentitySource | null, fallback = 'unknown-user'): string {
  if (source?.id) return source.id;
  if (source?.email) return source.email;
  return fallback;
}

/**
 * Formats a display name using available properties. Falls back to email prefix or explicit default.
 */
export function formatUserDisplayName(source?: DisplayNameSource | null, fallback = 'Unknown'): string {
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
export function formatUserHandle(source?: DisplayNameSource | null, fallback = 'unknown'): string {
  const base = formatUserDisplayName(source, fallback);
  return base ? base.replace(/\s+/g, '').toLowerCase() : fallback;
}

/**
 * Ensures message content is a string. Returns fallback when undefined/null.
 */
export function ensureMessageContent(source?: Pick<Message, 'content'> | { content?: string | null } | null, fallback = ''): string {
  const content = source?.content;
  return typeof content === 'string' ? content : fallback;
}

/**
 * Returns the user's aura color with a fallback.
 */
export function getAuraColorValue(source?: AuraSource | null, fallback = '#aaaaaa'): string {
  return (source?.auraColor && source.auraColor.trim() !== '') ? source.auraColor : fallback;
}

/**
 * Returns the user's avatar URL with a fallback.
 */
export function getAvatarUrlWithFallback(source?: AvatarSource | null, fallback = '/icons/default-user.svg'): string {
  return (source?.avatarUrl && source.avatarUrl.trim() !== '') ? source.avatarUrl : fallback;
}

/**
 * Convenience helper to format an author's name for messaging/logging contexts.
 */
export function formatAuthorName(author?: User | null, fallback = 'Unknown'): string {
  return formatUserDisplayName(author, fallback);
}



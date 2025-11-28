/**
 * Fallback utility functions
 * Helper functions for safe property access with defaults
 */
import type { User } from '../types/index.js';
/**
 * Returns a stable identifier for a user, falling back to email and finally a provided default.
 */
export declare function getUserIdentity(source: User | null | undefined, fallback?: string): string;
/**
 * Formats a display name using available properties. Falls back to email prefix or explicit default.
 */
export declare function formatUserDisplayName(source: User | null | undefined, fallback?: string): string;
/**
 * Formats a user handle by stripping spaces and lowercasing.
 */
export declare function formatUserHandle(source: User | null | undefined, fallback?: string): string;
/**
 * Ensures message content is a string. Returns fallback when undefined/null.
 */
export declare function ensureMessageContent(source: {
    content?: string;
} | null | undefined, fallback?: string): string;
/**
 * Returns the user's aura color with a fallback.
 */
export declare function getAuraColorValue(source: User | null | undefined, fallback?: string): string;
/**
 * Returns the user's avatar URL with a fallback.
 */
export declare function getAvatarUrlWithFallback(source: User | null | undefined, fallback?: string): string;
/**
 * Formats an author name from a user object or message author.
 * Alias for formatUserDisplayName for consistency.
 */
export declare function formatAuthorName(source: User | {
    name?: string;
    handle?: string;
    email?: string;
} | null | undefined, fallback?: string): string;
//# sourceMappingURL=Fallbacks.d.ts.map
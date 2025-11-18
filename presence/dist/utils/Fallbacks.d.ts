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
export declare function getUserIdentity(source?: IdentitySource | null, fallback?: string): string;
/**
 * Formats a display name using available properties. Falls back to email prefix or explicit default.
 */
export declare function formatUserDisplayName(source?: DisplayNameSource | null, fallback?: string): string;
/**
 * Formats a user handle by stripping spaces and lowercasing.
 */
export declare function formatUserHandle(source?: DisplayNameSource | null, fallback?: string): string;
/**
 * Ensures message content is a string. Returns fallback when undefined/null.
 */
export declare function ensureMessageContent(source?: Pick<Message, 'content'> | {
    content?: string | null;
} | null, fallback?: string): string;
/**
 * Returns the user's aura color with a fallback.
 */
export declare function getAuraColorValue(source?: AuraSource | null, fallback?: string): string;
/**
 * Returns the user's avatar URL with a fallback.
 */
export declare function getAvatarUrlWithFallback(source?: AvatarSource | null, fallback?: string): string;
/**
 * Convenience helper to format an author's name for messaging/logging contexts.
 */
export declare function formatAuthorName(author?: User | null, fallback?: string): string;
export {};
//# sourceMappingURL=Fallbacks.d.ts.map
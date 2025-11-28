/**
 * Fallback utility functions
 * Helper functions for safe property access with defaults
 */
/**
 * Returns a stable identifier for a user, falling back to email and finally a provided default.
 */
export function getUserIdentity(source, fallback = 'unknown-user') {
    if (source?.id)
        return source.id;
    if (source?.email)
        return source.email;
    return fallback;
}
/**
 * Formats a display name using available properties. Falls back to email prefix or explicit default.
 */
export function formatUserDisplayName(source, fallback = 'Unknown') {
    if (source?.name)
        return source.name;
    if (source?.handle)
        return source.handle;
    const email = source?.email;
    if (typeof email === 'string' && email.includes('@')) {
        const prefix = email.split('@')[0];
        if (prefix)
            return prefix;
    }
    return fallback;
}
/**
 * Formats a user handle by stripping spaces and lowercasing.
 */
export function formatUserHandle(source, fallback = 'unknown') {
    const base = formatUserDisplayName(source, fallback);
    return base ? base.replace(/\s+/g, '').toLowerCase() : fallback;
}
/**
 * Ensures message content is a string. Returns fallback when undefined/null.
 */
export function ensureMessageContent(source, fallback = '') {
    const content = source?.content;
    return typeof content === 'string' ? content : fallback;
}
/**
 * Returns the user's aura color with a fallback.
 */
export function getAuraColorValue(source, fallback = '#aaaaaa') {
    return (source?.auraColor && source.auraColor.trim() !== '') ? source.auraColor : fallback;
}
/**
 * Returns the user's avatar URL with a fallback.
 */
export function getAvatarUrlWithFallback(source, fallback = '/icons/default-user.svg') {
    return source?.avatarUrl || fallback;
}
/**
 * Formats an author name from a user object or message author.
 * Alias for formatUserDisplayName for consistency.
 */
export function formatAuthorName(source, fallback = 'Unknown') {
    return formatUserDisplayName(source, fallback);
}
//# sourceMappingURL=Fallbacks.js.map
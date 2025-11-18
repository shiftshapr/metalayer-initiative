/**
 * UserNameExtractor - Loosely coupled utility for extracting user names
 * Handles various sources: Google profile, user metadata, email fallback
 */
/**
 * Extract user name from various sources with fallback chain
 * @param user - User object from any source
 * @returns Best available user name
 */
export function extractUserName(user) {
    if (!user)
        return 'User';
    // Priority 1: Google profile full name from userMetadata
    if (user.userMetadata?.fullName) {
        return user.userMetadata.fullName;
    }
    // Priority 2: Direct name field
    if (user.name) {
        return user.name;
    }
    // Priority 3: Google profile name from metadata
    if (user.userMetadata?.name) {
        return user.userMetadata.name;
    }
    // Priority 4: Email prefix fallback
    if (user.email) {
        return user.email.split('@')[0];
    }
    // Priority 5: User email from different field
    if (user.userEmail) {
        return user.userEmail.split('@')[0];
    }
    // Final fallback
    return 'User';
}
/**
 * Extract user name with Google Chrome profile priority
 * @param user - User object
 * @returns User name with Google profile priority
 */
export function extractGoogleUserName(user) {
    if (!user)
        return 'User';
    // Google Chrome profile has highest priority
    if (user.provider === 'chrome_profile' && user.userMetadata?.fullName) {
        return user.userMetadata.fullName;
    }
    // Fall back to standard extraction
    return extractUserName(user);
}
/**
 * Extract user name for database storage
 * @param user - User object
 * @returns User name suitable for database
 */
export function extractForDatabase(user) {
    const name = extractGoogleUserName(user);
    // Sanitize for database storage
    return name.trim().substring(0, 100); // Limit length
}
/**
 * Extract user name for display
 * @param user - User object
 * @returns User name suitable for display
 */
export function extractForDisplay(user) {
    return extractGoogleUserName(user);
}
/**
 * UserNameExtractor class for backward compatibility
 */
export class UserNameExtractor {
    static extractUserName(user) {
        return extractUserName(user);
    }
    static extractGoogleUserName(user) {
        return extractGoogleUserName(user);
    }
    static extractForDatabase(user) {
        return extractForDatabase(user);
    }
    static extractForDisplay(user) {
        return extractForDisplay(user);
    }
}
// Attach to window if available (for browser environment)
if (typeof window !== 'undefined') {
    window.UserNameExtractor = UserNameExtractor;
}

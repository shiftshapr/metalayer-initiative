/**
 * UserNameExtractor - Loosely coupled utility for extracting user names
 * Handles various sources: Google profile, user metadata, email fallback
 */

interface UserMetadata {
  fullName?: string;
  name?: string;
}

interface User {
  userMetadata?: UserMetadata;
  name?: string;
  email?: string;
  userEmail?: string;
  provider?: string;
}

/**
 * Extract user name from various sources with fallback chain
 * @param user - User object from any source
 * @returns Best available user name
 */
export function extractUserName(user: User | null | undefined): string {
  if (!user) return 'User';
  
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
export function extractGoogleUserName(user: User | null | undefined): string {
  if (!user) return 'User';
  
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
export function extractForDatabase(user: User | null | undefined): string {
  const name = extractGoogleUserName(user);
  
  // Sanitize for database storage
  return name.trim().substring(0, 100); // Limit length
}

/**
 * Extract user name for display
 * @param user - User object
 * @returns User name suitable for display
 */
export function extractForDisplay(user: User | null | undefined): string {
  return extractGoogleUserName(user);
}

/**
 * UserNameExtractor class for backward compatibility
 */
export class UserNameExtractor {
  static extractUserName(user: User | null | undefined): string {
    return extractUserName(user);
  }
  
  static extractGoogleUserName(user: User | null | undefined): string {
    return extractGoogleUserName(user);
  }
  
  static extractForDatabase(user: User | null | undefined): string {
    return extractForDatabase(user);
  }
  
  static extractForDisplay(user: User | null | undefined): string {
    return extractForDisplay(user);
  }
}

// Attach to window if available (for browser environment)
if (typeof window !== 'undefined') {
  (window as unknown as { UserNameExtractor: typeof UserNameExtractor }).UserNameExtractor = UserNameExtractor;
}

// Export types
export type { User, UserMetadata };




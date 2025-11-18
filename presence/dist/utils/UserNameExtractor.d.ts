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
export declare function extractUserName(user: User | null | undefined): string;
/**
 * Extract user name with Google Chrome profile priority
 * @param user - User object
 * @returns User name with Google profile priority
 */
export declare function extractGoogleUserName(user: User | null | undefined): string;
/**
 * Extract user name for database storage
 * @param user - User object
 * @returns User name suitable for database
 */
export declare function extractForDatabase(user: User | null | undefined): string;
/**
 * Extract user name for display
 * @param user - User object
 * @returns User name suitable for display
 */
export declare function extractForDisplay(user: User | null | undefined): string;
/**
 * UserNameExtractor class for backward compatibility
 */
export declare class UserNameExtractor {
    static extractUserName(user: User | null | undefined): string;
    static extractGoogleUserName(user: User | null | undefined): string;
    static extractForDatabase(user: User | null | undefined): string;
    static extractForDisplay(user: User | null | undefined): string;
}
export type { User, UserMetadata };
//# sourceMappingURL=UserNameExtractor.d.ts.map
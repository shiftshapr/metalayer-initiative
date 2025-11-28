/**
 * User Utilities - ES6 TypeScript Module
 * Utilities for getting current user information
 */
/**
 * Gets the current user ID from stateManager
 * Falls back to email if no ID is available
 * @returns Promise resolving to user ID or email, or null
 */
export declare function getCurrentUserId(): Promise<string | null>;
/**
 * Gets the current user email from stateManager or auth
 * CRITICAL FIX: Guarded against multiple simultaneous calls
 * @returns Promise resolving to user email or null
 */
export declare function getCurrentUserEmail(): Promise<string | null>;
/**
 * Gets the avatar color for the current user (custom or default)
 * @returns Promise resolving to color string
 */
export declare function getCurrentUserAvatarColor(): Promise<string>;
/**
 * Gets the user's aura color from stateManager
 * @returns User's aura color or fallback color
 */
export declare function getCurrentUserAvatarBgColor(): string;
//# sourceMappingURL=UserUtils.d.ts.map
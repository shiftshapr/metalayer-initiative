/**
 * API Boundary Helpers
 *
 * Utilities for converting between API/database snake_case and TypeScript camelCase
 *
 * Usage: Use these helpers at API boundaries to ensure consistent camelCase in TypeScript code
 *
 * Example:
 * ```typescript
 * const user = convertSnakeToCamel(apiResponse, {
 *   user_id: 'userId',
 *   display_name: 'displayName',
 *   aura_color: 'auraColor'
 * });
 * ```
 */
/**
 * Convert a single snake_case key to camelCase
 */
export declare function snakeToCamel(str: string): string;
/**
 * Convert an object's keys from snake_case to camelCase
 *
 * @param obj - Object with snake_case keys
 * @param fieldMap - Optional mapping of specific fields (snake_case -> camelCase)
 * @returns New object with camelCase keys
 */
export declare function convertSnakeToCamel<T extends Record<string, unknown>>(obj: T, fieldMap?: Record<string, string>): Record<string, unknown>;
/**
 * Convert PresenceData from API format (snake_case) to TypeScript format (camelCase)
 */
export declare function convertPresenceData(apiData: {
    user_id?: string;
    last_seen?: string;
    page_id?: string;
    status?: string;
    [key: string]: unknown;
}): {
    userId: string;
    lastSeen: string;
    pageId?: string;
    status?: string;
    [key: string]: unknown;
};
/**
 * Convert User data from API format (snake_case) to TypeScript format (camelCase)
 */
export declare function convertUserData(apiData: {
    user_id?: string;
    display_name?: string;
    aura_color?: string;
    avatar_url?: string;
    [key: string]: unknown;
}): {
    userId?: string;
    displayName?: string;
    auraColor?: string;
    avatarUrl?: string;
    [key: string]: unknown;
};
//# sourceMappingURL=ApiBoundaryHelpers.d.ts.map
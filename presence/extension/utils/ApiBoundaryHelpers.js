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
export function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * Convert an object's keys from snake_case to camelCase
 *
 * @param obj - Object with snake_case keys
 * @param fieldMap - Optional mapping of specific fields (snake_case -> camelCase)
 * @returns New object with camelCase keys
 */
export function convertSnakeToCamel(obj, fieldMap) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        // Use field map if provided, otherwise convert automatically
        const camelKey = fieldMap?.[key] || snakeToCamel(key);
        // Recursively convert nested objects
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            result[camelKey] = convertSnakeToCamel(value, fieldMap);
        }
        else if (Array.isArray(value)) {
            // Convert array items if they're objects
            result[camelKey] = value.map(item => item && typeof item === 'object' && !(item instanceof Date)
                ? convertSnakeToCamel(item, fieldMap)
                : item);
        }
        else {
            result[camelKey] = value;
        }
    }
    return result;
}
/**
 * Convert PresenceData from API format (snake_case) to TypeScript format (camelCase)
 */
export function convertPresenceData(apiData) {
    return {
        userId: apiData.user_id || '',
        lastSeen: apiData.last_seen || '',
        pageId: apiData.page_id,
        status: apiData.status,
        ...convertSnakeToCamel(Object.fromEntries(Object.entries(apiData).filter(([key]) => !['user_id', 'last_seen', 'page_id', 'status'].includes(key))))
    };
}
/**
 * Convert User data from API format (snake_case) to TypeScript format (camelCase)
 */
export function convertUserData(apiData) {
    return {
        userId: apiData.user_id,
        displayName: apiData.display_name,
        auraColor: apiData.aura_color,
        avatarUrl: apiData.avatar_url,
        ...convertSnakeToCamel(Object.fromEntries(Object.entries(apiData).filter(([key]) => !['user_id', 'display_name', 'aura_color', 'avatar_url'].includes(key))))
    };
}

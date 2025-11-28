/**
 * Shared Type Utilities for Window Interface Extensions
 *
 * Provides reusable type patterns for extending the Window interface
 * with application-specific properties and managers.
 */
/**
 * Type guard for checking if a value is an array
 */
export function isArray(value) {
    return Array.isArray(value);
}
/**
 * Type guard for checking if a value is a record/object
 */
export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Normalize chat data from array or record format to array
 */
export function normalizeChatData(data) {
    if (!data)
        return [];
    if (Array.isArray(data))
        return data;
    return Object.values(data).flat();
}
//# sourceMappingURL=window-utils.js.map
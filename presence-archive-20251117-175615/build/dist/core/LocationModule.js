/**
 * LOCATION MODULE - Browser Location API Abstraction
 * TypeScript + ES6 Module for location utilities
 */
/**
 * Get current URL
 */
export function getCurrentUrl() {
    if (typeof window === 'undefined' || !window.location) {
        return '';
    }
    return window.location.href;
}
/**
 * Get current origin
 */
export function getCurrentOrigin() {
    if (typeof window === 'undefined' || !window.location) {
        return '';
    }
    return window.location.origin;
}
/**
 * Get current pathname
 */
export function getCurrentPathname() {
    if (typeof window === 'undefined' || !window.location) {
        return '';
    }
    return window.location.pathname;
}
/**
 * Get full URL (origin + pathname)
 */
export function getFullUrl() {
    return getCurrentOrigin() + getCurrentPathname();
}
//# sourceMappingURL=LocationModule.js.map
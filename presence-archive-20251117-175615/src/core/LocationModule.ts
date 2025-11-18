/**
 * LOCATION MODULE - Browser Location API Abstraction
 * TypeScript + ES6 Module for location utilities
 */

/**
 * Get current URL
 */
export function getCurrentUrl(): string {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }
  return window.location.href;
}

/**
 * Get current origin
 */
export function getCurrentOrigin(): string {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }
  return window.location.origin;
}

/**
 * Get current pathname
 */
export function getCurrentPathname(): string {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }
  return window.location.pathname;
}

/**
 * Get full URL (origin + pathname)
 */
export function getFullUrl(): string {
  return getCurrentOrigin() + getCurrentPathname();
}


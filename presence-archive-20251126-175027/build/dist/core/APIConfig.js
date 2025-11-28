/**
 * API Configuration Module
 *
 * Centralized API configuration for the Canopi application.
 * Replaces hardcoded IP addresses and URLs with environment-aware configuration.
 *
 * Usage:
 *   import { API_CONFIG } from '../core/APIConfig.js';
 *   const url = `${API_CONFIG.baseUrl}/v1/endpoint`;
 */
import { Logger } from '../utils/Logger.js';
/**
 * Get API base URL from environment or window configuration
 */
function getAPIBaseUrl() {
    // Priority 1: Environment variable (for build-time configuration)
    if (typeof process !== 'undefined' && process.env?.API_BASE_URL) {
        return process.env.API_BASE_URL;
    }
    // Priority 2: Window configuration (for runtime configuration)
    if (typeof window !== 'undefined') {
        const windowConfig = window;
        const configManagerApi = windowConfig.configManager?.get?.('apiUrl');
        if (configManagerApi) {
            return configManagerApi;
        }
        if (windowConfig.API_BASE_URL) {
            return windowConfig.API_BASE_URL;
        }
        if (windowConfig.CANOPI_API_URL) {
            return windowConfig.CANOPI_API_URL;
        }
        if (windowConfig.METALAYER_API_URL) {
            return windowConfig.METALAYER_API_URL;
        }
    }
    // Priority 3: Default production URL
    return 'https://api.themetalayer.org';
}
/**
 * Get fallback API URL (for development/testing)
 */
function getFallbackAPIUrl() {
    // Priority 1: Environment variable
    if (typeof process !== 'undefined' && process.env?.API_FALLBACK_URL) {
        return process.env.API_FALLBACK_URL;
    }
    // Priority 2: Window configuration
    if (typeof window !== 'undefined') {
        const windowConfig = window;
        const configManagerFallback = windowConfig.configManager?.get?.('fallbackApiUrl');
        if (configManagerFallback) {
            return configManagerFallback;
        }
        if (windowConfig.API_FALLBACK_URL) {
            return windowConfig.API_FALLBACK_URL;
        }
        if (windowConfig.METALAYER_API_URL) {
            return windowConfig.METALAYER_API_URL;
        }
    }
    // Priority 3: Default fallback (development server)
    // Note: This should be removed in production - all URLs should use baseUrl
    return 'https://api.themetalayer.org';
}
/**
 * API Configuration Object
 */
export const API_CONFIG = {
    /**
     * Primary API base URL
     * Use this for all API calls unless you specifically need the fallback
     */
    baseUrl: getAPIBaseUrl(),
    /**
     * Fallback API URL (for development/testing)
     * Only use when explicitly needed for local development
     */
    fallbackUrl: getFallbackAPIUrl(),
    /**
     * Get the appropriate API URL for a given endpoint
     * @param endpoint - API endpoint path (e.g., '/v1/users')
     * @param useFallback - Whether to use fallback URL (default: false)
     * @returns Full API URL
     */
    getUrl(endpoint, useFallback = false) {
        const base = useFallback ? this.fallbackUrl : this.baseUrl;
        // Ensure endpoint starts with /
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${base}${normalizedEndpoint}`;
    },
    /**
     * Replace api.themetalayer.org URLs with configured base URL
     * @param url - URL that may contain api.themetalayer.org
     * @returns URL with api.themetalayer.org replaced
     */
    replaceMetalayerUrl(url) {
        if (url.includes('api.themetalayer.org')) {
            return url.replace('https://api.themetalayer.org', this.baseUrl);
        }
        return url;
    }
};
// Log configuration on initialization (only in development)
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    Logger.debug('API_CONFIG initialized', {
        baseUrl: API_CONFIG.baseUrl,
        fallbackUrl: API_CONFIG.fallbackUrl
    }, 'config');
}
//# sourceMappingURL=APIConfig.js.map
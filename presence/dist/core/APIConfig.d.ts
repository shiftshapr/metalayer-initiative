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
/**
 * API Configuration Object
 */
export declare const API_CONFIG: {
    /**
     * Primary API base URL
     * Use this for all API calls unless you specifically need the fallback
     */
    baseUrl: string;
    /**
     * Fallback API URL (for development/testing)
     * Only use when explicitly needed for local development
     */
    fallbackUrl: string;
    /**
     * Get the appropriate API URL for a given endpoint
     * @param endpoint - API endpoint path (e.g., '/v1/users')
     * @param useFallback - Whether to use fallback URL (default: false)
     * @returns Full API URL
     */
    getUrl(endpoint: string, useFallback?: boolean): string;
    /**
     * Replace api.themetalayer.org URLs with configured base URL
     * @param url - URL that may contain api.themetalayer.org
     * @returns URL with api.themetalayer.org replaced
     */
    replaceMetalayerUrl(url: string): string;
};
//# sourceMappingURL=APIConfig.d.ts.map
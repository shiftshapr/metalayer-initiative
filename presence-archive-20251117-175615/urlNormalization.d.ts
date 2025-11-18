export = UrlNormalization;
/**
 * URL Normalization Utility - Shared between frontend and backend
 * This ensures consistent URL normalization across the entire system
 */
declare class UrlNormalization {
    defaultRules: ({
        type: string;
        domain: string;
        pattern: RegExp;
        queryKeys: string[];
        hashPreserve: boolean;
        priority: number;
        alternateTo?: undefined;
    } | {
        type: string;
        domain: string;
        pattern: RegExp;
        alternateTo: string;
        hashPreserve: boolean;
        priority: number;
        queryKeys?: undefined;
    } | {
        type: string;
        domain: string;
        pattern: RegExp;
        hashPreserve: boolean;
        priority: number;
        queryKeys?: undefined;
        alternateTo?: undefined;
    })[];
    /**
     * Normalize a URL based on configured rules
     * @param {string} url - The URL to normalize
     * @returns {{normalizedUrl: string, pageId: string}}
     */
    normalizeUrl(url: string): {
        normalizedUrl: string;
        pageId: string;
    };
    /**
     * Apply default URL normalization rules
     * @param {string} url - The URL to normalize
     * @returns {string} - Normalized URL
     */
    applyDefaultNormalization(url: string): string;
    /**
     * Check if URL matches a normalization rule
     * @param {string} url - The URL to check
     * @param {Object} rule - The normalization rule
     * @returns {boolean}
     */
    matchesRule(url: string, rule: any): boolean;
    /**
     * Apply a specific normalization rule
     * @param {string} url - The URL to normalize
     * @param {Object} rule - The normalization rule
     * @returns {string} - Normalized URL
     */
    applyRule(url: string, rule: any): string;
    /**
     * Preserve specific query keys for chrome:// URLs
     * @param {string} url - The chrome:// URL
     * @param {string[]} queryKeys - Keys to preserve
     * @returns {string} - Normalized URL
     */
    preserveQueryKeysForChrome(url: string, queryKeys: string[]): string;
    /**
     * Preserve specific query keys while removing others
     * @param {URL} urlObj - The URL object
     * @param {string[]} queryKeys - Keys to preserve
     * @returns {string} - Normalized URL
     */
    preserveQueryKeys(urlObj: URL, queryKeys: string[]): string;
    /**
     * Apply alternate URL pattern (e.g., youtu.be -> youtube.com)
     * @param {URL} urlObj - The URL object
     * @param {Object} rule - The normalization rule
     * @returns {string} - Normalized URL
     */
    applyAlternatePattern(urlObj: URL, rule: any): string;
    /**
     * Preserve or remove hash based on rule
     * @param {URL} urlObj - The URL object
     * @param {boolean} preserveHash - Whether to preserve hash
     * @returns {string} - Normalized URL
     */
    preserveHash(urlObj: URL, preserveHash: boolean): string;
    /**
     * Generate pageId from normalized URL
     * @param {string} normalizedUrl - The normalized URL
     * @returns {string} - Page ID
     */
    generatePageId(normalizedUrl: string): string;
}
//# sourceMappingURL=urlNormalization.d.ts.map
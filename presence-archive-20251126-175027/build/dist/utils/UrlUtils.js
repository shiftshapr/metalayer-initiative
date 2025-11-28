/**
 * URL Utilities - ES6 TypeScript Module
 * Utilities for getting and normalizing URLs
 */
import { normalizeUrl } from './UrlNormalization.js';
import { handleError } from './ErrorHandler.js';
import { Logger } from './Logger.js';
/**
 * Gets the current page URI from the active Chrome tab
 * @returns Promise resolving to the tab URL or null if unavailable
 */
export async function getCurrentPageUri() {
    try {
        // Check if Chrome tabs API is available
        if (typeof chrome === 'undefined' || !chrome.tabs) {
            Logger.warn('⚠️ getCurrentPageUri: Chrome tabs API not available', null, 'utils');
            return null;
        }
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const uri = tab && tab.url ? tab.url : null;
        Logger.debug('Current page URI:', uri, 'utils');
        // COMP METHOD: Chrome internal pages work normally (like COMP)
        if (uri && (uri.startsWith('chrome://') || uri.startsWith('chrome-extension://'))) {
            Logger.debug('🔍 PAGE_ID: Detected Chrome internal page, using normal processing', 'utils');
            // Continue with normal processing like COMP method
        }
        return uri;
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
                component: 'UrlUtils'
            }
        });
        ;
        return null;
    }
}
/**
 * Normalizes the current page URL using the normalization API
 * @returns Promise resolving to normalized URL data
 */
export async function normalizeCurrentUrl() {
    try {
        const rawUri = await getCurrentPageUri();
        if (!rawUri) {
            Logger.warn('⚠️ normalizeCurrentUrl: No URI available, using window.location.href', 'utils');
            const fallbackUrl = typeof window !== 'undefined' ? window.location.href : 'unknown';
            const normalized = await normalizeUrl(fallbackUrl);
            return {
                ...normalized,
                rawUrl: fallbackUrl
            };
        }
        Logger.debug(`URL_NORMALIZE: Normalizing current URL: ${rawUri}`, null, 'utils');
        // Use normalizeUrl from UrlNormalization.ts
        const urlData = await normalizeUrl(rawUri);
        Logger.debug(`URL_NORMALIZE: Normalized URL data:`, urlData, 'utils');
        return {
            ...urlData,
            rawUrl: rawUri
        };
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
                component: 'UrlUtils'
            }
        });
        ;
        const fallbackUrl = typeof window !== 'undefined' ? window.location.href : 'unknown';
        const normalized = await normalizeUrl(fallbackUrl);
        return {
            ...normalized,
            rawUrl: fallbackUrl
        };
    }
}
//# sourceMappingURL=UrlUtils.js.map
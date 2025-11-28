/**
 * URL Utilities - ES6 TypeScript Module
 * Utilities for getting and normalizing URLs
 */
import { type NormalizationResult } from './UrlNormalization.js';
/**
 * Gets the current page URI from the active Chrome tab
 * @returns Promise resolving to the tab URL or null if unavailable
 */
export declare function getCurrentPageUri(): Promise<string | null>;
/**
 * Normalizes the current page URL using the normalization API
 * @returns Promise resolving to normalized URL data
 */
export declare function normalizeCurrentUrl(): Promise<NormalizationResult & {
    rawUrl: string;
}>;
//# sourceMappingURL=UrlUtils.d.ts.map
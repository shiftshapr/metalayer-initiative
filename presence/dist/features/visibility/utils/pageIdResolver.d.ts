/**
 * PAGE ID RESOLVER - Centralized Page ID Resolution
 *
 * Extracts and consolidates page ID resolution logic from multiple files.
 * Phase 1: Foundation - Utility Functions
 */
import type { PageIdResolution } from '../core/VisibilityTypes.js';
/**
 * Resolve current page ID from multiple sources
 * Priority order:
 * 1. Tab container dataset (most reliable)
 * 2. window.currentUrlData.pageId
 * 3. DOM attribute (data-page-id on first message)
 *
 * @param tabId - Optional tab ID to check (default: 'visibility-tab')
 * @returns PageIdResolution with pageId and source
 */
export declare function resolveCurrentPageId(tabId?: string): PageIdResolution;
/**
 * Get current page ID as string (convenience function)
 * @param tabId - Optional tab ID to check
 * @returns Page ID string or null
 */
export declare function getCurrentPageId(tabId?: string): string | null;
/**
 * Check if a page ID is valid
 * @param pageId - Page ID to validate
 * @returns True if page ID is valid (non-empty string)
 */
export declare function isValidPageId(pageId: string | null | undefined): pageId is string;
//# sourceMappingURL=pageIdResolver.d.ts.map
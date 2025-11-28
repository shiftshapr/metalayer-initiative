/**
 * PAGE ID RESOLVER - Centralized Page ID Resolution
 *
 * Extracts and consolidates page ID resolution logic from multiple files.
 * Phase 1: Foundation - Utility Functions
 */
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
export function resolveCurrentPageId(tabId = 'visibility-tab') {
    const win = typeof window !== 'undefined' ? window : null;
    // Source 1: Tab container dataset (most reliable)
    if (win?.tabContextManager) {
        const tabContainer = win.tabContextManager.getTabContainer(tabId);
        if (tabContainer?.dataset?.pageId) {
            return {
                pageId: tabContainer.dataset.pageId,
                source: 'tab-container'
            };
        }
    }
    // Source 2: window.currentUrlData.pageId
    if (win?.currentUrlData?.pageId) {
        return {
            pageId: win.currentUrlData.pageId,
            source: 'current-url-data'
        };
    }
    // Source 3: DOM attribute (data-page-id on first message)
    if (typeof document !== 'undefined') {
        const firstMessage = document.querySelector('[data-page-id]');
        const pageIdAttr = firstMessage?.getAttribute('data-page-id');
        if (pageIdAttr) {
            return {
                pageId: pageIdAttr,
                source: 'dom-attribute'
            };
        }
    }
    // No page ID found
    return {
        pageId: null,
        source: 'null'
    };
}
/**
 * Get current page ID as string (convenience function)
 * @param tabId - Optional tab ID to check
 * @returns Page ID string or null
 */
export function getCurrentPageId(tabId = 'visibility-tab') {
    return resolveCurrentPageId(tabId).pageId;
}
/**
 * Check if a page ID is valid
 * @param pageId - Page ID to validate
 * @returns True if page ID is valid (non-empty string)
 */
export function isValidPageId(pageId) {
    return typeof pageId === 'string' && pageId.length > 0;
}
//# sourceMappingURL=pageIdResolver.js.map
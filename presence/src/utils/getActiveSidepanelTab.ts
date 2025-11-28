/**
 * Get the currently active sidepanel tab
 * Shared utility to prevent message loading on visibility tab
 *
 * @returns Tab ID string or null if not found
 */
export function getActiveSidepanelTab(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  // Check tabContextManager first
  const win = typeof window !== 'undefined' ? window : null;
  if (win && 'tabContextManager' in win) {
    const tabManager = (win as Window & { tabContextManager?: { getActiveTab?: () => string | null } }).tabContextManager;
    if (tabManager?.getActiveTab) {
      const activeTab = tabManager.getActiveTab();
      if (activeTab) {
        return activeTab;
      }
    }
  }
  // Fallback: check DOM for active tab
  const activeTab = document.querySelector('.main-nav-tab.active');
  const tabId = activeTab?.getAttribute('data-tab');
  return tabId || null;
}

/**
 * Check if visibility tab is active
 *
 * @returns True if visibility tab is active
 */
export function isVisibilityTabActive(): boolean {
  return getActiveSidepanelTab() === 'visibility-tab';
}


/**
 * Navigation Manager - Abstracted Navigation System
 * Handles URL navigation and target highlighting in Chrome extension
 */
class NavigationManager {
    constructor() {
        this.initialize();
    }
    async initialize() {
        console.log('🧭 NAVIGATION: Navigation manager initialized');
    }
    async navigateToUrl(url, target) {
        try {
            console.log('🧭 NAVIGATION: Navigating to URL:', url, 'with target:', target);
            // Get current active tab
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab && activeTab.url === url) {
                // Already on the target page, just focus and highlight
                await this.focusAndHighlight(target);
            }
            else {
                // Navigate to the URL
                if (activeTab?.id) {
                    await chrome.tabs.update(activeTab.id, { url: url });
                    // Wait for page to load, then highlight
                    setTimeout(() => {
                        this.focusAndHighlight(target);
                    }, 2000);
                }
            }
        }
        catch (error) {
            console.error('🧭 NAVIGATION: Error navigating:', error);
        }
    }
    async focusAndHighlight(target) {
        try {
            if (!target)
                return;
            console.log('🧭 NAVIGATION: Focusing and highlighting target:', target);
            // Send message to content script to highlight the target
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab?.id) {
                await chrome.tabs.sendMessage(activeTab.id, {
                    type: 'HIGHLIGHT_TARGET',
                    target: target
                });
            }
        }
        catch (error) {
            console.error('🧭 NAVIGATION: Error focusing target:', error);
        }
    }
}
// Create singleton instance
const navigationManager = new NavigationManager();
// Export as ES6 module
export { NavigationManager, navigationManager };
export default NavigationManager;
// Window export for backward compatibility
if (typeof window !== 'undefined') {
    window.navigationManager = navigationManager;
}
//# sourceMappingURL=NavigationManager.js.map
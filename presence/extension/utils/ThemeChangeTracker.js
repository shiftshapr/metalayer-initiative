/**
 * Theme Change Tracker
 * Comprehensive logging for all theme changes to identify root cause
 */
class ThemeChangeTracker {
    constructor() {
        this.observer = null;
        this.isTracking = false;
    }
    startTracking() {
        if (this.isTracking) {
            console.log('🔍 THEME_TRACKER: Already tracking');
            return;
        }
        this.isTracking = true;
        console.log('🔍 THEME_TRACKER: Starting theme change tracking...');
        // Track all setAttribute calls on document.body and document.documentElement
        const originalSetAttribute = Element.prototype.setAttribute;
        const self = this;
        Element.prototype.setAttribute = function (name, value) {
            if (name === 'data-theme' && (this === document.body || this === document.documentElement)) {
                const oldValue = this.getAttribute('data-theme');
                const stack = new Error().stack;
                const caller = stack?.split('\n')[2]?.trim() || 'unknown';
                console.log('🔍 THEME_TRACKER: ========================================');
                console.log('🔍 THEME_TRACKER: data-theme attribute SET');
                console.log('🔍 THEME_TRACKER: Element:', this === document.body ? 'document.body' : 'document.documentElement');
                console.log('🔍 THEME_TRACKER: Old value:', oldValue || 'NOT SET');
                console.log('🔍 THEME_TRACKER: New value:', value);
                console.log('🔍 THEME_TRACKER: Caller:', caller);
                console.log('🔍 THEME_TRACKER: Full stack:', stack?.split('\n').slice(1, 10).join('\n'));
                console.log('🔍 THEME_TRACKER: ========================================');
            }
            return originalSetAttribute.call(this, name, value);
        };
        // Also use MutationObserver as backup
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const target = mutation.target;
                    const newValue = target.getAttribute('data-theme');
                    const oldValue = mutation.oldValue;
                    console.log('🔍 THEME_TRACKER: ========================================');
                    console.log('🔍 THEME_TRACKER: data-theme attribute CHANGED (MutationObserver)');
                    console.log('🔍 THEME_TRACKER: Element:', target === document.body ? 'document.body' : target === document.documentElement ? 'document.documentElement' : target.tagName);
                    console.log('🔍 THEME_TRACKER: Old value:', oldValue || 'NOT SET');
                    console.log('🔍 THEME_TRACKER: New value:', newValue || 'NOT SET');
                    console.log('🔍 THEME_TRACKER: ========================================');
                }
            });
        });
        this.observer.observe(document.body, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['data-theme']
        });
        this.observer.observe(document.documentElement, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['data-theme']
        });
        console.log('✅ THEME_TRACKER: Theme change tracking started');
    }
    stopTracking() {
        if (!this.isTracking) {
            return;
        }
        this.isTracking = false;
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        console.log('🔍 THEME_TRACKER: Theme change tracking stopped');
    }
}
// Create singleton instance
const themeChangeTracker = new ThemeChangeTracker();
// Auto-start tracking when module loads
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            themeChangeTracker.startTracking();
        });
    }
    else {
        themeChangeTracker.startTracking();
    }
    window.themeChangeTracker = themeChangeTracker;
}
export { ThemeChangeTracker, themeChangeTracker };
export default themeChangeTracker;

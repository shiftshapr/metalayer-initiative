import { Logger } from '../utils/Logger.js';
import { getActiveSidepanelTab } from '../utils/getActiveSidepanelTab.js';
export function getSidepanelWindow() {
    return window;
}
export function getSettingContracts() {
    const win = getSidepanelWindow();
    return {
        userPreferencesManager: win.userPreferencesManager,
        unifiedSettingsStorage: win.unifiedSettingsStorage,
        saveSetting: win.saveSetting,
        getSetting: win.getSetting
    };
}
export function getVisibilityStorageDependencies() {
    const contracts = typeof window !== 'undefined' ? getSettingContracts() : {};
    return {
        userPreferencesManager: contracts.userPreferencesManager,
        unifiedSettingsStorage: contracts.unifiedSettingsStorage,
        saveSetting: contracts.saveSetting,
        getSetting: contracts.getSetting
    };
}
export function exposeModuleGraph(graph) {
    const win = getSidepanelWindow();
    win.__CANOPI_MODULE_GRAPH__ = graph;
    // ROOT CAUSE FIX: Inject getActiveSidepanelTab into window for consistent tab detection
    // This ensures loadChatHistory and other functions can reliably detect the active tab
    if (typeof window !== 'undefined') {
        window.getActiveSidepanelTab = getActiveSidepanelTab;
    }
}
export function registerManager(key, instance) {
    const win = getSidepanelWindow();
    win[key] = instance;
    return instance;
}
export function ensureManager(key, factory) {
    const win = getSidepanelWindow();
    const existing = win[key];
    if (existing) {
        return existing;
    }
    const instance = factory();
    win[key] = instance;
    return instance;
}
/**
 * Wait for UserPreferencesManager to be ready
 * Returns a promise that resolves when UserPreferencesManager is available and initialized
 * Pure promise-based solution using event listeners (no polling)
 */
export function waitForPreferencesManager(timeoutMs = 15000) {
    // Immediate check - if already initialized, resolve immediately
    const prefsMgr = window.userPreferencesManager;
    if (prefsMgr && prefsMgr.isInitialized) {
        return Promise.resolve(prefsMgr);
    }
    // Create timeout promise
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            // On timeout, return whatever is available (may be null)
            const mgr = window.userPreferencesManager;
            if (mgr && mgr.isInitialized) {
                resolve(mgr);
            }
            else {
                Logger.warn('⚠️ waitForPreferencesManager: Timeout waiting for UserPreferencesManager initialization', null, 'general');
                resolve(null);
            }
        }, timeoutMs);
    });
    // Create event-based promise that checks isInitialized flag
    const eventPromise = new Promise((resolve) => {
        let resolved = false;
        let eventHandler = null;
        const checkAndResolve = () => {
            if (resolved)
                return;
            const mgr = window.userPreferencesManager;
            if (mgr && mgr.isInitialized) {
                resolved = true;
                if (eventHandler) {
                    window.removeEventListener('preferenceLoaded', eventHandler);
                }
                resolve(mgr);
            }
        };
        eventHandler = () => {
            checkAndResolve();
        };
        // Set up event listener BEFORE checking (prevents race condition)
        window.addEventListener('preferenceLoaded', eventHandler, { once: true });
        // Check immediately after listener is set up (handles case where event already fired)
        // Use requestAnimationFrame to ensure listener is registered in current event loop
        requestAnimationFrame(() => {
            checkAndResolve();
        });
    });
    // Race between event and timeout - whichever resolves first wins
    return Promise.race([eventPromise, timeoutPromise]);
}
//# sourceMappingURL=windowInjections.js.map
/**
 * Tab Manager Initialization
 * Initializes the Tab Manager after DOM is ready
 */
import { getTabManager } from './TabManager.js';
import { Logger } from '../../utils/Logger.js';
import { handleError } from '../../utils/ErrorHandler.js';
let tabManagerInitialized = false;
async function initializeTabManager() {
    if (tabManagerInitialized) {
        Logger.warn?.('⚠️ TabManager: Already initialized');
        return;
    }
    try {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                try {
                    await doInitialize();
                }
                catch (error) {
                    handleError(error, {
                        context: { operation: 'initializeTabManager.DOMContentLoaded', component: 'TabManager' }
                    });
                }
            });
        }
        else {
            await doInitialize();
        }
    }
    catch (error) {
        handleError(error, {
            context: { operation: 'initializeTabManager', component: 'TabManager' }
        });
    }
}
/**
 * Wait for UserPreferencesManager to be ready
 * Returns a promise that resolves when UserPreferencesManager is available and initialized
 */
function waitForPreferencesManager() {
    return new Promise((resolve) => {
        let resolved = false;
        let eventHandler = null;
        let checkInterval = null;
        const doResolve = (value) => {
            if (resolved)
                return;
            resolved = true;
            if (eventHandler) {
                window.removeEventListener('preferenceLoaded', eventHandler);
            }
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            resolve(value);
        };
        // Check if already available and initialized
        const checkInitialized = () => {
            const prefsMgr = window.userPreferencesManager;
            if (prefsMgr && prefsMgr.isInitialized) {
                Logger.debug?.('✅ TabManager: UserPreferencesManager already ready');
                doResolve(prefsMgr);
                return true;
            }
            return false;
        };
        // Immediate check
        if (checkInitialized()) {
            return;
        }
        // Set up event handler
        eventHandler = () => {
            const prefsMgr = window.userPreferencesManager;
            if (prefsMgr && prefsMgr.isInitialized) {
                Logger.debug?.('✅ TabManager: UserPreferencesManager ready (from event)');
                doResolve(prefsMgr);
            }
        };
        window.addEventListener('preferenceLoaded', eventHandler);
        // Also check periodically as fallback (max 5 seconds)
        let attempts = 0;
        const maxAttempts = 10; // 10 * 500ms = 5 seconds
        checkInterval = setInterval(() => {
            attempts++;
            if (checkInitialized()) {
                return;
            }
            if (attempts >= maxAttempts) {
                Logger.warn?.('⚠️ TabManager: UserPreferencesManager timeout, proceeding anyway');
                // Proceed with whatever is available (may be null)
                const prefsMgr = window.userPreferencesManager || null;
                doResolve(prefsMgr);
            }
        }, 500);
    });
}
async function doInitialize() {
    try {
        // Wait for UserPreferencesManager to be ready (promise-based, no polling)
        await waitForPreferencesManager();
        const tabManager = getTabManager();
        await tabManager.initialize();
        tabManagerInitialized = true;
        Logger.debug?.('✅ TabManager: Initialized successfully');
        // Dispatch event to notify other modules
        document.dispatchEvent(new CustomEvent('tabManager:initialized', {
            detail: { tabManager }
        }));
    }
    catch (error) {
        Logger.error?.('❌ TabManager: Initialization error', error);
    }
}
// Auto-initialize when module loads
initializeTabManager();
//# sourceMappingURL=initializeTabManager.js.map
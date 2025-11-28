/**
 * Window Injections (Refactored for ES6 - No Backward Compatibility)
 *
 * Manages module graph storage and utilities using ES6 patterns
 * All window assignments removed - uses ES6 imports instead
 */
import { Logger } from '../utils/Logger.js';
import { userPreferencesManager } from '../utils/UserPreferencesManager.js';
/**
 * Get the sidepanel window object
 */
export function getSidepanelWindow() {
    if (typeof window === 'undefined') {
        throw new Error('Window is not available');
    }
    return window;
}
/**
 * Store module graph (ES6 pattern - no window assignments)
 * Only stores __CANOPI_MODULE_GRAPH__ for internal use
 *
 * @param graph - The module graph to store
 */
export function exposeModuleGraph(graph) {
    if (typeof window === 'undefined') {
        Logger.warn('Cannot store module graph - window not available', null, 'module-graph');
        return;
    }
    // Only store module graph internally - no window assignments for backward compatibility
    const win = getSidepanelWindow();
    win.__CANOPI_MODULE_GRAPH__ = graph;
    Logger.debug('Module graph stored (ES6 pattern - no window assignments)', {
        modules: Object.keys(graph).filter(key => graph[key] !== undefined)
    }, 'module-graph');
}
/**
 * Ensure a manager is available (ES6 pattern - no window storage)
 * Creates manager instance if needed, but doesn't store on window
 * @param name - Name identifier (for logging only)
 * @param factory - Function to create the manager if it doesn't exist
 * @returns The manager instance
 */
export function ensureManager(_name, factory) {
    // ES6 pattern: Just create and return - no window storage
    // Callers should store the instance themselves if needed
    return factory();
}
/**
 * Wait for UserPreferencesManager to be available and initialized (ES6 pattern)
 * Uses ES6 import instead of window globals
 * @returns Promise that resolves with the UserPreferencesManager instance
 */
export async function waitForPreferencesManager() {
    return new Promise((resolve) => {
        let resolved = false;
        let eventHandler = null;
        let checkInterval = null;
        const doResolve = () => {
            if (resolved)
                return;
            resolved = true;
            if (eventHandler) {
                window.removeEventListener('preferenceLoaded', eventHandler);
            }
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            resolve(userPreferencesManager);
        };
        // Check if already initialized (ES6 import)
        if (userPreferencesManager.isInitialized) {
            Logger.debug('✅ UserPreferencesManager already ready (ES6 import)', null, 'preferences');
            resolve(userPreferencesManager);
            return;
        }
        // Set up event handler
        eventHandler = () => {
            if (userPreferencesManager.isInitialized) {
                Logger.debug('✅ UserPreferencesManager ready (from event)', null, 'preferences');
                doResolve();
            }
        };
        window.addEventListener('preferenceLoaded', eventHandler);
        // Also check periodically as fallback (max 5 seconds)
        let attempts = 0;
        const maxAttempts = 10; // 10 * 500ms = 5 seconds
        checkInterval = setInterval(() => {
            attempts++;
            if (userPreferencesManager.isInitialized) {
                doResolve();
                return;
            }
            if (attempts >= maxAttempts) {
                Logger.warn('⚠️ UserPreferencesManager timeout, proceeding anyway', null, 'preferences');
                doResolve();
            }
        }, 500);
    });
}
/**
 * Get setting contracts (ES6 pattern - uses ES6 imports)
 * @returns Object with setting-related managers and functions
 */
export function getSettingContracts() {
    // ES6 pattern: Use direct imports instead of window globals
    return {
        userPreferencesManager: userPreferencesManager,
        // unifiedSettingsStorage, getSetting, saveSetting can be added as ES6 imports when available
        unifiedSettingsStorage: undefined,
        getSetting: undefined,
        saveSetting: undefined
    };
}

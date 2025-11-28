/**
 * STATEMANAGER - Centralized State Management
 * TypeScript + ES6 Module
 */
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
import { API_CONFIG } from './APIConfig.js';
class StateManager {
    constructor() {
        this.maxHistorySize = 100;
        this.state = {
            chat: {
                data: [],
                lastLoadedUri: null,
                focusedMessage: null,
                previousView: null,
                lastMessageCount: 0,
                lastMessageId: null,
                isPolling: false
            },
            avatars: {
                user: {
                    current: null,
                    customColor: null,
                    defaultColor: null
                },
                visibility: [],
                message: [],
                combined: []
            },
            ui: {
                activeModal: null,
                debugMode: false,
                theme: 'auto',
                activeCommunities: [],
                primaryCommunity: null,
                currentCommunity: null
            },
            sync: {
                isConnected: false,
                lastSyncTime: null,
                pendingMessages: [],
                retryCount: 0
            },
            api: {
                baseUrl: API_CONFIG.baseUrl,
                isOnline: true,
                lastRequestTime: null,
                requestCount: 0,
                errorCount: 0
            },
            extension: {
                build: '2025-01-24-010',
                reloadTimestamp: null,
                isInitialized: false,
                version: '1.0.0'
            }
        };
        this.subscribers = new Map();
        this.history = [];
        this.initialize();
    }
    async initialize(initialState) {
        try {
            Logger.debug('🏗️ StateManager: Initializing...', null, 'state');
            if (initialState) {
                this.mergeState(initialState);
            }
            this.setState('extension.reloadTimestamp', new Date().toISOString());
            this.setState('extension.isInitialized', true);
            await this.loadPersistedState();
            Logger.debug('✅ StateManager: Initialized successfully', null, 'state');
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'initialize',
                    component: 'StateManager'
                }
            });
        }
    }
    async get(key) {
        const keys = key.split('.');
        let value = this.state;
        for (const k of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            if (typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    async set(key, value) {
        this.setState(key, value);
    }
    async getAll() {
        return { ...this.state };
    }
    getState(path) {
        // If no path provided, return entire state
        if (!path) {
            return { ...this.state };
        }
        // Validate path is a string
        if (typeof path !== 'string') {
            Logger.warn?.('⚠️ StateManager.getState: path must be a string', { path });
            return undefined;
        }
        const keys = path.split('.');
        let current = this.state;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    setState(path, value, persist = false) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        if (!lastKey)
            return;
        let current = this.state;
        for (const key of keys) {
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        const oldValue = current[lastKey];
        current[lastKey] = value;
        this.addToHistory(path, oldValue, value);
        this.notifySubscribers(path, value, oldValue);
        if (persist) {
            this.persistState(path, value);
        }
        Logger.debug(`🔄 StateManager: ${path} = ${JSON.stringify(value)}`, null, 'state');
    }
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        this.subscribers.get(path).add(callback);
        return () => {
            const pathSubscribers = this.subscribers.get(path);
            if (pathSubscribers) {
                pathSubscribers.delete(callback);
                if (pathSubscribers.size === 0) {
                    this.subscribers.delete(path);
                }
            }
        };
    }
    getHistory(path) {
        if (path) {
            return this.history.filter(h => h.path === path);
        }
        return [...this.history];
    }
    getSnapshot() {
        return {
            state: { ...this.state },
            historySize: this.history.length,
            subscriberCount: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0)
        };
    }
    resetState(path) {
        if (path) {
            const keys = path.split('.');
            let current = this.state;
            for (const key of keys.slice(0, -1)) {
                current = current[key];
            }
            delete current[keys[keys.length - 1]];
        }
        else {
            this.state = this.getInitialState();
        }
    }
    cleanup() {
        Logger.debug('🧹 StateManager: Cleaning up...', null, 'state');
        this.subscribers.clear();
        this.history = [];
        this.state = this.getInitialState();
        Logger.debug('✅ StateManager: Cleanup complete', null, 'state');
    }
    async persistState(_path, _value) {
        if (typeof chrome === 'undefined' || !chrome.storage?.local) {
            return;
        }
        try {
            const currentState = await this.getAll();
            await new Promise((resolve) => {
                chrome.storage.local.set({ stateManager: currentState }, () => {
                    resolve();
                });
            });
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'State'
                }
            });
            ;
        }
    }
    mergeState(newState) {
        this.state = { ...this.state, ...newState };
    }
    async loadPersistedState() {
        if (typeof chrome === 'undefined' || !chrome.storage?.local) {
            return;
        }
        try {
            const result = await new Promise((resolve) => {
                chrome.storage.local.get(['stateManager'], (data) => {
                    resolve(data);
                });
            });
            if (result.stateManager) {
                this.mergeState(result.stateManager);
                Logger.debug('✅ StateManager: Persisted state loaded', null, 'state');
            }
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'State'
                }
            });
            ;
        }
    }
    notifySubscribers(path, newValue, oldValue) {
        const pathSubscribers = this.subscribers.get(path);
        if (pathSubscribers) {
            pathSubscribers.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                }
                catch (error) {
                    handleError(error, {
                        log: true,
                        logLevel: 'error',
                        context: {
                            operation: 'catch',
                            component: 'State'
                        }
                    });
                    ;
                }
            });
        }
        const wildcardSubscribers = this.subscribers.get('*');
        if (wildcardSubscribers) {
            wildcardSubscribers.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                }
                catch (error) {
                    handleError(error, {
                        log: true,
                        logLevel: 'error',
                        context: {
                            operation: 'catch',
                            component: 'State'
                        }
                    });
                    ;
                }
            });
        }
    }
    addToHistory(path, oldValue, newValue) {
        this.history.push({
            timestamp: Date.now(),
            path,
            oldValue,
            newValue
        });
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }
    getInitialState() {
        return {
            chat: {
                data: [],
                lastLoadedUri: null,
                focusedMessage: null,
                previousView: null,
                lastMessageCount: 0,
                lastMessageId: null,
                isPolling: false
            },
            avatars: {
                user: {
                    current: null,
                    customColor: null,
                    defaultColor: null
                },
                visibility: [],
                message: [],
                combined: []
            },
            ui: {
                activeModal: null,
                debugMode: false,
                theme: 'auto',
                activeCommunities: [],
                primaryCommunity: null,
                currentCommunity: null
            },
            sync: {
                isConnected: false,
                lastSyncTime: null,
                pendingMessages: [],
                retryCount: 0
            },
            api: {
                baseUrl: API_CONFIG.baseUrl,
                isOnline: true,
                lastRequestTime: null,
                requestCount: 0,
                errorCount: 0
            },
            extension: {
                build: '2025-01-24-010',
                reloadTimestamp: null,
                isInitialized: false,
                version: '1.0.0'
            }
        };
    }
}
// Create singleton instance
const stateManagerInstance = new StateManager();
// Export singleton instance
export { stateManagerInstance };
// Export class for type definitions
export { StateManager };
export default StateManager;
const normalizeCommunityIds = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }
    const unique = new Set();
    value.forEach(id => {
        if (typeof id === 'string') {
            const trimmed = id.trim();
            if (trimmed.length > 0) {
                unique.add(trimmed);
            }
        }
    });
    return Array.from(unique);
};
// Export convenience functions that use the singleton
export const getState = (key) => stateManagerInstance.getState(key);
export const setState = (key, value, persist = false) => stateManagerInstance.setState(key, value, persist);
export const setActiveCommunitiesState = (communities, persist = false) => {
    const normalized = normalizeCommunityIds(communities);
    stateManagerInstance.setState('ui.activeCommunities', normalized, persist);
    stateManagerInstance.setState('activeCommunities', normalized, persist);
    if (typeof window !== 'undefined') {
        window.activeCommunities = [...normalized];
    }
};
// Export stateManagerInstance to window for diagnostic scripts and module access
if (typeof window !== 'undefined') {
    window.stateManagerInstance = stateManagerInstance;
    Object.defineProperty(window, 'stateManagerInstance', {
        value: stateManagerInstance,
        writable: true,
        configurable: true,
        enumerable: true
    });
    window.getState = getState;
    window.setState = setState;
    window.activeCommunities = normalizeCommunityIds(stateManagerInstance.getState('ui.activeCommunities'));
    Logger.debug('✅ StateManager: stateManagerInstance exported to window', null, 'state');
}
//# sourceMappingURL=StateManager.js.map
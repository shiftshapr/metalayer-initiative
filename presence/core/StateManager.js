/**
 * STATEMANAGER - Centralized State Management
 * TypeScript + ES6 Module
 */
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
                baseUrl: 'http://216.238.91.120:3002',
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
    /**
     * Initialize the state manager
     */
    async initialize(initialState) {
        console.log('🏗️ StateManager: Initializing...');
        if (initialState) {
            this.mergeState(initialState);
        }
        // Set extension info
        this.setState('extension.reloadTimestamp', new Date().toISOString());
        this.setState('extension.isInitialized', true);
        // Load persisted state from Chrome storage
        await this.loadPersistedState();
        console.log('✅ StateManager: Initialized successfully');
    }
    /**
     * Get state value by key (dot notation supported)
     */
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
    /**
     * Set state value by key (dot notation supported)
     */
    async set(key, value) {
        this.setState(key, value);
    }
    /**
     * Get all state
     */
    async getAll() {
        return { ...this.state };
    }
    /**
     * Get state value by path (synchronous version for compatibility)
     */
    getState(path) {
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
    /**
     * Set state value by path (synchronous version for compatibility)
     */
    setState(path, value, persist = false) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.state;
        // Navigate to parent object
        for (const key of keys) {
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        // Store old value for history
        const oldValue = current[lastKey];
        // Set new value
        current[lastKey] = value;
        // Add to history
        this.addToHistory(path, oldValue, value);
        // Notify subscribers
        this.notifySubscribers(path, value, oldValue);
        // Persist to Chrome storage if requested
        if (persist) {
            this.persistState(path, value);
        }
        console.log(`🔄 StateManager: ${path} = ${JSON.stringify(value)}`);
    }
    /**
     * Subscribe to state changes
     */
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        this.subscribers.get(path).add(callback);
        // Return unsubscribe function
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
    /**
     * Persist state to Chrome storage
     */
    async persistState(path, value) {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
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
            console.error('❌ StateManager: Failed to persist state:', error);
        }
    }
    /**
     * Merge state object
     */
    mergeState(newState) {
        this.state = { ...this.state, ...newState };
    }
    /**
     * Load persisted state from Chrome storage
     */
    async loadPersistedState() {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
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
                console.log('✅ StateManager: Persisted state loaded');
            }
        }
        catch (error) {
            console.error('❌ StateManager: Failed to load persisted state:', error);
        }
    }
    /**
     * Notify subscribers of state changes
     */
    notifySubscribers(path, newValue, oldValue) {
        const pathSubscribers = this.subscribers.get(path);
        if (pathSubscribers) {
            pathSubscribers.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                }
                catch (error) {
                    console.error(`❌ StateManager: Subscriber error for ${path}:`, error);
                }
            });
        }
        // Also notify wildcard subscribers
        const wildcardSubscribers = this.subscribers.get('*');
        if (wildcardSubscribers) {
            wildcardSubscribers.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                }
                catch (error) {
                    console.error('❌ StateManager: Wildcard subscriber error:', error);
                }
            });
        }
    }
    /**
     * Add to history
     */
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
    /**
     * Get state change history
     */
    getHistory(path) {
        if (path) {
            return this.history.filter(entry => entry.path.startsWith(path));
        }
        return [...this.history];
    }
    /**
     * Get state snapshot for debugging
     */
    getSnapshot() {
        return {
            state: JSON.parse(JSON.stringify(this.state)),
            subscribers: Array.from(this.subscribers.keys()),
            historySize: this.history.length,
            timestamp: Date.now()
        };
    }
    /**
     * Reset state to initial values
     */
    resetState(path) {
        if (path) {
            // Reset specific path to initial value
            const keys = path.split('.');
            const lastKey = keys.pop();
            let current = this.state;
            for (const key of keys) {
                if (!(key in current)) {
                    return;
                }
                current = current[key];
            }
            // Get initial state for this path
            const initialState = this.getInitialState();
            let initialValue = initialState;
            for (const key of keys) {
                initialValue = initialValue[key];
            }
            current[lastKey] = initialValue[lastKey];
        }
        else {
            // Reset all state
            this.state = this.getInitialState();
        }
    }
    /**
     * Get initial state structure
     */
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
                baseUrl: 'http://216.238.91.120:3002',
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
    /**
     * Cleanup resources
     */
    cleanup() {
        console.log('🧹 StateManager: Cleaning up...');
        this.subscribers.clear();
        this.history = [];
        this.state = this.getInitialState();
        console.log('✅ StateManager: Cleanup complete');
    }
}
// Create singleton instance
const stateManagerInstance = new StateManager();
// Export singleton instance
export { stateManagerInstance };
// Export class for type definitions
export { StateManager };
export default StateManager;
// Export convenience functions that use the singleton
export const getState = (key) => stateManagerInstance.getState(key);
export const setState = (key, value, persist = false) => stateManagerInstance.setState(key, value, persist);

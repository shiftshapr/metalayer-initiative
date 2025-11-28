/**
 * STATEMANAGER - Centralized State Management
 * TypeScript + ES6 Module
 */
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
import { API_CONFIG } from './APIConfig.js';

interface StateData {
  chat: {
    data: unknown[];
    lastLoadedUri: string | null;
    focusedMessage: unknown | null;
    previousView: unknown | null;
    lastMessageCount: number;
    lastMessageId: string | null;
    isPolling: boolean;
  };
  avatars: {
    user: {
      current: unknown | null;
      customColor: string | null;
      defaultColor: string | null;
    };
    visibility: unknown[];
    message: unknown[];
    combined: unknown[];
  };
  ui: {
    activeModal: string | null;
    debugMode: boolean;
    theme: string;
    activeCommunities: string[];
    primaryCommunity: string | null;
    currentCommunity: string | null;
  };
  sync: {
    isConnected: boolean;
    lastSyncTime: string | null;
    pendingMessages: unknown[];
    retryCount: number;
  };
  api: {
    baseUrl: string;
    isOnline: boolean;
    lastRequestTime: number | null;
    requestCount: number;
    errorCount: number;
  };
  extension: {
    build: string;
    reloadTimestamp: string | null;
    isInitialized: boolean;
    version: string;
  };
  [key: string]: unknown;
}

class StateManager {
  private state: StateData;
  private subscribers: Map<string, Set<(newValue: unknown, oldValue: unknown, path: string) => void>>;
  private history: Array<{ timestamp: number; path: string; oldValue: unknown; newValue: unknown }>;
  private maxHistorySize: number;

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

  async initialize(initialState?: Partial<StateData>): Promise<void> {
    try {
      Logger.debug('🏗️ StateManager: Initializing...', null, 'state');
      if (initialState) {
        this.mergeState(initialState);
      }
      this.setState('extension.reloadTimestamp', new Date().toISOString());
      this.setState('extension.isInitialized', true);
      await this.loadPersistedState();
      Logger.debug('✅ StateManager: Initialized successfully', null, 'state');
    } catch (error) {
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

  async get(key: string): Promise<unknown> {
    const keys = key.split('.');
    let value: unknown = this.state;
    for (const k of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return value;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.setState(key, value);
  }

  async getAll(): Promise<StateData> {
    return { ...this.state };
  }

  getState(path?: string): unknown {
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
    let current: unknown = this.state;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return current;
  }

  setState(path: string, value: unknown, persist = false): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    if (!lastKey) return;
    let current: Record<string, unknown> = this.state;
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
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

  subscribe(path: string, callback: (newValue: unknown, oldValue: unknown, path: string) => void): () => void {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    const subscriberSet = this.subscribers.get(path);
    if (subscriberSet) {
      subscriberSet.add(callback);
    }
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

  getHistory(path?: string): unknown[] {
    if (path) {
      return this.history.filter(h => h.path === path);
    }
    return [...this.history];
  }

  getSnapshot(): unknown {
    return {
      state: { ...this.state },
      historySize: this.history.length,
      subscriberCount: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0)
    };
  }

  resetState(path?: string): void {
    if (path) {
      const keys = path.split('.');
      if (keys.length === 0) return;
      let current: Record<string, unknown> = this.state;
      const lastKey = keys[keys.length - 1];
      if (!lastKey) return;
      for (const key of keys.slice(0, -1)) {
        current = current[key] as Record<string, unknown>;
      }
      delete current[lastKey];
    } else {
      this.state = this.getInitialState();
    }
  }

  cleanup(): void {
    Logger.debug('🧹 StateManager: Cleaning up...', null, 'state');
    this.subscribers.clear();
    this.history = [];
    this.state = this.getInitialState();
    Logger.debug('✅ StateManager: Cleanup complete', null, 'state');
  }

  private async persistState(_path: string, _value: unknown): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return;
    }
    try {
      const currentState = await this.getAll();
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ stateManager: currentState }, () => {
          resolve();
        });
      });
    } catch (error) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'catch',
          component: 'State'
        }
      });
    }
  }

  private mergeState(newState: Partial<StateData>): void {
    this.state = { ...this.state, ...newState };
  }

  private async loadPersistedState(): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return;
    }
    try {
      const result = await new Promise<{ stateManager?: StateData }>((resolve) => {
        chrome.storage.local.get(['stateManager'], (data) => {
          resolve(data as { stateManager?: StateData });
        });
      });
      if (result.stateManager) {
        this.mergeState(result.stateManager);
        Logger.debug('✅ StateManager: Persisted state loaded', null, 'state');
      }
    } catch (error) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'catch',
          component: 'State'
        }
      });
    }
  }

  private notifySubscribers(path: string, newValue: unknown, oldValue: unknown): void {
    const pathSubscribers = this.subscribers.get(path);
    if (pathSubscribers) {
      pathSubscribers.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
              operation: 'catch',
              component: 'State'
            }
          });
        }
      });
    }
    const wildcardSubscribers = this.subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
              operation: 'catch',
              component: 'State'
            }
          });
        }
      });
    }
  }

  private addToHistory(path: string, oldValue: unknown, newValue: unknown): void {
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

  private getInitialState(): StateData {
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

const normalizeCommunityIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const unique = new Set<string>();
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
export const getState = (key: string): unknown => stateManagerInstance.getState(key);
export const setState = (key: string, value: unknown, persist = false): void => stateManagerInstance.setState(key, value, persist);
export const setActiveCommunitiesState = (communities: string[], persist = false): void => {
  const normalized = normalizeCommunityIds(communities);
  stateManagerInstance.setState('ui.activeCommunities', normalized, persist);
  stateManagerInstance.setState('activeCommunities', normalized, persist);
};



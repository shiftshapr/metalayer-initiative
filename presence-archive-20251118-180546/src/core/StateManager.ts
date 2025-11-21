/**
 * STATEMANAGER - Centralized State Management
 * TypeScript + ES6 Module
 */

import { StateData, StateManager as IStateManager, Message, User, VisibilityData } from '../types/index.js';

// Type for generic state values
export type StateValue = string | number | boolean | object | null | undefined;

// History entry type
interface HistoryEntry {
  timestamp: number;
  path: string;
  oldValue: StateValue;
  newValue: StateValue;
}

interface StateStructure {
  chat: {
    data: Message[];
    lastLoadedUri: string | null;
    focusedMessage: Message | null;
    previousView: string | null;
    lastMessageCount: number;
    lastMessageId: string | null;
    isPolling: boolean;
  };
  avatars: {
    user: {
      current: User | null;
      customColor: string | null;
      defaultColor: string | null;
    };
    visibility: VisibilityData[];
    message: Message[];
    combined: Array<Message | VisibilityData>;
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
    pendingMessages: Message[];
    retryCount: number;
  };
  api: {
    baseUrl: string;
    isOnline: boolean;
    lastRequestTime: string | null;
    requestCount: number;
    errorCount: number;
  };
  extension: {
    build: string;
    reloadTimestamp: string | null;
    isInitialized: boolean;
    version: string;
  };
}

class StateManager implements IStateManager {
  private state: StateStructure;
  private subscribers: Map<string, Set<Function>>;
  private history: HistoryEntry[];
  private maxHistorySize: number = 100;

  constructor() {
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
  async initialize(initialState?: StateData): Promise<void> {
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
  async get<T = StateValue>(key: string): Promise<T | undefined> {
    const keys = key.split('.');
    let value: StateValue = this.state;
    
    for (const k of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === 'object' && k in value) {
        value = (value as Record<string, StateValue>)[k];
      } else {
        return undefined;
      }
    }
    
    return value as T | undefined;
  }

  /**
   * Set state value by key (dot notation supported)
   */
  async set(key: string, value: StateValue): Promise<void> {
    this.setState(key, value);
  }

  /**
   * Get all state
   */
  async getAll(): Promise<StateData> {
    return { ...this.state } as StateData;
  }

  /**
   * Get state value by path (synchronous version for compatibility)
   */
  getState<T = StateValue>(path: string): T | undefined {
    const keys = path.split('.');
    let current: StateValue = this.state;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, StateValue>)[key];
      } else {
        return undefined;
      }
    }
    
    return current as T | undefined;
  }

  /**
   * Set state value by path (synchronous version for compatibility)
   */
  setState(path: string, value: StateValue, persist: boolean = false): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current: Record<string, StateValue> = this.state as unknown as Record<string, StateValue>;
    
    // Navigate to parent object
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, StateValue>;
    }
    
    // Store old value for history
    const oldValue: StateValue = current[lastKey];
    
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
  subscribe(path: string, callback: (newValue: StateValue, oldValue: StateValue, path: string) => void): () => void {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    
    this.subscribers.get(path)!.add(callback);
    
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
  private async persistState(path: string, value: StateValue): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
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
      console.error('❌ StateManager: Failed to persist state:', error);
    }
  }

  /**
   * Merge state object
   */
  private mergeState(newState: StateData): void {
    this.state = { ...this.state, ...newState } as StateStructure;
  }

  /**
   * Load persisted state from Chrome storage
   */
  private async loadPersistedState(): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      return;
    }

    try {
      const result = await new Promise<Record<string, StateData>>((resolve) => {
        chrome.storage.local.get(['stateManager'], (data) => {
          resolve(data as Record<string, StateData>);
        });
      });

      if (result.stateManager) {
        this.mergeState(result.stateManager);
        console.log('✅ StateManager: Persisted state loaded');
      }
    } catch (error) {
      console.error('❌ StateManager: Failed to load persisted state:', error);
    }
  }

  /**
   * Notify subscribers of state changes
   */
  private notifySubscribers(path: string, newValue: StateValue, oldValue: StateValue): void {
    const pathSubscribers = this.subscribers.get(path);
    if (pathSubscribers) {
      pathSubscribers.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
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
        } catch (error) {
          console.error('❌ StateManager: Wildcard subscriber error:', error);
        }
      });
    }
  }

  /**
   * Add to history
   */
  private addToHistory(path: string, oldValue: StateValue, newValue: StateValue): void {
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
  getHistory(path?: string): HistoryEntry[] {
    if (path) {
      return this.history.filter(entry => entry.path.startsWith(path));
    }
    return [...this.history];
  }

  /**
   * Get state snapshot for debugging
   */
  getSnapshot(): { state: StateStructure; subscribers: string[]; historySize: number; timestamp: number } {
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
  resetState(path?: string): void {
    if (path) {
      // Reset specific path to initial value
      const keys = path.split('.');
      const lastKey = keys.pop()!;
      let current: Record<string, StateValue> = this.state as unknown as Record<string, StateValue>;
      
      for (const key of keys) {
        if (!(key in current)) {
          return;
        }
        current = current[key] as Record<string, StateValue>;
      }
      
      // Get initial state for this path
      const initialState = this.getInitialState();
      let initialValue: Record<string, StateValue> = initialState as unknown as Record<string, StateValue>;
      for (const key of keys) {
        initialValue = initialValue[key] as Record<string, StateValue>;
      }
      
      current[lastKey] = initialValue[lastKey];
    } else {
      // Reset all state
      this.state = this.getInitialState();
    }
  }

  /**
   * Get initial state structure
   */
  private getInitialState(): StateStructure {
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
  cleanup(): void {
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
export const getState = <T = StateValue>(key: string): T | undefined => stateManagerInstance.getState<T>(key);
export const setState = (key: string, value: StateValue, persist: boolean = false): void => 
  stateManagerInstance.setState(key, value, persist);


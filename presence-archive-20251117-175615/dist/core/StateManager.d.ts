/**
 * STATEMANAGER - Centralized State Management
 * TypeScript + ES6 Module
 */
import { StateData, StateManager as IStateManager } from '../types/index.js';
declare class StateManager implements IStateManager {
    private state;
    private subscribers;
    private history;
    private maxHistorySize;
    constructor();
    /**
     * Initialize the state manager
     */
    initialize(initialState?: StateData): Promise<void>;
    /**
     * Get state value by key (dot notation supported)
     */
    get(key: string): Promise<any>;
    /**
     * Set state value by key (dot notation supported)
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Get all state
     */
    getAll(): Promise<StateData>;
    /**
     * Get state value by path (synchronous version for compatibility)
     */
    getState(path: string): any;
    /**
     * Set state value by path (synchronous version for compatibility)
     */
    setState(path: string, value: any, persist?: boolean): void;
    /**
     * Subscribe to state changes
     */
    subscribe(path: string, callback: (newValue: any, oldValue: any, path: string) => void): () => void;
    /**
     * Persist state to Chrome storage
     */
    private persistState;
    /**
     * Merge state object
     */
    private mergeState;
    /**
     * Load persisted state from Chrome storage
     */
    private loadPersistedState;
    /**
     * Notify subscribers of state changes
     */
    private notifySubscribers;
    /**
     * Add to history
     */
    private addToHistory;
    /**
     * Get state change history
     */
    getHistory(path?: string): any[];
    /**
     * Get state snapshot for debugging
     */
    getSnapshot(): any;
    /**
     * Reset state to initial values
     */
    resetState(path?: string): void;
    /**
     * Get initial state structure
     */
    private getInitialState;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
declare const stateManagerInstance: StateManager;
export { stateManagerInstance };
export { StateManager };
export default StateManager;
export declare const getState: (key: string) => any;
export declare const setState: (key: string, value: any, persist?: boolean) => void;
//# sourceMappingURL=StateManager.d.ts.map
/**
 * STATEMANAGER - Centralized State Management
 * TypeScript + ES6 Module
 */
import type { StateData, StateManager as IStateManager } from '../types/index.js';
declare class StateManager implements IStateManager {
    private state;
    private subscribers;
    private history;
    private maxHistorySize;
    constructor();
    initialize(initialState?: StateData): Promise<void>;
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<void>;
    getAll(): Promise<StateData>;
    getState(path?: string): unknown;
    setState(path: string, value: unknown, persist?: boolean): void;
    subscribe(path: string, callback: (newValue: unknown, oldValue: unknown, path: string) => void): () => void;
    getHistory(path?: string): unknown[];
    getSnapshot(): unknown;
    resetState(path?: string): void;
    cleanup(): void;
    private persistState;
    private mergeState;
    private loadPersistedState;
    private notifySubscribers;
    private addToHistory;
    private getInitialState;
}
declare const stateManagerInstance: StateManager;
export { stateManagerInstance };
export { StateManager };
export default StateManager;
export declare const getState: (key: string) => unknown;
export declare const setState: (key: string, value: unknown, persist?: boolean) => void;
export declare const setActiveCommunitiesState: (communities: string[], persist?: boolean) => void;
//# sourceMappingURL=StateManager.d.ts.map
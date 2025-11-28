export default StateManager;
export function getState(key: any): {
    chat: {
        data: any[];
        lastLoadedUri: any;
        focusedMessage: any;
        previousView: any;
        lastMessageCount: number;
        lastMessageId: any;
        isPolling: boolean;
    };
    avatars: {
        user: {
            current: any;
            customColor: any;
            defaultColor: any;
        };
        visibility: any[];
        message: any[];
        combined: any[];
    };
    ui: {
        activeModal: any;
        debugMode: boolean;
        theme: string;
        activeCommunities: any[];
        primaryCommunity: any;
        currentCommunity: any;
    };
    sync: {
        isConnected: boolean;
        lastSyncTime: any;
        pendingMessages: any[];
        retryCount: number;
    };
    api: {
        baseUrl: string;
        isOnline: boolean;
        lastRequestTime: any;
        requestCount: number;
        errorCount: number;
    };
    extension: {
        build: string;
        reloadTimestamp: any;
        isInitialized: boolean;
        version: string;
    };
};
export function setState(key: any, value: any, persist?: boolean): void;
export const stateManagerInstance: StateManager;
/**
 * STATEMANAGER - Centralized State Management
 * TypeScript + ES6 Module
 */
export class StateManager {
    maxHistorySize: number;
    state: {
        chat: {
            data: any[];
            lastLoadedUri: any;
            focusedMessage: any;
            previousView: any;
            lastMessageCount: number;
            lastMessageId: any;
            isPolling: boolean;
        };
        avatars: {
            user: {
                current: any;
                customColor: any;
                defaultColor: any;
            };
            visibility: any[];
            message: any[];
            combined: any[];
        };
        ui: {
            activeModal: any;
            debugMode: boolean;
            theme: string;
            activeCommunities: any[];
            primaryCommunity: any;
            currentCommunity: any;
        };
        sync: {
            isConnected: boolean;
            lastSyncTime: any;
            pendingMessages: any[];
            retryCount: number;
        };
        api: {
            baseUrl: string;
            isOnline: boolean;
            lastRequestTime: any;
            requestCount: number;
            errorCount: number;
        };
        extension: {
            build: string;
            reloadTimestamp: any;
            isInitialized: boolean;
            version: string;
        };
    };
    subscribers: Map<any, any>;
    history: any[];
    initialize(initialState: any): Promise<void>;
    get(key: any): Promise<{
        chat: {
            data: any[];
            lastLoadedUri: any;
            focusedMessage: any;
            previousView: any;
            lastMessageCount: number;
            lastMessageId: any;
            isPolling: boolean;
        };
        avatars: {
            user: {
                current: any;
                customColor: any;
                defaultColor: any;
            };
            visibility: any[];
            message: any[];
            combined: any[];
        };
        ui: {
            activeModal: any;
            debugMode: boolean;
            theme: string;
            activeCommunities: any[];
            primaryCommunity: any;
            currentCommunity: any;
        };
        sync: {
            isConnected: boolean;
            lastSyncTime: any;
            pendingMessages: any[];
            retryCount: number;
        };
        api: {
            baseUrl: string;
            isOnline: boolean;
            lastRequestTime: any;
            requestCount: number;
            errorCount: number;
        };
        extension: {
            build: string;
            reloadTimestamp: any;
            isInitialized: boolean;
            version: string;
        };
    }>;
    set(key: any, value: any): Promise<void>;
    getAll(): Promise<{
        chat: {
            data: any[];
            lastLoadedUri: any;
            focusedMessage: any;
            previousView: any;
            lastMessageCount: number;
            lastMessageId: any;
            isPolling: boolean;
        };
        avatars: {
            user: {
                current: any;
                customColor: any;
                defaultColor: any;
            };
            visibility: any[];
            message: any[];
            combined: any[];
        };
        ui: {
            activeModal: any;
            debugMode: boolean;
            theme: string;
            activeCommunities: any[];
            primaryCommunity: any;
            currentCommunity: any;
        };
        sync: {
            isConnected: boolean;
            lastSyncTime: any;
            pendingMessages: any[];
            retryCount: number;
        };
        api: {
            baseUrl: string;
            isOnline: boolean;
            lastRequestTime: any;
            requestCount: number;
            errorCount: number;
        };
        extension: {
            build: string;
            reloadTimestamp: any;
            isInitialized: boolean;
            version: string;
        };
    }>;
    getState(path: any): {
        chat: {
            data: any[];
            lastLoadedUri: any;
            focusedMessage: any;
            previousView: any;
            lastMessageCount: number;
            lastMessageId: any;
            isPolling: boolean;
        };
        avatars: {
            user: {
                current: any;
                customColor: any;
                defaultColor: any;
            };
            visibility: any[];
            message: any[];
            combined: any[];
        };
        ui: {
            activeModal: any;
            debugMode: boolean;
            theme: string;
            activeCommunities: any[];
            primaryCommunity: any;
            currentCommunity: any;
        };
        sync: {
            isConnected: boolean;
            lastSyncTime: any;
            pendingMessages: any[];
            retryCount: number;
        };
        api: {
            baseUrl: string;
            isOnline: boolean;
            lastRequestTime: any;
            requestCount: number;
            errorCount: number;
        };
        extension: {
            build: string;
            reloadTimestamp: any;
            isInitialized: boolean;
            version: string;
        };
    };
    setState(path: any, value: any, persist?: boolean): void;
    subscribe(path: any, callback: any): () => void;
    getHistory(path: any): any[];
    getSnapshot(): {
        state: {
            chat: {
                data: any[];
                lastLoadedUri: any;
                focusedMessage: any;
                previousView: any;
                lastMessageCount: number;
                lastMessageId: any;
                isPolling: boolean;
            };
            avatars: {
                user: {
                    current: any;
                    customColor: any;
                    defaultColor: any;
                };
                visibility: any[];
                message: any[];
                combined: any[];
            };
            ui: {
                activeModal: any;
                debugMode: boolean;
                theme: string;
                activeCommunities: any[];
                primaryCommunity: any;
                currentCommunity: any;
            };
            sync: {
                isConnected: boolean;
                lastSyncTime: any;
                pendingMessages: any[];
                retryCount: number;
            };
            api: {
                baseUrl: string;
                isOnline: boolean;
                lastRequestTime: any;
                requestCount: number;
                errorCount: number;
            };
            extension: {
                build: string;
                reloadTimestamp: any;
                isInitialized: boolean;
                version: string;
            };
        };
        historySize: number;
        subscriberCount: any;
    };
    resetState(path: any): void;
    cleanup(): void;
    persistState(path: any, value: any): Promise<void>;
    mergeState(newState: any): void;
    loadPersistedState(): Promise<void>;
    notifySubscribers(path: any, newValue: any, oldValue: any): void;
    addToHistory(path: any, oldValue: any, newValue: any): void;
    getInitialState(): {
        chat: {
            data: any[];
            lastLoadedUri: any;
            focusedMessage: any;
            previousView: any;
            lastMessageCount: number;
            lastMessageId: any;
            isPolling: boolean;
        };
        avatars: {
            user: {
                current: any;
                customColor: any;
                defaultColor: any;
            };
            visibility: any[];
            message: any[];
            combined: any[];
        };
        ui: {
            activeModal: any;
            debugMode: boolean;
            theme: string;
            activeCommunities: any[];
            primaryCommunity: any;
            currentCommunity: any;
        };
        sync: {
            isConnected: boolean;
            lastSyncTime: any;
            pendingMessages: any[];
            retryCount: number;
        };
        api: {
            baseUrl: string;
            isOnline: boolean;
            lastRequestTime: any;
            requestCount: number;
            errorCount: number;
        };
        extension: {
            build: string;
            reloadTimestamp: any;
            isInitialized: boolean;
            version: string;
        };
    };
}
//# sourceMappingURL=StateManager.d.ts.map
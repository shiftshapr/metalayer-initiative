import type { ModuleGraph } from '../types.js';
import type { User } from '../../types/index.js';
interface BootControllerOptions {
    realtimeController: {
        startForCurrentPage: () => void;
        handleAuthenticatedUser: (user: User) => Promise<void>;
        [key: string]: unknown;
    };
    loadChatHistory: (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    refreshVisibility: (pageId: string | null) => Promise<void>;
    initializeTheme: () => Promise<void>;
    setupTabNavigation: () => void;
    setupMessageInputEventListeners: () => void;
    messageLoadingService?: {
        loadMessages: (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    };
    [key: string]: unknown;
}
export declare class BootController {
    private graph;
    private options;
    constructor(graph: ModuleGraph, options: BootControllerOptions);
    initialize(): Promise<void>;
    exposeCompatibilityAPI(): void;
    initializeState(): Promise<void>;
    registerLifecycle(): void;
    initializeAuthFlow(): Promise<void>;
    handleUserChange(user: User | null): Promise<void>;
    ensureCommunitiesInitialized(): Promise<void>;
    /**
     * Wait for TabManager to initialize
     * Ensures tab state is set before message loading
     * @deprecated Not currently used but kept for potential future use
     */
    private _waitForTabManager;
    setupEventBridges(): void;
    handlePendingContent(): Promise<void>;
    migrateFromChromeStorage(): Promise<void>;
    safeInitializeTheme(): Promise<void>;
    /**
     * Get the currently active sidepanel tab
     * @returns Tab ID string or null if not found
     * @deprecated Use getActiveSidepanelTab from utils/getActiveSidepanelTab.js instead
     */
    private _getActiveSidepanelTab;
}
export {};
//# sourceMappingURL=BootController.d.ts.map
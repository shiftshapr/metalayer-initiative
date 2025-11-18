import type { ModuleGraph, SidepanelController, VisibilityRefreshFn } from '../types.js';
import type { RealtimeController } from './RealtimeController.js';
interface BootControllerOptions {
    realtimeController: RealtimeController;
    loadChatHistory: (rawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    setupTabNavigation: () => void;
    setupMessageInputEventListeners: () => void;
    initializeTheme: () => Promise<void>;
    refreshVisibility: VisibilityRefreshFn;
}
export declare class BootController implements SidepanelController {
    private readonly graph;
    private readonly options;
    private currentUser;
    constructor(graph: ModuleGraph, options: BootControllerOptions);
    initialize(): Promise<void>;
    exposeCompatibilityAPI(): void;
    private initializeState;
    private registerLifecycle;
    private initializeAuthFlow;
    private handleUserChange;
    private ensureCommunitiesInitialized;
    private setupEventBridges;
    private handlePendingContent;
    private migrateFromChromeStorage;
    private safeInitializeTheme;
}
export {};
//# sourceMappingURL=BootController.d.ts.map
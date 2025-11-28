import type { ModuleGraph } from '../types.js';
interface NormalizedUrlData {
    pageId?: string;
    rawUrl?: string;
    normalizedUrl?: string;
    canonicalUrl?: string;
}
type VisibilityRefreshFn = (pageId?: string) => Promise<void>;
interface SidepanelController {
    initialize: () => Promise<void>;
    dispose: () => void;
}
interface RealtimeController {
    handlePageChange?: (data: NormalizedUrlData) => Promise<void>;
    [key: string]: unknown;
}
interface TabControllerOptions {
    graph: ModuleGraph;
    realtimeController: RealtimeController;
    loadChatHistory: (rawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    refreshVisibility: VisibilityRefreshFn;
    messageLoadingService?: {
        loadMessages: (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    };
}
export declare class TabController implements SidepanelController {
    private readonly options;
    private readonly onUpdated;
    private readonly onActivated;
    private initialized;
    constructor(options: TabControllerOptions);
    initialize(): Promise<void>;
    /**
     * Wait for TabManager to be initialized using event-based coordination
     * BEST PRACTICE: Use events instead of setTimeout delays
     */
    private waitForTabManager;
    dispose(): void;
    private getTabsApi;
    private handleTabUpdated;
    private handleTabActivated;
    private captureActiveTab;
    private processUrl;
    /**
     * Ensure communities are initialized before processing URLs
     * Prevents race condition where TabController processes URL before communities are ready
     * BEST PRACTICE: Uses waitForCondition instead of setTimeout delays
     */
    private ensureCommunitiesReady;
    /**
     * Get the currently active sidepanel tab
     * @returns Tab ID string or null if not found
     * @deprecated Use getActiveSidepanelTab from utils/getActiveSidepanelTab.js instead
     */
    private getActiveSidepanelTab;
    private normalizeUrl;
    private persistCurrentUrl;
    private queryTabs;
}
export {};
//# sourceMappingURL=TabController.d.ts.map
import type { ModuleGraph, SidepanelController, VisibilityRefreshFn } from '../types.js';
import type { RealtimeController } from './RealtimeController.js';
interface TabControllerOptions {
    graph: ModuleGraph;
    realtimeController: RealtimeController;
    loadChatHistory: (rawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    refreshVisibility: VisibilityRefreshFn;
}
export declare class TabController implements SidepanelController {
    private readonly options;
    private readonly onUpdated;
    private readonly onActivated;
    private initialized;
    constructor(options: TabControllerOptions);
    initialize(): Promise<void>;
    dispose(): void;
    private getTabsApi;
    private handleTabUpdated;
    private handleTabActivated;
    private captureActiveTab;
    private processUrl;
    private normalizeUrl;
    private persistCurrentUrl;
    private queryTabs;
}
export {};
//# sourceMappingURL=TabController.d.ts.map
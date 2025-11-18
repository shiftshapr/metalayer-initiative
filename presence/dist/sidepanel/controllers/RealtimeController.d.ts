import type { ModuleGraph, NormalizedUrlData, SidepanelController, AuthenticatedUser } from '../types.js';
export declare class RealtimeController implements SidepanelController {
    private readonly graph;
    private initialized;
    constructor(graph: ModuleGraph);
    initialize(): Promise<void>;
    handleAuthenticatedUser(user: AuthenticatedUser): Promise<void>;
    handlePageChange(urlData: NormalizedUrlData): Promise<void>;
    startForCurrentPage(): Promise<void>;
    private ensureRealtimeClient;
    private getRealtimeClient;
}
//# sourceMappingURL=RealtimeController.d.ts.map
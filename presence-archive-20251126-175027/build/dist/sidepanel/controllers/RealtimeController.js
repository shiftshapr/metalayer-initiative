export class RealtimeController {
    constructor(graph) {
        this.graph = graph;
        this.initialized = false;
    }
    async initialize() {
        try {
            await this.graph.supabaseService.initialize();
        }
        catch (error) {
            this.graph.logger.error?.('REALTIME_SUPABASE_INIT', { error });
        }
        await this.ensureRealtimeClient();
        this.initialized = true;
    }
    async handleAuthenticatedUser(user) {
        if (!user)
            return;
        const realtimeClient = this.getRealtimeClient();
        if (!realtimeClient?.setCurrentUser)
            return;
        try {
            await realtimeClient.setCurrentUser(user.id ?? user.email ?? null, user?.communityId ?? 'comm-001');
        }
        catch (error) {
            this.graph.logger.warn?.('REALTIME_SET_USER', { error });
        }
    }
    async handlePageChange(urlData) {
        if (!urlData.pageId)
            return;
        const realtimeClient = this.getRealtimeClient();
        if (!realtimeClient?.joinPage)
            return;
        try {
            await realtimeClient.joinPage(urlData.pageId, urlData.normalizedUrl ?? urlData.rawUrl ?? '');
        }
        catch (error) {
            this.graph.logger.warn?.('REALTIME_JOIN_PAGE', { error });
        }
    }
    async startForCurrentPage() {
        const currentUrlData = await this.graph.stateManager.get('currentUrlData');
        if (currentUrlData) {
            await this.handlePageChange(currentUrlData);
        }
    }
    async ensureRealtimeClient() {
        const realtimeWindow = window;
        if (typeof realtimeWindow.initializeSupabaseRealtimeClient === 'function') {
            try {
                await realtimeWindow.initializeSupabaseRealtimeClient();
            }
            catch (error) {
                this.graph.logger.warn?.('REALTIME_CLIENT_INIT', { error });
            }
        }
    }
    getRealtimeClient() {
        const realtimeWindow = window;
        return realtimeWindow.supabaseRealtimeClient ?? null;
    }
}

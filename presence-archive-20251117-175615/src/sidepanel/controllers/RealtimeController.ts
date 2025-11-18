import type { ModuleGraph, NormalizedUrlData, SidepanelController, AuthenticatedUser } from '../types.js';

type RealtimeWindow = Window & {
  initializeSupabaseRealtimeClient?: () => Promise<void>;
  supabaseRealtimeClient?: {
    setCurrentUser?: (userId: string | null, communityId?: string) => Promise<void>;
    joinPage?: (pageId: string, url: string) => Promise<void>;
  };
};

export class RealtimeController implements SidepanelController {
  private initialized = false;

  constructor(private readonly graph: ModuleGraph) {}

  async initialize(): Promise<void> {
    try {
      await this.graph.supabaseService.initialize();
    } catch (error) {
      this.graph.logger.error?.('REALTIME_SUPABASE_INIT', { error });
    }

    await this.ensureRealtimeClient();
    this.initialized = true;
  }

  async handleAuthenticatedUser(user: AuthenticatedUser): Promise<void> {
    if (!user) return;
    const realtimeClient = this.getRealtimeClient();
    if (!realtimeClient?.setCurrentUser) return;
    try {
      await realtimeClient.setCurrentUser(user.id ?? user.email ?? null, (user as any)?.communityId ?? 'comm-001');
    } catch (error) {
      this.graph.logger.warn?.('REALTIME_SET_USER', { error });
    }
  }

  async handlePageChange(urlData: NormalizedUrlData): Promise<void> {
    if (!urlData.pageId) return;
    const realtimeClient = this.getRealtimeClient();
    if (!realtimeClient?.joinPage) return;
    try {
      await realtimeClient.joinPage(urlData.pageId, urlData.normalizedUrl ?? urlData.rawUrl ?? '');
    } catch (error) {
      this.graph.logger.warn?.('REALTIME_JOIN_PAGE', { error });
    }
  }

  async startForCurrentPage(): Promise<void> {
    const currentUrlData = await this.graph.stateManager.get('currentUrlData') as NormalizedUrlData | undefined;
    if (currentUrlData) {
      await this.handlePageChange(currentUrlData);
    }
  }

  private async ensureRealtimeClient(): Promise<void> {
    const realtimeWindow = window as RealtimeWindow;
    if (typeof realtimeWindow.initializeSupabaseRealtimeClient === 'function') {
      try {
        await realtimeWindow.initializeSupabaseRealtimeClient();
      } catch (error) {
        this.graph.logger.warn?.('REALTIME_CLIENT_INIT', { error });
      }
    }
  }

  private getRealtimeClient(): RealtimeWindow['supabaseRealtimeClient'] | null {
    const realtimeWindow = window as RealtimeWindow;
    return realtimeWindow.supabaseRealtimeClient ?? null;
  }
}


import type { ModuleGraph, NormalizedUrlData, SidepanelController, AuthenticatedUser, VisibilityRefreshFn } from '../types.js';
import type { StateValue } from '../../core/StateManager.js';
import type { RealtimeController } from './RealtimeController.js';

interface BootControllerOptions {
  realtimeController: RealtimeController;
  loadChatHistory: (rawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  setupTabNavigation: () => void;
  setupMessageInputEventListeners: () => void;
  initializeTheme: () => Promise<void>;
  refreshVisibility: VisibilityRefreshFn;
}

type BootWindow = Window & {
  handlePendingContent?: () => Promise<void>;
  startPresenceTracking?: () => Promise<void>;
  migrateFromChromeStorage?: () => Promise<void>;
  currentUser?: AuthenticatedUser;
  AVATAR_FALLBACK_COLOR?: string;
  updateUI?: (user: AuthenticatedUser) => Promise<void> | void;
};

const INITIAL_COMMUNITY = 'comm-001';

export class BootController implements SidepanelController {
  private currentUser: AuthenticatedUser = null;

  constructor(
    private readonly graph: ModuleGraph,
    private readonly options: BootControllerOptions
  ) {}

  async initialize(): Promise<void> {
    await this.initializeState();
    this.registerLifecycle();
    await this.initializeAuthFlow();
    await this.safeInitializeTheme();
    this.setupEventBridges();
    this.exposeCompatibilityAPI();
  }

  exposeCompatibilityAPI(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const bootWin = window as BootWindow;
    bootWin.handlePendingContent = () => this.handlePendingContent();
    bootWin.startPresenceTracking = () => this.options.realtimeController.startForCurrentPage();
    bootWin.migrateFromChromeStorage = () => this.migrateFromChromeStorage();
  }

  private async initializeState(): Promise<void> {
    try {
      const isInitialized = await this.graph.stateManager.get('extension.isInitialized');
      if (isInitialized) {
        return;
      }

      await this.graph.stateManager.initialize({
        userAvatarBgColor: (window as BootWindow)?.AVATAR_FALLBACK_COLOR ?? '#7C3AED',
        googleUser: null,
        supabaseUser: null,
        metalayerUser: null,
        activeCommunities: [INITIAL_COMMUNITY],
        primaryCommunity: INITIAL_COMMUNITY,
        currentCommunity: INITIAL_COMMUNITY,
        communities: [],
        theme: 'auto',
        debugMode: false,
        customAvatarColor: null,
        lastMessageId: null,
        lastLoadedUri: null,
        currentUri: null,
        presenceData: null,
        chatData: [],
        currentUrlData: null,
        extension: {
          isInitialized: true
        }
      });
    } catch (error) {
      this.graph.logger.error?.('STATE_INIT', { error });
    }
  }

  private registerLifecycle(): void {
    const lifecycle = this.graph.lifecycleManager;
    if (!lifecycle) {
      return;
    }

    lifecycle.register('sidepanel', {
      init: () => true,
      destroy: () => true
    }, {
      dependencies: ['StateManager'],
      autoInitialize: true
    });

    lifecycle.register('chat', {
      initialize: () => true,
      destroy: () => true
    }, {
      dependencies: ['sidepanel'],
      autoInitialize: true
    });
  }

  private async initializeAuthFlow(): Promise<void> {
    try {
      await this.graph.authManager.initialize();
    } catch (error) {
      this.graph.logger.error?.('AUTH_INIT', { error });
    }

    this.graph.authManager.onAuthStateChange(async (user) => {
      await this.handleUserChange(user);
    });

    const initialUser = this.graph.authManager.getCurrentUser();
    await this.handleUserChange(initialUser);
  }

  private async handleUserChange(user: AuthenticatedUser): Promise<void> {
    this.currentUser = user ?? null;
    (window as BootWindow).currentUser = this.currentUser ?? undefined;
    await this.graph.stateManager.setState('currentUser', user ?? null);

    if (!user) {
      return;
    }

    const bootWin = window as BootWindow;
    if (bootWin.updateUI) {
      await bootWin.updateUI(user);
    }

    await this.ensureCommunitiesInitialized();
    await this.options.loadChatHistory();
    const urlData = await this.graph.stateManager.get('currentUrlData') as NormalizedUrlData | undefined;
    await this.options.refreshVisibility(urlData?.pageId ?? null);
    await this.handlePendingContent();
    await this.options.realtimeController.handleAuthenticatedUser(user);
    this.options.setupTabNavigation();
    this.options.setupMessageInputEventListeners();
  }

  private async ensureCommunitiesInitialized(): Promise<void> {
    try {
      await this.graph.communitiesModule.initialize();
    } catch (error) {
      this.graph.logger.warn?.('COMMUNITIES_INIT', { error });
    }
  }

  private setupEventBridges(): void {
    this.graph.eventBus.on('avatar:colorChanged', async (payload: { color?: string }) => {
      if (!payload?.color) {
        return;
      }
      await this.graph.stateManager.setState('avatars.user.customColor', payload.color, true);
    });
  }

  private async handlePendingContent(): Promise<void> {
    try {
      const messageContent = await this.graph.stateManager.get('pendingMessageContent');
      const visibilityContent = await this.graph.stateManager.get('pendingVisibilityContent');

      if (messageContent) {
        const textarea = document.getElementById('chat-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
          textarea.value = `Commenting on: \"${messageContent}\"`;
          textarea.focus();
          (window as Window & { autoResize?: (textarea: HTMLTextAreaElement) => void })?.autoResize?.(textarea);
        }

        await this.graph.stateManager.setState('pendingMessageContent', null);
        await this.graph.stateManager.setState('pendingMessageUri', null);
      }

      if (visibilityContent) {
        (window as Window & { showNotification?: (message: string, options?: any) => void })?.showNotification?.('Visibility anchoring feature coming soon!');
        await this.graph.stateManager.setState('pendingVisibilityContent', null);
        await this.graph.stateManager.setState('pendingVisibilityUri', null);
      }
    } catch (error) {
      this.graph.logger.warn?.('PENDING_CONTENT', { error });
    }
  }

  private async migrateFromChromeStorage(): Promise<void> {
    try {
      const keys = [
        'userAvatarBgColor',
        'googleUser',
        'supabaseUser',
        'metalayerUser',
        'activeCommunities',
        'primaryCommunity',
        'currentCommunity',
        'communities',
        'theme',
        'debugMode',
        'customAvatarColor',
        'pendingMessageContent',
        'pendingMessageUri',
        'pendingVisibilityContent',
        'pendingVisibilityUri'
      ];

      for (const key of keys) {
        const value = await this.graph.stateManager.get(key);
        if (value !== undefined) {
          await this.graph.stateManager.setState(key, value as StateValue);
        }
      }
    } catch (error) {
      this.graph.logger.error?.('MIGRATION', { error });
    }
  }

  private async safeInitializeTheme(): Promise<void> {
    try {
      await this.options.initializeTheme();
    } catch (error) {
      this.graph.logger.warn?.('THEME_INIT', { error });
    }
  }
}



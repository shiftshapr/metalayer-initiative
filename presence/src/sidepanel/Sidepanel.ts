import { buildModuleGraph } from './buildGraph.js';
import type { ModuleGraph } from './types.js';
import { BootController } from './controllers/BootController.js';
import { TabController } from './controllers/TabController.js';
import { exposeModuleGraph, getSidepanelWindow } from './windowInjections.js';
import { Logger } from '../utils/Logger.js';
import { waitForCondition } from '../utils/AsyncCoordination.js';

type TabControllerDependencies = ConstructorParameters<typeof TabController>[0];
type BootControllerDependencies = ConstructorParameters<typeof BootController>[1];

type RealtimeControllerTarget = TabControllerDependencies['realtimeController'] &
  BootControllerDependencies['realtimeController'] & {
    initialize?: () => Promise<void>;
  };
type RefreshVisibilityTarget = BootControllerDependencies['refreshVisibility'] &
  ((pageId?: string | null) => Promise<void>);

type RealtimeControllerConstructor = new (graph: ModuleGraph) => RealtimeControllerTarget;

type VisibilityRefresherFactory = (graph: ModuleGraph) => RefreshVisibilityTarget;

// TODO: RealtimeController and visibility helpers need to be migrated to src/
// Provide typed placeholders until migration completes.
const getRealtimeControllerCtor = (): RealtimeControllerConstructor | undefined => undefined;

/**
 * Get visibility refresher factory
 * CRITICAL FIX: Returns actual refreshVisibility function that calls VisibilityManager
 */
const getVisibilityRefresherFactory = (): VisibilityRefresherFactory | undefined => {
  return (graph: ModuleGraph): RefreshVisibilityTarget => {
    return async (pageId?: string | null): Promise<void> => {
      try {
        // Get pageId from parameter or state
        let targetPageId = pageId;
        if (!targetPageId) {
          const currentUrlData = graph.stateManager.getState('currentUrlData') as {
            pageId?: string;
          } | null;
          targetPageId = currentUrlData?.pageId || null;
        }

        if (!targetPageId) {
          graph.logger?.warn?.('refreshVisibility: No pageId available', null, 'visibility');
          return;
        }

        // Call VisibilityManager.refreshVisibilityAvatars
        if (
          graph.visibilityManager &&
          typeof graph.visibilityManager.refreshVisibilityAvatars === 'function'
        ) {
          graph.logger?.debug?.(
            'refreshVisibility: Calling VisibilityManager.refreshVisibilityAvatars',
            { pageId: targetPageId },
            'visibility'
          );
          await graph.visibilityManager.refreshVisibilityAvatars(targetPageId);
        } else {
          graph.logger?.warn?.(
            'refreshVisibility: VisibilityManager not available',
            null,
            'visibility'
          );
        }
      } catch (error: unknown) {
        graph.logger?.error?.(
          'refreshVisibility: Error refreshing visibility',
          error,
          'visibility'
        );
      }
    };
  };
};
import { loadChatHistory } from '../features/MessagesModule.js';
// UIManager is optional - will be loaded dynamically if needed
type SetupTabNavigationFn = () => void | Promise<void>;
type SetupMessageInputEventListenersFn = () => void | Promise<void>;
type InitializeThemeFn = () => Promise<void>;

let setupTabNavigation: SetupTabNavigationFn | undefined;
let setupMessageInputEventListeners: SetupMessageInputEventListenersFn | undefined;
let initializeTheme: InitializeThemeFn | undefined;

// UIManager is optional - functions will be loaded dynamically when needed
// Using Promise-based import to avoid top-level await and module resolution issues
if (typeof window !== 'undefined') {
  // Use a helper function to safely import UIManager
  const loadUIManager = async (): Promise<void> => {
    try {
      // @ts-expect-error - UIManager may not exist, this is intentional
      const uiModule = await import('../features/UIManager.js');
      setupTabNavigation = uiModule.setupTabNavigation;
      setupMessageInputEventListeners = uiModule.setupMessageInputEventListeners;
      initializeTheme = uiModule.initializeTheme;
    } catch {
      // UIManager not available - functions will remain undefined
    }
  };
  // Load asynchronously without blocking
  loadUIManager();
}

const legacyWindow = getSidepanelWindow();

if (legacyWindow.__CANOPI_SIDEPANEL_READY__) {
  console.warn('Canopi Sidepanel already initialized, skipping duplicate bootstrap.');
} else {
  legacyWindow.__DISABLE_LEGACY_SIDEPANEL__ = true;
  // Initialize async - buildModuleGraph is now async
  (async () => {
    try {
      const graph: ModuleGraph = await buildModuleGraph();

      // Expose graph to window for sidepanel.js access (temporary, for migration)
      exposeModuleGraph(graph);

      // TODO: RealtimeController and visibility helpers need to be migrated
      const ControllerCtor = getRealtimeControllerCtor();
      const fallbackRealtimeController: RealtimeControllerTarget = {
        startForCurrentPage: () => {},
        handleAuthenticatedUser: async () => {},
        initialize: async () => {},
      };
      const realtimeController: RealtimeControllerTarget = ControllerCtor
        ? new ControllerCtor(graph)
        : fallbackRealtimeController;
      const visibilityFactory = getVisibilityRefresherFactory();
      const refreshVisibility: RefreshVisibilityTarget = visibilityFactory
        ? visibilityFactory(graph)
        : async (_pageId?: string | null) => {};

      // Use MessageLoadingService if available, otherwise fallback to direct loadChatHistory
      const messageLoadingService = graph.messageLoadingService;

      // Wrap loadChatHistory to match expected signature
      // CRITICAL: Use shared URL resolution utility for consistent handling
      const loadChatHistoryWrapper = async (
        pageIdOrRawUrl?: string | null,
        activeCommunities?: string[]
      ): Promise<void> => {
        try {
          // Use shared URL resolution utility
          const { getMessagePageId } = await import('../utils/UrlResolution.js');
          const pageId = await getMessagePageId(pageIdOrRawUrl);

          if (pageId) {
            await loadChatHistory(pageId, activeCommunities);
          } else {
            graph.logger?.warn?.(
              'loadChatHistoryWrapper: No valid URL available',
              null,
              'sidepanel'
            );
          }
        } catch (error) {
          graph.logger?.error?.('loadChatHistoryWrapper: Error resolving URL', error, 'sidepanel');
        }
      };

      const tabController = new TabController({
        graph,
        realtimeController,
        loadChatHistory: loadChatHistoryWrapper,
        refreshVisibility,
        messageLoadingService: messageLoadingService
          ? { loadMessages: messageLoadingService.loadMessages }
          : undefined, // Use service if available
      });
      const bootController = new BootController(graph, {
        realtimeController,
        loadChatHistory: loadChatHistoryWrapper,
        setupTabNavigation: setupTabNavigation || (() => {}),
        setupMessageInputEventListeners: setupMessageInputEventListeners || (() => {}),
        initializeTheme: initializeTheme || (async () => {}),
        refreshVisibility,
        messageLoadingService: messageLoadingService
          ? { loadMessages: messageLoadingService.loadMessages }
          : undefined, // Use service if available
      });
      if (typeof realtimeController.initialize === 'function') {
        await realtimeController.initialize();
      }
      await bootController.initialize();
      await tabController.initialize();

      // CRITICAL: Listen for shared message highlight requests from background
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener(
          (
            request: { type?: string; messageId?: string },
            _sender: { tab?: { id?: number }; [key: string]: unknown },
            sendResponse: (response?: unknown) => void
          ) => {
            if (request.type === 'HIGHLIGHT_SHARED_MESSAGE' && request.messageId) {
              (async () => {
                try {
                  graph.logger?.debug?.(
                    'Sidepanel: Received HIGHLIGHT_SHARED_MESSAGE',
                    { messageId: request.messageId },
                    'sidepanel'
                  );

                  // Get active MessageFeed
                  const { getActiveMessageFeed } =
                    await import('../features/messages/MessageFeedIntegration.js');
                  
                  // Wait for MessageFeed to be available using proper async coordination
                  try {
                    await waitForCondition(
                      () => {
                        const feed = getActiveMessageFeed();
                        return feed !== null && feed !== undefined;
                      },
                      { timeout: 5000, interval: 100 }
                    );
                    
                    const activeFeed = getActiveMessageFeed();
                    if (activeFeed && request.messageId) {
                      // Enter focus mode for the shared message
                      await activeFeed.enterFocusMode(request.messageId, request.messageId);
                      graph.logger?.debug?.(
                        'Sidepanel: Entered focus mode for shared message',
                        { messageId: request.messageId },
                        'sidepanel'
                      );
                      sendResponse({ success: true });
                    } else {
                      graph.logger?.warn?.(
                        'Sidepanel: No active MessageFeed for shared message after waiting',
                        { messageId: request.messageId },
                        'sidepanel'
                      );
                      sendResponse({ success: false, error: 'No active feed' });
                    }
                  } catch (error) {
                    graph.logger?.warn?.(
                      'Sidepanel: Timeout waiting for MessageFeed',
                      { messageId: request.messageId, error },
                      'sidepanel'
                    );
                    sendResponse({ success: false, error: 'Timeout waiting for feed' });
                  }
                } catch (error) {
                  graph.logger?.error?.(
                    'Sidepanel: Error handling HIGHLIGHT_SHARED_MESSAGE',
                    error,
                    'sidepanel'
                  );
                  sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  });
                }
              })();
              return true; // Keep channel open for async response
            }
            return false; // Not handled
          }
        );
      }

      // CRITICAL: Expose loadChatHistory to window for tab change handlers and diagnostics
      if (typeof window !== 'undefined') {
        const win = window as Window & { [key: string]: unknown };

        win.loadChatHistory = loadChatHistoryWrapper;
        win.stateManager = graph.stateManager;
        win.stateManagerInstance = graph.stateManager;

        // CRITICAL FIX: Expose refreshVisibility to window for TabManager handler
        win.refreshVisibility = refreshVisibility;

        if (graph.visibilityManager) {
          // Expose VisibilityManager class and instance
          win.VisibilityManager = graph.visibilityManager.constructor as unknown;
          win.visibilityManager = graph.visibilityManager;
        }

        // Expose updateVisibleTab
        try {
          const visibilityTabRenderer =
            await import('../features/visibility/ui/VisibilityTabRenderer.js');
          if (visibilityTabRenderer.updateVisibleTab) {
            const winWithVisibility = win as Window & {
              updateVisibleTab?: typeof visibilityTabRenderer.updateVisibleTab;
            };
            winWithVisibility.updateVisibleTab = visibilityTabRenderer.updateVisibleTab;
          }
        } catch (error) {
          graph.logger?.warn?.('Failed to expose updateVisibleTab', error, 'sidepanel');
        }

        // Expose userPreferencesManager
        try {
          const userPreferencesModule = await import('../utils/UserPreferencesManager.js');
          if (userPreferencesModule.userPreferencesManager) {
            const winWithPreferences = win as Window & {
              userPreferencesManager?: typeof userPreferencesModule.userPreferencesManager;
            };
            winWithPreferences.userPreferencesManager = userPreferencesModule.userPreferencesManager;
          }
        } catch (error) {
          graph.logger?.warn?.('Failed to expose userPreferencesManager', error, 'sidepanel');
        }

        // NOTE: API and SupabaseService are available via module graph
        // Diagnostic scripts should use: window.__CANOPI_MODULE_GRAPH__.api
        // and window.__CANOPI_MODULE_GRAPH__.supabaseService
        // No direct window exposure needed - module graph is the access pattern

        // CRITICAL: Initialize UserHoverModal and expose to window
        try {
          const userHoverModalModule = await import('../features/UserHoverModal.js');
          if (userHoverModalModule.userHoverModal) {
            const winWithHover = win as Window & {
              userHoverModal?: typeof userHoverModalModule.userHoverModal;
            };
            winWithHover.userHoverModal = userHoverModalModule.userHoverModal;
            // Initialize the modal
            await userHoverModalModule.userHoverModal.initialize();
            Logger.debug(
              '✅ SIDEPANEL: UserHoverModal initialized and exposed to window',
              {
                hasShow: typeof userHoverModalModule.userHoverModal.show === 'function',
                hasInitialize: typeof userHoverModalModule.userHoverModal.initialize === 'function',
              },
              'sidepanel'
            );
          } else {
            const errorMsg = 'UserHoverModal module imported but instance not found';
            Logger.warn(`❌ SIDEPANEL: ${errorMsg}`, { module: userHoverModalModule }, 'sidepanel');
          }
        } catch (error) {
          const errorMsg = 'Failed to import UserHoverModal';
          Logger.warn(
            `❌ SIDEPANEL: ${errorMsg}`,
            error instanceof Error ? error : null,
            'sidepanel'
          );
        }

        // CRITICAL: Expose AvatarUtils to window
        try {
          const avatarUtilsModule = await import('../utils/AvatarUtils.js');
          const AvatarUtilsClass = avatarUtilsModule.AvatarUtils || avatarUtilsModule.default;
          if (AvatarUtilsClass) {
            const winWithAvatar = win as Window & {
              AvatarUtils?: typeof AvatarUtilsClass;
            };
            winWithAvatar.AvatarUtils = AvatarUtilsClass;
            Logger.debug(
              '✅ SIDEPANEL: AvatarUtils exposed to window',
              {
                hasCreateUnifiedAvatar: typeof AvatarUtilsClass.createUnifiedAvatar === 'function',
                type: typeof AvatarUtilsClass,
              },
              'sidepanel'
            );
          } else {
            const errorMsg = 'AvatarUtils module imported but class not found';
            Logger.warn(`❌ SIDEPANEL: ${errorMsg}`, { module: avatarUtilsModule }, 'sidepanel');
          }
        } catch (error) {
          const errorMsg = 'Failed to import AvatarUtils';
          Logger.warn(
            `❌ SIDEPANEL: ${errorMsg}`,
            error instanceof Error ? error : null,
            'sidepanel'
          );
        }

        // CRITICAL: Sync currentUrlData from stateManager to window for diagnostics
        const syncCurrentUrlData = (): void => {
          try {
            const urlData = graph.stateManager.getState('currentUrlData') as {
              pageId?: string;
              rawUrl?: string;
              [key: string]: unknown;
            } | null;
            if (urlData) {
              win.currentUrlData = urlData;
            } else {
              win.currentUrlData = undefined;
            }
          } catch (error) {
            graph.logger?.warn?.('Failed to sync currentUrlData', error, 'sidepanel');
          }
        };

        // Sync immediately
        syncCurrentUrlData();

        // Subscribe to state changes to keep window.currentUrlData in sync
        try {
          if (graph.stateManager.subscribe && typeof graph.stateManager.subscribe === 'function') {
            graph.stateManager.subscribe('currentUrlData', syncCurrentUrlData);
          } else {
            // If subscribe doesn't exist, poll every second
            setInterval(syncCurrentUrlData, 1000);
          }
        } catch (_error) {
          // If subscribe fails, poll every second
          setInterval(syncCurrentUrlData, 1000);
        }

        graph.logger?.debug?.(
          'Window APIs exposed for diagnostics',
          {
            hasStateManager: !!win.stateManager,
            hasVisibilityManager: !!win.visibilityManager,
            hasUpdateVisibleTab: !!win.updateVisibleTab,
            hasUserPreferencesManager: !!win.userPreferencesManager,
          },
          'sidepanel'
        );
      }

      legacyWindow.__CANOPI_SIDEPANEL_READY__ = true;
      graph.logger?.info?.('SIDEPANEL_READY', { timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('SIDEPANEL_INIT_FAILED', { error });
    }
  })();
}

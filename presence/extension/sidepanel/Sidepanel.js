import { buildModuleGraph } from './buildGraph.js';
import { BootController } from './controllers/BootController.js';
import { TabController } from './controllers/TabController.js';
import { exposeModuleGraph, getSidepanelWindow } from './windowInjections.js';
// TODO: RealtimeController and visibility helpers need to be migrated to src/
// Provide typed placeholders until migration completes.
const getRealtimeControllerCtor = () => undefined;
const getVisibilityRefresherFactory = () => undefined;
import { loadChatHistory } from '../features/MessagesModule.js';
let setupTabNavigation;
let setupMessageInputEventListeners;
let initializeTheme;
// UIManager is optional - functions will be loaded dynamically when needed
// Using Promise-based import to avoid top-level await and module resolution issues
if (typeof window !== 'undefined') {
    // Use a helper function to safely import UIManager
    const loadUIManager = async () => {
        try {
            // @ts-expect-error - UIManager may not exist, this is intentional
            const uiModule = await import('../features/UIManager.js');
            setupTabNavigation = uiModule.setupTabNavigation;
            setupMessageInputEventListeners = uiModule.setupMessageInputEventListeners;
            initializeTheme = uiModule.initializeTheme;
        }
        catch {
            // UIManager not available - functions will remain undefined
        }
    };
    // Load asynchronously without blocking
    loadUIManager();
}
const legacyWindow = getSidepanelWindow();
if (legacyWindow.__CANOPI_SIDEPANEL_READY__) {
    console.warn('Canopi Sidepanel already initialized, skipping duplicate bootstrap.');
}
else {
    legacyWindow.__DISABLE_LEGACY_SIDEPANEL__ = true;
    // Initialize async - buildModuleGraph is now async
    (async () => {
        try {
            const graph = await buildModuleGraph();
            // Expose graph to window for sidepanel.js access (temporary, for migration)
            exposeModuleGraph(graph);
            // TODO: RealtimeController and visibility helpers need to be migrated
            const ControllerCtor = getRealtimeControllerCtor();
            const fallbackRealtimeController = {
                startForCurrentPage: () => { },
                handleAuthenticatedUser: async () => { },
                initialize: async () => { }
            };
            const realtimeController = ControllerCtor ? new ControllerCtor(graph) : fallbackRealtimeController;
            const visibilityFactory = getVisibilityRefresherFactory();
            const refreshVisibility = visibilityFactory ? visibilityFactory(graph) : async (_pageId) => { };
            // Use MessageLoadingService if available, otherwise fallback to direct loadChatHistory
            const messageLoadingService = graph.messageLoadingService;
            // Wrap loadChatHistory to match expected signature
            const loadChatHistoryWrapper = async (pageIdOrRawUrl, activeCommunities) => {
                if (pageIdOrRawUrl) {
                    await loadChatHistory(pageIdOrRawUrl, activeCommunities);
                }
                else {
                    await loadChatHistory('', activeCommunities);
                }
            };
            const tabController = new TabController({
                graph,
                realtimeController,
                loadChatHistory: loadChatHistoryWrapper,
                refreshVisibility,
                messageLoadingService: messageLoadingService ? { loadMessages: messageLoadingService.loadMessages } : undefined // Use service if available
            });
            const bootController = new BootController(graph, {
                realtimeController,
                loadChatHistory: loadChatHistoryWrapper,
                setupTabNavigation: setupTabNavigation || (() => { }),
                setupMessageInputEventListeners: setupMessageInputEventListeners || (() => { }),
                initializeTheme: initializeTheme || (async () => { }),
                refreshVisibility,
                messageLoadingService: messageLoadingService ? { loadMessages: messageLoadingService.loadMessages } : undefined // Use service if available
            });
            if (typeof realtimeController.initialize === 'function') {
                await realtimeController.initialize();
            }
            await bootController.initialize();
            await tabController.initialize();
            legacyWindow.__CANOPI_SIDEPANEL_READY__ = true;
            graph.logger?.info?.('SIDEPANEL_READY', { timestamp: new Date().toISOString() });
        }
        catch (error) {
            console.error('SIDEPANEL_INIT_FAILED', { error });
        }
    })();
}

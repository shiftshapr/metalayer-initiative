import { buildModuleGraph } from './buildGraph.js';
import { BootController } from './controllers/BootController.js';
import { TabController } from './controllers/TabController.js';
import { RealtimeController } from './controllers/RealtimeController.js';
import { createVisibilityRefresher } from './helpers/visibility.js';
import { loadChatHistory } from '../features/CanopiModule.js';
import { setupTabNavigation, setupMessageInputEventListeners, initializeTheme } from '../features/UIManager.js';
const legacyWindow = window;
if (legacyWindow.__CANOPI_SIDEPANEL_READY__) {
    console.warn('Canopi Sidepanel already initialized, skipping duplicate bootstrap.');
}
else {
    legacyWindow.__DISABLE_LEGACY_SIDEPANEL__ = true;
    const graph = buildModuleGraph();
    const realtimeController = new RealtimeController(graph);
    const refreshVisibility = createVisibilityRefresher(graph);
    const tabController = new TabController({
        graph,
        realtimeController,
        loadChatHistory,
        refreshVisibility
    });
    const bootController = new BootController(graph, {
        realtimeController,
        loadChatHistory,
        setupTabNavigation,
        setupMessageInputEventListeners,
        initializeTheme,
        refreshVisibility
    });
    (async () => {
        try {
            await realtimeController.initialize();
            await bootController.initialize();
            await tabController.initialize();
            legacyWindow.__CANOPI_SIDEPANEL_READY__ = true;
            graph.logger.info?.('SIDEPANEL_READY', { timestamp: new Date().toISOString() });
        }
        catch (error) {
            graph.logger.error?.('SIDEPANEL_INIT_FAILED', { error });
        }
    })();
}
//# sourceMappingURL=Sidepanel.js.map
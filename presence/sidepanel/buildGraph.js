import { stateManagerInstance } from '../core/StateManager.js';
import { EventBus } from '../core/EventBus.js';
import { authManagerInstance } from '../features/AuthManager.js';
import { CommunitiesModule } from '../features/CommunitiesModule.js';
import { Logger } from '../utils/Logger.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import uiManagerInstance from '../features/UIManager.js';
import { VisibilityManager } from '../features/VisibilityManager.js';
export function buildModuleGraph() {
    const logger = new Logger();
    const eventBus = new EventBus();
    const communitiesModule = new CommunitiesModule();
    const lifecycleManager = typeof window !== 'undefined'
        ? window.lifecycleManager ?? null
        : null;
    const visibilityManager = new VisibilityManager(supabaseServiceInstance, logger);
    const legacyWindow = typeof window !== 'undefined' ? window : null;
    if (legacyWindow) {
        legacyWindow.visibilityManager = visibilityManager;
        legacyWindow.refreshVisibilityAvatars = async (pageId) => {
            try {
                const currentUrlData = await stateManagerInstance.getState('currentUrlData');
                const fallbackPageId = currentUrlData?.pageId ?? null;
                const targetPageId = pageId ?? fallbackPageId;
                if (!targetPageId) {
                    logger.warn?.('VISIBILITY_REFRESH', { message: 'No pageId available for refresh' });
                    return;
                }
                await visibilityManager.refreshVisibilityAvatars(targetPageId);
            }
            catch (error) {
                logger.warn?.('VISIBILITY_REFRESH', { error });
            }
        };
        legacyWindow.dispatchEvent?.(new CustomEvent('visibility-manager-ready', { detail: { manager: visibilityManager } }));
    }
    return {
        stateManager: stateManagerInstance,
        eventBus,
        authManager: authManagerInstance,
        visibilityManager,
        communitiesModule,
        supabaseService: supabaseServiceInstance,
        logger,
        lifecycleManager,
        uiManager: uiManagerInstance
    };
}

/**
 * CREATE VISIBILITY REFRESHER - Factory for visibility refresh function
 *
 * Creates a refreshVisibility function that can be used by BootController and TabController
 * to refresh visibility data when page changes.
 */
import { Logger } from '../../../utils/Logger.js';
/**
 * Create a visibility refresher function
 * @param graph - Module graph containing visibilityManager
 * @returns Function that refreshes visibility for a given pageId
 */
export function createVisibilityRefresher(graph) {
    const logger = graph.logger || new Logger();
    return async (pageId) => {
        try {
            if (!pageId) {
                logger.debug('VISIBILITY_REFRESH: No pageId provided, skipping refresh', null, 'general');
                return;
            }
            if (!graph.visibilityManager) {
                logger.warn('VISIBILITY_REFRESH: VisibilityManager not available in module graph', null, 'general');
                return;
            }
            // REFACTOR PHASE 1: Single Initialization Point
            // VisibilityManager should be initialized by BootController.handleUserChange()
            // If not initialized, we cannot refresh - this is a root cause issue, not a fallback scenario
            const status = graph.visibilityManager.getStatus();
            if (!status.isActive) {
                logger.warn('VISIBILITY_REFRESH: VisibilityManager not initialized - cannot refresh', {
                    message: 'VisibilityManager must be initialized by BootController.handleUserChange() before refresh',
                    isActive: status.isActive,
                    currentUserId: status.currentUserId
                }, 'general');
                return; // Fail clearly - no initialization fallback
            }
            logger.debug('VISIBILITY_REFRESH: Refreshing visibility', { pageId }, 'general');
            const users = await graph.visibilityManager.refreshVisibilityAvatars(pageId);
            logger.debug('VISIBILITY_REFRESH: Refresh complete', { pageId, userCount: users.length }, 'general');
        }
        catch (error) {
            logger.error('VISIBILITY_REFRESH: Failed to refresh visibility', error, 'general');
        }
    };
}
//# sourceMappingURL=createVisibilityRefresher.js.map
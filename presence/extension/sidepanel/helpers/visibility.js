export function createVisibilityRefresher(graph) {
    return async (pageId) => {
        try {
            if (pageId && graph.visibilityManager) {
                await graph.visibilityManager.refreshVisibilityAvatars(pageId);
                return;
            }
            const legacyWindow = window;
            if (legacyWindow.refreshVisibilityAvatars) {
                await legacyWindow.refreshVisibilityAvatars();
            }
        }
        catch (error) {
            graph.logger.warn?.('VISIBILITY_REFRESH', { error });
        }
    };
}

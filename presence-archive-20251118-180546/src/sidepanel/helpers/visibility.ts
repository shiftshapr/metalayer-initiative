import type { ModuleGraph, VisibilityRefreshFn } from '../types.js';

type LegacyWindow = Window & {
  refreshVisibilityAvatars?: () => Promise<void>;
};

export function createVisibilityRefresher(graph: ModuleGraph): VisibilityRefreshFn {
  return async (pageId: string | null): Promise<void> => {
    try {
      if (pageId && graph.visibilityManager) {
        await graph.visibilityManager.refreshVisibilityAvatars(pageId);
        return;
      }

      const legacyWindow = window as LegacyWindow;
      if (legacyWindow.refreshVisibilityAvatars) {
        await legacyWindow.refreshVisibilityAvatars();
      }
    } catch (error) {
      graph.logger.warn?.('VISIBILITY_REFRESH', { error });
    }
  };
}





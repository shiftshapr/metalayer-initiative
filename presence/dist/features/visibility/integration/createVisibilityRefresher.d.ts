/**
 * CREATE VISIBILITY REFRESHER - Factory for visibility refresh function
 *
 * Creates a refreshVisibility function that can be used by BootController and TabController
 * to refresh visibility data when page changes.
 */
import type { ModuleGraph } from '../../../sidepanel/types.js';
/**
 * Create a visibility refresher function
 * @param graph - Module graph containing visibilityManager
 * @returns Function that refreshes visibility for a given pageId
 */
export declare function createVisibilityRefresher(graph: ModuleGraph): (pageId?: string | null) => Promise<void>;
//# sourceMappingURL=createVisibilityRefresher.d.ts.map
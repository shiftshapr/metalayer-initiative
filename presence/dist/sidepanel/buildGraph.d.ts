/**
 * BUILD MODULE GRAPH - Dependency Injection Container
 *
 * Creates and initializes all services for the sidepanel.
 * Returns a module graph with all initialized components.
 *
 * Migrated from JavaScript to TypeScript for type safety.
 */
import type { ModuleGraph } from './types.js';
/**
 * Build the module graph - creates and initializes all services
 *
 * @returns ModuleGraph with all initialized components
 */
export declare function buildModuleGraph(): Promise<ModuleGraph>;
//# sourceMappingURL=buildGraph.d.ts.map
/**
 * DEPENDENCY CONTAINER - Centralized Dependency Injection
 *
 * Provides type-safe dependency injection for the Canopi presence extension.
 * Replaces direct window property access with proper dependency injection.
 *
 * TypeScript + ES6 Module
 */
import type { MetaLayerAPI } from '../services/APIService.js';
import type { StateManager } from '../types/index.js';
import type { SupabaseClient } from '../types/index.js';
/**
 * Dependency container interface
 */
export interface Dependencies {
    api: MetaLayerAPI | null;
    stateManager: StateManager;
    supabase: SupabaseClient | null;
    userPreferencesManager?: {
        isInitialized?: boolean;
        getPreference?: (key: string) => Promise<string | number | boolean | null>;
        savePreference?: (key: string, value: unknown, options?: {
            batch?: boolean;
        }) => Promise<unknown>;
    } | null;
}
/**
 * DependencyContainer - Singleton dependency injection container
 */
declare class DependencyContainer {
    private dependencies;
    private initialized;
    constructor();
    /**
     * Initialize dependencies
     * Should be called once at application startup
     */
    initialize(): Promise<void>;
    /**
     * Get all dependencies
     */
    getDependencies(): Dependencies;
    /**
     * Get API instance
     */
    getAPI(): MetaLayerAPI | null;
    /**
     * Get StateManager instance
     */
    getStateManager(): StateManager;
    /**
     * Get Supabase client
     */
    getSupabase(): SupabaseClient | null;
    /**
     * Get user preferences manager
     */
    getUserPreferencesManager(): Dependencies['userPreferencesManager'];
    /**
     * Set API instance (for testing or manual injection)
     */
    setAPI(api: MetaLayerAPI | null): void;
    /**
     * Set Supabase client (for testing or manual injection)
     */
    setSupabase(supabase: SupabaseClient | null): void;
    /**
     * Set user preferences manager (for testing or manual injection)
     */
    setUserPreferencesManager(manager: Dependencies['userPreferencesManager']): void;
    /**
     * Reset container (for testing)
     */
    reset(): void;
}
export declare const dependencyContainer: DependencyContainer;
/**
 * Initialize dependency container
 * Call this once at application startup
 */
export declare function initializeDependencies(): Promise<void>;
/**
 * Get dependencies (convenience function)
 */
export declare function getDependencies(): Dependencies;
/**
 * Get API (convenience function)
 */
export declare function getAPI(): MetaLayerAPI | null;
/**
 * Get StateManager (convenience function)
 */
export declare function getStateManager(): StateManager;
/**
 * Get Supabase (convenience function)
 */
export declare function getSupabase(): SupabaseClient | null;
export default dependencyContainer;
//# sourceMappingURL=DependencyContainer.d.ts.map
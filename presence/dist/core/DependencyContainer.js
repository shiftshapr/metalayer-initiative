/**
 * DEPENDENCY CONTAINER - Centralized Dependency Injection
 *
 * Provides type-safe dependency injection for the Canopi presence extension.
 * Replaces direct window property access with proper dependency injection.
 *
 * TypeScript + ES6 Module
 */
import { stateManagerInstance } from './StateManager.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
/**
 * DependencyContainer - Singleton dependency injection container
 */
class DependencyContainer {
    constructor() {
        this.initialized = false;
        this.dependencies = {
            api: null,
            stateManager: stateManagerInstance,
            supabase: null,
            userPreferencesManager: null
        };
    }
    /**
     * Initialize dependencies
     * Should be called once at application startup
     */
    async initialize() {
        if (this.initialized) {
            Logger.warn('⚠️ DependencyContainer: Already initialized', null, 'core');
            return;
        }
        try {
            // Get API from window (set by APIService) or stateManager
            const win = window;
            if (win.api && typeof win.api.request === 'function') {
                this.dependencies.api = win.api;
            }
            else {
                const apiFromState = stateManagerInstance.getState('api');
                if (apiFromState && typeof apiFromState.request === 'function') {
                    this.dependencies.api = apiFromState;
                }
            }
            // Get Supabase client
            this.dependencies.supabase = supabaseServiceInstance.getClient();
            // Get userPreferencesManager from window (if available)
            const winWithPrefs = window;
            this.dependencies.userPreferencesManager = winWithPrefs.userPreferencesManager ?? null;
            this.initialized = true;
            Logger.debug('✅ DependencyContainer: Initialized successfully', null, 'core');
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'DependencyContainer'
                }
            });
            ;
            throw error;
        }
    }
    /**
     * Get all dependencies
     */
    getDependencies() {
        if (!this.initialized) {
            Logger.warn('⚠️ DependencyContainer: Not initialized. Call initialize() first.', null, 'core');
        }
        return { ...this.dependencies };
    }
    /**
     * Get API instance
     */
    getAPI() {
        return this.dependencies.api;
    }
    /**
     * Get StateManager instance
     */
    getStateManager() {
        return this.dependencies.stateManager;
    }
    /**
     * Get Supabase client
     */
    getSupabase() {
        return this.dependencies.supabase;
    }
    /**
     * Get user preferences manager
     */
    getUserPreferencesManager() {
        return this.dependencies.userPreferencesManager;
    }
    /**
     * Set API instance (for testing or manual injection)
     */
    setAPI(api) {
        this.dependencies.api = api;
    }
    /**
     * Set Supabase client (for testing or manual injection)
     */
    setSupabase(supabase) {
        this.dependencies.supabase = supabase;
    }
    /**
     * Set user preferences manager (for testing or manual injection)
     */
    setUserPreferencesManager(manager) {
        this.dependencies.userPreferencesManager = manager;
    }
    /**
     * Reset container (for testing)
     */
    reset() {
        this.dependencies = {
            api: null,
            stateManager: stateManagerInstance,
            supabase: null,
            userPreferencesManager: null
        };
        this.initialized = false;
    }
}
// Singleton instance
export const dependencyContainer = new DependencyContainer();
/**
 * Initialize dependency container
 * Call this once at application startup
 */
export async function initializeDependencies() {
    try {
        await dependencyContainer.initialize();
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'initializeDependencies',
                component: 'DependencyContainer'
            }
        });
    }
}
/**
 * Get dependencies (convenience function)
 */
export function getDependencies() {
    return dependencyContainer.getDependencies();
}
/**
 * Get API (convenience function)
 */
export function getAPI() {
    return dependencyContainer.getAPI();
}
/**
 * Get StateManager (convenience function)
 */
export function getStateManager() {
    return dependencyContainer.getStateManager();
}
/**
 * Get Supabase (convenience function)
 */
export function getSupabase() {
    return dependencyContainer.getSupabase();
}
export default dependencyContainer;

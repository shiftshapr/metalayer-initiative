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
import { stateManagerInstance } from './StateManager.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import type { SupabaseClient } from '../types/index.js';

import { handleError } from '../utils/ErrorHandler.js';

import { Logger } from '../utils/Logger.js';

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
    savePreference?: (key: string, value: unknown, options?: { batch?: boolean }) => Promise<unknown>;
  } | null;
}

/**
 * DependencyContainer - Singleton dependency injection container
 */
class DependencyContainer {
  private dependencies: Dependencies;
  private initialized: boolean = false;

  constructor() {
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
  async initialize(): Promise<void> {
    if (this.initialized) {
      Logger.warn('⚠️ DependencyContainer: Already initialized', null, 'core');
      return;
    }

    try {
      // Get API from window (set by APIService) or stateManager
      const win = window as Window & { api?: MetaLayerAPI };
      if (win.api && typeof win.api.request === 'function') {
        this.dependencies.api = win.api;
      } else {
        const apiFromState = stateManagerInstance.getState('api') as MetaLayerAPI | undefined;
        if (apiFromState && typeof apiFromState.request === 'function') {
          this.dependencies.api = apiFromState;
        }
      }

      // Get Supabase client
      this.dependencies.supabase = supabaseServiceInstance.getClient();

      // Get userPreferencesManager from window (if available)
      const winWithPrefs = window as Window & { 
        userPreferencesManager?: {
          isInitialized?: boolean;
          getPreference?: (key: string) => Promise<string | number | boolean | null>;
          savePreference?: (key: string, value: unknown, options?: { batch?: boolean }) => Promise<unknown>;
        } 
      };
      this.dependencies.userPreferencesManager = winWithPrefs.userPreferencesManager ?? null;

      this.initialized = true;
      Logger.debug('✅ DependencyContainer: Initialized successfully', null, 'core');
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'DependencyContainer'
            }
        });;
      throw error;
    
    }
  }

  /**
   * Get all dependencies
   */
  getDependencies(): Dependencies {
    if (!this.initialized) {
      Logger.warn('⚠️ DependencyContainer: Not initialized. Call initialize() first.', null, 'core');
    }
    return { ...this.dependencies };
  }

  /**
   * Get API instance
   */
  getAPI(): MetaLayerAPI | null {
    return this.dependencies.api;
  }

  /**
   * Get StateManager instance
   */
  getStateManager(): StateManager {
    return this.dependencies.stateManager;
  }

  /**
   * Get Supabase client
   */
  getSupabase(): SupabaseClient | null {
    return this.dependencies.supabase;
  }

  /**
   * Get user preferences manager
   */
  getUserPreferencesManager(): Dependencies['userPreferencesManager'] {
    return this.dependencies.userPreferencesManager;
  }

  /**
   * Set API instance (for testing or manual injection)
   */
  setAPI(api: MetaLayerAPI | null): void {
    this.dependencies.api = api;
  }

  /**
   * Set Supabase client (for testing or manual injection)
   */
  setSupabase(supabase: SupabaseClient | null): void {
    this.dependencies.supabase = supabase;
  }

  /**
   * Set user preferences manager (for testing or manual injection)
   */
  setUserPreferencesManager(manager: Dependencies['userPreferencesManager']): void {
    this.dependencies.userPreferencesManager = manager;
  }

  /**
   * Reset container (for testing)
   */
  reset(): void {
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
export async function initializeDependencies(): Promise<void> {
  try {
    await dependencyContainer.initialize();
  } catch (error: unknown) {
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
export function getDependencies(): Dependencies {
  return dependencyContainer.getDependencies();
}

/**
 * Get API (convenience function)
 */
export function getAPI(): MetaLayerAPI | null {
  return dependencyContainer.getAPI();
}

/**
 * Get StateManager (convenience function)
 */
export function getStateManager(): StateManager {
  return dependencyContainer.getStateManager();
}

/**
 * Get Supabase (convenience function)
 */
export function getSupabase(): SupabaseClient | null {
  return dependencyContainer.getSupabase();
}

export default dependencyContainer;



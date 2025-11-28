/**
 * Module Graph Type Definitions
 * 
 * Proper type definitions for all modules in the dependency injection graph.
 * Replaces 'any' types with specific interfaces.
 */

import type { StateManager } from './index.js';
import type { MessageLoadingService } from '../services/MessageLoadingService.js';
import type { VisibilityManager as VisibilityManagerType, IVisibilityRealtime } from '../features/visibility/core/VisibilityManager.js';
import type { Logger } from '../utils/Logger.js';

// Re-export for convenience
export type { VisibilityManagerType as VisibilityManager };

/**
 * SupabaseService interface
 * Provides Supabase client and initialization
 */
export interface SupabaseService {
  initialize: () => Promise<void>;
  getClient: () => unknown;
  [key: string]: unknown;
}

/**
 * CommunitiesModule interface
 * Handles community-related operations
 */
export interface CommunitiesModule {
  initialize?: () => Promise<void> | void;
  getCommunityName?: (id: string) => string | Promise<string>;
  [key: string]: unknown;
}

/**
 * AuthManager interface
 * Handles authentication operations
 */
export interface AuthManager {
  initialize?: () => Promise<void> | void;
  signIn?: () => Promise<unknown>;
  signOut?: () => Promise<void> | void;
  getCurrentUser?: () => Promise<unknown> | unknown;
  [key: string]: unknown;
}

/**
 * LifecycleManager interface
 * Manages module lifecycle hooks
 */
export interface LifecycleManager {
  register?: (name: string, hooks: {
    init?: () => boolean;
    destroy?: () => boolean;
    initialize?: () => boolean;
  }, options?: {
    dependencies?: string[];
    autoInitialize?: boolean;
  }) => void;
  [key: string]: unknown;
}

/**
 * EventBus interface
 * Handles event publishing and subscription
 */
export interface EventBus {
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  emit?: (event: string, ...args: unknown[]) => void;
  off?: (event: string, handler: (...args: unknown[]) => void) => void;
  [key: string]: unknown;
}

/**
 * UIManager interface
 * Manages UI state and updates
 */
export interface UIManager {
  initialize?: () => Promise<void> | void;
  update?: () => void;
  [key: string]: unknown;
}

/**
 * VisibilityState interface
 * Manages visibility state
 */
export interface VisibilityState {
  getUsers: () => unknown[];
  setUsers: (users: unknown[]) => void;
  [key: string]: unknown;
}

/**
 * Module Graph Interface
 * 
 * Centralized dependency injection container for all modules
 */
export interface ModuleGraph {
  stateManager: StateManager;
  messageLoadingService?: MessageLoadingService;
  visibilityManager?: VisibilityManager;
  supabaseService?: SupabaseService;
  logger: typeof Logger;
  communitiesModule?: CommunitiesModule;
  authManager?: AuthManager;
  lifecycleManager?: LifecycleManager;
  eventBus?: EventBus;
  uiManager?: UIManager;
}

/**
 * Module import result types for safe imports
 */
export interface SupabaseModuleImport {
  supabaseServiceInstance?: SupabaseService;
  [key: string]: unknown;
}

export interface AuthModuleImport {
  authManagerInstance?: AuthManager;
  [key: string]: unknown;
}

export interface LifecycleModuleImport {
  lifecycleManagerInstance?: LifecycleManager;
  [key: string]: unknown;
}

export interface EventBusModuleImport {
  eventBusInstance?: EventBus;
  [key: string]: unknown;
}

export interface UIManagerModuleImport {
  uiManagerInstance?: UIManager;
  [key: string]: unknown;
}

export interface VisibilityModuleImport {
  VisibilityManager?: new (
    supabase: IVisibilityRealtime,
    logger: typeof Logger,
    visibilityState: VisibilityState
  ) => VisibilityManager;
  [key: string]: unknown;
}

export interface VisibilityStateModuleImport {
  VisibilityState?: new () => VisibilityState;
  [key: string]: unknown;
}

export interface CommunitiesModuleImport {
  initialize?: () => Promise<void> | void;
  [key: string]: unknown;
}


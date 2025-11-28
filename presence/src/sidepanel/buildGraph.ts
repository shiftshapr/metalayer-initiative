/**
 * Module Graph Builder
 * 
 * Constructs the module dependency graph for dependency injection
 * This is the single source of truth for module initialization order
 */

import type { ModuleGraph } from './types.js';
import { getMessageLoadingService, initializeMessageLoadingService, type MessageLoadingService } from '../services/MessageLoadingService.js';
import { Logger } from '../utils/Logger.js';

// Import StateManager - use dynamic import to handle path resolution
// From sidepanel/ to core/ is ../core/

// Import optional modules - use any for now to avoid circular dependency issues
// These will be properly typed when modules are available
type VisibilityManagerType = any;
type SupabaseServiceType = any;
type CommunitiesModuleType = any;
type AuthManagerType = any;
type LifecycleManagerType = any;
type EventBusType = any;
type UIManagerType = any;

// Note: Optional modules are loaded dynamically in buildModuleGraph
// This avoids circular dependencies and allows modules to be optional

/**
 * Helper to safely import optional modules
 */
async function safeImport<T = unknown>(modulePath: string): Promise<T | null> {
  try {
    // Dynamic import path may not exist at compile time - this is intentional for optional modules
    return await import(modulePath) as T;
  } catch {
    return null;
  }
}

/**
 * Build the module graph
 * 
 * Initializes all modules in the correct order and returns the dependency graph
 */
export async function buildModuleGraph(): Promise<ModuleGraph> {
  Logger.debug('Building module graph...', null, 'module-graph');

  // Import StateManager dynamically
  let stateManager: any;
  try {
    const stateManagerModule = await import('../core/StateManager.js');
    stateManager = stateManagerModule.stateManagerInstance;
    if (!stateManager) {
      throw new Error('stateManagerInstance not exported from StateManager');
    }
    Logger.debug('StateManager imported successfully', null, 'module-graph');
  } catch (error) {
    Logger.error('Failed to import StateManager', error, 'module-graph');
    throw new Error('StateManager is required but could not be imported');
  }

  // Import loadChatHistory dynamically - MessagesModule may export as default or named export
  let loadChatHistory: (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  try {
    const messagesModule = await import('../features/MessagesModule.js');
    // Try named export first
    if (messagesModule.loadChatHistory && typeof messagesModule.loadChatHistory === 'function') {
      // Wrap to handle type mismatch - original expects string, but we need to accept null/undefined
      const originalFn = messagesModule.loadChatHistory as (pageIdOrRawUrl: string, activeCommunities?: string[]) => Promise<void>;
      loadChatHistory = async (pageIdOrRawUrl?: string | null, activeCommunities?: string[]): Promise<void> => {
        if (pageIdOrRawUrl) {
          return originalFn(pageIdOrRawUrl, activeCommunities);
        }
        // If null/undefined, call with empty string or handle gracefully
        return originalFn('', activeCommunities);
      };
      Logger.debug('loadChatHistory imported as named export', null, 'module-graph');
    } else if (messagesModule.default && messagesModule.default.loadChatHistory) {
      // Try default export with loadChatHistory property
      const originalFn = messagesModule.default.loadChatHistory as (pageIdOrRawUrl: string, activeCommunities?: string[]) => Promise<void>;
      loadChatHistory = async (pageIdOrRawUrl?: string | null, activeCommunities?: string[]): Promise<void> => {
        if (pageIdOrRawUrl) {
          return originalFn(pageIdOrRawUrl, activeCommunities);
        }
        return originalFn('', activeCommunities);
      };
      Logger.debug('loadChatHistory imported from default export', null, 'module-graph');
    } else {
      throw new Error('loadChatHistory not found in MessagesModule');
    }
  } catch (error) {
    Logger.error('Failed to import loadChatHistory from MessagesModule', error, 'module-graph');
    throw new Error('loadChatHistory is required but could not be imported');
  }

  // Initialize MessageLoadingService
  let messageLoadingService: MessageLoadingService | undefined;
  try {
    // Check if already initialized
    try {
      messageLoadingService = getMessageLoadingService();
      Logger.debug('MessageLoadingService already initialized', null, 'module-graph');
    } catch {
      // Not initialized, create it
      messageLoadingService = initializeMessageLoadingService({
        loadChatHistory: loadChatHistory
      });
      Logger.debug('MessageLoadingService initialized', null, 'module-graph');
    }
  } catch (error) {
    Logger.warn('Failed to initialize MessageLoadingService', error, 'module-graph');
  }

  // Initialize optional modules
  let visibilityManager: VisibilityManagerType | undefined;
  let supabaseService: SupabaseServiceType | undefined;
  let communitiesModule: CommunitiesModuleType | undefined;
  let authManager: AuthManagerType | undefined;
  let lifecycleManager: LifecycleManagerType | undefined;
  let eventBus: EventBusType | undefined;
  let uiManager: UIManagerType | undefined;

  // Try to load optional modules dynamically
  // These are optional and may not exist, so we catch errors gracefully

  // Initialize SupabaseService if available
  // CRITICAL FIX: Must call initialize() to create Supabase client with auth property
  // ROOT CAUSE FIX: SupabaseService.js is in root services/, not src/services/
  const supabaseModule = await safeImport<{ supabaseServiceInstance?: any }>('../../services/SupabaseService.js');
  if (supabaseModule?.supabaseServiceInstance) {
    supabaseService = supabaseModule.supabaseServiceInstance;
    // CRITICAL: Initialize SupabaseService to create client with auth property
    try {
      await supabaseService.initialize();
      Logger.debug('SupabaseService initialized and client created', null, 'module-graph');
    } catch (error) {
      Logger.warn('SupabaseService initialization failed', error, 'module-graph');
    }
  } else {
    Logger.debug('SupabaseService not available (optional)', null, 'module-graph');
  }

  // CommunitiesModule - CommunityLoaders.ts doesn't export a class, it's just functions
  // BootController uses graph.communitiesModule?.initialize() which suggests it might be a module with initialize method
  // For now, we'll leave it undefined and let BootController handle it
  try {
    const communitiesModuleImport = await import('../features/CommunityLoaders.js').catch(() => null);
    // Check if there's an initialize function or module instance
    if (communitiesModuleImport && typeof (communitiesModuleImport as any).initialize === 'function') {
      communitiesModule = communitiesModuleImport as any;
      Logger.debug('CommunitiesModule available', null, 'module-graph');
    }
  } catch (error) {
    Logger.debug('CommunitiesModule not available (optional)', null, 'module-graph');
  }

  // Initialize AuthManager if available
  // CRITICAL FIX: AuthManager is in features/, not core/auth/
  const authModule = await safeImport<{ authManagerInstance?: any }>('../features/AuthManager.js');
  if (authModule?.authManagerInstance) {
    authManager = authModule.authManagerInstance;
    Logger.debug('AuthManager initialized', null, 'module-graph');
  } else {
    Logger.debug('AuthManager not available (optional)', null, 'module-graph');
  }

  // Initialize LifecycleManager if available
  const lifecycleModule = await safeImport<{ lifecycleManagerInstance?: any }>('../core/LifecycleManager.js');
  if (lifecycleModule?.lifecycleManagerInstance) {
    lifecycleManager = lifecycleModule.lifecycleManagerInstance;
    Logger.debug('LifecycleManager initialized', null, 'module-graph');
  } else {
    Logger.debug('LifecycleManager not available (optional)', null, 'module-graph');
  }

  // Initialize EventBus if available
  const eventBusModule = await safeImport<{ eventBusInstance?: any }>('../core/EventBus.js');
  if (eventBusModule?.eventBusInstance) {
    eventBus = eventBusModule.eventBusInstance;
    Logger.debug('EventBus initialized', null, 'module-graph');
  } else {
    Logger.debug('EventBus not available (optional)', null, 'module-graph');
  }

  // Initialize UIManager if available
  const uiModule = await safeImport<{ uiManagerInstance?: any }>('../features/UIManager.js');
  if (uiModule?.uiManagerInstance) {
    uiManager = uiModule.uiManagerInstance;
    Logger.debug('UIManager initialized', null, 'module-graph');
  } else {
    Logger.debug('UIManager not available (optional)', null, 'module-graph');
  }

  // VisibilityManager - create instance with realtime service
  // Realtime service is provided by SupabaseService (has getPageUsers method)
  const visibilityModule = await safeImport<{ VisibilityManager?: any }>('../features/visibility/core/VisibilityManager.js');
  const visibilityStateModule = await safeImport<{ VisibilityState?: any }>('../features/visibility/core/VisibilityState.js');
  
  if (visibilityModule?.VisibilityManager && visibilityStateModule?.VisibilityState && supabaseService) {
    // Create VisibilityState instance
    const VisibilityState = visibilityStateModule.VisibilityState;
    const visibilityState = new VisibilityState();
    
    // SupabaseService implements IVisibilityRealtime interface (has getPageUsers, getUserProfile, on methods)
    // Create VisibilityManager instance - it will be initialized later in BootController when user is authenticated
    visibilityManager = new visibilityModule.VisibilityManager(
      supabaseService as any, // SupabaseService implements IVisibilityRealtime
      Logger,
      visibilityState
    );
    
    Logger.debug('VisibilityManager instance created (will be initialized in BootController)', null, 'module-graph');
  } else {
    Logger.debug('VisibilityManager not available - missing VisibilityManager class or SupabaseService', null, 'module-graph');
  }

  // Build and return the graph
  const graph: ModuleGraph = {
    stateManager,
    messageLoadingService,
    visibilityManager: visibilityManager as any, // Will be set later in BootController
    supabaseService,
    logger: Logger,
    communitiesModule,
    authManager,
    lifecycleManager,
    eventBus,
    uiManager
  };

  Logger.debug('Module graph built successfully', { 
    modules: Object.keys(graph).filter(key => graph[key as keyof ModuleGraph] !== undefined)
  }, 'module-graph');

  return graph;
}

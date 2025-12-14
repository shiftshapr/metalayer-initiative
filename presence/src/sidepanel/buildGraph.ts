/**
 * Module Graph Builder
 * 
 * Constructs the module dependency graph for dependency injection
 * This is the single source of truth for module initialization order
 */

import type { 
  ModuleGraph,
  SupabaseService,
  CommunitiesModule,
  AuthManager,
  LifecycleManager,
  EventBus,
  UIManager,
  VisibilityManager,
  SupabaseModuleImport,
  AuthModuleImport,
  LifecycleModuleImport,
  EventBusModuleImport,
  UIManagerModuleImport,
  VisibilityModuleImport,
  VisibilityStateModuleImport
} from '../types/moduleGraph.js';
import { getMessageLoadingService, initializeMessageLoadingService, type MessageLoadingService } from '../services/MessageLoadingService.js';
import { Logger } from '../utils/Logger.js';
import type { StateManager } from '../types/index.js';
import type { IVisibilityRealtime } from '../features/visibility/core/VisibilityManager.js';

// Import StateManager - use dynamic import to handle path resolution
// From sidepanel/ to core/ is ../core/

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
  let stateManager: StateManager;
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
  let visibilityManager: VisibilityManager | undefined;
  let supabaseService: SupabaseService | undefined;
  let communitiesModule: CommunitiesModule | undefined;
  let authManager: AuthManager | undefined;
  let lifecycleManager: LifecycleManager | undefined;
  let eventBus: EventBus | undefined;
  let uiManager: UIManager | undefined;

  // Try to load optional modules dynamically
  // These are optional and may not exist, so we catch errors gracefully

  // Initialize SupabaseService if available
  // CRITICAL FIX: Must call initialize() to create Supabase client with auth property
  // ROOT CAUSE FIX: SupabaseService.js is in root services/, not src/services/
  const supabaseModule = await safeImport<SupabaseModuleImport>('../../services/SupabaseService.js');
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

  // CommunitiesModule - centralized community management
  try {
    const { CommunitiesModule } = await import('../features/CommunitiesModule.js');
    if (CommunitiesModule) {
      communitiesModule = new CommunitiesModule() as any;
      Logger.debug('CommunitiesModule initialized in module graph', null, 'module-graph');
    }
  } catch (error) {
    Logger.debug('CommunitiesModule not available (optional)', error, 'module-graph');
  }

  // Initialize AuthManager if available
  // CRITICAL FIX: AuthManager is in features/, not core/auth/
  const authModule = await safeImport<AuthModuleImport>('../features/AuthManager.js');
  if (authModule?.authManagerInstance) {
    authManager = authModule.authManagerInstance;
    Logger.debug('AuthManager initialized', null, 'module-graph');
  } else {
    Logger.debug('AuthManager not available (optional)', null, 'module-graph');
  }

  // Initialize LifecycleManager if available
  const lifecycleModule = await safeImport<LifecycleModuleImport>('../core/LifecycleManager.js');
  if (lifecycleModule?.lifecycleManagerInstance) {
    lifecycleManager = lifecycleModule.lifecycleManagerInstance;
    Logger.debug('LifecycleManager initialized', null, 'module-graph');
  } else {
    Logger.debug('LifecycleManager not available (optional)', null, 'module-graph');
  }

  // Initialize EventBus if available
  const eventBusModule = await safeImport<EventBusModuleImport>('../core/EventBus.js');
  if (eventBusModule?.eventBusInstance) {
    eventBus = eventBusModule.eventBusInstance;
    Logger.debug('EventBus initialized', null, 'module-graph');
  } else {
    Logger.debug('EventBus not available (optional)', null, 'module-graph');
  }

  // Initialize UIManager if available
  const uiModule = await safeImport<UIManagerModuleImport>('../features/UIManager.js');
  if (uiModule?.uiManagerInstance) {
    uiManager = uiModule.uiManagerInstance;
    Logger.debug('UIManager initialized', null, 'module-graph');
  } else {
    Logger.debug('UIManager not available (optional)', null, 'module-graph');
  }

  // VisibilityManager - create instance with realtime service
  // Realtime service is provided by SupabaseService (has getPageUsers method)
  const visibilityModule = await safeImport<VisibilityModuleImport>('../features/visibility/core/VisibilityManager.js');
  const visibilityStateModule = await safeImport<VisibilityStateModuleImport>('../features/visibility/core/VisibilityState.js');
  
  if (visibilityModule?.VisibilityManager && visibilityStateModule?.VisibilityState && supabaseService) {
    // Create VisibilityState instance
    const VisibilityStateClass = visibilityStateModule.VisibilityState;
    const visibilityState = new VisibilityStateClass();
    
    // SupabaseService implements IVisibilityRealtime interface (has getPageUsers, getUserProfile, on methods)
    // Create VisibilityManager instance - it will be initialized later in BootController when user is authenticated
    const VisibilityManagerClass = visibilityModule.VisibilityManager;
    // SupabaseService implements IVisibilityRealtime interface
    // Type assertion needed because SupabaseService interface doesn't explicitly extend IVisibilityRealtime
    visibilityManager = new VisibilityManagerClass(
      supabaseService as unknown as IVisibilityRealtime,
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
    visibilityManager,
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




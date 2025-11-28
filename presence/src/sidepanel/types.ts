/**
 * Module Graph Type Definitions
 * 
 * Defines the structure of the module graph used for dependency injection
 */

// Use any for modules to avoid circular dependency issues during migration
// These will be properly typed when all modules are migrated
type StateManager = any;
type MessageLoadingService = any;
type VisibilityManager = any;
type SupabaseService = any;
type Logger = any;
type CommunitiesModule = any;
type AuthManager = any;
type LifecycleManager = any;
type EventBus = any;
type UIManager = any;

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
  logger: Logger;
  communitiesModule?: CommunitiesModule;
  authManager?: AuthManager;
  lifecycleManager?: LifecycleManager;
  eventBus?: EventBus;
  uiManager?: UIManager;
}







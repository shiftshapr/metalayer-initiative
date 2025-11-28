/**
 * Module Graph Types
 * 
 * Defines the structure of the module graph returned by buildModuleGraph()
 */

import type { StateManager } from '../core/StateManager.js';
import type { EventBus } from '../core/EventBus.js';
import type { AuthManager } from '../features/AuthManager.js';
import type { Logger } from '../utils/Logger.js';
import type { MessageLoadingService } from '../services/MessageLoadingService.js';
import type { SupabaseService } from '../services/SupabaseService.js';
import type { CommunitiesModule } from '../features/CommunitiesModule.js';
import type { VisibilityManager } from '../features/visibility/core/VisibilityManager.js';
import type { VisibilityState } from '../features/visibility/core/VisibilityState.js';
import type { VisibilityUIEvents } from '../features/visibility/index.js';
import type { VisibilitySettings } from '../features/visibility/ui/VisibilitySettings.js';
import UIManager from '../features/UIManager.js';

/**
 * Module Graph - Dependency Injection Container
 * 
 * Contains all initialized services and managers for the sidepanel
 * Uses proper types instead of unknown for type safety
 */
export interface ModuleGraph {
  stateManager: StateManager;
  eventBus: EventBus;
  authManager: AuthManager;
  visibilityManager: VisibilityManager;
  visibilityState: VisibilityState;
  visibilityUIEvents: VisibilityUIEvents;
  visibilitySettings: VisibilitySettings;
  messageLoadingService: MessageLoadingService | null;
  communitiesModule: CommunitiesModule;
  supabaseService: SupabaseService;
  logger: Logger;
  lifecycleManager: {
    register: (name: string, hooks: { init?: () => boolean; destroy?: () => boolean; initialize?: () => boolean }, options?: { dependencies?: string[]; autoInitialize?: boolean }) => void;
    [key: string]: unknown;
  } | null;
  uiManager: typeof UIManager;
  [key: string]: unknown; // Index signature for flexibility
}


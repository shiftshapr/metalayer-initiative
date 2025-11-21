import { stateManagerInstance } from '../core/StateManager.js';
import { EventBus } from '../core/EventBus.js';
import { authManagerInstance } from '../features/AuthManager.js';
import { CommunitiesModule } from '../features/CommunitiesModule.js';
import { Logger } from '../utils/Logger.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import uiManagerInstance from '../features/UIManager.js';
import type { ModuleGraph } from './types.js';

type LegacyWindow = Window & {
  lifecycleManager?: any;
};

export function buildModuleGraph(): ModuleGraph {
  const logger = new Logger();
  const eventBus = new EventBus();
  const communitiesModule = new CommunitiesModule();

  const lifecycleManager = typeof window !== 'undefined'
    ? (window as LegacyWindow).lifecycleManager ?? null
    : null;

  return {
    stateManager: stateManagerInstance,
    eventBus,
    authManager: authManagerInstance,
    visibilityManager: null,
    communitiesModule,
    supabaseService: supabaseServiceInstance,
    logger,
    lifecycleManager,
    uiManager: uiManagerInstance
  };
}


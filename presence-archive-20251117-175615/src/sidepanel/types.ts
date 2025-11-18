import type EventBus from '../core/EventBus.js';
import type { StateManager } from '../core/StateManager.js';
import type { User } from '../types/index.js';
import type { AuthManager } from '../features/AuthManager.js';
import type { VisibilityManager } from '../features/VisibilityManager.js';
import type { CommunitiesModule } from '../features/CommunitiesModule.js';
import type { Logger } from '../utils/Logger.js';
import type { SupabaseService } from '../services/SupabaseService.js';
import type { UIManager } from '../features/UIManager.js';

export interface LifecycleManagerLike {
  register(name: string, component: unknown, options?: Record<string, unknown>): void;
  initialize(name: string): Promise<boolean> | boolean;
  destroy(name: string): void;
}

export interface ModuleGraph {
  stateManager: StateManager;
  eventBus: EventBus;
  authManager: AuthManager;
  visibilityManager?: VisibilityManager | null;
  communitiesModule: CommunitiesModule;
  supabaseService: SupabaseService;
  logger: Logger;
  lifecycleManager?: LifecycleManagerLike | null;
  uiManager?: UIManager;
}

export interface RealtimeDependencies {
  supabaseService: SupabaseService;
  logger: Logger;
  eventBus: EventBus;
  stateManager: StateManager;
}

export interface TabDependencies {
  stateManager: StateManager;
  logger: Logger;
  eventBus: EventBus;
}

export interface NormalizedUrlData {
  rawUrl: string | null;
  normalizedUrl: string | null;
  pageId: string | null;
  canonicalUrl?: string | null;
}

export interface SidepanelController {
  initialize(): Promise<void> | void;
}

export type AuthenticatedUser = User | null | undefined;

export type Nullable<T> = T | null | undefined;

export type VisibilityRefreshFn = (pageId: string | null) => Promise<void>;



/**
 * BUILDGRAPH ADAPTER - Integration Helper
 *
 * Provides integration code snippets and adapter functions for buildGraph.js
 * Since buildGraph.js is in extension/ (not editable per .cursorrules),
 * this adapter provides the exact code needed for manual integration.
 *
 * Usage: Copy the integration code from this file to buildGraph.js
 */
import { VisibilityManager, VisibilityRealtime, VisibilityStorage, VisibilityState, VisibilityUIEvents } from '../index.js';
import type { VisibilityStorageDependencies } from '../services/VisibilityStorage.js';
import type { SupabaseClient } from '../../../types/index.js';
import type { SupabaseRealtimeClientBridge } from '../../../types/realtime.js';
import Logger from '../../../utils/Logger.js';
/**
 * Integration code snippet for buildGraph.js
 *
 * REPLACE the old visibility initialization with this code:
 */
export declare const BUILDGRAPH_INTEGRATION_CODE = "\n// ============================================\n// VISIBILITY MODULE INTEGRATION (NEW ARCHITECTURE)\n// ============================================\n// Replace old VisibilityManager initialization with this:\n\nimport { \n  Logger,\n  VisibilityManager,\n  VisibilityRealtime,\n  VisibilityStorage,\n  VisibilityState,\n  VisibilityUIEvents\n} from '../features/visibility/index.js';\n\n// Create services\nconst visibilityRealtimeService = new VisibilityRealtime({\n  on: (event, handler) => {\n    // Connect to your Supabase realtime client\n    if (supabaseRealtimeClient?.on) {\n      supabaseRealtimeClient.on(event, handler);\n    }\n  },\n  getPageUsers: async (pageId) => {\n    // Implement page users query\n    // This should query your presence/visibility table\n    if (supabaseClient) {\n      // ROOT CAUSE FIX: Use correct table name (user_presence) and field (is_active)\n      const { data, error } = await supabaseClient\n        .from('user_presence')\n        .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatarUrl, auraColor)')\n        .eq('page_id', pageId)\n        .eq('is_active', true);\n      \n      if (error) throw error;\n      return data || [];\n    }\n    return [];\n  },\n  getUserProfile: async (userId: string) => {\n    // UUID ONLY - no email lookups\n    // Validate UUID format\n    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n    if (!uuidRegex.test(userId)) {\n      Logger.warn('\u26A0\uFE0F BUILD_GRAPH: getUserProfile called with invalid UUID', { userId }, 'visibility');\n      return null;\n    }\n    if (supabaseClient) {\n      const { data, error } = await supabaseClient\n        .from('AppUser')\n        .select('id, email, name, handle, avatarUrl, auraColor')\n        .eq('id', userId)\n        .single();\n      \n      if (error) throw error;\n      return data || null;\n    }\n    return null;\n  }\n});\n\nconst visibilityStorageService = new VisibilityStorage({\n  userPreferencesManager: window.userPreferencesManager,\n  unifiedSettingsStorage: window.unifiedSettingsStorage,\n  saveSetting: window.saveSetting,\n  getSetting: window.getSetting\n});\n\nconst visibilityState = new VisibilityState();\n\n// Create manager\nconst visibilityManager = new VisibilityManager(\n  visibilityRealtimeService,\n  logger, // Your logger instance\n  visibilityState\n);\n\n// ROOT CAUSE FIX: Initialize manager with UUID (user_id), not email\n// UUID is always present in user_presence table\n// Note: buildGraphAdapter is legacy - should use currentUserId if available\nconst currentUserId = (typeof window !== 'undefined' && (window as Window & { currentUser?: { id?: string; userId?: string } }).currentUser?.id) || \n                      (typeof window !== 'undefined' && (window as Window & { currentUser?: { id?: string; userId?: string } }).currentUser?.userId) ||\n                      null;\nif (currentUserId) {\n  await visibilityManager.initialize(currentUserId);\n} else {\n  // Fallback: if no UUID available, we can't initialize (but this shouldn't happen)\n  Logger.warn('VISIBILITY_INIT: No user ID (UUID) available in buildGraphAdapter', null, 'visibility');\n}\n\n// Create UI coordinator (handles all UI components)\nconst visibilityUIEvents = new VisibilityUIEvents(visibilityState, visibilityStorageService);\nawait visibilityUIEvents.initialize();\n\n// NO BACKWARD COMPATIBILITY - Do not export window globals\n// Use dependency injection instead\n\n// ============================================\n// END VISIBILITY MODULE INTEGRATION\n// ============================================\n";
interface VisibilityServiceOptions extends VisibilityStorageDependencies {
    supabaseClient?: SupabaseClient;
    supabaseRealtimeClient?: SupabaseRealtimeClientBridge;
    logger?: Logger;
    currentUserEmail: string;
}
export declare function createVisibilityServices(options: VisibilityServiceOptions): {
    manager: VisibilityManager;
    realtime: VisibilityRealtime;
    storage: VisibilityStorage;
    state: VisibilityState;
    uiEvents: VisibilityUIEvents;
    initialize(): Promise<void>;
};
/**
 * Migration helper - identifies what needs to be replaced
 */
export declare function getMigrationChecklist(): {
    find: string[];
    replace: string[];
    files: string[];
};
export {};
//# sourceMappingURL=buildGraphAdapter.d.ts.map
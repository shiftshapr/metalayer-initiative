/**
 * BUILDGRAPH ADAPTER - Integration Helper
 * 
 * Provides integration code snippets and adapter functions for buildGraph.js
 * Since buildGraph.js is in extension/ (not editable per .cursorrules),
 * this adapter provides the exact code needed for manual integration.
 * 
 * Usage: Copy the integration code from this file to buildGraph.js
 */

import {
  VisibilityManager,
  VisibilityRealtime,
  VisibilityStorage,
  VisibilityState,
  VisibilityUIEvents
} from '../index.js';
import type { VisibilityStorageDependencies } from '../services/VisibilityStorage.js';
import type { SupabaseClient } from '../../../types/index.js';
import type { VisibilityUser } from '../core/VisibilityTypes.js';
import type { SupabaseRealtimeClientBridge } from '../../../types/realtime.js';
import Logger from '../../../utils/Logger.js';

/**
 * Integration code snippet for buildGraph.js
 * 
 * REPLACE the old visibility initialization with this code:
 */
export const BUILDGRAPH_INTEGRATION_CODE = `
// ============================================
// VISIBILITY MODULE INTEGRATION (NEW ARCHITECTURE)
// ============================================
// Replace old VisibilityManager initialization with this:

import { 
  Logger,
  VisibilityManager,
  VisibilityRealtime,
  VisibilityStorage,
  VisibilityState,
  VisibilityUIEvents
} from '../features/visibility/index.js';

// Create services
const visibilityRealtimeService = new VisibilityRealtime({
  on: (event, handler) => {
    // Connect to your Supabase realtime client
    if (supabaseRealtimeClient?.on) {
      supabaseRealtimeClient.on(event, handler);
    }
  },
  getPageUsers: async (pageId) => {
    // Implement page users query
    // This should query your presence/visibility table
    if (supabaseClient) {
      // ROOT CAUSE FIX: Use correct table name (user_presence) and field (is_active)
      const { data, error } = await supabaseClient
        .from('user_presence')
        .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatarUrl, auraColor)')
        .eq('page_id', pageId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    }
    return [];
  },
  getUserProfile: async (userId: string) => {
    // UUID ONLY - no email lookups
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      Logger.warn('⚠️ BUILD_GRAPH: getUserProfile called with invalid UUID', { userId }, 'visibility');
      return null;
    }
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('AppUser')
        .select('id, email, name, handle, avatarUrl, auraColor')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data || null;
    }
    return null;
  }
});

const visibilityStorageService = new VisibilityStorage({
  userPreferencesManager: window.userPreferencesManager,
  unifiedSettingsStorage: window.unifiedSettingsStorage,
  saveSetting: window.saveSetting,
  getSetting: window.getSetting
});

const visibilityState = new VisibilityState();

// Create manager
const visibilityManager = new VisibilityManager(
  visibilityRealtimeService,
  logger, // Your logger instance
  visibilityState
);

// ROOT CAUSE FIX: Initialize manager with UUID (user_id), not email
// UUID is always present in user_presence table
// Note: buildGraphAdapter is legacy - should use currentUserId if available
const currentUserId = (typeof window !== 'undefined' && (window as Window & { currentUser?: { id?: string; userId?: string } }).currentUser?.id) || 
                      (typeof window !== 'undefined' && (window as Window & { currentUser?: { id?: string; userId?: string } }).currentUser?.userId) ||
                      null;
if (currentUserId) {
  await visibilityManager.initialize(currentUserId);
} else {
  // Fallback: if no UUID available, we can't initialize (but this shouldn't happen)
  Logger.warn('VISIBILITY_INIT: No user ID (UUID) available in buildGraphAdapter', null, 'visibility');
}

// Create UI coordinator (handles all UI components)
const visibilityUIEvents = new VisibilityUIEvents(visibilityState, visibilityStorageService);
await visibilityUIEvents.initialize();

// NO BACKWARD COMPATIBILITY - Do not export window globals
// Use dependency injection instead

// ============================================
// END VISIBILITY MODULE INTEGRATION
// ============================================
`;

interface VisibilityServiceOptions extends VisibilityStorageDependencies {
  supabaseClient?: SupabaseClient;
  supabaseRealtimeClient?: SupabaseRealtimeClientBridge;
  logger?: Logger;
  currentUserEmail: string;
}

interface PresenceRecord {
  user_id?: string;
  AppUser?: {
    email?: string;
    name?: string;
    handle?: string;
    avatar_url?: string;
    aura_color?: string;
  };
  page_id?: string;
  last_seen?: string;
  is_active?: boolean;
}


export function createVisibilityServices(options: VisibilityServiceOptions) {
  const {
    supabaseClient,
    supabaseRealtimeClient,
    logger,
    userPreferencesManager,
    unifiedSettingsStorage,
    saveSetting,
    getSetting,
    currentUserEmail
  } = options;

  // Create realtime service
  const realtime = new VisibilityRealtime({
    on: (event, handler) => {
      supabaseRealtimeClient?.on?.(event, handler);
    },
    getPageUsers: async (pageId) => {
      if (!supabaseClient) {
        return [];
      }
      try {
        // ROOT CAUSE FIX: Use correct table name (user_presence) and field (is_active)
        const { data, error } = await supabaseClient
          .from<PresenceRecord>('user_presence')
          .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatarUrl, auraColor)')
          .eq('page_id', pageId)
          .eq('is_active', true);
        if (error) {
          return [];
        }
        return (data || []).map<VisibilityUser>((record) => ({
          id: record.user_id || '',
          userId: record.user_id || '',
          email: record.AppUser?.email || '',
          name: record.AppUser?.name,
          handle: record.AppUser?.handle,
          avatarUrl: record.AppUser?.avatar_url,
          auraColor: record.AppUser?.aura_color,
          pageId: record.page_id || pageId,
          lastSeen: record.last_seen,
          isActive: record.is_active ?? false
        }));
      } catch {
        return [];
      }
    },
    getUserProfile: async (userId: string) => {
      // UUID ONLY - no email lookups
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        Logger.warn('⚠️ BUILD_GRAPH_ADAPTER: getUserProfile called with invalid UUID', { userId }, 'visibility');
        return null;
      }
      if (!supabaseClient) {
        return null;
      }
      try {
        const { data, error } = await supabaseClient
          .from('AppUser')
          .select('id, email, name, handle, avatarUrl, auraColor')
          .eq('id', userId)
          .single();
        if (error) {
          return null;
        }
        if (!data) {
          return null;
        }
        return {
          id: data.id as string,
          email: data.email as string | undefined,
          name: data.name as string | undefined,
          handle: data.handle as string | undefined,
          avatarUrl: data.avatar_url as string | undefined,
          auraColor: data.aura_color as string | undefined
        };
      } catch {
        return null;
      }
    }
  });

  // Create storage service
  const storage = new VisibilityStorage({
    userPreferencesManager,
    unifiedSettingsStorage,
    saveSetting,
    getSetting
  });

  // Create state
  const state = new VisibilityState();

  // Create manager
  const visibilityLogger = logger ?? new Logger();
  const manager = new VisibilityManager(realtime, visibilityLogger, state);
  
  // Create UI coordinator
  const uiEvents = new VisibilityUIEvents(state, storage);

  return {
    manager,
    realtime,
    storage,
    state,
    uiEvents,
    async initialize() {
      await manager.initialize(currentUserEmail);
      await uiEvents.initialize();
    }
  };
}

/**
 * Migration helper - identifies what needs to be replaced
 */
export function getMigrationChecklist() {
  return {
    find: [
      'import.*VisibilityManager.*from.*VisibilityManager',
      'new VisibilityManager\\(.*\\)',
      'window\\.visibilityManager',
      'updateVisibleTab',
      'currentVisibilityData'
    ],
    replace: [
      'Use new imports from visibility/index.js',
      'Use new VisibilityManager with dependency injection',
      'Remove window globals - use dependency injection',
      'Use VisibilityTab component instead',
      'Use VisibilityState instead'
    ],
    files: [
      'extension/sidepanel/buildGraph.js',
      'sidepanel/buildGraph.js'
    ]
  };
}


/**
 * SUPABASE REALTIME CLIENT FIX
 * 
 * ROOT CAUSE FIX: SupabaseRealtimeClient.getPageUsers() fallback query doesn't include
 * AppUser relation and has restrictive 24-hour filter. This patch fixes it.
 * 
 * This module patches SupabaseRealtimeClient.getPageUsers() at runtime to:
 * 1. Skip API endpoint if it returns 401 (Unauthorized)
 * 2. Use direct database query with AppUser relation
 * 3. Filter by is_active = true instead of 24-hour time window
 */

// Auto-apply patch when module loads
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
import type { SupabasePresenceRecord } from '../types/supabaseTables.js';
import type { VisibilityUser } from '../features/visibility/core/VisibilityTypes.js';
import type { SupabaseClient as LegacySupabaseClient } from '../types/index.js';
import { initializeRealtimeSubscriptionService } from './RealtimeSubscriptionService.js';
import type { RealtimeSubscriptionService, SubscriptionConfig } from './RealtimeSubscriptionService.js';

type CompatibleSupabaseClient = LegacySupabaseClient;
type RealtimeSupabaseClient = Parameters<typeof initializeRealtimeSubscriptionService>[0];

type WindowWithRealtimeClient = Window & {
  SupabaseRealtimeClient?: {
    prototype?: {
      getPageUsers?: (pageId: string) => Promise<VisibilityUser[]>;
      supabase?: CompatibleSupabaseClient | null;
    };
  };
  METALAYER_API_URL?: string;
  currentUrlData?: { rawUrl?: string; pageId?: string };
  currentUser?: { id?: string; email?: string };
  supabase?: CompatibleSupabaseClient | null;
};

type ServerPresenceUser = {
  id?: string;
  userId?: string;
  user_id?: string;
  email?: string;
  user_email?: string;
  handle?: string;
  name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  auraColor?: string;
  aura_color?: string;
  isActive?: boolean;
  is_active?: boolean;
  lastSeen?: string;
  last_seen?: string;
  enterTime?: string;
  enter_time?: string;
  status?: string;
};

const mapServerPresenceUser = (user: ServerPresenceUser, pageId: string): VisibilityUser => {
  const isActive = user.isActive ?? user.is_active ?? true;
  const lastSeen = user.lastSeen ?? user.last_seen ?? null;
  return {
    id: user.id ?? user.userId ?? user.user_id ?? '',
    email: user.email ?? user.user_email ?? 'unknown@unknown',
    handle: user.handle,
    name: user.name,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? undefined,
    auraColor: user.auraColor ?? user.aura_color ?? '#ffffff',
    isActive,
    status: user.status ?? (isActive ? 'online' : lastSeen ? 'recently_seen' : 'offline'),
    lastSeen: lastSeen || undefined,
    pageId
  };
};

const mapPresenceRecord = (record: SupabasePresenceRecord, fallbackPageId: string): VisibilityUser => {
  const isActive = record.is_active ?? false;
  const lastSeen = record.last_seen ?? null;
  return {
    id: record.user_id ?? '',
    email: record.AppUser?.email ?? '',
    handle: record.AppUser?.handle ?? undefined,
    name: record.AppUser?.name ?? undefined,
    avatarUrl: record.AppUser?.avatar_url ?? record.AppUser?.avatarUrl ?? undefined,
    auraColor: record.AppUser?.aura_color ?? record.AppUser?.auraColor ?? '#ffffff',
    isActive,
    status: isActive ? 'online' : 'offline',
    lastSeen: lastSeen || undefined,
    pageId: record.page_id ?? fallbackPageId
  };
};

/**
 * Fallback query helper for SupabaseRealtimeClientFix
 * Checks for presence records with similar pageIds (normalization issues)
 */
async function getPageUsersFallback(querySource: LegacySupabaseClient, pageId: string): Promise<VisibilityUser[]> {
  try {
    Logger.debug('🔍 SUPABASE_CLIENT: Running fallback query for pageId:', pageId, 'general');
    
    // Check for similar pageIds (normalization issues)
    // Extract base domain from pageId (e.g., "google_com_" from "developers_google_com_profile_u_104661641557936501987")
    const baseDomainMatch = pageId.match(/^([a-z]+_[a-z]+_)/);
    if (baseDomainMatch) {
      const baseDomain = baseDomainMatch[1];
      Logger.debug('🔍 SUPABASE_CLIENT: Checking for similar pageIds with base domain:', baseDomain, 'general');
      
      const { data: similarData } = await querySource
        .from('user_presence')
        .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatarUrl, auraColor)')
        .like('page_id', `${baseDomain}%`)
        .eq('is_active', true)
        .limit(20);

      if (similarData && similarData.length > 0) {
        Logger.warn('⚠️ SUPABASE_CLIENT: Found presence records with similar pageIds', { 
          current: pageId, 
          found: similarData.map(r => r.page_id) 
        }, 'general');
        
        // Return users from similar pageIds (they're on the same domain)
        const records = similarData as SupabasePresenceRecord[];
        return records.map((record) => mapPresenceRecord(record, pageId));
      }
    }

    return [];
  } catch (fallbackError: unknown) {
    Logger.error('❌ SUPABASE_CLIENT: Fallback query also failed', fallbackError instanceof Error ? fallbackError : { error: String(fallbackError) }, 'general');
    return [];
  }
}

type PatchedGetPageUsers = ((pageId: string) => Promise<VisibilityUser[]>) & {
  __supabasePatched?: boolean;
};

let supabaseRealtimePatchScheduled = false;
let supabaseRealtimePatchApplied = false;

const createPatchedGetPageUsers = () => {
  return async function patchedGetPageUsers(this: { supabase?: CompatibleSupabaseClient | null }, pageId: string): Promise<VisibilityUser[]> {
    try {
      Logger.debug('👁️ SUPABASE_CLIENT: Getting users for page:', pageId, 'general');

      if (!this.supabase) {
        Logger.error('❌ SUPABASE_CLIENT: Client not initialized', null, 'general');
        return [];
      }

      const supabaseClient = this.supabase as CompatibleSupabaseClient;
      const querySource = supabaseClient as LegacySupabaseClient;

      try {
        const win = window as WindowWithRealtimeClient;
        const rawUrl = win.currentUrlData?.rawUrl || window.location?.href || '';
        const params = new URLSearchParams({ url: rawUrl });
        const currentUser = win.currentUser || {};
        // UUID ONLY - no email headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(currentUser.id ? { 'X-User-Id': currentUser.id, 'x-user-id': currentUser.id } : {})
        };

        const apiUrl = win.METALAYER_API_URL;
        if (apiUrl) {
          const resp = await fetch(`${apiUrl}/v1/presence/url?${params}`, { headers });
          if (resp.ok) {
            const j = await resp.json() as { active?: ServerPresenceUser[] };
            const active = Array.isArray(j?.active) ? j.active : [];
            const serverUsers = active.map((user) => mapServerPresenceUser(user, pageId));
            Logger.debug('✅ SUPABASE_CLIENT: Using server-enriched presence users:', serverUsers.length, 'general');
            return serverUsers;
          }

          if (resp.status === 401) {
            Logger.warn('⚠️ SUPABASE_CLIENT: presence/url failed with 401 (Unauthorized), using direct database query', null, 'general');
          } else {
            Logger.warn('⚠️ SUPABASE_CLIENT: presence/url failed', { status: resp.status }, 'general');
          }
        }
      } catch (serverErr: unknown) {
        handleError(serverErr, {
          log: true,
          logLevel: 'warn',
          context: {
            operation: 'handleRealtimeError',
            component: 'SupabaseRealtimeClientFix'
          }
        });
      }

      // ROOT CAUSE FIX: Use explicit foreign key syntax AppUser:user_id(*) like messages query
      // ROOT CAUSE FIX: Two-step query approach - avoids AppUser relation syntax issues
      // Step 1: Query user_presence (user_id/UUID is always present)
      const { data: presenceData, error: presenceError } = await querySource
        .from('user_presence')
        .select('user_id, page_id, last_seen, is_active')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .order('last_seen', { ascending: false });

      if (presenceError) {
        Logger.error('❌ SUPABASE_CLIENT: Failed to get page users:', presenceError, 'general');
        return await getPageUsersFallback(querySource, pageId);
      }

      if (!presenceData || presenceData.length === 0) {
        Logger.debug('ℹ️ SUPABASE_CLIENT: No active users found for pageId:', pageId, 'general');
        return await getPageUsersFallback(querySource, pageId);
      }

      // Step 2: Batch fetch AppUser data using user_ids (UUIDs are always present)
      const presenceRecords = presenceData as SupabasePresenceRecord[];
      const userIds = presenceRecords
        .map((r) => r.user_id)
        .filter((id): id is string => !!id);
      
      if (userIds.length === 0) {
        return [];
      }

      const { data: appUserData, error: appUserError } = await querySource
        .from('AppUser')
        .select('id, email, name, handle, avatarUrl, auraColor')
        .in('id', userIds);

      if (appUserError) {
        Logger.warn('⚠️ SUPABASE_CLIENT: Failed to fetch AppUser data, continuing without it', appUserError, 'general');
        // Continue without AppUser data - users will show as "Unknown" but at least they'll be visible
      }

      // Create a map of user_id -> AppUser data for quick lookup
      const appUserMap = new Map<string, { id?: string; email?: string; name?: string; handle?: string; avatar_url?: string; aura_color?: string }>();
      ((appUserData || []) as Array<{ id?: string; email?: string; name?: string; handle?: string; avatar_url?: string; aura_color?: string }>).forEach((u) => {
        if (u.id) {
          appUserMap.set(u.id, u);
        }
      });

      // Combine presence data with AppUser data
      const combinedRecords = presenceRecords.map((presence) => ({
        ...presence,
        AppUser: appUserMap.get(presence.user_id || '') || null
      })) as SupabasePresenceRecord[];

      Logger.debug('✅ SUPABASE_CLIENT: Found active users for page', { 
        presenceCount: combinedRecords.length, 
        appUserCount: appUserMap.size,
        pageId 
      }, 'general');
      return combinedRecords.map((record) => mapPresenceRecord(record, pageId));
    } catch (error: unknown) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'catch',
          component: 'SupabaseRealtimeClientFix'
        }
      });
      return [];
    }
  };
};

export function applySupabaseRealtimeClientFix(): void {
  if (supabaseRealtimePatchApplied || supabaseRealtimePatchScheduled) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  supabaseRealtimePatchScheduled = true;

  const checkAndPatch = () => {
    const win = window as WindowWithRealtimeClient;
    const proto = win.SupabaseRealtimeClient?.prototype;

    if (!proto) {
      setTimeout(checkAndPatch, 100);
      return;
    }

    const currentImpl = proto.getPageUsers as PatchedGetPageUsers | undefined;
    if (currentImpl?.__supabasePatched) {
      supabaseRealtimePatchApplied = true;
      return;
    }

    const patched = createPatchedGetPageUsers() as PatchedGetPageUsers;
    patched.__supabasePatched = true;
    proto.getPageUsers = patched;
    supabaseRealtimePatchApplied = true;
    Logger.debug('✅ SUPABASE_REALTIME_CLIENT_FIX: Patched getPageUsers to use AppUser relation and proper filtering', null, 'general');
  };

  checkAndPatch();
}

interface SupabaseRealtimeInitOptions {
  supabaseClient?: CompatibleSupabaseClient | null;
  subscribeConfig?: SubscriptionConfig;
}

let supabaseRealtimeInitPromise: Promise<RealtimeSubscriptionService | null> | null = null;
let supabaseRealtimeDomGuardsAttached = false;
const supabaseRealtimeSubscribedPages = new Set<string>();

const getSupabaseClient = (options: SupabaseRealtimeInitOptions): CompatibleSupabaseClient | null => {
  if (options.supabaseClient) {
    return options.supabaseClient;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return (window as WindowWithRealtimeClient).supabase ?? null;
};

const attachRealtimeDomGuards = (service: RealtimeSubscriptionService): void => {
  if (supabaseRealtimeDomGuardsAttached || typeof window === 'undefined') {
    return;
  }

  window.addEventListener('beforeunload', () => service.unsubscribeAll());
  window.addEventListener('metalayer:unsubscribe-realtime', () => service.unsubscribeAll());
  supabaseRealtimeDomGuardsAttached = true;
};

export async function initializeSupabaseRealtimeServices(options: SupabaseRealtimeInitOptions = {}): Promise<RealtimeSubscriptionService | null> {
  if (typeof window === 'undefined') {
    Logger.debug('ℹ️ SupabaseRealtimeServices: Skipping initialization (no window)', null, 'general');
    return null;
  }

  applySupabaseRealtimeClientFix();

  const supabaseClient = getSupabaseClient(options);

  if (!supabaseClient) {
    Logger.warn('⚠️ SupabaseRealtimeServices: Supabase client missing, cannot initialize realtime services', null, 'general');
    supabaseRealtimeInitPromise = null;
    return null;
  }

  if (!supabaseRealtimeInitPromise) {
    supabaseRealtimeInitPromise = (async () => {
      const service = initializeRealtimeSubscriptionService(supabaseClient as unknown as RealtimeSupabaseClient);
      const ready = await service.initialize();
      if (!ready) {
        Logger.error('❌ SupabaseRealtimeServices: Realtime subscription service failed to initialize', null, 'general');
        return null;
      }
      attachRealtimeDomGuards(service);
      return service;
    })().catch((error) => {
      supabaseRealtimeInitPromise = null;
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'initializeSupabaseRealtimeServices',
          component: 'SupabaseRealtimeClientFix'
        }
      });
      return null;
    });
  }

  const service = await supabaseRealtimeInitPromise;

  if (!service) {
    supabaseRealtimeInitPromise = null;
    return null;
  }

  const subscribeConfig = options.subscribeConfig;
  if (subscribeConfig?.pageId) {
    if (supabaseRealtimeSubscribedPages.has(subscribeConfig.pageId)) {
      Logger.debug('ℹ️ SupabaseRealtimeServices: Page already subscribed, skipping duplicate wiring', { pageId: subscribeConfig.pageId }, 'general');
    } else {
      const subscribed = await service.subscribeToPage(subscribeConfig);
      if (subscribed) {
        supabaseRealtimeSubscribedPages.add(subscribeConfig.pageId);
      }
    }
  }

  return service;
}

export const supabaseRealtimeApi = {
  applySupabaseRealtimeClientFix,
  initializeSupabaseRealtimeServices
};

export default supabaseRealtimeApi;

if (typeof window !== 'undefined') {
  applySupabaseRealtimeClientFix();
}


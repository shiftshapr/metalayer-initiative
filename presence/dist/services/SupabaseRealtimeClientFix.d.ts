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
import type { SupabaseClient as LegacySupabaseClient } from '../types/index.js';
import type { RealtimeSubscriptionService, SubscriptionConfig } from './RealtimeSubscriptionService.js';
type CompatibleSupabaseClient = LegacySupabaseClient;
export declare function applySupabaseRealtimeClientFix(): void;
interface SupabaseRealtimeInitOptions {
    supabaseClient?: CompatibleSupabaseClient | null;
    subscribeConfig?: SubscriptionConfig;
}
export declare function initializeSupabaseRealtimeServices(options?: SupabaseRealtimeInitOptions): Promise<RealtimeSubscriptionService | null>;
export declare const supabaseRealtimeApi: {
    applySupabaseRealtimeClientFix: typeof applySupabaseRealtimeClientFix;
    initializeSupabaseRealtimeServices: typeof initializeSupabaseRealtimeServices;
};
export default supabaseRealtimeApi;
//# sourceMappingURL=SupabaseRealtimeClientFix.d.ts.map
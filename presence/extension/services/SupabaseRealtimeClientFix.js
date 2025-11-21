"use strict";
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
function applySupabaseRealtimeClientFix() {
    if (typeof window === 'undefined') {
        return;
    }
    // Wait for SupabaseRealtimeClient to be available
    const checkAndPatch = () => {
        const win = window;
        if (!win.SupabaseRealtimeClient?.prototype) {
            // Not loaded yet, try again in 100ms
            setTimeout(checkAndPatch, 100);
            return;
        }
        const proto = win.SupabaseRealtimeClient.prototype;
        if (!proto.getPageUsers) {
            // Method not available yet, try again
            setTimeout(checkAndPatch, 100);
            return;
        }
        // Patch the method
        const originalMethod = proto.getPageUsers;
        proto.getPageUsers = async function (pageId) {
            try {
                console.log('👁️ SUPABASE_CLIENT: Getting users for page:', pageId);
                if (!this.supabase) {
                    console.error('❌ SUPABASE_CLIENT: Client not initialized');
                    return [];
                }
                // ROOT CAUSE FIX: Skip API endpoint if it's failing (401), go straight to database query
                let useApiEndpoint = true;
                try {
                    const rawUrl = window.currentUrlData?.rawUrl || window.location?.href || '';
                    const params = new URLSearchParams({ url: rawUrl });
                    const currentUser = window.currentUser || {};
                    const headers = {
                        'Content-Type': 'application/json',
                        ...(currentUser.id ? { 'X-User-Id': currentUser.id, 'x-user-id': currentUser.id } : {}),
                        ...(currentUser.email ? { 'X-User-Email': currentUser.email, 'x-user-email': currentUser.email } : {})
                    };
                    const apiUrl = window.METALAYER_API_URL;
                    if (apiUrl) {
                        const resp = await fetch(`${apiUrl}/v1/presence/url?${params}`, { headers });
                        if (resp.ok) {
                            const j = await resp.json();
                            const active = Array.isArray(j?.active) ? j.active : [];
                            const serverUsers = active.map((u) => {
                                const user = u;
                                return {
                                    user_email: user.email || user.handle || 'unknown@unknown',
                                    user_id: user.id || user.userId,
                                    is_active: user.isActive !== undefined ? user.isActive : (user.isActive !== false),
                                    last_seen: user.lastSeen || null,
                                    enter_time: user.enterTime || user.lastSeen || null,
                                    aura_color: user.auraColor || '#ffffff',
                                    name: user.name,
                                    avatar_url: user.avatarUrl,
                                    status: user.status || (user.isActive ? 'online' : (user.lastSeen ? 'recently_seen' : 'offline')),
                                    isActive: user.isActive,
                                    enterTime: user.enterTime || user.lastSeen,
                                    lastSeen: user.lastSeen
                                };
                            });
                            console.log('✅ SUPABASE_CLIENT: Using server-enriched presence users:', serverUsers.length);
                            return serverUsers;
                        }
                        else if (resp.status === 401) {
                            console.warn('⚠️ SUPABASE_CLIENT: presence/url failed with 401 (Unauthorized), using direct database query');
                            useApiEndpoint = false;
                        }
                        else {
                            console.warn('⚠️ SUPABASE_CLIENT: presence/url failed with', resp.status);
                            useApiEndpoint = false;
                        }
                    }
                }
                catch (serverErr) {
                    console.warn('⚠️ SUPABASE_CLIENT: presence/url error:', serverErr?.message || serverErr);
                    useApiEndpoint = false;
                }
                // ROOT CAUSE FIX: Use direct database query with AppUser relation (like SupabaseService does)
                // ROOT CAUSE FIX: Filter by is_active = true instead of 24-hour time window
                const supabaseClient = this.supabase;
                // ROOT CAUSE FIX: Query with AppUser relation and filter by is_active (not time-based)
                if (!supabaseClient) {
                    throw new Error('Supabase client not available');
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const queryBuilder = supabaseClient
                    .from('user_presence')
                    .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatar_url, aura_color)')
                    .eq('page_id', pageId)
                    .eq('is_active', true); // ROOT CAUSE FIX: Only get active users, not time-filtered
                // Type-safe order call - Supabase query builder always has order method after eq()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data, error } = await queryBuilder.order('last_seen', { ascending: false });
                if (error) {
                    console.error('❌ SUPABASE_CLIENT: Failed to get page users:', error);
                    return [];
                }
                if (!data || data.length === 0) {
                    console.log('ℹ️ SUPABASE_CLIENT: No active users found for pageId:', pageId);
                    return [];
                }
                console.log('✅ SUPABASE_CLIENT: Found', data.length, 'active users for page:', pageId);
                // ROOT CAUSE FIX: Transform to match expected format with AppUser data
                return data.map((record) => ({
                    user_email: record.AppUser?.email || '',
                    user_id: record.user_id || '',
                    is_active: record.is_active || false,
                    last_seen: record.last_seen || null,
                    enter_time: record.last_seen || null,
                    aura_color: record.AppUser?.aura_color || '#ffffff',
                    name: record.AppUser?.name,
                    avatar_url: record.AppUser?.avatar_url,
                    handle: record.AppUser?.handle,
                    status: record.is_active ? 'online' : 'offline',
                    isActive: record.is_active,
                    enterTime: record.last_seen,
                    lastSeen: record.last_seen,
                    // Also include camelCase fields for compatibility
                    id: record.user_id,
                    email: record.AppUser?.email,
                    avatarUrl: record.AppUser?.avatar_url,
                    auraColor: record.AppUser?.aura_color,
                    page_id: record.page_id
                }));
            }
            catch (error) {
                console.error('❌ SUPABASE_CLIENT: getPageUsers error:', error);
                return [];
            }
        };
        console.log('✅ SUPABASE_REALTIME_CLIENT_FIX: Patched getPageUsers to use AppUser relation and proper filtering');
    };
    // Start checking immediately and retry if needed
    checkAndPatch();
}
// Auto-apply on module load
if (typeof window !== 'undefined') {
    applySupabaseRealtimeClientFix();
}

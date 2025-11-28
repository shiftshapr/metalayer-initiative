/**
 * VISIBILITY REALTIME SERVICE - Real-time Data Service Abstraction
 *
 * Abstracts Supabase realtime operations for visibility system.
 * Phase 2: Core Logic Separation - Service Abstraction
 */
/**
 * VisibilityRealtime service implementation
 * Wraps Supabase realtime client to provide abstraction
 */
export class VisibilityRealtime {
    constructor(supabaseClient) {
        this.supabaseClient = supabaseClient;
    }
    /**
     * Subscribe to realtime events
     */
    on(event, handler) {
        this.supabaseClient.on(event, handler);
    }
    /**
     * Get users for a specific page
     */
    async getPageUsers(pageId) {
        return this.supabaseClient.getPageUsers(pageId);
    }
    /**
     * Get user profile by UUID
     * UUID ONLY - no email lookups
     */
    async getUserProfile(userId) {
        return this.supabaseClient.getUserProfile(userId);
    }
}
//# sourceMappingURL=VisibilityRealtime.js.map
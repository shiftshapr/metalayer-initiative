/**
 * VISIBILITY REALTIME SERVICE - Real-time Data Service Abstraction
 *
 * Abstracts Supabase realtime operations for visibility system.
 * Phase 2: Core Logic Separation - Service Abstraction
 */
import type { IVisibilityRealtime, VisibilityUser } from '../core/VisibilityTypes.js';
import type { User } from '../../../types/index.js';
/**
 * VisibilityRealtime service implementation
 * Wraps Supabase realtime client to provide abstraction
 */
export declare class VisibilityRealtime implements IVisibilityRealtime {
    private supabaseClient;
    constructor(supabaseClient: {
        on: (event: string, handler: (eventType: string, newRecord: unknown, oldRecord: unknown) => void) => void;
        getPageUsers: (pageId: string) => Promise<VisibilityUser[]>;
        getUserProfile: (userId: string) => Promise<Partial<User> | null>;
    });
    /**
     * Subscribe to realtime events
     */
    on(event: string, handler: (eventType: string, newRecord: unknown, oldRecord: unknown) => void): void;
    /**
     * Get users for a specific page
     */
    getPageUsers(pageId: string): Promise<VisibilityUser[]>;
    /**
     * Get user profile by UUID
     * UUID ONLY - no email lookups
     */
    getUserProfile(userId: string): Promise<Partial<User> | null>;
}
//# sourceMappingURL=VisibilityRealtime.d.ts.map
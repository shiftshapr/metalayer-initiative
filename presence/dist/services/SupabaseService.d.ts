/**
 * SUPABASE SERVICE - TypeScript + ES6 Module
 * Supabase client service management
 */
import type { SupabaseClient, User } from '../types/index.js';
declare class SupabaseService {
    private isInitialized;
    private client;
    private isTriggeringAuth;
    initialize(): Promise<SupabaseClient>;
    /**
     * COMP BEHAVIOR: Trigger automatic Chrome Identity auth using existing realGoogleAuth
     * This uses the existing real-google-auth.js code that was working before migration
     */
    private triggerChromeIdentityAuth;
    getClient(): SupabaseClient;
    /**
     * Get users visible on a specific page
     * ROOT CAUSE FIX: Implement getPageUsers for VisibilityManager
     *
     * FIX: Added diagnostic logging and fallback query to help diagnose visibility issues
     */
    getPageUsers(pageId: string): Promise<Array<Partial<User> & {
        pageId?: string;
        lastSeen?: string;
        isActive?: boolean;
    }>>;
    /**
     * Fallback query to diagnose visibility issues
     * Checks for presence records with same pageId but different is_active status,
     * or similar pageIds (for normalization issues)
     */
    private getPageUsersFallback;
    /**
     * Get user profile by email
     * ROOT CAUSE FIX: Implement getUserProfile for VisibilityManager
     */
    getUserProfile(userId: string): Promise<Partial<User> | null>;
    /**
     * Set up event handlers for presence events
     * ROOT CAUSE FIX: Implement on() method for VisibilityManager
     */
    on(_event: string, handler: (eventType: string, newRecord: unknown, oldRecord: unknown) => void): void;
}
declare const supabaseServiceInstance: SupabaseService;
export { SupabaseService, supabaseServiceInstance };
export default SupabaseService;
/**
 * Initialize the Supabase service instance.
 *
 * This function should be called when the application starts to ensure
 * the Supabase client is ready for use. It initializes the service
 * asynchronously and handles any initialization errors.
 *
 * @example
 * ```typescript
 * initializeSupabaseService();
 * // Service will be available via supabaseServiceInstance after initialization
 * ```
 *
 * @returns {void}
 */
export declare function initializeSupabaseService(): void;
//# sourceMappingURL=SupabaseService.d.ts.map
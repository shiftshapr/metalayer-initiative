/**
 * SUPABASE SERVICE - TypeScript + ES6 Module
 * Supabase client service management
 */
import { SupabaseClient } from '../types/index.js';
declare class SupabaseService {
    private logLevel;
    private isInitialized;
    private client;
    constructor();
    /**
     * Initialize SupabaseService (FOLLOWING COMP Method Exactly)
     */
    initialize(): Promise<SupabaseClient>;
    /**
     * Get the Supabase client instance
     * RED-LINE: Use this method instead of window.supabase
     */
    getClient(): SupabaseClient;
}
declare const supabaseServiceInstance: SupabaseService;
export { SupabaseService, supabaseServiceInstance };
export default SupabaseService;
export declare function initializeSupabaseService(): void;
//# sourceMappingURL=SupabaseService.d.ts.map
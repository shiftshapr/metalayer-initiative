/**
 * SUPABASE SERVICE - TypeScript + ES6 Module
 * Supabase client service management
 */
class SupabaseService {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
        this.client = null;
        this.logLevel = 'INFO';
        this.isInitialized = false;
        this.client = null;
    }
    /**
     * Initialize SupabaseService (FOLLOWING COMP Method Exactly)
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ SUPABASE: Already initialized');
            return this.client;
        }
        try {
            // COMP METHOD: Direct initialization
            if (typeof supabase === 'undefined') {
                console.error('❌ SUPABASE: supabase library not loaded');
                throw new Error('Supabase library not available');
            }
            // RED-LINE: Store client in instance, NOT window (for module imports)
            this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            // Also set window.supabase for backward compatibility with extension scripts
            if (typeof window !== 'undefined') {
                window.supabase = this.client;
            }
            console.log('✅ SUPABASE: Global client initialized successfully');
            console.log('✅ SUPABASE: URL:', SUPABASE_URL);
            console.log('✅ SUPABASE: Key present:', !!SUPABASE_ANON_KEY);
            console.log('✅ SUPABASE: Client methods available:', Object.keys(this.client).slice(0, 10));
            // CRITICAL FIX: Set up Supabase authentication after user login
            console.log('🔧 SUPABASE: Setting up authentication listener...');
            this.client.auth.onAuthStateChange((event, session) => {
                console.log('🔔 SUPABASE AUTH: Auth state changed:', event);
                if (session) {
                    console.log('✅ SUPABASE AUTH: User authenticated:', session.user.email);
                    console.log('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000));
                    // Initialize RobustIntegration now that user is authenticated
                    const win = window;
                    if (win.robustIntegration && !win.robustIntegration.isInitialized) {
                        console.log('🔗 AUTH: Initializing RobustIntegration after authentication...');
                        win.robustIntegration.initialize().then((success) => {
                            if (success) {
                                console.log('✅ AUTH: RobustIntegration initialized successfully');
                            }
                            else {
                                console.error('❌ AUTH: RobustIntegration initialization failed');
                            }
                        });
                    }
                }
                else {
                    console.log('❌ SUPABASE AUTH: User not authenticated');
                }
            });
            this.isInitialized = true;
            console.log('✅ SUPABASE: SupabaseService initialized successfully');
            // Return client instance for module imports (RED-LINE: no window references)
            return this.client;
        }
        catch (error) {
            console.error('❌ SUPABASE: Initialization failed:', error);
            throw error;
        }
    }
    /**
     * Get the Supabase client instance
     * RED-LINE: Use this method instead of window.supabase
     */
    getClient() {
        if (!this.isInitialized || !this.client) {
            throw new Error('SupabaseService not initialized. Call initialize() first.');
        }
        return this.client;
    }
}
// Create singleton instance
const supabaseServiceInstance = new SupabaseService();
// Export as ES6 module
export { SupabaseService, supabaseServiceInstance };
export default SupabaseService;
// Auto-initialize function (will be called from HTML)
export function initializeSupabaseService() {
    // COMP METHOD: Direct initialization without waiting loops
    if (typeof supabase === 'undefined') {
        console.error('❌ SUPABASE: supabase library not loaded');
        return;
    }
    console.log('✅ SUPABASE: Library loaded, initializing service...');
    supabaseServiceInstance.initialize().then(() => {
        console.log('✅ SupabaseService initialized and connected');
    }).catch((error) => {
        console.error('❌ SUPABASE: SupabaseService initialization failed:', error);
    });
}
// Note: Window exports and auto-initialization will be added in compiled JS
// TypeScript source uses pure ES6 exports only
//# sourceMappingURL=SupabaseService.js.map

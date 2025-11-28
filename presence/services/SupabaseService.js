/**
 * SUPABASE SERVICE - TypeScript + ES6 Module
 * Supabase client service management
 */
import { stateManagerInstance } from '../core/StateManager.js';
// Import Supabase as ES6 module (runtime import - TypeScript can't resolve absolute path)
// @ts-ignore - Runtime path, TypeScript can't resolve
let createClient = null;
// Dynamic import function
async function loadSupabaseClient() {
    if (createClient) {
        return createClient;
    }
    
    // CRITICAL FIX: Wait for Supabase library to be fully loaded
    // The library is loaded as <script type="module" src="lib/supabase.min.js"> in sidepanel.html
    // It may not be immediately available, so we need to wait for it
    let attempts = 0;
    const maxAttempts = 20; // 20 * 100ms = 2 seconds max wait
    const delay = 100;
    
    while (attempts < maxAttempts) {
        try {
            // Try to import from correct path (relative to extension root)
            // The script is loaded from extension/lib/supabase.min.js in sidepanel.html
            const supabaseModule = await import('./lib/supabase.min.js');
            if (supabaseModule && typeof supabaseModule.createClient === 'function') {
                createClient = supabaseModule.createClient;
                console.log('✅ SUPABASE: createClient loaded from ES6 module');
                return createClient;
            }
        }
        catch (e) {
            // Module import failed, try other methods
        }
        
        // Fallback: Check for global supabase object (loaded as script tag)
        if (typeof window !== 'undefined') {
            const win = window;
            // CRITICAL FIX: Check if window.supabase is the library object (has createClient)
            // NOT the client instance (which would have auth but not createClient)
            if (win.supabase && typeof win.supabase.createClient === 'function') {
                createClient = win.supabase.createClient;
                console.log('✅ SUPABASE: createClient loaded from window.supabase');
                return createClient;
            }
        }
        
        // Check for global supabase (non-window)
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            createClient = supabase.createClient;
            console.log('✅ SUPABASE: createClient loaded from global supabase');
            return createClient;
        }
        
        // Wait and retry
        if (attempts < maxAttempts - 1) {
            console.log(`⏳ SUPABASE: Waiting for Supabase library to load... (attempt ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempts++;
        } else {
            attempts++;
        }
    }
    
    throw new Error('Supabase createClient not available after waiting. Ensure supabase.min.js is loaded in sidepanel.html.');
}
class SupabaseService {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
        this.client = null;
        this.isTriggeringAuth = false; // Guard to prevent multiple simultaneous auth triggers
    }
    async initialize() {
        if (this.isInitialized && this.client) {
            console.log('⚠️ SUPABASE: Already initialized');
            return this.client;
        }
        try {
            // Load Supabase createClient function
            const createClientFn = await loadSupabaseClient();
            // Get config from window globals (set by config.js)
            const win = window;
            if (!win.SUPABASE_URL || !win.SUPABASE_ANON_KEY) {
                throw new Error('Supabase URL or key not configured. Ensure config.js is loaded before SupabaseService.');
            }
            this.client = createClientFn(win.SUPABASE_URL, win.SUPABASE_ANON_KEY);
            
            // CRITICAL FIX: Validate that client has auth property before setting window.supabase
            if (!this.client || !this.client.auth) {
                console.error('❌ SUPABASE: Client created but auth property is missing!');
                console.error('❌ SUPABASE: Client type:', typeof this.client);
                console.error('❌ SUPABASE: Client keys:', this.client ? Object.keys(this.client) : 'null');
                console.error('❌ SUPABASE: createClientFn type:', typeof createClientFn);
                throw new Error('Supabase client created but auth property is missing. Check Supabase library version and initialization.');
            }
            
            if (typeof window !== 'undefined') {
                window.supabase = this.client;
            }
            // CRITICAL FIX: Reuse 'win' from line 65 - removed duplicate declaration
            console.log('✅ SUPABASE: Global client initialized successfully');
            console.log('✅ SUPABASE: URL:', win.SUPABASE_URL);
            console.log('✅ SUPABASE: Key present:', !!win.SUPABASE_ANON_KEY);
            console.log('✅ SUPABASE: Client methods available:', Object.keys(this.client).slice(0, 10));
            console.log('✅ SUPABASE: Client has auth property:', !!this.client.auth);
            console.log('✅ SUPABASE: Auth methods available:', this.client.auth ? Object.keys(this.client.auth).slice(0, 10) : 'none');
            // Set up authentication listener
            if (this.client.auth && typeof this.client.auth.onAuthStateChange === 'function') {
                const authSubscription = this.client.auth.onAuthStateChange((event, session) => {
                    console.log('🔔 SUPABASE AUTH: Auth state changed:', event);
                    // Handle INITIAL_SESSION event - check if session exists and has user
                    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        if (session && typeof session === 'object' && 'user' in session) {
                            const sessionUser = session.user;
                            if (sessionUser && sessionUser.email) {
                                console.log('✅ SUPABASE AUTH: User authenticated:', sessionUser.email);
                            }
                            else {
                                console.log('ℹ️ SUPABASE AUTH: Session exists but no user data - triggering Chrome Identity auth');
                                // COMP BEHAVIOR: Trigger automatic Chrome Identity auth even if session exists without user
                                this.triggerChromeIdentityAuth();
                            }
                        }
                        else {
                            console.log('ℹ️ SUPABASE AUTH: No active session - triggering Chrome Identity auth');
                            // COMP BEHAVIOR: Trigger automatic Chrome Identity auth (existing realGoogleAuth.getCurrentUser)
                            this.triggerChromeIdentityAuth();
                        }
                    }
                    else if (event === 'SIGNED_OUT') {
                        console.log('ℹ️ SUPABASE AUTH: User signed out');
                    }
                });
            }
            this.isInitialized = true;
            console.log('✅ SUPABASE: SupabaseService initialized successfully');
            return this.client;
        }
        catch (error) {
            console.error('❌ SUPABASE: Initialization failed:', error);
            throw error;
        }
    }
    /**
     * COMP BEHAVIOR: Trigger automatic Chrome Identity auth using existing realGoogleAuth
     * This uses the existing real-google-auth.js code that was working before migration
     */
    triggerChromeIdentityAuth() {
        // CRITICAL FIX: Guard against multiple simultaneous calls
        if (this.isTriggeringAuth) {
            console.log('⏳ SUPABASE: Auth trigger already in progress, skipping duplicate call');
            return;
        }
        // ROOT CAUSE FIX: Check stateManager (TypeScript migration - no window.currentUser)
        const existingUser = stateManagerInstance.getState('currentUser');
        if (existingUser?.email) {
            console.log('✅ SUPABASE: stateManager.currentUser already set, skipping auth trigger');
            return;
        }
        this.isTriggeringAuth = true;
        // Use existing realGoogleAuth.getCurrentUser() - it already implements COMP behavior
        // Just trigger it asynchronously so it doesn't block initialization
        setTimeout(async () => {
            try {
                const realGoogleAuth = window.realGoogleAuth;
                if (!realGoogleAuth) {
                    console.log('⏳ SUPABASE: realGoogleAuth not available yet, retrying in 500ms...');
                    this.isTriggeringAuth = false; // Reset guard before retry
                    // Retry once more after longer delay
                    setTimeout(() => this.triggerChromeIdentityAuth(), 500);
                    return;
                }
                // Initialize if needed (check initialized property if it exists)
                if ((realGoogleAuth.initialized === false || realGoogleAuth.initialized === undefined) && typeof realGoogleAuth.initialize === 'function') {
                    console.log('🔧 SUPABASE: Initializing realGoogleAuth...');
                    await realGoogleAuth.initialize();
                }
                if (typeof realGoogleAuth.getCurrentUser === 'function') {
                    console.log('🔐 SUPABASE: Triggering automatic Chrome Identity auth (existing realGoogleAuth)...');
                    const chromeUser = await realGoogleAuth.getCurrentUser();
                    if (chromeUser && chromeUser.email) {
                        console.log('✅ SUPABASE: Chrome Identity auth successful:', chromeUser.email);
                        // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
                        stateManagerInstance.setState('currentUser', chromeUser);
                        console.log('✅ SUPABASE: Set stateManager.currentUser:', chromeUser.email);
                        // Trigger authUIUpdate event for components that listen for it
                        if (typeof document !== 'undefined') {
                            document.dispatchEvent(new CustomEvent('authUIUpdate', {
                                detail: {
                                    isAuthenticated: true,
                                    user: chromeUser
                                }
                            }));
                            console.log('✅ SUPABASE: Dispatched authUIUpdate event');
                        }
                    }
                    else {
                        console.log('ℹ️ SUPABASE: No Chrome user found - user not logged into Chrome');
                    }
                }
                else {
                    console.warn('⚠️ SUPABASE: realGoogleAuth.getCurrentUser is not a function');
                }
            }
            catch (error) {
                console.error('❌ SUPABASE: Chrome Identity auth trigger failed:', error);
            }
            finally {
                // CRITICAL FIX: Reset guard after completion
                this.isTriggeringAuth = false;
            }
        }, 100); // Small delay to ensure realGoogleAuth is loaded
    }
    getClient() {
        if (!this.isInitialized || !this.client) {
            throw new Error('SupabaseService not initialized. Call initialize() first.');
        }
        return this.client;
    }
    /**
     * Get users visible on a specific page
     * ROOT CAUSE FIX: Implement getPageUsers for VisibilityManager
     */
    async getPageUsers(pageId) {
        if (!this.client) {
            throw new Error('SupabaseService not initialized');
        }
        try {
            console.log('🔍 SUPABASE: Querying users for pageId:', pageId);
            // Query user_presence table for users on this page (ROOT CAUSE FIX: table name was wrong)
            // ROOT CAUSE FIX: Filter by is_active = true to only get active users (not time-filtered)
            if (!this.client) {
                throw new Error('Supabase client not available');
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const queryBuilder = this.client
                .from('user_presence')
                .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatar_url, aura_color)')
                .eq('page_id', pageId)
                .eq('is_active', true); // ROOT CAUSE FIX: Only get active users
            // Type-safe order call - Supabase query builder always has order method after eq()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await queryBuilder.order('last_seen', { ascending: false });
            if (error) {
                console.error('❌ SUPABASE: Error querying page users:', error);
                return [];
            }
            if (!data || data.length === 0) {
                console.log('ℹ️ SUPABASE: No users found for pageId:', pageId);
                return [];
            }
            console.log('✅ SUPABASE: Found', data.length, 'users for pageId:', pageId);
            // Transform data to match VisibilityUser interface (ROOT CAUSE FIX: use AppUser relation data)
            return data.map((record) => ({
                id: record.user_id || '',
                email: record.AppUser?.email || '',
                name: record.AppUser?.name,
                handle: record.AppUser?.handle,
                avatarUrl: record.AppUser?.avatar_url,
                auraColor: record.AppUser?.aura_color,
                page_id: record.page_id || pageId,
                lastSeen: record.last_seen || undefined,
                isActive: record.is_active || false
            }));
        }
        catch (error) {
            console.error('❌ SUPABASE: Exception querying page users:', error);
            return [];
        }
    }
    /**
     * Get user profile by email
     * ROOT CAUSE FIX: Implement getUserProfile for VisibilityManager
     */
    async getUserProfile(userEmail) {
        if (!this.client) {
            throw new Error('SupabaseService not initialized');
        }
        try {
            // Query AppUser table for user profile
            const queryResult = await this.client.from('AppUser')
                .select('id, email, name, handle, avatar_url, aura_color')
                .eq('email', userEmail)
                .single();
            const { data, error } = queryResult;
            if (error) {
                console.warn('⚠️ SUPABASE: Error querying user profile:', error);
                return null;
            }
            if (!data) {
                return null;
            }
            return {
                id: data.id,
                email: data.email,
                name: data.name,
                handle: data.handle,
                avatarUrl: data.avatar_url,
                auraColor: data.aura_color
            };
        }
        catch (error) {
            console.error('❌ SUPABASE: Exception querying user profile:', error);
            return null;
        }
    }
    /**
     * Set up event handlers for presence events
     * ROOT CAUSE FIX: Implement on() method for VisibilityManager
     */
    on(event, handler) {
        if (!this.client) {
            throw new Error('SupabaseService not initialized');
        }
        // Set up Supabase realtime subscription for presence table
        const channel = this.client.channel('presence-changes');
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, (payload) => {
            handler(payload.eventType, payload.new || {}, payload.old || {});
        });
        channel.subscribe();
        console.log('✅ SUPABASE: Presence event handler registered');
    }
}
const supabaseServiceInstance = new SupabaseService();
export { SupabaseService, supabaseServiceInstance };
export default SupabaseService;
export function initializeSupabaseService() {
    console.log('✅ SUPABASE: Library loaded, initializing service...');
    supabaseServiceInstance.initialize().then(() => {
        console.log('✅ SupabaseService initialized and connected');
    }).catch((error) => {
        console.error('❌ SUPABASE: SupabaseService initialization failed:', error);
    });
}

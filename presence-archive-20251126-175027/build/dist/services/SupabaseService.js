/**
 * SUPABASE SERVICE - TypeScript + ES6 Module
 * Supabase client service management
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { Logger } from '../utils/Logger.js';
import { handleModuleError } from '../utils/ErrorHandlingPolicy.js';
// Import Supabase as ES6 module (runtime import - TypeScript can't resolve absolute path)
// Type assertion needed for dynamic import - path is resolved at runtime
let createClient = null;
const handleSupabaseError = (error, policy) => {
    return handleModuleError(error, {
        ...policy,
        component: 'SupabaseService',
        severity: policy.severity ?? 'recoverable'
    });
};
// Dynamic import function
async function loadSupabaseClient() {
    if (createClient) {
        return createClient;
    }
    try {
        // Try to import as ES6 module first
        // Dynamic runtime import path - TypeScript cannot resolve at compile time
        // This path is resolved at runtime by the browser/extension system
        // Use relative path for extension context
        const supabasePath = typeof chrome !== 'undefined' && chrome.runtime?.getURL
            ? chrome.runtime.getURL('lib/supabase.min.js')
            : './lib/supabase.min.js';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // Dynamic import path resolved at runtime by browser/extension system
        const supabaseModule = await import(supabasePath);
        Logger.debug('🔍 SUPABASE: Module import result:', supabaseModule, 'supabase');
        Logger.debug('🔍 SUPABASE: Module keys:', Object.keys(supabaseModule || {}).slice(0, 10), 'supabase');
        // Check for createClient in various possible locations
        if (supabaseModule && typeof supabaseModule.createClient === 'function') {
            createClient = supabaseModule.createClient;
            Logger.debug('✅ SUPABASE: Found createClient in module', null, 'supabase');
            // Fix: Non-null assertion - we've validated it's a function above
            return createClient;
        }
        // Check default export
        if (supabaseModule && supabaseModule.default && typeof supabaseModule.default.createClient === 'function') {
            const clientFn = supabaseModule.default.createClient;
            createClient = clientFn;
            Logger.debug('✅ SUPABASE: Found createClient in module.default', null, 'supabase');
            return clientFn;
        }
        // Check if module itself is createClient
        if (supabaseModule && typeof supabaseModule === 'function') {
            const clientFn = supabaseModule;
            createClient = clientFn;
            Logger.debug('✅ SUPABASE: Module itself is createClient', null, 'supabase');
            return clientFn;
        }
    }
    catch (e) {
        handleSupabaseError(e, {
            operation: 'loadSupabaseClient',
            logLevel: 'warn',
            severity: 'recoverable'
        });
    }
    // Fallback: Check for global supabase object (loaded as script tag)
    if (typeof window !== 'undefined') {
        const win = window;
        if (win.supabase && typeof win.supabase.createClient === 'function') {
            createClient = win.supabase.createClient;
            Logger.debug('✅ SUPABASE: Found createClient in window.supabase', null, 'supabase');
            // Fix: Non-null assertion - we've validated it's a function above
            return createClient;
        }
        // Check if webpack exposed it differently
        if (win.supabase && typeof win.supabase === 'object') {
            Logger.debug('🔍 SUPABASE: window.supabase keys:', Object.keys(win.supabase).slice(0, 10), 'supabase');
        }
    }
    // Check for global supabase (non-window)
    if (typeof supabase !== 'undefined' && supabase) {
        const supabaseGlobal = supabase;
        if (typeof supabaseGlobal.createClient === 'function') {
            const clientFn = supabaseGlobal.createClient;
            createClient = clientFn;
            Logger.debug('✅ SUPABASE: Found createClient in global supabase', null, 'supabase');
            return clientFn;
        }
        Logger.debug('🔍 SUPABASE: Global supabase type:', typeof supabase, 'supabase');
        if (typeof supabase === 'object') {
            Logger.debug('🔍 SUPABASE: Global supabase keys:', Object.keys(supabase).slice(0, 10), 'supabase');
        }
    }
    throw new Error('Supabase createClient not available. Ensure supabase.min.js is loaded.');
}
class SupabaseService {
    constructor() {
        this.isInitialized = false;
        this.client = null;
        this.isTriggeringAuth = false; // Guard to prevent multiple simultaneous auth triggers
    }
    async initialize() {
        if (this.isInitialized && this.client) {
            Logger.warn('⚠️ SUPABASE: Already initialized', null, 'supabase');
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
            if (typeof window !== 'undefined') {
                window.supabase = this.client;
            }
            // CRITICAL FIX: Reuse 'win' from line 65 - removed duplicate declaration
            Logger.debug('✅ SUPABASE: Global client initialized successfully', null, 'supabase');
            Logger.debug('✅ SUPABASE: URL:', win.SUPABASE_URL, 'supabase');
            Logger.debug('✅ SUPABASE: Key present:', !!win.SUPABASE_ANON_KEY, 'supabase');
            Logger.debug('✅ SUPABASE: Client methods available:', Object.keys(this.client).slice(0, 10), 'supabase');
            // Set up authentication listener
            if (this.client.auth && typeof this.client.auth.onAuthStateChange === 'function') {
                this.client.auth.onAuthStateChange((event, session) => {
                    Logger.debug('🔔 SUPABASE AUTH: Auth state changed:', event, 'supabase');
                    // Handle INITIAL_SESSION event - check if session exists and has user
                    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        if (session && typeof session === 'object' && 'user' in session) {
                            const sessionUser = session.user;
                            if (sessionUser && sessionUser.email) {
                                Logger.debug('✅ SUPABASE AUTH: User authenticated:', sessionUser.email, 'supabase');
                            }
                            else {
                                Logger.debug('ℹ️ SUPABASE AUTH: Session exists but no user data - triggering Chrome Identity auth', null, 'supabase');
                                // COMP BEHAVIOR: Trigger automatic Chrome Identity auth even if session exists without user
                                this.triggerChromeIdentityAuth();
                            }
                        }
                        else {
                            Logger.debug('ℹ️ SUPABASE AUTH: No active session - triggering Chrome Identity auth', null, 'supabase');
                            // COMP BEHAVIOR: Trigger automatic Chrome Identity auth (existing realGoogleAuth.getCurrentUser)
                            this.triggerChromeIdentityAuth();
                        }
                    }
                    else if (event === 'SIGNED_OUT') {
                        Logger.debug('ℹ️ SUPABASE AUTH: User signed out', null, 'supabase');
                    }
                });
            }
            this.isInitialized = true;
            Logger.debug('✅ SUPABASE: SupabaseService initialized successfully', null, 'supabase');
            return this.client;
        }
        catch (error) {
            handleSupabaseError(error, {
                operation: 'initialize',
                logLevel: 'error',
                severity: 'fatal'
            });
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
            Logger.debug('⏳ SUPABASE: Auth trigger already in progress, skipping duplicate call', 'supabase');
            return;
        }
        // ROOT CAUSE FIX: Check stateManager (TypeScript migration - no window.currentUser)
        const existingUser = stateManagerInstance.getState('currentUser');
        if (existingUser?.email) {
            Logger.debug('✅ SUPABASE: stateManager.currentUser already set, skipping auth trigger', 'supabase');
            return;
        }
        this.isTriggeringAuth = true;
        // Use existing realGoogleAuth.getCurrentUser() - it already implements COMP behavior
        // Just trigger it asynchronously so it doesn't block initialization
        setTimeout(async () => {
            try {
                const realGoogleAuth = window.realGoogleAuth;
                if (!realGoogleAuth) {
                    Logger.debug('⏳ SUPABASE: realGoogleAuth not available yet, retrying in 500ms...', 'supabase');
                    this.isTriggeringAuth = false; // Reset guard before retry
                    // Retry once more after longer delay
                    setTimeout(() => this.triggerChromeIdentityAuth(), 500);
                    return;
                }
                // Initialize if needed (check initialized property if it exists)
                if ((realGoogleAuth.initialized === false || realGoogleAuth.initialized === undefined) && typeof realGoogleAuth.initialize === 'function') {
                    Logger.debug('🔧 SUPABASE: Initializing realGoogleAuth...', null, 'supabase');
                    await realGoogleAuth.initialize();
                }
                if (typeof realGoogleAuth.getCurrentUser === 'function') {
                    Logger.debug('🔐 SUPABASE: Triggering automatic Chrome Identity auth (existing realGoogleAuth)...', null, 'supabase');
                    const chromeUser = await realGoogleAuth.getCurrentUser();
                    if (chromeUser && chromeUser.email) {
                        Logger.debug('✅ SUPABASE: Chrome Identity auth successful:', chromeUser.email, 'supabase');
                        // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
                        stateManagerInstance.setState('currentUser', chromeUser);
                        Logger.debug('✅ SUPABASE: Set stateManager.currentUser:', chromeUser.email, 'supabase');
                        // Trigger authUIUpdate event for components that listen for it
                        if (typeof document !== 'undefined') {
                            document.dispatchEvent(new CustomEvent('authUIUpdate', {
                                detail: {
                                    isAuthenticated: true,
                                    user: chromeUser
                                }
                            }));
                            Logger.debug('✅ SUPABASE: Dispatched authUIUpdate event', null, 'supabase');
                        }
                    }
                    else {
                        Logger.debug('ℹ️ SUPABASE: No Chrome user found - user not logged into Chrome', null, 'supabase');
                    }
                }
                else {
                    Logger.warn('⚠️ SUPABASE: realGoogleAuth.getCurrentUser is not a function', null, 'supabase');
                }
            }
            catch (error) {
                handleSupabaseError(error, {
                    operation: 'triggerChromeIdentityAuth',
                    severity: 'recoverable'
                });
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
     *
     * FIX: Added diagnostic logging and fallback query to help diagnose visibility issues
     */
    async getPageUsers(pageId) {
        if (!this.client) {
            throw new Error('SupabaseService not initialized');
        }
        try {
            Logger.debug('🔍 SUPABASE: Querying users for pageId:', pageId, 'supabase');
            // Query user_presence table for users on this page (ROOT CAUSE FIX: table name was wrong)
            // ROOT CAUSE FIX: Filter by is_active = true to only get active users (not time-filtered)
            if (!this.client) {
                throw new Error('Supabase client not available');
            }
            // ROOT CAUSE FIX: Two-step query approach - avoids AppUser relation syntax issues
            // Step 1: Query user_presence (user_id/UUID is always present)
            const { data: presenceData, error: presenceError } = await this.client
                .from('user_presence')
                .select('user_id, page_id, last_seen, is_active')
                .eq('page_id', pageId)
                .eq('is_active', true)
                .order('last_seen', { ascending: false });
            if (presenceError) {
                Logger.error('❌ SUPABASE: Error querying page users:', presenceError, 'supabase');
                return await this.getPageUsersFallback(pageId);
            }
            if (!presenceData || presenceData.length === 0) {
                Logger.debug('ℹ️ SUPABASE: No users found for pageId:', pageId, 'supabase');
                return await this.getPageUsersFallback(pageId);
            }
            // Step 2: Batch fetch AppUser data using user_ids (UUIDs are always present)
            const userIds = presenceData
                .map((r) => r.user_id)
                .filter((id) => !!id);
            if (userIds.length === 0) {
                return [];
            }
            const { data: appUserData, error: appUserError } = await this.client
                .from('AppUser')
                .select('id, email, name, handle, avatarUrl, auraColor')
                .in('id', userIds);
            if (appUserError) {
                Logger.warn('⚠️ SUPABASE: Failed to fetch AppUser data, continuing without it', appUserError, 'supabase');
                // Continue without AppUser data - users will show as "Unknown" but at least they'll be visible
            }
            // Create a map of user_id -> AppUser data for quick lookup
            const appUserMap = new Map();
            (appUserData || []).forEach((u) => {
                if (u.id) {
                    appUserMap.set(u.id, u);
                }
            });
            Logger.debug(`✅ SUPABASE: Found ${presenceData.length} presence records, ${appUserMap.size} AppUser records for pageId:`, pageId, 'supabase');
            // Transform data to match VisibilityUser interface
            // API boundary: Convert snake_case (database) → camelCase (TypeScript types)
            return presenceData.map((record) => {
                const appUser = record.user_id ? appUserMap.get(record.user_id) : null;
                return {
                    id: record.user_id || '',
                    userId: record.user_id || '',
                    email: appUser?.email || '',
                    name: appUser?.name ?? undefined,
                    handle: appUser?.handle ?? undefined,
                    avatarUrl: appUser?.avatar_url ?? undefined,
                    auraColor: appUser?.aura_color ?? undefined,
                    pageId: record.page_id || pageId,
                    lastSeen: record.last_seen || undefined,
                    isActive: record.is_active || false
                };
            });
        }
        catch (error) {
            Logger.error('❌ SUPABASE: Exception in getPageUsers:', error instanceof Error ? error.message : String(error), 'supabase');
            handleSupabaseError(error, {
                operation: 'getPageUsers',
                severity: 'recoverable',
                fallbackValue: [],
                context: { pageId }
            });
            // FIX: Try fallback query on exception
            return await this.getPageUsersFallback(pageId);
        }
    }
    /**
     * Fallback query to diagnose visibility issues
     * Checks for presence records with same pageId but different is_active status,
     * or similar pageIds (for normalization issues)
     */
    async getPageUsersFallback(pageId) {
        if (!this.client) {
            return [];
        }
        try {
            Logger.debug('🔍 SUPABASE: Running fallback query for pageId:', pageId, 'supabase');
            // Fallback 1: Check for records with same pageId but is_active = false
            const { data: inactiveData } = await this.client
                .from('user_presence')
                .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatarUrl, auraColor)')
                .eq('page_id', pageId)
                .limit(10);
            if (inactiveData && inactiveData.length > 0) {
                Logger.warn('⚠️ SUPABASE: Found presence records with is_active=false for pageId:', pageId, 'supabase');
                Logger.debug('   Records:', inactiveData.map(r => ({ user_id: r.user_id, is_active: r.is_active, page_id: r.page_id })), 'supabase');
            }
            // Fallback 2: Check for similar pageIds (normalization issues)
            // Extract base domain from pageId (e.g., "google_com_" from "developers_google_com_profile_u_104661641557936501987")
            const baseDomainMatch = pageId.match(/^([a-z]+_[a-z]+_)/);
            if (baseDomainMatch) {
                const baseDomain = baseDomainMatch[1];
                Logger.debug('🔍 SUPABASE: Checking for similar pageIds with base domain:', baseDomain, 'supabase');
                const { data: similarData } = await this.client
                    .from('user_presence')
                    .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatarUrl, auraColor)')
                    .like('page_id', `${baseDomain}%`)
                    .eq('is_active', true)
                    .limit(20);
                if (similarData && similarData.length > 0) {
                    Logger.warn('⚠️ SUPABASE: Found presence records with similar pageIds:', similarData.map(r => r.page_id), 'supabase');
                    Logger.warn('⚠️ SUPABASE: PageId normalization issue detected', { current: pageId, found: similarData[0]?.page_id }, 'supabase');
                    // Return users from similar pageIds (they're on the same domain)
                    return similarData.map((record) => ({
                        id: record.user_id || '',
                        userId: record.user_id || '',
                        email: record.AppUser?.email || '',
                        name: record.AppUser?.name ?? undefined,
                        handle: record.AppUser?.handle ?? undefined,
                        avatarUrl: record.AppUser?.avatar_url ?? undefined,
                        auraColor: record.AppUser?.aura_color ?? undefined,
                        pageId: record.page_id || pageId,
                        lastSeen: record.last_seen || undefined,
                        isActive: record.is_active || false
                    }));
                }
            }
            // Fallback 3: Check all active presence records to see what pageIds exist
            const { data: allActiveData } = await this.client
                .from('user_presence')
                .select('page_id')
                .eq('is_active', true)
                .limit(50);
            if (allActiveData && allActiveData.length > 0) {
                const uniquePageIds = [...new Set(allActiveData.map(r => r.page_id))];
                Logger.debug('🔍 SUPABASE: Sample active pageIds in database:', uniquePageIds.slice(0, 10), 'supabase');
            }
            return [];
        }
        catch (fallbackError) {
            Logger.error('❌ SUPABASE: Fallback query also failed:', fallbackError instanceof Error ? fallbackError.message : String(fallbackError), 'supabase');
            return [];
        }
    }
    /**
     * Get user profile by email
     * ROOT CAUSE FIX: Implement getUserProfile for VisibilityManager
     */
    // UUID ONLY - changed from getUserProfile(userEmail) to getUserProfile(userId)
    async getUserProfile(userId) {
        if (!this.client) {
            throw new Error('SupabaseService not initialized');
        }
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            Logger.warn('⚠️ SUPABASE: getUserProfile called with invalid UUID', { userId }, 'supabase');
            return null;
        }
        try {
            // Query AppUser table by UUID only
            const queryResult = await this.client
                .from('AppUser')
                .select('id, email, name, handle, avatarUrl, auraColor')
                .eq('id', userId)
                .single();
            const { data, error } = queryResult;
            if (error) {
                Logger.warn('⚠️ SUPABASE: Error querying user profile:', error, 'supabase');
                return null;
            }
            if (!data) {
                return null;
            }
            return {
                id: data.id,
                email: data.email,
                name: data.name ?? undefined,
                handle: data.handle ?? undefined,
                avatarUrl: data.avatarUrl || data.avatar_url || undefined,
                auraColor: data.auraColor || data.aura_color || undefined
            };
        }
        catch (error) {
            handleSupabaseError(error, {
                operation: 'getUserProfile',
                severity: 'recoverable',
                fallbackValue: null,
                context: { userId }
            });
            return null;
        }
    }
    /**
     * Set up event handlers for presence events
     * ROOT CAUSE FIX: Implement on() method for VisibilityManager
     */
    on(_event, handler) {
        if (!this.client) {
            throw new Error('SupabaseService not initialized');
        }
        // Set up Supabase realtime subscription for presence table
        const channel = this.client.channel('presence-changes');
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, (payload) => {
            // Extract event type from payload
            const eventType = payload?.eventType || payload?.event || 'UNKNOWN';
            handler(eventType, payload?.new || {}, payload?.old || {});
        });
        channel.subscribe();
        Logger.debug('✅ SUPABASE: Presence event handler registered', null, 'supabase');
    }
}
const supabaseServiceInstance = new SupabaseService();
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
export function initializeSupabaseService() {
    Logger.debug('✅ SUPABASE: Library loaded, initializing service...', 'supabase');
    supabaseServiceInstance.initialize().then(() => {
        Logger.debug('✅ SupabaseService initialized and connected', null, 'supabase');
    }).catch((error) => {
        Logger.error('❌ SUPABASE: SupabaseService initialization failed:', error, 'supabase');
    });
}
//# sourceMappingURL=SupabaseService.js.map
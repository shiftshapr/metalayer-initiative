/**
 * API SERVICE - TypeScript Version
 * MetaLayer API client service
 */
// Import stateManagerInstance (TypeScript migration - no longer using window.currentUser)
import { stateManagerInstance } from '../core/StateManager.js';
import { API_CONFIG } from '../core/APIConfig.js';
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
import { getBackendHealthService } from './BackendHealthService.js';
class MetaLayerAPI {
    constructor(baseURL = API_CONFIG.baseUrl, fallbackURL = API_CONFIG.fallbackUrl) {
        this.baseURL = baseURL;
        this.fallbackURL = fallbackURL;
    }
    _buildUrl(endpoint, useFallback = false) {
        if (endpoint.startsWith('http')) {
            const supabaseMatch = endpoint.match(/\/rest\/v1\/(.+)/);
            if (supabaseMatch) {
                const redirected = `${this.baseURL}/${supabaseMatch[1]}`;
                Logger.debug('✅ COMP_API_FIX: Redirected Supabase API call', { endpoint, finalUrl: redirected }, 'api');
                return redirected;
            }
            const replaced = API_CONFIG.replaceMetalayerUrl(endpoint);
            if (replaced !== endpoint) {
                Logger.debug('✅ COMP_API_FIX: Redirected api.themetalayer.org call', { endpoint, finalUrl: replaced }, 'api');
            }
            return replaced;
        }
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const base = useFallback && this.fallbackURL ? this.fallbackURL : this.baseURL;
        return `${base}${normalizedEndpoint}`;
    }
    _classifyNetworkError(error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const message = err.message || '';
        const connectionRefused = message.includes('ERR_CONNECTION_REFUSED') || message.includes('Failed to fetch');
        const timeout = err.name === 'AbortError';
        return { timeout, connectionRefused, error: err };
    }
    /**
     * Make API request with comprehensive endpoint redirection
     */
    async request(endpoint, options = {}) {
        const finalUrl = this._buildUrl(endpoint);
        // COMP METHOD: Get current user info to send in headers
        let user = null;
        try {
            Logger.debug('🔍 USER_IDENTITY: === API USER IDENTITY TRACE ===', null, 'api');
            // ROOT CAUSE FIX: Use stateManagerInstance (TypeScript migration - no longer using window.currentUser)
            const currentUserRaw = stateManagerInstance?.getState?.('currentUser');
            Logger.debug('🔍 USER_IDENTITY: currentUser (from stateManager)', currentUserRaw, 'api');
            // First try to get from currentUser (set by authentication)
            if (currentUserRaw && currentUserRaw.id) {
                // CRITICAL: Verify user.id is UUID before using it
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                const isUUID = uuidRegex.test(currentUserRaw.id);
                if (!isUUID) {
                    Logger.error('🔍 USER_IDENTITY: CRITICAL - currentUser.id is not UUID', {
                        userId: currentUserRaw.id,
                        email: currentUserRaw.email,
                        message: 'API requires UUID, not Google ID. UUID conversion must happen in BootController.handleUserChange() first.',
                        action: 'Skipping API call - UUID conversion required'
                    }, 'api');
                    // Don't use Google ID for API calls - return error response
                    return {
                        status: 400,
                        error: 'Invalid user ID format - UUID required',
                        data: undefined
                    };
                }
                // Create a copy, handling Promise auraColor
                user = {
                    id: currentUserRaw.id, // Now guaranteed to be UUID
                    email: currentUserRaw.email,
                    name: currentUserRaw.name,
                    avatarUrl: currentUserRaw.avatarUrl,
                    auraColor: typeof currentUserRaw.auraColor === 'string' ? currentUserRaw.auraColor : undefined
                };
                Logger.debug('🔍 USER_IDENTITY: ✅ Using currentUser for authentication', { userId: user.id, isUUID: true }, 'api');
                // CRITICAL FIX: Handle case where auraColor is a Promise (from reactive systems)
                if (currentUserRaw.auraColor && typeof currentUserRaw.auraColor === 'object' && typeof currentUserRaw.auraColor.then === 'function') {
                    Logger.debug('🔍 USER_IDENTITY: ⚠️ auraColor is a Promise, resolving...', 'api');
                    try {
                        const resolvedAuraColor = await currentUserRaw.auraColor;
                        Logger.debug('🔍 USER_IDENTITY: ✅ Resolved auraColor Promise', { auraColor: resolvedAuraColor }, 'api');
                        if (user) {
                            user.auraColor = resolvedAuraColor;
                        }
                    }
                    catch (error) {
                        handleError(error, {
                            log: true,
                            logLevel: 'warn',
                            context: {
                                operation: 'catch',
                                component: 'APIService'
                            }
                        });
                        ;
                        if (user) {
                            user.auraColor = undefined;
                        }
                    }
                }
                // CRITICAL FIX: Check currentUser.auraColor directly before API call
                // This handles cases where auraColor is set after the copy
                if (user && !user.auraColor && currentUserRaw?.auraColor && typeof currentUserRaw.auraColor === 'string') {
                    user.auraColor = currentUserRaw.auraColor;
                    Logger.debug('🔍 USER_IDENTITY: ✅ Using auraColor from currentUser', { auraColor: user.auraColor }, 'api');
                }
                // CRITICAL FIX: If auraColor is still missing, fetch it now to prevent delays
                // Use direct fetch() instead of window.api.request() to break recursion chain
                // This solves the root cause: direct fetch() doesn't call request() again
                if (user && !user.auraColor && user.id) {
                    // CRITICAL: Verify user.id is UUID before making API call
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    const isUUID = uuidRegex.test(user.id);
                    if (!isUUID) {
                        Logger.error('🔍 USER_IDENTITY: CRITICAL - Cannot fetch auraColor - user.id is not UUID', {
                            userId: user.id,
                            email: user.email,
                            message: 'API requires UUID, not Google ID or email. UUID conversion must happen first.'
                        }, 'api');
                        // Don't make API call with Google ID - it will fail
                        // Return user object as-is (this is not an API response, just returning the user object)
                        return user;
                    }
                    Logger.debug('🔍 USER_IDENTITY: 🎨 AuraColor missing, fetching immediately...', 'api');
                    try {
                        // ROOT CAUSE FIX: Use direct fetch() instead of window.api.request() 
                        // This breaks the recursion chain - fetch() doesn't invoke request() again
                        // UUID ONLY - user.id is now guaranteed to be UUID (validated above)
                        const fetchUrl = this._buildUrl(`/v1/users/${user.id}`);
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                        const headers = {
                            'Content-Type': 'application/json'
                        };
                        // UUID ONLY - no email headers needed
                        const response = await fetch(fetchUrl, {
                            method: 'GET',
                            headers,
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);
                        if (response.ok) {
                            const userData = await response.json();
                            const auraColor = userData.auraColor || userData.data?.auraColor;
                            const avatarUrl = userData.avatarUrl || userData.data?.avatarUrl;
                            // Update the user object with fetched data
                            if (auraColor && user) {
                                user.auraColor = auraColor;
                                // Also update currentUser in stateManager to prevent future fetches
                                if (currentUserRaw) {
                                    const updatedUser = { ...currentUserRaw, auraColor: auraColor };
                                    // Update stateManager (TypeScript migration)
                                    if (stateManagerInstance?.setState) {
                                        stateManagerInstance.setState('currentUser', updatedUser);
                                    }
                                }
                                Logger.debug('🔍 USER_IDENTITY: ✅ AuraColor fetched immediately', { auraColor }, 'api');
                            }
                            if (avatarUrl && user && !user.avatarUrl) {
                                user.avatarUrl = avatarUrl;
                                if (currentUserRaw && !currentUserRaw.avatarUrl) {
                                    const updatedUser = { ...currentUserRaw, avatarUrl: avatarUrl };
                                    if (stateManagerInstance?.setState) {
                                        stateManagerInstance.setState('currentUser', updatedUser);
                                    }
                                }
                            }
                        }
                        else {
                            Logger.warn('🔍 USER_IDENTITY: ⚠️ Failed to fetch auraColor', { status: response.status }, 'api');
                        }
                    }
                    catch (error) {
                        // ROOT CAUSE FIX: Handle connection refused gracefully
                        if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED'))) {
                            handleError(error, {
                                log: true,
                                logLevel: 'warn',
                                context: {
                                    operation: 'catch',
                                    component: 'APIService'
                                }
                            });
                            ;
                        }
                        else {
                            handleError(error, {
                                log: true,
                                logLevel: 'warn',
                                context: {
                                    operation: 'catch',
                                    component: 'APIService'
                                }
                            });
                            ;
                        }
                    }
                }
            }
            else if (typeof window !== 'undefined' && window.authManager) {
                const authManager = window.authManager;
                if (authManager && typeof authManager.getCurrentUser === 'function') {
                    const authUser = await authManager.getCurrentUser();
                    if (authUser && authUser.id) {
                        // CRITICAL: Verify authUser.id is UUID before using it
                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                        const isUUID = uuidRegex.test(authUser.id);
                        if (!isUUID) {
                            Logger.error('🔍 USER_IDENTITY: CRITICAL - authManager returned Google ID, not UUID', {
                                userId: authUser.id,
                                email: authUser.email,
                                message: 'API requires UUID. UUID conversion must happen in BootController.handleUserChange() first.',
                                action: 'Rejecting API call'
                            }, 'api');
                            // Reject API call with clear error
                            return {
                                status: 400,
                                error: `Invalid user ID format: ${authUser.id}. UUID required, not Google ID.`,
                                data: undefined
                            };
                        }
                        user = { id: authUser.id, email: authUser.email }; // Now guaranteed to be UUID
                    }
                    Logger.debug('🔍 USER_IDENTITY: ✅ Using authManager for authentication', { userId: user?.id, isUUID: true }, 'api');
                }
            }
            // UUID ONLY - getCurrentUserEmail fallback removed
            // If no user.id (UUID) is available, we cannot authenticate
            // This ensures UUID-only policy is enforced
            else {
                Logger.debug('🔍 USER_IDENTITY: ❌ No user authentication available', null, 'api');
            }
            Logger.debug('🔍 USER_IDENTITY: === END API USER IDENTITY TRACE ===', null, 'api');
        }
        catch (error) {
            Logger.debug('🔍 USER_IDENTITY: ❌ Error getting user authentication', error, 'api');
        }
        // Derive identifiers early for consistent headers
        // User data should already be normalized via setCurrentUser, but handle raw Supabase data if needed
        const currentUserForHeaders = stateManagerInstance?.getState?.('currentUser');
        let derivedUserId = user?.id || currentUserForHeaders?.id || null;
        // CRITICAL: Verify derivedUserId is UUID before using it
        if (derivedUserId) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isUUID = uuidRegex.test(derivedUserId);
            if (!isUUID) {
                Logger.error('🔍 USER_IDENTITY: CRITICAL - Cannot make API call - user.id is not UUID', {
                    userId: derivedUserId,
                    email: user?.email || currentUserForHeaders?.email,
                    endpoint,
                    message: 'API requires UUID, not Google ID or email. UUID conversion must happen in BootController.handleUserChange() first.',
                    action: 'Rejecting API call'
                }, 'api');
                // Reject API call with clear error
                return {
                    status: 400,
                    error: `Invalid user ID format: ${derivedUserId}. UUID required, not Google ID or email.`,
                    data: undefined
                };
            }
        }
        // Email kept for potential future use but not currently used
        void (user?.email || currentUserForHeaders?.email || null);
        const derivedName = user?.name || currentUserForHeaders?.name || undefined;
        const derivedAvatar = user?.avatarUrl || currentUserForHeaders?.avatarUrl || undefined;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                // UUID ONLY - derivedUserId is now guaranteed to be UUID (validated above)
                ...(derivedUserId && { 'x-user-id': derivedUserId }),
                ...(derivedName && { 'x-user-name': derivedName }),
                ...(derivedAvatar && { 'x-user-avatar': derivedAvatar }),
                ...(options.headers || {})
            }
        };
        // Add body for POST/PUT/PATCH requests
        if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
            config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }
        try {
            // ROOT CAUSE FIX: Add timeout and better error handling for connection refused
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            const response = await fetch(finalUrl, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            // Handle 404 specifically if allow404 is set
            if (response.status === 404 && options.allow404) {
                // 404 is still a successful connection
                try {
                    const healthService = getBackendHealthService(this.baseURL);
                    healthService.updateFromAPIRequest(true);
                }
                catch (healthError) {
                    Logger.debug('⚠️ APIService: Failed to update health service', healthError, 'api');
                }
                return { data: null, status: 404 };
            }
            if (!response.ok) {
                const errorText = await response.text();
                Logger.warn(`⚠️ API Error: ${response.status} ${response.statusText}`, { errorText, status: response.status, statusText: response.statusText }, 'api');
                // Server responded but with error - backend is reachable but degraded
                try {
                    const healthService = getBackendHealthService(this.baseURL);
                    healthService.updateFromAPIRequest(false, `API returned ${response.status}: ${response.statusText}`);
                }
                catch (healthError) {
                    Logger.debug('⚠️ APIService: Failed to update health service', healthError, 'api');
                }
                return {
                    error: `API request failed: ${response.status} ${response.statusText}`,
                    status: response.status
                };
            }
            const data = await response.json();
            // Update backend health service on success
            try {
                const healthService = getBackendHealthService(this.baseURL);
                healthService.updateFromAPIRequest(true);
            }
            catch (healthError) {
                // Don't fail the request if health service update fails
                Logger.debug('⚠️ APIService: Failed to update health service', healthError, 'api');
            }
            return { data, status: response.status };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const networkMeta = this._classifyNetworkError(error);
            // Update backend health service on failure
            try {
                const healthService = getBackendHealthService(this.baseURL);
                if (networkMeta.timeout) {
                    healthService.updateFromAPIRequest(false, 'API request timeout');
                }
                else if (networkMeta.connectionRefused) {
                    healthService.updateFromAPIRequest(false, 'API server unavailable - connection refused');
                }
                else {
                    healthService.updateFromAPIRequest(false, errorMessage);
                }
            }
            catch (healthError) {
                // Don't fail the request if health service update fails
                Logger.debug('⚠️ APIService: Failed to update health service', healthError, 'api');
            }
            // ROOT CAUSE FIX: Handle connection refused gracefully without crashing
            if (networkMeta.timeout) {
                handleError(error, {
                    log: true,
                    logLevel: 'warn',
                    context: {
                        operation: 'catch',
                        component: 'APIService'
                    }
                });
                ;
                return {
                    error: 'API request timeout - server may be unavailable',
                    status: 0,
                    timeout: true
                };
            }
            else if (networkMeta.connectionRefused) {
                // Connection refused - server is down or unreachable
                handleError(error, {
                    log: true,
                    logLevel: 'warn',
                    context: {
                        operation: 'catch',
                        component: 'APIService'
                    }
                });
                ;
                return {
                    error: 'API server unavailable - connection refused',
                    status: 0,
                    connectionRefused: true
                };
            }
            else {
                handleError(error, {
                    log: true,
                    logLevel: 'warn',
                    context: {
                        operation: 'catch',
                        component: 'APIService'
                    }
                });
                ;
                return {
                    error: errorMessage,
                    status: 0
                };
            }
        }
    }
}
// Create singleton API instance (TypeScript migration - no window globals)
export const apiServiceInstance = new MetaLayerAPI(API_CONFIG.baseUrl);
// Maintain backward compatibility during migration (will be removed)
if (typeof window !== 'undefined') {
    const win = window;
    if (!win.api) {
        win.api = apiServiceInstance;
    }
    // Store in stateManager for legacy access
    if (stateManagerInstance?.setState) {
        stateManagerInstance.setState('api', apiServiceInstance);
    }
}
export { MetaLayerAPI };
export default MetaLayerAPI;

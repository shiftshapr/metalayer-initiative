/**
 * API SERVICE - TypeScript Version
 * MetaLayer API client service
 */
// Import stateManagerInstance (TypeScript migration - no longer using window.currentUser)
import { stateManagerInstance } from '../core/StateManager.js';
class MetaLayerAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    /**
     * Make API request with comprehensive endpoint redirection
     */
    async request(endpoint, options = {}) {
        // COMP_API_FIX: Handle comprehensive API endpoint redirection
        let finalUrl = `${this.baseURL}${endpoint}`;
        // Check if this is a full URL that needs redirection
        if (endpoint.startsWith('http')) {
            if (endpoint.includes('api.themetalayer.org')) {
                finalUrl = endpoint.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');
                console.log('✅ COMP_API_FIX: Redirected api.themetalayer.org call:', endpoint, '->', finalUrl);
            }
            else if (endpoint.includes('supabase.co')) {
                // Extract the actual endpoint path after /rest/v1/
                const pathMatch = endpoint.match(/\/rest\/v1\/(.+)/);
                if (pathMatch) {
                    const actualEndpoint = pathMatch[1];
                    finalUrl = `${this.baseURL}/${actualEndpoint}`;
                    console.log('✅ COMP_API_FIX: Redirected Supabase API call:', endpoint, '->', finalUrl);
                }
            }
        }
        else if (endpoint.startsWith('/v1/') || endpoint.startsWith('/communities') || endpoint.startsWith('/avatars')) {
            // Handle relative API URLs - redirect to VPS
            finalUrl = `http://216.238.91.120:3002${endpoint}`;
            console.log('✅ COMP_API_FIX: Redirected relative API call:', endpoint, '->', finalUrl);
        }
        // COMP METHOD: Get current user info to send in headers
        let user = null;
        try {
            console.log('🔍 USER_IDENTITY: === API USER IDENTITY TRACE ===');
            // ROOT CAUSE FIX: Use stateManagerInstance (TypeScript migration - no longer using window.currentUser)
            const currentUserRaw = stateManagerInstance?.getState?.('currentUser');
            console.log('🔍 USER_IDENTITY: currentUser (from stateManager):', currentUserRaw);
            // First try to get from currentUser (set by authentication)
            if (currentUserRaw && currentUserRaw.id) {
                // Create a copy, handling Promise auraColor
                user = {
                    id: currentUserRaw.id,
                    email: currentUserRaw.email,
                    name: currentUserRaw.name,
                    avatarUrl: currentUserRaw.avatarUrl,
                    auraColor: typeof currentUserRaw.auraColor === 'string' ? currentUserRaw.auraColor : undefined
                };
                console.log('🔍 USER_IDENTITY: ✅ Using currentUser for authentication:', user.id);
                // CRITICAL FIX: Handle case where auraColor is a Promise (from reactive systems)
                if (currentUserRaw.auraColor && typeof currentUserRaw.auraColor === 'object' && typeof currentUserRaw.auraColor.then === 'function') {
                    console.log('🔍 USER_IDENTITY: ⚠️ auraColor is a Promise, resolving...');
                    try {
                        const resolvedAuraColor = await currentUserRaw.auraColor;
                        console.log('🔍 USER_IDENTITY: ✅ Resolved auraColor Promise to:', resolvedAuraColor);
                        if (user) {
                            user.auraColor = resolvedAuraColor;
                        }
                    }
                    catch (error) {
                        console.warn('🔍 USER_IDENTITY: ❌ Failed to resolve auraColor Promise:', error);
                        if (user) {
                            user.auraColor = undefined;
                        }
                    }
                }
                // CRITICAL FIX: Check currentUser.auraColor directly before API call
                // This handles cases where auraColor is set after the copy
                if (user && !user.auraColor && currentUserRaw?.auraColor && typeof currentUserRaw.auraColor === 'string') {
                    user.auraColor = currentUserRaw.auraColor;
                    console.log('🔍 USER_IDENTITY: ✅ Using auraColor from currentUser:', user.auraColor);
                }
                // CRITICAL FIX: If auraColor is still missing, fetch it now to prevent delays
                // Use direct fetch() instead of window.api.request() to break recursion chain
                // This solves the root cause: direct fetch() doesn't call request() again
                if (user && !user.auraColor && user.id) {
                    console.log('🔍 USER_IDENTITY: 🎨 AuraColor missing, fetching immediately...');
                    try {
                        // ROOT CAUSE FIX: Use direct fetch() instead of window.api.request() 
                        // This breaks the recursion chain - fetch() doesn't invoke request() again
                        // ROOT CAUSE FIX: Include email in header for Google ID lookup
                        const fetchUrl = `http://216.238.91.120:3002/v1/users/${user.id}`;
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                        const headers = {
                            'Content-Type': 'application/json'
                        };
                        // ROOT CAUSE FIX: If user ID is numeric (Google ID), include email in header for lookup
                        if (user.email && /^\d+$/.test(String(user.id))) {
                            headers['x-user-email'] = user.email;
                            console.log('🔍 USER_IDENTITY: Including email in header for Google ID lookup:', user.email);
                        }
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
                                console.log('🔍 USER_IDENTITY: ✅ AuraColor fetched immediately:', auraColor);
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
                            console.warn('🔍 USER_IDENTITY: ⚠️ Failed to fetch auraColor - HTTP', response.status);
                        }
                    }
                    catch (error) {
                        // ROOT CAUSE FIX: Handle connection refused gracefully
                        if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED'))) {
                            console.warn('🔍 USER_IDENTITY: ⚠️ API unavailable, continuing without auraColor:', error.message);
                        }
                        else {
                            console.warn('🔍 USER_IDENTITY: ⚠️ Failed to fetch auraColor immediately:', error);
                        }
                    }
                }
            }
            else if (typeof window !== 'undefined' && window.authManager) {
                const authManager = window.authManager;
                if (authManager && typeof authManager.getCurrentUser === 'function') {
                    const authUser = await authManager.getCurrentUser();
                    if (authUser && authUser.id) {
                        user = { id: authUser.id, email: authUser.email };
                    }
                    console.log('🔍 USER_IDENTITY: ✅ Using authManager for authentication:', user?.id);
                }
            }
            else if (typeof window !== 'undefined' && typeof window.getCurrentUserEmail === 'function') {
                const getCurrentUserEmail = window.getCurrentUserEmail;
                if (getCurrentUserEmail) {
                    const email = await getCurrentUserEmail();
                    if (email) {
                        user = { id: email, email };
                        console.log('🔍 USER_IDENTITY: ✅ Using getCurrentUserEmail for authentication:', email);
                    }
                }
            }
            else {
                console.log('🔍 USER_IDENTITY: ❌ No user authentication available');
            }
            console.log('🔍 USER_IDENTITY: === END API USER IDENTITY TRACE ===');
        }
        catch (error) {
            console.log('🔍 USER_IDENTITY: ❌ Error getting user authentication:', error);
        }
        // Derive identifiers early for consistent headers
        // User data should already be normalized via setCurrentUser, but handle raw Supabase data if needed
        const currentUserForHeaders = stateManagerInstance?.getState?.('currentUser');
        const derivedUserId = user?.id || currentUserForHeaders?.id || null;
        const derivedEmail = user?.email || currentUserForHeaders?.email || null;
        const derivedName = user?.name || currentUserForHeaders?.name || undefined;
        const derivedAvatar = user?.avatarUrl || currentUserForHeaders?.avatarUrl || undefined;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                // ROOT CAUSE FIX: Use lowercase headers to match backend expectations
                ...(derivedEmail && { 'x-user-email': derivedEmail }),
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
                return { data: null, status: 404 };
            }
            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`⚠️ API Error: ${response.status} ${response.statusText}`, errorText);
                return {
                    error: `API request failed: ${response.status} ${response.statusText}`,
                    status: response.status
                };
            }
            const data = await response.json();
            return { data, status: response.status };
        }
        catch (error) {
            // ROOT CAUSE FIX: Handle connection refused gracefully without crashing
            if (error instanceof Error && error.name === 'AbortError') {
                console.warn('⚠️ API Request Timeout:', finalUrl);
                return {
                    error: 'API request timeout - server may be unavailable',
                    status: 0,
                    timeout: true
                };
            }
            else if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED'))) {
                // Connection refused - server is down or unreachable
                console.warn('⚠️ API Connection Refused:', finalUrl, '- Server may be down. Extension will continue with limited functionality.');
                return {
                    error: 'API server unavailable - connection refused',
                    status: 0,
                    connectionRefused: true
                };
            }
            else {
                console.warn('⚠️ API Request Error:', error instanceof Error ? error.message : 'Unknown error');
                return {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    status: 0
                };
            }
        }
    }
}
// Maintain global api instance and store in stateManager (TypeScript migration)
if (typeof window !== 'undefined') {
    const apiInstance = new MetaLayerAPI('http://216.238.91.120:3002');
    // Set on window for backward compatibility during migration
    // Cast to any to avoid type mismatch with global.d.ts definition
    const win = window;
    if (!win.api) {
        win.api = apiInstance;
    }
    // Store in stateManager (TypeScript migration) - store as unknown to avoid type mismatch
    // The stateManager accepts unknown, so this is safe
    if (stateManagerInstance?.setState) {
        stateManagerInstance.setState('api', apiInstance);
    }
}
export { MetaLayerAPI };
export default MetaLayerAPI;

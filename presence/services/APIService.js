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
            const currentUser = stateManagerInstance?.getState?.('currentUser');
            console.log('🔍 USER_IDENTITY: currentUser (from stateManager/window):', currentUser);
            // First try to get from currentUser (set by authentication)
            if (currentUser && currentUser.id) {
                user = { ...currentUser }; // Create a copy to avoid modifying original
                console.log('🔍 USER_IDENTITY: ✅ Using currentUser for authentication:', user.id);
                // CRITICAL FIX: Handle case where auraColor is a Promise (from reactive systems)
                if (user.auraColor && typeof user.auraColor === 'object' && typeof user.auraColor.then === 'function') {
                    console.log('🔍 USER_IDENTITY: ⚠️ auraColor is a Promise, resolving...');
                    try {
                        const resolvedAuraColor = await user.auraColor;
                        console.log('🔍 USER_IDENTITY: ✅ Resolved auraColor Promise to:', resolvedAuraColor);
                        user.auraColor = resolvedAuraColor;
                    }
                    catch (error) {
                        console.warn('🔍 USER_IDENTITY: ❌ Failed to resolve auraColor Promise:', error);
                        user.auraColor = undefined;
                    }
                }
                // CRITICAL FIX: Check currentUser.auraColor directly before API call
                // This handles cases where auraColor is set after the copy
                if (!user.auraColor && currentUser?.auraColor) {
                    user.auraColor = currentUser.auraColor;
                    console.log('🔍 USER_IDENTITY: ✅ Using auraColor from currentUser:', user.auraColor);
                }
                // CRITICAL FIX: If auraColor is still missing, fetch it now to prevent delays
                // Use direct fetch() instead of window.api.request() to break recursion chain
                // This solves the root cause: direct fetch() doesn't call request() again
                if (!user.auraColor && user.id) {
                    console.log('🔍 USER_IDENTITY: 🎨 AuraColor missing, fetching immediately...');
                    try {
                        // ROOT CAUSE FIX: Use direct fetch() instead of window.api.request() 
                        // This breaks the recursion chain - fetch() doesn't invoke request() again
                        const fetchUrl = `http://216.238.91.120:3002/v1/users/${user.id}`;
                        const response = await fetch(fetchUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        if (response.ok) {
                            const userData = await response.json();
                            const auraColor = userData.auraColor || userData.data?.auraColor;
                            const avatarUrl = userData.avatarUrl || userData.data?.avatarUrl;
                            // Update the user object with fetched data
                            if (auraColor) {
                            user.auraColor = auraColor;
                                // Also update currentUser in stateManager/window to prevent future fetches
                                if (currentUser) {
                                    currentUser.auraColor = auraColor;
                                    // Update stateManager (TypeScript migration)
                                    if (stateManagerInstance?.setState) {
                                        stateManagerInstance.setState('currentUser', currentUser);
                                    }
                                }
                                console.log('🔍 USER_IDENTITY: ✅ AuraColor fetched immediately:', auraColor);
                            }
                            if (avatarUrl && !user.avatarUrl) {
                                user.avatarUrl = avatarUrl;
                                if (currentUser && !currentUser.avatarUrl) {
                                    currentUser.avatarUrl = avatarUrl;
                                    if (stateManagerInstance?.setState) {
                                        stateManagerInstance.setState('currentUser', currentUser);
                            }
                                }
                            }
                        } else {
                            console.warn('🔍 USER_IDENTITY: ⚠️ Failed to fetch auraColor - HTTP', response.status);
                        }
                    }
                    catch (error) {
                        console.warn('🔍 USER_IDENTITY: ⚠️ Failed to fetch auraColor immediately:', error);
                    }
                }
            }
            else if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
                const authUser = await window.authManager.getCurrentUser();
                if (authUser && authUser.id) {
                    user = { id: authUser.id, email: authUser.email };
                }
                console.log('🔍 USER_IDENTITY: ✅ Using authManager for authentication:', user?.id);
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
                ...(derivedEmail && { 'X-User-Email': derivedEmail }),
                ...(derivedUserId && { 'X-User-Id': derivedUserId }),
                ...(derivedName && { 'X-User-Name': derivedName }),
                ...(derivedAvatar && { 'X-User-Avatar': derivedAvatar }),
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
            if (error.name === 'AbortError') {
                console.warn('⚠️ API Request Timeout:', finalUrl);
                return {
                    error: 'API request timeout - server may be unavailable',
                    status: 0,
                    timeout: true
                };
            } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                // Connection refused - server is down or unreachable
                console.warn('⚠️ API Connection Refused:', finalUrl, '- Server may be down. Extension will continue with limited functionality.');
                return {
                    error: 'API server unavailable - connection refused',
                    status: 0,
                    connectionRefused: true
                };
            } else {
                console.warn('⚠️ API Request Error:', error.message);
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
    // Store in stateManager (TypeScript migration)
    if (stateManagerInstance?.setState) {
        stateManagerInstance.setState('api', apiInstance);
    }
    // Also set on window for backward compatibility during migration
    if (!window.api) {
        window.api = apiInstance;
    }
}
export { MetaLayerAPI };
export default MetaLayerAPI;

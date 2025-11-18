/**
 * API SERVICE - TypeScript Version
 * MetaLayer API client service
 */
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
            console.log('🔍 USER_IDENTITY: window.currentUser:', window.currentUser);
            // First try to get from window.currentUser (set by authentication)
            if (window.currentUser && window.currentUser.id) {
                user = { ...window.currentUser }; // Create a copy to avoid modifying original
                console.log('🔍 USER_IDENTITY: ✅ Using window.currentUser for authentication:', user.id);
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
                // CRITICAL FIX: If auraColor is missing, fetch it now to prevent delays
                if (!user.auraColor && user.id && window.api) {
                    console.log('🔍 USER_IDENTITY: 🎨 AuraColor missing, fetching immediately...');
                    try {
                        const userResponse = await window.api.request(`/v1/users/${user.id}`, {
                            method: 'GET'
                        });
                        if (userResponse && userResponse.data) {
                            const userData = userResponse.data;
                            const auraColor = userData.auraColor;
                            const avatarUrl = userData.avatarUrl;
                            // Update the user object with fetched data
                            user.auraColor = auraColor;
                            if (avatarUrl && !user.avatarUrl) {
                                user.avatarUrl = avatarUrl;
                            }
                            // Also update window.currentUser to prevent future fetches
                            if (window.currentUser) {
                                window.currentUser.auraColor = auraColor;
                                if (avatarUrl && !window.currentUser.avatarUrl) {
                                    window.currentUser.avatarUrl = avatarUrl;
                                }
                            }
                            console.log('🔍 USER_IDENTITY: ✅ AuraColor fetched immediately:', auraColor);
                        }
                    }
                    catch (error) {
                        console.warn('🔍 USER_IDENTITY: ⚠️ Failed to fetch auraColor immediately:', error);
                    }
                }
            }
            else if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
                user = await window.authManager.getCurrentUser();
                console.log('🔍 USER_IDENTITY: ✅ Using authManager for authentication:', user?.id);
            }
            else if (typeof window.getCurrentUserEmail === 'function') {
                const email = await window.getCurrentUserEmail();
                if (email) {
                    user = { email: email };
                    console.log('🔍 USER_IDENTITY: ✅ Using getCurrentUserEmail for authentication:', email);
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
        const derivedUserId = user?.id || window.currentUser?.id || null;
        const derivedEmail = user?.email || window.currentUser?.email || null;
        const derivedName = user?.name || window.currentUser?.name || undefined;
        const derivedAvatar = user?.avatarUrl || window.currentUser?.avatarUrl || undefined;
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
            const response = await fetch(finalUrl, config);
            // Handle 404 specifically if allow404 is set
            if (response.status === 404 && options.allow404) {
                return { data: null, status: 404 };
            }
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error: ${response.status} ${response.statusText}`, errorText);
                return {
                    error: `API request failed: ${response.status} ${response.statusText}`,
                    status: response.status
                };
            }
            const data = await response.json();
            return { data, status: response.status };
        }
        catch (error) {
            console.error('❌ API Request Error:', error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error',
                status: 0
            };
        }
    }
}
// Maintain global api instance for legacy code without exporting MetaLayerAPI constructor
if (typeof window !== 'undefined' && !window.api) {
    window.api = new MetaLayerAPI('http://216.238.91.120:3002');
}
export { MetaLayerAPI };
export default MetaLayerAPI;

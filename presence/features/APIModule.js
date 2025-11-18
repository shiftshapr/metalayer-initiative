/**
 * APIModule.ts - API Management Module
 * TypeScript + ES6 Module
 * Extracted from sidepanel.js for modular architecture
 *
 * Responsibilities:
 * - MetaLayerAPI class definition
 * - API client initialization
 * - API request handling
 * - Authentication integration
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { authManagerInstance } from '../features/AuthManager.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { formatUserDisplayName, formatUserHandle } from '../utils/Fallbacks.js';
// Optional dependencies (will be injected or imported when modules are available)
let getCurrentUserEmail;
let normalizeUrl;
// API client for Meta-Layer Initiative (COMP VERSION)
class MetaLayerAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
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
            const currentUser = stateManagerInstance.getState('currentUser');
            console.log('🔍 USER_IDENTITY: === API USER IDENTITY TRACE ===');
            console.log('🔍 USER_IDENTITY: currentUser:', currentUser);
            console.log('🔍 USER_IDENTITY: currentUser?.id:', currentUser?.id);
            console.log('🔍 USER_IDENTITY: authManager:', typeof authManagerInstance);
            console.log('🔍 USER_IDENTITY: getCurrentUserEmail:', typeof getCurrentUserEmail);
            // First try to get from currentUser (set by authentication)
            if (currentUser && currentUser.id) {
                user = { ...currentUser }; // Create a copy to avoid modifying original
                console.log('🔍 USER_IDENTITY: ✅ Using currentUser for authentication:', user.id);
                console.log('🔍 USER_IDENTITY: ✅ User name:', user.name);
                console.log('🔍 USER_IDENTITY: ✅ User avatar:', user.avatarUrl);
                console.log('🔍 USER_IDENTITY: ✅ User auraColor:', user.auraColor);
                // CRITICAL FIX: Handle case where auraColor is a Promise (from reactive systems)
                if (user.auraColor && typeof user.auraColor === 'object' && 'then' in user.auraColor && typeof user.auraColor.then === 'function') {
                    console.log('🔍 USER_IDENTITY: ⚠️ auraColor is a Promise, resolving...');
                    console.log('🔍 USER_IDENTITY: Promise object:', user.auraColor);
                    try {
                        const resolvedAuraColor = await user.auraColor;
                        console.log('🔍 USER_IDENTITY: ✅ Resolved auraColor Promise to:', resolvedAuraColor);
                        user.auraColor = resolvedAuraColor;
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        console.warn('🔍 USER_IDENTITY: ❌ Failed to resolve auraColor Promise:', error);
                        console.warn('🔍 USER_IDENTITY: Error details:', errorMessage);
                        user.auraColor = undefined;
                    }
                }
                // CRITICAL FIX: If auraColor is missing or resolved to fallback, fetch it now to prevent delays
                const api = stateManagerInstance.getState('api');
                if (!user.auraColor && user.id && api) {
                    console.log('🔍 USER_IDENTITY: 🎨 AuraColor missing, fetching immediately...');
                    try {
                        const userResponse = await api.request(`/v1/users/${user.id}`, {
                            method: 'GET'
                        });
                        if (userResponse) {
                            const auraColor = userResponse.auraColor;
                            const avatarUrl = userResponse.avatarUrl;
                            // Update the user object with fetched data
                            user.auraColor = auraColor;
                            if (avatarUrl && !user.avatarUrl) {
                                user.avatarUrl = avatarUrl;
                            }
                            // Also update currentUser in StateManager to prevent future fetches
                            if (currentUser) {
                                currentUser.auraColor = auraColor;
                                if (avatarUrl && !currentUser.avatarUrl) {
                                    currentUser.avatarUrl = avatarUrl;
                                }
                                stateManagerInstance.setState('currentUser', currentUser);
                            }
                            console.log('🔍 USER_IDENTITY: ✅ AuraColor fetched immediately:', auraColor);
                            console.log('🔍 USER_IDENTITY: ✅ AvatarUrl updated:', avatarUrl);
                        }
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        console.warn('🔍 USER_IDENTITY: ⚠️ Failed to fetch auraColor immediately:', errorMessage);
                    }
                }
            }
            else if (authManagerInstance && typeof authManagerInstance.getCurrentUser === 'function') {
                user = await authManagerInstance.getCurrentUser();
                console.log('🔍 USER_IDENTITY: ✅ Using authManager for authentication:', user?.id);
            }
            else if (getCurrentUserEmail) {
                const email = await getCurrentUserEmail();
                if (email) {
                    user = { email: email };
                    console.log('🔍 USER_IDENTITY: ✅ Using getCurrentUserEmail for authentication:', email);
                }
            }
            else {
                console.log('🔍 USER_IDENTITY: ❌ No user authentication available');
            }
            console.log('🔍 USER_IDENTITY: Final user object for API:', {
                id: user?.id,
                name: user?.name,
                email: user?.email,
                avatarUrl: user?.avatarUrl,
                auraColor: user?.auraColor,
                hasAuraColor: !!user?.auraColor,
                auraColorType: typeof user?.auraColor
            });
            console.log('🔍 USER_IDENTITY: === END API USER IDENTITY TRACE ===');
        }
        catch (error) {
            console.log('🔍 USER_IDENTITY: ❌ Error getting user authentication:', error);
        }
        // Derive identifiers early for consistent headers
        // User data should already be normalized via setCurrentUser, but handle raw Supabase data if needed
        const currentUser = stateManagerInstance.getState('currentUser');
        const derivedUserId = user?.id || currentUser?.id || null;
        const derivedEmail = user?.email || currentUser?.email || null;
        const derivedName = user?.name || currentUser?.name || undefined;
        const derivedAvatar = user?.avatarUrl || currentUser?.avatarUrl || undefined;
        // currentUser.id is always a UUID (from AppUser table) - no format validation needed
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(derivedEmail && { 'X-User-Email': derivedEmail }),
                // currentUser.id is always a UUID from AppUser table
                ...(derivedUserId && { 'X-User-Id': derivedUserId }),
                ...(derivedName && { 'X-User-Name': derivedName }),
                ...(derivedAvatar && { 'X-User-Avatar': derivedAvatar }),
                ...options.headers
            },
            ...options
        };
        try {
            const response = await fetch(finalUrl, config);
            // Allow callers to opt-in to treating 404 as a non-throwing null result
            if (response.status === 404 && options.allow404) {
                console.warn('API 404 (allowed):', finalUrl);
                return null;
            }
            if (response.status === 401 && options.allow401) {
                console.warn('API 401 (allowed):', finalUrl);
                return null;
            }
            // CRITICAL FIX: Handle 500 errors gracefully if allow500 option is set
            if (response.status === 500 && options.allow500) {
                console.warn('⚠️ API: 500 error (allowed):', finalUrl);
                return null;
            }
            if (!response.ok) {
                // Include response body in error for debugging 400/401/500
                let errorDetails = `HTTP error! status: ${response.status}`;
                try {
                    const errorBody = await response.text();
                    if (errorBody) {
                        try {
                            const parsed = JSON.parse(errorBody);
                            errorDetails += ` - ${JSON.stringify(parsed)}`;
                        }
                        catch {
                            errorDetails += ` - ${errorBody.substring(0, 200)}`;
                        }
                    }
                }
                catch (e) {
                    // Ignore errors reading response body
                }
                const error = new Error(errorDetails);
                error.status = response.status;
                throw error;
            }
            // Handle empty responses
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                return null;
            }
            const data = await response.json();
            // ROOT CAUSE FIX: Only set currentUser.id from responses that are FOR THE CURRENT USER
            // DO NOT set it from other users' data in reactions/messages!
            // Only trust user.id from /v1/users/:email or user objects that match current email
            const currentUser = stateManagerInstance.getState('currentUser');
            if (data && currentUser && !currentUser.id) {
                const currentUserEmail = currentUser.email?.toLowerCase().trim();
                // Only set UUID if:
                // 1. Response has a user object with matching email, OR
                // 2. Response is from /v1/users/:email endpoint (which returns user data for current user)
                let appUserId = null;
                if (data.user && data.user.email && data.user.email.toLowerCase().trim() === currentUserEmail) {
                    // This is a user object for the current user
                    appUserId = data.user.id;
                }
                else if (data.email && data.email.toLowerCase().trim() === currentUserEmail) {
                    // Direct user response (from /v1/users/:email)
                    appUserId = data.id;
                }
                // CRITICAL: DO NOT use reaction.user_id or reaction.AppUser.id - those are OTHER users' IDs!
                // DO NOT use data.id unless we've verified it's for the current user
                if (appUserId) {
                    console.log('✅ ROOT CAUSE FIX: Backend returned AppUser UUID for current user:', appUserId);
                    console.log('✅ Storing AppUser UUID in currentUser.id');
                    currentUser.id = appUserId;
                    stateManagerInstance.setState('currentUser', currentUser);
                }
                else {
                    console.log('🔍 APIModule: Skipping UUID assignment - response not for current user or no email match');
                }
            }
            return data;
        }
        catch (error) {
            // Handle connection refused errors gracefully (backend not running)
            const errorObj = error instanceof Error ? error : { message: String(error), name: 'Error' };
            const isConnectionError = errorObj.message && (errorObj.message.includes('Failed to fetch') ||
                errorObj.message.includes('ERR_CONNECTION_REFUSED') ||
                errorObj.message.includes('NetworkError') ||
                errorObj.name === 'TypeError' && errorObj.message.includes('fetch'));
            if (isConnectionError) {
                // Only log as warning for connection errors, not as critical errors
                // Suppress duplicate warnings (only log once per unique URL pattern)
                const urlPattern = finalUrl.replace(/\/[a-f0-9-]+/g, '/[id]').replace(/[?&].*$/, '');
                let apiConnectionErrors = stateManagerInstance.getState('_apiConnectionErrors') || 0;
                if (apiConnectionErrors < 1) {
                    apiConnectionErrors = apiConnectionErrors + 1;
                    stateManagerInstance.setState('_apiConnectionErrors', apiConnectionErrors);
                    console.warn('⚠️ API: Backend offline - connection refused:', urlPattern);
                    console.warn('💡 Extension will work in offline mode. Some features may be limited.');
                }
                // Always return null for connection errors to allow graceful degradation
                // This prevents cascade of errors throughout the extension
                return null;
            }
            // Log other errors normally
            console.error('API request failed:', error);
            throw error;
        }
    }
    async getCommunities() {
        // Get current user to filter communities by membership - use AuthManager
        const user = await authManagerInstance.getCurrentUser();
        const userId = user?.id;
        const url = userId ? `/communities?userId=${encodeURIComponent(userId)}` : '/communities';
        // CRITICAL FIX: Handle 500 errors gracefully by returning null instead of throwing
        try {
            const response = await this.request(url, { allow500: true }); // Allow 500 to return null
            return response;
        }
        catch (error) {
            // CRITICAL FIX: For 500 errors, return null instead of throwing to allow graceful degradation
            const errorObj = error;
            if (errorObj.status === 500) {
                console.warn('⚠️ API: getCommunities returned 500 error, returning null for graceful degradation');
                return null;
            }
            // Re-throw other errors
            throw error;
        }
    }
    async getAvatars(communityId) {
        return this.request(`/avatars/active?communityId=${communityId}`);
    }
    async getPresenceByUrl(url, communityIds = null) {
        console.log('🔍 API: getPresenceByUrl called with URL:', url, 'communities:', communityIds);
        const params = new URLSearchParams({ url });
        if (communityIds && Array.isArray(communityIds) && communityIds.length > 0) {
            params.append('communityIds', communityIds.join(','));
        }
        // COMP METHOD: Use the same user detection logic as the main request method
        let user = null;
        try {
            // First try to get from currentUser (set by authentication)
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser && currentUser.id) {
                user = currentUser;
                console.log('🔍 API: Using currentUser for authentication:', user.id);
            }
            else if (authManagerInstance && typeof authManagerInstance.getCurrentUser === 'function') {
                user = await authManagerInstance.getCurrentUser();
                console.log('🔍 API: Using authManager for authentication:', user?.id);
            }
            else {
                console.log('🔍 API: No user authentication available');
            }
        }
        catch (error) {
            console.log('🔍 API: Error getting user authentication:', error);
        }
        // CRITICAL FIX: Pass user object to request method to ensure auth headers are sent
        const response = await this.request(`/v1/presence/url?${params.toString()}`, {
            user,
            method: 'GET'
        });
        console.log('🔍 API: getPresenceByUrl response:', JSON.stringify(response, null, 2));
        return response;
    }
    async getPresenceByCommunities(communityIds) {
        console.log('🔍 API: getPresenceByCommunities called with communities:', communityIds);
        const params = new URLSearchParams({ communityIds: communityIds.join(',') });
        // COMP METHOD: Use the same user detection logic as the main request method
        let user = null;
        try {
            // First try to get from currentUser (set by authentication)
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser && currentUser.id) {
                user = currentUser;
                console.log('🔍 API: Using currentUser for authentication:', user.id);
            }
            else if (authManagerInstance && typeof authManagerInstance.getCurrentUser === 'function') {
                user = await authManagerInstance.getCurrentUser();
                console.log('🔍 API: Using authManager for authentication:', user?.id);
            }
            else {
                console.log('🔍 API: No user authentication available');
            }
        }
        catch (error) {
            console.log('🔍 API: Error getting user authentication:', error);
        }
        const response = await this.request(`/v1/presence/communities?${params.toString()}`, { user });
        console.log('🔍 API: getPresenceByCommunities response:', JSON.stringify(response, null, 2));
        return response;
    }
    async login() {
        return this.request('/auth/login', { method: 'POST' });
    }
    async getMe() {
        return this.request('/auth/me');
    }
    async sendMessage(userId, communityId, content, uri = null, parentId = null, threadId = null, optionalContent = null) {
        // Simplified to use the working /chat/message endpoint with UUID-based identification
        return this.request('/chat/message', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                communityId,
                content,
                uri,
                parentId,
                threadId,
                optionalContent
            })
        });
    }
    async getChatHistory(communityId, threadId = null, uri = null) {
        // Use Supabase directly instead of backend API (COMP method)
        console.log(`CHAT_API: getChatHistory called with communityId=${communityId}, threadId=${threadId}, uri=${uri}`, null, 'general');
        console.log(`CHAT_API: uri type: ${typeof uri}, value: ${JSON.stringify(uri)}`, null, 'general');
        if (!communityId) {
            console.error('❌ CHAT_API: communityId is required');
            return { conversations: [], messages: [] };
        }
        // Use Supabase directly instead of backend API
        const supabase = stateManagerInstance.getState('supabase');
    }
}
 | undefined;
if (!supabase || !supabase.from) {
    console.error('❌ CHAT_API: No Supabase client available');
    return { conversations: [], messages: [] };
}
try {
    // Get pageId from URI if provided
    let pageId = null;
    if (uri) {
        // Use the same URL normalization logic as the backend
        const normalizedUrl = normalizeUrl ? normalizeUrl(uri) : uri;
        pageId = typeof normalizedUrl === 'object' && normalizedUrl !== null && 'pageId' in normalizedUrl ? normalizedUrl.pageId : (typeof normalizedUrl === 'string' ? normalizedUrl : null);
    }
    console.log(`🔍 CHAT_API: Querying Supabase messages table for pageId: ${pageId}, communityId: ${communityId}`);
    // FIX: Join with AppUser table to get author data (prevent "Unknown" authors)
    // Query Supabase messages table with AppUser join
    let query = supabase.from('messages').select('*, AppUser:user_id(*)');
    // ROOT CAUSE DEBUG: Check what pageIds exist in database
    if (pageId) {
        query = query.eq('page_id', pageId);
        console.log(`🔍 CHAT_API: Filtering by pageId: ${pageId}`);
    }
    else {
        console.log(`⚠️ CHAT_API: No pageId provided, querying all pages`);
    }
    if (communityId) {
        query = query.eq('community_id', communityId);
        console.log(`🔍 CHAT_API: Filtering by communityId: ${communityId}`);
    }
    else {
        console.log(`⚠️ CHAT_API: No communityId provided, querying all communities`);
    }
    const { data: messages, error: messagesError } = await query.order('created_at', { ascending: true });
    // ROOT CAUSE DEBUG: Log what we found
    if (messages && messages.length > 0) {
        console.log(`✅ CHAT_API: Found ${messages.length} messages`);
        console.log(`🔍 CHAT_API: Sample message pageIds:`, messages.slice(0, 3).map((m) => m.page_id));
    }
    else {
        console.log(`⚠️ CHAT_API: No messages found with filters: pageId=${pageId}, communityId=${communityId}`);
        // Debug: Query without filters to see what exists
        const { data: allMessages } = await supabase.from('messages').select('page_id, community_id').limit(10);
        console.log(`🔍 CHAT_API: Sample messages in DB (first 10):`, allMessages?.map((m) => ({ page_id: m.page_id, community_id: m.community_id })));
    }
    if (messagesError) {
        console.error('❌ CHAT_API: Supabase query failed:', messagesError);
        return { conversations: [], messages: [] };
    }
    console.log(`🔍 CHAT_API: Found ${messages?.length || 0} messages in Supabase`);
    // Convert Supabase messages to API format
    // Boundary transform: Supabase `messages` rows (snake_case) → internal Message interface (camelCase)
    const msgs = messages?.map((msg) => ({
        id: msg.id,
        content: msg.content, // Use standardized content field
        authorId: msg.user_id || msg.AppUser?.id, // API still returns user_id, will be transformed
        conversationId: `conv-${communityId}-${pageId}`,
        createdAt: msg.created_at, // API still returns created_at, will be transformed
        updatedAt: msg.updated_at, // API still returns updated_at, will be transformed
        parentId: msg.parent_id || null, // Use actual parentId from database
        author: {
            id: msg.AppUser?.id || msg.user_id, // API still returns user_id, will be transformed
            name: formatUserDisplayName(msg.AppUser),
            handle: formatUserHandle(msg.AppUser),
            avatarUrl: msg.AppUser?.avatarUrl || null,
            // FIX: Get aura color from AppUser table, not currentUser
            auraColor: msg.AppUser?.auraColor || AVATAR_FALLBACK_COLOR
        },
        conversation: {
            id: `conv-${communityId}-${pageId}`,
            communityId: communityId
        }
    })) || [];
    console.log(`🔍 CHAT_API: Converted ${msgs.length} messages`);
    // Transform messages into conversation format expected by frontend
    const conversations = [{
            id: `conv-${communityId}-${pageId}`,
            communityId: communityId,
            posts: msgs
        }];
    return { conversations, messages: msgs };
}
catch (error) {
    console.error('❌ CHAT_API: Error in getChatHistory:', error);
    return { conversations: [], messages: [] };
}
async;
deleteMessage(messageId, string);
Promise < APIResponseOrNull > {
    // COMP METHOD: Use exact same endpoint as COMP
    return: this.request(`/v1/posts/${messageId}`, { method: 'DELETE' })
};
async;
editMessage(messageId, string, newContent, string);
Promise < APIResponseOrNull > {
    // Use new Canopi 2 post system
    return: this.request(`/v1/posts/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ body: newContent })
    })
};
async;
getReactions(messageId, string);
Promise < APIResponseOrNull > {
    return: this.request(`/v1/reactions?messageId=${messageId}`)
};
async;
addReaction(messageId, string, reactionType, string);
Promise < APIResponseOrNull > {
    return: this.request('/v1/reactions', {
        method: 'POST',
        body: JSON.stringify({ messageId, reactionType })
    })
};
async;
removeReaction(messageId, string, reactionType, string);
Promise < APIResponseOrNull > {
    return: this.request('/v1/reactions', {
        method: 'DELETE',
        body: JSON.stringify({ messageId, reactionType })
    })
};
async;
getReactionsByMessage(messageId, string);
Promise < APIResponseOrNull > {
    const: params = new URLSearchParams({ messageId }),
    return: this.request(`/v1/reactions?${params.toString()}`)
};
// Initialize API client (COMP METHOD)
const api = new MetaLayerAPI('http://216.238.91.120:3002');
// COMP_API_FIX: Also handle XMLHttpRequest redirection for older code
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
    if (typeof url === 'string') {
        let modifiedUrl = url;
        if (url.includes('api.themetalayer.org')) {
            modifiedUrl = url.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');
            console.log(`🔍 COMP_API_FIX: XHR Redirecting api.themetalayer.org ${url} to ${modifiedUrl}`);
        }
        else if (url.startsWith('/v1/') || url.startsWith('/communities') || url.startsWith('/avatars')) {
            // Handle relative API URLs - redirect to VPS
            modifiedUrl = `http://216.238.91.120:3002${url}`;
            console.log(`🔍 COMP_API_FIX: XHR Redirecting relative URL ${url} to ${modifiedUrl}`);
        }
        if (async !== undefined && username !== undefined && password !== undefined) {
            originalXHROpen.call(this, method, modifiedUrl, async, username, password);
            return;
        }
        else if (async !== undefined) {
            originalXHROpen.call(this, method, modifiedUrl, async);
            return;
        }
        else {
            originalXHROpen.call(this, method, modifiedUrl, true);
            return;
        }
    }
    if (async !== undefined && username !== undefined && password !== undefined) {
        originalXHROpen.call(this, method, url, async, username, password);
        return;
    }
    else if (async !== undefined) {
        originalXHROpen.call(this, method, url, async);
        return;
    }
    else {
        originalXHROpen.call(this, method, url, true);
        return;
    }
};
// Export API instance for ES6 modules
export { api, MetaLayerAPI };
// COMP_API_FIX: Disabled global fetch override - using targeted approach instead
// The global fetch override was causing cascading failures
// Instead, we'll fix individual modules to use proper API calls
console.log('✅ APIModule: MetaLayerAPI initialized with global fetch override');
// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MetaLayerAPI, api };
}

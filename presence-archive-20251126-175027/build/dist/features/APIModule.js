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
import { API_CONFIG } from '../core/APIConfig.js';
import { formatUserDisplayName, formatUserHandle } from '../utils/Fallbacks.js';
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
// Optional dependencies (will be injected or imported when modules are available)
let getCurrentUserEmail;
let normalizeUrl;
function isSupabaseClientLike(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value;
    return typeof candidate.from === 'function';
}
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
                finalUrl = endpoint.replace('https://api.themetalayer.org', API_CONFIG.baseUrl);
                Logger.debug('✅ COMP_API_FIX: Redirected api.themetalayer.org call:', { endpoint, finalUrl }, 'api');
            }
            else if (endpoint.includes('supabase.co')) {
                // Extract the actual endpoint path after /rest/v1/
                const pathMatch = endpoint.match(/\/rest\/v1\/(.+)/);
                if (pathMatch) {
                    const actualEndpoint = pathMatch[1];
                    finalUrl = `${this.baseURL}/${actualEndpoint}`;
                    Logger.debug('✅ COMP_API_FIX: Redirected Supabase API call:', { endpoint, finalUrl }, 'api');
                }
            }
        }
        else if (endpoint.startsWith('/v1/') || endpoint.startsWith('/communities') || endpoint.startsWith('/avatars')) {
            // Handle relative API URLs - redirect to VPS
            finalUrl = `${API_CONFIG.baseUrl}${endpoint}`;
            Logger.debug('✅ COMP_API_FIX: Redirected relative API call:', { endpoint, finalUrl }, 'api');
        }
        // COMP METHOD: Get current user info to send in headers
        let user = null;
        try {
            const currentUser = stateManagerInstance.getState('currentUser');
            Logger.debug('🔍 USER_IDENTITY: === API USER IDENTITY TRACE ===', null, 'api');
            Logger.debug('🔍 USER_IDENTITY: currentUser:', currentUser, 'api');
            Logger.debug('🔍 USER_IDENTITY: currentUser?.id:', currentUser?.id, 'api');
            Logger.debug('🔍 USER_IDENTITY: authManager:', typeof authManagerInstance, 'api');
            Logger.debug('🔍 USER_IDENTITY: getCurrentUserEmail:', typeof getCurrentUserEmail, 'api');
            // First try to get from currentUser (set by authentication)
            if (currentUser && currentUser.id) {
                user = { ...currentUser }; // Create a copy to avoid modifying original
                Logger.debug('🔍 USER_IDENTITY: ✅ Using currentUser for authentication:', user.id, 'api');
                Logger.debug('🔍 USER_IDENTITY: ✅ User name:', user.name, 'api');
                Logger.debug('🔍 USER_IDENTITY: ✅ User avatar:', user.avatarUrl, 'api');
                Logger.debug('🔍 USER_IDENTITY: ✅ User auraColor:', user.auraColor, 'api');
                // CRITICAL FIX: Handle case where auraColor is a Promise (from reactive systems)
                if (user.auraColor && typeof user.auraColor === 'object' && 'then' in user.auraColor && typeof user.auraColor.then === 'function') {
                    Logger.debug('🔍 USER_IDENTITY: ⚠️ auraColor is a Promise, resolving...', 'api');
                    Logger.debug('🔍 USER_IDENTITY: Promise object:', user.auraColor, 'api');
                    try {
                        const resolvedAuraColor = await user.auraColor;
                        Logger.debug('🔍 USER_IDENTITY: ✅ Resolved auraColor Promise to:', resolvedAuraColor, 'api');
                        user.auraColor = resolvedAuraColor;
                    }
                    catch (error) {
                        handleError(error, {
                            log: true,
                            logLevel: 'warn',
                            context: {
                                operation: 'catch',
                                component: 'API'
                            }
                        });
                        ;
                        handleError(error, {
                            log: true,
                            logLevel: 'warn',
                            context: {
                                operation: 'catch',
                                component: 'API'
                            }
                        });
                        ;
                        user.auraColor = undefined;
                    }
                }
                // CRITICAL FIX: If auraColor is missing or resolved to fallback, fetch it now to prevent delays
                const api = stateManagerInstance.getState('api');
                if (!user.auraColor && user.id && api) {
                    Logger.debug('🔍 USER_IDENTITY: 🎨 AuraColor missing, fetching immediately...', 'api');
                    try {
                        const userResponse = await api.request(`/v1/users/${user.id}`, {
                            method: 'GET'
                        });
                        if (userResponse && userResponse.data) {
                            const auraColor = userResponse.data.auraColor;
                            const avatarUrl = userResponse.data.avatarUrl;
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
                            Logger.debug('🔍 USER_IDENTITY: ✅ AuraColor fetched immediately:', auraColor, 'api');
                            Logger.debug('🔍 USER_IDENTITY: ✅ AvatarUrl updated:', avatarUrl, 'api');
                        }
                    }
                    catch (error) {
                        handleError(error, {
                            log: true,
                            logLevel: 'warn',
                            context: {
                                operation: 'catch',
                                component: 'API'
                            }
                        });
                        ;
                    }
                }
            }
            else if (authManagerInstance && typeof authManagerInstance.getCurrentUser === 'function') {
                user = await authManagerInstance.getCurrentUser();
                Logger.debug('🔍 USER_IDENTITY: ✅ Using authManager for authentication:', user?.id, 'api');
            }
            else if (getCurrentUserEmail) {
                const email = await getCurrentUserEmail();
                if (email) {
                    user = { email: email };
                    Logger.debug('🔍 USER_IDENTITY: ✅ Using getCurrentUserEmail for authentication:', email, 'api');
                }
            }
            else {
                Logger.debug('🔍 USER_IDENTITY: ❌ No user authentication available', null, 'api');
            }
            Logger.debug('🔍 USER_IDENTITY: Final user object for API:', {
                id: user?.id,
                name: user?.name,
                email: user?.email,
                avatarUrl: user?.avatarUrl,
                auraColor: user?.auraColor,
                hasAuraColor: !!user?.auraColor,
                auraColorType: typeof user?.auraColor
            }, 'api');
            Logger.debug('🔍 USER_IDENTITY: === END API USER IDENTITY TRACE ===', null, 'api');
        }
        catch (error) {
            Logger.debug('🔍 USER_IDENTITY: ❌ Error getting user authentication:', error, 'api');
        }
        // Derive identifiers early for consistent headers
        // User data should already be normalized via setCurrentUser, but handle raw Supabase data if needed
        const currentUser = stateManagerInstance.getState('currentUser');
        const derivedUserId = user?.id || currentUser?.id || null;
        const derivedEmail = user?.email || currentUser?.email || null;
        const derivedName = user?.name || currentUser?.name || undefined;
        const derivedAvatar = user?.avatarUrl || currentUser?.avatarUrl || undefined;
        // currentUser.id is always a UUID (from AppUser table) - no format validation needed
        // Construct RequestInit-compatible config
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(derivedEmail && { 'X-User-Email': derivedEmail }),
                // currentUser.id is always a UUID from AppUser table
                ...(derivedUserId && { 'X-User-Id': derivedUserId }),
                ...(derivedName && { 'X-User-Name': derivedName }),
                ...(derivedAvatar && { 'X-User-Avatar': derivedAvatar }),
                ...options.headers
            }
        };
        // Handle body separately to ensure proper type
        if (options.body !== undefined) {
            if (typeof options.body === 'string') {
                config.body = options.body;
            }
            else {
                config.body = JSON.stringify(options.body);
            }
        }
        try {
            const response = await fetch(finalUrl, config);
            // Allow callers to opt-in to treating 404 as a non-throwing null result
            if (response.status === 404 && options.allow404) {
                Logger.warn('API 404 (allowed):', finalUrl, 'api');
                return null;
            }
            if (response.status === 401 && options.allow401) {
                Logger.warn('API 401 (allowed):', finalUrl, 'api');
                return null;
            }
            // CRITICAL FIX: Handle 500 errors gracefully if allow500 option is set
            if (response.status === 500 && options.allow500) {
                Logger.warn('⚠️ API: 500 error (allowed):', finalUrl, 'api');
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
            // UUID ONLY - never use email to bootstrap or match UUID
            // If currentUser.id is missing, it's an auth flow bug - don't try to fix it here
            // The UUID should come from the authentication system, not from API responses
            const currentUser = stateManagerInstance.getState('currentUser');
            if (data && typeof data === 'object' && currentUser && !currentUser.id) {
                Logger.warn('⚠️ API: currentUser.id is missing - this indicates an auth flow bug. UUID should come from auth system, not API responses.', null, 'api');
                // DO NOT try to bootstrap UUID from email matching - this violates UUID-only policy
                // If UUID is missing, the auth system needs to be fixed
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
                let apiConnectionErrors = stateManagerInstance.getState('_apiConnectionErrors') || 0;
                if (apiConnectionErrors < 1) {
                    apiConnectionErrors = apiConnectionErrors + 1;
                    stateManagerInstance.setState('_apiConnectionErrors', apiConnectionErrors);
                    handleError(error, {
                        log: true,
                        logLevel: 'warn',
                        context: {
                            operation: 'catch',
                            component: 'API'
                        }
                    });
                    ;
                    handleError(error, {
                        log: true,
                        logLevel: 'warn',
                        context: {
                            operation: 'catch',
                            component: 'API'
                        }
                    });
                    ;
                }
                // Always return null for connection errors to allow graceful degradation
                // This prevents cascade of errors throughout the extension
                return null;
            }
            // Log other errors normally
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'API'
                }
            });
            ;
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
                handleError(error, {
                    log: true,
                    logLevel: 'warn',
                    context: {
                        operation: 'getCommunities',
                        component: 'API',
                        userId
                    }
                });
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
        Logger.debug('🔍 API: getPresenceByUrl called with URL:', { url, communityIds }, 'api');
        const params = new URLSearchParams({ url });
        if (communityIds && Array.isArray(communityIds) && communityIds.length > 0) {
            params.append('communityIds', communityIds.join(','));
        }
        // COMP METHOD: Use the same user detection logic as the main request method
        let user = undefined;
        try {
            // First try to get from currentUser (set by authentication)
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser && currentUser.id) {
                user = currentUser;
                Logger.debug('🔍 API: Using currentUser for authentication:', user.id, 'api');
            }
            else if (authManagerInstance && typeof authManagerInstance.getCurrentUser === 'function') {
                const authUser = await authManagerInstance.getCurrentUser();
                user = authUser || undefined;
                Logger.debug('🔍 API: Using authManager for authentication:', user?.id, 'api');
            }
            else {
                Logger.debug('🔍 API: No user authentication available', null, 'api');
            }
        }
        catch (error) {
            Logger.debug('🔍 API: Error getting user authentication:', error, 'api');
        }
        // CRITICAL FIX: Pass user object to request method to ensure auth headers are sent
        const response = await this.request(`/v1/presence/url?${params.toString()}`, {
            user,
            method: 'GET'
        });
        Logger.debug('🔍 API: getPresenceByUrl response:', response, 'api');
        return response;
    }
    async getPresenceByCommunities(communityIds) {
        Logger.debug('🔍 API: getPresenceByCommunities called with communities:', communityIds, 'api');
        const params = new URLSearchParams({ communityIds: communityIds.join(',') });
        // COMP METHOD: Use the same user detection logic as the main request method
        let user = undefined;
        try {
            // First try to get from currentUser (set by authentication)
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser && currentUser.id) {
                user = currentUser;
                Logger.debug('🔍 API: Using currentUser for authentication:', user.id, 'api');
            }
            else if (authManagerInstance && typeof authManagerInstance.getCurrentUser === 'function') {
                const authUser = await authManagerInstance.getCurrentUser();
                user = authUser || undefined;
                Logger.debug('🔍 API: Using authManager for authentication:', user?.id, 'api');
            }
            else {
                Logger.debug('🔍 API: No user authentication available', null, 'api');
            }
        }
        catch (error) {
            Logger.debug('🔍 API: Error getting user authentication:', error, 'api');
        }
        const response = await this.request(`/v1/presence/communities?${params.toString()}`, { user });
        Logger.debug('🔍 API: getPresenceByCommunities response:', response, 'api');
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
        Logger.debug(`CHAT_API: getChatHistory called with communityId=${communityId}, threadId=${threadId}, uri=${uri}`, null, 'api');
        Logger.debug(`CHAT_API: uri type: ${typeof uri}, value: ${JSON.stringify(uri)}`, null, 'api');
        if (!communityId) {
            Logger.error('❌ CHAT_API: communityId is required', null, 'api');
            return { conversations: [], messages: [] };
        }
        // Use Supabase directly instead of backend API
        const supabaseState = stateManagerInstance.getState('supabase');
        if (!isSupabaseClientLike(supabaseState)) {
            Logger.error('❌ CHAT_API: No Supabase client available', null, 'api');
            return { conversations: [], messages: [] };
        }
        const supabase = supabaseState;
        let pageId = null;
        try {
            // Get pageId from URI if provided
            if (uri) {
                // Use the same URL normalization logic as the backend
                const normalizedUrl = normalizeUrl ? normalizeUrl(uri) : uri;
                if (typeof normalizedUrl === 'string') {
                    pageId = normalizedUrl;
                }
                else if (normalizedUrl && typeof normalizedUrl === 'object' && 'pageId' in normalizedUrl) {
                    pageId = normalizedUrl.pageId;
                }
                else if (normalizedUrl === null || normalizedUrl === undefined) {
                    Logger.warn('⚠️ CHAT_API: normalizeUrl returned null, using default pageId for testing', 'api');
                    pageId = 'test_page_123';
                }
                else {
                    pageId = null;
                }
                if (!pageId) {
                    Logger.warn('⚠️ CHAT_API: Could not extract pageId from normalizedUrl', null, 'api');
                }
            }
            Logger.debug(`🔍 CHAT_API: Querying Supabase messages table for pageId: ${pageId}, communityId: ${communityId}`, 'api');
            // FIX: Join with AppUser table to get author data (prevent "Unknown" authors)
            // Query Supabase messages table with AppUser join
            let query = supabase.from('messages').select('*, AppUser:user_id(*)');
            // ROOT CAUSE DEBUG: Check what pageIds exist in database
            if (pageId) {
                query = query.eq('page_id', pageId);
                Logger.debug(`🔍 CHAT_API: Filtering by pageId: ${pageId}`, null, 'api');
            }
            else {
                Logger.debug(`⚠️ CHAT_API: No pageId provided, querying all pages`, 'api');
            }
            if (communityId) {
                query = query.eq('community_id', communityId);
                Logger.debug(`🔍 CHAT_API: Filtering by communityId: ${communityId}`, null, 'api');
            }
            else {
                Logger.debug(`⚠️ CHAT_API: No communityId provided, querying all communities`, 'api');
            }
            const { data: messages, error: messagesError } = await query.order('created_at', { ascending: true });
            // ROOT CAUSE DEBUG: Log what we found
            if (messages && messages.length > 0) {
                Logger.debug(`✅ CHAT_API: Found ${messages.length} messages`, null, 'api');
                Logger.debug(`🔍 CHAT_API: Sample message pageIds:`, messages.slice(0, 3).map((m) => m.page_id), 'api');
            }
            else {
                Logger.debug(`⚠️ CHAT_API: No messages found with filters: pageId=${pageId}, communityId=${communityId}`, 'api');
                // Debug: Query without filters to see what exists
                const { data: allMessages } = await supabase.from('messages').select('page_id, community_id').limit(10);
                Logger.debug(`🔍 CHAT_API: Sample messages in DB (first 10):`, allMessages?.map((m) => ({ page_id: m.page_id, community_id: m.community_id })), 'api');
            }
            if (messagesError) {
                Logger.error('❌ CHAT_API: Supabase query failed:', messagesError, 'api');
                return { conversations: [], messages: [] };
            }
            Logger.debug(`🔍 CHAT_API: Found ${messages?.length || 0} messages in Supabase`, null, 'api');
            // Convert Supabase messages to API format
            // Boundary transform: Supabase `messages` rows (snake_case) → internal Message interface (camelCase)
            const msgs = messages?.map((msg) => {
                const resolvedAuthorId = msg.user_id || msg.AppUser?.id || 'unknown-author';
                const createdAt = msg.created_at ?? new Date().toISOString();
                const updatedAt = msg.updated_at ?? createdAt;
                return {
                    id: msg.id,
                    content: msg.content, // Use standardized content field
                    authorId: resolvedAuthorId, // API still returns user_id, will be transformed
                    conversationId: `conv-${communityId}-${pageId}`,
                    createdAt,
                    updatedAt,
                    parentId: msg.parent_id || null, // Use actual parentId from database
                    author: {
                        id: msg.AppUser?.id || msg.user_id, // API still returns user_id, will be transformed
                        name: formatUserDisplayName(msg.AppUser),
                        handle: formatUserHandle(msg.AppUser),
                        avatarUrl: msg.AppUser?.avatarUrl ?? undefined,
                        // FIX: Get aura color from AppUser table, not currentUser
                        auraColor: msg.AppUser?.auraColor || AVATAR_FALLBACK_COLOR
                    },
                    conversation: {
                        id: `conv-${communityId}-${pageId}`,
                        communityId: communityId
                    }
                };
            }) || [];
            Logger.debug(`🔍 CHAT_API: Converted ${msgs.length} messages`, null, 'api');
            // Transform messages into conversation format expected by frontend
            const conversations = [{
                    id: `conv-${communityId}-${pageId}`,
                    communityId: communityId,
                    posts: msgs
                }];
            return { conversations, messages: msgs };
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'getChatMessages',
                    component: 'API',
                    pageId: pageId || undefined,
                    communityId: communityId || undefined
                }
            });
            return { conversations: [], messages: [] };
        }
    }
    async deleteMessage(messageId) {
        // COMP METHOD: Use exact same endpoint as COMP
        return this.request(`/v1/posts/${messageId}`, { method: 'DELETE' });
    }
    async editMessage(messageId, newContent) {
        // Use new Canopi 2 post system
        return this.request(`/v1/posts/${messageId}`, {
            method: 'PUT',
            body: JSON.stringify({ body: newContent })
        });
    }
    async getReactions(messageId) {
        return this.request(`/v1/reactions?messageId=${messageId}`);
    }
    async addReaction(messageId, reactionType) {
        return this.request('/v1/reactions', {
            method: 'POST',
            body: JSON.stringify({ messageId, reactionType })
        });
    }
    async removeReaction(messageId, reactionType) {
        return this.request('/v1/reactions', {
            method: 'DELETE',
            body: JSON.stringify({ messageId, reactionType })
        });
    }
    async getReactionsByMessage(messageId) {
        const params = new URLSearchParams({ messageId });
        return this.request(`/v1/reactions?${params.toString()}`);
    }
}
// Initialize API client (COMP METHOD)
const api = new MetaLayerAPI(API_CONFIG.baseUrl);
// COMP_API_FIX: Also handle XMLHttpRequest redirection for older code
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
    if (typeof url === 'string') {
        let modifiedUrl = url;
        if (url.includes('api.themetalayer.org')) {
            modifiedUrl = url.replace('https://api.themetalayer.org', API_CONFIG.baseUrl);
            Logger.debug(`🔍 COMP_API_FIX: XHR Redirecting api.themetalayer.org ${url} to ${modifiedUrl}`, null, 'api');
        }
        else if (url.startsWith('/v1/') || url.startsWith('/communities') || url.startsWith('/avatars')) {
            // Handle relative API URLs - redirect to VPS
            modifiedUrl = `${API_CONFIG.baseUrl}${url}`;
            Logger.debug(`🔍 COMP_API_FIX: XHR Redirecting relative URL ${url} to ${modifiedUrl}`, null, 'api');
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
Logger.debug('✅ APIModule: MetaLayerAPI initialized with global fetch override', null, 'api');
// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MetaLayerAPI, api };
}
//# sourceMappingURL=APIModule.js.map
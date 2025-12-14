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
// UUID validation helper - prevents Google IDs from being sent to /v1/users/:id endpoints
function isValidUUID(id) {
    if (!id || typeof id !== 'string') {
        return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}
// Validate and sanitize endpoint to prevent Google IDs in /v1/users/:id paths
function validateUserEndpoint(endpoint, method) {
    // Check if this is a /v1/users/:id endpoint (not /v1/users/:email or /v1/users/me)
    const userEndpointMatch = endpoint.match(/^\/v1\/users\/([^\/\?]+)/);
    if (userEndpointMatch) {
        const userId = userEndpointMatch[1];
        if (!userId) {
            return { isValid: false, error: 'User ID is missing from endpoint' };
        }
        // Skip validation for special endpoints
        if (userId === 'me' || userId === 'preferences' || userId === 'update-avatar' || userId === 'update-preferences') {
            return { isValid: true };
        }
        // Email endpoints are ONLY valid for POST method (create/update user by email)
        // GET /v1/users/:email returns 400 - backend only accepts UUIDs for GET
        if (userId.includes('@')) {
            if (method === 'POST') {
                return { isValid: true }; // POST /v1/users/:email is valid
            }
            else {
                return {
                    isValid: false,
                    error: `Invalid endpoint: ${endpoint}. Email endpoints are only valid for POST method. Use UUID for GET/PATCH/PUT/DELETE.`
                };
            }
        }
        // Validate UUID format for all other methods
        if (!isValidUUID(userId)) {
            return {
                isValid: false,
                error: `Invalid user ID format in endpoint: ${endpoint}. Expected UUID, got: ${userId}`
            };
        }
    }
    return { isValid: true };
}
// API client for Meta-Layer Initiative (COMP VERSION)
class MetaLayerAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    async request(endpoint, options = {}) {
        // ROOT CAUSE FIX: Validate endpoint to prevent Google IDs in /v1/users/:id paths
        const method = options.method || 'GET';
        // Extract endpoint from full URL if needed
        let cleanEndpoint = endpoint;
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            try {
                const url = new URL(endpoint);
                cleanEndpoint = url.pathname + url.search;
            }
            catch {
                // If URL parsing fails, try regex extraction
                const match = endpoint.match(/\/v1\/users\/[^\/\?]+/);
                if (match) {
                    cleanEndpoint = match[0];
                }
            }
        }
        const endpointValidation = validateUserEndpoint(cleanEndpoint, method);
        if (!endpointValidation.isValid) {
            Logger.error(`❌ API: ${endpointValidation.error}`, null, 'api');
            Logger.warn('⚠️ API: BLOCKING request with invalid user ID format. This prevents 400 Bad Request errors.', {
                originalEndpoint: endpoint,
                cleanEndpoint: cleanEndpoint,
                method: method
            }, 'api');
            // Return null to prevent the request
            return null;
        }
        // COMP_API_FIX: Handle comprehensive API endpoint redirection
        let finalUrl = `${this.baseURL}${endpoint}`;
        // Check if this is a full URL that needs redirection
        if (endpoint.startsWith('http')) {
            if (endpoint.includes('api.themetalayer.org')) {
                finalUrl = endpoint.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');
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
            finalUrl = `http://216.238.91.120:3002${endpoint}`;
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
                    // ROOT CAUSE FIX: Validate that user.id is a UUID before making API request
                    // Google IDs (like "116467399993975200419") are NOT UUIDs and will cause 400 Bad Request
                    if (!isValidUUID(user.id)) {
                        Logger.warn('⚠️ USER_IDENTITY: user.id is not a UUID, cannot fetch auraColor via /v1/users/:id endpoint', { userId: user.id, userEmail: user.email }, 'api');
                        Logger.debug('🔍 USER_IDENTITY: user.id appears to be a Google ID - UUID conversion may not have completed yet', null, 'api');
                        // Skip the API request - auraColor will be fetched later when UUID is available
                    }
                    else {
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
            // ROOT CAUSE FIX: Only set currentUser.id from responses that are FOR THE CURRENT USER
            // DO NOT set it from other users' data in reactions/messages!
            // UUID-ONLY: Only use UUID matching - no email fallback
            const currentUser = stateManagerInstance.getState('currentUser');
            if (data && typeof data === 'object' && currentUser) {
                const dataObj = data;
                const currentUserId = currentUser.id;
                // UUID-ONLY: Only process if we have a UUID to match against
                if (currentUserId && isValidUUID(currentUserId)) {
                    const userObj = dataObj.user;
                    let appUserId = null;
                    // UUID matching only - verify response is for current user by UUID
                    if (userObj && userObj.id === currentUserId) {
                        appUserId = userObj.id;
                        Logger.debug('✅ APIModule: UUID match confirmed for current user', { userId: appUserId }, 'api');
                    }
                    else if (dataObj.id === currentUserId) {
                        appUserId = dataObj.id;
                        Logger.debug('✅ APIModule: UUID match confirmed in direct response', { userId: appUserId }, 'api');
                    }
                    // CRITICAL: DO NOT use reaction.user_id or reaction.AppUser.id - those are OTHER users' IDs!
                    // DO NOT use data.id unless we've verified it matches currentUser.id (UUID)
                    if (appUserId && isValidUUID(appUserId)) {
                        Logger.debug('✅ APIModule: UUID match confirmed - response is for current user', { userId: appUserId }, 'api');
                    }
                    else {
                        Logger.debug('🔍 APIModule: Response does not match current user UUID - skipping', {
                            currentUserId,
                            responseUserId: userObj?.id || dataObj.id
                        }, 'api');
                    }
                }
                else if (!currentUserId) {
                    // UUID not set yet - skip processing (UUID must be set during auth before API calls)
                    Logger.debug('⚠️ APIModule: currentUser.id not set - UUID must be set during auth before processing API responses', null, 'api');
                }
                else if (currentUserId && !isValidUUID(currentUserId)) {
                    // Invalid ID format - skip processing
                    Logger.warn('⚠️ APIModule: currentUser.id is not a valid UUID, skipping response processing', {
                        currentUserId
                    }, 'api');
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
    async leaveCommunity(communityId) {
        try {
            Logger.debug(`🔍 API: Leaving community: ${communityId}`, null, 'api');
            const response = await this.request(`/v1/communities/${communityId}/leave`, {
                method: 'DELETE'
            });
            Logger.debug('🔍 API: Leave community response:', response, 'api');
            return response;
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'leaveCommunity',
                    component: 'API',
                    communityId
                }
            });
            return null;
        }
    }
    async getCommunities() {
        // Get current user to filter communities by membership - use AuthManager
        // NOTE: Backend uses MetaCommunity table via /communities endpoint
        const user = await authManagerInstance.getCurrentUser();
        // CRITICAL: Ensure userId is a UUID, not a Google ID
        let userId = user?.id;
        // Validate that userId is a UUID format
        if (userId) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                Logger.warn('⚠️ API: userId is not a UUID format, using email instead', { userId, email: user?.email }, 'api');
                // If not a UUID, use email instead (backend can handle email lookup)
                userId = user?.email || undefined;
            }
        }
        // Backend endpoint /communities uses MetaCommunity table
        // It returns communities from MetaCommunityMembership for the user
        const url = userId ? `/communities?userId=${encodeURIComponent(userId)}` : '/communities';
        // CRITICAL DEBUG: Log what we're sending
        Logger.debug(`🔍 API: getCommunities REQUEST`, {
            url,
            userId,
            userEmail: user?.email,
            isUUID: userId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) : false,
            fullUrl: `${this.baseURL}${url}`
        }, 'api');
        // CRITICAL: Do NOT silently return null on 500 errors - this masks real bugs
        try {
            const response = await this.request(url);
            const communitiesCount = Array.isArray(response)
                ? response.length
                : (response && typeof response === 'object' && 'communities' in response && Array.isArray(response.communities))
                    ? response.communities.length
                    : 0;
            Logger.debug(`✅ API: getCommunities response received`, {
                hasData: !!response?.data,
                hasCommunities: !!response?.communities,
                isArray: Array.isArray(response),
                responseType: typeof response,
                responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
                communitiesCount: communitiesCount
            }, 'api');
            return response;
        }
        catch (error) {
            // CRITICAL: Log 500 errors as ERRORS, not warnings - this is a backend bug
            const errorObj = error;
            if (errorObj.status === 500) {
                Logger.error('❌ API: 500 error from /communities endpoint - this is a BACKEND BUG!', {
                    userId,
                    url,
                    error: errorObj.message
                }, 'api');
                handleError(error, {
                    log: true,
                    logLevel: 'error', // Changed from 'warn' to 'error'
                    context: {
                        operation: 'getCommunities',
                        component: 'API',
                        userId,
                        severity: 'HIGH - User has communities but API returns 500'
                    }
                });
                // Still return null to allow frontend to handle, but log as error
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
        return this.request(`/v1/reactions/${messageId}`);
    }
}
// Initialize API client (COMP METHOD)
const api = new MetaLayerAPI('http://216.238.91.120:3002');
// COMP_API_FIX: Also handle XMLHttpRequest redirection for older code
// CRITICAL: This must be set up BEFORE any authentication code runs
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
    if (typeof url === 'string') {
        // ROOT CAUSE FIX: Validate /v1/users/:id endpoints in XHR requests too
        // Extract endpoint from full URL if needed
        let cleanUrl = url;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                const urlObj = new URL(url);
                cleanUrl = urlObj.pathname + urlObj.search;
            }
            catch {
                // If URL parsing fails, try regex extraction
                const match = url.match(/\/v1\/users\/[^\/\?]+/);
                if (match) {
                    cleanUrl = match[0];
                }
            }
        }
        const endpointValidation = validateUserEndpoint(cleanUrl, method);
        if (!endpointValidation.isValid) {
            Logger.error(`❌ XHR: ${endpointValidation.error}`, null, 'api');
            Logger.warn('⚠️ XHR: BLOCKING request with invalid user ID format. This prevents 400 Bad Request errors.', {
                originalUrl: url,
                cleanUrl: cleanUrl,
                method: method
            }, 'api');
            // Throw error to prevent the request
            throw new Error(endpointValidation.error || 'Invalid user ID format');
        }
        let modifiedUrl = url;
        // URL redirection logic (only if validation passed)
        if (url.includes('api.themetalayer.org')) {
            modifiedUrl = url.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');
            Logger.debug(`🔍 COMP_API_FIX: XHR Redirecting api.themetalayer.org ${url} to ${modifiedUrl}`, null, 'api');
        }
        else if (url.startsWith('/v1/') || url.startsWith('/communities') || url.startsWith('/avatars')) {
            // Handle relative API URLs - redirect to VPS
            modifiedUrl = `http://216.238.91.120:3002${url}`;
            Logger.debug(`🔍 COMP_API_FIX: XHR Redirecting relative URL ${url} to ${modifiedUrl}`, null, 'api');
        }
        // Use modifiedUrl for all cases (validation passed, so safe to proceed)
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
    // Handle URL object case (validation not needed for non-string URLs)
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
// ROOT CAUSE FIX: Intercept fetch() to validate /v1/users/:id endpoints
// CRITICAL: This must be set up BEFORE any authentication code runs
const originalFetch = window.fetch;
window.fetch = function (url, options) {
    // Extract endpoint from URL
    let endpoint = '';
    let fullUrl = '';
    if (typeof url === 'string') {
        fullUrl = url;
        // Remove base URL to get endpoint
        endpoint = url.replace(/^https?:\/\/[^\/]+/, '');
    }
    else if (url instanceof Request) {
        fullUrl = url.url;
        endpoint = url.url.replace(/^https?:\/\/[^\/]+/, '');
    }
    else if (url instanceof URL) {
        fullUrl = url.href;
        endpoint = url.pathname + url.search;
    }
    // Validate /v1/users/:id endpoints
    if (endpoint.startsWith('/v1/users/') || fullUrl.includes('/v1/users/')) {
        const method = options?.method || (url instanceof Request ? url.method : 'GET');
        // Extract clean endpoint if full URL was provided
        let cleanEndpoint = endpoint;
        if (!cleanEndpoint.startsWith('/v1/users/') && fullUrl.includes('/v1/users/')) {
            const match = fullUrl.match(/\/v1\/users\/[^\/\?]+/);
            if (match) {
                cleanEndpoint = match[0];
            }
        }
        const endpointValidation = validateUserEndpoint(cleanEndpoint, method);
        if (!endpointValidation.isValid) {
            Logger.error(`❌ FETCH: ${endpointValidation.error}`, null, 'api');
            Logger.warn('⚠️ FETCH: BLOCKING request with invalid user ID format. This prevents 400 Bad Request errors.', {
                fullUrl: fullUrl,
                endpoint: cleanEndpoint,
                method: method
            }, 'api');
            // Return rejected promise to prevent the request
            return Promise.reject(new Error(endpointValidation.error || 'Invalid user ID format'));
        }
    }
    // Call original fetch
    return originalFetch.apply(this, arguments);
};
// Export API instance for ES6 modules
export { api, MetaLayerAPI };
// COMP_API_FIX: Disabled global fetch override - using targeted approach instead
// The global fetch override was causing cascading failures
// Instead, we'll fix individual modules to use proper API calls
Logger.debug('✅ APIModule: MetaLayerAPI initialized with global fetch override', null, 'api');
// Export for browser environment only
// Module exports removed for browser compatibility
// CRITICAL: Expose api to window for legacy code (real-google-auth.js, etc.)
// ES6 pattern: api is exported via ES6 module exports only
// No window assignment - api should be imported where needed
// Violates no-backward-compatibility requirement - removed window.api assignment
Logger.debug('✅ APIModule: api available via ES6 imports only', null, 'api');

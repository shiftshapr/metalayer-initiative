/**
 * Timeline Query Builder
 * Handles API requests for timeline data
 */
export class TimelineQuery {
    constructor(baseUrl = '/api/timelines') {
        this.baseUrl = baseUrl;
    }
    /**
     * Build query parameters from options
     */
    buildQueryParams(options) {
        const params = new URLSearchParams();
        if (options.persistence) {
            const persistenceValue = Array.isArray(options.persistence)
                ? options.persistence.join(',')
                : options.persistence;
            params.set('persistence', persistenceValue);
        }
        if (options.communities && options.communities.length > 0) {
            params.set('communities', options.communities.join(','));
        }
        else if (options.community) {
            // Backward compatibility
            params.set('community', options.community);
        }
        if (options.search) {
            params.set('search', options.search);
        }
        if (options.activityTypes && options.activityTypes.length > 0) {
            params.set('type', options.activityTypes.join(','));
        }
        if (options.page) {
            params.set('page', options.page.toString());
        }
        if (options.limit) {
            params.set('limit', options.limit.toString());
        }
        return params.toString();
    }
    /**
     * Get authentication headers
     */
    getAuthHeaders() {
        const userId = this.getCurrentUserId();
        const email = this.getCurrentUserEmail();
        const name = this.getCurrentUserName();
        const avatar = this.getCurrentUserAvatar();
        const headers = {
            'Content-Type': 'application/json'
        };
        // Add user identification headers (matching APIModule.js pattern)
        if (email)
            headers['X-User-Email'] = email;
        if (userId)
            headers['X-User-Id'] = userId;
        if (name)
            headers['X-User-Name'] = name;
        if (avatar)
            headers['X-User-Avatar'] = avatar;
        // RED-LINE: Cannot use window.supabase - timeline scripts must not rely on window globals
        // Authorization header will be set by backend if user is authenticated via cookies/session
        // Timeline scripts are standalone and don't have access to Supabase client directly
        return headers;
    }
    /**
     * Get current user ID
     */
    getCurrentUserId() {
        // RED-LINE: Use imported AuthManager, NOT window.AuthManager
        if (typeof AuthManager !== 'undefined') {
            try {
                const authManager = new AuthManager();
                const user = authManager.getCurrentUser();
                if (user) {
                    return user.id || user.user_id || user.uuid || null;
                }
            }
            catch (error) {
                console.warn('TimelineQuery: AuthManager error', error);
            }
        }
        // Fallback to window.currentUser
        if (window.currentUser) {
            return window.currentUser.id || null;
        }
        // Last resort: localStorage (for development/testing)
        return localStorage.getItem('userId') || null;
    }
    /**
     * Get current user email
     */
    getCurrentUserEmail() {
        // Try AuthManager first
        // RED-LINE: Use imported AuthManager, NOT window.AuthManager
        if (typeof AuthManager !== 'undefined') {
            try {
                const authManager = new AuthManager();
                const user = authManager.getCurrentUser();
                if (user) {
                    return user.email || null;
                }
            }
            catch (error) {
                console.warn('TimelineQuery: AuthManager error', error);
            }
        }
        // Fallback to window.currentUser
        if (window.currentUser) {
            return window.currentUser.email || null;
        }
        // Last resort: localStorage
        return localStorage.getItem('userEmail') || null;
    }
    /**
     * Get current user name
     */
    getCurrentUserName() {
        // RED-LINE: Use imported AuthManager, NOT window.AuthManager
        if (typeof AuthManager !== 'undefined') {
            try {
                const authManager = new AuthManager();
                const user = authManager.getCurrentUser();
                if (user) {
                    return user.name || user.displayName || user.user_metadata?.full_name || null;
                }
            }
            catch (error) {
                // Ignore
            }
        }
        if (window.currentUser) {
            return window.currentUser.name || window.currentUser.displayName || null;
        }
        return null;
    }
    /**
     * Get current user avatar
     */
    getCurrentUserAvatar() {
        // RED-LINE: Use imported AuthManager, NOT window.AuthManager
        if (typeof AuthManager !== 'undefined') {
            try {
                const authManager = new AuthManager();
                const user = authManager.getCurrentUser();
                if (user) {
                    return user.avatarUrl || user.avatar_url || user.user_metadata?.avatar_url || user.picture || null;
                }
            }
            catch (error) {
                // Ignore
            }
        }
        if (window.currentUser) {
            return window.currentUser.avatarUrl || window.currentUser.avatar_url || null;
        }
        return null;
    }
    /**
     * Fetch timeline for a user
     */
    async getTimeline(identifier, options = {}) {
        const params = this.buildQueryParams(options);
        const url = `${this.baseUrl}/${identifier}${params ? '?' + params : ''}`;
        console.log('TimelineQuery: Fetching timeline from:', url);
        console.log('TimelineQuery: Options:', options);
        try {
            const headers = this.getAuthHeaders();
            console.log('TimelineQuery: Request headers:', headers);
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            console.log('TimelineQuery: Response status:', response.status, response.statusText);
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                console.error('TimelineQuery: Error response:', error);
                throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('TimelineQuery: Timeline data received:', {
                success: data.success,
                userId: data.userId,
                activitiesCount: data.timeline?.activities?.length || 0
            });
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch timeline');
            }
            return data;
        }
        catch (error) {
            console.error('TimelineQuery: Fetch error:', error);
            throw error;
        }
    }
    /**
     * Fetch multiple timelines (multi-profile view)
     */
    async getMultipleTimelines(userIds, options = {}) {
        const params = new URLSearchParams(this.buildQueryParams(options));
        params.set('profiles', userIds.join(','));
        const url = `${this.baseUrl}?${params}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch timelines');
            }
            return data;
        }
        catch (error) {
            console.error('Multiple timelines query error:', error);
            throw error;
        }
    }
    /**
     * Search for users by username or UUID
     */
    async searchUsers(query) {
        // TODO: Swap placeholder for the real search endpoint (likely `/api/users/search` or `/api/communities/members`)
        //       Ensure we debounce requests and handle 404/empty results gracefully.
        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : (data.users || []);
        }
        catch (error) {
            console.error('User search error:', error);
            return [];
        }
    }
}
//# sourceMappingURL=TimelineQuery.js.map
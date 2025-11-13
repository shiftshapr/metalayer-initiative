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
      params.set('persistence', options.persistence);
    }
    if (options.community) {
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
    // TODO: Pull auth headers from the unified auth layer:
    //       - `AuthManager.getAuthHeaders()` already formats X-User-Id / X-User-Email / Authorization
    //       - fall back to access token stored in chrome.storage if running inside extension
    const userId = this.getCurrentUserId();
    const email = this.getCurrentUserEmail();
    
    return {
      'X-User-Id': userId || '',
      'X-User-Email': email || '',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    // TODO: Replace localStorage stub with `AuthManager.getCurrentUser()?.id`
    return localStorage.getItem('userId') || null;
  }

  /**
   * Get current user email
   */
  getCurrentUserEmail() {
    // TODO: Replace localStorage stub with `AuthManager.getCurrentUser()?.email`
    return localStorage.getItem('userEmail') || null;
  }

  /**
   * Fetch timeline for a user
   */
  async getTimeline(identifier, options = {}) {
    const params = this.buildQueryParams(options);
    const url = `${this.baseUrl}/${identifier}?${params}`;
    
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
        throw new Error(data.message || 'Failed to fetch timeline');
      }

      return data;

    } catch (error) {
      console.error('Timeline query error:', error);
      throw error;
    }
  }

  /**
   * Fetch multiple timelines (multi-profile view)
   */
  async getMultipleTimelines(userIds, options = {}) {
    const params = this.buildQueryParams(options);
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

    } catch (error) {
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

      return await response.json();
    } catch (error) {
      console.error('User search error:', error);
      return [];
    }
  }
}


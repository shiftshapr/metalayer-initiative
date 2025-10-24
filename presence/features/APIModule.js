/**
 * APIModule.js - API Management Module
 * Extracted from sidepanel.js for modular architecture
 * 
 * Responsibilities:
 * - MetaLayerAPI class definition
 * - API client initialization
 * - API request handling
 * - Authentication integration
 */

// API client for Meta-Layer Initiative (COMP VERSION)
class MetaLayerAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // COMP METHOD: Get current user info to send in headers
    let user = null;
    try {
      console.log('🔍 USER_IDENTITY: === API USER IDENTITY TRACE ===');
      console.log('🔍 USER_IDENTITY: window.currentUser:', window.currentUser);
      console.log('🔍 USER_IDENTITY: window.currentUser?.email:', window.currentUser?.email);
      console.log('🔍 USER_IDENTITY: window.authManager:', typeof window.authManager);
      console.log('🔍 USER_IDENTITY: window.getCurrentUserEmail:', typeof window.getCurrentUserEmail);
      
      // First try to get from window.currentUser (set by authentication)
      if (window.currentUser && window.currentUser.email) {
        user = window.currentUser;
        console.log('🔍 USER_IDENTITY: ✅ Using window.currentUser for authentication:', user.email);
        console.log('🔍 USER_IDENTITY: ✅ User name:', user.name);
        console.log('🔍 USER_IDENTITY: ✅ User avatar:', user.avatarUrl);
      } else if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        user = await window.authManager.getCurrentUser();
        console.log('🔍 USER_IDENTITY: ✅ Using authManager for authentication:', user?.email);
      } else if (typeof window.getCurrentUserEmail === 'function') {
        const email = await window.getCurrentUserEmail();
        if (email) {
          user = { email: email };
          console.log('🔍 USER_IDENTITY: ✅ Using getCurrentUserEmail for authentication:', email);
        }
      } else {
        console.log('🔍 USER_IDENTITY: ❌ No user authentication available');
      }
      
      console.log('🔍 USER_IDENTITY: Final user object for API:', user);
      console.log('🔍 USER_IDENTITY: === END API USER IDENTITY TRACE ===');
    } catch (error) {
      console.log('🔍 USER_IDENTITY: ❌ Error getting user authentication:', error);
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(user && user.email && {
          'X-User-Email': user.email,
          'X-User-Name': user.name || user.user_metadata?.full_name,
          'X-User-Avatar': user.user_metadata?.avatar_url || user.picture
        }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getCommunities() {
    // Get current user to filter communities by membership - use AuthManager
    const user = await window.authManager.getCurrentUser();
    const userId = user?.email || user?.id;
    
    const url = userId ? `/communities?userId=${encodeURIComponent(userId)}` : '/communities';
    return this.request(url);
  }

  async getAvatars(communityId) {
    return this.request(`/avatars/active?communityId=${communityId}`);
  }

  async getPresenceByUrl(url, communityIds = null) {
    console.log('🔍 API: getPresenceByUrl called with URL:', url, 'communities:', communityIds);
    const params = new URLSearchParams({ url });
    if (communityIds && communityIds.length > 0) {
      params.append('communityIds', communityIds.join(','));
    }
    
    // COMP METHOD: Use the same user detection logic as the main request method
    let user = null;
    try {
      // First try to get from window.currentUser (set by authentication)
      if (window.currentUser && window.currentUser.email) {
        user = window.currentUser;
        console.log('🔍 API: Using window.currentUser for authentication:', user.email);
      } else if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        user = await window.authManager.getCurrentUser();
        console.log('🔍 API: Using authManager for authentication:', user?.email);
      } else if (typeof window.realGoogleAuth !== 'undefined' && window.realGoogleAuth.getCurrentUser) {
        user = await window.realGoogleAuth.getCurrentUser();
        console.log('🔍 API: Using realGoogleAuth for authentication:', user?.email);
      } else {
        console.log('🔍 API: No user authentication available');
      }
    } catch (error) {
      console.log('🔍 API: Error getting user authentication:', error);
    }
    
    const response = await this.request(`/v1/presence/url?${params.toString()}`, { user });
    console.log('🔍 API: getPresenceByUrl response:', JSON.stringify(response, null, 2));
    return response;
  }

  async getPresenceByCommunities(communityIds) {
    console.log('🔍 API: getPresenceByCommunities called with communities:', communityIds);
    const params = new URLSearchParams({ communityIds: communityIds.join(',') });
    
    // COMP METHOD: Use the same user detection logic as the main request method
    let user = null;
    try {
      // First try to get from window.currentUser (set by authentication)
      if (window.currentUser && window.currentUser.email) {
        user = window.currentUser;
        console.log('🔍 API: Using window.currentUser for authentication:', user.email);
      } else if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        user = await window.authManager.getCurrentUser();
        console.log('🔍 API: Using authManager for authentication:', user?.email);
      } else if (typeof window.realGoogleAuth !== 'undefined' && window.realGoogleAuth.getCurrentUser) {
        user = await window.realGoogleAuth.getCurrentUser();
        console.log('🔍 API: Using realGoogleAuth for authentication:', user?.email);
      } else {
        console.log('🔍 API: No user authentication available');
      }
    } catch (error) {
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

  async sendMessage(userEmail, communityId, content, uri = null, parentId = null, threadId = null, optionalContent = null) {
    // Simplified to use the working /chat/message endpoint with email-based identification
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        userEmail,
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
    const params = new URLSearchParams();
    if (communityId) params.append('communityId', communityId);
    if (threadId) params.append('threadId', threadId);
    if (uri) params.append('uri', uri);
    
    return this.request(`/chat/history?${params.toString()}`);
  }

  async deleteMessage(messageId) {
    return this.request(`/chat/message/${messageId}`, { method: 'DELETE' });
  }

  async editMessage(messageId, content) {
    return this.request(`/chat/message/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
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
const api = new MetaLayerAPI('https://api.themetalayer.org');

// Make API globally available for debugging (COMP METHOD)
window.api = api;

console.log('✅ APIModule: MetaLayerAPI initialized');

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MetaLayerAPI, api };
}

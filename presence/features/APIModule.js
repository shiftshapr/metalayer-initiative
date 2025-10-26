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
    // Use Supabase directly instead of backend API (COMP method)
    console.log(`CHAT_API: getChatHistory called with communityId=${communityId}, threadId=${threadId}, uri=${uri}`, null, 'general');
    console.log(`CHAT_API: uri type: ${typeof uri}, value: ${JSON.stringify(uri)}`, null, 'general');
    
    if (!communityId) {
      console.error('❌ CHAT_API: communityId is required');
      return { conversations: [], messages: [] };
    }
    
    // Use Supabase directly instead of backend API
    if (!window.supabase || !window.supabase.from) {
      console.error('❌ CHAT_API: No Supabase client available');
      return { conversations: [], messages: [] };
    }
    
    try {
      // Get pageId from URI if provided
      let pageId = null;
      if (uri) {
        // Use the same URL normalization logic as the backend
        const normalizedUrl = await window.normalizeUrl(uri);
        pageId = normalizedUrl.pageId;
      }
      
      console.log(`🔍 CHAT_API: Querying Supabase messages table for pageId: ${pageId}`);
      
      // Query Supabase messages table directly
      let query = window.supabase.from('messages').select('*');
      if (pageId) {
        query = query.eq('page_id', pageId);
      }
      if (communityId) {
        query = query.eq('community_id', communityId);
      }
      const { data: messages, error: messagesError } = await query.order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error('❌ CHAT_API: Supabase query failed:', messagesError);
        return { conversations: [], messages: [] };
      }
      
      console.log(`🔍 CHAT_API: Found ${messages?.length || 0} messages in Supabase`);
      
      // Convert Supabase messages to API format
      const msgs = messages?.map(msg => ({
        id: msg.id,
        body: msg.content, // Use content field, not body
        authorId: msg.user_email,
        conversationId: `conv-${communityId}-${pageId}`,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
        parentId: msg.parent_id || null, // Use actual parentId from database
        author: {
          id: msg.user_email,
          name: msg.user_email,
          handle: msg.user_email.split('@')[0],
          avatarUrl: null,
          email: msg.user_email,
          auraColor: window.currentUser?.auraColor || '#aa00aa'
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
    } catch (error) {
      console.error('❌ CHAT_API: Error in getChatHistory:', error);
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
const api = new MetaLayerAPI('https://api.themetalayer.org');

// Make API globally available for debugging (COMP METHOD)
window.api = api;

console.log('✅ APIModule: MetaLayerAPI initialized');

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MetaLayerAPI, api };
}

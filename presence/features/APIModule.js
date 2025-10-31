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
    // COMP_API_FIX: Handle comprehensive API endpoint redirection
    let finalUrl = `${this.baseURL}${endpoint}`;
    
    // Check if this is a full URL that needs redirection
    if (endpoint.startsWith('http')) {
      if (endpoint.includes('api.themetalayer.org')) {
        finalUrl = endpoint.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');
        console.log('✅ COMP_API_FIX: Redirected api.themetalayer.org call:', endpoint, '->', finalUrl);
      } else if (endpoint.includes('supabase.co')) {
        // Extract the actual endpoint path after /rest/v1/
        const pathMatch = endpoint.match(/\/rest\/v1\/(.+)/);
        if (pathMatch) {
          const actualEndpoint = pathMatch[1];
          finalUrl = `${this.baseURL}/${actualEndpoint}`;
          console.log('✅ COMP_API_FIX: Redirected Supabase API call:', endpoint, '->', finalUrl);
        }
      }
    } else if (endpoint.startsWith('/v1/') || endpoint.startsWith('/communities') || endpoint.startsWith('/avatars')) {
      // Handle relative API URLs - redirect to VPS
      finalUrl = `http://216.238.91.120:3002${endpoint}`;
      console.log('✅ COMP_API_FIX: Redirected relative API call:', endpoint, '->', finalUrl);
    }
    
    // COMP METHOD: Get current user info to send in headers
    let user = null;
    try {
      console.log('🔍 USER_IDENTITY: === API USER IDENTITY TRACE ===');
      console.log('🔍 USER_IDENTITY: window.currentUser:', window.currentUser);
      console.log('🔍 USER_IDENTITY: window.currentUser?.id:', window.currentUser?.id);
      console.log('🔍 USER_IDENTITY: window.authManager:', typeof window.authManager);
      console.log('🔍 USER_IDENTITY: window.getCurrentUserEmail:', typeof window.getCurrentUserEmail);
      
      // First try to get from window.currentUser (set by authentication)
      if (window.currentUser && (window.currentUser.id || window.currentUser.user_id)) {
        user = window.currentUser;
        console.log('🔍 USER_IDENTITY: ✅ Using window.currentUser for authentication:', user.id || user.user_id);
        console.log('🔍 USER_IDENTITY: ✅ User name:', user.name);
        console.log('🔍 USER_IDENTITY: ✅ User avatar:', user.avatarUrl);
      } else if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        user = await window.authManager.getCurrentUser();
        console.log('🔍 USER_IDENTITY: ✅ Using authManager for authentication:', user?.id || user?.user_id);
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
    
    // Derive identifiers early for consistent headers
    const derivedUserId = user?.id || user?.user_id || window.currentUser?.id || window.currentUser?.user_id || null;
    const derivedEmail = user?.email || window.currentUser?.email || null;
    const derivedName = user?.name || user?.user_metadata?.full_name || window.currentUser?.name || window.currentUser?.user_metadata?.full_name || undefined;
    const derivedAvatar = user?.user_metadata?.avatar_url || user?.picture || window.currentUser?.user_metadata?.avatar_url || window.currentUser?.avatarUrl || undefined;

    // window.currentUser.id is always a UUID (from AppUser table) - no format validation needed
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(derivedEmail && { 'X-User-Email': derivedEmail }),
        // window.currentUser.id is always a UUID from AppUser table
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
      if (!response.ok) {
        // Include response body in error for debugging 400/401/500
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            try {
              const parsed = JSON.parse(errorBody);
              errorDetails += ` - ${JSON.stringify(parsed)}`;
            } catch {
              errorDetails += ` - ${errorBody.substring(0, 200)}`;
            }
          }
        } catch (e) {
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
      
      // ROOT CAUSE FIX: Only set window.currentUser.id from responses that are FOR THE CURRENT USER
      // DO NOT set it from other users' data in reactions/messages!
      // Only trust user.id from /v1/users/:email or user objects that match current email
      if (data && window.currentUser && !window.currentUser.id) {
        const currentUserEmail = window.currentUser.email?.toLowerCase().trim();
        
        // Only set UUID if:
        // 1. Response has a user object with matching email, OR
        // 2. Response is from /v1/users/:email endpoint (which returns user data for current user)
        let appUserId = null;
        if (data.user && data.user.email && data.user.email.toLowerCase().trim() === currentUserEmail) {
          // This is a user object for the current user
          appUserId = data.user.id;
        } else if (data.email && data.email.toLowerCase().trim() === currentUserEmail) {
          // Direct user response (from /v1/users/:email)
          appUserId = data.id;
        }
        
        // CRITICAL: DO NOT use reaction.user_id or reaction.AppUser.id - those are OTHER users' IDs!
        // DO NOT use data.id unless we've verified it's for the current user
        
        if (appUserId) {
          console.log('✅ ROOT CAUSE FIX: Backend returned AppUser UUID for current user:', appUserId);
          console.log('✅ Storing AppUser UUID in window.currentUser.id');
          window.currentUser.id = appUserId;
          window.currentUser.user_id = appUserId;
        } else {
          console.log('🔍 APIModule: Skipping UUID assignment - response not for current user or no email match');
        }
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getCommunities() {
    // Get current user to filter communities by membership - use AuthManager
    const user = await window.authManager.getCurrentUser();
    const userId = user?.id || user?.user_id;
    
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
      if (window.currentUser && (window.currentUser.id || window.currentUser.user_id)) {
        user = window.currentUser;
        console.log('🔍 API: Using window.currentUser for authentication:', user.id || user.user_id);
      } else if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        user = await window.authManager.getCurrentUser();
        console.log('🔍 API: Using authManager for authentication:', user?.id || user?.user_id);
      } else if (typeof window.realGoogleAuth !== 'undefined' && window.realGoogleAuth.getCurrentUser) {
        user = await window.realGoogleAuth.getCurrentUser();
        console.log('🔍 API: Using realGoogleAuth for authentication:', user?.id || user?.user_id);
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
      if (window.currentUser && (window.currentUser.id || window.currentUser.user_id)) {
        user = window.currentUser;
        console.log('🔍 API: Using window.currentUser for authentication:', user.id || user.user_id);
      } else if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
        user = await window.authManager.getCurrentUser();
        console.log('🔍 API: Using authManager for authentication:', user?.id || user?.user_id);
      } else if (typeof window.realGoogleAuth !== 'undefined' && window.realGoogleAuth.getCurrentUser) {
        user = await window.realGoogleAuth.getCurrentUser();
        console.log('🔍 API: Using realGoogleAuth for authentication:', user?.id || user?.user_id);
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
        authorId: msg.user_id || msg.AppUser?.id,
        conversationId: `conv-${communityId}-${pageId}`,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
        parentId: msg.parent_id || null, // Use actual parentId from database
        author: {
          id: msg.AppUser?.id || msg.user_id,
          name: msg.AppUser?.name || 'Unknown',
          handle: msg.AppUser?.handle || 'unknown',
          avatarUrl: msg.AppUser?.avatarUrl || null,
          auraColor: window.currentUser?.auraColor || window.AVATAR_FALLBACK_COLOR
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
const api = new MetaLayerAPI('http://216.238.91.120:3002');

// COMP_API_FIX: Also handle XMLHttpRequest redirection for older code
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  if (typeof url === 'string') {
    let modifiedUrl = url;
    
    if (url.includes('api.themetalayer.org')) {
      modifiedUrl = url.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');
      console.log(`🔍 COMP_API_FIX: XHR Redirecting api.themetalayer.org ${url} to ${modifiedUrl}`);
    } else if (url.startsWith('/v1/') || url.startsWith('/communities') || url.startsWith('/avatars')) {
      // Handle relative API URLs - redirect to VPS
      modifiedUrl = `http://216.238.91.120:3002${url}`;
      console.log(`🔍 COMP_API_FIX: XHR Redirecting relative URL ${url} to ${modifiedUrl}`);
    }
    
    return originalXHROpen.call(this, method, modifiedUrl, ...args);
  }
  return originalXHROpen.call(this, method, url, ...args);
};

// Make API globally available for debugging (COMP METHOD)
window.api = api;

// COMP_API_FIX: Disabled global fetch override - using targeted approach instead
// The global fetch override was causing cascading failures
// Instead, we'll fix individual modules to use proper API calls

console.log('✅ APIModule: MetaLayerAPI initialized with global fetch override');

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MetaLayerAPI, api };
}

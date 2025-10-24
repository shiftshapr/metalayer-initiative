// Avatar Background Color Configuration - REMOVED
// Background color is always the aura color from window.currentUser.auraColor
// No separate background color system needed!
  
  // API client for Meta-Layer Initiative
  class MetaLayerAPI {
    constructor(baseURL) {
      this.baseURL = baseURL;
    }
  
    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      
      // Get current user info to send in headers - use AuthManager
      const user = await authManager.getCurrentUser();
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(user && {
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
      const user = await authManager.getCurrentUser();
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
      
      // Get current user for authentication
      let user = await authManager.getCurrentUser();
      if (!user && typeof window.realGoogleAuth !== 'undefined' && window.realGoogleAuth.getCurrentUser) {
        user = await window.realGoogleAuth.getCurrentUser();
        console.log('🔍 API: Using realGoogleAuth user for authentication:', user?.email);
      } else {
        console.log('🔍 API: Using user for authentication:', user?.email);
      }
      
      const response = await this.request(`/v1/presence/url?${params.toString()}`, { user });
      console.log('🔍 API: getPresenceByUrl response:', JSON.stringify(response, null, 2));
      return response;
    }
  
    async getPresenceByCommunities(communityIds) {
      console.log('🔍 API: getPresenceByCommunities called with communities:', communityIds);
      const params = new URLSearchParams({ communityIds: communityIds.join(',') });
      
      // Get current user for authentication
      let user = await authManager.getCurrentUser();
      if (!user && typeof window.realGoogleAuth !== 'undefined' && window.realGoogleAuth.getCurrentUser) {
        user = await window.realGoogleAuth.getCurrentUser();
        console.log('🔍 API: Using realGoogleAuth user for authentication:', user?.email);
      } else {
        console.log('🔍 API: Using user for authentication:', user?.email);
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
          userEmail: userEmail,
          communityId: communityId,
          content: content,
          uri: uri,
          parentId: parentId
        })
      });
    }
  
    async getChatHistory(communityId, threadId = null, uri = null) {
      // Use Supabase directly instead of backend API
      Logger.debug(`CHAT_API: getChatHistory called with communityId=${communityId}, threadId=${threadId}, uri=${uri}`, null, 'general');
      Logger.debug(`CHAT_API: uri type: ${typeof uri}, value: ${JSON.stringify(uri)}`, null, 'general');
      
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
        const conversationsMap = new Map();
        
        for (const msg of msgs) {
          const convId = msg.conversationId;
          if (!conversationsMap.has(convId)) {
            conversationsMap.set(convId, {
              id: convId,
              communityId: msg.conversation.communityId,
              posts: []
            });
          }
          
          // Transform message to post format
          const post = {
            id: msg.id,
            parentId: null, // Supabase messages don't have parentId
            conversationId: msg.conversationId,
            authorId: msg.authorId,
            body: msg.body,
            createdAt: msg.createdAt,
            editedAt: msg.updatedAt,
            author: msg.author,
            conversation: msg.conversation
          };
          
          conversationsMap.get(convId).posts.push(post);
        }
        
        const conversations = Array.from(conversationsMap.values());
        console.log(`✅ CHAT_API: Returning ${conversations.length} conversations with ${msgs.length} total messages`);
        
        return { 
          conversations,
          timestamp: new Date().toISOString(),
          cacheBust: Date.now()
        };
        
      } catch (error) {
        console.error('❌ CHAT_API: Error fetching messages from Supabase:', error);
        return { conversations: [], messages: [] };
      }
    }
  
    async getThreads(communityId) {
      return this.request(`/chat/threads?communityId=${communityId}`);
    }
  
    async editMessage(messageId, newContent) {
      // Use new Canopi 2 post system
      return this.request(`/v1/posts/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ body: newContent })
      });
    }
  
    async deleteMessage(messageId) {
      // Use new Canopi 2 post system
      return this.request(`/v1/posts/${messageId}`, {
        method: 'DELETE'
      });
    }
  
    async toggleReaction(kind, postId = null, conversationId = null, emoji = null) {
      // Use new Canopi 2 reaction system
      return this.request('/v1/reactions', {
        method: 'POST',
        body: JSON.stringify({ 
          kind, 
          postId, 
          conversationId,
          emoji 
        })
      });
    }
  
    async getReactions(postId = null, conversationId = null) {
      // Use new Canopi 2 reaction system
      const params = new URLSearchParams();
      if (postId) {
        params.append('targetId', postId);
        params.append('targetType', 'post');
      } else if (conversationId) {
        params.append('targetId', conversationId);
        params.append('targetType', 'conversation');
      }
      
      return this.request(`/v1/reactions?${params.toString()}`);
    }
  }
  
  // Initialize API client
  const api = new MetaLayerAPI('https://api.themetalayer.org');
  
  // Make API globally available for debugging
  window.api = api;
  
  // Initialize Loosely Coupled Auth Manager
  // const authManager = new AuthManager(); // DISABLED - using features/AuthManager.js instead 
  
  // === DEBUGGING: Check API connection ===
  console.log('Meta-Layer Initiative API initialized');
  console.log('API URL:', 'https://api.themetalayer.org');
  // === END DEBUGGING ===
  
  
  
  
  
  
  
  
  
  
  
  
  
  /**
   * TRULY UNIFIED avatar display function - SAME implementation for ALL contexts
   * This function creates identical visual appearance regardless of context
   * @param {Object} user - User object with name, avatarUrl, auraColor, etc.
   * @param {Object} options - Rendering options
   * @param {number} options.size - Avatar size in pixels (default: 32)
   * @param {boolean} options.showStatus - Show status dot (default: true)
   * @param {boolean} options.showAura - Show aura border (default: true)
   * @param {string} options.context - Context: 'profile', 'message', 'visibility'
   * @returns {string} HTML string for the avatar
   */
  // AvatarUtils is defined in utils/AvatarUtils.js and loaded globally
  
  
  
  
  // REMOVED - No separate background color function needed
  // The aura color IS the background color - use aura color directly
  // async function setUserAvatarBgColor(color) {
  //   // MODERN SECURITY: Validate and sanitize input
  //   if (window.securityManager) {
  //     if (!window.securityManager.validateHexColor(color)) {
  //       window.logger?.error('SECURITY', 'Invalid hex color format', { color });
  //       console.error(`Invalid color format: ${color}. Must be a valid hex color (e.g., #FF6B6B)`);
  //       return false;
  //     }
  //     
  //     // Sanitize the color input
  //     color = window.securityManager.sanitizeInput(color);
  //   } else {
  //     // Fallback validation
  //     const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  //     if (!hexColorRegex.test(color)) {
  //       console.error(`Invalid color format: ${color}. Must be a valid hex color (e.g., #FF6B6B)`);
  //       return false;
  //     }
  //   }
    
    // MODERN LOGGING
    // window.logger?.info('AURA', 'Setting user avatar background color', { color });
    
    // AVATAR_BG_CONFIG.setBgColor(color);
    
    // Apply the aura color as BOTH border AND background - they should ALWAYS be the same
    // const userAvatar = document.getElementById('user-avatar');
    // if (userAvatar) {
    //   userAvatar.style.borderColor = color;
    //   userAvatar.style.borderWidth = '2px';
    //   userAvatar.style.borderStyle = 'solid';
    //   // The aura color IS the background color - they are the same thing
    //   userAvatar.style.backgroundColor = color;
    // }
    
    // Save to chrome storage for persistence
    // chrome.storage.local.set({ userAvatarBgColor: color });
    
    // Save to database
    // try {
    //   const result = await chrome.storage.local.get(['googleUser']);
    //   if (result.googleUser && result.googleUser.email) {
    //     // Use email-based approach - get the database user ID first
    //     console.log('🔍 Saving aura color for user:', { email: result.googleUser.email });
    //     
    //     // First, get the database user ID by email
    //     const userEmail = result.googleUser.email;
    //     const userLookupUrl = `${METALAYER_API_URL}/v1/users/me`;
    //     Logger.debug(`AURA_COLOR_SAVE: [BUILD ${EXTENSION_BUILD}] Looking up user by email: ${userEmail}`, null, 'general');
    //     Logger.debug(`AURA_COLOR_SAVE: [BUILD ${EXTENSION_BUILD}] API URL: ${userLookupUrl}`, null, 'general');
    //     
    //     const userResponse = await fetch(userLookupUrl, {
    //       headers: {
    //         'x-user-email': userEmail
    //       }
    //     });
  
  
  
  
  
  
  // Global functions for custom avatar color configuration (accessible from browser console)
  window.setCustomAvatarColor = setCustomAvatarColor;
  window.resetCustomAvatarColor = resetCustomAvatarColor;
  window.getCurrentUserAvatarColor = getCurrentUserAvatarColor;
  
  // Global function for debugging visual hierarchy (accessible from browser console)
  window.updateVisualHierarchy = updateMessageVisualHierarchy;
  window.debugHierarchy = () => {
    console.log('🔧 DEBUG: Manually triggering visual hierarchy update');
    updateMessageVisualHierarchy();
  };
  
  window.forceRefreshCSS = () => {
    console.log('🔧 DEBUG: Force refreshing CSS');
    const link = document.querySelector('link[href*="sidepanel.css"]');
    if (link) {
      const href = link.href;
      link.href = href + '?v=' + Date.now();
    }
  };
  
      // Function to update visual hierarchy of messages - TOP-line approach with vertical lines
      function updateMessageVisualHierarchy() {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const allMessages = chatMessages.querySelectorAll('.message');
        const conversationGroups = {};
        
        // console.log('🔍 DEBUG: Updating message visual hierarchy, found', allMessages.length, 'messages');
        
        // Group messages by conversation
        allMessages.forEach(message => {
          const conversationId = message.dataset.conversationId;
          if (!conversationGroups[conversationId]) {
            conversationGroups[conversationId] = [];
          }
          conversationGroups[conversationId].push(message);
        });
        
        // Update visual hierarchy for each conversation
        Object.values(conversationGroups).forEach(messages => {
          const threadStarter = messages.find(msg => !msg.classList.contains('message-reply'));
          const replies = messages.filter(msg => msg.classList.contains('message-reply') && msg.classList.contains('visible'));
          
          if (threadStarter && replies.length > 0) {
            // Add has-replies class to thread starter for vertical line
            threadStarter.classList.add('has-replies');
            // console.log('🔍 LINE DEBUG: Thread starter', threadStarter.dataset.messageId, 'gets vertical line (has-replies class)');
            
            // Calculate vertical line height
            setTimeout(() => {
              updateVerticalLineHeight(threadStarter, replies);
            }, 10);
          } else if (threadStarter) {
            threadStarter.classList.remove('has-replies');
            // console.log('🔍 LINE DEBUG: Thread starter without replies', threadStarter.dataset.messageId, 'gets no vertical line');
          }
          
          // Remove any old inline styles that might interfere
          allMessages.forEach(msg => {
            msg.style.borderBottom = '';
            msg.style.setProperty('--short-line-width', '');
            msg.style.setProperty('--reply-line-width', '');
          });
        });
      }
  
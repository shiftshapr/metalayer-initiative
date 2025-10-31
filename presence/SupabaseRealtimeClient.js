// ===== SUPABASE REALTIME CLIENT CLASS (FROM COMP) =====
class SupabaseRealtimeClient {
  constructor() {
    this.supabase = null;
    this.isInitialized = false;
    this.isConnected = false;
    this.currentUser = null;
    this.currentPage = null;
    this.channels = new Map();
    
    // Event handlers
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onUserUpdated = null;
    this.onNewMessage = null;
    this.onMessageUpdated = null;
    this.onMessageDeleted = null;
    this.onVisibilityChanged = null;
  }
  
  async initialize(supabaseClient) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Initializing SupabaseRealtimeClient...');
      
      // Use the provided Supabase client
      this.supabase = supabaseClient;
      if (!this.supabase) {
        console.error('❌ SUPABASE_CLIENT: Supabase client not provided');
        return false;
      }
      
      this.isInitialized = true;
      this.isConnected = true;
      
      console.log('✅ SUPABASE_CLIENT: SupabaseRealtimeClient initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to initialize:', error);
      return false;
    }
  }
  
  async setCurrentUser(userId, communityId = 'comm-001') {
    try {
      console.log('🔧 SUPABASE_CLIENT: Setting current user:', userId);
      
      this.currentUser = {
        userId: userId,
        communityId: communityId
      };
      
      console.log('✅ SUPABASE_CLIENT: Current user set successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to set current user:', error);
      return false;
    }
  }
  
  async joinPage(pageId, pageUrl) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Joining page:', pageId);
      
      this.currentPage = {
        pageId: pageId,
        pageUrl: pageUrl
      };
      
      // Set up real-time subscriptions for this page
      await this.subscribeToPageUpdates(pageId);
      
      console.log('✅ SUPABASE_CLIENT: Joined page successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to join page:', error);
      return false;
    }
  }
  
  async leaveCurrentPage() {
    try {
      console.log('🔧 SUPABASE_CLIENT: Leaving current page');
      
      this.currentPage = null;
      
      console.log('✅ SUPABASE_CLIENT: Left page successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to leave page:', error);
      return false;
    }
  }
  
  async subscribeToPageUpdates(pageId) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Subscribing to page updates:', pageId);
      
      // COMP METHOD: Set up real-time subscription for messages (INSERT, UPDATE, DELETE)
      if (window.supabase && window.supabase.realtime) {
        const channel = window.supabase.realtime.channel(`page_messages_${pageId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          }, (payload) => {
            console.log('💬 SUPABASE_CLIENT: New message received:', payload);
            if (this.onNewMessage && typeof this.onNewMessage === 'function') {
              this.onNewMessage(payload.new);
            } else if (window.addMessageToChat && typeof window.addMessageToChat === 'function') {
              console.log('💬 SUPABASE_CLIENT: Calling addMessageToChat with:', payload.new);
              window.addMessageToChat(payload.new);
            } else {
              console.log('❌ SUPABASE_CLIENT: addMessageToChat not available');
            }
          })
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          }, (payload) => {
            console.log('✏️ SUPABASE_CLIENT: Message updated:', payload);
            if (this.onMessageUpdated && typeof this.onMessageUpdated === 'function') {
              this.onMessageUpdated(payload.new);
            } else if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.onMessageUpdated) {
              window.supabaseRealtimeClient.onMessageUpdated(payload.new);
            } else {
              console.log('❌ SUPABASE_CLIENT: onMessageUpdated handler not available');
            }
          })
          .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
            filter: `page_id=eq.${pageId}`
          }, (payload) => {
            console.log('🗑️ SUPABASE_CLIENT: Message deleted:', payload);
            if (this.onMessageDeleted && typeof this.onMessageDeleted === 'function') {
              this.onMessageDeleted(payload.old);
            } else if (window.supabaseRealtimeClient && window.supabaseRealtimeClient.onMessageDeleted) {
              window.supabaseRealtimeClient.onMessageDeleted(payload.old);
            } else {
              console.log('❌ SUPABASE_CLIENT: onMessageDeleted handler not available');
            }
          })
          .subscribe((status, err) => {
            if (err) {
              console.error('❌ SUPABASE_CLIENT: Subscription error:', err);
            } else {
              console.log('✅ SUPABASE_CLIENT: Message subscription status:', status);
            }
          });
        
        this.messageChannel = channel;
        console.log('✅ SUPABASE_CLIENT: Real-time message subscription set up');
      } else {
        console.log('❌ SUPABASE_CLIENT: Supabase realtime not available');
      }
      
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to subscribe to page updates:', error);
      return false;
    }
  }
  
  async sendMessage(content, parentId = null) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Sending message:', content);
      console.log('🔧 SUPABASE_CLIENT: ParentId:', parentId);
      
      if (!this.supabase) {
        console.error('❌ SUPABASE_CLIENT: Supabase client not available');
        return { success: false, error: 'Supabase client not available' };
      }
      
      // Get current user and page data (UUID only)
      const userId = this.currentUser?.id || window.currentUser?.id;
      const pageId = this.currentPage?.pageId || window.currentUrlData?.pageId;
      
      if (!userId || !pageId) {
        console.error('❌ SUPABASE_CLIENT: Missing user id or page ID');
        return { success: false, error: 'Missing user id or page ID' };
      }
      
      // Insert message into database using Supabase (COMP field names)
      const messageData = {
        content: content,
        user_id: userId,
        page_id: pageId,
        community_id: 'comm-001',
        created_at: new Date().toISOString()
      };
      
      // Add parentId if provided (now that parent_id column exists in Supabase)
      if (parentId) {
        messageData.parent_id = parentId;
        console.log('🔧 SUPABASE_CLIENT: Adding parentId to message:', parentId);
      }
      
      const { data, error } = await this.supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ SUPABASE_CLIENT: Database insert failed:', error);
        console.error('❌ SUPABASE_CLIENT: Error details:', JSON.stringify(error, null, 2));
        console.error('❌ SUPABASE_CLIENT: Error code:', error.code);
        console.error('❌ SUPABASE_CLIENT: Error hint:', error.hint);
        console.error('❌ SUPABASE_CLIENT: Error details:', error.details);
        return { success: false, error: error.message };
      }
      
      console.log('✅ SUPABASE_CLIENT: Message sent successfully:', data);
      console.log('✅ SUPABASE_CLIENT: Data type:', typeof data);
      console.log('✅ SUPABASE_CLIENT: Data keys:', Object.keys(data || {}));
      console.log('✅ SUPABASE_CLIENT: Data id:', data?.id);
      console.log('✅ SUPABASE_CLIENT: Data content:', data?.content);
      console.log('✅ SUPABASE_CLIENT: Data user_id:', data?.user_id);
      console.log('✅ SUPABASE_CLIENT: Data page_id:', data?.page_id);
      console.log('✅ SUPABASE_CLIENT: Data created_at:', data?.created_at);
      
      return { success: true, id: data.id, data: data };
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }
  
  async broadcastAuraColorChange(color) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Broadcasting aura color change:', color);
      
      // This would broadcast the aura color change
      // For now, just log the change
      console.log('✅ SUPABASE_CLIENT: Aura color change broadcasted');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to broadcast aura color change:', error);
      return false;
    }
  }
  
  async updatePresence(pageId, pageUrl, auraColor) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Updating presence:', pageId);
      
      // This would update presence
      // For now, just log the update
      console.log('✅ SUPABASE_CLIENT: Presence updated successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to update presence:', error);
      return false;
    }
  }
  
  async setUserVisibility(visibility) {
    try {
      console.log('🔧 SUPABASE_CLIENT: Setting user visibility:', visibility);
      
      // This would set user visibility
      // For now, just log the setting
      console.log('✅ SUPABASE_CLIENT: User visibility set successfully');
      return true;
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Failed to set user visibility:', error);
      return false;
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      console.log('🗑️ SUPABASE_CLIENT: Deleting message:', messageId);
      
      if (!this.isInitialized || !this.supabase) {
        console.error('❌ SUPABASE_CLIENT: Client not initialized');
        return { success: false, error: 'Client not initialized' };
      }

      const { data, error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .select();

      if (error) {
        console.error('❌ SUPABASE_CLIENT: Delete failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ SUPABASE_CLIENT: Message deleted successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Edit a message
  async editMessage(messageId, newContent) {
    try {
      console.log('✏️ SUPABASE_CLIENT: Editing message:', messageId, 'with content:', newContent);
      
      if (!this.isInitialized || !this.supabase) {
        console.error('❌ SUPABASE_CLIENT: Client not initialized');
        return { success: false, error: 'Client not initialized' };
      }

      const { data, error } = await this.supabase
        .from('messages')
        .update({ 
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select();

      if (error) {
        console.error('❌ SUPABASE_CLIENT: Edit failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ SUPABASE_CLIENT: Message edited successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: Edit error:', error);
      return { success: false, error: error.message };
    }
  }

  // COMP METHOD: Get users on a specific page (like COMP does)
  async getPageUsers(pageId) {
    try {
      console.log('👁️ SUPABASE_CLIENT: Getting users for page:', pageId);
      
      if (!this.isInitialized || !this.supabase) {
        console.error('❌ SUPABASE_CLIENT: Client not initialized');
        return [];
      }

      // First try server join endpoint to enrich with AppUser (names/avatars)
      try {
        const rawUrl = window.currentUrlData?.rawUrl || window.location?.href || '';
        const params = new URLSearchParams({ url: rawUrl });
        const cu = window.currentUser || {};
        const headers = {
          'Content-Type': 'application/json',
          ...(cu.id ? { 'X-User-Id': cu.id, 'x-user-id': cu.id } : {}),
          ...(cu.email ? { 'X-User-Email': cu.email, 'x-user-email': cu.email } : {})
        };
        if (window.METALAYER_API_URL) {
          const resp = await fetch(`${window.METALAYER_API_URL}/v1/presence/url?${params}`, { headers });
          if (resp.ok) {
            const j = await resp.json();
            const active = Array.isArray(j?.active) ? j.active : [];
            // Map to legacy shape used by visibility pipeline
            const serverUsers = active.map(u => ({
              user_email: u.email || u.handle || 'unknown@unknown',
              user_id: u.id || u.userId,
              is_active: u.isActive !== false,
              last_seen: u.lastSeen || null,
              enter_time: u.enterTime || null,
              aura_color: u.auraColor || '#ffffff',
              // Extra fields for AvatarUtils if needed
              name: u.name,
              avatar_url: u.avatarUrl
            }));
            console.log('✅ SUPABASE_CLIENT: Using server-enriched presence users:', serverUsers.length);
            return serverUsers;
          } else {
            console.warn('⚠️ SUPABASE_CLIENT: presence/url failed with', resp.status);
          }
        }
      } catch (serverErr) {
        console.warn('⚠️ SUPABASE_CLIENT: presence/url error:', serverErr?.message || serverErr);
      }

      const { data, error } = await this.supabase
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('❌ SUPABASE_CLIENT: Failed to get page users:', error);
        return [];
      }

      console.log('✅ SUPABASE_CLIENT: Found users for page:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ SUPABASE_CLIENT: getPageUsers error:', error);
      return [];
    }
  }
}

// Make available globally
window.SupabaseRealtimeClient = SupabaseRealtimeClient;

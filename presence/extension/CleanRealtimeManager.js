/**
 * Clean Real-time Manager - Best Practice Implementation
 * ROOT CAUSE FIX: Uses Postgres Changes instead of problematic presence channels
 */

class CleanRealtimeManager {
  constructor() {
    this.logLevel = 'ERROR'; // Reduce logging spam
    this.isInitialized = false;
    this.isConnected = false;
    this.isConnecting = false;
    this.currentPageId = null;
    this.user = null;
    this.supabase = null;
    this.channels = new Map();
    this._processedMessages = new Set();
  }

  log(level, message, data = null) {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4 };
    if (levels[level] >= levels[this.logLevel]) {
      console.log(`[CleanRealtimeManager] [${level}] ${message}`, data || '');
    }
  }

  setLogLevel(level) {
    this.logLevel = level;
  }

  async initialize(supabaseClient) {
    try {
      this.supabase = supabaseClient;
      this.isInitialized = true;
      
      // FIX: Initialize user_presence subscription for real-time visibility updates
      this._setupUserPresenceSubscription();
      
      // HYBRID: Initialize global availability subscription for real-time status sync
      this._setupGlobalAvailabilitySubscription();
      
      this.log('INFO', 'CleanRealtimeManager initialized');
      return true;
    } catch (error) {
      this.log('ERROR', 'Initialization failed:', error);
      return false;
    }
  }

  setUser(userEmail, userId = null, communityId = 'comm-001') {
    if (!userEmail) {
      this.log('ERROR', 'User email is required');
      return false;
    }
    
    this.user = {
      email: userEmail,
      id: userId || userEmail,
      communityId: communityId
    };
    
    this.log('INFO', `User set: ${userEmail}`);
    return true;
  }

  async joinPage(pageUrl) {
    if (!this.isInitialized) {
      this.log('ERROR', 'Manager not initialized. Call initialize() first.');
      return false;
    }
    
    if (!this.user) {
      this.log('ERROR', 'No user set. Call setUser() first.');
      return false;
    }
    
    if (this.isConnecting) {
      this.log('DEBUG', 'Already connecting to page, skipping duplicate request');
      return false;
    }
    
    this.isConnecting = true;
    
    try {
      this.log('INFO', `Joining page: ${pageUrl}`);
      
      // Generate pageId using the same method as the rest of the system
      let pageId;
      if (typeof window !== 'undefined' && window.normalizeUrl) {
        const urlData = await window.normalizeUrl(pageUrl);
        pageId = urlData.pageId;
        this.log('DEBUG', `Using normalized pageId: ${pageId}`);
      } else {
        pageId = btoa(pageUrl).replace(/=/g, '');
        this.log('DEBUG', `Using base64 pageId: ${pageId}`);
      }
      
      // Check if already connected to this page
      if (this.isConnected && this.currentPageId === pageId) {
        this.log('DEBUG', 'Already connected to this page, skipping duplicate request');
        this.isConnecting = false;
        return true;
      }
      
      // ROOT CAUSE FIX: Use ONLY Postgres Changes - no presence channels
      await this._setupPostgresChanges(pageId);
      
      // FIX: Ensure user_presence subscription is active (set up during initialize)
      if (!this.userPresenceChannel) {
        this._setupUserPresenceSubscription();
      }
      
      this.currentPageId = pageId;
      this.isConnected = true;
      this.isConnecting = false;
      
      this.log('INFO', 'Page joined successfully');
      return true;
      
    } catch (error) {
      this.isConnecting = false;
      this.log('ERROR', 'Failed to join page:', error);
      return false;
    }
  }

  /**
   * FIX: Set up user_presence table subscription for real-time visibility updates
   */
  _setupUserPresenceSubscription() {
    if (!this.supabase) {
      this.log('WARN', 'Supabase not available for user_presence subscription');
      return;
    }

    // Skip if already set up
    if (this.userPresenceChannel) {
      this.log('DEBUG', 'user_presence subscription already active');
      return;
    }

    try {
      this.log('INFO', 'Setting up user_presence subscription...');
      
      const presenceChannel = this.supabase
        .channel('user-presence-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_presence'
          },
          (payload) => {
            this.log('DEBUG', 'user_presence INSERT detected:', payload);
            if (typeof window !== 'undefined' && typeof window.handlePresenceChange === 'function') {
              window.handlePresenceChange({
                eventType: 'INSERT',
                new: payload.new,
                old: null
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_presence'
          },
          (payload) => {
            this.log('DEBUG', 'user_presence UPDATE detected:', payload);
            if (typeof window !== 'undefined' && typeof window.handlePresenceChange === 'function') {
              window.handlePresenceChange({
                eventType: 'UPDATE',
                new: payload.new,
                old: payload.old
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'user_presence'
          },
          (payload) => {
            this.log('DEBUG', 'user_presence DELETE detected:', payload);
            if (typeof window !== 'undefined' && typeof window.handlePresenceChange === 'function') {
              window.handlePresenceChange({
                eventType: 'DELETE',
                new: null,
                old: payload.old
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.log('INFO', '✅ user_presence subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            this.log('ERROR', '❌ user_presence subscription error');
          }
        });

      this.userPresenceChannel = presenceChannel;
      this.log('INFO', 'user_presence subscription set up');
    } catch (error) {
      this.log('ERROR', 'Failed to set up user_presence subscription:', error);
    }
  }

  /**
   * HYBRID: Set up global availability subscription for real-time status sync across all tabs
   */
  _setupGlobalAvailabilitySubscription() {
    if (!this.supabase) {
      this.log('WARN', 'Supabase not available for global availability subscription');
      return;
    }

    // Skip if already set up
    if (this.globalAvailabilityChannel) {
      this.log('DEBUG', 'global availability subscription already active');
      return;
    }

    try {
      this.log('INFO', 'Setting up global availability subscription...');
      
      const globalStatusChannel = this.supabase
        .channel('global-availability-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'AppUser',
            filter: 'globalAvailability=neq.null' // Only when status changes
          },
          (payload) => {
            this.log('DEBUG', 'Global availability UPDATE detected:', payload);
            
            // Dispatch event for all tabs to update
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('globalAvailabilityChanged', {
                detail: {
                  userId: payload.new.id,
                  availability: payload.new.globalAvailability,
                  updatedAt: payload.new.availabilityUpdatedAt,
                  oldAvailability: payload.old?.globalAvailability
                }
              }));

              // Also update status selector if it exists
              const statusSelect = document.getElementById('status-select');
              const statusDisplay = document.getElementById('status-display');
              if (statusSelect && payload.new.globalAvailability) {
                statusSelect.value = payload.new.globalAvailability;
                if (statusDisplay) {
                  statusDisplay.textContent = `${payload.new.globalAvailability} (Global - all tabs)`;
                }
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.log('INFO', '✅ Global availability subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            this.log('ERROR', '❌ Global availability subscription error');
          }
        });

      this.globalAvailabilityChannel = globalStatusChannel;
      this.log('INFO', 'Global availability subscription set up');
    } catch (error) {
      this.log('ERROR', 'Failed to set up global availability subscription:', error);
    }
  }

  async _setupPostgresChanges(pageId) {
    try {
      const changesTopic = `messages-changes-${pageId}`;
      const changesChannel = this.supabase.channel(changesTopic);
      
      // Subscribe to INSERT events
      changesChannel.on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `page_id=eq.${pageId}` 
      }, (payload) => {
        this.log('DEBUG', 'PG INSERT received via realtime', payload);
        const rec = payload?.new || {};
        const normalized = {
          id: rec.id,
          messageId: rec.id,
          content: rec.content,
          user_email: rec.user_email,
          created_at: rec.created_at,
          _source: 'postgres_changes'
        };
        
        if (!this._processedMessages.has(rec.id)) {
          this._processedMessages.add(rec.id);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('realtime-message', { detail: normalized }));
          }
        }
      });
      
      // Subscribe to UPDATE events
      changesChannel.on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages', 
        filter: `page_id=eq.${pageId}` 
      }, (payload) => {
        this.log('DEBUG', 'PG UPDATE received via realtime', payload);
        const rec = payload?.new || {};
        const normalized = {
          id: rec.id,
          messageId: rec.id,
          content: rec.content,
          newContent: rec.content,
          updated_at: rec.updated_at
        };
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('realtime-message-edited', { detail: normalized }));
        }
      });
      
      // Subscribe to DELETE events
      changesChannel.on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'messages', 
        filter: `page_id=eq.${pageId}` 
      }, (payload) => {
        this.log('DEBUG', 'PG DELETE received via realtime', payload);
        const rec = payload?.old || {};
        const normalized = {
          id: rec.id,
          messageId: rec.id
        };
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('realtime-message-deleted', { detail: normalized }));
        }
      });
      
      // Subscribe to channel
      const { error } = await changesChannel.subscribe((status) => {
        this.log('DEBUG', `PG changes subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          this.log('DEBUG', 'Postgres Changes subscription active');
        } else if (status === 'CLOSED') {
          this.log('WARN', 'PG changes channel closed - will reconnect on next message');
        } else if (status === 'CHANNEL_ERROR') {
          this.log('ERROR', 'PG changes channel error');
        }
      });
      
      if (error) {
        throw new Error(`Postgres Changes subscription failed: ${error.message}`);
      }
      
      // Store channel
      this.channels.set(pageId, changesChannel);
      this.log('DEBUG', 'Postgres Changes subscription set up successfully');
      
    } catch (error) {
      this.log('ERROR', 'Failed to set up Postgres Changes:', error);
      throw error;
    }
  }

  async sendMessage(content) {
    if (!this.isConnected) {
      this.log('ERROR', 'Not connected to any page');
      return false;
    }
    
    try {
      this.log('INFO', `Sending message: ${content}`);
      
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          content: content,
          user_email: this.user.email,
          page_id: this.currentPageId,
          community_id: this.user.communityId
        })
        .select();
      
      if (error) {
        throw new Error(`Message send failed: ${error.message}`);
      }
      
      this.log('INFO', 'Message sent successfully');
      this.log('DEBUG', 'Supabase response data:', data);
      
      // Verify message was created
      if (data && data.length > 0) {
        const message = data[0];
        this.log('DEBUG', 'Verified message ID:', message.id);
        this.log('DEBUG', 'Verified message content:', message.content);
        return message;
      }
      
      return false;
      
    } catch (error) {
      this.log('ERROR', 'Failed to send message:', error);
      return false;
    }
  }

  async editMessage(messageId, newContent) {
    if (!this.isConnected) {
      this.log('ERROR', 'Not connected to any page');
      return false;
    }
    
    try {
      this.log('INFO', `Editing message: ${messageId}`);
      
      const { data, error } = await this.supabase
        .from('messages')
        .update({ content: newContent })
        .eq('id', messageId)
        .select();
      
      if (error) {
        throw new Error(`Message edit failed: ${error.message}`);
      }
      
      this.log('INFO', 'Message edited successfully');
      return data && data.length > 0 ? data[0] : false;
      
    } catch (error) {
      this.log('ERROR', 'Failed to edit message:', error);
      return false;
    }
  }

  async deleteMessage(messageId) {
    if (!this.isConnected) {
      this.log('ERROR', 'Not connected to any page');
      return false;
    }
    
    try {
      this.log('INFO', `Deleting message: ${messageId}`);
      
      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      if (error) {
        throw new Error(`Message deletion failed: ${error.message}`);
      }
      
      this.log('INFO', 'Message deleted successfully');
      return true;
      
    } catch (error) {
      this.log('ERROR', 'Failed to delete message:', error);
      return false;
    }
  }

  async updatePresence() {
    // ROOT CAUSE FIX: Removed presence tracking to eliminate auth issues
    // Postgres Changes handles all real-time functionality
    this.log('DEBUG', 'Presence tracking disabled - using Postgres Changes only');
    return true;
  }

  forceReconnect() {
    this.log('INFO', 'Forcing reconnection to current page');
    if (this.currentPageId) {
      this.joinPage(this.currentPageId);
    }
  }

  isRealtimeWorking() {
    return this.isConnected && this.channels.size > 0;
  }
}

// Export for use
window.CleanRealtimeManager = CleanRealtimeManager;

/**
 * Supabase Service - Centralized Supabase Integration
 * Extracts all Supabase-related functionality from sidepanel.js
 * 
 * Responsibilities:
 * - Supabase client initialization
 * - Real-time subscriptions
 * - Database operations
 * - Authentication
 * - Presence tracking
 */

class SupabaseService {
  constructor(config = {}) {
    this.config = {
      url: config.url || window.SUPABASE_URL || 'https://zwxomzkmncwzwryvudwu.supabase.co',
      key: config.key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM',
      ...config
    };
    
    this.client = null;
    this.currentUser = null;
    this.currentPage = null;
    this.isConnected = false;
    this.channels = new Map();
    this.eventHandlers = new Map();
    
    this.logger = window.Logger || console;
  }

  /**
   * Initialize Supabase client
   */
  async initialize() {
    try {
      this.logger.startFlow('SUPABASE_INIT', { url: this.config.url });
      
      // Initialize Supabase client
      this.client = supabase.createClient(this.config.url, this.config.key);
      
      // Test connection
      const { data, error } = await this.client.from('user_presence').select('count').limit(1);
      
      if (error) {
        throw new Error(`Supabase connection failed: ${error.message}`);
      }
      
      this.isConnected = true;
      this.logger.endFlow('SUPABASE_INIT', true, { connected: true });
      
      return { success: true, client: this.client };
    } catch (error) {
      this.logger.endFlow('SUPABASE_INIT', false, { error: error.message });
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser();
      
      if (error) throw error;
      
      this.currentUser = user;
      this.logger.debug('SUPABASE', 'Current user retrieved', { 
        email: user?.email,
        id: user?.id 
      });
      
      return user;
    } catch (error) {
      this.logger.error('SUPABASE', 'Failed to get current user', { error: error.message });
      throw error;
    }
  }

  /**
   * Subscribe to real-time events
   */
  async subscribeToPage(pageId, pageUrl) {
    try {
      this.logger.startFlow('SUPABASE_SUBSCRIBE', { pageId, pageUrl });
      
      // Store current page
      this.currentPage = { pageId, pageUrl };
      
      // Subscribe to presence changes
      const channel = this.client
        .channel(`presence:${pageId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `page_id=eq.${pageId}`
        }, (payload) => {
          this.logger.supabase('Real-time event received', payload);
          this.handleRealtimeEvent(payload);
        })
        .subscribe();

      this.channels.set(pageId, channel);
      this.logger.endFlow('SUPABASE_SUBSCRIBE', true, { pageId, channelId: channel.id });
      
      return channel;
    } catch (error) {
      this.logger.endFlow('SUPABASE_SUBSCRIBE', false, { error: error.message });
      throw error;
    }
  }

  /**
   * Unsubscribe from page
   */
  async unsubscribeFromPage(pageId) {
    try {
      const channel = this.channels.get(pageId);
      if (channel) {
        await this.client.removeChannel(channel);
        this.channels.delete(pageId);
        this.logger.supabase('Unsubscribed from page', { pageId });
      }
    } catch (error) {
      this.logger.error('SUPABASE', 'Failed to unsubscribe from page', { 
        pageId, 
        error: error.message 
      });
    }
  }

  /**
   * Get users for a specific page
   */
  async getPageUsers(pageId, thresholdDays = 30) {
    try {
      this.logger.startPerformance(`getPageUsers:${pageId}`);
      
      const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
      const recentThreshold = new Date(Date.now() - thresholdMs);
      
      const { data, error } = await this.client
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId)
        .or(`is_active.eq.true,and(is_active.eq.false,last_seen.gte.${recentThreshold.toISOString()})`)
        .order('last_seen', { ascending: false });

      if (error) throw error;
      
      this.logger.endPerformance(`getPageUsers:${pageId}`, `Found ${data.length} users`);
      return data;
    } catch (error) {
      this.logger.error('SUPABASE', 'Failed to get page users', { 
        pageId, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Update user presence
   */
  async updatePresence(userEmail, pageId, pageUrl, isActive, auraColor = '#aaaaaa', avatarUrl = null) {
    try {
      this.logger.startPerformance(`updatePresence:${userEmail}`);
      
      const presenceData = {
        user_email: userEmail,
        page_id: pageId,
        page_url: pageUrl,
        is_active: isActive,
        last_seen: new Date().toISOString(),
        aura_color: auraColor
      };

      // SD1 FIX: Add avatar_url to presence data if provided
      // This ensures avatar URLs are available when querying user_presence
      if (avatarUrl) {
        presenceData.avatar_url = avatarUrl;
        this.logger.debug('SUPABASE', 'Including avatar URL in presence update', { 
          userEmail, 
          avatarUrl,
          source: 'presence_update'
        });
      }

      const { data, error } = await this.client
        .from('user_presence')
        .upsert(presenceData, { 
          onConflict: 'user_email,page_id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;
      
      this.logger.endPerformance(`updatePresence:${userEmail}`, 'Presence updated');
      return data;
    } catch (error) {
      this.logger.error('SUPABASE', 'Failed to update presence', { 
        userEmail, 
        pageId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get user profile data
   */
  async getUserProfile(email) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .select('avatar_url, name, handle')
        .eq('email', email)
        .single();

      if (error) throw error;
      
      this.logger.debug('SUPABASE', 'User profile retrieved', { email, data });
      return data;
    } catch (error) {
      this.logger.warn('SUPABASE', 'Failed to get user profile', { 
        email, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Handle real-time events
   */
  handleRealtimeEvent(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    this.logger.supabase('Processing real-time event', { 
      eventType, 
      userEmail: newRecord?.user_email || oldRecord?.user_email 
    });

    // Emit events to registered handlers
    const handlers = this.eventHandlers.get('presence') || [];
    handlers.forEach(handler => {
      try {
        handler(eventType, newRecord, oldRecord);
      } catch (error) {
        this.logger.error('SUPABASE', 'Event handler error', { 
          error: error.message,
          eventType 
        });
      }
    });
  }

  /**
   * Register event handlers
   */
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  /**
   * Remove event handlers
   */
  off(eventType, handler) {
    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      // Unsubscribe from all channels
      for (const [pageId, channel] of this.channels) {
        await this.client.removeChannel(channel);
      }
      this.channels.clear();
      
      // Clear handlers
      this.eventHandlers.clear();
      
      this.logger.supabase('Cleanup completed');
    } catch (error) {
      this.logger.error('SUPABASE', 'Cleanup failed', { error: error.message });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      currentUser: !!this.currentUser,
      currentPage: this.currentPage,
      activeChannels: this.channels.size
    };
  }
}


// ===== COMPLETE MODERN ARCHITECTURE INTEGRATION =====
// StateManager, EventBus, LifecycleManager, and Supabase integration

// Supabase configuration (using config system - NO HARDCODING)
const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

// Initialize Supabase client globally with comprehensive error handling
if (typeof window !== 'undefined') {
  try {
    // Check if supabase is available
    if (typeof supabase === 'undefined') {
      console.error('❌ SUPABASE: supabase library not loaded');
      throw new Error('Supabase library not available');
    }
    
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ SUPABASE: Global client initialized successfully');
    console.log('✅ SUPABASE: URL:', SUPABASE_URL);
    console.log('✅ SUPABASE: Key present:', !!SUPABASE_ANON_KEY);
    console.log('✅ SUPABASE: Client methods available:', Object.keys(window.supabase).slice(0, 10));
    
    // CRITICAL FIX: Set up Supabase authentication after user login
    console.log('🔧 SUPABASE: Setting up authentication listener...');
    window.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 SUPABASE AUTH: Auth state changed:', event);
      if (session) {
        console.log('✅ SUPABASE AUTH: User authenticated:', session.user.email);
        console.log('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000));
        
        // Initialize RobustIntegration now that user is authenticated
        if (window.robustIntegration && !window.robustIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing RobustIntegration after authentication...');
          window.robustIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: RobustIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: RobustIntegration initialization failed');
            }
          });
        }

        // Initialize VisibilityIntegration now that user is authenticated
        if (window.visibilityIntegration && !window.visibilityIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing VisibilityIntegration after authentication...');
          window.visibilityIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: VisibilityIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: VisibilityIntegration initialization failed');
            }
          });
        }

        // Initialize ReactionsIntegration now that user is authenticated
        if (window.reactionsIntegration && !window.reactionsIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing ReactionsIntegration after authentication...');
          window.reactionsIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: ReactionsIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: ReactionsIntegration initialization failed');
            }
          });
        }

        // Initialize AurasIntegration now that user is authenticated
        if (window.aurasIntegration && !window.aurasIntegration.isInitialized) {
          console.log('🔗 AUTH: Initializing AurasIntegration after authentication...');
          window.aurasIntegration.initialize().then(success => {
            if (success) {
              console.log('✅ AUTH: AurasIntegration initialized successfully');
            } else {
              console.log('❌ AUTH: AurasIntegration initialization failed');
            }
          });
        }
      } else {
        console.log('❌ SUPABASE AUTH: User not authenticated');
      }
    });
  } catch (error) {
    console.error('❌ SUPABASE: Failed to initialize global client:', error);
    console.error('❌ SUPABASE: Error details:', error.message);
  }
} else {
  console.error('❌ SUPABASE: Supabase library not available');
  console.error('❌ SUPABASE: typeof window:', typeof window);
  console.error('❌ SUPABASE: typeof supabase:', typeof supabase);
}

// Initialize all modern architecture components
let stateManager = null;
let eventBus = null;
let lifecycleManager = null;
let modernArchitectureInitialized = false;
let supabaseRealtimeClient = null;

// Initialize real Google auth for actual profile pictures
let realGoogleAuth = null;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseService;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.SupabaseService = SupabaseService;
}

console.log('✅ SupabaseService initialized');


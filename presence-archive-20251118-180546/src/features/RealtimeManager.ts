/**
 * REALTIME MANAGER - Real-time Communication
 * Handles all real-time functionality
 */

import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { Message, PresenceData, AurasIntegration } from '../types/index.js';

type LogLevel = 'SILENT' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
type PresenceEventType = 'INSERT' | 'UPDATE' | 'DELETE';
type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
type MessageType = 'MESSAGE_NEW' | 'AURA_COLOR_CHANGED' | 'PRESENCE_UPDATE' | 'VISIBILITY_UPDATE' | 'PAGE_SUBSCRIPTION';
type PresenceEventKind = 'ENTER' | 'LEAVE' | 'AVAILABILITY';

interface PresenceChangePayload {
  eventType: PresenceEventType;
  new: Record<string, any> | null;
  old: Record<string, any> | null;
}

interface MessageChangePayload {
  eventType: PresenceEventType;
  new: Record<string, any> | null;
  old: Record<string, any> | null;
}

interface ReactionChangePayload {
  eventType: PresenceEventType;
  new: Record<string, any> | null;
  old: Record<string, any> | null;
}

interface AuraChangePayload {
  eventType: PresenceEventType;
  new: Record<string, any> | null;
  old: Record<string, any> | null;
}

interface SupabaseMessage {
  type: MessageType;
  content?: string;
  userId?: string;
  user_id?: string;
  pageId?: string;
  pageUrl?: string;
  url?: string;
  auraColor?: string;
  color?: string;
  isVisible?: boolean;
  is_visible?: boolean;
  timestamp?: number;
  kind?: PresenceEventKind;
  availability?: AvailabilityStatus;
  customLabel?: string;
}

interface ActiveUser {
  userId?: string;
  user_id?: string;
  name?: string;
  avatar?: string;
  availability?: AvailabilityStatus;
}

interface PresenceEventRequest {
  pageId: string;
  kind: PresenceEventKind;
  availability?: AvailabilityStatus | null;
  customLabel?: string | null;
  pageUrl: string;
}

interface PresenceEventResponse {
  success: boolean;
  status?: number;
  data?: Record<string, unknown>;
  error?: string;
  local?: boolean;
}

class RealtimeManager {
  private logLevel: LogLevel = 'INFO';
  private isInitialized: boolean = false;
  private userPresenceChannel: RealtimeChannel | null = null;
  private availabilityChannel: RealtimeChannel | null = null;

  /**
   * Initialize RealtimeManager module
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.log('WARN', 'RealtimeManager already initialized');
      return;
    }

    this.log('INFO', 'Initializing RealtimeManager...');
    
    try {
      // COMP METHOD: Initialize AurasIntegration if available
      // This integration enables real-time aura color propagation
      const aurasIntegration = (window as Window & { aurasIntegration?: AurasIntegration }).aurasIntegration;
      if (aurasIntegration && typeof aurasIntegration.initialize === 'function') {
        this.log('INFO', 'Initializing AurasIntegration...');
        try {
          const initSuccess = await aurasIntegration.initialize();
          if (initSuccess) {
            this.log('INFO', 'AurasIntegration initialized successfully');
          } else {
            this.log('WARN', 'AurasIntegration initialization returned false - may work with limited functionality');
            // COMP METHOD: Don't fail completely - aura can still work via Supabase directly
          }
        } catch (error) {
          this.log('ERROR', 'AurasIntegration initialization failed:', error);
          // COMP METHOD: Don't throw - continue initialization - aura can work via Supabase directly
          this.log('WARN', 'Continuing without AurasIntegration - aura functionality will use Supabase directly');
        }
      } else {
        this.log('WARN', 'AurasIntegration not available for initialization');
        this.log('INFO', 'Aura functionality will use Supabase directly');
      }
      
      // COMP METHOD: Initialize presence tracking
      this.initializePresenceTracking();
      
      // FIX: Initialize user_presence table subscription for real-time visibility updates
      this.initializeUserPresenceSubscription();
      
      // 4-STATE STATUS: Initialize availability status real-time subscription (if enabled)
      if (typeof window !== 'undefined' && (window as Window & { ENABLE_4STATE_STATUS?: boolean }).ENABLE_4STATE_STATUS !== false) {
        this.initializeAvailabilitySubscription();
      }
      
      this.isInitialized = true;
      this.log('INFO', 'RealtimeManager initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize RealtimeManager:', error);
      throw error;
    }
  }

  /**
   * COMP METHOD: Initialize presence tracking
   */
  private initializePresenceTracking(): void {
    this.log('INFO', 'COMP METHOD: Initializing presence tracking...');
    
    // Initialize presence tracking for current page
    const currentUrlData = (window as Window & { currentUrlData?: { pageId?: string } }).currentUrlData;
    const currentPageId = currentUrlData?.pageId;
    if (currentPageId) {
      this.initializePresence(currentPageId);
    } else {
      this.log('WARN', 'COMP METHOD: No page ID available for presence tracking');
    }
  }

  /**
   * COMP METHOD: Initialize presence for a specific page
   */
  private initializePresence(pageId: string): void {
    this.log('INFO', `COMP METHOD: Initializing presence for page ${pageId}`);
    
    // Initialize presence tracking using COMP method
    const supabase = ((window as unknown) as Window & { supabase?: SupabaseClient }).supabase;
    if (supabase) {
      // Subscribe to presence changes
      const presenceChannel = supabase.channel(`presence:${pageId}`) as unknown as {
        on: (event: string, filter: { event: string }, callback: (payload?: unknown) => void) => unknown;
        subscribe: (callback: () => void) => unknown;
      };
      const ch1 = presenceChannel
        .on('presence', { event: 'sync' }, () => {
          this.log('INFO', 'COMP METHOD: Presence sync event received');
          this.updatePresenceDisplay();
        }) as unknown as { on: (event: string, filter: { event: string }, callback: (payload?: unknown) => void) => unknown; subscribe: (callback: () => void) => unknown };
      const ch2 = ch1
        .on('presence', { event: 'join' }, (payload?: unknown) => {
          const p = payload as { key: string; newPresences: PresenceData[] };
          this.log('INFO', 'COMP METHOD: User joined presence:', p?.key);
          this.updatePresenceDisplay();
        }) as unknown as { on: (event: string, filter: { event: string }, callback: (payload?: unknown) => void) => unknown; subscribe: (callback: () => void) => unknown };
      const ch3 = ch2
        .on('presence', { event: 'leave' }, (payload?: unknown) => {
          const p = payload as { key: string; leftPresences: PresenceData[] };
          this.log('INFO', 'COMP METHOD: User left presence:', p?.key);
          this.updatePresenceDisplay();
        }) as unknown as { subscribe: (callback: () => void) => unknown };
      ch3.subscribe(() => {});
      
      // Track current user's presence
      this.trackUserPresence(pageId);
    } else {
      this.log('WARN', 'COMP METHOD: Supabase not available for presence tracking');
    }
  }

  /**
   * COMP METHOD: Track current user's presence
   */
  private trackUserPresence(pageId: string): void {
    this.log('INFO', `COMP METHOD: Tracking user presence for page ${pageId}`);
    
    const currentUser = window.currentUser;
    const supabase = ((window as unknown) as Window & { supabase?: SupabaseClient }).supabase;
    if (currentUser && supabase) {
      const presenceChannel = supabase.channel(`presence:${pageId}`);
      
      const channel = presenceChannel as unknown as { on: (event: string, filter: { event: string }, callback: () => void) => unknown; subscribe: (callback: (status: string) => Promise<void>) => unknown; presenceState?: () => unknown; track?: (data: unknown) => Promise<void> };
      const ch = channel
        .on('presence', { event: 'sync' }, () => {
          if (channel.presenceState) {
            const state = channel.presenceState();
            this.log('INFO', 'COMP METHOD: Current presence state:', state);
          }
        }) as unknown as { subscribe: (callback: (status: string) => Promise<void>) => unknown };
      ch.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED' && channel.track) {
            await channel.track({
              userId: (currentUser as { id?: string; user_id?: string }).id || (currentUser as { id?: string; user_id?: string }).user_id,
              userName: (currentUser as { name?: string }).name,
              userAvatar: (currentUser as { avatar?: string }).avatar,
              onlineAt: new Date().toISOString(),
              pageId: pageId
            });
            this.log('INFO', 'COMP METHOD: User presence tracked successfully');
          }
        });
    }
  }

  /**
   * COMP METHOD: Update presence display
   */
  private updatePresenceDisplay(): void {
    this.log('INFO', 'COMP METHOD: Updating presence display...');
    
    // Get active users from presence state
    const activeUsers = this.getActiveUsers();
    
    // Update visible tab if available
    const visibleTab = document.querySelector('#visible-tab');
    if (visibleTab) {
      if (activeUsers.length > 0) {
        visibleTab.innerHTML = '';
        activeUsers.forEach(user => {
          const profileDiv = document.createElement('div');
          profileDiv.className = 'profile-item';
          profileDiv.innerHTML = `
            <div class="profile-avatar">
              <img src="${user.avatar || ''}" alt="${user.name || ''}">
            </div>
            <div class="profile-info">
              <div class="profile-name">${user.name || ''}</div>
              <div class="profile-status">Active</div>
            </div>
          `;
          visibleTab.appendChild(profileDiv);
        });
      } else {
        visibleTab.innerHTML = '<div class="no-users">No active users on this page</div>';
      }
    }
  }

  /**
   * COMP METHOD: Get active users
   */
  private getActiveUsers(): ActiveUser[] {
    // This would be implemented based on the actual presence system
    // For now, return empty array - this should be connected to the actual presence data
    return [];
  }

  /**
   * Logging utility
   */
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (this.logLevel === 'SILENT') return;
    
    const levels: Record<LogLevel, number> = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, SILENT: -1 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[RealtimeManager] [${level}] ${message}`, ...args);
    }
  }

  /**
   * FIX: Initialize real-time subscription for user_presence table changes
   * This ensures visibility updates when users join/leave pages
   */
  private initializeUserPresenceSubscription(): void {
    this.log('INFO', '🔔 PRESENCE: Initializing user_presence subscription...');
    
    const supabase = ((window as unknown) as Window & { supabase?: SupabaseClient }).supabase;
    if (!supabase) {
      this.log('WARN', '⚠️ PRESENCE: Supabase not available for user_presence subscription');
      return;
    }

    try {
      // Subscribe to user_presence table changes (INSERT, UPDATE, DELETE)
      // FIX: Subscribe to each event type separately for reliability
      const presenceChannel = supabase.channel('user-presence-changes') as unknown as {
        on: (event: string, filter: { event: string; schema: string; table: string }, callback: (payload: unknown) => void) => unknown;
        subscribe: (callback: (status: string) => void) => unknown;
      };
      const pc1 = presenceChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_presence'
          },
          (payload: unknown) => {
            const p = payload as { new: Record<string, unknown> | null };
            this.log('INFO', '🔔 PRESENCE: user_presence INSERT detected:', p);
            handlePresenceChange({
              eventType: 'INSERT',
              new: p.new,
              old: null
            });
          }
        ) as unknown as { on: (event: string, filter: { event: string; schema: string; table: string }, callback: (payload: unknown) => void) => unknown; subscribe: (callback: (status: string) => void) => unknown };
      const pc2 = pc1
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_presence'
          },
          (payload: unknown) => {
            const p = payload as { new: Record<string, unknown> | null; old: Record<string, unknown> | null };
            this.log('INFO', '🔔 PRESENCE: user_presence UPDATE detected:', p);
            handlePresenceChange({
              eventType: 'UPDATE',
              new: p.new,
              old: p.old
            });
          }
        ) as unknown as { on: (event: string, filter: { event: string; schema: string; table: string }, callback: (payload: unknown) => void) => unknown; subscribe: (callback: (status: string) => void) => unknown };
      const pc3 = pc2
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'user_presence'
          },
          (payload: unknown) => {
            const p = payload as { old: Record<string, unknown> | null };
            this.log('INFO', '🔔 PRESENCE: user_presence DELETE detected:', p);
            handlePresenceChange({
              eventType: 'DELETE',
              new: null,
              old: p.old
            });
          }
        ) as unknown as { subscribe: (callback: (status: string) => void) => unknown };
      pc3.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            this.log('INFO', '✅ PRESENCE: user_presence subscription active (all events)');
          } else if (status === 'CHANNEL_ERROR') {
            this.log('ERROR', '❌ PRESENCE: user_presence subscription error');
          }
        });

      // Store channel reference for cleanup
      this.userPresenceChannel = presenceChannel as unknown as RealtimeChannel;
    } catch (error) {
      this.log('ERROR', '❌ PRESENCE: Failed to initialize user_presence subscription:', error);
    }
  }

  /**
   * 4-STATE STATUS: Initialize real-time subscription for availability changes
   */
  private initializeAvailabilitySubscription(): void {
    this.log('INFO', '🎯 STATUS: Initializing availability subscription...');
    
    const supabase = ((window as unknown) as Window & { supabase?: SupabaseClient }).supabase;
    if (!supabase) {
      this.log('WARN', '⚠️ STATUS: Supabase not available for availability subscription');
      return;
    }

    try {
      // Subscribe to PresenceEvent table changes for AVAILABILITY events
      const availabilityChannel = supabase.channel('availability-changes') as unknown as {
        on: (event: string, filter: { event: string; schema: string; table: string; filter?: string }, callback: (payload: unknown) => void) => unknown;
        subscribe: (callback: (status: string) => void) => unknown;
      };
      const ac1 = availabilityChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'PresenceEvent',
            filter: 'kind=eq.AVAILABILITY'
          },
          (payload: unknown) => {
            const p = payload as { new: { userId: string; availability: AvailabilityStatus } };
            this.log('INFO', '🎯 STATUS: Availability change detected:', p);
            this.handleAvailabilityChange(p);
          }
        ) as unknown as { subscribe: (callback: (status: string) => void) => unknown };
      ac1.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            this.log('INFO', '✅ STATUS: Availability subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            this.log('ERROR', '❌ STATUS: Availability subscription error');
          }
        });

      // Store channel reference for cleanup
      this.availabilityChannel = availabilityChannel as unknown as RealtimeChannel;
    } catch (error) {
      this.log('ERROR', '❌ STATUS: Failed to initialize availability subscription:', error);
    }
  }

  /**
   * 4-STATE STATUS: Handle availability change event
   */
  private handleAvailabilityChange(payload: { new: { userId: string; availability: AvailabilityStatus } }): void {
    try {
      const { new: newEvent } = payload;
      const { userId, availability } = newEvent;

      this.log('INFO', `🎯 STATUS: User ${userId} changed availability to ${availability}`);

      // Update all status dots for this user in the DOM
      this.updateUserStatusDots(userId, availability);

      // Update visibility data if available
      const currentVisibilityDataUnfiltered = (window as Window & { currentVisibilityDataUnfiltered?: { active?: Array<{ userId?: string; id?: string; availability?: AvailabilityStatus }> } }).currentVisibilityDataUnfiltered;
      if (currentVisibilityDataUnfiltered && currentVisibilityDataUnfiltered.active) {
        const user = currentVisibilityDataUnfiltered.active.find(
          (u: { userId?: string; id?: string }) => u.userId === userId || u.id === userId
        );
        if (user) {
          user.availability = availability;
          this.log('INFO', `✅ STATUS: Updated visibility data for user ${userId}`);
        }
      }

      // Trigger custom event for other modules
      window.dispatchEvent(new CustomEvent('availabilityChanged', {
        detail: { userId, availability }
      }));

    } catch (error) {
      this.log('ERROR', '❌ STATUS: Error handling availability change:', error);
    }
  }

  /**
   * 4-STATE STATUS: Update all status dots for a user in the DOM
   */
  private updateUserStatusDots(userId: string, availability: AvailabilityStatus): void {
    try {
      // Find all status dots for this user
      const statusDots = document.querySelectorAll(`.status-dot[data-user-id="${userId}"]`);
      
      if (statusDots.length === 0) {
        this.log('INFO', `ℹ️ STATUS: No status dots found for user ${userId}`);
        return;
      }

      // Get new color using StatusDotHelper if available
      let newColor: string | null = null;
      const statusDotHelper = ((window as unknown) as Window & { StatusDotHelper?: { getStatusDotColor: (user: { availability: AvailabilityStatus; isActive: boolean }) => string | null } }).StatusDotHelper;
      if (statusDotHelper) {
        const mockUser = { availability, isActive: true };
        newColor = statusDotHelper.getStatusDotColor(mockUser);
      } else {
        // Fallback color map
        const colorMap: Record<AvailabilityStatus, string> = {
          'AVAILABLE': '#22c55e',  // Green
          'BUSY': '#eab308',       // Yellow
          'AWAY': '#ef4444',       // Red
          'OFFLINE': '#9ca3af'     // Gray
        };
        newColor = colorMap[availability] || '#22c55e';
      }

      // Update all status dots
      statusDots.forEach(dot => {
        (dot as HTMLElement).style.backgroundColor = newColor || '#22c55e';
        dot.setAttribute('data-availability', availability);
        dot.setAttribute('title', availability);
        this.log('INFO', `✅ STATUS: Updated status dot for user ${userId} to ${availability} (${newColor})`);
      });

    } catch (error) {
      this.log('ERROR', '❌ STATUS: Error updating status dots:', error);
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup(): void {
    if (this.availabilityChannel) {
      this.availabilityChannel.unsubscribe();
      this.log('INFO', '🧹 STATUS: Availability subscription cleaned up');
    }
    if (this.userPresenceChannel) {
      this.userPresenceChannel.unsubscribe();
      this.log('INFO', '🧹 PRESENCE: user_presence subscription cleaned up');
    }
  }
}

// ===== REALTIME FUNCTIONS =====

// Initialize Supabase real-time client
async function initializeSupabaseRealtimeClient(): Promise<void> {
  try {
    console.log('🚀 SUPABASE: Starting comprehensive real-time client initialization...');
    console.log('🚀 SUPABASE: Current window.supabase status:', typeof ((window as unknown) as Window & { supabase?: SupabaseClient }).supabase);
    console.log('🚀 SUPABASE: Current window.supabaseRealtimeClient status:', typeof (window as Window & { supabaseRealtimeClient?: { initialize?: (client: SupabaseClient) => Promise<boolean>; isConnected?: boolean; sendMessage?: (content: string) => Promise<boolean>; broadcastAuraColorChange?: (color: string) => Promise<boolean>; updatePresence?: (pageId: string, pageUrl: string, auraColor: string) => Promise<boolean>; setUserVisibility?: (isVisible: boolean, pageUrl: string) => Promise<boolean>; setCurrentUser?: (userId: string | null) => Promise<void>; joinPage?: (pageId: string, pageUrl: string) => Promise<void>; onUserJoined?: (user: { user_email: string }) => void; onUserLeft?: (user: { user_email: string }) => void; onUserUpdated?: (user: { user_email: string; aura_color?: string }) => void; onNewMessage?: (message: Message) => Promise<void>; onVisibilityChanged?: (visibility: { user_email: string; is_visible: boolean }) => void } }).supabaseRealtimeClient);
    
    // Wait for Supabase library to load
    const waitForSupabase = (): Promise<boolean> => {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkSupabase = (): void => {
          attempts++;
          
          console.log(`🔍 SUPABASE CHECK: Attempt ${attempts}/${maxAttempts}`);
          const winSupabase = ((window as unknown) as Window & { supabase?: SupabaseClient }).supabase;
          console.log(`🔍 SUPABASE CHECK: window.supabase type: ${typeof winSupabase}`);
          console.log(`🔍 SUPABASE CHECK: window.supabase.from type: ${typeof winSupabase?.from}`);
          
          // Check if window.supabase client is available
          const supabase = ((window as unknown) as Window & { supabase?: SupabaseClient }).supabase;
          if (typeof supabase !== 'undefined' && supabase && typeof supabase.from === 'function') {
            console.log('✅ SUPABASE CLIENT: Loaded and initialized successfully');
            console.log('✅ SUPABASE CLIENT: Available methods:', Object.keys(supabase).slice(0, 10));
            console.log('✅ SUPABASE CLIENT: Client ready for real-time operations');
            resolve(true);
          } else if (attempts >= maxAttempts) {
            console.error('❌ SUPABASE LIBRARY: Failed to load after 5 seconds');
            console.error('❌ SUPABASE LIBRARY: window.supabase:', typeof supabase);
            console.error('❌ SUPABASE LIBRARY: Available window keys:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
            console.error('❌ SUPABASE LIBRARY: This is a CRITICAL FAILURE - real-time will not work');
            resolve(false);
          } else {
            if (attempts % 10 === 0) {
              console.log(`⏳ SUPABASE LIBRARY: Waiting... (attempt ${attempts}/${maxAttempts})`);
            }
            setTimeout(checkSupabase, 100);
          }
        };
        
        checkSupabase();
      });
    };
    
    // Wait for library to load
    const loaded = await waitForSupabase();
    
    if (!loaded) {
      console.error('❌ SUPABASE: Cannot initialize without Supabase library');
      return;
    }
    
    console.log('🚀 SUPABASE: Initializing Supabase real-time client...');
    
    // COMP APPROACH: Use window.supabase.realtime directly
    const supabase = ((window as unknown) as Window & { supabase?: SupabaseClient }).supabase;
    if (supabase && supabase.realtime) {
      console.log('✅ SUPABASE_DEBUG: window.supabase.realtime found, using COMP approach...');
      
      // Create SupabaseRealtimeClient instance (FROM COMP)
      type SupabaseRealtimeClientType = new () => { initialize: (client: SupabaseClient) => Promise<boolean>; isConnected?: boolean; sendMessage?: (content: string) => Promise<boolean>; broadcastAuraColorChange?: (color: string) => Promise<boolean>; updatePresence?: (pageId: string, pageUrl: string, auraColor: string) => Promise<boolean>; setUserVisibility?: (isVisible: boolean, pageUrl: string) => Promise<boolean>; setCurrentUser?: (userId: string | null) => Promise<void>; joinPage?: (pageId: string, pageUrl: string) => Promise<void>; onUserJoined?: (user: { user_email: string }) => void; onUserLeft?: (user: { user_email: string }) => void; onUserUpdated?: (user: { user_email: string; aura_color?: string }) => void; onNewMessage?: (message: Message | { user_email?: string; content?: string; [key: string]: unknown }) => Promise<void>; onVisibilityChanged?: (visibility: { user_email: string; is_visible: boolean }) => void };
      const SupabaseRealtimeClient = ((window as unknown) as Window & { SupabaseRealtimeClient?: SupabaseRealtimeClientType }).SupabaseRealtimeClient;
      const winWithClient = (window as unknown) as Window & { supabaseRealtimeClient?: InstanceType<SupabaseRealtimeClientType> };
      if (typeof SupabaseRealtimeClient !== 'undefined') {
        console.log('✅ SUPABASE_DEBUG: SupabaseRealtimeClient class found, creating instance...');
        const instance = new SupabaseRealtimeClient();
        Object.assign(winWithClient, { supabaseRealtimeClient: instance });
        console.log('✅ SUPABASE_DEBUG: Instance created:', !!winWithClient.supabaseRealtimeClient);
        
        // Initialize with Supabase client
        if (winWithClient.supabaseRealtimeClient && typeof winWithClient.supabaseRealtimeClient.initialize === 'function') {
          const success = await winWithClient.supabaseRealtimeClient.initialize(supabase);
          console.log('✅ SUPABASE_DEBUG: Initialize result:', success);
        }
      } else {
        console.log('❌ SUPABASE_DEBUG: SupabaseRealtimeClient class not available, using fallback');
        Object.assign(winWithClient, { supabaseRealtimeClient: supabase as unknown as InstanceType<SupabaseRealtimeClientType> });
      }
      
      console.log('✅ SUPABASE_DEBUG: Using SupabaseRealtimeClient instance');
      
      // COMP APPROACH: Real-time is already available through window.supabase
      console.log('✅ SUPABASE: Real-time client initialized successfully (COMP approach)');
      console.log('✅ SUPABASE: Supabase client:', supabase);
      console.log('✅ SUPABASE: Realtime available:', !!supabase.realtime);
      
      // CRITICAL FIX: Ensure real-time client is properly connected
      console.log('🔧 SUPABASE: Ensuring real-time connection...');
      if (winWithClient.supabaseRealtimeClient) {
        winWithClient.supabaseRealtimeClient.isConnected = true;
      }
      
      // Setup event handlers
      setupSupabaseEventHandlers();
      
      // CRITICAL FIX: Test the connection immediately
      console.log('🔧 SUPABASE: Testing real-time connection...');
      try {
        const testResult = await supabase.from('user_presence').select('count').limit(1);
        console.log('✅ SUPABASE: Connection test successful:', testResult);
      } catch (testError) {
        console.error('❌ SUPABASE: Connection test failed:', testError);
      }
    } else {
      console.error('❌ SUPABASE: window.supabase.realtime not available');
      console.error('❌ SUPABASE: Available window keys:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
    }
    
  } catch (error) {
    console.error('❌ SUPABASE: Error initializing real-time client:', error);
  }
}

// Expose function globally
(window as Window & { initializeSupabaseRealtimeClient?: () => Promise<void> }).initializeSupabaseRealtimeClient = initializeSupabaseRealtimeClient;

async function sendSupabaseMessage(message: SupabaseMessage): Promise<boolean> {
  const timer = Date.now();
  console.log('supabase_send', { messageType: message.type, timestamp: timer });
  
  try {
    // COMP METHOD: Auras integration is optional for aura messages - can use Supabase directly
    const aurasIntegration = (window as Window & { aurasIntegration?: AurasIntegration }).aurasIntegration;
    const isAuraMessage = message.type === 'AURA_COLOR_CHANGED';
    const isPresenceMessage = message.type === 'PRESENCE_UPDATE';
    
    if (!isPresenceMessage && !isAuraMessage && (!aurasIntegration || !aurasIntegration.isInitialized)) {
      console.error('❌ SUPABASE: Auras integration not initialized and message type requires it:', message.type);
      return false;
    }
    
    if (isAuraMessage && (!aurasIntegration || !aurasIntegration.isInitialized)) {
      console.warn('⚠️ SUPABASE: Auras integration not initialized, using direct Supabase approach for aura change');
      // Continue with message - aura can work via Supabase directly
    }
    
    console.log('info', 'Sending message via Supabase real-time', {
      type: message.type,
      hasContent: !!message.content,
      hasUserId: !!(message.userId || message.user_id),
      hasAuraColor: !!message.auraColor,
      timestamp: message.timestamp
    });
    
    console.log('supabase_send', 'Preparing Supabase real-time message');
    
    const supabaseRealtimeClient = (window as Window & { supabaseRealtimeClient?: { sendMessage?: (content: string) => Promise<boolean>; broadcastAuraColorChange?: (color: string) => Promise<boolean>; updatePresence?: (pageId: string, pageUrl: string, auraColor: string) => Promise<boolean>; setUserVisibility?: (isVisible: boolean, pageUrl: string) => Promise<boolean> } }).supabaseRealtimeClient;
    if (!supabaseRealtimeClient) {
      console.error('❌ SUPABASE: supabaseRealtimeClient not available');
      return false;
    }
    
    let success = false;
    
    switch (message.type) {
      case 'MESSAGE_NEW':
        if (supabaseRealtimeClient.sendMessage) {
          success = await supabaseRealtimeClient.sendMessage(message.content || '');
        }
        break;
      case 'AURA_COLOR_CHANGED':
        if (supabaseRealtimeClient.broadcastAuraColorChange) {
          success = await supabaseRealtimeClient.broadcastAuraColorChange(message.color || message.auraColor || '');
        }
        break;
      case 'PRESENCE_UPDATE':
        if (supabaseRealtimeClient.updatePresence) {
          success = await supabaseRealtimeClient.updatePresence(
            message.pageId || '', 
            message.pageUrl || message.url || '', 
            message.auraColor || ''
          );
        }
        break;
      case 'VISIBILITY_UPDATE':
        if (supabaseRealtimeClient.setUserVisibility) {
          success = await supabaseRealtimeClient.setUserVisibility(
            message.isVisible !== undefined ? message.isVisible : (message.is_visible || false), 
            message.pageUrl || message.url || ''
          );
        }
        break;
      default:
        console.warn('❓ SUPABASE: Unknown message type:', message.type);
        return false;
    }
    
    console.log('supabase_send', 'Received response from Supabase');
    
    if (success) {
      console.log('info', 'Message sent successfully via Supabase', {
        messageType: message.type,
        responseTime: Date.now() - timer
      });
      console.log('supabase_send', true, { success });
      return true;
    } else {
      console.log('error', 'Failed to send message via Supabase', {
        messageType: message.type,
        responseTime: Date.now() - timer
      });
      console.log('supabase_send', false, { success });
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('error', 'Error sending message via Supabase', {
      messageType: message.type,
      error: errorMessage,
      responseTime: Date.now() - timer
    });
    console.log('supabase_send', false, { error: errorMessage });
    return false;
  }
}

async function joinPageWithSupabase(pageId: string, pageUrl: string): Promise<void> {
  console.log('🌐 SUPABASE: Starting page join process...');
  console.log('🌐 SUPABASE: Page ID:', pageId);
  console.log('🌐 SUPABASE: Page URL:', pageUrl);
  
  const client = (window as Window & { supabaseRealtimeClient?: { setCurrentUser?: (userId: string | null) => Promise<void>; joinPage?: (pageId: string, pageUrl: string) => Promise<void> } }).supabaseRealtimeClient;
  console.log('🌐 SUPABASE: Client available:', !!client);
  
  if (client) {
    try {
      const getCurrentUserId = (window as Window & { getCurrentUserId?: () => Promise<string | null> }).getCurrentUserId;
      if (!getCurrentUserId) {
        throw new Error('getCurrentUserId not available');
      }
      
      const userId = await getCurrentUserId();
      
      console.log('🌐 SUPABASE: User ID:', userId);
      
      if (client.setCurrentUser) {
        await client.setCurrentUser(userId);
        console.log('✅ SUPABASE: User set successfully');
      }
      
      if (client.joinPage) {
        await client.joinPage(pageId, pageUrl);
        console.log('✅ SUPABASE: Joined page with real-time updates');
        console.log('✅ SUPABASE: Real-time subscriptions should now be active');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ SUPABASE: Failed to join page:', error);
      console.error('❌ SUPABASE: Error details:', errorMessage);
      console.error('❌ SUPABASE: This will cause real-time features to fail');
    }
  } else {
    console.error('❌ SUPABASE: No real-time client available for page join');
    console.error('❌ SUPABASE: Real-time features will not work');
  }
}

// Handle real-time presence changes from Supabase
async function handlePresenceChange(payload: PresenceChangePayload): Promise<void> {
  console.log('🔔 PRESENCE_CHANGE: Processing real-time update:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  // ROOT CAUSE FIX: Declare currentPageId at function scope to avoid ReferenceError
  // COMP METHOD: Get current page ID once at the start for all cases
  const currentUrlData = (window as Window & { currentUrlData?: { pageId?: string } }).currentUrlData;
  const currentPageId = currentUrlData?.pageId;
  
  // ROOT CAUSE FIX: Always refresh visibility after any presence change
  // This ensures users see updates when others move pages
  let shouldRefresh = false;
  
  switch (eventType) {
    case 'INSERT':
      console.log('👋 PRESENCE: User joined:', newRecord);
      // COMP METHOD: Check if this user is on the current page
      if (newRecord?.page_id === currentPageId || newRecord?.pageId === currentPageId) {
        console.log('✅ PRESENCE_CHANGE: User joined current page, refreshing visibility');
        shouldRefresh = true;
      }
      break;
      
    case 'UPDATE':
      console.log('🔄 PRESENCE: User updated:', newRecord);
      // COMP METHOD: Refresh if user updated on current page or left current page
      const updatedPageId = newRecord?.page_id || newRecord?.pageId;
      const oldPageId = oldRecord?.page_id || oldRecord?.pageId;
      if (updatedPageId === currentPageId || oldPageId === currentPageId) {
        console.log('✅ PRESENCE_CHANGE: User page changed, refreshing visibility');
        shouldRefresh = true;
      }
      break;
      
    case 'DELETE':
      console.log('👋 PRESENCE: User left:', oldRecord);
      // COMP METHOD: Refresh if user left current page
      if (oldRecord?.page_id === currentPageId || oldRecord?.pageId === currentPageId) {
        console.log('✅ PRESENCE_CHANGE: User left current page, refreshing visibility');
        shouldRefresh = true;
      }
      break;
      
    default:
      console.log('❓ PRESENCE: Unknown event type:', eventType);
  }
  
  // ROOT CAUSE FIX: Refresh visibility UI when presence changes affect current page
  const refreshVisibilityAvatars = (window as Window & { refreshVisibilityAvatars?: () => Promise<void> }).refreshVisibilityAvatars;
  if (shouldRefresh && typeof refreshVisibilityAvatars === 'function') {
    console.log('🔄 PRESENCE_CHANGE: Calling refreshVisibilityAvatars() to update UI');
    // Use setTimeout to debounce rapid updates
    const timeoutKey = 'presenceChangeRefreshTimeout';
    const winWithTimeout = window as unknown as Window & { [key: string]: unknown };
    const existingTimeout = winWithTimeout[timeoutKey] as number | undefined;
    if (existingTimeout !== undefined) {
      clearTimeout(existingTimeout);
    }
    winWithTimeout[timeoutKey] = setTimeout(async () => {
      await refreshVisibilityAvatars();
    }, 500) as unknown; // 500ms debounce
  }
}

// Handle real-time message changes from Supabase
function handleMessageChange(payload: MessageChangePayload): void {
  console.log('🔔 MESSAGE_CHANGE: Processing real-time update:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      console.log('💬 MESSAGE: New message received:', newRecord);
      const addMessageToChat = (window as Window & { addMessageToChat?: (message: Message) => Promise<void> }).addMessageToChat;
      if (addMessageToChat && newRecord) {
        // Type assertion: newRecord from Supabase may need conversion to Message type
        addMessageToChat(newRecord as Message);
      }
      break;
      
    case 'UPDATE':
      console.log('🔄 MESSAGE: Message updated:', newRecord);
      const updateMessageInChat = (window as Window & { updateMessageInChat?: (message: Message) => void }).updateMessageInChat;
      if (updateMessageInChat && newRecord) {
        // Type assertion: newRecord from Supabase may need conversion to Message type
        updateMessageInChat(newRecord as Message);
      }
      break;
      
    case 'DELETE':
      console.log('🗑️ MESSAGE: Message deleted:', oldRecord);
      const removeMessageFromChat = (window as Window & { removeMessageFromChat?: (messageId: string) => void }).removeMessageFromChat;
      if (removeMessageFromChat && oldRecord) {
        const messageId = typeof oldRecord === 'string' ? oldRecord : (oldRecord.id || oldRecord.messageId || String(oldRecord));
        removeMessageFromChat(messageId);
      }
      break;
      
    default:
      console.log('❓ MESSAGE: Unknown event type:', eventType);
  }
}

// Handle real-time reaction changes from Supabase - COMP METHOD
let isProcessingReactionChange = false; // Guard to prevent infinite recursion
async function handleReactionChange(payload: ReactionChangePayload): Promise<void> {
  // Guard against infinite recursion
  if (isProcessingReactionChange) {
    console.warn('⚠️ REACTION_CHANGE: Already processing, skipping to prevent recursion');
    return;
  }
  
  isProcessingReactionChange = true;
  try {
    console.log('🔔 REACTION_CHANGE: COMP METHOD - Processing real-time update:', payload);
    
    const { eventType, new: newRecord, old: oldRecord } = payload;
  
    // Fallback: Handle directly if window function not available
    switch (eventType) {
      case 'INSERT':
        console.log('👍 REACTION: COMP METHOD - New reaction added:', newRecord);
        console.log('👍 REACTION: Full payload for INSERT:', payload);
        const addReactionToMessage = (window as Window & { addReactionToMessage?: (reaction: { messageId?: string; message_id?: string; [key: string]: unknown }) => void }).addReactionToMessage;
        if (typeof addReactionToMessage === 'function' && newRecord) {
          // ROOT CAUSE FIX: Pass the full payload so addReactionToMessage can extract messageId correctly
          const insertPayload = {
            ...newRecord,
            // Try multiple paths for message_id
            messageId: newRecord?.message_id || 
                     newRecord?.messageId ||
                     payload.new?.message_id || 
                     payload.new?.messageId ||
                     payload.old?.message_id || 
                     payload.old?.messageId,
            // Also pass payload for fallback extraction
            _payload: payload
          };
          console.log('👍 REACTION: Constructed insertPayload:', insertPayload);
          addReactionToMessage(insertPayload);
        }
        break;
        
      case 'UPDATE':
        console.log('🔄 REACTION: Reaction updated:', newRecord);
        const updateReactionInMessage = (window as Window & { updateReactionInMessage?: (reaction: Record<string, unknown>) => void }).updateReactionInMessage;
        if (typeof updateReactionInMessage === 'function' && newRecord) {
          updateReactionInMessage(newRecord);
        }
        break;
        
      case 'DELETE':
        console.log('👎 REACTION: Reaction removed:', oldRecord);
        console.log('👎 REACTION: Full payload for DELETE:', payload);
        const removeReactionFromMessage = (window as Window & { removeReactionFromMessage?: (reaction: { messageId?: string; message_id?: string; [key: string]: unknown }) => Promise<void> }).removeReactionFromMessage;
        if (typeof removeReactionFromMessage === 'function' && oldRecord) {
          // ROOT CAUSE FIX: Pass the full payload so removeReactionFromMessage can extract messageId correctly
          const deletePayload = {
            ...oldRecord,
            // Try multiple paths for message_id
            messageId: oldRecord?.message_id || 
                     oldRecord?.messageId ||
                     payload.old?.message_id || 
                     payload.old?.messageId ||
                     payload.new?.message_id || 
                     payload.new?.messageId,
            // Also pass payload for fallback extraction
            _payload: payload
          };
          console.log('👎 REACTION: Constructed deletePayload:', deletePayload);
          // ROOT CAUSE FIX: removeReactionFromMessage is now async, await it
          await removeReactionFromMessage(deletePayload);
        }
        break;
        
      default:
        console.log('❓ REACTION: Unknown event type:', eventType);
    }
  } finally {
    // Always reset guard after processing
    isProcessingReactionChange = false;
  }
}

// Handle real-time aura color changes from Supabase
function handleAuraChange(payload: AuraChangePayload): void {
  console.log('🔔 AURA_CHANGE: Processing real-time update:', payload);
  
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  if (eventType === 'UPDATE' && newRecord && oldRecord && newRecord.aura_color !== oldRecord.aura_color) {
    console.log('🎨 AURA: Color changed for user:', newRecord.user_email, 'from', oldRecord.aura_color, 'to', newRecord.aura_color);
    const updateUserAuraInUI = (window as Window & { updateUserAuraInUI?: (email: string, color: string) => void }).updateUserAuraInUI;
    if (updateUserAuraInUI) {
      updateUserAuraInUI(newRecord.user_email, newRecord.aura_color);
    }
  }
}

// Setup Supabase real-time event handlers
function setupSupabaseEventHandlers(): void {
  type SupabaseRealtimeClientType = { onUserJoined?: (user: { user_email: string }) => void; onUserLeft?: (user: { user_email: string }) => void; onUserUpdated?: (user: { user_email: string; aura_color?: string }) => void; onNewMessage?: (message: Message | { user_email?: string; content?: string; [key: string]: unknown }) => Promise<void>; onVisibilityChanged?: (visibility: { user_email: string; is_visible: boolean }) => void };
  const supabaseRealtimeClient = (window as Window & { supabaseRealtimeClient?: SupabaseRealtimeClientType }).supabaseRealtimeClient;
  if (!supabaseRealtimeClient) return;
  
  // Set up event handlers with comprehensive logging
  supabaseRealtimeClient.onUserJoined = (user: { user_email: string }) => {
    console.log('👋 SUPABASE: User joined:', user.user_email);
    console.log('👋 SUPABASE: Triggering visibility refresh...');
    const refreshVisibilityAvatars = (window as Window & { refreshVisibilityAvatars?: () => Promise<void> }).refreshVisibilityAvatars;
    if (refreshVisibilityAvatars) {
      refreshVisibilityAvatars().catch((err: unknown) => console.error('Error refreshing visibility after user joined:', err));
    }
  };
  
  supabaseRealtimeClient.onUserLeft = (user: { user_email: string }) => {
    console.log('👋 SUPABASE: User left:', user.user_email);
    console.log('👋 SUPABASE: Triggering visibility refresh...');
    const refreshVisibilityAvatars = (window as Window & { refreshVisibilityAvatars?: () => Promise<void> }).refreshVisibilityAvatars;
    if (refreshVisibilityAvatars) {
      refreshVisibilityAvatars().catch((err: unknown) => console.error('Error refreshing visibility after user left:', err));
    }
  };
  
  supabaseRealtimeClient.onUserUpdated = (user: { user_email: string; aura_color?: string }) => {
    console.log('🔄 SUPABASE: User updated:', user.user_email);
    console.log('🔄 SUPABASE: Aura color:', user.aura_color);
    // Update aura color if changed
    if (user.aura_color) {
      console.log('🎨 SUPABASE: Updating aura color in UI...');
      const updateUserAuraInUI = (window as Window & { updateUserAuraInUI?: (email: string, color: string) => void }).updateUserAuraInUI;
      if (updateUserAuraInUI) {
        updateUserAuraInUI(user.user_email, user.aura_color);
      }
    }
    // Also refresh visibility to show any other changes
    const refreshVisibilityAvatars = (window as Window & { refreshVisibilityAvatars?: () => Promise<void> }).refreshVisibilityAvatars;
    if (refreshVisibilityAvatars) {
      refreshVisibilityAvatars().catch((err: unknown) => console.error('Error refreshing visibility after user update:', err));
    }
  };
  
  supabaseRealtimeClient.onNewMessage = async (message: Message | { user_email?: string; content?: string; [key: string]: unknown }) => {
    console.log('💬 SUPABASE: New message received:', message);
    const messageWithEmail = message as { user_email?: string; content?: string; [key: string]: unknown };
    console.log('💬 SUPABASE: From:', messageWithEmail.user_email);
    console.log('💬 SUPABASE: Content:', messageWithEmail.content?.substring(0, 50) + '...');
    
    // COMP METHOD: Convert Supabase message format to API format for addMessageToChat
    const convertSupabaseMessageToAPIFormat = (window as Window & { convertSupabaseMessageToAPIFormat?: (message: Message | Record<string, unknown>) => Promise<Message> }).convertSupabaseMessageToAPIFormat;
    if (convertSupabaseMessageToAPIFormat) {
      const convertedMessage = await convertSupabaseMessageToAPIFormat(message);
      console.log('💬 SUPABASE: Converted message:', convertedMessage);
      
      // Add message to chat immediately
      const addMessageToChat = (window as Window & { addMessageToChat?: (message: Message) => Promise<void> }).addMessageToChat;
      if (addMessageToChat) {
        await addMessageToChat(convertedMessage);
      }
    }
    
    // Show notification for new message
    const showNotification = (window as Window & { showNotification?: (message: string, options?: Record<string, unknown>) => void }).showNotification;
    if (showNotification) {
      showNotification(`New message from ${messageWithEmail.user_email || 'unknown'}`);
    }
  };
  
  supabaseRealtimeClient.onVisibilityChanged = (visibility: { user_email: string; is_visible: boolean }) => {
    console.log('👁️ SUPABASE: Visibility changed:', visibility.user_email, visibility.is_visible);
    console.log('👁️ SUPABASE: Triggering visibility refresh...');
    const refreshVisibilityAvatars = (window as Window & { refreshVisibilityAvatars?: () => Promise<void> }).refreshVisibilityAvatars;
    if (refreshVisibilityAvatars) {
      refreshVisibilityAvatars().catch((err: unknown) => console.error('Error refreshing visibility after visibility change:', err));
    }
  };
  
  console.log('✅ SUPABASE: Event handlers configured');
}

// Send a presence event to the server
async function sendPresenceEvent(kind: PresenceEventKind, availability: AvailabilityStatus | null = null, customLabel: string | null = null): Promise<PresenceEventResponse> {
  console.log('🔍 PRESENCE EVENT DEBUG: Starting sendPresenceEvent');
  console.log('🔍 PRESENCE EVENT DEBUG: Kind:', kind);
  console.log('🔍 PRESENCE EVENT DEBUG: Availability:', availability);
  console.log('🔍 PRESENCE EVENT DEBUG: Custom label:', customLabel);
  
  try {
    // COMP METHOD: Try API first, fallback to local storage on error
    return await sendPresenceEventToAPI(kind, availability, customLabel);
  } catch (error) {
    console.log('❌ PRESENCE EVENT: API failed, using local storage fallback');
    return await handlePresenceEventLocally(kind, availability, customLabel);
  }
}

// COMP METHOD: Send presence event to API
async function sendPresenceEventToAPI(kind: PresenceEventKind, availability: AvailabilityStatus | null = null, customLabel: string | null = null): Promise<PresenceEventResponse> {
  console.log('🔧 PRESENCE API: COMP METHOD - Sending presence event to API');
  
  try {
    const currentUrlData = (window as Window & { currentUrlData?: { pageId?: string } }).currentUrlData;
    const currentPageId = (window as Window & { currentPageId?: string }).currentPageId || currentUrlData?.pageId;
    
    if (!currentPageId) {
      console.warn('❌ PRESENCE EVENT: No current pageId for presence event');
      console.log('🔍 PRESENCE EVENT DEBUG: currentPageId is null/undefined');
      return { success: false, error: 'No page ID' };
    }
    
    console.log('🔍 PRESENCE EVENT DEBUG: Current page ID:', currentPageId);
    
    // Get normalized URL data - SAME AS MESSAGES AND VISIBILITY
    const normalizeCurrentUrl = (window as Window & { normalizeCurrentUrl?: () => Promise<any> }).normalizeCurrentUrl;
    if (!normalizeCurrentUrl) {
      throw new Error('normalizeCurrentUrl not available');
    }
    
    const urlData = await normalizeCurrentUrl();
    console.log('🔍 PRESENCE EVENT DEBUG: URL data:', urlData);
    
    const getCurrentUserId = (window as Window & { getCurrentUserId?: () => Promise<string | null> }).getCurrentUserId;
    if (!getCurrentUserId) {
      throw new Error('getCurrentUserId not available');
    }
    
    const userId = await getCurrentUserId();
    console.log('🔍 PRESENCE EVENT DEBUG: User ID:', userId);
    
    const requestBody: PresenceEventRequest = {
      pageId: currentPageId,
      kind,
      availability,
      customLabel,
      pageUrl: urlData.rawUrl || urlData.normalizedUrl || '' // Use the raw URL from urlData
    };
    
    console.log('🔍 PRESENCE EVENT DEBUG: Request body:', requestBody);
    
    const METALAYER_API_URL = (window as Window & { METALAYER_API_URL?: string }).METALAYER_API_URL || 'http://216.238.91.120:3002';
    console.log('🔍 PRESENCE EVENT DEBUG: API URL:', `${METALAYER_API_URL}/v1/presence/event`);
    
    // Derive both UUID and email; backend may accept either for user resolution
    const getCurrentUserEmail = (window as Window & { getCurrentUserEmail?: () => Promise<string | null> }).getCurrentUserEmail;
    const userEmail = getCurrentUserEmail ? (await getCurrentUserEmail()) || (window.currentUser as { email?: string })?.email || null : null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = typeof userId === 'string' && uuidRegex.test(userId);
    
    const response = await fetch(`${METALAYER_API_URL}/v1/presence/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Canonical headers (preferred going forward)
        ...(isUuid ? { 'X-User-Id': userId } : {}),
        ...(userEmail ? { 'X-User-Email': userEmail } : {}),
        // Temporary compatibility aliases (lowercase casing only)
        ...(isUuid ? { 'x-user-id': userId } : {}),
        ...(userEmail ? { 'x-user-email': userEmail } : {})
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('🔍 PRESENCE EVENT DEBUG: Response status:', response.status);
    console.log('🔍 PRESENCE EVENT DEBUG: Response ok:', response.ok);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('🔍 PRESENCE EVENT DEBUG: Response data:', responseData);
      console.log(`PRESENCE: ${kind} event sent successfully`);
      
      // CHROME EXTENSION WEBSOCKET FIX: Send via background service worker
      await sendSupabaseMessage({
        type: 'PRESENCE_UPDATE',
        kind: kind,
        availability: availability || undefined,
        customLabel: customLabel || undefined,
        pageId: currentPageId,
        userId: userId || undefined,
        timestamp: Date.now()
      });
      console.log(`👥 WEBSOCKET: ${kind} event broadcast via background service worker`);
      
      // COMP METHOD: Return success response with status and data
      return { success: true, status: 200, data: responseData };
    } else {
      console.warn(`❌ PRESENCE: Failed to send ${kind} event:`, response.status);
      const errorText = await response.text();
      console.error('❌ PRESENCE: Error response:', errorText);
      console.log('🔍 PRESENCE EVENT DEBUG: Full error details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        requestBody: requestBody
      });
      
      // COMP METHOD: Trigger fallback on any non-200 status
      console.log('🔧 PRESENCE: COMP METHOD - Triggering local storage fallback due to API error');
      throw new Error(`API call failed with status: ${response.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('🔍 PRESENCE EVENT DEBUG: Exception details:', {
      message: errorMessage
    });
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
      console.warn(`⚠️ PRESENCE: Connection refused for ${kind} event - server may be overloaded`);
    } else {
      console.error(`❌ PRESENCE: Error sending ${kind} event:`, error);
    }
    
    // Return error response
    return { success: false, error: errorMessage };
  }
}

// COMP METHOD: Handle presence events locally when API fails
async function handlePresenceEventLocally(kind: PresenceEventKind, availability: AvailabilityStatus | null = null, customLabel: string | null = null): Promise<PresenceEventResponse> {
  console.log('🔧 PRESENCE API: COMP METHOD - Handling presence event locally');
  
  const currentUser = window.currentUser || { email: 'user@example.com' };
  const currentUrlData = (window as Window & { currentUrlData?: { pageId?: string } }).currentUrlData;
  const currentPageId = currentUrlData?.pageId || 'unknown';
  
  // Store presence locally
  const presenceData = {
    userId: (currentUser as { email?: string }).email || 'unknown',
    pageId: currentPageId,
    kind: kind,
    availability: availability,
    customLabel: customLabel,
    timestamp: new Date().toISOString(),
    local: true
  };
  
  // Store in local storage
  chrome.storage.local.set({ 
    [`presence_${currentPageId}_${(currentUser as { email?: string }).email || 'unknown'}`]: presenceData 
  });
  
  console.log('✅ PRESENCE API: COMP METHOD - Presence event stored locally');
  return { success: true, local: true };
}

// COMP METHOD: Ensure presence tracking is properly initialized
async function initializePresenceTracking(): Promise<boolean> {
  console.log('🔧 PRESENCE: Initializing presence tracking...');
  
  if (window.currentUser && (window as Window & { currentUrlData?: { pageId?: string } }).currentUrlData) {
    try {
      console.log('🔧 PRESENCE: Sending initial ENTER event...');
      const result = await sendPresenceEvent('ENTER');
      console.log('✅ PRESENCE: Initial presence event sent:', result);
      
      // Store presence tracking globally
      (window as Window & { presenceTrackingActive?: boolean }).presenceTrackingActive = true;
      
      return true;
    } catch (error) {
      console.error('❌ PRESENCE: Failed to send initial presence event:', error);
      return false;
    }
  } else {
    console.warn('⚠️ PRESENCE: Missing currentUser or currentUrlData');
    return false;
  }
}

// Export for global access
const winWithRealtime = window as Window & { 
  RealtimeManager?: typeof RealtimeManager;
  handlePresenceChange?: typeof handlePresenceChange;
  handleMessageChange?: typeof handleMessageChange;
  handleReactionChange?: typeof handleReactionChange;
  handleAuraChange?: typeof handleAuraChange;
  sendPresenceEvent?: typeof sendPresenceEvent;
  initializePresenceTracking?: typeof initializePresenceTracking;
  sendSupabaseMessage?: typeof sendSupabaseMessage;
  joinPageWithSupabase?: typeof joinPageWithSupabase;
};
winWithRealtime.RealtimeManager = RealtimeManager;
winWithRealtime.handlePresenceChange = handlePresenceChange;
winWithRealtime.handleMessageChange = handleMessageChange;
winWithRealtime.handleReactionChange = handleReactionChange;
winWithRealtime.handleAuraChange = handleAuraChange;
winWithRealtime.sendPresenceEvent = sendPresenceEvent;
winWithRealtime.initializePresenceTracking = initializePresenceTracking;
winWithRealtime.sendSupabaseMessage = sendSupabaseMessage;
winWithRealtime.joinPageWithSupabase = joinPageWithSupabase;

export {
  RealtimeManager,
  handlePresenceChange,
  handleMessageChange,
  handleReactionChange,
  handleAuraChange,
  sendPresenceEvent,
  initializePresenceTracking,
  initializeSupabaseRealtimeClient,
  sendSupabaseMessage,
  joinPageWithSupabase,
  setupSupabaseEventHandlers
};


/**
 * REALTIME MANAGER - Real-time Communication
 * Handles all real-time functionality
 */
import { handleModuleError } from '../utils/ErrorHandlingPolicy.js';
import { Logger } from '../utils/Logger.js';
import { API_CONFIG } from '../core/APIConfig.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
const handleRealtimeError = (error, policy) => {
    return handleModuleError(error, {
        ...policy,
        component: 'RealtimeManager',
        severity: policy.severity ?? 'recoverable'
    });
};
class RealtimeManager {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
        this.userPresenceChannel = null;
        this.availabilityChannel = null;
    }
    /**
     * Initialize RealtimeManager module
     */
    async initialize() {
        if (this.isInitialized) {
            this.log('WARN', 'RealtimeManager already initialized');
            return;
        }
        this.log('INFO', 'Initializing RealtimeManager...');
        try {
            // COMP METHOD: Initialize AurasIntegration if available
            // This integration enables real-time aura color propagation
            const aurasIntegration = window.aurasIntegration;
            if (aurasIntegration && typeof aurasIntegration.initialize === 'function') {
                this.log('INFO', 'Initializing AurasIntegration...');
                try {
                    const initResult = await aurasIntegration.initialize();
                    const initSuccess = initResult === true || initResult === undefined;
                    if (initSuccess) {
                        this.log('INFO', 'AurasIntegration initialized successfully');
                    }
                    else {
                        this.log('WARN', 'AurasIntegration initialization returned false - may work with limited functionality');
                        // COMP METHOD: Don't fail completely - aura can still work via Supabase directly
                    }
                }
                catch (error) {
                    this.log('ERROR', 'AurasIntegration initialization failed:', error);
                    // COMP METHOD: Don't throw - continue initialization - aura can work via Supabase directly
                    this.log('WARN', 'Continuing without AurasIntegration - aura functionality will use Supabase directly');
                }
            }
            else {
                this.log('WARN', 'AurasIntegration not available for initialization');
                this.log('INFO', 'Aura functionality will use Supabase directly');
            }
            // COMP METHOD: Initialize presence tracking
            this.initializePresenceTracking();
            // FIX: Initialize user_presence table subscription for real-time visibility updates
            this.initializeUserPresenceSubscription();
            // 4-STATE STATUS: Initialize availability status real-time subscription (if enabled)
            if (typeof window !== 'undefined' && window.ENABLE_4STATE_STATUS !== false) {
                this.initializeAvailabilitySubscription();
            }
            this.isInitialized = true;
            this.log('INFO', 'RealtimeManager initialized successfully');
        }
        catch (error) {
            this.log('ERROR', 'Failed to initialize RealtimeManager:', error);
            throw error;
        }
    }
    /**
     * COMP METHOD: Initialize presence tracking
     */
    initializePresenceTracking() {
        this.log('INFO', 'COMP METHOD: Initializing presence tracking...');
        // Initialize presence tracking for current page
        const currentUrlData = window.currentUrlData;
        const currentPageId = currentUrlData?.pageId;
        if (currentPageId) {
            this.initializePresence(currentPageId);
        }
        else {
            this.log('WARN', 'COMP METHOD: No page ID available for presence tracking');
        }
    }
    /**
     * COMP METHOD: Initialize presence for a specific page
     */
    initializePresence(pageId) {
        this.log('INFO', `COMP METHOD: Initializing presence for page ${pageId}`);
        // Initialize presence tracking using COMP method
        const supabase = window.supabase;
        if (supabase) {
            // Subscribe to presence changes - now properly typed
            const presenceChannel = supabase.channel(`presence:${pageId}`);
            presenceChannel
                .on('presence', { event: 'sync' }, () => {
                this.log('INFO', 'COMP METHOD: Presence sync event received');
                this.updatePresenceDisplay();
            })
                .on('presence', { event: 'join' }, (payload) => {
                const p = payload;
                this.log('INFO', 'COMP METHOD: User joined presence:', p?.key);
                this.updatePresenceDisplay();
            })
                .on('presence', { event: 'leave' }, (payload) => {
                const p = payload;
                this.log('INFO', 'COMP METHOD: User left presence:', p?.key);
                this.updatePresenceDisplay();
            });
            presenceChannel.subscribe(() => { });
            // Track current user's presence
            this.trackUserPresence(pageId);
        }
        else {
            this.log('WARN', 'COMP METHOD: Supabase not available for presence tracking');
        }
    }
    /**
     * COMP METHOD: Track current user's presence
     */
    trackUserPresence(pageId) {
        this.log('INFO', `COMP METHOD: Tracking user presence for page ${pageId}`);
        const currentUser = window.currentUser;
        const supabase = window.supabase;
        if (currentUser && supabase) {
            const presenceChannel = supabase.channel(`presence:${pageId}`);
            // Now properly typed - no need for as unknown
            presenceChannel
                .on('presence', { event: 'sync' }, () => {
                if (presenceChannel.presenceState) {
                    const state = presenceChannel.presenceState();
                    this.log('INFO', 'COMP METHOD: Current presence state:', state);
                }
            });
            presenceChannel.subscribe(async (status) => {
                try {
                    if (status === 'SUBSCRIBED' && presenceChannel.track) {
                        await presenceChannel.track({
                            userId: currentUser.id || currentUser.user_id,
                            userName: currentUser.name,
                            userAvatar: currentUser.avatar,
                            onlineAt: new Date().toISOString(),
                            pageId: pageId
                        });
                        this.log('INFO', 'COMP METHOD: User presence tracked successfully');
                    }
                }
                catch (error) {
                    handleRealtimeError(error, {
                        operation: 'presenceTrack',
                        severity: 'recoverable',
                        context: {
                            pageId
                        }
                    });
                }
            });
        }
    }
    /**
     * COMP METHOD: Update presence display
     */
    updatePresenceDisplay() {
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
            }
            else {
                visibleTab.innerHTML = '<div class="no-users">No active users on this page</div>';
            }
        }
    }
    /**
     * COMP METHOD: Get active users
     */
    getActiveUsers() {
        // This would be implemented based on the actual presence system
        // For now, return empty array - this should be connected to the actual presence data
        return [];
    }
    /**
     * Logging utility
     */
    log(level, message, ...args) {
        if (this.logLevel === 'SILENT')
            return;
        const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, SILENT: -1 };
        if (levels[level] <= levels[this.logLevel]) {
            Logger.debug(`[RealtimeManager] [${level}] ${message}`, args.length > 0 ? args : null, 'realtime');
        }
    }
    /**
     * FIX: Initialize real-time subscription for user_presence table changes
     * This ensures visibility updates when users join/leave pages
     */
    initializeUserPresenceSubscription() {
        this.log('INFO', '🔔 PRESENCE: Initializing user_presence subscription...');
        const supabase = window.supabase;
        if (!supabase) {
            this.log('WARN', '⚠️ PRESENCE: Supabase not available for user_presence subscription');
            return;
        }
        try {
            // Subscribe to user_presence table changes (INSERT, UPDATE, DELETE)
            // Now properly typed - no need for as unknown
            const presenceChannel = supabase.channel('user-presence-changes');
            presenceChannel
                .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'user_presence'
            }, (payload) => {
                const p = payload;
                this.log('INFO', '🔔 PRESENCE: user_presence INSERT detected:', p);
                handlePresenceChange({
                    eventType: 'INSERT',
                    new: p.new,
                    old: null
                });
            })
                .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'user_presence'
            }, (payload) => {
                const p = payload;
                this.log('INFO', '🔔 PRESENCE: user_presence UPDATE detected:', p);
                handlePresenceChange({
                    eventType: 'UPDATE',
                    new: p.new,
                    old: p.old
                });
            })
                .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'user_presence'
            }, (payload) => {
                const p = payload;
                this.log('INFO', '🔔 PRESENCE: user_presence DELETE detected:', p);
                handlePresenceChange({
                    eventType: 'DELETE',
                    new: null,
                    old: p.old
                });
            });
            presenceChannel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    this.log('INFO', '✅ PRESENCE: user_presence subscription active (all events)');
                }
                else if (status === 'CHANNEL_ERROR') {
                    this.log('ERROR', '❌ PRESENCE: user_presence subscription error');
                }
            });
            // Store channel reference for cleanup
            this.userPresenceChannel = presenceChannel;
        }
        catch (error) {
            this.log('ERROR', '❌ PRESENCE: Failed to initialize user_presence subscription:', error);
        }
    }
    /**
     * 4-STATE STATUS: Initialize real-time subscription for availability changes
     */
    initializeAvailabilitySubscription() {
        this.log('INFO', '🎯 STATUS: Initializing availability subscription...');
        const supabase = window.supabase;
        if (!supabase) {
            this.log('WARN', '⚠️ STATUS: Supabase not available for availability subscription');
            return;
        }
        try {
            // Subscribe to PresenceEvent table changes for AVAILABILITY events
            // Now properly typed - no need for as unknown
            const availabilityChannel = supabase.channel('availability-changes');
            availabilityChannel
                .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'PresenceEvent',
                filter: 'kind=eq.AVAILABILITY'
            }, (payload) => {
                const p = payload;
                this.log('INFO', '🎯 STATUS: Availability change detected:', p);
                this.handleAvailabilityChange(p);
            });
            availabilityChannel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    this.log('INFO', '✅ STATUS: Availability subscription active');
                }
                else if (status === 'CHANNEL_ERROR') {
                    this.log('ERROR', '❌ STATUS: Availability subscription error');
                }
            });
            // Store channel reference for cleanup
            this.availabilityChannel = availabilityChannel;
        }
        catch (error) {
            this.log('ERROR', '❌ STATUS: Failed to initialize availability subscription:', error);
        }
    }
    /**
     * 4-STATE STATUS: Handle availability change event
     */
    handleAvailabilityChange(payload) {
        try {
            const { new: newEvent } = payload;
            const { userId, availability } = newEvent;
            this.log('INFO', `🎯 STATUS: User ${userId} changed availability to ${availability}`);
            // Update all status dots for this user in the DOM
            this.updateUserStatusDots(userId, availability);
            // Update visibility data if available
            const currentVisibilityDataUnfiltered = window.currentVisibilityDataUnfiltered;
            if (currentVisibilityDataUnfiltered && currentVisibilityDataUnfiltered.active) {
                const user = currentVisibilityDataUnfiltered.active.find((u) => u.userId === userId || u.id === userId);
                if (user) {
                    user.availability = availability;
                    this.log('INFO', `✅ STATUS: Updated visibility data for user ${userId}`);
                }
            }
            // Trigger custom event for other modules
            window.dispatchEvent(new CustomEvent('availabilityChanged', {
                detail: { userId, availability }
            }));
        }
        catch (error) {
            this.log('ERROR', '❌ STATUS: Error handling availability change:', error);
        }
    }
    /**
     * 4-STATE STATUS: Update all status dots for a user in the DOM
     */
    updateUserStatusDots(userId, availability) {
        try {
            // Find all status dots for this user
            const statusDots = document.querySelectorAll(`.status-dot[data-user-id="${userId}"]`);
            if (statusDots.length === 0) {
                this.log('INFO', `ℹ️ STATUS: No status dots found for user ${userId}`);
                return;
            }
            // Get new color using StatusDotHelper if available
            let newColor = null;
            const statusDotHelper = window.StatusDotHelper;
            if (statusDotHelper) {
                const mockUser = { availability, isActive: true };
                newColor = statusDotHelper.getStatusDotColor(mockUser);
            }
            else {
                // Fallback color map
                const colorMap = {
                    'AVAILABLE': '#22c55e', // Green
                    'BUSY': '#eab308', // Yellow
                    'AWAY': '#ef4444', // Red
                    'OFFLINE': '#9ca3af' // Gray
                };
                newColor = colorMap[availability] || '#22c55e';
            }
            // Update all status dots
            statusDots.forEach(dot => {
                dot.style.backgroundColor = newColor || '#22c55e';
                dot.setAttribute('data-availability', availability);
                dot.setAttribute('title', availability);
                this.log('INFO', `✅ STATUS: Updated status dot for user ${userId} to ${availability} (${newColor})`);
            });
        }
        catch (error) {
            this.log('ERROR', '❌ STATUS: Error updating status dots:', error);
        }
    }
    /**
     * Cleanup subscriptions
     */
    cleanup() {
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
async function initializeSupabaseRealtimeClient() {
    try {
        Logger.debug('🚀 SUPABASE: Starting comprehensive real-time client initialization...', null, 'realtime');
        const winRealtime = window;
        Logger.debug('🚀 SUPABASE: Current window.supabaseRealtimeClient status:', { status: typeof winRealtime.supabaseRealtimeClient }, 'realtime');
        // TypeScript migration: Use supabaseServiceInstance instead of window.supabase
        Logger.debug('🚀 SUPABASE: Initializing via SupabaseService...', null, 'realtime');
        // Wait for Supabase service to initialize
        const waitForSupabase = async () => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            while (attempts < maxAttempts) {
                attempts++;
                Logger.debug(`🔍 SUPABASE CHECK: Attempt ${attempts}/${maxAttempts}`, null, 'realtime');
                try {
                    // TypeScript migration: Use supabaseServiceInstance.getClient() instead of window.supabase
                    const supabase = supabaseServiceInstance.getClient();
                    if (supabase && typeof supabase.from === 'function') {
                        Logger.debug('✅ SUPABASE CLIENT: Loaded and initialized successfully', null, 'realtime');
                        Logger.debug('✅ SUPABASE CLIENT: Available methods:', { methods: Object.keys(supabase).slice(0, 10) }, 'realtime');
                        Logger.debug('✅ SUPABASE CLIENT: Client ready for real-time operations', null, 'realtime');
                        return supabase;
                    }
                }
                catch (error) {
                    Logger.debug(`⏳ SUPABASE SERVICE: Not ready yet (attempt ${attempts}/${maxAttempts})`, null, 'realtime');
                }
                if (attempts >= maxAttempts) {
                    Logger.error('❌ SUPABASE LIBRARY: Failed to load after 5 seconds', null, 'realtime');
                    Logger.error('❌ SUPABASE LIBRARY: This is a CRITICAL FAILURE - real-time will not work', null, 'realtime');
                    return null;
                }
                if (attempts % 10 === 0) {
                    Logger.debug(`⏳ SUPABASE LIBRARY: Waiting... (attempt ${attempts}/${maxAttempts})`, null, 'realtime');
                }
                // Wait 100ms before next attempt
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return null;
        };
        // Wait for service to initialize
        const supabase = await waitForSupabase();
        if (!supabase) {
            Logger.error('❌ SUPABASE: Cannot initialize without Supabase service', null, 'realtime');
            return;
        }
        Logger.debug('🚀 SUPABASE: Initializing Supabase real-time client...', null, 'realtime');
        if (supabase && supabase.realtime) {
            Logger.debug('✅ SUPABASE_DEBUG: window.supabase.realtime found, using COMP approach...', 'realtime');
            const winWithClient = window;
            const SupabaseRealtimeClient = winWithClient.SupabaseRealtimeClient;
            if (typeof SupabaseRealtimeClient !== 'undefined') {
                Logger.debug('✅ SUPABASE_DEBUG: SupabaseRealtimeClient class found, creating instance...', 'realtime');
                const instance = new SupabaseRealtimeClient();
                Object.assign(winWithClient, { supabaseRealtimeClient: instance });
                Logger.debug('✅ SUPABASE_DEBUG: Instance created:', !!winWithClient.supabaseRealtimeClient, 'realtime');
                // Initialize with Supabase client
                if (winWithClient.supabaseRealtimeClient && typeof winWithClient.supabaseRealtimeClient.initialize === 'function') {
                    const success = await winWithClient.supabaseRealtimeClient.initialize(supabase);
                    Logger.debug('✅ SUPABASE_DEBUG: Initialize result:', success, 'realtime');
                }
            }
            else {
                Logger.debug('❌ SUPABASE_DEBUG: SupabaseRealtimeClient class not available, using fallback', 'realtime');
                Object.assign(winWithClient, { supabaseRealtimeClient: supabase });
            }
            Logger.debug('✅ SUPABASE_DEBUG: Using SupabaseRealtimeClient instance', null, 'realtime');
            // TypeScript migration: Real-time is available through SupabaseService
            Logger.debug('✅ SUPABASE: Real-time client initialized successfully (service approach)', null, 'realtime');
            Logger.debug('✅ SUPABASE: Supabase client:', supabase, 'realtime');
            Logger.debug('✅ SUPABASE: Realtime available:', !!supabase.realtime, 'realtime');
            // CRITICAL FIX: Ensure real-time client is properly connected
            Logger.debug('🔧 SUPABASE: Ensuring real-time connection...', null, 'realtime');
            if (winWithClient.supabaseRealtimeClient) {
                winWithClient.supabaseRealtimeClient.isConnected = true;
            }
            // Setup event handlers
            setupSupabaseEventHandlers();
            // CRITICAL FIX: Test the connection immediately
            Logger.debug('🔧 SUPABASE: Testing real-time connection...', null, 'realtime');
            try {
                const supabaseQuery = supabase;
                const testResult = await supabaseQuery.from('user_presence').select('count').limit(1);
                Logger.debug('✅ SUPABASE: Connection test successful:', testResult, 'realtime');
            }
            catch (testError) {
                handleRealtimeError(testError, {
                    operation: 'testSupabaseConnection',
                    severity: 'recoverable'
                });
            }
        }
        else {
            Logger.error('❌ SUPABASE: Supabase client realtime not available', null, 'realtime');
            Logger.error('❌ SUPABASE: Supabase client:', supabase ? 'exists but no realtime' : 'null', 'realtime');
        }
    }
    catch (error) {
        handleRealtimeError(error, {
            operation: 'initializeSupabaseRealtimeClient',
            severity: 'fatal'
        });
    }
}
// Expose function globally
window.initializeSupabaseRealtimeClient = initializeSupabaseRealtimeClient;
async function sendSupabaseMessage(message) {
    const timer = Date.now();
    Logger.debug('supabase_send', { messageType: message.type, timestamp: timer }, 'realtime');
    try {
        // COMP METHOD: Auras integration is optional for aura messages - can use Supabase directly
        const aurasIntegration = window.aurasIntegration;
        const isAuraMessage = message.type === 'AURA_COLOR_CHANGED';
        const isPresenceMessage = message.type === 'PRESENCE_UPDATE';
        if (!isPresenceMessage && !isAuraMessage && (!aurasIntegration || !aurasIntegration.isInitialized)) {
            Logger.error('❌ SUPABASE: Auras integration not initialized and message type requires it:', message.type, 'realtime');
            return false;
        }
        if (isAuraMessage && (!aurasIntegration || !aurasIntegration.isInitialized)) {
            Logger.warn('⚠️ SUPABASE: Auras integration not initialized, using direct Supabase approach for aura change', 'realtime');
            // Continue with message - aura can work via Supabase directly
        }
        Logger.debug('Sending message via Supabase real-time', {
            type: message.type,
            hasContent: !!message.content,
            hasUserId: !!(message.userId || message.user_id),
            hasAuraColor: !!message.auraColor,
            timestamp: message.timestamp
        });
        Logger.debug('supabase_send', 'Preparing Supabase real-time message', 'realtime');
        const supabaseRealtimeClient = window.supabaseRealtimeClient;
        if (!supabaseRealtimeClient) {
            Logger.error('❌ SUPABASE: supabaseRealtimeClient not available', null, 'realtime');
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
                    success = await supabaseRealtimeClient.updatePresence(message.pageId || '', message.pageUrl || message.url || '', message.auraColor || '');
                }
                break;
            case 'VISIBILITY_UPDATE':
                if (supabaseRealtimeClient.setUserVisibility) {
                    success = await supabaseRealtimeClient.setUserVisibility(message.isVisible !== undefined ? message.isVisible : (message.is_visible || false), message.pageUrl || message.url || '');
                }
                break;
            default:
                Logger.warn('❓ SUPABASE: Unknown message type:', message.type, 'realtime');
                return false;
        }
        Logger.debug('supabase_send', 'Received response from Supabase', 'realtime');
        if (success) {
            Logger.debug('Message sent successfully via Supabase', {
                messageType: message.type,
                responseTime: Date.now() - timer
            }, 'realtime');
            Logger.debug('supabase_send', { success }, 'realtime');
            return true;
        }
        else {
            Logger.error('Failed to send message via Supabase', {
                messageType: message.type,
                responseTime: Date.now() - timer
            }, 'realtime');
            Logger.debug('supabase_send', { success }, 'realtime');
            return false;
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.error('Error sending message via Supabase', {
            messageType: message.type,
            error: errorMessage,
            responseTime: Date.now() - timer
        }, 'realtime');
        Logger.debug('supabase_send', { error: errorMessage }, 'realtime');
        return false;
    }
}
async function joinPageWithSupabase(pageId, pageUrl) {
    Logger.debug('🌐 SUPABASE: Starting page join process...', null, 'realtime');
    Logger.debug('🌐 SUPABASE: Page ID:', pageId, 'realtime');
    Logger.debug('🌐 SUPABASE: Page URL:', pageUrl, 'realtime');
    const client = window.supabaseRealtimeClient;
    Logger.debug('🌐 SUPABASE: Client available:', !!client, 'realtime');
    if (client) {
        try {
            const getCurrentUserId = window.getCurrentUserId;
            if (!getCurrentUserId) {
                throw new Error('getCurrentUserId not available');
            }
            const userId = await getCurrentUserId();
            Logger.debug('🌐 SUPABASE: User ID:', userId, 'realtime');
            if (client.setCurrentUser) {
                await client.setCurrentUser(userId);
                Logger.debug('✅ SUPABASE: User set successfully', null, 'realtime');
            }
            if (client.joinPage) {
                await client.joinPage(pageId, pageUrl);
                Logger.debug('✅ SUPABASE: Joined page with real-time updates', null, 'realtime');
                Logger.debug('✅ SUPABASE: Real-time subscriptions should now be active', null, 'realtime');
            }
        }
        catch (error) {
            handleRealtimeError(error, {
                operation: 'joinPage',
                severity: 'recoverable',
                context: {
                    pageId,
                    pageUrl
                }
            });
        }
    }
    else {
        Logger.error('❌ SUPABASE: No real-time client available for page join', null, 'realtime');
        Logger.error('❌ SUPABASE: Real-time features will not work', null, 'realtime');
    }
}
// Handle real-time presence changes from Supabase
async function handlePresenceChange(payload) {
    try {
        Logger.debug('🔔 PRESENCE_CHANGE: Processing real-time update:', payload, 'realtime');
        const { eventType, new: newRecord, old: oldRecord } = payload;
        // ROOT CAUSE FIX: Declare currentPageId at function scope to avoid ReferenceError
        // COMP METHOD: Get current page ID once at the start for all cases
        const currentUrlData = window.currentUrlData;
        const currentPageId = currentUrlData?.pageId;
        // ROOT CAUSE FIX: Always refresh visibility after any presence change
        // This ensures users see updates when others move pages
        let shouldRefresh = false;
        switch (eventType) {
            case 'INSERT':
                Logger.debug('👋 PRESENCE: User joined:', newRecord, 'realtime');
                // COMP METHOD: Check if this user is on the current page
                if (newRecord?.page_id === currentPageId || newRecord?.pageId === currentPageId) {
                    Logger.debug('✅ PRESENCE_CHANGE: User joined current page, refreshing visibility', 'realtime');
                    shouldRefresh = true;
                }
                break;
            case 'UPDATE':
                Logger.debug('🔄 PRESENCE: User updated:', newRecord, 'realtime');
                // COMP METHOD: Refresh if user updated on current page or left current page
                const updatedPageId = newRecord?.page_id || newRecord?.pageId;
                const oldPageId = oldRecord?.page_id || oldRecord?.pageId;
                if (updatedPageId === currentPageId || oldPageId === currentPageId) {
                    Logger.debug('✅ PRESENCE_CHANGE: User page changed, refreshing visibility', 'realtime');
                    shouldRefresh = true;
                }
                break;
            case 'DELETE':
                Logger.debug('👋 PRESENCE: User left:', oldRecord, 'realtime');
                // COMP METHOD: Refresh if user left current page
                if (oldRecord?.page_id === currentPageId || oldRecord?.pageId === currentPageId) {
                    Logger.debug('✅ PRESENCE_CHANGE: User left current page, refreshing visibility', 'realtime');
                    shouldRefresh = true;
                }
                break;
            default:
                Logger.debug('❓ PRESENCE: Unknown event type:', eventType, 'realtime');
        }
        // ROOT CAUSE FIX: Refresh visibility UI when presence changes affect current page
        const refreshVisibilityAvatars = window.refreshVisibilityAvatars;
        if (shouldRefresh && typeof refreshVisibilityAvatars === 'function') {
            Logger.debug('🔄 PRESENCE_CHANGE: Calling refreshVisibilityAvatars() to update UI', null, 'realtime');
            // Use setTimeout to debounce rapid updates
            const timeoutKey = 'presenceChangeRefreshTimeout';
            const winWithTimeout = window;
            const existingTimeout = winWithTimeout[timeoutKey];
            if (existingTimeout !== undefined) {
                clearTimeout(existingTimeout);
            }
            winWithTimeout[timeoutKey] = setTimeout(async () => {
                try {
                    await refreshVisibilityAvatars();
                }
                catch (error) {
                    handleRealtimeError(error, {
                        operation: 'refreshVisibilityAvatars',
                        severity: 'recoverable'
                    });
                }
            }, 500); // 500ms debounce
        }
    }
    catch (error) {
        handleRealtimeError(error, {
            operation: 'handlePresenceChange',
            severity: 'recoverable'
        });
    }
}
// Handle real-time message changes from Supabase
function handleMessageChange(payload) {
    Logger.debug('🔔 MESSAGE_CHANGE: Processing real-time update:', payload, 'realtime');
    const { eventType, new: newRecord, old: oldRecord } = payload;
    switch (eventType) {
        case 'INSERT':
            Logger.debug('💬 MESSAGE: New message received:', newRecord, 'realtime');
            // Dispatch realtime-message event for MessageStore
            // MessageStore listens for this event and will update the UI via onMessageUpdate
            if (typeof window !== 'undefined' && newRecord) {
                const realtimeEvent = new CustomEvent('realtime-message', {
                    detail: newRecord
                });
                window.dispatchEvent(realtimeEvent);
                Logger.debug('💬 MESSAGE: Dispatched realtime-message event for MessageStore', null, 'realtime');
            }
            break;
        case 'UPDATE':
            Logger.debug('🔄 MESSAGE: Message updated:', newRecord, 'realtime');
            const updateMessageInChat = window.updateMessageInChat;
            if (updateMessageInChat && newRecord) {
                // Type assertion: newRecord from Supabase may need conversion to Message type
                updateMessageInChat(newRecord);
            }
            break;
        case 'DELETE':
            Logger.debug('🗑️ MESSAGE: Message deleted:', oldRecord, 'realtime');
            const removeMessageFromChat = window.removeMessageFromChat;
            if (removeMessageFromChat && oldRecord) {
                const messageId = typeof oldRecord === 'string' ? oldRecord : (oldRecord.id || oldRecord.messageId || String(oldRecord));
                removeMessageFromChat(messageId);
            }
            break;
        default:
            Logger.debug('❓ MESSAGE: Unknown event type:', eventType, 'realtime');
    }
}
// Handle real-time reaction changes from Supabase - COMP METHOD
let isProcessingReactionChange = false; // Guard to prevent infinite recursion
async function handleReactionChange(payload) {
    // Guard against infinite recursion
    if (isProcessingReactionChange) {
        Logger.warn('⚠️ REACTION_CHANGE: Already processing, skipping to prevent recursion', 'realtime');
        return;
    }
    isProcessingReactionChange = true;
    try {
        Logger.debug('🔔 REACTION_CHANGE: COMP METHOD - Processing real-time update:', payload, 'realtime');
        const { eventType, new: newRecord, old: oldRecord } = payload;
        // Fallback: Handle directly if window function not available
        switch (eventType) {
            case 'INSERT':
                Logger.debug('👍 REACTION: COMP METHOD - New reaction added:', newRecord, 'realtime');
                Logger.debug('👍 REACTION: Full payload for INSERT:', payload, 'realtime');
                const addReactionToMessage = window.addReactionToMessage;
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
                    Logger.debug('👍 REACTION: Constructed insertPayload:', insertPayload, 'realtime');
                    addReactionToMessage(insertPayload);
                }
                break;
            case 'UPDATE':
                Logger.debug('🔄 REACTION: Reaction updated:', newRecord, 'realtime');
                const updateReactionInMessage = window.updateReactionInMessage;
                if (typeof updateReactionInMessage === 'function' && newRecord) {
                    updateReactionInMessage(newRecord);
                }
                break;
            case 'DELETE':
                Logger.debug('👎 REACTION: Reaction removed:', oldRecord, 'realtime');
                Logger.debug('👎 REACTION: Full payload for DELETE:', payload, 'realtime');
                const removeReactionFromMessage = window.removeReactionFromMessage;
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
                    Logger.debug('👎 REACTION: Constructed deletePayload:', deletePayload, 'realtime');
                    // ROOT CAUSE FIX: removeReactionFromMessage is now async, await it
                    await removeReactionFromMessage(deletePayload);
                }
                break;
            default:
                Logger.debug('❓ REACTION: Unknown event type:', eventType, 'realtime');
        }
    }
    finally {
        // Always reset guard after processing
        isProcessingReactionChange = false;
    }
}
// Handle real-time aura color changes from Supabase
function handleAuraChange(payload) {
    Logger.debug('🔔 AURA_CHANGE: Processing real-time update:', payload, 'realtime');
    const { eventType, new: newRecord, old: oldRecord } = payload;
    if (eventType === 'UPDATE' && newRecord && oldRecord && newRecord.aura_color !== oldRecord.aura_color) {
        Logger.debug('🎨 AURA: Color changed for user', {
            userEmail: newRecord.user_email,
            previousColor: oldRecord?.aura_color,
            newColor: newRecord?.aura_color
        }, 'realtime');
        const updateUserAuraInUI = window.updateUserAuraInUI;
        if (updateUserAuraInUI && newRecord.user_email && newRecord.aura_color) {
            updateUserAuraInUI(newRecord.user_email, newRecord.aura_color);
        }
    }
}
// Setup Supabase real-time event handlers
function setupSupabaseEventHandlers() {
    const supabaseRealtimeClient = window.supabaseRealtimeClient;
    if (!supabaseRealtimeClient)
        return;
    // Set up event handlers with comprehensive logging
    supabaseRealtimeClient.onUserJoined = (user) => {
        Logger.debug('👋 SUPABASE: User joined:', user.user_email, 'realtime');
        Logger.debug('👋 SUPABASE: Triggering visibility refresh...', null, 'realtime');
        const refreshVisibilityAvatars = window.refreshVisibilityAvatars;
        if (refreshVisibilityAvatars) {
            refreshVisibilityAvatars().catch((err) => Logger.error('Error refreshing visibility after user joined:', err, 'realtime'));
        }
    };
    supabaseRealtimeClient.onUserLeft = (user) => {
        Logger.debug('👋 SUPABASE: User left:', user.user_email, 'realtime');
        Logger.debug('👋 SUPABASE: Triggering visibility refresh...', null, 'realtime');
        const refreshVisibilityAvatars = window.refreshVisibilityAvatars;
        if (refreshVisibilityAvatars) {
            refreshVisibilityAvatars().catch((err) => Logger.error('Error refreshing visibility after user left:', err, 'realtime'));
        }
    };
    supabaseRealtimeClient.onUserUpdated = (user) => {
        Logger.debug('🔄 SUPABASE: User updated:', user.user_email, 'realtime');
        Logger.debug('🔄 SUPABASE: Aura color:', user.aura_color, 'realtime');
        // Update aura color if changed
        if (user.aura_color) {
            Logger.debug('🎨 SUPABASE: Updating aura color in UI...', null, 'realtime');
            const updateUserAuraInUI = window.updateUserAuraInUI;
            if (updateUserAuraInUI) {
                updateUserAuraInUI(user.user_email, user.aura_color);
            }
        }
        // Also refresh visibility to show any other changes
        const refreshVisibilityAvatars = window.refreshVisibilityAvatars;
        if (refreshVisibilityAvatars) {
            refreshVisibilityAvatars().catch((err) => Logger.error('Error refreshing visibility after user update:', err, 'realtime'));
        }
    };
    supabaseRealtimeClient.onNewMessage = async (message) => {
        Logger.debug('💬 SUPABASE: New message received:', message, 'realtime');
        const messageWithEmail = message;
        Logger.debug('💬 SUPABASE: From:', messageWithEmail.user_email, 'realtime');
        Logger.debug('💬 SUPABASE: Content', (messageWithEmail.content?.substring(0, 50) || '') + '...', 'realtime');
        // Dispatch realtime-message event for MessageStore
        // MessageStore listens for this event and will update the UI via onMessageUpdate
        if (typeof window !== 'undefined') {
            const realtimeEvent = new CustomEvent('realtime-message', {
                detail: message
            });
            window.dispatchEvent(realtimeEvent);
            Logger.debug('💬 SUPABASE: Dispatched realtime-message event for MessageStore', null, 'realtime');
        }
        // Show notification for new message
        const showNotification = window.showNotification;
        if (showNotification) {
            showNotification(`New message from ${messageWithEmail.user_email || 'unknown'}`);
        }
    };
    supabaseRealtimeClient.onVisibilityChanged = (visibility) => {
        Logger.debug('👁️ SUPABASE: Visibility changed', {
            userEmail: visibility.user_email,
            isVisible: visibility.is_visible
        }, 'realtime');
        Logger.debug('👁️ SUPABASE: Triggering visibility refresh...', null, 'realtime');
        const refreshVisibilityAvatars = window.refreshVisibilityAvatars;
        if (refreshVisibilityAvatars) {
            refreshVisibilityAvatars().catch((err) => Logger.error('Error refreshing visibility after visibility change:', err, 'realtime'));
        }
    };
    Logger.debug('✅ SUPABASE: Event handlers configured', null, 'realtime');
}
// Send a presence event to the server
async function sendPresenceEvent(kind, availability = null, customLabel = null) {
    Logger.debug('🔍 PRESENCE EVENT DEBUG: Starting sendPresenceEvent', null, 'realtime');
    Logger.debug('🔍 PRESENCE EVENT DEBUG: Kind:', kind, 'realtime');
    Logger.debug('🔍 PRESENCE EVENT DEBUG: Availability:', availability, 'realtime');
    Logger.debug('🔍 PRESENCE EVENT DEBUG: Custom label:', customLabel, 'realtime');
    try {
        // COMP METHOD: Try API first, fallback to local storage on error
        return await sendPresenceEventToAPI(kind, availability, customLabel);
    }
    catch (error) {
        Logger.debug('❌ PRESENCE EVENT: API failed, using local storage fallback', 'realtime');
        return await handlePresenceEventLocally(kind, availability, customLabel);
    }
}
// COMP METHOD: Send presence event to API
async function sendPresenceEventToAPI(kind, availability = null, customLabel = null) {
    Logger.debug('🔧 PRESENCE API: COMP METHOD - Sending presence event to API', null, 'realtime');
    try {
        const currentUrlData = window.currentUrlData;
        const currentPageId = window.currentPageId || currentUrlData?.pageId;
        if (!currentPageId) {
            Logger.warn('❌ PRESENCE EVENT: No current pageId for presence event', null, 'realtime');
            Logger.debug('🔍 PRESENCE EVENT DEBUG: currentPageId is null/undefined', null, 'realtime');
            return { success: false, error: 'No page ID' };
        }
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Current page ID:', currentPageId, 'realtime');
        // Get normalized URL data - SAME AS MESSAGES AND VISIBILITY
        const normalizeCurrentUrl = window.normalizeCurrentUrl;
        if (!normalizeCurrentUrl) {
            throw new Error('normalizeCurrentUrl not available');
        }
        const urlData = await normalizeCurrentUrl();
        Logger.debug('🔍 PRESENCE EVENT DEBUG: URL data:', urlData, 'realtime');
        const getCurrentUserId = window.getCurrentUserId;
        if (!getCurrentUserId) {
            throw new Error('getCurrentUserId not available');
        }
        const userId = await getCurrentUserId();
        Logger.debug('🔍 PRESENCE EVENT DEBUG: User ID:', userId, 'realtime');
        const pageUrl = urlData.rawUrl ??
            urlData.normalizedUrl ??
            '';
        const requestBody = {
            pageId: currentPageId,
            kind,
            availability,
            customLabel,
            pageUrl
        };
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Request body:', requestBody, 'realtime');
        const apiBaseUrl = window.API_BASE_URL || API_CONFIG.baseUrl;
        Logger.debug('🔍 PRESENCE EVENT DEBUG: API URL:', `${apiBaseUrl}/v1/presence/event`, 'realtime');
        // Derive both UUID and email; backend may accept either for user resolution
        const getCurrentUserEmail = window.getCurrentUserEmail;
        // Email derivation kept for potential future use but not currently used
        void (getCurrentUserEmail ? (await getCurrentUserEmail()) || window.currentUser?.email || null : null);
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUuid = typeof userId === 'string' && uuidRegex.test(userId);
        const response = await fetch(`${apiBaseUrl}/v1/presence/event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // UUID ONLY - no email headers
                ...(isUuid ? { 'X-User-Id': userId, 'x-user-id': userId } : {})
            },
            body: JSON.stringify(requestBody)
        });
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Response status:', response.status, 'realtime');
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Response ok:', response.ok, 'realtime');
        if (response.ok) {
            const responseData = await response.json();
            Logger.debug('🔍 PRESENCE EVENT DEBUG: Response data:', responseData, 'realtime');
            Logger.debug(`PRESENCE: ${kind} event sent successfully`, null, 'realtime');
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
            Logger.debug(`👥 WEBSOCKET: ${kind} event broadcast via background service worker`, null, 'realtime');
            // COMP METHOD: Return success response with status and data
            return { success: true, status: 200, data: responseData };
        }
        else {
            Logger.warn(`❌ PRESENCE: Failed to send ${kind} event:`, response.status, 'realtime');
            const errorText = await response.text();
            Logger.error('❌ PRESENCE: Error response:', errorText, 'realtime');
            Logger.debug('🔍 PRESENCE EVENT DEBUG: Full error details', {
                status: response.status,
                statusText: response.statusText,
                errorText: errorText,
                requestBody: requestBody
            }, 'realtime');
            // COMP METHOD: Trigger fallback on any non-200 status
            Logger.debug('🔧 PRESENCE: COMP METHOD - Triggering local storage fallback due to API error', null, 'realtime');
            throw new Error(`API call failed with status: ${response.status}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Exception details:', {
            message: errorMessage
        }, 'realtime');
        const logLevel = (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_REFUSED'))
            ? 'warn'
            : 'error';
        handleRealtimeError(error, {
            operation: 'sendPresenceEvent',
            severity: 'recoverable',
            logLevel,
            context: {
                errorMessage
            }
        });
        // Return error response
        return { success: false, error: errorMessage };
    }
}
// COMP METHOD: Handle presence events locally when API fails
async function handlePresenceEventLocally(kind, availability = null, customLabel = null) {
    Logger.debug('🔧 PRESENCE API: COMP METHOD - Handling presence event locally', null, 'realtime');
    // UUID ONLY - get currentUser from stateManager
    const currentUser = stateManagerInstance?.getState?.('currentUser');
    if (!currentUser || !currentUser.id) {
        Logger.warn('⚠️ REALTIME: No valid user UUID for presence', null, 'realtime');
        return { success: false, error: 'No valid user UUID' }; // UUID ONLY - can't store presence without UUID
    }
    const currentUrlData = window.currentUrlData;
    const currentPageId = currentUrlData?.pageId || 'unknown';
    // Store presence locally - UUID ONLY
    const presenceData = {
        userId: currentUser.id, // UUID only
        pageId: currentPageId,
        kind: kind,
        availability: availability,
        customLabel: customLabel,
        timestamp: new Date().toISOString(),
        local: true
    };
    // Store in local storage
    chrome.storage.local.set({
        [`presence_${currentPageId}_${currentUser.email || 'unknown'}`]: presenceData
    });
    Logger.debug('✅ PRESENCE API: COMP METHOD - Presence event stored locally', null, 'realtime');
    return { success: true, local: true };
}
// COMP METHOD: Ensure presence tracking is properly initialized
async function initializePresenceTracking() {
    Logger.debug('🔧 PRESENCE: Initializing presence tracking...', null, 'realtime');
    if (window.currentUser && window.currentUrlData) {
        try {
            Logger.debug('🔧 PRESENCE: Sending initial ENTER event...', null, 'realtime');
            const result = await sendPresenceEvent('ENTER');
            Logger.debug('✅ PRESENCE: Initial presence event sent:', result, 'realtime');
            // Store presence tracking globally
            window.presenceTrackingActive = true;
            return true;
        }
        catch (error) {
            handleRealtimeError(error, {
                operation: 'initializePresenceTracking',
                severity: 'recoverable'
            });
            return false;
        }
    }
    else {
        Logger.warn('⚠️ PRESENCE: Missing currentUser or currentUrlData', null, 'realtime');
        return false;
    }
}
// Export for global access
const winWithRealtime = window;
winWithRealtime.RealtimeManager = RealtimeManager;
winWithRealtime.handlePresenceChange = handlePresenceChange;
winWithRealtime.handleMessageChange = handleMessageChange;
winWithRealtime.handleReactionChange = handleReactionChange;
winWithRealtime.handleAuraChange = handleAuraChange;
winWithRealtime.sendPresenceEvent = sendPresenceEvent;
winWithRealtime.initializePresenceTracking = initializePresenceTracking;
winWithRealtime.sendSupabaseMessage = sendSupabaseMessage;
winWithRealtime.joinPageWithSupabase = joinPageWithSupabase;
export { RealtimeManager, handlePresenceChange, handleMessageChange, handleReactionChange, handleAuraChange, sendPresenceEvent, initializePresenceTracking, initializeSupabaseRealtimeClient, sendSupabaseMessage, joinPageWithSupabase, setupSupabaseEventHandlers };
//# sourceMappingURL=RealtimeManager.js.map
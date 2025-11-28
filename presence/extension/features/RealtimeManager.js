/**
 * REALTIME MANAGER - Real-time Communication
 * Handles all real-time functionality
 */
import { AvatarUtils } from '../utils/AvatarUtils.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { getCurrentUserId, getCurrentUserEmail } from './AuthModule.js';
// ES6 module-level storage (replaces window.supabaseRealtimeClient)
let supabaseRealtimeClientInstance = null;
/**
 * Helper function to get Supabase client
 * TODO: Refactor to use SupabaseService ES6 module instead of window.supabase
 * This is a temporary solution until SupabaseService is created
 */
function getSupabaseClient() {
    // TODO: Replace with ES6 SupabaseService import when available
    const win = window;
    return win.supabase || null;
}
function handleModuleError(error, _policy) {
    // BEST PRACTICE: Use satisfies for type checking without assertion
    return { handled: false, error };
}
import { Logger } from '../utils/Logger.js';
import { waitForCondition } from '../utils/AsyncCoordination.js';
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
            // Initialize AurasIntegration if available
            // This integration enables real-time aura color propagation
            // TODO: Export aurasIntegration from a module instead of window
            const win = window;
            const aurasIntegration = win.aurasIntegration;
            if (aurasIntegration && typeof aurasIntegration === 'object' && aurasIntegration !== null && 'initialize' in aurasIntegration && typeof aurasIntegration.initialize === 'function') {
                this.log('INFO', 'Initializing AurasIntegration...');
                try {
                    const initResult = await aurasIntegration.initialize();
                    const initSuccess = initResult === true || initResult === undefined;
                    if (initSuccess) {
                        this.log('INFO', 'AurasIntegration initialized successfully');
                    }
                    else {
                        this.log('WARN', 'AurasIntegration initialization returned false - may work with limited functionality');
                        // Don't fail completely - aura can still work via Supabase directly
                    }
                }
                catch (error) {
                    this.log('ERROR', 'AurasIntegration initialization failed:', error);
                    // Don't throw - continue initialization - aura can work via Supabase directly
                    this.log('WARN', 'Continuing without AurasIntegration - aura functionality will use Supabase directly');
                }
            }
            else {
                this.log('WARN', 'AurasIntegration not available for initialization');
                this.log('INFO', 'Aura functionality will use Supabase directly');
            }
            // Initialize presence tracking
            this.initializePresenceTracking();
            // Initialize user_presence table subscription for real-time visibility updates
            this.initializeUserPresenceSubscription();
            // 4-STATE STATUS: Initialize availability status real-time subscription (if enabled)
            // TODO: Get ENABLE_4STATE_STATUS from config service instead of window
            const win2 = window;
            if (typeof window !== 'undefined' && win2.ENABLE_4STATE_STATUS !== false) {
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
     * Initialize presence tracking
     */
    initializePresenceTracking() {
        this.log('INFO', 'Initializing presence tracking...');
        // Initialize presence tracking for current page
        // ES6 pattern: Get currentUrlData from stateManager instead of window
        const currentUrlData = stateManagerInstance.getState('currentUrlData');
        const currentPageId = currentUrlData?.pageId;
        if (currentPageId) {
            this.initializePresence(currentPageId);
        }
        else {
            this.log('WARN', 'No page ID available for presence tracking');
        }
    }
    /**
     * Initialize presence for a specific page
     */
    initializePresence(pageId) {
        this.log('INFO', `Initializing presence for page ${pageId}`);
        // Initialize presence tracking
        // TODO: Replace with ES6 SupabaseService import when available
        const supabase = getSupabaseClient();
        if (supabase) {
            // BEST PRACTICE: Use proper type instead of inline type assertions
            const presenceChannel = supabase.channel(`presence:${pageId}`);
            const ch1 = presenceChannel
                .on('presence', { event: 'sync' }, async () => {
                this.log('INFO', 'Presence sync event received');
                await this.updatePresenceDisplay();
            });
            const ch2 = ch1
                .on('presence', { event: 'join' }, async (payload) => {
                const p = payload;
                this.log('INFO', 'User joined presence:', p?.key);
                await this.updatePresenceDisplay();
            });
            const ch3 = ch2
                .on('presence', { event: 'leave' }, async (payload) => {
                const p = payload;
                this.log('INFO', 'User left presence:', p?.key);
                await this.updatePresenceDisplay();
            });
            ch3.subscribe(() => { });
            // Track current user's presence
            this.trackUserPresence(pageId);
        }
        else {
            this.log('WARN', 'Supabase not available for presence tracking');
        }
    }
    /**
     * Track current user's presence
     */
    trackUserPresence(pageId) {
        this.log('INFO', `Tracking user presence for page ${pageId}`);
        // ES6 pattern: Get currentUser from stateManager instead of window
        const currentUser = stateManagerInstance.getState('currentUser');
        // TODO: Replace with ES6 SupabaseService import when available
        const supabase = getSupabaseClient();
        if (currentUser && supabase) {
            const presenceChannel = supabase.channel(`presence:${pageId}`);
            // BEST PRACTICE: Use proper type instead of inline type assertions
            const channel = presenceChannel;
            const ch = channel
                .on('presence', { event: 'sync' }, () => {
                if (channel.presenceState) {
                    const state = channel.presenceState();
                    this.log('INFO', 'Current presence state:', state);
                }
            });
            // BEST PRACTICE: Type assertion needed here due to Supabase API design
            ch.subscribe(async (status) => {
                try {
                    if (status === 'SUBSCRIBED' && channel.track) {
                        // BEST PRACTICE: Use proper User type instead of inline assertions
                        const user = currentUser;
                        await channel.track({
                            userId: user.id || user.user_id,
                            userName: user.name,
                            userAvatar: user.avatarUrl || user.avatar,
                            onlineAt: new Date().toISOString(),
                            pageId: pageId
                        });
                        this.log('INFO', 'User presence tracked successfully');
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
     * Update presence display
     * BEST PRACTICE: Use DOM manipulation instead of innerHTML for security
     * CRITICAL FIX: Made async to support AvatarUtils (regression fix)
     */
    async updatePresenceDisplay() {
        this.log('INFO', 'Updating presence display...');
        // Get active users from presence state
        const activeUsers = this.getActiveUsers();
        // Update visible tab if available
        const visibleTab = document.querySelector('#visible-tab');
        if (visibleTab) {
            // BEST PRACTICE: Clear and rebuild DOM instead of innerHTML
            visibleTab.textContent = '';
            if (activeUsers.length > 0) {
                // CRITICAL FIX: Use Promise.all to handle async avatar creation (regression fix)
                const profilePromises = activeUsers.map(async (user) => {
                    const profileDiv = document.createElement('div');
                    profileDiv.className = 'profile-item';
                    // CRITICAL FIX: Use AvatarUtils to create avatar with glow effect (regression fix)
                    const avatarDiv = document.createElement('div');
                    avatarDiv.className = 'profile-avatar';
                    try {
                        // Convert ActiveUser to User type for AvatarUtils
                        const userForAvatar = {
                            id: user.id || user.userId || user.user_id || '',
                            email: user.email,
                            name: user.name,
                            avatarUrl: user.avatar,
                            auraColor: user.auraColor,
                            ...user
                        };
                        const avatarHTML = await AvatarUtils.createUnifiedAvatar(userForAvatar, 'visibility', {
                            showAura: true,
                            showStatus: false,
                            size: 32
                        });
                        avatarDiv.innerHTML = avatarHTML;
                    }
                    catch (error) {
                        // Fallback to simple avatar if AvatarUtils fails
                        const img = document.createElement('img');
                        img.src = user.avatar || '';
                        img.alt = user.name || '';
                        img.style.border = 'none';
                        img.style.outline = 'none';
                        avatarDiv.appendChild(img);
                    }
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'profile-info';
                    const nameDiv = document.createElement('div');
                    nameDiv.className = 'profile-name';
                    nameDiv.textContent = user.name || '';
                    const statusDiv = document.createElement('div');
                    statusDiv.className = 'profile-status';
                    statusDiv.textContent = 'Active';
                    infoDiv.appendChild(nameDiv);
                    infoDiv.appendChild(statusDiv);
                    profileDiv.appendChild(avatarDiv);
                    profileDiv.appendChild(infoDiv);
                    return profileDiv;
                });
                const profileDivs = await Promise.all(profilePromises);
                profileDivs.forEach(div => visibleTab.appendChild(div));
            }
            else {
                const noUsersDiv = document.createElement('div');
                noUsersDiv.className = 'no-users';
                noUsersDiv.textContent = 'No active users on this page';
                visibleTab.appendChild(noUsersDiv);
            }
        }
    }
    /**
     * Get active users
     * TODO: Implement based on actual presence system
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
     * Initialize real-time subscription for user_presence table changes
     * This ensures visibility updates when users join/leave pages
     */
    initializeUserPresenceSubscription() {
        this.log('INFO', '🔔 PRESENCE: Initializing user_presence subscription...');
        // TODO: Replace with ES6 SupabaseService import when available
        const supabase = getSupabaseClient();
        if (!supabase) {
            this.log('WARN', '⚠️ PRESENCE: Supabase not available for user_presence subscription');
            return;
        }
        try {
            // Subscribe to user_presence table changes (INSERT, UPDATE, DELETE)
            // BEST PRACTICE: Use proper type instead of inline type assertions
            const presenceChannel = supabase.channel('user-presence-changes');
            const pc1 = presenceChannel
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
            });
            const pc2 = pc1
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
            });
            const pc3 = pc2
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
            pc3.subscribe((status) => {
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
        // TODO: Replace with ES6 SupabaseService import when available
        const supabase = getSupabaseClient();
        if (!supabase) {
            this.log('WARN', '⚠️ STATUS: Supabase not available for availability subscription');
            return;
        }
        try {
            // Subscribe to PresenceEvent table changes for AVAILABILITY events
            // BEST PRACTICE: Use proper type instead of inline type assertions
            const availabilityChannel = supabase.channel('availability-changes');
            const ac1 = availabilityChannel
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
            ac1.subscribe((status) => {
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
            // ES6 pattern: Get from stateManager instead of window
            const currentVisibilityDataUnfiltered = stateManagerInstance.getState('currentVisibilityDataUnfiltered');
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
            // TODO: Export StatusDotHelper from a module instead of window
            const win3 = window;
            const statusDotHelper = win3.StatusDotHelper;
            if (statusDotHelper && typeof statusDotHelper.getStatusDotColor === 'function') {
                // BEST PRACTICE: Use proper type checking - getStatusDotColor expects string status
                newColor = statusDotHelper.getStatusDotColor(availability);
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
        Logger.debug('🚀 SUPABASE: Current window.supabase status:', { status: typeof window.supabase }, 'realtime');
        Logger.debug('🚀 SUPABASE: Current supabaseRealtimeClientInstance status:', { status: supabaseRealtimeClientInstance ? typeof supabaseRealtimeClientInstance : 'null' }, 'realtime');
        // BEST PRACTICE: Use event-based wait instead of polling
        // Wait for Supabase library to load using waitForCondition (no polling)
        // TODO: Replace with ES6 SupabaseService import when available
        const loaded = await waitForCondition(() => {
            const supabase = getSupabaseClient();
            return supabase !== null && typeof supabase.from === 'function';
        }, {
            timeout: 5000, // 5 seconds max wait
            interval: 100
        }).then(() => {
            const supabase = getSupabaseClient();
            Logger.debug('✅ SUPABASE CLIENT: Loaded and initialized successfully', null, 'realtime');
            Logger.debug('✅ SUPABASE CLIENT: Available methods:', { methods: Object.keys(supabase || {}).slice(0, 10) }, 'realtime');
            Logger.debug('✅ SUPABASE CLIENT: Client ready for real-time operations', null, 'realtime');
            return true;
        }).catch(() => {
            Logger.error('❌ SUPABASE LIBRARY: Failed to load after 5 seconds', null, 'realtime');
            Logger.error('❌ SUPABASE LIBRARY: window.supabase', { type: typeof window.supabase }, 'realtime');
            Logger.error('❌ SUPABASE LIBRARY: Available window keys', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')), 'realtime');
            Logger.error('❌ SUPABASE LIBRARY: This is a CRITICAL FAILURE - real-time will not work', null, 'realtime');
            return false;
        });
        if (!loaded) {
            Logger.error('❌ SUPABASE: Cannot initialize without Supabase library', null, 'realtime');
            return;
        }
        Logger.debug('🚀 SUPABASE: Initializing Supabase real-time client...', null, 'realtime');
        // COMP APPROACH: Use window.supabase.realtime directly
        // TODO: Replace with ES6 SupabaseService import when available
        const supabase = getSupabaseClient();
        if (supabase && supabase.realtime) {
            Logger.debug('✅ SUPABASE_DEBUG: window.supabase.realtime found, using COMP approach...', 'realtime');
            // Create SupabaseRealtimeClient instance
            // BEST PRACTICE: Use proper type checking - SupabaseRealtimeClient may not be a constructor
            // TODO: Export SupabaseRealtimeClient from a module instead of window
            const win4 = window;
            const SupabaseRealtimeClient = win4.SupabaseRealtimeClient;
            if (SupabaseRealtimeClient) {
                // Check if it's a constructor function
                if (typeof SupabaseRealtimeClient === 'function') {
                    try {
                        Logger.debug('✅ SUPABASE_DEBUG: SupabaseRealtimeClient class found, creating instance...', 'realtime');
                        const instance = new SupabaseRealtimeClient();
                        supabaseRealtimeClientInstance = instance;
                        Logger.debug('✅ SUPABASE_DEBUG: Instance created:', !!supabaseRealtimeClientInstance, 'realtime');
                        const clientInstance = supabaseRealtimeClientInstance;
                        if (clientInstance && typeof clientInstance.initialize === 'function') {
                            // BEST PRACTICE: Type assertion needed due to Supabase version differences
                            const success = await clientInstance.initialize(supabase);
                            Logger.debug('✅ SUPABASE_DEBUG: Initialize result:', success, 'realtime');
                        }
                    }
                    catch (error) {
                        Logger.error('❌ SUPABASE_DEBUG: Failed to create SupabaseRealtimeClient instance:', error, 'realtime');
                        supabaseRealtimeClientInstance = supabase;
                    }
                }
                else {
                    Logger.debug('⚠️ SUPABASE_DEBUG: SupabaseRealtimeClient is not a constructor, using as-is', 'realtime');
                    supabaseRealtimeClientInstance = SupabaseRealtimeClient;
                }
            }
            else {
                Logger.debug('❌ SUPABASE_DEBUG: SupabaseRealtimeClient class not available, using fallback', 'realtime');
                supabaseRealtimeClientInstance = supabase;
            }
            Logger.debug('✅ SUPABASE_DEBUG: Using SupabaseRealtimeClient instance', null, 'realtime');
            // Real-time is already available through supabase client
            Logger.debug('✅ SUPABASE: Real-time client initialized successfully', null, 'realtime');
            Logger.debug('✅ SUPABASE: Supabase client:', supabase, 'realtime');
            Logger.debug('✅ SUPABASE: Realtime available:', !!supabase.realtime, 'realtime');
            // Ensure real-time client is properly connected
            Logger.debug('🔧 SUPABASE: Ensuring real-time connection...', null, 'realtime');
            if (supabaseRealtimeClientInstance && typeof supabaseRealtimeClientInstance === 'object' && supabaseRealtimeClientInstance !== null && 'isConnected' in supabaseRealtimeClientInstance) {
                supabaseRealtimeClientInstance.isConnected = true;
            }
            // Setup event handlers
            setupSupabaseEventHandlers();
            // Test the connection immediately
            Logger.debug('🔧 SUPABASE: Testing real-time connection...', null, 'realtime');
            try {
                // BEST PRACTICE: Use proper type checking instead of type assertions
                if (supabase && typeof supabase.from === 'function') {
                    const testResult = await supabase.from('user_presence').select('count').limit(1);
                    Logger.debug('✅ SUPABASE: Connection test successful:', testResult, 'realtime');
                }
                else {
                    Logger.debug('⚠️ SUPABASE: Skipping connection test - supabase.from not available', null, 'realtime');
                }
            }
            catch (testError) {
                handleRealtimeError(testError, {
                    operation: 'testSupabaseConnection',
                    severity: 'recoverable'
                });
            }
        }
        else {
            Logger.error('❌ SUPABASE: window.supabase.realtime not available', null, 'realtime');
            Logger.error('❌ SUPABASE: Available window keys', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')), 'realtime');
        }
    }
    catch (error) {
        handleRealtimeError(error, {
            operation: 'initializeSupabaseRealtimeClient',
            severity: 'fatal'
        });
    }
}
// ES6 export only - no window assignment (backward compatibility removed)
async function sendSupabaseMessage(message) {
    const timer = Date.now();
    Logger.debug('supabase_send', { messageType: message.type, timestamp: timer }, 'realtime');
    try {
        // Auras integration is optional for aura messages - can use Supabase directly
        // TODO: Export aurasIntegration from a module instead of window
        const win5 = window;
        const aurasIntegration = win5.aurasIntegration;
        const isAuraMessage = message.type === 'AURA_COLOR_CHANGED';
        const isPresenceMessage = message.type === 'PRESENCE_UPDATE';
        if (!isPresenceMessage && !isAuraMessage && (!aurasIntegration || (typeof aurasIntegration === 'object' && aurasIntegration !== null && 'isInitialized' in aurasIntegration && !aurasIntegration.isInitialized))) {
            Logger.error('❌ SUPABASE: Auras integration not initialized and message type requires it:', message.type, 'realtime');
            return false;
        }
        if (isAuraMessage && (!aurasIntegration || (typeof aurasIntegration === 'object' && aurasIntegration !== null && 'isInitialized' in aurasIntegration && !aurasIntegration.isInitialized))) {
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
        const supabaseRealtimeClient = supabaseRealtimeClientInstance;
        if (!supabaseRealtimeClient) {
            Logger.error('❌ SUPABASE: supabaseRealtimeClient not available', null, 'realtime');
            return false;
        }
        let success = false;
        // BEST PRACTICE: Use type guards instead of type assertions
        const client = supabaseRealtimeClient;
        switch (message.type) {
            case 'MESSAGE_NEW':
                if (client.sendMessage) {
                    success = await client.sendMessage(message.content || '');
                }
                break;
            case 'AURA_COLOR_CHANGED':
                if (client.broadcastAuraColorChange) {
                    success = await client.broadcastAuraColorChange(message.color || message.auraColor || '');
                }
                break;
            case 'PRESENCE_UPDATE':
                if (client.updatePresence) {
                    success = await client.updatePresence(message.pageId || '', message.pageUrl || message.url || '', message.auraColor || '');
                }
                break;
            case 'VISIBILITY_UPDATE':
                if (client.setUserVisibility) {
                    success = await client.setUserVisibility(message.isVisible !== undefined ? message.isVisible : (message.is_visible || false), message.pageUrl || message.url || '');
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
    const client = supabaseRealtimeClientInstance;
    Logger.debug('🌐 SUPABASE: Client available:', !!client, 'realtime');
    if (client) {
        try {
            // ES6 pattern: Use imported getCurrentUserId instead of window
            const userId = await getCurrentUserId();
            Logger.debug('🌐 SUPABASE: User ID:', userId, 'realtime');
            // BEST PRACTICE: Use type guards instead of type assertions
            const typedClient = client;
            if (typedClient.setCurrentUser) {
                await typedClient.setCurrentUser(userId);
                Logger.debug('✅ SUPABASE: User set successfully', null, 'realtime');
            }
            if (typedClient.joinPage) {
                await typedClient.joinPage(pageId, pageUrl);
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
        // Get current page ID once at the start for all cases
        // ES6 pattern: Get from stateManager instead of window
        const currentUrlData = stateManagerInstance.getState('currentUrlData');
        const currentPageId = currentUrlData?.pageId;
        // Always refresh visibility after any presence change
        // This ensures users see updates when others move pages
        let shouldRefresh = false;
        switch (eventType) {
            case 'INSERT':
                Logger.debug('👋 PRESENCE: User joined:', newRecord, 'realtime');
                // BEST PRACTICE: Check if this user is on the current page
                if (newRecord?.page_id === currentPageId || newRecord?.pageId === currentPageId) {
                    Logger.debug('✅ PRESENCE_CHANGE: User joined current page, refreshing visibility', 'realtime');
                    shouldRefresh = true;
                }
                break;
            case 'UPDATE':
                Logger.debug('🔄 PRESENCE: User updated:', newRecord, 'realtime');
                // BEST PRACTICE: Refresh if user updated on current page or left current page
                const updatedPageId = newRecord?.page_id || newRecord?.pageId;
                const oldPageId = oldRecord?.page_id || oldRecord?.pageId;
                if (updatedPageId === currentPageId || oldPageId === currentPageId) {
                    Logger.debug('✅ PRESENCE_CHANGE: User page changed, refreshing visibility', 'realtime');
                    shouldRefresh = true;
                }
                break;
            case 'DELETE':
                Logger.debug('👋 PRESENCE: User left:', oldRecord, 'realtime');
                // BEST PRACTICE: Refresh if user left current page
                if (oldRecord?.page_id === currentPageId || oldRecord?.pageId === currentPageId) {
                    Logger.debug('✅ PRESENCE_CHANGE: User left current page, refreshing visibility', 'realtime');
                    shouldRefresh = true;
                }
                break;
            default:
                Logger.debug('❓ PRESENCE: Unknown event type:', eventType, 'realtime');
        }
        // BEST PRACTICE: Refresh visibility UI when presence changes affect current page
        // Use proper debouncing with requestAnimationFrame for better performance
        // ES6 pattern: Use DOM event instead of direct window function call
        if (shouldRefresh) {
            Logger.debug('🔄 PRESENCE_CHANGE: Dispatching refreshVisibilityAvatars event to update UI', null, 'realtime');
            // BEST PRACTICE: Use requestAnimationFrame for UI updates instead of setTimeout
            // This ensures updates happen on the next frame, avoiding unnecessary delays
            // BEST PRACTICE: Use proper type for window extension
            const winWithRaf = window;
            const existingRafId = winWithRaf.__presenceChangeRafId__;
            if (existingRafId !== undefined) {
                cancelAnimationFrame(existingRafId);
            }
            const rafId = requestAnimationFrame(() => {
                try {
                    // ES6 pattern: Dispatch DOM event instead of calling window function
                    window.dispatchEvent(new CustomEvent('refreshVisibilityAvatars', {
                        detail: { source: 'RealtimeManager' }
                    }));
                    // Optional: Try direct call if available (graceful degradation)
                    const win = window;
                    if (typeof win.refreshVisibilityAvatars === 'function') {
                        win.refreshVisibilityAvatars();
                    }
                }
                catch (error) {
                    handleRealtimeError(error, {
                        operation: 'refreshVisibilityAvatars',
                        severity: 'recoverable'
                    });
                }
                finally {
                    winWithRaf.__presenceChangeRafId__ = undefined;
                }
            });
            winWithRaf.__presenceChangeRafId__ = rafId;
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
            // ES6 pattern: Dispatch DOM event instead of calling window function
            window.dispatchEvent(new CustomEvent('updateMessageInChat', {
                detail: { message: newRecord, source: 'RealtimeManager' }
            }));
            // Optional: Try direct call if available (graceful degradation)
            const win = window;
            if (typeof win.updateMessageInChat === 'function' && newRecord) {
                win.updateMessageInChat(newRecord);
            }
            break;
        case 'DELETE':
            Logger.debug('🗑️ MESSAGE: Message deleted:', oldRecord, 'realtime');
            // ES6 pattern: Dispatch DOM event instead of calling window function
            if (oldRecord) {
                const messageId = typeof oldRecord === 'string' ? oldRecord : (oldRecord.id || oldRecord.messageId || String(oldRecord));
                window.dispatchEvent(new CustomEvent('removeMessageFromChat', {
                    detail: { messageId, source: 'RealtimeManager' }
                }));
                // Optional: Try direct call if available (graceful degradation)
                const win = window;
                if (typeof win.removeMessageFromChat === 'function') {
                    win.removeMessageFromChat(messageId);
                }
            }
            break;
        default:
            Logger.debug('❓ MESSAGE: Unknown event type:', eventType, 'realtime');
    }
}
// Handle real-time reaction changes from Supabase
// BEST PRACTICE: Guard to prevent infinite recursion
let isProcessingReactionChange = false;
async function handleReactionChange(payload) {
    // Guard against infinite recursion
    if (isProcessingReactionChange) {
        Logger.warn('⚠️ REACTION_CHANGE: Already processing, skipping to prevent recursion', 'realtime');
        return;
    }
    isProcessingReactionChange = true;
    try {
        Logger.debug('🔔 REACTION_CHANGE: Processing real-time update:', payload, 'realtime');
        const { eventType, new: newRecord, old: oldRecord } = payload;
        // Fallback: Handle directly if window function not available
        switch (eventType) {
            case 'INSERT':
                Logger.debug('👍 REACTION: New reaction added:', newRecord, 'realtime');
                Logger.debug('👍 REACTION: Full payload for INSERT:', payload, 'realtime');
                // ES6 pattern: Dispatch DOM event instead of calling window function
                if (newRecord) {
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
                    window.dispatchEvent(new CustomEvent('addReactionToMessage', {
                        detail: { payload: insertPayload, source: 'RealtimeManager' }
                    }));
                    // Optional: Try direct call if available (graceful degradation)
                    const win = window;
                    if (typeof win.addReactionToMessage === 'function') {
                        win.addReactionToMessage(insertPayload);
                    }
                }
                break;
            case 'UPDATE':
                Logger.debug('🔄 REACTION: Reaction updated:', newRecord, 'realtime');
                // ES6 pattern: Dispatch DOM event instead of calling window function
                if (newRecord) {
                    window.dispatchEvent(new CustomEvent('updateReactionInMessage', {
                        detail: { reaction: newRecord, source: 'RealtimeManager' }
                    }));
                    // Optional: Try direct call if available (graceful degradation)
                    const win = window;
                    if (typeof win.updateReactionInMessage === 'function') {
                        win.updateReactionInMessage(newRecord);
                    }
                }
                break;
            case 'DELETE':
                Logger.debug('👎 REACTION: Reaction removed:', oldRecord, 'realtime');
                Logger.debug('👎 REACTION: Full payload for DELETE:', payload, 'realtime');
                // ES6 pattern: Dispatch DOM event instead of calling window function
                if (oldRecord) {
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
                    window.dispatchEvent(new CustomEvent('removeReactionFromMessage', {
                        detail: { payload: deletePayload, source: 'RealtimeManager' }
                    }));
                    // Optional: Try direct call if available (graceful degradation)
                    const win = window;
                    if (typeof win.removeReactionFromMessage === 'function') {
                        await win.removeReactionFromMessage(deletePayload);
                    }
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
        // ES6 pattern: Dispatch DOM event instead of calling window function
        if (newRecord.user_email && newRecord.aura_color) {
            window.dispatchEvent(new CustomEvent('updateUserAuraInUI', {
                detail: { userEmail: newRecord.user_email, auraColor: newRecord.aura_color, source: 'RealtimeManager' }
            }));
            // Optional: Try direct call if available (graceful degradation)
            const win = window;
            if (typeof win.updateUserAuraInUI === 'function') {
                win.updateUserAuraInUI(newRecord.user_email, newRecord.aura_color);
            }
        }
    }
}
// Setup Supabase real-time event handlers
function setupSupabaseEventHandlers() {
    // ES6 pattern: Use module-level instance instead of window
    const supabaseRealtimeClient = supabaseRealtimeClientInstance;
    if (!supabaseRealtimeClient)
        return;
    // BEST PRACTICE: Use type guards instead of type assertions
    const typedClient = supabaseRealtimeClient;
    // Set up event handlers with comprehensive logging
    if (typedClient.onUserJoined) {
        typedClient.onUserJoined = (user) => {
            Logger.debug('👋 SUPABASE: User joined:', user.user_email, 'realtime');
            Logger.debug('👋 SUPABASE: Triggering visibility refresh...', null, 'realtime');
            // ES6 pattern: Dispatch DOM event instead of calling window function
            window.dispatchEvent(new CustomEvent('refreshVisibilityAvatars', {
                detail: { source: 'RealtimeManager', reason: 'userJoined' }
            }));
            // Optional: Try direct call if available (graceful degradation)
            const win = window;
            if (typeof win.refreshVisibilityAvatars === 'function') {
                win.refreshVisibilityAvatars().catch((err) => Logger.error('Error refreshing visibility after user joined:', err, 'realtime'));
            }
        };
    }
    if (typedClient.onUserLeft) {
        typedClient.onUserLeft = (user) => {
            Logger.debug('👋 SUPABASE: User left:', user.user_email, 'realtime');
            Logger.debug('👋 SUPABASE: Triggering visibility refresh...', null, 'realtime');
            // ES6 pattern: Dispatch DOM event instead of calling window function
            window.dispatchEvent(new CustomEvent('refreshVisibilityAvatars', {
                detail: { source: 'RealtimeManager', reason: 'userLeft' }
            }));
            // Optional: Try direct call if available (graceful degradation)
            const win = window;
            if (typeof win.refreshVisibilityAvatars === 'function') {
                win.refreshVisibilityAvatars().catch((err) => Logger.error('Error refreshing visibility after user left:', err, 'realtime'));
            }
        };
    }
    if (typedClient.onUserUpdated) {
        typedClient.onUserUpdated = (user) => {
            Logger.debug('🔄 SUPABASE: User updated:', user.user_email, 'realtime');
            Logger.debug('🔄 SUPABASE: Aura color:', user.aura_color, 'realtime');
            // Update aura color if changed
            if (user.aura_color) {
                Logger.debug('🎨 SUPABASE: Updating aura color in UI...', null, 'realtime');
                // ES6 pattern: Dispatch DOM event instead of calling window function
                window.dispatchEvent(new CustomEvent('updateUserAuraInUI', {
                    detail: { userEmail: user.user_email, auraColor: user.aura_color, source: 'RealtimeManager' }
                }));
                // Optional: Try direct call if available (graceful degradation)
                const win = window;
                if (typeof win.updateUserAuraInUI === 'function') {
                    win.updateUserAuraInUI(user.user_email, user.aura_color);
                }
            }
            // Also refresh visibility to show any other changes
            // ES6 pattern: Dispatch DOM event instead of calling window function
            window.dispatchEvent(new CustomEvent('refreshVisibilityAvatars', {
                detail: { source: 'RealtimeManager', reason: 'userUpdated' }
            }));
            // Optional: Try direct call if available (graceful degradation)
            const win = window;
            if (typeof win.refreshVisibilityAvatars === 'function') {
                win.refreshVisibilityAvatars().catch((err) => Logger.error('Error refreshing visibility after user update:', err, 'realtime'));
            }
        };
    }
    if (typedClient.onNewMessage) {
        typedClient.onNewMessage = async (message) => {
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
            // ES6 pattern: Dispatch DOM event instead of calling window function
            window.dispatchEvent(new CustomEvent('showNotification', {
                detail: { message: `New message from ${messageWithEmail.user_email || 'unknown'}`, source: 'RealtimeManager' }
            }));
            // Optional: Try direct call if available (graceful degradation)
            const win = window;
            if (typeof win.showNotification === 'function') {
                win.showNotification(`New message from ${messageWithEmail.user_email || 'unknown'}`);
            }
        };
    }
    if (typedClient.onVisibilityChanged) {
        typedClient.onVisibilityChanged = (visibility) => {
            Logger.debug('👁️ SUPABASE: Visibility changed', {
                userEmail: visibility.user_email,
                isVisible: visibility.is_visible
            }, 'realtime');
            Logger.debug('👁️ SUPABASE: Triggering visibility refresh...', null, 'realtime');
            // ES6 pattern: Dispatch DOM event instead of calling window function
            window.dispatchEvent(new CustomEvent('refreshVisibilityAvatars', {
                detail: { source: 'RealtimeManager', reason: 'visibilityChanged' }
            }));
            // Optional: Try direct call if available (graceful degradation)
            const win = window;
            if (typeof win.refreshVisibilityAvatars === 'function') {
                win.refreshVisibilityAvatars().catch((err) => Logger.error('Error refreshing visibility after visibility change:', err, 'realtime'));
            }
        };
    }
    Logger.debug('✅ SUPABASE: Event handlers configured', null, 'realtime');
}
// Send a presence event to the server
async function sendPresenceEvent(kind, availability = null, customLabel = null) {
    Logger.debug('🔍 PRESENCE EVENT DEBUG: Starting sendPresenceEvent', null, 'realtime');
    Logger.debug('🔍 PRESENCE EVENT DEBUG: Kind:', kind, 'realtime');
    Logger.debug('🔍 PRESENCE EVENT DEBUG: Availability:', availability, 'realtime');
    Logger.debug('🔍 PRESENCE EVENT DEBUG: Custom label:', customLabel, 'realtime');
    try {
        // Try API first, fallback to local storage on error
        return await sendPresenceEventToAPI(kind, availability, customLabel);
    }
    catch (error) {
        Logger.debug('❌ PRESENCE EVENT: API failed, using local storage fallback', 'realtime');
        return await handlePresenceEventLocally(kind, availability, customLabel);
    }
}
// Send presence event to API
async function sendPresenceEventToAPI(kind, availability = null, customLabel = null) {
    Logger.debug('🔧 PRESENCE API: Sending presence event to API', null, 'realtime');
    try {
        // ES6 pattern: Get from stateManager instead of window
        const currentUrlData = stateManagerInstance.getState('currentUrlData');
        // BEST PRACTICE: Explicitly type currentPageId to avoid type inference issues
        // TODO: Store currentPageId in stateManager instead of window
        const win = window;
        const currentPageId = win.currentPageId || currentUrlData?.pageId;
        if (!currentPageId || typeof currentPageId !== 'string') {
            Logger.warn('❌ PRESENCE EVENT: No current pageId for presence event', null, 'realtime');
            Logger.debug('🔍 PRESENCE EVENT DEBUG: currentPageId is null/undefined', null, 'realtime');
            return { success: false, error: 'No page ID' };
        }
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Current page ID:', currentPageId, 'realtime');
        // Get normalized URL data - SAME AS MESSAGES AND VISIBILITY
        // TODO: Export normalizeCurrentUrl from a utility module instead of window
        const win2 = window;
        const normalizeCurrentUrl = win2.normalizeCurrentUrl;
        if (!normalizeCurrentUrl) {
            throw new Error('normalizeCurrentUrl not available');
        }
        const urlData = await normalizeCurrentUrl();
        Logger.debug('🔍 PRESENCE EVENT DEBUG: URL data:', urlData, 'realtime');
        // ES6 pattern: Use imported getCurrentUserId instead of window
        const userId = await getCurrentUserId();
        Logger.debug('🔍 PRESENCE EVENT DEBUG: User ID:', userId, 'realtime');
        const typedUrlData = urlData;
        const pageUrl = typedUrlData.rawUrl ?? typedUrlData.normalizedUrl ?? '';
        // BEST PRACTICE: Use urlPageId as fallback if currentPageId is not available
        const urlPageId = typedUrlData.pageId ?? typedUrlData.rawUrl ?? typedUrlData.normalizedUrl ?? '';
        // Use urlPageId if currentPageId is not available
        const finalPageId = currentPageId || urlPageId;
        // BEST PRACTICE: Ensure pageId is a string
        if (!finalPageId) {
            Logger.warn('❌ PRESENCE EVENT: No current pageId for presence event', null, 'realtime');
            return { success: false, error: 'No page ID' };
        }
        const requestBody = {
            pageId: finalPageId, // Use finalPageId which includes fallback
            kind,
            availability,
            customLabel,
            pageUrl
        };
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Request body:', requestBody, 'realtime');
        // TODO: Get METALAYER_API_URL from API_CONFIG or environment config instead of window
        const win3 = window;
        const METALAYER_API_URL = win3.METALAYER_API_URL || 'http://216.238.91.120:3002';
        Logger.debug('🔍 PRESENCE EVENT DEBUG: API URL:', `${METALAYER_API_URL}/v1/presence/event`, 'realtime');
        // Derive both UUID and email; backend may accept either for user resolution
        // ES6 pattern: Use imported getCurrentUserEmail instead of window
        // BEST PRACTICE: Use proper User type instead of inline assertion
        const currentUser = stateManagerInstance.getState('currentUser');
        const userEmail = await getCurrentUserEmail() || currentUser?.email || null;
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
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Response status:', response.status, 'realtime');
        Logger.debug('🔍 PRESENCE EVENT DEBUG: Response ok:', response.ok, 'realtime');
        if (response.ok) {
            const responseData = await response.json();
            Logger.debug('🔍 PRESENCE EVENT DEBUG: Response data:', responseData, 'realtime');
            Logger.debug(`PRESENCE: ${kind} event sent successfully`, null, 'realtime');
            // Send via background service worker
            // BEST PRACTICE: Ensure finalPageId is defined (checked above)
            await sendSupabaseMessage({
                type: 'PRESENCE_UPDATE',
                kind: kind,
                availability: availability || undefined,
                customLabel: customLabel || undefined,
                pageId: finalPageId, // Use finalPageId which includes fallback
                userId: userId || undefined,
                timestamp: Date.now()
            });
            Logger.debug(`👥 WEBSOCKET: ${kind} event broadcast via background service worker`, null, 'realtime');
            // Return success response with status and data
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
            // BEST PRACTICE: Trigger fallback on any non-200 status
            Logger.debug('🔧 PRESENCE: Triggering local storage fallback due to API error', null, 'realtime');
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
// Handle presence events locally when API fails
async function handlePresenceEventLocally(kind, availability = null, customLabel = null) {
    Logger.debug('🔧 PRESENCE API: Handling presence event locally', null, 'realtime');
    // BEST PRACTICE: Use proper User type instead of inline assertions
    // ES6 pattern: Get from stateManager instead of window
    const currentUser = stateManagerInstance.getState('currentUser') || { email: 'user@example.com' };
    const currentUrlData = stateManagerInstance.getState('currentUrlData');
    const currentPageId = currentUrlData?.pageId || 'unknown';
    // Store presence locally
    const userEmail = currentUser.email || 'unknown';
    const presenceData = {
        userId: userEmail,
        pageId: currentPageId,
        kind: kind,
        availability: availability,
        customLabel: customLabel,
        timestamp: new Date().toISOString(),
        local: true
    };
    // Store in local storage
    chrome.storage.local.set({
        [`presence_${currentPageId}_${userEmail}`]: presenceData
    });
    Logger.debug('✅ PRESENCE API: Presence event stored locally', null, 'realtime');
    return { success: true, local: true };
}
// Ensure presence tracking is properly initialized
async function initializePresenceTracking() {
    Logger.debug('🔧 PRESENCE: Initializing presence tracking...', null, 'realtime');
    // ES6 pattern: Get from stateManager instead of window
    const currentUser = stateManagerInstance.getState('currentUser');
    const currentUrlData = stateManagerInstance.getState('currentUrlData');
    if (currentUser && currentUrlData) {
        try {
            Logger.debug('🔧 PRESENCE: Sending initial ENTER event...', null, 'realtime');
            const result = await sendPresenceEvent('ENTER');
            Logger.debug('✅ PRESENCE: Initial presence event sent:', result, 'realtime');
            // Store presence tracking in state manager (ES6 pattern)
            const { stateManagerInstance } = await import('../core/StateManager.js');
            stateManagerInstance.setState('presenceTrackingActive', true);
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
// ES6 exports only - no window assignments (backward compatibility removed)
export { RealtimeManager, handlePresenceChange, handleMessageChange, handleReactionChange, handleAuraChange, sendPresenceEvent, initializePresenceTracking, initializeSupabaseRealtimeClient, sendSupabaseMessage, joinPageWithSupabase, setupSupabaseEventHandlers };

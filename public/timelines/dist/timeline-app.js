/**
 * Timeline Application
 * Main entry point for timeline feature
 */
console.log('TimelineApp: Script loading...');
// RED-LINE: Timeline scripts MUST import modules directly, NOT rely on window globals
// @ts-ignore - Runtime paths, TypeScript can't resolve
import { AvatarUtils } from '/presence/utils/AvatarUtils.js';
// @ts-ignore - Runtime paths, TypeScript can't resolve
import { AuthManager } from '/presence/features/AuthManager.js';
// @ts-ignore - Runtime paths, TypeScript can't resolve
import { SupabaseService } from '/presence/services/SupabaseService.js';

// The timeline page is standalone and extension scripts may not be loaded
import { TimelineManager } from './modules/TimelineManager.js';
import { TimelineRealtime } from './modules/TimelineRealtime.js';
import { TimelineCache } from './modules/TimelineCache.js';
import { TimelineQuery } from './modules/TimelineQuery.js';
import { TimelineView } from './components/TimelineView.js';
import { ProfileSelector } from './components/ProfileSelector.js';
import { TimelineFilters } from './components/TimelineFilters.js';
/**
 * Timeline Application Class
 */
class TimelineApp {
    constructor() {
        // RED-LINE: Store SupabaseService instance, not window references
        this.supabaseService = null;
        this.supabaseClient = null;
        // Initialize core modules (realtimeManager will be created after Supabase is initialized)
        this.timelineManager = new TimelineManager();
        this.cache = new TimelineCache();
        this.query = new TimelineQuery();
        this.realtimeManager = null; // Will be initialized in init() after Supabase
        // Initialize UI components
        const timelineItemsContainer = document.getElementById('timeline-items');
        const profileSelectorModal = document.getElementById('profile-selector-modal');
        const timelineFiltersContainer = document.getElementById('timeline-filters');
        if (!timelineItemsContainer || !profileSelectorModal || !timelineFiltersContainer) {
            throw new Error('TimelineApp: Required DOM elements not found');
        }
        this.timelineView = new TimelineView(timelineItemsContainer, this.timelineManager);
        this.profileSelector = new ProfileSelector(profileSelectorModal, this);
        this.filters = new TimelineFilters(timelineFiltersContainer, this.timelineManager);
        // Current user info
        this.currentUserId = null;
        this.currentUserEmail = null;
        this.currentUserCommunities = [];
        // View state
        this.viewMode = 'single'; // 'single' | 'multi' | 'merged'
        this.currentProfileId = null;
        this.multiProfileIds = [];
    }
    /**
     * Initialize Supabase client
     * RED-LINE: Use SupabaseService instance directly, NO window references
     */
    async initSupabase() {
        // RED-LINE: Initialize SupabaseService directly, store instance
        try {
            if (!this.supabaseService) {
                this.supabaseService = new SupabaseService();
                await this.supabaseService.initialize();
            }
            // Get client from SupabaseService instance (RED-LINE: no window references)
            const client = this.supabaseService.getClient();
            console.log('Timeline: SupabaseService initialized, using client instance');
            return client;
        }
        catch (error) {
            console.error('Timeline: SupabaseService initialization failed:', error);
            throw new Error('Supabase client not initialized. Ensure config.js and SupabaseService are loaded.');
        }
    }
    /**
     * Initialize application
     */
    async init() {
        try {
            // RED-LINE: Initialize Supabase first (no window references)
            this.supabaseClient = await this.initSupabase();
            // Initialize realtime manager with Supabase client
            this.realtimeManager = new TimelineRealtime(this.supabaseClient, this.timelineManager);
            // Ensure modal is hidden on init
            const modal = document.getElementById('profile-selector-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
            // Parse route to get profile identifier
            const identifier = this.parseRoute();
            if (!identifier) {
                this.showError('No profile specified in URL');
                return;
            }
            // Load current user info
            await this.loadCurrentUser();
            // Initialize filters with communities
            this.filters.render(this.currentUserCommunities);
            // Load timeline
            await this.loadTimeline(identifier);
            // Set up event listeners
            this.setupEventListeners();
            // Set up real-time subscriptions
            await this.setupRealtime();
            // Set up filter change listener
            document.addEventListener('timeline:filters:changed', (e) => {
                const customEvent = e;
                this.handleFilterChange(customEvent.detail);
            });
        }
        catch (error) {
            console.error('Timeline app initialization error:', error);
            this.showError(error.message);
        }
    }
    /**
     * Parse route to extract profile identifier
     */
    parseRoute() {
        const path = window.location.pathname;
        console.log('TimelineApp: Parsing route from path:', path);
        // Extract identifier from /timelines/:identifier or /:identifier (for subdomain)
        const match = path.match(/\/timelines\/([^\/]+)$/) || path.match(/^\/([^\/]+)$/);
        const identifier = match ? match[1] : null;
        console.log('TimelineApp: Extracted identifier:', identifier);
        return identifier;
    }
    /**
     * Load current user information
     */
    async loadCurrentUser() {
        try {
            // Get current user from AuthManager
            // RED-LINE: Use imported AuthManager, NOT window.AuthManager
            if (typeof AuthManager !== 'undefined') {
                const authManager = new AuthManager();
                const user = authManager.getCurrentUser();
                if (user) {
                    // Extract user ID (could be id, user_id, or uuid)
                    this.currentUserId = user.id || user.user_id || user.uuid || null;
                    this.currentUserEmail = user.email || null;
                    console.log('Timeline: Current user loaded', {
                        userId: this.currentUserId,
                        email: this.currentUserEmail
                    });
                }
                else {
                    // Try to get from window.currentUser (fallback)
                    if (window.currentUser) {
                        this.currentUserId = window.currentUser.id || null;
                        this.currentUserEmail = window.currentUser.email || null;
                        console.log('Timeline: Using window.currentUser fallback');
                    }
                }
            }
            else if (window.currentUser) {
                // Fallback to window.currentUser
                this.currentUserId = window.currentUser.id || null;
                this.currentUserEmail = window.currentUser.email || null;
                console.log('Timeline: Using window.currentUser (AuthManager not available)');
            }
            // Fetch user's communities
            if (this.currentUserId) {
                try {
                    const response = await fetch(`/api/users/${this.currentUserId}/communities`, {
                        headers: this.query.getAuthHeaders()
                    });
                    if (response.ok) {
                        const data = await response.json();
                        this.currentUserCommunities = data.communities || data || [];
                    }
                }
                catch (error) {
                    console.warn('Timeline: Failed to fetch user communities', error);
                    this.currentUserCommunities = [];
                }
            }
        }
        catch (error) {
            console.error('Timeline: Error loading current user', error);
            this.currentUserId = null;
            this.currentUserCommunities = [];
        }
    }
    /**
     * Load timeline for a profile
     */
    async loadTimeline(identifier, options = {}) {
        console.log('TimelineApp: loadTimeline called with identifier:', identifier, 'options:', options);
        try {
            this.showLoading();
            console.log('TimelineApp: Loading state shown');
            // Check cache first
            const cached = this.cache.get(identifier);
            if (cached) {
                console.log('TimelineApp: Using cached timeline data');
                this.timelineManager.setTimeline(identifier, cached);
                await this.renderTimeline(identifier);
                this.hideLoading();
                return;
            }
            console.log('TimelineApp: Fetching timeline from API...');
            // Fetch from API
            const response = await this.query.getTimeline(identifier, {
                persistence: options.persistence || 'all',
                community: options.community || null,
                search: options.search || null,
                activityTypes: options.activityTypes || [],
                page: options.page || 1,
                limit: options.limit || 50
            });
            console.log('TimelineApp: API response received:', response);
            console.log('TimelineApp: Timeline data received', {
                userId: response.userId,
                activitiesCount: response.timeline?.activities?.length || 0,
                timeline: response.timeline
            });
            // Store in cache
            this.cache.set(identifier, response.timeline);
            // Update timeline manager
            this.timelineManager.setTimeline(identifier, response.timeline);
            this.currentProfileId = response.userId;
            // Update profile header with user info (now async)
            await this.updateProfileHeader(response.userId);
            // Render timeline (now async)
            await this.renderTimeline(identifier);
            this.hideLoading();
        }
        catch (error) {
            console.error('Error loading timeline:', error);
            this.showError(error.message);
            this.hideLoading();
        }
    }
    /**
     * Render timeline
     */
    async renderTimeline(identifier) {
        const timeline = this.timelineManager.getTimeline(identifier);
        console.log('TimelineApp: Rendering timeline for', identifier, timeline);
        if (!timeline) {
            console.warn('TimelineApp: No timeline data found for', identifier);
            this.showEmptyState();
            return;
        }
        // Check if activities exist and have length
        const activities = timeline.activities || [];
        if (activities.length === 0) {
            console.log('TimelineApp: Timeline has no activities');
            this.showEmptyState();
            return;
        }
        console.log('TimelineApp: Rendering', activities.length, 'activities');
        this.hideEmptyState();
        // Remove loading state
        const loadingState = document.querySelector('.loading-state');
        if (loadingState) {
            loadingState.remove();
        }
        await this.timelineView.render(timeline, {
            mode: this.viewMode,
            profileId: identifier
        });
    }
    /**
     * Add profile to multi-profile view
     */
    async addProfile(identifier) {
        if (this.multiProfileIds.length >= 4) {
            alert('Maximum 4 profiles allowed in multi-profile view');
            return;
        }
        if (this.multiProfileIds.includes(identifier)) {
            return; // Already added
        }
        this.multiProfileIds.push(identifier);
        await this.loadTimeline(identifier);
        this.switchToMultiProfileView();
    }
    /**
     * Remove profile from multi-profile view
     */
    removeProfile(identifier) {
        this.multiProfileIds = this.multiProfileIds.filter(id => id !== identifier);
        if (this.multiProfileIds.length === 0) {
            this.switchToSingleProfileView();
        }
        else {
            this.renderMultiProfileView();
        }
    }
    /**
     * Switch to single profile view
     */
    switchToSingleProfileView() {
        this.viewMode = 'single';
        const singleView = document.getElementById('single-profile-view');
        const multiView = document.getElementById('multi-profile-view');
        if (singleView)
            singleView.classList.remove('hidden');
        if (multiView)
            multiView.classList.add('hidden');
    }
    /**
     * Switch to multi-profile view
     */
    switchToMultiProfileView() {
        this.viewMode = 'multi';
        const singleView = document.getElementById('single-profile-view');
        const multiView = document.getElementById('multi-profile-view');
        if (singleView)
            singleView.classList.add('hidden');
        if (multiView)
            multiView.classList.remove('hidden');
        this.renderMultiProfileView();
    }
    /**
     * Render multi-profile view
     */
    renderMultiProfileView() {
        // TODO: Render side-by-side timeline columns that mirror the single-profile layout:
        //       - include a profile header block (avatar, displayName, handle) plus a "remove" button per column
        //       - reuse TimelineView for the actual activity cards to keep visuals consistent
        //       - collapse to stacked columns below 768px (same responsive breakpoint as sidepanel)
        //       - surface per-column loading/empty/error states while additional profiles load
        const columnsContainer = document.getElementById('multi-profile-columns');
        if (!columnsContainer)
            return;
        columnsContainer.innerHTML = '';
        this.multiProfileIds.forEach(profileId => {
            const column = document.createElement('div');
            column.className = 'profile-column';
            column.dataset.profileId = profileId;
            const timeline = this.timelineManager.getTimeline(profileId);
            if (timeline) {
                const view = new TimelineView(column, this.timelineManager);
                view.render(timeline, { mode: 'single', profileId });
            }
            columnsContainer.appendChild(column);
        });
    }
    /**
     * Set up real-time subscriptions
     */
    async setupRealtime() {
        if (!this.realtimeManager)
            return;
        if (this.currentProfileId) {
            await this.realtimeManager.subscribeToUser(this.currentProfileId);
        }
        // Subscribe to all profiles in multi-profile view
        for (const profileId of this.multiProfileIds) {
            await this.realtimeManager.subscribeToUser(profileId);
        }
        // Listen for timeline updates
        this.timelineManager.on('timeline:updated', (data) => {
            if (data.userId) {
                this.renderTimeline(data.userId);
            }
        });
    }
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Add profile button
        const addProfileBtn = document.getElementById('add-profile-btn');
        if (addProfileBtn) {
            addProfileBtn.addEventListener('click', () => {
                this.profileSelector.show();
            });
        }
        // Persistence selector
        const persistenceSelect = document.getElementById('persistence-select');
        if (persistenceSelect) {
            persistenceSelect.addEventListener('change', (e) => {
                const persistence = e.target.value;
                if (this.currentProfileId) {
                    this.loadTimeline(this.currentProfileId, { persistence });
                }
            });
        }
        // Profile selector events
        this.profileSelector.on('profile:selected', (identifier) => {
            this.addProfile(identifier);
            this.profileSelector.hide();
        });
    }
    /**
     * Show loading state
     */
    showLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
    }
    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
    /**
     * Show empty state
     */
    showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
    }
    /**
     * Hide empty state
     */
    hideEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
    }
    /**
     * Show error state
     */
    showError(message) {
        const errorState = document.getElementById('error-state');
        if (errorState) {
            const errorMessage = errorState.querySelector('p');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            errorState.classList.remove('hidden');
        }
    }
    /**
     * Update profile header with user information
     */
    async updateProfileHeader(userId) {
        try {
            // Fetch user profile data from timeline response or API
            // First try to get from timeline data if available
            const timeline = this.timelineManager.getTimeline(userId);
            if (timeline && timeline.activities && timeline.activities.length > 0) {
                const firstActivity = timeline.activities[0];
                const user = firstActivity.data?.user;
                if (user) {
                    await this.renderProfileHeader(user);
                    return;
                }
            }
            // Fallback: fetch from API
            const response = await fetch(`/v1/users/${userId}`, {
                headers: this.query.getAuthHeaders()
            });
            if (response.ok) {
                const user = await response.json();
                await this.renderProfileHeader(user);
            }
        }
        catch (error) {
            console.error('TimelineApp: Error updating profile header:', error);
        }
    }
    /**
     * Render profile header with user data
     */
    async renderProfileHeader(user) {
        const avatarEl = document.getElementById('profile-header-avatar');
        const nameEl = document.getElementById('profile-header-name');
        const handleEl = document.getElementById('profile-header-handle');
        const modelEl = document.getElementById('profile-header-model');
        if (avatarEl) {
            // RED-LINE: Use imported AvatarUtils, NOT window.AvatarUtils (extension may not be loaded)
            if (AvatarUtils && typeof AvatarUtils.createUnifiedAvatar === 'function') {
                try {
                    const avatarHTML = await AvatarUtils.createUnifiedAvatar(user, 'profile', {
                        size: 80,
                        showAura: true,
                        showStatus: false
                    });
                    avatarEl.innerHTML = avatarHTML;
                }
                catch (error) {
                    console.warn('TimelineApp: AvatarUtils failed for profile header, using fallback:', error);
                    this.renderProfileHeaderFallback(user, avatarEl);
                }
            }
            else {
                // Fallback if AvatarUtils not available
                this.renderProfileHeaderFallback(user, avatarEl);
            }
        }
        if (nameEl) {
            nameEl.textContent = user.name || user.handle || 'Unknown';
        }
        if (handleEl) {
            handleEl.textContent = `@${user.handle || 'unknown'}`;
        }
        if (modelEl) {
            // TODO: Get actual model information
            modelEl.textContent = 'Model of X';
        }
    }
    renderProfileHeaderFallback(user, avatarEl) {
        // CRITICAL FIX: Parse aura color correctly - handle string values from API
        const auraColorRaw = user.auraColor || user.aura_color || '#98d416';
        const auraColor = typeof auraColorRaw === 'string' ? auraColorRaw : '#98d416';
        // CRITICAL FIX: Parse intensity correctly - handle string "0.5" from API
        const auraIntensityRaw = user.auraIntensity || user.aura_intensity || 0.5;
        const auraIntensity = typeof auraColorRaw === 'string' ? parseFloat(auraIntensityRaw.toString()) : (typeof auraIntensityRaw === 'number' ? auraIntensityRaw : 0.5);
        // Clear existing content
        avatarEl.innerHTML = '';
        // Use the EXACT same structure as message avatars for consistency
        avatarEl.style.position = 'relative';
        avatarEl.style.width = '80px';
        avatarEl.style.height = '80px';
        avatarEl.style.border = 'none';
        avatarEl.style.outline = 'none';
        avatarEl.style.boxShadow = 'none';
        // Create inner container
        const innerContainer = document.createElement('div');
        innerContainer.style.cssText = 'position: relative; width: 80px; height: 80px;';
        innerContainer.setAttribute('data-user-id', user.id || user.user_id || '');
        // Add aura ring - match AvatarUtils sizing: size + 4px, positioned at -2px
        // For 80px avatar: aura should be 84px (80 + 4), positioned at -2px
        const auraEl = document.createElement('div');
        auraEl.className = 'avatar-aura';
        auraEl.style.cssText = `position: absolute; top: -2px; left: -2px; width: 84px; height: 84px; border-radius: 50%; background-color: ${auraColor}; z-index: 1; border: 2px solid ${auraColor}; box-sizing: border-box; opacity: ${auraIntensity}; pointer-events: none;`;
        innerContainer.appendChild(auraEl);
        // Add avatar image or fallback
        if (user.avatarUrl || user.avatar_url) {
            const img = document.createElement('img');
            img.src = user.avatarUrl || user.avatar_url || '';
            img.alt = user.name || user.handle || 'Unknown';
            img.style.cssText = 'position: relative; z-index: 2; width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: none !important;';
            img.setAttribute('data-avatar-source', 'user_object_avatarUrl');
            img.setAttribute('data-user-id', user.id || user.user_id || '');
            img.onerror = function () {
                this.style.display = 'none';
                if (this.nextElementSibling) {
                    this.nextElementSibling.style.display = 'flex';
                }
            };
            innerContainer.appendChild(img);
        }
        // Add fallback
        const fallback = document.createElement('div');
        fallback.className = 'avatar-fallback';
        fallback.textContent = (user.name || user.handle || '?').charAt(0).toUpperCase();
        fallback.style.cssText = `position: relative; z-index: 2; width: 80px; height: 80px; border-radius: 50%; display: ${(user.avatarUrl || user.avatar_url) ? 'none' : 'flex'}; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; font-size: 32px;`;
        innerContainer.appendChild(fallback);
        avatarEl.appendChild(innerContainer);
    }
    /**
     * Handle filter changes
     */
    async handleFilterChange(filters) {
        if (this.currentProfileId) {
            await this.loadTimeline(this.currentProfileId, filters);
        }
    }
}
// Initialize app when DOM is ready
console.log('TimelineApp: Setting up initialization...');
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('TimelineApp: DOMContentLoaded fired, initializing app...');
        try {
            const app = new TimelineApp();
            window.timelineApp = app;
            app.init().catch(error => {
                console.error('TimelineApp: Initialization failed:', error);
                const errorState = document.getElementById('error-state');
                if (errorState) {
                    errorState.classList.remove('hidden');
                    const errorMessage = errorState.querySelector('p');
                    if (errorMessage) {
                        errorMessage.textContent = `Error: ${error.message}`;
                    }
                }
            });
        }
        catch (error) {
            console.error('TimelineApp: Failed to create app instance:', error);
        }
    });
}
else {
    // DOM already loaded
    console.log('TimelineApp: DOM already loaded, initializing app immediately...');
    try {
        const app = new TimelineApp();
        window.timelineApp = app;
        app.init().catch(error => {
            console.error('TimelineApp: Initialization failed:', error);
            const errorState = document.getElementById('error-state');
            if (errorState) {
                errorState.classList.remove('hidden');
                const errorMessage = errorState.querySelector('p');
                if (errorMessage) {
                    errorMessage.textContent = `Error: ${error.message}`;
                }
            }
        });
    }
    catch (error) {
        console.error('TimelineApp: Failed to create app instance:', error);
    }
}
//# sourceMappingURL=timeline-app.js.map
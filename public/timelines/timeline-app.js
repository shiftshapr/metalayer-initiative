/**
 * Timeline Application
 * Main entry point for timeline feature
 */

import { TimelineManager } from './modules/TimelineManager.js';
import { TimelineRealtime } from './modules/TimelineRealtime.js';
import { TimelineCache } from './modules/TimelineCache.js';
import { TimelineQuery } from './modules/TimelineQuery.js';
import { VisibilityManager } from './modules/VisibilityManager.js';
import { TimelineView } from './components/TimelineView.js';
import { ProfileSelector } from './components/ProfileSelector.js';
import { TimelineFilters } from './components/TimelineFilters.js';

/**
 * Timeline Application Class
 */
class TimelineApp {
  constructor() {
    // Initialize Supabase client
    this.supabaseClient = this.initSupabase();
    
    // Initialize core modules
    this.timelineManager = new TimelineManager();
    this.cache = new TimelineCache();
    this.query = new TimelineQuery();
    this.realtimeManager = new TimelineRealtime(
      this.supabaseClient,
      this.timelineManager
    );
    
    // Initialize UI components
    this.timelineView = new TimelineView(
      document.getElementById('timeline-items'),
      this.timelineManager
    );
    this.profileSelector = new ProfileSelector(
      document.getElementById('profile-selector-modal'),
      this
    );
    this.filters = new TimelineFilters(
      document.getElementById('timeline-filters'),
      this.timelineManager
    );

    // Current user info
    this.currentUserId = null;
    this.currentUserCommunities = [];

    // View state
    this.viewMode = 'single'; // 'single' | 'multi' | 'merged'
    this.currentProfileId = null;
    this.multiProfileIds = [];
  }

  /**
   * Initialize Supabase client
   */
  initSupabase() {
    // TODO: Initialize from config.js by mirroring the extension bootstrap:
    //       1. Wait for config.js to populate `window.SUPABASE_URL`, `window.SUPABASE_KEY`, and auth token.
    //       2. Invoke the shared factory in `presence/services/SupabaseService.js` so realtime sockets share auth/session.
    //       3. Ensure `AuthManager` has an active session before handing back the client (request one if needed).
    //       4. If the extension already set `window.supabaseRealtimeClient`, reuse it to avoid duplicate websockets.
    if (window.supabaseRealtimeClient) {
      return window.supabaseRealtimeClient;
    }
    
    // Fallback: create new client
    // TODO: Instantiate via the same helper as the extension so headers/tokens stay in sync with background auth.
    throw new Error('Supabase client not initialized. Load config.js first.');
  }

  /**
   * Initialize application
   */
  async init() {
    try {
      // Parse route to get profile identifier
      const identifier = this.parseRoute();
      
      if (!identifier) {
        this.showError('No profile specified in URL');
        return;
      }

      // Load current user info
      await this.loadCurrentUser();

      // Load timeline
      await this.loadTimeline(identifier);

      // Set up event listeners
      this.setupEventListeners();

      // Set up real-time subscriptions
      await this.setupRealtime();

    } catch (error) {
      console.error('Timeline app initialization error:', error);
      this.showError(error.message);
    }
  }

  /**
   * Parse route to extract profile identifier
   */
  parseRoute() {
    const path = window.location.pathname;
    const match = path.match(/\/timelines\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Load current user information
   */
  async loadCurrentUser() {
    // TODO: Replace placeholders by delegating to the unified auth flow:
    //       - call `window.AuthManager.getCurrentUser()` (same helper the extension uses) to obtain id/email/avatar
    //       - cache the auth headers (`X-User-Id`, `X-User-Email`, access token) for TimelineQuery + realtime modules
    //       - fetch communities via CommunitiesModule (or `/api/communities/me`) to populate `currentUserCommunities`
    this.currentUserId = null;
    this.currentUserCommunities = [];
  }

  /**
   * Load timeline for a profile
   */
  async loadTimeline(identifier, options = {}) {
    try {
      this.showLoading();

      // Check cache first
      const cached = this.cache.get(identifier);
      if (cached) {
        this.timelineManager.setTimeline(identifier, cached);
        this.renderTimeline(identifier);
        this.hideLoading();
        return;
      }

      // Fetch from API
      const response = await this.query.getTimeline(identifier, {
        persistence: options.persistence || 'all',
        community: options.community || null,
        search: options.search || null,
        activityTypes: options.activityTypes || [],
        page: options.page || 1,
        limit: options.limit || 50
      });

      // Store in cache
      this.cache.set(identifier, response.timeline);

      // Update timeline manager
      this.timelineManager.setTimeline(identifier, response.timeline);
      this.currentProfileId = response.userId;

      // Render timeline
      this.renderTimeline(identifier);

      this.hideLoading();

    } catch (error) {
      console.error('Error loading timeline:', error);
      this.showError(error.message);
      this.hideLoading();
    }
  }

  /**
   * Render timeline
   */
  renderTimeline(identifier) {
    const timeline = this.timelineManager.getTimeline(identifier);
    
    if (!timeline || timeline.activities.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();
    this.timelineView.render(timeline, {
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
    } else {
      this.renderMultiProfileView();
    }
  }

  /**
   * Switch to single profile view
   */
  switchToSingleProfileView() {
    this.viewMode = 'single';
    document.getElementById('single-profile-view').classList.remove('hidden');
    document.getElementById('multi-profile-view').classList.add('hidden');
  }

  /**
   * Switch to multi-profile view
   */
  switchToMultiProfileView() {
    this.viewMode = 'multi';
    document.getElementById('single-profile-view').classList.add('hidden');
    document.getElementById('multi-profile-view').classList.remove('hidden');
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
    if (this.currentProfileId) {
      await this.realtimeManager.subscribeToUser(this.currentProfileId);
    }

    // Subscribe to all profiles in multi-profile view
    for (const profileId of this.multiProfileIds) {
      await this.realtimeManager.subscribeToUser(profileId);
    }

    // Listen for timeline updates
    this.timelineManager.on('timeline:updated', (data) => {
      this.renderTimeline(data.userId);
    });
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Add profile button
    document.getElementById('add-profile-btn').addEventListener('click', () => {
      this.profileSelector.show();
    });

    // Persistence selector
    document.getElementById('persistence-select').addEventListener('change', (e) => {
      const persistence = e.target.value;
      if (this.currentProfileId) {
        this.loadTimeline(this.currentProfileId, { persistence });
      }
    });

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
    document.getElementById('loading-indicator').classList.remove('hidden');
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    document.getElementById('loading-indicator').classList.add('hidden');
  }

  /**
   * Show empty state
   */
  showEmptyState() {
    document.getElementById('empty-state').classList.remove('hidden');
  }

  /**
   * Hide empty state
   */
  hideEmptyState() {
    document.getElementById('empty-state').classList.add('hidden');
  }

  /**
   * Show error state
   */
  showError(message) {
    const errorState = document.getElementById('error-state');
    errorState.querySelector('p').textContent = message;
    errorState.classList.remove('hidden');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new TimelineApp();
  app.init();
  
  // Make app globally available for debugging
  window.timelineApp = app;
});


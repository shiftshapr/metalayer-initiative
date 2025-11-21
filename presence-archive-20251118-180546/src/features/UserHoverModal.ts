/**
 * UserHoverModal.ts
 * 
 * Displays a modal when hovering over message or visibility avatars.
 * Shows: mutual communities, headline, Add friend button (inactive), 
 * Message button (inactive), and avatar (with aura).
 * 
 * Architecture:
 * - Singleton pattern for modal management
 * - Event delegation for hover handlers
 * - API integration for mutual communities
 * - Unified avatar system integration
 */

import { User } from '../types/index.js';
import { Logger } from '../utils/Logger.js';

// Type declarations for window properties used by this module
declare const window: Window & typeof globalThis & {
  currentUser?: User;
  api?: {
    request<T = unknown>(url: string, options?: { method?: string; body?: string; allow404?: boolean }): Promise<{ data?: T; error?: string; status?: number } | null>;
    getCommunities?(): Promise<Community[]>;
  };
  AvatarUtils?: {
    createUnifiedAvatar(userData: User | { id?: string; name?: string; [key: string]: unknown }, context: string, options?: { size?: number; [key: string]: unknown }): Promise<string>;
  };
  currentVisibilityDataUnfiltered?: {
    active?: Array<{
      id?: string;
      userId?: string;
      user_id?: string;
      name?: string;
      handle?: string;
      displayName?: string;
      display_name?: string;
      avatarUrl?: string;
      auraColor?: string;
      aura_color?: string;
      headline?: string;
      communities?: Community[];
    }>;
  };
  getState?: <T = unknown>(key: string) => Promise<T | null>;
};

interface Community {
  id?: string;
  community_id?: string;
  communityId?: string;
  name?: string;
}

class UserHoverModal {
  private modal: HTMLElement | null = null;
  private currentUserId: string | null = null;
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private isVisible: boolean = false;
  private currentTarget: HTMLElement | null = null;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    console.log('🔧 USER_HOVER_MODAL: Initializing...');
  }

  /**
   * Initialize the hover modal system
   */
  async initialize(): Promise<void> {
    try {
      // Get current user ID
      if (window.currentUser && window.currentUser.id) {
        this.currentUserId = window.currentUser.id;
      }

      // Create modal HTML structure
      this.createModal();

      // Attach hover handlers to message avatars
      this.attachMessageAvatarHandlers();

      // Attach hover handlers to visibility avatars
      this.attachVisibilityAvatarHandlers();

      console.log('✅ USER_HOVER_MODAL: Initialized successfully');
    } catch (error) {
      console.error('❌ USER_HOVER_MODAL: Initialization failed:', error);
    }
  }

  /**
   * Create the modal HTML structure
   */
  createModal(): void {
    // Remove existing modal if present
    const existingModal = document.getElementById('user-hover-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.id = 'user-hover-modal';
    this.modal.className = 'user-hover-modal';
    this.modal.innerHTML = `
      <div class="user-hover-modal-content">
        <div class="user-hover-modal-header">
          <div class="user-hover-avatar-container" id="user-hover-avatar"></div>
          <div class="user-hover-user-info">
            <div class="user-hover-name" id="user-hover-name">Loading...</div>
            <div class="user-hover-headline" id="user-hover-headline"></div>
          </div>
        </div>
        <div class="user-hover-modal-body">
          <div class="user-hover-mutual-communities" id="user-hover-mutual-communities">
            <div class="user-hover-section-label">Mutual Communities</div>
            <div class="user-hover-communities-list" id="user-hover-communities-list">
              <div class="user-hover-loading">Loading...</div>
            </div>
          </div>
          <div class="user-hover-actions">
            <button class="user-hover-btn user-hover-btn-friend" id="user-hover-add-friend" disabled>
              <span class="user-hover-btn-icon">👤</span>
              <span class="user-hover-btn-text">Add Friend</span>
            </button>
            <button class="user-hover-btn user-hover-btn-message" id="user-hover-message" disabled>
              <span class="user-hover-btn-icon">💬</span>
              <span class="user-hover-btn-text">Message</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.appendChild(this.modal);

    // Add CSS if not already present
    this.injectStyles();

    // Keep modal visible when hovering over it
    this.modal.addEventListener('mouseenter', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    });

    this.modal.addEventListener('mouseleave', () => {
      this.hideTimeout = setTimeout(() => {
        this.hideModal();
      }, 200);
    });
  }

  /**
   * Inject CSS styles for the modal
   */
  injectStyles(): void {
    if (document.getElementById('user-hover-modal-styles')) {
      return; // Styles already injected
    }

    const style = document.createElement('style');
    style.id = 'user-hover-modal-styles';
    style.textContent = `
      .user-hover-modal {
        position: fixed;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        display: none;
      }

      .user-hover-modal.visible {
        opacity: 1;
        display: block;
        pointer-events: auto;
      }

      /* Keep modal visible when hovering over it */
      .user-hover-modal:hover {
        opacity: 1;
      }

      .user-hover-modal-content {
        background: var(--background, #ffffff);
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        min-width: 320px;
        max-width: 400px;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      [data-theme="dark"] .user-hover-modal-content {
        background: var(--background, #1e1e1e);
        border-color: var(--border-color, #333);
      }

      .user-hover-modal-header {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-color, #e0e0e0);
      }

      [data-theme="dark"] .user-hover-modal-header {
        border-bottom-color: var(--border-color, #333);
      }

      .user-hover-avatar-container {
        flex-shrink: 0;
        width: 64px;
        height: 64px;
      }

      .user-hover-user-info {
        flex: 1;
        min-width: 0;
      }

      .user-hover-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary, #000);
        margin-bottom: 4px;
        word-wrap: break-word;
      }

      [data-theme="dark"] .user-hover-name {
        color: var(--text-primary, #fff);
      }

      .user-hover-headline {
        font-size: 14px;
        color: var(--text-secondary, #666);
        line-height: 1.4;
        word-wrap: break-word;
      }

      [data-theme="dark"] .user-hover-headline {
        color: var(--text-secondary, #aaa);
      }

      .user-hover-modal-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .user-hover-mutual-communities {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .user-hover-section-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary, #666);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      [data-theme="dark"] .user-hover-section-label {
        color: var(--text-secondary, #aaa);
      }

      .user-hover-communities-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 120px;
        overflow-y: auto;
      }

      .user-hover-community-item {
        font-size: 14px;
        color: var(--text-primary, #000);
        padding: 4px 0;
      }

      [data-theme="dark"] .user-hover-community-item {
        color: var(--text-primary, #fff);
      }

      .user-hover-loading {
        font-size: 14px;
        color: var(--text-secondary, #666);
        font-style: italic;
      }

      .user-hover-actions {
        display: flex;
        gap: 8px;
      }

      .user-hover-btn {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid var(--border-color, #e0e0e0);
        border-radius: 8px;
        background: var(--background, #ffffff);
        color: var(--text-primary, #000);
        font-size: 14px;
        font-weight: 500;
        cursor: not-allowed;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        opacity: 0.6;
        transition: all 0.2s ease;
      }

      [data-theme="dark"] .user-hover-btn {
        background: var(--background, #1e1e1e);
        border-color: var(--border-color, #333);
        color: var(--text-primary, #fff);
      }

      .user-hover-btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .user-hover-btn-icon {
        font-size: 16px;
      }

      .user-hover-btn-text {
        font-size: 14px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Attach hover handlers to message avatars
   */
  attachMessageAvatarHandlers(): void {
    // Use event delegation for message avatars
    // Avatars created by AvatarUtils have data-user-id on the wrapper div
    document.addEventListener('mouseenter', (e: Event) => {
      const target = e.target as Element | null;
      // FIX: Check if target is an Element before calling closest()
      if (!target || typeof target.closest !== 'function') {
        return;
      }
      // Check for avatar-container or the wrapper div with data-user-id
      const avatarContainer = target.closest('.avatar-container[data-author-id]') ||
                              target.closest('[data-user-id]') as HTMLElement | null;
      if (avatarContainer && !avatarContainer.closest('.user-hover-modal') && 
          !avatarContainer.closest('#visibility-tab')) {
        const userId = avatarContainer.getAttribute('data-author-id') || 
                      avatarContainer.getAttribute('data-user-id');
        // FIX: Allow hover modal on own avatars to see what others see
        if (userId) {
          this.handleHover(e, userId, avatarContainer as HTMLElement);
        }
      }
    }, true);

    document.addEventListener('mouseleave', (e: Event) => {
      const target = e.target as Element | null;
      // FIX: Check if target is an Element before calling closest()
      if (!target || typeof target.closest !== 'function') {
        return;
      }
      const avatarContainer = target.closest('.avatar-container[data-author-id]') ||
                              target.closest('[data-user-id]') as HTMLElement | null;
      if (avatarContainer && !avatarContainer.closest('.user-hover-modal') &&
          !avatarContainer.closest('#visibility-tab')) {
        this.handleHoverOut(e as MouseEvent, avatarContainer as HTMLElement);
      }
    }, true);
  }

  /**
   * Attach hover handlers to visibility avatars
   */
  attachVisibilityAvatarHandlers(): void {
    // Use event delegation for visibility avatars
    // AvatarUtils creates avatars with data-user-id on the wrapper div
    document.addEventListener('mouseenter', (e: Event) => {
      const target = e.target as Element | null;
      // FIX: Check if target is an Element before calling closest()
      if (!target || typeof target.closest !== 'function') {
        return;
      }
      // Check for avatar in visibility tab
      const visibilityTab = target.closest('#visibility-tab');
      if (visibilityTab) {
        // AvatarUtils creates wrapper divs with data-user-id
        const avatarWrapper = target.closest('[data-user-id]') as HTMLElement | null;
        if (avatarWrapper && !avatarWrapper.closest('.user-hover-modal')) {
          const userId = avatarWrapper.getAttribute('data-user-id');
          if (userId && userId !== this.currentUserId) {
            this.handleHover(e as MouseEvent, userId, avatarWrapper);
          } else {
            // Fallback: Try to extract from visibility data by matching avatar URL
            const img = avatarWrapper.querySelector('img') as HTMLImageElement | null;
            if (img && img.src) {
              const userInVisibility = this.findUserByAvatarUrl(img.src);
              if (userInVisibility && userInVisibility.id !== this.currentUserId) {
                this.handleHover(e as MouseEvent, userInVisibility.id || '', avatarWrapper);
              }
            }
          }
        }
      }
    }, true);

    document.addEventListener('mouseleave', (e: Event) => {
      const target = e.target as Element | null;
      // FIX: Check if target is an Element before calling closest()
      if (!target || typeof target.closest !== 'function') {
        return;
      }
      const visibilityTab = target.closest('#visibility-tab');
      if (visibilityTab) {
        const avatarWrapper = target.closest('[data-user-id]') as HTMLElement | null;
        if (avatarWrapper && !avatarWrapper.closest('.user-hover-modal')) {
          this.handleHoverOut(e as MouseEvent, avatarWrapper);
        }
      }
    }, true);
  }

  /**
   * Find user in visibility data by avatar URL
   */
  findUserByAvatarUrl(avatarUrl: string): { id?: string } | null {
    if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
      const found = window.currentVisibilityDataUnfiltered.active.find((u: { id?: string; userId?: string; user_id?: string; [key: string]: unknown }) => {
        const uAvatarUrl = typeof u.avatarUrl === 'string' ? u.avatarUrl : undefined;
        return uAvatarUrl === avatarUrl || (uAvatarUrl && typeof avatarUrl === 'string' && avatarUrl.includes(uAvatarUrl.split('/').pop() || ''));
      });
      return found ? { id: found.id } : null;
    }
    return null;
  }

  /**
   * Handle hover enter event
   */
  handleHover(event: Event, userId: string, targetElement: HTMLElement | null) {
    // FIX: Don't show modal over profile avatar
    if (targetElement && (
      targetElement.closest('#user-avatar-container') ||
      targetElement.closest('.profile-avatar-container') ||
      targetElement.id === 'user-avatar-container'
    )) {
      return;
    }

    // Clear any existing timeouts
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    // Set current target
    this.currentTarget = targetElement;

    // Show modal after short delay
    this.hoverTimeout = setTimeout(async () => {
      if (targetElement) {
        await this.showModal(userId, targetElement);
      }
    }, 300); // 300ms delay before showing
  }

  /**
   * Handle hover leave event
   */
  handleHoverOut(event: MouseEvent, targetElement: HTMLElement): void {
    // Clear hover timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    // Check if mouse is moving to modal
    const relatedTarget = event.relatedTarget as Node | null;
    if (relatedTarget && this.modal && this.modal.contains(relatedTarget)) {
      // Mouse is moving to modal, don't hide
      return;
    }

    // Hide modal after short delay
    this.hideTimeout = setTimeout(() => {
      this.hideModal();
    }, 200); // 200ms delay before hiding
  }

  /**
   * Show the modal with user data
   */
  async showModal(userId: string, targetElement: HTMLElement): Promise<void> {
    try {
      console.log('🔍 USER_HOVER_MODAL: Showing modal for user:', userId);

      // Get user data
      const userData = await this.getUserData(userId);
      if (!userData) {
        console.warn('⚠️ USER_HOVER_MODAL: No user data found for:', userId);
        return;
      }

      // Update modal content
      await this.updateModalContent(userData);

      // Position modal
      this.positionModal(targetElement);

      // Show modal
      if (this.modal) {
        this.modal.classList.add('visible');
      }
      this.isVisible = true;

      // Fetch mutual communities
      this.loadMutualCommunities(userId);

      console.log('✅ USER_HOVER_MODAL: Modal shown');
    } catch (error) {
      console.error('❌ USER_HOVER_MODAL: Error showing modal:', error);
    }
  }

  /**
   * Hide the modal
   */
  hideModal(): void {
    if (this.modal) {
      this.modal.classList.remove('visible');
      this.isVisible = false;
      this.currentTarget = null;
    }
  }

  /**
   * Get user data from various sources
   * FIX: Ensure headline and displayName are fetched from all sources
   */
  async getUserData(userId: string): Promise<{
    id: string;
    name: string;
    displayName?: string | null;
    avatarUrl?: string;
    auraColor?: string;
    headline?: string | null;
    communities?: Community[];
  } | null> {
    let userData = null;
    
    // Try to get from visibility data first
    if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
      const userInVisibility = window.currentVisibilityDataUnfiltered.active.find((u: any) => 
        (u.id === userId || u.userId === userId || u.user_id === userId)
      );
      if (userInVisibility) {
        const legacyUser = userInVisibility as User & { userId?: string; user_id?: string; display_name?: string; aura_color?: string; headline?: string; communities?: unknown; handle?: string };
        userData = {
          id: userInVisibility.id || legacyUser.userId || legacyUser.user_id || '',
          name: userInVisibility.name || legacyUser.handle || 'Unknown User',
          displayName: userInVisibility.displayName || legacyUser.display_name || null,
          avatarUrl: userInVisibility.avatarUrl,
          auraColor: userInVisibility.auraColor || legacyUser.aura_color,
          headline: legacyUser.headline || null,
          communities: legacyUser.communities
        };
      }
    }

    // Try to get from API (will override visibility data if available)
    if (window.api && typeof window.api.request === 'function') {
      try {
        const response = await window.api.request(`/v1/users/${userId}`, {
          method: 'GET'
        });
        if (response) {
          // Merge API data with visibility data (API takes precedence)
          const responseData = response as Record<string, unknown>;
          userData = {
            id: (typeof responseData.id === 'string' ? responseData.id : undefined) || userId,
            name: (typeof responseData.name === 'string' ? responseData.name : undefined) || userData?.name || 'Unknown User',
            displayName: (typeof responseData.displayName === 'string' ? responseData.displayName : undefined) || (typeof responseData.display_name === 'string' ? responseData.display_name : undefined) || userData?.displayName || null,
            avatarUrl: (typeof responseData.avatar_url === 'string' ? responseData.avatar_url : undefined) || (typeof responseData.avatarUrl === 'string' ? responseData.avatarUrl : undefined) || userData?.avatarUrl,
            auraColor: (typeof responseData.aura_color === 'string' ? responseData.aura_color : undefined) || (typeof responseData.auraColor === 'string' ? responseData.auraColor : undefined) || userData?.auraColor,
            headline: (typeof responseData.headline === 'string' ? responseData.headline : undefined) || userData?.headline || null,
            communities: (Array.isArray(responseData.communities) ? responseData.communities as Community[] : undefined) || (userData?.communities && Array.isArray(userData.communities) ? userData.communities : undefined)
          };
        }
      } catch (error) {
        console.warn('⚠️ USER_HOVER_MODAL: API fetch failed:', error);
        // If API fails but we have visibility data, use that
        if (!userData) {
          return null;
        }
      }
    }

    return userData ? {
      ...userData,
      communities: userData.communities && Array.isArray(userData.communities) ? userData.communities : undefined
    } : null;
  }

  /**
   * Update modal content with user data
   */
  async updateModalContent(userData: {
    id: string;
    name: string;
    displayName?: string | null;
    avatarUrl?: string;
    auraColor?: string;
    headline?: string | null;
  }): Promise<void> {
    // Update name (use display name if available, otherwise name)
    const nameEl = document.getElementById('user-hover-name');
    if (nameEl) {
      nameEl.textContent = userData.displayName || userData.name || 'Unknown User';
    }

    // Update headline
    // Headline is text-only (textContent prevents HTML rendering)
    const headlineEl = document.getElementById('user-hover-headline');
    if (headlineEl) {
      if (userData.headline) {
        headlineEl.textContent = userData.headline;
        headlineEl.style.display = 'block';
      } else {
        headlineEl.textContent = '';
        headlineEl.style.display = 'none';
      }
    }

    // Update avatar
    const avatarContainer = document.getElementById('user-hover-avatar');
    if (avatarContainer && window.AvatarUtils) {
      try {
        const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(userData, 'profile', {
          size: 64,
          showAura: true,
          showStatus: true
        });
        avatarContainer.innerHTML = avatarHTML;
      } catch (error) {
        console.error('❌ USER_HOVER_MODAL: Error creating avatar:', error);
        // Fallback to simple img
        avatarContainer.innerHTML = `<img src="${userData.avatarUrl || ''}" alt="${userData.name}" style="width: 64px; height: 64px; border-radius: 50%;">`;
      }
    }
  }

  /**
   * Position the modal relative to the target element
   * FIX: Ensure modal doesn't go off page boundaries
   */
  positionModal(targetElement: HTMLElement): void {
    if (!this.modal || !targetElement) return;

    // Ensure modal is visible to get accurate dimensions
    this.modal.style.visibility = 'hidden';
    this.modal.style.display = 'block';
    
    const rect = targetElement.getBoundingClientRect();
    const modalRect = this.modal.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spacing = 12;
    const maxWidth = viewportWidth - (spacing * 2);
    const maxHeight = viewportHeight - (spacing * 2);

    // Constrain modal size to viewport
    if (modalRect.width > maxWidth) {
      this.modal.style.maxWidth = `${maxWidth}px`;
    }
    if (modalRect.height > maxHeight) {
      this.modal.style.maxHeight = `${maxHeight}px`;
    }

    // Recalculate after size constraints
    const finalModalRect = this.modal.getBoundingClientRect();

    let top = rect.bottom + spacing;
    let left = rect.left;

    // Adjust if modal goes off right edge
    if (left + finalModalRect.width > viewportWidth - spacing) {
      left = viewportWidth - finalModalRect.width - spacing;
    }

    // Adjust if modal goes off left edge
    if (left < spacing) {
      left = spacing;
    }

    // Adjust if modal goes off bottom edge (show above instead)
    if (top + finalModalRect.height > viewportHeight - spacing) {
      top = rect.top - finalModalRect.height - spacing;
      // If still off top, position at top of viewport
      if (top < spacing) {
        top = spacing;
      }
    }

    // Adjust if modal goes off top edge
    if (top < spacing) {
      top = spacing;
    }

    this.modal.style.top = `${top}px`;
    this.modal.style.left = `${left}px`;
    this.modal.style.visibility = 'visible';
  }

  /**
   * Load mutual communities for the user using the new backend endpoint
   * FIX: Ensure currentUserId is set before loading
   */
  async loadMutualCommunities(userId: string): Promise<void> {
    const communitiesListEl = document.getElementById('user-hover-communities-list');
    if (!communitiesListEl) return;

    // Show loading state
    communitiesListEl.innerHTML = '<div class="user-hover-loading">Loading...</div>';

    try {
      // Ensure currentUserId is set
      if (!this.currentUserId) {
        if (window.currentUser && window.currentUser.id) {
          this.currentUserId = window.currentUser.id;
        }
      }
      
      // Use the new mutual communities endpoint
      if (!this.currentUserId || !userId) {
        communitiesListEl.innerHTML = '<div class="user-hover-loading">Unable to load communities</div>';
        return;
      }

      if (window.api && typeof window.api.request === 'function') {
        const response = await window.api.request(`/communities/mutual?userId1=${encodeURIComponent(this.currentUserId)}&userId2=${encodeURIComponent(userId)}`, {
          method: 'GET'
        });

        const responseData = response as Record<string, unknown>;
        if (responseData && Array.isArray(responseData.communities)) {
          const mutualCommunities = responseData.communities as Community[];

          // Display mutual communities
          if (mutualCommunities.length === 0) {
            communitiesListEl.innerHTML = '<div class="user-hover-loading">No mutual communities</div>';
          } else {
            // Community names come from text form, safe to use innerHTML
            communitiesListEl.innerHTML = mutualCommunities.map((community: Community) => 
              `<div class="user-hover-community-item">${community.name || community.id}</div>`
            ).join('');
          }

          console.log('✅ USER_HOVER_MODAL: Loaded mutual communities:', mutualCommunities.length);
          return;
        }
      }

      // Fallback if API not available
      communitiesListEl.innerHTML = '<div class="user-hover-loading">Unable to load communities</div>';
    } catch (error) {
      console.error('❌ USER_HOVER_MODAL: Error loading mutual communities:', error);
      communitiesListEl.innerHTML = '<div class="user-hover-loading">Error loading communities</div>';
    }
  }

  /**
   * Get current user's communities (kept for backward compatibility, but not used for mutual communities)
   */
  async getCurrentUserCommunities(): Promise<Community[]> {
    try {
      // Try to get from state first (most reliable)
      if (window.getState && typeof window.getState === 'function') {
        const communitiesData = await window.getState('communities');
        if (communitiesData && Array.isArray(communitiesData) && communitiesData.length > 0) {
          console.log('✅ USER_HOVER_MODAL: Got communities from state:', communitiesData.length);
          return communitiesData;
        }
      }

      // Try to get from API using the correct endpoint
      if (window.api && typeof window.api.getCommunities === 'function') {
        const response = await window.api.getCommunities();
        if (response && Array.isArray(response) && response.length > 0) {
          console.log('✅ USER_HOVER_MODAL: Got communities from API:', response.length);
          return response;
        }
      }

      return [];
    } catch (error) {
      console.warn('⚠️ USER_HOVER_MODAL: Error getting current user communities:', error);
      return [];
    }
  }

  /**
   * Get user's communities from API (kept for backward compatibility, but not used for mutual communities)
   */
  async getUserCommunities(userId: string): Promise<Community[]> {
    try {
      // Try to get from visibility data first (if user is visible)
      if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
        const userInVisibility = window.currentVisibilityDataUnfiltered.active.find((u: any) => 
          (u.id === userId || u.userId === userId || u.user_id === userId)
        );
        const legacyUser = userInVisibility as User & { communities?: unknown };
        if (legacyUser && Array.isArray(legacyUser.communities)) {
          console.log('✅ USER_HOVER_MODAL: Got communities from visibility data:', legacyUser.communities.length);
          return legacyUser.communities;
        }
      }

      // Try the communities endpoint
      if (window.api && typeof window.api.request === 'function') {
        const response = await window.api.request(`/v1/users/${userId}/communities`, {
          method: 'GET',
          allow404: true
        });
        if (response && Array.isArray(response) && response.length > 0) {
          console.log('✅ USER_HOVER_MODAL: Got communities from user endpoint:', response.length);
          return response;
        }
        // If response is an object with communities array
        const responseData2 = response as Record<string, unknown>;
        if (responseData2 && Array.isArray(responseData2.communities) && responseData2.communities.length > 0) {
          return responseData2.communities;
        }
      }
      
      // Fallback: Try to get from user data if available
      const userData = await this.getUserData(userId);
      if (userData && userData.communities && Array.isArray(userData.communities) && userData.communities.length > 0) {
        return userData.communities;
      }
      
      return [];
    } catch (error) {
      console.warn('⚠️ USER_HOVER_MODAL: Error getting user communities:', error);
      return [];
    }
  }

  /**
   * Find mutual communities between two users
   */
  findMutualCommunities(user1Communities: Community[], user2Communities: Community[]): Community[] {
    if (!user1Communities || !user2Communities || 
        !Array.isArray(user1Communities) || !Array.isArray(user2Communities)) {
      console.warn('⚠️ USER_HOVER_MODAL: Invalid communities arrays for comparison');
      return [];
    }

    const user1Ids = new Set(user1Communities.map(c => c.id || c.community_id || c.communityId));
    const mutual = user2Communities.filter(c => {
      const id = c.id || c.community_id || c.communityId;
      return id && user1Ids.has(id);
    });

    console.log('🔍 USER_HOVER_MODAL: Comparing communities:', {
      user1Count: user1Communities.length,
      user2Count: user2Communities.length,
      mutualCount: mutual.length,
      user1Ids: Array.from(user1Ids),
      user2Ids: user2Communities.map(c => c.id || c.community_id || c.communityId)
    });

    return mutual;
  }
}

// Create singleton instance
const userHoverModalInstance = new UserHoverModal();

// Export as ES6 module (pure - no window exports needed for re-launch)
export { UserHoverModal, userHoverModalInstance };
export default UserHoverModal;


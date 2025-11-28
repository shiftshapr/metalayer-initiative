/**
 * VISIBILITY MANAGER - Core Business Logic (Refactored)
 * 
 * Phase 2: Core Logic Separation
 * - Removed UI logic (moved to UI layer)
 * - Uses dependency injection
 * - Uses VisibilityState instead of window globals
 * - Uses IVisibilityRealtime interface
 */

import type { IVisibilityRealtime, VisibilityUser } from './VisibilityTypes.js';
import { VisibilityState } from './VisibilityState.js';
import { 
  normalizeVisibilityUsers, 
  filterCurrentUser 
} from '../utils/visibilityHelpers.js';
import { AVATAR_FALLBACK_COLOR } from '../../../core/ConfigModule.js';
import { Logger } from '../../../utils/Logger.js';
import { 
  formatUserDisplayName, 
  formatUserHandle, 
  getAuraColorValue, 
  getUserIdentity 
} from '../../../utils/Fallbacks.js';

/**
 * Refactored VisibilityManager
 * Business logic only - no UI concerns
 */
export class VisibilityManager {
  private currentUserId: string | null = null; // ROOT CAUSE FIX: Use UUID, not email
  private currentUserEmail: string | null = null; // Keep for filtering compatibility
  private currentPageId: string | null = null;
  private isActive: boolean = false;
  private realtime: IVisibilityRealtime;
  private logger: Logger;
  private state: VisibilityState;

  constructor(
    realtime: IVisibilityRealtime,
    logger: Logger,
    state?: VisibilityState
  ) {
    this.realtime = realtime;
    this.logger = logger;
    this.state = state || new VisibilityState();
  }

  /**
   * Initialize visibility manager - REFACTOR PHASE 1: Single Initialization Point
   * 
   * Requirements:
   * - currentUserId MUST be a valid AppUser UUID (not Google ID)
   * - Can only be called once (initialization guard)
   * - Called ONLY by BootController.handleUserChange()
   */
  async initialize(currentUserId: string): Promise<void> {
    // REFACTOR PHASE 1: Initialization guard - prevent double initialization
    if (this.isActive) {
      this.logger.warn('VISIBILITY_INIT', { 
        message: 'VisibilityManager already initialized - ignoring duplicate call',
        currentUserId,
        existingUserId: this.currentUserId
      });
      return; // Already initialized, don't re-initialize
    }
    
    // REFACTOR PHASE 1: UUID validation - fail clearly if invalid
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(currentUserId)) {
      const error = new Error(`Invalid UUID format: ${currentUserId}. Expected AppUser UUID, not Google ID.`);
      this.logger.error('VISIBILITY_INIT', { 
        error: error.message,
        currentUserId,
        message: 'UUID validation failed - this is a root cause issue'
      });
      throw error; // Fail clearly - don't accept invalid UUIDs
    }
    
    try {
      this.logger.info('VISIBILITY_INIT', { 
        currentUserId,
        message: 'Initializing VisibilityManager with validated UUID'
      });
      
      this.currentUserId = currentUserId; // AppUser UUID from database
      this.isActive = true;
      
      // Update state - UUID is primary identifier
      this.state.setIsActive(true);
      
      // Set up real-time event handlers
      this.realtime.on('presence', (eventType: string, newRecord: unknown, oldRecord: unknown) => {
        this.handlePresenceEvent(eventType, newRecord as VisibilityUser, oldRecord as VisibilityUser);
      });
      
      this.logger.info('VISIBILITY_INIT', { 
        success: true, 
        userId: currentUserId,
        message: 'VisibilityManager initialized successfully'
      });
    } catch (error: unknown) {
      // Reset state on error
      this.isActive = false;
      this.currentUserId = null;
      this.state.setIsActive(false);
      
      this.logger.error('VISIBILITY_INIT', { 
        error: error instanceof Error ? error.message : String(error),
        currentUserId,
        message: 'Initialization failed - state reset'
      });
      throw error;
    }
  }

  /**
   * Set current user email for filtering compatibility
   */
  setCurrentUserEmail(email: string | null): void {
    this.currentUserEmail = email;
    if (this.state) {
      this.state.setCurrentUserEmail(email);
    }
  }

  /**
   * Refresh visibility data for a page
   * Returns users - UI layer handles rendering
   */
  async refreshVisibilityAvatars(pageId: string): Promise<VisibilityUser[]> {
    try {
      this.logger.info('VISIBILITY_REFRESH', { pageId, isActive: this.isActive, currentUserId: this.currentUserId });
      
      // ROOT CAUSE FIX: If not active, try to initialize using currentUserId (UUID) from state
      if (!this.isActive) {
        this.logger.warn('VISIBILITY', 'Manager not active, attempting to initialize');
        
        // Try to get current user ID (UUID) from state or window
        let userId: string | null = this.currentUserId;
        
        if (!userId && typeof window !== 'undefined') {
          const win = window as Window & { 
            currentUser?: { id?: string };
            stateManagerInstance?: { getState?: (key: string) => Promise<unknown> };
          };
          
          // Try window.currentUser (legacy)
          userId = win.currentUser?.id || null;
          
          // Try stateManager
          if (!userId && win.stateManagerInstance) {
            try {
              const currentUser = await win.stateManagerInstance.getState('currentUser') as { id?: string } | null;
              userId = currentUser?.id || null;
            } catch (error) {
              this.logger.warn('VISIBILITY', 'Failed to get user from stateManager', { error });
            }
          }
        }
        
        if (userId) {
          try {
            await this.initialize(userId);
            this.logger.info('VISIBILITY', 'Manager initialized during refresh', { userId });
          } catch (error) {
            this.logger.error('VISIBILITY', 'Failed to initialize during refresh', { error });
            return [];
          }
        } else {
          this.logger.warn('VISIBILITY', 'Cannot initialize - no user ID (UUID) available');
          return [];
        }
      }
      
      // Get users from realtime service
      const users = await this.realtime.getPageUsers(pageId);
      this.logger.debug('Query returned users', { count: users.length, users: users.map(u => ({ email: u.email, id: u.id })) });
      
      // Update current page ID in manager and state
      this.setCurrentPage(pageId);
      
      if (users && users.length > 0) {
        // Fetch avatar URLs for users
        const usersWithAvatars = await this.fetchUserAvatars(users);
        this.logger.debug('Users with avatars', { count: usersWithAvatars.length, emails: usersWithAvatars.map(u => u.email) });
        
        // REFACTOR PHASE 1: Filtering logic - ensure currentUserId is set
        if (!this.currentUserId) {
          this.logger.warn('VISIBILITY_REFRESH', {
            message: 'Cannot filter current user - currentUserId is not set',
            isActive: this.isActive,
            userCount: usersWithAvatars.length
          });
          // Don't filter if currentUserId is missing - this is a root cause issue
          // But continue with all users rather than failing silently
        }
        
        // UUID ONLY - filter by UUID, not email
        // filterCurrentUser function uses UUID only (email parameter is ignored)
        const filteredUsers = filterCurrentUser(
          usersWithAvatars,
          null, // Email parameter is deprecated/ignored - UUID only
          this.currentUserId // UUID is required for filtering
        );
        this.logger.debug('After filtering current user', { 
          beforeFilter: usersWithAvatars.length, 
          afterFilter: filteredUsers.length,
          currentUserId: this.currentUserId,
          currentUserEmail: this.currentUserEmail,
          filteredEmails: filteredUsers.map(u => u.email),
          allUserEmails: usersWithAvatars.map(u => ({ id: u.id, email: u.email, name: u.name }))
        });
        
        // Normalize users
        const normalizedUsers = normalizeVisibilityUsers(filteredUsers);
        this.logger.debug('After normalization', { count: normalizedUsers.length });
        
        // Update state (not UI - UI layer subscribes to state)
        this.state.setUsers(normalizedUsers);
        
        this.logger.info('VISIBILITY_REFRESH', {
          totalUsers: users.length,
          visibleUsers: normalizedUsers.length
        });
        
        return normalizedUsers;
      } else {
        // Clear state
        this.state.setUsers([]);
        this.logger.debug('No users found, clearing visibility');
        return [];
      }
    } catch (error: unknown) {
      this.logger.error('VISIBILITY_REFRESH', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Fetch avatar URLs for users
   */
  private async fetchUserAvatars(users: VisibilityUser[]): Promise<VisibilityUser[]> {
    try {
      this.logger.debug('Fetching avatar URLs for users', { count: users.length });
      const usersWithAvatars = await Promise.all(users.map(async (user) => {
        try {
          // UUID ONLY - use user.id (UUID) to get profile, never email
          if (!user.id) {
            this.logger.warn('VISIBILITY', 'No UUID available for user - using fallback', { hasName: !!user.name });
            return {
              id: getUserIdentity(user),
              email: user.email, // Keep email for display only, not for matching
              name: user.name || formatUserDisplayName(user) || 'Unknown',
              handle: user.handle || formatUserHandle(user) || 'unknown',
              avatarUrl: user.avatarUrl || undefined,
              auraColor: user.auraColor || getAuraColorValue({}, AVATAR_FALLBACK_COLOR),
              communityId: (typeof window !== 'undefined' && 
                (window as Window & { activeCommunities?: string[] }).activeCommunities?.[0]) || undefined,
              lastSeen: user.lastSeen,
              isActive: user.isActive,
              pageId: user.pageId || user.page_id
            } as VisibilityUser;
          }
          
          // UUID ONLY - get profile by UUID
          const userProfile = await this.realtime.getUserProfile(user.id);
          return {
            id: getUserIdentity(user),
            email: user.email,
            name: formatUserDisplayName({ name: userProfile?.name, email: user.email, handle: userProfile?.handle }),
            handle: formatUserHandle({ handle: userProfile?.handle, email: user.email }),
            avatarUrl: userProfile?.avatarUrl || undefined,
            auraColor: getAuraColorValue(userProfile, AVATAR_FALLBACK_COLOR),
            communityId: (typeof window !== 'undefined' && 
              (window as Window & { activeCommunities?: string[] }).activeCommunities?.[0]) || undefined,
            lastSeen: user.lastSeen,
            isActive: user.isActive,
            pageId: user.pageId || user.page_id // Support both during migration
          } as VisibilityUser;
        } catch (error: unknown) {
          this.logger.warn('VISIBILITY', 'Failed to fetch avatar for user', {
            userId: user.id,
            error: error instanceof Error ? error.message : String(error)
          });
          // Return basic user data without avatar
          return {
            id: getUserIdentity(user),
            email: user.email,
            name: formatUserDisplayName(user),
            handle: formatUserHandle(user),
            avatarUrl: undefined,
            auraColor: getAuraColorValue({}, AVATAR_FALLBACK_COLOR),
            communityId: (typeof window !== 'undefined' && 
              (window as Window & { activeCommunities?: string[] }).activeCommunities?.[0]) || undefined,
            lastSeen: user.lastSeen,
            isActive: user.isActive,
            pageId: user.pageId || user.page_id // Support both during migration
          } as VisibilityUser;
        }
      }));
      this.logger.debug('Users with avatars fetched', { count: usersWithAvatars.length });
      return usersWithAvatars;
    } catch (error: unknown) {
      this.logger.error('VISIBILITY', 'Failed to fetch user avatars', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Handle presence events from realtime service
   */
  private handlePresenceEvent(eventType: string, newRecord: VisibilityUser, oldRecord: VisibilityUser): void {
    try {
      this.logger.debug('Processing presence event', {
        eventType,
        userId: newRecord?.id || oldRecord?.id,
        pageId: newRecord?.pageId || newRecord?.page_id || oldRecord?.pageId || oldRecord?.page_id
      });
      
      // Only process events for current page
      const eventPageId = newRecord?.pageId || newRecord?.page_id || oldRecord?.pageId || oldRecord?.page_id;
      if (this.currentPageId && eventPageId !== this.currentPageId) {
        this.logger.debug('Ignoring event from different page', {
          eventPageId,
          currentPageId: this.currentPageId
        });
        return;
      }
      
      // Refresh visibility for current page
      if (this.currentPageId) {
        this.refreshVisibilityAvatars(this.currentPageId);
      }
    } catch (error: unknown) {
      this.logger.error('VISIBILITY', 'Failed to handle presence event', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Set current page ID
   */
  setCurrentPage(pageId: string): void {
    this.currentPageId = pageId;
    this.state.setCurrentPageId(pageId);
    this.logger.debug('Current page set', { pageId });
  }

  /**
   * Get current visibility data from state
   */
  getCurrentVisibilityData(): VisibilityUser[] {
    return this.state.getUsers();
  }

  /**
   * Get visibility state instance (for UI layer subscription)
   */
  getState(): VisibilityState {
    return this.state;
  }

  /**
   * Get manager status
   */
  getStatus(): { isActive: boolean; currentUserId: string | null; currentUserEmail: string | null; currentPageId: string | null; visibleUsers: number } {
    return {
      isActive: this.isActive,
      currentUserId: this.currentUserId, // ROOT CAUSE FIX: Return UUID
      currentUserEmail: this.currentUserEmail,
      currentPageId: this.currentPageId,
      visibleUsers: this.state.getUsers().length
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      this.isActive = false;
      this.currentUserId = null; // ROOT CAUSE FIX: Clear UUID
      this.currentUserEmail = null;
      this.currentPageId = null;
      this.state.reset();
      this.logger.info('VISIBILITY', 'Cleanup completed');
    } catch (error: unknown) {
      this.logger.error('VISIBILITY', 'Cleanup failed', { error: error instanceof Error ? error.message : String(error) });
    }
  }
}


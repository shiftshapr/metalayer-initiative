/**
 * VISIBILITY MANAGER - TypeScript Version
 * Centralized Visibility System
 * 
 * Handles:
 * - Real-time visibility tracking
 * - User presence management
 * - Time trace formatting (delegates to VisibilityTraceFormatter)
 */

import { Logger } from '../../../utils/Logger.js';
import { VisibilityTraceFormatter, type TraceLimitConfig } from '../../../utils/VisibilityTraceFormatter.js';

export interface IVisibilityRealtime {
  getPageUsers: (pageId: string) => Promise<Array<{
    id?: string;
    email?: string;
    name?: string;
    handle?: string;
    avatarUrl?: string;
    lastSeen?: string;
    isActive?: boolean;
    page_id?: string;
    pageId?: string;
    [key: string]: unknown;
  }>>;
  getUserProfile: (userEmail: string) => Promise<{
    name?: string;
    handle?: string;
    avatarUrl?: string;
    auraColor?: string;
    [key: string]: unknown;
  } | null>;
  on: (event: string, callback: (eventType: string, newRecord: unknown, oldRecord: unknown) => void) => void;
}

export interface VisibilityUser {
  id: string;
  email?: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  auraColor?: string;
  lastSeen?: string;
  isActive?: boolean;
  page_id?: string;
  pageId?: string;
  enterTime?: string;
  onlineAt?: string;
  [key: string]: unknown;
}

export class VisibilityManager {
  private currentVisibilityData: VisibilityUser[] = [];
  private currentUserEmail: string | null = null;
  private currentPageId: string | null = null;
  private isActive: boolean = false;
  private supabase: IVisibilityRealtime;
  private logger: typeof Logger;
  private visibilityState: { getUsers: () => VisibilityUser[]; setUsers: (users: VisibilityUser[]) => void } | null = null;
  private traceLimitConfig: TraceLimitConfig = { limit: 30 }; // Default 30 days

  constructor(
    supabaseService: IVisibilityRealtime,
    logger: typeof Logger = Logger,
    visibilityState?: { getUsers: () => VisibilityUser[]; setUsers: (users: VisibilityUser[]) => void } | null
  ) {
    this.supabase = supabaseService;
    this.logger = logger;
    this.visibilityState = visibilityState || null;
  }

  /**
   * Initialize visibility manager
   */
  async initialize(currentUserEmail: string): Promise<void> {
    try {
      this.logger.debug?.('VISIBILITY_INIT', { currentUserEmail }, 'visibility');
      this.currentUserEmail = currentUserEmail;
      this.isActive = true;

      // Load trace limit from preferences
      await this.loadTraceLimit();

      // Set up real-time event handlers
      this.supabase.on('presence', (eventType: string, newRecord: unknown, oldRecord: unknown) => {
        this.handlePresenceEvent(eventType, newRecord, oldRecord);
      });

      this.logger.debug?.('VISIBILITY_INIT', { success: true }, 'visibility');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error?.('VISIBILITY_INIT', { error: errorMessage }, 'visibility');
      throw error;
    }
  }

  /**
   * Load trace limit from user preferences
   */
  private async loadTraceLimit(): Promise<void> {
    try {
      const win = window as Window & {
        userPreferencesManager?: {
          getPreference: (key: string) => Promise<number | null>;
        };
      };

      if (win.userPreferencesManager) {
        const limit = await win.userPreferencesManager.getPreference('visibilityTraceLimit');
        // Validate and cast to number
        const limitValue = typeof limit === 'number' ? limit : (limit !== null && limit !== undefined ? Number(limit) : 30);
        if (isNaN(limitValue)) {
          this.traceLimitConfig = { limit: 30 }; // Default to 30 days if invalid
        } else {
          this.traceLimitConfig = { limit: limitValue };
        }
        this.logger.debug?.('VISIBILITY: Trace limit loaded', { limit: this.traceLimitConfig.limit }, 'visibility');
      }
    } catch (error: unknown) {
      this.logger.warn?.('VISIBILITY: Failed to load trace limit, using default', error, 'visibility');
    }
  }

  /**
   * Refresh visibility avatars for a page
   */
  async refreshVisibilityAvatars(pageId: string): Promise<void> {
    try {
      this.logger.debug?.('VISIBILITY_REFRESH', { pageId }, 'visibility');

      if (!this.isActive) {
        this.logger.warn?.('VISIBILITY', 'Manager not active, skipping refresh', 'visibility');
        return;
      }

      // Get users from Supabase
      const users = await this.supabase.getPageUsers(pageId);
      this.logger.debug?.('Enhanced query returned users', { count: users.length }, 'visibility');

      if (users && users.length > 0) {
        // Fetch avatar URLs for users
        const usersWithAvatars = await this.fetchUserAvatars(users);
        // Filter out current user
        const filteredUsers = this.filterCurrentUser(usersWithAvatars);
        // Update UI
        await this.updateVisibilityUI(filteredUsers);
        this.logger.debug?.('VISIBILITY_REFRESH', {
          totalUsers: users.length,
          visibleUsers: filteredUsers.length
        }, 'visibility');
      } else {
        await this.updateVisibilityUI([]);
        this.logger.debug?.('No users found, clearing visibility', null, 'visibility');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error?.('VISIBILITY_REFRESH', { error: errorMessage }, 'visibility');
      throw error;
    }
  }

  /**
   * Fetch user avatars and profile data
   */
  private async fetchUserAvatars(users: Array<{ id?: string; email?: string; [key: string]: unknown }>): Promise<VisibilityUser[]> {
    try {
      this.logger.debug?.('Fetching avatar URLs for users', { count: users.length }, 'visibility');

      const usersWithAvatars = await Promise.all(users.map(async (user) => {
        try {
          const userEmail = (user.email || user.id) as string;
          if (!userEmail) {
            throw new Error('User email or id is required');
          }

          const userProfile = await this.supabase.getUserProfile(userEmail);
          return {
            id: (user.id || userEmail) as string,
            email: user.email as string | undefined,
            name: (userProfile?.name || user.name || userEmail.split('@')[0]) as string,
            handle: userProfile?.handle as string | undefined,
            avatarUrl: userProfile?.avatarUrl as string | undefined,
            auraColor: userProfile?.auraColor as string | undefined,
            lastSeen: (user.lastSeen || user.last_seen) as string | undefined,
            isActive: (user.isActive || user.is_active) as boolean | undefined,
            page_id: (user.page_id || user.pageId) as string | undefined,
            enterTime: (user.enterTime || user.enter_time || user.onlineAt || user.online_at) as string | undefined,
            onlineAt: (user.onlineAt || user.online_at || user.enterTime || user.enter_time) as string | undefined
          } as VisibilityUser;
        } catch (error: unknown) {
          this.logger.warn?.('VISIBILITY: Failed to fetch avatar for user', {
            userId: user.id,
            error: error instanceof Error ? error.message : String(error)
          }, 'visibility');

          // Return basic user data without avatar
          return {
            id: (user.id || user.email || 'unknown') as string,
            email: user.email as string | undefined,
            name: (user.name || (user.email as string)?.split('@')[0] || 'unknown') as string,
            handle: undefined,
            avatarUrl: undefined,
            auraColor: undefined,
            lastSeen: (user.lastSeen || user.last_seen) as string | undefined,
            isActive: (user.isActive || user.is_active) as boolean | undefined,
            page_id: (user.page_id || user.pageId) as string | undefined,
            enterTime: (user.enterTime || user.enter_time || user.onlineAt || user.online_at) as string | undefined,
            onlineAt: (user.onlineAt || user.online_at || user.enterTime || user.enter_time) as string | undefined
          } as VisibilityUser;
        }
      }));

      this.logger.debug?.('Users with avatars fetched', { count: usersWithAvatars.length }, 'visibility');
      return usersWithAvatars;
    } catch (error: unknown) {
      this.logger.error?.('VISIBILITY: Failed to fetch user avatars', {
        error: error instanceof Error ? error.message : String(error)
      }, 'visibility');
      throw error;
    }
  }

  /**
   * Filter out current user from list
   */
  private filterCurrentUser(users: VisibilityUser[]): VisibilityUser[] {
    if (!this.currentUserEmail) {
      return users;
    }

    const filteredUsers = users.filter(user => {
      const emailPrefix = this.currentUserEmail?.split('@')[0];
      const isCurrentUser = user.id === this.currentUserEmail ||
        user.email === this.currentUserEmail ||
        (emailPrefix && user.handle === emailPrefix);

      if (isCurrentUser) {
        this.logger.debug?.('Filtering out current user', {
          userId: user.id,
          currentUser: this.currentUserEmail
        }, 'visibility');
        return false;
      }
      return true;
    });

    this.logger.debug?.('Current user filtering complete', {
      originalCount: users.length,
      filteredCount: filteredUsers.length
    }, 'visibility');

    return filteredUsers;
  }

  /**
   * Update visibility UI
   */
  private async updateVisibilityUI(users: VisibilityUser[]): Promise<void> {
    try {
      this.logger.debug?.('Updating visibility UI', { userCount: users.length }, 'visibility');

      // Store globally for profile avatar lookup
      if (typeof window !== 'undefined') {
        const win = window as Window & {
          currentVisibilityDataUnfiltered?: { active: VisibilityUser[] };
          currentVisibilityData?: { active: VisibilityUser[] };
        };
        win.currentVisibilityDataUnfiltered = { active: users };
        win.currentVisibilityData = { active: users };
      }

      // Update state if available
      if (this.visibilityState) {
        this.visibilityState.setUsers(users);
      }

      // Update the UI with users
      const win = window as Window & {
        updateVisibleTab?: (users: VisibilityUser[]) => Promise<void>;
      };

      if (win.updateVisibleTab) {
        await win.updateVisibleTab(users);
        this.logger.debug?.('UI updated successfully', null, 'visibility');
      } else {
        this.logger.warn?.('VISIBILITY: updateVisibleTab function not available', null, 'visibility');
      }

      this.currentVisibilityData = users;
    } catch (error: unknown) {
      this.logger.error?.('VISIBILITY: Failed to update visibility UI', {
        error: error instanceof Error ? error.message : String(error)
      }, 'visibility');
      throw error;
    }
  }

  /**
   * Handle presence events
   */
  private handlePresenceEvent(eventType: string, newRecord: unknown, oldRecord: unknown): void {
    try {
      this.logger.debug?.('Processing presence event', {
        eventType,
        userId: (newRecord as { id?: string })?.id || (oldRecord as { id?: string })?.id,
        pageId: (newRecord as { page_id?: string })?.page_id || (oldRecord as { page_id?: string })?.page_id
      }, 'visibility');

      // Only process events for current page
      if (this.currentPageId &&
        ((newRecord as { page_id?: string })?.page_id !== this.currentPageId &&
          (oldRecord as { page_id?: string })?.page_id !== this.currentPageId)) {
      this.logger.debug?.('VISIBILITY: Ignoring event from different page', {
        eventPageId: (newRecord as { page_id?: string })?.page_id || (oldRecord as { page_id?: string })?.page_id,
        currentPageId: this.currentPageId
      }, 'visibility');
        return;
      }

      // Refresh visibility for current page
      if (this.currentPageId) {
        this.refreshVisibilityAvatars(this.currentPageId);
      }
    } catch (error: unknown) {
      this.logger.error?.('VISIBILITY: Failed to handle presence event', {
        error: error instanceof Error ? error.message : String(error)
      }, 'visibility');
    }
  }

  /**
   * Set current page
   */
  setCurrentPage(pageId: string): void {
    this.currentPageId = pageId;
    this.logger.debug?.('Current page set', { pageId }, 'visibility');
  }

  /**
   * Get current visibility data
   */
  getCurrentVisibilityData(): VisibilityUser[] {
    return this.currentVisibilityData;
  }

  /**
   * Format last seen display (delegates to VisibilityTraceFormatter)
   * CRITICAL: Updated to use new formatter with trace limit support
   */
  static formatLastSeenDisplay(lastSeen: string | null | undefined, traceLimit: number = 30): string {
    const config: TraceLimitConfig = { limit: traceLimit };
    return VisibilityTraceFormatter.formatLastSeen(lastSeen, config);
  }

  /**
   * Format active time display (delegates to VisibilityTraceFormatter)
   * CRITICAL: Updated to use new formatter
   */
  static formatTimeDisplay(enterTime: string | null | undefined): string {
    return VisibilityTraceFormatter.formatActiveTime(enterTime);
  }

  /**
   * Get status
   */
  getStatus(): {
    isActive: boolean;
    currentUserEmail: string | null;
    currentPageId: string | null;
    visibleUsers: number;
  } {
    return {
      isActive: this.isActive,
      currentUserEmail: this.currentUserEmail,
      currentPageId: this.currentPageId,
      visibleUsers: this.currentVisibilityData.length
    };
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    try {
      this.isActive = false;
      this.currentVisibilityData = [];
      this.currentUserEmail = null;
      this.currentPageId = null;
    } catch (error: unknown) {
      this.logger.error?.('VISIBILITY: Cleanup failed', {
        error: error instanceof Error ? error.message : String(error)
      }, 'visibility');
    }
  }
}

export default VisibilityManager;


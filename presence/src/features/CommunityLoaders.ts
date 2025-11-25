/**
 * COMMUNITY LOADERS - Community Data Loading Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */

import { getState, setState, setActiveCommunitiesState } from '../core/StateManager.js';
import { loadChatHistory } from './MessagesModule.js';
import { User } from '../types/index.js';
import { updateCommunityDropdown, updatePlaceholderText } from './CommunityHelpers.js';
import { Logger } from '../utils/Logger.js';

import { handleError } from '../utils/ErrorHandler.js';
interface Community {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  admins?: string[];
  members?: string[];
  [key: string]: unknown;
}

// Declare window globals (for reading only)
declare const window: Window & {
  currentUser?: User;
  currentUrlData?: {
    pageId: string;
    rawUrl: string;
    normalizedUrl: string;
  };
  presenceTrackingActive?: boolean;
  initializePresenceTracking?: () => Promise<void>;
  loadChatHistory?: (rawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
};

// Declare global functions that will be available
declare const api: {
  getCommunities: () => Promise<{ communities?: Community[] } | Community[]>;
  [key: string]: unknown;
};
declare const normalizeCurrentUrl: () => Promise<{
  pageId: string;
  rawUrl: string;
  normalizedUrl: string;
}>;
declare const getCurrentUserEmail: () => Promise<string | null>;

/**
 * Load communities for the current user
 */
export async function loadCommunities(): Promise<Community[]> {
  try {
    Logger.debug('🔍 USER_IDENTITY: === COMMUNITIES USER IDENTITY TRACE ===', null, 'community');
    Logger.debug('🔍 USER_IDENTITY: Current user context before loading communities:', null, 'community');
    Logger.debug('🔍 USER_IDENTITY: window.currentUser:', window.currentUser, 'community');
    Logger.debug('🔍 USER_IDENTITY: window.currentUser?.id:', window.currentUser?.id, 'community');
    Logger.debug('🔍 USER_IDENTITY: window.currentUser?.name:', window.currentUser?.name, 'community');
    
    Logger.debug('Loading communities...', null, 'community');
    const response = await api.getCommunities();
    
    // CRITICAL FIX: Handle null/undefined response from API
    if (!response || response === null) {
      Logger.warn('⚠️ COMMUNITIES: API returned null/undefined response', null, 'community');
      Logger.debug('🔧 COMMUNITIES: Returning empty array to prevent UI breakage', null, 'community');
      return [];
    }
    
    // Handle both array response and object with communities property
    let communities: Community[];
    if (Array.isArray(response)) {
      communities = response;
    } else if (response && typeof response === 'object' && 'communities' in response && Array.isArray(response.communities)) {
      communities = response.communities;
    } else {
      communities = [];
    }
    
    // CRITICAL FIX: Ensure communities is an array
    if (!Array.isArray(communities)) {
      Logger.warn('⚠️ COMMUNITIES: Response is not an array, converting...', 'community');
      communities = communities ? [communities] : [];
    }
    
    // Filter out owner/admin fields
    Logger.debug('🔍 Filtering out owner/admin fields', null, 'community');
    communities = communities.map((community: Community) => {
      const { owner, admins, ...cleanCommunity } = community;
      Logger.debug(`🔍 Removed owner (${owner}) and admins from community ${community.name}`, null, 'community');
      return cleanCommunity;
    });
    
    Logger.debug(`🔍 USER_IDENTITY: Loaded ${communities.length} communities`, null, 'community');
    Logger.debug('🔍 USER_IDENTITY: === END COMMUNITIES USER IDENTITY TRACE ===', null, 'community');
    
    // Update community dropdown
    await updateCommunityDropdown(communities);
    
    // Set up active communities and primary community
    if (communities.length > 0) {
      const activeCommunities = communities.map((c: Community) => c.id);
      const primaryCommunity = communities[0]?.id;
      if (!primaryCommunity) {
        Logger.warn('⚠️ COMMUNITIES: First community has no ID', null, 'community');
        return communities;
      }
      
      // Store active communities and primary community
      setActiveCommunitiesState(activeCommunities);
      setState('primaryCommunity', primaryCommunity);
      setState('currentCommunity', primaryCommunity);
      setState('communities', communities);
      
      // Normalize the current URL ONCE at startup
      const initialUrlData = await normalizeCurrentUrl();
      window.currentUrlData = initialUrlData;
      Logger.debug('🔄 STARTUP: URL normalized for initial load', null, 'community');
      Logger.debug('🔄 STARTUP: window.currentUrlData set to:', initialUrlData.pageId, 'community');
      
      // Wait for authentication before loading avatars
      Logger.debug('🔍 INIT: Waiting for authentication before loading avatars...', null, 'community');
      let authAttempts = 0;
      const maxAuthAttempts = 10;
      
      while (authAttempts < maxAuthAttempts) {
        try {
          const currentUser = await getCurrentUserEmail();
          if (currentUser && currentUser !== 'undefined' && currentUser !== null) {
            Logger.debug('🔍 INIT: Authentication confirmed, loading avatars...', 'community');
            break;
          }
        } catch (error: unknown) {
          Logger.debug('COMMUNITIES: Error checking authentication', error, 'community');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        authAttempts++;
      }
      
      // Load combined avatars from all active communities
      try {
        await loadCombinedAvatars(activeCommunities);
      } catch (error: unknown) {
        Logger.debug('🔍 INIT: loadCombinedAvatars failed - user needs to authenticate first', error, 'community');
        Logger.debug('🔍 INIT: Skipping avatar loading until user signs in', null, 'community');
      }
      
      // Wait for StateManager to store the data - verify it's actually stored
      let storedCommunities = null;
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        storedCommunities = getState('ui.activeCommunities');
        if (storedCommunities && Array.isArray(storedCommunities) && storedCommunities.length > 0) {
          Logger.debug('✅ INIT: Active communities confirmed in StateManager:', storedCommunities, 'community');
          break;
        }
      }
      
      // Load chat history using MessageLoadingService (SLICE 7: Consolidated message loading)
      Logger.debug('🔍 INIT: Loading chat history using MessageLoadingService...', null, 'community');
      try {
        // Try to use MessageLoadingService if available
        const { getMessageLoadingService } = await import('../services/MessageLoadingService.js');
        try {
          const messageService = getMessageLoadingService();
          const currentUrl = window.location.href;
          await messageService.loadMessages(currentUrl, activeCommunities);
          Logger.debug('✅ INIT: Chat history loaded successfully via MessageLoadingService', null, 'community');
        } catch (serviceError) {
          // Fallback to direct call if service not initialized
          Logger.debug('⚠️ INIT: MessageLoadingService not initialized, using direct call', serviceError, 'community');
          const currentUrl = window.location.href;
          await loadChatHistory(currentUrl, activeCommunities);
          Logger.debug('✅ INIT: Chat history loaded successfully via direct call', null, 'community');
        }
      } catch (importError) {
        // Fallback to direct call if import fails
        Logger.debug('⚠️ INIT: MessageLoadingService import failed, using direct call', importError, 'community');
        try {
          const currentUrl = window.location.href;
          await loadChatHistory(currentUrl, activeCommunities);
          Logger.debug('✅ INIT: Chat history loaded successfully via direct call', null, 'community');
        } catch (error: unknown) {
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'CommunityLoaders'
            }
        });
        }
      }
      
      // Update placeholder text with primary community name
      if (communities[0]) {
        updatePlaceholderText(communities[0].name);
      }
    }
    
    return communities;
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'CommunityLoaders'
            }
        });;
    Logger.debug(`Failed to load communities: ${(error as Error).message}`, error, 'community');
    
    // Fallback: show default community
    Logger.debug('🔧 COMMUNITIES: Using fallback default community due to API error', null, 'community');
    await updateCommunityDropdown([{ id: 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4', name: 'Public Square' }]);
    
    // Load chat history with default community (SLICE 7: Use MessageLoadingService)
    Logger.debug('🔍 INIT: Attempting to load chat history with default community', null, 'community');
    try {
      const { getMessageLoadingService } = await import('../services/MessageLoadingService.js');
      try {
        const messageService = getMessageLoadingService();
        await messageService.loadMessages('abe5ec85-4ba6-456f-adaf-03d7d51cecf4');
        Logger.debug('✅ INIT: Chat history loaded with default community via MessageLoadingService', null, 'community');
      } catch (serviceError) {
        // Fallback to window.loadChatHistory if service not initialized
        if (typeof window.loadChatHistory === 'function') {
          await window.loadChatHistory('abe5ec85-4ba6-456f-adaf-03d7d51cecf4');
          Logger.debug('✅ INIT: Chat history loaded with default community via window.loadChatHistory', null, 'community');
        }
      }
    } catch (importError) {
      // Final fallback to window.loadChatHistory
      if (typeof window.loadChatHistory === 'function') {
        try {
          await window.loadChatHistory('abe5ec85-4ba6-456f-adaf-03d7d51cecf4');
          Logger.debug('✅ INIT: Chat history loaded with default community via window.loadChatHistory', null, 'community');
        } catch (chatError: unknown) {
          handleError(chatError, {
            log: true,
            logLevel: 'error',
            context: {
              operation: 'loadChatHistoryFallback',
              component: 'CommunityLoaders'
            }
          });
        }
      }
    }
    
    return [];
  }
}

/**
 * Load combined avatars from multiple communities
 */
export async function loadCombinedAvatars(communityIds: string[]): Promise<void> {
  Logger.debug('🔍 AVATARS: Loading combined avatars for communities:', communityIds, 'community');
  
  try {
    // Get current URL data
    const currentUrlData = window.currentUrlData;
    if (!currentUrlData || !currentUrlData.pageId) {
      Logger.warn('⚠️ AVATARS: No current URL data available, skipping avatar loading', 'community');
      return;
    }
    
    // Initialize presence tracking if not already active
    if (!window.presenceTrackingActive) {
      if (typeof window.initializePresenceTracking === 'function') {
        await window.initializePresenceTracking();
      }
    }
    
    // Load avatars for each community
    // Implementation depends on your avatar loading logic
    Logger.debug('✅ AVATARS: Combined avatars loaded successfully', null, 'community');
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'CommunityLoaders'
            }
        });;
    throw error;
  
    }
}

// Export all functions
export default {
  loadCommunities,
  loadCombinedAvatars
};


/**
 * COMMUNITY LOADERS - Community Data Loading Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */

import { getState, setState, setActiveCommunitiesState, stateManagerInstance } from '../core/StateManager.js';
import { loadChatHistory } from './MessagesModule.js';
import { User } from '../types/index.js';
import { updateCommunityDropdown, updatePlaceholderText, initializeCommunityDropdownHandler } from './CommunityHelpers.js';
import { Logger } from '../utils/Logger.js';
import { authManagerInstance } from './AuthManager.js';
import { handleError } from '../utils/ErrorHandler.js';
import { getPreference, savePreference, userPreferencesManager } from '../utils/UserPreferencesManager.js';
import { api } from './APIModule.js';
import { initializePresenceTracking } from './RealtimeManager.js';
interface Community {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  admins?: string[];
  members?: string[];
  [key: string]: unknown;
}

interface UrlData {
  pageId: string;
  rawUrl: string;
  normalizedUrl: string;
}

/**
 * Load communities for the current user
 */
export async function loadCommunities(): Promise<Community[]> {
  try {
    Logger.debug('🔍 USER_IDENTITY: === COMMUNITIES USER IDENTITY TRACE ===', null, 'community');
    Logger.debug('🔍 USER_IDENTITY: Current user context before loading communities:', null, 'community');
    
    // CRITICAL DEBUG: Log what we're sending to API
    const user = await authManagerInstance.getCurrentUser();
    const currentUserFromState = stateManagerInstance.getState('currentUser') as User | null;
    Logger.debug('🔍 USER_IDENTITY: currentUser (from stateManager):', currentUserFromState, 'community');
    Logger.debug('🔍 USER_IDENTITY: currentUser?.id:', currentUserFromState?.id, 'community');
    Logger.debug('🔍 USER_IDENTITY: currentUser?.name:', currentUserFromState?.name, 'community');
    
    Logger.debug('Loading communities...', null, 'community');
    
    Logger.debug(`🔍 COMMUNITIES API DEBUG: Calling getCommunities with user:`, {
      userId: user?.id,
      email: user?.email,
      isUUID: user?.id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id) : false
    }, 'community');
    
    const apiResponse = await api.getCommunities();
    const response = apiResponse?.data || apiResponse;
    
    Logger.debug(`🔍 COMMUNITIES API DEBUG: Response received:`, {
      hasResponse: !!response,
      isArray: Array.isArray(response),
      hasCommunities: !!(response && typeof response === 'object' && 'communities' in response),
      responseType: typeof response,
      responseKeys: response && typeof response === 'object' ? Object.keys(response) : []
    }, 'community');
    
    // CRITICAL FIX: Handle null/undefined response from API
    if (!response || response === null) {
      Logger.warn('⚠️ COMMUNITIES: API returned null/undefined response - using Public Square fallback', null, 'community');
      const { PUBLIC_SQUARE_UUID } = await import('../core/ConfigModule.js');
      const fallbackCommunity = { id: PUBLIC_SQUARE_UUID, name: 'Public Square' };
      // Set state first
      setActiveCommunitiesState([PUBLIC_SQUARE_UUID]);
      setState('primaryCommunity', PUBLIC_SQUARE_UUID);
      setState('currentCommunity', PUBLIC_SQUARE_UUID);
      setState('communities', [fallbackCommunity]);
      // Update dropdown AFTER state is set
      await updateCommunityDropdown([fallbackCommunity]);
      return [fallbackCommunity];
    }
    
    // Handle both array response and object with communities property
    let communities: Community[];
    if (Array.isArray(response)) {
      communities = response;
    } else if (response && typeof response === 'object' && 'communities' in response && Array.isArray(response.communities)) {
      communities = response.communities;
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: unknown }).data)) {
      // Handle response with data property
      communities = (response as { data: Community[] }).data;
    } else {
      communities = [];
    }
    
    // CRITICAL FIX: Ensure communities is an array
    if (!Array.isArray(communities)) {
      Logger.warn('⚠️ COMMUNITIES: Response is not an array, converting...', 'community');
      communities = communities ? [communities] : [];
    }
    
    Logger.debug(`🔍 COMMUNITIES: Parsed ${communities.length} communities from API response`, null, 'community');
    
    // Log each community's logoUrl to verify it's included and clean $0 suffix
    communities.forEach((community: Community) => {
      // CRITICAL FIX: Clean $0 suffix from logoUrl if present
      if (community.logoUrl && typeof community.logoUrl === 'string') {
        const originalLogoUrl = community.logoUrl;
        if (originalLogoUrl.endsWith('$0')) {
          community.logoUrl = originalLogoUrl.slice(0, -2);
          Logger.warn(`⚠️ COMMUNITIES: Removed $0 suffix from logoUrl for ${community.name}`, {
            original: originalLogoUrl,
            cleaned: community.logoUrl
          }, 'community');
        }
      }
      
      // Log with explicit logoUrl string in message for clarity
      const logoUrlStr = typeof community.logoUrl === 'string' ? community.logoUrl : String(community.logoUrl || '');
      Logger.debug(`🔍 COMMUNITIES: Community from API: ${community.name} | logoUrl: "${logoUrlStr}"`, {
        id: community.id,
        name: community.name,
        logoUrl: logoUrlStr,
        hasLogoUrl: !!community.logoUrl,
        logoUrlType: typeof community.logoUrl,
        fullCommunity: community
      }, 'community');
    });
    
    // Filter out owner/admin fields
    Logger.debug('🔍 Filtering out owner/admin fields', null, 'community');
    communities = communities.map((community: Community) => {
      const { owner, admins, ...cleanCommunity } = community;
      Logger.debug(`🔍 Removed owner (${owner}) and admins from community ${community.name}`, null, 'community');
      // CRITICAL: Ensure logoUrl is preserved
      if (!cleanCommunity.logoUrl) {
        Logger.warn(`⚠️ COMMUNITIES: Community ${community.name} missing logoUrl after filtering!`, { original: community, cleaned: cleanCommunity }, 'community');
      }
      return cleanCommunity;
    });
    
    Logger.debug(`🔍 USER_IDENTITY: Loaded ${communities.length} communities`, null, 'community');
    Logger.debug('🔍 USER_IDENTITY: === END COMMUNITIES USER IDENTITY TRACE ===', null, 'community');
    
    // CRITICAL: If no communities returned and user exists, this is an ERROR
    if (communities.length === 0) {
      const user = await authManagerInstance.getCurrentUser();
      if (user) {
        Logger.error('❌ COMMUNITIES: API returned empty communities array but user exists - this is a BUG!', { userId: user.id, email: user.email }, 'community');
        Logger.error('❌ COMMUNITIES: User should have communities in database - investigate backend', null, 'community');
        // DO NOT use fallback - return empty array to surface the error
        await updateCommunityDropdown([]);
        return [];
      }
      // Only use fallback if user doesn't exist (not authenticated)
      Logger.warn('⚠️ COMMUNITIES: No user authenticated and no communities - using Public Square fallback', null, 'community');
      const { PUBLIC_SQUARE_UUID } = await import('../core/ConfigModule.js');
      const fallbackCommunity = { id: PUBLIC_SQUARE_UUID, name: 'Public Square' };
      communities = [fallbackCommunity];
    }
    
    // Update community dropdown
    await updateCommunityDropdown(communities);
    
    // Ensure dropdown handler is initialized
    initializeCommunityDropdownHandler();
    
    // Set up active communities and primary community
    if (communities.length > 0) {
      Logger.debug(`🔍 COMMUNITIES: Setting up state for ${communities.length} communities`, null, 'community');
      Logger.debug(`🔍 COMMUNITIES: Community IDs:`, communities.map(c => ({ id: c.id, name: c.name })), 'community');
      
      // CRITICAL: Include ALL communities in activeCommunities - users should see all communities they're members of
      const activeCommunities = communities.map((c: Community) => c.id);
      
      // Find primary community - load from unified preferences first (fast), then state, then use first community
      let primaryCommunity: string | null = null;
      
      // Priority 1: Load from unified preferences (Chrome storage - fastest)
      if (userPreferencesManager) {
        try {
          const prefPrimary = await getPreference('primaryCommunity');
          if (prefPrimary && typeof prefPrimary === 'string' && prefPrimary.length > 0) {
            // Validate that this community ID exists in the user's communities
            const foundCommunity = communities.find(c => c.id === prefPrimary);
            if (foundCommunity) {
              primaryCommunity = prefPrimary;
              Logger.debug(`✅ COMMUNITIES: Loaded primary community from unified preferences: ${primaryCommunity}`, null, 'community');
            } else {
              Logger.warn(`⚠️ COMMUNITIES: Primary community from preferences (${prefPrimary}) not found in user's communities, using fallback`, null, 'community');
            }
          }
        } catch (error) {
          Logger.warn(`⚠️ COMMUNITIES: Failed to load primary community from unified preferences:`, error, 'community');
        }
      }
      
      // Priority 2: Check StateManager (runtime state)
      if (!primaryCommunity) {
        const statePrimary = getState('primaryCommunity');
        if (statePrimary && typeof statePrimary === 'string') {
          const foundCommunity = communities.find(c => c.id === statePrimary);
          if (foundCommunity) {
            primaryCommunity = statePrimary;
            Logger.debug(`✅ COMMUNITIES: Loaded primary community from StateManager: ${primaryCommunity}`, null, 'community');
          }
        }
      }
      
      // Priority 3: Use first community as fallback
      if (!primaryCommunity) {
        primaryCommunity = communities[0]?.id || null;
        if (primaryCommunity) {
          Logger.debug(`✅ COMMUNITIES: Using first community as primary: ${primaryCommunity}`, null, 'community');
        }
      }
      if (!primaryCommunity) {
        Logger.warn('⚠️ COMMUNITIES: First community has no ID', null, 'community');
        return communities;
      }
      
      // Store active communities and primary community
      setActiveCommunitiesState(activeCommunities);
      setState('primaryCommunity', primaryCommunity);
      setState('currentCommunity', primaryCommunity);
      setState('communities', communities);
      
      // Save primary community to unified preferences if it was loaded from state/fallback
      // (if it came from preferences, it's already saved)
      if (primaryCommunity) {
        try {
          const prefPrimary = await getPreference('primaryCommunity');
          if (!prefPrimary || prefPrimary !== primaryCommunity) {
            // Only save if different from what's in preferences (avoid unnecessary writes)
            await savePreference('primaryCommunity', primaryCommunity);
            Logger.debug(`✅ COMMUNITIES: Saved primary community to unified preferences: ${primaryCommunity}`, null, 'community');
          }
        } catch (error) {
          Logger.warn(`⚠️ COMMUNITIES: Failed to save primary community to unified preferences:`, error, 'community');
        }
      }
      
      Logger.debug(`✅ COMMUNITIES: State updated - primary: ${primaryCommunity}, active: ${activeCommunities.length}`, null, 'community');
      
      // Normalize the current URL ONCE at startup (optional - don't fail if not available)
      // Store URL data in state manager instead of window
      try {
        const currentUrl = window.location.href;
        if (currentUrl && !currentUrl.includes('sidepanel') && !currentUrl.startsWith('chrome-extension://')) {
          const urlData: UrlData = {
            pageId: currentUrl,
            rawUrl: currentUrl,
            normalizedUrl: currentUrl
          };
          stateManagerInstance.setState('currentUrlData', urlData);
          Logger.debug('🔄 STARTUP: URL data stored in state manager', null, 'community');
          Logger.debug('🔄 STARTUP: currentUrlData set to:', urlData.pageId, 'community');
        }
      } catch (error: unknown) {
        // Don't fail community loading if URL normalization fails
        Logger.debug('⚠️ STARTUP: Failed to store URL data (non-critical):', error, 'community');
      }
      
      // Wait for authentication before loading avatars
      Logger.debug('🔍 INIT: Waiting for authentication before loading avatars...', null, 'community');
      let authAttempts = 0;
      const maxAuthAttempts = 10;
      
      while (authAttempts < maxAuthAttempts) {
        try {
          const currentUser = await authManagerInstance.getCurrentUser();
          if (currentUser && currentUser.id) {
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'CommunityLoaders'
            }
        });;
    Logger.debug(`Failed to load communities: ${errorMessage}`, error, 'community');
    
    // CRITICAL: If it's just a normalizeCurrentUrl error, don't fail completely
    if (errorMessage.includes('normalizeCurrentUrl')) {
      Logger.warn('⚠️ COMMUNITIES: normalizeCurrentUrl error (non-critical) - communities should still be loaded', null, 'community');
      // Check if communities were already loaded before the error
      const existingCommunities = getState('communities');
      if (Array.isArray(existingCommunities) && existingCommunities.length > 0) {
        Logger.debug('✅ COMMUNITIES: Communities already loaded before normalizeCurrentUrl error - returning them', null, 'community');
        return existingCommunities as Community[];
      }
    }
    
    // CRITICAL: API error - this is a BUG, not a fallback case
    Logger.error('❌ COMMUNITIES: Failed to load communities from API - this is a BUG!', error, 'community');
    Logger.error('❌ COMMUNITIES: User has communities in database but API call failed - investigate backend', null, 'community');
    
    // Use Public Square fallback instead of empty array - better UX
    const { PUBLIC_SQUARE_UUID } = await import('../core/ConfigModule.js');
    const fallbackCommunity = { id: PUBLIC_SQUARE_UUID, name: 'Public Square' };
    setActiveCommunitiesState([PUBLIC_SQUARE_UUID]);
    setState('primaryCommunity', PUBLIC_SQUARE_UUID);
    setState('currentCommunity', PUBLIC_SQUARE_UUID);
    setState('communities', [fallbackCommunity]);
    await updateCommunityDropdown([fallbackCommunity]);
    return [fallbackCommunity];
  }
}

/**
 * Load combined avatars from multiple communities
 */
export async function loadCombinedAvatars(communityIds: string[]): Promise<void> {
  Logger.debug('🔍 AVATARS: Loading combined avatars for communities:', communityIds, 'community');
  
  try {
    // Get current URL data from state manager
    const currentUrlData = stateManagerInstance.getState('currentUrlData') as UrlData | null;
    if (!currentUrlData || !currentUrlData.pageId) {
      Logger.warn('⚠️ AVATARS: No current URL data available, skipping avatar loading', 'community');
      return;
    }
    
    // Initialize presence tracking if not already active
    // Check if presence tracking is active via state manager or try to initialize
    const presenceTrackingActive = stateManagerInstance.getState('presenceTrackingActive') as boolean | undefined;
    if (!presenceTrackingActive) {
      try {
        await initializePresenceTracking();
        stateManagerInstance.setState('presenceTrackingActive', true);
      } catch (error) {
        Logger.debug('⚠️ AVATARS: Failed to initialize presence tracking (non-critical):', error, 'community');
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

/**
 * Initialize communities module
 * Called by BootController to load communities on startup
 */
export async function initialize(): Promise<void> {
  try {
    Logger.debug('🔍 COMMUNITIES: Initializing communities module...', null, 'community');
    await loadCommunities();
    Logger.debug('✅ COMMUNITIES: Communities module initialized', null, 'community');
  } catch (error: unknown) {
    handleError(error, {
      log: true,
      logLevel: 'error',
      context: {
        operation: 'initialize',
        component: 'CommunityLoaders'
      }
    });
  }
}

// Export all functions
export default {
  loadCommunities,
  loadCombinedAvatars,
  initialize
};


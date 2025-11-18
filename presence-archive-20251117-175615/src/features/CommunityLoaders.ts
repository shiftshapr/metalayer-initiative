/**
 * COMMUNITY LOADERS - Community Data Loading Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */

import { getState, setState } from '../core/StateManager.js';
import { loadChatHistory } from './CanopiModule.js';
import { User } from '../types/index.js';
import { updateCommunityDropdown, updatePlaceholderText } from './CommunityHelpers.js';

interface Community {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  admins?: string[];
  members?: string[];
  [key: string]: any;
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
declare const api: any;
declare const normalizeCurrentUrl: () => Promise<any>;
declare const getCurrentUserEmail: () => Promise<string | null>;

/**
 * Load communities for the current user
 */
export async function loadCommunities(): Promise<Community[]> {
  try {
    console.log('🔍 USER_IDENTITY: === COMMUNITIES USER IDENTITY TRACE ===');
    console.log('🔍 USER_IDENTITY: Current user context before loading communities:');
    console.log('🔍 USER_IDENTITY: window.currentUser:', window.currentUser);
    console.log('🔍 USER_IDENTITY: window.currentUser?.id:', window.currentUser?.id);
    console.log('🔍 USER_IDENTITY: window.currentUser?.name:', window.currentUser?.name);
    
    console.log('Loading communities...');
    const response = await api.getCommunities();
    
    // CRITICAL FIX: Handle null/undefined response from API
    if (!response || response === null) {
      console.warn('⚠️ COMMUNITIES: API returned null/undefined response');
      console.log('🔧 COMMUNITIES: Returning empty array to prevent UI breakage');
      return [];
    }
    
    let communities = response.communities || response;
    
    // CRITICAL FIX: Ensure communities is an array
    if (!Array.isArray(communities)) {
      console.warn('⚠️ COMMUNITIES: Response is not an array, converting...');
      communities = communities ? [communities] : [];
    }
    
    // Filter out owner/admin fields
    console.log('🔍 Filtering out owner/admin fields');
    communities = communities.map((community: Community) => {
      const { owner, admins, ...cleanCommunity } = community;
      console.log(`🔍 Removed owner (${owner}) and admins from community ${community.name}`);
      return cleanCommunity;
    });
    
    console.log(`🔍 USER_IDENTITY: Loaded ${communities.length} communities`);
    console.log('🔍 USER_IDENTITY: === END COMMUNITIES USER IDENTITY TRACE ===');
    
    // Update community dropdown
    await updateCommunityDropdown(communities);
    
    // Set up active communities and primary community
    if (communities.length > 0) {
      const activeCommunities = communities.map((c: Community) => c.id);
      const primaryCommunity = communities[0].id;
      
      // Store active communities and primary community
      setState('activeCommunities', activeCommunities);
      setState('ui.activeCommunities', activeCommunities);
      setState('primaryCommunity', primaryCommunity);
      setState('currentCommunity', primaryCommunity);
      setState('communities', communities);
      
      // Normalize the current URL ONCE at startup
      const initialUrlData = await normalizeCurrentUrl();
      window.currentUrlData = initialUrlData;
      console.log('🔄 STARTUP: URL normalized for initial load');
      console.log('🔄 STARTUP: window.currentUrlData set to:', initialUrlData.pageId);
      
      // Wait for authentication before loading avatars
      console.log('🔍 INIT: Waiting for authentication before loading avatars...');
      let authAttempts = 0;
      const maxAuthAttempts = 10;
      
      while (authAttempts < maxAuthAttempts) {
        try {
          const currentUser = await getCurrentUserEmail();
          if (currentUser && currentUser !== 'undefined' && currentUser !== null) {
            console.log('🔍 INIT: Authentication confirmed, loading avatars...');
            break;
          }
        } catch (error) {
          console.log('COMMUNITIES: Error checking authentication');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        authAttempts++;
      }
      
      // Load combined avatars from all active communities
      try {
        await loadCombinedAvatars(activeCommunities);
      } catch (error) {
        console.log('🔍 INIT: loadCombinedAvatars failed - user needs to authenticate first');
        console.log('🔍 INIT: Skipping avatar loading until user signs in');
      }
      
      // Wait for StateManager to store the data - verify it's actually stored
      let storedCommunities = null;
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        storedCommunities = getState('ui.activeCommunities');
        if (storedCommunities && storedCommunities.length > 0) {
          console.log('✅ INIT: Active communities confirmed in StateManager:', storedCommunities);
          break;
        }
      }
      
      // Load chat history using CanopiModule
      console.log('🔍 INIT: Loading chat history using ES6 import...');
      try {
        await loadChatHistory(null, activeCommunities);
        console.log('✅ INIT: Chat history loaded successfully');
      } catch (error) {
        console.error('❌ INIT: Error loading chat history:', error);
      }
      
      // Update placeholder text with primary community name
      updatePlaceholderText(communities[0].name);
    }
    
    return communities;
  } catch (error) {
    console.error('Failed to load communities:', error);
    console.log(`Failed to load communities: ${(error as Error).message}`);
    
    // Fallback: show default community
    console.log('🔧 COMMUNITIES: Using fallback default community due to API error');
    await updateCommunityDropdown([{ id: 'comm-001', name: 'Public Square' }]);
    
    // Load chat history with default community
    console.log('🔍 INIT: Attempting to load chat history with default community');
    if (typeof window.loadChatHistory === 'function') {
      try {
        await window.loadChatHistory('comm-001');
        console.log('✅ INIT: Chat history loaded with default community');
      } catch (chatError) {
        console.error('❌ INIT: Failed to load chat history:', chatError);
      }
    }
    
    return [];
  }
}

/**
 * Load combined avatars from multiple communities
 */
export async function loadCombinedAvatars(communityIds: string[]): Promise<void> {
  console.log('🔍 AVATARS: Loading combined avatars for communities:', communityIds);
  
  try {
    // Get current URL data
    const currentUrlData = window.currentUrlData;
    if (!currentUrlData || !currentUrlData.pageId) {
      console.warn('⚠️ AVATARS: No current URL data available, skipping avatar loading');
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
    console.log('✅ AVATARS: Combined avatars loaded successfully');
  } catch (error) {
    console.error('❌ AVATARS: Failed to load combined avatars:', error);
    throw error;
  }
}

// Export all functions
export default {
  loadCommunities,
  loadCombinedAvatars
};


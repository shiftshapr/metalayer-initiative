/**
 * COMMUNITIES MODULE - Community Management
 * TypeScript + ES6 Module
 * Handles all community functionality
 */
import { Logger } from '../utils/Logger.js';
class CommunitiesModule {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
        this.logger = new Logger();
    }
    /**
     * Initialize CommunitiesModule
     */
    async initialize() {
        if (this.isInitialized) {
            this.log('WARN', 'CommunitiesModule already initialized');
            return;
        }
        this.log('INFO', 'Initializing CommunitiesModule...');
        try {
            // Initialize community dropdown activation
            this.initializeCommunityDropdown();
            this.isInitialized = true;
            this.log('INFO', 'CommunitiesModule initialized successfully');
        }
        catch (error) {
            this.log('ERROR', 'Failed to initialize CommunitiesModule:', error);
            throw error;
        }
    }
    /**
     * Initialize community dropdown activation
     * Ensures community dropdown is properly activated in sidepanel
     * SD3: Integrated from COMMUNITY_DROPDOWN_ACTIVATOR.js
     */
    initializeCommunityDropdown() {
        this.log('INFO', 'Initializing community dropdown...');
        const activateDropdown = () => {
            const trigger = document.querySelector('.community-dropdown-trigger');
            const panel = document.getElementById('community-dropdown-panel');
            if (!trigger || !panel) {
                this.log('WARN', 'Community dropdown trigger or panel not found, retrying...');
                setTimeout(activateDropdown, 500);
                return;
            }
            this.log('INFO', 'Found community dropdown trigger and panel elements');
            // CRITICAL FIX: Clone trigger to remove any existing listeners
            const newTrigger = trigger.cloneNode(true);
            if (trigger.parentNode) {
                trigger.parentNode.replaceChild(newTrigger, trigger);
            }
            // CRITICAL FIX: Add mousedown handler first (fires before click)
            newTrigger.addEventListener('mousedown', (e) => {
                this.log('DEBUG', 'Community dropdown trigger mousedown event');
                e.stopPropagation();
                // Don't prevent default - allow click to fire
            });
            // CRITICAL FIX: Add click handler
            newTrigger.addEventListener('click', (e) => {
                this.log('DEBUG', 'Community dropdown trigger clicked');
                e.stopPropagation();
                e.preventDefault();
                const isVisible = panel.style.display === 'block' ||
                    (panel.style.display === '' && getComputedStyle(panel).display === 'block');
                if (isVisible) {
                    panel.style.display = 'none';
                    this.log('DEBUG', 'Community dropdown hidden');
                }
                else {
                    panel.style.display = 'block';
                    this.log('DEBUG', 'Community dropdown shown');
                }
            });
            // CRITICAL FIX: Ensure pointer events are enabled
            newTrigger.style.pointerEvents = 'auto';
            newTrigger.style.cursor = 'pointer';
            newTrigger.style.userSelect = 'none';
            // Ensure all child elements also allow pointer events
            const triggerChildren = newTrigger.querySelectorAll('*');
            triggerChildren.forEach(child => {
                const childEl = child;
                childEl.style.pointerEvents = 'auto';
                childEl.style.cursor = 'pointer';
            });
            this.log('INFO', 'Community dropdown event listeners attached');
            // Setup close button
            const closeBtn = document.getElementById('close-community-dropdown');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    panel.style.display = 'none';
                    this.log('DEBUG', 'Community dropdown closed via close button');
                });
            }
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const panelEl = panel;
                const panelStyle = panelEl.style;
                if (panelStyle.display === 'block' ||
                    getComputedStyle(panelEl).display === 'block') {
                    if (!panelEl.contains(e.target) && !newTrigger.contains(e.target)) {
                        panelStyle.display = 'none';
                        this.log('DEBUG', 'Community dropdown closed via outside click');
                    }
                }
            });
            return true;
        };
        // Auto-activate on page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(activateDropdown, 1000);
            });
        }
        else {
            setTimeout(activateDropdown, 1000);
        }
        // Note: No window export - use ES6 module exports instead
    }
    /**
     * Logging utility
     */
    log(level, message, ...args) {
        if (this.logLevel === 'SILENT')
            return;
        const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, SILENT: 4 };
        if (levels[level] <= levels[this.logLevel]) {
            console.log(`[CommunitiesModule] [${level}] ${message}`, ...args);
        }
    }
}
// Export CommunitiesModule as ES6 module
export { CommunitiesModule };
export default CommunitiesModule;
// Note: Community functions (loadCommunities, updateCommunityDropdown, etc.) 
// have been moved to CommunityHelpers.ts and CommunityLoaders.ts
// Import them from there instead of using standalone functions here.
// Legacy standalone functions removed - use ES6 imports:
// import { loadCommunities, loadCombinedAvatars } from './CommunityLoaders.js';
// import { updateCommunityDropdown, updatePlaceholderText } from './CommunityHelpers.js';
// Removed functions (now in separate modules):
// - loadCommunities() → CommunityLoaders.ts
// - updateCommunityDropdown() → CommunityHelpers.ts
// - loadCombinedAvatars() → CommunityLoaders.ts
// - updatePlaceholderText() → CommunityHelpers.ts
// - getPrimaryCommunityName() → CommunityHelpers.ts
/*
// --- Community Management Functions ---
// MOVED TO CommunityLoaders.ts
async function loadCommunities() {
    try {
      console.log('🔍 USER_IDENTITY: === COMMUNITIES USER IDENTITY TRACE ===');
      console.log('🔍 USER_IDENTITY: Current user context before loading communities:');
      console.log('🔍 USER_IDENTITY: window.currentUser:', window.currentUser);
      console.log('🔍 USER_IDENTITY: window.currentUser?.id:', window.currentUser?.id);
      console.log('🔍 USER_IDENTITY: window.currentUser?.name:', window.currentUser?.name);
      console.log('🔍 USER_IDENTITY: window.currentUser?.id:', window.currentUser?.id);
      
      console.log('Loading communities...');
      const response = await api.getCommunities();
      
      // CRITICAL FIX: Handle null/undefined response from API (500 errors, connection errors)
      if (!response || response === null) {
        console.warn('⚠️ COMMUNITIES: API returned null/undefined response (likely 500 error or connection issue)');
        // Don't throw - return empty array to prevent breaking the UI
        console.log('🔧 COMMUNITIES: Returning empty array to prevent UI breakage');
        return [];
      }
      
      let communities = response.communities || response; // Handle both formats
      
      // CRITICAL FIX: Ensure communities is an array
      if (!Array.isArray(communities)) {
        console.warn('⚠️ COMMUNITIES: Response is not an array, converting...');
        communities = communities ? [communities] : [];
      }
      
      // SD1 CRITICAL FIX: Filter out owner/admin fields that contain themetalayer
      console.log('🔍 SD1 FIX: Filtering out owner/admin fields to prevent themetalayer confusion');
      communities = communities.map(community => {
        const { owner, admins, ...cleanCommunity } = community;
        console.log(`🔍 SD1 FIX: Removed owner (${owner}) and admins (${JSON.stringify(admins)}) from community ${community.name}`);
        return cleanCommunity;
      });
      console.log(`🔍 USER_IDENTITY: Loaded ${communities.length} communities`);
      console.log('🔍 USER_IDENTITY: Communities data:', communities);
      
      // SD1 CRITICAL DEBUG: Trace where themetalayer is coming from
      console.log('🔍 SD1 DEBUG: === TRACING THEMETALAYER SOURCE ===');
      communities.forEach((community, index) => {
        console.log(`🔍 SD1 DEBUG: Community ${index + 1}:`, {
          id: community.id,
          name: community.name,
          owner: community.owner,
          admins: community.admins,
          members: community.members
        });
        // SD1 DEBUG: Check for themetalayer in community data
        if (community.owner === 'themetalayer@gmail.com') {
          console.log(`ℹ️ SD1 DEBUG: Found themetalayer as owner in community ${community.name}`);
        }
      });
      console.log('🔍 SD1 DEBUG: === END THEMETALAYER TRACE ===');
      
      console.log('🔍 USER_IDENTITY: === END COMMUNITIES USER IDENTITY TRACE ===');
      
      // Update community dropdown
      updateCommunityDropdown(communities);
      
      // SD1 CRITICAL DEBUG: Check what's being displayed in the UI
      console.log('🔍 SD1 DEBUG: === CHECKING UI DISPLAY ===');
      setTimeout(() => {
        const communityDropdown = document.querySelector('#community-dropdown');
        const communityName = document.querySelector('.community-name');
        const communityDescription = document.querySelector('.community-description');
        
        if (communityDropdown) {
          console.log('🔍 SD1 DEBUG: Community dropdown text:', communityDropdown.textContent);
        }
        if (communityName) {
          console.log('🔍 SD1 DEBUG: Community name text:', communityName.textContent);
        }
        if (communityDescription) {
          console.log('🔍 SD1 DEBUG: Community description text:', communityDescription.textContent);
        }
        
        // Check if themetalayer is being displayed anywhere
        const allText = document.body.innerText;
        if (allText.includes('themetalayer')) {
          console.log('ℹ️ SD1 DEBUG: Found themetalayer in UI text (this is normal for current user)');
        }
      }, 1000);
      console.log('🔍 SD1 DEBUG: === END UI DISPLAY CHECK ===');
      
      // Set up active communities and primary community
      if (communities.length > 0) {
        // For now, all communities are active communities
        const activeCommunities = communities.map(c => c.id);
        const primaryCommunity = communities[0].id; // First community is primary
        
        // Store active communities and primary community
        // FIX: Store under both keys for compatibility
        setState('activeCommunities', activeCommunities);
        setState('ui.activeCommunities', activeCommunities); // FIX: Also store under ui.activeCommunities
        setState('primaryCommunity', primaryCommunity);
        setState('currentCommunity', primaryCommunity); // For backward compatibility
        setState('communities', communities); // Store communities for name lookup
        
        // Normalize the current URL ONCE at startup
        const initialUrlData = await normalizeCurrentUrl();
        window.currentUrlData = initialUrlData; // CRITICAL: Set global state
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
            console.log('COMMUNITIES: Error loading community data');
          }
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
          authAttempts++;
        }
        
        // Load combined avatars from all active communities (uses normalized URL)
        try {
          await loadCombinedAvatars(activeCommunities);
        } catch (error) {
          console.log('🔍 INIT: loadCombinedAvatars failed - user needs to authenticate first');
          console.log('🔍 INIT: Skipping avatar loading until user signs in');
          // Don't retry - wait for user to authenticate
        }
        // FIX: Load chat history with activeCommunities array (not just primaryCommunity)
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
        // Use ES6 import instead of window global
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
    } catch (error) {
      console.error('Failed to load communities:', error);
      console.log(`Failed to load communities: ${error.message}`);
      
      // CRITICAL FIX: Don't break UI on API errors - use fallback gracefully
      // Fallback: show default community
      console.log('🔧 COMMUNITIES: Using fallback default community due to API error');
      updateCommunityDropdown([{ id: 'comm-001', name: 'Public Square' }]);
      
      // CRITICAL FIX: Load chat history even when communities fail to load
      // Use default community (comm-001) as fallback
      console.log('🔍 INIT: Attempting to load chat history with default community (comm-001)');
      if (typeof window.loadChatHistory === 'function') {
        console.log('🔍 INIT: loadChatHistory available, loading chat history with default community...');
        try {
          await window.loadChatHistory('comm-001');
          console.log('✅ INIT: Chat history loaded successfully with default community');
        } catch (chatError) {
          console.error('❌ INIT: Failed to load chat history:', chatError);
        }
      } else {
        console.log('🔍 INIT: loadChatHistory not available, waiting for CanopiModule...');
        // Wait a bit for CanopiModule to load
        setTimeout(async () => {
          if (typeof window.loadChatHistory === 'function') {
            console.log('🔍 INIT: loadChatHistory now available, loading chat history with default community...');
            try {
              await window.loadChatHistory('comm-001');
              console.log('✅ INIT: Chat history loaded successfully with default community');
            } catch (chatError) {
              console.error('❌ INIT: Failed to load chat history:', chatError);
            }
          } else {
            console.log('❌ INIT: loadChatHistory still not available after retry');
          }
        }, 1000);
      }
    }
  }
  

  async function updateCommunityDropdown(communities) {
    const communityList = document.querySelector('.community-list');
    if (!communityList) return;
    
    // Use ES6 import instead of window global
    // getState and setState are already imported at the top
    
    // Get current active communities and primary community
    const activeCommunities = await getState('activeCommunities') || [];
    const primaryCommunityId = await getState('primaryCommunity') || (communities[0]?.id);
    
    // Clear existing communities
    communityList.innerHTML = '';
    
    // Update primary community name in header
    const primaryCommunity = communities.find(c => c.id === primaryCommunityId);
    const currentCommunityNameEl = document.getElementById('current-community-name');
    if (currentCommunityNameEl && primaryCommunity) {
      currentCommunityNameEl.textContent = primaryCommunity.name;
    }
    
    // Add communities to the list with checkboxes and three-dot menu
    communities.forEach((community, index) => {
      const isActive = activeCommunities.includes(community.id) || (!activeCommunities.length && index === 0);
      const isPrimary = community.id === primaryCommunityId;
      
      const li = document.createElement('li');
      li.className = 'community-item';
      li.dataset.communityId = community.id;
      
      li.innerHTML = `
        <img src="/images/community${index + 1}.png" alt="Community" data-community-fallback="true" class="community-icon">
        <span class="community-name">${community.name}</span>
        ${isPrimary ? '<span class="primary-tag">Primary</span>' : ''}
        <label class="community-checkbox-wrapper">
          <input type="checkbox" class="community-checkbox" ${isActive ? 'checked' : ''} data-community-id="${community.id}">
        </label>
        ${!isPrimary ? `
        <button class="community-menu-btn" data-community-id="${community.id}" title="Community options">
          <span class="action-dots">⋮</span>
        </button>
        <div class="community-menu" style="display: none;">
          <button class="menu-item make-primary-btn" data-community-id="${community.id}">Make primary</button>
        </div>
        ` : ''}
      `;
      
      // Add error handler for community image
      const communityImg = li.querySelector('img[data-community-fallback="true"]');
      if (communityImg) {
        communityImg.addEventListener('error', function() {
          this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjEwIiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K';
        });
      }
      
      // Checkbox handler - toggle active status
      const checkbox = li.querySelector('.community-checkbox');
      checkbox.addEventListener('change', async (e) => {
        e.stopPropagation();
        const communityId = e.target.dataset.communityId;
        let activeCommunities = await getState('activeCommunities') || [];
        const currentPrimaryId = await getState('primaryCommunity');
        
        if (e.target.checked) {
          if (!activeCommunities.includes(communityId)) {
            activeCommunities.push(communityId);
          }
        } else {
          activeCommunities = activeCommunities.filter(id => id !== communityId);
          // Can't uncheck primary community
          if (communityId === currentPrimaryId) {
            e.target.checked = true;
            alert('Cannot deactivate primary community. Make another community primary first.');
            return;
          }
        }
        
        await setState('activeCommunities', activeCommunities);
        console.log('✅ Community active status updated:', communityId, e.target.checked);
        
        // Reload visibility and messages for all active communities
        if (typeof window.refreshVisibilityAvatars === 'function') {
          window.refreshVisibilityAvatars();
        }
        if (typeof window.loadChatHistory === 'function') {
          const primary = await getState('primaryCommunity');
          await window.loadChatHistory(primary);
        }
      });
      
      // Three-dot menu handler (only for non-primary communities)
      const menuBtn = li.querySelector('.community-menu-btn');
      const menu = li.querySelector('.community-menu');
      
      // Only attach handler if menu button exists (non-primary communities only)
      if (menuBtn && menu) {
        // ROOT CAUSE FIX: Remove existing handlers to prevent duplicates
        const newMenuBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
        
        newMenuBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.preventDefault();
          // Toggle menu
          const isVisible = menu.style.display === 'block';
          // Close all other menus
          document.querySelectorAll('.community-menu').forEach(m => m.style.display = 'none');
          menu.style.display = isVisible ? 'none' : 'block';
          
          // ROOT CAUSE FIX: Add click-outside handler with delay to prevent immediate closing
          if (!isVisible) {
            setTimeout(() => {
              const clickOutsideHandler = (clickE) => {
                if (!menu.contains(clickE.target) && !newMenuBtn.contains(clickE.target)) {
                  menu.style.display = 'none';
                  document.removeEventListener('click', clickOutsideHandler);
                }
              };
              document.addEventListener('click', clickOutsideHandler);
            }, 100);
          }
        });
      }
      
      // Make primary handler (only for non-primary communities)
      const makePrimaryBtn = li.querySelector('.make-primary-btn');
      
      // Only attach handler if button exists (non-primary communities only)
      if (makePrimaryBtn && menu) {
        makePrimaryBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const communityId = e.target.dataset.communityId;
          
          try {
            // Get current user
            const user = await window.authManager.getCurrentUser();
            const userId = user?.id || user?.user_id;
            
            if (!userId) {
              console.error('❌ Cannot select community: User not authenticated');
              alert('Please sign in to change your primary community');
              return;
            }

            // Get Chrome tab ID
            let tabId = null;
            if (window.tabIdManager) {
              tabId = await window.tabIdManager.getCurrentTabId();
            }

            // Call API to select community (sets as primary and active)
            if (window.api && typeof window.api.selectCommunity === 'function') {
              await window.api.selectCommunity(userId, communityId, tabId);
              console.log('✅ Community selected via API:', community.name, 'tabId:', tabId);
            } else {
              // Fallback to local state if API not available
              console.warn('⚠️ API not available, using local state fallback');
              await setState('primaryCommunity', communityId);
              
              let activeCommunities = await getState('activeCommunities') || [];
              if (!activeCommunities.includes(communityId)) {
                activeCommunities.push(communityId);
                await setState('activeCommunities', activeCommunities);
              }
            }
            
            // Update local state for UI
            await setState('primaryCommunity', communityId);
            
            // Ensure it's active
            let activeCommunities = await getState('activeCommunities') || [];
            if (!activeCommunities.includes(communityId)) {
              activeCommunities.push(communityId);
              await setState('activeCommunities', activeCommunities);
            }
            
            // Close menu and refresh dropdown
            menu.style.display = 'none';
            await updateCommunityDropdown(communities);
            
            // Update header
            const currentCommunityNameEl = document.getElementById('current-community-name');
            if (currentCommunityNameEl) {
              currentCommunityNameEl.textContent = community.name;
            }
            
            // Reload chat for new primary community
            if (typeof window.loadChatHistory === 'function') {
              await window.loadChatHistory(communityId);
            }
            
            console.log('✅ Primary community changed to:', community.name);
          } catch (error) {
            console.error('❌ Error selecting community:', error);
            alert('Failed to change primary community. Please try again.');
          }
        });
      }
      
      communityList.appendChild(li);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.community-menu-btn') && !e.target.closest('.community-menu')) {
        document.querySelectorAll('.community-menu').forEach(m => m.style.display = 'none');
      }
    });
  }
  

  function switchCommunity(community) {
    console.log(`Switching primary community to: ${community.name}`);
    
    // Update the current community name in the header
    const currentCommunityName = document.getElementById('current-community-name');
    if (currentCommunityName) {
      currentCommunityName.textContent = community.name;
    }
    
    // Update the placeholder text
    updatePlaceholderText(community.name);
    
    // Close the dropdown
    const communityDropdownPanel = document.getElementById('community-dropdown-panel');
    if (communityDropdownPanel) {
      communityDropdownPanel.style.display = 'none';
    }
    
    // Get current active communities and update primary community
    // Modernized: Use StateManager instead of Chrome Storage
    getState('activeCommunities').then((activeCommunities) => {
      const communities = activeCommunities || [community.id];
      
      // Store updated primary community
      // Modernized: Use StateManager instead of Chrome Storage
      getState('communities').then((communities) => {
        setState('communities', {
          primaryCommunity: community.id,
          currentCommunity: community.id, // For backward compatibility
          communities: result.communities // Keep existing communities
        });
      });
      
      // Load chat history for the new primary community
      if (typeof window.loadChatHistory === 'function') {
        window.loadChatHistory(community.id);
      } else {
        console.log('🔍 COMMUNITIES: loadChatHistory not available for community switch');
      }
      
      // Note: We don't reload avatars here because we want to show people from ALL active communities
      // The avatars are already loaded from all active communities in loadCombinedAvatars()
    });
  }
  
  async function getPrimaryCommunityName() {
    try {
      const primaryCommunityId = await getState('primaryCommunity');
      const communitiesData = await getState('communities');
      const communities = communitiesData || [];
      
      if (primaryCommunityId && communities) {
        const primaryCommunity = communities.find(c => c.id === primaryCommunityId);
        return primaryCommunity ? primaryCommunity.name : '';
      }
      return '';
    } catch (error) {
      console.error('Failed to get primary community name:', error);
      return '';
    }
  }



// Load avatars from multiple communities and combine them
async function loadCombinedAvatars(communityIds) {
    try {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('👥 LOAD_VISIBILITY: === LOADING COMBINED AVATARS ===');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('👥 LOAD_VISIBILITY: Communities:', communityIds);
      console.log('👥 LOAD_VISIBILITY: Timestamp:', new Date().toISOString());
      console.log(`Loading combined avatars from communities: ${communityIds.join(', ')}`);
      
      // Get normalized URL for visibility - SAME AS MESSAGES
      console.log('');
      console.log('📊 LOAD_VISIBILITY: Step 1 - Normalizing URL');
      console.log('───────────────────────────────────────────────────────────');
      const urlData = await normalizeCurrentUrl();
      const currentUri = urlData.normalizedUrl; // Use normalized URL for consistency
      console.log('✅ LOAD_VISIBILITY: Normalized URL:', currentUri);
      console.log('✅ LOAD_VISIBILITY: Raw URL:', urlData.rawUrl);
      console.log('✅ LOAD_VISIBILITY: Page ID:', urlData.pageId);
      
      // COMP METHOD: Use the exact same approach as COMP
      let avatarResponses = [];
      try {
        console.log('');
        console.log('📊 LOAD_VISIBILITY: Step 2 - Using COMP method with Supabase realtime client');
        console.log('───────────────────────────────────────────────────────────');
        
        // COMP METHOD: Ensure presence tracking is active before querying
        if (!window.presenceTrackingActive) {
          console.log('🔧 LOAD_VISIBILITY: Presence tracking not active, initializing...');
          if (typeof window.initializePresenceTracking === 'function') {
            await window.initializePresenceTracking();
            // Wait a moment for presence to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        // COMP METHOD: Use the Supabase realtime client directly like COMP does
        const client = window.supabaseRealtimeClient || supabaseRealtimeClient;
        if (!client) {
          throw new Error('Supabase realtime client not available');
        }
        
        console.log('🌐 LOAD_VISIBILITY: Using client.getPageUsers() like COMP');
        const users = await client.getPageUsers(urlData.pageId);
        console.log('👁️ LOAD_VISIBILITY: Enhanced query returned users:', users.length);
        console.log('👁️ LOAD_VISIBILITY: Users:', users.map(u => `${u.user_email} (${u.is_active ? 'ACTIVE' : 'INACTIVE'})`));
        
        if (users && users.length > 0) {
          console.log('');
          console.log('✅✅✅ LOAD_VISIBILITY: Found active users using COMP method ✅✅✅');
          console.log('✅ LOAD_VISIBILITY: Count:', users.length);
          
          // COMP METHOD: Before processing users, cache current aura colors from visibility data
          // This ensures we preserve aura color updates that haven't been saved to DB yet
          const auraColorCache = {};
          if (window.currentVisibilityDataUnfiltered?.active) {
            window.currentVisibilityDataUnfiltered.active.forEach(user => {
              const userId = user.id || user.userId || user.user_id;
              const auraColor = user.aura_color; // COMP METHOD: Use aura_color (snake_case)
              if (userId && auraColor && auraColor !== window.AVATAR_FALLBACK_COLOR &&
                  auraColor !== '#ffffff' && auraColor !== 'ffffff') {
                auraColorCache[userId] = auraColor;
                console.log(`🔍 COMP METHOD: CommunitiesModule cached aura color for ${userId}: ${auraColor}`);
              }
            });
          }
          
          // Helper to safely derive a display name
          const safeNameFrom = (u) => {
            const email = u?.user_email;
            if (typeof email === 'string' && email.includes('@')) {
              return email.split('@')[0];
            }
            return u?.name || u?.handle || 'Unknown';
          };

          // COMP METHOD: Process users exactly like COMP does, with guards
          const usersWithAvatars = await Promise.all(users.map(async (user) => {
            let avatarUrl = null;
            let userName = safeNameFrom(user);
            let userHandle = userName;
            let avatarSource = 'none';
            
            console.log(`🔍 COMP AVATAR: Processing user ${user.user_email} using AvatarUtils`);
            
            try {
              // COMP METHOD: Use AvatarUtils directly (same as COMP)
              // Check both global and window.AvatarUtils
              const avatarUtils = window.AvatarUtils || AvatarUtils;
              if (typeof avatarUtils === 'undefined' || !avatarUtils.getAvatarUrl) {
                console.warn(`⚠️ COMP AVATAR: AvatarUtils not available, using fallback for ${user.user_email}`);
                throw new Error('AvatarUtils not available');
              }
              
              // Handle async AvatarUtils
              const avatarData = await avatarUtils.getAvatarUrl({
                id: user.user_id || user.userId || user.id,
                user_id: user.user_id || user.userId,
                email: user.user_email,
                name: user.name || userName,
                avatar_url: user.avatar_url
              }, 'visibility');
              avatarUrl = avatarData.avatarUrl;
              userName = avatarData.userName;
              avatarSource = avatarData.source;
              
              console.log(`✅ COMP AVATAR RESULT: ${user.user_email} - avatarUrl: ${avatarUrl}, source: ${avatarSource}, name: ${userName}`);
            } catch (error) {
              console.error(`❌ COMP AVATAR: Exception processing ${user.user_email}:`, error);
              
              // Fallback if AvatarUtils fails
              avatarUrl = `https://lh3.googleusercontent.com/a/default-user=s96-c`;
              avatarSource = 'fallback';
              console.warn(`COMP FALLBACK: Using generic avatar for ${user.user_email}: ${avatarUrl}`);
            }
            
            // COMP METHOD: Get user ID for aura color cache lookup
            const userId = user.user_id || user.userId || user.id || user.user_email;
            
            // COMP METHOD: Prioritize cached aura color (from real-time updates) over DB value
            // This preserves real-time aura color changes that haven't been saved to DB yet
            // COMP uses aura_color from DB (snake_case)
            const cachedAuraColor = auraColorCache[userId];
            const dbAuraColor = user.aura_color;
            const finalAuraColor = cachedAuraColor || dbAuraColor || window.AVATAR_FALLBACK_COLOR;
            
            if (cachedAuraColor && cachedAuraColor !== dbAuraColor) {
              console.log(`🔍 COMP METHOD: CommunitiesModule using cached aura color for ${userId}: ${cachedAuraColor} (DB had: ${dbAuraColor})`);
            }
            
            return {
              id: userId,
              userId: userId,
              email: user.user_email,
              name: userName,
              handle: userHandle,
              avatarUrl: avatarUrl,
              aura_color: finalAuraColor,
              communityId: 'comm-001',
              communityName: 'Community comm-001',
              lastSeen: user.last_seen,
              availability: null,
              customLabel: null,
              enterTime: user.enter_time,
              isActive: user.is_active,
              status: user.is_active ? 'online' : 'offline',
              avatarSource: avatarSource
            };
          }));
          
          // Convert to the format expected by updateVisibleTab
          const formattedResponse = {
            active: usersWithAvatars,
            pageId: urlData.pageId,
            url: currentUri
          };
          
          avatarResponses = [formattedResponse];
          console.log('✅ LOAD_VISIBILITY: Users with avatars processed:', usersWithAvatars.length);
        } else {
          console.log('');
          console.log('⚠️⚠️⚠️ LOAD_VISIBILITY: No active users found using COMP method ⚠️⚠️⚠️');
          console.log('⚠️ LOAD_VISIBILITY: This page has no currently active users');
          throw new Error('No active users found via COMP method');
        }
      } catch (urlError) {
        console.log('🔍 VISIBILITY: URL-based presence failed, falling back to community-based:', urlError.message);
        
            // If it's a 401 error, wait a bit and retry once
            if (urlError.message.includes('401')) {
              console.log('🔍 VISIBILITY: 401 error detected, waiting for authentication and retrying...');
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
              try {
                console.log('🔍 VISIBILITY: Retrying URL-based presence API...');
                const retryResponse = await api.getPresenceByUrl(currentUri, communityIds);
                console.log('🔍 VISIBILITY: Retry response:', JSON.stringify(retryResponse, null, 2));
  
                if (retryResponse && retryResponse.length > 0) {
                  console.log('🔍 VISIBILITY: Retry successful - found', retryResponse.length, 'active users');
                  
                  // COMP METHOD: Cache aura colors before processing retry response
                  const retryAuraColorCache = {};
                  if (window.currentVisibilityDataUnfiltered?.active) {
                    window.currentVisibilityDataUnfiltered.active.forEach(user => {
                      const userId = user.id || user.userId || user.user_id;
                      const auraColor = user.aura_color; // COMP METHOD: Use aura_color (snake_case)
                      if (userId && auraColor && auraColor !== window.AVATAR_FALLBACK_COLOR &&
                          auraColor !== '#ffffff' && auraColor !== 'ffffff') {
                        retryAuraColorCache[userId] = auraColor;
                      }
                    });
                  }
                  
                  // Convert to expected format
                  const formattedResponse = {
                    active: retryResponse.map(user => {
                      const userId = user.user_email || user.user_id;
                      // COMP METHOD: Prioritize cached aura color over DB value
                      // COMP uses aura_color from DB (snake_case)
                      const cachedAuraColor = retryAuraColorCache[userId];
                      const dbAuraColor = user.aura_color;
                      const finalAuraColor = cachedAuraColor || dbAuraColor || window.AVATAR_FALLBACK_COLOR;
                      
                      return {
                        id: userId,
                        userId: userId,
                        email: user.user_email,
                        name: user.user_email.split('@')[0],
                        handle: user.user_email.split('@')[0],
                        avatarUrl: user.avatar_url,
                        aura_color: finalAuraColor,
                        communityId: 'comm-001',
                        communityName: 'Community comm-001',
                        lastSeen: user.last_seen,
                        availability: null,
                        customLabel: null,
                        enterTime: user.enter_time,
                        isActive: user.is_active,
                        status: 'online'
                      };
                    }),
                    pageId: currentUri.replace(/[^a-zA-Z0-9]/g, '_'),
                    url: currentUri
                  };
                  avatarResponses = [formattedResponse];
                } else {
                  console.log('🔍 VISIBILITY: Retry successful but no active users found');
                  throw new Error('No active users found via URL-based presence retry');
                }
              } catch (retryError) {
                console.log('🔍 VISIBILITY: Retry also failed:', retryError.message);
              }
            }
        
        // REMOVED: Community-based presence fallback was causing 400 errors
        // The user_presence table doesn't have a community_id column
        // If URL-based presence fails, show empty list
        if (avatarResponses.length === 0) {
          console.log('🔍 VISIBILITY: URL-based presence failed - showing empty list');
          console.log('🔍 VISIBILITY: No presence data available');
          
          // CRITICAL FIX: Always call updateVisibleTab even with empty data
          if (typeof updateVisibleTab === 'function') {
            console.log('🔄 REFRESH_VISIBILITY: Calling updateVisibleTab with empty data...');
            updateVisibleTab([]);
          } else {
            console.error('❌ REFRESH_VISIBILITY: updateVisibleTab function not available');
          }
          
          return [];
        }
      }
      
      console.log('🔍 VISIBILITY: Final avatar responses from API:', avatarResponses);
      
      // Combine and deduplicate avatars
      const allAvatars = [];
      const seenUsers = new Set();
      
      avatarResponses.forEach((response, index) => {
        const communityId = communityIds[index];
        let avatars;
        
        console.log('COMMUNITIES: Loading avatars for community');
        
        // Handle different response formats
        if (response && response.avatars && Array.isArray(response.avatars)) {
          avatars = response.avatars;
          } else if (response && response.active && Array.isArray(response.active)) {
          avatars = response.active;
          } else if (Array.isArray(response)) {
          avatars = response;
          } else if (response && typeof response === 'object') {
          // Check for other possible structures
          if (response.users && Array.isArray(response.users)) {
            avatars = response.users;
            } else {
            avatars = [];
            console.log( 'general');
          }
        } else {
          avatars = [];
          }
        
        // Add community info to each avatar and deduplicate
        avatars.forEach((avatar, avatarIndex) => {
          const userKey = `${avatar.userId || avatar.id}`;
          if (!seenUsers.has(userKey)) {
            seenUsers.add(userKey);
            allAvatars.push({
              ...avatar,
              communityId: communityId,
              communityName: avatar.communityName || `Community ${communityId}`
            });
            console.log(`VISIBILITY: Added unique avatar: ${avatar.name || avatar.handle || 'Unknown'} (${userKey}) from ${communityId}`, null, 'general');
          } else {
            console.log(`⏭️ VISIBILITY: Skipped duplicate avatar: ${avatar.name || avatar.handle || 'Unknown'} (${userKey}) from ${communityId}`, null, 'general');
          }
        });
      });
      
      console.log(`Combined avatars from ${communityIds.length} communities:`, allAvatars);
      console.log(`Total unique avatars: ${allAvatars.length}`);
      
      // Enhanced logging for final avatars before passing to updateVisibleTab
      console.log('🔍 VISIBILITY: Final avatars to be processed by updateVisibleTab:');
      allAvatars.forEach((avatar, index) => {
        });
      
      // Update the visible tab with combined avatar data
      await updateVisibleTab(allAvatars);
      
      // CRITICAL FIX: Update profile avatar AFTER visibility data is loaded
      // This ensures the profile avatar can access the real avatar URL from window.currentVisibilityDataUnfiltered
      console.log('🔍 PROFILE_AVATAR_REFRESH: Refreshing profile avatar with real data from visibility...');
      if (window.currentUser) {
        console.log('🔍 PROFILE_AVATAR_REFRESH: Current user exists, calling updateUI()...');
        await updateUI(window.currentUser);
        console.log('✅ PROFILE_AVATAR_REFRESH: Profile avatar refreshed with real avatar data');
      } else {
        console.log('⚠️ PROFILE_AVATAR_REFRESH: No current user to refresh');
      }
    } catch (error) {
      console.error('❌ VISIBILITY: Failed to load combined avatars:', error);
      console.log(`Failed to load combined avatars: ${error.message}`);
      await updateVisibleTab([]);
    }
  }
  
  // Legacy function for backward compatibility - now accepts array of community IDs
  async function loadAvatars(communityIds) {
    try {
      // If single community ID passed, convert to array
      if (typeof communityIds === 'string') {
        communityIds = [communityIds];
      }
      
      // If no community IDs provided, get from storage
      if (!communityIds || communityIds.length === 0) {
        const activeCommunities = await getState('activeCommunities');
        const result = { activeCommunities };
        communityIds = result.activeCommunities || ['comm-001'];
      }
      
      console.log(`Loading avatars for communities: ${communityIds.join(', ')}`);
      
      // Use the combined avatars function
      await loadCombinedAvatars(communityIds);
    } catch (error) {
      console.error('Failed to load avatars:', error);
      console.log(`Failed to load avatars: ${error.message}`);
    }
  }
  
  function updatePlaceholderText(communityName) {
    const chatTextarea = document.getElementById('chat-textarea');
    if (chatTextarea) {
      chatTextarea.placeholder = `Start thread in ${communityName}`;
    }
  }
  

async function loadMessageReplies(messageId, conversationId, communityId = null) {
  try {
    // Get the community ID from parameter or use the first active community
    const resolvedCommunityId = communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
    
    // Get the full conversation to find replies to this specific message
    // Use Supabase real-time instead of API polling
    const { data: response, error } = await supabase
      .from('messages')
      .select('*')
      .eq('community_id', resolvedCommunityId)
      .eq('page_id', this.currentPage?.pageId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    if (response && response.posts) {
      const replies = response.posts.filter(post => post.parentId === messageId);
      
      // Sort replies by creation time
      replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Add each reply (they will be visible since we're in focus mode)
      for (const reply of replies) {
        // Check if this reply has its own replies (nested replies)
        const nestedReplies = response.posts.filter(post => post.parentId === reply.id);
        
        const replyMsg = {
          ...reply,
          conversationId,
          isReply: true,
          hasReplies: nestedReplies.length > 0 // Show thread toggle if it has nested replies
        };
        await addMessageToChat(replyMsg);
      }
    }
  } catch (error) {
    console.error('Failed to load message replies:', error);
  }
}


// Note: loadChatHistory is in CanopiModule.js, not CommunitiesModule.js

*/
// Note: Window exports will be added in compiled JS for backward compatibility
// TypeScript source uses pure ES6 exports only

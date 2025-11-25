/**
 * COMMUNITY HELPERS - Community UI Helper Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */

import { getState, setState, setActiveCommunitiesState } from '../core/StateManager.js';
import { Logger } from '../utils/Logger.js';
import { handleError } from '../utils/ErrorHandler.js';

interface Community {
  id: string;
  name: string;
  description?: string;
  codeOfConduct?: string;
  logoUrl?: string;
  communityLink?: string;
  onboardingInstructions?: string;
  isPublic?: boolean;
  isOpen?: boolean;
  profileLink?: string;
  createdAt?: string;
  updatedAt?: string;
  submittedEmail?: string | null;
  submittedPhone?: string | null;
  purpose?: string | null;
  status?: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  meta_domain?: string | null;
}

// Declare window globals (for reading only)
declare const window: Window & {
  loadChatHistory?: (rawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  refreshVisibilityAvatars?: () => Promise<void>;
  authManager?: {
    [key: string]: unknown;
  };
  tabIdManager?: {
    [key: string]: unknown;
  };
  api?: {
    [key: string]: unknown;
  };
};

// Declare global functions that will be available
declare const loadCombinedAvatars: (communityIds: string[]) => Promise<void>;

const toCommunityIdArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const unique = new Set<string>();
  value.forEach(item => {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.length > 0) {
        unique.add(trimmed);
      }
    }
  });
  return Array.from(unique);
};

const readActiveCommunitiesFromState = (): string[] => {
  const uiCommunities = toCommunityIdArray(getState('ui.activeCommunities'));
  if (uiCommunities.length > 0) {
    return uiCommunities;
  }
  const legacyCommunities = toCommunityIdArray(getState('activeCommunities'));
  if (legacyCommunities.length > 0) {
    return legacyCommunities;
  }
  if (typeof window !== 'undefined') {
    return toCommunityIdArray(window.activeCommunities);
  }
  return [];
};

/**
 * Update community dropdown with list of communities
 */
export async function updateCommunityDropdown(communities: Community[]): Promise<void> {
  try {
    const communityList = document.querySelector('.community-list');
    if (!communityList) return;
    
    // Get current active communities and primary community
    const activeCommunities = readActiveCommunitiesFromState();
    const primaryCommunityId = (await getState('primaryCommunity')) || (communities[0]?.id);
  
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
      <div class="community-menu-dropdown" data-community-id="${community.id}">
        <button class="community-menu-item set-primary-btn" data-community-id="${community.id}">
          Set as Primary
        </button>
      </div>
      ` : ''}
    `;
    
    communityList.appendChild(li);
    
    // Add event listener to checkbox
    const checkbox = li.querySelector('.community-checkbox') as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener('change', async (e: Event) => {
        try {
          const target = e.target as HTMLInputElement;
          e.stopPropagation();
          const communityId = target.dataset.communityId;
          let activeCommunities = readActiveCommunitiesFromState();
          const activeCommunitiesSet = new Set(activeCommunities);
          
          const isChecked = target.checked;
          
          if (isChecked && communityId) {
            activeCommunitiesSet.add(communityId);
          } else if (communityId) {
            activeCommunitiesSet.delete(communityId);
          }
          
          // Update state
          activeCommunities = Array.from(activeCommunitiesSet);
          setActiveCommunitiesState(activeCommunities);
          
          // Reload avatars and chat history for the updated active communities
          Logger.debug(`🔄 COMMUNITIES: Active communities updated to: ${activeCommunities.join(', ')}`, null, 'community');
          if (typeof window.refreshVisibilityAvatars === 'function') {
            await window.refreshVisibilityAvatars();
          } else if (typeof loadCombinedAvatars === 'function') {
            await loadCombinedAvatars(activeCommunities);
          }
          if (typeof window.loadChatHistory === 'function') {
            await window.loadChatHistory(null, activeCommunities);
          }
        } catch (error: unknown) {
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
              operation: 'updateCommunityCheckbox',
              component: 'CommunityHelpers'
            }
          });
        }
      });
    }
    
    // Add event listener to three-dot menu button
    if (!isPrimary) {
      const menuBtn = li.querySelector('.community-menu-btn') as HTMLButtonElement;
      const menuDropdown = li.querySelector('.community-menu-dropdown') as HTMLElement;
      
      if (menuBtn && menuDropdown) {
        menuBtn.addEventListener('click', (e: Event) => {
          e.stopPropagation();
          
          // Close all other dropdowns
          document.querySelectorAll('.community-menu-dropdown').forEach(dropdown => {
            if (dropdown !== menuDropdown) {
              (dropdown as HTMLElement).style.display = 'none';
            }
          });
          
          // Toggle this dropdown
          const isVisible = menuDropdown.style.display === 'block' || 
                           (menuDropdown.style.display === '' && getComputedStyle(menuDropdown).display === 'block');
          menuDropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        // Add event listener to "Set as Primary" button
        const setPrimaryBtn = menuDropdown.querySelector('.set-primary-btn') as HTMLButtonElement;
        if (setPrimaryBtn) {
          setPrimaryBtn.addEventListener('click', async (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLButtonElement;
            const communityId = target.dataset.communityId;
            
            if (communityId) {
              try {
                // Update primary community
                setState('primaryCommunity', communityId);
                setState('currentCommunity', communityId);
                
                // Close dropdown
                menuDropdown.style.display = 'none';
                
                // Reload community dropdown to reflect changes
                await updateCommunityDropdown(communities);
                
                Logger.debug(`✅ COMMUNITIES: Set ${community.name} as primary community`, null, 'community');
              } catch (error: unknown) {
                handleError(error, {
                  log: true,
                  logLevel: 'error',
                  context: {
                    operation: 'setPrimaryCommunity',
                    component: 'CommunityHelpers',
                    communityId
                  }
                });
              }
            }
          });
        }
      }
    }
  });
  
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.community-menu-btn') && !target.closest('.community-menu-dropdown')) {
        document.querySelectorAll('.community-menu-dropdown').forEach(dropdown => {
          (dropdown as HTMLElement).style.display = 'none';
        });
      }
    });
  } catch (error: unknown) {
    handleError(error, {
      log: true,
      logLevel: 'error',
      context: {
        operation: 'updateCommunityDropdown',
        component: 'CommunityHelpers'
      }
    });
  }
}

/**
 * Update placeholder text with community name
 */
export function updatePlaceholderText(communityName: string): void {
  const messageInput = document.getElementById('message-input') as HTMLTextAreaElement;
  if (messageInput) {
    messageInput.placeholder = `Message ${communityName}...`;
  }
}

/**
 * Get primary community name
 */
export async function getPrimaryCommunityName(): Promise<string> {
  try {
    const primaryCommunityId = await getState('primaryCommunity');
    const communitiesRaw = await getState('communities');
    const communities: Community[] = Array.isArray(communitiesRaw) 
      ? communitiesRaw.filter((item): item is Community => typeof item === 'object' && item !== null && 'id' in item && 'name' in item)
      : [];
    const primaryCommunity = communities.find((c: Community) => c.id === primaryCommunityId);
    return primaryCommunity?.name || 'Community';
  } catch (error: unknown) {
    handleError(error, {
      log: true,
      logLevel: 'error',
      context: {
        operation: 'getPrimaryCommunityName',
        component: 'CommunityHelpers'
      }
    });
    return 'Community';
  }
}

// Export all functions
export default {
  updateCommunityDropdown,
  updatePlaceholderText,
  getPrimaryCommunityName
};


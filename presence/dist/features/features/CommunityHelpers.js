/**
 * COMMUNITY HELPERS - Community UI Helper Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */
import { getState, setState, setActiveCommunitiesState } from '../core/StateManager.js';
import { Logger } from '../utils/Logger.js';
import { handleError } from '../utils/ErrorHandler.js';
const toCommunityIdArray = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }
    const unique = new Set();
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
const readActiveCommunitiesFromState = () => {
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
export async function updateCommunityDropdown(communities) {
    try {
        const communityList = document.querySelector('.community-list');
        if (!communityList)
            return;
        // Get current active communities and primary community
        const activeCommunities = readActiveCommunitiesFromState();
        const primaryCommunityId = (await getState('primaryCommunity')) || (communities[0]?.id);
        // Clear existing communities
        communityList.innerHTML = '';
        // Update primary community name and logo in header
        const primaryCommunity = communities.find(c => c.id === primaryCommunityId);
        const currentCommunityNameEl = document.getElementById('current-community-name');
        const primaryCommunityLogoEl = document.getElementById('primary-community-logo');
        if (currentCommunityNameEl && primaryCommunity) {
            currentCommunityNameEl.textContent = primaryCommunity.name;
        }
        // Update primary community logo with fallback to generic
        if (primaryCommunityLogoEl && primaryCommunity) {
            if (primaryCommunity.logoUrl) {
                primaryCommunityLogoEl.src = primaryCommunity.logoUrl;
                primaryCommunityLogoEl.removeAttribute('data-community-fallback');
            }
            else {
                // Fallback to generic logo
                primaryCommunityLogoEl.src = '/images/community1.png';
                primaryCommunityLogoEl.setAttribute('data-community-fallback', 'true');
            }
            primaryCommunityLogoEl.alt = `${primaryCommunity.name} logo`;
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
          Make Primary
        </button>
        <button class="community-menu-item leave-community-btn" data-community-id="${community.id}">
          Leave
        </button>
      </div>
      ` : ''}
    `;
            communityList.appendChild(li);
            // Add event listener to checkbox
            const checkbox = li.querySelector('.community-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', async (e) => {
                    try {
                        const target = e.target;
                        e.stopPropagation();
                        const communityId = target.dataset.communityId;
                        let activeCommunities = readActiveCommunitiesFromState();
                        const activeCommunitiesSet = new Set(activeCommunities);
                        const isChecked = target.checked;
                        if (isChecked && communityId) {
                            activeCommunitiesSet.add(communityId);
                        }
                        else if (communityId) {
                            activeCommunitiesSet.delete(communityId);
                        }
                        // Update state
                        activeCommunities = Array.from(activeCommunitiesSet);
                        setActiveCommunitiesState(activeCommunities);
                        // Reload avatars and chat history for the updated active communities
                        Logger.debug(`🔄 COMMUNITIES: Active communities updated to: ${activeCommunities.join(', ')}`, null, 'community');
                        if (typeof window.refreshVisibilityAvatars === 'function') {
                            await window.refreshVisibilityAvatars();
                        }
                        else if (typeof loadCombinedAvatars === 'function') {
                            await loadCombinedAvatars(activeCommunities);
                        }
                        if (typeof window.loadChatHistory === 'function') {
                            await window.loadChatHistory(null, activeCommunities);
                        }
                    }
                    catch (error) {
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
                const menuBtn = li.querySelector('.community-menu-btn');
                const menuDropdown = li.querySelector('.community-menu-dropdown');
                if (menuBtn && menuDropdown) {
                    menuBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Close all other dropdowns
                        document.querySelectorAll('.community-menu-dropdown').forEach(dropdown => {
                            if (dropdown !== menuDropdown) {
                                dropdown.style.display = 'none';
                            }
                        });
                        // Toggle this dropdown
                        const isVisible = menuDropdown.style.display === 'block' ||
                            (menuDropdown.style.display === '' && getComputedStyle(menuDropdown).display === 'block');
                        menuDropdown.style.display = isVisible ? 'none' : 'block';
                    });
                    // Add event listener to "Make Primary" button
                    const setPrimaryBtn = menuDropdown.querySelector('.set-primary-btn');
                    if (setPrimaryBtn) {
                        setPrimaryBtn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const target = e.target;
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
                                }
                                catch (error) {
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
                    // Add event listener to "Leave" button
                    const leaveBtn = menuDropdown.querySelector('.leave-community-btn');
                    if (leaveBtn) {
                        leaveBtn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const target = e.target;
                            const communityId = target.dataset.communityId;
                            if (communityId) {
                                try {
                                    // Remove community from active communities
                                    let activeCommunities = readActiveCommunitiesFromState();
                                    activeCommunities = activeCommunities.filter(id => id !== communityId);
                                    setActiveCommunitiesState(activeCommunities);
                                    // If this was the primary community, set first remaining as primary
                                    if (primaryCommunityId === communityId && activeCommunities.length > 0) {
                                        setState('primaryCommunity', activeCommunities[0]);
                                        setState('currentCommunity', activeCommunities[0]);
                                    }
                                    // Close dropdown
                                    menuDropdown.style.display = 'none';
                                    // Reload community dropdown to reflect changes
                                    await updateCommunityDropdown(communities.filter(c => activeCommunities.includes(c.id)));
                                    Logger.debug(`✅ COMMUNITIES: Left ${community.name}`, null, 'community');
                                }
                                catch (error) {
                                    handleError(error, {
                                        log: true,
                                        logLevel: 'error',
                                        context: {
                                            operation: 'leaveCommunity',
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
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!target.closest('.community-menu-btn') && !target.closest('.community-menu-dropdown')) {
                document.querySelectorAll('.community-menu-dropdown').forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });
    }
    catch (error) {
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
export function updatePlaceholderText(communityName) {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.placeholder = `Message ${communityName}...`;
    }
}
/**
 * Get primary community name
 */
export async function getPrimaryCommunityName() {
    try {
        const primaryCommunityId = await getState('primaryCommunity');
        const communitiesRaw = await getState('communities');
        const communities = Array.isArray(communitiesRaw)
            ? communitiesRaw.filter((item) => typeof item === 'object' && item !== null && 'id' in item && 'name' in item)
            : [];
        const primaryCommunity = communities.find((c) => c.id === primaryCommunityId);
        return primaryCommunity?.name || 'Community';
    }
    catch (error) {
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

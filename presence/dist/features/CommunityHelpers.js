/**
 * COMMUNITY HELPERS - Community UI Helper Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */
import { getState, setState } from '../core/StateManager.js';
/**
 * Update community dropdown with list of communities
 */
export async function updateCommunityDropdown(communities) {
    const communityList = document.querySelector('.community-list');
    if (!communityList)
        return;
    // Get current active communities and primary community
    const activeCommunities = (await getState('activeCommunities')) || [];
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
        const checkbox = li.querySelector('.community-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', async (e) => {
                const target = e.target;
                e.stopPropagation();
                const communityId = target.dataset.communityId;
                let activeCommunities = (await getState('activeCommunities')) || [];
                const isChecked = target.checked;
                if (isChecked && communityId) {
                    activeCommunities.push(communityId);
                }
                else if (communityId) {
                    const index = activeCommunities.indexOf(communityId);
                    if (index > -1) {
                        activeCommunities.splice(index, 1);
                    }
                }
                // Update state
                setState('activeCommunities', activeCommunities);
                // Reload avatars and chat history for the updated active communities
                console.log(`🔄 COMMUNITIES: Active communities updated to: ${activeCommunities.join(', ')}`);
                if (typeof window.refreshVisibilityAvatars === 'function') {
                    await window.refreshVisibilityAvatars();
                }
                else if (typeof loadCombinedAvatars === 'function') {
                    await loadCombinedAvatars(activeCommunities);
                }
                if (typeof window.loadChatHistory === 'function') {
                    await window.loadChatHistory(null, activeCommunities);
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
                // Add event listener to "Set as Primary" button
                const setPrimaryBtn = menuDropdown.querySelector('.set-primary-btn');
                if (setPrimaryBtn) {
                    setPrimaryBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const target = e.target;
                        const communityId = target.dataset.communityId;
                        if (communityId) {
                            // Update primary community
                            setState('primaryCommunity', communityId);
                            setState('currentCommunity', communityId);
                            // Close dropdown
                            menuDropdown.style.display = 'none';
                            // Reload community dropdown to reflect changes
                            await updateCommunityDropdown(communities);
                            console.log(`✅ COMMUNITIES: Set ${community.name} as primary community`);
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
    const primaryCommunityId = await getState('primaryCommunity');
    const communities = (await getState('communities')) || [];
    const primaryCommunity = communities.find((c) => c.id === primaryCommunityId);
    return primaryCommunity?.name || 'Community';
}
// Export all functions
export default {
    updateCommunityDropdown,
    updatePlaceholderText,
    getPrimaryCommunityName
};
//# sourceMappingURL=CommunityHelpers.js.map
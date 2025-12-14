/**
 * COMMUNITY HELPERS - Community UI Helper Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */
import { createEventListenerManager } from '../utils/EventListenerManager.js';
import { getState, setState } from '../core/StateManager.js';
import { Logger } from '../utils/Logger.js';
import { handleError } from '../utils/ErrorHandler.js';
import { userPreferencesManager } from '../utils/UserPreferencesManager.js';
import { loadChatHistory } from './MessagesModule.js';
import { api } from './APIModule.js';
const toCommunityIdArray = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }
    const unique = new Set();
    value.forEach((item) => {
        if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed.length > 0) {
                unique.add(trimmed);
            }
        }
    });
    return Array.from(unique);
};
/**
 * Read active communities from state
 */
function readActiveCommunitiesFromState() {
    try {
        const activeCommunities = getState('activeCommunities');
        return toCommunityIdArray(activeCommunities);
    }
    catch (error) {
        Logger.warn('Failed to read active communities from state', error, 'community');
        return [];
    }
}
/**
 * Update community dropdown with list of communities
 */
export async function updateCommunityDropdown(communities) {
    // Create event manager for this function scope
    const communityEventManager = createEventListenerManager();
    try {
        const communityList = document.querySelector('.community-list');
        if (!communityList)
            return;
        // CRITICAL FIX: Clean up old dropdowns before updating list
        document.querySelectorAll('.community-menu-dropdown').forEach((dropdown) => {
            dropdown.remove();
        });
        // Get current active communities and primary community
        const activeCommunities = readActiveCommunitiesFromState();
        const primaryCommunityIdRaw = await getState('primaryCommunity');
        const primaryCommunityId = (typeof primaryCommunityIdRaw === 'string' ? primaryCommunityIdRaw : null) ||
            communities[0]?.id ||
            null;
        // Clear existing communities
        // SECURITY: Use safe DOM manipulation to clear content
        while (communityList.firstChild) {
            communityList.removeChild(communityList.firstChild);
        }
        // Sort communities: primary first, then alphabetical by name
        const sortedCommunities = [...communities].sort((a, b) => {
            // Primary community first
            if (a.id === primaryCommunityId)
                return -1;
            if (b.id === primaryCommunityId)
                return 1;
            // Then alphabetical by name
            return a.name.localeCompare(b.name);
        });
        // Update primary community name and logo in header
        const primaryCommunity = sortedCommunities.find((c) => c.id === primaryCommunityId) || sortedCommunities[0];
        const currentCommunityNameEl = document.getElementById('current-community-name');
        const primaryCommunityLogoEl = document.getElementById('primary-community-logo');
        // Log primary community logoUrl explicitly as string
        const primaryLogoUrlStr = primaryCommunity?.logoUrl ? String(primaryCommunity.logoUrl) : '';
        Logger.debug(`🔍 COMMUNITIES: Primary community: ${primaryCommunity?.name || 'NONE'} | logoUrl: "${primaryLogoUrlStr}"`, {
            id: primaryCommunity?.id,
            name: primaryCommunity?.name,
            logoUrl: primaryLogoUrlStr,
            hasLogoUrl: !!primaryCommunity?.logoUrl,
            logoUrlType: typeof primaryCommunity?.logoUrl,
        }, 'community');
        if (currentCommunityNameEl) {
            if (primaryCommunity) {
                currentCommunityNameEl.textContent = primaryCommunity.name;
                Logger.debug(`✅ COMMUNITIES: Set primary community name to: ${primaryCommunity.name}`, null, 'community');
            }
            else {
                // No communities available - clear the name
                currentCommunityNameEl.textContent = '';
                Logger.warn('⚠️ COMMUNITIES: No primary community found to display', null, 'community');
            }
        }
        else {
            Logger.warn('⚠️ COMMUNITIES: current-community-name element not found', null, 'community');
        }
        // Update primary community logo - Use Canopi logo as placeholder if no logoUrl
        if (primaryCommunityLogoEl) {
            if (primaryCommunity && primaryCommunity.logoUrl) {
                const logoUrl = primaryCommunity.logoUrl.trim();
                // Validate URL format - must be absolute URL or path starting with /
                if (!logoUrl.startsWith('http://') &&
                    !logoUrl.startsWith('https://') &&
                    !logoUrl.startsWith('/')) {
                    Logger.error(`❌ COMMUNITIES: Invalid logoUrl format: ${logoUrl}`, null, 'community');
                    // Hide logo if invalid URL
                    primaryCommunityLogoEl.style.display = 'none';
                }
                else {
                    // CRITICAL FIX: Remove $0 suffix if present (Chrome DevTools artifact)
                    let cleanedLogoUrl = logoUrl;
                    if (cleanedLogoUrl.endsWith('$0')) {
                        cleanedLogoUrl = cleanedLogoUrl.slice(0, -2);
                        Logger.warn(`⚠️ COMMUNITIES: Removed $0 suffix from primary community logoUrl`, {
                            original: logoUrl,
                            cleaned: cleanedLogoUrl,
                        }, 'community');
                    }
                    primaryCommunityLogoEl.src = cleanedLogoUrl;
                    primaryCommunityLogoEl.style.display = 'block';
                    Logger.debug(`✅ COMMUNITIES: Set primary community logo to: ${cleanedLogoUrl}`, null, 'community');
                }
            }
            else {
                // No logoUrl - hide the logo element
                primaryCommunityLogoEl.style.display = 'none';
                Logger.debug('ℹ️ COMMUNITIES: No logoUrl available, hiding logo', null, 'community');
            }
        }
        else {
            Logger.warn('⚠️ COMMUNITIES: primary-community-logo element not found', null, 'community');
        }
        // Add communities to dropdown
        sortedCommunities.forEach((community) => {
            const li = document.createElement('li');
            li.className = 'community-item';
            li.setAttribute('data-community-id', community.id);
            // Create community content
            const communityContent = document.createElement('div');
            communityContent.className = 'community-content';
            // Community name
            const nameDiv = document.createElement('div');
            nameDiv.className = 'community-name';
            nameDiv.textContent = community.name;
            communityContent.appendChild(nameDiv);
            // Community description (if available)
            if (community.description) {
                const descDiv = document.createElement('div');
                descDiv.className = 'community-description';
                descDiv.textContent = community.description;
                communityContent.appendChild(descDiv);
            }
            // Member count (if available)
            if (community.memberCount) {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'community-members';
                memberDiv.textContent = `${community.memberCount} members`;
                communityContent.appendChild(memberDiv);
            }
            // Active indicator
            if (activeCommunities.includes(community.id)) {
                li.classList.add('active');
                const activeIndicator = document.createElement('div');
                activeIndicator.className = 'active-indicator';
                activeIndicator.textContent = '✓';
                communityContent.appendChild(activeIndicator);
            }
            li.appendChild(communityContent);
            communityList.appendChild(li);
            // Add click handler for community selection
            communityEventManager.on(li, 'click', async () => {
                try {
                    await handleCommunitySelection(community.id);
                }
                catch (error) {
                    handleError(error, {
                        context: { operation: 'communitySelection', communityId: community.id },
                    });
                }
            });
        });
        Logger.info(`✅ COMMUNITIES: Updated dropdown with ${communities.length} communities (primary: ${primaryCommunity?.name || 'NONE'})`, null, 'community');
    }
    catch (error) {
        handleError(error, {
            context: { operation: 'updateCommunityDropdown', communityCount: communities.length },
        });
    }
}
/**
 * Handle community selection from dropdown
 */
async function handleCommunitySelection(communityId) {
    try {
        Logger.info(`🔄 COMMUNITIES: Selecting community: ${communityId}`, null, 'community');
        // Update active communities in state
        const activeCommunities = readActiveCommunitiesFromState();
        if (!activeCommunities.includes(communityId)) {
            activeCommunities.push(communityId);
            await setState('activeCommunities', activeCommunities);
            // Save to preferences (stringify array as expected by schema)
            await userPreferencesManager.savePreference('activeCommunities', JSON.stringify(activeCommunities));
        }
        // Set as primary community
        await setState('primaryCommunity', communityId);
        await userPreferencesManager.savePreference('primaryCommunity', communityId);
        // Reload communities dropdown to reflect changes
        const communities = await loadCommunitiesFromAPI();
        if (communities.length > 0) {
            await updateCommunityDropdown(communities);
        }
        // Load messages for the selected community
        await loadChatHistory(communityId);
        Logger.info(`✅ COMMUNITIES: Successfully selected community: ${communityId}`, null, 'community');
    }
    catch (error) {
        handleError(error, {
            context: { operation: 'handleCommunitySelection', communityId },
        });
    }
}
/**
 * Load communities from API
 */
async function loadCommunitiesFromAPI() {
    try {
        const response = await api.getCommunities();
        if (response && response.data && response.data.communities) {
            return response.data.communities.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                logoUrl: c.logoUrl,
                memberCount: c.memberCount,
                isActive: c.isActive,
                status: c.status,
                meta_domain: c.meta_domain,
            }));
        }
        return [];
    }
    catch (error) {
        Logger.error('❌ Failed to load communities from API', error, 'community');
        return [];
    }
}
/**
 * Initialize community dropdown click handler
 */
export function initializeCommunityDropdown() {
    const trigger = document.querySelector('.community-dropdown-trigger');
    const panel = document.getElementById('community-dropdown-panel');
    const closeBtn = document.getElementById('close-community-dropdown');
    if (!trigger || !panel) {
        Logger.warn('⚠️ Community dropdown elements not found during initialization', null, 'community');
        return;
    }
    // Toggle dropdown on trigger click
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';
    });
    // Close dropdown on close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !panel.contains(e.target)) {
            panel.style.display = 'none';
        }
    });
    Logger.info('✅ Community dropdown initialized', null, 'community');
}
// Export additional functions for external use
export { loadCommunitiesFromAPI };
/**
 * Get primary community name from list of communities
 */
export function getPrimaryCommunityName(communities) {
    const primary = communities.find(c => c.id === 'primary' || c.isActive);
    return primary ? primary.name : 'No Active Community';
}
//# sourceMappingURL=CommunityHelpers.js.map
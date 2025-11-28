/**
 * COMMUNITY HELPERS - Community UI Helper Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */
import { getState, setState, setActiveCommunitiesState } from '../core/StateManager.js';
import { Logger } from '../utils/Logger.js';
import { handleError } from '../utils/ErrorHandler.js';
import { savePreference } from '../utils/UserPreferencesManager.js';
import { loadChatHistory } from './MessagesModule.js';
import { loadCombinedAvatars } from './CommunityLoaders.js';
import { api } from './APIModule.js';
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
    // No window fallback - use state manager only
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
        const primaryCommunityIdRaw = await getState('primaryCommunity');
        const primaryCommunityId = (typeof primaryCommunityIdRaw === 'string' ? primaryCommunityIdRaw : null) || (communities[0]?.id || null);
        // Clear existing communities
        communityList.innerHTML = '';
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
        const primaryCommunity = sortedCommunities.find(c => c.id === primaryCommunityId) || sortedCommunities[0];
        const currentCommunityNameEl = document.getElementById('current-community-name');
        const primaryCommunityLogoEl = document.getElementById('primary-community-logo');
        // Log primary community logoUrl explicitly as string
        const primaryLogoUrlStr = primaryCommunity?.logoUrl ? String(primaryCommunity.logoUrl) : '';
        Logger.debug(`🔍 COMMUNITIES: Primary community: ${primaryCommunity?.name || 'NONE'} | logoUrl: "${primaryLogoUrlStr}"`, {
            id: primaryCommunity?.id,
            name: primaryCommunity?.name,
            logoUrl: primaryLogoUrlStr,
            hasLogoUrl: !!primaryCommunity?.logoUrl,
            logoUrlType: typeof primaryCommunity?.logoUrl
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
        // Update primary community logo - NO FALLBACKS: Communities must have logoUrl
        if (primaryCommunityLogoEl) {
            if (primaryCommunity && primaryCommunity.logoUrl) {
                const logoUrl = primaryCommunity.logoUrl.trim();
                // Validate URL format - must be absolute URL or path starting with /
                if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://') && !logoUrl.startsWith('/')) {
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
                            cleaned: cleanedLogoUrl
                        }, 'community');
                    }
                    // Set the logo URL with error handling (CSP compliant - no inline handlers)
                    primaryCommunityLogoEl.addEventListener('error', () => {
                        Logger.error(`❌ COMMUNITIES: Failed to load logo image: ${cleanedLogoUrl}`, null, 'community');
                        primaryCommunityLogoEl.style.display = 'none';
                    });
                    primaryCommunityLogoEl.addEventListener('load', () => {
                        Logger.debug(`✅ COMMUNITIES: Logo image loaded successfully: ${cleanedLogoUrl}`, null, 'community');
                    });
                    primaryCommunityLogoEl.src = cleanedLogoUrl;
                    primaryCommunityLogoEl.style.display = 'block';
                    primaryCommunityLogoEl.style.visibility = 'visible';
                    primaryCommunityLogoEl.style.opacity = '1';
                    primaryCommunityLogoEl.style.cssText += 'display: block !important; visibility: visible !important; opacity: 1 !important; width: 24px !important; height: 24px !important;';
                    primaryCommunityLogoEl.alt = `${primaryCommunity.name} logo`;
                    Logger.debug(`✅ COMMUNITIES: Set community logo to: ${logoUrl}`, null, 'community');
                }
            }
            else {
                // No logoUrl - hide the logo
                Logger.error(`❌ COMMUNITIES: No logoUrl for ${primaryCommunity?.name || 'community'} - hiding logo`, null, 'community');
                primaryCommunityLogoEl.style.display = 'none';
            }
            // Log if logo element exists but src might be invalid
            Logger.debug(`🔍 COMMUNITIES: Logo element check`, {
                exists: !!primaryCommunityLogoEl,
                src: primaryCommunityLogoEl.src,
                display: window.getComputedStyle(primaryCommunityLogoEl).display,
                visibility: window.getComputedStyle(primaryCommunityLogoEl).visibility,
                opacity: window.getComputedStyle(primaryCommunityLogoEl).opacity
            }, 'community');
        }
        else {
            Logger.warn('⚠️ COMMUNITIES: primary-community-logo element not found', null, 'community');
        }
        Logger.debug(`🔍 COMMUNITIES: Updating dropdown with ${sortedCommunities.length} communities`, null, 'community');
        Logger.debug(`🔍 COMMUNITIES: Primary community ID: ${primaryCommunityId}`, null, 'community');
        Logger.debug(`🔍 COMMUNITIES: Active communities:`, activeCommunities, 'community');
        Logger.debug(`🔍 COMMUNITIES: Sorted communities:`, sortedCommunities.map(c => ({ id: c.id, name: c.name })), 'community');
        Logger.debug(`🔍 COMMUNITIES: Input communities array length: ${communities.length}`, null, 'community');
        Logger.debug(`🔍 COMMUNITIES: Sorted communities array length: ${sortedCommunities.length}`, null, 'community');
        // CRITICAL DEBUG: Verify we have communities to add
        if (sortedCommunities.length === 0) {
            Logger.error('❌ COMMUNITIES: No communities to add to dropdown!', {
                inputCount: communities.length,
                sortedCount: sortedCommunities.length
            }, 'community');
            return;
        }
        // Add communities to the list with checkboxes and three-dot menu (already sorted)
        // CRITICAL: Show ALL communities - don't filter by activeCommunities
        Logger.debug(`🔍 COMMUNITIES: Starting forEach loop for ${sortedCommunities.length} communities`, null, 'community');
        sortedCommunities.forEach((community, index) => {
            // Check if community is in activeCommunities, or if activeCommunities is empty, include all
            const isActive = activeCommunities.length === 0 || activeCommunities.includes(community.id);
            const isPrimary = community.id === primaryCommunityId;
            Logger.debug(`🔍 COMMUNITIES: Processing community ${index + 1}/${sortedCommunities.length}: ${community.name} (${community.id}) - isActive: ${isActive}, isPrimary: ${isPrimary}`, null, 'community');
            const li = document.createElement('li');
            li.className = 'community-item';
            li.dataset.communityId = community.id;
            // CRITICAL: Communities must have logoUrl - log if missing
            let communityLogoUrl = community.logoUrl?.trim() || '';
            // CRITICAL FIX: Remove $0 suffix if present (Chrome DevTools artifact)
            if (communityLogoUrl.endsWith('$0')) {
                communityLogoUrl = communityLogoUrl.slice(0, -2);
                Logger.warn(`⚠️ COMMUNITIES: Removed $0 suffix from logoUrl for ${community.name}`, {
                    original: community.logoUrl,
                    cleaned: communityLogoUrl
                }, 'community');
            }
            // Log with explicit logoUrl string in message for clarity
            const originalLogoUrlStr = typeof community.logoUrl === 'string' ? community.logoUrl : String(community.logoUrl || '');
            Logger.debug(`🔍 COMMUNITIES: Community ${community.name} | Original logoUrl: "${originalLogoUrlStr}" | Cleaned: "${communityLogoUrl}"`, {
                hasLogoUrl: !!community.logoUrl,
                originalLogoUrl: originalLogoUrlStr,
                cleanedLogoUrl: communityLogoUrl,
                logoUrlChanged: originalLogoUrlStr !== communityLogoUrl,
                fullCommunity: community
            }, 'community');
            let logoImg = '';
            if (communityLogoUrl && (communityLogoUrl.startsWith('http://') || communityLogoUrl.startsWith('https://') || communityLogoUrl.startsWith('/'))) {
                // Use data attribute for error handling instead of inline handler (CSP compliance)
                logoImg = `<img src="${communityLogoUrl}" alt="${community.name}" class="community-icon" data-community-logo="${community.id}">`;
            }
            else {
                Logger.warn(`⚠️ COMMUNITIES: Community ${community.name} has invalid or missing logoUrl: ${communityLogoUrl}`, null, 'community');
                // Show placeholder div instead of broken image
                logoImg = `<div class="community-icon" style="width: 20px; height: 20px; background: var(--background-secondary); border-radius: 3px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 10px;">${community.name.charAt(0).toUpperCase()}</div>`;
            }
            li.innerHTML = `
      ${logoImg}
      <span class="community-name">${community.name}</span>
      ${isPrimary ? '<span class="primary-tag">Primary</span>' : ''}
      ${!isPrimary ? `
      <label class="community-checkbox-wrapper">
        <input type="checkbox" class="community-checkbox" ${isActive ? 'checked' : ''} data-community-id="${community.id}">
      </label>
      ` : ''}
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
            Logger.debug(`🔍 COMMUNITIES: Appending community ${community.name} to list (index ${index})`, null, 'community');
            communityList.appendChild(li);
            const listLength = communityList.children.length;
            Logger.debug(`🔍 COMMUNITIES: Community ${community.name} appended. List now has ${listLength} items`, null, 'community');
            // Add error handler to logo image (CSP compliant - no inline handlers)
            const logoImgElement = li.querySelector('.community-icon[data-community-logo]');
            if (logoImgElement && logoImgElement instanceof HTMLImageElement) {
                logoImgElement.addEventListener('error', () => {
                    Logger.error(`❌ COMMUNITIES: Failed to load logo for ${community.name}: ${logoImgElement.src}`, null, 'community');
                    // Replace with placeholder on error
                    const placeholder = document.createElement('div');
                    placeholder.className = 'community-icon';
                    placeholder.style.cssText = 'width: 20px; height: 20px; background: var(--background-secondary); border-radius: 3px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 10px;';
                    placeholder.textContent = community.name.charAt(0).toUpperCase();
                    logoImgElement.replaceWith(placeholder);
                });
                logoImgElement.addEventListener('load', () => {
                    Logger.debug(`✅ COMMUNITIES: Logo loaded successfully for ${community.name}: ${logoImgElement.src}`, null, 'community');
                });
            }
            // CRITICAL DEBUG: Log if we're only getting 1 community
            if (index === sortedCommunities.length - 1 && listLength === 1 && sortedCommunities.length > 1) {
                Logger.error(`❌ COMMUNITIES: CRITICAL BUG - Only 1 community in list but ${sortedCommunities.length} communities processed!`, {
                    sortedCount: sortedCommunities.length,
                    listLength,
                    communities: sortedCommunities.map(c => ({ id: c.id, name: c.name }))
                }, 'community');
            }
            // Add event listener to checkbox (only for non-primary communities)
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
                        // Use ES6 imports instead of window globals
                        try {
                            await loadCombinedAvatars(activeCommunities);
                        }
                        catch (error) {
                            Logger.debug('⚠️ COMMUNITIES: Failed to reload avatars (non-critical):', error, 'community');
                        }
                        try {
                            await loadChatHistory('', activeCommunities);
                        }
                        catch (error) {
                            Logger.debug('⚠️ COMMUNITIES: Failed to reload chat history (non-critical):', error, 'community');
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
                                    // Update primary community in StateManager (runtime state)
                                    setState('primaryCommunity', communityId);
                                    setState('currentCommunity', communityId);
                                    // Save to unified preferences (Chrome storage + Database)
                                    try {
                                        const saved = await savePreference('primaryCommunity', communityId);
                                        if (saved) {
                                            Logger.debug(`✅ COMMUNITIES: Saved primary community to unified preferences: ${communityId}`, null, 'community');
                                        }
                                        else {
                                            Logger.warn(`⚠️ COMMUNITIES: Failed to save primary community to unified preferences`, null, 'community');
                                        }
                                    }
                                    catch (error) {
                                        Logger.warn(`⚠️ COMMUNITIES: Error saving primary community to unified preferences:`, error, 'community');
                                    }
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
                        leaveBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const target = e.target;
                            const communityId = target.dataset.communityId;
                            if (communityId) {
                                // Close dropdown menu
                                menuDropdown.style.display = 'none';
                                // Show confirmation modal
                                showLeaveCommunityModal(communityId, community.name, communities, primaryCommunityId || null);
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
 * Show leave community confirmation modal
 */
function showLeaveCommunityModal(communityId, communityName, allCommunities, currentPrimaryId) {
    const modal = document.getElementById('leave-community-modal');
    const messageEl = document.getElementById('leave-community-message');
    const closeBtn = document.getElementById('close-leave-community-modal');
    const cancelBtn = document.getElementById('cancel-leave-community-btn');
    const confirmBtn = document.getElementById('confirm-leave-community-btn');
    if (!modal || !messageEl || !closeBtn || !cancelBtn || !confirmBtn) {
        Logger.warn('⚠️ COMMUNITIES: Leave community modal elements not found', null, 'community');
        return;
    }
    // Update message with community name
    messageEl.textContent = `Are you sure you want to leave "${communityName}"? You will no longer receive updates or be able to participate.`;
    // Show modal
    modal.style.display = 'flex';
    // Close handlers
    const closeModal = () => {
        modal.style.display = 'none';
    };
    closeBtn.addEventListener('click', closeModal, { once: true });
    cancelBtn.addEventListener('click', closeModal, { once: true });
    // Confirm handler
    confirmBtn.addEventListener('click', async () => {
        try {
            // Call API to leave community using ES6 import
            try {
                const response = await api.leaveCommunity(communityId);
                if (response?.error) {
                    throw new Error('Failed to leave community');
                }
            }
            catch (apiError) {
                Logger.warn('⚠️ COMMUNITIES: API.leaveCommunity failed, removing from local state only', apiError, 'community');
            }
            // Remove community from active communities
            let activeCommunities = readActiveCommunitiesFromState();
            activeCommunities = activeCommunities.filter(id => id !== communityId);
            setActiveCommunitiesState(activeCommunities);
            // Get updated communities list (remove the left community)
            const remainingCommunities = allCommunities.filter(c => c.id !== communityId);
            // If this was the primary community, set first remaining as primary
            if (currentPrimaryId === communityId && remainingCommunities.length > 0) {
                const newPrimaryId = remainingCommunities[0]?.id;
                if (newPrimaryId) {
                    setState('primaryCommunity', newPrimaryId);
                    setState('currentCommunity', newPrimaryId);
                    // Save to unified preferences
                    try {
                        await savePreference('primaryCommunity', newPrimaryId);
                        Logger.debug(`✅ COMMUNITIES: Saved new primary community to unified preferences after leave: ${newPrimaryId}`, null, 'community');
                    }
                    catch (error) {
                        Logger.warn(`⚠️ COMMUNITIES: Error saving primary community after leave:`, error, 'community');
                    }
                }
            }
            // Close modal
            closeModal();
            // Reload community dropdown to reflect changes
            updateCommunityDropdown(remainingCommunities).catch((error) => {
                handleError(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'updateCommunityDropdownAfterLeave',
                        component: 'CommunityHelpers'
                    }
                });
            });
            Logger.debug(`✅ COMMUNITIES: Left ${communityName}`, null, 'community');
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
            // Show error message to user
            if (messageEl) {
                messageEl.textContent = 'Failed to leave community. Please try again.';
                messageEl.style.color = '#dc3545';
                setTimeout(() => {
                    messageEl.textContent = `Are you sure you want to leave "${communityName}"? You will no longer receive updates or be able to participate.`;
                    messageEl.style.color = '';
                }, 3000);
            }
        }
    }, { once: true });
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    }, { once: true });
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
/**
 * Initialize community dropdown click handler
 * This ensures the dropdown works even if CommunitiesModule isn't initialized
 */
export function initializeCommunityDropdownHandler() {
    const trigger = document.querySelector('.community-dropdown-trigger');
    const panel = document.getElementById('community-dropdown-panel');
    const closeBtn = document.getElementById('close-community-dropdown');
    if (!trigger || !panel) {
        Logger.debug('⚠️ COMMUNITIES: Dropdown elements not found, will retry', null, 'community');
        // Retry after a short delay
        setTimeout(() => initializeCommunityDropdownHandler(), 500);
        return;
    }
    // Remove any existing listeners by cloning
    const newTrigger = trigger.cloneNode(true);
    if (trigger.parentNode) {
        trigger.parentNode.replaceChild(newTrigger, trigger);
    }
    // Add click handler to trigger
    newTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const computedStyle = window.getComputedStyle(panel);
        const isVisible = panel.style.display === 'block' ||
            panel.style.display === 'flex' ||
            computedStyle.display === 'block' ||
            computedStyle.display === 'flex' ||
            panel.classList.contains('show');
        if (isVisible) {
            panel.style.display = 'none';
            panel.style.visibility = 'hidden';
            panel.classList.remove('show');
            Logger.debug('✅ COMMUNITIES: Dropdown hidden', null, 'community');
        }
        else {
            // CRITICAL FIX: Force visibility with multiple methods
            panel.style.display = 'block';
            panel.style.visibility = 'visible';
            panel.style.opacity = '1';
            panel.classList.add('show');
            Logger.debug('✅ COMMUNITIES: Dropdown shown', null, 'community');
            Logger.debug('🔍 COMMUNITIES: Panel state after show', {
                inlineDisplay: panel.style.display,
                computedDisplay: computedStyle.display,
                visibility: panel.style.visibility,
                hasShowClass: panel.classList.contains('show'),
                zIndex: computedStyle.zIndex,
                position: computedStyle.position
            }, 'community');
        }
    });
    // Add close button handler
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.style.display = 'none';
            panel.classList.remove('show');
            Logger.debug('✅ COMMUNITIES: Dropdown closed via close button', null, 'community');
        });
    }
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const target = e.target;
        const computedStyle = window.getComputedStyle(panel);
        const isVisible = panel.style.display === 'block' ||
            panel.style.display === 'flex' ||
            computedStyle.display === 'block' ||
            computedStyle.display === 'flex' ||
            panel.classList.contains('show');
        if (isVisible) {
            if (!panel.contains(target) && !newTrigger.contains(target)) {
                panel.style.display = 'none';
                panel.classList.remove('show');
                Logger.debug('✅ COMMUNITIES: Dropdown closed via outside click', null, 'community');
            }
        }
    });
    Logger.debug('✅ COMMUNITIES: Dropdown handler initialized', null, 'community');
}
// Auto-initialize on module load
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => initializeCommunityDropdownHandler(), 100);
        });
    }
    else {
        setTimeout(() => initializeCommunityDropdownHandler(), 100);
    }
}
// Export all functions
export default {
    updateCommunityDropdown,
    updatePlaceholderText,
    getPrimaryCommunityName,
    initializeCommunityDropdownHandler
};

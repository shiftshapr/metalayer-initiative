/**
 * VISIBILITY MANAGER - Centralized Visibility System
 * TypeScript + ES6 Module
 */
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { formatUserDisplayName, formatUserHandle, getAvatarUrlWithFallback, getAuraColorValue, getUserIdentity } from '../utils/Fallbacks.js';
function normalizeVisibilityUsers(users) {
    return users.map(user => ({
        ...user,
        id: getUserIdentity(user),
        name: formatUserDisplayName(user),
        handle: user.handle || formatUserDisplayName(user),
        avatarUrl: getAvatarUrlWithFallback(user),
        auraColor: getAuraColorValue(user)
    }));
}
class VisibilityManager {
    constructor(supabaseService, logger) {
        this.currentVisibilityData = [];
        this.currentUserEmail = null;
        this.currentPageId = null;
        this.isActive = false;
        this.supabase = supabaseService;
        this.logger = logger;
    }
    /**
     * Initialize visibility manager
     */
    async initialize(currentUserEmail) {
        try {
            this.logger.info('VISIBILITY_INIT', { currentUserEmail });
            this.currentUserEmail = currentUserEmail;
            this.isActive = true;
            // Set up real-time event handlers
            this.supabase.on('presence', (eventType, newRecord, oldRecord) => {
                this.handlePresenceEvent(eventType, newRecord, oldRecord);
            });
            this.logger.info('VISIBILITY_INIT', { success: true });
        }
        catch (error) {
            this.logger.error('VISIBILITY_INIT', { error: error.message });
            throw error;
        }
    }
    /**
     * Refresh visibility avatars for current page
     */
    async refreshVisibilityAvatars(pageId) {
        try {
            this.logger.info('VISIBILITY_REFRESH', { pageId });
            if (!this.isActive) {
                this.logger.warn('VISIBILITY', 'Manager not active, skipping refresh');
                return;
            }
            // Get users from Supabase
            const users = await this.supabase.getPageUsers(pageId);
            this.logger.debug('Enhanced query returned users', {
                count: users.length
            });
            if (users && users.length > 0) {
                // Fetch avatar URLs for users
                const usersWithAvatars = await this.fetchUserAvatars(users);
                // Filter out current user
                const filteredUsers = this.filterCurrentUser(usersWithAvatars);
                // Update UI
                await this.updateVisibilityUI(filteredUsers);
                this.logger.info('VISIBILITY_REFRESH', {
                    totalUsers: users.length,
                    visibleUsers: filteredUsers.length
                });
            }
            else {
                await this.updateVisibilityUI([]);
                this.logger.debug('No users found, clearing visibility');
            }
        }
        catch (error) {
            this.logger.error('VISIBILITY_REFRESH', { error: error.message });
            throw error;
        }
    }
    /**
     * Fetch avatar URLs for users
     */
    async fetchUserAvatars(users) {
        try {
            this.logger.debug('Fetching avatar URLs for users', { count: users.length });
            const usersWithAvatars = await Promise.all(users.map(async (user) => {
                try {
                    const userProfile = await this.supabase.getUserProfile(user.email || user.id);
                    return {
                        id: getUserIdentity(user),
                        email: user.email,
                        name: formatUserDisplayName({ name: userProfile?.name, email: user.email, handle: userProfile?.handle }),
                        handle: formatUserHandle({ handle: userProfile?.handle, email: user.email }),
                        avatarUrl: userProfile?.avatarUrl || null,
                        auraColor: getAuraColorValue(user, AVATAR_FALLBACK_COLOR),
                        communityId: (window.activeCommunities && window.activeCommunities[0]) || undefined,
                        lastSeen: user.lastSeen,
                        isActive: user.isActive
                    };
                }
                catch (error) {
                    this.logger.warn('VISIBILITY', 'Failed to fetch avatar for user', {
                        userId: user.id,
                        error: error.message
                    });
                    // Return basic user data without avatar
                    return {
                        id: getUserIdentity(user),
                        email: user.email,
                        name: formatUserDisplayName(user),
                        handle: formatUserHandle(user),
                        avatarUrl: undefined,
                        auraColor: getAuraColorValue(user, AVATAR_FALLBACK_COLOR),
                        communityId: (window.activeCommunities && window.activeCommunities[0]) || undefined,
                        lastSeen: user.lastSeen,
                        isActive: user.isActive
                    };
                }
            }));
            this.logger.debug('Users with avatars fetched', { count: usersWithAvatars.length });
            return usersWithAvatars;
        }
        catch (error) {
            this.logger.error('VISIBILITY', 'Failed to fetch user avatars', { error: error.message });
            throw error;
        }
    }
    /**
     * Filter out current user from visibility list
     */
    filterCurrentUser(users) {
        if (!this.currentUserEmail)
            return users;
        const filteredUsers = users.filter(user => {
            const emailPrefix = this.currentUserEmail?.split('@')[0];
            const isCurrentUser = user.id === this.currentUserEmail ||
                user.email === this.currentUserEmail ||
                (emailPrefix && user.handle === emailPrefix);
            if (isCurrentUser) {
                this.logger.debug('Filtering out current user', {
                    userId: user.id,
                    currentUser: this.currentUserEmail
                });
                return false;
            }
            return true;
        });
        this.logger.debug('Current user filtering complete', {
            originalCount: users.length,
            filteredCount: filteredUsers.length
        });
        return filteredUsers;
    }
    /**
     * Update visibility UI
     */
    async updateVisibilityUI(users) {
        try {
            this.logger.debug('Updating visibility UI', { userCount: users.length });
            const normalizedUsers = normalizeVisibilityUsers(users);
            // Store globally for profile avatar lookup (normalized to camelCase immediately)
            if (typeof window !== 'undefined') {
                window.currentVisibilityDataUnfiltered = { active: normalizedUsers };
                window.currentVisibilityData = { active: normalizedUsers };
            }
            // Update the UI with users
            if (typeof window !== 'undefined' && typeof window.updateVisibleTab === 'function') {
                await window.updateVisibleTab(normalizedUsers);
                this.logger.debug('UI updated successfully');
            }
            else {
                this.logger.warn('VISIBILITY', 'updateVisibleTab function not available');
            }
            this.currentVisibilityData = normalizedUsers;
        }
        catch (error) {
            this.logger.error('VISIBILITY', 'Failed to update visibility UI', { error: error.message });
            throw error;
        }
    }
    /**
     * Handle real-time presence events
     */
    handlePresenceEvent(eventType, newRecord, oldRecord) {
        try {
            this.logger.debug('Processing presence event', {
                eventType,
                userId: newRecord?.id || oldRecord?.id,
                // Boundary transform: Supabase realtime payload uses snake_case (page_id)
                pageId: newRecord?.page_id || oldRecord?.page_id
            });
            // Only process events for current page
            if (this.currentPageId &&
                (newRecord?.page_id !== this.currentPageId && oldRecord?.page_id !== this.currentPageId)) {
                this.logger.debug('Ignoring event from different page', {
                    // Boundary transform: Supabase realtime payload uses snake_case (page_id)
                    eventPageId: newRecord?.page_id || oldRecord?.page_id,
                    currentPageId: this.currentPageId
                });
                return;
            }
            // Refresh visibility for current page
            if (this.currentPageId) {
                this.refreshVisibilityAvatars(this.currentPageId);
            }
        }
        catch (error) {
            this.logger.error('VISIBILITY', 'Failed to handle presence event', { error: error.message });
        }
    }
    /**
     * Set current page
     */
    setCurrentPage(pageId) {
        this.currentPageId = pageId;
        this.logger.debug('Current page set', { pageId });
    }
    /**
     * Get current visibility data
     */
    getCurrentVisibilityData() {
        return this.currentVisibilityData;
    }
    /**
     * Format last seen display (static utility)
     */
    static formatLastSeenDisplay(lastSeen) {
        if (!lastSeen)
            return 'Last seen unknown';
        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMs = now.getTime() - lastSeenDate.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        // If the difference is negative, it means the timestamp is in the future
        if (diffMs < 0) {
            return 'Last seen just now';
        }
        if (diffSeconds < 60) {
            return `Last seen ${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
        }
        else if (diffMinutes < 60) {
            return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        }
        else if (diffHours < 24) {
            return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        }
        else {
            return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        }
    }
    /**
     * Format time display (static utility)
     */
    static formatTimeDisplay(enterTime) {
        if (!enterTime)
            return 'Unknown';
        const now = new Date();
        const enterDate = new Date(enterTime);
        const diffMs = now.getTime() - enterDate.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMs < 0) {
            return 'Now';
        }
        if (diffSeconds < 60) {
            return 'Now';
        }
        else if (diffMinutes < 60) {
            return `Online for ${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`;
        }
        else {
            const hours = Math.floor(diffMinutes / 60);
            return `Online for ${hours} hour${hours === 1 ? '' : 's'}`;
        }
    }
    /**
     * Get visibility status
     */
    getStatus() {
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
    async cleanup() {
        try {
            this.isActive = false;
            this.currentVisibilityData = [];
            this.currentUserEmail = null;
            this.currentPageId = null;
        }
        catch (error) {
            this.logger.error('VISIBILITY', 'Cleanup failed', { error: error.message });
        }
    }
}
/**
 * Update visible tab UI (standalone function for backward compatibility)
 */
async function updateVisibleTab(avatars) {
    console.log('🔍 VISIBILITY: updateVisibleTab called with avatars:', avatars.length);
    // Store visibility data globally for real-time aura color access
    if (typeof window !== 'undefined') {
        window.currentVisibilityData = { active: avatars };
        window.currentVisibilityDataUnfiltered = { active: avatars };
    }
    console.log('🔄 VISIBILITY: Stored visibility data globally for real-time aura access');
    // Clear any existing visibility update timer
    if (typeof window !== 'undefined' && window.visibilityUpdateTimer) {
        clearInterval(window.visibilityUpdateTimer);
    }
    // Get visible tab
    let visibleTab = null;
    if (typeof window !== 'undefined' && window.tabContextManager) {
        visibleTab = window.tabContextManager.getTabContainer('visibility-tab');
        if (!visibleTab) {
            console.warn('⚠️ VISIBILITY: visibility-tab not found or not active');
            visibleTab = document.getElementById('visibility-tab');
        }
    }
    else {
        visibleTab = document.getElementById('visibility-tab');
    }
    if (!visibleTab) {
        console.log('❌ VISIBILITY: visibleTab element not found');
        return;
    }
    // Ensure we're updating the correct tab
    if (visibleTab.id !== 'visibility-tab') {
        console.error('❌ VISIBILITY: Wrong tab element passed to updateVisibleTab');
        return;
    }
    const visibilityTab = document.getElementById('visibility-tab');
    if (!visibilityTab) {
        console.warn('⚠️ VISIBILITY: Visibility tab not found in DOM - SKIPPING');
        return;
    }
    // Get current user for filtering
    const currentUserEmail = (typeof window !== 'undefined' && window.currentUser)
        ? window.currentUser.email
        : (typeof window !== 'undefined' && window.getCurrentUserEmail)
            ? await window.getCurrentUserEmail()
            : null;
    const currentUser = (typeof window !== 'undefined' && window.currentUser) ? window.currentUser : null;
    const currentUserId = currentUser?.id;
    // Filter out current user
    const usersWithAvatars = avatars.filter(avatar => {
        const avatarId = avatar.id;
        const currentUser = (typeof window !== 'undefined' && window.currentUser) ? window.currentUser : null;
        const isCurrentUser = (currentUserId && avatarId && String(avatarId) === String(currentUserId)) ||
            (!currentUserId && avatar.email === currentUserEmail) ||
            (currentUser !== null && currentUser !== undefined &&
                avatar.id === currentUser.id);
        if (isCurrentUser) {
            return false; // Filter out current user
        }
        return true;
    });
    console.log('🔍 VISIBILITY: Showing', usersWithAvatars.length, 'users (filtered from', avatars.length, 'total)');
    // COMP METHOD: Create full UI structure with header, search, count, and Go Invisible button
    // This matches the original working JavaScript implementation
    visibilityTab.innerHTML = '';
    // Create main container
    const visibleUsersContainer = document.createElement('div');
    visibleUsersContainer.className = 'visible-users';
    // COMP METHOD: Create header with count, search, and Go Invisible button
    const visibleHeader = document.createElement('div');
    visibleHeader.className = 'visible-header';
    visibleHeader.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; background: var(--background-secondary); border-radius: 6px;';
    // COMP METHOD: Create count display
    const visibleCount = document.createElement('div');
    visibleCount.className = 'visible-count';
    visibleCount.style.cssText = 'font-weight: bold; color: var(--text-primary);';
    visibleCount.textContent = `${usersWithAvatars.length} visible`;
    visibleHeader.appendChild(visibleCount);
    // COMP METHOD: Create search input
    const visibleSearch = document.createElement('input');
    visibleSearch.type = 'text';
    visibleSearch.id = 'visible-search';
    visibleSearch.placeholder = 'Search users...';
    visibleSearch.style.cssText = 'flex: 1; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--background-primary); color: var(--text-primary); font-size: 12px;';
    visibleHeader.appendChild(visibleSearch);
    // COMP METHOD: Create Go Invisible button
    const goInvisibleBtn = document.createElement('button');
    goInvisibleBtn.id = 'go-invisible-btn';
    goInvisibleBtn.textContent = 'Go Invisible';
    goInvisibleBtn.style.cssText = 'padding: 4px 8px; background: var(--accent-color); color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;';
    visibleHeader.appendChild(goInvisibleBtn);
    visibleUsersContainer.appendChild(visibleHeader);
    // COMP METHOD: Create user list
    const itemList = document.createElement('ul');
    itemList.className = 'item-list';
    // Render each user
    if (usersWithAvatars.length > 0) {
        for (const user of usersWithAvatars) {
            try {
                const isActive = user.isActive === true;
                const hasLeft = user.status === 'offline' || !isActive;
                const userName = formatUserDisplayName(user);
                const avatarUrl = getAvatarUrlWithFallback(user);
                const auraColor = getAuraColorValue(user);
                // Create list item
                const listItem = document.createElement('li');
                listItem.className = 'item';
                listItem.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-color);';
                // Create avatar container
                const avatarContainer = document.createElement('div');
                avatarContainer.className = 'avatar-container';
                avatarContainer.style.cssText = 'position: relative; width: 32px; height: 32px;';
                // Use AvatarUtils if available, otherwise use simple img
                if (typeof window.AvatarUtils !== 'undefined' &&
                    typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
                    try {
                        const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(user, 'visibility', {
                            size: 32,
                            showAura: true,
                            showStatus: true
                        });
                        avatarContainer.innerHTML = avatarHTML;
                    }
                    catch (error) {
                        console.warn('⚠️ VISIBILITY: Error creating unified avatar, using fallback:', error);
                        // Fallback to simple img
                        const img = document.createElement('img');
                        img.src = avatarUrl;
                        img.alt = userName;
                        img.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; border: 2px solid ' + auraColor + ';';
                        avatarContainer.appendChild(img);
                    }
                }
                else {
                    // Fallback: simple img
                    const img = document.createElement('img');
                    img.src = avatarUrl;
                    img.alt = userName;
                    img.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; border: 2px solid ' + auraColor + ';';
                    avatarContainer.appendChild(img);
                }
                listItem.appendChild(avatarContainer);
                // Create user info
                const userInfo = document.createElement('div');
                userInfo.className = 'user-info';
                userInfo.style.cssText = 'flex: 1; min-width: 0;';
                const userNameEl = document.createElement('div');
                userNameEl.className = 'user-name';
                userNameEl.style.cssText = 'font-weight: bold; color: var(--text-primary); font-size: 14px;';
                userNameEl.textContent = userName;
                userInfo.appendChild(userNameEl);
                // COMP METHOD: Status display removed - not part of spec
                // Status is indicated by avatar aura/ring, not text
                listItem.appendChild(userInfo);
                itemList.appendChild(listItem);
            }
            catch (error) {
                console.error('❌ VISIBILITY: Error rendering user:', error);
            }
        }
    }
    else {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.style.cssText = 'text-align: center; padding: 40px; color: var(--text-secondary);';
        emptyState.textContent = 'No other users visible on this page';
        itemList.appendChild(emptyState);
    }
    visibleUsersContainer.appendChild(itemList);
    visibilityTab.appendChild(visibleUsersContainer);
    // COMP METHOD: Add search functionality
    if (visibleSearch) {
        visibleSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = visibilityTab.querySelectorAll('.item');
            items.forEach(item => {
                const userNameEl = item.querySelector('.user-name');
                if (userNameEl) {
                    const userName = userNameEl.textContent?.toLowerCase() || '';
                    const isVisible = userName.includes(searchTerm);
                    item.style.display = isVisible ? 'flex' : 'none';
                }
            });
        });
    }
    // COMP METHOD: Add go invisible functionality
    if (goInvisibleBtn) {
        goInvisibleBtn.addEventListener('click', async () => {
            console.log('🔍 VISIBILITY: Go invisible clicked');
            // TODO: Implement go invisible functionality
            // This should call the visibility system to set user as invisible
            if (typeof window.setVisibilityStatus === 'function') {
                await window.setVisibilityStatus(false);
            }
        });
    }
    console.log('✅ VISIBILITY: Rendered', usersWithAvatars.length, 'users with full UI structure (COMP METHOD)');
    // Start periodic status refresh
    if (typeof window !== 'undefined') {
        if (window.visibilityStatusRefreshInterval) {
            clearInterval(window.visibilityStatusRefreshInterval);
        }
        window.visibilityStatusRefreshInterval = setInterval(async () => {
            const tab = document.getElementById('visibility-tab');
            if (tab && window.currentVisibilityData?.active && window.currentVisibilityData.active.length > 0) {
                console.log('🔄 VISIBILITY: Periodic status refresh');
                try {
                    if (window.updateVisibleTab) {
                        await window.updateVisibleTab(window.currentVisibilityData.active);
                    }
                }
                catch (error) {
                    console.error('❌ VISIBILITY: Error in periodic refresh:', error);
                }
            }
        }, 30000); // Every 30 seconds
    }
}
// Provide legacy update hook without exporting the entire class
if (typeof window !== 'undefined') {
    window.updateVisibleTab = updateVisibleTab;
    console.log('✅ VisibilityManager legacy updateVisibleTab registered');
}
export { VisibilityManager, updateVisibleTab };
export default VisibilityManager;
//# sourceMappingURL=VisibilityManager.js.map
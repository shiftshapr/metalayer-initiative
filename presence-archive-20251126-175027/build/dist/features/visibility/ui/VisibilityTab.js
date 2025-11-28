/**
 * VISIBILITY TAB COMPONENT - UI Rendering Component
 *
 * Phase 3: UI Component Extraction
 * - Extracted from updateVisibleTab function (legacy VisibilityManager.ts)
 * - Subscribes to VisibilityState for reactive updates
 * - Handles user list rendering, search, and Go Invisible button
 */
import { getUserStatusText } from '../utils/visibilityHelpers.js';
import { getCurrentPageId } from '../utils/pageIdResolver.js';
import { handleError } from '../../../utils/ErrorHandler.js';
import { Logger } from '../../../utils/Logger.js';
import { formatUserDisplayName, getAvatarUrlWithFallback, getAuraColorValue } from '../../../utils/Fallbacks.js';
/**
 * VisibilityTab component
 * Renders the visibility tab UI with user list, search, and controls
 */
export class VisibilityTab {
    constructor(state) {
        this.container = null;
        this.unsubscribe = null;
        this.searchInput = null;
        this.goInvisibleBtn = null;
        this.refreshInterval = null;
        this.themeObserver = null;
        this.isRendering = false;
        this.previousTabId = null;
        this.state = state;
    }
    /**
     * Initialize component - find container and subscribe to state
     */
    async initialize() {
        // Prevent multiple initializations
        if (this.unsubscribe) {
            Logger.warn('⚠️ VISIBILITY_TAB: Already initialized, skipping', 'general');
            return;
        }
        // Find visibility tab container
        this.container = this.findContainer();
        if (!this.container) {
            Logger.warn('⚠️ VISIBILITY_TAB: Container not found', null, 'general');
            return;
        }
        // Track previous tab for navigation
        this.setupTabTracking();
        // Subscribe to state changes
        this.unsubscribe = this.state.subscribe((currentState) => {
            this.render(currentState.getUsers());
        });
        // Initial render
        this.render(this.state.getUsers());
        // Set up periodic refresh
        this.setupPeriodicRefresh();
    }
    /**
     * Set up tab tracking to remember previous tab
     */
    setupTabTracking() {
        // Listen for tab changes to track previous tab
        const win = typeof window !== 'undefined' ? window : null;
        // Get current active tab before visibility tab was opened
        if (win?.tabContextManager?.getActiveTab) {
            const currentTab = win.tabContextManager.getActiveTab();
            if (currentTab && currentTab !== 'visibility-tab') {
                this.previousTabId = currentTab;
            }
        }
        // Fallback: check DOM for active tab
        if (!this.previousTabId && typeof document !== 'undefined') {
            const activeTab = document.querySelector('.main-nav-tab.active');
            const tabId = activeTab?.getAttribute('data-tab');
            if (tabId && tabId !== 'visibility-tab') {
                this.previousTabId = tabId;
            }
            else {
                // Default to discuss-tab if no previous tab found
                this.previousTabId = 'discuss-tab';
            }
        }
    }
    /**
     * Find visibility tab container
     */
    findContainer() {
        const win = typeof window !== 'undefined' ? window : null;
        // Try tabContextManager first
        if (win?.tabContextManager) {
            const tab = win.tabContextManager.getTabContainer('visibility-tab');
            if (tab)
                return tab;
        }
        // Fallback to getElementById
        if (typeof document !== 'undefined') {
            return document.getElementById('visibility-tab');
        }
        return null;
    }
    /**
     * Render users list
     */
    async render(users) {
        if (!this.container) {
            Logger.warn('⚠️ VISIBILITY_TAB: Cannot render - container not found', null, 'general');
            return;
        }
        // Prevent duplicate renders - check if already rendering
        if (this.isRendering) {
            Logger.warn('⚠️ VISIBILITY_TAB: Render already in progress, skipping', 'general');
            return;
        }
        this.isRendering = true;
        try {
            // Get current user for filtering (already filtered in manager, but double-check)
            const currentUser = (typeof window !== 'undefined' &&
                window.currentUser)
                ? window.currentUser
                : null;
            // Email kept for potential future use but not currently used
            void (currentUser?.email || null);
            const currentUserId = currentUser?.id;
            // Filter out current user (safety check) - UUID ONLY
            const filteredUsers = users.filter(user => {
                if (currentUserId && user.id && String(user.id) === String(currentUserId))
                    return false;
                return true;
            });
            const currentPageId = getCurrentPageId('visibility-tab');
            // Clear container completely to prevent duplication
            this.container.innerHTML = '';
            // Create main container
            const visibleUsersContainer = document.createElement('div');
            visibleUsersContainer.className = 'visible-users';
            // Create header with count, search, and Go Invisible button
            const header = this.createHeader(filteredUsers.length);
            visibleUsersContainer.appendChild(header);
            // Create user list
            const itemList = await this.createUserList(filteredUsers, currentPageId);
            visibleUsersContainer.appendChild(itemList);
            this.container.appendChild(visibleUsersContainer);
            // Set up search functionality
            this.setupSearch();
            // Set up Go Invisible button
            this.setupGoInvisibleButton();
            Logger.debug('✅ VISIBILITY_TAB: Rendered', { data: filteredUsers.length, extra: 'users' }, 'general');
        }
        finally {
            this.isRendering = false;
        }
    }
    /**
     * Create header with count, search, and Go Invisible button
     */
    createHeader(userCount) {
        const header = document.createElement('div');
        header.className = 'visible-header';
        header.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; background: var(--background-secondary); border-radius: 6px;';
        // Count display
        const count = document.createElement('div');
        count.className = 'visible-count';
        count.style.cssText = 'font-weight: bold; color: var(--text-primary);';
        count.textContent = `${userCount} visible`;
        header.appendChild(count);
        // Search input
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.id = 'visible-search';
        this.searchInput.placeholder = 'Search users...';
        this.searchInput.style.cssText = 'flex: 1; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--background-primary); color: var(--text-primary); font-size: 12px;';
        header.appendChild(this.searchInput);
        // Go Invisible button
        this.goInvisibleBtn = document.createElement('button');
        this.goInvisibleBtn.id = 'go-invisible-btn';
        this.goInvisibleBtn.textContent = 'Go Invisible';
        // Theme-aware styling - use text color that works in both themes
        const theme = document.body.getAttribute('data-theme') || 'light';
        const textColor = theme === 'light' ? 'var(--text-primary, #333)' : 'white';
        this.goInvisibleBtn.style.cssText = `padding: 4px 8px; background: var(--accent-color); color: ${textColor}; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;`;
        header.appendChild(this.goInvisibleBtn);
        return header;
    }
    /**
     * Create user list
     */
    async createUserList(users, currentPageId) {
        const itemList = document.createElement('ul');
        itemList.className = 'item-list';
        if (users.length > 0) {
            for (const user of users) {
                try {
                    const listItem = await this.createUserItem(user, currentPageId);
                    itemList.appendChild(listItem);
                }
                catch (error) {
                    handleError(error, {
                        log: true,
                        logLevel: 'error',
                        context: {
                            operation: 'catch',
                            component: 'VisibilityTab'
                        }
                    });
                    ;
                }
            }
        }
        else {
            // Empty state
            const emptyState = document.createElement('div');
            emptyState.style.cssText = 'text-align: center; padding: 40px; color: var(--text-secondary);';
            emptyState.textContent = 'No other users visible on this page';
            itemList.appendChild(emptyState);
        }
        return itemList;
    }
    /**
     * Create user list item
     */
    async createUserItem(user, currentPageId) {
        const listItem = document.createElement('li');
        listItem.className = 'item';
        listItem.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-color);';
        // Avatar container
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'avatar-container';
        avatarContainer.style.cssText = 'position: relative; width: 32px; height: 32px;';
        // Try to use AvatarUtils if available
        const win = typeof window !== 'undefined' ? window : null;
        const avatarUtils = win?.AvatarUtils;
        const createUnifiedAvatar = avatarUtils?.createUnifiedAvatar;
        if (createUnifiedAvatar && typeof createUnifiedAvatar === 'function') {
            try {
                const avatarHTML = await createUnifiedAvatar(user, 'visibility', {
                    size: 32,
                    showAura: true,
                    showStatus: true
                });
                avatarContainer.innerHTML = avatarHTML;
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'warn',
                    context: {
                        operation: 'catch',
                        component: 'VisibilityTab'
                    }
                });
                ;
                this.createFallbackAvatar(avatarContainer, user);
            }
        }
        else {
            this.createFallbackAvatar(avatarContainer, user);
        }
        listItem.appendChild(avatarContainer);
        // User info
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.style.cssText = 'flex: 1; min-width: 0;';
        const userNameEl = document.createElement('div');
        userNameEl.className = 'user-name';
        userNameEl.style.cssText = 'font-weight: bold; color: var(--text-primary); font-size: 14px;';
        userNameEl.textContent = formatUserDisplayName(user);
        userInfo.appendChild(userNameEl);
        const statusEl = document.createElement('div');
        statusEl.className = 'user-status';
        statusEl.style.cssText = 'font-size: 12px; color: var(--text-secondary); margin-top: 2px;';
        statusEl.textContent = getUserStatusText(user, currentPageId);
        userInfo.appendChild(statusEl);
        listItem.appendChild(userInfo);
        return listItem;
    }
    /**
     * Create fallback avatar
     */
    createFallbackAvatar(container, user) {
        const img = document.createElement('img');
        img.src = getAvatarUrlWithFallback(user);
        img.alt = formatUserDisplayName(user);
        const auraColor = getAuraColorValue(user);
        img.style.cssText = `width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${auraColor};`;
        container.appendChild(img);
    }
    /**
     * Set up search functionality
     */
    setupSearch() {
        if (!this.searchInput || !this.container)
            return;
        this.searchInput.addEventListener('input', (e) => {
            const target = e.target;
            const searchTerm = target.value.toLowerCase();
            if (!this.container) {
                Logger.warn('⚠️ VISIBILITY: Container not available for search', null, 'visibility');
                return;
            }
            const items = this.container.querySelectorAll('.item');
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
    /**
     * Set up Go Invisible button
     */
    setupGoInvisibleButton() {
        if (!this.goInvisibleBtn)
            return;
        this.goInvisibleBtn.addEventListener('click', async () => {
            const win = window;
            // Set visibility to false
            if (win.setVisibilityStatus) {
                await win.setVisibilityStatus(false);
            }
            // Navigate to previous tab (or Discuss tab as fallback)
            const targetTab = this.previousTabId || 'discuss-tab';
            const uiManager = win.uiManager;
            if (uiManager?.switchTab) {
                try {
                    uiManager.switchTab(targetTab);
                }
                catch (error) {
                    handleError(error, {
                        log: true,
                        logLevel: 'warn',
                        context: {
                            operation: 'catch',
                            component: 'VisibilityTab'
                        }
                    });
                    ;
                }
            }
            else if (win.switchTab) {
                try {
                    win.switchTab(targetTab);
                }
                catch (error) {
                    handleError(error, {
                        log: true,
                        logLevel: 'warn',
                        context: {
                            operation: 'catch',
                            component: 'VisibilityTab'
                        }
                    });
                    ;
                }
            }
            else {
                // Fallback: manual tab switch
                const allTabs = document.querySelectorAll('.main-nav-tab');
                const allTabContents = document.querySelectorAll('.main-tab-content');
                allTabs.forEach(tab => tab.classList.remove('active'));
                allTabContents.forEach(content => content.classList.remove('active'));
                const targetBtn = document.querySelector(`[data-tab="${targetTab}"]`);
                const targetContent = document.getElementById(targetTab);
                if (targetBtn)
                    targetBtn.classList.add('active');
                if (targetContent)
                    targetContent.classList.add('active');
            }
        });
        // Update button color based on theme
        this.updateButtonColor();
        this.setupThemeObserver();
    }
    /**
     * Update button color based on theme
     */
    updateButtonColor() {
        if (!this.goInvisibleBtn)
            return;
        const theme = document.body.getAttribute('data-theme') || 'light';
        this.goInvisibleBtn.style.color = theme === 'light' ? 'var(--text-primary, #333)' : 'white';
    }
    /**
     * Set up theme observer
     */
    setupThemeObserver() {
        if (!this.goInvisibleBtn)
            return;
        this.themeObserver = new MutationObserver(() => {
            this.updateButtonColor();
        });
        this.themeObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    /**
     * Set up periodic refresh
     */
    setupPeriodicRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.refreshInterval = setInterval(() => {
            if (this.container && this.state.getUsers().length > 0) {
                // Re-render to update status times
                this.render(this.state.getUsers());
            }
        }, 30000); // Every 30 seconds
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        if (this.themeObserver) {
            this.themeObserver.disconnect();
            this.themeObserver = null;
        }
    }
}
//# sourceMappingURL=VisibilityTab.js.map
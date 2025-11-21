/**
 * UnifiedContextMenu - Right-click context menu system
 *
 * This replaces/extends the browser's native right-click context menu with
 * application-specific options based on what the user right-clicks.
 *
 * Features:
 * - Right-click on messages → shows message-specific options (Park cursor, Reply, etc.)
 * - Right-click on avatars → shows user-specific options (Park cursor, View profile, etc.)
 * - Right-click on text selection → shows text options (Park cursor, Copy, Search, etc.)
 * - Right-click on page → shows page options (Park cursor, New message, etc.)
 * - Community-aware (shows community-specific options)
 * - Application-aware (shows app-specific options)
 * - Configurable via menu definitions
 *
 * NOTE: This is separate from:
 * - Action menu (three dots ⋯ on messages) - handled by getMessageActionMenu()
 * - Profile menu (clicking avatar) - handled by ProfileManager
 */
class UnifiedContextMenu {
    constructor() {
        this.menu = null;
        this.currentConfig = null;
        this.isVisible = false;
        /**
         * Handle clicks outside menu
         */
        this.handleOutsideClick = (e) => {
            if (this.menu && !this.menu.contains(e.target)) {
                this.hide();
            }
        };
    }
    /**
     * Show context menu with configuration
     */
    show(config) {
        // Close existing menu if open
        this.hide();
        this.currentConfig = config;
        const position = config.position || { x: 0, y: 0 };
        // Create menu element
        this.menu = document.createElement('div');
        this.menu.className = 'unified-context-menu';
        this.menu.style.position = 'fixed';
        this.menu.style.left = `${position.x}px`;
        this.menu.style.top = `${position.y}px`;
        this.menu.style.zIndex = '10000';
        this.menu.innerHTML = this.renderMenu(config.options);
        document.body.appendChild(this.menu);
        this.isVisible = true;
        // Setup event handlers
        this.setupMenuHandlers();
        // Adjust position if menu goes off-screen
        this.adjustPosition();
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick, true);
        }, 0);
    }
    /**
     * Hide context menu
     */
    hide() {
        if (this.menu) {
            this.menu.remove();
            this.menu = null;
        }
        this.isVisible = false;
        this.currentConfig = null;
        document.removeEventListener('click', this.handleOutsideClick, true);
    }
    /**
     * Render menu HTML
     */
    renderMenu(options) {
        return options.map(option => {
            if (option.separator) {
                return '<div class="context-menu-separator"></div>';
            }
            const disabled = option.disabled ? 'disabled' : '';
            const icon = option.icon ? `<span class="context-menu-icon">${option.icon}</span>` : '';
            const label = typeof option.label === 'function' ? option.label() : option.label;
            const submenu = option.submenu ? this.renderMenu(option.submenu) : '';
            return `
        <div class="context-menu-item ${disabled}" data-action-id="${option.id}">
          ${icon}
          <span class="context-menu-label">${this.escapeHtml(label)}</span>
          ${submenu ? '<span class="context-menu-arrow">›</span>' : ''}
          ${submenu ? `<div class="context-menu-submenu">${submenu}</div>` : ''}
        </div>
      `;
        }).join('');
    }
    /**
     * Setup event handlers for menu items
     */
    setupMenuHandlers() {
        if (!this.menu || !this.currentConfig)
            return;
        const items = this.menu.querySelectorAll('.context-menu-item:not(.disabled)');
        items.forEach(item => {
            item.addEventListener('click', async (e) => {
                e.stopPropagation();
                const actionId = item.getAttribute('data-action-id');
                if (actionId) {
                    const option = this.findOption(this.currentConfig.options, actionId);
                    if (option && !option.disabled) {
                        await option.action();
                        this.hide();
                    }
                }
            });
        });
    }
    /**
     * Find option by ID (recursive for submenus)
     */
    findOption(options, id) {
        for (const option of options) {
            if (option.id === id)
                return option;
            if (option.submenu) {
                const found = this.findOption(option.submenu, id);
                if (found)
                    return found;
            }
        }
        return null;
    }
    /**
     * Adjust menu position if it goes off-screen
     */
    adjustPosition() {
        if (!this.menu)
            return;
        const rect = this.menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let left = parseFloat(this.menu.style.left);
        let top = parseFloat(this.menu.style.top);
        // Adjust horizontal position
        if (left + rect.width > viewportWidth) {
            left = viewportWidth - rect.width - 10;
        }
        if (left < 0) {
            left = 10;
        }
        // Adjust vertical position
        if (top + rect.height > viewportHeight) {
            top = viewportHeight - rect.height - 10;
        }
        if (top < 0) {
            top = 10;
        }
        this.menu.style.left = `${left}px`;
        this.menu.style.top = `${top}px`;
    }
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * Register right-click context menu handler for element
     * This intercepts the browser's native right-click menu and shows our custom menu
     *
     * Can accept options directly, a config object, or a function that returns config
     */
    registerContextMenu(element, config) {
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent browser's default right-click menu
            e.stopPropagation();
            const result = typeof config === 'function' ? config() : config;
            // Handle both array of options and full config object
            const menuConfig = Array.isArray(result)
                ? { options: result, position: { x: e.clientX, y: e.clientY } }
                : { ...result, position: { x: e.clientX, y: e.clientY } };
            this.show(menuConfig);
        });
    }
    /**
     * Auto-register context menus for common elements
     * Call this after DOM is ready to automatically set up right-click menus
     * ROOT CAUSE FIX: Context menu should NEVER be active in sidebar - only on webpage
     */
    autoRegisterCommonElements() {
        // CRITICAL FIX: Disable context menu completely if we're in sidebar (chrome-extension://)
        if (typeof window !== 'undefined' && window.location.protocol === 'chrome-extension:') {
            // In sidebar, prevent all context menus
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Do nothing - context menu disabled in sidebar
            }, true);
            console.log('✅ UNIFIED_CONTEXT_MENU: Context menu disabled in sidebar (chrome-extension://)');
            return; // Exit early - don't register any context menu handlers
        }
        // Register for message elements (only on web pages, not in sidebar)
        document.addEventListener('contextmenu', (e) => {
            const target = e.target;
            const messageElement = target.closest('[data-message-id]');
            if (messageElement) {
                e.preventDefault();
                e.stopPropagation();
                const messageId = messageElement.dataset.messageId || '';
                const win = window;
                const currentUser = win.getCurrentUser?.() || win.stateManagerInstance?.getState('currentUser');
                const messageAuthor = messageElement.querySelector('[data-author-email]')?.dataset.authorEmail;
                const isOwner = currentUser?.email === messageAuthor;
                const pageId = win.stateManagerInstance?.getState('currentUrlData')?.pageId || '';
                // Import and use context menu config
                import('./ContextMenuConfig.js').then(({ getMessageContextMenuOptions }) => {
                    // ROOT CAUSE FIX: Pass target element to context for sidebar detection
                    this.show({
                        options: getMessageContextMenuOptions({ messageId, isOwner, pageId, _mouseX: e.clientX, _mouseY: e.clientY, _target: target }),
                        position: { x: e.clientX, y: e.clientY },
                        context: { messageId, isOwner, pageId, _mouseX: e.clientX, _mouseY: e.clientY, _target: target }
                    });
                });
                return;
            }
            // Register for avatar elements
            const avatarElement = target.closest('.user-avatar, .message-avatar, [data-user-id]');
            if (avatarElement) {
                e.preventDefault();
                e.stopPropagation();
                const userId = avatarElement.dataset.userId || avatarElement.closest('[data-user-id]')?.getAttribute('data-user-id') || '';
                import('./ContextMenuConfig.js').then(({ getAvatarContextMenuOptions }) => {
                    // ROOT CAUSE FIX: Pass target element to context for sidebar detection
                    this.show({
                        options: getAvatarContextMenuOptions({ userId, _mouseX: e.clientX, _mouseY: e.clientY, _target: target }),
                        position: { x: e.clientX, y: e.clientY },
                        context: { userId, _mouseX: e.clientX, _mouseY: e.clientY, _target: target }
                    });
                });
                return;
            }
            // Register for text selection
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0) {
                e.preventDefault();
                e.stopPropagation();
                const selectedText = selection.toString();
                import('./ContextMenuConfig.js').then(({ getTextSelectionContextMenuOptions }) => {
                    // ROOT CAUSE FIX: Pass target element to context for sidebar detection
                    this.show({
                        options: getTextSelectionContextMenuOptions({ selectedText, _mouseX: e.clientX, _mouseY: e.clientY, _target: target }),
                        position: { x: e.clientX, y: e.clientY },
                        context: { selectedText, _mouseX: e.clientX, _mouseY: e.clientY, _target: target }
                    });
                });
                return;
            }
            // Default: page-level context menu
            const win = window;
            const pageId = win.stateManagerInstance?.getState('currentUrlData')?.pageId || '';
            const communityId = win.stateManagerInstance?.getState('ui.activeCommunities')?.[0];
            import('./ContextMenuConfig.js').then(({ getPageContextMenuOptions }) => {
                // ROOT CAUSE FIX: Pass target element to context for sidebar detection
                this.show({
                    options: getPageContextMenuOptions({
                        pageId,
                        communityId,
                        _mouseX: e.clientX,
                        _mouseY: e.clientY,
                        _target: target
                    }),
                    position: { x: e.clientX, y: e.clientY },
                    context: {
                        pageId,
                        communityId,
                        _mouseX: e.clientX,
                        _mouseY: e.clientY,
                        _target: target
                    }
                });
            });
        }, true); // Use capture phase to catch all right-clicks
    }
}
// Create singleton instance
const unifiedContextMenuInstance = new UnifiedContextMenu();
// Export to window for global access
if (typeof window !== 'undefined') {
    window.unifiedContextMenu = unifiedContextMenuInstance;
    // Auto-register common elements when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            unifiedContextMenuInstance.autoRegisterCommonElements();
            console.log('✅ UNIFIED_CONTEXT_MENU: Auto-registered right-click handlers');
        });
    }
    else {
        unifiedContextMenuInstance.autoRegisterCommonElements();
        console.log('✅ UNIFIED_CONTEXT_MENU: Auto-registered right-click handlers');
    }
    console.log('✅ UNIFIED_CONTEXT_MENU: Initialized and exported to window');
}
export { UnifiedContextMenu, unifiedContextMenuInstance };
export default UnifiedContextMenu;

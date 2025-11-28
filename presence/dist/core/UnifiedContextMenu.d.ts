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
export interface ContextMenuOption {
    id: string;
    label: string | (() => string);
    icon?: string;
    action: () => void | Promise<void>;
    disabled?: boolean;
    separator?: boolean;
    submenu?: ContextMenuOption[];
}
export interface ContextMenuConfig {
    options: ContextMenuOption[];
    position?: {
        x: number;
        y: number;
    };
    context?: Record<string, unknown>;
}
declare class UnifiedContextMenu {
    private menu;
    private currentConfig;
    /**
     * Show context menu with configuration
     */
    show(config: ContextMenuConfig): void;
    /**
     * Hide context menu
     */
    hide(): void;
    /**
     * Render menu HTML
     */
    private renderMenu;
    /**
     * Setup event handlers for menu items
     */
    private setupMenuHandlers;
    /**
     * Find option by ID (recursive for submenus)
     */
    private findOption;
    /**
     * Adjust menu position if it goes off-screen
     */
    private adjustPosition;
    /**
     * Handle clicks outside menu
     */
    private handleOutsideClick;
    /**
     * Escape HTML
     */
    private escapeHtml;
    /**
     * Register right-click context menu handler for element
     * This intercepts the browser's native right-click menu and shows our custom menu
     *
     * Can accept options directly, a config object, or a function that returns config
     */
    registerContextMenu(element: HTMLElement, config: ContextMenuOption[] | ContextMenuConfig | (() => ContextMenuOption[] | ContextMenuConfig)): void;
    /**
     * Auto-register context menus for common elements
     * Call this after DOM is ready to automatically set up right-click menus
     * ROOT CAUSE FIX: Our custom context menu should NEVER appear in sidebar - only on webpage
     * But browser's default context menu should still work in sidebar
     */
    autoRegisterCommonElements(): void;
}
declare const unifiedContextMenuInstance: UnifiedContextMenu;
export { UnifiedContextMenu, unifiedContextMenuInstance };
export default UnifiedContextMenu;
//# sourceMappingURL=UnifiedContextMenu.d.ts.map
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

import { handleError } from '../utils/ErrorHandler.js';

import { Logger } from '../utils/Logger.js';

export interface ContextMenuOption {
  id: string;
  label: string | (() => string); // Can be static string or function for dynamic labels
  icon?: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuOption[];
}

export interface ContextMenuConfig {
  options: ContextMenuOption[];
  position?: { x: number; y: number };
  context?: Record<string, unknown>;
}

class UnifiedContextMenu {
  private menu: HTMLElement | null = null;
  private currentConfig: ContextMenuConfig | null = null;

  /**
   * Show context menu with configuration
   */
  show(config: ContextMenuConfig): void {
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
  hide(): void {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
    this.currentConfig = null;
    document.removeEventListener('click', this.handleOutsideClick, true);
  }

  /**
   * Render menu HTML
   */
  private renderMenu(options: ContextMenuOption[]): string {
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
  private setupMenuHandlers(): void {
    if (!this.menu || !this.currentConfig) return;

    const items = this.menu.querySelectorAll('.context-menu-item:not(.disabled)');
    items.forEach(item => {
      item.addEventListener('click', async (e) => {
        try {
          e.stopPropagation();
          const actionId = item.getAttribute('data-action-id');
          if (actionId) {
            const option = this.findOption(this.currentConfig!.options, actionId);
            if (option && !option.disabled) {
              await option.action();
              this.hide();
            }
          }
        } catch (error: unknown) {
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
              operation: 'contextMenuAction',
              component: 'UnifiedContextMenu'
            }
          });
        }
      });
    });
  }

  /**
   * Find option by ID (recursive for submenus)
   */
  private findOption(options: ContextMenuOption[], id: string): ContextMenuOption | null {
    for (const option of options) {
      if (option.id === id) return option;
      if (option.submenu) {
        const found = this.findOption(option.submenu, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Adjust menu position if it goes off-screen
   */
  private adjustPosition(): void {
    if (!this.menu) return;

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
   * Handle clicks outside menu
   */
  private handleOutsideClick = (e: MouseEvent): void => {
    if (this.menu && !this.menu.contains(e.target as Node)) {
      this.hide();
    }
  };

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
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
  registerContextMenu(
    element: HTMLElement,
    config: ContextMenuOption[] | ContextMenuConfig | (() => ContextMenuOption[] | ContextMenuConfig)
  ): void {
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevent browser's default right-click menu
      e.stopPropagation();

      const result = typeof config === 'function' ? config() : config;
      
      // Handle both array of options and full config object
      const menuConfig: ContextMenuConfig = Array.isArray(result)
        ? { options: result, position: { x: e.clientX, y: e.clientY } }
        : { ...result, position: { x: e.clientX, y: e.clientY } };
      
      this.show(menuConfig);
    });
  }
  
  /**
   * Auto-register context menus for common elements
   * Call this after DOM is ready to automatically set up right-click menus
   * ROOT CAUSE FIX: Our custom context menu should NEVER appear in sidebar - only on webpage
   * But browser's default context menu should still work in sidebar
   */
  autoRegisterCommonElements(): void {
    // Register for message elements (on both web pages and sidebar, but only show custom menu on web pages)
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      
      // ROOT CAUSE FIX: Check if we're in sidebar - if so, don't show our custom menu, but allow default
      const isInSidebar = typeof window !== 'undefined' && window.location.protocol === 'chrome-extension:';
      if (isInSidebar) {
        // In sidebar: Don't prevent default, don't show our custom menu - let browser's default menu show
        return; // Don't prevent default, don't show custom menu
      }
      
      // On web pages: Show our custom menu and prevent browser's default menu
      const messageElement = target.closest('[data-message-id]') as HTMLElement;
      
      if (messageElement) {
        // ROOT CAUSE FIX: Only prevent default and show custom menu on web pages, not in sidebar
        if (!isInSidebar) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          // In sidebar: Allow default browser context menu
          return;
        }
        
        const messageId = messageElement.dataset.messageId || '';
        const win = window as Window & { 
          stateManagerInstance?: { getState: (path: string) => unknown };
          getCurrentUser?: () => { email?: string; [key: string]: unknown } | null;
        };
        
        const currentUser = win.getCurrentUser?.() || win.stateManagerInstance?.getState('currentUser') as { id?: string } | null;
        // UUID ONLY - use data-author-id, not data-author-email
        const messageAuthorId = (messageElement.querySelector('[data-author-id]') as HTMLElement)?.dataset.authorId || 
                                (messageElement as HTMLElement)?.dataset.authorId;
        const isOwner = currentUser?.id && messageAuthorId && currentUser.id === messageAuthorId;
        const pageId = (win.stateManagerInstance?.getState('currentUrlData') as { pageId?: string } | null)?.pageId || '';
        
        // Import and use context menu config
        import('./ContextMenuConfig.js').then(({ getMessageContextMenuOptions }) => {
          // ROOT CAUSE FIX: Pass target element to context for sidebar detection
          this.show({
            options: getMessageContextMenuOptions({ messageId, isOwner, pageId, _mouseX: e.clientX, _mouseY: e.clientY, _target: target as HTMLElement }),
            position: { x: e.clientX, y: e.clientY },
            context: { messageId, isOwner, pageId, _mouseX: e.clientX, _mouseY: e.clientY, _target: target as HTMLElement }
          });
        });
        return;
      }
      
      // Register for avatar elements
      const avatarElement = target.closest('.user-avatar, .message-avatar, [data-user-id]') as HTMLElement;
      if (avatarElement) {
        // ROOT CAUSE FIX: Only prevent default and show custom menu on web pages, not in sidebar
        if (!isInSidebar) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          // In sidebar: Allow default browser context menu
          return;
        }
        
        const userId = avatarElement.dataset.userId || avatarElement.closest('[data-user-id]')?.getAttribute('data-user-id') || '';
        
        import('./ContextMenuConfig.js').then(({ getAvatarContextMenuOptions }) => {
          // ROOT CAUSE FIX: Pass target element to context for sidebar detection
          this.show({
            options: getAvatarContextMenuOptions({ userId, _mouseX: e.clientX, _mouseY: e.clientY, _target: target as HTMLElement }),
            position: { x: e.clientX, y: e.clientY },
            context: { userId, _mouseX: e.clientX, _mouseY: e.clientY, _target: target as HTMLElement }
          });
        });
        return;
      }
      
      // Register for text selection
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        // ROOT CAUSE FIX: Only prevent default and show custom menu on web pages, not in sidebar
        if (!isInSidebar) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          // In sidebar: Allow default browser context menu
          return;
        }
        
        const selectedText = selection.toString();
        import('./ContextMenuConfig.js').then(({ getTextSelectionContextMenuOptions }) => {
          // ROOT CAUSE FIX: Pass target element to context for sidebar detection
          this.show({
            options: getTextSelectionContextMenuOptions({ selectedText, _mouseX: e.clientX, _mouseY: e.clientY, _target: target as HTMLElement }),
            position: { x: e.clientX, y: e.clientY },
            context: { selectedText, _mouseX: e.clientX, _mouseY: e.clientY, _target: target as HTMLElement }
          });
        });
        return;
      }
      
      // Default: page-level context menu
      // ROOT CAUSE FIX: Only prevent default and show custom menu on web pages, not in sidebar
      if (!isInSidebar) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        // In sidebar: Allow default browser context menu
        return;
      }
      
      const win = window as Window & { 
        stateManagerInstance?: { getState: (path: string) => unknown };
      };
      const pageId = (win.stateManagerInstance?.getState('currentUrlData') as { pageId?: string } | null)?.pageId || '';
      const communityId = (win.stateManagerInstance?.getState('ui.activeCommunities') as string[] | null)?.[0];
      
      import('./ContextMenuConfig.js').then(({ getPageContextMenuOptions }) => {
        // ROOT CAUSE FIX: Pass target element to context for sidebar detection
        this.show({
          options: getPageContextMenuOptions({ 
            pageId, 
            communityId, 
            _mouseX: e.clientX, 
            _mouseY: e.clientY,
            _target: target as HTMLElement
          }),
          position: { x: e.clientX, y: e.clientY },
          context: { 
            pageId, 
            communityId, 
            _mouseX: e.clientX, 
            _mouseY: e.clientY,
            _target: target as HTMLElement
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
  (window as Window & { unifiedContextMenu?: UnifiedContextMenu }).unifiedContextMenu = unifiedContextMenuInstance;
  
  // Auto-register common elements when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      unifiedContextMenuInstance.autoRegisterCommonElements();
      Logger.debug('✅ UNIFIED_CONTEXT_MENU: Auto-registered right-click handlers', null, 'ui');
    });
  } else {
    unifiedContextMenuInstance.autoRegisterCommonElements();
    Logger.debug('✅ UNIFIED_CONTEXT_MENU: Auto-registered right-click handlers', null, 'ui');
  }
  
  Logger.debug('✅ UNIFIED_CONTEXT_MENU: Initialized and exported to window', null, 'ui');
}

export { UnifiedContextMenu, unifiedContextMenuInstance };
export default UnifiedContextMenu;


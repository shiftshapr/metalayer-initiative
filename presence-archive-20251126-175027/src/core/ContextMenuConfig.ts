/**
 * ContextMenuConfig - Configuration for unified context menu
 * Provides Park cursor and other application-specific menu options
 */

import type { ContextMenuOption } from './UnifiedContextMenu.js';
import { Logger } from '../utils/Logger.js';

export interface ContextMenuProvider {
  getOptions(context: Record<string, unknown>): ContextMenuOption[];
}

/**
 * Auto-detect menu type from context and return appropriate options
 * More flexible - derives options from context data rather than requiring explicit type
 */
export function getContextMenuOptionsFromContext(context: Record<string, unknown>): ContextMenuOption[] {
  // Auto-detect based on context properties
  if (context.messageId) {
    return getMessageContextMenuOptions(context);
  }
  if (context.userId) {
    return getAvatarContextMenuOptions(context);
  }
  if (context.selectedText) {
    return getTextSelectionContextMenuOptions(context);
  }
  if (context.pageId || context.communityId) {
    return getPageContextMenuOptions(context);
  }
  
  // Default: page-level options
  return getPageContextMenuOptions(context);
}

/**
 * Get context menu options for message elements
 * ROOT CAUSE FIX: Hide park/unpark menu if cursor is in sidebar
 */
export function getMessageContextMenuOptions(context: Record<string, unknown>): ContextMenuOption[] {
  const messageId = context.messageId as string;
  const isOwner = context.isOwner as boolean || false;
  const mouseX = (context._mouseX as number) || undefined;
  const mouseY = (context._mouseY as number) || undefined;
  const target = (context._target as HTMLElement) || undefined;
  
  // ROOT CAUSE FIX: Check if cursor is in sidebar
  const cursorInSidebar = isCursorInSidebar(mouseX, mouseY, target);
  
  const options: ContextMenuOption[] = [
    {
      id: 'reply',
      label: 'Reply',
      icon: '↩️',
      action: async () => {
        if (window.openReplyModal && messageId) {
          const pageId = (context.pageId as string) || '';
          await window.openReplyModal({ id: messageId }, pageId);
        }
      }
    },
    {
      id: 'quote',
      label: 'Quote',
      icon: '💬',
      action: async () => {
        if (window.openQuoteModal && messageId) {
          const pageId = (context.pageId as string) || '';
          await window.openQuoteModal({ id: messageId }, pageId);
        }
      }
    },
  ];
  
  // ROOT CAUSE FIX: Only show park/unpark if cursor is NOT in sidebar
  if (!cursorInSidebar) {
    options.push({
      id: 'park-cursor',
      label: () => {
        const isParked = window.isCursorParked?.() || false;
        return isParked ? 'Unpark Cursor' : 'Park Cursor';
      },
      icon: '📍',
      action: async () => {
        if (window.toggleParkCursor) {
          // Get mouse position from the context menu event (stored in context)
          const x = mouseX || window.innerWidth / 2;
          const y = mouseY || window.innerHeight / 2;
          
          const isParked = await window.toggleParkCursor(x, y, { messageId, pageId: context.pageId });
          Logger.debug(`📍 PARK_CURSOR: ${isParked ? 'Parked' : 'Unparked'} cursor at message`, messageId, 'context-menu');
        }
      }
    });
  }
  
  return [
    ...options,
    { 
      id: 'separator-1', 
      separator: true,
      label: '',
      action: async () => {}
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: '✏️',
      action: async () => {
        // TODO: Implement edit
      },
      disabled: !isOwner
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      action: async () => {
        // TODO: Implement delete
      },
      disabled: !isOwner
    },
    {
      id: 'flag',
      label: 'Flag',
      icon: '🚩',
      action: async () => {
        // TODO: Implement flag
      },
      disabled: true
    },
    { 
      id: 'separator-2', 
      separator: true,
      label: '',
      action: async () => {}
    },
    {
      id: 'copy-link',
      label: 'Copy Link',
      icon: '🔗',
      action: async () => {
        const messageUrl = `https://app.themetalayer.org/message/${messageId}`;
        await navigator.clipboard.writeText(messageUrl);
      }
    }
  ];
}

/**
 * Get context menu options for avatar elements
 * ROOT CAUSE FIX: Hide park/unpark menu if cursor is in sidebar
 */
export function getAvatarContextMenuOptions(context: Record<string, unknown>): ContextMenuOption[] {
  const userId = context.userId as string;
  const mouseX = (context._mouseX as number) || undefined;
  const mouseY = (context._mouseY as number) || undefined;
  const target = (context._target as HTMLElement) || undefined;
  
  // ROOT CAUSE FIX: Check if cursor is in sidebar
  const cursorInSidebar = isCursorInSidebar(mouseX, mouseY, target);
  
  const options: ContextMenuOption[] = [
    {
      id: 'view-profile',
      label: 'View Profile',
      icon: '👤',
      action: async () => {
        Logger.debug('👤 VIEW_PROFILE: Viewing profile for', userId, 'context-menu');
        // TODO: Implement profile view
      }
    },
  ];
  
  // ROOT CAUSE FIX: Only show park/unpark if cursor is NOT in sidebar
  if (!cursorInSidebar) {
    options.push({
      id: 'park-cursor',
      label: () => {
        const isParked = window.isCursorParked?.() || false;
        return isParked ? 'Unpark Cursor' : 'Park Cursor';
      },
      icon: '📍',
      action: async () => {
        if (window.toggleParkCursor) {
          // Get mouse position from the context menu event (stored in context)
          const x = mouseX || window.innerWidth / 2;
          const y = mouseY || window.innerHeight / 2;
          
          const isParked = await window.toggleParkCursor(x, y, { userId });
          Logger.debug(`📍 PARK_CURSOR: ${isParked ? 'Parked' : 'Unparked'} cursor at user`, userId, 'context-menu');
        }
      }
    });
  }
  
  options.push({
    id: 'message',
    label: 'Send Message',
    icon: '💬',
    action: async () => {
      // TODO: Implement direct message
    }
  });
  
  return options;
}

/**
 * Get context menu options for text selection
 * ROOT CAUSE FIX: Hide park/unpark menu if cursor is in sidebar
 */
export function getTextSelectionContextMenuOptions(context: Record<string, unknown>): ContextMenuOption[] {
  const selectedText = context.selectedText as string || '';
  const mouseX = (context._mouseX as number) || undefined;
  const mouseY = (context._mouseY as number) || undefined;
  const target = (context._target as HTMLElement) || undefined;
  
  // ROOT CAUSE FIX: Check if cursor is in sidebar
  const cursorInSidebar = isCursorInSidebar(mouseX, mouseY, target);
  
  const options: ContextMenuOption[] = [];
  
  // ROOT CAUSE FIX: Only show park/unpark if cursor is NOT in sidebar
  if (!cursorInSidebar) {
    options.push({
      id: 'park-cursor',
      label: () => {
        const isParked = window.isCursorParked?.() || false;
        return isParked ? 'Unpark Cursor' : 'Park Cursor';
      },
      icon: '📍',
      action: async () => {
        if (window.toggleParkCursor) {
          // Get mouse position from the context menu event (stored in context)
          const x = mouseX || window.innerWidth / 2;
          const y = mouseY || window.innerHeight / 2;
          
          const isParked = await window.toggleParkCursor(x, y, { text: selectedText });
          Logger.debug(`📍 PARK_CURSOR: ${isParked ? 'Parked' : 'Unparked'} cursor at text selection`, null, 'context-menu');
        }
      }
    });
  }
  
  options.push(
    {
      id: 'copy',
      label: 'Copy',
      icon: '📋',
      action: async () => {
        await navigator.clipboard.writeText(selectedText);
      }
    },
    {
      id: 'search',
      label: 'Search',
      icon: '🔍',
      action: async () => {
        // TODO: Implement search
      }
    }
  );
  
  return options;
}

/**
 * Check if cursor/click is within the sidebar/sidepanel
 * ROOT CAUSE FIX: Park/unpark menu should not display if cursor is in sidebar
 */
/**
 * ROOT CAUSE FIX: Check if cursor/click is within the sidebar/sidepanel
 * CRITICAL: Context menu should NEVER be active in sidebar - only on webpage
 */
function isCursorInSidebar(mouseX?: number, mouseY?: number, target?: HTMLElement): boolean {
  // CRITICAL FIX: If we're in a chrome-extension:// context (sidepanel), ALWAYS return true
  // The entire sidepanel IS the sidebar - context menu should never show here
  if (typeof window !== 'undefined' && window.location.protocol === 'chrome-extension:') {
    return true; // Entire sidepanel is sidebar - disable context menu completely
  }
  
  // For web pages, check if click is within sidebar elements
  const sidebarSelectors = [
    'sidepanel',
    'sidebar',
    '#sidepanel',
    '#sidebar',
    '.sidepanel',
    '.sidebar',
    '.sidebar-content',
    '[role="complementary"]'
  ];
  
  // Check if target is within any sidebar element
  if (target) {
    for (const selector of sidebarSelectors) {
      const sidebarElement = document.querySelector(selector);
      if (sidebarElement && (sidebarElement.contains(target) || sidebarElement === target)) {
        return true;
      }
    }
  }
  
  // If mouse coordinates provided, check if they're within sidebar bounds
  if (mouseX !== undefined && mouseY !== undefined) {
    for (const selector of sidebarSelectors) {
      const sidebarElement = document.querySelector(selector);
      if (sidebarElement) {
        const rect = sidebarElement.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && 
            mouseY >= rect.top && mouseY <= rect.bottom) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Get context menu options for page/application
 * ROOT CAUSE FIX: Hide park/unpark menu if cursor is in sidebar
 */
export function getPageContextMenuOptions(context: Record<string, unknown>): ContextMenuOption[] {
  const pageId = context.pageId as string;
  const communityId = context.communityId as string;
  const mouseX = (context._mouseX as number) || undefined;
  const mouseY = (context._mouseY as number) || undefined;
  const target = (context._target as HTMLElement) || undefined;
  
  // ROOT CAUSE FIX: Check if cursor is in sidebar
  const cursorInSidebar = isCursorInSidebar(mouseX, mouseY, target);
  
  const options: ContextMenuOption[] = [];
  
  // ROOT CAUSE FIX: Only show park/unpark if cursor is NOT in sidebar
  if (!cursorInSidebar) {
    options.push({
      id: 'park-cursor',
      label: () => {
        const isParked = window.isCursorParked?.() || false;
        return isParked ? 'Unpark Cursor' : 'Park Cursor';
      },
      icon: '📍',
      action: async () => {
        if (window.toggleParkCursor) {
          // Get mouse position from the context menu event (stored in context)
          const x = mouseX || window.innerWidth / 2;
          const y = mouseY || window.innerHeight / 2;
          
          const isParked = await window.toggleParkCursor(x, y, { pageId, communityId });
          Logger.debug(`📍 PARK_CURSOR: ${isParked ? 'Parked' : 'Unparked'} cursor on page`, pageId, 'context-menu');
        }
      }
    });
  }
  
  options.push({
    id: 'new-message',
    label: 'New Message',
    icon: '✍️',
    action: async () => {
      if (window.openMessageModal) {
        await window.openMessageModal({
          mode: 'new',
          pageId: pageId || '',
          communityId
        });
      }
    }
  });
  
  return options;
}



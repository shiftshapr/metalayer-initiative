/**
 * CursorParkManager - Manages parking and unparking cursors
 * 
 * When a user parks their cursor:
 * - Leaves a visual trace/marker at that location
 * - User can still move their cursor (which reverts to regular)
 * - The parked marker remains visible to others
 * - Can unpark to remove the marker
 */

import { handleError } from '../utils/ErrorHandler.js';

import { Logger } from '../utils/Logger.js';

export type CursorVisualStyle = 'regular' | 'aura-circle' | 'avatar' | 'custom-image';

export interface ParkedCursor {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  auraColor?: string;
  x: number;
  y: number;
  pageId: string;
  timestamp: string;
  visualStyle: CursorVisualStyle;
  customImageUrl?: string;
}

export interface CursorParkState {
  isParked: boolean;
  parkedCursorId?: string;
  parkedAt?: { x: number; y: number; pageId: string };
}

class CursorParkManager {
  private parkedCursors: Map<string, ParkedCursor> = new Map();
  private currentUserParkState: CursorParkState = { isParked: false };
  private visualStyle: CursorVisualStyle = 'regular';
  private customImageUrl?: string;

  /**
   * Park cursor at current location
   */
  async parkCursor(
    x: number,
    y: number,
    context?: { messageId?: string; userId?: string; pageId?: string; text?: string }
  ): Promise<string | null> {
    const currentUser = window.getCurrentUser?.() || 
                       (window.stateManagerInstance?.getState('currentUser') as { 
                         id?: string; 
                         name?: string; 
                         avatarUrl?: string; 
                         auraColor?: string;
                         [key: string]: unknown 
                       } | null);

    if (!currentUser?.id) {
      Logger.warn('⚠️ CURSOR_PARK: Cannot park - user not authenticated', null, 'cursor');
      return null;
    }

    // Unpark existing if already parked
    if (this.currentUserParkState.isParked && this.currentUserParkState.parkedCursorId) {
      await this.unparkCursor(this.currentUserParkState.parkedCursorId);
    }

    const pageId = context?.pageId || 
                   (window.stateManagerInstance?.getState('currentUrlData') as { pageId?: string } | null)?.pageId || 
                   'unknown';

    const parkedCursor: ParkedCursor = {
      id: `parked-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name || 'Unknown',
      userAvatar: currentUser.avatarUrl as string,
      auraColor: currentUser.auraColor as string,
      x,
      y,
      pageId,
      timestamp: new Date().toISOString(),
      visualStyle: this.visualStyle,
      customImageUrl: this.customImageUrl
    };

    this.parkedCursors.set(parkedCursor.id, parkedCursor);
    this.currentUserParkState = {
      isParked: true,
      parkedCursorId: parkedCursor.id,
      parkedAt: { x, y, pageId }
    };

    // Render the parked cursor marker
    this.renderParkedCursor(parkedCursor);

    // Save to storage and sync with server
    await this.saveParkedCursor(parkedCursor);

    Logger.debug('✅ CURSOR_PARK: Cursor parked at', { x, y, pageId }, 'cursor');
    return parkedCursor.id;
  }

  /**
   * Unpark cursor (remove parked marker)
   */
  async unparkCursor(cursorId?: string): Promise<void> {
    const idToRemove = cursorId || this.currentUserParkState.parkedCursorId;
    if (!idToRemove) {
      Logger.warn('⚠️ CURSOR_PARK: No cursor to unpark', null, 'cursor');
      return;
    }

    try {
      const parkedCursor = this.parkedCursors.get(idToRemove);
      if (parkedCursor) {
        // Remove from DOM
        const marker = document.getElementById(`parked-cursor-${idToRemove}`);
        if (marker) {
          marker.remove();
        }

        // Remove from map
        this.parkedCursors.delete(idToRemove);

        // Remove from server/storage
        await this.removeParkedCursor(idToRemove);
      }

      // Update state
      if (this.currentUserParkState.parkedCursorId === idToRemove) {
        this.currentUserParkState = { isParked: false };
      }
    } catch (error: unknown) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'unparkCursor',
          component: 'CursorParkManager',
          cursorId: idToRemove
        }
      });
    }

    Logger.debug('✅ CURSOR_PARK: Cursor unparked', idToRemove, 'cursor');
  }

  /**
   * Toggle park/unpark at current location
   */
  async toggleParkCursor(
    x: number,
    y: number,
    context?: { messageId?: string; userId?: string; pageId?: string; text?: string }
  ): Promise<boolean> {
    if (this.currentUserParkState.isParked) {
      await this.unparkCursor();
      return false; // Now unparked
    } else {
      await this.parkCursor(x, y, context);
      return true; // Now parked
    }
  }

  /**
   * Check if cursor is currently parked
   */
  isParked(): boolean {
    return this.currentUserParkState.isParked;
  }

  /**
   * Get parked cursor ID
   */
  getParkedCursorId(): string | undefined {
    return this.currentUserParkState.parkedCursorId;
  }

  /**
   * Set cursor visual style
   */
  setVisualStyle(style: CursorVisualStyle, customImageUrl?: string): void {
    this.visualStyle = style;
    this.customImageUrl = customImageUrl;
    Logger.debug('✅ CURSOR_PARK: Visual style set to', style, 'cursor');
  }

  /**
   * Get current visual style
   */
  getVisualStyle(): CursorVisualStyle {
    return this.visualStyle;
  }

  /**
   * Render parked cursor marker on page
   */
  private renderParkedCursor(cursor: ParkedCursor): void {
    // Remove existing marker if present
    const existing = document.getElementById(`parked-cursor-${cursor.id}`);
    if (existing) {
      existing.remove();
    }

    const marker = document.createElement('div');
    marker.id = `parked-cursor-${cursor.id}`;
    marker.className = 'parked-cursor-marker';
    marker.style.position = 'fixed';
    marker.style.left = `${cursor.x}px`;
    marker.style.top = `${cursor.y}px`;
    marker.style.zIndex = '9998';
    marker.style.pointerEvents = 'none';
    marker.dataset.userId = cursor.userId;
    marker.dataset.cursorId = cursor.id;

    // Render based on visual style
    switch (cursor.visualStyle) {
      case 'aura-circle':
        marker.innerHTML = `
          <div class="parked-cursor-aura" style="background: ${cursor.auraColor || '#33aa33'}; width: 12px; height: 12px; border-radius: 50%; opacity: 0.8;"></div>
          <div class="parked-cursor-label" style="margin-top: 4px; font-size: 10px; color: var(--text-secondary);">${this.escapeHtml(cursor.userName)}</div>
        `;
        break;
      case 'avatar':
        if (cursor.userAvatar) {
          marker.innerHTML = `
            <img src="${this.escapeHtml(cursor.userAvatar)}" alt="${this.escapeHtml(cursor.userName)}" 
                 style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${cursor.auraColor || '#33aa33'};" />
            <div class="parked-cursor-label" style="margin-top: 4px; font-size: 10px; color: var(--text-secondary);">${this.escapeHtml(cursor.userName)}</div>
          `;
        } else {
          marker.innerHTML = `
            <div class="parked-cursor-avatar-placeholder" style="width: 24px; height: 24px; border-radius: 50%; background: ${cursor.auraColor || '#33aa33'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
              ${cursor.userName.charAt(0).toUpperCase()}
            </div>
            <div class="parked-cursor-label" style="margin-top: 4px; font-size: 10px; color: var(--text-secondary);">${this.escapeHtml(cursor.userName)}</div>
          `;
        }
        break;
      case 'custom-image':
        if (cursor.customImageUrl) {
          marker.innerHTML = `
            <img src="${this.escapeHtml(cursor.customImageUrl)}" alt="Parked cursor" 
                 style="width: 24px; height: 24px; border-radius: 4px;" />
            <div class="parked-cursor-label" style="margin-top: 4px; font-size: 10px; color: var(--text-secondary);">${this.escapeHtml(cursor.userName)}</div>
          `;
        }
        break;
      case 'regular':
      default:
        marker.innerHTML = `
          <div class="parked-cursor-default" style="width: 2px; height: 16px; background: var(--text-primary); transform: rotate(45deg);"></div>
          <div class="parked-cursor-label" style="margin-top: 4px; font-size: 10px; color: var(--text-secondary);">${this.escapeHtml(cursor.userName)}</div>
        `;
        break;
    }

    document.body.appendChild(marker);
  }

  /**
   * Save parked cursor to storage and sync with server
   */
  private async saveParkedCursor(cursor: ParkedCursor): Promise<void> {
    try {
      // Save to Chrome storage
      await chrome.storage.local.set({
        [`parked-cursor-${cursor.id}`]: cursor,
        'current-parked-cursor': cursor.id
      });

      // TODO: Sync with server via API
      if (window.api) {
        // await window.api.request('/api/cursors/park', { method: 'POST', body: JSON.stringify(cursor) });
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'CursorPark'
            }
        });;
    
    }
  }

  /**
   * Remove parked cursor from storage and server
   */
  private async removeParkedCursor(cursorId: string): Promise<void> {
    try {
      // Remove from Chrome storage
      await chrome.storage.local.remove(`parked-cursor-${cursorId}`);
      const current = await chrome.storage.local.get('current-parked-cursor');
      if (current['current-parked-cursor'] === cursorId) {
        await chrome.storage.local.remove('current-parked-cursor');
      }

      // TODO: Remove from server via API
      if (window.api) {
        // await window.api.request(`/api/cursors/park/${cursorId}`, { method: 'DELETE' });
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'CursorPark'
            }
        });;
    
    }
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create singleton instance
const cursorParkManagerInstance = new CursorParkManager();

// Export to window for global access
if (typeof window !== 'undefined') {
  window.cursorParkManager = {
    parkCursor: (x: number, y: number, context?: Record<string, unknown>) => 
      cursorParkManagerInstance.parkCursor(x, y, context),
    unparkCursor: (cursorId?: string) => 
      cursorParkManagerInstance.unparkCursor(cursorId),
    toggleParkCursor: (x: number, y: number, context?: Record<string, unknown>) => 
      cursorParkManagerInstance.toggleParkCursor(x, y, context),
    isParked: () => 
      cursorParkManagerInstance.isParked()
  };
  
  // Export convenience functions
  window.parkCursor = (x: number, y: number, context?: Record<string, unknown>) => 
    cursorParkManagerInstance.parkCursor(x, y, context);
  
  window.unparkCursor = (cursorId?: string) => 
    cursorParkManagerInstance.unparkCursor(cursorId);
  
  window.toggleParkCursor = (x: number, y: number, context?: Record<string, unknown>) => 
    cursorParkManagerInstance.toggleParkCursor(x, y, context);
  
  window.isCursorParked = () => 
    cursorParkManagerInstance.isParked();
  
  Logger.debug('✅ CURSOR_PARK_MANAGER: Initialized and exported to window', null, 'cursor');
}

export { CursorParkManager, cursorParkManagerInstance };
export default CursorParkManager;





/**
 * CursorParkManager - Manages parking and unparking cursors
 *
 * When a user parks their cursor:
 * - Leaves a visual trace/marker at that location
 * - User can still move their cursor (which reverts to regular)
 * - The parked marker remains visible to others
 * - Can unpark to remove the marker
 */
class CursorParkManager {
    constructor() {
        this.parkedCursors = new Map();
        this.currentUserParkState = { isParked: false };
        this.visualStyle = 'regular';
    }
    /**
     * Park cursor at current location
     */
    async parkCursor(x, y, context) {
        const win = window;
        const currentUser = win.getCurrentUser?.() ||
            win.stateManagerInstance?.getState('currentUser');
        if (!currentUser?.id) {
            console.warn('⚠️ CURSOR_PARK: Cannot park - user not authenticated');
            return null;
        }
        // Unpark existing if already parked
        if (this.currentUserParkState.isParked && this.currentUserParkState.parkedCursorId) {
            await this.unparkCursor(this.currentUserParkState.parkedCursorId);
        }
        const pageId = context?.pageId ||
            win.stateManagerInstance?.getState('currentUrlData')?.pageId ||
            'unknown';
        const parkedCursor = {
            id: `parked-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: currentUser.id,
            userName: currentUser.name || 'Unknown',
            userAvatar: currentUser.avatarUrl,
            auraColor: currentUser.auraColor,
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
        console.log('✅ CURSOR_PARK: Cursor parked at', { x, y, pageId });
        return parkedCursor.id;
    }
    /**
     * Unpark cursor (remove parked marker)
     */
    async unparkCursor(cursorId) {
        const idToRemove = cursorId || this.currentUserParkState.parkedCursorId;
        if (!idToRemove) {
            console.warn('⚠️ CURSOR_PARK: No cursor to unpark');
            return;
        }
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
        console.log('✅ CURSOR_PARK: Cursor unparked', idToRemove);
    }
    /**
     * Toggle park/unpark at current location
     */
    async toggleParkCursor(x, y, context) {
        if (this.currentUserParkState.isParked) {
            await this.unparkCursor();
            return false; // Now unparked
        }
        else {
            await this.parkCursor(x, y, context);
            return true; // Now parked
        }
    }
    /**
     * Check if cursor is currently parked
     */
    isParked() {
        return this.currentUserParkState.isParked;
    }
    /**
     * Get parked cursor ID
     */
    getParkedCursorId() {
        return this.currentUserParkState.parkedCursorId;
    }
    /**
     * Set cursor visual style
     */
    setVisualStyle(style, customImageUrl) {
        this.visualStyle = style;
        this.customImageUrl = customImageUrl;
        console.log('✅ CURSOR_PARK: Visual style set to', style);
    }
    /**
     * Get current visual style
     */
    getVisualStyle() {
        return this.visualStyle;
    }
    /**
     * Render parked cursor marker on page
     */
    renderParkedCursor(cursor) {
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
                }
                else {
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
    async saveParkedCursor(cursor) {
        try {
            // Save to Chrome storage
            await chrome.storage.local.set({
                [`parked-cursor-${cursor.id}`]: cursor,
                'current-parked-cursor': cursor.id
            });
            // TODO: Sync with server via API
            const win = window;
            if (win.api) {
                // await win.api.request('/api/cursors/park', { method: 'POST', body: JSON.stringify(cursor) });
            }
        }
        catch (error) {
            console.error('❌ CURSOR_PARK: Failed to save parked cursor:', error);
        }
    }
    /**
     * Remove parked cursor from storage and server
     */
    async removeParkedCursor(cursorId) {
        try {
            // Remove from Chrome storage
            await chrome.storage.local.remove(`parked-cursor-${cursorId}`);
            const current = await chrome.storage.local.get('current-parked-cursor');
            if (current['current-parked-cursor'] === cursorId) {
                await chrome.storage.local.remove('current-parked-cursor');
            }
            // TODO: Remove from server via API
            const win = window;
            if (win.api) {
                // await win.api.request(`/api/cursors/park/${cursorId}`, { method: 'DELETE' });
            }
        }
        catch (error) {
            console.error('❌ CURSOR_PARK: Failed to remove parked cursor:', error);
        }
    }
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
// Create singleton instance
const cursorParkManagerInstance = new CursorParkManager();
// Export to window for global access
if (typeof window !== 'undefined') {
    window.cursorParkManager = cursorParkManagerInstance;
    // Export convenience functions
    window.parkCursor = (x, y, context) => cursorParkManagerInstance.parkCursor(x, y, context);
    window.unparkCursor =
        (cursorId) => cursorParkManagerInstance.unparkCursor(cursorId);
    window.toggleParkCursor =
        (x, y, context) => cursorParkManagerInstance.toggleParkCursor(x, y, context);
    window.isCursorParked =
        () => cursorParkManagerInstance.isParked();
    console.log('✅ CURSOR_PARK_MANAGER: Initialized and exported to window');
}
export { CursorParkManager, cursorParkManagerInstance };
export default CursorParkManager;

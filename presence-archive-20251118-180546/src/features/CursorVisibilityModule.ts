/**
 * CURSOR VISIBILITY MODULE
 * Handles cursor visibility tied to "live" status
 * Cursors are visible from when person goes live until they stop
 */

import { Logger } from '../utils/Logger.js';

interface CursorPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface CursorPresence {
  userId: string;
  userEmail: string;
  pageId: string;
  isLive: boolean;
  position: CursorPosition | null;
  isParked: boolean;
  parkedAt: CursorPosition | null;
  subscribers: string[]; // User IDs who can see this cursor
}

declare const window: Window & {
  currentUser?: {
    id: string;
    email: string;
  };
  supabaseRealtimeClient?: any;
  websocketClient?: WebSocket;
  cursorVisibilityModule?: CursorVisibilityModule;
};

class CursorVisibilityModule {
  private logger: Logger;
  private isLive: boolean = false;
  private currentPosition: CursorPosition | null = null;
  private isParked: boolean = false;
  private parkedPosition: CursorPosition | null = null;
  private subscribers: Set<string> = new Set();
  private cursorUpdateInterval: number | null = null;
  private pageId: string | null = null;
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Initialize cursor visibility module
   */
  async initialize(): Promise<void> {
    this.logger.log('INFO', 'Initializing CursorVisibilityModule...');
    
    // Get current page ID
    this.pageId = this.getCurrentPageId();
    
    // Set up mouse tracking
    this.setupMouseTracking();
    
    this.logger.log('INFO', 'CursorVisibilityModule initialized');
  }

  /**
   * Go live - start broadcasting cursor position
   */
  async goLive(): Promise<void> {
    if (this.isLive) {
      this.logger.log('WARN', 'Already live');
      return;
    }

    this.isLive = true;
    this.logger.log('INFO', 'Going live - cursor visibility enabled');
    
    // Notify server
    await this.notifyServer('CURSOR_LIVE_START', {
      pageId: this.pageId,
      timestamp: Date.now()
    });

    // Start broadcasting cursor position
    this.startCursorBroadcast();

    // Update UI
    this.updateLiveStatusUI(true);
  }

  /**
   * Stop live - stop broadcasting cursor position
   */
  async stopLive(): Promise<void> {
    if (!this.isLive) {
      this.logger.log('WARN', 'Not currently live');
      return;
    }

    this.isLive = false;
    this.isParked = false;
    this.parkedPosition = null;
    this.logger.log('INFO', 'Stopped live - cursor visibility disabled');

    // Notify server
    await this.notifyServer('CURSOR_LIVE_STOP', {
      pageId: this.pageId,
      timestamp: Date.now()
    });

    // Stop broadcasting
    this.stopCursorBroadcast();

    // Update UI
    this.updateLiveStatusUI(false);
  }

  /**
   * Park cursor at current position (show support)
   */
  async parkCursor(): Promise<void> {
    if (!this.isLive) {
      this.logger.log('WARN', 'Must be live to park cursor');
      return;
    }

    if (this.currentPosition) {
      this.isParked = true;
      this.parkedPosition = { ...this.currentPosition };
      this.logger.log('INFO', 'Cursor parked at position', this.parkedPosition);

      // Notify server
      await this.notifyServer('CURSOR_PARKED', {
        pageId: this.pageId,
        position: this.parkedPosition,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Unpark cursor
   */
  async unparkCursor(): Promise<void> {
    if (!this.isParked) {
      return;
    }

    this.isParked = false;
    this.parkedPosition = null;
    this.logger.log('INFO', 'Cursor unparked');

    // Notify server
    await this.notifyServer('CURSOR_UNPARKED', {
      pageId: this.pageId,
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to see another user's cursor
   */
  async subscribeToCursor(userId: string): Promise<void> {
    if (this.subscribers.has(userId)) {
      return;
    }

    this.subscribers.add(userId);
    this.logger.log('INFO', `Subscribed to cursor: ${userId}`);

    // Notify server
    await this.notifyServer('CURSOR_SUBSCRIBE', {
      targetUserId: userId,
      pageId: this.pageId,
      timestamp: Date.now()
    });
  }

  /**
   * Unsubscribe from another user's cursor
   */
  async unsubscribeFromCursor(userId: string): Promise<void> {
    if (!this.subscribers.has(userId)) {
      return;
    }

    this.subscribers.delete(userId);
    this.logger.log('INFO', `Unsubscribed from cursor: ${userId}`);

    // Notify server
    await this.notifyServer('CURSOR_UNSUBSCRIBE', {
      targetUserId: userId,
      pageId: this.pageId,
      timestamp: Date.now()
    });
  }

  /**
   * Handle cursor position update from another user
   */
  handleRemoteCursorUpdate(cursorData: CursorPresence): void {
    // Only show if we're subscribed to this user
    if (!this.subscribers.has(cursorData.userId)) {
      return;
    }

    // Render cursor on page
    this.renderRemoteCursor(cursorData);
  }

  /**
   * Setup mouse tracking
   */
  private setupMouseTracking(): void {
    this.mouseMoveHandler = (e: MouseEvent) => {
      if (!this.isLive) {
        return;
      }

      this.currentPosition = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };

      // If parked, don't update position
      if (this.isParked) {
        return;
      }

      // Throttle updates (will be sent via broadcast interval)
    };

    document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  /**
   * Start broadcasting cursor position
   */
  private startCursorBroadcast(): void {
    if (this.cursorUpdateInterval) {
      return;
    }

    // Broadcast cursor position every 100ms when live
    this.cursorUpdateInterval = window.setInterval(() => {
      if (!this.isLive || !this.currentPosition) {
        return;
      }

      // Don't broadcast if parked (parked position is sent separately)
      if (this.isParked) {
        return;
      }

      this.broadcastCursorPosition();
    }, 100);
  }

  /**
   * Stop broadcasting cursor position
   */
  private stopCursorBroadcast(): void {
    if (this.cursorUpdateInterval) {
      clearInterval(this.cursorUpdateInterval);
      this.cursorUpdateInterval = null;
    }
  }

  /**
   * Broadcast current cursor position
   */
  private async broadcastCursorPosition(): Promise<void> {
    if (!this.currentPosition || !this.pageId) {
      return;
    }

    await this.notifyServer('CURSOR_POSITION', {
      pageId: this.pageId,
      position: this.currentPosition,
      timestamp: Date.now()
    });
  }

  /**
   * Notify server via WebSocket or Supabase
   */
  private async notifyServer(type: string, data: any): Promise<void> {
    const userId = window.currentUser?.id || window.currentUser?.email;
    const userEmail = window.currentUser?.email;

    if (!userId || !userEmail) {
      this.logger.log('WARN', 'No current user for cursor notification');
      return;
    }

    const message = {
      type,
      userId,
      userEmail,
      ...data
    };

    // Try WebSocket first
    if (window.websocketClient && window.websocketClient.readyState === WebSocket.OPEN) {
      window.websocketClient.send(JSON.stringify(message));
      return;
    }

    // Fallback to Supabase Realtime
    if (window.supabaseRealtimeClient?.broadcastCursorEvent) {
      await window.supabaseRealtimeClient.broadcastCursorEvent(message);
      return;
    }

    this.logger.log('WARN', 'No available connection for cursor notification');
  }

  /**
   * Render remote cursor on page
   */
  private renderRemoteCursor(cursorData: CursorPresence): void {
    // Remove existing cursor if present
    const existingCursor = document.querySelector(`[data-cursor-user="${cursorData.userId}"]`);
    if (existingCursor) {
      existingCursor.remove();
    }

    // Get position (use parked position if parked, otherwise current position)
    const position = cursorData.isParked && cursorData.parkedAt 
      ? cursorData.parkedAt 
      : cursorData.position;

    if (!position) {
      return;
    }

    // Create cursor element
    const cursorElement = document.createElement('div');
    cursorElement.setAttribute('data-cursor-user', cursorData.userId);
    cursorElement.className = 'remote-cursor';
    cursorElement.style.cssText = `
      position: fixed;
      left: ${position.x}px;
      top: ${position.y}px;
      width: 20px;
      height: 20px;
      border: 2px solid ${this.getUserColor(cursorData.userEmail)};
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      transition: all 0.1s ease;
      ${cursorData.isParked ? 'box-shadow: 0 0 10px ' + this.getUserColor(cursorData.userEmail) + ';' : ''}
    `;

    // Add user label
    const label = document.createElement('div');
    label.className = 'remote-cursor-label';
    label.textContent = cursorData.userEmail.split('@')[0];
    label.style.cssText = `
      position: absolute;
      top: -20px;
      left: 0;
      background: ${this.getUserColor(cursorData.userEmail)};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      white-space: nowrap;
      pointer-events: none;
    `;
    cursorElement.appendChild(label);

    // Add to page
    document.body.appendChild(cursorElement);

    // Remove after 2 seconds if not updated (cursor might have stopped)
    setTimeout(() => {
      if (cursorElement.parentNode) {
        cursorElement.remove();
      }
    }, 2000);
  }

  /**
   * Get user color for cursor
   */
  private getUserColor(userEmail: string): string {
    // Use aura color if available, otherwise generate from email
    // This should match the aura color system
    return '#aa00aa'; // Default, should integrate with aura system
  }

  /**
   * Get current page ID
   */
  private getCurrentPageId(): string {
    // Use existing page ID generation logic
    if (typeof window !== 'undefined' && (window as Window & { UIManager?: { generatePageId?: (url: string) => string } }).UIManager?.generatePageId) {
      return (window as Window & { UIManager?: { generatePageId?: (url: string) => string } }).UIManager!.generatePageId!(window.location.href);
    }
    
    // Fallback
    const url = window.location.href;
    return url.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Update live status UI
   */
  private updateLiveStatusUI(isLive: boolean): void {
    // Update UI elements in sidepanel
    const liveIndicator = document.querySelector('[data-live-indicator]');
    const liveButton = document.querySelector('[data-live-button]');

    if (liveIndicator) {
      liveIndicator.textContent = isLive ? '🔴 LIVE' : '⚪ Offline';
      liveIndicator.setAttribute('data-live', isLive.toString());
    }

    if (liveButton) {
      liveButton.textContent = isLive ? 'Stop Live' : 'Go Live';
      liveButton.setAttribute('data-live', isLive.toString());
    }
  }

  /**
   * Get live status
   */
  getIsLive(): boolean {
    return this.isLive;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopLive();
    
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
    }

    // Remove all remote cursors
    document.querySelectorAll('[data-cursor-user]').forEach(el => el.remove());
  }
}

// Export singleton instance
export const cursorVisibilityModule = new CursorVisibilityModule();

// Make available globally
if (typeof window !== 'undefined') {
  (window as Window & { cursorVisibilityModule?: CursorVisibilityModule }).cursorVisibilityModule = cursorVisibilityModule;
}


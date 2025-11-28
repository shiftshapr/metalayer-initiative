/**
 * CursorParkManager - Manages parking and unparking cursors
 *
 * When a user parks their cursor:
 * - Leaves a visual trace/marker at that location
 * - User can still move their cursor (which reverts to regular)
 * - The parked marker remains visible to others
 * - Can unpark to remove the marker
 */
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
    _customImageUrl?: string;
}

export interface CursorParkState {
  isParked: boolean;
  parkedCursorId?: string;
  parkedAt?: {
    x: number;
    y: number;
    pageId: string;
  };
}

class CursorParkManager {
  private parkedCursors: Map<string, ParkedCursor> = new Map();
  private currentUserParkState: CursorParkState = { isParked: false };
  private visualStyle: CursorVisualStyle = 'regular';
  // @ts-expect-error - Property is set but not read (stub implementation)
  private customImageUrl?: string;

  /**
   * Park cursor at current location
   */
  async parkCursor(_x: number, _y: number, _context?: {
    messageId?: string;
    userId?: string;
    pageId?: string;
    text?: string;
  }): Promise<string | null> {
    // Stub implementation
    return null;
  }

  /**
   * Unpark cursor (remove parked marker)
   */
  async unparkCursor(_cursorId?: string): Promise<void> {
    // Stub implementation
  }

  /**
   * Toggle park/unpark at current location
   */
  async toggleParkCursor(_x: number, _y: number, _context?: {
    messageId?: string;
    userId?: string;
    pageId?: string;
    text?: string;
  }): Promise<boolean> {
    // Stub implementation
    return false;
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
  }

  /**
   * Get current visual style
   */
  getVisualStyle(): CursorVisualStyle {
    return this.visualStyle;
  }

  /**
   * Get all parked cursors for a page
   */
  getParkedCursors(pageId: string): ParkedCursor[] {
    return Array.from(this.parkedCursors.values()).filter(cursor => cursor.pageId === pageId);
  }

  /**
   * Get current user's park state
   */
  getCurrentUserParkState(): CursorParkState {
    return { ...this.currentUserParkState };
  }
}

export const cursorParkManagerInstance = new CursorParkManager();
export { CursorParkManager };
export default CursorParkManager;

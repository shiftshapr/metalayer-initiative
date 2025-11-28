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
    customImageUrl?: string;
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
declare class CursorParkManager {
    private parkedCursors;
    private currentUserParkState;
    private visualStyle;
    private customImageUrl?;
    /**
     * Park cursor at current location
     */
    parkCursor(x: number, y: number, context?: {
        messageId?: string;
        userId?: string;
        pageId?: string;
        text?: string;
    }): Promise<string | null>;
    /**
     * Unpark cursor (remove parked marker)
     */
    unparkCursor(cursorId?: string): Promise<void>;
    /**
     * Toggle park/unpark at current location
     */
    toggleParkCursor(x: number, y: number, context?: {
        messageId?: string;
        userId?: string;
        pageId?: string;
        text?: string;
    }): Promise<boolean>;
    /**
     * Check if cursor is currently parked
     */
    isParked(): boolean;
    /**
     * Get parked cursor ID
     */
    getParkedCursorId(): string | undefined;
    /**
     * Set cursor visual style
     */
    setVisualStyle(style: CursorVisualStyle, customImageUrl?: string): void;
    /**
     * Get current visual style
     */
    getVisualStyle(): CursorVisualStyle;
    /**
     * Render parked cursor marker on page
     */
    private renderParkedCursor;
    /**
     * Save parked cursor to storage and sync with server
     */
    private saveParkedCursor;
    /**
     * Remove parked cursor from storage and server
     */
    private removeParkedCursor;
    /**
     * Escape HTML
     */
    private escapeHtml;
}
declare const cursorParkManagerInstance: CursorParkManager;
export { CursorParkManager, cursorParkManagerInstance };
export default CursorParkManager;
//# sourceMappingURL=CursorParkManager.d.ts.map
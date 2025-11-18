/**
 * CURSOR VISIBILITY MODULE
 * Handles cursor visibility tied to "live" status
 * Cursors are visible from when person goes live until they stop
 */
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
    subscribers: string[];
}
declare class CursorVisibilityModule {
    private logger;
    private isLive;
    private currentPosition;
    private isParked;
    private parkedPosition;
    private subscribers;
    private cursorUpdateInterval;
    private pageId;
    private mouseMoveHandler;
    constructor();
    /**
     * Initialize cursor visibility module
     */
    initialize(): Promise<void>;
    /**
     * Go live - start broadcasting cursor position
     */
    goLive(): Promise<void>;
    /**
     * Stop live - stop broadcasting cursor position
     */
    stopLive(): Promise<void>;
    /**
     * Park cursor at current position (show support)
     */
    parkCursor(): Promise<void>;
    /**
     * Unpark cursor
     */
    unparkCursor(): Promise<void>;
    /**
     * Subscribe to see another user's cursor
     */
    subscribeToCursor(userId: string): Promise<void>;
    /**
     * Unsubscribe from another user's cursor
     */
    unsubscribeFromCursor(userId: string): Promise<void>;
    /**
     * Handle cursor position update from another user
     */
    handleRemoteCursorUpdate(cursorData: CursorPresence): void;
    /**
     * Setup mouse tracking
     */
    private setupMouseTracking;
    /**
     * Start broadcasting cursor position
     */
    private startCursorBroadcast;
    /**
     * Stop broadcasting cursor position
     */
    private stopCursorBroadcast;
    /**
     * Broadcast current cursor position
     */
    private broadcastCursorPosition;
    /**
     * Notify server via WebSocket or Supabase
     */
    private notifyServer;
    /**
     * Render remote cursor on page
     */
    private renderRemoteCursor;
    /**
     * Get user color for cursor
     */
    private getUserColor;
    /**
     * Get current page ID
     */
    private getCurrentPageId;
    /**
     * Update live status UI
     */
    private updateLiveStatusUI;
    /**
     * Get live status
     */
    getIsLive(): boolean;
    /**
     * Cleanup
     */
    destroy(): void;
}
export declare const cursorVisibilityModule: CursorVisibilityModule;
export {};
//# sourceMappingURL=CursorVisibilityModule.d.ts.map
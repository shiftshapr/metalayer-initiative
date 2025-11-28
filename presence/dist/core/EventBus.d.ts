/**
 * EVENT BUS - Simple Event Emitter
 *
 * Minimal implementation for event handling in the sidepanel.
 * Provides basic pub/sub functionality.
 */
type EventCallback = (payload: unknown) => Promise<void> | void;
/**
 * Simple event bus for sidepanel events
 */
export declare class EventBus {
    private listeners;
    /**
     * Subscribe to an event
     */
    on(event: string, callback: EventCallback): void;
    /**
     * Unsubscribe from an event
     */
    off(event: string, callback: EventCallback): void;
    /**
     * Emit an event
     */
    emit(event: string, payload: unknown): Promise<void>;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: string): void;
}
export {};
//# sourceMappingURL=EventBus.d.ts.map
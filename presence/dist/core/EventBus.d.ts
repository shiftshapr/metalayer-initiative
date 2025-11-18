/**
 * EVENTBUS - Centralized Event Management
 * TypeScript + ES6 Module
 */
import { EventBus as IEventBus, EventType, EventCallback } from '../types/index.js';
declare class EventBus implements IEventBus {
    private listeners;
    private onceListeners;
    private eventHistory;
    private maxHistorySize;
    private isDestroyed;
    constructor();
    /**
     * Register an event listener
     */
    on(event: EventType, callback: EventCallback, options?: {
        priority?: number;
        context?: any;
    }): string;
    /**
     * Remove an event listener
     */
    off(event: EventType, listenerId: string): void;
    /**
     * Emit an event to all listeners
     */
    emit(event: EventType, data?: any): void;
    /**
     * Register a one-time event listener
     */
    once(event: EventType, callback: EventCallback, options?: {
        priority?: number;
        context?: any;
    }): string;
    /**
     * Get event history
     */
    getHistory(event?: EventType): any[];
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: EventType): void;
    /**
     * Cleanup resources
     */
    cleanup(): void;
    /**
     * Destroy the event bus (alias for cleanup)
     */
    destroy(): void;
    /**
     * Add event to history
     */
    private addToHistory;
    /**
     * Generate unique listener ID
     */
    private generateId;
}
export { EventBus };
export default EventBus;
//# sourceMappingURL=EventBus.d.ts.map
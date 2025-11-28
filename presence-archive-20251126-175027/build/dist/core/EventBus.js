/**
 * EVENT BUS - Simple Event Emitter
 *
 * Minimal implementation for event handling in the sidepanel.
 * Provides basic pub/sub functionality.
 */
import { handleError } from '../utils/ErrorHandler.js';
/**
 * Simple event bus for sidepanel events
 */
export class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }
    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }
    /**
     * Emit an event
     */
    async emit(event, payload) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                try {
                    await callback(payload);
                }
                catch (error) {
                    handleError(error, {
                        log: true,
                        logLevel: 'error',
                        context: {
                            operation: 'emit',
                            component: 'EventBus',
                            event
                        }
                    });
                }
            }
        }
    }
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
        }
        else {
            this.listeners.clear();
        }
    }
}
//# sourceMappingURL=EventBus.js.map
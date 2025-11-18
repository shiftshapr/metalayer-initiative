/**
 * EVENTBUS - Centralized Event Management
 * TypeScript + ES6 Module
 */
class EventBus {
    constructor() {
        this.maxHistorySize = 100;
        this.isDestroyed = false;
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.eventHistory = [];
        console.log('🎯 EventBus: Initialized');
    }
    /**
     * Register an event listener
     */
    on(event, callback, options = {}) {
        if (this.isDestroyed) {
            console.warn('⚠️ EventBus: Cannot add listener after destruction');
            return '';
        }
        if (typeof callback !== 'function') {
            console.error('❌ EventBus: Callback must be a function');
            return '';
        }
        const listener = {
            callback,
            priority: options.priority || 0,
            context: options.context || null,
            id: this.generateId(),
            timestamp: Date.now()
        };
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(listener);
        // Sort by priority (higher priority first)
        this.listeners.get(event).sort((a, b) => b.priority - a.priority);
        console.log(`🎯 EventBus: Added listener for '${event}' (${listener.id})`);
        return listener.id;
    }
    /**
     * Remove an event listener
     */
    off(event, listenerId) {
        if (this.isDestroyed)
            return;
        const eventListeners = this.listeners.get(event);
        if (!eventListeners)
            return;
        const index = eventListeners.findIndex(listener => listener.id === listenerId);
        if (index !== -1) {
            const removed = eventListeners.splice(index, 1)[0];
            console.log(`🎯 EventBus: Removed listener for '${event}' (${removed.id})`);
            // Clean up empty event arrays
            if (eventListeners.length === 0) {
                this.listeners.delete(event);
            }
        }
    }
    /**
     * Emit an event to all listeners
     */
    emit(event, data) {
        if (this.isDestroyed) {
            console.warn('⚠️ EventBus: Cannot emit after destruction');
            return;
        }
        const eventListeners = this.listeners.get(event);
        if (!eventListeners || eventListeners.length === 0) {
            console.log(`🎯 EventBus: No listeners for '${event}'`);
            return;
        }
        // Add to history
        this.addToHistory(event, data);
        let calledCount = 0;
        const errors = [];
        // Call all listeners
        for (const listener of eventListeners) {
            try {
                if (listener.context) {
                    listener.callback.call(listener.context, data);
                }
                else {
                    listener.callback(data);
                }
                calledCount++;
            }
            catch (error) {
                console.error(`❌ EventBus: Listener error for '${event}':`, error);
                errors.push({
                    event,
                    error,
                    listener: listener.id,
                    timestamp: Date.now()
                });
            }
        }
        console.log(`🎯 EventBus: Emitted '${event}' to ${calledCount} listeners`);
        // Emit error event if there were errors
        if (errors.length > 0) {
            this.emit('eventbus:error', { event, errors });
        }
    }
    /**
     * Register a one-time event listener
     */
    once(event, callback, options = {}) {
        if (this.isDestroyed) {
            console.warn('⚠️ EventBus: Cannot add listener after destruction');
            return '';
        }
        const onceCallback = (data) => {
            callback(data);
            this.off(event, listenerId);
        };
        const listenerId = this.on(event, onceCallback, options);
        return listenerId;
    }
    /**
     * Get event history
     */
    getHistory(event) {
        if (event) {
            return this.eventHistory.filter(entry => entry.event === event);
        }
        return [...this.eventHistory];
    }
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        }
        else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        console.log('🧹 EventBus: Cleaning up...');
        this.removeAllListeners();
        this.eventHistory = [];
        this.isDestroyed = true;
        console.log('✅ EventBus: Cleanup complete');
    }
    /**
     * Destroy the event bus (alias for cleanup)
     */
    destroy() {
        this.cleanup();
    }
    /**
     * Add event to history
     */
    addToHistory(event, data) {
        const entry = {
            timestamp: Date.now(),
            event,
            data: data !== undefined ? data : undefined,
            listenerCount: this.listeners.get(event)?.length || 0
        };
        this.eventHistory.unshift(entry);
        // Limit history size
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
        }
    }
    /**
     * Generate unique listener ID
     */
    generateId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
export { EventBus };
export default EventBus;
//# sourceMappingURL=EventBus.js.map
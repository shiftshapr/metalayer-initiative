/**
 * Event Listener Manager
 * Centralized event listener management with automatic cleanup
 */
export class EventListenerManager {
    constructor() {
        this.listeners = new Map();
    }
    add(element, type, listener, options) {
        // Initialize element map if needed
        if (!this.listeners.has(element)) {
            this.listeners.set(element, new Map());
        }
        const elementListeners = this.listeners.get(element);
        // Remove existing listener for this type if it exists
        if (elementListeners.has(type)) {
            const existing = elementListeners.get(type);
            element.removeEventListener(type, existing.listener, existing.options);
        }
        // Add new listener
        element.addEventListener(type, listener, options);
        elementListeners.set(type, { listener, options });
    }
    /**
     * Remove a specific event listener
     */
    remove(element, type) {
        const elementListeners = this.listeners.get(element);
        if (elementListeners && elementListeners.has(type)) {
            const { listener, options } = elementListeners.get(type);
            element.removeEventListener(type, listener, options);
            elementListeners.delete(type);
            // Clean up empty element maps
            if (elementListeners.size === 0) {
                this.listeners.delete(element);
            }
        }
    }
    /**
     * Remove all listeners for an element
     */
    removeAll(element) {
        const elementListeners = this.listeners.get(element);
        if (elementListeners) {
            elementListeners.forEach(({ listener, options }, type) => {
                element.removeEventListener(type, listener, options);
            });
            this.listeners.delete(element);
        }
    }
    /**
     * Remove all listeners
     */
    removeAllListeners() {
        this.listeners.forEach((elementListeners, element) => {
            elementListeners.forEach(({ listener, options }, type) => {
                element.removeEventListener(type, listener, options);
            });
        });
        this.listeners.clear();
    }
    once(element, type, listener, options) {
        const onceOptions = { ...options, once: true };
        this.add(element, type, listener, onceOptions);
    }
    /**
     * Get the number of listeners for an element
     */
    count(element) {
        const elementListeners = this.listeners.get(element);
        return elementListeners ? elementListeners.size : 0;
    }
    /**
     * Get total number of managed listeners
     */
    totalCount() {
        let total = 0;
        this.listeners.forEach(elementListeners => {
            total += elementListeners.size;
        });
        return total;
    }
    /**
     * Check if element has a specific listener type
     */
    has(element, type) {
        const elementListeners = this.listeners.get(element);
        return elementListeners ? elementListeners.has(type) : false;
    }
    /**
     * Alias for add() method - common event manager pattern
     */
    on(element, type, listener, options) {
        this.add(element, type, listener, options);
    }
    /**
     * Alias for removeAllListeners() - cleanup all managed listeners
     */
    cleanup() {
        this.removeAllListeners();
    }
}
// Export singleton instance
let eventListenerManagerInstance = null;
export function createEventListenerManager() {
    if (!eventListenerManagerInstance) {
        eventListenerManagerInstance = new EventListenerManager();
    }
    return eventListenerManagerInstance;
}
// Export default singleton for convenience
export const eventListenerManager = createEventListenerManager();
//# sourceMappingURL=EventListenerManager.js.map
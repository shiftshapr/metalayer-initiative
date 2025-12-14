/**
 * Event Listener Manager
 * Manages DOM event listeners with automatic cleanup
 */
/**
 * Create an event listener manager for scoped cleanup
 */
export function createEventListenerManager() {
    const listeners = new Set();
    return {
        on(element, event, handler, options) {
            element.addEventListener(event, handler, options);
            const listener = { element, event, handler, cleanup: () => {
                    element.removeEventListener(event, handler);
                } };
            listeners.add(listener);
            return listener.cleanup;
        },
        once(element, event, handler, options) {
            const eventName = event; // Capture the event name to avoid shadowing
            const onceHandler = (event) => {
                handler(event);
                // Auto-remove after firing once
                element.removeEventListener(eventName, onceHandler);
                listeners.forEach(listener => {
                    if (listener.element === element && listener.event === eventName && listener.handler === onceHandler) {
                        listeners.delete(listener);
                    }
                });
            };
            element.addEventListener(eventName, onceHandler, options && typeof options === 'object' ? { ...options, once: true } : { once: true });
            const listener = { element, event, handler: onceHandler, cleanup: () => {
                    element.removeEventListener(event, onceHandler);
                } };
            listeners.add(listener);
            return listener.cleanup;
        },
        off(element, event, handler) {
            element.removeEventListener(event, handler);
            listeners.forEach(listener => {
                if (listener.element === element && listener.event === event && listener.handler === handler) {
                    listeners.delete(listener);
                }
            });
        },
        destroy() {
            listeners.forEach(listener => {
                try {
                    listener.cleanup();
                }
                catch (error) {
                    console.warn('Error cleaning up event listener:', error);
                }
            });
            listeners.clear();
        }
    };
}

/**
 * Event Listener Manager
 * Manages DOM event listeners with automatic cleanup
 */

export interface EventManager {
  on<T extends EventTarget>(
    element: T,
    event: string,
    handler: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): () => void;

  once<T extends EventTarget>(
    element: T,
    event: string,
    handler: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): () => void;

  off<T extends EventTarget>(
    element: T,
    event: string,
    handler: (event: Event) => void
  ): void;

  destroy(): void;
}

/**
 * Create an event listener manager for scoped cleanup
 */
export function createEventListenerManager(): EventManager {
  const listeners = new Set<{
    element: EventTarget;
    event: string;
    handler: (event: Event) => void;
    cleanup: () => void;
  }>();

  return {
    on<T extends EventTarget>(
      element: T,
      event: string,
      handler: (event: Event) => void,
      options?: boolean | AddEventListenerOptions
    ): () => void {
      element.addEventListener(event, handler, options);

      const listener = { element, event, handler, cleanup: () => {
        element.removeEventListener(event, handler);
      }};

      listeners.add(listener);

      return listener.cleanup;
    },

    once<T extends EventTarget>(
      element: T,
      event: string,
      handler: (event: Event) => void,
      options?: boolean | AddEventListenerOptions
    ): () => void {
      const eventName = event; // Capture the event name to avoid shadowing
      const onceHandler = (event: Event) => {
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
      }};

      listeners.add(listener);

      return listener.cleanup;
    },

    off<T extends EventTarget>(
      element: T,
      event: string,
      handler: (event: Event) => void
    ): void {
      element.removeEventListener(event, handler);
      listeners.forEach(listener => {
        if (listener.element === element && listener.event === event && listener.handler === handler) {
          listeners.delete(listener);
        }
      });
    },

    destroy(): void {
      listeners.forEach(listener => {
        try {
          listener.cleanup();
        } catch (error) {
          console.warn('Error cleaning up event listener:', error);
        }
      });
      listeners.clear();
    }
  };
}

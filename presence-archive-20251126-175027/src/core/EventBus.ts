/**
 * EVENT BUS - Simple Event Emitter
 * 
 * Minimal implementation for event handling in the sidepanel.
 * Provides basic pub/sub functionality.
 */

import { handleError } from '../utils/ErrorHandler.js';

type EventCallback = (payload: unknown) => Promise<void> | void;

/**
 * Simple event bus for sidepanel events
 */
export class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit an event
   */
  async emit(event: string, payload: unknown): Promise<void> {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          await callback(payload);
        } catch (error: unknown) {
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
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}





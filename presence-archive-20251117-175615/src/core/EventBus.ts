/**
 * EVENTBUS - Centralized Event Management
 * TypeScript + ES6 Module
 */

import { EventBus as IEventBus, EventType, EventCallback } from '../types/index.js';

interface Listener {
  callback: EventCallback;
  priority: number;
  context: any | null;
  id: string;
  timestamp: number;
}

class EventBus implements IEventBus {
  private listeners: Map<EventType, Listener[]>;
  private onceListeners: Map<EventType, Listener[]>;
  private eventHistory: any[];
  private maxHistorySize: number = 100;
  private isDestroyed: boolean = false;

  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.eventHistory = [];
    
    console.log('🎯 EventBus: Initialized');
  }

  /**
   * Register an event listener
   */
  on(event: EventType, callback: EventCallback, options: { priority?: number; context?: any } = {}): string {
    if (this.isDestroyed) {
      console.warn('⚠️ EventBus: Cannot add listener after destruction');
      return '';
    }
    
    if (typeof callback !== 'function') {
      console.error('❌ EventBus: Callback must be a function');
      return '';
    }
    
    const listener: Listener = {
      callback,
      priority: options.priority || 0,
      context: options.context || null,
      id: this.generateId(),
      timestamp: Date.now()
    };
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(listener);
    
    // Sort by priority (higher priority first)
    this.listeners.get(event)!.sort((a, b) => b.priority - a.priority);
    
    console.log(`🎯 EventBus: Added listener for '${event}' (${listener.id})`);
    
    return listener.id;
  }

  /**
   * Remove an event listener
   */
  off(event: EventType, listenerId: string): void {
    if (this.isDestroyed) return;
    
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    
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
  emit(event: EventType, data?: any): void {
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
    const errors: any[] = [];
    
    // Call all listeners
    for (const listener of eventListeners) {
      try {
        if (listener.context) {
          listener.callback.call(listener.context, data);
        } else {
          listener.callback(data);
        }
        calledCount++;
      } catch (error) {
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
  once(event: EventType, callback: EventCallback, options: { priority?: number; context?: any } = {}): string {
    if (this.isDestroyed) {
      console.warn('⚠️ EventBus: Cannot add listener after destruction');
      return '';
    }
    
    const onceCallback: EventCallback = (data?: any) => {
      callback(data);
      this.off(event, listenerId);
    };
    
    const listenerId = this.on(event, onceCallback, options);
    return listenerId;
  }

  /**
   * Get event history
   */
  getHistory(event?: EventType): any[] {
    if (event) {
      return this.eventHistory.filter(entry => entry.event === event);
    }
    return [...this.eventHistory];
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: EventType): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log('🧹 EventBus: Cleaning up...');
    
    this.removeAllListeners();
    this.eventHistory = [];
    this.isDestroyed = true;
    
    console.log('✅ EventBus: Cleanup complete');
  }

  /**
   * Destroy the event bus (alias for cleanup)
   */
  destroy(): void {
    this.cleanup();
  }

  /**
   * Add event to history
   */
  private addToHistory(event: EventType, data?: any): void {
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
  private generateId(): string {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { EventBus };
export default EventBus;


/**
 * VISIBILITY STATE - Centralized State Management
 * 
 * Replaces window.currentVisibilityData and provides reactive state management.
 * Phase 1: Foundation - State Management
 */

import type { VisibilityUser, VisibilityStateSnapshot } from './VisibilityTypes.js';
import { handleError } from '../../../utils/ErrorHandler.js';

/**
 * Centralized state management for visibility data
 * Provides reactive updates via subscription pattern
 */
export class VisibilityState {
  private currentUsers: VisibilityUser[] = [];
  private currentPageId: string | null = null;
  private currentUserEmail: string | null = null;
  private isActive: boolean = false;
  private subscribers: Set<(state: VisibilityState) => void> = new Set();
  private lastUpdate: number = 0;

  /**
   * Get current users (immutable copy)
   */
  getUsers(): VisibilityUser[] {
    return [...this.currentUsers];
  }

  /**
   * Get current page ID
   */
  getCurrentPageId(): string | null {
    return this.currentPageId;
  }

  /**
   * Get current user email
   */
  getCurrentUserEmail(): string | null {
    return this.currentUserEmail;
  }

  /**
   * Check if state is active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Get last update timestamp
   */
  getLastUpdate(): number {
    return this.lastUpdate;
  }

  /**
   * Set users and notify subscribers
   */
  setUsers(users: VisibilityUser[]): void {
    this.currentUsers = users;
    this.lastUpdate = Date.now();
    this.notify();
  }

  /**
   * Set current page ID
   */
  setCurrentPageId(pageId: string | null): void {
    if (this.currentPageId !== pageId) {
      this.currentPageId = pageId;
      this.notify();
    }
  }

  /**
   * Set current user email
   */
  setCurrentUserEmail(email: string | null): void {
    if (this.currentUserEmail !== email) {
      this.currentUserEmail = email;
      this.notify();
    }
  }

  /**
   * Set active state
   */
  setIsActive(active: boolean): void {
    if (this.isActive !== active) {
      this.isActive = active;
      this.notify();
    }
  }

  /**
   * Add a user to the current list
   */
  addUser(user: VisibilityUser): void {
    const existingIndex = this.currentUsers.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      // Update existing user
      this.currentUsers[existingIndex] = user;
    } else {
      // Add new user
      this.currentUsers.push(user);
    }
    this.lastUpdate = Date.now();
    this.notify();
  }

  /**
   * Remove a user from the current list
   */
  removeUser(userId: string): void {
    const index = this.currentUsers.findIndex(u => u.id === userId);
    if (index >= 0) {
      this.currentUsers.splice(index, 1);
      this.lastUpdate = Date.now();
      this.notify();
    }
  }

  /**
   * Update a user in the current list
   */
  updateUser(userId: string, updates: Partial<VisibilityUser>): void {
    const index = this.currentUsers.findIndex(u => u.id === userId);
    if (index >= 0) {
      this.currentUsers[index] = { ...this.currentUsers[index], ...updates } as VisibilityUser;
      this.lastUpdate = Date.now();
      this.notify();
    }
  }

  /**
   * Clear all users
   */
  clearUsers(): void {
    if (this.currentUsers.length > 0) {
      this.currentUsers = [];
      this.lastUpdate = Date.now();
      this.notify();
    }
  }

  /**
   * Subscribe to state changes
   * @returns Unsubscribe function
   */
  subscribe(callback: (state: VisibilityState) => void): () => void {
    this.subscribers.add(callback);
    // Immediately call with current state
    callback(this);
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get state snapshot
   */
  getSnapshot(): VisibilityStateSnapshot {
    return {
      users: this.getUsers(),
      currentPageId: this.currentPageId,
      currentUserEmail: this.currentUserEmail,
      isActive: this.isActive,
      timestamp: this.lastUpdate
    };
  }

  /**
   * Notify all subscribers of state change
   */
  private notify(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this);
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'VisibilityState'
            }
        });;
      
    }
    });
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    this.currentUsers = [];
    this.currentPageId = null;
    this.currentUserEmail = null;
    this.isActive = false;
    this.lastUpdate = 0;
    this.notify();
  }
}

/**
 * Singleton instance for global state access
 * TODO: Phase 2 - Consider dependency injection instead
 */
export const visibilityStateInstance = new VisibilityState();


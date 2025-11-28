/**
 * VISIBILITY STATE - Centralized State Management
 *
 * Replaces window.currentVisibilityData and provides reactive state management.
 * Phase 1: Foundation - State Management
 */
import type { VisibilityUser, VisibilityStateSnapshot } from './VisibilityTypes.js';
/**
 * Centralized state management for visibility data
 * Provides reactive updates via subscription pattern
 */
export declare class VisibilityState {
    private currentUsers;
    private currentPageId;
    private currentUserEmail;
    private isActive;
    private subscribers;
    private lastUpdate;
    /**
     * Get current users (immutable copy)
     */
    getUsers(): VisibilityUser[];
    /**
     * Get current page ID
     */
    getCurrentPageId(): string | null;
    /**
     * Get current user email
     */
    getCurrentUserEmail(): string | null;
    /**
     * Check if state is active
     */
    getIsActive(): boolean;
    /**
     * Get last update timestamp
     */
    getLastUpdate(): number;
    /**
     * Set users and notify subscribers
     */
    setUsers(users: VisibilityUser[]): void;
    /**
     * Set current page ID
     */
    setCurrentPageId(pageId: string | null): void;
    /**
     * Set current user email
     */
    setCurrentUserEmail(email: string | null): void;
    /**
     * Set active state
     */
    setIsActive(active: boolean): void;
    /**
     * Add a user to the current list
     */
    addUser(user: VisibilityUser): void;
    /**
     * Remove a user from the current list
     */
    removeUser(userId: string): void;
    /**
     * Update a user in the current list
     */
    updateUser(userId: string, updates: Partial<VisibilityUser>): void;
    /**
     * Clear all users
     */
    clearUsers(): void;
    /**
     * Subscribe to state changes
     * @returns Unsubscribe function
     */
    subscribe(callback: (state: VisibilityState) => void): () => void;
    /**
     * Get state snapshot
     */
    getSnapshot(): VisibilityStateSnapshot;
    /**
     * Notify all subscribers of state change
     */
    private notify;
    /**
     * Reset state to initial values
     */
    reset(): void;
}
/**
 * Singleton instance for global state access
 * TODO: Phase 2 - Consider dependency injection instead
 */
export declare const visibilityStateInstance: VisibilityState;
//# sourceMappingURL=VisibilityState.d.ts.map
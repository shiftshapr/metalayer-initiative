/**
 * USER MODULE - User State Management
 * TypeScript + ES6 Module for current user state
 */
import { User } from '../types/index.js';
/**
 * Get the current authenticated user
 */
export declare function getCurrentUser(): User | null;
/**
 * Set the current authenticated user
 * Automatically normalizes Supabase user_metadata fields to standardized format
 */
export declare function setCurrentUser(user: User | any | null): void;
/**
 * Check if user is authenticated
 */
export declare function isAuthenticated(): boolean;
//# sourceMappingURL=UserModule.d.ts.map
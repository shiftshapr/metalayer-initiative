/**
 * AUTH PROVIDER
 * Central authentication provider that manages multiple auth adapters
 * Supports Web3Auth, DWeb (Mastodon, ActivityPub, AT Protocol, Nostr), and SSO
 */
import type { AuthAdapter, AuthResult, AuthAdapterConfig } from './AuthAdapter.js';
import type { User } from '../../types/index.js';
/**
 * Auth provider class
 */
export declare class AuthProvider {
    private adapters;
    private currentAdapter;
    private initialized;
    /**
     * Register an auth adapter
     */
    registerAdapter(adapter: AuthAdapter): void;
    /**
     * Initialize all registered adapters
     */
    initialize(configs: AuthAdapterConfig[]): Promise<void>;
    /**
     * Set the current auth adapter
     */
    setAdapter(providerName: string): boolean;
    /**
     * Get current auth adapter
     */
    getCurrentAdapter(): AuthAdapter | null;
    /**
     * Get all available adapters
     */
    getAvailableAdapters(): AuthAdapter[];
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): Promise<boolean>;
    /**
     * Get current authenticated user
     */
    getCurrentUser(): Promise<User | null>;
    /**
     * Sign in with current adapter
     */
    signIn(options?: Record<string, unknown>): Promise<AuthResult>;
    /**
     * Sign out from current adapter
     */
    signOut(): Promise<void>;
    /**
     * Check if Web3Auth SDK is available
     */
    private isWeb3AuthAvailable;
}
export declare const authProviderInstance: AuthProvider;
//# sourceMappingURL=AuthProvider.d.ts.map
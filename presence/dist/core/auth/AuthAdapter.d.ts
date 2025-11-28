/**
 * AUTH ADAPTER INTERFACE
 * Loosely coupled authentication adapter interface
 * Supports multiple auth providers: Web3Auth, DWeb (Mastodon, ActivityPub, AT Protocol, Nostr), SSO
 */
import type { User } from '../../types/index.js';
/**
 * Authentication result
 */
export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
    provider?: string;
}
/**
 * User information from auth provider
 */
export interface AuthUserInfo {
    id: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    provider: string;
    providerId?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Authentication adapter interface
 * All auth providers must implement this interface
 */
export interface AuthAdapter {
    /**
     * Initialize the auth adapter
     */
    initialize(): Promise<void>;
    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): Promise<boolean>;
    /**
     * Get current authenticated user
     */
    getCurrentUser(): Promise<User | null>;
    /**
     * Sign in with the auth provider
     * @param options Provider-specific options
     */
    signIn(options?: Record<string, unknown>): Promise<AuthResult>;
    /**
     * Sign out from the auth provider
     */
    signOut(): Promise<void>;
    /**
     * Get provider name
     */
    getProviderName(): string;
    /**
     * Check if this adapter is available/configured
     */
    isAvailable(): boolean;
    /**
     * Get provider-specific metadata
     */
    getMetadata(): Record<string, unknown>;
}
/**
 * Auth adapter configuration
 */
export interface AuthAdapterConfig {
    provider: string;
    enabled: boolean;
    config: Record<string, unknown>;
}
//# sourceMappingURL=AuthAdapter.d.ts.map
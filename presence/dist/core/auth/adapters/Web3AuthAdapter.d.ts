/**
 * WEB3AUTH ADAPTER
 * Web3Auth authentication adapter implementation
 */
import type { AuthAdapter, AuthResult } from '../AuthAdapter.js';
import type { User } from '../../../types/index.js';
/**
 * Web3Auth configuration
 */
export interface Web3AuthConfig {
    clientId: string;
    web3AuthNetwork?: 'sapphire_mainnet' | 'sapphire_devnet' | 'cyan' | 'testnet';
    chainConfig?: {
        chainNamespace: string;
        chainId: string;
        rpcTarget: string;
        displayName?: string;
        blockExplorerUrl?: string;
        ticker?: string;
        tickerName?: string;
    };
    uiConfig?: {
        theme?: 'light' | 'dark' | 'auto';
        loginMethodsOrder?: string[];
        defaultLanguage?: string;
        modalZIndex?: string;
    };
}
/**
 * Web3Auth adapter implementation
 */
export declare class Web3AuthAdapter implements AuthAdapter {
    private web3auth;
    private provider;
    private config;
    private isInitialized;
    constructor(config: Web3AuthConfig);
    /**
     * Initialize Web3Auth
     */
    initialize(): Promise<void>;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): Promise<boolean>;
    /**
     * Get current authenticated user
     */
    getCurrentUser(): Promise<User | null>;
    /**
     * Sign in with Web3Auth
     */
    signIn(_options?: Record<string, unknown>): Promise<AuthResult>;
    /**
     * Sign out from Web3Auth
     */
    signOut(): Promise<void>;
    /**
     * Get provider name
     */
    getProviderName(): string;
    /**
     * Check if Web3Auth is available
     */
    isAvailable(): boolean;
    /**
     * Get provider metadata
     */
    getMetadata(): Record<string, unknown>;
}
//# sourceMappingURL=Web3AuthAdapter.d.ts.map
/**
 * Base class for all platform adapters
 * Provides common functionality and enforces interface
 */
import { PlatformAdapter, Message, ShareOptions, ShareResult, OAuthToken, ConnectionStatus } from '../../core/ShareTypes';
export declare abstract class BasePlatformAdapter implements PlatformAdapter {
    abstract id: string;
    abstract name: string;
    abstract icon: string;
    abstract requiresOAuth: boolean;
    protected apiBaseUrl: string;
    protected oauthScopes: string[];
    constructor(config?: {
        apiBaseUrl?: string;
        oauthScopes?: string[];
    });
    /**
     * Share message - main entry point
     * Automatically chooses OAuth or URL method
     */
    share(message: Message, options?: ShareOptions): Promise<ShareResult>;
    /**
     * Share using OAuth API
     * Must be implemented by each platform
     */
    abstract shareWithOAuth(message: Message, token: string, options?: ShareOptions): Promise<ShareResult>;
    /**
     * Share using URL (fallback method)
     * Can be overridden for custom URL formatting
     */
    shareWithURL(message: Message, options?: ShareOptions): Promise<ShareResult>;
    /**
     * Build share URL for platform
     * Override for custom URL formatting
     */
    protected buildShareUrl(message: Message, options?: ShareOptions): string;
    /**
     * Format text for sharing
     * Override for platform-specific formatting
     */
    protected formatShareText(message: Message, options?: ShareOptions): string;
    /**
     * Get share URL template
     * Override with platform-specific template
     */
    protected abstract getShareUrlTemplate(): string;
    /**
     * OAuth methods - must be implemented
     */
    abstract getOAuthUrl(state?: string): string;
    abstract handleOAuthCallback(code: string, state?: string): Promise<OAuthToken>;
    abstract refreshToken(token: string): Promise<OAuthToken>;
    /**
     * Connection status methods
     */
    abstract isConnected(): Promise<boolean>;
    abstract getConnectionStatus(): Promise<ConnectionStatus>;
    /**
     * Token storage helpers
     */
    protected getStoredToken(): Promise<OAuthToken | null>;
    protected storeToken(token: OAuthToken): Promise<void>;
    protected removeToken(): Promise<void>;
    /**
     * Validate token expiry
     */
    protected isTokenExpired(token: OAuthToken): boolean;
}
//# sourceMappingURL=BasePlatformAdapter.d.ts.map
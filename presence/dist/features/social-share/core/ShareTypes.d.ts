/**
 * TypeScript types for Social Share Module
 */
export interface Message {
    id: string;
    body: string;
    author: {
        id: string;
        name: string;
        handle?: string;
        avatarUrl?: string;
    };
    createdAt: string;
    conversationId?: string;
    pageUrl?: string;
    shareUrl?: string;
}
export interface ShareOptions {
    includeAuthor?: boolean;
    includeContext?: boolean;
    customText?: string;
    mediaUrl?: string;
    tags?: string[];
}
export interface ShareResult {
    success: boolean;
    platformId: string;
    shareUrl?: string;
    postId?: string;
    error?: string;
    timestamp: Date;
}
export interface OAuthToken {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    tokenType?: string;
    scope?: string[];
}
export interface OAuthResult {
    success: boolean;
    token?: OAuthToken;
    error?: string;
}
export interface ConnectionStatus {
    platformId: string;
    connected: boolean;
    connectedAt?: Date;
    expiresAt?: Date;
    username?: string;
    avatarUrl?: string;
}
export interface PlatformConfig {
    id: string;
    name: string;
    icon: string;
    color?: string;
    requiresOAuth: boolean;
    oauthScopes?: string[];
    shareUrlTemplate?: string;
    apiBaseUrl?: string;
    enabled: boolean;
}
export interface ShareAnalytics {
    platformId: string;
    messageId: string;
    userId: string;
    timestamp: Date;
    method: 'oauth' | 'url' | 'api';
    success: boolean;
}
export interface PlatformAdapter {
    id: string;
    name: string;
    icon: string;
    requiresOAuth: boolean;
    share(message: Message, options?: ShareOptions): Promise<ShareResult>;
    shareWithOAuth(message: Message, token: string, options?: ShareOptions): Promise<ShareResult>;
    shareWithURL(message: Message, options?: ShareOptions): Promise<ShareResult>;
    getOAuthUrl(state?: string): string;
    handleOAuthCallback(code: string, state?: string): Promise<OAuthToken>;
    refreshToken(token: string): Promise<OAuthToken>;
    isConnected(): Promise<boolean>;
    getConnectionStatus(): Promise<ConnectionStatus>;
}
//# sourceMappingURL=ShareTypes.d.ts.map
/**
 * Base class for all platform adapters
 * Provides common functionality and enforces interface
 */
import { handleError } from '../../../../utils/ErrorHandler.js';
export class BasePlatformAdapter {
    constructor(config = {}) {
        this.oauthScopes = [];
        this.apiBaseUrl = config.apiBaseUrl || '';
        this.oauthScopes = config.oauthScopes || [];
    }
    /**
     * Share message - main entry point
     * Automatically chooses OAuth or URL method
     */
    async share(message, options) {
        try {
            const isConnected = await this.isConnected();
            if (isConnected && this.requiresOAuth) {
                const token = await this.getStoredToken();
                if (token) {
                    return this.shareWithOAuth(message, token.accessToken, options);
                }
            }
            // Fallback to URL share
            return this.shareWithURL(message, options);
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'share',
                    component: 'BasePlatformAdapter',
                    platformId: this.id
                }
            });
            return {
                success: false,
                platformId: this.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
    /**
     * Share using URL (fallback method)
     * Can be overridden for custom URL formatting
     */
    async shareWithURL(message, options) {
        const shareUrl = this.buildShareUrl(message, options);
        // Open in new window/tab
        if (typeof window !== 'undefined') {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
        return {
            success: true,
            platformId: this.id,
            shareUrl,
            timestamp: new Date()
        };
    }
    /**
     * Build share URL for platform
     * Override for custom URL formatting
     */
    buildShareUrl(message, options) {
        const text = this.formatShareText(message, options);
        const url = message.shareUrl || message.pageUrl || '';
        // Default URL encoding
        return `${this.getShareUrlTemplate()}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }
    /**
     * Format text for sharing
     * Override for platform-specific formatting
     */
    formatShareText(message, options) {
        if (options?.customText) {
            return options.customText;
        }
        let text = message.body;
        if (options?.includeAuthor && message.author) {
            const authorName = message.author.name || message.author.handle || 'Someone';
            text = `${authorName}: ${text}`;
        }
        return text;
    }
    /**
     * Token storage helpers
     */
    async getStoredToken() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                chrome.storage.local.get([`oauth_token_${this.id}`], (result) => {
                    const token = result[`oauth_token_${this.id}`];
                    resolve(token || null);
                });
            }
            else {
                resolve(null);
            }
        });
    }
    async storeToken(token) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                chrome.storage.local.set({
                    [`oauth_token_${this.id}`]: token
                }, () => resolve());
            }
            else {
                resolve();
            }
        });
    }
    async removeToken() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                chrome.storage.local.remove([`oauth_token_${this.id}`], () => resolve());
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Validate token expiry
     */
    isTokenExpired(token) {
        if (!token.expiresAt)
            return false;
        return new Date(token.expiresAt) < new Date();
    }
}

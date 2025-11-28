/**
 * Base class for all platform adapters
 * Provides common functionality and enforces interface
 */

import { 
  PlatformAdapter, 
  Message, 
  ShareOptions, 
  ShareResult, 
  OAuthToken, 
  ConnectionStatus 
} from '../../core/ShareTypes';
import { handleError } from '../../../../utils/ErrorHandler.js';

export abstract class BasePlatformAdapter implements PlatformAdapter {
  abstract id: string;
  abstract name: string;
  abstract icon: string;
  abstract requiresOAuth: boolean;
  
  protected apiBaseUrl: string;
  protected oauthScopes: string[] = [];
  
  constructor(config: {
    apiBaseUrl?: string;
    oauthScopes?: string[];
  } = {}) {
    this.apiBaseUrl = config.apiBaseUrl || '';
    this.oauthScopes = config.oauthScopes || [];
  }

  /**
   * Share message - main entry point
   * Automatically chooses OAuth or URL method
   */
  async share(message: Message, options?: ShareOptions): Promise<ShareResult> {
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
    } catch (error: unknown) {
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
   * Share using OAuth API
   * Must be implemented by each platform
   */
  abstract shareWithOAuth(
    message: Message, 
    token: string, 
    options?: ShareOptions
  ): Promise<ShareResult>;

  /**
   * Share using URL (fallback method)
   * Can be overridden for custom URL formatting
   */
  async shareWithURL(message: Message, options?: ShareOptions): Promise<ShareResult> {
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
  protected buildShareUrl(message: Message, options?: ShareOptions): string {
    const text = this.formatShareText(message, options);
    const url = message.shareUrl || message.pageUrl || '';
    
    // Default URL encoding
    return `${this.getShareUrlTemplate()}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  }

  /**
   * Format text for sharing
   * Override for platform-specific formatting
   */
  protected formatShareText(message: Message, options?: ShareOptions): string {
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
  protected async getStoredToken(): Promise<OAuthToken | null> {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get([`oauth_token_${this.id}`], (result) => {
          const token = result[`oauth_token_${this.id}`] as OAuthToken | undefined;
          resolve(token || null);
        });
      } else {
        resolve(null);
      }
    });
  }

  protected async storeToken(token: OAuthToken): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({
          [`oauth_token_${this.id}`]: token
        }, () => resolve());
      } else {
        resolve();
      }
    });
  }

  protected async removeToken(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.remove([`oauth_token_${this.id}`], () => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Validate token expiry
   */
  protected isTokenExpired(token: OAuthToken): boolean {
    if (!token.expiresAt) return false;
    return new Date(token.expiresAt) < new Date();
  }
}



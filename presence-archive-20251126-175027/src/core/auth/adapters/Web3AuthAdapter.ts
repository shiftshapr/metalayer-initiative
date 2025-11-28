/**
 * WEB3AUTH ADAPTER
 * Web3Auth authentication adapter implementation
 */

import type { AuthAdapter, AuthResult, AuthUserInfo } from '../AuthAdapter.js';
import type { User } from '../../../types/index.js';
import { Logger } from '../../../utils/Logger.js';

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
export class Web3AuthAdapter implements AuthAdapter {
  private web3auth: unknown | null = null;
  private provider: unknown | null = null;
  private config: Web3AuthConfig;
  private isInitialized: boolean = false;

  constructor(config: Web3AuthConfig) {
    this.config = config;
  }

  /**
   * Initialize Web3Auth
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      Logger.debug('Web3Auth already initialized', null, 'auth');
      return;
    }

    try {
      // Check if Web3Auth is available
      if (typeof window === 'undefined' || !(window as Window & { Web3AuthModal?: unknown }).Web3AuthModal) {
        Logger.error('Web3AuthModal not available. Make sure the Web3Auth SDK is loaded.', null, 'auth');
        throw new Error('Web3AuthModal not available');
      }

      const Web3AuthModal = (window as unknown as Window & { Web3AuthModal: { Web3Auth: new (config: unknown) => unknown } }).Web3AuthModal;

      // Initialize Web3Auth with production network
      // chainNamespace: 'eip155' = Ethereum/EVM chains (supports Ethereum, Polygon, BSC, Arbitrum, Base, etc.)
      // For Solana, use chainNamespace: 'solana' and chainId: 'mainnet-beta'
      this.web3auth = new Web3AuthModal.Web3Auth({
        clientId: this.config.clientId,
        web3AuthNetwork: this.config.web3AuthNetwork || 'sapphire_mainnet',
        chainConfig: this.config.chainConfig || {
          chainNamespace: 'eip155', // Ethereum/EVM namespace - supports all EVM-compatible chains
          chainId: '0x1', // Ethereum Mainnet (0x89 = Polygon, 0x38 = BSC, 0xa4b1 = Arbitrum, etc.)
          rpcTarget: 'https://rpc.ankr.com/eth',
          displayName: 'Ethereum Mainnet',
          blockExplorerUrl: 'https://etherscan.io',
          ticker: 'ETH',
          tickerName: 'Ethereum',
        },
        uiConfig: this.config.uiConfig || {
          theme: 'light',
          loginMethodsOrder: ['google', 'facebook', 'twitter', 'github', 'discord', 'email_passwordless'],
          defaultLanguage: 'en',
          modalZIndex: '2147483647',
        },
      });

      // Initialize modal
      if (this.web3auth && typeof (this.web3auth as { initModal: () => Promise<void> }).initModal === 'function') {
        await (this.web3auth as { initModal: () => Promise<void> }).initModal();
      }

      this.isInitialized = true;
      Logger.debug('Web3Auth initialized successfully', null, 'auth');
    } catch (error: unknown) {
      Logger.error('Failed to initialize Web3Auth', error, 'auth');
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    if (!this.web3auth) {
      return false;
    }

    try {
      const connected = (this.web3auth as { connected?: boolean }).connected || false;
      return connected;
    } catch (error: unknown) {
      Logger.error('Error checking authentication status', error, 'auth');
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.web3auth) {
      return null;
    }

    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        return null;
      }

      // Get user info from Web3Auth
      const userInfo = await (this.web3auth as { getUserInfo: () => Promise<AuthUserInfo> }).getUserInfo();

      // Get wallet address
      let walletAddress: string | null = null;
      if (this.provider) {
        try {
          const accounts = await (this.provider as { request: (params: { method: string }) => Promise<string[]> }).request({
            method: 'eth_accounts',
          });
          walletAddress = accounts[0] || null;
        } catch (error: unknown) {
          Logger.warn('Could not get wallet address', error, 'auth');
        }
      }

      // Convert to User type
      const user: User = {
        id: userInfo.id || userInfo.providerId || '',
        email: userInfo.email || undefined,
        name: userInfo.name || undefined,
        avatarUrl: userInfo.avatarUrl || undefined,
        // Store provider info in metadata
        metadata: {
          provider: 'web3auth',
          providerId: userInfo.providerId,
          typeOfLogin: (userInfo.metadata as { typeOfLogin?: string })?.typeOfLogin,
          walletAddress: walletAddress,
          ...userInfo.metadata,
        },
      };

      return user;
    } catch (error: unknown) {
      Logger.error('Error getting current user', error, 'auth');
      return null;
    }
  }

  /**
   * Sign in with Web3Auth
   */
  async signIn(_options?: Record<string, unknown>): Promise<AuthResult> {
    if (!this.web3auth) {
      return {
        success: false,
        error: 'Web3Auth not initialized',
        provider: 'web3auth',
      };
    }

    try {
      // Connect to Web3Auth
      this.provider = await (this.web3auth as { connect: () => Promise<unknown> }).connect();

      if (!this.provider) {
        return {
          success: false,
          error: 'Failed to connect to Web3Auth',
          provider: 'web3auth',
        };
      }

      // Get user info
      const user = await this.getCurrentUser();

      if (!user) {
        return {
          success: false,
          error: 'Failed to get user information',
          provider: 'web3auth',
        };
      }

      Logger.debug('Web3Auth sign in successful', { email: user.email }, 'auth');

      return {
        success: true,
        user,
        provider: 'web3auth',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('Web3Auth sign in error', error, 'auth');

      return {
        success: false,
        error: errorMessage,
        provider: 'web3auth',
      };
    }
  }

  /**
   * Sign out from Web3Auth
   */
  async signOut(): Promise<void> {
    if (!this.web3auth) {
      return;
    }

    try {
      await (this.web3auth as { logout: () => Promise<void> }).logout();
      this.provider = null;
      Logger.debug('Web3Auth sign out successful', null, 'auth');
    } catch (error: unknown) {
      Logger.error('Web3Auth sign out error', error, 'auth');
      throw error;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'web3auth';
  }

  /**
   * Check if Web3Auth is available
   */
  isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof (window as Window & { Web3AuthModal?: unknown }).Web3AuthModal !== 'undefined'
    );
  }

  /**
   * Get provider metadata
   */
  getMetadata(): Record<string, unknown> {
    return {
      provider: 'web3auth',
      network: this.config.web3AuthNetwork || 'sapphire_mainnet',
      chainId: this.config.chainConfig?.chainId,
      isInitialized: this.isInitialized,
    };
  }
}


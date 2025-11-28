/**
 * AUTH CONFIGURATION
 * Configuration for authentication adapters
 */

import type { AuthAdapterConfig } from './AuthAdapter.js';
import type { Web3AuthConfig } from './adapters/Web3AuthAdapter.js';

/**
 * Get auth adapter configurations
 * This can be loaded from environment variables or a config file
 */
export function getAuthConfigs(): AuthAdapterConfig[] {
  const configs: AuthAdapterConfig[] = [];

  // Web3Auth configuration
  // Get client ID from environment or config
  // In production, this should come from environment variables
  const web3AuthClientId =
    (typeof window !== 'undefined' &&
      (window as Window & { CANOPI_WEB3AUTH_CLIENT_ID?: string }).CANOPI_WEB3AUTH_CLIENT_ID) ||
    process.env.WEB3AUTH_CLIENT_ID ||
    '';

  if (web3AuthClientId) {
    const web3AuthConfig: Web3AuthConfig = {
      clientId: web3AuthClientId,
      web3AuthNetwork: 'sapphire_mainnet', // Production network
      chainConfig: {
        chainNamespace: 'eip155',
        chainId: '0x1', // Ethereum Mainnet
        rpcTarget: 'https://rpc.ankr.com/eth',
        displayName: 'Ethereum Mainnet',
        blockExplorerUrl: 'https://etherscan.io',
        ticker: 'ETH',
        tickerName: 'Ethereum',
      },
      uiConfig: {
        theme: 'light',
        loginMethodsOrder: ['google', 'facebook', 'twitter', 'github', 'discord', 'email_passwordless'],
        defaultLanguage: 'en',
        modalZIndex: '2147483647',
      },
    };

    configs.push({
      provider: 'web3auth',
      enabled: true,
      config: web3AuthConfig as unknown as Record<string, unknown>,
    });
  }

  // Future: Add other auth providers here
  // Mastodon, ActivityPub, AT Protocol, Nostr, SSO, etc.

  return configs;
}


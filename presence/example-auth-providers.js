// Example Auth Providers - Demonstrating the flexibility of the loosely coupled system

// GitHub Auth Provider Example
class GitHubAuthProvider extends BaseAuthProvider {
  constructor() {
    super('github');
    this.clientId = 'your-github-client-id';
  }

  async initialize() {
    // Initialize GitHub OAuth
    this.initialized = true;
    console.log('GitHub auth provider initialized');
    return true;
  }

  async signIn(method, ...args) {
    if (!this.initialized) throw new Error('Provider not initialized');

    switch (method) {
      case 'oauth':
        return await this.signInWithOAuth();
      default:
        throw new Error(`Unsupported sign-in method: ${method}`);
    }
  }

  async signInWithOAuth() {
    // GitHub OAuth implementation
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=user:email`;
    
    // Open OAuth popup
    const result = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    });

    // Exchange code for token
    const token = await this.exchangeCodeForToken(result);
    
    // Get user info
    const user = await this.getUserInfo(token);
    
    return { user, session: { access_token: token } };
  }

  async exchangeCodeForToken(code) {
    // Implementation to exchange OAuth code for access token
    return 'github-access-token';
  }

  async getUserInfo(token) {
    // Implementation to get user info from GitHub API
    return {
      id: 'github-user-id',
      email: 'user@example.com',
      user_metadata: { full_name: 'GitHub User' }
    };
  }

  async signOut() {
    // GitHub doesn't require server-side sign out
    console.log('GitHub sign out');
  }

  async getCurrentUser() {
    // Check if user is still authenticated
    return null; // Simplified
  }

  getAvailableMethods() {
    return ['oauth'];
  }
}

// Discord Auth Provider Example
class DiscordAuthProvider extends BaseAuthProvider {
  constructor() {
    super('discord');
    this.clientId = 'your-discord-client-id';
  }

  async initialize() {
    this.initialized = true;
    console.log('Discord auth provider initialized');
    return true;
  }

  async signIn(method, ...args) {
    if (!this.initialized) throw new Error('Provider not initialized');

    switch (method) {
      case 'oauth':
        return await this.signInWithOAuth();
      default:
        throw new Error(`Unsupported sign-in method: ${method}`);
    }
  }

  async signInWithOAuth() {
    // Discord OAuth implementation
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL())}&response_type=code&scope=identify%20email`;
    
    const result = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    });

    const token = await this.exchangeCodeForToken(result);
    const user = await this.getUserInfo(token);
    
    return { user, session: { access_token: token } };
  }

  async exchangeCodeForToken(code) {
    return 'discord-access-token';
  }

  async getUserInfo(token) {
    return {
      id: 'discord-user-id',
      email: 'user@example.com',
      user_metadata: { full_name: 'Discord User' }
    };
  }

  async signOut() {
    console.log('Discord sign out');
  }

  async getCurrentUser() {
    return null;
  }

  getAvailableMethods() {
    return ['oauth'];
  }
}

// Web3/Wallet Auth Provider Example
class Web3AuthProvider extends BaseAuthProvider {
  constructor() {
    super('web3');
  }

  async initialize() {
    // Check if Web3 is available
    if (typeof window.ethereum !== 'undefined') {
      this.initialized = true;
      console.log('Web3 auth provider initialized');
      return true;
    }
    throw new Error('Web3 not available');
  }

  async signIn(method, ...args) {
    if (!this.initialized) throw new Error('Provider not initialized');

    switch (method) {
      case 'wallet':
        return await this.signInWithWallet();
      case 'signature':
        const [message] = args;
        return await this.signInWithSignature(message);
      default:
        throw new Error(`Unsupported sign-in method: ${method}`);
    }
  }

  async signInWithWallet() {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];
    
    // Get account balance and other info
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });

    return {
      user: {
        id: address,
        email: `${address}@wallet`,
        user_metadata: { 
          full_name: `Wallet User ${address.slice(0, 6)}...`,
          wallet_address: address,
          balance: balance
        }
      },
      session: { wallet_address: address }
    };
  }

  async signInWithSignature(message) {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]]
    });

    return {
      user: {
        id: accounts[0],
        email: `${accounts[0]}@wallet`,
        user_metadata: { 
          full_name: `Wallet User ${accounts[0].slice(0, 6)}...`,
          wallet_address: accounts[0]
        }
      },
      session: { 
        wallet_address: accounts[0],
        signature: signature
      }
    };
  }

  async signOut() {
    // Web3 doesn't require server-side sign out
    console.log('Web3 sign out');
  }

  async getCurrentUser() {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });
      
      if (accounts.length > 0) {
        return {
          id: accounts[0],
          email: `${accounts[0]}@wallet`,
          user_metadata: { 
            full_name: `Wallet User ${accounts[0].slice(0, 6)}...`,
            wallet_address: accounts[0]
          }
        };
      }
    } catch (error) {
      console.error('Error getting Web3 user:', error);
    }
    return null;
  }

  getAvailableMethods() {
    return ['wallet', 'signature'];
  }
}

// Usage Example:
/*
// To add these providers to your auth manager:

// Register new providers
authManager.registerProvider('github', new GitHubAuthProvider());
authManager.registerProvider('discord', new DiscordAuthProvider());
authManager.registerProvider('web3', new Web3AuthProvider());

// Switch to a different provider
await authManager.setProvider('github');

// Use the new provider
await authManager.signIn('oauth');

// Or switch to Web3
await authManager.setProvider('web3');
await authManager.signIn('wallet');
*/

// Export for use
window.GitHubAuthProvider = GitHubAuthProvider;
window.DiscordAuthProvider = DiscordAuthProvider;
window.Web3AuthProvider = Web3AuthProvider;

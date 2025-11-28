/**
 * AUTH PROVIDER
 * Central authentication provider that manages multiple auth adapters
 * Supports Web3Auth, DWeb (Mastodon, ActivityPub, AT Protocol, Nostr), and SSO
 */
import { Web3AuthAdapter } from './adapters/Web3AuthAdapter.js';
import { Logger } from '../../utils/Logger.js';
import { stateManagerInstance } from '../StateManager.js';
/**
 * Auth provider class
 */
export class AuthProvider {
    constructor() {
        this.adapters = new Map();
        this.currentAdapter = null;
        this.initialized = false;
    }
    /**
     * Register an auth adapter
     */
    registerAdapter(adapter) {
        const providerName = adapter.getProviderName();
        this.adapters.set(providerName, adapter);
        Logger.debug(`Registered auth adapter: ${providerName}`, null, 'auth');
    }
    /**
     * Initialize all registered adapters
     */
    async initialize(configs) {
        if (this.initialized) {
            Logger.debug('AuthProvider already initialized', null, 'auth');
            return;
        }
        try {
            // Register adapters based on config
            for (const config of configs) {
                if (!config.enabled) {
                    continue;
                }
                let adapter = null;
                switch (config.provider) {
                    case 'web3auth': {
                        if (this.isWeb3AuthAvailable()) {
                            adapter = new Web3AuthAdapter(config.config);
                            this.registerAdapter(adapter);
                        }
                        else {
                            Logger.warn('Web3Auth adapter requested but SDK not available', null, 'auth');
                        }
                        break;
                    }
                    // Future adapters:
                    // case 'mastodon':
                    //   adapter = new MastodonAdapter(config.config);
                    //   break;
                    // case 'nostr':
                    //   adapter = new NostrAdapter(config.config);
                    //   break;
                    // case 'atprotocol':
                    //   adapter = new ATProtocolAdapter(config.config);
                    //   break;
                    // case 'activitypub':
                    //   adapter = new ActivityPubAdapter(config.config);
                    //   break;
                    // case 'sso':
                    //   adapter = new SSOAdapter(config.config);
                    //   break;
                    default:
                        Logger.warn(`Unknown auth provider: ${config.provider}`, null, 'auth');
                }
            }
            // Initialize all adapters
            for (const [name, adapter] of Array.from(this.adapters.entries())) {
                try {
                    if (adapter.isAvailable()) {
                        await adapter.initialize();
                        Logger.debug(`Initialized auth adapter: ${name}`, null, 'auth');
                    }
                    else {
                        Logger.warn(`Auth adapter ${name} is not available`, null, 'auth');
                    }
                }
                catch (error) {
                    Logger.error(`Failed to initialize auth adapter: ${name}`, error, 'auth');
                }
            }
            // Set default adapter (first available)
            if (this.adapters.size > 0) {
                const firstAdapter = Array.from(this.adapters.values())[0];
                if (firstAdapter && firstAdapter.isAvailable()) {
                    this.currentAdapter = firstAdapter;
                    Logger.debug(`Set default auth adapter: ${firstAdapter.getProviderName()}`, null, 'auth');
                }
            }
            this.initialized = true;
            Logger.debug('AuthProvider initialized successfully', null, 'auth');
        }
        catch (error) {
            Logger.error('Failed to initialize AuthProvider', error, 'auth');
            throw error;
        }
    }
    /**
     * Set the current auth adapter
     */
    setAdapter(providerName) {
        const adapter = this.adapters.get(providerName);
        if (adapter && adapter.isAvailable()) {
            this.currentAdapter = adapter;
            Logger.debug(`Switched to auth adapter: ${providerName}`, null, 'auth');
            return true;
        }
        Logger.warn(`Auth adapter not found or not available: ${providerName}`, null, 'auth');
        return false;
    }
    /**
     * Get current auth adapter
     */
    getCurrentAdapter() {
        return this.currentAdapter;
    }
    /**
     * Get all available adapters
     */
    getAvailableAdapters() {
        return Array.from(this.adapters.values()).filter((adapter) => adapter.isAvailable());
    }
    /**
     * Check if user is authenticated
     */
    async isAuthenticated() {
        if (!this.currentAdapter) {
            return false;
        }
        try {
            return await this.currentAdapter.isAuthenticated();
        }
        catch (error) {
            Logger.error('Error checking authentication', error, 'auth');
            return false;
        }
    }
    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        if (!this.currentAdapter) {
            return null;
        }
        try {
            const user = await this.currentAdapter.getCurrentUser();
            // Update state manager
            if (user) {
                stateManagerInstance.setState('currentUser', user);
            }
            else {
                stateManagerInstance.setState('currentUser', null);
            }
            return user;
        }
        catch (error) {
            Logger.error('Error getting current user', error, 'auth');
            return null;
        }
    }
    /**
     * Sign in with current adapter
     */
    async signIn(options) {
        if (!this.currentAdapter) {
            return {
                success: false,
                error: 'No auth adapter available',
            };
        }
        try {
            const result = await this.currentAdapter.signIn(options);
            // Update state manager on success
            if (result.success && result.user) {
                stateManagerInstance.setState('currentUser', result.user);
            }
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            Logger.error('Sign in error', error, 'auth');
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    /**
     * Sign out from current adapter
     */
    async signOut() {
        if (!this.currentAdapter) {
            return;
        }
        try {
            await this.currentAdapter.signOut();
            stateManagerInstance.setState('currentUser', null);
            Logger.debug('Sign out successful', null, 'auth');
        }
        catch (error) {
            Logger.error('Sign out error', error, 'auth');
            throw error;
        }
    }
    /**
     * Check if Web3Auth SDK is available
     */
    isWeb3AuthAvailable() {
        return (typeof window !== 'undefined' &&
            typeof window.Web3AuthModal !== 'undefined');
    }
}
// Create singleton instance
export const authProviderInstance = new AuthProvider();
//# sourceMappingURL=AuthProvider.js.map
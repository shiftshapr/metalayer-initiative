/**
 * COMMUNITIES MODULE - Community Management
 *
 * Class-based module for managing community initialization and state.
 * Provides centralized community lifecycle management.
 */
import { updateCommunityDropdown, initializeCommunityDropdownHandler, getPrimaryCommunityName } from './CommunityHelpers.js';
import { loadCommunities } from './CommunityLoaders.js';
import { Logger } from '../utils/Logger.js';
import { handleError } from '../utils/ErrorHandler.js';
import { setState } from '../core/StateManager.js';
export class CommunitiesModule {
    constructor() {
        this.initialized = false;
        this.communities = [];
    }
    /**
     * Initialize the communities module
     */
    async initialize() {
        if (this.initialized) {
            Logger.info('CommunitiesModule already initialized', null, 'community');
            return;
        }
        try {
            Logger.info('🔄 COMMUNITIES: Initializing CommunitiesModule...', null, 'community');
            // Initialize community dropdown event handlers
            initializeCommunityDropdownHandler();
            // Load communities from API and update UI
            this.communities = await loadCommunities();
            await this.initializeUI();
            this.initialized = true;
            Logger.info('✅ COMMUNITIES: CommunitiesModule initialized successfully', null, 'community');
        }
        catch (error) {
            handleError(error, {
                context: { operation: 'initialize', module: 'CommunitiesModule' },
            });
            throw error; // Re-throw to allow BootController to handle
        }
    }
    /**
     * Initialize the UI after communities are loaded
     */
    async initializeUI() {
        try {
            Logger.debug('🔍 COMMUNITIES: Initializing UI...', null, 'community');
            // Store communities in state
            setState('communities', this.communities);
            // Update the community dropdown UI
            await updateCommunityDropdown(this.communities);
            Logger.info(`✅ COMMUNITIES: UI initialized with ${this.communities.length} communities`, null, 'community');
        }
        catch (error) {
            Logger.error('❌ COMMUNITIES: Failed to initialize UI', error, 'community');
            handleError(error, {
                context: { operation: 'initializeUI', module: 'CommunitiesModule' },
            });
            throw error;
        }
    }
    /**
     * Check if module is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Get loaded communities
     */
    getCommunities() {
        return [...this.communities];
    }
    /**
     * Get primary community name
     */
    async getPrimaryCommunityName() {
        return await getPrimaryCommunityName();
    }
    /**
     * Refresh communities from API
     */
    async refreshCommunities() {
        try {
            Logger.debug('🔄 COMMUNITIES: Refreshing communities...', null, 'community');
            this.communities = await loadCommunities();
            await this.initializeUI();
            Logger.info('✅ COMMUNITIES: Communities refreshed successfully', null, 'community');
        }
        catch (error) {
            Logger.error('❌ COMMUNITIES: Failed to refresh communities', error, 'community');
            throw error;
        }
    }
    /**
     * Update community dropdown (delegate to helpers)
     */
    async updateCommunityDropdown(communities) {
        const communitiesToUpdate = communities || this.communities;
        await updateCommunityDropdown(communitiesToUpdate);
    }
}
// Export singleton instance for backward compatibility
export const communitiesModule = new CommunitiesModule();

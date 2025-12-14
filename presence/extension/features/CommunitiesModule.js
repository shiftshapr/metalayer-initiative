/**
 * COMMUNITIES MODULE - Community Management
 * TypeScript + ES6 Module
 * Handles all community functionality
 */
import { Logger } from '../utils/Logger.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { CommunityHelpers } from './CommunityHelpers.js';
import { api } from './APIModule.js';
export class CommunitiesModule {
    constructor() {
        this.isInitialized = false;
        this.logger = Logger;
    }
    /**
     * Initialize the communities module
     */
    async initialize() {
        if (this.isInitialized) {
            this.logger.warn('CommunitiesModule already initialized', null, 'communities');
            return;
        }
        this.logger.info('Initializing CommunitiesModule...', null, 'communities');
        try {
            // Load communities and update UI
            await this.loadAndDisplayCommunities();
            // Initialize community dropdown activation
            this.initializeCommunityDropdown();
            this.isInitialized = true;
            this.logger.info('CommunitiesModule initialized successfully', null, 'communities');
        }
        catch (error) {
            this.logger.error('Failed to initialize CommunitiesModule', error, 'communities');
            throw error;
        }
    }
    /**
     * Load communities from API and update the UI
     */
    async loadAndDisplayCommunities() {
        try {
            this.logger.info('Loading communities...', null, 'communities');
            // Get communities from API
            const response = await api.getCommunities();
            if (response && response.data && response.data.communities) {
                const communities = response.data.communities.map((c) => ({
                    id: c.id,
                    name: c.name,
                    description: c.description,
                    memberCount: c.memberCount,
                    isActive: c.isActive
                }));
                // Store communities in state
                stateManagerInstance.setState('communities', communities);
                // Update the community dropdown UI
                CommunityHelpers.updateCommunityDropdown(communities);
                this.logger.info(`Loaded ${communities.length} communities`, null, 'communities');
            }
            else {
                this.logger.warn('No communities data received', null, 'communities');
            }
        }
        catch (error) {
            this.logger.error('Failed to load communities', error, 'communities');
            // Don't throw - allow initialization to continue with empty communities
        }
    }
    /**
     * Initialize community dropdown event handlers
     */
    initializeCommunityDropdown() {
        this.logger.info('Initializing community dropdown...', null, 'communities');
        const activateDropdown = () => {
            const trigger = document.querySelector('.community-dropdown-trigger');
            const panel = document.getElementById('community-dropdown-panel');
            if (!trigger || !panel) {
                this.logger.warn('Community dropdown trigger or panel not found, retrying...', null, 'communities');
                setTimeout(activateDropdown, 500);
                return;
            }
            // Add click handler to trigger
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            });
            // Add click handler to close button
            const closeBtn = panel.querySelector('.dropdown-header button');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    panel.style.display = 'none';
                });
            }
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!trigger.contains(e.target) && !panel.contains(e.target)) {
                    panel.style.display = 'none';
                }
            });
            this.logger.info('Community dropdown initialized', null, 'communities');
        };
        // Try to activate immediately, retry if elements not ready
        activateDropdown();
    }
    /**
     * Get current communities from state
     */
    getCommunities() {
        return stateManagerInstance.getState('communities') || [];
    }
    /**
     * Get primary (active) community
     */
    getPrimaryCommunity() {
        const communities = this.getCommunities();
        return communities.find(c => c.isActive) || communities[0] || null;
    }
}
// Export singleton instance
let communitiesModuleInstance = null;
export function getCommunitiesModule() {
    if (!communitiesModuleInstance) {
        communitiesModuleInstance = new CommunitiesModule();
    }
    return communitiesModuleInstance;
}
// Export default for convenience
export default getCommunitiesModule();
//# sourceMappingURL=CommunitiesModule.js.map
/**
 * COMMUNITIES MODULE - Community Management
 * TypeScript + ES6 Module
 * Handles all community functionality
 */
declare class CommunitiesModule {
    private logLevel;
    private isInitialized;
    private logger;
    constructor();
    /**
     * Initialize CommunitiesModule
     */
    initialize(): Promise<void>;
    /**
     * Initialize community dropdown activation
     * Ensures community dropdown is properly activated in sidepanel
     * SD3: Integrated from COMMUNITY_DROPDOWN_ACTIVATOR.js
     */
    initializeCommunityDropdown(): void;
    /**
     * Logging utility
     */
    private log;
}
export { CommunitiesModule };
export default CommunitiesModule;
//# sourceMappingURL=CommunitiesModule.d.ts.map
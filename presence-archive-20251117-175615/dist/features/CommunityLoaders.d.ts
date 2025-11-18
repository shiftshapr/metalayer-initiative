/**
 * COMMUNITY LOADERS - Community Data Loading Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */
interface Community {
    id: string;
    name: string;
    description?: string;
    owner?: string;
    admins?: string[];
    members?: string[];
    [key: string]: any;
}
/**
 * Load communities for the current user
 */
export declare function loadCommunities(): Promise<Community[]>;
/**
 * Load combined avatars from multiple communities
 */
export declare function loadCombinedAvatars(communityIds: string[]): Promise<void>;
declare const _default: {
    loadCommunities: typeof loadCommunities;
    loadCombinedAvatars: typeof loadCombinedAvatars;
};
export default _default;
//# sourceMappingURL=CommunityLoaders.d.ts.map
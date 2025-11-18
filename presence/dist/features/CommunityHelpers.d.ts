/**
 * COMMUNITY HELPERS - Community UI Helper Functions
 * TypeScript + ES6 Module
 * Extracted from CommunitiesModule.js for better organization
 */
interface Community {
    id: string;
    name: string;
    description?: string;
    codeOfConduct?: string;
    logoUrl?: string;
    communityLink?: string;
    onboardingInstructions?: string;
    isPublic?: boolean;
    isOpen?: boolean;
    profileLink?: string;
    createdAt?: string;
    updatedAt?: string;
    submittedEmail?: string | null;
    submittedPhone?: string | null;
    purpose?: string | null;
    status?: string;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
    reviewNotes?: string | null;
    meta_domain?: string | null;
}
/**
 * Update community dropdown with list of communities
 */
export declare function updateCommunityDropdown(communities: Community[]): Promise<void>;
/**
 * Update placeholder text with community name
 */
export declare function updatePlaceholderText(communityName: string): void;
/**
 * Get primary community name
 */
export declare function getPrimaryCommunityName(): Promise<string>;
declare const _default: {
    updateCommunityDropdown: typeof updateCommunityDropdown;
    updatePlaceholderText: typeof updatePlaceholderText;
    getPrimaryCommunityName: typeof getPrimaryCommunityName;
};
export default _default;
//# sourceMappingURL=CommunityHelpers.d.ts.map
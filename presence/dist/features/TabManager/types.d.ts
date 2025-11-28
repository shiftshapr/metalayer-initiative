/**
 * Tab Manager Module - Type Definitions
 */
export interface TabConfig {
    id: string;
    label: string;
    icon?: string;
    builtIn: boolean;
    visible: boolean;
    order: number;
    sdkAppId?: string;
    sdkAppVersion?: string;
    tabContentId: string;
    isDeveloperMode?: boolean;
    localPath?: string;
    favorited?: boolean;
}
export interface TabManagerState {
    tabs: TabConfig[];
    visibleTabCount: number;
    userTabLimit: number;
    isModalOpen: boolean;
    currentTab: string | null;
    previousTab: string | null;
}
export interface SDKApp {
    id: string;
    name: string;
    description: string;
    icon?: string;
    version: string;
    developer: string;
    category: string[];
    releaseDate: string;
    lastUpdated: string;
    downloadCount?: number;
    rating?: number;
    reviewCount?: number;
    reviews?: AppReview[];
    manifest: AppManifest;
    installed: boolean;
    isDeveloperMode?: boolean;
    digitalProvenance?: DigitalProvenance;
    favorited?: boolean;
}
export interface AppReview {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    helpfulCount?: number;
    verifiedPurchase?: boolean;
    developerResponse?: {
        content: string;
        createdAt: string;
    };
}
export interface DigitalProvenance {
    verified: boolean;
    verificationMethod: 'signature' | 'hash' | 'blockchain' | 'certificate' | 'none';
    signature?: string;
    hash?: string;
    hashAlgorithm?: string;
    certificate?: {
        issuer: string;
        subject: string;
        validFrom: string;
        validTo: string;
        fingerprint: string;
    };
    blockchainProof?: {
        chain: string;
        transactionHash: string;
        blockNumber: number;
        timestamp: string;
    };
    sourceRepository?: {
        url: string;
        commitHash: string;
        branch: string;
        verified: boolean;
    };
    buildInfo?: {
        buildDate: string;
        buildSystem: string;
        buildHash: string;
    };
    lastVerified: string;
    verifiedBy?: string;
}
export interface AppManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    entryPoint: string;
    permissions?: string[];
    [key: string]: unknown;
}
export interface AppStoreFilters {
    searchQuery?: string;
    categories?: string[];
    sortBy?: 'recent' | 'popular' | 'updated' | 'name';
    developerMode?: boolean;
    favoritesOnly?: boolean;
}
export interface ReviewSubmission {
    appId: string;
    rating: number;
    title?: string;
    content: string;
    verifiedPurchase: boolean;
}
export declare const DEFAULT_TABS: TabConfig[];
export declare const DEFAULT_STATE: TabManagerState;
//# sourceMappingURL=types.d.ts.map
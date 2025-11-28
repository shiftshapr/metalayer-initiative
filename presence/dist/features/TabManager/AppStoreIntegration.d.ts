/**
 * App Store Integration Service
 * Handles SDK app lifecycle, reviews, and digital provenance
 */
import { SDKApp, AppStoreFilters, ReviewSubmission, DigitalProvenance } from './types.js';
import { Logger } from '../../utils/Logger.js';
export declare class AppStoreIntegration {
    private logger;
    private apps;
    constructor(logger?: typeof Logger);
    /**
     * Initialize app store (load apps, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Get all available apps
     */
    getApps(filters?: AppStoreFilters): SDKApp[];
    /**
     * Sort apps
     */
    private sortApps;
    /**
     * Get app by ID
     */
    getAppById(appId: string): SDKApp | undefined;
    /**
     * Install an app
     */
    installApp(appId: string): Promise<void>;
    /**
     * Uninstall an app
     */
    uninstallApp(appId: string): Promise<void>;
    /**
     * Load unpacked app (developer mode)
     */
    loadUnpackedApp(localPath: string): Promise<SDKApp>;
    /**
     * Submit a review
     */
    submitReview(submission: ReviewSubmission): Promise<void>;
    /**
     * Get reviews for an app
     */
    getAppReviews(appId: string, _limit?: number, _offset?: number): Promise<any[]>;
    /**
     * Verify digital provenance
     */
    verifyProvenance(appId: string): Promise<DigitalProvenance | null>;
}
//# sourceMappingURL=AppStoreIntegration.d.ts.map
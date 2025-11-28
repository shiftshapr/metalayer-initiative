/**
 * BUILD TRACKER
 * Tracks build numbers and logs them to help identify if compiled versions are changing
 *
 * Build numbers are:
 * - Incremented during build process (via increment-build.sh)
 * - Injected into the extension at build time
 * - Loaded from .build-info.json or Chrome storage at runtime
 * - Logged to console and .build-log.txt
 */
interface BuildInfo {
    buildNumber: number;
    timestamp: string;
    gitCommit?: string;
    gitBranch?: string;
    version?: string;
    firstBuild?: string;
    lastBuild?: string;
}
declare class BuildTracker {
    private static instance;
    private buildInfo;
    private buildInfoLoaded;
    private constructor();
    static getInstance(): BuildTracker;
    /**
     * Load build info from multiple sources (priority order):
     * 1. Injected build info (from build process)
     * 2. Chrome storage (persists across reloads)
     * 3. Fallback to timestamp-based number
     */
    private loadBuildInfo;
    private tryLoadInjectedBuildInfo;
    private tryLoadBuildInfoFromFile;
    private loadBuildInfoFromChromeStorage;
    private getBuildInfoUrl;
    private persistBuildInfo;
    /**
     * Log build info to console with detailed information
     */
    private logBuildInfo;
    /**
     * Get current build number
     */
    getBuildNumber(): number;
    /**
     * Get build info
     */
    getBuildInfo(): BuildInfo | null;
    /**
     * Check if build info has been loaded
     */
    isLoaded(): boolean;
    /**
     * Get formatted build string for display
     */
    getBuildString(): string;
}
declare const buildTracker: BuildTracker;
export { BuildTracker, buildTracker };
export default BuildTracker;
//# sourceMappingURL=BuildTracker.d.ts.map
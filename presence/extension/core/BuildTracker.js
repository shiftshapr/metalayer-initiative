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
class BuildTracker {
    constructor() {
        this.buildInfo = null;
        this.buildInfoLoaded = false;
        this.loadBuildInfo();
    }
    static getInstance() {
        if (!BuildTracker.instance) {
            BuildTracker.instance = new BuildTracker();
        }
        return BuildTracker.instance;
    }
    /**
     * Load build info from multiple sources (priority order):
     * 1. Injected build info (from build process)
     * 2. Chrome storage (persists across reloads)
     * 3. Fallback to timestamp-based number
     */
    loadBuildInfo() {
        if (this.tryLoadInjectedBuildInfo()) {
            return;
        }
        this.tryLoadBuildInfoFromFile()
            .then((found) => {
            if (found) {
                return;
            }
            this.loadBuildInfoFromChromeStorage();
        })
            .catch(() => {
            this.loadBuildInfoFromChromeStorage();
        });
    }
    tryLoadInjectedBuildInfo() {
        const win = typeof window !== 'undefined' ? window : undefined;
        if (win?.__BUILD_INFO__) {
            this.buildInfo = win.__BUILD_INFO__;
            this.buildInfoLoaded = true;
            this.logBuildInfo();
            return true;
        }
        return false;
    }
    async tryLoadBuildInfoFromFile() {
        try {
            const url = this.getBuildInfoUrl();
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const info = await response.json();
            this.buildInfo = {
                buildNumber: Number(info.buildNumber ?? info.build_number ?? info.build ?? 0),
                timestamp: info.timestamp ?? info.lastBuild ?? new Date().toISOString(),
                gitCommit: info.gitCommit ?? info.git_commit ?? info.commit ?? 'unknown',
                gitBranch: info.gitBranch ?? info.git_branch ?? info.branch ?? 'unknown',
                version: info.version
            };
            if (typeof window !== 'undefined') {
                window.__BUILD_INFO__ = this.buildInfo;
            }
            this.persistBuildInfo();
            this.buildInfoLoaded = true;
            this.logBuildInfo();
            return true;
        }
        catch (error) {
            console.warn('⚠️ BUILD_TRACKER: Build info file not available yet. Run npm run build:presence to inject build metadata.', error);
            return false;
        }
    }
    loadBuildInfoFromChromeStorage() {
        try {
            chrome.storage.local.get(['buildNumber', 'buildTimestamp', 'buildGitCommit', 'buildGitBranch'], (result) => {
                if (result.buildNumber) {
                    this.buildInfo = {
                        buildNumber: result.buildNumber,
                        timestamp: result.buildTimestamp || new Date().toISOString(),
                        gitCommit: result.buildGitCommit,
                        gitBranch: result.buildGitBranch
                    };
                }
                else {
                    // Fallback: generate build number from timestamp
                    this.buildInfo = {
                        buildNumber: Math.floor(Date.now() / 1000), // Unix timestamp as fallback
                        timestamp: new Date().toISOString()
                    };
                    chrome.storage.local.set({
                        buildNumber: this.buildInfo.buildNumber,
                        buildTimestamp: this.buildInfo.timestamp
                    });
                }
                this.buildInfoLoaded = true;
                this.logBuildInfo();
            });
        }
        catch (error) {
            console.warn('⚠️ BUILD_TRACKER: Failed to load build info:', error);
            // Fallback: generate build number
            this.buildInfo = {
                buildNumber: Math.floor(Date.now() / 1000),
                timestamp: new Date().toISOString()
            };
            this.buildInfoLoaded = true;
            this.logBuildInfo();
        }
    }
    getBuildInfoUrl() {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
                return chrome.runtime.getURL('.build-info.json');
            }
        }
        catch (error) {
            console.warn('⚠️ BUILD_TRACKER: Unable to resolve build info URL from chrome.runtime:', error);
        }
        return '.build-info.json';
    }
    persistBuildInfo() {
        if (!this.buildInfo)
            return;
        try {
            chrome.storage.local.set({
                buildNumber: this.buildInfo.buildNumber,
                buildTimestamp: this.buildInfo.timestamp,
                buildGitCommit: this.buildInfo.gitCommit,
                buildGitBranch: this.buildInfo.gitBranch
            });
        }
        catch {
            // Storage might not be available yet; ignore
        }
    }
    /**
     * Log build info to console with detailed information
     */
    logBuildInfo() {
        if (this.buildInfo) {
            const buildNum = this.buildInfo.buildNumber;
            const timestamp = this.buildInfo.timestamp;
            const commit = this.buildInfo.gitCommit || 'unknown';
            const branch = this.buildInfo.gitBranch || 'unknown';
            console.log(`🏗️ BUILD_TRACKER: Build #${buildNum} | Commit: ${commit} | Branch: ${branch} | Time: ${timestamp}`);
            try {
                const reloadTimestamp = window.stateManagerInstance?.getState?.('extension.reloadTimestamp');
                if (reloadTimestamp) {
                    console.log(`🏗️ BUILD_TRACKER: Extension reload timestamp: ${reloadTimestamp}`);
                }
            }
            catch (e) {
                // StateManager might not be available yet
            }
        }
    }
    /**
     * Get current build number
     */
    getBuildNumber() {
        return this.buildInfo?.buildNumber || 0;
    }
    /**
     * Get build info
     */
    getBuildInfo() {
        return this.buildInfo;
    }
    /**
     * Check if build info has been loaded
     */
    isLoaded() {
        return this.buildInfoLoaded;
    }
    /**
     * Get formatted build string for display
     */
    getBuildString() {
        if (!this.buildInfo)
            return 'Build: unknown';
        const commit = this.buildInfo.gitCommit ? ` (${this.buildInfo.gitCommit})` : '';
        return `Build #${this.buildInfo.buildNumber}${commit}`;
    }
}
// Create singleton instance
const buildTracker = BuildTracker.getInstance();
// Export to window for debugging
if (typeof window !== 'undefined') {
    window.buildTracker = buildTracker;
    console.log('✅ BUILD_TRACKER: Initialized and exported to window');
}
export { BuildTracker, buildTracker };
export default BuildTracker;

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

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
interface BuildInfo {
  buildNumber: number;
  timestamp: string;
  gitCommit?: string;
  gitBranch?: string;
  version?: string;
  firstBuild?: string;
  lastBuild?: string;
}

class BuildTracker {
  private static instance: BuildTracker;
  private buildInfo: BuildInfo | null = null;
  private buildInfoLoaded = false;

  private constructor() {
    this.loadBuildInfo();
  }

  static getInstance(): BuildTracker {
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
  private loadBuildInfo(): void {
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

  private tryLoadInjectedBuildInfo(): boolean {
    if (typeof window !== 'undefined' && window.__BUILD_INFO__) {
      this.buildInfo = window.__BUILD_INFO__;
      this.buildInfoLoaded = true;
      this.logBuildInfo();
      return true;
    }
    return false;
  }

  private async tryLoadBuildInfoFromFile(): Promise<boolean> {
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
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'BuildTracker'
            }
        });;
      return false;
    
    }
  }

  private loadBuildInfoFromChromeStorage(): void {
    try {
      chrome.storage.local.get(['buildNumber', 'buildTimestamp', 'buildGitCommit', 'buildGitBranch'], (result) => {
        if (result.buildNumber) {
          this.buildInfo = {
            buildNumber: result.buildNumber as number,
            timestamp: (result.buildTimestamp as string) || new Date().toISOString(),
            gitCommit: result.buildGitCommit as string,
            gitBranch: result.buildGitBranch as string
          };
        } else {
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
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'BuildTracker'
            }
        });;
      // Fallback: generate build number
      this.buildInfo = {
        buildNumber: Math.floor(Date.now() / 1000),
        timestamp: new Date().toISOString()
      };
      this.buildInfoLoaded = true;
      this.logBuildInfo();
    
    }
  }

  private getBuildInfoUrl(): string {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
        return chrome.runtime.getURL('.build-info.json');
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'BuildTracker'
            }
        });;
    
    }
    return '.build-info.json';
  }

  private persistBuildInfo(): void {
    if (!this.buildInfo) return;
    try {
      chrome.storage.local.set({
        buildNumber: this.buildInfo.buildNumber,
        buildTimestamp: this.buildInfo.timestamp,
        buildGitCommit: this.buildInfo.gitCommit,
        buildGitBranch: this.buildInfo.gitBranch
      });
    } catch {
      // Storage might not be available yet; ignore
    }
  }

  /**
   * Log build info to console with detailed information
   */
  private logBuildInfo(): void {
    if (this.buildInfo) {
      const buildNum = this.buildInfo.buildNumber;
      const timestamp = this.buildInfo.timestamp;
      const commit = this.buildInfo.gitCommit || 'unknown';
      const branch = this.buildInfo.gitBranch || 'unknown';
      
      Logger.debug(`🏗️ BUILD_TRACKER: Build #${buildNum} | Commit: ${commit} | Branch: ${branch} | Time: ${timestamp}`, null, 'general');
      
      try {
        const reloadTimestamp = window.stateManagerInstance?.getState?.('extension.reloadTimestamp');
        if (reloadTimestamp) {
          Logger.debug(`🏗️ BUILD_TRACKER: Extension reload timestamp: ${reloadTimestamp}`, null, 'general');
        }
      } catch (e: unknown) {
        // StateManager might not be available yet
      }
    }
  }

  /**
   * Get current build number
   */
  getBuildNumber(): number {
    return this.buildInfo?.buildNumber || 0;
  }

  /**
   * Get build info
   */
  getBuildInfo(): BuildInfo | null {
    return this.buildInfo;
  }

  /**
   * Check if build info has been loaded
   */
  isLoaded(): boolean {
    return this.buildInfoLoaded;
  }

  /**
   * Get formatted build string for display
   */
  getBuildString(): string {
    if (!this.buildInfo) return 'Build: unknown';
    const commit = this.buildInfo.gitCommit ? ` (${this.buildInfo.gitCommit})` : '';
    return `Build #${this.buildInfo.buildNumber}${commit}`;
  }
}

// Create singleton instance
const buildTracker = BuildTracker.getInstance();

// Export to window for debugging
if (typeof window !== 'undefined') {
  window.buildTracker = {
    getBuildNumber: () => buildTracker.getBuildNumber(),
    getBuildInfo: () => buildTracker.getBuildInfo(),
    isLoaded: () => buildTracker.isLoaded(),
    getBuildString: () => buildTracker.getBuildString()
  };
  Logger.debug('✅ BUILD_TRACKER: Initialized and exported to window', null, 'general');
}

export { BuildTracker, buildTracker };
export default BuildTracker;


/**
 * AccessLogger - Log all vault access with wallet signatures
 */

import type { AccessLogEntry, AccessRequest, AccessApproval } from '../types/index.js';

export interface AccessLogger {
  logAccess(entry: AccessLogEntry): Promise<void>;
  getAccessLog(limit?: number): Promise<AccessLogEntry[]>;
  getAccessLogForRequester(requester: string, limit?: number): Promise<AccessLogEntry[]>;
  clearAccessLog(): Promise<void>;
}

export class AccessLoggerImpl implements AccessLogger {
  private log: AccessLogEntry[] = [];
  private maxLogSize = 10000;

  /**
   * Log access entry
   */
  async logAccess(entry: AccessLogEntry): Promise<void> {
    this.log.push(entry);
    
    // Trim log if too large
    if (this.log.length > this.maxLogSize) {
      this.log = this.log.slice(-this.maxLogSize);
    }
  }

  /**
   * Get access log
   */
  async getAccessLog(limit?: number): Promise<AccessLogEntry[]> {
    const entries = [...this.log].reverse(); // Most recent first
    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Get access log for specific requester
   */
  async getAccessLogForRequester(requester: string, limit?: number): Promise<AccessLogEntry[]> {
    const entries = this.log
      .filter(entry => entry.requester === requester)
      .reverse(); // Most recent first
    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Clear access log
   */
  async clearAccessLog(): Promise<void> {
    this.log = [];
  }
}








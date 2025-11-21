/**
 * HybridStorage - Local + Cloud hybrid storage
 */

import type { VaultStorage, SyncStatus } from './VaultStorage.js';
import { LocalStorageImpl } from './LocalStorage.js';
import { CloudStorageImpl, type CloudStorageConfig } from './CloudStorage.js';

export class HybridStorageImpl implements VaultStorage {
  private local: LocalStorageImpl;
  private cloud: CloudStorageImpl;
  private syncInProgress = false;

  constructor(cloudConfig: CloudStorageConfig) {
    this.local = new LocalStorageImpl();
    this.cloud = new CloudStorageImpl(cloudConfig);
  }

  /**
   * Store in both local and cloud
   */
  async store(key: string, encryptedData: Uint8Array): Promise<void> {
    // Store locally first (fast)
    await this.local.store(key, encryptedData);
    
    // Store in cloud (async, may fail)
    this.cloud.store(key, encryptedData).catch(err => {
      console.error('Cloud storage failed:', err);
      // Queue for later sync
    });
  }

  /**
   * Retrieve from local first, fallback to cloud
   */
  async retrieve(key: string): Promise<Uint8Array | null> {
    // Try local first
    const localData = await this.local.retrieve(key);
    if (localData) {
      return localData;
    }

    // Fallback to cloud
    const cloudData = await this.cloud.retrieve(key);
    if (cloudData) {
      // Cache locally
      await this.local.store(key, cloudData);
      return cloudData;
    }

    return null;
  }

  /**
   * Delete from both
   */
  async delete(key: string): Promise<void> {
    await Promise.all([
      this.local.delete(key),
      this.cloud.delete(key)
    ]);
  }

  /**
   * List keys (merge local and cloud)
   */
  async list(prefix?: string): Promise<string[]> {
    const [localKeys, cloudKeys] = await Promise.all([
      this.local.list(prefix),
      this.cloud.list(prefix)
    ]);

    // Merge and deduplicate
    const allKeys = new Set([...localKeys, ...cloudKeys]);
    return Array.from(allKeys);
  }

  /**
   * Sync local and cloud
   */
  async sync(): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    try {
      // TODO: Implement conflict resolution
      // - Compare local and cloud
      // - Resolve conflicts (last-write-wins or user choice)
      // - Sync changes
      await this.cloud.sync();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    return this.cloud.getSyncStatus();
  }
}







/**
 * LocalStorage - Local storage implementation (IndexedDB)
 */

import type { VaultStorage, SyncStatus } from './VaultStorage.js';

export class LocalStorageImpl implements VaultStorage {
  private dbName: string;
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'canopi-vault') {
    this.dbName = dbName;
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('vault')) {
          db.createObjectStore('vault', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Store encrypted data
   */
  async store(key: string, encryptedData: Uint8Array): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['vault'], 'readwrite');
      const store = transaction.objectStore('vault');
      const request = store.put({ key, data: encryptedData });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Retrieve encrypted data
   */
  async retrieve(key: string): Promise<Uint8Array | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['vault'], 'readonly');
      const store = transaction.objectStore('vault');
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
    });
  }

  /**
   * Delete data
   */
  async delete(key: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['vault'], 'readwrite');
      const store = transaction.objectStore('vault');
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * List all keys (optionally filtered by prefix)
   */
  async list(prefix?: string): Promise<string[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['vault'], 'readonly');
      const store = transaction.objectStore('vault');
      const request = store.getAllKeys();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const keys = request.result as string[];
        const filtered = prefix 
          ? keys.filter(key => key.startsWith(prefix))
          : keys;
        resolve(filtered);
      };
    });
  }

  /**
   * Sync (no-op for local storage)
   */
  async sync(): Promise<void> {
    // Local storage doesn't need syncing
  }

  /**
   * Get sync status (always synced for local storage)
   */
  async getSyncStatus(): Promise<SyncStatus> {
    return {
      lastSynced: new Date(),
      pendingChanges: 0,
      syncing: false
    };
  }
}












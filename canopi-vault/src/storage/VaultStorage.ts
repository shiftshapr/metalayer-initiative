/**
 * VaultStorage - Storage interface for vault data
 */

export interface SyncStatus {
  lastSynced: Date;
  pendingChanges: number;
  syncing: boolean;
  error?: string;
}

export interface VaultStorage {
  store(key: string, encryptedData: Uint8Array): Promise<void>;
  retrieve(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  
  // Sync (for cloud/hybrid)
  sync(): Promise<void>;
  getSyncStatus(): Promise<SyncStatus>;
}




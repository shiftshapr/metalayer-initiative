/**
 * Canopi Personal Vault - Main entry point
 */

// Core exports
export { VaultClient } from './core/VaultClient.js';
export { KeyManagerImpl, type KeyManager } from './core/KeyManager.js';
export { EncryptionServiceImpl, type EncryptionService } from './core/EncryptionService.js';

// Access control exports
export { ApprovalManagerImpl, type ApprovalManager } from './access/ApprovalManager.js';
export { PermissionManagerImpl, type PermissionManager } from './access/PermissionManager.js';
export { AccessLoggerImpl, type AccessLogger } from './access/AccessLogger.js';

// Storage exports
export { LocalStorageImpl } from './storage/LocalStorage.js';
export { CloudStorageImpl, type CloudStorageConfig } from './storage/CloudStorage.js';
export { HybridStorageImpl } from './storage/HybridStorage.js';
export type { VaultStorage, SyncStatus } from './storage/VaultStorage.js';

// Integration exports
export { PersonalAIClientImpl, type PersonalAIClient, type AIConnectionConfig } from './integrations/PersonalAI.js';
export { DataCooperativeClientImpl, type DataCooperativeClient } from './integrations/DataCooperative.js';

// Type exports
export * from './types/index.js';

// Utility exports
export * from './utils/CryptoUtils.js';
export * from './utils/ValidationUtils.js';












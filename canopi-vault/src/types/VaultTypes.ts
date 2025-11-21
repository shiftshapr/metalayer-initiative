/**
 * Core Vault Types
 */

export type DataType = 
  | 'messages'
  | 'conversations'
  | 'web-traffic'
  | 'canopi-activities'
  | 'module-data'
  | 'timeline'
  | 'presence'
  | 'metadata';

export type AccessAction = 'read' | 'write' | 'delete' | 'export';

export interface DataScope {
  conversationId?: string;
  messageId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  moduleId?: string;
  all?: boolean;
}

export interface PersonalVault {
  // Vault metadata (wallet address = vault ID)
  vaultId: string;              // Same as walletAddress
  walletAddress: string;         // User's wallet address (identity)
  createdAt: Date;
  lastSynced: Date;
  
  // Encrypted data stores
  messages: EncryptedStore<Message[]>;
  conversations: EncryptedStore<Conversation[]>;
  webTraffic: EncryptedStore<PageVisit[]>;
  canopiActivities: EncryptedStore<Activity[]>;
  moduleData: EncryptedStore<Record<string, any>>;
  timeline: EncryptedStore<TimelineEntry[]>;
  presence: EncryptedStore<PresenceData>;
  
  // Access control
  accessLog: AccessLogEntry[];   // Includes wallet signatures
  permissions: PermissionGrant[]; // Signed permissions
  
  // Integration data
  personalAIConnections: AIConnection[];
  dataCooperativeMemberships: CooperativeMembership[];
}

export interface EncryptedStore<T> {
  encrypted: boolean;
  data: Uint8Array;  // Encrypted data
  metadata: {
    keyVersion: number;
    encryptedAt: Date;
    dataType: string;
  };
}

// Placeholder types (to be defined based on Canopi data models)
export interface Message {
  id: string;
  body: string;
  createdAt: Date;
  // ... other message fields
}

export interface Conversation {
  id: string;
  // ... conversation fields
}

export interface PageVisit {
  url: string;
  title: string;
  timestamp: Date;
  // ... other visit fields
}

export interface Activity {
  type: string;
  timestamp: Date;
  // ... activity fields
}

export interface TimelineEntry {
  id: string;
  timestamp: Date;
  // ... timeline fields
}

export interface PresenceData {
  status: 'online' | 'offline';
  lastSeen: Date;
  // ... presence fields
}

export interface AccessLogEntry {
  id: string;
  timestamp: Date;
  requester: string;
  action: AccessAction;
  dataType: DataType;
  scope: DataScope;
  signature?: WalletSignature;
  approved: boolean;
}

export interface PermissionGrant {
  id: string;
  requester: string;
  permissions: Permission[];
  grantedAt: Date;
  expiresAt?: Date;
  signature: WalletSignature;
}

export interface AIConnection {
  aiId: string;
  aiName: string;
  aiProvider: string;
  permissions: Permission[];
  approvedAt: Date;
  lastAccess: Date;
}

export interface CooperativeMembership {
  cooperativeId: string;
  name: string;
  purpose: string;
  joinedAt: Date;
  dataSharing: {
    dataTypes: DataType[];
    anonymizationLevel: 'none' | 'pseudonymized' | 'aggregated' | 'fully-anonymous';
  };
}








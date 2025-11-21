/**
 * Access Control Types
 */

import type { DataType, AccessAction, DataScope } from './VaultTypes.js';

export type Permission = 
  | 'messages:read'
  | 'messages:write'
  | 'messages:delete'
  | 'timeline:read'
  | 'timeline:write'
  | 'web-traffic:read'
  | 'web-traffic:write'
  | 'canopi-activities:read'
  | 'canopi-activities:write'
  | 'module-data:read'
  | 'module-data:write'
  | 'vault:export'
  | 'vault:delete'
  | 'personal-ai:access'
  | 'cooperative:share';

export interface AccessRequest {
  requester: string;              // "canopi-host" | "module-id" | "personal-ai-id"
  action: AccessAction;           // "read" | "write" | "delete" | "export"
  dataType: DataType;             // "messages" | "timeline" | "web-traffic" | etc.
  scope: DataScope;               // Specific items or "all"
  reason?: string;                // Why access is needed
  timestamp: Date;
  nonce: string;                 // Prevent replay attacks
}

export interface WalletSignature {
  walletAddress: string;         // Signer's wallet address
  signature: string;             // ECDSA signature of request
  message: string;               // Signed message (request hash)
  timestamp: Date;
}

export interface AccessApproval {
  requestId: string;
  approved: boolean;
  grantedPermissions: Permission[];
  expiresAt?: Date;               // Optional expiration
  conditions?: ApprovalCondition[]; // Optional conditions
  
  // Wallet signature
  signature: WalletSignature;
}

export interface ApprovalCondition {
  type: 'time-limit' | 'scope-limit' | 'action-limit';
  value: any;
}

export interface PersistentPermission {
  id: string;
  requester: string;
  permissions: Permission[];
  grantedAt: Date;
  expiresAt?: Date;
  conditions: {
    requireExplicitApprovalFor: Permission[];  // Still require approval for sensitive actions
    maxDataScope: DataScope;                    // Limit scope
  };
  signature: WalletSignature;
}








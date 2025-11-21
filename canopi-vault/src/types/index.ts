/**
 * Type exports
 */

export * from './VaultTypes.js';
export * from './EncryptionTypes.js';
export * from './AccessTypes.js';

// Additional types for configuration
export interface WalletIdentity {
  walletAddress: string;          // User's wallet address (identity)
  web3AuthUser: {
    email?: string;
    name?: string;
    profileImage?: string;
    verifier: string;              // "google", "twitter", "email", etc.
    verifierId: string;
  };
  privateKey?: string;             // Available if Web3Auth provides it
}

export interface VaultConfig {
  storage: {
    type: 'local' | 'cloud' | 'hybrid';
    local?: { type: 'indexeddb' };
    cloud?: {
      type: 's3' | 'gcs' | 'azure' | 'ipfs';
      bucket?: string;
      credentials?: any;
      endpoint?: string;
    };
  };
  web3Auth: any;  // Web3Auth instance
  approvalRequired: boolean;
}

export interface ExportOptions {
  format: 'json' | 'sql' | 'csv' | 'encrypted';
  scope: {
    messages?: boolean;
    webTraffic?: boolean;
    canopiActivities?: boolean;
    moduleData?: boolean;
    timeline?: boolean;
    metadata?: boolean;
  };
  encryption?: {
    encrypted: boolean;
    keyProvided?: boolean;
  };
}

export interface ImportOptions {
  format: 'json' | 'sql' | 'csv' | 'encrypted';
  overwrite?: boolean;
}







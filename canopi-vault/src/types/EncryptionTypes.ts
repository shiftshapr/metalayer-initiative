/**
 * Encryption Types
 */

export interface EncryptionKey {
  key: Uint8Array;
  algorithm: 'AES-256-GCM';
  keyVersion: number;
}

export interface KeyDerivation {
  method: 'private-key' | 'address-secret';
  keyVersion: number;
  salt?: Uint8Array;
}

export interface EncryptedData {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag: Uint8Array;
  keyVersion: number;
  algorithm: string;
}

export interface KeyManagement {
  // Wallet-based identity
  walletAddress: string;           // From Web3Auth
  
  // Master encryption key (derived from wallet)
  masterKey: EncryptionKey;        // Derived from wallet private key or address+secret
  
  // Derived keys for different data types
  messageKey: EncryptionKey;       // Derived from masterKey + "messages"
  timelineKey: EncryptionKey;      // Derived from masterKey + "timeline"
  moduleDataKey: EncryptionKey;     // Derived from masterKey + "modules"
  webTrafficKey: EncryptionKey;    // Derived from masterKey + "web-traffic"
  
  // Key rotation support
  keyVersion: number;
  previousKeys: EncryptionKey[];   // For decryption of old data
}












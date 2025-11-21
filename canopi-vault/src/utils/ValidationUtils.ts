/**
 * ValidationUtils - Validation utilities
 */

/**
 * Validate wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
  // Ethereum address format: 0x followed by 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate signature format
 */
export function isValidSignature(signature: string): boolean {
  // ECDSA signature format: 0x followed by 130 hex characters (65 bytes)
  return /^0x[a-fA-F0-9]{130}$/.test(signature);
}

/**
 * Validate data type
 */
export function isValidDataType(dataType: string): boolean {
  const validTypes = [
    'messages',
    'conversations',
    'web-traffic',
    'canopi-activities',
    'module-data',
    'timeline',
    'presence',
    'metadata'
  ];
  return validTypes.includes(dataType);
}








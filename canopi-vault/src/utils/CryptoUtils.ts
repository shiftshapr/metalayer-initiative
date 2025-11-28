/**
 * CryptoUtils - Cryptographic utilities
 */

/**
 * Derive key using HKDF
 */
export async function deriveKey(
  inputKey: Uint8Array | string,
  salt: Uint8Array,
  info: string,
  length: number = 32
): Promise<Uint8Array> {
  // TODO: Implement HKDF-SHA-256
  // Use Web Crypto API or crypto library
  throw new Error('Not implemented');
}

/**
 * Hash data using SHA-256
 */
export async function sha256(data: Uint8Array | string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const dataBytes = typeof data === 'string' ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  return new Uint8Array(hashBuffer);
}

/**
 * Generate random bytes
 */
export function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Generate nonce for request
 */
export function generateNonce(): string {
  return randomBytes(16).reduce((str, byte) => {
    return str + byte.toString(16).padStart(2, '0');
  }, '');
}












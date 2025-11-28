/**
 * Provenance Type Definitions
 */
export interface ProvenanceMessage {
  id: string;
  content?: string;
  parentId?: string | null;
  authorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  author?: {
    id: string;
    handle?: string;
    name?: string;
    email?: string;
  };
  [key: string]: unknown;
}

export interface ProvenanceArtifact {
  id: string;
  messageId: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: Date;
  [key: string]: unknown;
}

export interface VerificationResult {
  valid: boolean;
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ProvenanceKeyPair {
  publicKey: string;
  privateKey: string;
  [key: string]: unknown;
}

export interface StoredKeyPair {
  id?: string;
  publicKey: number[] | string;
  privateKey: number[] | string;
  algorithm?: 'Ed25519' | 'ECDSA-P256';
  createdAt?: Date;
  [key: string]: unknown;
}

export interface ArtifactStorageResult {
  success: boolean;
  artifactId?: string;
  error?: string;
  [key: string]: unknown;
}






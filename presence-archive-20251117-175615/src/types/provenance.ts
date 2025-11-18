/**
 * Provenance Type Definitions
 * Types for Digital Provenance following Digital Vellum Note #3
 */

/**
 * Provenance Artifact Scope
 * Defines what the provenance applies to
 */
export interface ProvenanceScope {
  type: 'Message' | 'Page' | 'Content';
  id: string;
  contentHash: string;
  url: string;
}

/**
 * Provenance Claim
 * The assertion being made about the content
 */
export interface ProvenanceClaim {
  action: 'create' | 'update' | 'delete' | 'archive' | 'challenge';
  messageId: string;
  content: string | null; // Content hash
  parentId: string | null;
  userId: string | null;
}

/**
 * Provenance Actor
 * Who or what made the claim
 */
export interface ProvenanceActor {
  type: 'System' | 'User' | 'AI' | 'Institution';
  id: string;
  handle?: string | null;
  name?: string | null;
  email?: string | null;
  algorithm?: 'Ed25519' | 'ECDSA-P256';
}

/**
 * Provenance Artifact
 * Complete JSON-LD provenance record
 */
export interface ProvenanceArtifact {
  '@context': string;
  '@type': 'ProvenanceArtifact';
  '@id': string;
  timestamp: string;
  scope: ProvenanceScope;
  claim: ProvenanceClaim;
  actor: ProvenanceActor;
  signature: string | null;
  note?: string;
}

/**
 * Provenance Collection
 * Response format for .well-known/provenance endpoint
 */
export interface ProvenanceCollection {
  '@context': string;
  '@type': 'ProvenanceCollection';
  messageId: string;
  retrievedAt: string;
  source: 'database' | 'generated';
  artifacts: ProvenanceArtifact[];
}

/**
 * Stored Provenance Artifact
 * Database record structure
 */
export interface StoredProvenanceArtifact {
  id: string;
  messageId: string;
  artifact: ProvenanceArtifact;
  createdAt: Date;
}

/**
 * Message structure for provenance capture
 */
export interface ProvenanceMessage {
  id: string;
  content?: string;
  parentId?: string | null;
  authorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  editedAt?: Date;
  deletedAt?: Date;
  author?: {
    id: string;
    handle?: string;
    name?: string;
    email?: string;
  };
  AppUser?: {
    id: string;
    handle?: string;
    name?: string;
    email?: string;
  };
  Conversation?: {
    Page?: {
      id: string;
      url: string;
      canonicalUrl: string;
    };
  };
  pageId?: string;
}

/**
 * Key Pair structure
 */
export interface ProvenanceKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  algorithm?: 'Ed25519' | 'ECDSA-P256';
}

/**
 * Stored Key Pair (for localStorage)
 */
export interface StoredKeyPair {
  publicKey: number[];
  privateKey: number[];
  algorithm?: 'Ed25519' | 'ECDSA-P256';
}

/**
 * Verification Result
 */
export interface VerificationResult {
  valid: boolean;
  error?: string;
  keyId?: string;
}

/**
 * Artifact Storage Result
 */
export interface ArtifactStorageResult {
  '@context': string;
  '@type': 'ProvenanceArtifactStored';
  success: boolean;
  messageId: string;
  artifactId: string;
  storedId: string;
  storedAt: string;
}

/**
 * IndexedDB Database structure
 */
export interface ProvenanceDB extends IDBDatabase {
  objectStoreNames: DOMStringList & {
    contains(name: 'artifacts' | 'message_index'): boolean;
  };
}




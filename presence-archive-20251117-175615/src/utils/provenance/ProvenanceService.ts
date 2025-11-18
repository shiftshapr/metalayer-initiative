/**
 * PROVENANCE SERVICE - Digital Provenance for Messages
 * 
 * Non-invasive service that captures provenance artifacts for messages
 * without modifying existing code. Uses event listeners and interceptors.
 * 
 * Design Principles:
 * - Zero modification to existing message code
 * - Feature-flag enabled (can be disabled without breaking)
 * - Isolated storage (IndexedDB)
 * - Graceful degradation (fails silently if unavailable)
 */

import type {
  ProvenanceArtifact,
  ProvenanceMessage,
  ProvenanceKeyPair,
  StoredKeyPair,
  ArtifactStorageResult
} from '../../types/provenance';
import { ensureMessageContent } from '../../utils/Fallbacks.js';

class ProvenanceService {
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;
  private keyPair: ProvenanceKeyPair | null = null;
  private db: IDBDatabase | null = null;
  private listeners: Array<{ type: string; target: string }> = [];
  private readonly enabledKey: string = 'provenance_enabled';

  /**
   * Initialize the provenance service
   * @param forceEnable - Override feature flag
   */
  async initialize(forceEnable: boolean = false): Promise<void> {
    if (this.isInitialized) {
      console.log('[Provenance] Already initialized');
      return;
    }

    try {
      // Check feature flag
      const stored = localStorage.getItem(this.enabledKey);
      this.isEnabled = forceEnable || stored === 'true';
      
      if (!this.isEnabled) {
        console.log('[Provenance] Service disabled (set localStorage.provenance_enabled = "true" to enable)');
        this.isInitialized = true;
        return;
      }

      console.log('[Provenance] Initializing...');

      // Initialize key pair
      await this.initializeKeyPair();

      // Initialize IndexedDB
      await this.initializeDatabase();

      // Attach event listeners (non-invasive)
      this.attachListeners();

      this.isInitialized = true;
      console.log('[Provenance] Service initialized successfully');
    } catch (error) {
      console.error('[Provenance] Initialization failed:', error);
      // Fail gracefully - don't break the app
      this.isInitialized = true;
      this.isEnabled = false;
    }
  }

  /**
   * Initialize or load Ed25519 key pair
   * Uses Web Crypto API for native browser support
   */
  private async initializeKeyPair(): Promise<void> {
    const storageKey = 'provenance_keypair';
    
    try {
      // Try to load from storage
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: StoredKeyPair = JSON.parse(stored);
        this.keyPair = {
          publicKey: await this.importKey(parsed.publicKey, 'public', parsed.algorithm),
          privateKey: await this.importKey(parsed.privateKey, 'private', parsed.algorithm),
          algorithm: parsed.algorithm
        };
        console.log('[Provenance] Loaded key pair from storage');
        return;
      }
    } catch (error) {
      console.warn('[Provenance] Failed to load key pair, generating new one:', error);
    }

    // Generate new key pair
    // Try Ed25519 first (preferred), fallback to ECDSA P-256
    let keyPair: CryptoKeyPair;
    let algorithm: 'Ed25519' | 'ECDSA-P256' = 'Ed25519';
    
    try {
      keyPair = await crypto.subtle.generateKey(
        {
          name: 'Ed25519',
          namedCurve: 'Ed25519'
        },
        true, // extractable
        ['sign', 'verify']
      ) as CryptoKeyPair;
      console.log('[Provenance] Generated Ed25519 key pair');
    } catch (error) {
      // Fallback to ECDSA P-256 for older browsers
      console.warn('[Provenance] Ed25519 not available, using ECDSA P-256:', error);
      algorithm = 'ECDSA-P256';
      
      try {
        keyPair = await crypto.subtle.generateKey(
          {
            name: 'ECDSA',
            namedCurve: 'P-256'
          },
          true,
          ['sign', 'verify']
        ) as CryptoKeyPair;
        console.log('[Provenance] Generated ECDSA P-256 key pair');
      } catch (fallbackError) {
        throw new Error(`Failed to generate key pair: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      }
    }

    try {
      // Export for storage
      const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
      const privateKeyRaw = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      this.keyPair = {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        algorithm: algorithm
      };

      // Store for persistence
      const stored: StoredKeyPair = {
        publicKey: Array.from(new Uint8Array(publicKeyRaw)),
        privateKey: Array.from(new Uint8Array(privateKeyRaw)),
        algorithm: algorithm
      };
      localStorage.setItem(storageKey, JSON.stringify(stored));

      console.log('[Provenance] Key pair stored');
    } catch (error) {
      console.error('[Provenance] Failed to store key pair:', error);
      throw error;
    }
  }

  /**
   * Import key from raw format
   */
  private async importKey(
    keyData: number[],
    type: 'public' | 'private',
    algorithm?: 'Ed25519' | 'ECDSA-P256'
  ): Promise<CryptoKey> {
    const format: 'raw' | 'pkcs8' = type === 'public' ? 'raw' : 'pkcs8';
    const keyUsages: KeyUsage[] = type === 'public' ? ['verify'] : ['sign'];
    const algo = algorithm === 'ECDSA-P256' 
      ? { name: 'ECDSA', namedCurve: 'P-256' }
      : { name: 'Ed25519', namedCurve: 'Ed25519' };

    return crypto.subtle.importKey(
      format,
      new Uint8Array(keyData),
      algo,
      true,
      keyUsages
    );
  }

  /**
   * Initialize IndexedDB for artifact storage
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('provenance_db', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Artifacts store
        if (!db.objectStoreNames.contains('artifacts')) {
          const store = db.createObjectStore('artifacts', { keyPath: '@id' });
          store.createIndex('scope', 'scope', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('actor', 'actor.id', { unique: false });
        }

        // Messages index (for quick lookup)
        if (!db.objectStoreNames.contains('message_index')) {
          const store = db.createObjectStore('message_index', { keyPath: 'messageId' });
          store.createIndex('artifactId', 'artifactId', { unique: true });
        }
      };
    });
  }

  /**
   * Attach non-invasive event listeners
   * Hooks into existing message flows without modifying them
   */
  private attachListeners(): void {
    // Intercept window.sendMessageViaSupabase if it exists
    if (typeof (window as any).sendMessageViaSupabase === 'function') {
      const original = (window as any).sendMessageViaSupabase;
      (window as any).sendMessageViaSupabase = async (...args: any[]) => {
        const result = await original.apply(this, args);
        
        // Capture provenance after message is sent
        if (result && result.id) {
          this.captureMessageProvenance('create', result).catch(err => {
            console.warn('[Provenance] Failed to capture create provenance:', err);
          });
        }
        
        return result;
      };
      this.listeners.push({ type: 'intercept', target: 'sendMessageViaSupabase' });
    }

    // Intercept handleDeleteMessage if it exists
    if (typeof (window as any).handleDeleteMessage === 'function') {
      const original = (window as any).handleDeleteMessage;
      (window as any).handleDeleteMessage = async (...args: any[]) => {
        const message = args[0];
        const result = await original.apply(this, args);
        
        if (message && message.id) {
          this.captureMessageProvenance('delete', message).catch(err => {
            console.warn('[Provenance] Failed to capture delete provenance:', err);
          });
        }
        
        return result;
      };
      this.listeners.push({ type: 'intercept', target: 'handleDeleteMessage' });
    }

    // Listen for message updates via updateMessageInChat
    if (typeof (window as any).updateMessageInChat === 'function') {
      const original = (window as any).updateMessageInChat;
      (window as any).updateMessageInChat = (...args: any[]) => {
        const message = args[0];
        const result = original.apply(this, args);
        
        if (message && message.id) {
          this.captureMessageProvenance('update', message).catch(err => {
            console.warn('[Provenance] Failed to capture update provenance:', err);
          });
        }
        
        return result;
      };
      this.listeners.push({ type: 'intercept', target: 'updateMessageInChat' });
    }

    console.log('[Provenance] Attached', this.listeners.length, 'listeners');
  }

  /**
   * Capture provenance artifact for a message event
   */
  async captureMessageProvenance(
    action: 'create' | 'update' | 'delete',
    message: ProvenanceMessage
  ): Promise<ProvenanceArtifact | null> {
    if (!this.isEnabled || !this.keyPair || !this.db) {
      return null;
    }

    try {
      // Create artifact
      const artifact = await this.createArtifact(action, message);
      
      // Store in IndexedDB (local backup)
      await this.storeArtifact(artifact, message.id);
      
      // Store in backend database (if available)
      await this.storeArtifactInBackend(message.id, artifact);
      
      console.log('[Provenance] Captured', action, 'for message', message.id);
      return artifact;
    } catch (error) {
      console.error('[Provenance] Failed to capture provenance:', error);
      return null;
    }
  }

  /**
   * Store artifact in backend database
   */
  private async storeArtifactInBackend(
    messageId: string,
    artifact: ProvenanceArtifact
  ): Promise<ArtifactStorageResult | null> {
    try {
      const baseUrl = localStorage.getItem('provenance_base_url') || 'https://app.canopi.live';
      const url = `${baseUrl}/message/${messageId}/provenance`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artifact)
      });

      if (response.ok) {
        const result: ArtifactStorageResult = await response.json();
        console.log('[Provenance] Stored artifact in backend:', result.artifactId);
        return result;
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('[Provenance] Failed to store in backend:', error);
        // Don't throw - local storage is sufficient
        return null;
      }
    } catch (error) {
      console.warn('[Provenance] Backend storage failed (non-critical):', error instanceof Error ? error.message : 'Unknown error');
      // Don't throw - local storage is sufficient
      return null;
    }
  }

  /**
   * Create a provenance artifact (JSON-LD format)
   */
  private async createArtifact(
    action: 'create' | 'update' | 'delete',
    message: ProvenanceMessage
  ): Promise<ProvenanceArtifact> {
    const artifactId = `provenance:${message.id}:${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Hash message content for scope binding
    const content = ensureMessageContent(message);
    const contentHash = await this.hashContent(content);
    
    // Create scope (what this provenance applies to)
    const scope = {
      type: 'Message' as const,
      id: message.id,
      contentHash: contentHash,
      url: window.location.href
    };

    // Create claim
    const claim = {
      action: action,
      messageId: message.id,
      content: content ? contentHash : null,
      parentId: message.parentId || null,
      userId: message.authorId || null
    };

    // Create actor (who made the claim)
    const actor = {
      type: 'System' as const,
      id: await this.getPublicKeyId()
    };

    // Create the artifact structure
    const artifact: ProvenanceArtifact = {
      '@context': 'https://schema.org',
      '@type': 'ProvenanceArtifact',
      '@id': artifactId,
      timestamp: timestamp,
      scope: scope,
      claim: claim,
      actor: actor,
      signature: null
    };

    // Sign the artifact
    const signature = await this.signArtifact(artifact);
    artifact.signature = signature;

    return artifact;
  }

  /**
   * Hash content using SHA-256
   */
  private async hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Sign an artifact
   */
  private async signArtifact(artifact: Omit<ProvenanceArtifact, 'signature'>): Promise<string> {
    // Create canonical JSON representation for signing
    const canonical = JSON.stringify(artifact, Object.keys(artifact).sort());
    const encoder = new TextEncoder();
    const data = encoder.encode(canonical);

    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    // Sign with private key
    const signature = await crypto.subtle.sign(
      this.keyPair.algorithm === 'ECDSA-P256'
        ? { name: 'ECDSA', hash: 'SHA-256' }
        : 'Ed25519',
      this.keyPair.privateKey,
      data
    );

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  /**
   * Get public key identifier
   */
  private async getPublicKeyId(): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const publicKeyRaw = await crypto.subtle.exportKey('raw', this.keyPair.publicKey);
    const hash = await crypto.subtle.digest('SHA-256', publicKeyRaw);
    const hashArray = Array.from(new Uint8Array(hash));
    return 'key:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  /**
   * Store artifact in IndexedDB
   */
  private async storeArtifact(artifact: ProvenanceArtifact, messageId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['artifacts', 'message_index'], 'readwrite');
      
      // Store artifact
      const artifactStore = transaction.objectStore('artifacts');
      const artifactRequest = artifactStore.add(artifact);

      // Update message index
      const indexStore = transaction.objectStore('message_index');
      const indexRequest = indexStore.put({
        messageId: messageId,
        artifactId: artifact['@id'],
        timestamp: artifact.timestamp
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get the .well-known/provenance URL for a message
   */
  getProvenanceUrl(messageId: string, baseUrl: string = 'https://app.canopi.live'): string {
    return `${baseUrl}/message/${messageId}/.well-known/provenance`;
  }

  /**
   * Get all provenance artifacts for a message
   */
  async getMessageProvenance(messageId: string): Promise<ProvenanceArtifact[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['message_index', 'artifacts'], 'readonly');
      const indexStore = transaction.objectStore('message_index');
      const index = indexStore.index('messageId');
      const request = index.getAll(messageId);

      request.onsuccess = async () => {
        const artifacts: ProvenanceArtifact[] = [];
        const artifactStore = transaction.objectStore('artifacts');
        
        for (const entry of request.result) {
          const artifactRequest = artifactStore.get(entry.artifactId);
          artifactRequest.onsuccess = () => {
            if (artifactRequest.result) {
              artifacts.push(artifactRequest.result as ProvenanceArtifact);
            }
          };
        }

        // Wait for all artifacts to load
        setTimeout(() => {
          resolve(artifacts.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ));
        }, 100);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Enable/disable the service
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem(this.enabledKey, enabled.toString());
    console.log('[Provenance] Service', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Cleanup listeners (for testing or disabling)
   */
  cleanup(): void {
    // Note: Interceptors are harder to clean up, but service can be disabled
    this.listeners = [];
    this.setEnabled(false);
  }

  // Getters
  get enabled(): boolean {
    return this.isEnabled;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
if (typeof window !== 'undefined') {
  (window as any).provenanceService = new ProvenanceService();
  console.log('[Provenance] Service available at window.provenanceService');
}

export default ProvenanceService;


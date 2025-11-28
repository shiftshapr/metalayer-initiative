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
  StoredKeyPair,
  ArtifactStorageResult
} from '../../types/provenance';
import { ensureMessageContent } from '../../utils/Fallbacks.js';

import { handleError } from '../ErrorHandler.js';
import { Logger } from '../Logger.js';
interface InternalKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  algorithm: 'Ed25519' | 'ECDSA-P256';
}

class ProvenanceService {
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;
  private keyPair: InternalKeyPair | null = null;
  private db: IDBDatabase | null = null;
  private listeners: Array<{ type: string; target: string }> = [];
  private readonly enabledKey: string = 'provenance_enabled';

  /**
   * Initialize the provenance service
   * @param forceEnable - Override feature flag
   */
  async initialize(forceEnable: boolean = false): Promise<void> {
    if (this.isInitialized) {
      Logger.debug('[Provenance] Already initialized', null, 'provenance');
      return;
    }

    try {
      // Check feature flag
      const stored = localStorage.getItem(this.enabledKey);
      this.isEnabled = forceEnable || stored === 'true';
      
      if (!this.isEnabled) {
        Logger.debug('[Provenance] Service disabled (set localStorage.provenance_enabled = "true" to enable)', null, 'provenance');
        this.isInitialized = true;
        return;
      }

      Logger.debug('[Provenance] Initializing...', null, 'provenance');

      // Initialize key pair
      await this.initializeKeyPair();

      // Initialize IndexedDB
      await this.initializeDatabase();

      // Attach event listeners (non-invasive)
      this.attachListeners();

      this.isInitialized = true;
      Logger.debug('[Provenance] Service initialized successfully', null, 'provenance');
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ProvenanceService'
            }
        });;
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
        const publicKeyData = Array.isArray(parsed.publicKey) ? parsed.publicKey : (typeof parsed.publicKey === 'string' ? JSON.parse(parsed.publicKey) : []);
        const privateKeyData = Array.isArray(parsed.privateKey) ? parsed.privateKey : (typeof parsed.privateKey === 'string' ? JSON.parse(parsed.privateKey) : []);
        this.keyPair = {
          publicKey: await this.importKey(publicKeyData, 'public', parsed.algorithm),
          privateKey: await this.importKey(privateKeyData, 'private', parsed.algorithm),
          algorithm: parsed.algorithm || 'Ed25519'
        };
        Logger.debug('[Provenance] Loaded key pair from storage', null, 'provenance');
        return;
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'ProvenanceService'
            }
        });;
    
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
      Logger.debug('[Provenance] Generated Ed25519 key pair', null, 'provenance');
    } catch (error: unknown) {
      // Fallback to ECDSA P-256 for older browsers
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'ProvenanceService'
            }
        });;
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
        Logger.debug('[Provenance] Generated ECDSA P-256 key pair', null, 'provenance');
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
        publicKey: Array.from(new Uint8Array(publicKeyRaw)) as number[],
        privateKey: Array.from(new Uint8Array(privateKeyRaw)) as number[],
        algorithm: algorithm
      };
      localStorage.setItem(storageKey, JSON.stringify(stored));

      Logger.debug('[Provenance] Key pair stored', null, 'provenance');
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ProvenanceService'
            }
        });;
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
    const sendMessageWindow = (window as unknown) as Window & { sendMessageViaSupabase?: ((message: Partial<import('../../types/index.js').Message>) => Promise<import('../../types/index.js').Message>) | ((...args: unknown[]) => Promise<{ id?: string }>) };
    if (typeof sendMessageWindow.sendMessageViaSupabase === 'function') {
      const original = sendMessageWindow.sendMessageViaSupabase!;
      sendMessageWindow.sendMessageViaSupabase = (async (...args: unknown[]): Promise<{ id?: string }> => {
        const result = await (original as (...args: unknown[]) => Promise<{ id?: string }>).apply(this, args);
        
        // Capture provenance after message is sent
        if (result && result.id) {
          this.captureMessageProvenance('create', result as ProvenanceMessage).catch(err => {
            Logger.warn('[Provenance] Failed to capture create provenance:', err, 'provenance');
          });
        }
        
        return result;
      }) as typeof original;
      this.listeners.push({ type: 'intercept', target: 'sendMessageViaSupabase' });
    }

    // Intercept handleDeleteMessage if it exists
    const deleteMessageWindow = (window as unknown) as Window & { handleDeleteMessage?: (messageId: string) => Promise<boolean> };
    if (typeof deleteMessageWindow.handleDeleteMessage === 'function') {
      const original = deleteMessageWindow.handleDeleteMessage!;
      deleteMessageWindow.handleDeleteMessage = (async (messageId: string): Promise<boolean> => {
        const result = await original.call(this, messageId);
        
        // Try to get the message object to capture provenance
        // Note: We only have messageId, so we create a minimal ProvenanceMessage
        const provenanceMessage: ProvenanceMessage = { id: messageId };
        this.captureMessageProvenance('delete', provenanceMessage).catch(err => {
          Logger.warn('[Provenance] Failed to capture delete provenance:', err, 'provenance');
        });
        
        return result;
      });
      this.listeners.push({ type: 'intercept', target: 'handleDeleteMessage' });
    }

    // Listen for message updates via updateMessageInChat
    const updateMessageWindow = (window as unknown) as Window & { updateMessageInChat?: (message: import('../../types/index.js').Message) => void };
    if (typeof updateMessageWindow.updateMessageInChat === 'function') {
      const original = updateMessageWindow.updateMessageInChat!;
      updateMessageWindow.updateMessageInChat = ((message: import('../../types/index.js').Message): void => {
        original.call(this, message);
        
        // Convert Message to ProvenanceMessage for provenance capture
        const provenanceMessage: ProvenanceMessage = {
          id: message.id,
          content: message.content,
          parentId: message.parentId || null,
          authorId: message.authorId,
          createdAt: typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt,
          updatedAt: typeof message.updatedAt === 'string' ? new Date(message.updatedAt) : message.updatedAt,
          author: message.author ? {
            id: message.author.id || '',
            handle: message.author.handle,
            name: message.author.name,
            email: message.author.email
          } : undefined
        };
        
        if (provenanceMessage.id) {
          this.captureMessageProvenance('update', provenanceMessage).catch(err => {
            Logger.warn('[Provenance] Failed to capture update provenance:', err, 'provenance');
          });
        }
      });
      this.listeners.push({ type: 'intercept', target: 'updateMessageInChat' });
    }

    Logger.debug('[Provenance] Attached', { data: this.listeners.length, extra: 'listeners' }, 'provenance');
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
      
      Logger.debug('[Provenance] Captured', { data: action, extra: 'for message', messageId: message.id }, 'provenance');
      return artifact;
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ProvenanceService',
            messageId: message?.id
            }
        });;
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
        Logger.debug('[Provenance] Stored artifact in backend:', result.artifactId, 'provenance');
        return result;
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        Logger.warn('[Provenance] Failed to store in backend:', error, 'provenance');
        // Don't throw - local storage is sufficient
        return null;
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
              operation: 'saveProvenanceToBackend',
              component: 'ProvenanceService'
            }
          });
          Logger.warn('[Provenance] Backend storage failed (non-critical):', error instanceof Error ? error : { message: 'Unknown error' }, 'provenance');
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
      id: artifactId,
      messageId: message.id,
      type: action,
      data: {
        '@context': 'https://schema.org',
        '@type': 'ProvenanceArtifact',
        '@id': artifactId,
        timestamp: timestamp,
        scope: scope,
        claim: claim,
        actor: actor,
        signature: null
      },
      createdAt: new Date(timestamp)
    };

    // Sign the artifact
    const signature = await this.signArtifact(artifact.data);
    artifact.data.signature = signature;

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
  private async signArtifact(artifact: Record<string, unknown>): Promise<string> {
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
      artifactStore.add(artifact);

      // Update message index
      const indexStore = transaction.objectStore('message_index');
      indexStore.put({
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
          resolve(artifacts.sort((a, b) => {
            const aTime = a.timestamp && typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : (typeof a.timestamp === 'number' ? a.timestamp : 0);
            const bTime = b.timestamp && typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : (typeof b.timestamp === 'number' ? b.timestamp : 0);
            return aTime - bTime;
          }));
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
    Logger.debug('[Provenance] Service', enabled ? 'enabled' : 'disabled', 'provenance');
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
  Object.assign(window, { provenanceService: new ProvenanceService() });
  Logger.debug('[Provenance] Service available at window.provenanceService', null, 'provenance');
}

export default ProvenanceService;


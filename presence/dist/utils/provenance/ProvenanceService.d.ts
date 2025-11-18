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
import type { ProvenanceArtifact, ProvenanceMessage } from '../../types/provenance';
declare class ProvenanceService {
    private isEnabled;
    private isInitialized;
    private keyPair;
    private db;
    private listeners;
    private readonly enabledKey;
    /**
     * Initialize the provenance service
     * @param forceEnable - Override feature flag
     */
    initialize(forceEnable?: boolean): Promise<void>;
    /**
     * Initialize or load Ed25519 key pair
     * Uses Web Crypto API for native browser support
     */
    private initializeKeyPair;
    /**
     * Import key from raw format
     */
    private importKey;
    /**
     * Initialize IndexedDB for artifact storage
     */
    private initializeDatabase;
    /**
     * Attach non-invasive event listeners
     * Hooks into existing message flows without modifying them
     */
    private attachListeners;
    /**
     * Capture provenance artifact for a message event
     */
    captureMessageProvenance(action: 'create' | 'update' | 'delete', message: ProvenanceMessage): Promise<ProvenanceArtifact | null>;
    /**
     * Store artifact in backend database
     */
    private storeArtifactInBackend;
    /**
     * Create a provenance artifact (JSON-LD format)
     */
    private createArtifact;
    /**
     * Hash content using SHA-256
     */
    private hashContent;
    /**
     * Sign an artifact
     */
    private signArtifact;
    /**
     * Get public key identifier
     */
    private getPublicKeyId;
    /**
     * Store artifact in IndexedDB
     */
    private storeArtifact;
    /**
     * Get the .well-known/provenance URL for a message
     */
    getProvenanceUrl(messageId: string, baseUrl?: string): string;
    /**
     * Get all provenance artifacts for a message
     */
    getMessageProvenance(messageId: string): Promise<ProvenanceArtifact[]>;
    /**
     * Enable/disable the service
     */
    setEnabled(enabled: boolean): void;
    /**
     * Cleanup listeners (for testing or disabling)
     */
    cleanup(): void;
    get enabled(): boolean;
    get initialized(): boolean;
}
export default ProvenanceService;
//# sourceMappingURL=ProvenanceService.d.ts.map
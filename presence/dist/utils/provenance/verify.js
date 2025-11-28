/**
 * PROVENANCE VERIFICATION UTILITY
 *
 * Standalone utility for verifying provenance artifact signatures
 * Can be used in browser or exported for CLI use
 */
// Error handling imports removed - not used in this verification utility
import { Logger } from '../Logger.js';
class ProvenanceVerifier {
    // Public keys cache for future use
    // private publicKeys: Map<string, CryptoKey> = new Map();
    /**
     * Verify a provenance artifact signature
     * @param artifact - The provenance artifact to verify
     * @param publicKey - The public key to verify against
     * @returns Verification result
     */
    async verifyArtifact(artifact, publicKey) {
        try {
            if (!artifact.signature) {
                return { valid: false, error: 'Artifact missing signature' };
            }
            // Extract signature from artifact
            const signatureData = artifact.signature;
            const signatureString = typeof signatureData === 'string' ? signatureData : String(signatureData || '');
            const signature = Uint8Array.from(atob(signatureString), c => c.charCodeAt(0));
            // Create canonical JSON (same as signing)
            const { signature: _, ...artifactWithoutSig } = artifact;
            const sortedKeys = Object.keys(artifactWithoutSig).sort();
            const canonical = JSON.stringify(artifactWithoutSig, sortedKeys);
            const encoder = new TextEncoder();
            const data = encoder.encode(canonical);
            // Determine algorithm
            const actorAlgorithm = (artifact.actor && typeof artifact.actor === 'object' && 'algorithm' in artifact.actor ? artifact.actor.algorithm : undefined);
            const publicKeyAlgorithm = (publicKey && typeof publicKey === 'object' && 'algorithm' in publicKey && publicKey.algorithm && typeof publicKey.algorithm === 'object' && 'name' in publicKey.algorithm ? publicKey.algorithm.name : undefined);
            const algorithm = actorAlgorithm === 'ECDSA-P256' || publicKeyAlgorithm === 'ECDSA'
                ? { name: 'ECDSA', hash: 'SHA-256' }
                : 'Ed25519';
            // Verify signature
            const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, data);
            return { valid: isValid };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Verify artifact with public key from storage
     * @param artifact - The provenance artifact
     * @param keyId - Optional key identifier
     * @returns Verification result with key ID
     */
    async verifyWithStoredKey(artifact, keyId = null) {
        // For now, we'll need to load the key from localStorage
        // In production, keys would be resolved via DID or key registry
        try {
            const stored = localStorage.getItem('provenance_keypair');
            if (!stored) {
                return { valid: false, error: 'No key pair found in storage' };
            }
            const parsed = JSON.parse(stored);
            const algorithm = parsed.algorithm === 'ECDSA-P256'
                ? { name: 'ECDSA', namedCurve: 'P-256' }
                : { name: 'Ed25519', namedCurve: 'Ed25519' };
            const publicKey = await crypto.subtle.importKey('raw', new Uint8Array(parsed.publicKey), algorithm, true, ['verify']);
            const result = await this.verifyArtifact(artifact, publicKey);
            return { ...result, keyId: keyId || 'local' };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Verify all artifacts for a message
     * @param artifacts - Array of provenance artifacts
     * @returns Array of verification results
     */
    async verifyArtifactChain(artifacts) {
        const results = [];
        for (const artifact of artifacts) {
            const verification = await this.verifyWithStoredKey(artifact);
            results.push({
                artifactId: (typeof artifact['@id'] === 'string' ? artifact['@id'] : String(artifact['@id'] || '')),
                timestamp: (typeof artifact.timestamp === 'string' ? artifact.timestamp : String(artifact.timestamp || '')),
                action: (artifact.claim && typeof artifact.claim === 'object' && 'action' in artifact.claim ? artifact.claim.action : undefined),
                ...verification
            });
        }
        return results;
    }
    /**
     * Export verification result for CLI use
     * @param result - Verification result
     * @returns JSON string
     */
    exportForCLI(result) {
        return JSON.stringify(result, null, 2);
    }
}
// Export for browser use
if (typeof window !== 'undefined') {
    // Use Object.assign to avoid strict type checking issues
    Object.assign(window, { provenanceVerifier: new ProvenanceVerifier() });
    Logger.debug('[Provenance] Verifier available at window.provenanceVerifier', null, 'provenance');
}
export default ProvenanceVerifier;

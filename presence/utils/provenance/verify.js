/**
 * PROVENANCE VERIFICATION UTILITY
 *
 * Standalone utility for verifying provenance artifact signatures
 * Can be used in browser or exported for CLI use
 */
class ProvenanceVerifier {
    constructor() {
        this.publicKeys = new Map();
    }
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
            const signature = Uint8Array.from(atob(signatureData), c => c.charCodeAt(0));
            // Create canonical JSON (same as signing)
            const { signature: _, ...artifactWithoutSig } = artifact;
            const canonical = JSON.stringify(artifactWithoutSig, Object.keys(artifactWithoutSig).sort());
            const encoder = new TextEncoder();
            const data = encoder.encode(canonical);
            // Determine algorithm
            const algorithm = artifact.actor?.algorithm === 'ECDSA-P256' || publicKey.algorithm?.name === 'ECDSA'
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
                artifactId: artifact['@id'],
                timestamp: artifact.timestamp,
                action: artifact.claim?.action,
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
    window.provenanceVerifier = new ProvenanceVerifier();
    console.log('[Provenance] Verifier available at window.provenanceVerifier');
}
export default ProvenanceVerifier;


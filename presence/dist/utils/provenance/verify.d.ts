/**
 * PROVENANCE VERIFICATION UTILITY
 *
 * Standalone utility for verifying provenance artifact signatures
 * Can be used in browser or exported for CLI use
 */
import type { ProvenanceArtifact, VerificationResult } from '../../types/provenance';
declare class ProvenanceVerifier {
    /**
     * Verify a provenance artifact signature
     * @param artifact - The provenance artifact to verify
     * @param publicKey - The public key to verify against
     * @returns Verification result
     */
    verifyArtifact(artifact: ProvenanceArtifact, publicKey: CryptoKey): Promise<VerificationResult>;
    /**
     * Verify artifact with public key from storage
     * @param artifact - The provenance artifact
     * @param keyId - Optional key identifier
     * @returns Verification result with key ID
     */
    verifyWithStoredKey(artifact: ProvenanceArtifact, keyId?: string | null): Promise<VerificationResult & {
        keyId?: string;
    }>;
    /**
     * Verify all artifacts for a message
     * @param artifacts - Array of provenance artifacts
     * @returns Array of verification results
     */
    verifyArtifactChain(artifacts: ProvenanceArtifact[]): Promise<Array<VerificationResult & {
        artifactId: string;
        timestamp: string;
        action?: string;
    }>>;
    /**
     * Export verification result for CLI use
     * @param result - Verification result
     * @returns JSON string
     */
    exportForCLI(result: VerificationResult): string;
}
export default ProvenanceVerifier;
//# sourceMappingURL=verify.d.ts.map
/**
 * PROVENANCE DIAGNOSTIC OVERLAY
 *
 * Non-invasive diagnostic UI for viewing provenance artifacts
 * Follows the pattern of other diagnostic utilities
 */
declare class ProvenanceDiagnostic {
    private isVisible;
    private overlay;
    /**
     * Initialize diagnostic overlay
     */
    initialize(): Promise<void>;
    /**
     * Create the diagnostic overlay UI
     */
    private createOverlay;
    /**
     * Show the diagnostic overlay
     */
    show(): void;
    /**
     * Hide the diagnostic overlay
     */
    hide(): void;
    /**
     * Display provenance for a message
     */
    displayMessageProvenance(messageId: string): Promise<void>;
    /**
     * Export artifacts as JSON-LD file
     */
    private exportArtifacts;
    /**
     * Toggle overlay visibility
     */
    toggle(): void;
}
export default ProvenanceDiagnostic;
//# sourceMappingURL=ProvenanceDiagnostic.d.ts.map
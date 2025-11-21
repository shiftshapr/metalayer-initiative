/**
 * PROVENANCE DIAGNOSTIC OVERLAY
 *
 * Non-invasive diagnostic UI for viewing provenance artifacts
 * Follows the pattern of other diagnostic utilities
 */
class ProvenanceDiagnostic {
    constructor() {
        this.isVisible = false;
        this.currentMessageId = null;
        this.overlay = null;
    }
    /**
     * Initialize diagnostic overlay
     */
    async initialize() {
        const windowWithService = window;
        if (!windowWithService.provenanceService) {
            console.warn('[ProvenanceDiagnostic] ProvenanceService not available');
            return;
        }
        // Create overlay container
        this.createOverlay();
        // Add to window for console access
        if (typeof window !== 'undefined') {
            Object.assign(window, { provenanceDiagnostic: this });
            console.log('[ProvenanceDiagnostic] Available at window.provenanceDiagnostic');
        }
    }
    /**
     * Create the diagnostic overlay UI
     */
    createOverlay() {
        // Check if overlay already exists
        const existing = document.getElementById('provenance-diagnostic-overlay');
        if (existing) {
            this.overlay = existing;
            return;
        }
        const overlay = document.createElement('div');
        overlay.id = 'provenance-diagnostic-overlay';
        overlay.style.cssText = `
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: #1a1a1a;
      color: #e0e0e0;
      z-index: 10000;
      transition: right 0.3s ease;
      box-shadow: -2px 0 10px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      overflow-y: auto;
      display: none;
    `;
        overlay.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #333;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h2 style="margin: 0; color: #fff; font-size: 18px;">🔐 Provenance Diagnostic</h2>
          <button id="provenance-close-btn" style="
            background: #333;
            border: none;
            color: #fff;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 4px;
          ">✕</button>
        </div>
        <div style="font-size: 12px; color: #888;">
          View provenance artifacts for messages
        </div>
      </div>
      <div id="provenance-content" style="padding: 20px;">
        <div style="color: #888; text-align: center; padding: 40px;">
          Select a message to view its provenance
        </div>
      </div>
    `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
        // Close button handler
        const closeBtn = document.getElementById('provenance-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hide();
            }
        });
    }
    /**
     * Show the diagnostic overlay
     */
    show() {
        if (!this.overlay) {
            this.createOverlay();
        }
        if (this.overlay) {
            this.overlay.style.display = 'block';
            setTimeout(() => {
                if (this.overlay) {
                    this.overlay.style.right = '0';
                }
            }, 10);
            this.isVisible = true;
        }
    }
    /**
     * Hide the diagnostic overlay
     */
    hide() {
        if (this.overlay) {
            this.overlay.style.right = '-400px';
            setTimeout(() => {
                if (this.overlay) {
                    this.overlay.style.display = 'none';
                }
            }, 300);
            this.isVisible = false;
        }
    }
    /**
     * Display provenance for a message
     */
    async displayMessageProvenance(messageId) {
        const windowWithService = window;
        const service = windowWithService.provenanceService;
        if (!service) {
            console.warn('[ProvenanceDiagnostic] Service not available');
            return;
        }
        this.currentMessageId = messageId;
        this.show();
        const content = document.getElementById('provenance-content');
        if (!content)
            return;
        content.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Loading...</div>';
        try {
            const artifacts = await service.getMessageProvenance(messageId);
            if (artifacts.length === 0) {
                content.innerHTML = `
          <div style="padding: 40px; text-align: center; color: #888;">
            <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
            <div>No provenance artifacts found for this message</div>
            <div style="font-size: 12px; margin-top: 10px; color: #666;">
              Message ID: ${messageId}
            </div>
          </div>
        `;
                return;
            }
            // Verify artifacts
            let verificationResults = [];
            const windowWithVerifier = window;
            const verifier = windowWithVerifier.provenanceVerifier;
            if (verifier) {
                verificationResults = await verifier.verifyArtifactChain(artifacts);
            }
            // Render artifacts
            let html = `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; color: #888; margin-bottom: 10px;">
            Message ID: <code style="background: #333; padding: 2px 6px; border-radius: 3px;">${messageId}</code>
          </div>
          <div style="font-size: 12px; color: #888;">
            ${artifacts.length} artifact(s) found
          </div>
        </div>
      `;
            artifacts.forEach((artifact, index) => {
                const verification = verificationResults[index] || { valid: null };
                const statusColor = verification.valid === true ? '#4caf50' :
                    verification.valid === false ? '#f44336' : '#888';
                const statusIcon = verification.valid === true ? '✓' :
                    verification.valid === false ? '✗' : '?';
                html += `
          <div style="
            background: #222;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-weight: bold; color: #fff;">
                ${(artifact.claim && typeof artifact.claim === 'object' && 'action' in artifact.claim ? artifact.claim.action : undefined) || 'unknown'} #${index + 1}
              </div>
              <div style="color: ${statusColor}; font-size: 18px;" title="${verification.valid === true ? 'Verified' : verification.valid === false ? 'Invalid' : 'Not verified'}">
                ${statusIcon}
              </div>
            </div>
            
            <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
              <div>Timestamp: ${artifact.timestamp && (typeof artifact.timestamp === 'string' || typeof artifact.timestamp === 'number' || artifact.timestamp instanceof Date) ? new Date(artifact.timestamp).toLocaleString() : String(artifact.timestamp || '')}</div>
              <div>ID: <code style="background: #333; padding: 2px 4px; border-radius: 3px; font-size: 11px;">${artifact['@id']}</code></div>
            </div>

            <details style="margin-top: 10px;">
              <summary style="cursor: pointer; color: #4a9eff; font-size: 12px;">View Details</summary>
              <div style="margin-top: 10px; padding: 10px; background: #1a1a1a; border-radius: 4px; font-size: 11px; font-family: monospace; overflow-x: auto;">
                <pre style="margin: 0; color: #e0e0e0;">${JSON.stringify(artifact, null, 2)}</pre>
              </div>
            </details>

            ${('error' in verification && verification.error) ? `
              <div style="margin-top: 8px; padding: 8px; background: #3a1a1a; border-left: 3px solid #f44336; border-radius: 4px; font-size: 11px; color: #ff6b6b;">
                Error: ${verification.error}
              </div>
            ` : ''}
          </div>
        `;
            });
            // Add export button
            html += `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
          <button id="provenance-export-btn" style="
            width: 100%;
            background: #4a9eff;
            border: none;
            color: #fff;
            padding: 10px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
          ">Export JSON-LD</button>
        </div>
      `;
            content.innerHTML = html;
            // Export button handler
            const exportBtn = document.getElementById('provenance-export-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportArtifacts(artifacts, messageId);
                });
            }
        }
        catch (error) {
            content.innerHTML = `
        <div style="padding: 20px; color: #f44336;">
          <div style="font-weight: bold; margin-bottom: 10px;">Error loading provenance</div>
          <div style="font-size: 12px; font-family: monospace;">${error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      `;
        }
    }
    /**
     * Export artifacts as JSON-LD file
     */
    exportArtifacts(artifacts, messageId) {
        const data = {
            '@context': 'https://schema.org',
            '@type': 'ProvenanceCollection',
            messageId: messageId,
            exportedAt: new Date().toISOString(),
            artifacts: artifacts
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `provenance-${messageId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    /**
     * Toggle overlay visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        }
        else {
            this.show();
        }
    }
}
// Export for browser use
if (typeof window !== 'undefined') {
    Object.assign(window, { provenanceDiagnostic: new ProvenanceDiagnostic() });
    console.log('[ProvenanceDiagnostic] Available at window.provenanceDiagnostic');
}
export default ProvenanceDiagnostic;

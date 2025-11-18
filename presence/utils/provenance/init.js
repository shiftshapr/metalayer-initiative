"use strict";
/**
 * PROVENANCE INITIALIZATION SCRIPT
 *
 * Non-invasive initialization that can be loaded alongside existing code
 * Does not modify any existing functionality
 */
(async function initializeProvenance() {
    'use strict';
    console.log('[Provenance] Initialization script loading...');
    // Load dependencies
    try {
        // Note: In a TypeScript build, these would be imported directly
        // For now, we'll load them as modules if they're compiled
        const chrome = window.chrome;
        if (!chrome?.runtime) {
            console.warn('[Provenance] Chrome extension API not available');
            return;
        }
        // Load ProvenanceService
        const serviceScript = document.createElement('script');
        serviceScript.src = chrome.runtime.getURL('utils/provenance/ProvenanceService.js');
        serviceScript.type = 'module';
        // Load Verifier
        const verifierScript = document.createElement('script');
        verifierScript.src = chrome.runtime.getURL('utils/provenance/verify.js');
        verifierScript.type = 'module';
        // Load Diagnostic
        const diagnosticScript = document.createElement('script');
        diagnosticScript.src = chrome.runtime.getURL('utils/provenance/ProvenanceDiagnostic.js');
        diagnosticScript.type = 'module';
        // Load Link Injector
        const injectorScript = document.createElement('script');
        injectorScript.src = chrome.runtime.getURL('utils/provenance/ProvenanceLinkInjector.js');
        injectorScript.type = 'module';
        // Wait for scripts to load
        await new Promise((resolve) => {
            let loaded = 0;
            const checkLoaded = () => {
                loaded++;
                if (loaded === 4)
                    resolve();
            };
            serviceScript.onload = checkLoaded;
            verifierScript.onload = checkLoaded;
            diagnosticScript.onload = checkLoaded;
            injectorScript.onload = checkLoaded;
            document.head.appendChild(serviceScript);
            document.head.appendChild(verifierScript);
            document.head.appendChild(diagnosticScript);
            document.head.appendChild(injectorScript);
        });
        // Wait a bit for modules to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        // Initialize service
        const service = window.provenanceService;
        if (service) {
            await service.initialize();
            // Initialize diagnostic and link injector if service is enabled
            if (service.isEnabled) {
                const diagnostic = window.provenanceDiagnostic;
                if (diagnostic) {
                    await diagnostic.initialize();
                }
                const injector = window.provenanceLinkInjector;
                if (injector) {
                    await injector.initialize();
                }
                // Add keyboard shortcut (Ctrl+Shift+P) to toggle diagnostic
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                        e.preventDefault();
                        const diag = window.provenanceDiagnostic;
                        if (diag) {
                            diag.toggle();
                        }
                    }
                });
                console.log('[Provenance] ✅ Initialized - Press Ctrl+Shift+P to open diagnostic');
                console.log('[Provenance] ✅ Link injector active - provenance links in DOM');
            }
            else {
                console.log('[Provenance] ⚠️ Service disabled - Enable with: localStorage.setItem("provenance_enabled", "true")');
            }
        }
        else {
            console.warn('[Provenance] Service not available after loading');
        }
    }
    catch (error) {
        console.error('[Provenance] Initialization failed:', error);
        // Fail silently - don't break the app
    }
})();

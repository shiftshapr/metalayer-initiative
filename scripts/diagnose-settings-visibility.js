/**
 * SETTINGS & VISIBILITY DIAGNOSTIC
 * --------------------------------
 * Run in the browser console (sidepanel) with:
 *   window.runSettingsVisibilityDiagnostic()
 * The script checks:
 *   • visibilitySettingsManager wiring (window attachment + initialization)
 *   • settingsHeadlineManager state (char counts, min length, save button)
 *   • window.refreshVisibilityAvatars + visibilityManager status
 *   • profile menu theme toggle readiness
 */
(function attachSettingsVisibilityDiagnostic() {
  if (typeof window === 'undefined') {
    console.warn('diagnose-settings-visibility: window is undefined');
    return;
  }

  async function runDiagnostic() {
    const report = { timestamp: new Date().toISOString(), notes: [] };

    const vsm = window.visibilitySettingsManager;
    if (!vsm) {
      report.notes.push('❌ visibilitySettingsManager missing on window');
    } else {
      report.notes.push(`✅ visibilitySettingsManager present (initialized: ${vsm.isInitialized ?? false})`);
      report.notes.push(`  • visibilityToggle DOM: ${!!document.getElementById('visibility-toggle')}`);
      report.notes.push(`  • statusSelect DOM: ${!!document.getElementById('status-select')}`);
      report.notes.push(`  • themeToggle handler attached: ${document.getElementById('theme-toggle')?.getAttribute('data-handler-attached') === 'true'}`);
    }

    const headlineManager = window.settingsHeadlineManager;
    if (!headlineManager) {
      report.notes.push('❌ settingsHeadlineManager missing on window');
    } else {
      const input = document.getElementById('settings-headline-input');
      const charCount = document.getElementById('headline-char-count');
      report.notes.push(`✅ Headline manager ready (input: ${!!input}, count: ${charCount?.textContent ?? 'n/a'})`);
      if (input) {
        const value = input.value.trim();
        report.notes.push(`  • current length: ${value.length}`);
        report.notes.push(`  • original headline: ${headlineManager.originalHeadline ?? ''}`);
        report.notes.push(`  • actions visible: ${document.getElementById('headline-actions')?.style.display || 'inline default'}`);
      }
    }

    const refreshFn = window.refreshVisibilityAvatars;
    if (!refreshFn) {
      report.notes.push('❌ window.refreshVisibilityAvatars missing');
    } else {
      report.notes.push('✅ window.refreshVisibilityAvatars is available');
    }

    const visibilityManager = window.visibilityManager;
    if (!visibilityManager) {
      report.notes.push('❌ window.visibilityManager missing');
    } else {
      const status = visibilityManager.getStatus?.();
      report.notes.push(`✅ visibilityManager loaded (active: ${status?.isActive ?? 'unknown'})`);
      report.notes.push(`  • currentPageId: ${status?.currentPageId ?? 'n/a'}`);
      report.notes.push(`  • visibleUsers cached: ${status?.visibleUsers ?? 'n/a'}`);
    }

    const profileThemeButton = document.getElementById('theme-toggle-btn');
    if (!profileThemeButton) {
      report.notes.push('⚠️ Profile menu theme button not found');
    } else {
      report.notes.push(`✅ Profile theme button present (text: ${profileThemeButton.textContent?.trim()})`);
    }

    console.group('[Settings Visibility Diagnostic]');
    report.notes.forEach(note => console.log(note));
    console.groupEnd();
    return report;
  }

  window.runSettingsVisibilityDiagnostic = runDiagnostic;
  console.log('✅ Settings Visibility Diagnostic ready. Run window.runSettingsVisibilityDiagnostic()');
})();

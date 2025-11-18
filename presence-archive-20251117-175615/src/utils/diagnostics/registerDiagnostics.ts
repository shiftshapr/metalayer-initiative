/**
 * Diagnostic Registration
 * Exposes diagnostic runners on the global window for console invocation.
 */

import { runMessageDisplayDiagnostic } from './MessageDisplayDiagnostic.js';
import { runComprehensiveFormattingDiagnostic } from './ComprehensiveFormattingDiagnostic.js';
import { runRootCauseDiagnostic } from './RootCauseDiagnostic.js';

const registerDiagnostics = () => {
  if (typeof window === 'undefined') return;

  const globalWindow = window as typeof window & {
    runMessageDisplayDiagnostic?: typeof runMessageDisplayDiagnostic;
    runComprehensiveFormattingDiagnostic?: typeof runComprehensiveFormattingDiagnostic;
    runRootCauseDiagnostic?: typeof runRootCauseDiagnostic;
    canopiDiagnostics?: {
      runAll: () => Promise<Record<string, unknown>>;
    };
  };

  const alreadyRegistered =
    globalWindow.runMessageDisplayDiagnostic &&
    globalWindow.runComprehensiveFormattingDiagnostic &&
    globalWindow.runRootCauseDiagnostic;

  if (alreadyRegistered) {
    return;
  }

  globalWindow.runMessageDisplayDiagnostic = runMessageDisplayDiagnostic;
  globalWindow.runComprehensiveFormattingDiagnostic = runComprehensiveFormattingDiagnostic;
  globalWindow.runRootCauseDiagnostic = runRootCauseDiagnostic;

  globalWindow.canopiDiagnostics = {
    runAll: async () => {
      const [message, formatting, rootCause] = await Promise.all([
        runMessageDisplayDiagnostic(),
        runComprehensiveFormattingDiagnostic(),
        runRootCauseDiagnostic()
      ]);
      return { message, formatting, rootCause };
    }
  };

  console.log('✅ Diagnostics registered. Run window.runMessageDisplayDiagnostic(), runComprehensiveFormattingDiagnostic(), or runRootCauseDiagnostic()');
};

registerDiagnostics();

export { registerDiagnostics };



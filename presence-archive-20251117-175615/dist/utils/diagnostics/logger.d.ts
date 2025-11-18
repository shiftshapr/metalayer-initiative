/**
 * Diagnostic Logger
 * Provides structured logging + event dispatch for diagnostics
 */
import { DiagnosticLogEntry } from './types.js';
export declare const recordDiagnosticLog: (entry: DiagnosticLogEntry) => DiagnosticLogEntry;
export declare const withConsoleGroup: <T>(label: string, fn: () => T) => T;
//# sourceMappingURL=logger.d.ts.map
/**
 * Diagnostic Options Types
 * Configuration options for diagnostic utilities
 */

export interface DiagnosticOptions {
  verbose?: boolean;
  includeDetails?: boolean;
  timeout?: number;
  onProgress?: (progress: number) => void;
}

export interface DiagnosticCallback<T = unknown> {
  (result: T): void;
}




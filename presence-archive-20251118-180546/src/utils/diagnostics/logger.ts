/**
 * Diagnostic Logger
 * Provides structured logging + event dispatch for diagnostics
 */

import { DiagnosticLogEntry } from './types.js';

const LOG_KEY = '__canopiDiagnosticLog__';

type DiagnosticStore = DiagnosticLogEntry[];

const getStore = (): DiagnosticStore => {
  const globalWindow = window as typeof window & {
    [LOG_KEY]?: DiagnosticStore;
  };

  if (!globalWindow[LOG_KEY]) {
    globalWindow[LOG_KEY] = [];
  }

  return globalWindow[LOG_KEY]!;
};

export const recordDiagnosticLog = (entry: DiagnosticLogEntry): DiagnosticLogEntry => {
  const enrichedEntry: DiagnosticLogEntry = {
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString()
  };

  const store = getStore();
  store.push(enrichedEntry);

  if (typeof console !== 'undefined') {
    console.group?.(`[Diagnostic] ${enrichedEntry.name}`);
    console.log('Status:', enrichedEntry.status.toUpperCase());
    console.log('Summary:', enrichedEntry.summary);
    if (enrichedEntry.metrics) {
      console.table(enrichedEntry.metrics);
    }
    if (enrichedEntry.issues?.length) {
      enrichedEntry.issues.forEach(issue => console.warn('•', issue));
    }
    console.groupEnd?.();
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent?.(
      new CustomEvent('canopi-diagnostic-results', {
        detail: enrichedEntry
      })
    );
  }

  return enrichedEntry;
};

export const withConsoleGroup = <T>(label: string, fn: () => T): T => {
  console.group?.(label);
  try {
    return fn();
  } finally {
    console.groupEnd?.();
  }
};






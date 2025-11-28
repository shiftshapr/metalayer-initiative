/**
 * Diagnostic result types
 */

export interface ComprehensiveDiagnosticResults {
  [key: string]: unknown;
}

export interface UrlNormalizationDiagnostic {
  [key: string]: unknown;
}

export interface MessageLoadingDiagnostic {
  [key: string]: unknown;
}

export interface VisibilityTabDiagnostic {
  [key: string]: unknown;
}

export interface ApiConnectivityDiagnostic {
  [key: string]: unknown;
}

export interface DatabaseQueriesDiagnostic {
  [key: string]: unknown;
}

export interface ModuleDiagnosticResult {
  [key: string]: unknown;
}

export interface DiagnosticResult {
  [key: string]: unknown;
}

export interface HeadlineDisplayNameDiagnosticResult {
  userId?: string;
  timestamp: string;
  checks?: {
    chromeStorage?: {
      headline?: string | null;
      displayName?: string | null;
      status?: string;
      error?: string;
    };
    userPreferencesManager?: {
      headline?: string | null;
      displayName?: string | null;
      status?: string;
      error?: string;
    };
    database?: {
      headline?: string | null;
      displayName?: string | null;
      status?: string;
      error?: string;
    };
    [key: string]: unknown;
  };
  saveTest?: {
    displayName?: {
      saveResult?: unknown;
      savedToDB?: boolean;
      dbValue?: string;
      expectedValue?: string;
    };
    error?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface CssComputedValuesDiagnosticResult {
  timestamp: string;
  elements?: Array<{
    selector: string;
    exists: boolean;
    computed?: Record<string, string>;
    rect?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface NetworkRequestsDiagnosticResult {
  timestamp: string;
  recentRequests?: Array<{
    url?: string;
    method?: string;
    body?: unknown;
    duration?: number;
    success?: boolean;
    response?: string;
    [key: string]: unknown;
  }>;
  errors?: Array<{
    type?: string;
    error?: string;
    stack?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface UserPreferencesManagerDiagnosticResult {
  [key: string]: unknown;
}

export interface UserPreferencesManagerState {
  [key: string]: unknown;
}

export interface ThemeDiagnosticResult {
  timestamp: string;
  theme?: {
    dataAttributes?: {
      body?: string | null;
      html?: string | null;
    };
    computedStyles?: {
      body?: {
        backgroundColor?: string;
        color?: string;
      };
      html?: {
        backgroundColor?: string;
        color?: string;
      };
    };
    userPreferencesManager?: string | null;
    currentUser?: string | null;
    database?: string | null;
    toggleState?: {
      checked?: boolean;
      exists?: boolean;
    };
    [key: string]: unknown;
  };
  errors?: Array<{
    type: string;
    error?: string;
  }>;
  [key: string]: unknown;
}

export interface PreferencesColumnStatusResult {
  [key: string]: unknown;
}

export interface ApiRequestResponseResult {
  [key: string]: unknown;
}

export interface SidepanelSettingsInjectionResult extends DiagnosticResult {
  timestamp: string;
  windowFlags: {
    hasModuleGraph: boolean;
    moduleGraphKeys: string[];
    isSidepanelReady: boolean;
    disableLegacyFlag: boolean;
  };
  storageContracts: {
    hasUserPreferencesManager: boolean;
    isUserPreferencesInitialized: boolean;
    hasUnifiedSettingsStorage: boolean;
    hasSaveSetting: boolean;
    hasGetSetting: boolean;
  };
  managers: {
    displayNameManager: {
      registered: boolean;
      hasInitialize: boolean;
    };
    settingsHeadlineManager: {
      registered: boolean;
      hasInitialize: boolean;
    };
  };
  notes?: string[];
  errors?: string[];
  [key: string]: unknown;
}

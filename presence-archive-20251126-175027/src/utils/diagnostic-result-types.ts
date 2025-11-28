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

export interface UserHoverGlobalDiagnosticResult extends DiagnosticResult {
  timestamp: string;
  windowCurrentUserId?: string | null;
  stateManagerCurrentUserId?: string | null;
  windowHasCurrentUser: boolean;
  stateManagerHasCurrentUser: boolean;
  userHoverModal?: {
    exists: boolean;
    hasInitialize: boolean;
    viewerUserId?: string | null;
    domAttached?: boolean;
  };
  issues: string[];
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

export interface LoadChatHistoryConnectivityResult extends DiagnosticResult {
  timestamp: string;
  apiBaseURL: string | null;
  backendHealth: {
    status: string;
    lastChecked: number | null;
    lastError: string | null;
    retryDelayMs: number;
    consecutiveFailures: number;
  } | null;
  connectivityChecks: {
    baseURL?: {
      success: boolean;
      status?: number;
      error?: string;
      duration?: number;
    };
    messagesEndpoint?: {
      success: boolean;
      status?: number;
      error?: string;
      duration?: number;
    };
    usersEndpoint?: {
      success: boolean;
      status?: number;
      error?: string;
      duration?: number;
    };
  };
  issues: string[];
  [key: string]: unknown;
}

export interface ProfileLoggingFirehoseDiagnosticResult extends DiagnosticResult {
  timestamp: string;
  environment: 'production' | 'development' | 'unknown';
  loggerLevel?: string;
  profileDebugLogCount: number;
  sd1BurstLogCount: number;
  debugGuardEnabled: boolean;
  recentMessages?: string[];
  warnings?: string[];
}

export interface RealtimePresenceTypingResult extends DiagnosticResult {
  timestamp: string;
  hasClient: boolean;
  pageId: string | null;
  sampleCount: number;
  issues: string[];
  samples?: Array<{
    id: string;
    email: string;
    isActive: boolean;
    auraColor: string;
    keys: string[];
  }>;
}

export interface ActiveCommunityStateDiagnosticResult extends DiagnosticResult {
  timestamp: string;
  uiActiveCommunities: string[];
  legacyActiveCommunities: string[];
  windowActiveCommunities: string[];
  windowGetStateCommunities: string[];
  issues: string[];
  recommendations?: string[];
}

export interface BackendConnectivityDiagnosticResult extends DiagnosticResult {
  timestamp: string;
  baseUrl: string;
  fallbackUrl?: string;
  checks: Array<{
    url: string;
    status: 'success' | 'failed';
    latencyMs?: number;
    error?: string;
    note?: string;
  }>;
  issues: string[];
}

export interface LoadHistoryRegistrationResult extends DiagnosticResult {
  timestamp: string;
  loadChatHistoryAvailable: boolean;
  stateManagerAvailable: boolean;
  activeCommunityCount: number;
  issues: string[];
  recommendations?: string[];
}

/**
 * Diagnostic Result Types
 * Specific result types for different diagnostic categories
 */

export interface BaseDiagnosticResult {
  timestamp: string;
  error?: string;
}

export interface HeadlineDisplayNameDiagnosticResult extends BaseDiagnosticResult {
  userId?: string;
  checks: {
    chromeStorage?: {
      headline?: string | null;
      displayName?: string | null;
      status?: string;
      error?: string;
    };
    userPreferencesManager?: {
      headline?: string | null;
      displayName?: string | null;
      isInitialized?: boolean;
      status?: string;
      error?: string;
    };
    currentUser?: {
      headline?: string | null;
      displayName?: string | null;
      status?: string;
    };
    database?: {
      headline?: string | null;
      displayName?: string | null;
      displayNameSnakeCase?: string | null;
      status?: string;
      error?: string;
    };
  };
  consistency?: {
    headline?: {
      uniqueValues: string[];
      isConsistent: boolean;
      sourceCount: number;
    };
    displayName?: {
      uniqueValues: string[];
      isConsistent: boolean;
      sourceCount: number;
    };
  };
  saveTest?: {
    headline?: {
      saveResult: unknown;
      savedToDB: boolean;
      dbValue?: string;
      expectedValue: string;
    };
    displayName?: {
      saveResult: unknown;
      savedToDB: boolean;
      dbValue?: string;
      expectedValue: string;
    };
    error?: string;
  };
}

export interface CssComputedValuesDiagnosticResult extends BaseDiagnosticResult {
  elements: Array<{
    selector: string;
    exists: boolean;
    computed?: {
      display: string;
      visibility: string;
      opacity: string;
      color: string;
      backgroundColor: string;
      width: string;
      height: string;
      margin: string;
      padding: string;
      border: string;
      position: string;
      zIndex: string;
      fontSize: string;
      fontWeight: string;
    };
    boundingRect?: {
      x: number;
      y: number;
      width: number;
      height: number;
      top: number;
      left: number;
      right: number;
      bottom: number;
    };
    attributes?: {
      dataTheme?: string | null;
      className?: string;
      id?: string;
    };
  }>;
}

export interface NetworkRequestEntry {
  url: string;
  duration: number;
  size: number;
  type: string;
  startTime: number;
  responseEnd: number;
}

export interface NetworkRequestsDiagnosticResult extends BaseDiagnosticResult {
  requests: NetworkRequestEntry[];
}

export interface UserPreferencesManagerState {
  isInitialized: boolean;
  userId?: string;
  isOnline?: boolean;
  preferences?: Record<string, unknown>;
  metrics?: {
    saves?: number;
    errors?: number;
    retries?: number;
  };
  batchQueueSize?: number;
  retryQueueSize?: number;
}

export interface UserPreferencesManagerDiagnosticResult extends BaseDiagnosticResult {
  available: boolean;
  state: UserPreferencesManagerState | null;
}

export interface ThemeDiagnosticResult extends BaseDiagnosticResult {
  theme: {
    dataAttributes?: {
      body?: string | null;
      html?: string | null;
    };
    computedStyles?: {
      body?: {
        backgroundColor: string;
        color: string;
      };
      html?: {
        backgroundColor: string;
        color: string;
      };
    };
    chromeStorage?: string | null;
    userPreferencesManager?: string | null;
    currentUser?: string | null;
    database?: string | null | { error: string };
    toggleState?: {
      checked?: boolean;
      exists: boolean;
    };
  };
}

export interface UrlNormalizationDiagnostic {
  rawUri?: string;
  normalizedUrl?: string;
  pageId?: string;
  normalizationWorking?: boolean;
  normalizeCurrentUrlWorking?: boolean;
  currentUrlData?: { normalizedUrl?: string; pageId?: string; rawUrl?: string };
  windowCurrentUrlData?: { normalizedUrl?: string; pageId?: string; rawUrl?: string };
  error?: string;
  stack?: string;
}

export interface MessageLoadingDiagnostic {
  loadChatHistoryAvailable?: boolean;
  communities?: number;
  activeCommunities?: string[];
  activeCommunitiesCount?: number;
  apiAvailable?: boolean;
  testApiCall?: {
    success: boolean;
    conversations?: number;
    messages?: number;
    response?: { conversations?: unknown[]; messages?: unknown[] };
    error?: string;
    stack?: string;
  };
  supabaseAvailable?: boolean;
  supabaseFromAvailable?: boolean;
  chatMessagesElement?: boolean;
  chatMessagesVisible?: boolean;
  chatMessagesContent?: string;
  messageElementsCount?: number;
  error?: string;
  stack?: string;
}

export interface VisibilityTabDiagnostic {
  visibilityTabElement?: boolean;
  visibilityTabActive?: boolean;
  visibilityTabDisplay?: string;
  updateVisibleTabAvailable?: boolean;
  visibilityManagerAvailable?: boolean;
  currentVisibilityData?: Array<Record<string, unknown>>;
  currentVisibilityDataUnfiltered?: Record<string, unknown>;
  currentUser?: { id?: string; [key: string]: unknown };
  currentUserId?: string;
  visibilityModalElement?: boolean;
  visibilityModalDisplay?: string;
  visibilityModalZIndex?: string;
  visibilityModalHandlerAvailable?: boolean;
  visibilityModalHandlerInitialized?: boolean;
  visibilityCheck?: {
    isVisible?: boolean;
    working?: boolean;
    error?: string;
  };
  pageUsers?: {
    count?: number;
    users?: Array<Record<string, unknown>>;
    working?: boolean;
    error?: string;
  };
  error?: string;
  stack?: string;
}

export interface ApiConnectivityDiagnostic {
  apiModuleAvailable?: boolean;
  apiGetChatHistoryAvailable?: boolean;
  apiBaseUrl?: string;
  healthCheck?: {
    success?: boolean;
    status?: number;
    statusText?: string;
    error?: string;
  };
  error?: string;
  stack?: string;
}

export interface DatabaseQueriesDiagnostic {
  supabaseAvailable?: boolean;
  messagesQuery?: {
    success?: boolean;
    count?: number;
    error?: string;
    sample?: Array<Record<string, unknown>>;
  };
  presenceQuery?: {
    success?: boolean;
    count?: number;
    error?: string;
    sample?: Array<Record<string, unknown>>;
  };
  error?: string;
  stack?: string;
}

export interface ModuleDiagnosticResult {
  success: boolean;
  timestamp?: string;
  summary?: Record<string, unknown>;
  error?: string;
}

export interface ComprehensiveDiagnosticResults {
  timestamp: string;
  urlNormalization: UrlNormalizationDiagnostic;
  messageLoading: MessageLoadingDiagnostic;
  visibilityTab: VisibilityTabDiagnostic;
  apiConnectivity: ApiConnectivityDiagnostic;
  databaseQueries: DatabaseQueriesDiagnostic;
  errors: Array<{
    type: string;
    message: string;
    stack?: string;
  }>;
  moduleDiagnostics: Record<string, ModuleDiagnosticResult>;
}

export interface PreferencesColumnStatusResult extends BaseDiagnosticResult {
  migration?: {
    preferencesInResponse?: boolean;
    preferencesValue?: unknown;
    hasNewColumns?: {
      theme?: boolean;
      headline?: boolean;
      displayName?: boolean;
      auraIntensity?: boolean;
    };
    error?: string;
  };
  schema?: {
    note?: string;
    recommendation?: string;
  };
}

export interface ApiRequestResponseResult extends BaseDiagnosticResult {
  recentRequests?: Array<{
    url: string;
    method: string;
    body?: unknown;
    duration?: number;
    success?: boolean;
    response?: string;
  }>;
  errors?: Array<{
    type: string;
    error: string;
    stack?: string;
  }>;
}

export type DiagnosticResult =
  | HeadlineDisplayNameDiagnosticResult
  | CssComputedValuesDiagnosticResult
  | NetworkRequestsDiagnosticResult
  | UserPreferencesManagerDiagnosticResult
  | ThemeDiagnosticResult
  | PreferencesColumnStatusResult
  | ApiRequestResponseResult
  | BaseDiagnosticResult;


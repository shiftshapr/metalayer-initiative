/**
 * COMPREHENSIVE DIAGNOSTIC TOOL
 * Root Cause Analysis for Messages and Visibility Tab Issues
 */

import { handleError } from './ErrorHandler.js';
import { Logger } from './Logger.js';
import type { SupabaseRealtimeClientBridge } from '../types/realtime.js';
import type {
  ComprehensiveDiagnosticResults,
  UrlNormalizationDiagnostic,
  MessageLoadingDiagnostic,
  VisibilityTabDiagnostic,
  ApiConnectivityDiagnostic,
  DatabaseQueriesDiagnostic,
  ModuleDiagnosticResult
} from './diagnostic-result-types';

// Type definitions
interface DiagnosticResults extends ComprehensiveDiagnosticResults {
  timestamp: string;
  urlNormalization: UrlNormalizationDiagnostic;
  messageLoading: MessageLoadingDiagnostic;
  visibilityTab: VisibilityTabDiagnostic;
  apiConnectivity: ApiConnectivityDiagnostic;
  databaseQueries: DatabaseQueriesDiagnostic;
  errors: Array<{
    type: string;
    message?: string;
    error?: string;
    stack?: string;
  }>;
  moduleDiagnostics: Record<string, ModuleDiagnosticResult>;
}

interface WindowWithDiagnostics {
  getCurrentPageUri?: () => Promise<string>;
  normalizeUrl?: (uri: string) => Promise<{ normalizedUrl: string; pageId: string }>;
  normalizeCurrentUrl?: () => Promise<{ normalizedUrl?: string; pageId?: string; rawUrl?: string } | { normalizedUrl?: string; pageId?: string }>;
  currentUrlData?: { normalizedUrl?: string; pageId?: string; rawUrl?: string };
  loadChatHistory?: (communityIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  stateManager?: {
    get: (key: string) => Promise<unknown>;
  };
  api?: {
    getChatHistory: (communityId: string, conversationId: string | null, uri: string) => Promise<{ conversations?: unknown[]; messages?: unknown[] }>;
  };
  supabase?: {
    from: (table: string) => {
      select: (...args: unknown[]) => {
        eq: (column: string, value: unknown) => unknown;
        is: (column: string, value: unknown) => unknown;
        limit: (count: number) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
  updateVisibleTab?: () => void;
  currentVisibilityData?: Array<Record<string, unknown>>;
  currentVisibilityDataUnfiltered?: Record<string, unknown>;
  currentUser?: {
    id?: string;
    [key: string]: unknown;
  };
  visibilityModalHandler?: {
    isInitialized: boolean;
    checkVisibility: () => Promise<boolean>;
  };
  supabaseRealtimeClient?: SupabaseRealtimeClientBridge;
  API_BASE_URL?: string;
  runMessageDisplayDiagnostic?: () => Promise<Record<string, unknown>>;
  runComprehensiveFormattingDiagnostic?: () => Promise<Record<string, unknown>>;
  runRootCauseDiagnostic?: () => Promise<Record<string, unknown>>;
  comprehensiveDiagnosticResults?: DiagnosticResults;
}

declare const window: Window & WindowWithDiagnostics;

class ComprehensiveDiagnostic {
  private results: DiagnosticResults;

  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      urlNormalization: {},
      messageLoading: {},
      visibilityTab: {},
      apiConnectivity: {},
      databaseQueries: {},
      errors: [],
      moduleDiagnostics: {}
    };
  }

  async runFullDiagnostic(): Promise<DiagnosticResults> {
    Logger.debug('🔍 === COMPREHENSIVE DIAGNOSTIC STARTING ===', null, 'general');
    
    try {
      await this.diagnoseUrlNormalization();
      await this.diagnoseMessageLoading();
      await this.diagnoseVisibilityTab();
      await this.diagnoseApiConnectivity();
      await this.diagnoseDatabaseQueries();
      await this.runModuleDiagnostics();
      
      this.generateReport();
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
      if (Array.isArray(this.results.errors)) {
        this.results.errors.push({
          type: 'diagnostic_error',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    
    }
    
    return this.results;
  }

  async diagnoseUrlNormalization(): Promise<void> {
    Logger.debug('🔍 DIAGNOSTIC: Checking URL normalization...', null, 'general');
    const section = this.results.urlNormalization;
    
    try {
      // Get current page URI
      const rawUri = await window.getCurrentPageUri?.() || window.location?.href || 'unknown';
      section.rawUri = rawUri;
      Logger.debug('🔍 DIAGNOSTIC: Raw URI:', { rawUri }, 'general');
      
      // Test normalization
      if (typeof window.normalizeUrl === 'function') {
        const normalized = await window.normalizeUrl(rawUri);
        section.normalizedUrl = normalized.normalizedUrl;
        section.pageId = normalized.pageId;
        section.normalizationWorking = true;
        Logger.debug('✅ DIAGNOSTIC: URL normalization working', null, 'general');
        Logger.debug('🔍 DIAGNOSTIC: Normalized URL:', { normalizedUrl: normalized.normalizedUrl }, 'general');
        Logger.debug('🔍 DIAGNOSTIC: Page ID:', { pageId: normalized.pageId }, 'general');
      } else {
        section.normalizationWorking = false;
        section.error = 'window.normalizeUrl not available';
        Logger.error('❌ DIAGNOSTIC: window.normalizeUrl not available', null, 'general');
      }
      
      // Check normalizeCurrentUrl
      if (typeof window.normalizeCurrentUrl === 'function') {
        const currentUrlData = await window.normalizeCurrentUrl();
        section.currentUrlData = currentUrlData;
        section.normalizeCurrentUrlWorking = true;
        Logger.debug('✅ DIAGNOSTIC: normalizeCurrentUrl working', null, 'general');
        Logger.debug('🔍 DIAGNOSTIC: Current URL data:', currentUrlData, 'general');
      } else {
        section.normalizeCurrentUrlWorking = false;
        section.error = 'window.normalizeCurrentUrl not available';
        Logger.error('❌ DIAGNOSTIC: window.normalizeCurrentUrl not available', null, 'general');
      }
      
      // Check window.currentUrlData
      section.windowCurrentUrlData = window.currentUrlData as { normalizedUrl?: string; pageId?: string; rawUrl?: string } | undefined;
      Logger.debug('🔍 DIAGNOSTIC: window.currentUrlData:', window.currentUrlData, 'general');
      
    } catch (error: unknown) {
      section.error = error instanceof Error ? error.message : String(error);
      section.stack = error instanceof Error ? error.stack : undefined;
      const pageId = (typeof section.pageId === 'string' ? section.pageId : undefined) || window.currentUrlData?.pageId || undefined;
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic',
            pageId
            }
        });;
    
    }
  }

  async diagnoseMessageLoading(): Promise<void> {
    Logger.debug('🔍 DIAGNOSTIC: Checking message loading...', null, 'general');
    const section = this.results.messageLoading;
    
    try {
      // Check loadChatHistory availability
      section.loadChatHistoryAvailable = typeof window.loadChatHistory === 'function';
      Logger.debug('🔍 DIAGNOSTIC: loadChatHistory available:', section.loadChatHistoryAvailable, 'general');
      
      // Check active communities
      const communitiesRaw = await window.stateManager?.get('communities');
      const communities = Array.isArray(communitiesRaw) ? communitiesRaw : [];
      const activeCommunitiesRaw = await window.stateManager?.get('ui.activeCommunities');
      const activeCommunities = Array.isArray(activeCommunitiesRaw) ? activeCommunitiesRaw : [];
      section.communities = communities.length;
      section.activeCommunities = activeCommunities as string[];
      section.activeCommunitiesCount = activeCommunities.length;
      Logger.debug('🔍 DIAGNOSTIC: Communities:', communities.length, 'general');
      Logger.debug('🔍 DIAGNOSTIC: Active communities:', activeCommunities, 'general');
      
      // Check API availability
      section.apiAvailable = typeof window.api !== 'undefined' && typeof window.api.getChatHistory === 'function';
      Logger.debug('🔍 DIAGNOSTIC: API available:', section.apiAvailable, 'general');
      
      // Test API call with current URL
      if (section.apiAvailable && activeCommunities.length > 0) {
        try {
          const urlData = await window.normalizeCurrentUrl?.();
          const rawUrl = (urlData && 'rawUrl' in urlData ? urlData.rawUrl : undefined);
          const normalizedUrl = urlData?.normalizedUrl;
          const testUri: string = (rawUrl || normalizedUrl || 'https://www.google.com/') as string;
          
          Logger.debug('🔍 DIAGNOSTIC: Testing API call with URI:', testUri, 'general');
          const testResponse = await window.api!.getChatHistory(
            activeCommunities[0],
            null,
            testUri
          );
          
          section.testApiCall = {
            success: true,
            conversations: (testResponse as { conversations?: unknown[] })?.conversations?.length || 0,
            messages: (testResponse as { messages?: unknown[] })?.messages?.length || 0,
            response: testResponse as { conversations?: unknown[]; messages?: unknown[] }
          };
          Logger.debug('✅ DIAGNOSTIC: API call successful', null, 'general');
          const testApiCall = section.testApiCall as { conversations?: number; messages?: number } | undefined;
          Logger.debug('🔍 DIAGNOSTIC: Conversations found:', testApiCall?.conversations, 'general');
          Logger.debug('🔍 DIAGNOSTIC: Messages found:', testApiCall?.messages, 'general');
        } catch (apiError) {
          section.testApiCall = {
            success: false,
            error: apiError instanceof Error ? apiError.message : String(apiError),
            stack: apiError instanceof Error ? apiError.stack : undefined
          };
          handleError(apiError, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
        
    }
      }
      
      // Check Supabase client
      section.supabaseAvailable = typeof window.supabase !== 'undefined' && window.supabase !== null;
      section.supabaseFromAvailable = section.supabaseAvailable && window.supabase && typeof window.supabase.from === 'function';
      Logger.debug('🔍 DIAGNOSTIC: Supabase available:', section.supabaseAvailable, 'general');
      Logger.debug('🔍 DIAGNOSTIC: Supabase.from available:', section.supabaseFromAvailable, 'general');
      
      // Check DOM elements
      const chatMessages = document.querySelector('.chat-messages');
      section.chatMessagesElement = !!chatMessages;
      if (chatMessages) {
        section.chatMessagesVisible = (chatMessages as HTMLElement).offsetParent !== null;
        section.chatMessagesContent = chatMessages.innerHTML.substring(0, 200);
        const messageElements = chatMessages.querySelectorAll('.message');
        section.messageElementsCount = messageElements.length;
        Logger.debug('🔍 DIAGNOSTIC: Message elements in DOM:', messageElements.length, 'general');
      }
      
    } catch (error: unknown) {
      section.error = error instanceof Error ? error.message : String(error);
      section.stack = error instanceof Error ? error.stack : undefined;
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
    
    }
  }

  async diagnoseVisibilityTab(): Promise<void> {
    Logger.debug('🔍 DIAGNOSTIC: Checking visibility tab...', null, 'general');
    const section = this.results.visibilityTab;
    
    try {
      // Check DOM elements
      const visibilityTab = document.getElementById('visibility-tab');
      section.visibilityTabElement = !!visibilityTab;
      section.visibilityTabActive = visibilityTab?.classList.contains('active') || false;
      section.visibilityTabDisplay = visibilityTab ? window.getComputedStyle(visibilityTab).display : 'not found';
      Logger.debug('🔍 DIAGNOSTIC: Visibility tab element:', section.visibilityTabElement, 'general');
      Logger.debug('🔍 DIAGNOSTIC: Visibility tab active:', section.visibilityTabActive, 'general');
      Logger.debug('🔍 DIAGNOSTIC: Visibility tab display:', section.visibilityTabDisplay, 'general');
      
      // Check updateVisibleTab function
      section.updateVisibleTabAvailable = typeof window.updateVisibleTab === 'function';
      Logger.debug('🔍 DIAGNOSTIC: updateVisibleTab available:', section.updateVisibleTabAvailable, 'general');
      
      // Check VisibilityManager registration via update hook
      section.visibilityManagerAvailable = section.updateVisibleTabAvailable;
      Logger.debug('🔍 DIAGNOSTIC: VisibilityManager hook available:', section.visibilityManagerAvailable, 'general');
      
      // Check visibility data
      section.currentVisibilityData = window.currentVisibilityData;
      section.currentVisibilityDataUnfiltered = window.currentVisibilityDataUnfiltered;
      Logger.debug('🔍 DIAGNOSTIC: Current visibility data:', window.currentVisibilityData, 'general');
      Logger.debug('🔍 DIAGNOSTIC: Unfiltered visibility data:', window.currentVisibilityDataUnfiltered, 'general');
      
      // Check current user
      section.currentUser = window.currentUser;
      section.currentUserId = window.currentUser?.id;
      Logger.debug('🔍 DIAGNOSTIC: Current user:', window.currentUser, 'general');
      Logger.debug('🔍 DIAGNOSTIC: Current user ID:', section.currentUserId, 'general');
      
      // Check visibility modal
      const visibilityModal = document.getElementById('visibility-access-modal');
      section.visibilityModalElement = !!visibilityModal;
      section.visibilityModalDisplay = visibilityModal ? window.getComputedStyle(visibilityModal).display : 'not found';
      section.visibilityModalZIndex = visibilityModal ? window.getComputedStyle(visibilityModal).zIndex : 'not found';
      Logger.debug('🔍 DIAGNOSTIC: Visibility modal element:', section.visibilityModalElement, 'general');
      Logger.debug('🔍 DIAGNOSTIC: Visibility modal display:', section.visibilityModalDisplay, 'general');
      Logger.debug('🔍 DIAGNOSTIC: Visibility modal z-index:', section.visibilityModalZIndex, 'general');
      
      // Check VisibilityModalHandler
      section.visibilityModalHandlerAvailable = typeof window.visibilityModalHandler !== 'undefined';
      section.visibilityModalHandlerInitialized = window.visibilityModalHandler?.isInitialized || false;
      Logger.debug('🔍 DIAGNOSTIC: VisibilityModalHandler available:', section.visibilityModalHandlerAvailable, 'general');
      Logger.debug('🔍 DIAGNOSTIC: VisibilityModalHandler initialized:', section.visibilityModalHandlerInitialized, 'general');
      
      // Test visibility check
      if (window.visibilityModalHandler) {
        try {
          const isVisible = await window.visibilityModalHandler.checkVisibility();
          section.visibilityCheck = {
            isVisible: isVisible,
            working: true
          };
          Logger.debug('🔍 DIAGNOSTIC: User visibility check:', isVisible, 'general');
        } catch (error: unknown) {
          section.visibilityCheck = {
            error: error instanceof Error ? error.message : String(error),
            working: false
          };
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
        
    }
      }
      
      // Check visibility users
      if (window.supabaseRealtimeClient && typeof window.supabaseRealtimeClient.getPageUsers === 'function') {
        let urlData: { pageId?: string } | undefined;
        try {
          urlData = await window.normalizeCurrentUrl?.();
          const pageId = urlData?.pageId || 'google_com_';
          Logger.debug('🔍 DIAGNOSTIC: Testing getPageUsers with pageId:', pageId, 'general');
          const users = await window.supabaseRealtimeClient.getPageUsers(pageId);
          section.pageUsers = {
            count: users?.length || 0,
            users: users ? users.map(u => ({ ...u } as Record<string, unknown>)) : [],
            working: true
          };
          Logger.debug('✅ DIAGNOSTIC: getPageUsers working', { foundUsers: users?.length || 0 }, 'general');
        } catch (error: unknown) {
          section.pageUsers = {
            error: error instanceof Error ? error.message : String(error),
            working: false
          };
          const pageId = urlData?.pageId || window.currentUrlData?.pageId || undefined;
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic',
            pageId
            }
        });;
        
    }
      }
      
    } catch (error: unknown) {
      section.error = error instanceof Error ? error.message : String(error);
      section.stack = error instanceof Error ? error.stack : undefined;
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
    
    }
  }

  async diagnoseApiConnectivity(): Promise<void> {
    Logger.debug('🔍 DIAGNOSTIC: Checking API connectivity...', null, 'general');
    const section = this.results.apiConnectivity;
    
    try {
      // Check API module
      section.apiModuleAvailable = typeof window.api !== 'undefined';
      section.apiGetChatHistoryAvailable = typeof window.api?.getChatHistory === 'function';
      Logger.debug('🔍 DIAGNOSTIC: API module available:', section.apiModuleAvailable, 'general');
      Logger.debug('🔍 DIAGNOSTIC: api.getChatHistory available:', section.apiGetChatHistoryAvailable, 'general');
      
      // Check API base URL
      section.apiBaseUrl = window.API_BASE_URL || 'not set';
      Logger.debug('🔍 DIAGNOSTIC: API base URL:', section.apiBaseUrl, 'general');
      
      // Test API endpoint
      if (section.apiModuleAvailable) {
        try {
          const testUrl = `${section.apiBaseUrl}/health`;
          const response = await fetch(testUrl, { method: 'GET' });
          section.healthCheck = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText
          };
          Logger.debug('🔍 DIAGNOSTIC: API health check:', section.healthCheck, 'general');
        } catch (error: unknown) {
          section.healthCheck = {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
        
    }
      }
      
    } catch (error: unknown) {
      section.error = error instanceof Error ? error.message : String(error);
      section.stack = error instanceof Error ? error.stack : undefined;
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
    
    }
  }

  async diagnoseDatabaseQueries(): Promise<void> {
    Logger.debug('🔍 DIAGNOSTIC: Checking database queries...', null, 'general');
    const section = this.results.databaseQueries;
    
    try {
      // Check Supabase connection
      section.supabaseAvailable = typeof window.supabase !== 'undefined' && window.supabase !== null;
      Logger.debug('🔍 DIAGNOSTIC: Supabase available:', section.supabaseAvailable, 'general');
      
      if (section.supabaseAvailable) {
        // Test messages query
        try {
          const urlData = await window.normalizeCurrentUrl?.();
          const pageId = urlData?.pageId || 'google_com_';
          
          Logger.debug('🔍 DIAGNOSTIC: Testing messages query with pageId:', pageId, 'general');
          if (!window.supabase) return;
          const supabaseQuery = (window.supabase as unknown) as { from: (table: string) => { select: (columns: string) => { is: (col: string, val: unknown) => { eq: (col: string, val: unknown) => { limit: (count: number) => Promise<{ data: unknown[] | null; error: { message: string } | null }> } } } } };
          const messagesResult = await supabaseQuery.from('messages').select('*').is('deleted_at', null).eq('page_id', pageId).limit(10);
          const { data: messages, error: messagesError } = messagesResult;
          
          section.messagesQuery = {
            success: !messagesError,
            count: (messages as Array<Record<string, unknown>> | null)?.length || 0,
            error: messagesError?.message,
            sample: (messages as Array<Record<string, unknown>> | null)?.slice(0, 3) as Array<Record<string, unknown>> | undefined
          };
          Logger.debug('🔍 DIAGNOSTIC: Messages query result:', section.messagesQuery, 'general');
          
        } catch (error: unknown) {
          section.messagesQuery = {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
        
    }
        
        // Test presence query
        try {
          const urlData = await window.normalizeCurrentUrl?.();
          const pageId = urlData?.pageId || 'google_com_';
          
          Logger.debug('🔍 DIAGNOSTIC: Testing presence query with pageId:', pageId, 'general');
          if (!window.supabase) return;
          const supabaseQuery = (window.supabase as unknown) as { from: (table: string) => { select: (columns: string) => { eq: (col: string, val: unknown) => { limit: (count: number) => Promise<{ data: unknown[] | null; error: { message: string } | null }> } } } };
          const presenceResult = await supabaseQuery.from('presence').select('*').eq('page_id', pageId).limit(10);
          const { data: presence, error: presenceError } = presenceResult;
          
          section.presenceQuery = {
            success: !presenceError,
            count: (presence as Array<Record<string, unknown>> | null)?.length || 0,
            error: presenceError?.message,
            sample: (presence as Array<Record<string, unknown>> | null)?.slice(0, 3) as Array<Record<string, unknown>> | undefined
          };
          Logger.debug('🔍 DIAGNOSTIC: Presence query result:', section.presenceQuery, 'general');
          
        } catch (error: unknown) {
          section.presenceQuery = {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
        
    }
      }
      
    } catch (error: unknown) {
      section.error = error instanceof Error ? error.message : String(error);
      section.stack = error instanceof Error ? error.stack : undefined;
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
    
    }
  }

  async runModuleDiagnostics(): Promise<void> {
    Logger.debug('🔍 DIAGNOSTIC: Running TypeScript module diagnostics (if available)...', null, 'general');
    const section = this.results.moduleDiagnostics;

    const runners = [
      {
        key: 'messageDisplay',
        fn: window.runMessageDisplayDiagnostic,
        label: 'Message Display Diagnostic'
      },
      {
        key: 'formatting',
        fn: window.runComprehensiveFormattingDiagnostic,
        label: 'Comprehensive Formatting Diagnostic'
      },
      {
        key: 'rootCause',
        fn: window.runRootCauseDiagnostic,
        label: 'Root Cause Diagnostic'
      }
    ];

    for (const { key, fn, label } of runners) {
      if (typeof fn === 'function') {
        try {
          Logger.debug(`🔧 Running ${label}...`, null, 'general');
          const result = await fn();
          section[key] = {
            success: true,
            timestamp: (result as { timestamp?: string })?.timestamp,
            summary: (result as unknown) as Record<string, unknown>
          };
        } catch (error: unknown) {
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'ComprehensiveDiagnostic'
            }
        });;
          section[key] = {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        
    }
      } else {
        section[key] = {
          success: false,
          error: 'Diagnostic module not registered'
        };
      }
    }
  }

  generateReport(): DiagnosticResults {
    Logger.debug('Generating diagnostic report', null, 'general');
    Logger.debug('═══════════════════════════════════════════════════════════', null, 'general');
    Logger.debug('📊 COMPREHENSIVE DIAGNOSTIC REPORT', null, 'general');
    Logger.debug('═══════════════════════════════════════════════════════════', null, 'general');
    Logger.debug('Timestamp:', this.results.timestamp, 'general');
    Logger.debug('\n', null, 'general');

    // Module Diagnostics Summary
    Logger.debug('🧩 MODULE DIAGNOSTICS:', null, 'general');
    const moduleDiagnostics = this.results.moduleDiagnostics || {};
    Object.entries(moduleDiagnostics).forEach(([name, data]) => {
      Logger.debug(`  ${name}: ${data.success ? '✅' : '❌'}`, null, 'general');
      if (!data.success && data.error) {
        Logger.debug(`    ❌ ERROR: ${data.error}`, null, 'general');
      }
    });
    Logger.debug('\n', null, 'general');
    
    // URL Normalization Report
    Logger.debug('🔍 URL NORMALIZATION:', null, 'general');
    Logger.debug('  Raw URI:', { rawUri: this.results.urlNormalization.rawUri }, 'general');
    Logger.debug('  Normalized URL:', this.results.urlNormalization.normalizedUrl, 'general');
    Logger.debug('  Page ID:', this.results.urlNormalization.pageId, 'general');
    Logger.debug('  Normalization Working:', this.results.urlNormalization.normalizationWorking ? '✅' : '❌', 'general');
    Logger.debug('  normalizeCurrentUrl Working:', this.results.urlNormalization.normalizeCurrentUrlWorking ? '✅' : '❌', 'general');
    if (this.results.urlNormalization.error) {
      Logger.debug('  ❌ ERROR:', this.results.urlNormalization.error, 'general');
    }
    Logger.debug('\n', null, 'general');
    
    // Message Loading Report
    Logger.debug('💬 MESSAGE LOADING:', null, 'general');
    Logger.debug('  loadChatHistory Available:', this.results.messageLoading.loadChatHistoryAvailable ? '✅' : '❌', 'general');
    Logger.debug('  Active Communities:', this.results.messageLoading.activeCommunitiesCount || 0, 'general');
    Logger.debug('  API Available:', this.results.messageLoading.apiAvailable ? '✅' : '❌', 'general');
    Logger.debug('  Supabase Available:', this.results.messageLoading.supabaseAvailable ? '✅' : '❌', 'general');
    const testApiCall = this.results.messageLoading.testApiCall as { success?: boolean; conversations?: number; messages?: number; error?: string } | undefined;
    if (testApiCall) {
      Logger.debug('  Test API Call:', testApiCall.success ? '✅' : '❌', 'general');
      Logger.debug('    Conversations Found:', testApiCall.conversations || 0, 'general');
      Logger.debug('    Messages Found:', testApiCall.messages || 0, 'general');
      if (testApiCall.error) {
        Logger.debug('    ❌ ERROR:', testApiCall.error, 'general');
      }
    }
    Logger.debug('  Message Elements in DOM:', this.results.messageLoading.messageElementsCount || 0, 'general');
    if (this.results.messageLoading.error) {
      Logger.debug('  ❌ ERROR:', this.results.messageLoading.error, 'general');
    }
    Logger.debug('\n', null, 'general');
    
    // Visibility Tab Report
    Logger.debug('👁️ VISIBILITY TAB:', null, 'general');
    Logger.debug('  Visibility Tab Element:', this.results.visibilityTab.visibilityTabElement ? '✅' : '❌', 'general');
    Logger.debug('  Visibility Tab Active:', this.results.visibilityTab.visibilityTabActive ? '✅' : '❌', 'general');
    Logger.debug('  Visibility Tab Display:', this.results.visibilityTab.visibilityTabDisplay, 'general');
    Logger.debug('  updateVisibleTab Available:', this.results.visibilityTab.updateVisibleTabAvailable ? '✅' : '❌', 'general');
    Logger.debug('  VisibilityModalHandler Initialized:', this.results.visibilityTab.visibilityModalHandlerInitialized ? '✅' : '❌', 'general');
    Logger.debug('  Visibility Modal Element:', this.results.visibilityTab.visibilityModalElement ? '✅' : '❌', 'general');
    Logger.debug('  Visibility Modal Display:', this.results.visibilityTab.visibilityModalDisplay, 'general');
    Logger.debug('  Visibility Modal Z-Index:', this.results.visibilityTab.visibilityModalZIndex, 'general');
    const pageUsers = this.results.visibilityTab.pageUsers as { count?: number; working?: boolean } | undefined;
    if (pageUsers) {
      Logger.debug('  Page Users Found:', pageUsers.count || 0, 'general');
      Logger.debug('  getPageUsers Working:', pageUsers.working ? '✅' : '❌', 'general');
    }
    if (this.results.visibilityTab.error) {
      Logger.debug('  ❌ ERROR:', this.results.visibilityTab.error, 'general');
    }
    Logger.debug('\n', null, 'general');
    
    // API Connectivity Report
    Logger.debug('🌐 API CONNECTIVITY:', null, 'general');
    Logger.debug('  API Module Available:', this.results.apiConnectivity.apiModuleAvailable ? '✅' : '❌', 'general');
    Logger.debug('  API Base URL:', this.results.apiConnectivity.apiBaseUrl, 'general');
    const healthCheck = this.results.apiConnectivity.healthCheck as { success?: boolean; status?: string } | undefined;
    if (healthCheck) {
      Logger.debug('  Health Check:', healthCheck.success ? '✅' : '❌', 'general');
      Logger.debug('    Status:', healthCheck.status, 'general');
    }
    Logger.debug('\n', null, 'general');
    
    // Database Queries Report
    Logger.debug('🗄️ DATABASE QUERIES:', null, 'general');
    Logger.debug('  Supabase Available:', this.results.databaseQueries.supabaseAvailable ? '✅' : '❌', 'general');
    const messagesQuery = this.results.databaseQueries.messagesQuery as { success?: boolean; count?: number; error?: string } | undefined;
    if (messagesQuery) {
      Logger.debug('  Messages Query:', messagesQuery.success ? '✅' : '❌', 'general');
      Logger.debug('    Messages Found:', messagesQuery.count || 0, 'general');
      if (messagesQuery.error) {
        Logger.debug('    ❌ ERROR:', messagesQuery.error, 'general');
      }
    }
    const presenceQuery = this.results.databaseQueries.presenceQuery as { success?: boolean; count?: number; error?: string } | undefined;
    if (presenceQuery) {
      Logger.debug('  Presence Query:', presenceQuery.success ? '✅' : '❌', 'general');
      Logger.debug('    Presence Records Found:', presenceQuery.count || 0, 'general');
      if (presenceQuery.error) {
        Logger.debug('    ❌ ERROR:', presenceQuery.error, 'general');
      }
    }
    Logger.debug('\n', null, 'general');
    
    // Root Cause Analysis
    Logger.debug('🔍 ROOT CAUSE ANALYSIS:', null, 'general');
    const issues: string[] = [];
    
    if (!this.results.urlNormalization.normalizationWorking) {
      issues.push('❌ URL normalization is not working');
    }
    
    if (!this.results.messageLoading.loadChatHistoryAvailable) {
      issues.push('❌ loadChatHistory function is not available');
    }
    
    if (this.results.messageLoading.activeCommunitiesCount === 0) {
      issues.push('❌ No active communities - messages cannot load');
    }
    
    const testApiCallForIssues = this.results.messageLoading.testApiCall as { success?: boolean; error?: string; conversations?: number } | undefined;
    if (testApiCallForIssues && !testApiCallForIssues.success) {
      issues.push('❌ API call is failing: ' + (testApiCallForIssues.error || 'Unknown error'));
    }
    
    if (testApiCallForIssues && testApiCallForIssues.conversations === 0) {
      issues.push('⚠️ API call succeeds but returns 0 conversations - may be no messages in database');
    }
    
    if (!this.results.visibilityTab.visibilityTabElement) {
      issues.push('❌ Visibility tab DOM element not found');
    }
    
    if (!this.results.visibilityTab.updateVisibleTabAvailable) {
      issues.push('❌ updateVisibleTab function is not available');
    }
    
    if (!this.results.visibilityTab.visibilityModalHandlerInitialized) {
      issues.push('❌ VisibilityModalHandler is not initialized');
    }
    
    if (this.results.visibilityTab.visibilityModalDisplay === 'none') {
      issues.push('⚠️ Visibility modal is hidden (display: none)');
    }
    
    if (issues.length === 0) {
      Logger.debug('  ✅ No critical issues found', null, 'general');
    } else {
      issues.forEach(issue => Logger.debug('  ' + issue, null, 'general'));
    }
    
    Logger.debug('\n', null, 'general');
    Logger.debug('═══════════════════════════════════════════════════════════', null, 'general');
    Logger.debug('📋 Full diagnostic data available in window.comprehensiveDiagnosticResults', null, 'general');
    Logger.debug('═══════════════════════════════════════════════════════════', null, 'general');
    
    // Store results globally
    window.comprehensiveDiagnosticResults = this.results;
    
    return this.results;
  }
}

// Export for global access
export { ComprehensiveDiagnostic };

// Auto-run if called directly
if (typeof window !== 'undefined') {
  (window as Window & { ComprehensiveDiagnostic?: typeof ComprehensiveDiagnostic }).ComprehensiveDiagnostic = ComprehensiveDiagnostic;
  
  (window as Window & { runComprehensiveDiagnostic?: () => Promise<DiagnosticResults> }).runComprehensiveDiagnostic = async () => {
    const diagnostic = new ComprehensiveDiagnostic();
    return await diagnostic.runFullDiagnostic();
  };
  
  Logger.debug('✅ ComprehensiveDiagnostic loaded. Call runComprehensiveDiagnostic() to run full diagnostic.', null, 'general');
}


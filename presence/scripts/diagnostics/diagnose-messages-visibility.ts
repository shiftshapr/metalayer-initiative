/**
 * Diagnostic: Messages and Visibility Not Working
 * 
 * Checks:
 * 1. Messages module initialization
 * 2. loadChatHistory function availability
 * 3. Visibility module initialization
 * 4. Page ID resolution
 * 5. API endpoints responding
 */

import { Logger } from '../../src/utils/Logger.js';

interface DiagnosticResult {
  messages: {
    moduleLoaded: boolean;
    loadChatHistoryAvailable: boolean;
    apiResponding: boolean;
    issues: string[];
  };
  visibility: {
    moduleLoaded: boolean;
    pageIdResolution: boolean;
    realtimeSubscription: boolean;
    issues: string[];
  };
  recommendations: string[];
}

export async function diagnoseMessagesVisibility(): Promise<DiagnosticResult> {
  Logger.debug('🔍 DIAGNOSTIC: Messages and Visibility Analysis', null, 'diagnostic');

  const result: DiagnosticResult = {
    messages: {
      moduleLoaded: false,
      loadChatHistoryAvailable: false,
      apiResponding: false,
      issues: []
    },
    visibility: {
      moduleLoaded: false,
      pageIdResolution: false,
      realtimeSubscription: false,
      issues: []
    },
    recommendations: []
  };

  // Check Messages
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      loadChatHistory?: () => Promise<void>;
      MessagesModule?: unknown;
    };

    result.messages.moduleLoaded = !!win.MessagesModule;
    result.messages.loadChatHistoryAvailable = typeof win.loadChatHistory === 'function';

    if (!result.messages.moduleLoaded) {
      result.messages.issues.push('MessagesModule not loaded on window');
    }
    if (!result.messages.loadChatHistoryAvailable) {
      result.messages.issues.push('loadChatHistory function not available');
    }

    // Check API
    try {
      const api = (win as { api?: { request: (url: string) => Promise<unknown> } }).api;
      if (api) {
        const response = await api.request('/api/messages?pageId=test');
        result.messages.apiResponding = !!response;
      } else {
        result.messages.issues.push('API service not available');
      }
    } catch (error) {
      result.messages.issues.push(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Check Visibility
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      VisibilityManager?: unknown;
      refreshVisibilityAvatars?: () => Promise<void>;
      tabContextManager?: {
        getTabContainer: (tabId: string) => HTMLElement | null;
      };
    };

    result.visibility.moduleLoaded = !!win.VisibilityManager;
    result.visibility.realtimeSubscription = typeof win.refreshVisibilityAvatars === 'function';

    // Check page ID resolution
    if (win.tabContextManager) {
      const container = win.tabContextManager.getTabContainer('visibility-tab');
      const pageId = container?.dataset.pageId;
      result.visibility.pageIdResolution = !!pageId;
      if (!pageId) {
        result.visibility.issues.push('Page ID not found in visibility tab container');
      }
    } else {
      result.visibility.issues.push('tabContextManager not available');
    }

    if (!result.visibility.moduleLoaded) {
      result.visibility.issues.push('VisibilityManager not loaded on window');
    }
    if (!result.visibility.realtimeSubscription) {
      result.visibility.issues.push('refreshVisibilityAvatars function not available');
    }
  }

  // Recommendations
  if (result.messages.issues.length > 0) {
    result.recommendations.push('Fix Messages module initialization');
  }
  if (result.visibility.issues.length > 0) {
    result.recommendations.push('Fix Visibility module initialization');
  }
  if (!result.messages.apiResponding) {
    result.recommendations.push('Check API endpoint connectivity');
  }
  if (!result.visibility.pageIdResolution) {
    result.recommendations.push('Fix page ID resolution for visibility tab');
  }

  return result;
}

if (require.main === module) {
  diagnoseMessagesVisibility().then(result => {
    console.log('🔍 Messages and Visibility Diagnostic:');
    console.log('\nMessages:');
    console.log('  Module loaded:', result.messages.moduleLoaded);
    console.log('  loadChatHistory available:', result.messages.loadChatHistoryAvailable);
    console.log('  API responding:', result.messages.apiResponding);
    if (result.messages.issues.length > 0) {
      console.log('  Issues:', result.messages.issues);
    }

    console.log('\nVisibility:');
    console.log('  Module loaded:', result.visibility.moduleLoaded);
    console.log('  Page ID resolution:', result.visibility.pageIdResolution);
    console.log('  Realtime subscription:', result.visibility.realtimeSubscription);
    if (result.visibility.issues.length > 0) {
      console.log('  Issues:', result.visibility.issues);
    }

    if (result.recommendations.length > 0) {
      console.log('\nRecommendations:');
      result.recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
    }
  });
}


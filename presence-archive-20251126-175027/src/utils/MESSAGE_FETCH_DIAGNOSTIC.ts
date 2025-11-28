import { stateManagerInstance } from '../core/StateManager.js';
import { resolveMessagesEndpoint } from '../services/MessageStore.js';

type DiagnosticResult = {
  apiBaseUrl: string;
  requestUrl: string;
  status: number | 'FAILED';
  ok: boolean;
  pageId?: string;
  error?: string;
};

function getCurrentPageId(): string | undefined {
  const urlData = stateManagerInstance.getState('currentUrlData') as { pageId?: string } | null;
  return urlData?.pageId;
}

async function runMessageFetchDiagnostic(): Promise<DiagnosticResult> {
  console.groupCollapsed('🩺 MESSAGE_FETCH_DIAGNOSTIC');

  const pageId = getCurrentPageId();
  const params = new URLSearchParams({
    pageId: pageId || 'diagnostic-page',
    parentId: 'null',
    limit: '1',
    includeTopReply: 'false',
    communityId: 'diagnostic'
  });

  const endpoint = resolveMessagesEndpoint();
  const requestUrl = `${endpoint}?${params.toString()}`;

  console.log('🔧 API base URL:', endpoint.replace(/\?.*$/, ''));
  console.log('🔧 Request URL:', requestUrl);
  console.log('🔧 Page ID:', pageId || '(none)');

  try {
    const response = await fetch(requestUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    console.log('✅ Response status:', response.status);
    console.groupEnd();
    return {
      apiBaseUrl: endpoint.replace(/\?.*$/, ''),
      requestUrl,
      status: response.status,
      ok: response.ok,
      pageId
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Fetch failed:', message);
    console.groupEnd();
    return {
      apiBaseUrl: endpoint.replace(/\?.*$/, ''),
      requestUrl,
      status: 'FAILED',
      ok: false,
      pageId,
      error: message
    };
  }
}

function registerDiagnostic(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const win = window as Window & { runMessageFetchDiagnostic?: () => Promise<DiagnosticResult> };
  win.runMessageFetchDiagnostic = runMessageFetchDiagnostic;
  console.log('✅ MESSAGE_FETCH_DIAGNOSTIC registered: run window.runMessageFetchDiagnostic()');
}

registerDiagnostic();

export { runMessageFetchDiagnostic };


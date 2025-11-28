/**
 * MESSAGE LOADING DIAGNOSTIC
 * 
 * Diagnoses why messages are not loading/displaying
 */

interface UrlData {
  normalizedUrl?: string;
  pageId?: string;
}

interface Community {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  posts?: Array<{ id: string }>;
}

interface ApiResponse {
  conversations?: Conversation[];
}

interface ApiResult {
  communityId: string;
  success: boolean;
  duration?: string;
  response?: {
    hasConversations: boolean;
    conversationCount: number;
    conversations: Array<{
      id: string;
      postCount: number;
      hasPosts: boolean;
    }>;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface DatabaseMessage {
  id: string;
  body?: string;
  parentId?: string | null;
  createdAt?: string;
  pageId?: string;
}

interface DatabaseResult {
  communityId: string;
  success: boolean;
  messageCount?: number;
  messages?: DatabaseMessage[];
  error?: string;
}

interface DiagnosticResults {
  timestamp: string;
  pageInfo: {
    rawUrl: string;
    normalizedUrl?: string;
    pageId?: string;
    hasUrlData: boolean;
  };
  communities: {
    activeCommunities: string[];
    activeCount: number;
    allCommunities: Array<{ id: string; name: string }>;
    hasCommunities: boolean;
  };
  apiCalls: {
    tested: boolean;
    results?: ApiResult[];
    totalCalls?: number;
    successfulCalls?: number;
    failedCalls?: number;
    reason?: string;
  };
  databaseCheck: {
    tested: boolean;
    results?: DatabaseResult[];
    totalQueries?: number;
    successfulQueries?: number;
    error?: string;
    reason?: string;
  };
  domState: {
    chatMessagesExists: boolean;
    messageCount: number;
    messageIds: (string | null)[];
    hasEmptyState: boolean;
    hasLoadingOverlay: boolean;
    focusMode: boolean;
    isVisible: boolean;
    opacity: string | null;
  };
  errors: string[];
}

type WindowWithDiagnostics = Window & {
  currentUrlData?: UrlData;
  activeCommunities?: string[];
  communities?: Community[];
  api?: {
    getChatHistory: (communityId: string, conversationId: string | null, normalizedUrl: string) => Promise<ApiResponse>;
  };
  supabase?: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          eq: (column: string, value: string) => {
            is: (column: string, value: null) => {
              order: (column: string, options: { ascending: boolean }) => {
                limit: (count: number) => Promise<{ data: DatabaseMessage[] | null; error: { message: string } | null }>;
              };
            };
          };
        };
      };
    };
  };
}

console.log('🔍 MESSAGE_LOADING_DIAGNOSTIC: Starting diagnostic...');

export async function runMessageLoadingDiagnostic(): Promise<DiagnosticResults> {
  const results: DiagnosticResults = {
    timestamp: new Date().toISOString(),
    pageInfo: {
      rawUrl: window.location.href,
      hasUrlData: false
    },
    communities: {
      activeCommunities: [],
      activeCount: 0,
      allCommunities: [],
      hasCommunities: false
    },
    apiCalls: { tested: false },
    databaseCheck: { tested: false },
    domState: {
      chatMessagesExists: false,
      messageCount: 0,
      messageIds: [],
      hasEmptyState: false,
      hasLoadingOverlay: false,
      focusMode: false,
      isVisible: false,
      opacity: null
    },
    errors: []
  };

  try {
    // 1. Page Information
    const win = window as unknown as WindowWithDiagnostics;
    const urlData: UrlData = win.currentUrlData || {};
    results.pageInfo = {
      rawUrl: window.location.href,
      normalizedUrl: urlData.normalizedUrl,
      pageId: urlData.pageId,
      hasUrlData: !!win.currentUrlData
    };
    console.log('📄 PAGE INFO:', results.pageInfo);

    // 2. Communities
    const activeCommunities = win.activeCommunities || [];
    const communities = win.communities || [];
    results.communities = {
      activeCommunities,
      activeCount: activeCommunities.length,
      allCommunities: communities.map(c => ({ id: c.id, name: c.name })),
      hasCommunities: communities.length > 0
    };
    console.log('👥 COMMUNITIES:', results.communities);

    // 3. API Calls
    if (win.api && typeof win.api.getChatHistory === 'function') {
      console.log('🔍 Testing API.getChatHistory calls...');
      const apiResults: ApiResult[] = [];
      
      for (const communityId of activeCommunities) {
        try {
          console.log(`🔍 Calling API.getChatHistory for community: ${communityId}`);
          const startTime = performance.now();
          const response = await win.api.getChatHistory(communityId, null, urlData.normalizedUrl || '') as { conversations?: Array<{ id?: string; posts?: Array<unknown> }> } | unknown;
          const duration = performance.now() - startTime;
          
          const responseData = response && typeof response === 'object' && 'conversations' in response 
            ? response as { conversations?: Array<{ id?: string; posts?: Array<unknown> }> }
            : { conversations: undefined };
          
          apiResults.push({
            communityId,
            success: true,
            duration: `${duration.toFixed(2)}ms`,
            response: {
              hasConversations: !!responseData.conversations,
              conversationCount: Array.isArray(responseData.conversations) ? responseData.conversations.length : 0,
              conversations: Array.isArray(responseData.conversations) ? responseData.conversations.map(c => ({
                id: c.id || '',
                postCount: Array.isArray(c.posts) ? c.posts.length : 0,
                hasPosts: !!(c.posts && Array.isArray(c.posts) && c.posts.length > 0)
              })) : []
            }
          });
          console.log(`✅ API call for ${communityId}:`, apiResults[apiResults.length - 1]);
        } catch (error) {
          const err = error as Error;
          apiResults.push({
            communityId,
            success: false,
            error: {
              name: err.name,
              message: err.message,
              stack: err.stack
            }
          });
          console.error(`❌ API call failed for ${communityId}:`, error);
          results.errors.push(`API call failed for ${communityId}: ${err.message}`);
        }
      }
      
      results.apiCalls = {
        tested: true,
        results: apiResults,
        totalCalls: apiResults.length,
        successfulCalls: apiResults.filter(r => r.success).length,
        failedCalls: apiResults.filter(r => !r.success).length
      };
    } else {
      results.apiCalls = {
        tested: false,
        reason: 'window.api.getChatHistory not available'
      };
      console.warn('⚠️ API not available');
    }

    // 4. Database Check (via Supabase)
    if (win.supabase) {
      console.log('🔍 Checking database directly...');
      try {
        const dbResults: DatabaseResult[] = [];
        
        for (const communityId of activeCommunities) {
          const normalizedPageId = urlData.pageId || urlData.normalizedUrl?.replace(/[^a-zA-Z0-9]/g, '_');
          
          if (!normalizedPageId) {
            dbResults.push({
              communityId,
              success: false,
              error: 'No page ID available'
            });
            continue;
          }
          
          // Query for messages on this page
          // Note: Using snake_case for Supabase column names (database boundary normalization)
          const supabaseQuery = (win.supabase as unknown) as { from: (table: string) => { select: (columns: string) => { eq: (col: string, val: unknown) => { eq: (col: string, val: unknown) => { is: (col: string, val: unknown) => { order: (col: string, opts: { ascending: boolean }) => { limit: (count: number) => Promise<{ data: unknown[] | null; error: { message: string } | null }> } } } } } } };
          const queryResult = await supabaseQuery.from('messages').select('*').eq('community_id', communityId).eq('page_id', normalizedPageId).is('deleted_at', null).order('created_at', { ascending: false }).limit(50);
          const { data: messages, error } = queryResult;
          
          if (error) {
            dbResults.push({
              communityId,
              success: false,
              error: error.message
            });
            console.error(`❌ Database query failed for ${communityId}:`, error);
            results.errors.push(`Database query failed for ${communityId}: ${error.message}`);
          } else {
            dbResults.push({
              communityId,
              success: true,
              messageCount: messages?.length || 0,
              messages: messages?.map((m: unknown) => {
                // Map snake_case database fields to camelCase
                const dbMsg = m as Record<string, unknown>;
                const msg: DatabaseMessage = {
                  id: typeof dbMsg.id === 'string' ? dbMsg.id : String(dbMsg.id || ''),
                  body: (typeof dbMsg.body === 'string' ? dbMsg.body.substring(0, 50) : typeof dbMsg.body === 'object' && dbMsg.body !== null ? JSON.stringify(dbMsg.body).substring(0, 50) : '') + '...',
                  parentId: (dbMsg.parent_id || dbMsg.parentId || null) as string | null,
                  createdAt: (typeof dbMsg.createdAt === 'string' ? dbMsg.createdAt : typeof (dbMsg as { created_at?: string }).created_at === 'string' ? (dbMsg as { created_at: string }).created_at : undefined),
                  pageId: typeof dbMsg.page_id === 'string' ? dbMsg.page_id : typeof dbMsg.pageId === 'string' ? dbMsg.pageId : undefined
                };
                return msg;
              }) || []
            });
            console.log(`✅ Database check for ${communityId}: Found ${messages?.length || 0} messages`);
          }
        }
        
        results.databaseCheck = {
          tested: true,
          results: dbResults,
          totalQueries: dbResults.length,
          successfulQueries: dbResults.filter(r => r.success).length
        };
      } catch (error) {
        const err = error as Error;
        results.databaseCheck = {
          tested: false,
          error: err.message
        };
        console.error('❌ Database check failed:', error);
        results.errors.push(`Database check failed: ${err.message}`);
      }
    } else {
      results.databaseCheck = {
        tested: false,
        reason: 'window.supabase not available'
      };
      console.warn('⚠️ Supabase not available');
    }

    // 5. DOM State
    const chatMessages = document.querySelector('.chat-messages');
    const messages = chatMessages?.querySelectorAll('.message') || [];
    const emptyState = chatMessages?.querySelector('.empty-state-message');
    const loadingOverlay = chatMessages?.querySelector('.chat-loading-overlay');
    
    results.domState = {
      chatMessagesExists: !!chatMessages,
      messageCount: messages.length,
      messageIds: Array.from(messages).map(m => m.getAttribute('data-message-id')),
      hasEmptyState: !!emptyState,
      hasLoadingOverlay: !!loadingOverlay,
      focusMode: chatMessages?.getAttribute('data-focus-mode') === 'true',
      isVisible: chatMessages ? window.getComputedStyle(chatMessages).visibility !== 'hidden' : false,
      opacity: chatMessages ? window.getComputedStyle(chatMessages).opacity : null
    };
    console.log('🏗️ DOM STATE:', results.domState);

    // 6. Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 MESSAGE LOADING DIAGNOSTIC SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Page:', results.pageInfo.normalizedUrl || results.pageInfo.rawUrl);
    console.log('Active Communities:', results.communities.activeCount);
    console.log('API Calls:', results.apiCalls.tested ? `${results.apiCalls.successfulCalls}/${results.apiCalls.totalCalls} successful` : 'Not tested');
    console.log('Database Messages:', results.databaseCheck.tested ? results.databaseCheck.results?.reduce((sum, r) => sum + (r.messageCount || 0), 0) : 'Not tested');
    console.log('DOM Messages:', results.domState.messageCount);
    console.log('Errors:', results.errors.length);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(err => console.error('  -', err));
    }
    
    // Root Cause Analysis
    console.log('\n🔍 ROOT CAUSE ANALYSIS:');
    
    if (results.apiCalls.tested && results.apiCalls.results) {
      const totalConversations = results.apiCalls.results.reduce((sum, r) => {
        return sum + (r.success ? (r.response?.conversationCount || 0) : 0);
      }, 0);
      
      if (totalConversations === 0) {
        console.log('❌ ROOT CAUSE: API returning 0 conversations');
        console.log('   - Check if messages exist in database');
        console.log('   - Verify pageId matching logic');
        console.log('   - Check communityId filtering');
      } else {
        console.log(`✅ API returning ${totalConversations} conversations`);
      }
    }
    
    if (results.databaseCheck.tested && results.databaseCheck.results) {
      const totalDbMessages = results.databaseCheck.results.reduce((sum, r) => {
        return sum + (r.success ? (r.messageCount || 0) : 0);
      }, 0);
      
      if (totalDbMessages === 0) {
        console.log('❌ ROOT CAUSE: No messages found in database for this page');
        console.log('   - Page ID:', results.pageInfo.pageId);
        console.log('   - Normalized URL:', results.pageInfo.normalizedUrl);
        console.log('   - Check if messages exist with matching pageId');
      } else {
        console.log(`✅ Database has ${totalDbMessages} messages`);
        if (results.domState.messageCount === 0) {
          console.log('❌ ROOT CAUSE: Messages exist in DB but not in DOM');
          console.log('   - Check addMessageToChat function');
          console.log('   - Check filtering logic');
          console.log('   - Check focus mode filtering');
        }
      }
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');

    return results;
  } catch (error) {
    const err = error as Error;
    console.error('❌ DIAGNOSTIC ERROR:', error);
    results.errors.push(`Diagnostic failed: ${err.message}`);
    return results;
  }
}

// Auto-run after a delay
if (typeof document !== 'undefined') {
  setTimeout(() => {
    console.log('🔍 MESSAGE_LOADING_DIAGNOSTIC: Auto-running diagnostic...');
    runMessageLoadingDiagnostic();
  }, 3000);
  
  console.log('✅ MESSAGE_LOADING_DIAGNOSTIC: Ready. Call runMessageLoadingDiagnostic()');
}


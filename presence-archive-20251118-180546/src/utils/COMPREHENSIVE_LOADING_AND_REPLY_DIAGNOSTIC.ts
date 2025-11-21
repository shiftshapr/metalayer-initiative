import type { Message } from '../types/index.js';

/**
 * COMPREHENSIVE LOADING AND REPLY DIAGNOSTIC
 * 
 * Diagnoses:
 * 1. Loading flow issues (theme flashing, overlay timing, blank screen)
 * 2. Reply loading issues (pageId normalization, AppUser table name)
 * 3. AppUser 400 errors (table name case sensitivity)
 * 4. Theme initialization timing
 */

// Type definitions
type DiagnosticSeverity = 'error' | 'warning';

interface DiagnosticIssue {
  severity: DiagnosticSeverity;
  category: string;
  issue: string;
  fix: string;
  details?: Record<string, unknown>;
  currentPageId?: string;
  normalizedPageId?: string;
  tests?: Array<Record<string, unknown>>;
  messageId?: string;
  hasReplies?: boolean;
  replyCount?: number;
}

interface DiagnosticData {
  appUserTableTests?: AppUserTableTest[];
  correctAppUserTableName?: string;
  currentPageId?: string;
  pageIdTests?: PageIdTest[];
  correctPageIdFormat?: string;
  loadingState?: LoadingState;
  themeState?: ThemeState;
  focusedMessage?: FocusedMessage;
  repliesInDOM?: number;
  messageInChatData?: {
    hasReplies?: boolean;
    replyCount?: number;
  };
}

interface AppUserTableTest {
  tableName: string;
  success: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  } | {
    message?: string;
  };
  data: string;
}

interface PageIdTest {
  pageId: string;
  matches: number;
  replies: number;
  mainMessages: number;
  error?: string | null;
}

interface LoadingState {
  hasOverlay: boolean;
  isLoading: boolean;
  visibility: string;
  opacity: string;
  messagesCount: number;
}

interface ThemeState {
  bodyTheme: string | null;
  htmlTheme: string | null;
  storedTheme: string | null;
  userPrefsTheme: string | null;
  mismatch: boolean;
}

interface FocusedMessage {
  messageId: string | null;
  hasReplies: boolean;
  replyCount: number;
}

interface ComprehensiveDiagnosticResult {
  startTime: number;
  issues: DiagnosticIssue[];
  recommendations: string[];
  data: DiagnosticData;
}

type WindowWithDiagnostics = Window & {
  supabase?: {
    from: (table: string) => {
      select: (...args: unknown[]) => {
        eq: (column: string, value: unknown) => {
          is: (column: string, value: unknown) => {
            limit: (count: number) => Promise<{ data: Array<Record<string, unknown>> | null; error: { message: string; code?: string; details?: string; hint?: string } | null }>;
          };
        };
      };
    };
  };
  currentUser?: {
    id?: string;
  } & Partial<import('../types/index.js').User>;
  normalizeUrl?: (url: string) => Promise<{ pageId: string }>;
  activeCommunities?: string[];
  currentChatData?: Array<Record<string, unknown>> | Record<string, unknown>;
  UserPreferencesManager?: {
    getTheme?: () => string | null;
  };
  runComprehensiveDiagnostic?: () => Promise<ComprehensiveDiagnosticResult>;
  comprehensiveDiagnostic?: ComprehensiveDiagnosticResult;
}

declare const window: WindowWithDiagnostics;

// Main diagnostic object
const diagnostic: ComprehensiveDiagnosticResult = {
  startTime: typeof performance !== 'undefined' ? performance.now() : Date.now(),
  issues: [],
  recommendations: [],
  data: {}
};

// ============================================
// 1. APPUSER TABLE NAME DIAGNOSTIC
// ============================================
async function checkAppUserTableName(): Promise<string | null> {
  console.log('\n📊 [1] Checking AppUser table name case sensitivity...');
  
  if (!window.supabase) {
    diagnostic.issues.push({
      severity: 'error',
      category: 'AppUser',
      issue: 'Supabase client not available',
      fix: 'Ensure window.supabase is initialized'
    });
    return null;
  }

  const testUserId = window.currentUser?.id || '550e8400-e29b-41d4-a716-446655440001';
  const tableNames = ['AppUser', 'appuser', 'app_user', 'App_User'];
  
  diagnostic.data.appUserTableTests = [];
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await window.supabase
        .from(tableName)
        .select('id, name, handle, avatar_url, aura_color')
        .eq('id', testUserId)
        .maybeSingle();
      
      const result: AppUserTableTest = {
        tableName,
        success: !error && data !== null,
        error: error ? {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        } : undefined,
        data: data ? 'Found' : 'Not found'
      };
      
      diagnostic.data.appUserTableTests.push(result);
      
      if (!error && data) {
        console.log(`✅ AppUser table name is: "${tableName}"`);
        diagnostic.data.correctAppUserTableName = tableName;
        return tableName;
      } else if (error) {
        console.log(`❌ "${tableName}": ${error.message} (${error.code})`);
      } else {
        console.log(`⚠️ "${tableName}": No error but no data`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`❌ "${tableName}": Exception - ${errorMessage}`);
      diagnostic.data.appUserTableTests.push({
        tableName,
        success: false,
        error: { message: errorMessage },
        data: 'Exception'
      });
    }
  }
  
  diagnostic.issues.push({
    severity: 'error',
    category: 'AppUser',
    issue: 'Could not determine correct AppUser table name',
    fix: 'Check Supabase schema - table might be case-sensitive',
    tests: diagnostic.data.appUserTableTests ? diagnostic.data.appUserTableTests.map(test => ({ ...test })) : []
  });
  
  return null;
}

// ============================================
// 2. PAGEID NORMALIZATION DIAGNOSTIC
// ============================================
async function checkPageIdNormalization(): Promise<void> {
  console.log('\n📊 [2] Checking pageId normalization for replies...');
  
  if (!window.supabase) {
    diagnostic.issues.push({
      severity: 'error',
      category: 'pageId',
      issue: 'Supabase client not available',
      fix: 'Ensure window.supabase is initialized'
    });
    return;
  }

  // Get current page info
  const currentUri = window.location?.href || '';
  let normalizedUrlData: { pageId?: string } | null = null;
  let currentPageId: string | null = null;
  
  if (window.normalizeUrl) {
    try {
      normalizedUrlData = await window.normalizeUrl(currentUri);
      currentPageId = normalizedUrlData?.pageId || null;
    } catch (err) {
      console.warn('⚠️ Error normalizing URL:', err);
    }
  }
  
  if (!currentPageId) {
    // Try to get from active tab
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.url && window.normalizeUrl) {
          normalizedUrlData = await window.normalizeUrl(tabs[0].url);
          currentPageId = normalizedUrlData?.pageId || null;
        }
      } catch (err) {
        console.warn('⚠️ Error getting tab URL:', err);
      }
    }
  }
  
  console.log('🔍 Current pageId:', currentPageId);
  diagnostic.data.currentPageId = currentPageId || undefined;
  
  if (!currentPageId) {
    diagnostic.issues.push({
      severity: 'warning',
      category: 'pageId',
      issue: 'Could not determine current pageId',
      fix: 'Check window.normalizeUrl and active tab'
    });
    return;
  }

  // Check what pageIds actually exist in the database for replies
  const communityId = window.activeCommunities?.[0];
  if (!communityId) {
    diagnostic.issues.push({
      severity: 'warning',
      category: 'pageId',
      issue: 'No active community ID',
      fix: 'Ensure window.activeCommunities is set'
    });
    return;
  }

  console.log('🔍 Checking replies in database with different pageId formats...');
  
      // Test different pageId variations
      const pageIdVariations = [
        currentPageId, // Original
        currentPageId.replace(/_+$/, ''), // Without trailing underscores
        currentPageId + '_', // With trailing underscore
        currentPageId.replace(/^([^_]+)_/, '$1_'), // Normalized format
      ].filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
      
      diagnostic.data.pageIdTests = [];
      
      for (const testPageId of pageIdVariations) {
        try {
          // Check for any messages with this pageId
          const query = window.supabase!
            .from('messages')
            .select('id, page_id, parent_id, community_id')
            .eq('page_id', testPageId)
            .eq('community_id', communityId);
          const { data: messages, error } = await query.is('deleted_at', null).limit(10);
          
          const messagesArray = (messages as Array<Record<string, unknown>> | null) || [];
          const replyCount = messagesArray.filter((m: Record<string, unknown>) => m.parent_id !== null).length || 0;
          const mainMessageCount = messagesArray.filter((m: Record<string, unknown>) => m.parent_id === null).length || 0;
      
          const result: PageIdTest = {
            pageId: testPageId,
            matches: messagesArray.length || 0,
            replies: replyCount,
            mainMessages: mainMessageCount,
            error: error ? error.message : null
          };
          
          diagnostic.data.pageIdTests.push(result);
          
          if (messagesArray && messagesArray.length > 0) {
            console.log(`✅ pageId "${testPageId}": ${messagesArray.length} messages (${replyCount} replies, ${mainMessageCount} main)`);
        
        if (replyCount > 0) {
          console.log(`   📝 Found ${replyCount} replies with this pageId format!`);
          diagnostic.data.correctPageIdFormat = testPageId;
        }
      } else if (error) {
        console.log(`❌ pageId "${testPageId}": Error - ${error.message}`);
      } else {
        console.log(`⚠️ pageId "${testPageId}": No messages found`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`❌ pageId "${testPageId}": Exception - ${errorMessage}`);
      diagnostic.data.pageIdTests.push({
        pageId: testPageId,
        matches: 0,
        replies: 0,
        mainMessages: 0,
        error: errorMessage
      });
    }
  }
  
  // Check if normalization is causing issues
  const normalizedPageId = currentPageId.replace(/_+$/, '').trim();
  const hasTrailingUnderscore = currentPageId.endsWith('_');
  
  if (hasTrailingUnderscore && normalizedPageId !== currentPageId) {
    diagnostic.issues.push({
      severity: 'error',
      category: 'pageId',
      issue: `pageId normalization removes trailing underscore: "${currentPageId}" -> "${normalizedPageId}"`,
      fix: 'ReplyLoader normalizes pageId but database might have trailing underscore. Check if replies exist with original pageId format.',
      currentPageId,
      normalizedPageId,
      tests: diagnostic.data.pageIdTests ? diagnostic.data.pageIdTests.map(test => ({ ...test })) : []
    });
  }
}

// ============================================
// 3. LOADING FLOW DIAGNOSTIC
// ============================================
function checkLoadingFlow(): void {
  console.log('\n📊 [3] Checking loading flow timing...');
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    diagnostic.issues.push({
      severity: 'warning',
      category: 'loading',
      issue: 'Chat messages container not found',
      fix: 'DOM might not be ready yet'
    });
    return;
  }

  // Check overlay state
  const overlay = chatMessages.querySelector('.chat-loading-overlay, .chat-loading-indicator');
  const isLoading = chatMessages.classList.contains('is-loading');
  const visibility = window.getComputedStyle(chatMessages).visibility;
  const opacity = window.getComputedStyle(chatMessages).opacity;
  
  diagnostic.data.loadingState = {
    hasOverlay: !!overlay,
    isLoading,
    visibility,
    opacity,
    messagesCount: chatMessages.querySelectorAll('.message').length
  };
  
  console.log('🔍 Loading state:', diagnostic.data.loadingState);
  
  if (overlay && !isLoading) {
    diagnostic.issues.push({
      severity: 'warning',
      category: 'loading',
      issue: 'Overlay exists but container not marked as loading',
      fix: 'Overlay cleanup might be incomplete'
    });
  }
  
  if (isLoading && !overlay) {
    diagnostic.issues.push({
      severity: 'warning',
      category: 'loading',
      issue: 'Container marked as loading but no overlay found',
      fix: 'Overlay might have been removed prematurely'
    });
  }
  
  if (visibility === 'hidden' || opacity === '0') {
    diagnostic.issues.push({
      severity: 'error',
      category: 'loading',
      issue: `Chat container is hidden (visibility: ${visibility}, opacity: ${opacity})`,
      fix: 'Force visibility restoration in loadChatHistory finally block'
    });
  }
}

// ============================================
// 4. THEME FLASHING DIAGNOSTIC
// ============================================
function checkThemeFlashing(): void {
  console.log('\n📊 [4] Checking theme initialization...');
  
  const body = document.body;
  const html = document.documentElement;
  const bodyTheme = body.getAttribute('data-theme') || body.className.match(/theme-(\w+)/)?.[1] || null;
  const htmlTheme = html.getAttribute('data-theme') || html.className.match(/theme-(\w+)/)?.[1] || null;
  
  const storedTheme = localStorage.getItem('theme') || localStorage.getItem('userTheme');
  const userPrefsTheme = window.UserPreferencesManager?.getTheme?.() || null;
  
  diagnostic.data.themeState = {
    bodyTheme,
    htmlTheme,
    storedTheme,
    userPrefsTheme,
    mismatch: bodyTheme !== htmlTheme || bodyTheme !== storedTheme
  };
  
  console.log('🔍 Theme state:', diagnostic.data.themeState);
  
  if (diagnostic.data.themeState.mismatch) {
    diagnostic.issues.push({
      severity: 'warning',
      category: 'theme',
      issue: 'Theme mismatch between body, html, and storage',
      fix: 'Ensure theme is set synchronously before DOM render',
      details: diagnostic.data.themeState ? { ...diagnostic.data.themeState } : undefined
    });
  }
  
  // Check if theme is set early enough
  if (!storedTheme && !userPrefsTheme) {
    diagnostic.issues.push({
      severity: 'warning',
      category: 'theme',
      issue: 'No theme found in storage or preferences',
      fix: 'Set default theme before page load to prevent flash'
    });
  }
}

// ============================================
// 5. REPLY LOADING DIAGNOSTIC
// ============================================
async function checkReplyLoading(): Promise<void> {
  console.log('\n📊 [5] Checking reply loading for focused message...');
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  
  const isFocusMode = chatMessages.classList.contains('focus-mode-active');
  if (!isFocusMode) {
    console.log('ℹ️ Not in focus mode, skipping reply check');
    return;
  }
  
  // Find the focused message
  const focusedMessage = chatMessages.querySelector('.message[data-message-id]');
  if (!focusedMessage) {
    console.log('ℹ️ No focused message found');
    return;
  }
  
  const messageId = focusedMessage.getAttribute('data-message-id');
  const hasRepliesAttr = focusedMessage.getAttribute('data-has-replies');
  const replyCountAttr = focusedMessage.getAttribute('data-reply-count');
  
  console.log('🔍 Focused message:', {
    messageId,
    hasReplies: hasRepliesAttr,
    replyCount: replyCountAttr
  });
  
  diagnostic.data.focusedMessage = {
    messageId: messageId || null,
    hasReplies: hasRepliesAttr === 'true',
    replyCount: parseInt(replyCountAttr || '0') || 0
  };
  
  // Check if replies exist in DOM
  const repliesInDOM = chatMessages.querySelectorAll('.message-reply, [data-parent-id]');
  console.log(`🔍 Replies in DOM: ${repliesInDOM.length}`);
  
  diagnostic.data.repliesInDOM = repliesInDOM.length;
  
  if (diagnostic.data.focusedMessage.hasReplies && repliesInDOM.length === 0) {
    diagnostic.issues.push({
      severity: 'error',
      category: 'replies',
      issue: `Message has replies (count: ${diagnostic.data.focusedMessage.replyCount}) but none in DOM`,
      fix: 'Check ReplyLoader.loadAllReplies - might be pageId normalization issue',
      messageId: messageId || undefined,
      hasReplies: diagnostic.data.focusedMessage.hasReplies,
      replyCount: diagnostic.data.focusedMessage.replyCount
    });
  }
  
  // Check currentChatData
  if (window.currentChatData) {
    const messageEntries: Message[] = Array.isArray(window.currentChatData)
      ? window.currentChatData as Message[]
      : Object.values(window.currentChatData).flatMap(value => Array.isArray(value) ? value : []);
    const messageInData = messageEntries.find(message => message.id === messageId) as (Message & { hasReplies?: boolean; replyCount?: number }) | undefined;
    if (messageInData) {
      console.log('🔍 Message in currentChatData:', {
        id: messageInData.id,
        hasReplies: messageInData.hasReplies,
        replyCount: messageInData.replyCount
      });
      diagnostic.data.messageInChatData = {
        hasReplies: messageInData.hasReplies,
        replyCount: messageInData.replyCount
      };
    }
  }
}

// ============================================
// MAIN DIAGNOSTIC RUNNER
// ============================================
async function runDiagnostic(): Promise<ComprehensiveDiagnosticResult> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 COMPREHENSIVE LOADING AND REPLY DIAGNOSTIC');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 Starting comprehensive diagnostic...\n');
  
  // Run all diagnostics
  await checkAppUserTableName();
  await checkPageIdNormalization();
  checkLoadingFlow();
  checkThemeFlashing();
  await checkReplyLoading();
  
  // Generate report
  const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - diagnostic.startTime;
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`⏱️  Elapsed: ${elapsed.toFixed(2)}ms\n`);
  
  // Issues summary
  const errors = diagnostic.issues.filter(i => i.severity === 'error');
  const warnings = diagnostic.issues.filter(i => i.severity === 'warning');
  
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}\n`);
  
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   Fix: ${issue.fix}`);
      if (issue.details) console.log(`   Details:`, issue.details);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   Fix: ${issue.fix}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (diagnostic.data.correctAppUserTableName) {
    console.log(`1. Use "${diagnostic.data.correctAppUserTableName}" as AppUser table name in APIModule.js`);
  } else if (errors.some(e => e.category === 'AppUser')) {
    console.log('1. Fix AppUser table name - check Supabase schema for correct case');
  }
  
  if (diagnostic.data.correctPageIdFormat) {
    console.log(`2. Use pageId format "${diagnostic.data.correctPageIdFormat}" for reply queries (do not normalize)`);
  } else if (errors.some(e => e.category === 'pageId')) {
    console.log('2. Check pageId normalization - replies might be stored with trailing underscore');
  }
  
  if (errors.some(e => e.category === 'loading')) {
    console.log('3. Ensure visibility is forced in loadChatHistory finally block');
  }
  
  if (warnings.some(w => w.category === 'theme')) {
    console.log('4. Set theme synchronously before DOM render to prevent flash');
  }
  
  if (errors.some(e => e.category === 'replies')) {
    console.log('5. Check ReplyLoader - pageId normalization might be removing trailing underscore needed for queries');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ Diagnostic complete');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Store globally for access
  window.comprehensiveDiagnostic = diagnostic;
  
  return diagnostic;
}

// Auto-run after a delay to ensure DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runDiagnostic, 2000);
    });
  } else {
    setTimeout(runDiagnostic, 2000);
  }

  // Expose for manual running
  window.runComprehensiveDiagnostic = runDiagnostic;
}

export { runDiagnostic, diagnostic };


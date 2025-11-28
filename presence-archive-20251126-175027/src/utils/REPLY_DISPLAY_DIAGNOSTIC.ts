/**
 * REPLY DISPLAY DIAGNOSTIC
 * 
 * Diagnoses why replies are not displaying despite successful loading.
 * Checks database values vs query parameters to identify mismatches.
 */

import type { SupabaseClient } from '../types/index.js';

export interface DiagnosticLogEntry {
  time: string;
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface DatabaseCheckResult {
  count?: number;
  replies?: unknown[];
  error?: string;
  errorCode?: string;
  errorDetails?: string;
  errorHint?: string;
}

export interface DatabaseChecks {
  allReplies?: DatabaseCheckResult;
  normalizedPageId?: DatabaseCheckResult;
  originalPageId?: DatabaseCheckResult;
  communityId?: DatabaseCheckResult;
  actualQuery?: DatabaseCheckResult;
}

export interface SchemaInfo {
  actualColumns: string[];
  sampleReply: Record<string, unknown>;
}

export interface DiagnosticResults {
  queryParams: {
    messageId: string;
    pageId: string;
    communityId: string;
  };
  databaseChecks: DatabaseChecks;
  mismatches: string[];
  recommendations: string[];
  schemaInfo?: SchemaInfo;
  actualCommunityId?: string;
  error?: string;
  stack?: string;
}

export interface DiagnosticSummary {
  totalEvents: number;
  errors: number;
}

export interface DiagnosticData {
  logs: DiagnosticLogEntry[];
  summary: DiagnosticSummary;
}

declare global {
  interface Window {
    supabase?: SupabaseClient; // Supabase client
    diagnoseReplyDisplay?: (messageId: string, pageId: string, communityId: string) => Promise<DiagnosticResults>;
    getReplyDisplayDiagnostic?: () => DiagnosticData;
    __replyDisplayDiagnosticActive?: boolean;
  }
}

const DIAGNOSTIC_FLAG = '__replyDisplayDiagnosticActive';

const logs: DiagnosticLogEntry[] = [];
const startTime = performance.now();

function log(event: string, data: Record<string, unknown> = {}): void {
  const timestamp = (performance.now() - startTime).toFixed(2);
  const entry: DiagnosticLogEntry = {
    time: timestamp,
    event,
    timestamp: new Date().toISOString(),
    ...data
  };
  logs.push(entry);
  console.log(`🔍 REPLY_DIAG: [${timestamp}ms] ${event}`, data);
}

// Diagnostic function to check database vs query parameters
export async function diagnoseReplyDisplay(messageId: string, pageId: string, communityId: string): Promise<DiagnosticResults> {
  log('DIAGNOSTIC_START', { messageId, pageId, communityId });

  if (typeof window === 'undefined' || !window.supabase) {
    log('ERROR', { message: 'Supabase client not available' });
    return { 
      queryParams: { messageId, pageId, communityId },
      databaseChecks: {},
      mismatches: [],
      recommendations: [],
      error: 'Supabase client not available' 
    };
  }

  const results: DiagnosticResults = {
    queryParams: { messageId, pageId, communityId },
    databaseChecks: {},
    mismatches: [],
    recommendations: []
  };

  try {
    // Check 1: Find all replies for this message (any page, any community)
    log('CHECK_1', { check: 'Find all replies for message (any constraints)' });
    const supabaseQuery1 = (window.supabase as unknown) as { from: (table: string) => { select: (columns: string) => { eq: (col: string, val: unknown) => { is: (col: string, val: unknown) => Promise<{ data: unknown[] | null; error: { message: string; code?: string; details?: string; hint?: string } | null }> } } } };
    const query1Result = await supabaseQuery1.from('messages').select('*').eq('parent_id', messageId).is('deleted_at', null);
    const { data: allReplies, error: allError } = query1Result;

    if (allError) {
      log('ERROR', { check: 'CHECK_1', error: allError, errorCode: allError.code, errorDetails: allError.details, errorHint: allError.hint });
      results.databaseChecks.allReplies = { 
        error: allError.message,
        errorCode: allError.code,
        errorDetails: allError.details,
        errorHint: allError.hint
      };
    } else {
      results.databaseChecks.allReplies = {
        count: allReplies?.length || 0,
        replies: allReplies || []
      };
      log('CHECK_1_RESULT', { count: allReplies?.length || 0, replies: allReplies });
    }

    // Check 2: Check with normalized pageId
    const normalizedPageId = pageId ? String(pageId).replace(/_+$/, '').trim() : pageId;
    log('CHECK_2', { check: 'Find replies with normalized pageId', normalizedPageId });
    const supabaseQuery2 = (window.supabase as unknown) as { from: (table: string) => { select: (columns: string) => { eq: (col: string, val: unknown) => { eq: (col: string, val: unknown) => { is: (col: string, val: unknown) => Promise<{ data: unknown[] | null; error: { message: string } | null }> } } } } };
    const query2Result = await supabaseQuery2.from('messages').select('*').eq('parent_id', messageId).eq('page_id', normalizedPageId).is('deleted_at', null);
    const { data: normalizedReplies, error: normalizedError } = query2Result;

    if (normalizedError) {
      log('ERROR', { check: 'CHECK_2', error: normalizedError });
      results.databaseChecks.normalizedPageId = { error: normalizedError.message };
    } else {
      results.databaseChecks.normalizedPageId = {
        count: normalizedReplies?.length || 0,
        replies: normalizedReplies || []
      };
      log('CHECK_2_RESULT', { count: normalizedReplies?.length || 0 });
    }

    // Check 3: Check with original pageId (with trailing underscore)
    if (normalizedPageId !== pageId) {
      log('CHECK_3', { check: 'Find replies with original pageId', originalPageId: pageId });
      const supabaseQuery3 = (window.supabase as unknown) as { from: (table: string) => { select: (columns: string) => { eq: (col: string, val: unknown) => { eq: (col: string, val: unknown) => { is: (col: string, val: unknown) => Promise<{ data: unknown[] | null; error: { message: string } | null }> } } } } };
      const query3Result = await supabaseQuery3.from('messages').select('*').eq('parent_id', messageId).eq('page_id', pageId).is('deleted_at', null);
      const { data: originalReplies, error: originalError } = query3Result;

      if (originalError) {
        log('ERROR', { check: 'CHECK_3', error: originalError });
        results.databaseChecks.originalPageId = { error: originalError.message };
      } else {
        results.databaseChecks.originalPageId = {
          count: originalReplies?.length || 0,
          replies: originalReplies || []
        };
        log('CHECK_3_RESULT', { count: originalReplies?.length || 0 });
      }
    }

    // Check 4: Check with community ID
    log('CHECK_4', { check: 'Find replies with communityId', communityId });
    const supabaseQuery4 = (window.supabase as unknown) as { from: (table: string) => { select: (columns: string) => { eq: (col: string, val: unknown) => { eq: (col: string, val: unknown) => { is: (col: string, val: unknown) => Promise<{ data: unknown[] | null; error: { message: string } | null }> } } } } };
    const query4Result = await supabaseQuery4.from('messages').select('*').eq('parent_id', messageId).eq('community_id', communityId).is('deleted_at', null);
    const { data: communityReplies, error: communityError } = query4Result;

    if (communityError) {
      log('ERROR', { check: 'CHECK_4', error: communityError });
      results.databaseChecks.communityId = { error: communityError.message };
    } else {
      results.databaseChecks.communityId = {
        count: communityReplies?.length || 0,
        replies: communityReplies || []
      };
      log('CHECK_4_RESULT', { count: communityReplies?.length || 0 });
    }

    // Check 5: Check with both normalized pageId and communityId (actual query)
    log('CHECK_5', { check: 'Find replies with normalized pageId + communityId (actual query)' });
    const supabaseQuery5 = (window.supabase as unknown) as { from: (table: string) => { select: (columns: string) => { eq: (col: string, val: unknown) => { eq: (col: string, val: unknown) => { eq: (col: string, val: unknown) => { is: (col: string, val: unknown) => Promise<{ data: unknown[] | null; error: { message: string } | null }> } } } } } };
    const query5Result = await supabaseQuery5.from('messages').select('*').eq('parent_id', messageId).eq('page_id', normalizedPageId).eq('community_id', communityId).is('deleted_at', null);
    const { data: actualQueryReplies, error: actualError } = query5Result;

    if (actualError) {
      log('ERROR', { check: 'CHECK_5', error: actualError });
      results.databaseChecks.actualQuery = { error: actualError.message };
    } else {
      results.databaseChecks.actualQuery = {
        count: actualQueryReplies?.length || 0,
        replies: actualQueryReplies || []
      };
      log('CHECK_5_RESULT', { count: actualQueryReplies?.length || 0 });
    }

    // Analyze mismatches and provide detailed diagnostics
    if (allReplies && allReplies.length > 0) {
      // Log actual column names from first reply for debugging
      if (allReplies[0] && typeof allReplies[0] === 'object') {
        const firstReply = allReplies[0] as Record<string, unknown>;
        const actualColumns = Object.keys(firstReply);
        log('SCHEMA_INFO', { actualColumns, sampleReply: firstReply });
        results.schemaInfo = { actualColumns, sampleReply: firstReply };
      }
      
      // CRITICAL: Show actual communityId from database
      const replyArray = allReplies as Array<Record<string, unknown>>;
      const uniqueCommunityIds = Array.from(new Set(replyArray.map(r => String(r.community_id || ''))));
      const actualCommunityId = uniqueCommunityIds[0];
      if (actualCommunityId && actualCommunityId !== communityId) {
        log('COMMUNITY_ID_MISMATCH', { 
          queryCommunityId: communityId, 
          actualCommunityId,
          allCommunityIds: uniqueCommunityIds 
        });
        results.actualCommunityId = actualCommunityId;
        results.mismatches.push(`⚠️ CRITICAL: Query uses communityId '${communityId}', but reply has '${actualCommunityId}'`);
        results.recommendations.push(`❌ RED-LINE VIOLATION: Remove 'comm-001' fallback. Use actual communityId: '${actualCommunityId}'`);
      }
      
      // Replies exist but query found none
      if (actualQueryReplies && actualQueryReplies.length === 0) {
        results.mismatches.push('Replies exist but query with normalized pageId + communityId found none');
        
        // Check page ID format
        const uniquePageIds = Array.from(new Set(replyArray.map(r => String(r.page_id || ''))));
        if (!uniquePageIds.includes(normalizedPageId) && !uniquePageIds.includes(pageId)) {
          results.mismatches.push(`Page ID mismatch: Query uses '${normalizedPageId}' or '${pageId}', but database has: ${uniquePageIds.join(', ')}`);
          results.recommendations.push(`Use pageId: '${uniquePageIds[0]}' from database`);
        }

        // Check community ID format (already checked above, but show again)
        if (!uniqueCommunityIds.includes(communityId)) {
          results.mismatches.push(`Community ID mismatch: Query uses '${communityId}', but database has: ${uniqueCommunityIds.join(', ')}`);
          results.recommendations.push(`Use communityId: '${uniqueCommunityIds[0]}' from database`);
        }
      }
    } else {
      results.mismatches.push('No replies exist in database for this message');
      results.recommendations.push('Verify message has replies in database');
    }

    log('DIAGNOSTIC_COMPLETE', results as unknown as Record<string, unknown>);
    return results;

  } catch (err) {
    const error = err as Error;
    log('ERROR', { error: error.message, stack: error.stack });
    return { 
      queryParams: { messageId, pageId, communityId },
      databaseChecks: {},
      mismatches: [],
      recommendations: [],
      error: error.message, 
      stack: error.stack 
    };
  }
}

// Export diagnostic data
export function getReplyDisplayDiagnostic(): DiagnosticData {
  return {
    logs,
    summary: {
      totalEvents: logs.length,
      errors: logs.filter(l => l.event === 'ERROR').length
    }
  };
}

// Attach to window if available (for browser environment)
if (typeof window !== 'undefined') {
  if (!window[DIAGNOSTIC_FLAG]) {
    window[DIAGNOSTIC_FLAG] = true;
    window.diagnoseReplyDisplay = diagnoseReplyDisplay;
    window.getReplyDisplayDiagnostic = getReplyDisplayDiagnostic;
    
    log('DIAGNOSTIC_LOADED', { timestamp: new Date().toISOString() });
    console.log('✅ REPLY_DIAG: Diagnostic script loaded. Use window.diagnoseReplyDisplay(messageId, pageId, communityId) to diagnose.');
  }
}

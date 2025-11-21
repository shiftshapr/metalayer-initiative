/**
 * REPLY LOADER MODULE - TypeScript Version
 * 
 * Handles loading and managing replies for messages in focus mode.
 * Separates reply loading logic from message rendering.
 */

import type { Message, User } from '../types/index.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';

import type { SupabaseClient } from '../types/index.js';
import type { ApiResponse } from '../types/api.js';

// Declare window globals for backward compatibility
declare const window: Window & {
  supabase?: SupabaseClient;
  api?: {
    request: <T = unknown>(url: string, options?: { method?: string; allow404?: boolean }) => Promise<ApiResponse<T> | null>;
  };
  ReplyLoader?: typeof ReplyLoader;
};

export interface ReplyCheckResult {
  hasReplies: boolean;
  replyCount: number;
}

export interface FormattedReply extends Message {
  isReply: boolean;
  hasReplies: boolean;
  replyCount: number;
}

export class ReplyLoader {
  /**
   * Check if a message has nested replies
   */
  static async checkForNestedReplies(messageId: string, pageId: string, communityId: string): Promise<ReplyCheckResult> {
    const supabase = window.supabase || supabaseServiceInstance.getClient();
    
    if (!supabase || !pageId || !communityId) {
      return { hasReplies: false, replyCount: 0 };
    }

    try {
      // Note: Using snake_case for Supabase queries (boundary normalization)
      const { data: nestedReplies, error } = await supabase
        .from('messages')
        .select('id')
        .eq('parent_id', messageId) // Supabase column name
        .eq('page_id', pageId) // Supabase column name
        .eq('community_id', communityId); // Supabase column name

      if (error) {
        console.warn(`⚠️ ReplyLoader: Error checking nested replies for ${messageId}:`, error);
        return { hasReplies: false, replyCount: 0 };
      }

      const hasReplies = nestedReplies && nestedReplies.length > 0;
      const replyCount = nestedReplies ? nestedReplies.length : 0;

      return { hasReplies, replyCount };
    } catch (err) {
      console.warn(`⚠️ ReplyLoader: Error checking nested replies for ${messageId}:`, err);
      return { hasReplies: false, replyCount: 0 };
    }
  }

  /**
   * Load all replies for a message (recursively)
   */
  static async loadAllReplies(messageId: string, pageId: string, communityId: string): Promise<Message[]> {
    const supabase = window.supabase || supabaseServiceInstance.getClient();
    
    if (!supabase || !pageId || !communityId) {
      console.warn(`⚠️ ReplyLoader: Cannot load replies - missing dependencies`);
      return [];
    }

    try {
      // Load direct replies - using snake_case for Supabase (boundary normalization)
      const { data: directReplies, error } = await supabase
        .from('messages')
        .select('*')
        .eq('parent_id', messageId) // Supabase column name
        .eq('page_id', pageId) // Supabase column name
        .eq('community_id', communityId) // Supabase column name
        .order('created_at', { ascending: true }); // Supabase column name

      if (error) {
        console.error(`❌ ReplyLoader: Error loading direct replies for ${messageId}:`, error);
        return [];
      }

      if (!directReplies || directReplies.length === 0) {
        return [];
      }

      // Recursively load nested replies
      const allReplies: Message[] = [];
      for (const directReply of directReplies) {
        allReplies.push(directReply as Message);

        // Recursively load nested replies
        const loadNestedReplies = async (parentMsg: { id: string; [key: string]: unknown }) => {
          const { data: nestedReplies, error: nestedError } = await supabase
            .from('messages')
            .select('*')
            .eq('parent_id', parentMsg.id) // Supabase column name
            .eq('page_id', pageId) // Supabase column name
            .eq('community_id', communityId) // Supabase column name
            .order('created_at', { ascending: true }); // Supabase column name

          if (!nestedError && nestedReplies && nestedReplies.length > 0) {
            for (const nestedReply of nestedReplies) {
              allReplies.push(nestedReply);
              // Recursively load deeper nested replies
              await loadNestedReplies(nestedReply);
            }
          }
        };

        await loadNestedReplies(directReply);
      }

      return allReplies as Message[];
    } catch (err) {
      console.error(`❌ ReplyLoader: Error loading replies for ${messageId}:`, err);
      return [];
    }
  }

  /**
   * Fetch author data for a reply
   */
  static async fetchReplyAuthor(userId: string): Promise<User> {
    if (!userId) {
      return { id: userId, name: 'Unknown' };
    }

    try {
      if (window.api && window.api.request) {
        const resp = await window.api.request(`/v1/users/${encodeURIComponent(userId)}`, { 
          method: 'GET', 
          allow404: true 
        });

        if (resp) {
          // Normalize to camelCase (boundary normalization)
          const respData = resp as Record<string, unknown> | undefined;
          return {
            id: (typeof respData?.id === 'string' ? respData.id : null) || userId,
            name: (typeof respData?.name === 'string' ? respData.name : null) || 'Unknown',
            avatarUrl: (typeof respData?.avatarUrl === 'string' ? respData.avatarUrl : undefined) || undefined,
            auraColor: (typeof respData?.auraColor === 'string' ? respData.auraColor : undefined) || undefined
          };
        }
      }
    } catch (err) {
      console.error('❌ ReplyLoader: Error fetching reply author:', err);
    }

    return { id: userId, name: 'Unknown' };
  }

  /**
   * Convert Supabase reply data to API format
   */
  static async formatReply(
    replyData: { id: string; user_id?: string; userId?: string; author?: User; body?: string; content?: string; created_at?: string; createdAt?: string; parent_id?: string; [key: string]: unknown }, 
    parentMessage: Message, 
    pageId: string, 
    communityId: string
  ): Promise<FormattedReply> {
    const replyUserId = replyData.user_id || replyData.userId; // Handle both formats
    let replyAuthor = replyData.author;

    // Fetch author if not present
    if (!replyAuthor && replyUserId) {
      replyAuthor = await this.fetchReplyAuthor(replyUserId);
    }

    if (!replyAuthor && replyUserId) {
      replyAuthor = { id: replyUserId, name: 'Unknown' };
    }

    // Check for nested replies
    const { hasReplies, replyCount } = await this.checkForNestedReplies(
      replyData.id,
      pageId,
      communityId
    );

    // Normalize to camelCase (boundary normalization from Supabase)
    return {
      id: replyData.id,
      content: replyData.body || replyData.content || '',
      author: replyAuthor,
      authorId: replyUserId,
      createdAt: replyData.created_at || replyData.createdAt || new Date().toISOString(),
      parentId: replyData.parent_id || parentMessage.id,
      conversationId: parentMessage.conversationId,
      communityId: communityId,
      pageId: pageId,
      isReply: true,
      hasReplies: hasReplies,
      replyCount: replyCount
    } as FormattedReply;
  }
}

// Export to window for backward compatibility
if (typeof window !== 'undefined') {
  (window as typeof window & { ReplyLoader: typeof ReplyLoader }).ReplyLoader = ReplyLoader;
  console.log('✅ ReplyLoader: Exported to window');
}

export default ReplyLoader;


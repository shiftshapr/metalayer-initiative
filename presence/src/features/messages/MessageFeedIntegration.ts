/**
 * MessageFeedIntegration - Bridges new MessageFeed with existing MessagesModule
 * 
 * Provides a clean integration point that replaces the old rendering system
 * while maintaining compatibility with existing loadChatHistory calls.
 */

import { MessageFeed } from './MessageFeed.js';
import type { MessageFeedOptions, MessageFeedInternal } from './MessageFeed.js';
import { Logger } from '../../utils/Logger.js';

let activeMessageFeed: MessageFeed | null = null;

/**
 * Initialize MessageFeed for a container
 */
export async function initializeMessageFeed(options: MessageFeedOptions): Promise<MessageFeed> {
  Logger.debug('MessageFeedIntegration: Initializing MessageFeed', { 
    pageId: options.pageId,
    communityId: options.communityId 
  }, 'messages');

  // Destroy existing feed if any
  if (activeMessageFeed) {
    activeMessageFeed.destroy();
    activeMessageFeed = null;
  }

  // Create new feed
  const feed = new MessageFeed(options);
  await feed.initialize();
  
  activeMessageFeed = feed;
  
  Logger.debug('MessageFeedIntegration: MessageFeed initialized', null, 'messages');
  return feed;
}

/**
 * Get active MessageFeed instance
 */
export function getActiveMessageFeed(): MessageFeed | null {
  return activeMessageFeed;
}

/**
 * Destroy active MessageFeed
 */
export function destroyMessageFeed(): void {
  if (activeMessageFeed) {
    activeMessageFeed.destroy();
    activeMessageFeed = null;
    Logger.debug('MessageFeedIntegration: MessageFeed destroyed', null, 'messages');
  }
}

/**
 * Load messages using MessageFeed
 * This replaces the old loadChatHistory rendering logic
 */
export async function loadMessagesViaFeed(
  pageId: string,
  communityId: string,
  container: HTMLElement,
  supabaseClient?: unknown
): Promise<void> {
  console.log('🔵 MessageFeedIntegration: Loading messages via feed', { 
    pageId, 
    communityId,
    containerExists: !!container,
    supabaseClientAvailable: !!supabaseClient
  });
  Logger.debug('MessageFeedIntegration: Loading messages via feed', { 
    pageId, 
    communityId 
  }, 'messages');

  try {
    // Get or create feed
    let feed = activeMessageFeed;
    console.log('🔵 MessageFeedIntegration: Current feed:', feed ? 'exists' : 'null');
    
    // Check if we need to create a new feed (different page or no feed exists)
    const needsNewFeed = !feed || (feed as MessageFeedInternal).options.pageId !== pageId;
    console.log('🔵 MessageFeedIntegration: Needs new feed:', needsNewFeed);
    
    if (needsNewFeed) {
      console.log('🔵 MessageFeedIntegration: Creating new MessageFeed...');
      // Create new feed for this page
      feed = await initializeMessageFeed({
        container,
        pageId,
        communityId,
        supabaseClient,
        onMessageClick: (message) => {
          // Handle message click - could open focus mode
          Logger.debug('MessageFeedIntegration: Message clicked', { messageId: message.id }, 'messages');
        },
        onReplyClick: async (message) => {
          // Handle reply click - enter focus mode
          const currentFeed = activeMessageFeed;
          if (currentFeed) {
            await currentFeed.enterFocusMode(message.parentId || '', message.id);
          }
        },
        onFocusClick: (message) => {
          // Handle focus click - enter focus mode for this message
          const currentFeed = activeMessageFeed;
          if (currentFeed) {
            currentFeed.enterFocusMode(message.id);
          }
        }
      });
      console.log('🔵 MessageFeedIntegration: MessageFeed created successfully');
    }

    // Load messages (will use current focus state or default)
    if (feed) {
      console.log('🔵 MessageFeedIntegration: Calling feed.loadMessages()...');
      await feed.loadMessages();
      console.log('🔵 MessageFeedIntegration: feed.loadMessages() completed');
    } else {
      console.error('❌ MessageFeedIntegration: Feed is null after initialization');
      throw new Error('MessageFeedIntegration: Failed to create or retrieve feed');
    }
    
    console.log('✅ MessageFeedIntegration: Messages loaded via feed');
    Logger.debug('MessageFeedIntegration: Messages loaded via feed', null, 'messages');
  } catch (error) {
    console.error('❌ MessageFeedIntegration: Error loading messages via feed', error);
    Logger.error('MessageFeedIntegration: Error loading messages via feed', error, 'messages');
    throw error;
  }
}


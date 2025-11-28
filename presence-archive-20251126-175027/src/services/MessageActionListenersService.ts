/**
 * MESSAGE ACTION LISTENERS SERVICE
 * 
 * Handles attaching event listeners to message action buttons.
 * Replaces getWindowFunction() lookups with dependency injection.
 * 
 * Phase 3: Dependency Injection
 */

import type { Message } from '../types/index.js';

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
interface ReactionsService {
  toggleReaction?: (messageId: string) => Promise<void>;
  loadReactions?: (messageId: string) => Promise<void>;
}

interface BookmarkService {
  toggleBookmark?: (messageId: string) => Promise<void>;
}

interface ReplyService {
  replyToMessage?: (message: Message) => Promise<void>;
}

interface RepostService {
  repostMessage?: (message: Message) => Promise<void>;
}

interface ShareService {
  shareMessage?: (message: Message) => Promise<void>;
}

interface EditService {
  editMessage?: (messageId: string, newContent: string) => Promise<void>;
}

interface DeleteService {
  deleteMessage?: (messageId: string) => Promise<void>;
}

interface MessageActionListenersDependencies {
  reactionsService?: ReactionsService;
  bookmarkService?: BookmarkService;
  replyService?: ReplyService;
  repostService?: RepostService;
  shareService?: ShareService;
  editService?: EditService;
  deleteService?: DeleteService;
}

export class MessageActionListenersService {
  private reactionsService?: ReactionsService;
  private bookmarkService?: BookmarkService;
  private replyService?: ReplyService;
  private repostService?: RepostService;
  private shareService?: ShareService;
  private editService?: EditService;
  private deleteService?: DeleteService;

  constructor(dependencies: MessageActionListenersDependencies = {}) {
    this.reactionsService = dependencies.reactionsService;
    this.bookmarkService = dependencies.bookmarkService;
    this.replyService = dependencies.replyService;
    this.repostService = dependencies.repostService;
    this.shareService = dependencies.shareService;
    this.editService = dependencies.editService;
    this.deleteService = dependencies.deleteService;
  }
  
  /**
   * Attach all action listeners to a message element
   */
  attachListeners(messageElement: HTMLElement, message: Message): void {
    // Find all action buttons
    const reactionBtn = messageElement.querySelector('.reaction-btn') as HTMLElement | null;
    const bookmarkBtn = messageElement.querySelector('.bookmark-btn') as HTMLElement | null;
    const replyBtn = messageElement.querySelector('.inline-reply-btn') as HTMLElement | null;
    const repostBtn = messageElement.querySelector('.repost-btn') as HTMLElement | null;
    const shareBtn = messageElement.querySelector('.share-btn') as HTMLElement | null;
    const editBtn = messageElement.querySelector('.edit-btn') as HTMLElement | null;
    const deleteBtn = messageElement.querySelector('.delete-btn') as HTMLElement | null;

    // Attach listeners if buttons exist and services are available
    if (reactionBtn) {
      this.attachReactionListener(reactionBtn, message);
    }

    if (bookmarkBtn) {
      this.attachBookmarkListener(bookmarkBtn, message);
    }

    if (replyBtn && this.replyService?.replyToMessage) {
      const replyService = this.replyService;
      replyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        replyService.replyToMessage!(message).catch(err => {
          Logger.error('❌ MessageActionListenersService: Reply failed:', err, 'general');
        });
      });
    }

    if (repostBtn && this.repostService?.repostMessage) {
      const repostService = this.repostService;
      repostBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        repostService.repostMessage!(message).catch(err => {
          Logger.error('❌ MessageActionListenersService: Repost failed:', err, 'general');
        });
      });
    }

    if (shareBtn && this.shareService?.shareMessage) {
      const shareService = this.shareService;
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shareService.shareMessage!(message).catch(err => {
          Logger.error('❌ MessageActionListenersService: Share failed:', err, 'general');
        });
      });
    }

    // Edit and Delete buttons are in dropdown menu
    const actionMenu = messageElement.querySelector('.message-actions-menu');
    if (actionMenu) {
      const editBtnInMenu = actionMenu.querySelector('.edit-btn') as HTMLElement | null;
      const deleteBtnInMenu = actionMenu.querySelector('.delete-btn') as HTMLElement | null;
      
      if (editBtnInMenu) {
        this.attachEditListener(editBtnInMenu, message);
      }
      
      if (deleteBtnInMenu) {
        this.attachDeleteListener(deleteBtnInMenu, message);
      }
    }
    
    // Also check for direct edit/delete buttons (if not in menu)
    if (editBtn) {
      this.attachEditListener(editBtn, message);
    }

    if (deleteBtn) {
      this.attachDeleteListener(deleteBtn, message);
    }
  }
  
  /**
   * Attach reaction listener
   */
  attachReactionListener(button: HTMLElement, message: Message): void {
    // CRITICAL FIX: Use window fallback if service not available
    const win = typeof window !== 'undefined' ? window : undefined;
    const toggleReaction = this.reactionsService?.toggleReaction || 
      (win && typeof win.toggleReaction === 'function' ? win.toggleReaction : undefined);
    const loadReactions = this.reactionsService?.loadReactions || 
      (win && typeof win.loadMessageReactions === 'function' ? win.loadMessageReactions : undefined);

    if (!toggleReaction) {
      Logger.warn('⚠️ MessageActionListenersService: ReactionsService not available and no window fallback', null, 'general');
      return;
    }

    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      try {
        await toggleReaction(message.id);
        
        // Load reactions after toggle to update UI
        if (loadReactions) {
          await loadReactions(message.id);
        }
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'MessageActionListenersService',
            messageId: message?.id
            }
        });;
      
    }
    });
  }
  
  /**
   * Attach bookmark listener
   */
  attachBookmarkListener(button: HTMLElement, message: Message): void {
    // CRITICAL FIX: Use window fallback if service not available
    const win = typeof window !== 'undefined' ? window : undefined;
    const toggleBookmark = this.bookmarkService?.toggleBookmark || 
      (win && typeof win.toggleBookmark === 'function' ? win.toggleBookmark : undefined);

    if (!toggleBookmark) {
      Logger.warn('⚠️ MessageActionListenersService: BookmarkService not available and no window fallback', null, 'general');
      return;
    }

    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await toggleBookmark(message.id);
        
        // Update button state
        const isBookmarked = button.classList.contains('active');
        button.classList.toggle('active', !isBookmarked);
        button.dataset.isBookmarked = String(!isBookmarked);
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'MessageActionListenersService',
            messageId: message?.id
            }
        });;
      
    }
    });
  }
  
  /**
   * Attach edit listener
   */
  attachEditListener(button: HTMLElement, message: Message): void {
    // CRITICAL FIX: Use window fallback if service not available
    const win = typeof window !== 'undefined' ? window : undefined;
    const editFn = this.editService?.editMessage || 
                   (win && typeof win.updateMessageInChat === 'function' 
                     ? async (id: string, content: string) => {
                         const msg = { ...message, id, content } as Message;
                         if (win && typeof win.updateMessageInChat === 'function') {
                           win.updateMessageInChat(msg);
                         }
                       }
                     : undefined);

    if (!editFn) {
      Logger.warn('⚠️ MessageActionListenersService: EditService not available and no window fallback', null, 'general');
      return;
    }

    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      // Get new content from user (simplified - in real implementation, show edit modal)
      const contentElement = button.closest('.message')?.querySelector('.message-content') as HTMLElement | null;
      if (!contentElement) {
        Logger.warn('⚠️ MessageActionListenersService: Could not find message content element', null, 'general');
        return;
      }

      const currentContent = contentElement.textContent || '';
      const newContent = prompt('Edit message:', currentContent);
      
      if (newContent !== null && newContent !== currentContent) {
        try {
          await editFn(message.id, newContent);
        } catch (error: unknown) {
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'MessageActionListenersService',
            messageId: message?.id
            }
        });;
        
    }
      }
    });
  }
  
  /**
   * Attach delete listener
   */
  attachDeleteListener(button: HTMLElement, message: Message): void {
    if (!this.deleteService?.deleteMessage) {
      Logger.warn('⚠️ MessageActionListenersService: DeleteService not available', null, 'general');
      return;
    }

    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this message?')) {
        return;
      }

      try {
        await this.deleteService!.deleteMessage!(message.id);
        
        // Remove message element from DOM
        const messageElement = button.closest('.message') as HTMLElement | null;
        if (messageElement) {
          messageElement.remove();
        }
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'MessageActionListenersService',
            messageId: message?.id
            }
        });;
      
    }
    });
  }
}

// Singleton instance
let messageActionListenersServiceInstance: MessageActionListenersService | null = null;

/**
 * Initialize the service with dependencies
 */
export function initializeMessageActionListenersService(dependencies: MessageActionListenersDependencies): MessageActionListenersService {
  messageActionListenersServiceInstance = new MessageActionListenersService(dependencies);
  return messageActionListenersServiceInstance;
}

/**
 * Get the service instance
 */
export function getMessageActionListenersService(): MessageActionListenersService {
  if (!messageActionListenersServiceInstance) {
    throw new Error('MessageActionListenersService not initialized. Call initializeMessageActionListenersService() first.');
  }
  return messageActionListenersServiceInstance;
}


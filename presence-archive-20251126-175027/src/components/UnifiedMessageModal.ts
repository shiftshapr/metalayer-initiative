/**
 * UnifiedMessageModal - Unified modal for creating/updating all message types
 * 
 * Features:
 * - New messages (top-level)
 * - Replies (with parent context)
 * - Quotes (with quoted message preview)
 * - Edits (existing message content)
 * - Media attachments (images, audio, video) with preview
 * - Emoji picker
 * - Camera capture
 * - Focus context support
 */

import type { Message } from '../types/index.js';
import { getXIcon } from '../utils/XPatternSystem.js';
import { messageStore } from '../services/MessageStore.js';
import { getEmojiMetadata } from '../utils/EmojiUtils.js';

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
import { API_CONFIG } from '../core/APIConfig.js';
export type MessageModalMode = 'new' | 'reply' | 'quote' | 'edit';

export type MessageKind = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'MIXED';

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  mimeType: string;
  blob?: Blob; // For new uploads
}

export interface EmojiMetadata {
  emojis?: string[];
  emojiCount?: number;
  hasEmoji?: boolean;
}

export interface FocusContext {
  mode: 'default' | 'parent-in-focus' | 'child-in-focus';
  parentId?: string;
  childId?: string;
}

export interface MessageModalOptions {
  mode: MessageModalMode;
  pageId: string;
  communityId?: string;
  parentId?: string | null;
  quoteId?: string | null;
  editMessage?: Message;
  focusContext?: FocusContext;
  premiumText?: boolean; // Premium option: white text instead of neon blue
  onSuccess?: (message: Message) => void;
  onDraftSaved?: (message: Message) => void;
  onCancel?: () => void;
}

export class UnifiedMessageModal {
  private modal: HTMLElement | null = null;
  private options: MessageModalOptions | null = null;
  private attachments: Attachment[] = [];
  private emojiMetadata: EmojiMetadata = {};
  private cameraStream: MediaStream | null = null;
  private isOpen = false;
  private parentMessage: Message | null = null;
  private quotedMessage: Message | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      // Close on Escape key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }

  /**
   * Open the modal with the given options
   */
  async open(options: MessageModalOptions): Promise<void> {
    try {
      this.options = options;
      this.attachments = [];
      this.emojiMetadata = {};
      this.parentMessage = null;
      this.quotedMessage = null;
      
      // If editing, load existing message data
      if (options.mode === 'edit' && options.editMessage) {
        // TODO: Load attachments and emoji metadata from existing message
      }

      // Load parent message for replies
      if (options.mode === 'reply' && options.parentId) {
        await this.loadParentMessage(options.parentId);
      }

      // Load quoted message for quotes
      if (options.mode === 'quote' && options.quoteId) {
        await this.loadQuotedMessage(options.quoteId);
      }

      await this.render();
      this.isOpen = true;
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'open', component: 'UnifiedMessageModal' }
      });
    }
  }

  /**
   * Close the modal
   */
  close(): void {
    this.cleanup();
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    this.isOpen = false;
    this.options?.onCancel?.();
  }

  /**
   * Render the modal HTML
   * 
   * CRITICAL: Modal must be appended to document.body (not sidebar) to escape
   * sidebar container constraints. Fixed positioning is viewport-relative, but
   * parent overflow:hidden can still clip it, so we ensure body is the parent.
   */
  private async render(): Promise<void> {
    try {
      if (!this.options) return;

      // Ensure pageId is set - resolve from stateManager if missing
      if (!this.options.pageId) {
        const win = window as Window & { 
          stateManagerInstance?: { getState: (path: string) => unknown };
        };
        const urlData = win.stateManagerInstance?.getState('currentUrlData') as { pageId?: string } | null;
        if (urlData?.pageId) {
          this.options.pageId = urlData.pageId;
          Logger.debug('📝 UnifiedMessageModal: Resolved pageId from stateManager:', this.options.pageId, 'messages');
        } else {
          // Try to get from current location
          const currentUrl = window.location.href;
          // Generate pageId from URL (same logic as used elsewhere)
          const pageId = currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/[^a-zA-Z0-9]/g, '_');
          this.options.pageId = pageId;
          Logger.debug('📝 UnifiedMessageModal: Generated pageId from URL:', this.options.pageId, 'messages');
        }
      }

      // Remove existing modal if present
      const existing = document.getElementById('unified-message-modal');
      if (existing) {
        existing.remove();
      }

      const modal = document.createElement('div');
      modal.id = 'unified-message-modal';
      modal.className = 'unified-message-modal';
      modal.innerHTML = await this.getModalHTML();
    
    // CRITICAL: Append to body (not sidebar) to escape container constraints
    // Fixed positioning is viewport-relative, but parent overflow can still clip
    // By appending to body, we ensure modal is outside sidebar container
    // 
    // Chrome Extension Sidepanel Note:
    // - Sidepanels have their own viewport (typically 320-400px wide)
    // - Fixed positioning is relative to sidepanel viewport, not browser window
    // - Modal can overflow left using negative margin-left
    // - Body/html must have overflow-x: visible to allow overflow
    document.body.appendChild(modal);
    this.modal = modal;
    
    // Verify modal is actually in body (not sidebar)
    if (this.modal.parentElement !== document.body) {
      Logger.warn('⚠️ MODAL: Modal parent is not body! Moving to body...', null, 'messages');
      document.body.appendChild(this.modal);
    }
    
    // Modal is now sized to fit within sidepanel - no overflow needed
    // CSS handles responsive sizing (calc(100vw - 40px) with max-width: 300px)

      // Setup event handlers
      this.setupModalHandlers();

      // Auto-resize textarea on initial render and focus
      const textarea = modal.querySelector('#message-content') as HTMLTextAreaElement;
      if (textarea) {
        // Initial resize to fill available space
        setTimeout(() => {
          this.autoResizeTextarea(textarea);
        }, 50);
        textarea.focus();
      }
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'render', component: 'UnifiedMessageModal' }
      });
    }
  }

  /**
   * Get modal HTML based on mode
   * X (Twitter) Design Pattern:
   * - Top bar: X (close) on left, "Drafts" on right
   * - User profile picture on left
   * - Audience selector ("Everyone" dropdown) next to profile
   * - Large text input with "What's happening?" placeholder
   * - Reply settings below ("Everyone can reply" with globe icon)
   * - Bottom toolbar with icons (media, GIF, poll, list, emoji, calendar, location, bold, italic)
   * - Post button (gray when disabled, blue when active)
   */
  private async getModalHTML(): Promise<string> {
    try {
      if (!this.options) return '';

      const { mode, editMessage, parentId, quoteId } = this.options;
      const content = editMessage?.content || '';
      const showParentContext = mode === 'reply' && parentId;
      const showQuoteContext = mode === 'quote' && quoteId;
      
      // Get current user for profile picture
      const currentUser = this.getCurrentUser();
      const userAvatar = (currentUser?.avatarUrl as string) || (currentUser?.picture as string) || '';
      const userName = (currentUser?.name as string) || (currentUser?.displayName as string) || 'You';
      
      // Get current community for audience selector
      const win = window as Window & { stateManagerInstance?: { getState: (path: string) => unknown } };
      const activeCommunities = win.stateManagerInstance?.getState('ui.activeCommunities') as string[] | null;
      const communityId = activeCommunities?.[0] || this.options.communityId;
      const audienceLabel = communityId ? 'Community' : 'Everyone';

      // Get avatar HTML (async)
      const avatarHTML = await this.getAvatarHTML(currentUser, userAvatar, userName);

      return `
      <div class="unified-message-modal-overlay"></div>
      <div class="unified-message-modal-content x-design-pattern${this.options.premiumText ? ' premium-text' : ''}"${this.options.premiumText ? ' data-premium="true"' : ''}>
        <!-- Top Bar: X (close) on left only -->
        <div class="unified-message-modal-top-bar">
          <button class="unified-message-modal-close x-close-btn" aria-label="Close">
            ${getXIcon('close', { width: 20, height: 20 })}
          </button>
        </div>
        
        <!-- User Profile and Audience Selection -->
        <div class="unified-message-user-section">
          <div class="unified-message-user-avatar x-avatar-container">
            ${avatarHTML}
          </div>
          <div class="unified-message-audience-selector">
            <button class="audience-select-btn x-audience-selector" id="audience-select-btn">
              <span class="audience-label">${audienceLabel}</span>
              ${getXIcon('chevronDown', { width: 16, height: 16 })}
            </button>
          </div>
        </div>
        
        <!-- Message Context (reply/quote) -->
        <div class="unified-message-context" id="message-context">
          ${showParentContext ? this.getParentContextHTML() : ''}
          ${showQuoteContext ? this.getQuoteContextHTML() : ''}
        </div>
        
        <!-- Main Text Input Area -->
        <div class="unified-message-input-container">
          <textarea 
            id="message-content" 
            class="unified-message-textarea x-input"
            placeholder="What's happening?"
            rows="10"
          >${content}</textarea>
          
          <div class="unified-message-attachments-preview" id="attachments-preview"></div>
        </div>
        
        <!-- Reply Settings -->
        <div class="unified-message-reply-settings">
          ${getXIcon('globe', { width: 16, height: 16, className: 'globe-icon' })}
          <span class="reply-settings-text">Everyone can reply</span>
        </div>
        
        <!-- Bottom Toolbar -->
        <div class="unified-message-toolbar x-toolbar">
          <div class="unified-message-toolbar-left">
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="attach-media-btn" title="Media">
              ${getXIcon('media', { width: 20, height: 20 })}
            </button>
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="gif-btn" title="GIF">
              <span class="gif-label">GIF</span>
            </button>
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="poll-btn" title="Poll">
              ${getXIcon('poll', { width: 20, height: 20 })}
            </button>
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="list-btn" title="List">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            </button>
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="emoji-btn" title="Emoji">
              ${getXIcon('emoji', { width: 20, height: 20 })}
            </button>
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="calendar-btn" title="Schedule">
              ${getXIcon('schedule', { width: 20, height: 20 })}
            </button>
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="location-btn" title="Location">
              ${getXIcon('location', { width: 20, height: 20 })}
            </button>
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="bold-btn" title="Bold">
              ${getXIcon('bold', { width: 20, height: 20 })}
            </button>
            <button class="unified-message-toolbar-btn x-toolbar-icon" id="italic-btn" title="Italic">
              ${getXIcon('italic', { width: 20, height: 20 })}
            </button>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="unified-message-actions">
          <button class="unified-message-btn unified-message-btn-secondary x-save-draft-btn" id="save-draft-btn">
            Drafts
          </button>
          <button class="unified-message-btn unified-message-btn-primary x-post-button" id="send-btn" disabled>
            ${mode === 'edit' ? 'Update' : 'Post'}
          </button>
        </div>
      </div>
      
      <!-- Hidden file input -->
      <input 
        type="file" 
        id="media-file-input" 
        accept="image/*,audio/*,video/*" 
        multiple 
        style="display: none;"
      />
      
      <!-- Camera video element (hidden) -->
      <video id="camera-video" style="display: none;"></video>
      <canvas id="camera-canvas" style="display: none;"></canvas>
    `;
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'getModalHTML', component: 'UnifiedMessageModal' }
      });
      return '';
    }
  }

  // Removed unused method: getModalTitle
  // Modal title is handled in the HTML template, not needed as a separate method

  private getParentContextHTML(): string {
    if (!this.parentMessage) {
      return '<div class="unified-message-parent-context"><div class="unified-message-loading">Loading...</div></div>';
    }

    const authorName = this.parentMessage.author?.displayName || 
                      this.parentMessage.author?.name || 
                      this.parentMessage.author?.handle || 
                      'Unknown';
    const content = this.parentMessage.content || '';
    const truncatedContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

    return `
      <div class="unified-message-parent-context">
        <div class="unified-message-parent-preview">
          <span class="unified-message-context-label">Replying to:</span>
          <div class="unified-message-parent-content">
            <div class="unified-message-context-author">${this.escapeHtml(authorName)}</div>
            <div class="unified-message-context-text">${this.escapeHtml(truncatedContent)}</div>
          </div>
        </div>
      </div>
    `;
  }

  private getQuoteContextHTML(): string {
    if (!this.quotedMessage) {
      return '<div class="unified-message-quote-context"><div class="unified-message-loading">Loading...</div></div>';
    }

    const authorName = this.quotedMessage.author?.displayName || 
                      this.quotedMessage.author?.name || 
                      this.quotedMessage.author?.handle || 
                      'Unknown';
    const content = this.quotedMessage.content || '';
    const truncatedContent = content.length > 150 ? content.substring(0, 150) + '...' : content;

    return `
      <div class="unified-message-quote-context">
        <div class="unified-message-quote-preview">
          <span class="unified-message-context-label">Quoting:</span>
          <div class="unified-message-quote-content">
            <div class="unified-message-context-author">${this.escapeHtml(authorName)}</div>
            <div class="unified-message-context-text">${this.escapeHtml(truncatedContent)}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Re-render context sections (reply/quote)
   */
  private renderContextSection(): void {
    if (!this.modal || !this.options) return;
    const container = this.modal.querySelector('#message-context');
    if (!container) return;

    const showParent = this.options.mode === 'reply' && this.options.parentId;
    const showQuote = this.options.mode === 'quote' && this.options.quoteId;

    let html = '';
    if (showParent) {
      html += this.getParentContextHTML();
    }
    if (showQuote) {
      html += this.getQuoteContextHTML();
    }

    container.innerHTML = html;
  }

  /**
   * Load parent message data
   */
  private async loadParentMessage(parentId: string): Promise<void> {
    try {
      const apiBaseUrl = this.resolveApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/messages/${parentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load parent message: ${response.statusText}`);
      }

      this.parentMessage = await response.json() as Message;
      
      this.renderContextSection();
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedMessageModal'
            }
        });;
      // Don't block modal opening if parent load fails
    
    }
  }

  /**
   * Load quoted message data
   */
  private async loadQuotedMessage(quoteId: string): Promise<void> {
    try {
      const apiBaseUrl = this.resolveApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/messages/${quoteId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load quoted message: ${response.statusText}`);
      }

      this.quotedMessage = await response.json() as Message;
      
      this.renderContextSection();
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedMessageModal'
            }
        });;
      // Don't block modal opening if quote load fails
    
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Setup event handlers for modal interactions
   */
  private setupModalHandlers(): void {
    if (!this.modal) return;

    // Close button (X)
    const closeBtn = this.modal.querySelector('.unified-message-modal-close, .x-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    // Overlay click
    const overlay = this.modal.querySelector('.unified-message-modal-overlay');
    overlay?.addEventListener('click', () => this.close());

    // Drafts button
    const draftsBtn = this.modal.querySelector('#drafts-btn');
    draftsBtn?.addEventListener('click', () => this.handleDrafts());

    // Audience selector
    const audienceBtn = this.modal.querySelector('#audience-select-btn');
    audienceBtn?.addEventListener('click', () => this.handleAudienceSelect());

    // Send/Post button
    const saveDraftBtn = this.modal.querySelector('#save-draft-btn');
    const sendBtn = this.modal.querySelector('#send-btn');
    saveDraftBtn?.addEventListener('click', () => this.handleSaveDraft());
    sendBtn?.addEventListener('click', () => this.handleSend());

    // Textarea auto-resize and character count
    const textarea = this.modal.querySelector('#message-content') as HTMLTextAreaElement;
    if (textarea) {
      textarea.addEventListener('input', () => {
        this.updatePostButtonState();
        this.autoResizeTextarea(textarea);
      });
    }

    // Media attachment button
    const attachMediaBtn = this.modal.querySelector('#attach-media-btn');
    attachMediaBtn?.addEventListener('click', () => this.handleAttachMedia());

    // GIF button
    const gifBtn = this.modal.querySelector('#gif-btn');
    gifBtn?.addEventListener('click', () => this.handleGIF());

    // Poll button
    const pollBtn = this.modal.querySelector('#poll-btn');
    pollBtn?.addEventListener('click', () => this.handlePoll());

    // List button
    const listBtn = this.modal.querySelector('#list-btn');
    listBtn?.addEventListener('click', () => this.handleList());

    // Emoji button
    const emojiBtn = this.modal.querySelector('#emoji-btn');
    emojiBtn?.addEventListener('click', () => this.handleEmojiPicker());

    // Calendar button
    const calendarBtn = this.modal.querySelector('#calendar-btn');
    calendarBtn?.addEventListener('click', () => this.handleSchedule());

    // Location button
    const locationBtn = this.modal.querySelector('#location-btn');
    locationBtn?.addEventListener('click', () => this.handleLocation());

    // Bold button
    const boldBtn = this.modal.querySelector('#bold-btn');
    boldBtn?.addEventListener('click', () => this.handleBold());

    // Italic button
    const italicBtn = this.modal.querySelector('#italic-btn');
    italicBtn?.addEventListener('click', () => this.handleItalic());

    // File input change
    const fileInput = this.modal.querySelector('#media-file-input') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
    
    // Initial button state
    this.updatePostButtonState();
  }
  
  /**
   * Update Post button state (disabled when empty, enabled when has content)
   */
  private updatePostButtonState(): void {
    const sendBtn = this.modal?.querySelector('#send-btn') as HTMLButtonElement;
    const textarea = this.modal?.querySelector('#message-content') as HTMLTextAreaElement;
    if (sendBtn && textarea) {
      const hasContent = textarea.value.trim().length > 0 || this.attachments.length > 0;
      sendBtn.disabled = !hasContent;
    }
  }
  
  /**
   * Auto-resize textarea
   */
  private autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    if (!this.modal) return;
    
    // Calculate available height for textarea
    const modalContent = this.modal.querySelector('.unified-message-modal-content') as HTMLElement;
    if (!modalContent) return;
    
    // Get heights of other elements
    const topBar = this.modal.querySelector('.unified-message-modal-top-bar') as HTMLElement;
    const userSection = this.modal.querySelector('.unified-message-user-section') as HTMLElement;
    const contextSection = this.modal.querySelector('.unified-message-context') as HTMLElement;
    const replySettings = this.modal.querySelector('.unified-message-reply-settings') as HTMLElement;
    const toolbar = this.modal.querySelector('.unified-message-toolbar') as HTMLElement;
    const actions = this.modal.querySelector('.unified-message-actions') as HTMLElement;
    
    const modalHeight = modalContent.clientHeight;
    const usedHeight = 
      (topBar?.offsetHeight || 0) +
      (userSection?.offsetHeight || 0) +
      (contextSection?.offsetHeight || 0) +
      (replySettings?.offsetHeight || 0) +
      (toolbar?.offsetHeight || 0) +
      (actions?.offsetHeight || 0) +
      32; // Padding/margins
    
    const availableHeight = modalHeight - usedHeight;
    const minHeight = parseFloat(getComputedStyle(textarea).lineHeight || '22.5') * 10; // 10 lines
    
    // Reset height to calculate scrollHeight
    textarea.style.height = 'auto';
    const contentHeight = textarea.scrollHeight;
    
    // Set height to fill available space, but not less than 10 lines
    const targetHeight = Math.max(minHeight, Math.min(contentHeight, availableHeight));
    textarea.style.height = `${targetHeight}px`;
  }
  
  /**
   * Handle drafts
   */
  private async handleDrafts(): Promise<void> {
    try {
      Logger.debug('📝 DRAFTS: Opening drafts', null, 'messages');
      
      // Import and open draft selection modal
      const { draftSelectionModal } = await import('./DraftSelectionModal.js');
      const currentUser = this.getCurrentUser();
      const userId = (currentUser?.id as string) || '';
      
      if (!this.options) return;

      if (!userId) {
        alert('Sign in to access drafts');
        return;
      }
      
      await draftSelectionModal.open({
        pageId: this.options.pageId,
        userId,
        onSelect: async (draft) => {
          try {
            // Load draft into modal
            await this.loadDraft(draft);
          } catch (error: unknown) {
            handleError(error, {
              context: { operation: 'onSelectDraft', component: 'UnifiedMessageModal' }
            });
          }
        },
      onDelete: () => {
        Logger.debug('📝 DRAFT: Draft deleted', null, 'messages');
      },
        onCancel: () => {
          Logger.debug('📝 DRAFT: Draft selection cancelled', null, 'messages');
        }
      });
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'handleDrafts', component: 'UnifiedMessageModal' }
      });
    }
  }

  /**
   * Load a draft into the modal
   */
  private async loadDraft(draft: { id: string; content: string; parentId?: string | null; quoteId?: string | null; attachments?: unknown[] }): Promise<void> {
    try {
      if (!this.modal) return;

      // Set content
      const textarea = this.modal.querySelector('#message-content') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = draft.content;
        // Trigger input event to update character count and send button state
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Update options/context for parent or quote
      if (this.options) {
        this.options.parentId = draft.parentId || null;
        this.options.quoteId = draft.quoteId || null;
      }

      if (draft.parentId) {
        if (this.options) {
          this.options.mode = 'reply';
        }
        await this.loadParentMessage(draft.parentId);
      } else {
        this.parentMessage = null;
      }

      if (draft.quoteId) {
        if (this.options) {
          this.options.mode = 'quote';
        }
        await this.loadQuotedMessage(draft.quoteId);
      } else {
        this.quotedMessage = null;
      }

      if (!draft.parentId && !draft.quoteId && this.options && this.options.mode !== 'edit') {
        this.options.mode = 'new';
      }

      this.renderContextSection();

      // Load attachments if any
      if (draft.attachments && draft.attachments.length > 0) {
        // TODO: Load attachments
        Logger.debug('📝 DRAFT: Loading attachments', draft.attachments, 'messages');
      }

      // Focus textarea
      textarea?.focus();
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'loadDraft', component: 'UnifiedMessageModal' }
      });
    }
  }
  
  /**
   * Handle audience selection
   */
  private handleAudienceSelect(): void {
    Logger.debug('👥 AUDIENCE: Opening audience selector', null, 'messages');
    // TODO: Implement audience selector dropdown
  }
  
  /**
   * Handle GIF picker
   */
  private handleGIF(): void {
    Logger.debug('🎬 GIF: Opening GIF picker', null, 'messages');
    // TODO: Implement GIF picker
  }
  
  /**
   * Handle poll creation
   */
  private handlePoll(): void {
    Logger.debug('📊 POLL: Opening poll creator', null, 'messages');
    // TODO: Implement poll creation
  }
  
  /**
   * Handle list creation
   */
  private handleList(): void {
    Logger.debug('📋 LIST: Opening list creator', null, 'messages');
    // TODO: Implement list creation
  }
  
  /**
   * Handle schedule
   */
  private handleSchedule(): void {
    Logger.debug('📅 SCHEDULE: Opening schedule picker', null, 'messages');
    // TODO: Implement schedule functionality
  }
  
  /**
   * Handle location
   */
  private handleLocation(): void {
    Logger.debug('📍 LOCATION: Opening location picker', null, 'messages');
    // TODO: Implement location picker
  }
  
  /**
   * Handle bold formatting
   */
  private handleBold(): void {
    Logger.debug('** BOLD: Applying bold formatting', null, 'messages');
    // TODO: Implement text formatting
  }
  
  /**
   * Handle italic formatting
   */
  private handleItalic(): void {
    Logger.debug('* ITALIC: Applying italic formatting', null, 'messages');
    // TODO: Implement text formatting
  }

  /**
   * Handle sending the message (publish)
   */
  private async handleSend(): Promise<void> {
    await this.submitMessage('published');
  }

  /**
   * Handle saving as draft
   */
  private async handleSaveDraft(): Promise<void> {
    await this.submitMessage('draft');
  }

  /**
   * Submit message (draft or published)
   */
  private async submitMessage(status: 'draft' | 'published'): Promise<void> {
    if (!this.options || !this.modal) {
      Logger.error('❌ submitMessage: Missing options or modal', null, 'messages');
      return;
    }

    const textarea = this.modal.querySelector('#message-content') as HTMLTextAreaElement;
    const content = textarea?.value.trim() || '';

    // Validate content - must have content OR attachments
    if (!content && this.attachments.length === 0) {
      alert('Please enter a message or attach media');
      return;
    }

    // Validate pageId - must be provided
    if (!this.options.pageId) {
        Logger.error('❌ submitMessage: Missing pageId in options', this.options, 'messages');
      alert('Error: Page ID is missing. Please try again.');
      return;
    }

    const messageKind = this.determineMessageKind();

    // COMP METHOD: Sanitize UUIDs - remove ::UUID suffix and ensure valid UUID format
    const sanitizeId = (id: string | null | undefined): string | null => {
      if (!id) return null;
      // Remove ::UUID suffix if present
      const cleaned = id.replace(/::UUID$/i, '');
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(cleaned)) {
        return cleaned;
      }
      // If not a valid UUID, return null (API will handle Google ID conversion via headers)
      Logger.warn(`⚠️ UnifiedMessageModal: Invalid UUID format: ${id}, will be handled by API`, 'messages');
      return null;
    };

    const messageData = {
      content: content || '', // Ensure content is always a string (empty if no text but has attachments)
      pageId: this.options.pageId,
      parentId: sanitizeId(this.options.parentId),
      quoteId: sanitizeId(this.options.quoteId),
            communityId: this.options.communityId || 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4',
      messageKind,
      attachments: this.attachments.map(att => ({
        id: att.id,
        type: att.type,
        url: att.url,
        thumbnailUrl: att.thumbnailUrl,
        filename: att.filename,
        size: att.size,
        mimeType: att.mimeType
      })),
      emojiMetadata: this.emojiMetadata,
      focusContext: this.options.focusContext || null,
      status
    };

    try {
      if (this.attachments.some(att => att.blob)) {
        for (const att of this.attachments) {
          if (att.blob && !att.url) {
            att.url = await this.blobToDataURL(att.blob);
          }
        }
      }

      const apiBaseUrl = this.resolveApiBaseUrl();
      const endpoint = `${apiBaseUrl}/api/messages`;
      const currentUser = this.getCurrentUser();

      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // Add authentication headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add user identity header if available
      const userEmail = currentUser && typeof currentUser === 'object' && 'email' in currentUser
        ? (currentUser as { email?: string }).email
        : currentUser && typeof currentUser === 'object' && 'user_metadata' in currentUser
        ? (currentUser as { user_metadata?: { email?: string } }).user_metadata?.email
        : undefined;
      if (userEmail) {
        headers['X-User-Email'] = userEmail;
      }
      
      // Add user ID header
      headers['X-User-Id'] = currentUser.id as string;

      // Validate messageData before sending
      if (!messageData.content && messageData.attachments.length === 0) {
        throw new Error('Message must have content or attachments');
      }
      if (!messageData.pageId) {
        throw new Error('Page ID is required');
      }

      Logger.debug('📤 SENDING_MESSAGE:', { 
        endpoint, 
        messageData: { 
          ...messageData, 
          userId: currentUser.id,
          contentLength: messageData.content.length,
          hasAttachments: messageData.attachments.length > 0,
          pageId: messageData.pageId
        } 
      }, 'messages');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...messageData,
          userId: currentUser.id
        })
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          Logger.error('❌ API_ERROR:', errorData, 'messages');
        } catch (e: unknown) {
          // If response is not JSON, use status text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError: unknown) {
            // Fallback to status text
            handleError(textError, {
              log: true,
              logLevel: 'error',
              context: {
                operation: 'readErrorResponse',
                component: 'UnifiedMessageModal'
              }
            });
          }
        }
        throw new Error(`Failed to ${status === 'draft' ? 'save draft' : 'publish message'}: ${errorMessage} (${response.status})`);
      }

      const message = await response.json();

      if (status === 'draft') {
        this.options.onDraftSaved?.(message);
        Logger.debug('📝 Draft saved', message.id, 'messages');
      } else {
        this.options.onSuccess?.(message);
      }

      this.close();
    } catch (error: unknown) {
      const errorMessage = `Failed to ${status === 'draft' ? 'save draft' : 'send message'}`;
      handleError(error, {
        log: true,
        logLevel: 'error',
        showUserNotification: true,
        userMessage: errorMessage,
        context: {
          operation: 'submitMessage',
          component: 'UnifiedMessageModal'
        }
      });
    }
  }

  /**
   * Determine message kind based on attachments
   */
  private determineMessageKind(): MessageKind {
    if (this.attachments.length === 0) {
      return 'TEXT';
    }

    const types = new Set(this.attachments.map(att => att.type));
    
    if (types.size > 1) {
      return 'MIXED';
    }

    const firstAttachment = this.attachments[0];
    if (!firstAttachment) {
      return 'TEXT';
    }
    const type = firstAttachment.type;
    switch (type) {
      case 'image':
        return 'IMAGE';
      case 'audio':
        return 'AUDIO';
      case 'video':
        return 'VIDEO';
      default:
        return 'TEXT';
    }
  }

  /**
   * Handle media attachment button click
   */
  private handleAttachMedia(): void {
    const fileInput = this.modal?.querySelector('#media-file-input') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Handle file selection
   */
  private async handleFileSelect(event: Event): Promise<void> {
    try {
      const input = event.target as HTMLInputElement;
      const files = input.files;
      
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        await this.addAttachment(file);
      }

      this.updateAttachmentsPreview();
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'handleFileSelect', component: 'UnifiedMessageModal' }
      });
    }
  }

  /**
   * Add an attachment
   */
  private async addAttachment(file: File): Promise<void> {
    try {
      const attachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: this.getFileType(file.type),
        url: '',
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        blob: file
      };

      // Generate preview/thumbnail
      if (attachment.type === 'image') {
        attachment.url = await this.blobToDataURL(file);
        attachment.thumbnailUrl = attachment.url;
      } else if (attachment.type === 'video') {
        attachment.url = await this.blobToDataURL(file);
        attachment.thumbnailUrl = await this.generateVideoThumbnail(file);
      } else {
        attachment.url = await this.blobToDataURL(file);
      }

      this.attachments.push(attachment);
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'addAttachment', component: 'UnifiedMessageModal' }
      });
    }
  }

  /**
   * Get file type from MIME type
   */
  private getFileType(mimeType: string): 'image' | 'audio' | 'video' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'image'; // Default
  }

  /**
   * Convert blob to data URL
   */
  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Generate video thumbnail
   */
  private async generateVideoThumbnail(file: File): Promise<string> {
    try {
      return await new Promise<string>((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
          video.currentTime = 1; // Seek to 1 second
        };
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            resolve(canvas.toDataURL());
          } else {
            reject(new Error('Failed to get canvas context'));
          }
          URL.revokeObjectURL(video.src);
        };
        video.onerror = reject;
      });
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'generateVideoThumbnail', component: 'UnifiedMessageModal' }
      });
      // Return empty string as fallback
      return '';
    }
  }

  /**
   * Update attachments preview
   */
  private updateAttachmentsPreview(): void {
    const preview = this.modal?.querySelector('#attachments-preview');
    if (!preview) return;

    if (this.attachments.length === 0) {
      preview.innerHTML = '';
      return;
    }

    preview.innerHTML = this.attachments.map(att => `
      <div class="unified-message-attachment" data-attachment-id="${att.id}">
        ${att.type === 'image' ? `
          <img src="${att.thumbnailUrl || att.url}" alt="${att.filename}" class="unified-message-attachment-preview">
        ` : att.type === 'video' ? `
          <div class="unified-message-attachment-preview video-preview">
            <img src="${att.thumbnailUrl || ''}" alt="${att.filename}">
            <span class="video-icon">▶</span>
          </div>
        ` : `
          <div class="unified-message-attachment-preview audio-preview">
            <span class="audio-icon">🎵</span>
            <span class="audio-filename">${att.filename}</span>
          </div>
        `}
        <button class="unified-message-attachment-remove" data-attachment-id="${att.id}">×</button>
      </div>
    `).join('');

    // Add remove handlers
    preview.querySelectorAll('.unified-message-attachment-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const attachmentId = (e.target as HTMLElement).dataset.attachmentId;
        if (attachmentId) {
          this.removeAttachment(attachmentId);
        }
      });
    });
  }

  /**
   * Remove an attachment
   */
  private removeAttachment(attachmentId: string): void {
    this.attachments = this.attachments.filter(att => att.id !== attachmentId);
    this.updateAttachmentsPreview();
  }

  /**
   * Handle emoji picker
   */
  private handleEmojiPicker(): void {
    // TODO: Implement emoji picker
    // For now, show a simple emoji selector
    const emoji = prompt('Select an emoji or type one:', '😀');
    if (emoji) {
      this.insertEmoji(emoji);
    }
  }

  /**
   * Insert emoji into textarea
   */
  private insertEmoji(emoji: string): void {
    const textarea = this.modal?.querySelector('#message-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + emoji + text.substring(end);
    
    textarea.value = newText;
    textarea.focus();
    textarea.setSelectionRange(start + emoji.length, start + emoji.length);

    // Update emoji metadata
    this.updateEmojiMetadata(newText);
  }

  /**
   * Update emoji metadata from content
   * Uses EmojiUtils for consistent emoji detection across the codebase
   */
  private updateEmojiMetadata(content: string): void {
    this.emojiMetadata = getEmojiMetadata(content);
  }

  // Removed unused method: handleCamera
  // Camera functionality not currently implemented. If needed in the future,
  // it can be re-implemented or restored from git history.

  /**
   * Cleanup camera stream
   */
  private cleanupCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  }

  /**
   * Get current user from state
   */
  private getCurrentUser(): { id?: string; [key: string]: unknown } | null {
    const win = typeof window !== 'undefined'
      ? window as Window & {
          stateManagerInstance?: {
            getState: (path: string) => unknown;
          };
        }
      : undefined;
    
    const user = win?.stateManagerInstance?.getState('currentUser') as { id?: string; [key: string]: unknown } | null;
    return user || null;
  }

  /**
   * Get avatar HTML with aura support (40px Twitter size)
   * Uses same pattern as AvatarUtils.createUnifiedAvatar
   */
  private async getAvatarHTML(currentUser: { [key: string]: unknown } | null, userAvatar: string, userName: string): Promise<string> {
    // Try to use AvatarUtils if available (same pattern as profile avatar)
    const win = window as Window & { 
      AvatarUtils?: {
        createUnifiedAvatar: (user: { id?: string; name?: string; avatarUrl?: string; auraColor?: string }, context: string, options: { size?: number; showAura?: boolean }) => Promise<string>;
      };
    };
    
    if (win.AvatarUtils && typeof win.AvatarUtils.createUnifiedAvatar === 'function' && currentUser) {
      try {
        // Use AvatarUtils to create avatar with same pattern as profile
        const userForAvatar = {
          id: currentUser.id as string | undefined,
          name: currentUser.name as string | undefined,
          avatarUrl: userAvatar || (currentUser.avatarUrl as string | undefined) || (currentUser.picture as string | undefined),
          auraColor: (currentUser.auraColor as string | undefined) || (currentUser.aura_color as string | undefined)
        };
        return await win.AvatarUtils.createUnifiedAvatar(userForAvatar, 'profile', { size: 40, showAura: true });
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'getAvatarHTML',
                component: 'UnifiedMessageModal'
            }
        });
        // Fall through to fallback
      }
    }
    
    // Fallback: Manual creation using same pattern as AvatarUtils
    const size = 40;
    const showAura = true;
    
    // Get aura color
    let auraColor = '#33aa33'; // Default green
    if (currentUser) {
      auraColor = (currentUser.auraColor as string) || 
                  (currentUser.aura_color as string) || 
                  auraColor;
    }
    
    // Get aura intensity (default 0.5)
    const auraIntensity = 0.5;
    const backgroundOpacity = auraIntensity * 0.6;
    const glowOpacity = auraIntensity * 0.8;
    const shadowOpacity = auraIntensity * 0.5;
    
    // Convert hex to rgba
    const hexToRgba = (hex: string, opacity: number): string => {
      hex = hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
    
    const auraColorRgba = hexToRgba(auraColor, backgroundOpacity);
    const glowColorRgba = hexToRgba(auraColor, glowOpacity);
    const shadowColorRgba = hexToRgba(auraColor, shadowOpacity);
    
    const initial = userName.charAt(0).toUpperCase();
    const auraPadding = Math.max(2, Math.floor(size * 0.08));
    const glowSize = Math.max(2, Math.floor(size * 0.12));
    const auraBackgroundSize = size + (auraPadding * 2);
    
    if (userAvatar) {
      return `
        <div class="avatar-container" style="width: ${size}px; height: ${size}px; position: relative; overflow: visible;">
          ${showAura ? `
            <div class="avatar-aura avatar-aura-background" style="position: absolute; width: ${auraBackgroundSize}px; height: ${auraBackgroundSize}px; border-radius: 50%; background-color: ${auraColorRgba}; top: -${auraPadding}px; left: -${auraPadding}px; z-index: 0; pointer-events: none; box-shadow: 0 0 ${glowSize * 2}px ${glowSize}px ${glowColorRgba}, inset 0 0 ${glowSize}px ${shadowColorRgba};"></div>
          ` : ''}
          <img 
            src="${this.escapeHtml(userAvatar)}" 
            alt="${this.escapeHtml(userName)}" 
            class="avatar-img" 
            style="width: ${size}px; height: ${size}px; border-radius: 50%; position: relative; z-index: 1; object-fit: cover; border: none !important; outline: none !important; background-color: transparent; box-shadow: ${showAura ? `0 0 ${glowSize}px ${shadowColorRgba}` : 'none'};" 
            referrerpolicy="no-referrer"
            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'${size}\\' height=\\'${size}\\'%3E%3Crect width=\\'${size}\\' height=\\'${size}\\' fill=\\'${auraColor}\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'white\\' font-size=\\'${size * 0.4}\\'%3E${initial}%3C/text%3E%3C/svg%3E';"
          />
        </div>
      `;
    } else {
      const initialBgColor = hexToRgba(auraColor, backgroundOpacity);
      return `
        <div class="avatar-container" style="width: ${size}px; height: ${size}px; position: relative; overflow: visible;">
          <div 
            class="avatar-initial" 
            style="width: ${size}px; height: ${size}px; border-radius: 50%; background-color: ${initialBgColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${size * 0.4}px; position: relative; z-index: 1; box-shadow: ${showAura ? `0 0 ${glowSize}px ${shadowColorRgba}` : 'none'};"
          >
            <span>${initial}</span>
          </div>
        </div>
      `;
    }
  }

  /**
   * Resolve API base URL (same logic as MessageStore)
   */
  private resolveApiBaseUrl(): string {
    const win = typeof window !== 'undefined'
      ? window as Window & {
          API_URL?: string;
          apiBaseURL?: string;
          config?: { API_URL?: string };
          stateManagerInstance?: {
            getState: (path: string) => unknown;
          };
        }
      : undefined;
    
    // Try state manager first
    const apiState = win?.stateManagerInstance?.getState('api') as { baseURL?: string } | null;
    const baseFromState = apiState?.baseURL;
    
    // Try window globals
    const baseFromWindow = win?.API_URL || win?.apiBaseURL || win?.config?.API_URL;
    
    // Fallback
    const FALLBACK_API_BASE = API_CONFIG.baseUrl;
    const baseUrl = baseFromState || baseFromWindow || FALLBACK_API_BASE;
    
    return baseUrl.replace(/\/$/, '');
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.cleanupCamera();
    this.attachments = [];
    this.emojiMetadata = {};
  }
}

// Export singleton instance
export const unifiedMessageModal = new UnifiedMessageModal();

  // Export to window for global access (for Chrome extension compatibility)
  // Note: Prefer importing unifiedMessageModal directly when possible
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      unifiedMessageModal?: UnifiedMessageModal;
      openMessageModal?: (options: MessageModalOptions) => Promise<void>;
      openReplyModal?: (message: Message | { id: string; communityId?: string }, pageId: string) => Promise<void>;
      openQuoteModal?: (message: Message | { id: string; communityId?: string }, pageId: string) => Promise<void>;
    };
    
    win.unifiedMessageModal = unifiedMessageModal;
    win.openMessageModal = (options: MessageModalOptions) => unifiedMessageModal.open(options);
    
    /**
     * Helper: Open modal for replying to a message
     * Accepts either a full Message object or an object with at least an id property
     */
    win.openReplyModal = async (message: Message | { id: string; communityId?: string }, pageId: string) => {
      await unifiedMessageModal.open({
        mode: 'reply',
        pageId,
        parentId: message.id,
        communityId: 'communityId' in message ? message.communityId : undefined,
        onSuccess: (replyMessage) => {
          Logger.debug('Reply sent:', replyMessage, 'messages');
          // Refresh message list by adding to MessageStore cache
          messageStore.handleRealtimeMessage({
            ...replyMessage,
            page_id: pageId,
            parent_id: message.id
          });
        }
      });
    };
    
    /**
     * Helper: Open modal for quoting a message
     * Accepts either a full Message object or an object with at least an id property
     */
    win.openQuoteModal = async (message: Message | { id: string; communityId?: string }, pageId: string) => {
      await unifiedMessageModal.open({
        mode: 'quote',
        pageId,
        quoteId: message.id,
        communityId: 'communityId' in message ? message.communityId : undefined,
        onSuccess: (quoteMessage) => {
          Logger.debug('Quote sent:', quoteMessage, 'messages');
          // Refresh message list by adding to MessageStore cache
          messageStore.handleRealtimeMessage({
            ...quoteMessage,
            page_id: pageId,
            parent_id: undefined // Quotes are top-level messages
          });
        }
      });
    };
  }


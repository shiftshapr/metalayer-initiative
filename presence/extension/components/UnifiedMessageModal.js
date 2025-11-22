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
import { getXIcon } from '../utils/XPatternSystem.js';
export class UnifiedMessageModal {
    constructor() {
        this.modal = null;
        this.options = null;
        this.attachments = [];
        this.emojiMetadata = {};
        this.cameraStream = null;
        this.isOpen = false;
        this.parentMessage = null;
        this.quotedMessage = null;
        this.setupEventListeners();
    }
    setupEventListeners() {
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
    async open(options) {
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
    }
    /**
     * Close the modal
     */
    close() {
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
    async render() {
        if (!this.options)
            return;
        // Ensure pageId is set - resolve from stateManager if missing
        if (!this.options.pageId) {
            const win = window;
            const urlData = win.stateManagerInstance?.getState('currentUrlData');
            if (urlData?.pageId) {
                this.options.pageId = urlData.pageId;
                console.log('📝 UnifiedMessageModal: Resolved pageId from stateManager:', this.options.pageId);
            }
            else {
                // Try to get from current location
                const currentUrl = window.location.href;
                // Generate pageId from URL (same logic as used elsewhere)
                const pageId = currentUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/[^a-zA-Z0-9]/g, '_');
                this.options.pageId = pageId;
                console.log('📝 UnifiedMessageModal: Generated pageId from URL:', this.options.pageId);
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
            console.warn('⚠️ MODAL: Modal parent is not body! Moving to body...');
            document.body.appendChild(this.modal);
        }
        // Modal is now sized to fit within sidepanel - no overflow needed
        // CSS handles responsive sizing (calc(100vw - 40px) with max-width: 300px)
        // Setup event handlers
        this.setupModalHandlers();
        // Auto-resize textarea on initial render and focus
        const textarea = modal.querySelector('#message-content');
        if (textarea) {
            // Initial resize to fill available space
            setTimeout(() => {
                this.autoResizeTextarea(textarea);
            }, 50);
            textarea.focus();
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
    async getModalHTML() {
        if (!this.options)
            return '';
        const { mode, editMessage, parentId, quoteId } = this.options;
        const content = editMessage?.content || '';
        const showParentContext = mode === 'reply' && parentId;
        const showQuoteContext = mode === 'quote' && quoteId;
        // Get current user for profile picture
        const currentUser = this.getCurrentUser();
        const userAvatar = currentUser?.avatarUrl || currentUser?.picture || '';
        const userName = currentUser?.name || currentUser?.displayName || 'You';
        // Get current community for audience selector
        const win = window;
        const activeCommunities = win.stateManagerInstance?.getState('ui.activeCommunities');
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
    }
    getModalTitle() {
        if (!this.options)
            return 'New Message';
        switch (this.options.mode) {
            case 'new':
                return 'New Message';
            case 'reply':
                return 'Reply';
            case 'quote':
                return 'Quote Message';
            case 'edit':
                return 'Edit Message';
            default:
                return 'New Message';
        }
    }
    getParentContextHTML() {
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
    getQuoteContextHTML() {
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
    renderContextSection() {
        if (!this.modal || !this.options)
            return;
        const container = this.modal.querySelector('#message-context');
        if (!container)
            return;
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
    async loadParentMessage(parentId) {
        try {
            const apiBaseUrl = this.resolveApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/api/messages/${parentId}`);
            if (!response.ok) {
                throw new Error(`Failed to load parent message: ${response.statusText}`);
            }
            this.parentMessage = await response.json();
            this.renderContextSection();
        }
        catch (error) {
            console.error('Error loading parent message:', error);
            // Don't block modal opening if parent load fails
        }
    }
    /**
     * Load quoted message data
     */
    async loadQuotedMessage(quoteId) {
        try {
            const apiBaseUrl = this.resolveApiBaseUrl();
            const response = await fetch(`${apiBaseUrl}/api/messages/${quoteId}`);
            if (!response.ok) {
                throw new Error(`Failed to load quoted message: ${response.statusText}`);
            }
            this.quotedMessage = await response.json();
            this.renderContextSection();
        }
        catch (error) {
            console.error('Error loading quoted message:', error);
            // Don't block modal opening if quote load fails
        }
    }
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * Setup event handlers for modal interactions
     */
    setupModalHandlers() {
        if (!this.modal)
            return;
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
        const textarea = this.modal.querySelector('#message-content');
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
        const fileInput = this.modal.querySelector('#media-file-input');
        fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        // Initial button state
        this.updatePostButtonState();
    }
    /**
     * Update Post button state (disabled when empty, enabled when has content)
     */
    updatePostButtonState() {
        const sendBtn = this.modal?.querySelector('#send-btn');
        const textarea = this.modal?.querySelector('#message-content');
        if (sendBtn && textarea) {
            const hasContent = textarea.value.trim().length > 0 || this.attachments.length > 0;
            sendBtn.disabled = !hasContent;
        }
    }
    /**
     * Auto-resize textarea
     */
    autoResizeTextarea(textarea) {
        if (!this.modal)
            return;
        // Calculate available height for textarea
        const modalContent = this.modal.querySelector('.unified-message-modal-content');
        if (!modalContent)
            return;
        // Get heights of other elements
        const topBar = this.modal.querySelector('.unified-message-modal-top-bar');
        const userSection = this.modal.querySelector('.unified-message-user-section');
        const contextSection = this.modal.querySelector('.unified-message-context');
        const replySettings = this.modal.querySelector('.unified-message-reply-settings');
        const toolbar = this.modal.querySelector('.unified-message-toolbar');
        const actions = this.modal.querySelector('.unified-message-actions');
        const modalHeight = modalContent.clientHeight;
        const usedHeight = (topBar?.offsetHeight || 0) +
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
    async handleDrafts() {
        console.log('📝 DRAFTS: Opening drafts');
        // Import and open draft selection modal
        const { draftSelectionModal } = await import('./DraftSelectionModal.js');
        const currentUser = this.getCurrentUser();
        const userId = currentUser?.id || '';
        if (!this.options)
            return;
        if (!userId) {
            alert('Sign in to access drafts');
            return;
        }
        await draftSelectionModal.open({
            pageId: this.options.pageId,
            userId,
            onSelect: async (draft) => {
                // Load draft into modal
                await this.loadDraft(draft);
            },
            onDelete: () => {
                console.log('📝 DRAFT: Draft deleted');
            },
            onCancel: () => {
                console.log('📝 DRAFT: Draft selection cancelled');
            }
        });
    }
    /**
     * Load a draft into the modal
     */
    async loadDraft(draft) {
        if (!this.modal)
            return;
        // Set content
        const textarea = this.modal.querySelector('#message-content');
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
        }
        else {
            this.parentMessage = null;
        }
        if (draft.quoteId) {
            if (this.options) {
                this.options.mode = 'quote';
            }
            await this.loadQuotedMessage(draft.quoteId);
        }
        else {
            this.quotedMessage = null;
        }
        if (!draft.parentId && !draft.quoteId && this.options && this.options.mode !== 'edit') {
            this.options.mode = 'new';
        }
        this.renderContextSection();
        // Load attachments if any
        if (draft.attachments && draft.attachments.length > 0) {
            // TODO: Load attachments
            console.log('📝 DRAFT: Loading attachments', draft.attachments);
        }
        // Focus textarea
        textarea?.focus();
    }
    /**
     * Handle audience selection
     */
    handleAudienceSelect() {
        console.log('👥 AUDIENCE: Opening audience selector');
        // TODO: Implement audience selector dropdown
    }
    /**
     * Handle GIF picker
     */
    handleGIF() {
        console.log('🎬 GIF: Opening GIF picker');
        // TODO: Implement GIF picker
    }
    /**
     * Handle poll creation
     */
    handlePoll() {
        console.log('📊 POLL: Opening poll creator');
        // TODO: Implement poll creation
    }
    /**
     * Handle list creation
     */
    handleList() {
        console.log('📋 LIST: Opening list creator');
        // TODO: Implement list creation
    }
    /**
     * Handle schedule
     */
    handleSchedule() {
        console.log('📅 SCHEDULE: Opening schedule picker');
        // TODO: Implement schedule functionality
    }
    /**
     * Handle location
     */
    handleLocation() {
        console.log('📍 LOCATION: Opening location picker');
        // TODO: Implement location picker
    }
    /**
     * Handle bold formatting
     */
    handleBold() {
        console.log('** BOLD: Applying bold formatting');
        // TODO: Implement text formatting
    }
    /**
     * Handle italic formatting
     */
    handleItalic() {
        console.log('* ITALIC: Applying italic formatting');
        // TODO: Implement text formatting
    }
    /**
     * Handle sending the message (publish)
     */
    async handleSend() {
        await this.submitMessage('published');
    }
    /**
     * Handle saving as draft
     */
    async handleSaveDraft() {
        await this.submitMessage('draft');
    }
    /**
     * Submit message (draft or published)
     */
    async submitMessage(status) {
        if (!this.options || !this.modal) {
            console.error('❌ submitMessage: Missing options or modal');
            return;
        }
        const textarea = this.modal.querySelector('#message-content');
        const content = textarea?.value.trim() || '';
        // Validate content - must have content OR attachments
        if (!content && this.attachments.length === 0) {
            alert('Please enter a message or attach media');
            return;
        }
        // Validate pageId - must be provided
        if (!this.options.pageId) {
            console.error('❌ submitMessage: Missing pageId in options', this.options);
            alert('Error: Page ID is missing. Please try again.');
            return;
        }
        const messageKind = this.determineMessageKind();
        // COMP METHOD: Sanitize UUIDs - remove ::UUID suffix and ensure valid UUID format
        const sanitizeId = (id) => {
            if (!id)
                return null;
            // Remove ::UUID suffix if present
            const cleaned = id.replace(/::UUID$/i, '');
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(cleaned)) {
                return cleaned;
            }
            // If not a valid UUID, return null (API will handle Google ID conversion via headers)
            console.warn(`⚠️ UnifiedMessageModal: Invalid UUID format: ${id}, will be handled by API`);
            return null;
        };
        const messageData = {
            content: content || '', // Ensure content is always a string (empty if no text but has attachments)
            pageId: this.options.pageId,
            parentId: sanitizeId(this.options.parentId),
            quoteId: sanitizeId(this.options.quoteId),
            communityId: this.options.communityId || 'comm-001',
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
            const headers = {
                'Content-Type': 'application/json'
            };
            // Add user identity header if available
            const userEmail = currentUser && typeof currentUser === 'object' && 'email' in currentUser
                ? currentUser.email
                : currentUser && typeof currentUser === 'object' && 'user_metadata' in currentUser
                    ? currentUser.user_metadata?.email
                    : undefined;
            if (userEmail) {
                headers['X-User-Email'] = userEmail;
            }
            // Add user ID header
            headers['X-User-Id'] = currentUser.id;
            // Validate messageData before sending
            if (!messageData.content && messageData.attachments.length === 0) {
                throw new Error('Message must have content or attachments');
            }
            if (!messageData.pageId) {
                throw new Error('Page ID is required');
            }
            console.log('📤 SENDING_MESSAGE:', {
                endpoint,
                messageData: {
                    ...messageData,
                    userId: currentUser.id,
                    contentLength: messageData.content.length,
                    hasAttachments: messageData.attachments.length > 0,
                    pageId: messageData.pageId
                }
            });
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
                    console.error('❌ API_ERROR:', errorData);
                }
                catch (e) {
                    // If response is not JSON, use status text
                    try {
                        const errorText = await response.text();
                        console.error('❌ API_ERROR_TEXT:', errorText);
                        errorMessage = errorText || errorMessage;
                    }
                    catch (textError) {
                        // Fallback to status text
                        console.error('❌ API_ERROR_STATUS:', response.status, response.statusText);
                    }
                }
                throw new Error(`Failed to ${status === 'draft' ? 'save draft' : 'publish message'}: ${errorMessage} (${response.status})`);
            }
            const message = await response.json();
            if (status === 'draft') {
                this.options.onDraftSaved?.(message);
                console.log('📝 Draft saved', message.id);
            }
            else {
                this.options.onSuccess?.(message);
            }
            this.close();
        }
        catch (error) {
            console.error(`Error ${status === 'draft' ? 'saving draft' : 'sending message'}:`, error);
            alert(`Failed to ${status === 'draft' ? 'save draft' : 'send message'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Determine message kind based on attachments
     */
    determineMessageKind() {
        if (this.attachments.length === 0) {
            return 'TEXT';
        }
        const types = new Set(this.attachments.map(att => att.type));
        if (types.size > 1) {
            return 'MIXED';
        }
        const type = this.attachments[0].type;
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
    handleAttachMedia() {
        const fileInput = this.modal?.querySelector('#media-file-input');
        fileInput?.click();
    }
    /**
     * Handle file selection
     */
    async handleFileSelect(event) {
        const input = event.target;
        const files = input.files;
        if (!files || files.length === 0)
            return;
        for (const file of Array.from(files)) {
            await this.addAttachment(file);
        }
        this.updateAttachmentsPreview();
    }
    /**
     * Add an attachment
     */
    async addAttachment(file) {
        const attachment = {
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
        }
        else if (attachment.type === 'video') {
            attachment.url = await this.blobToDataURL(file);
            attachment.thumbnailUrl = await this.generateVideoThumbnail(file);
        }
        else {
            attachment.url = await this.blobToDataURL(file);
        }
        this.attachments.push(attachment);
    }
    /**
     * Get file type from MIME type
     */
    getFileType(mimeType) {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('audio/'))
            return 'audio';
        if (mimeType.startsWith('video/'))
            return 'video';
        return 'image'; // Default
    }
    /**
     * Convert blob to data URL
     */
    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    /**
     * Generate video thumbnail
     */
    async generateVideoThumbnail(file) {
        return new Promise((resolve, reject) => {
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
                }
                else {
                    reject(new Error('Failed to get canvas context'));
                }
                URL.revokeObjectURL(video.src);
            };
            video.onerror = reject;
        });
    }
    /**
     * Update attachments preview
     */
    updateAttachmentsPreview() {
        const preview = this.modal?.querySelector('#attachments-preview');
        if (!preview)
            return;
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
                const attachmentId = e.target.dataset.attachmentId;
                if (attachmentId) {
                    this.removeAttachment(attachmentId);
                }
            });
        });
    }
    /**
     * Remove an attachment
     */
    removeAttachment(attachmentId) {
        this.attachments = this.attachments.filter(att => att.id !== attachmentId);
        this.updateAttachmentsPreview();
    }
    /**
     * Handle emoji picker
     */
    handleEmojiPicker() {
        // TODO: Implement emoji picker
        // For now, show a simple emoji selector
        const emojiList = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨'];
        const emoji = prompt('Select an emoji or type one:', '😀');
        if (emoji) {
            this.insertEmoji(emoji);
        }
    }
    /**
     * Insert emoji into textarea
     */
    insertEmoji(emoji) {
        const textarea = this.modal?.querySelector('#message-content');
        if (!textarea)
            return;
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
     */
    updateEmojiMetadata(content) {
        // Simple emoji detection (can be enhanced)
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        const emojis = content.match(emojiRegex) || [];
        this.emojiMetadata = {
            emojis: [...new Set(emojis)],
            emojiCount: emojis.length,
            hasEmoji: emojis.length > 0
        };
    }
    /**
     * Handle camera capture
     */
    async handleCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            this.cameraStream = stream;
            // Show camera preview
            const video = this.modal?.querySelector('#camera-video');
            const canvas = this.modal?.querySelector('#camera-canvas');
            if (video && canvas) {
                video.srcObject = stream;
                video.play();
                // Show camera UI
                // TODO: Create camera capture UI
                const capture = confirm('Take photo?');
                if (capture) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0);
                        canvas.toBlob(async (blob) => {
                            if (blob) {
                                const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                                await this.addAttachment(file);
                                this.updateAttachmentsPreview();
                            }
                        }, 'image/jpeg', 0.9);
                    }
                }
                this.cleanupCamera();
            }
        }
        catch (error) {
            console.error('Camera error:', error);
            alert('Failed to access camera. Please check permissions.');
        }
    }
    /**
     * Cleanup camera stream
     */
    cleanupCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    }
    /**
     * Get current user from state
     */
    getCurrentUser() {
        const win = typeof window !== 'undefined'
            ? window
            : undefined;
        const user = win?.stateManagerInstance?.getState('currentUser');
        return user || null;
    }
    /**
     * Get avatar HTML with aura support (40px Twitter size)
     * Uses same pattern as AvatarUtils.createUnifiedAvatar
     */
    async getAvatarHTML(currentUser, userAvatar, userName) {
        // Try to use AvatarUtils if available (same pattern as profile avatar)
        const win = window;
        if (win.AvatarUtils && typeof win.AvatarUtils.createUnifiedAvatar === 'function' && currentUser) {
            try {
                // Use AvatarUtils to create avatar with same pattern as profile
                const userForAvatar = {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatarUrl: userAvatar || currentUser.avatarUrl || currentUser.picture,
                    auraColor: currentUser.auraColor || currentUser.aura_color
                };
                return await win.AvatarUtils.createUnifiedAvatar(userForAvatar, 'profile', { size: 40, showAura: true });
            }
            catch (error) {
                console.warn('⚠️ MODAL: Failed to use AvatarUtils, falling back to manual creation:', error);
            }
        }
        // Fallback: Manual creation using same pattern as AvatarUtils
        const size = 40;
        const showAura = true;
        // Get aura color
        let auraColor = '#33aa33'; // Default green
        if (currentUser) {
            auraColor = currentUser.auraColor ||
                currentUser.aura_color ||
                auraColor;
        }
        // Get aura intensity (default 0.5)
        const auraIntensity = 0.5;
        const backgroundOpacity = auraIntensity * 0.6;
        const glowOpacity = auraIntensity * 0.8;
        const shadowOpacity = auraIntensity * 0.5;
        // Convert hex to rgba
        const hexToRgba = (hex, opacity) => {
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
        }
        else {
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
    resolveApiBaseUrl() {
        const win = typeof window !== 'undefined'
            ? window
            : undefined;
        // Try state manager first
        const apiState = win?.stateManagerInstance?.getState('api');
        const baseFromState = apiState?.baseURL;
        // Try window globals
        const baseFromWindow = win?.API_URL || win?.apiBaseURL || win?.config?.API_URL;
        // Fallback
        const FALLBACK_API_BASE = 'http://216.238.91.120:3002';
        const baseUrl = baseFromState || baseFromWindow || FALLBACK_API_BASE;
        return baseUrl.replace(/\/$/, '');
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        this.cleanupCamera();
        this.attachments = [];
        this.emojiMetadata = {};
    }
}
// Export singleton instance
export const unifiedMessageModal = new UnifiedMessageModal();
// Export to window for global access
if (typeof window !== 'undefined') {
    const win = window;
    win.unifiedMessageModal = unifiedMessageModal;
    win.openMessageModal = (options) => unifiedMessageModal.open(options);
    /**
     * Helper: Open modal for replying to a message
     */
    win.openReplyModal = async (message, pageId) => {
        await unifiedMessageModal.open({
            mode: 'reply',
            pageId,
            parentId: message.id,
            communityId: message.communityId,
            onSuccess: (replyMessage) => {
                console.log('Reply sent:', replyMessage);
                // Refresh message list or add reply to UI
                if (win.messageStore && typeof win.messageStore.emit === 'function') {
                    // Trigger refresh of replies for this parent
                    win.messageStore.emit('messageAdded', replyMessage);
                }
            }
        });
    };
    /**
     * Helper: Open modal for quoting a message
     */
    win.openQuoteModal = async (message, pageId) => {
        await unifiedMessageModal.open({
            mode: 'quote',
            pageId,
            quoteId: message.id,
            communityId: message.communityId,
            onSuccess: (quoteMessage) => {
                console.log('Quote sent:', quoteMessage);
                // Refresh message list or add quote to UI
                if (win.messageStore && typeof win.messageStore.emit === 'function') {
                    win.messageStore.emit('messageAdded', quoteMessage);
                }
            }
        });
    };
}

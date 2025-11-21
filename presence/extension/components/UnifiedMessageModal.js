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
        this.render();
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
     */
    render() {
        if (!this.options)
            return;
        // Remove existing modal if present
        const existing = document.getElementById('unified-message-modal');
        if (existing) {
            existing.remove();
        }
        const modal = document.createElement('div');
        modal.id = 'unified-message-modal';
        modal.className = 'unified-message-modal';
        modal.innerHTML = this.getModalHTML();
        document.body.appendChild(modal);
        this.modal = modal;
        // Setup event handlers
        this.setupModalHandlers();
        // Focus the textarea
        const textarea = modal.querySelector('#message-content');
        if (textarea) {
            textarea.focus();
        }
    }
    /**
     * Get modal HTML based on mode
     */
    getModalHTML() {
        if (!this.options)
            return '';
        const { mode, editMessage, parentId, quoteId } = this.options;
        const title = this.getModalTitle();
        const content = editMessage?.content || '';
        const showParentContext = mode === 'reply' && parentId;
        const showQuoteContext = mode === 'quote' && quoteId;
        return `
      <div class="unified-message-modal-overlay"></div>
      <div class="unified-message-modal-content">
        <div class="unified-message-modal-header">
          <h2>${title}</h2>
          <button class="unified-message-modal-close" aria-label="Close">×</button>
        </div>
        
        <div class="unified-message-modal-body">
          ${showParentContext ? this.getParentContextHTML() : ''}
          ${showQuoteContext ? this.getQuoteContextHTML() : ''}
          
          <div class="unified-message-input-container">
            <textarea 
              id="message-content" 
              class="unified-message-textarea"
              placeholder="Type your message..."
              rows="4"
            >${content}</textarea>
            
            <div class="unified-message-attachments-preview" id="attachments-preview"></div>
          </div>
          
          <div class="unified-message-toolbar">
            <div class="unified-message-toolbar-left">
              <button class="unified-message-toolbar-btn" id="attach-media-btn" title="Attach media">
                📎
              </button>
              <button class="unified-message-toolbar-btn" id="emoji-btn" title="Add emoji">
                😀
              </button>
              <button class="unified-message-toolbar-btn" id="camera-btn" title="Take photo">
                📷
              </button>
            </div>
            <div class="unified-message-toolbar-right">
              <button class="unified-message-btn unified-message-btn-secondary" id="cancel-btn">
                Cancel
              </button>
              <button class="unified-message-btn unified-message-btn-primary" id="send-btn">
                ${mode === 'edit' ? 'Update' : 'Send'}
              </button>
            </div>
          </div>
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
            // Update the modal if it's already rendered
            if (this.modal && this.options?.mode === 'reply') {
                const parentContext = this.modal.querySelector('.unified-message-parent-context');
                if (parentContext) {
                    parentContext.outerHTML = this.getParentContextHTML();
                }
            }
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
            // Update the modal if it's already rendered
            if (this.modal && this.options?.mode === 'quote') {
                const quoteContext = this.modal.querySelector('.unified-message-quote-context');
                if (quoteContext) {
                    quoteContext.outerHTML = this.getQuoteContextHTML();
                }
            }
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
        // Close button
        const closeBtn = this.modal.querySelector('.unified-message-modal-close');
        closeBtn?.addEventListener('click', () => this.close());
        // Overlay click
        const overlay = this.modal.querySelector('.unified-message-modal-overlay');
        overlay?.addEventListener('click', () => this.close());
        // Cancel button
        const cancelBtn = this.modal.querySelector('#cancel-btn');
        cancelBtn?.addEventListener('click', () => this.close());
        // Send button
        const sendBtn = this.modal.querySelector('#send-btn');
        sendBtn?.addEventListener('click', () => this.handleSend());
        // Media attachment button
        const attachMediaBtn = this.modal.querySelector('#attach-media-btn');
        attachMediaBtn?.addEventListener('click', () => this.handleAttachMedia());
        // Emoji button
        const emojiBtn = this.modal.querySelector('#emoji-btn');
        emojiBtn?.addEventListener('click', () => this.handleEmojiPicker());
        // Camera button
        const cameraBtn = this.modal.querySelector('#camera-btn');
        cameraBtn?.addEventListener('click', () => this.handleCamera());
        // File input change
        const fileInput = this.modal.querySelector('#media-file-input');
        fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
    }
    /**
     * Handle sending the message
     */
    async handleSend() {
        if (!this.options || !this.modal)
            return;
        const textarea = this.modal.querySelector('#message-content');
        const content = textarea?.value.trim() || '';
        if (!content && this.attachments.length === 0) {
            alert('Please enter a message or attach media');
            return;
        }
        // Determine message kind
        const messageKind = this.determineMessageKind();
        // Prepare message data
        const messageData = {
            content,
            pageId: this.options.pageId,
            parentId: this.options.parentId || null,
            quoteId: this.options.quoteId || null, // Include quoteId for quote mode
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
            focusContext: this.options.focusContext || null
        };
        try {
            // Upload attachments first if needed
            if (this.attachments.some(att => att.blob)) {
                // TODO: Upload attachments to storage/CDN
                // For now, we'll use data URLs (not ideal for production)
                for (const att of this.attachments) {
                    if (att.blob && !att.url) {
                        att.url = await this.blobToDataURL(att.blob);
                    }
                }
            }
            // Resolve API base URL
            const apiBaseUrl = this.resolveApiBaseUrl();
            const endpoint = `${apiBaseUrl}/api/messages`;
            // Get current user ID from state
            const currentUser = this.getCurrentUser();
            if (!currentUser?.id) {
                throw new Error('User not authenticated');
            }
            // Send message via API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...messageData,
                    userId: currentUser.id
                })
            });
            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.statusText}`);
            }
            const message = await response.json();
            // Call success callback
            this.options.onSuccess?.(message);
            // Close modal
            this.close();
        }
        catch (error) {
            console.error('Error sending message:', error);
            alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

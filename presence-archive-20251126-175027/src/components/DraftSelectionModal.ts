/**
 * DraftSelectionModal - Modal for selecting and managing drafts
 * 
 * Displays a list of user's drafts with options to:
 * - Select a draft to continue editing
 * - Delete drafts
 * - See draft preview
 */

import { getXIcon } from '../utils/XPatternSystem.js';
import { handleError } from '../utils/ErrorHandler.js';

export interface Draft {
  id: string;
  content: string;
  pageId: string;
  parentId?: string | null;
  quoteId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  attachments?: unknown[];
}

export interface DraftSelectionModalOptions {
  pageId: string;
  userId: string;
  onSelect?: (draft: Draft) => void;
  onDelete?: (draftId: string) => void;
  onCancel?: () => void;
}

export class DraftSelectionModal {
  private modal: HTMLElement | null = null;
  private options: DraftSelectionModalOptions | null = null;
  private drafts: Draft[] = [];
  private isOpen = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }

  /**
   * Open the draft selection modal
   */
  async open(options: DraftSelectionModalOptions): Promise<void> {
    try {
      this.options = options;
      this.isOpen = true;
      await this.loadDrafts();
      this.renderModal();
      this.attachEventListeners();
    } catch (error: unknown) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'open',
          component: 'DraftSelectionModal',
          pageId: options.pageId,
          userId: options.userId
        }
      });
    }
  }

  /**
   * Close the modal
   */
  close(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    this.isOpen = false;
    if (this.options?.onCancel) {
      this.options.onCancel();
    }
  }

  /**
   * Load drafts from API
   */
  private async loadDrafts(): Promise<void> {
    if (!this.options) return;

    try {
      const apiBaseUrl = this.resolveApiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/api/messages?pageId=${encodeURIComponent(this.options.pageId)}&status=draft&userId=${encodeURIComponent(this.options.userId)}`
      );

      if (!response.ok) {
        throw new Error('Failed to load drafts');
      }

      const data = await response.json();
      this.drafts = data.messages || [];
    } catch (error: unknown) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'loadDrafts',
          component: 'DraftSelectionModal',
          pageId: this.options.pageId,
          userId: this.options.userId
        }
      });
      this.drafts = [];
    
    }
  }

  /**
   * Render the modal
   */
  private renderModal(): void {
    if (typeof document === 'undefined') return;

    // Remove existing modal if any
    const existing = document.querySelector('.draft-selection-modal');
    if (existing) {
      existing.remove();
    }

    const modalHTML = this.getModalHTML();
    const container = document.createElement('div');
    container.className = 'draft-selection-modal';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
    this.modal = container;
  }

  /**
   * Get modal HTML
   */
  private getModalHTML(): string {
    const draftsHTML = this.drafts.length > 0
      ? this.drafts.map(draft => this.getDraftItemHTML(draft)).join('')
      : '<div class="draft-selection-empty">No drafts yet</div>';

    return `
      <div class="draft-selection-modal-overlay"></div>
      <div class="draft-selection-modal-content x-design-pattern">
        <!-- Top Bar -->
        <div class="draft-selection-modal-top-bar">
          <button class="draft-selection-modal-close x-close-btn" aria-label="Close">
            ${getXIcon('close', { width: 20, height: 20 })}
          </button>
          <h2 class="draft-selection-modal-title">Drafts</h2>
        </div>
        
        <!-- Drafts List -->
        <div class="draft-selection-modal-body">
          ${draftsHTML}
        </div>
      </div>
    `;
  }

  /**
   * Get draft item HTML
   */
  private getDraftItemHTML(draft: Draft): string {
    const preview = draft.content.length > 100 
      ? draft.content.substring(0, 100) + '...'
      : draft.content;
    
    const date = new Date(draft.updatedAt);
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    return `
      <div class="draft-item" data-draft-id="${this.escapeHtml(draft.id)}">
        <div class="draft-item-content" data-action="select">
          <div class="draft-item-preview">${this.escapeHtml(preview)}</div>
          <div class="draft-item-meta">
            <span class="draft-item-date">${this.escapeHtml(dateStr)}</span>
            ${draft.parentId ? '<span class="draft-item-type">Reply</span>' : ''}
            ${draft.quoteId ? '<span class="draft-item-type">Quote</span>' : ''}
          </div>
        </div>
        <button class="draft-item-delete" data-action="delete" aria-label="Delete draft">
          ${getXIcon('close', { width: 16, height: 16 })}
        </button>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector('.draft-selection-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Overlay click
    const overlay = this.modal.querySelector('.draft-selection-modal-overlay');
    overlay?.addEventListener('click', () => this.close());

    // Draft selection
    const selectButtons = this.modal.querySelectorAll('[data-action="select"]');
    selectButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const draftItem = (e.currentTarget as HTMLElement).closest('.draft-item');
        const draftId = draftItem?.getAttribute('data-draft-id');
        if (draftId) {
          const draft = this.drafts.find(d => d.id === draftId);
          if (draft && this.options?.onSelect) {
            this.options.onSelect(draft);
            this.close();
          }
        }
      });
    });

    // Delete buttons
    const deleteButtons = this.modal.querySelectorAll('[data-action="delete"]');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        try {
          e.stopPropagation();
          const draftItem = (e.currentTarget as HTMLElement).closest('.draft-item');
          const draftId = draftItem?.getAttribute('data-draft-id');
          if (draftId) {
            await this.deleteDraft(draftId);
          }
        } catch (error: unknown) {
          handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
              operation: 'deleteDraft',
              component: 'DraftSelectionModal'
            }
          });
        }
      });
    });
  }

  /**
   * Delete a draft
   */
  private async deleteDraft(draftId: string): Promise<void> {
    try {
      const apiBaseUrl = this.resolveApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/messages/${draftId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete draft');
      }

      // Remove from local list
      this.drafts = this.drafts.filter(d => d.id !== draftId);

      // Notify callback
      if (this.options?.onDelete) {
        this.options.onDelete(draftId);
      }

      // Re-render
      this.renderModal();
      this.attachEventListeners();
    } catch (error: unknown) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'deleteDraft',
          component: 'DraftSelectionModal',
          draftId
        }
      });
    
    }
  }

  /**
   * Resolve API base URL
   */
  private resolveApiBaseUrl(): string {
    if (typeof window === 'undefined') return '';
    const win = window as Window & { API_BASE_URL?: string };
    return win.API_BASE_URL || 'http://localhost:3002';
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const draftSelectionModal = new DraftSelectionModal();




/**
 * LoadingIndicator - Shows loading spinner while messages load
 * 
 * Isolated to message container, doesn't affect other UI.
 */

import { Logger } from '../../utils/Logger.js';

/**
 * LoadingIndicator - Displays loading state
 */
export class LoadingIndicator {
  private indicator: HTMLElement | null = null;
  private isVisible = false;

  constructor(private container: HTMLElement) {}

  /**
   * Show loading indicator
   */
  show(): void {
    if (this.isVisible) return;

    this.indicator = document.createElement('div');
    this.indicator.className = 'message-loading-indicator';
    this.indicator.innerHTML = `
      <div class="loading-spinner">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" opacity="0.25"/>
          <path d="M12 2 A10 10 0 0 1 22 12" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="loading-text">Loading messages...</span>
    `;

    this.container.appendChild(this.indicator);
    this.isVisible = true;

    Logger.debug('LoadingIndicator: Shown', null, 'messages');
  }

  /**
   * Hide loading indicator
   */
  hide(): void {
    if (!this.isVisible || !this.indicator) return;

    this.indicator.remove();
    this.indicator = null;
    this.isVisible = false;

    Logger.debug('LoadingIndicator: Hidden', null, 'messages');
  }

  /**
   * Destroy indicator
   */
  destroy(): void {
    this.hide();
  }
}




/**
 * STATUS PICKER MODULE
 * 
 * Allows users to set their availability status (4-state system)
 * - Available (green)
 * - Working/Busy (yellow)
 * - Away (red)
 * - Offline (gray - automatic)
 */

import { User } from '../types/index.js';
import { Logger } from '../utils/Logger.js';

// Type declarations for window properties used by this module
declare const window: Window & typeof globalThis & {
  currentUser?: User;
  currentUrlData?: {
    pageId?: string;
  };
  API_BASE_URL?: string;
  getAuthToken?(): Promise<string>;
};

type Status = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';

class StatusPickerModule {
  private currentStatus: Status = 'AVAILABLE'; // Default status
  private isInitialized: boolean = false;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Initialize the status picker module
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ STATUS_PICKER: Already initialized');
      return;
    }

    console.log('🎯 STATUS_PICKER: Initializing...');
    
    try {
      // Load current user's status from backend
      await this.loadCurrentStatus();
      
      // Create status picker UI
      this.createStatusPickerUI();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ STATUS_PICKER: Initialized successfully');
    } catch (error) {
      console.error('❌ STATUS_PICKER: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load current user's status from backend
   */
  async loadCurrentStatus(): Promise<void> {
    try {
      const currentUser = window.currentUser;
      if (!currentUser || !currentUser.id) {
        console.warn('⚠️ STATUS_PICKER: No current user found');
        return;
      }

      // TODO: Fetch from API endpoint
      // For now, check if user has availability in their data
      if (currentUser.availability) {
        const availability = currentUser.availability as Status;
        if (['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(availability)) {
          this.currentStatus = availability;
          console.log(`✅ STATUS_PICKER: Loaded current status: ${this.currentStatus}`);
        }
      }
    } catch (error) {
      console.error('❌ STATUS_PICKER: Failed to load current status:', error);
    }
  }

  /**
   * Create status picker UI in the profile section
   */
  createStatusPickerUI(): void {
    // Find the profile section in the sidebar
    const profileSection = document.querySelector('.profile-section');
    if (!profileSection) {
      console.warn('⚠️ STATUS_PICKER: Profile section not found');
      return;
    }

    // Create status picker container
    const statusPickerHTML = `
      <div class="status-picker-container" style="margin-top: 12px; padding: 8px; background: var(--background-secondary); border-radius: 8px;">
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600;">
          Your Status
        </div>
        <div class="status-options" style="display: flex; flex-direction: column; gap: 6px;">
          <button class="status-option" data-status="AVAILABLE" style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--background-primary);
            border: 2px solid transparent;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
            color: var(--text-primary);
            width: 100%;
            text-align: left;
          ">
            <span class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--status-available);"></span>
            <span>Available</span>
          </button>
          <button class="status-option" data-status="BUSY" style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--background-primary);
            border: 2px solid transparent;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
            color: var(--text-primary);
            width: 100%;
            text-align: left;
          ">
            <span class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--status-busy);"></span>
            <span>Working</span>
          </button>
          <button class="status-option" data-status="AWAY" style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--background-primary);
            border: 2px solid transparent;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
            color: var(--text-primary);
            width: 100%;
            text-align: left;
          ">
            <span class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--status-away);"></span>
            <span>Busy</span>
          </button>
        </div>
      </div>
    `;

    // Insert status picker after user info
    const userInfo = profileSection.querySelector('.user-info');
    if (userInfo) {
      userInfo.insertAdjacentHTML('afterend', statusPickerHTML);
      console.log('✅ STATUS_PICKER: UI created');
      
      // Highlight current status
      this.updateStatusUI(this.currentStatus);
    } else {
      console.warn('⚠️ STATUS_PICKER: User info section not found');
    }
  }

  /**
   * Set up event listeners for status options
   */
  setupEventListeners(): void {
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach((option: Element) => {
      const optionEl = option as HTMLElement;
      optionEl.addEventListener('click', (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        const status = target.getAttribute('data-status') as Status | null;
        if (status) {
          this.setStatus(status);
        }
      });

      // Add hover effect
      optionEl.addEventListener('mouseenter', (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        target.style.background = 'var(--background-hover)';
      });
      optionEl.addEventListener('mouseleave', (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        const status = target.getAttribute('data-status') as Status | null;
        if (status && status !== this.currentStatus) {
          target.style.background = 'var(--background-primary)';
        }
      });
    });

    console.log('✅ STATUS_PICKER: Event listeners set up');
  }

  /**
   * Set user's availability status
   * @param {string} status - Status to set (AVAILABLE, BUSY, AWAY)
   */
  async setStatus(status: Status): Promise<void> {
    console.log(`🎯 STATUS_PICKER: Setting status to ${status}`);
    
    try {
      // Update UI immediately for responsiveness
      this.currentStatus = status;
      this.updateStatusUI(status);

      // Update backend
      await this.updateStatusOnBackend(status);

      // Update current user object
      if (window.currentUser) {
        window.currentUser.availability = status;
      }

      // Trigger status update event for real-time propagation
      window.dispatchEvent(new CustomEvent('userStatusChanged', {
        detail: { status, userId: window.currentUser?.id }
      }));

      console.log(`✅ STATUS_PICKER: Status updated to ${status}`);
    } catch (error) {
      console.error('❌ STATUS_PICKER: Failed to set status:', error);
      // Revert UI on error
      this.updateStatusUI(this.currentStatus);
    }
  }

  /**
   * Update status on backend via API
   * @param {string} status - Status to set
   */
  async updateStatusOnBackend(status: Status): Promise<void> {
    try {
      const currentUser = window.currentUser;
      if (!currentUser || !currentUser.id) {
        throw new Error('No current user found');
      }

      // Get current page ID
      const pageId = window.currentUrlData?.pageId;
      if (!pageId) {
        throw new Error('No page ID found');
      }

      // Call API endpoint to update availability
      const authToken = window.getAuthToken ? await window.getAuthToken() : '';
      const response = await fetch(`${window.API_BASE_URL}/v1/presence/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          pageId: pageId,
          availability: status
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ STATUS_PICKER: Backend updated:', data);
    } catch (error) {
      console.error('❌ STATUS_PICKER: Backend update failed:', error);
      throw error;
    }
  }

  /**
   * Update status picker UI to reflect current status
   * @param {string} status - Current status
   */
  updateStatusUI(status: Status): void {
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach((option: Element) => {
      const optionEl = option as HTMLElement;
      const optionStatus = optionEl.getAttribute('data-status');
      if (optionStatus === status) {
        optionEl.style.background = 'var(--background-hover)';
        optionEl.style.borderColor = 'var(--primary-accent)';
      } else {
        optionEl.style.background = 'var(--background-primary)';
        optionEl.style.borderColor = 'transparent';
      }
    });
  }

  /**
   * Get current status
   * @returns {string} Current status
   */
  getCurrentStatus(): Status {
    return this.currentStatus;
  }
}

// Create singleton instance
const statusPickerModuleInstance = new StatusPickerModule();

// Export as ES6 module (pure - no window exports needed for re-launch)
export { StatusPickerModule, statusPickerModuleInstance };
export default StatusPickerModule;




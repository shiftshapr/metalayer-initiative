import { createProfileSettingChannel } from './settings/helpers/profileSettingChannel.js';
import { ensureManager, waitForPreferencesManager, getSettingContracts } from '../sidepanel/windowInjections.js';

/**
 * DISPLAY NAME MANAGER - CRUD Operations for Display Name
 * Handles Create, Read, Update, Delete operations for user display name
 */

type StatusType = 'success' | 'error' | 'info';

class DisplayNameManager {
  private minLength: number = 4; // Min characters for display name
  private maxLength: number = 16; // Max characters for display name (updated from 20)
  private currentDisplayName: string | null = null;
  private originalDisplayName: string | null = null;
  private isInitialized: boolean = false;
  private isEditing: boolean = false;
  private readonly storage = createProfileSettingChannel('displayName');
  
  private displayNameInput: HTMLInputElement | null = null;
  private charCount: HTMLElement | null = null;
  private charMax: HTMLElement | null = null;
  private saveBtn: HTMLElement | null = null;
  private cancelBtn: HTMLElement | null = null;
  private actionsDiv: HTMLElement | null = null;
  private menuContainer: HTMLElement | null = null;
  private menuBtn: HTMLElement | null = null;
  private menuDropdown: HTMLElement | null = null;
  private menuEdit: HTMLElement | null = null;
  private menuDelete: HTMLElement | null = null;
  private statusDiv: HTMLElement | null = null;

  /**
   * Initialize display name manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ DISPLAY_NAME: Already initialized');
      return;
    }

    console.log('🔧 DISPLAY_NAME: Initializing display name manager...');

    try {
      // Get DOM elements
      this.displayNameInput = document.getElementById('display-name-input') as HTMLInputElement;
      this.charCount = document.getElementById('display-name-char-count');
      this.charMax = document.getElementById('display-name-char-max');
      this.saveBtn = document.getElementById('display-name-save-btn');
      this.cancelBtn = document.getElementById('display-name-cancel-btn');
      this.actionsDiv = document.getElementById('display-name-actions');
      this.menuContainer = document.getElementById('display-name-menu-container');
      this.menuBtn = document.getElementById('display-name-menu-btn');
      this.menuDropdown = document.getElementById('display-name-menu-dropdown');
      this.menuEdit = document.getElementById('display-name-menu-edit');
      this.menuDelete = document.getElementById('display-name-menu-delete');
      this.statusDiv = document.getElementById('display-name-status');

      if (!this.displayNameInput || !this.charCount || !this.saveBtn || !this.cancelBtn) {
        console.warn('⚠️ DISPLAY_NAME: Required DOM elements not found');
        return;
      }

      if (this.charMax) {
        this.charMax.textContent = String(this.maxLength); // Set max chars in UI
      }
      this.displayNameInput.maxLength = this.maxLength; // Ensure input has max length
      this.displayNameInput.minLength = this.minLength; // Ensure input has min length

      // Load existing display name
      await this.readDisplayName();

      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('✅ DISPLAY_NAME: Display name manager initialized');
    } catch (error) {
      console.error('❌ DISPLAY_NAME: Failed to initialize:', error);
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.displayNameInput) return;
    
    // Character count update
    this.displayNameInput.addEventListener('input', () => {
      this.updateCharCount();
      if (!this.isEditing) {
        this.startEditing();
      }
    });

    // Save button
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => {
        this.saveDisplayName();
      });
    }

    // Cancel button
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => {
        this.cancelEdit();
      });
    }

    // Menu button
    if (this.menuBtn) {
      this.menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }

    // Menu edit
    if (this.menuEdit) {
      this.menuEdit.addEventListener('click', () => {
        this.startEditing();
        this.hideMenu();
      });
    }

    // Menu delete
    if (this.menuDelete) {
      this.menuDelete.addEventListener('click', () => {
        this.deleteDisplayName();
        this.hideMenu();
      });
    }

    // Click outside to close menu
    document.addEventListener('click', (e) => {
      if (this.menuContainer && !this.menuContainer.contains(e.target as Node)) {
        this.hideMenu();
      }
    });

    // Enter key to save
    this.displayNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.isEditing) {
        e.preventDefault();
        this.saveDisplayName();
      }
    });

    // Focus to manage editing state
    this.displayNameInput.addEventListener('focus', () => {
      const hasContent = this.displayNameInput ? this.displayNameInput.value.trim().length > 0 : false;
      if (hasContent && !this.isEditing) {
        this.startEditing();
      } else if (!hasContent) {
        this.isEditing = true;
        this.updateUIState();
      }
    });

    console.log('✅ DISPLAY_NAME: Event listeners attached');
  }

  /**
   * Update character count display
   */
  private updateCharCount(): void {
    if (!this.displayNameInput || !this.charCount) return;
    
    const currentLength = this.displayNameInput.value.length;
    this.charCount.textContent = String(currentLength);

    // Update color based on length (ROOT CAUSE FIX: Char count is now in separate div below input)
    const charCountContainer = this.charCount.parentElement;
    if (charCountContainer) {
      if (currentLength > this.maxLength * 0.9) {
        (charCountContainer as HTMLElement).style.color = '#dc3545'; // Red
      } else if (currentLength > this.maxLength * 0.75) {
        (charCountContainer as HTMLElement).style.color = '#ffc107'; // Yellow
      } else {
        (charCountContainer as HTMLElement).style.color = '#666'; // Gray
      }
    }
    
    // Update UI state to show/hide Save button based on validity
    this.updateUIState();
  }

  /**
   * READ: Load display name from storage/API
   */
  async readDisplayName(): Promise<void> {
    try {
      console.log('📖 DISPLAY_NAME: Reading display name...');
      console.log('🔍 DIAGNOSTIC: Reading display name via unified storage channel');

      const displayName = await this.storage.read();
      this.currentDisplayName = displayName || '';
      this.originalDisplayName = displayName || '';
      if (this.displayNameInput) {
        this.displayNameInput.value = this.currentDisplayName;
      }
      this.updateCharCount();
      this.updateUIState();
      if (displayName) {
        console.log('✅ DISPLAY_NAME: Display name loaded via profile setting channel');
      } else {
        console.log('ℹ️ DISPLAY_NAME: No display name found, starting fresh');
      }

      // If UserPreferencesManager wasn't ready, retry when it becomes available
      const { userPreferencesManager } = getSettingContracts();
      if (!userPreferencesManager?.isInitialized) {
        console.log('🔄 DISPLAY_NAME: UserPreferencesManager not ready, will retry when available');
        const retryHandler = async (): Promise<void> => {
          const contracts = getSettingContracts();
          if (contracts.userPreferencesManager?.isInitialized) {
            window.removeEventListener('preferenceLoaded', retryHandler);
            console.log('🔄 DISPLAY_NAME: UserPreferencesManager now ready, re-reading display name');
            await this.readDisplayName();
          }
        };
        window.addEventListener('preferenceLoaded', retryHandler);
      }
    } catch (error) {
      console.error('❌ DISPLAY_NAME: Failed to read display name:', error);
      this.showStatus('Error loading display name', 'error');
    }
  }

  /**
   * Update UI state based on display name content
   */
  private updateUIState(): void {
    if (!this.displayNameInput) return;
    
    const hasDisplayName = this.displayNameInput.value.trim().length > 0;
    const isValidEntry = this.displayNameInput.value.trim().length >= this.minLength;
    
    // Show menu if display name exists and not editing
    if (this.menuContainer) {
      (this.menuContainer as HTMLElement).style.display = hasDisplayName && !this.isEditing ? 'block' : 'none';
    }
    
    // Show actions (Save/Cancel) only when editing AND valid entry
    if (this.actionsDiv) {
      (this.actionsDiv as HTMLElement).style.display = (this.isEditing && isValidEntry) ? 'flex' : 'none';
    }
    
    // Disable input when not editing (if display name exists)
    if (hasDisplayName && !this.isEditing) {
      this.displayNameInput.style.pointerEvents = 'none';
      this.displayNameInput.style.backgroundColor = '#f5f5f5';
      this.displayNameInput.readOnly = true;
    } else {
      this.displayNameInput.style.pointerEvents = 'auto';
      this.displayNameInput.style.backgroundColor = '';
      this.displayNameInput.readOnly = false;
    }
  }

  /**
   * Start editing display name
   */
  private startEditing(): void {
    this.isEditing = true;
    this.updateUIState();
    if (this.displayNameInput) {
      this.displayNameInput.focus();
    }
  }

  /**
   * Toggle menu dropdown
   */
  private toggleMenu(): void {
    if (this.menuDropdown) {
      const isVisible = (this.menuDropdown as HTMLElement).style.display === 'block';
      (this.menuDropdown as HTMLElement).style.display = isVisible ? 'none' : 'block';
    }
  }

  /**
   * Hide menu dropdown
   */
  private hideMenu(): void {
    if (this.menuDropdown) {
      (this.menuDropdown as HTMLElement).style.display = 'none';
    }
  }

  /**
   * CREATE/UPDATE: Save display name
   */
  async saveDisplayName(): Promise<void> {
    try {
      if (!this.displayNameInput) return;
      
      const newDisplayName = this.displayNameInput.value.trim();

      // ROOT CAUSE FIX: Min 4, max 16 chars, null is ok
      if (newDisplayName.length > 0) {
        if (newDisplayName.length < this.minLength) {
          this.showStatus(`Display name must be at least ${this.minLength} characters`, 'error');
          return;
        }
        if (newDisplayName.length > this.maxLength) {
          this.showStatus(`Display name must be ${this.maxLength} characters or less`, 'error');
          return;
        }
      }

      console.log('💾 DISPLAY_NAME: Saving display name...');
      await this.storage.save(newDisplayName || null);
      
      this.currentDisplayName = newDisplayName;
      this.originalDisplayName = newDisplayName;
      this.isEditing = false;
      this.updateUIState();

      this.showStatus('Display name saved successfully', 'success');
      console.log('✅ DISPLAY_NAME: Display name saved');
    } catch (error) {
      console.error('❌ DISPLAY_NAME: Failed to save display name:', error);
      this.showStatus('Error saving display name', 'error');
    }
  }

  /**
   * DELETE: Delete display name
   */
  async deleteDisplayName(): Promise<void> {
    try {
      console.log('🗑️ DISPLAY_NAME: Deleting display name...');
      await this.storage.delete();
      this.currentDisplayName = '';
      this.originalDisplayName = '';
      if (this.displayNameInput) {
        this.displayNameInput.value = '';
      }
      this.updateCharCount();
      this.isEditing = false;
      this.updateUIState();
      this.hideMenu();
      this.showStatus('Display name deleted successfully', 'success');
      console.log('✅ DISPLAY_NAME: Display name deleted');
    } catch (error) {
      console.error('❌ DISPLAY_NAME: Failed to delete display name:', error);
      this.showStatus('Error deleting display name', 'error');
    }
  }

  /**
   * Cancel edit and restore original
   */
  private cancelEdit(): void {
    if (this.displayNameInput) {
      this.displayNameInput.value = this.originalDisplayName || '';
    }
    this.updateCharCount();
    this.isEditing = false;
    this.updateUIState();
    this.showStatus('Changes cancelled', 'info');
    console.log('❌ DISPLAY_NAME: Edit cancelled');
  }

  /**
   * Show status message
   */
  private showStatus(message: string, type: StatusType = 'info'): void {
    if (!this.statusDiv) return;

    this.statusDiv.textContent = message;
    (this.statusDiv as HTMLElement).style.display = 'block';

    // Set color based on type
    switch (type) {
      case 'success':
        (this.statusDiv as HTMLElement).style.backgroundColor = '#d4edda';
        (this.statusDiv as HTMLElement).style.color = '#155724';
        (this.statusDiv as HTMLElement).style.border = '1px solid #c3e6cb';
        break;
      case 'error':
        (this.statusDiv as HTMLElement).style.backgroundColor = '#f8d7da';
        (this.statusDiv as HTMLElement).style.color = '#721c24';
        (this.statusDiv as HTMLElement).style.border = '1px solid #f5c6cb';
        break;
      default:
        (this.statusDiv as HTMLElement).style.backgroundColor = '#d1ecf1';
        (this.statusDiv as HTMLElement).style.color = '#0c5460';
        (this.statusDiv as HTMLElement).style.border = '1px solid #bee5eb';
    }

    // Auto-hide after 3 seconds
    setTimeout(() => {
      (this.statusDiv as HTMLElement).style.display = 'none';
    }, 3000);
  }
}

// Initialize when DOM is ready and UserPreferencesManager is available
const bootstrapDisplayNameManager = async (): Promise<void> => {
  const manager = ensureManager('displayNameManager', () => new DisplayNameManager());
  // Wait for UserPreferencesManager to be ready before initializing
  await waitForPreferencesManager();
  await manager.initialize();
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void bootstrapDisplayNameManager();
    });
  } else {
    void bootstrapDisplayNameManager();
  }

  (window as Window).DisplayNameManager = DisplayNameManager;
}

export { DisplayNameManager };


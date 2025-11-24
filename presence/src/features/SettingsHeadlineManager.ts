import { createProfileSettingChannel } from './settings/helpers/profileSettingChannel.js';
import { ensureManager, waitForPreferencesManager, getSettingContracts } from '../sidepanel/windowInjections.js';

/**
 * SETTINGS HEADLINE MANAGER - CRUD Operations for Settings Headline
 * Handles Create, Read, Update, Delete operations for user headline
 * 
 * Modeled exactly after DisplayNameManager pattern
 */

type StatusType = 'success' | 'error' | 'info';

class SettingsHeadlineManager {
  private minLength: number = 20; // Min characters for headline
  private maxLength: number = 1000; // Max characters for headline
  private currentHeadline: string | null = null;
  private originalHeadline: string | null = null;
  private isInitialized: boolean = false;
  private isEditing: boolean = false;
  private readonly storage = createProfileSettingChannel('headline');
  
  private headlineInput: HTMLTextAreaElement | null = null;
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
   * Initialize headline manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ SETTINGS_HEADLINE: Already initialized');
      return;
    }

    console.log('🔧 SETTINGS_HEADLINE: Initializing headline manager...');

    try {
      // Get DOM elements
      this.headlineInput = document.getElementById('settings-headline-input') as HTMLTextAreaElement;
      this.charCount = document.getElementById('headline-char-count');
      this.charMax = document.getElementById('headline-char-max');
      this.saveBtn = document.getElementById('headline-save-btn');
      this.cancelBtn = document.getElementById('headline-cancel-btn');
      this.actionsDiv = document.getElementById('headline-actions');
      this.menuContainer = document.getElementById('headline-menu-container');
      this.menuBtn = document.getElementById('headline-menu-btn');
      this.menuDropdown = document.getElementById('headline-menu-dropdown');
      this.menuEdit = document.getElementById('headline-menu-edit');
      this.menuDelete = document.getElementById('headline-menu-delete');
      this.statusDiv = document.getElementById('headline-status');

      if (!this.headlineInput || !this.charCount || !this.saveBtn || !this.cancelBtn) {
        console.warn('⚠️ SETTINGS_HEADLINE: Required DOM elements not found');
        return;
      }

      if (this.charMax) {
        this.charMax.textContent = String(this.maxLength); // Set max chars in UI
      }
      this.headlineInput.maxLength = this.maxLength; // Ensure input has max length
      this.headlineInput.minLength = this.minLength; // Ensure input has min length

      // Load existing headline
      await this.readHeadline();

      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('✅ SETTINGS_HEADLINE: Headline manager initialized');
    } catch (error) {
      console.error('❌ SETTINGS_HEADLINE: Failed to initialize:', error);
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.headlineInput) return;
    
    // Character count update
    this.headlineInput.addEventListener('input', () => {
      this.updateCharCount();
      if (!this.isEditing) {
        this.startEditing();
      }
    });

    // Save button
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => {
        this.saveHeadline();
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
        this.deleteHeadline();
        this.hideMenu();
      });
    }

    // Click outside to close menu
    document.addEventListener('click', (e) => {
      if (this.menuContainer && !this.menuContainer.contains(e.target as Node)) {
        this.hideMenu();
      }
    });

    // Enter key to save (Ctrl+Enter or Cmd+Enter)
    this.headlineInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && this.isEditing) {
        e.preventDefault();
        this.saveHeadline();
      }
    });

    // Focus to manage editing state
    this.headlineInput.addEventListener('focus', () => {
      const hasContent = this.headlineInput ? this.headlineInput.value.trim().length > 0 : false;
      if (hasContent && !this.isEditing) {
        this.startEditing();
      } else if (!hasContent) {
        this.isEditing = true;
        this.updateUIState();
      }
    });

    console.log('✅ SETTINGS_HEADLINE: Event listeners attached');
  }

  /**
   * Update character count display
   */
  private updateCharCount(): void {
    if (!this.headlineInput || !this.charCount) return;
    
    const currentLength = this.headlineInput.value.length;
    this.charCount.textContent = String(currentLength);

    // Update color based on length (ROOT CAUSE FIX: Char count is now in separate div below input)
    const charCountContainer = this.charCount.parentElement;
    if (charCountContainer) {
      if (currentLength > this.maxLength * 0.9) {
        (charCountContainer as HTMLElement).style.color = '#dc3545'; // Red
      } else if (currentLength > this.maxLength * 0.75) {
        (charCountContainer as HTMLElement).style.color = '#ffc107'; // Yellow
      } else if (currentLength < this.minLength && currentLength > 0) {
        (charCountContainer as HTMLElement).style.color = '#dc3545'; // Red if below minimum and not empty
      } else {
        (charCountContainer as HTMLElement).style.color = '#666'; // Gray
      }
    }
    
    // Update UI state to show/hide Save button based on validity
    this.updateUIState();
  }

  /**
   * READ: Load headline from storage/API
   */
  async readHeadline(): Promise<void> {
    try {
      console.log('📖 SETTINGS_HEADLINE: Reading headline...');
      console.log('🔍 DIAGNOSTIC: Reading headline via unified storage channel');

      const headline = await this.storage.read();
      this.currentHeadline = headline || '';
      this.originalHeadline = headline || '';
      if (this.headlineInput) {
        this.headlineInput.value = this.currentHeadline || '';
      }
      this.updateCharCount();
      this.updateUIState();
      if (headline) {
        console.log('✅ SETTINGS_HEADLINE: Headline loaded via profile setting channel');
      } else {
        console.log('ℹ️ SETTINGS_HEADLINE: No headline found, starting fresh');
      }

      // If UserPreferencesManager wasn't ready, retry when it becomes available
      const { userPreferencesManager } = getSettingContracts();
      if (!userPreferencesManager?.isInitialized) {
        console.log('🔄 SETTINGS_HEADLINE: UserPreferencesManager not ready, will retry when available');
        const retryHandler = async (): Promise<void> => {
          const contracts = getSettingContracts();
          if (contracts.userPreferencesManager?.isInitialized) {
            window.removeEventListener('preferenceLoaded', retryHandler);
            console.log('🔄 SETTINGS_HEADLINE: UserPreferencesManager now ready, re-reading headline');
            await this.readHeadline();
          }
        };
        window.addEventListener('preferenceLoaded', retryHandler);
      }
    } catch (error) {
      console.error('❌ SETTINGS_HEADLINE: Failed to read headline:', error);
      this.showStatus('Error loading headline', 'error');
    }
  }

  /**
   * Update UI state based on headline content
   */
  private updateUIState(): void {
    if (!this.headlineInput) return;
    
    const hasHeadline = this.headlineInput.value.trim().length > 0;
    const isValidEntry = this.headlineInput.value.trim().length >= this.minLength;
    
    // Show menu if headline exists and not editing
    if (this.menuContainer) {
      (this.menuContainer as HTMLElement).style.display = hasHeadline && !this.isEditing ? 'block' : 'none';
    }
    
    // Show actions (Save/Cancel) only when editing AND valid entry
    if (this.actionsDiv) {
      (this.actionsDiv as HTMLElement).style.display = (this.isEditing && isValidEntry) ? 'flex' : 'none';
    }
    
    // Disable input when not editing (if headline exists)
    if (hasHeadline && !this.isEditing) {
      this.headlineInput.style.pointerEvents = 'none';
      this.headlineInput.style.backgroundColor = '#f5f5f5';
      this.headlineInput.readOnly = true;
    } else {
      this.headlineInput.style.pointerEvents = 'auto';
      this.headlineInput.style.backgroundColor = '';
      this.headlineInput.readOnly = false;
    }
  }

  /**
   * Start editing headline
   */
  private startEditing(): void {
    this.isEditing = true;
    this.updateUIState();
    if (this.headlineInput) {
      this.headlineInput.focus();
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
   * CREATE/UPDATE: Save headline
   */
  async saveHeadline(): Promise<void> {
    try {
      if (!this.headlineInput) return;
      
      const newHeadline = this.headlineInput.value.trim();

      // ROOT CAUSE FIX: Min 20, max 1000 chars, null is ok
      if (newHeadline.length > 0) {
        if (newHeadline.length < this.minLength) {
          this.showStatus(`Headline must be at least ${this.minLength} characters`, 'error');
          return;
        }
        if (newHeadline.length > this.maxLength) {
          this.showStatus(`Headline must be ${this.maxLength} characters or less`, 'error');
          return;
        }
      }

      console.log('💾 SETTINGS_HEADLINE: Saving headline...');
      await this.storage.save(newHeadline || null);
      
      this.currentHeadline = newHeadline || null;
      this.originalHeadline = newHeadline || null;
      this.isEditing = false;
      this.updateUIState();

      this.showStatus('Headline saved successfully', 'success');
      console.log('✅ SETTINGS_HEADLINE: Headline saved');
    } catch (error) {
      console.error('❌ SETTINGS_HEADLINE: Failed to save headline:', error);
      this.showStatus('Error saving headline', 'error');
    }
  }

  /**
   * DELETE: Delete headline
   */
  async deleteHeadline(): Promise<void> {
    try {
      console.log('🗑️ SETTINGS_HEADLINE: Deleting headline...');
      await this.storage.delete();
      this.currentHeadline = '';
      this.originalHeadline = '';
      if (this.headlineInput) {
        this.headlineInput.value = '';
      }
      this.updateCharCount();
      this.isEditing = false;
      this.updateUIState();
      this.hideMenu();
      this.showStatus('Headline deleted successfully', 'success');
      console.log('✅ SETTINGS_HEADLINE: Headline deleted');
    } catch (error) {
      console.error('❌ SETTINGS_HEADLINE: Failed to delete headline:', error);
      this.showStatus('Error deleting headline', 'error');
    }
  }

  /**
   * Cancel edit and restore original
   */
  private cancelEdit(): void {
    if (this.headlineInput) {
      this.headlineInput.value = this.originalHeadline || '';
    }
    this.updateCharCount();
    this.isEditing = false;
    this.updateUIState();
    this.showStatus('Changes cancelled', 'info');
    console.log('❌ SETTINGS_HEADLINE: Edit cancelled');
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
const bootstrapSettingsHeadlineManager = async (): Promise<void> => {
  const manager = ensureManager('settingsHeadlineManager', () => new SettingsHeadlineManager());
  // Wait for UserPreferencesManager to be ready before initializing
  await waitForPreferencesManager();
  await manager.initialize();
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void bootstrapSettingsHeadlineManager();
    });
  } else {
    void bootstrapSettingsHeadlineManager();
  }

  (window as Window).SettingsHeadlineManager = SettingsHeadlineManager;
}

export { SettingsHeadlineManager };


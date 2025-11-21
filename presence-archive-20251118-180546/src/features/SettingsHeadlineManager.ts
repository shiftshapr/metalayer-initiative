/**
 * SETTINGS HEADLINE MANAGER - CRUD Operations for Settings Headline
 * Handles Create, Read, Update, Delete operations for user headline
 */

type StatusType = 'success' | 'error' | 'info';

interface UserPreferences {
  headline?: string;
}

class SettingsHeadlineManager {
  private maxLength: number = 1000;
  private currentHeadline: string | null = null;
  private originalHeadline: string | null = null;
  private isInitialized: boolean = false;
  
  private headlineInput: HTMLTextAreaElement | null = null;
  private charCount: HTMLElement | null = null;
  private saveBtn: HTMLElement | null = null;
  private cancelBtn: HTMLElement | null = null;
  private deleteBtn: HTMLElement | null = null;
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
      this.saveBtn = document.getElementById('headline-save-btn');
      this.cancelBtn = document.getElementById('headline-cancel-btn');
      this.deleteBtn = document.getElementById('headline-delete-btn');
      this.statusDiv = document.getElementById('headline-status');

      if (!this.headlineInput || !this.charCount || !this.saveBtn || !this.cancelBtn || !this.deleteBtn) {
        console.warn('⚠️ SETTINGS_HEADLINE: Required DOM elements not found');
        return;
      }

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

    // Delete button
    if (this.deleteBtn) {
      this.deleteBtn.addEventListener('click', () => {
        this.deleteHeadline();
      });
    }

    // Enter key to save (Ctrl+Enter or Cmd+Enter)
    this.headlineInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.saveHeadline();
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
    
    // Update color based on length
    if (currentLength > this.maxLength * 0.9) {
      (this.charCount as HTMLElement).style.color = '#dc3545'; // Red
    } else if (currentLength > this.maxLength * 0.75) {
      (this.charCount as HTMLElement).style.color = '#ffc107'; // Yellow
    } else {
      (this.charCount as HTMLElement).style.color = '#666'; // Gray
    }
  }

  /**
   * READ: Load headline from storage
   */
  async readHeadline(): Promise<void> {
    try {
      console.log('📖 SETTINGS_HEADLINE: Reading headline...');

      // Try Chrome storage first
      const storageData = await chrome.storage.local.get(['settingsHeadline']);
      if (storageData.settingsHeadline) {
        this.currentHeadline = storageData.settingsHeadline as string;
        this.originalHeadline = storageData.settingsHeadline as string;
        if (this.headlineInput) {
          this.headlineInput.value = this.currentHeadline;
        }
        this.updateCharCount();
        console.log('✅ SETTINGS_HEADLINE: Headline loaded from Chrome storage');
        return;
      }

      // Try API if available
      if (window.currentUser && (window.currentUser as any).id) {
        try {
          const authToken = await this.getAuthToken();
          const response = await fetch(`http://216.238.91.120:3002/v1/users/${(window.currentUser as any).id}/preferences`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (response.ok) {
            const data = await response.json() as { preferences?: UserPreferences };
            if (data.preferences && data.preferences.headline) {
              this.currentHeadline = data.preferences.headline;
              this.originalHeadline = data.preferences.headline;
              if (this.headlineInput) {
                this.headlineInput.value = this.currentHeadline;
              }
              this.updateCharCount();
              
              // Save to Chrome storage for faster access
              await chrome.storage.local.set({ settingsHeadline: this.currentHeadline });
              console.log('✅ SETTINGS_HEADLINE: Headline loaded from API');
              return;
            }
          }
        } catch (apiError) {
          console.warn('⚠️ SETTINGS_HEADLINE: API read failed, using local storage only:', apiError);
        }
      }

      // No headline found
      this.currentHeadline = '';
      this.originalHeadline = '';
      if (this.headlineInput) {
        this.headlineInput.value = '';
      }
      this.updateCharCount();
      console.log('ℹ️ SETTINGS_HEADLINE: No headline found, starting fresh');
    } catch (error) {
      console.error('❌ SETTINGS_HEADLINE: Failed to read headline:', error);
      this.showStatus('Error loading headline', 'error');
    }
  }

  /**
   * CREATE/UPDATE: Save headline
   */
  async saveHeadline(): Promise<void> {
    try {
      if (!this.headlineInput) return;
      
      const newHeadline = this.headlineInput.value.trim();

      // Validate length
      if (newHeadline.length > this.maxLength) {
        this.showStatus(`Headline exceeds maximum length of ${this.maxLength} characters`, 'error');
        return;
      }

      console.log('💾 SETTINGS_HEADLINE: Saving headline...');

      // Save to Chrome storage
      await chrome.storage.local.set({ settingsHeadline: newHeadline });
      this.currentHeadline = newHeadline;
      this.originalHeadline = newHeadline;

      // Save to API if available
      if (window.currentUser && (window.currentUser as any).id) {
        try {
          const authToken = await this.getAuthToken();
          const response = await fetch(`http://216.238.91.120:3002/v1/users/${(window.currentUser as any).id}/preferences`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              preferences: {
                headline: newHeadline
              }
            })
          });

          if (response.ok) {
            console.log('✅ SETTINGS_HEADLINE: Headline saved to API');
          } else {
            console.warn('⚠️ SETTINGS_HEADLINE: API save failed, but saved locally');
          }
        } catch (apiError) {
          console.warn('⚠️ SETTINGS_HEADLINE: API save error, but saved locally:', apiError);
        }
      }

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
      if (!confirm('Are you sure you want to delete your headline?')) {
        return;
      }

      console.log('🗑️ SETTINGS_HEADLINE: Deleting headline...');

      // Clear from Chrome storage
      await chrome.storage.local.remove(['settingsHeadline']);
      this.currentHeadline = '';
      this.originalHeadline = '';
      if (this.headlineInput) {
        this.headlineInput.value = '';
      }
      this.updateCharCount();

      // Delete from API if available
      if (window.currentUser && (window.currentUser as any).id) {
        try {
          const authToken = await this.getAuthToken();
          const response = await fetch(`http://216.238.91.120:3002/v1/users/${(window.currentUser as any).id}/preferences`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              preferences: {
                headline: null
              }
            })
          });

          if (response.ok) {
            console.log('✅ SETTINGS_HEADLINE: Headline deleted from API');
          } else {
            console.warn('⚠️ SETTINGS_HEADLINE: API delete failed, but deleted locally');
          }
        } catch (apiError) {
          console.warn('⚠️ SETTINGS_HEADLINE: API delete error, but deleted locally:', apiError);
        }
      }

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

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    try {
      const authManager = (window as Window & { authManager?: { getCurrentUser: () => Promise<{ id?: string; email?: string } | null>; updateUserProfile: (profile: { auraColor?: string; avatarUrl?: string }) => void; getAuthToken?: () => Promise<string> } }).authManager;
      if (authManager && typeof authManager.getAuthToken === 'function') {
        return await authManager.getAuthToken();
      }
      // Fallback to Chrome identity API
      return new Promise<string>((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (result) => {
          if (chrome.runtime.lastError) {
            resolve('');
          } else {
            resolve(typeof result === 'string' ? result : '');
          }
        });
      });
    } catch (error) {
      console.warn('⚠️ SETTINGS_HEADLINE: Failed to get auth token:', error);
      return '';
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    (window as Window & { settingsHeadlineManager?: { initialize: () => Promise<void> } }).settingsHeadlineManager = new SettingsHeadlineManager();
    (window as Window & { settingsHeadlineManager?: { initialize: () => Promise<void> } }).settingsHeadlineManager?.initialize();
  });
} else {
  (window as Window & { settingsHeadlineManager?: { initialize: () => Promise<void> } }).settingsHeadlineManager = new SettingsHeadlineManager();
  (window as Window & { settingsHeadlineManager?: { initialize: () => Promise<void> } }).settingsHeadlineManager?.initialize();
}

// Export for global access
(window as Window & { SettingsHeadlineManager?: any }).SettingsHeadlineManager = SettingsHeadlineManager;

export { SettingsHeadlineManager };


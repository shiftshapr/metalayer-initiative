/**
 * VISIBILITY SETTINGS COMPONENT - Settings UI Component
 * 
 * Phase 3: UI Component Extraction
 * - Extracted from VisibilitySettingsManager
 * - Manages settings UI and delegates to storage service
 */

import type { IVisibilityStorage } from '../core/VisibilityTypes.js';
import { stateManagerInstance } from '../../../core/StateManager.js';
import type { User } from '../../../types/index.js';
import { Logger } from '../../../utils/Logger.js';
import { handleError } from '../../../utils/ErrorHandler.js';

/**
 * VisibilitySettings component
 * Manages visibility settings UI (visibility toggle, status, aura, display name, theme)
 */
export class VisibilitySettings {
  private storage: IVisibilityStorage;
  private visibilityToggle: HTMLInputElement | null = null;
  private statusSelect: HTMLSelectElement | null = null;
  private auraColorPicker: HTMLInputElement | null = null;
  private auraIntensitySlider: HTMLInputElement | null = null;
  private displayNameInput: HTMLInputElement | null = null;
  private themeToggle: HTMLInputElement | null = null;
  private isInitialized: boolean = false;

  constructor(storage: IVisibilityStorage) {
    this.storage = storage;
  }

  /**
   * Initialize component
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        await this.ensureEventListeners();
        return;
      }

      // Get DOM elements
      this.visibilityToggle = document.getElementById('visibility-toggle') as HTMLInputElement | null;
      this.statusSelect = document.getElementById('status-select') as HTMLSelectElement | null;
      this.auraColorPicker = document.getElementById('aura-color-picker') as HTMLInputElement | null;
      this.auraIntensitySlider = document.getElementById('aura-intensity-slider') as HTMLInputElement | null;
      this.displayNameInput = document.getElementById('display-name-input') as HTMLInputElement | null;
      this.themeToggle = document.getElementById('theme-toggle') as HTMLInputElement | null;

      if (!this.visibilityToggle || !this.statusSelect || !this.auraColorPicker) {
        Logger.warn('⚠️ VISIBILITY_SETTINGS: Required DOM elements not found', null, 'general');
        return;
      }

      // Load settings
      await this.loadSettings();

      // Set up event listeners
      this.setupEventListeners();

      // Set up global event listeners for external communication
      this.setupGlobalEventListeners();

      this.isInitialized = true;
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'initialize', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Ensure event listeners are attached
   */
  async ensureEventListeners(): Promise<void> {
    try {
      // Re-get elements and re-attach if needed
      await this.initialize();
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'ensureEventListeners', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Set up global event listeners for external communication
   * Listens for events from other modules (e.g., ProfileManager)
   */
  private setupGlobalEventListeners(): void {
    // Listen for ensureVisibilityEventListeners event (from ProfileManager)
    if (typeof window !== 'undefined' && !document.getElementById('visibility-settings-listener-attached')) {
      // Handler for ensureVisibilityEventListeners event
      const ensureHandler = async (event: Event) => {
        try {
          const customEvent = event as CustomEvent<{ source?: string }>;
          Logger.debug('🔧 VISIBILITY_SETTINGS: Received ensureVisibilityEventListeners event', {
            source: customEvent.detail?.source || 'unknown'
          }, 'general');
          await this.ensureEventListeners();
        } catch (error: unknown) {
          handleError(error, {
            context: { operation: 'ensureHandler', component: 'VisibilitySettings' }
          });
        }
      };

      // Handler for updateVisibilityThemeStatus event
      const updateThemeHandler = async (event: Event) => {
        try {
          const customEvent = event as CustomEvent<{ source?: string; theme?: string }>;
          Logger.debug('🔧 VISIBILITY_SETTINGS: Received updateVisibilityThemeStatus event', {
            source: customEvent.detail?.source || 'unknown',
            theme: customEvent.detail?.theme
          }, 'general');
          // Refresh theme toggle state
          await this.updateThemeStatus();
        } catch (error: unknown) {
          handleError(error, {
            context: { operation: 'updateThemeHandler', component: 'VisibilitySettings' }
          });
        }
      };

      // Handler for updateVisibilityStatus event
      const updateVisibilityHandler = async (event: Event) => {
        const customEvent = event as CustomEvent<{ source?: string; isVisible?: boolean }>;
        Logger.debug('🔧 VISIBILITY_SETTINGS: Received updateVisibilityStatus event', {
          source: customEvent.detail?.source || 'unknown',
          isVisible: customEvent.detail?.isVisible
        }, 'general');
        // Refresh visibility toggle state if needed
        if (this.visibilityToggle && customEvent.detail?.isVisible !== undefined) {
          this.visibilityToggle.checked = customEvent.detail.isVisible;
        }
      };

      window.addEventListener('ensureVisibilityEventListeners', ensureHandler);
      window.addEventListener('updateVisibilityThemeStatus', updateThemeHandler);
      window.addEventListener('updateVisibilityStatus', updateVisibilityHandler);
      
      // Mark as attached (using a marker element approach since we can't modify window)
      const marker = document.createElement('div');
      marker.id = 'visibility-settings-listener-attached';
      marker.style.display = 'none';
      document.body.appendChild(marker);
    }
  }

  /**
   * Update theme status (refresh theme toggle state)
   */
  private async updateThemeStatus(): Promise<void> {
    try {
      // Refresh theme toggle to match current theme
      const win = typeof window !== 'undefined' ? window as Window & {
        userPreferencesManager?: { getPreference?: (key: string) => Promise<string | number | boolean | null>; isInitialized?: boolean };
      } : null;
      
      let currentTheme = 'light';
      if (win?.userPreferencesManager?.isInitialized) {
        const prefTheme = await win.userPreferencesManager.getPreference('theme');
        if (typeof prefTheme === 'string' && ['light', 'dark', 'auto'].includes(prefTheme)) {
          currentTheme = prefTheme;
        }
      } else {
        // Fallback to DOM
        currentTheme = document.body.getAttribute('data-theme') || 'light';
      }
      
      if (this.themeToggle) {
        this.themeToggle.checked = currentTheme === 'dark';
      }
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'updateThemeStatus', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Visibility toggle - CRITICAL FIX: Strict target validation to prevent event bubbling
    if (this.visibilityToggle && this.visibilityToggle.getAttribute('data-handler-attached') !== 'true') {
      const toggle = this.visibilityToggle;
      toggle.addEventListener('change', async (e) => {
        try {
          // CRITICAL FIX: Strict target validation - only process if event target is exactly the visibility toggle
          if (e.target !== toggle || toggle.id !== 'visibility-toggle') {
            Logger.warn('⚠️ VISIBILITY_SETTINGS: Visibility toggle event ignored - target mismatch', null, 'general');
            return;
          }
          e.stopPropagation();
          e.stopImmediatePropagation(); // Prevent other handlers from running
          await this.saveVisibility();
        } catch (error: unknown) {
          handleError(error, {
            context: { operation: 'visibilityToggleChange', component: 'VisibilitySettings' }
          });
        }
      });
      toggle.setAttribute('data-handler-attached', 'true');
    }

    // Status select
    if (this.statusSelect && this.statusSelect.getAttribute('data-handler-attached') !== 'true') {
      this.statusSelect.addEventListener('change', async () => {
        try {
          await this.saveStatus();
        } catch (error: unknown) {
          handleError(error, {
            context: { operation: 'statusSelectChange', component: 'VisibilitySettings' }
          });
        }
      });
      this.statusSelect.setAttribute('data-handler-attached', 'true');
    }

    // Aura color picker
    if (this.auraColorPicker && this.auraColorPicker.getAttribute('data-handler-attached') !== 'true') {
      this.auraColorPicker.addEventListener('input', () => {
        this.saveAura();
      });
      this.auraColorPicker.setAttribute('data-handler-attached', 'true');
    }

    // Aura intensity slider
    if (this.auraIntensitySlider && this.auraIntensitySlider.getAttribute('data-handler-attached') !== 'true') {
      this.auraIntensitySlider.addEventListener('input', () => {
        this.saveAura();
      });
      this.auraIntensitySlider.setAttribute('data-handler-attached', 'true');
    }

    // Display name save
    const displayNameSaveBtn = document.getElementById('display-name-save-btn');
    if (displayNameSaveBtn) {
      displayNameSaveBtn.addEventListener('click', () => {
        this.saveDisplayName();
      });
    }

    // Theme toggle - CRITICAL FIX: Strict target validation to prevent affecting visibility
    if (this.themeToggle && this.themeToggle.getAttribute('data-handler-attached') !== 'true') {
      const toggle = this.themeToggle;
      toggle.addEventListener('change', async (e) => {
        try {
          // CRITICAL FIX: Strict target validation - only process if event target is exactly the theme toggle
          if (e.target !== toggle || toggle.id !== 'theme-toggle') {
            Logger.warn('⚠️ VISIBILITY_SETTINGS: Theme toggle event ignored - target mismatch', null, 'general');
            return;
          }
          e.stopPropagation();
          e.stopImmediatePropagation(); // Prevent other handlers from running
          await this.saveTheme();
        } catch (error: unknown) {
          handleError(error, {
            context: { operation: 'themeToggleChange', component: 'VisibilitySettings' }
          });
        }
      });
      toggle.setAttribute('data-handler-attached', 'true');
    }
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      // Load visibility
      const isVisible = await this.storage.getVisibility();
      if (this.visibilityToggle) {
        // CRITICAL FIX: Clone toggle to remove existing handlers, then set state BEFORE attaching handlers
        const newToggle = this.visibilityToggle.cloneNode(true) as HTMLInputElement;
        if (this.visibilityToggle.parentNode) {
          this.visibilityToggle.parentNode.replaceChild(newToggle, this.visibilityToggle);
        }
        this.visibilityToggle = newToggle;
        // Set checked state BEFORE attaching handlers to prevent double-click issue
        this.visibilityToggle.checked = isVisible;
      }

      // Load status
      const status = await this.storage.getStatus();
      if (this.statusSelect) {
        this.statusSelect.value = status;
      }

      // Load aura color
      const auraColor = await this.storage.getAuraColor();
      if (this.auraColorPicker) {
        this.auraColorPicker.value = auraColor;
      }

      // Load aura intensity
      const auraIntensity = await this.storage.getAuraIntensity();
      if (this.auraIntensitySlider) {
        this.auraIntensitySlider.value = String(auraIntensity);
      }
      const auraIntensityValue = document.getElementById('aura-intensity-value');
      if (auraIntensityValue) {
        auraIntensityValue.textContent = String(auraIntensity);
      }

      // Load display name
      const displayName = await this.storage.getDisplayName();
      if (this.displayNameInput) {
        this.displayNameInput.value = displayName;
      }

      // Load theme from UserPreferencesManager (priority) or DOM
      const win = typeof window !== 'undefined' ? window as Window & {
        userPreferencesManager?: {
          isInitialized: boolean;
          getPreference: (key: string) => Promise<string | null>;
        };
      } : null;
      
      let currentTheme = 'light';
      if (win?.userPreferencesManager?.isInitialized) {
        const prefTheme = await win.userPreferencesManager.getPreference('theme');
        if (typeof prefTheme === 'string' && ['light', 'dark', 'auto'].includes(prefTheme)) {
          currentTheme = prefTheme;
        }
      } else {
        // Fallback to DOM
        currentTheme = document.body.getAttribute('data-theme') || 'light';
      }
      
      if (this.themeToggle) {
        this.themeToggle.checked = currentTheme === 'dark';
      }
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'loadSettings', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Save visibility setting
   */
  private async saveVisibility(): Promise<void> {
    try {
      if (!this.visibilityToggle) return;
      const isVisible = this.visibilityToggle.checked;
      await this.storage.saveVisibility(isVisible);

      // Update currentUser in StateManager
      const currentUser = stateManagerInstance.getState('currentUser') as User | null | undefined;
      if (currentUser && typeof currentUser === 'object') {
        const updatedUser: User = {
          ...currentUser,
          isVisible,
          visibilityEnabled: isVisible
        };
        stateManagerInstance.setState('currentUser', updatedUser);
      }

      // CRITICAL FIX: Also update window.currentUser directly for AppUser compatibility
      const win = typeof window !== 'undefined' ? window as Window & {
        currentUser?: { isVisible?: boolean; visibilityEnabled?: boolean };
      } : null;
      if (win?.currentUser) {
        win.currentUser.isVisible = isVisible;
        win.currentUser.visibilityEnabled = isVisible;
      }

      // Dispatch event
      window.dispatchEvent(new CustomEvent('visibilityChanged', {
        detail: { isVisible, visibilityEnabled: isVisible }
      }));
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'saveVisibility', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Save status setting
   */
  private async saveStatus(): Promise<void> {
    try {
      if (!this.statusSelect) return;
      const status = this.statusSelect.value;
      await this.storage.saveStatus(status);

      // Update currentUser
      const currentUser = stateManagerInstance.getState('currentUser') as User | null | undefined;
      if (currentUser && typeof currentUser === 'object') {
        const updatedUser: User = {
          ...currentUser,
          availability: status,
          status
        };
        stateManagerInstance.setState('currentUser', updatedUser);
      }

      window.dispatchEvent(new CustomEvent('statusChanged', {
        detail: { status, availability: status }
      }));
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'saveStatus', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Save aura settings
   */
  private async saveAura(): Promise<void> {
    try {
      if (!this.auraColorPicker || !this.auraIntensitySlider) return;
      const auraColor = this.auraColorPicker.value;
      const auraIntensity = parseFloat(this.auraIntensitySlider.value);

      await this.storage.saveAuraColor(auraColor);
      await this.storage.saveAuraIntensity(auraIntensity);

      // Update currentUser
      const currentUser = stateManagerInstance.getState('currentUser') as User | null | undefined;
      if (currentUser && typeof currentUser === 'object') {
        const updatedUser: User = {
          ...currentUser,
          auraColor,
          auraIntensity
        };
        stateManagerInstance.setState('currentUser', updatedUser);
      }
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'saveAura', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Save display name
   */
  private async saveDisplayName(): Promise<void> {
    try {
      if (!this.displayNameInput) return;
      const displayName = this.displayNameInput.value.trim();

      if (displayName.length > 0 && (displayName.length < 4 || displayName.length > 16)) {
        alert('Display name must be 4-16 characters');
        return;
      }

      await this.storage.saveDisplayName(displayName);

      // Update currentUser
      const currentUser = stateManagerInstance.getState('currentUser') as User | null | undefined;
      if (currentUser && typeof currentUser === 'object') {
        const updatedUser: User = {
          ...currentUser,
          name: displayName,
          displayName
        };
        stateManagerInstance.setState('currentUser', updatedUser);
      }
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'saveDisplayName', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Save theme setting
   */
  private async saveTheme(): Promise<void> {
    try {
      if (!this.themeToggle) return;
      const theme = this.themeToggle.checked ? 'dark' : 'light';

      // Apply to DOM immediately
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);

      // Save via UserPreferencesManager if available
      const win = typeof window !== 'undefined' ? window as Window & {
        userPreferencesManager?: {
          isInitialized: boolean;
          savePreference: (key: string, value: string) => Promise<void>;
        };
      } : null;

      if (win?.userPreferencesManager?.isInitialized) {
        await win.userPreferencesManager.savePreference('theme', theme);
      } else if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.set({ theme });
      }
    } catch (error: unknown) {
      handleError(error, {
        context: { operation: 'saveTheme', component: 'VisibilitySettings' }
      });
    }
  }

  /**
   * Get visibility toggle element (for external access)
   */
  getVisibilityToggle(): HTMLInputElement | null {
    return this.visibilityToggle;
  }
}


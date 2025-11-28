/**
 * VISIBILITY SETTINGS MANAGER
 * Handles all visibility-related settings: Visible, Status, Aura, Headline, Display Name
 * TypeScript + ES6 Module
 */
import { stateManagerInstance } from '../core/StateManager.js';
class VisibilitySettingsManager {
    constructor() {
        this.isInitialized = false;
        this.originalValues = {};
        // DOM elements
        this.visibilityToggle = null;
        this.visibilityStatusText = null;
        this.statusSelect = null;
        this.auraColorPicker = null;
        this.auraColorHex = null;
        this.auraIntensitySlider = null;
        this.auraIntensityValue = null;
        this.displayNameInput = null;
        this.displayNameSaveBtn = null;
        this.displayNameResetBtn = null;
        this.themeToggle = null;
    }
    getVisibilityManagerInstance() {
        if (typeof window === 'undefined') {
            return null;
        }
        return window.visibilityManager || null;
    }
    /**
     * Initialize visibility settings manager
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ VISIBILITY_SETTINGS: Already initialized, re-attaching event listeners...');
            // Re-attach event listeners in case they were lost
            await this.ensureEventListeners();
            return;
        }
        console.log('🔧 VISIBILITY_SETTINGS: Initializing visibility settings manager...');
        try {
            // Get DOM elements
            this.visibilityToggle = document.getElementById('visibility-toggle');
            this.visibilityStatusText = document.getElementById('visibility-status-text');
            this.statusSelect = document.getElementById('status-select');
            this.auraColorPicker = document.getElementById('aura-color-picker');
            this.auraColorHex = document.getElementById('aura-color-hex');
            this.auraIntensitySlider = document.getElementById('aura-intensity-slider');
            this.auraIntensityValue = document.getElementById('aura-intensity-value');
            this.displayNameInput = document.getElementById('display-name-input');
            this.displayNameSaveBtn = document.getElementById('display-name-save-btn');
            this.displayNameResetBtn = document.getElementById('display-name-reset-btn');
            this.themeToggle = document.getElementById('theme-toggle');
            // FIX: theme-status-text element removed - only Dark label on right now
            if (!this.visibilityToggle || !this.statusSelect || !this.auraColorPicker) {
                console.warn('⚠️ VISIBILITY_SETTINGS: Required DOM elements not found');
                return;
            }
            // Load current settings
            await this.loadSettings();
            // Set up event listeners
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ VISIBILITY_SETTINGS: Visibility settings manager initialized');
        }
        catch (error) {
            console.error('❌ VISIBILITY_SETTINGS: Failed to initialize:', error);
        }
    }
    /**
     * CRITICAL FIX: Ensure event listeners are attached (call when settings tab opens)
     * FIX: Prevent double-attachment that causes double-click issue
     */
    async ensureEventListeners() {
        console.log('🔧 VISIBILITY_SETTINGS: Ensuring event listeners are attached...');
        // Re-get ALL DOM elements in case they were recreated
        const visibilityToggleEl = document.getElementById('visibility-toggle');
        const statusSelectEl = document.getElementById('status-select');
        const auraColorPickerEl = document.getElementById('aura-color-picker');
        const auraColorHexEl = document.getElementById('aura-color-hex');
        const auraIntensitySliderEl = document.getElementById('aura-intensity-slider');
        const auraIntensityValueEl = document.getElementById('aura-intensity-value');
        const themeToggleEl = document.getElementById('theme-toggle');
        // CRITICAL FIX: Only update references if elements exist and are different
        if (visibilityToggleEl && visibilityToggleEl !== this.visibilityToggle) {
            this.visibilityToggle = visibilityToggleEl;
        }
        if (statusSelectEl && statusSelectEl !== this.statusSelect) {
            this.statusSelect = statusSelectEl;
        }
        if (auraColorPickerEl && auraColorPickerEl !== this.auraColorPicker) {
            this.auraColorPicker = auraColorPickerEl;
        }
        if (auraColorHexEl && auraColorHexEl !== this.auraColorHex) {
            this.auraColorHex = auraColorHexEl;
        }
        if (auraIntensitySliderEl && auraIntensitySliderEl !== this.auraIntensitySlider) {
            this.auraIntensitySlider = auraIntensitySliderEl;
        }
        if (auraIntensityValueEl && auraIntensityValueEl !== this.auraIntensityValue) {
            this.auraIntensityValue = auraIntensityValueEl;
        }
        if (themeToggleEl && themeToggleEl !== this.themeToggle) {
            this.themeToggle = themeToggleEl;
        }
        // Check if ALL handlers are attached
        const allHandlersAttached = (this.visibilityToggle?.getAttribute('data-handler-attached') === 'true') &&
            (this.statusSelect?.getAttribute('data-handler-attached') === 'true') &&
            (this.auraColorPicker?.getAttribute('data-handler-attached') === 'true') &&
            (this.auraColorHex?.getAttribute('data-handler-attached') === 'true') &&
            (this.auraIntensitySlider?.getAttribute('data-handler-attached') === 'true') &&
            (this.themeToggle?.getAttribute('data-handler-attached') === 'true');
        if (!allHandlersAttached) {
            console.log('⚠️ VISIBILITY_SETTINGS: Some handlers not attached, re-attaching all...');
            // Re-attach all event listeners
            this.setupEventListeners();
        }
        else {
            console.log('✅ VISIBILITY_SETTINGS: All handlers already attached');
        }
    }
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Visibility toggle - COMP: Prevent double-attachment without cloning
        if (this.visibilityToggle) {
            // Check if already attached - COMP: Skip if already attached to prevent double-click
            if (this.visibilityToggle.getAttribute('data-handler-attached') === 'true') {
                console.log('✅ VISIBILITY_SETTINGS: Visibility toggle handler already attached, skipping');
                return;
            }
            // COMP: Don't clone - cloning causes double-click issue
            // Just attach the handler directly
            const toggle = this.visibilityToggle;
            toggle.addEventListener('change', async (e) => {
                // COMP: CRITICAL FIX - Ensure this is the visibility toggle, not theme toggle
                if (e.target !== toggle || toggle.id !== 'visibility-toggle') {
                    console.warn('⚠️ VISIBILITY_SETTINGS: Ignoring change event - wrong target');
                    return;
                }
                e.stopPropagation(); // COMP: Prevent event bubbling
                e.stopImmediatePropagation(); // COMP: Prevent other handlers from running
                console.log('🔍 DIAGNOSTIC: Visibility toggle changed');
                const isVisible = toggle.checked;
                console.log('🔍 DIAGNOSTIC: Visibility toggle checked:', isVisible);
                // COMP: Update UI and save immediately
                this.updateVisibilityStatus();
                await this.saveVisibility();
                console.log('🔍 DIAGNOSTIC: Visibility saved:', toggle.checked);
            }, { once: false, passive: false, capture: false });
            toggle.setAttribute('data-handler-attached', 'true');
            console.log('✅ VISIBILITY_SETTINGS: Visibility toggle handler attached');
        }
        // ROOT CAUSE FIX: Add click handler to visibility label/section to show Go Visible Modal when toggle is "No"
        const visibilityLabel = document.getElementById('visibility-label');
        const visibilitySettingItem = document.getElementById('visibility-setting-item');
        const visibilityClickTarget = visibilityLabel || visibilitySettingItem;
        if (visibilityClickTarget && this.visibilityToggle) {
            // Remove existing listener if any
            const newTarget = visibilityClickTarget.cloneNode(true);
            if (visibilityClickTarget.parentNode) {
                visibilityClickTarget.parentNode.replaceChild(newTarget, visibilityClickTarget);
            }
            const toggleRef = this.visibilityToggle; // Store reference for closure
            newTarget.addEventListener('click', (e) => {
                // Only show modal if clicking on label/section (not the toggle itself)
                if (toggleRef && e.target !== toggleRef && !toggleRef.contains(e.target)) {
                    const isVisible = toggleRef.checked;
                    if (!isVisible) {
                        // Show Go Visible Modal
                        const win = window;
                        if (win.showGoVisibleModal) {
                            win.showGoVisibleModal();
                        }
                        else if (win.openGoVisibleModal) {
                            win.openGoVisibleModal();
                        }
                        else {
                            // Fallback: Toggle visibility directly
                            if (toggleRef) {
                                toggleRef.checked = true;
                                this.updateVisibilityStatus();
                                this.saveVisibility();
                            }
                        }
                    }
                }
            });
            console.log('✅ VISIBILITY_SETTINGS: Visibility label click handler attached');
        }
        // Status select
        if (this.statusSelect) {
            // Check if already attached
            if (this.statusSelect.getAttribute('data-handler-attached') === 'true') {
                return;
            }
            // Store current value before cloning
            const currentValue = this.statusSelect.value;
            // Clone element to remove existing listeners
            const newSelect = this.statusSelect.cloneNode(true);
            newSelect.value = currentValue;
            if (this.statusSelect.parentNode) {
                this.statusSelect.parentNode.replaceChild(newSelect, this.statusSelect);
            }
            this.statusSelect = newSelect;
            this.statusSelect.addEventListener('change', () => {
                this.saveStatus();
            });
            this.statusSelect.setAttribute('data-handler-attached', 'true');
        }
        // Aura color picker - update hex field (without #)
        if (this.auraColorPicker) {
            // Clone element to remove existing listeners
            const newPicker = this.auraColorPicker.cloneNode(true);
            if (this.auraColorPicker.parentNode) {
                this.auraColorPicker.parentNode.replaceChild(newPicker, this.auraColorPicker);
            }
            this.auraColorPicker = newPicker;
            this.auraColorPicker.addEventListener('input', (e) => {
                const target = e.target;
                const hex = target.value.substring(1).toUpperCase(); // Remove # prefix
                if (this.auraColorHex) {
                    this.auraColorHex.value = hex;
                }
                this.saveAura();
            });
            this.auraColorPicker.setAttribute('data-handler-attached', 'true');
        }
        // Aura color hex input - format is 6 chars without # (prefix shown separately)
        if (this.auraColorHex) {
            // Clone element to remove existing listeners
            const newHex = this.auraColorHex.cloneNode(true);
            if (this.auraColorHex.parentNode) {
                this.auraColorHex.parentNode.replaceChild(newHex, this.auraColorHex);
            }
            this.auraColorHex = newHex;
            this.auraColorHex.addEventListener('input', (e) => {
                const target = e.target;
                let hex = target.value.toUpperCase();
                // Remove any non-hex characters
                hex = hex.replace(/[^0-9A-F]/g, '');
                // Limit to 6 hex digits
                hex = hex.substring(0, 6);
                target.value = hex;
                if (/^[0-9A-F]{6}$/i.test(hex) && this.auraColorPicker) {
                    this.auraColorPicker.value = '#' + hex;
                    this.saveAura();
                }
            });
            this.auraColorHex.setAttribute('data-handler-attached', 'true');
        }
        // Aura intensity slider
        if (this.auraIntensitySlider && this.auraIntensityValue) {
            // Clone element to remove existing listeners
            const newSlider = this.auraIntensitySlider.cloneNode(true);
            if (this.auraIntensitySlider.parentNode) {
                this.auraIntensitySlider.parentNode.replaceChild(newSlider, this.auraIntensitySlider);
            }
            this.auraIntensitySlider = newSlider;
            this.auraIntensitySlider.addEventListener('input', (e) => {
                const target = e.target;
                if (this.auraIntensityValue) {
                    this.auraIntensityValue.textContent = target.value;
                }
                this.saveAura();
            });
            this.auraIntensitySlider.setAttribute('data-handler-attached', 'true');
        }
        // Display name save
        if (this.displayNameSaveBtn) {
            this.displayNameSaveBtn.addEventListener('click', () => {
                this.saveDisplayName();
            });
        }
        // Display name reset
        if (this.displayNameResetBtn) {
            this.displayNameResetBtn.addEventListener('click', () => {
                this.resetDisplayName();
            });
        }
        // Theme toggle - COMP: Fix theme toggle functionality
        if (this.themeToggle) {
            // Check if already attached
            if (this.themeToggle.getAttribute('data-handler-attached') === 'true') {
                console.log('✅ VISIBILITY_SETTINGS: Theme toggle handler already attached, skipping');
                return;
            }
            // Store current checked state before cloning
            const wasChecked = this.themeToggle.checked;
            // Clone element to remove existing listeners
            const newToggle = this.themeToggle.cloneNode(true);
            newToggle.checked = wasChecked;
            if (this.themeToggle.parentNode) {
                this.themeToggle.parentNode.replaceChild(newToggle, this.themeToggle);
            }
            this.themeToggle = newToggle;
            const toggle = this.themeToggle; // Store reference for callback
            // ROOT CAUSE FIX: Track if we're programmatically setting the toggle to prevent save loops
            let isProgrammaticChange = false;
            // Attach fresh event listener
            toggle.addEventListener('change', async (e) => {
                // COMP: CRITICAL FIX - Ensure this is the theme toggle, not visibility toggle
                if (e.target !== toggle || toggle.id !== 'theme-toggle') {
                    console.warn('⚠️ VISIBILITY_SETTINGS: Ignoring change event - wrong target');
                    return;
                }
                // ROOT CAUSE FIX: Ignore change events that are programmatic (from loadSettings)
                if (isProgrammaticChange) {
                    console.log('🔍 DIAGNOSTIC: Ignoring programmatic theme toggle change');
                    isProgrammaticChange = false;
                    return;
                }
                e.stopPropagation();
                e.stopImmediatePropagation(); // COMP: Prevent other handlers from running
                console.log('🔍 DIAGNOSTIC: Settings tab theme toggle changed (user action)');
                const beforeTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
                console.log('🔍 DIAGNOSTIC: Theme before change:', beforeTheme);
                // COMP: Save theme and apply immediately - DO NOT touch visibility
                await this.saveTheme();
                this.updateThemeStatus();
                const afterTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
                console.log('🔍 DIAGNOSTIC: Theme after change:', afterTheme);
                console.log('🔍 DIAGNOSTIC: Theme changed:', beforeTheme !== afterTheme ? 'YES ✅' : 'NO ❌');
            }, { once: false, passive: false, capture: false });
            // ROOT CAUSE FIX: Store flag setter on toggle element for programmatic changes
            toggle._setProgrammaticChange = () => { isProgrammaticChange = true; };
            toggle.setAttribute('data-handler-attached', 'true');
            console.log('✅ VISIBILITY_SETTINGS: Theme toggle event listener attached');
        }
        else {
            console.warn('⚠️ VISIBILITY_SETTINGS: Theme toggle element not found when setting up event listeners');
        }
        console.log('✅ VISIBILITY_SETTINGS: Event listeners attached');
    }
    /**
     * Load current settings from storage/API
     */
    async loadSettings() {
        try {
            const stack = new Error().stack;
            console.log('🔍 VISIBILITY_SETTINGS: ========================================');
            console.log('📖 VISIBILITY_SETTINGS: Loading settings...');
            console.log('🔍 VISIBILITY_SETTINGS: Call stack:', stack?.split('\n').slice(1, 8).join('\n'));
            console.log('🔍 VISIBILITY_SETTINGS: ========================================');
            const currentUser = stateManagerInstance.getState('currentUser');
            if (!currentUser || !currentUser.id) {
                console.warn('⚠️ VISIBILITY_SETTINGS: No current user found');
                return;
            }
            // Load from Chrome storage first
            const storageData = await chrome.storage.local.get([
                'visibilityEnabled',
                'availability',
                'auraColor',
                'auraIntensity',
                'displayName'
            ]);
            // Load preferences using UserPreferencesManager (unified system)
            let isVisible = true;
            let status = 'AVAILABLE';
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                // Use UserPreferencesManager (preferred)
                const visiblePref = await userPreferencesManager.getPreference('isVisible');
                isVisible = typeof visiblePref === 'boolean' ? visiblePref : true;
                const statusPref = await userPreferencesManager.getPreference('globalAvailability');
                status = typeof statusPref === 'string' ? statusPref : 'AVAILABLE';
                console.log('✅ VISIBILITY_SETTINGS: Loaded preferences from UserPreferencesManager');
            }
            else {
                // Fallback to old system during transition
                console.log('⚠️ VISIBILITY_SETTINGS: UserPreferencesManager not available, using fallback loading');
                // Load visibility
                if (unifiedSettingsStorage && typeof unifiedSettingsStorage.getSetting === 'function') {
                    const dbValue = await unifiedSettingsStorage.getSetting('visibilityEnabled', null, { apiKey: 'isVisible', forceDatabase: true });
                    if (dbValue !== null && dbValue !== undefined) {
                        isVisible = dbValue === true;
                    }
                    else {
                        const storageData = await chrome.storage.local.get(['visibilityEnabled']);
                        if (storageData.visibilityEnabled !== undefined) {
                            isVisible = storageData.visibilityEnabled === true;
                        }
                        else if (currentUser) {
                            isVisible = currentUser.isVisible === true || currentUser.visibilityEnabled === true;
                        }
                    }
                }
                else {
                    const visibilityStorage = await chrome.storage.local.get(['visibilityEnabled']);
                    if (visibilityStorage.visibilityEnabled !== undefined) {
                        isVisible = visibilityStorage.visibilityEnabled === true;
                    }
                    else if (currentUser) {
                        isVisible = currentUser.isVisible === true || currentUser.visibilityEnabled === true;
                    }
                }
                // Load status
                const statusPref = await (getSetting || this.getSettingFallback)('status', 'AVAILABLE', { apiKey: 'status' });
                status = typeof statusPref === 'string' ? statusPref : 'AVAILABLE';
            }
            // Set visibility toggle
            if (this.visibilityToggle) {
                this.visibilityToggle.checked = isVisible;
                console.log('✅ VISIBILITY_SETTINGS: Visibility toggle set to:', isVisible ? 'Yes (checked)' : 'No (unchecked)');
                this.updateVisibilityStatus();
            }
            this.originalValues.visibility = isVisible;
            if (this.statusSelect) {
                this.statusSelect.value = status;
            }
            this.originalValues.status = status;
            // Aura color - normalize to #XXXXXX format, then extract hex without #
            let auraColor = storageData.auraColor || currentUser.auraColor || '#98d416';
            // Normalize to #XXXXXX format
            if (!auraColor.startsWith('#')) {
                auraColor = '#' + auraColor.replace(/#/g, '');
            }
            auraColor = auraColor.substring(0, 7).toUpperCase();
            if (auraColor.length < 7) {
                const digits = auraColor.substring(1) || '98D416';
                auraColor = '#' + digits.padEnd(6, '0').substring(0, 6);
            }
            if (this.auraColorPicker) {
                this.auraColorPicker.value = auraColor;
            }
            if (this.auraColorHex) {
                this.auraColorHex.value = auraColor.substring(1); // Store without # prefix
            }
            this.originalValues.auraColor = auraColor;
            // Aura intensity (already loaded above if UserPreferencesManager available)
            let auraIntensity = 0.5;
            if (!userPreferencesManager || !userPreferencesManager.isInitialized) {
                auraIntensity = storageData.auraIntensity || currentUser.auraIntensity || 0.5;
            }
            if (this.auraIntensitySlider) {
                this.auraIntensitySlider.value = String(auraIntensity);
            }
            if (this.auraIntensityValue) {
                this.auraIntensityValue.textContent = String(auraIntensity);
            }
            this.originalValues.auraIntensity = auraIntensity;
            // Display name
            // FIX: Don't use currentUser.name as fallback - only use displayName
            const displayName = storageData.displayName || currentUser.displayName || '';
            if (this.displayNameInput) {
                this.displayNameInput.value = displayName;
            }
            this.originalValues.displayName = displayName;
            // Theme - ROOT CAUSE FIX: If UserPreferencesManager is available, DON'T load theme here
            // Let UserPreferencesManager handle theme loading - it has proper priority logic
            // Only load theme if UserPreferencesManager is NOT available (fallback mode)
            let theme = null;
            // Get current DOM theme BEFORE any changes
            const currentDOMThemeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
            console.log('🔍 VISIBILITY_SETTINGS: Current DOM theme BEFORE loadSettings:', currentDOMThemeBefore || 'NOT SET');
            // CRITICAL FIX: Check if UserPreferencesManager is available and initialized
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                console.log('🔍 VISIBILITY_SETTINGS: ========================================');
                console.log('ℹ️ VISIBILITY_SETTINGS: UserPreferencesManager is available - SKIPPING theme load');
                console.log('🔍 VISIBILITY_SETTINGS: UserPreferencesManager handles theme - we will NOT change it');
                console.log('🔍 VISIBILITY_SETTINGS: ========================================');
                // Don't load theme - UserPreferencesManager will handle it
                // Just sync the toggle with current DOM theme
                const currentDOMTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                if (currentDOMTheme === 'dark' || currentDOMTheme === 'light') {
                    theme = currentDOMTheme;
                    console.log('✅ VISIBILITY_SETTINGS: Syncing toggle with DOM theme (UserPreferencesManager is managing theme):', theme);
                }
                else {
                    // Try to get from UserPreferencesManager
                    try {
                        const prefTheme = await userPreferencesManager.getPreference('theme');
                        if (prefTheme === 'dark' || prefTheme === 'light') {
                            theme = prefTheme;
                            console.log('✅ VISIBILITY_SETTINGS: Got theme from UserPreferencesManager:', theme);
                        }
                    }
                    catch (error) {
                        console.warn('⚠️ VISIBILITY_SETTINGS: Error getting theme from UserPreferencesManager:', error);
                    }
                }
                // CRITICAL: Don't proceed to set DOM theme - UserPreferencesManager is managing it
            }
            else {
                // Fallback: Load theme if UserPreferencesManager is not available
                console.log('⚠️ VISIBILITY_SETTINGS: UserPreferencesManager not available - loading theme as fallback');
                // Step 0: Check current DOM theme first (most recent user action) - NEVER override if already set
                const currentDOMTheme = document.body.getAttribute('data-theme') ||
                    document.documentElement.getAttribute('data-theme');
                if (currentDOMTheme && (currentDOMTheme === 'dark' || currentDOMTheme === 'light')) {
                    theme = currentDOMTheme;
                    console.log('✅ VISIBILITY_SETTINGS: Using current DOM theme:', theme);
                }
                // Step 1: Check Chrome storage (fastest, most recent user preference)
                else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    try {
                        const chromeTheme = await chrome.storage.local.get(['theme']);
                        if (chromeTheme.theme === 'dark' || chromeTheme.theme === 'light') {
                            theme = chromeTheme.theme;
                            console.log('✅ VISIBILITY_SETTINGS: Theme loaded from Chrome storage:', theme);
                        }
                    }
                    catch (error) {
                        console.warn('⚠️ VISIBILITY_SETTINGS: Error reading Chrome storage for theme:', error);
                    }
                }
                // Step 2: Check database (source of truth) - CRITICAL FIX: forceDatabase=true
                if (!theme && unifiedSettingsStorage && typeof unifiedSettingsStorage.getSetting === 'function') {
                    const dbTheme = await unifiedSettingsStorage.getSetting('theme', null, { skipApi: false, forceDatabase: true });
                    // CRITICAL FIX: Only use database value if it's explicitly set (not null/undefined)
                    if (dbTheme === 'dark' || dbTheme === 'light') {
                        theme = dbTheme;
                        console.log('✅ VISIBILITY_SETTINGS: Theme loaded from database:', theme);
                    }
                }
                else if (getSetting && !theme) {
                    const settingTheme = await getSetting('theme', null, { forceDatabase: true });
                    if (settingTheme === 'dark' || settingTheme === 'light') {
                        theme = settingTheme;
                    }
                }
            }
            // ROOT CAUSE FIX: Only set theme if UserPreferencesManager is NOT managing it
            // If UserPreferencesManager is available, we already handled theme above and should NOT set DOM
            if (theme && (!userPreferencesManager || !userPreferencesManager.isInitialized)) {
                const existingDOMTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                // CRITICAL: If DOM is already 'dark' and we're trying to set 'light', DON'T override
                if (existingDOMTheme === 'dark' && theme === 'light') {
                    console.warn('🚫 VISIBILITY_SETTINGS: BLOCKING theme reset from dark to light - preserving DOM theme');
                    theme = 'dark'; // Use DOM theme instead
                }
                // Only set DOM if it's different from current (prevents unnecessary updates)
                if (existingDOMTheme !== theme) {
                    const stack = new Error().stack;
                    console.log('🔍 VISIBILITY_SETTINGS: ========================================');
                    console.log(`🔧 VISIBILITY_SETTINGS: Setting DOM theme to: ${theme} (was: ${existingDOMTheme || 'NOT SET'})`);
                    console.log('🔍 VISIBILITY_SETTINGS: Call stack:', stack?.split('\n').slice(1, 8).join('\n'));
                    console.log('🔍 VISIBILITY_SETTINGS: ========================================');
                    await chrome.storage.local.set({ theme: theme });
                    document.documentElement.setAttribute('data-theme', theme);
                    document.body.setAttribute('data-theme', theme);
                }
                else {
                    console.log(`ℹ️ VISIBILITY_SETTINGS: DOM theme already matches: ${theme}`);
                }
            }
            else if (userPreferencesManager && userPreferencesManager.isInitialized) {
                // UserPreferencesManager is managing theme - DO NOT SET DOM
                console.log('🔍 VISIBILITY_SETTINGS: UserPreferencesManager is managing theme - NOT setting DOM theme');
                const finalDOMTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                console.log('🔍 VISIBILITY_SETTINGS: Final DOM theme (preserved):', finalDOMTheme || 'NOT SET');
            }
            else {
                // No theme found - don't set anything, let UserPreferencesManager handle it
                console.log('ℹ️ VISIBILITY_SETTINGS: No theme found in any source - UserPreferencesManager will handle default');
                // Don't set theme to 'light' - this prevents overriding existing dark theme
            }
            // CRITICAL FIX: Set toggle state BEFORE updateThemeStatus to ensure correct initial state
            // ROOT CAUSE FIX: Coordinate toggle with current theme - sync toggle state with actual theme
            if (this.themeToggle) {
                // Get actual current theme from DOM (may differ from loaded theme if user changed it)
                const actualTheme = document.body.getAttribute('data-theme') ||
                    document.documentElement.getAttribute('data-theme') ||
                    (theme || 'light'); // Only use theme if found, otherwise check DOM, then default
                const shouldBeDark = actualTheme === 'dark';
                // ROOT CAUSE FIX: Mark as programmatic change to prevent saveTheme() from being called
                if (this.themeToggle._setProgrammaticChange) {
                    this.themeToggle._setProgrammaticChange();
                }
                this.themeToggle.checked = shouldBeDark;
                console.log('🔧 VISIBILITY_SETTINGS: Theme toggle coordinated with current theme:', actualTheme, 'toggle checked:', shouldBeDark);
                // Update slider position immediately to reflect actual theme
                this.updateThemeStatus();
            }
            // Only set originalValues.theme if we actually found a theme
            if (theme) {
                this.originalValues.theme = theme;
            }
            console.log('✅ VISIBILITY_SETTINGS: Settings loaded');
        }
        catch (error) {
            console.error('❌ VISIBILITY_SETTINGS: Failed to load settings:', error);
        }
    }
    /**
     * Update visibility status text and toggle slider
     */
    updateVisibilityStatus() {
        if (this.visibilityToggle) {
            const isChecked = this.visibilityToggle.checked;
            const slider = document.getElementById('visibility-toggle-slider');
            // Update text labels
            const labels = document.querySelectorAll('#visibility-toggle-slider').length > 0
                ? document.querySelectorAll('label[for="visibility-toggle"] ~ span, #visibility-status-text')
                : [];
            // Update toggle slider background
            if (slider) {
                slider.style.backgroundColor = isChecked ? '#007bff' : '#ccc';
                const sliderCircle = slider.querySelector('span');
                if (sliderCircle) {
                    sliderCircle.style.transform = isChecked ? 'translateX(24px)' : 'translateX(0)';
                }
            }
            // Update Yes/No text
            const noLabel = this.visibilityToggle.parentElement?.previousElementSibling;
            const yesLabel = this.visibilityToggle.parentElement?.nextElementSibling;
            if (noLabel)
                noLabel.style.color = isChecked ? '#666' : '#007bff';
            if (yesLabel)
                yesLabel.style.color = isChecked ? '#007bff' : '#666';
        }
    }
    /**
     * Save visibility setting (ROOT CAUSE FIX: Use unified storage and update stateManagerInstance.getState("currentUser") as User | undefined)
     */
    async saveVisibility() {
        try {
            if (!this.visibilityToggle) {
                console.warn('⚠️ VISIBILITY_SETTINGS: Visibility toggle not found');
                return;
            }
            const isVisible = this.visibilityToggle.checked;
            // Use UserPreferencesManager (unified preference system)
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                console.log('✅ VISIBILITY_SETTINGS: Using UserPreferencesManager to save visibility');
                await userPreferencesManager.savePreference('isVisible', isVisible);
            }
            else if (typeof saveSetting === 'function') {
                // Fallback to old system during transition
                console.log('⚠️ VISIBILITY_SETTINGS: UserPreferencesManager not available, using saveSetting fallback');
                await saveSetting('visibilityEnabled', isVisible, { apiKey: 'isVisible' });
            }
            else {
                // Fallback to direct storage
                console.log('⚠️ VISIBILITY_SETTINGS: Using Chrome storage fallback for visibility');
                await chrome.storage.local.set({ visibilityEnabled: isVisible });
            }
            // CRITICAL FIX: Update currentUser in StateManager immediately for other components
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser) {
                currentUser.isVisible = isVisible;
                currentUser.visibilityEnabled = isVisible;
                stateManagerInstance.setState('currentUser', currentUser);
            }
            // CRITICAL FIX: Refresh visibility avatars to reflect the change
            const visibilityManagerInstance = this.getVisibilityManagerInstance();
            if (visibilityManagerInstance && typeof visibilityManagerInstance.refreshVisibilityAvatars === 'function') {
                const currentUrlData = stateManagerInstance.getState('currentUrlData');
                const currentPageId = currentUrlData?.pageId;
                if (currentPageId) {
                    console.log('🔧 VISIBILITY_SETTINGS: Refreshing visibility avatars after visibility change');
                    await visibilityManagerInstance.refreshVisibilityAvatars(currentPageId);
                }
            }
            // CRITICAL FIX: Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent('visibilityChanged', {
                detail: { isVisible, visibilityEnabled: isVisible }
            }));
            console.log('✅ VISIBILITY_SETTINGS: Visibility saved:', isVisible);
        }
        catch (error) {
            console.error('❌ VISIBILITY_SETTINGS: Failed to save visibility:', error);
        }
    }
    /**
     * Save status setting (ROOT CAUSE FIX: Use unified storage)
     */
    async saveStatus() {
        try {
            if (!this.statusSelect) {
                console.warn('⚠️ VISIBILITY_SETTINGS: Status select not available');
                return;
            }
            const status = this.statusSelect.value;
            // Use UserPreferencesManager (unified preference system)
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                console.log('✅ VISIBILITY_SETTINGS: Using UserPreferencesManager to save availability');
                await userPreferencesManager.savePreference('globalAvailability', status);
            }
            else if (saveSetting) {
                // Fallback to old system during transition
                console.log('⚠️ VISIBILITY_SETTINGS: UserPreferencesManager not available, using saveSetting fallback');
                await saveSetting('status', status);
                await saveSetting('availability', status, { skipApi: true });
            }
            else {
                // Fallback to direct storage
                await chrome.storage.local.set({ availability: status, status: status });
            }
            // Update currentUser in StateManager
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser) {
                currentUser.availability = status;
                // Type assertion needed since status can be broader than User.status type
                currentUser.status = status;
                stateManagerInstance.setState('currentUser', currentUser);
            }
            // Update via ProfileManager if available
            if (profileManager && typeof profileManager.updateAvailabilityEverywhere === 'function') {
                await profileManager.updateAvailabilityEverywhere(status);
            }
            // FIX: Refresh avatars to update status dots
            const visibilityManagerInstance = this.getVisibilityManagerInstance();
            if (visibilityManagerInstance && typeof visibilityManagerInstance.refreshVisibilityAvatars === 'function') {
                const currentUrlData = stateManagerInstance.getState('currentUrlData');
                const currentPageId = currentUrlData?.pageId || stateManagerInstance.getState('currentPageId');
                if (currentPageId && typeof currentPageId === 'string') {
                    await visibilityManagerInstance.refreshVisibilityAvatars(currentPageId);
                }
            }
            // FIX: Immediately refresh message avatars to update status dots
            if (refreshAllMessageAvatars && typeof refreshAllMessageAvatars === 'function') {
                console.log('🔧 VISIBILITY_SETTINGS: Immediately refreshing message avatars for status update');
                await refreshAllMessageAvatars();
            }
            // FIX: Dispatch event to trigger avatar updates
            window.dispatchEvent(new CustomEvent('statusChanged', {
                detail: { status, availability: status }
            }));
            // FIX: Refresh profile avatar status dot
            if (profileManager && typeof profileManager.updateUserAvatar === 'function') {
                await profileManager.updateUserAvatar();
            }
            console.log('✅ VISIBILITY_SETTINGS: Status saved:', status);
        }
        catch (error) {
            console.error('❌ VISIBILITY_SETTINGS: Failed to save status:', error);
        }
    }
    /**
     * Save aura settings (ROOT CAUSE FIX: Use unified storage)
     */
    async saveAura() {
        try {
            if (!this.auraColorPicker || !this.auraIntensitySlider) {
                console.warn('⚠️ VISIBILITY_SETTINGS: Aura controls not available');
                return;
            }
            const auraColor = this.auraColorPicker.value;
            const auraIntensity = parseFloat(this.auraIntensitySlider.value);
            // Use UserPreferencesManager (unified preference system)
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                console.log('✅ VISIBILITY_SETTINGS: Using UserPreferencesManager to save aura');
                await userPreferencesManager.savePreference('auraColor', auraColor);
                await userPreferencesManager.savePreference('auraIntensity', auraIntensity);
            }
            else if (saveSettings) {
                // Fallback to old system during transition
                console.log('⚠️ VISIBILITY_SETTINGS: UserPreferencesManager not available, using saveSettings fallback');
                await saveSettings({
                    auraColor: auraColor,
                    auraIntensity: auraIntensity
                });
            }
            else {
                // Fallback to direct storage
                await chrome.storage.local.set({
                    auraColor: auraColor,
                    auraIntensity: auraIntensity
                });
            }
            // Update currentUser in StateManager
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser) {
                currentUser.auraColor = auraColor;
                currentUser.auraIntensity = auraIntensity;
                stateManagerInstance.setState('currentUser', currentUser);
            }
            // Update via ProfileManager if available
            if (profileManager && typeof profileManager.updateAuraColor === 'function') {
                await profileManager.updateAuraColor(auraColor);
            }
            console.log('✅ VISIBILITY_SETTINGS: Aura saved:', { auraColor, auraIntensity });
        }
        catch (error) {
            console.error('❌ VISIBILITY_SETTINGS: Failed to save aura:', error);
        }
    }
    /**
     * Save display name
     */
    async saveDisplayName() {
        try {
            if (!this.displayNameInput) {
                console.warn('⚠️ VISIBILITY_SETTINGS: Display name input not available');
                return;
            }
            const displayName = this.displayNameInput.value.trim();
            // ROOT CAUSE FIX: Min 4, max 16 chars, null is ok (updated from 20)
            if (displayName.length > 0) {
                if (displayName.length < 4) {
                    alert('Display name must be at least 4 characters');
                    return;
                }
                if (displayName.length > 16) {
                    alert('Display name must be 16 characters or less');
                    return;
                }
            }
            await chrome.storage.local.set({ displayName: displayName });
            // Update currentUser in StateManager
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser) {
                currentUser.name = displayName;
                currentUser.displayName = displayName;
                stateManagerInstance.setState('currentUser', currentUser);
            }
            // Update UI if ProfileManager available
            if (profileManager && typeof profileManager.updateUserAvatar === 'function') {
                await profileManager.updateUserAvatar();
            }
            this.originalValues.displayName = displayName;
            console.log('✅ VISIBILITY_SETTINGS: Display name saved:', displayName);
        }
        catch (error) {
            console.error('❌ VISIBILITY_SETTINGS: Failed to save display name:', error);
        }
    }
    /**
     * Reset display name to original
     */
    resetDisplayName() {
        if (this.displayNameInput) {
            this.displayNameInput.value = this.originalValues.displayName || '';
            console.log('↩️ VISIBILITY_SETTINGS: Display name reset');
        }
    }
    /**
     * Update theme status text and toggle slider
     */
    updateThemeStatus() {
        if (this.themeToggle) {
            const isDark = this.themeToggle.checked;
            const slider = document.getElementById('theme-toggle-slider');
            // Update toggle slider background
            if (slider) {
                slider.style.backgroundColor = isDark ? '#007bff' : '#ccc';
                const sliderCircle = slider.querySelector('span');
                if (sliderCircle) {
                    sliderCircle.style.transform = isDark ? 'translateX(24px)' : 'translateX(0)';
                }
            }
            // Update Dark label (FIX: Always show "Dark" label, active color when dark mode, inactive when light mode)
            const darkLabel = document.getElementById('theme-dark-label');
            if (darkLabel) {
                // When theme is Light (toggle unchecked), Dark label should be inactive color
                // When theme is Dark (toggle checked), Dark label should be active color
                darkLabel.style.color = isDark ? '#007bff' : 'var(--text-secondary)';
                darkLabel.textContent = 'Dark'; // Always show "Dark"
                console.log('🔍 DIAGNOSTIC: Dark label updated - isDark:', isDark, 'color:', isDark ? '#007bff' : 'var(--text-secondary)');
            }
            else {
                console.warn('⚠️ VISIBILITY_SETTINGS: theme-dark-label element not found');
            }
        }
    }
    /**
     * Save theme setting (ROOT CAUSE FIX: Use unified storage and apply theme immediately)
     */
    async saveTheme() {
        try {
            const stack = new Error().stack;
            console.log('🔍 VISIBILITY_SETTINGS: ========================================');
            console.log('🔍 VISIBILITY_SETTINGS: saveTheme() CALLED');
            console.log('🔍 VISIBILITY_SETTINGS: Call stack:', stack?.split('\n').slice(1, 8).join('\n'));
            // ROOT CAUSE FIX: Don't rely solely on toggle state - check actual DOM theme first
            // This prevents saving 'light' when the actual theme is 'dark' due to toggle state mismatch
            const currentDOMTheme = document.body.getAttribute('data-theme') ||
                document.documentElement.getAttribute('data-theme');
            let theme;
            if (this.themeToggle) {
                // COMP: Use toggle state directly - user clicked it, trust the toggle
                theme = this.themeToggle.checked ? 'dark' : 'light';
                console.log('🔍 VISIBILITY_SETTINGS: Toggle state - checked:', this.themeToggle.checked, 'resolved theme:', theme);
            }
            else {
                // No toggle - use DOM theme or default
                theme = (currentDOMTheme === 'dark' || currentDOMTheme === 'light') ? currentDOMTheme : 'light';
                console.warn('⚠️ VISIBILITY_SETTINGS: Theme toggle not found, using DOM theme:', theme);
            }
            console.log('🔍 VISIBILITY_SETTINGS: Final theme to save:', theme);
            console.log('🔍 VISIBILITY_SETTINGS: Current DOM theme:', currentDOMTheme);
            console.log('🔍 VISIBILITY_SETTINGS: UserPreferencesManager available:', !!userPreferencesManager);
            console.log('🔍 VISIBILITY_SETTINGS: UserPreferencesManager initialized:', userPreferencesManager?.isInitialized);
            console.log('🔍 VISIBILITY_SETTINGS: ========================================');
            // COMP: Apply theme to DOM immediately before saving
            document.documentElement.setAttribute('data-theme', theme);
            document.body.setAttribute('data-theme', theme);
            console.log('✅ VISIBILITY_SETTINGS: Theme applied to DOM:', theme);
            // ROOT CAUSE FIX: NEVER fall back to updateThemeEverywhere - it causes theme resets
            // If UserPreferencesManager is not initialized, initialize it first
            if (!userPreferencesManager || !userPreferencesManager.isInitialized) {
                console.warn('⚠️ VISIBILITY_SETTINGS: UserPreferencesManager not initialized, initializing now...');
                const userId = window.currentUser?.id;
                if (userId && userPreferencesManager && typeof userPreferencesManager.initialize === 'function') {
                    await userPreferencesManager.initialize(userId);
                }
                else {
                    console.error('❌ VISIBILITY_SETTINGS: Cannot initialize UserPreferencesManager - no userId or manager');
                    // Don't save if we can't use the proper system - prevents database corruption
                    return;
                }
            }
            // CRITICAL FIX: Use UserPreferencesManager (unified preference system) - ensure it saves to both Chrome storage and database
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                console.log('✅ VISIBILITY_SETTINGS: Using UserPreferencesManager to save theme');
                // FIX: Save immediately (not batched) to ensure database save happens right away
                const saved = await userPreferencesManager.savePreference('theme', theme, { batch: false });
                console.log('🔍 DIAGNOSTIC: UserPreferencesManager savePreference result:', saved);
                // Verify it was saved to Chrome storage
                const chromeStorage = await chrome.storage.local.get(['theme']);
                console.log('🔍 DIAGNOSTIC: Theme in Chrome storage after save:', chromeStorage.theme);
            }
            else {
                // ROOT CAUSE FIX: If UserPreferencesManager still not available after initialization attempt, don't save
                // This prevents falling back to updateThemeEverywhere which causes theme resets
                console.error('❌ VISIBILITY_SETTINGS: UserPreferencesManager still not available after initialization attempt - aborting save');
                return;
            }
            // ROOT CAUSE FIX: Update ALL theme UI elements (settings tab AND profile menu) to keep them in sync
            // Update theme status text and slider
            this.updateThemeStatus();
            // Update profile menu theme icon/text (both IDs)
            const themeIconMenu = document.getElementById('theme-icon-menu');
            const themeTextMenu = document.getElementById('theme-text-menu');
            if (themeIconMenu) {
                themeIconMenu.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
            if (themeTextMenu) {
                themeTextMenu.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
            }
            this.originalValues.theme = theme;
            console.log('✅ VISIBILITY_SETTINGS: Theme saved and applied:', theme);
        }
        catch (error) {
            console.error('❌ VISIBILITY_SETTINGS: Failed to save theme:', error);
        }
    }
    /**
     * Get auth token for API calls
     */
    async getAuthToken() {
        try {
            const authData = await chrome.storage.local.get(['authToken', 'googleAccessToken']);
            return authData.authToken || authData.googleAccessToken || '';
        }
        catch (error) {
            console.warn('⚠️ VISIBILITY_SETTINGS: Failed to get auth token:', error);
            return '';
        }
    }
    /**
     * Fallback getSetting if unified storage not available
     */
    async getSettingFallback(key, defaultValue, options = {}) {
        try {
            const storageData = await chrome.storage.local.get([key]);
            if (storageData[key] !== undefined) {
                return String(storageData[key]);
            }
            return String(defaultValue);
        }
        catch (error) {
            console.warn(`⚠️ VISIBILITY_SETTINGS: Fallback getSetting failed for ${key}:`, error);
            return String(defaultValue);
        }
    }
}
// Create singleton instance
const visibilitySettingsManagerInstance = new VisibilitySettingsManager();
// CRITICAL FIX: Export setVisibilityStatus to window for Go Invisible button
if (typeof window !== 'undefined') {
    const win = window;
    win.setVisibilityStatus = async (visible) => {
        console.log('🔍 VISIBILITY_SETTINGS: setVisibilityStatus called with:', visible);
        let toggle = visibilitySettingsManagerInstance.visibilityToggle;
        if (!toggle) {
            console.warn('⚠️ VISIBILITY_SETTINGS: Visibility toggle not available, initializing...');
            await visibilitySettingsManagerInstance.initialize();
            toggle = visibilitySettingsManagerInstance.visibilityToggle;
        }
        if (toggle) {
            toggle.checked = visible;
            visibilitySettingsManagerInstance.updateVisibilityStatus();
            await visibilitySettingsManagerInstance.saveVisibility();
        }
        else {
            console.error('❌ VISIBILITY_SETTINGS: Failed to get visibility toggle after initialization');
        }
    };
    win.visibilitySettingsManager = visibilitySettingsManagerInstance;
    console.log('✅ VISIBILITY_SETTINGS: setVisibilityStatus exported to window');
    // ROOT CAUSE FIX: Listen for tab switches and re-initialize toggles when settings/visibility tab becomes visible
    // Use MutationObserver to watch for tab visibility changes
    const observeTabSwitches = () => {
        const settingsTab = document.getElementById('settings-tab');
        const visibilityTab = document.getElementById('visibility-tab');
        const checkAndReinitialize = () => {
            const settingsVisible = settingsTab && settingsTab.offsetParent !== null;
            const visibilityVisible = visibilityTab && visibilityTab.offsetParent !== null;
            if (settingsVisible || visibilityVisible) {
                console.log('🔧 VISIBILITY_SETTINGS: Settings/Visibility tab visible, ensuring event listeners...');
                visibilitySettingsManagerInstance.ensureEventListeners();
            }
        };
        // Watch for tab visibility changes
        if (settingsTab) {
            const observer = new MutationObserver(checkAndReinitialize);
            observer.observe(settingsTab, { attributes: true, attributeFilter: ['style', 'class'] });
            observer.observe(document.body, { childList: true, subtree: true });
        }
        // Also listen for click events on tab buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target && (target.id === 'settings-tab' || target.closest('#settings-tab') ||
                target.id === 'visibility-tab' || target.closest('#visibility-tab') ||
                target.dataset.tab === 'settings-tab' || target.dataset.tab === 'visibility-tab')) {
                setTimeout(checkAndReinitialize, 100); // Small delay to ensure DOM is updated
            }
        });
        console.log('✅ VISIBILITY_SETTINGS: Tab switch observer attached');
    };
    // Initialize observer when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeTabSwitches);
    }
    else {
        observeTabSwitches();
    }
}
// Export as ES6 module (pure - no window exports needed for re-launch)
export { VisibilitySettingsManager, visibilitySettingsManagerInstance };
export default VisibilitySettingsManager;

/**
 * AURA COLOR MODAL - Aura Color Management
 * Handles all aura color modal functionality
 */
import { Logger } from '../utils/Logger.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
// Note: MetaLayerAPI is not exported, using stateManagerInstance.getState('api') instead
import { AvatarUtils } from '../utils/AvatarUtils.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
// These will be injected or imported when available
let handleAuraChange;
let aurasIntegration;
let supabaseRealtimeClient;
let refreshVisibilityAvatars;
let refreshAllMessageAvatars;
let normalizeCurrentUrl;
let sendSupabaseMessage;
class AuraColorModal {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
        this.logger = new Logger();
    }
    /**
     * Initialize AuraColorModal
     */
    async initialize() {
        if (this.isInitialized) {
            this.log('WARN', 'AuraColorModal already initialized');
            return;
        }
        this.log('INFO', 'Initializing AuraColorModal...');
        try {
            // TODO: Initialize aura color systems here
            this.isInitialized = true;
            this.log('INFO', 'AuraColorModal initialized successfully');
        }
        catch (error) {
            this.log('ERROR', 'Failed to initialize AuraColorModal:', error);
            throw error;
        }
    }
    /**
     * Logging utility
     */
    log(level, message, ...args) {
        if (this.logLevel === 'SILENT')
            return;
        const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, SILENT: 4 };
        if (levels[level] <= levels[this.logLevel]) {
            console.log(`[AuraColorModal] [${level}] ${message}`, ...args);
        }
    }
}
// ===== AURA COLOR FUNCTIONS (Move from sidepanel.js) =====
// TODO: Move these functions from sidepanel.js:
// COMP METHOD: Get current user aura color from database (source of truth)
export async function getCurrentUserAvatarBgColor() {
    console.log('🎨 COMP METHOD: Fetching current aura color from database...');
    // COMP METHOD: Priority 1 - Check database via API (source of truth)
    const currentUser = stateManagerInstance.getState('currentUser');
    const api = stateManagerInstance.getState('api');
    if (currentUser && api) {
        const userId = currentUser.id;
        if (userId) {
            try {
                console.log('🎨 COMP METHOD: Fetching aura color from API for userId:', userId);
                const userData = await api.request(`/v1/users/${encodeURIComponent(userId)}`, {
                    method: 'GET',
                    allow404: true
                });
                // Use standardized auraColor field
                const apiAuraColor = userData.auraColor;
                if (apiAuraColor) {
                    const dbColor = apiAuraColor.startsWith('#') ? apiAuraColor : `#${apiAuraColor}`;
                    console.log('✅ COMP METHOD: Found aura color in database:', dbColor);
                    return dbColor;
                }
                else {
                    console.log('⚠️ COMP METHOD: No aura color in database response');
                }
            }
            catch (error) {
                console.warn('⚠️ COMP METHOD: Failed to fetch from database, using fallback:', error);
            }
        }
    }
    // COMP METHOD: Priority 2 - Check visibility data (real-time, may be more up-to-date)
    const currentVisibilityDataUnfiltered = stateManagerInstance.getState('currentVisibilityDataUnfiltered');
    if (currentVisibilityDataUnfiltered?.active) {
        const userId = currentUser?.id;
        if (userId) {
            const userInVisibility = currentVisibilityDataUnfiltered.active.find(u => String(u.id || u.userId) === String(userId));
            // Get aura color from visibility data (should be normalized to camelCase)
            const visibilityAuraColor = userInVisibility?.auraColor;
            if (visibilityAuraColor && visibilityAuraColor !== AVATAR_FALLBACK_COLOR) {
                console.log('✅ COMP METHOD: Found aura color in visibility data:', visibilityAuraColor);
                return visibilityAuraColor;
            }
        }
    }
    // Priority 3 - Check currentUser
    if (currentUser && currentUser.auraColor && currentUser.auraColor !== AVATAR_FALLBACK_COLOR) {
        console.log('✅ COMP METHOD: Found aura color in currentUser:', currentUser.auraColor);
        return currentUser.auraColor;
    }
    // COMP METHOD: Priority 4 - Fallback to generated color based on name
    if (currentUser) {
        const name = currentUser.name || 'User';
        const generatedColor = getAvatarColor(name);
        console.log('⚠️ COMP METHOD: Using generated fallback color:', generatedColor);
        return generatedColor;
    }
    // COMP METHOD: Final fallback
    const fallbackColor = AVATAR_FALLBACK_COLOR;
    console.log('⚠️ COMP METHOD: Using default fallback color:', fallbackColor);
    return fallbackColor;
}
export async function showColorPickerModal() {
    console.log('🎨 COMP METHOD: Opening color picker modal...');
    // Check if modal already exists and is visible
    const existingModal = document.getElementById('color-picker-modal');
    if (existingModal) {
        console.log('🎨 COMP METHOD: Modal already exists, showing it');
        existingModal.style.display = 'flex';
        // COMP METHOD: Reset button state in case it was stuck in "Saving..." from previous operation
        const saveBtn = document.getElementById('color-picker-save');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Color';
            console.log('✅ COMP METHOD: Reset save button state');
        }
        // COMP METHOD: Update the input with current database value
        const colorInput = document.getElementById('color-input');
        if (colorInput) {
            try {
                const currentColor = await getCurrentUserAvatarBgColor();
                const currentHex = currentColor.replace('#', '');
                colorInput.value = currentHex;
                updateColorPreview(currentHex);
                console.log('✅ COMP METHOD: Updated existing modal with database value:', currentColor);
            }
            catch (error) {
                console.error('❌ COMP METHOD: Error updating existing modal:', error);
            }
        }
        return;
    }
    // Create modal HTML
    const modalHTML = `
    <div class="color-picker-modal" id="color-picker-modal" style="display: flex;">
      <div class="color-picker-content">
        <div class="color-picker-header">
          <h3 class="color-picker-title">Change Aura Color</h3>
          <button class="color-picker-close" id="color-picker-close">&times;</button>
        </div>
        <div class="color-picker-input-group">
          <label class="color-picker-label" for="color-input">Hex Color (without #):</label>
          <input type="text" class="color-picker-input" id="color-input" placeholder="45B7D1" maxlength="6">
        </div>
        <div class="color-picker-preview">
          <div class="color-picker-preview-circle" id="color-preview-circle">D</div>
          <div class="color-picker-preview-text" id="color-preview-text">Preview</div>
        </div>
        <div class="color-picker-buttons">
          <button class="color-picker-btn" id="color-picker-reset">Reset to Default</button>
          <button class="color-picker-btn primary" id="color-picker-save">Save Color</button>
        </div>
      </div>
    </div>
  `;
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    // Wait for DOM to be ready before attaching event listeners
    setTimeout(async () => {
        const modal = document.getElementById('color-picker-modal');
        const colorInput = document.getElementById('color-input');
        const previewCircle = document.getElementById('color-preview-circle');
        const previewText = document.getElementById('color-preview-text');
        const closeBtn = document.getElementById('color-picker-close');
        const resetBtn = document.getElementById('color-picker-reset');
        const saveBtn = document.getElementById('color-picker-save');
        if (!modal || !colorInput || !previewCircle || !previewText || !closeBtn || !resetBtn || !saveBtn) {
            console.error('❌ Modal elements not found after creation');
            return;
        }
        // COMP METHOD: Get current color from database and set initial values
        try {
            const currentColor = await getCurrentUserAvatarBgColor();
            const currentHex = currentColor.replace('#', '');
            colorInput.value = currentHex;
            updateColorPreview(currentHex);
            console.log('✅ COMP METHOD: Modal initialized with database aura color:', currentColor);
        }
        catch (error) {
            console.error('❌ COMP METHOD: Error fetching current aura color:', error);
            // Fallback to default
            const fallbackColor = AVATAR_FALLBACK_COLOR;
            const currentHex = fallbackColor.replace('#', '');
            colorInput.value = currentHex;
            updateColorPreview(currentHex);
        }
        // Remove any existing event listeners to prevent duplicates
        const newColorInput = colorInput.cloneNode(true);
        if (colorInput.parentNode) {
            colorInput.parentNode.replaceChild(newColorInput, colorInput);
        }
        // Event listeners
        newColorInput.addEventListener('input', (e) => {
            const target = e.target;
            const hex = target.value.replace('#', '');
            updateColorPreview(hex);
        });
        closeBtn.addEventListener('click', closeColorPickerModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal)
                closeColorPickerModal();
        });
        resetBtn.addEventListener('click', () => {
            // Get the dynamic default color (based on user's name) - use stateManagerInstance.getState("currentUser") as User | undefined
            let defaultColor = AVATAR_FALLBACK_COLOR; // Fallback
            const user = stateManagerInstance.getState("currentUser");
            if (user) {
                const name = user.userMetadata?.full_name || user.name || 'User';
                defaultColor = getAvatarColor(name);
            }
            const defaultHex = defaultColor.replace('#', '');
            newColorInput.value = defaultHex;
            updateColorPreview(defaultHex);
        });
        // COMP METHOD: Save button click handler with timeout and proper state management
        saveBtn.addEventListener('click', async () => {
            console.log('🎨 COMP METHOD: Save button clicked');
            // COMP METHOD: Prevent double-clicks by checking if already saving
            if (saveBtn.disabled && saveBtn.textContent === 'Saving...') {
                console.log('⚠️ COMP METHOD: Save operation already in progress, ignoring click');
                return;
            }
            // Disable save button to prevent double-clicks
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            // COMP METHOD: Set timeout to prevent hanging (30 seconds max)
            const timeoutId = setTimeout(() => {
                console.error('❌ COMP METHOD: Save operation timed out after 30 seconds');
                alert('Save operation timed out. Please try again.');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Color';
            }, 30000);
            try {
                const hex = newColorInput.value.replace('#', '').trim();
                // COMP METHOD: Validate hex color
                if (!isValidHex(hex)) {
                    clearTimeout(timeoutId);
                    alert('Please enter a valid 6-digit hex color (e.g., 45B7D1)');
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Color';
                    return;
                }
                // COMP METHOD: Format aura color properly
                const formattedColor = hex.startsWith('#') ? hex : `#${hex}`;
                console.log('🎨 COMP METHOD: Saving aura color:', formattedColor);
                // COMP METHOD: Get user ID
                const currentUser = stateManagerInstance.getState('currentUser');
                const userId = currentUser?.id;
                if (!userId) {
                    clearTimeout(timeoutId);
                    console.error('❌ COMP METHOD: No user ID available for saving aura color');
                    alert('Error: User not logged in. Please refresh the page.');
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Color';
                    return;
                }
                // COMP METHOD: Save aura color to database first (source of truth) with timeout
                console.log('🎨 COMP METHOD: Saving to database for userId:', userId);
                try {
                    const api = stateManagerInstance.getState('api');
                    if (!api) {
                        clearTimeout(timeoutId);
                        console.error('❌ COMP METHOD: API not available');
                        alert('Error: API not available. Please refresh the page.');
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Save Color';
                        return;
                    }
                    const savePromise = api.request(`/v1/users/${encodeURIComponent(userId)}/aura-color`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            auraColor: formattedColor
                        })
                    });
                    // COMP METHOD: Race against timeout
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Database save timeout')), 15000));
                    const result = await Promise.race([savePromise, timeoutPromise]);
                    clearTimeout(timeoutId);
                    console.log('✅ COMP METHOD: Aura color saved to database:', result);
                }
                catch (error) {
                    clearTimeout(timeoutId);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error('❌ COMP METHOD: Error saving aura color to database:', error);
                    console.error('❌ COMP METHOD: Error details:', errorMessage);
                    alert(`Error saving aura color: ${errorMessage || 'Unknown error'}`);
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Color';
                    return;
                }
                // Update currentUser in StateManager immediately
                if (currentUser) {
                    currentUser.auraColor = formattedColor;
                    stateManagerInstance.setState('currentUser', currentUser);
                    console.log('✅ COMP METHOD: Updated currentUser.auraColor');
                }
                // COMP METHOD: Save to storage
                stateManagerInstance.setState('userAvatarBgColor', formattedColor);
                // CRITICAL FIX: Cache in Chrome storage for instant display on next load
                // Chrome storage persists as long as Chrome profile is logged in
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    try {
                        await new Promise((resolve) => {
                            chrome.storage.local.set({ userAuraColor: formattedColor, auraColor: formattedColor }, () => {
                                console.log('💾 AURA_COLOR_MODAL: Cached aura color in Chrome storage:', formattedColor);
                                resolve();
                            });
                        });
                    }
                    catch (error) {
                        console.warn('⚠️ AURA_COLOR_MODAL: Could not cache to Chrome storage:', error);
                    }
                }
                // COMP METHOD: Update all UI elements (profile, message, visibility avatars) with timeout
                console.log('🔄 COMP METHOD: Updating all UI elements with new aura color');
                try {
                    const updatePromise = updateUserAuraInUI(userId, formattedColor);
                    const updateTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('UI update timeout')), 10000));
                    await Promise.race([updatePromise, updateTimeout]);
                    console.log('✅ COMP METHOD: UI update completed');
                    // COMP METHOD: Dispatch event to notify ProfileManager of aura color update
                    document.dispatchEvent(new CustomEvent('auraColorUpdated', {
                        detail: {
                            color: formattedColor,
                            user: stateManagerInstance.getState("currentUser"),
                            userId: userId
                        }
                    }));
                    console.log('✅ COMP METHOD: Dispatched auraColorUpdated event');
                }
                catch (error) {
                    console.warn('⚠️ COMP METHOD: UI update timed out or failed:', error);
                    // Continue anyway - database save was successful
                }
                // COMP METHOD: Trigger handleAuraChange immediately for local propagation
                // This ensures the change propagates even if broadcast fails or for same-user tabs
                if (typeof handleAuraChange === 'function') {
                    try {
                        await handleAuraChange({
                            userId: userId,
                            auraColor: formattedColor,
                            source: 'local_save'
                        });
                        console.log('✅ COMP METHOD: Local aura change propagation triggered');
                    }
                    catch (error) {
                        console.warn('⚠️ COMP METHOD: Failed to trigger local aura change propagation:', error);
                    }
                }
                // COMP METHOD: Send aura change via real-time system (non-blocking)
                if (aurasIntegration && aurasIntegration.isInitialized) {
                    try {
                        aurasIntegration.setAura(userId, formattedColor);
                        console.log('✅ COMP METHOD: Aura color set in aurasIntegration');
                    }
                    catch (error) {
                        console.warn('⚠️ COMP METHOD: Failed to set aura in aurasIntegration:', error);
                    }
                }
                // COMP METHOD: Broadcast aura change via WebSocket (non-blocking)
                try {
                    broadcastAuraChange(formattedColor).catch(error => {
                        console.warn('⚠️ COMP METHOD: Failed to broadcast aura change:', error);
                    });
                }
                catch (error) {
                    console.warn('⚠️ COMP METHOD: Failed to broadcast aura change:', error);
                }
                // COMP METHOD: Trigger visibility refresh after a delay to pick up backend update
                // This ensures other users' tabs will see the change even if broadcast fails
                setTimeout(async () => {
                    console.log('🔄 COMP METHOD: Refreshing visibility to pick up backend aura color update');
                    if (typeof refreshVisibilityAvatars === 'function') {
                        try {
                            await refreshVisibilityAvatars();
                            console.log('✅ COMP METHOD: Visibility refreshed with backend aura color');
                        }
                        catch (error) {
                            console.warn('⚠️ COMP METHOD: Visibility refresh failed:', error);
                        }
                    }
                }, 2000); // COMP METHOD: Wait 2 seconds for backend to update user_presence
                // COMP METHOD: Close modal after successful save
                console.log('✅ COMP METHOD: Aura color change complete, closing modal');
                closeColorPickerModal();
            }
            catch (error) {
                clearTimeout(timeoutId);
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('❌ COMP METHOD: Unexpected error in save handler:', error);
                alert(`Error: ${errorMessage || 'Unknown error occurred'}`);
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Color';
            }
        });
        // Add click outside to close modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeColorPickerModal();
            }
        });
        // Add escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeColorPickerModal();
            }
        });
        // Focus the input
        newColorInput.focus();
        newColorInput.select();
        console.log('🎨 Modal setup complete');
    }, 50);
}
export function closeColorPickerModal() {
    console.log('🎨 COMP METHOD: Closing color picker modal...');
    const modal = document.getElementById('color-picker-modal');
    if (modal) {
        modal.style.display = 'none';
        // COMP METHOD: Reset button state when closing modal
        const saveBtn = document.getElementById('color-picker-save');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Color';
            console.log('✅ COMP METHOD: Reset save button state on modal close');
        }
    }
}
// Color Picker Modal Functions
// Global function for updating color preview
export function updateColorPreview(hex) {
    console.log('🔍 Updating preview with hex:', hex);
    const previewCircle = document.getElementById('color-preview-circle');
    const previewText = document.getElementById('color-preview-text');
    if (!previewCircle) {
        console.error('❌ Preview circle not found');
        return;
    }
    if (!previewText) {
        console.error('❌ Preview text not found');
        return;
    }
    if (isValidHex(hex)) {
        const color = '#' + hex;
        previewCircle.style.backgroundColor = color;
        previewText.textContent = color;
        console.log('✅ Preview updated with color:', color);
    }
    else {
        previewCircle.style.backgroundColor = '#cccccc';
        previewText.textContent = 'Invalid color';
        console.log('❌ Invalid hex color:', hex);
    }
}
// Global function to set custom avatar color for the current user
export async function setCustomAvatarColor(color) {
    if (!color || !color.startsWith('#')) {
        console.error('❌ Invalid color. Please provide a hex color (e.g., ' + AVATAR_FALLBACK_COLOR + ')');
        return;
    }
    console.log('🎨 SD1 FIX: Setting aura color via Supabase real-time:', color);
    // SD1 FIX: Save to Supabase database and broadcast via real-time
    if (supabaseRealtimeClient) {
        try {
            // Update user's aura color in Supabase database
            await supabaseRealtimeClient.broadcastAuraColorChange(color);
            console.log('✅ SD1 FIX: Aura color saved to Supabase and broadcasted');
            // Update local state
            stateManagerInstance.setState('customAvatarColor', color);
            // Refresh all avatars
            // Note: refreshAllAvatars needs to be imported or implemented
            // await refreshAllAvatars();
        }
        catch (error) {
            console.error('❌ SD1 FIX: Failed to save aura color to Supabase:', error);
        }
    }
    else {
        console.warn('⚠️ SD1 FIX: Supabase client not available, using local storage only');
        // Fallback to local storage
        stateManagerInstance.setState('customAvatarColor', color);
        // Note: refreshAllAvatars needs to be imported or implemented
        // await refreshAllAvatars();
    }
}
export async function resetUserAvatarBgColor() {
    // Reset to default aura color (no custom background color needed)
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser) {
        currentUser.auraColor = AVATAR_FALLBACK_COLOR; // Default white
        stateManagerInstance.setState('currentUser', currentUser);
    }
    // Remove from chrome storage
    // Note: removeStateMultiple needs to be imported or implemented
    // await removeStateMultiple(['userAvatarBgColor']);
    // Refresh all avatars (profile, message, and visibility)
    // Note: refreshAllAvatars needs to be imported or implemented
    // await refreshAllAvatars();
    // Broadcast aura color reset to other profiles
    try {
        chrome.runtime.sendMessage({
            type: 'AURA_COLOR_CHANGED',
            color: 'reset',
            userId: currentUser?.id,
            timestamp: Date.now()
        });
        console.log('📡 AURA: Broadcasted aura color reset to other profiles');
    }
    catch (error) {
        console.log('📡 AURA: Could not broadcast to other profiles:', error);
    }
}
export async function broadcastAuraColorChange(color) {
    if (supabaseRealtimeClient) {
        await supabaseRealtimeClient.broadcastAuraColorChange(color);
        console.log('🎨 SUPABASE: Aura color change broadcasted');
    }
}
// COMP METHOD: Update aura color in UI for all avatars (profile, message, visibility)
// COMP METHOD: skipVisibilityRefresh - if true, skips refreshVisibilityAvatars (already handled by caller)
export async function updateUserAuraInUI(userId, auraColor, skipVisibilityRefresh = false) {
    try {
        const currentUser = stateManagerInstance.getState('currentUser');
        console.log('🎨 AURA_UI_UPDATE: Starting aura color UI update:', {
            userId,
            auraColor,
            isCurrentUser: currentUser?.id === userId
        });
        // COMP METHOD: Update visibility data immediately so aura color propagates
        const currentVisibilityDataUnfiltered = stateManagerInstance.getState('currentVisibilityDataUnfiltered');
        if (currentVisibilityDataUnfiltered?.active) {
            const userInVisibility = currentVisibilityDataUnfiltered.active.find(u => String(u.id || u.userId) === String(userId));
            if (userInVisibility) {
                userInVisibility.auraColor = auraColor;
                console.log('✅ AURA_UI_UPDATE: Updated aura color in visibility data');
            }
        }
        const currentVisibilityData = stateManagerInstance.getState('currentVisibilityData');
        if (currentVisibilityData?.active) {
            const userInVisibility = currentVisibilityData.active.find(u => String(u.id || u.userId) === String(userId));
            if (userInVisibility) {
                userInVisibility.auraColor = auraColor;
            }
        }
        // Update currentUser aura color
        if (currentUser && currentUser.id === userId) {
            currentUser.auraColor = auraColor;
            stateManagerInstance.setState('currentUser', currentUser);
            console.log('✅ AURA_UI_UPDATE: Updated currentUser.auraColor');
        }
        // COMP METHOD: Update profile avatar if it's the current user (with debouncing)
        if (currentUser && String(currentUser.id) === String(userId)) {
            console.log('🎨 AURA_UI_UPDATE: Updating profile avatar for current user');
            const profileAvatarContainer = document.getElementById('user-avatar-container');
            if (profileAvatarContainer) {
                // Prevent multiple simultaneous updates
                let profileAvatarUpdateInProgress = stateManagerInstance.getState('profileAvatarUpdateInProgress');
                if (profileAvatarUpdateInProgress) {
                    console.log('⏳ AURA_UI_UPDATE: Profile avatar update already in progress, skipping');
                    return;
                }
                stateManagerInstance.setState('profileAvatarUpdateInProgress', true);
                try {
                    // COMP METHOD: Use AvatarUtils.createUnifiedAvatar with await
                    if (AvatarUtils && typeof AvatarUtils.createUnifiedAvatar === 'function') {
                        const userData = {
                            id: currentUser.id,
                            userId: currentUser.id,
                            name: currentUser.name || currentUser.email?.split('@')[0] || 'User',
                            email: currentUser.email,
                            avatarUrl: currentUser.avatarUrl,
                            auraColor: auraColor,
                        };
                        const newProfileAvatarHTML = await AvatarUtils.createUnifiedAvatar(userData, 'profile', {
                            size: 24,
                            showAura: true,
                            showStatus: false
                        });
                        profileAvatarContainer.innerHTML = newProfileAvatarHTML;
                        console.log('✅ AURA_UI_UPDATE: Profile avatar updated with unified avatar structure');
                    }
                    else {
                        console.error('❌ AURA_UI_UPDATE: AvatarUtils.createUnifiedAvatar not available');
                    }
                }
                catch (error) {
                    console.error('❌ AURA_UI_UPDATE: Error updating profile avatar:', error);
                }
                finally {
                    stateManagerInstance.setState('profileAvatarUpdateInProgress', false);
                }
            }
        }
        // COMP METHOD: Refresh all message avatars to propagate aura color changes
        if (refreshAllMessageAvatars) {
            console.log('🔄 AURA_UI_UPDATE: Refreshing all message avatars with new aura color');
            await refreshAllMessageAvatars();
        }
        // COMP METHOD: Refresh visibility avatars
        // COMP METHOD: Skip if called from handleAuraChange (which already updates visibility via updateVisibleTab)
        // This prevents unnecessary DB fetches that could overwrite real-time cache updates
        if (!skipVisibilityRefresh && typeof refreshVisibilityAvatars === 'function') {
            console.log('🔄 AURA_UI_UPDATE: Refreshing visibility avatars');
            await refreshVisibilityAvatars();
        }
        else if (skipVisibilityRefresh) {
            console.log('🔄 AURA_UI_UPDATE: Skipping refreshVisibilityAvatars (already handled by handleAuraChange)');
        }
        console.log('✅ AURA_UI_UPDATE: Aura UI update completed successfully');
    }
    catch (error) {
        console.error('❌ AURA_UI_UPDATE: Error updating aura in UI:', error);
        stateManagerInstance.setState('profileAvatarUpdateInProgress', false);
    }
}
// Get the latest aura color from presence data for any user
function getLatestAuraColorFromPresence(userId) {
    try {
        // Check if we have presence data stored
        const currentPresenceData = stateManagerInstance.getState('currentPresenceData');
        const presenceData = stateManagerInstance.getState('presenceData');
        const presence = currentPresenceData || presenceData;
        if (presence && presence.active) {
            const user = presence.active.find(u => u.id === userId || u.userId === userId || u.email === userId);
            if (user && user.auraColor) {
                return user.auraColor;
            }
        }
        // Fallback: try to get from current visibility data
        const visibilityData = stateManagerInstance.getState('currentVisibilityData');
        if (visibilityData && visibilityData.active) {
            const user = visibilityData.active.find(u => u.id === userId || u.userId === userId);
            if (user && user.auraColor && typeof user.auraColor === 'string') {
                return user.auraColor;
            }
        }
        // Additional fallback: check if this is the current user and get from stored aura color
        const currentUser = stateManagerInstance.getState('currentUser');
        if (currentUser && currentUser.id === userId) {
            const storedAuraColor = currentUser.auraColor;
            if (storedAuraColor && storedAuraColor !== null && storedAuraColor !== 'null') {
                return storedAuraColor;
            }
        }
        return null;
    }
    catch (error) {
        console.error(`❌ GET_LATEST_AURA: Error getting latest aura color for ${userId}:`, error);
        return null;
    }
}
// ===== UNIFIED AVATAR SYSTEM =====
// This system ensures consistent avatar rendering across all contexts:
// - Profile header avatars
// - Message avatars  
// - Visibility list avatars
function getAvatarColor(name) {
    // Generate a consistent color based on the name (for message avatars)
    const colors = ['#FF6B6B', '#4ECDC4', AVATAR_FALLBACK_COLOR, '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}
// Function to update all message avatars with new aura color
function updateAllMessageAvatars(userId, auraColor) {
    console.log('🔍 AURA DEBUG: Updating message avatars for user:', userId, 'with color:', auraColor);
    // Find all message avatars for this user - try multiple selectors
    const messageAvatars = document.querySelectorAll(`
    .message-avatar[data-user-id="${userId}"],
    .avatar[data-user-id="${userId}"],
    .message[data-author-id="${userId}"] .message-avatar,
    .message[data-author-id="${userId}"] .avatar,
    .message[data-author-id="${userId}"] img[src*="googleusercontent.com"]
  `);
    console.log('🔍 AURA DEBUG: Found message avatars:', messageAvatars.length);
    // Also try to find avatars in messages by user email
    const allMessages = document.querySelectorAll('.message');
    let foundInMessages = 0;
    allMessages.forEach((message) => {
        const messageEl = message;
        const authorId = messageEl.dataset.authorId || (message.querySelector('[data-user-id]')?.dataset.userId);
        if (authorId === userId) {
            const avatar = message.querySelector('.message-avatar, .avatar');
            if (avatar) {
                foundInMessages++;
                console.log('🔍 AURA DEBUG: Found avatar in message:', avatar);
                updateAvatarAura(avatar, auraColor);
            }
        }
    });
    console.log('🔍 AURA DEBUG: Found avatars in messages:', foundInMessages);
    messageAvatars.forEach(avatar => {
        console.log('🔍 AURA DEBUG: Updating message avatar:', avatar);
        updateAvatarAura(avatar, auraColor);
    });
}
// Helper function to update a single avatar's aura
export function updateAvatarAura(avatar, auraColor) {
    // Update the aura color in the avatar's data attribute
    avatar.setAttribute('data-aura-color', auraColor);
    // Update the avatar's aura visual effect
    const auraElement = avatar.querySelector('.aura-effect');
    if (auraElement) {
        auraElement.style.boxShadow = `0 0 10px 3px ${auraColor}`;
    }
    else {
        // Create aura effect if it doesn't exist
        const aura = document.createElement('div');
        aura.className = 'aura-effect';
        aura.style.cssText = `
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      box-shadow: 0 0 10px 3px ${auraColor};
      pointer-events: none;
      z-index: -1;
    `;
        const avatarEl = avatar;
        avatarEl.style.position = 'relative';
        avatarEl.appendChild(aura);
    }
}
// Function to update all visibility avatars with new aura color
export function updateAllVisibilityAvatars(userId, auraColor) {
    console.log('🔍 AURA DEBUG: Updating visibility avatars for user:', userId, 'with color:', auraColor);
    // Find all visibility avatars for this user - try multiple selectors
    const visibilityAvatars = document.querySelectorAll(`
    .avatar[data-user-id="${userId}"],
    .user-avatar[data-user-id="${userId}"]
  `);
    console.log('🔍 AURA DEBUG: Found visibility avatars:', visibilityAvatars.length);
    // Also try to find avatars in visibility containers
    const visibilityContainers = document.querySelectorAll('.visibility-container, .avatars-container, #visibility-tab');
    let foundInVisibility = 0;
    visibilityContainers.forEach((container) => {
        const avatars = container.querySelectorAll('.avatar, .user-avatar');
        avatars.forEach((avatar) => {
            const avatarEl = avatar;
            const avatarId = avatarEl.dataset.userId;
            if (avatarId === userId) {
                foundInVisibility++;
                console.log('🔍 AURA DEBUG: Found avatar in visibility container:', avatar);
                updateAvatarAura(avatar, auraColor);
            }
        });
    });
    console.log('🔍 AURA DEBUG: Found avatars in visibility containers:', foundInVisibility);
    visibilityAvatars.forEach(avatar => {
        console.log('🔍 AURA DEBUG: Updating visibility avatar:', avatar);
        updateAvatarAura(avatar, auraColor);
    });
}
// COMP METHOD: Broadcast aura color change via Supabase real-time broadcast
export async function broadcastAuraChange(auraColor) {
    try {
        console.log('🎨 COMP METHOD: Broadcasting aura color change:', auraColor);
        const user = stateManagerInstance.getState("currentUser");
        if (!user) {
            console.warn('⚠️ COMP METHOD: No user found, cannot broadcast aura change');
            return;
        }
        const userId = user.id;
        if (!userId) {
            console.warn('⚠️ COMP METHOD: No user ID found, cannot broadcast aura change');
            return;
        }
        // Get current page info
        const urlData = normalizeCurrentUrl ? await normalizeCurrentUrl() : { pageId: undefined, normalizedUrl: undefined, normalized: undefined };
        const currentUrlData = stateManagerInstance.getState('currentUrlData');
        const pageId = urlData.pageId || currentUrlData?.pageId;
        if (!pageId) {
            console.warn('⚠️ COMP METHOD: No page ID found, cannot broadcast aura change');
            return;
        }
        // COMP METHOD: Use Supabase broadcast for real-time propagation
        const supabase = supabaseServiceInstance.getClient();
        if (supabase && supabaseRealtimeClient) {
            try {
                const channelName = `page-${pageId}`;
                // COMP METHOD: Try multiple ways to find the channel
                let channel = null;
                // Method 1: Direct channel lookup by topic
                if (supabase.realtime && supabase.realtime.channels) {
                    const channels = supabase.realtime.channels;
                    channel = Array.isArray(channels)
                        ? channels.find((ch) => ch.topic === channelName)
                        : Object.values(channels).find((ch) => {
                            const topic = ch.topic || ch.topicName || ch.name;
                            return topic === channelName || topic?.includes(pageId);
                        });
                }
                // Method 2: Use supabaseRealtimeClient's channel map
                if (!channel && supabaseRealtimeClient.channels) {
                    channel = supabaseRealtimeClient.channels.get(pageId);
                }
                if (channel && typeof channel.send === 'function') {
                    const broadcastPayload = {
                        userId: userId,
                        auraColor: auraColor,
                        pageId: pageId,
                        url: urlData.normalizedUrl || urlData.normalized || '',
                        timestamp: Date.now()
                    };
                    const status = await channel.send({
                        type: 'broadcast',
                        event: 'AURA_COLOR_CHANGED',
                        payload: broadcastPayload
                    });
                    console.log('✅ COMP METHOD: Aura color change broadcast sent via Supabase:', status);
                    return;
                }
                else {
                    console.warn('⚠️ COMP METHOD: Channel not found for page:', pageId);
                    console.warn('⚠️ COMP METHOD: Available channels:', {
                        supabaseRealtime: supabase.realtime?.channels,
                        supabaseClientChannels: supabaseRealtimeClient.channels?.size || 0
                    });
                }
            }
            catch (broadcastError) {
                console.warn('⚠️ COMP METHOD: Supabase broadcast failed, trying fallback:', broadcastError);
            }
        }
        // COMP METHOD: Fallback to sendSupabaseMessage if broadcast not available
        if (typeof sendSupabaseMessage === 'function') {
            await sendSupabaseMessage({
                type: 'AURA_COLOR_CHANGED',
                userId: userId,
                auraColor: auraColor,
                pageId: pageId,
                url: urlData.normalizedUrl || urlData.normalized || '',
                timestamp: Date.now()
            });
            console.log('✅ COMP METHOD: Aura color change sent via sendSupabaseMessage (fallback)');
        }
        else {
            console.warn('⚠️ COMP METHOD: Neither Supabase broadcast nor sendSupabaseMessage available');
        }
    }
    catch (error) {
        console.error('❌ COMP METHOD: Error broadcasting aura change:', error);
    }
}
export function isValidHex(hex) {
    return /^[A-Fa-f0-9]{6}$/.test(hex);
}
// Create singleton instance
const auraColorModalInstance = new AuraColorModal();
// Export as ES6 module (pure - no window exports needed for re-launch)
export { AuraColorModal, auraColorModalInstance };
export default AuraColorModal;
//# sourceMappingURL=AuraColorModal.js.map
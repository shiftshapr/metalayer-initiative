/**
 * UI AURAS BINDINGS - Following Working Message Pattern
 * Handles UI updates for aura changes
 * 
 * PATTERN:
 * - Same structure as ui-realtime-bindings.js
 * - Same event handling approach
 * - Same DOM manipulation patterns
 * - Incremental, not revolutionary
 */

(function() {
  'use strict';

  console.log('🔗 UI AURAS BINDINGS: initializing');

  // Initialize auras UI bindings
  function initializeAurasBindings() {
    console.log('✅ UI AURAS BINDINGS: ready');
    
    // Listen for aura real-time events
    if (typeof window.realtimeFoundation !== 'undefined') {
      window.realtimeFoundation.on('aura-realtime-update', handleAuraUpdate);
      console.log('✅ UI AURAS: Event listener registered');
    } else {
      console.warn('⚠️ UI AURAS: RealtimeFoundation not available');
    }
  }

  /**
   * Handle aura real-time updates
   */
  function handleAuraUpdate(event) {
    // COMP METHOD: Handle both event.detail and direct event structure
    const eventDetail = event.detail || event;
    const { type, data, pageId, timestamp } = eventDetail;
    
    console.log('🔍 UI AURAS: Received aura update:', { type, data, pageId, timestamp });
    
    try {
      // COMP METHOD: For UPDATE events, ensure handleAuraChange is called
      if (type === 'UPDATE' && data) {
        // Extract user_id and aura_color from data object
        const userId = data.user_id || data.userId;
        const auraColor = data.aura_color || data.auraColor;
        
        if (userId && auraColor && typeof window.handleAuraChange === 'function') {
          console.log(`🎨 UI AURAS: Calling handleAuraChange from UPDATE event for user ${userId} with color ${auraColor}`);
          window.handleAuraChange({
            userId: userId,
            auraColor: auraColor,
            source: 'realtimeFoundation'
          }).catch(error => {
            console.error('❌ UI AURAS: Error in handleAuraChange:', error);
          });
        }
      }
      
      switch (type) {
        case 'INSERT':
          handleAuraAdded(data);
          break;
        case 'UPDATE':
          handleAuraUpdated(data);
          break;
        case 'DELETE':
          handleAuraRemoved(data);
          break;
        default:
          console.warn('⚠️ UI AURAS: Unknown event type:', type);
      }
    } catch (error) {
      console.error('❌ UI AURAS: Error handling aura update:', error);
    }
  }

  /**
   * Handle aura added
   */
  function handleAuraAdded(auraData) {
    console.log('✨ UI AURAS: Aura added:', auraData);
    
    // Update user aura display
    updateUserAuraDisplay(auraData.user_email, auraData);
    
    // Update aura indicators
    updateAuraIndicators();
  }

  /**
   * Handle aura updated
   */
  function handleAuraUpdated(auraData) {
    console.log('🔄 UI AURAS: Aura updated:', auraData);
    
    // COMP METHOD: Extract user_id and aura_color from event data
    const userId = auraData.user_id || auraData.userId;
    const auraColor = auraData.aura_color || auraData.auraColor;
    
    // COMP METHOD: Call handleAuraChange to update visibility data and DOM avatars
    // This is critical for real-time propagation
    if (userId && auraColor && typeof window.handleAuraChange === 'function') {
      console.log(`🎨 UI AURAS: Calling handleAuraChange for user ${userId} with color ${auraColor}`);
      window.handleAuraChange({
        userId: userId,
        auraColor: auraColor,
        source: 'realtimeFoundation'
      }).catch(error => {
        console.error('❌ UI AURAS: Error in handleAuraChange:', error);
      });
    } else {
      console.warn('⚠️ UI AURAS: Cannot call handleAuraChange - missing userId/auraColor or handler');
    }
    
    // Update user aura display (legacy UI-only update)
    if (auraData.user_email) {
      updateUserAuraDisplay(auraData.user_email, auraData);
    }
    
    // Update aura indicators
    updateAuraIndicators();
  }

  /**
   * Handle aura removed
   */
  function handleAuraRemoved(auraData) {
    console.log('💫 UI AURAS: Aura removed:', auraData);
    
    // Remove user aura display
    removeUserAuraDisplay(auraData.user_email);
    
    // Update aura indicators
    updateAuraIndicators();
  }

  /**
   * Update user aura display
   */
  function updateUserAuraDisplay(userId, auraData) {
    // Find user in visibility list or messages
    const userElements = document.querySelectorAll(`[data-user-id="${userId}"]`);
    
    userElements.forEach(userElement => {
      updateUserElementAura(userElement, auraData);
    });
    
    console.log('✅ UI AURAS: User aura display updated');
  }

  /**
   * Update user element aura
   */
  function updateUserElementAura(userElement, auraData) {
    // Remove existing aura
    const existingAura = userElement.querySelector('.user-aura');
    if (existingAura) {
      existingAura.remove();
    }
    
    // Add new aura
    const auraElement = createAuraElement(auraData);
    userElement.appendChild(auraElement);
  }

  /**
   * Create aura element
   */
  function createAuraElement(auraData) {
    const auraElement = document.createElement('div');
    auraElement.className = 'user-aura';
    auraElement.setAttribute('data-aura-color', auraData.aura_color);
    auraElement.setAttribute('data-aura-intensity', auraData.aura_intensity);
    
    // Set aura styles
    auraElement.style.cssText = `
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 50%;
      background: ${auraData.aura_color};
      opacity: ${auraData.aura_intensity * 0.3};
      pointer-events: none;
      z-index: -1;
      animation: auraPulse 2s ease-in-out infinite;
    `;
    
    return auraElement;
  }

  /**
   * Remove user aura display
   */
  function removeUserAuraDisplay(userId) {
    const userElements = document.querySelectorAll(`[data-user-id="${userId}"]`);
    
    userElements.forEach(userElement => {
      const existingAura = userElement.querySelector('.user-aura');
      if (existingAura) {
        existingAura.remove();
      }
    });
    
    console.log('✅ UI AURAS: User aura display removed');
  }

  /**
   * Update aura indicators
   */
  function updateAuraIndicators() {
    // Update any global aura indicators
    const indicators = document.querySelectorAll('.aura-indicator');
    indicators.forEach(indicator => {
      // Trigger a refresh of the indicator
      indicator.style.opacity = '0.5';
      setTimeout(() => {
        indicator.style.opacity = '1';
      }, 100);
    });
  }

  /**
   * Add aura controls to user interface
   * FIX: Make async to fetch aura color from database
   * FIX: Separate Status from Aura Settings
   */
  async function addAuraControls() {
    const settingsTab = document.getElementById('settings-tab');
    if (!settingsTab) {
      console.warn('⚠️ UI AURAS: Settings tab not found');
      return;
    }
    
    // FIX: Create separate sections for Aura and Status
    // Aura Settings Section
    let auraSection = settingsTab.querySelector('.aura-settings-section');
    if (!auraSection) {
      auraSection = document.createElement('div');
      auraSection.className = 'settings-section aura-settings-section';
      auraSection.innerHTML = '<h4>🎨 Aura Settings</h4>';
      settingsTab.appendChild(auraSection);
    }
    
    // Add aura color picker (async - fetches from database)
    const colorPicker = await createAuraColorPicker();
    auraSection.appendChild(colorPicker);
    
    // Add aura intensity slider
    const intensitySlider = createAuraIntensitySlider();
    auraSection.appendChild(intensitySlider);
    
    // Status Settings Section (SEPARATE from Aura)
    let statusSection = settingsTab.querySelector('.status-settings-section');
    if (!statusSection) {
      statusSection = document.createElement('div');
      statusSection.className = 'settings-section status-settings-section';
      statusSection.innerHTML = '<h4>🟢 Status Settings</h4>';
      settingsTab.appendChild(statusSection);
    }
    
    // Add status selector to Status section (not Aura section)
    const statusSelector = createStatusSelector();
    statusSection.appendChild(statusSelector);
    
    console.log('✅ UI AURAS: Aura and Status controls added (separated)');
  }
  
  /**
   * Create status selector for 4-state status system
   * FIX: Add ability to set status (AVAILABLE, BUSY, AWAY)
   */
  function createStatusSelector() {
    const selector = document.createElement('div');
    selector.className = 'status-selector';
    selector.innerHTML = `
      <label for="status-select">Status:</label>
      <select id="status-select" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color);">
        <option value="AVAILABLE">🟢 Available</option>
        <option value="BUSY">🟡 Busy</option>
        <option value="AWAY">🔴 Away</option>
      </select>
      <span id="status-display" style="margin-left: 8px; font-size: 0.9em; color: var(--text-color-secondary);"></span>
    `;
    
    // Add change handler
    const statusSelect = selector.querySelector('#status-select');
    const statusDisplay = selector.querySelector('#status-display');
    
    // ROOT CAUSE FIX: Fetch current status (Chrome storage first, then database)
    (async () => {
      try {
        let currentStatus = null;
        let statusSource = 'default';
        
        // Step 1: Check Chrome storage FIRST
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          try {
            const storageResult = await new Promise((resolve) => {
              chrome.storage.local.get(['userAvailability', 'availability', 'globalAvailability'], (result) => {
                resolve(result);
              });
            });
            
            const cachedStatus = storageResult.userAvailability || storageResult.availability || storageResult.globalAvailability;
            if (cachedStatus && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(cachedStatus)) {
              currentStatus = cachedStatus;
              statusSource = 'Chrome storage';
              console.log('✅ UI AURAS: Found status in Chrome storage:', currentStatus);
            }
          } catch (error) {
            console.warn('⚠️ UI AURAS: Error reading Chrome storage:', error);
          }
        }
        
        // Step 2: Fallback to database if not in Chrome storage
        if (!currentStatus && window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
          try {
            const globalData = await window.api.request('/v1/presence/availability', {
              method: 'GET'
            });
            
            if (globalData && globalData.availability) {
              currentStatus = globalData.availability;
              statusSource = 'database';
              console.log('✅ UI AURAS: Fetched status from database:', currentStatus);
              
              // Cache it in Chrome storage for next time
              if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ 
                  userAvailability: currentStatus, 
                  availability: currentStatus, 
                  globalAvailability: currentStatus 
                });
              }
            }
          } catch (error) {
            console.warn('⚠️ UI AURAS: Error fetching from database:', error);
          }
        }
        
        // Step 3: Fallback to currentUser object
        if (!currentStatus && window.currentUser) {
          currentStatus = window.currentUser.availability || window.currentUser.globalAvailability;
          if (currentStatus) {
            statusSource = 'currentUser object';
            console.log('✅ UI AURAS: Found status in currentUser:', currentStatus);
          }
        }
        
        // Step 4: Default if nothing found
        if (!currentStatus) {
          currentStatus = 'AVAILABLE';
          statusSource = 'default';
          console.log('ℹ️ UI AURAS: No status found, using default: AVAILABLE');
        }
        
        // Set the select value
        statusSelect.value = currentStatus;
        const scopeText = ' (Global)';
        statusDisplay.textContent = `${currentStatus}${scopeText} (${statusSource})`;
        
      } catch (error) {
        console.warn('⚠️ UI AURAS: Error fetching current status:', error);
        statusSelect.value = 'AVAILABLE';
        statusDisplay.textContent = 'AVAILABLE (Global - error)';
      }
    })();
    
    // Add toggle for global vs per-tab (DISABLED for now - always global)
    const scopeToggle = document.createElement('div');
    scopeToggle.style.marginTop = '8px';
    scopeToggle.innerHTML = `
      <label style="font-size: 0.85em; display: flex; align-items: center; gap: 8px; opacity: 0.6;">
        <input type="checkbox" id="status-global-toggle" checked disabled>
        <span>Apply to all tabs</span>
      </label>
    `;
    selector.appendChild(scopeToggle);

    const globalToggle = scopeToggle.querySelector('#status-global-toggle');
    // Always global for now (checkbox is disabled)
    const isAlwaysGlobal = true;

    statusSelect.addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      // ROOT CAUSE FIX: Always use global status (checkbox is disabled)
      const isGlobal = isAlwaysGlobal; // Always true for now
      
      // Show loading state
      statusDisplay.textContent = 'Saving...';
      statusSelect.disabled = true;
      
      try {
        // ROOT CAUSE FIX: Update BOTH Chrome storage AND database
        if (typeof window.updateAvailabilityEverywhere === 'function') {
          await window.updateAvailabilityEverywhere(newStatus);
          console.log('✅ UI AURAS: Status updated everywhere:', newStatus);
          
          const scopeText = ' (Global - saved)';
          statusDisplay.textContent = `${newStatus}${scopeText} ✓`;
          
          // Re-fetch to confirm it's in database
          setTimeout(async () => {
            try {
              const verifyData = await window.api.request('/v1/presence/availability', {
                method: 'GET'
              });
              if (verifyData && verifyData.availability === newStatus) {
                statusDisplay.textContent = `${newStatus}${scopeText} ✓ (verified)`;
                console.log('✅ UI AURAS: Status verified in database');
              }
            } catch (verifyError) {
              console.warn('⚠️ UI AURAS: Could not verify status:', verifyError);
            }
            
            setTimeout(() => {
              statusDisplay.textContent = `${newStatus}${scopeText}`;
            }, 2000);
          }, 500);
        } else {
          // Fallback: Update manually if function not available
          console.warn('⚠️ UI AURAS: updateAvailabilityEverywhere not available, using fallback');
          
          // Update Chrome storage
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ 
              userAvailability: newStatus, 
              availability: newStatus, 
              globalAvailability: newStatus 
            });
          }
          
          // Update database
          if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
            const requestBody = {
              availability: newStatus,
              isGlobal: true
            };

            const result = await window.api.request('/v1/presence/availability', {
              method: 'POST',
              body: JSON.stringify(requestBody)
            });
            
            if (result && result.success) {
              const scopeText = ' (Global - saved)';
              statusDisplay.textContent = `${newStatus}${scopeText} ✓`;
            } else {
              statusDisplay.textContent = 'Error - not saved';
            }
          }
        }
      } catch (error) {
        console.error('❌ UI AURAS: Error updating status:', error);
        statusDisplay.textContent = `Error: ${error.message || 'Failed to save'}`;
      } finally {
        statusSelect.disabled = false;
      }
    });
    
    return selector;
  }

  /**
   * Get or create aura controls container
   */
  function getOrCreateAuraControlsContainer() {
    let container = document.querySelector('.aura-controls');
    
    if (!container) {
      // Create aura controls container
      container = document.createElement('div');
      container.className = 'aura-controls';
      container.innerHTML = '<h3>Aura Settings</h3>';
      
      // Add to sidebar in a more appropriate location
      const sidebar = document.querySelector('.sidebar-content') || document.body;
      const settingsTab = document.querySelector('#settings-tab') || document.querySelector('.settings-section');
      
      if (settingsTab) {
        // Add to settings section if it exists
        settingsTab.appendChild(container);
      } else {
        // Fallback to sidebar but hide by default
        sidebar.appendChild(container);
        container.style.display = 'none'; // Hide by default
      }
      
      console.log('✅ UI AURAS: Aura controls container created');
    }
    
    return container;
  }

  /**
   * Create aura color picker
   * FIX: Fetch current aura color from database instead of using fallback
   */
  async function createAuraColorPicker() {
    const picker = document.createElement('div');
    picker.className = 'aura-color-picker';
    
    // ROOT CAUSE FIX: Fetch current user's aura color (Chrome storage first, then database)
    let currentAuraColor = window.AVATAR_FALLBACK_COLOR;
    try {
      // Use unified getCurrentUserAuraColor function if available
      if (typeof window.getCurrentUserAuraColor === 'function') {
        currentAuraColor = await window.getCurrentUserAuraColor();
        console.log('✅ UI AURAS: Fetched aura color using getCurrentUserAuraColor:', currentAuraColor);
      } else {
        // Fallback: Check Chrome storage first
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const storageResult = await new Promise((resolve) => {
            chrome.storage.local.get(['userAuraColor', 'auraColor'], (result) => {
              resolve(result);
            });
          });
          const cachedColor = storageResult.userAuraColor || storageResult.auraColor;
          if (cachedColor && cachedColor !== '#ffffff' && cachedColor !== 'ffffff') {
            currentAuraColor = cachedColor;
            console.log('✅ UI AURAS: Found aura color in Chrome storage:', currentAuraColor);
          }
        }
        
        // Fallback to database if not in Chrome storage
        if (currentAuraColor === window.AVATAR_FALLBACK_COLOR && window.currentUser && window.currentUser.id) {
          if (window.api && typeof window.api.request === 'function') {
            const userData = await window.api.request(`/v1/users/${window.currentUser.id}`, {
              method: 'GET'
            });
            if (userData) {
              currentAuraColor = userData.aura_color || userData.auraColor || window.currentUser.auraColor || window.AVATAR_FALLBACK_COLOR;
              console.log('✅ UI AURAS: Fetched aura color from database:', currentAuraColor);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ UI AURAS: Error fetching aura color, using fallback:', error);
    }
    
    picker.innerHTML = `
      <label for="aura-color">Aura Color:</label>
      <input type="color" id="aura-color" value="${currentAuraColor}">
      <span id="aura-color-display" style="margin-left: 8px; font-size: 0.9em; color: var(--text-color-secondary);">${currentAuraColor}</span>
    `;
    
    // Add change handler
    const colorInput = picker.querySelector('#aura-color');
    const colorDisplay = picker.querySelector('#aura-color-display');
    colorInput.addEventListener('change', (e) => {
      const newColor = e.target.value;
      colorDisplay.textContent = newColor;
      handleAuraColorChange(newColor);
    });
    
    return picker;
  }

  /**
   * Create aura intensity slider
   */
  function createAuraIntensitySlider() {
    const slider = document.createElement('div');
    slider.className = 'aura-intensity-slider';
    slider.innerHTML = `
      <label for="aura-intensity">Aura Intensity:</label>
      <input type="range" id="aura-intensity" min="0" max="1" step="0.1" value="0.5">
      <span class="intensity-value">0.5</span>
    `;
    
    // Add change handler
    const intensityInput = slider.querySelector('#aura-intensity');
    const intensityValue = slider.querySelector('.intensity-value');
    
    intensityInput.addEventListener('input', (e) => {
      const value = e.target.value;
      intensityValue.textContent = value;
      handleAuraIntensityChange(parseFloat(value));
    });
    
    return slider;
  }

  /**
   * Handle aura color change
   * ROOT CAUSE FIX: Update BOTH Chrome storage AND database
   */
  async function handleAuraColorChange(color) {
    try {
      if (!window.currentUser || !window.currentUser.id) {
        console.warn('⚠️ UI AURAS: Cannot update aura - user not authenticated');
        return;
      }
      
      // ROOT CAUSE FIX: Use unified function to update both Chrome storage AND database
      if (typeof window.updateAuraColorEverywhere === 'function') {
        await window.updateAuraColorEverywhere(color);
        console.log('✅ UI AURAS: Aura color updated everywhere:', color);
      } else {
        // Fallback: Update manually if function not available
        console.warn('⚠️ UI AURAS: updateAuraColorEverywhere not available, using fallback');
        
        // Update Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ userAuraColor: color, auraColor: color });
        }
        
        // Update database
        if (window.api && typeof window.api.request === 'function') {
          await window.api.request(`/v1/users/${window.currentUser.id}/aura-color`, {
            method: 'PUT',
            body: JSON.stringify({
              auraColor: color
            })
          });
        }
        
        // Update local objects
        if (window.currentUser) {
          window.currentUser.auraColor = color;
          window.currentUser.aura_color = color;
        }
      }
    } catch (error) {
      console.error('❌ UI AURAS: Error updating aura color:', error);
    }
  }

  /**
   * Handle aura intensity change
   * FIX: Implement FULL CRUD - Update aura intensity in database
   */
  async function handleAuraIntensityChange(intensity) {
    try {
      if (!window.currentUser || !window.currentUser.id) {
        console.warn('⚠️ UI AURAS: Cannot update aura intensity - user not authenticated');
        return;
      }
      
        // FIX: Update in database using API module (FULL CRUD)
        if (window.api && typeof window.api.request === 'function') {
          // Get current aura color first
          const currentColor = window.currentUser.auraColor || window.currentUser.aura_color || window.AVATAR_FALLBACK_COLOR;
          
          // Use PATCH endpoint for general updates
          const result = await window.api.request(`/v1/users/${window.currentUser.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              aura_intensity: intensity,
              aura_color: currentColor // Preserve color
            })
          });
        
        if (result) {
          console.log('✅ UI AURAS: Aura intensity updated in database:', intensity);
          // Update local user object
          if (window.currentUser) {
            window.currentUser.auraIntensity = intensity;
            window.currentUser.aura_intensity = intensity;
          }
        } else {
          console.error('❌ UI AURAS: Failed to update aura intensity in database');
        }
      } else if (window.aurasIntegration) {
        // Fallback to aurasIntegration if API not available
        const currentAura = await window.aurasIntegration.getUserAura();
        const color = currentAura ? currentAura.aura_color : window.AVATAR_FALLBACK_COLOR;
        await window.aurasIntegration.updateAura(color, intensity);
        console.log('✅ UI AURAS: Aura intensity updated via aurasIntegration:', intensity);
      } else {
        console.error('❌ UI AURAS: No API method available to update aura intensity');
      }
    } catch (error) {
      console.error('❌ UI AURAS: Error updating aura intensity:', error);
    }
  }

  /**
   * Initialize theme handler with FULL CRUD
   * FIX: Hook up theme mode to database
   */
  function initializeThemeHandler() {
    const themeSelect = document.getElementById('theme-select');
    if (!themeSelect) {
      console.warn('⚠️ UI AURAS: Theme select not found');
      return;
    }
    
    // ROOT CAUSE FIX: Fetch current theme (Chrome storage first, then database)
    (async () => {
      try {
        let currentTheme = null;
        let themeSource = 'default';
        
        // Use unified getCurrentUserTheme function if available
        if (typeof window.getCurrentUserTheme === 'function') {
          currentTheme = await window.getCurrentUserTheme();
          themeSource = 'getCurrentUserTheme';
          console.log('✅ UI AURAS: Fetched theme using getCurrentUserTheme:', currentTheme);
        } else {
          // Fallback: Check Chrome storage first
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            const storageResult = await new Promise((resolve) => {
              chrome.storage.local.get(['theme', 'userTheme'], (result) => {
                resolve(result);
              });
            });
            const cachedTheme = storageResult.theme || storageResult.userTheme;
            if (cachedTheme && ['light', 'dark', 'auto'].includes(cachedTheme)) {
              currentTheme = cachedTheme;
              themeSource = 'Chrome storage';
              console.log('✅ UI AURAS: Found theme in Chrome storage:', currentTheme);
            }
          }
          
          // Fallback to database if not in Chrome storage
          if (!currentTheme && window.currentUser && window.currentUser.id) {
            if (window.api && typeof window.api.request === 'function') {
              const userData = await window.api.request(`/v1/users/${window.currentUser.id}`, {
                method: 'GET'
              });
              if (userData && userData.theme) {
                currentTheme = userData.theme;
                themeSource = 'database';
                console.log('✅ UI AURAS: Fetched theme from database:', currentTheme);
              }
            }
          }
          
          // Fallback to localStorage
          if (!currentTheme) {
            currentTheme = localStorage.getItem('theme') || 'light';
            themeSource = 'localStorage';
          }
        }
        
        themeSelect.value = currentTheme || 'light';
        console.log(`✅ UI AURAS: Theme set to ${currentTheme} (source: ${themeSource})`);
      } catch (error) {
        console.warn('⚠️ UI AURAS: Error fetching theme, using default:', error);
        themeSelect.value = 'light';
      }
    })();
    
    // ROOT CAUSE FIX: Handle theme change - Update BOTH Chrome storage AND database
    themeSelect.addEventListener('change', async (e) => {
      const newTheme = e.target.value;
      
      try {
        // ROOT CAUSE FIX: Use unified function to update both Chrome storage AND database
        if (typeof window.updateThemeEverywhere === 'function') {
          await window.updateThemeEverywhere(newTheme);
          console.log('✅ UI AURAS: Theme updated everywhere:', newTheme);
        } else {
          // Fallback: Update manually if function not available
          console.warn('⚠️ UI AURAS: updateThemeEverywhere not available, using fallback');
          
          // Update Chrome storage
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ theme: newTheme, userTheme: newTheme });
          }
          
          // Update localStorage (for compatibility)
          localStorage.setItem('theme', newTheme);
          
          // Update DOM immediately
          document.documentElement.setAttribute('data-theme', newTheme);
          document.body.setAttribute('data-theme', newTheme);
          
          // Update profile menu
          const themeIcon = document.getElementById('theme-icon');
          const themeText = document.getElementById('theme-text');
          if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
          }
          if (themeText) {
            themeText.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
          }
          
          // Update database
          if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
            await window.api.request(`/v1/users/${window.currentUser.id}`, {
              method: 'PATCH',
              body: JSON.stringify({
                theme: newTheme
              })
            });
          }
          
          // Update local objects
          if (window.currentUser) {
            window.currentUser.theme = newTheme;
          }
        }
      } catch (error) {
        console.error('❌ UI AURAS: Error updating theme:', error);
      }
    });
    
    console.log('✅ UI AURAS: Theme handler initialized with FULL CRUD');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      initializeAurasBindings();
      await addAuraControls();
      initializeThemeHandler();
    });
  } else {
    initializeAurasBindings();
    addAuraControls().catch(err => console.error('❌ UI AURAS: Error adding aura controls:', err));
    initializeThemeHandler();
  }

})();

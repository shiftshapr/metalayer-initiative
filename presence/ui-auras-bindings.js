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
    const { type, data, pageId, timestamp } = event.detail;
    
    console.log('🔍 UI AURAS: Received aura update:', { type, data, pageId, timestamp });
    
    try {
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
    
    // Update user aura display
    updateUserAuraDisplay(auraData.user_email, auraData);
    
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
   */
  function addAuraControls() {
    // Find or create aura controls container
    const controlsContainer = getOrCreateAuraControlsContainer();
    
    // Add aura color picker
    const colorPicker = createAuraColorPicker();
    controlsContainer.appendChild(colorPicker);
    
    // Add aura intensity slider
    const intensitySlider = createAuraIntensitySlider();
    controlsContainer.appendChild(intensitySlider);
    
    console.log('✅ UI AURAS: Aura controls added');
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
   */
  function createAuraColorPicker() {
    const picker = document.createElement('div');
    picker.className = 'aura-color-picker';
    picker.innerHTML = `
      <label for="aura-color">Aura Color:</label>
      <input type="color" id="aura-color" value="${window.AVATAR_FALLBACK_COLOR}">
    `;
    
    // Add change handler
    const colorInput = picker.querySelector('#aura-color');
    colorInput.addEventListener('change', (e) => {
      handleAuraColorChange(e.target.value);
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
   */
  async function handleAuraColorChange(color) {
    try {
      if (window.aurasIntegration) {
        await window.aurasIntegration.updateAura(color);
        console.log('✅ UI AURAS: Aura color updated:', color);
      }
    } catch (error) {
      console.error('❌ UI AURAS: Error updating aura color:', error);
    }
  }

  /**
   * Handle aura intensity change
   */
  async function handleAuraIntensityChange(intensity) {
    try {
      if (window.aurasIntegration) {
        // Get current aura color
        const currentAura = await window.aurasIntegration.getUserAura();
        const color = currentAura ? currentAura.aura_color : window.AVATAR_FALLBACK_COLOR;
        
        await window.aurasIntegration.updateAura(color, intensity);
        console.log('✅ UI AURAS: Aura intensity updated:', intensity);
      }
    } catch (error) {
      console.error('❌ UI AURAS: Error updating aura intensity:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeAurasBindings();
      addAuraControls();
    });
  } else {
    initializeAurasBindings();
    addAuraControls();
  }

})();

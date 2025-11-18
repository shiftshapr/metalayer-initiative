/**
 * Diagnostic script for theme saving and toggle issues
 * Run: diagnoseThemeSaving() in browser console
 */

async function diagnoseThemeSaving() {
  console.log('🔍 DIAGNOSTIC: === THEME SAVING DIAGNOSTIC ===');
  
  const results = {
    timestamp: new Date().toISOString(),
    themeToggle: {},
    profileToggle: {},
    userPreferencesManager: {},
    chromeStorage: {},
    database: {},
    errors: []
  };
  
  // Check 1: Settings tab theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    results.themeToggle.exists = true;
    results.themeToggle.checked = themeToggle.checked;
    results.themeToggle.handlerAttached = themeToggle.getAttribute('data-handler-attached') === 'true';
    
    // Check for Dark label (should have ID theme-dark-label)
    const darkLabel = document.getElementById('theme-dark-label');
    results.themeToggle.darkLabelExists = !!darkLabel;
    if (darkLabel) {
      results.themeToggle.darkLabelText = darkLabel.textContent;
      results.themeToggle.darkLabelColor = darkLabel.style.color || window.getComputedStyle(darkLabel).color;
    }
    
    // Check for Light label (should not exist)
    const lightLabel = themeToggle.parentElement?.previousElementSibling;
    results.themeToggle.lightLabelExists = !!lightLabel;
    
    // Test if event listener is actually working
    const testEvent = new Event('change', { bubbles: true });
    let eventFired = false;
    const testHandler = () => { eventFired = true; };
    themeToggle.addEventListener('change', testHandler, { once: true });
    themeToggle.dispatchEvent(testEvent);
    setTimeout(() => {
      themeToggle.removeEventListener('change', testHandler);
      results.themeToggle.eventListenerWorking = eventFired;
      if (!eventFired) {
        results.errors.push('Theme toggle event listener not working - no change event fired');
      }
    }, 10);
  } else {
    results.themeToggle.exists = false;
    results.errors.push('Settings tab theme toggle not found');
  }
  
  // Check 2: Profile menu theme toggle
  const profileToggleBtn = document.getElementById('theme-toggle-btn');
  if (profileToggleBtn) {
    results.profileToggle.exists = true;
    results.profileToggle.handlerAttached = profileToggleBtn.getAttribute('data-handler-attached') === 'true';
    results.profileToggle.disabled = profileToggleBtn.disabled;
    results.profileToggle.style = {
      pointerEvents: profileToggleBtn.style.pointerEvents,
      cursor: profileToggleBtn.style.cursor,
      opacity: profileToggleBtn.style.opacity,
      visibility: profileToggleBtn.style.visibility
    };
  } else {
    results.profileToggle.exists = false;
    results.errors.push('Profile menu theme toggle button not found');
  }
  
  // Check 3: UserPreferencesManager
  if (window.userPreferencesManager) {
    results.userPreferencesManager.exists = true;
    results.userPreferencesManager.isInitialized = window.userPreferencesManager.isInitialized;
    results.userPreferencesManager.currentTheme = window.userPreferencesManager.getPreference('theme');
  } else {
    results.userPreferencesManager.exists = false;
    results.errors.push('UserPreferencesManager not available');
  }
  
  // Check 4: Chrome storage
  try {
    const chromeStorage = await chrome.storage.local.get(['theme']);
    results.chromeStorage.theme = chromeStorage.theme;
    results.chromeStorage.exists = chromeStorage.theme !== undefined;
  } catch (error) {
    results.chromeStorage.error = error.message;
    results.errors.push(`Chrome storage error: ${error.message}`);
  }
  
  // Check 5: DOM theme
  const domTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
  results.domTheme = domTheme;
  
  // Check 6: Database (if user is authenticated)
  if (window.currentUser && window.currentUser.id) {
    try {
      const userData = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
      results.database.theme = userData.theme;
      results.database.exists = userData.theme !== undefined;
    } catch (error) {
      results.database.error = error.message;
      results.errors.push(`Database fetch error: ${error.message}`);
    }
  } else {
    results.database.error = 'User not authenticated';
  }
  
  // Check 7: Consistency check
  const allThemes = {
    chromeStorage: results.chromeStorage.theme,
    dom: results.domTheme,
    userPreferencesManager: results.userPreferencesManager.currentTheme,
    database: results.database.theme
  };
  
  const uniqueThemes = [...new Set(Object.values(allThemes).filter(v => v !== undefined))];
  results.consistency = {
    allMatch: uniqueThemes.length <= 1,
    uniqueThemes: uniqueThemes,
    allThemes: allThemes
  };
  
  if (uniqueThemes.length > 1) {
    results.errors.push(`Theme inconsistency detected: ${JSON.stringify(allThemes)}`);
  }
  
  // Check 8: Aura layout
  const auraContainer = document.querySelector('#aura-color-picker')?.parentElement;
  if (auraContainer) {
    const computedStyle = window.getComputedStyle(auraContainer);
    const intensitySlider = document.getElementById('aura-intensity-slider');
    results.auraLayout = {
      flexWrap: computedStyle.flexWrap,
      display: computedStyle.display,
      width: computedStyle.width,
      intensitySliderWidth: intensitySlider?.style.width || (intensitySlider ? window.getComputedStyle(intensitySlider).width : 'not found'),
      allInOneRow: computedStyle.flexWrap === 'nowrap' && computedStyle.display === 'flex'
    };
    
    // Check if intensity is on same row
    const colorPicker = document.getElementById('aura-color-picker');
    const intensityDiv = document.querySelector('#aura-intensity-slider')?.parentElement;
    if (colorPicker && intensityDiv) {
      const pickerRect = colorPicker.getBoundingClientRect();
      const intensityRect = intensityDiv.getBoundingClientRect();
      results.auraLayout.sameRow = Math.abs(pickerRect.top - intensityRect.top) < 5; // Within 5px vertically
      if (!results.auraLayout.sameRow) {
        results.errors.push('Aura intensity not on same row as aura color');
      }
    }
  }
  
  console.log('🔍 DIAGNOSTIC: Results:', results);
  console.log('🔍 DIAGNOSTIC: === END THEME SAVING DIAGNOSTIC ===');
  
  return results;
}

// Export to window
if (typeof window !== 'undefined') {
  window.diagnoseThemeSaving = diagnoseThemeSaving;
  console.log('✅ DIAGNOSTIC: diagnoseThemeSaving() available');
}


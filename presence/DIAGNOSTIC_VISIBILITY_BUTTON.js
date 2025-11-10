/**
 * Diagnostic Script: Visibility Button Not Active
 * 
 * Run this in the browser console to diagnose why the visibility button
 * in the profile menu is not responding to clicks.
 * 
 * Usage: Copy and paste into Chrome DevTools console
 */

(function diagnosticVisibilityButton() {
  console.log('🔍 ============================================');
  console.log('🔍 VISIBILITY BUTTON DIAGNOSTIC');
  console.log('🔍 ============================================');
  
  // Step 1: Check if button exists
  const visibilityBtn = document.getElementById('visibility-settings-btn');
  console.log('\n📋 Step 1: Button Existence');
  console.log('─────────────────────────────────────────');
  if (!visibilityBtn) {
    console.error('❌ Button NOT FOUND: visibility-settings-btn');
    console.log('🔍 Searching for similar elements...');
    const allButtons = document.querySelectorAll('button');
    const menuButtons = Array.from(allButtons).filter(btn => 
      btn.textContent.includes('Visibility') || 
      btn.textContent.includes('👁️') ||
      btn.id.includes('visibility')
    );
    console.log('🔍 Found buttons with "visibility" in text/id:', menuButtons);
    return;
  }
  console.log('✅ Button found:', visibilityBtn);
  console.log('   - ID:', visibilityBtn.id);
  console.log('   - Text:', visibilityBtn.textContent.trim());
  console.log('   - Classes:', visibilityBtn.className);
  
  // Step 2: Check button state
  console.log('\n📋 Step 2: Button State');
  console.log('─────────────────────────────────────────');
  const computedStyle = window.getComputedStyle(visibilityBtn);
  console.log('   - display:', computedStyle.display);
  console.log('   - visibility:', computedStyle.visibility);
  console.log('   - opacity:', computedStyle.opacity);
  console.log('   - pointer-events:', computedStyle.pointerEvents);
  console.log('   - cursor:', computedStyle.cursor);
  console.log('   - disabled:', visibilityBtn.disabled);
  console.log('   - dataset.handlerAttached:', visibilityBtn.dataset.handlerAttached);
  
  // Step 3: Check if handler is attached
  console.log('\n📋 Step 3: Event Handler Check');
  console.log('─────────────────────────────────────────');
  
  // Get all event listeners (Chrome DevTools method)
  const hasClickHandler = visibilityBtn.onclick !== null;
  console.log('   - onclick property:', hasClickHandler ? 'SET' : 'NULL');
  
  // Check if ProfileManager instance exists
  const profileManager = window.profileManager || (window.ProfileManager && window.ProfileManager.instance);
  if (profileManager) {
    console.log('   - ProfileManager instance:', 'FOUND');
    console.log('   - _visibilitySettingsHandler:', profileManager._visibilitySettingsHandler ? 'EXISTS' : 'MISSING');
    
    if (profileManager._visibilitySettingsHandler) {
      console.log('   - Handler type:', typeof profileManager._visibilitySettingsHandler);
    }
  } else {
    console.warn('   ⚠️ ProfileManager instance NOT FOUND');
  }
  
  // Step 4: Check parent menu visibility
  console.log('\n📋 Step 4: Parent Menu State');
  console.log('─────────────────────────────────────────');
  const userMenu = document.getElementById('user-menu');
  if (userMenu) {
    console.log('   - user-menu found:', true);
    console.log('   - user-menu display:', window.getComputedStyle(userMenu).display);
    console.log('   - user-menu visibility:', window.getComputedStyle(userMenu).visibility);
    console.log('   - user-menu z-index:', window.getComputedStyle(userMenu).zIndex);
  } else {
    console.warn('   ⚠️ user-menu NOT FOUND');
  }
  
  // Step 5: Check for CSS issues
  console.log('\n📋 Step 5: CSS Overrides');
  console.log('─────────────────────────────────────────');
  const inlineStyle = visibilityBtn.getAttribute('style');
  console.log('   - Inline style:', inlineStyle || 'NONE');
  
  // Check for z-index issues
  let parent = visibilityBtn.parentElement;
  let zIndexStack = [];
  while (parent && parent !== document.body) {
    const parentZ = window.getComputedStyle(parent).zIndex;
    if (parentZ !== 'auto') {
      zIndexStack.push({ element: parent.tagName, zIndex: parentZ });
    }
    parent = parent.parentElement;
  }
  if (zIndexStack.length > 0) {
    console.log('   - Z-index stack:', zIndexStack);
  }
  
  // Step 6: Test click programmatically
  console.log('\n📋 Step 6: Programmatic Click Test');
  console.log('─────────────────────────────────────────');
  console.log('🔧 Attempting programmatic click...');
  
  // Create a test click event
  const testClick = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  
  const clickResult = visibilityBtn.dispatchEvent(testClick);
  console.log('   - Event dispatched:', clickResult);
  console.log('   - Check console for handler logs above');
  
  // Step 7: Manual handler attachment test
  console.log('\n📋 Step 7: Manual Handler Test');
  console.log('─────────────────────────────────────────');
  const testHandler = (e) => {
    console.log('🎯 TEST HANDLER FIRED! Button is clickable.');
    console.log('   - Event:', e);
    console.log('   - Target:', e.target);
    e.stopPropagation();
  };
  
  visibilityBtn.addEventListener('click', testHandler, { once: true });
  console.log('   ✅ Test handler attached (one-time)');
  console.log('   🔧 Click the button now to test...');
  
  // Step 8: Recommendations
  console.log('\n📋 Step 8: Recommendations');
  console.log('─────────────────────────────────────────');
  
  const issues = [];
  if (computedStyle.pointerEvents === 'none') {
    issues.push('❌ pointer-events is "none" - button cannot receive clicks');
  }
  if (computedStyle.opacity === '0') {
    issues.push('❌ opacity is 0 - button is invisible');
  }
  if (visibilityBtn.disabled) {
    issues.push('❌ button is disabled');
  }
  if (!profileManager || !profileManager._visibilitySettingsHandler) {
    issues.push('❌ Handler not attached to ProfileManager instance');
  }
  if (computedStyle.display === 'none') {
    issues.push('❌ display is "none" - button is hidden');
  }
  
  if (issues.length === 0) {
    console.log('✅ No obvious issues found. Button should be clickable.');
    console.log('   - If clicks still not working, check for:');
    console.log('     1. Event propagation being stopped by parent');
    console.log('     2. Handler being removed after attachment');
    console.log('     3. Timing issue - handler attached before button exists');
  } else {
    console.log('⚠️ Issues found:');
    issues.forEach(issue => console.log('   ', issue));
  }
  
  console.log('\n🔍 ============================================');
  console.log('🔍 DIAGNOSTIC COMPLETE');
  console.log('🔍 ============================================');
  
  // Return diagnostic object for further inspection
  return {
    button: visibilityBtn,
    buttonState: {
      exists: !!visibilityBtn,
      disabled: visibilityBtn?.disabled,
      pointerEvents: computedStyle.pointerEvents,
      opacity: computedStyle.opacity,
      display: computedStyle.display,
      handlerAttached: visibilityBtn?.dataset.handlerAttached === 'true'
    },
    profileManager: {
      exists: !!profileManager,
      hasHandler: !!profileManager?._visibilitySettingsHandler
    },
    issues: issues
  };
})();


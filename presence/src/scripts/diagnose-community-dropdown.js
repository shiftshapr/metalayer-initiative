/**
 * DIAGNOSTIC SCRIPT: Community Dropdown Functionality
 * PURPOSE: Diagnose why the community dropdown is not working
 * USAGE: Copy this entire script and paste into browser console on a page with Canopi extension loaded
 * 
 * This script checks:
 * - Dropdown elements existence
 * - Event listeners attachment
 * - CSS styles and positioning
 * - CommunitiesModule initialization
 * - Click handler functionality
 */

(function() {
  console.log('🔍 === COMMUNITY DROPDOWN DIAGNOSTIC ===\n');
  
  const results = {
    checks: {},
    issues: [],
    warnings: [],
    recommendations: []
  };
  
  // Helper function to add results
  function addResult(category, type, message, data = null) {
    if (!results.checks[category]) {
      results.checks[category] = [];
    }
    results.checks[category].push({ type, message, data });
    if (type === 'error') {
      results.issues.push(message);
    } else if (type === 'warning') {
      results.warnings.push(message);
    }
  }
  
  // 1. Check if dropdown elements exist
  console.log('1️⃣ Checking dropdown elements...');
  const trigger = document.querySelector('.community-dropdown-trigger');
  const panel = document.getElementById('community-dropdown-panel');
  const communityName = document.getElementById('current-community-name');
  const chevron = document.getElementById('community-options-btn');
  const closeBtn = document.getElementById('close-community-dropdown');
  const communityList = document.querySelector('.community-list');
  
  if (trigger) {
    addResult('elements', 'success', '✅ Dropdown trigger found', trigger);
    console.log('   ✅ Dropdown trigger found');
  } else {
    addResult('elements', 'error', '❌ Dropdown trigger NOT found');
    console.log('   ❌ Dropdown trigger NOT found');
  }
  
  if (panel) {
    addResult('elements', 'success', '✅ Dropdown panel found', panel);
    console.log('   ✅ Dropdown panel found');
    console.log('   Panel display:', panel.style.display, '| Computed:', window.getComputedStyle(panel).display);
    console.log('   Panel classes:', panel.className);
  } else {
    addResult('elements', 'error', '❌ Dropdown panel NOT found');
    console.log('   ❌ Dropdown panel NOT found');
  }
  
  if (communityName) {
    addResult('elements', 'success', '✅ Community name element found', communityName);
    console.log('   ✅ Community name element found');
    console.log('   Current name:', communityName.textContent);
  } else {
    addResult('elements', 'error', '❌ Community name element NOT found');
    console.log('   ❌ Community name element NOT found');
  }
  
  if (chevron) {
    addResult('elements', 'success', '✅ Chevron element found', chevron);
    console.log('   ✅ Chevron element found');
    console.log('   Chevron opacity:', window.getComputedStyle(chevron).opacity);
  } else {
    addResult('elements', 'warning', '⚠️ Chevron element NOT found');
    console.log('   ⚠️ Chevron element NOT found');
  }
  
  if (closeBtn) {
    addResult('elements', 'success', '✅ Close button found', closeBtn);
    console.log('   ✅ Close button found');
  } else {
    addResult('elements', 'warning', '⚠️ Close button NOT found');
    console.log('   ⚠️ Close button NOT found');
  }
  
  if (communityList) {
    addResult('elements', 'success', '✅ Community list found', communityList);
    console.log('   ✅ Community list found');
    console.log('   Communities in list:', communityList.children.length);
  } else {
    addResult('elements', 'warning', '⚠️ Community list NOT found');
    console.log('   ⚠️ Community list NOT found');
  }
  
  // 2. Check CSS styles
  console.log('\n2️⃣ Checking CSS styles...');
  if (trigger) {
    const triggerStyles = window.getComputedStyle(trigger);
    console.log('   Trigger styles:');
    console.log('     display:', triggerStyles.display);
    console.log('     cursor:', triggerStyles.cursor);
    console.log('     pointer-events:', triggerStyles.pointerEvents);
    console.log('     justify-content:', triggerStyles.justifyContent);
    
    if (triggerStyles.pointerEvents === 'none') {
      addResult('styles', 'error', '❌ Trigger has pointer-events: none');
    } else {
      addResult('styles', 'success', '✅ Trigger pointer-events OK');
    }
    
    if (triggerStyles.cursor !== 'pointer' && triggerStyles.cursor !== 'default') {
      addResult('styles', 'warning', '⚠️ Trigger cursor is not pointer');
    }
  }
  
  if (panel) {
    const panelStyles = window.getComputedStyle(panel);
    console.log('   Panel styles:');
    console.log('     position:', panelStyles.position);
    console.log('     display:', panelStyles.display);
    console.log('     z-index:', panelStyles.zIndex);
    console.log('     top:', panelStyles.top);
    console.log('     right:', panelStyles.right);
    console.log('     visibility:', panelStyles.visibility);
    
    if (panelStyles.position !== 'absolute') {
      addResult('styles', 'warning', '⚠️ Panel position is not absolute');
    }
    
    if (parseInt(panelStyles.zIndex) < 1000) {
      addResult('styles', 'warning', '⚠️ Panel z-index might be too low');
    }
  }
  
  if (communityName) {
    const nameStyles = window.getComputedStyle(communityName);
    console.log('   Community name styles:');
    console.log('     text-align:', nameStyles.textAlign);
    console.log('     white-space:', nameStyles.whiteSpace);
    
    if (nameStyles.textAlign !== 'left') {
      addResult('styles', 'warning', '⚠️ Community name not left-aligned');
    }
  }
  
  // 3. Check event listeners
  console.log('\n3️⃣ Checking event listeners...');
  if (trigger) {
    // Try to get event listeners (Chrome DevTools only)
    const listeners = getEventListeners ? getEventListeners(trigger) : null;
    if (listeners) {
      console.log('   Event listeners on trigger:', Object.keys(listeners));
      if (listeners.click && listeners.click.length > 0) {
        addResult('listeners', 'success', '✅ Click listener found on trigger');
        console.log('   ✅ Click listener found on trigger');
      } else {
        addResult('listeners', 'error', '❌ No click listener on trigger');
        console.log('   ❌ No click listener on trigger');
      }
    } else {
      addResult('listeners', 'warning', '⚠️ Cannot check listeners (DevTools getEventListeners not available)');
      console.log('   ⚠️ Cannot check listeners (DevTools getEventListeners not available)');
      console.log('   Try: Open DevTools → Elements → Select trigger → Event Listeners tab');
    }
  }
  
  // 4. Check CommunitiesModule initialization
  console.log('\n4️⃣ Checking CommunitiesModule...');
  if (window.__CANOPI_MODULE_GRAPH__) {
    const graph = window.__CANOPI_MODULE_GRAPH__;
    console.log('   ✅ Module graph found');
    addResult('module', 'success', '✅ Module graph found');
    
    // Check if CommunitiesModule exists
    if (graph.communitiesModule) {
      addResult('module', 'success', '✅ CommunitiesModule in graph');
      console.log('   ✅ CommunitiesModule in graph');
    } else {
      addResult('module', 'warning', '⚠️ CommunitiesModule not in graph');
      console.log('   ⚠️ CommunitiesModule not in graph');
    }
  } else {
    addResult('module', 'warning', '⚠️ Module graph not found');
    console.log('   ⚠️ Module graph not found');
  }
  
  // Check for CommunitiesModule in window
  if (window.CommunitiesModule) {
    addResult('module', 'success', '✅ CommunitiesModule in window');
    console.log('   ✅ CommunitiesModule in window');
  } else {
    addResult('module', 'warning', '⚠️ CommunitiesModule not in window');
    console.log('   ⚠️ CommunitiesModule not in window');
  }
  
  // 5. Test dropdown functionality
  console.log('\n5️⃣ Testing dropdown functionality...');
  if (trigger && panel) {
    console.log('   Current panel display:', panel.style.display || 'none (inline style)');
    console.log('   Computed display:', window.getComputedStyle(panel).display);
    
    // Try to manually show/hide
    console.log('\n   Testing manual show/hide...');
    const originalDisplay = panel.style.display;
    panel.style.display = 'block';
    const computedAfterShow = window.getComputedStyle(panel).display;
    console.log('   After setting display:block, computed:', computedAfterShow);
    panel.style.display = originalDisplay;
    
    if (computedAfterShow === 'block' || computedAfterShow === 'flex') {
      addResult('functionality', 'success', '✅ Panel can be shown manually');
    } else {
      addResult('functionality', 'error', '❌ Panel cannot be shown (CSS override?)');
    }
    
    // Test click event
    console.log('\n   Testing click event...');
    const testClick = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    let clickFired = false;
    const testHandler = function(e) {
      clickFired = true;
      console.log('   ✅ Click event fired on trigger');
    };
    
    trigger.addEventListener('click', testHandler, { once: true });
    trigger.dispatchEvent(testClick);
    
    setTimeout(() => {
      if (clickFired) {
        addResult('functionality', 'success', '✅ Click event works on trigger');
      } else {
        addResult('functionality', 'error', '❌ Click event not firing');
      }
    }, 100);
  }
  
  // 6. Check parent container positioning
  console.log('\n6️⃣ Checking parent container...');
  if (trigger) {
    const headerActions = trigger.closest('.header-actions');
    if (headerActions) {
      const headerStyles = window.getComputedStyle(headerActions);
      console.log('   Header actions styles:');
      console.log('     position:', headerStyles.position);
      console.log('     display:', headerStyles.display);
      
      if (headerStyles.position === 'relative') {
        addResult('container', 'success', '✅ Header actions has position: relative');
      } else {
        addResult('container', 'warning', '⚠️ Header actions position is not relative');
      }
    } else {
      addResult('container', 'warning', '⚠️ Header actions container not found');
    }
  }
  
  // 7. Check for conflicting styles
  console.log('\n7️⃣ Checking for conflicting styles...');
  if (panel) {
    const panelStyles = window.getComputedStyle(panel);
    const inlineDisplay = panel.style.display;
    const computedDisplay = panelStyles.display;
    
    if (inlineDisplay && inlineDisplay !== 'none' && computedDisplay === 'none') {
      addResult('conflicts', 'error', '❌ Inline style conflicts with CSS');
      console.log('   ❌ Inline style conflicts with CSS');
    } else {
      addResult('conflicts', 'success', '✅ No style conflicts detected');
    }
    
    // Check for !important overrides
    const panelElement = panel;
    const testStyle = document.createElement('div');
    testStyle.style.cssText = 'display: block !important;';
    const importantDisplay = testStyle.style.display;
    console.log('   Testing !important override capability...');
  }
  
  // 8. Recommendations
  console.log('\n8️⃣ Recommendations...');
  if (results.issues.length > 0) {
    console.log('   Issues found:', results.issues.length);
    results.issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    
    if (!trigger) {
      results.recommendations.push('Ensure sidepanel.html has .community-dropdown-trigger element');
    }
    if (!panel) {
      results.recommendations.push('Ensure sidepanel.html has #community-dropdown-panel element');
    }
    if (trigger && !getEventListeners) {
      results.recommendations.push('Open DevTools → Elements → Select trigger → Check Event Listeners tab manually');
    }
  }
  
  if (results.warnings.length > 0) {
    console.log('   Warnings:', results.warnings.length);
    results.warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }
  
  if (results.recommendations.length > 0) {
    console.log('\n   💡 Recommendations:');
    results.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }
  
  // 9. Manual test function
  console.log('\n9️⃣ Manual test functions available:');
  console.log('   Run: testDropdownShow() - to manually show dropdown');
  console.log('   Run: testDropdownHide() - to manually hide dropdown');
  console.log('   Run: testDropdownToggle() - to toggle dropdown');
  console.log('   Run: attachTestListener() - to attach test click listener');
  
  // Expose test functions
  window.testDropdownShow = function() {
    if (panel) {
      panel.style.display = 'block';
      panel.classList.add('show');
      console.log('✅ Dropdown shown manually');
      console.log('   Inline style:', panel.style.display);
      console.log('   Computed:', window.getComputedStyle(panel).display);
    } else {
      console.log('❌ Panel not found');
    }
  };
  
  window.testDropdownHide = function() {
    if (panel) {
      panel.style.display = 'none';
      panel.classList.remove('show');
      console.log('✅ Dropdown hidden manually');
    } else {
      console.log('❌ Panel not found');
    }
  };
  
  window.testDropdownToggle = function() {
    if (panel) {
      const isVisible = panel.style.display === 'block' || 
                       window.getComputedStyle(panel).display === 'block' ||
                       panel.classList.contains('show');
      if (isVisible) {
        window.testDropdownHide();
      } else {
        window.testDropdownShow();
      }
    } else {
      console.log('❌ Panel not found');
    }
  };
  
  window.attachTestListener = function() {
    if (trigger) {
      const handler = function(e) {
        console.log('✅ Test click handler fired!', e);
        window.testDropdownToggle();
      };
      trigger.addEventListener('click', handler);
      console.log('✅ Test click listener attached');
      console.log('   Click the dropdown trigger to test');
      return handler;
    } else {
      console.log('❌ Trigger not found');
    }
  };
  
  // Summary
  console.log('\n📊 === DIAGNOSTIC SUMMARY ===');
  console.log('Total checks:', Object.keys(results.checks).length);
  console.log('Issues:', results.issues.length);
  console.log('Warnings:', results.warnings.length);
  console.log('Recommendations:', results.recommendations.length);
  
  if (results.issues.length === 0 && results.warnings.length === 0) {
    console.log('\n✅ All checks passed! Dropdown should be working.');
  } else {
    console.log('\n⚠️ Issues found. Review above for details.');
  }
  
  console.log('\n💡 Tip: Use testDropdownToggle() to manually test the dropdown');
  console.log('💡 Tip: Use attachTestListener() to add a test click handler');
  
  return results;
})();




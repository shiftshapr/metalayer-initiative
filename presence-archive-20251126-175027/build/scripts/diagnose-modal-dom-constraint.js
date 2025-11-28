/**
 * Diagnostic: Modal DOM Constraint
 * 
 * Checks if modal is constrained by sidebar container in DOM:
 * 1. Modal parent container (should be body, not sidebar)
 * 2. Sidebar container overflow settings
 * 3. Body/html overflow settings
 * 4. Z-index stacking context issues
 * 5. Fixed positioning context
 */

async function diagnoseModalDOMConstraint() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  console.log('🔍 MODAL_DOM_CONSTRAINT: Starting diagnostic...');

  // Check 1: Modal parent in DOM
  try {
    const modal = document.querySelector('.unified-message-modal');
    if (modal) {
      const parent = modal.parentElement;
      const parentTag = parent?.tagName || 'none';
      const parentClasses = parent?.className || 'none';
      
      results.checks.modalParent = {
        tagName: parentTag,
        className: parentClasses,
        id: parent?.id || 'none',
        isBody: parent === document.body,
        isSidebar: parentClasses.includes('sidebar') || parentClasses.includes('sidebar-container')
      };
      
      if (parent !== document.body) {
        results.warnings.push(`Modal parent is ${parentTag} (${parentClasses}), should be <body> for proper overflow`);
      }
      
      if (parentClasses.includes('sidebar') || parentClasses.includes('sidebar-container')) {
        results.errors.push('Modal is inside sidebar container - this will constrain overflow!');
      }
    } else {
      results.warnings.push('Modal not in DOM - may need to open modal first');
    }
  } catch (error) {
    results.errors.push(`Modal parent check failed: ${error.message}`);
  }

  // Check 2: Sidebar container overflow
  try {
    const sidebarContainer = document.querySelector('.sidebar-container') || 
                             document.querySelector('[class*="sidebar-container"]');
    
    if (sidebarContainer) {
      const computed = window.getComputedStyle(sidebarContainer);
      results.checks.sidebarContainer = {
        overflow: computed.overflow,
        overflowX: computed.overflowX,
        overflowY: computed.overflowY,
        position: computed.position,
        zIndex: computed.zIndex,
        width: computed.width
      };
      
      // Sidebar with overflow hidden and relative/absolute positioning can clip fixed children
      if (computed.overflow === 'hidden' && (computed.position === 'relative' || computed.position === 'absolute')) {
        results.warnings.push('Sidebar container has overflow:hidden with relative/absolute positioning - may clip fixed positioned modal');
      }
    } else {
      results.warnings.push('Sidebar container not found');
    }
  } catch (error) {
    results.errors.push(`Sidebar container check failed: ${error.message}`);
  }

  // Check 3: Body/HTML overflow settings
  try {
    const bodyComputed = window.getComputedStyle(document.body);
    const htmlComputed = window.getComputedStyle(document.documentElement);
    
    results.checks.bodyHtml = {
      bodyOverflow: bodyComputed.overflow,
      bodyOverflowX: bodyComputed.overflowX,
      bodyPosition: bodyComputed.position,
      bodyWidth: bodyComputed.width,
      htmlOverflow: htmlComputed.overflow,
      htmlOverflowX: htmlComputed.overflowX,
      htmlPosition: htmlComputed.position,
      htmlWidth: htmlComputed.width
    };
    
    // Body/html with overflow hidden can clip fixed elements
    if (bodyComputed.overflow === 'hidden' || bodyComputed.overflowX === 'hidden') {
      results.warnings.push('Body has overflow:hidden - may clip fixed positioned modal');
    }
    
    if (htmlComputed.overflow === 'hidden' || htmlComputed.overflowX === 'hidden') {
      results.warnings.push('HTML has overflow:hidden - may clip fixed positioned modal');
    }
    
    // Check viewport dimensions (Chrome extension sidepanel constraint)
    results.checks.viewport = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      isChromeExtension: window.chrome && window.chrome.runtime
    };
    
    // Chrome extension sidepanels have constrained viewports
    if (window.chrome && window.chrome.runtime) {
      results.warnings.push('Chrome extension sidepanel detected - viewport may be constrained to sidepanel width');
    }
  } catch (error) {
    results.errors.push(`Body/HTML check failed: ${error.message}`);
  }

  // Check 4: Modal positioning context
  try {
    const modal = document.querySelector('.unified-message-modal');
    if (modal) {
      const computed = window.getComputedStyle(modal);
      const rect = modal.getBoundingClientRect();
      
      results.checks.modalPositioning = {
        position: computed.position,
        left: computed.left,
        top: computed.top,
        zIndex: computed.zIndex,
        viewportLeft: rect.left,
        viewportTop: rect.top,
        viewportWidth: rect.width,
        viewportHeight: rect.height
      };
      
      // Check if modal is actually visible and not clipped
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       rect.left < window.innerWidth && 
                       rect.right > 0 &&
                       rect.top < window.innerHeight && 
                       rect.bottom > 0;
      
      results.checks.modalVisible = isVisible;
      
      if (!isVisible) {
        results.errors.push('Modal is not visible in viewport - may be clipped or positioned off-screen');
      }
      
      // Check if modal is constrained (width/height less than expected)
      if (rect.width < 500) {
        results.warnings.push(`Modal width is ${rect.width}px - may be constrained (expected ~600px)`);
      }
    }
  } catch (error) {
    results.errors.push(`Modal positioning check failed: ${error.message}`);
  }

  // Check 5: Stacking context issues
  try {
    const modal = document.querySelector('.unified-message-modal');
    const sidebar = document.querySelector('.sidebar-container') || document.querySelector('[class*="sidebar"]');
    
    if (modal && sidebar) {
      // Check if sidebar creates a stacking context
      const sidebarComputed = window.getComputedStyle(sidebar);
      const sidebarZ = parseInt(sidebarComputed.zIndex || '0');
      const modalZ = parseInt(window.getComputedStyle(modal).zIndex || '0');
      
      results.checks.stackingContext = {
        sidebarZIndex: sidebarZ,
        modalZIndex: modalZ,
        sidebarPosition: sidebarComputed.position,
        sidebarTransform: sidebarComputed.transform,
        sidebarOpacity: sidebarComputed.opacity,
        sidebarWillChange: sidebarComputed.willChange
      };
      
      // Sidebar with transform, opacity < 1, or will-change creates stacking context
      const createsStackingContext = sidebarComputed.transform !== 'none' ||
                                     parseFloat(sidebarComputed.opacity) < 1 ||
                                     sidebarComputed.willChange !== 'auto';
      
      if (createsStackingContext && sidebarComputed.position !== 'static') {
        results.warnings.push('Sidebar creates stacking context - may affect modal z-index layering');
      }
    }
  } catch (error) {
    results.errors.push(`Stacking context check failed: ${error.message}`);
  }

  // Recommendations
  if (results.errors.length > 0 || results.warnings.length > 0) {
    results.recommendations.push(
      'Ensure modal is appended to document.body, not sidebar container',
      'If sidebar has overflow:hidden, ensure modal uses position:fixed (viewport-relative)',
      'Check that body/html do not have overflow:hidden that clips fixed elements',
      'Verify modal z-index is higher than sidebar and any stacking contexts',
      'Consider moving modal outside sidebar container in DOM if it\'s currently inside'
    );
  }

  console.log('✅ MODAL_DOM_CONSTRAINT: Diagnostic complete', results);
  return results;
}

// Attach to window for console access
if (typeof window !== 'undefined') {
  window.diagnoseModalDOMConstraint = diagnoseModalDOMConstraint;
}


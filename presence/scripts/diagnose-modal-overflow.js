/**
 * Diagnostic: Modal Overflow Positioning
 * 
 * Checks:
 * 1. Modal positioning (should overflow left, not centered)
 * 2. Modal dimensions (should be 600px width like X)
 * 3. Sidebar overflow settings (should not be affected)
 * 4. Z-index layering (modal should be above sidebar)
 * 5. Modal container positioning
 */

async function diagnoseModalOverflow() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  console.log('🔍 MODAL_OVERFLOW: Starting diagnostic...');

  // Check 1: Modal CSS positioning
  try {
    const modalStyle = window.getComputedStyle(
      document.querySelector('.unified-message-modal') || document.body
    );
    
    // Check if modal exists in DOM
    const modalExists = document.querySelector('.unified-message-modal') !== null;
    results.checks.modalExists = modalExists;
    
    if (modalExists) {
      const modal = document.querySelector('.unified-message-modal');
      const computed = window.getComputedStyle(modal);
      
      results.checks.modalPosition = {
        position: computed.position,
        left: computed.left,
        top: computed.top,
        width: computed.width,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems
      };
      
      // Check if centered (should NOT be)
      if (computed.justifyContent === 'center') {
        results.warnings.push('Modal is centered - should overflow left like X');
      }
      
      // Check modal content
      const modalContent = document.querySelector('.unified-message-modal-content');
      if (modalContent) {
        const contentComputed = window.getComputedStyle(modalContent);
        results.checks.modalContent = {
          width: contentComputed.width,
          maxWidth: contentComputed.maxWidth,
          marginLeft: contentComputed.marginLeft,
          position: contentComputed.position
        };
        
        // Check if width is 600px (X's standard)
        const widthNum = parseInt(contentComputed.width);
        if (widthNum !== 600 && contentComputed.maxWidth !== '600px') {
          results.warnings.push(`Modal width is ${contentComputed.width}, should be 600px for X pattern`);
        }
      }
    } else {
      results.warnings.push('Modal not in DOM - may need to open modal first');
    }
  } catch (error) {
    results.errors.push(`Modal CSS check failed: ${error.message}`);
  }

  // Check 2: Sidebar overflow settings
  try {
    const sidebar = document.querySelector('.sidebar') || 
                    document.querySelector('[class*="sidebar"]') ||
                    document.body;
    
    const sidebarComputed = window.getComputedStyle(sidebar);
    results.checks.sidebarOverflow = {
      overflow: sidebarComputed.overflow,
      overflowX: sidebarComputed.overflowX,
      overflowY: sidebarComputed.overflowY,
      position: sidebarComputed.position,
      width: sidebarComputed.width
    };
    
    // Sidebar should have overflow hidden or visible, but not affect modal
    if (sidebarComputed.overflow === 'hidden' && sidebarComputed.position === 'relative') {
      results.warnings.push('Sidebar has overflow:hidden with relative positioning - modal may be clipped');
    }
  } catch (error) {
    results.errors.push(`Sidebar overflow check failed: ${error.message}`);
  }

  // Check 3: Z-index layering
  try {
    const modal = document.querySelector('.unified-message-modal');
    const sidebar = document.querySelector('.sidebar') || document.body;
    
    if (modal && sidebar) {
      const modalZ = window.getComputedStyle(modal).zIndex;
      const sidebarZ = window.getComputedStyle(sidebar).zIndex;
      
      results.checks.zIndex = {
        modal: modalZ,
        sidebar: sidebarZ
      };
      
      if (parseInt(modalZ) <= parseInt(sidebarZ || '0')) {
        results.errors.push('Modal z-index should be higher than sidebar');
      }
    }
  } catch (error) {
    results.errors.push(`Z-index check failed: ${error.message}`);
  }

  // Check 4: Viewport positioning (check modal content, not container)
  try {
    const modalContent = document.querySelector('.unified-message-modal-content');
    if (modalContent) {
      const rect = modalContent.getBoundingClientRect();
      const computed = window.getComputedStyle(modalContent);
      results.checks.viewportPosition = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        marginLeft: computed.marginLeft,
        marginTop: computed.marginTop
      };
      
      // Modal content should overflow left (negative left value or left < 0)
      // X pattern: modal should be positioned at ~80px from top, but overflow left
      if (rect.left >= 0) {
        results.warnings.push(`Modal content left position is ${rect.left}px - should overflow left (negative or < 0)`);
      }
      
      // Check if top is around 80px (X's standard)
      if (Math.abs(rect.top - 80) > 20) {
        results.warnings.push(`Modal content top position is ${rect.top}px - should be around 80px for X pattern`);
      }
      
      // Check if width is exactly 600px
      if (Math.abs(rect.width - 600) > 5) {
        results.warnings.push(`Modal content width is ${rect.width}px - should be exactly 600px for X pattern`);
      }
    } else {
      results.warnings.push('Modal content not found - may need to open modal first');
    }
  } catch (error) {
    results.errors.push(`Viewport position check failed: ${error.message}`);
  }

  // Recommendations
  if (results.warnings.length > 0 || results.errors.length > 0) {
    results.recommendations.push(
      'Update modal CSS to use fixed positioning with left: 80px, margin-left: -280px (or similar) to overflow left',
      'Set modal width to exactly 600px (X standard)',
      'Ensure sidebar has overflow: visible or ensure modal is outside sidebar container',
      'Use z-index: 10000+ for modal to ensure it appears above sidebar'
    );
  }

  console.log('✅ MODAL_OVERFLOW: Diagnostic complete', results);
  return results;
}

// Attach to window for console access
if (typeof window !== 'undefined') {
  window.diagnoseModalOverflow = diagnoseModalOverflow;
}


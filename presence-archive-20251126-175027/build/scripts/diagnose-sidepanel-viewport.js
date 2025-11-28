/**
 * Diagnostic: Chrome Extension Sidepanel Viewport Constraint
 * 
 * Chrome extension sidepanels have their own viewport.
 * Fixed positioning is relative to the sidepanel viewport, not the browser window.
 * This diagnostic checks:
 * 1. Sidepanel viewport dimensions
 * 2. Modal positioning relative to viewport
 * 3. Whether modal can actually overflow
 * 4. HTML/body overflow settings
 */

window.diagnoseSidepanelViewport = async function diagnoseSidepanelViewport() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  console.log('🔍 SIDEPANEL_VIEWPORT: Starting diagnostic...');

  // Check 1: Viewport dimensions
  try {
    results.checks.viewport = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      isChromeExtension: !!(window.chrome && window.chrome.runtime),
      sidepanelWidth: window.innerWidth,
      sidepanelHeight: window.innerHeight
    };

    // Chrome extension sidepanels are typically 320-400px wide
    if (window.innerWidth < 500) {
      results.warnings.push(`Sidepanel viewport is narrow (${window.innerWidth}px) - modal (600px) will overflow`);
    }
  } catch (error) {
    results.errors.push(`Viewport check failed: ${error.message}`);
  }

  // Check 2: HTML/Body overflow settings
  try {
    const htmlComputed = window.getComputedStyle(document.documentElement);
    const bodyComputed = window.getComputedStyle(document.body);
    
    results.checks.overflow = {
      htmlOverflow: htmlComputed.overflow,
      htmlOverflowX: htmlComputed.overflowX,
      htmlOverflowY: htmlComputed.overflowY,
      bodyOverflow: bodyComputed.overflow,
      bodyOverflowX: bodyComputed.overflowX,
      bodyOverflowY: bodyComputed.overflowY
    };

    if (htmlComputed.overflowX === 'hidden') {
      results.errors.push('HTML has overflow-x: hidden - this will clip the modal!');
    }
    if (bodyComputed.overflowX === 'hidden') {
      results.errors.push('Body has overflow-x: hidden - this will clip the modal!');
    }
  } catch (error) {
    results.errors.push(`Overflow check failed: ${error.message}`);
  }

  // Check 3: Modal positioning
  try {
    const modal = document.querySelector('.unified-message-modal');
    const modalContent = document.querySelector('.unified-message-modal-content');
    
    if (modal) {
      const modalComputed = window.getComputedStyle(modal);
      const modalRect = modal.getBoundingClientRect();
      
      results.checks.modal = {
        position: modalComputed.position,
        top: modalComputed.top,
        left: modalComputed.left,
        width: modalComputed.width,
        height: modalComputed.height,
        zIndex: modalComputed.zIndex,
        rectLeft: modalRect.left,
        rectTop: modalRect.top,
        rectWidth: modalRect.width,
        rectHeight: modalRect.height,
        parentTag: modal.parentElement?.tagName,
        parentIsBody: modal.parentElement === document.body
      };

      // Check if modal is positioned correctly
      if (modalComputed.position !== 'fixed') {
        results.errors.push(`Modal position is ${modalComputed.position}, should be 'fixed'`);
      }
      
      if (modal.parentElement !== document.body) {
        results.errors.push('Modal is not directly in body - this can cause clipping!');
      }
    } else {
      results.warnings.push('Modal not found - may need to open modal first');
    }

    if (modalContent) {
      const contentComputed = window.getComputedStyle(modalContent);
      const contentRect = modalContent.getBoundingClientRect();
      
      results.checks.modalContent = {
        width: contentComputed.width,
        marginLeft: contentComputed.marginLeft,
        marginTop: contentComputed.marginTop,
        rectLeft: contentRect.left,
        rectTop: contentRect.top,
        rectWidth: contentRect.width,
        rectHeight: contentRect.height,
        overflowsLeft: contentRect.left < 0,
        overflowsRight: contentRect.right > window.innerWidth
      };

      // Check if modal content overflows left (negative left position)
      if (contentRect.left >= 0) {
        results.warnings.push(`Modal content left position is ${contentRect.left}px - should be negative to overflow left`);
      }

      // Check if modal is wider than viewport
      if (contentRect.width > window.innerWidth) {
        results.warnings.push(`Modal width (${contentRect.width}px) is wider than viewport (${window.innerWidth}px)`);
      }
    } else {
      results.warnings.push('Modal content not found - may need to open modal first');
    }
  } catch (error) {
    results.errors.push(`Modal positioning check failed: ${error.message}`);
  }

  // Check 4: Sidebar container constraints
  try {
    const sidebarContainer = document.querySelector('.sidebar-container');
    if (sidebarContainer) {
      const sidebarComputed = window.getComputedStyle(sidebarContainer);
      const sidebarRect = sidebarContainer.getBoundingClientRect();
      
      results.checks.sidebarContainer = {
        overflow: sidebarComputed.overflow,
        overflowX: sidebarComputed.overflowX,
        overflowY: sidebarComputed.overflowY,
        position: sidebarComputed.position,
        width: sidebarComputed.width,
        height: sidebarComputed.height,
        rectWidth: sidebarRect.width,
        rectHeight: sidebarRect.height
      };

      if (sidebarComputed.overflowX === 'hidden') {
        results.warnings.push('Sidebar container has overflow-x: hidden - but modal should be in body, not sidebar');
      }
    }
  } catch (error) {
    results.errors.push(`Sidebar container check failed: ${error.message}`);
  }

  // Recommendations
  if (results.checks.viewport && results.checks.viewport.sidepanelWidth < 600) {
    results.recommendations.push(
      `Sidepanel is ${results.checks.viewport.sidepanelWidth}px wide, but modal is 600px. ` +
      `Modal will overflow by ${600 - results.checks.viewport.sidepanelWidth}px. ` +
      `Ensure html and body have overflow-x: visible.`
    );
  }

  if (results.checks.modalContent && !results.checks.modalContent.overflowsLeft) {
    results.recommendations.push(
      'Modal content is not overflowing left. Adjust margin-left to negative value ' +
      `(e.g., -${window.innerWidth - 80}px for 80px offset).`
    );
  }

  // Final assessment
  console.log('📊 SIDEPANEL_VIEWPORT: Diagnostic complete');
  console.log('Results:', results);
  
  return results;
};






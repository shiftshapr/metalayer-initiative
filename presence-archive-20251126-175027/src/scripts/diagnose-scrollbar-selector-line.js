/**
 * Diagnostic Script: Scrollbar and Selector Line Positioning
 * 
 * Diagnoses why selector line appears at different positions relative to scrollbar
 * for Settings/Manage tabs vs other tabs.
 * 
 * Usage: Copy and paste into browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Scrollbar and Selector Line Positioning');
  console.log('=======================================================\n');

  const result = {
    timestamp: new Date().toISOString(),
    container: {},
    tabs: [],
    scrollbar: {},
    issues: [],
    hypotheses: []
  };

  if (typeof document === 'undefined') {
    console.log('❌ Document not available');
    return result;
  }

  // Check tab container
  const navContainer = document.querySelector('.sidebar-nav-main');
  if (!navContainer) {
    console.log('❌ Tab container (.sidebar-nav-main) not found');
    return result;
  }

  const containerStyles = window.getComputedStyle(navContainer);
  const containerRect = navContainer.getBoundingClientRect();
  
  result.container = {
    exists: true,
    styles: {
      display: containerStyles.display,
      flexDirection: containerStyles.flexDirection,
      alignItems: containerStyles.alignItems,
      justifyContent: containerStyles.justifyContent,
      overflowX: containerStyles.overflowX,
      overflowY: containerStyles.overflowY,
      height: containerStyles.height,
      maxHeight: containerStyles.maxHeight,
      paddingBottom: containerStyles.paddingBottom,
      borderBottom: containerStyles.borderBottom,
      borderBottomWidth: containerStyles.borderBottomWidth
    },
    rect: {
      height: containerRect.height,
      bottom: containerRect.bottom
    }
  };

  console.log('1. Tab Container Analysis:');
  console.log('   Container:', {
    display: containerStyles.display,
    overflowX: containerStyles.overflowX,
    overflowY: containerStyles.overflowY,
    height: containerRect.height,
    borderBottom: containerStyles.borderBottom
  });

  // Check for scrollbar
  const hasScrollbar = navContainer.scrollWidth > navContainer.clientWidth;
  const scrollbarWidth = navContainer.offsetWidth - navContainer.clientWidth;
  
  result.scrollbar = {
    exists: hasScrollbar,
    width: scrollbarWidth,
    scrollWidth: navContainer.scrollWidth,
    clientWidth: navContainer.clientWidth,
    scrollLeft: navContainer.scrollLeft,
    scrollRight: navContainer.scrollWidth - navContainer.clientWidth - navContainer.scrollLeft
  };

  console.log('\n2. Scrollbar Analysis:');
  console.log('   Scrollbar:', {
    exists: hasScrollbar,
    width: scrollbarWidth + 'px',
    scrollWidth: navContainer.scrollWidth + 'px',
    clientWidth: navContainer.clientWidth + 'px'
  });

  // Analyze all tabs
  console.log('\n3. Tab Analysis:');
  const allTabs = document.querySelectorAll('.main-nav-tab[data-tab]');
  
  allTabs.forEach((tab, index) => {
    const tabElement = tab;
    const tabId = tabElement.getAttribute('data-tab');
    const isActive = tabElement.classList.contains('active');
    const isManage = tabElement.classList.contains('manage-button');
    const isSettings = tabId === 'settings-tab';
    
    const tabStyles = window.getComputedStyle(tabElement);
    const tabRect = tabElement.getBoundingClientRect();
    const containerRect = navContainer.getBoundingClientRect();
    
    // Calculate position relative to container
    const tabTop = tabRect.top - containerRect.top;
    const tabBottom = tabRect.bottom - containerRect.top;
    const containerBottom = containerRect.height;
    const distanceFromContainerBottom = containerBottom - tabBottom;
    
    // Check border-bottom position
    const borderBottomY = tabRect.bottom;
    const containerBottomY = containerRect.bottom;
    const borderRelativeToContainer = borderBottomY - containerBottomY;
    
    const tabData = {
      tabId: tabId || 'unknown',
      isActive: isActive,
      isManage: isManage,
      isSettings: isSettings,
      position: {
        tabTop: tabTop,
        tabBottom: tabBottom,
        containerBottom: containerBottom,
        distanceFromContainerBottom: distanceFromContainerBottom,
        borderRelativeToContainer: borderRelativeToContainer
      },
      styles: {
        borderBottom: tabStyles.borderBottom,
        borderBottomWidth: tabStyles.borderBottomWidth,
        borderBottomColor: tabStyles.borderBottomColor,
        marginBottom: tabStyles.marginBottom,
        paddingBottom: tabStyles.paddingBottom,
        height: tabStyles.height,
        alignSelf: tabStyles.alignSelf
      }
    };
    
    result.tabs.push(tabData);
    
    console.log(`   ${index + 1}. ${tabId}${isActive ? ' (ACTIVE)' : ''}${isManage ? ' [MANAGE]' : ''}${isSettings ? ' [SETTINGS]' : ''}`);
    console.log(`      Distance from container bottom: ${distanceFromContainerBottom.toFixed(2)}px`);
    console.log(`      Border relative to container bottom: ${borderRelativeToContainer.toFixed(2)}px`);
    console.log(`      Tab bottom: ${tabBottom.toFixed(2)}px, Container bottom: ${containerBottom.toFixed(2)}px`);
    console.log(`      Border-bottom: ${tabStyles.borderBottomWidth} ${tabStyles.borderBottomColor}`);
  });

  // Compare Settings/Manage to other tabs
  console.log('\n4. Comparison Analysis:');
  const referenceTab = result.tabs.find(t => !t.isSettings && !t.isManage && t.isActive) ||
                       result.tabs.find(t => !t.isSettings && !t.isManage);
  const settingsTab = result.tabs.find(t => t.isSettings);
  const manageTab = result.tabs.find(t => t.isManage);

  if (referenceTab && settingsTab) {
    const refDistance = referenceTab.position.distanceFromContainerBottom;
    const settingsDistance = settingsTab.position.distanceFromContainerBottom;
    const difference = Math.abs(settingsDistance - refDistance);
    
    if (difference > 1) {
      result.issues.push(`Settings tab border is ${difference.toFixed(2)}px different from reference relative to container bottom`);
      console.log(`⚠️ Settings tab border position difference: ${difference.toFixed(2)}px`);
      
      result.hypotheses.push({
        id: 1,
        title: 'Settings tab positioned differently in flex container',
        description: `Settings tab distance from container bottom: ${settingsDistance.toFixed(2)}px, reference: ${refDistance.toFixed(2)}px. May be affected by flex alignment or scrollbar.`
      });
    }
  }

  if (referenceTab && manageTab) {
    const refDistance = referenceTab.position.distanceFromContainerBottom;
    const manageDistance = manageTab.position.distanceFromContainerBottom;
    const difference = Math.abs(manageDistance - refDistance);
    
    if (difference > 1) {
      result.issues.push(`Manage tab border is ${difference.toFixed(2)}px different from reference relative to container bottom`);
      console.log(`⚠️ Manage tab border position difference: ${difference.toFixed(2)}px`);
      
      result.hypotheses.push({
        id: 2,
        title: 'Manage tab positioned differently in flex container',
        description: `Manage tab distance from container bottom: ${manageDistance.toFixed(2)}px, reference: ${refDistance.toFixed(2)}px. May be affected by flex alignment (margin-left: auto) or scrollbar.`
      });
    }
  }

  // Check if scrollbar affects positioning
  if (hasScrollbar) {
    console.log('\n5. Scrollbar Impact:');
    console.log('   Scrollbar width:', scrollbarWidth + 'px');
    console.log('   Container border-bottom:', containerStyles.borderBottom);
    console.log('   Container padding-bottom:', containerStyles.paddingBottom);
    
    // Check if container has border that might affect selector line position
    if (parseFloat(containerStyles.borderBottomWidth) > 0) {
      result.hypotheses.push({
        id: 3,
        title: 'Container border-bottom affecting selector line position',
        description: `Container has border-bottom: ${containerStyles.borderBottomWidth} ${containerStyles.borderBottomColor}. This may cause selector line to appear above scrollbar for tabs at the edge.`
      });
      console.log('   ⚠️ Container has border-bottom that may affect positioning');
    }
  }

  // Summary
  console.log('\n=======================================================');
  console.log('📋 SUMMARY');
  console.log('=======================================================');
  console.log(`Issues Found: ${result.issues.length}`);
  result.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  
  console.log(`\nHypotheses Generated: ${result.hypotheses.length}`);
  result.hypotheses.forEach((hyp, i) => {
    console.log(`  ${i + 1}. ${hyp.title}`);
    console.log(`     ${hyp.description}`);
  });
  
  console.log('\n📋 Full Results:', JSON.stringify(result, null, 2));
  
  return result;
})();


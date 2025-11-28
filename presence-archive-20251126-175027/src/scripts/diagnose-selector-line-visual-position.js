/**
 * Diagnostic Script: Visual Selector Line Position
 * 
 * Measures the actual visual position of selector lines relative to container bottom
 * and identifies why they appear at different positions.
 * 
 * Usage: Copy and paste into browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Visual Selector Line Position');
  console.log('==============================================\n');

  const result = {
    timestamp: new Date().toISOString(),
    container: {},
    tabs: [],
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
  
  // Check for scrollbar
  const hasScrollbar = navContainer.scrollWidth > navContainer.clientWidth;
  const scrollbarHeight = navContainer.offsetHeight - navContainer.clientHeight;
  
  result.container = {
    exists: true,
    styles: {
      borderBottom: containerStyles.borderBottom,
      borderBottomWidth: containerStyles.borderBottomWidth,
      borderBottomColor: containerStyles.borderBottomColor,
      paddingBottom: containerStyles.paddingBottom,
      height: containerRect.height,
      boxSizing: containerStyles.boxSizing
    },
    scrollbar: {
      exists: hasScrollbar,
      height: scrollbarHeight,
      scrollWidth: navContainer.scrollWidth,
      clientWidth: navContainer.clientWidth
    }
  };

  console.log('1. Container Analysis:');
  console.log('   Border-bottom:', containerStyles.borderBottom);
  console.log('   Container height:', containerRect.height + 'px');
  console.log('   Scrollbar height:', scrollbarHeight + 'px');
  console.log('   Has scrollbar:', hasScrollbar);

  // Analyze all tabs
  console.log('\n2. Tab Selector Line Analysis:');
  const allTabs = document.querySelectorAll('.main-nav-tab[data-tab]');
  const activeTab = Array.from(allTabs).find(t => t.classList.contains('active'));
  
  allTabs.forEach((tab, index) => {
    const tabElement = tab;
    const tabId = tabElement.getAttribute('data-tab');
    const isActive = tabElement.classList.contains('active');
    const isManage = tabElement.classList.contains('manage-button');
    const isSettings = tabId === 'settings-tab';
    
    const tabStyles = window.getComputedStyle(tabElement);
    const tabRect = tabElement.getBoundingClientRect();
    
    // Calculate selector line position
    // Selector line is the border-bottom, positioned at tabRect.bottom
    const selectorLineY = tabRect.bottom;
    const containerBottomY = containerRect.bottom;
    const distanceFromContainerBottom = containerBottomY - selectorLineY;
    
    // Get border-bottom properties
    const borderBottomWidth = parseFloat(tabStyles.borderBottomWidth) || 0;
    const borderBottomColor = tabStyles.borderBottomColor;
    const isSelectorVisible = borderBottomWidth > 0 && borderBottomColor !== 'rgba(0, 0, 0, 0)' && borderBottomColor !== 'transparent';
    
    const tabData = {
      tabId: tabId || 'unknown',
      isActive: isActive,
      isManage: isManage,
      isSettings: isSettings,
      position: {
        tabTop: tabRect.top,
        tabBottom: tabRect.bottom,
        containerBottom: containerBottomY,
        selectorLineY: selectorLineY,
        distanceFromContainerBottom: distanceFromContainerBottom
      },
      selectorLine: {
        visible: isSelectorVisible,
        width: borderBottomWidth,
        color: borderBottomColor,
        computedY: selectorLineY
      },
      styles: {
        paddingBottom: tabStyles.paddingBottom,
        marginBottom: tabStyles.marginBottom,
        height: tabStyles.height,
        boxSizing: tabStyles.boxSizing
      }
    };
    
    result.tabs.push(tabData);
    
    console.log(`   ${index + 1}. ${tabId}${isActive ? ' (ACTIVE)' : ''}${isManage ? ' [MANAGE]' : ''}${isSettings ? ' [SETTINGS]' : ''}`);
    console.log(`      Selector line Y: ${selectorLineY.toFixed(2)}px`);
    console.log(`      Container bottom Y: ${containerBottomY.toFixed(2)}px`);
    console.log(`      Distance from container bottom: ${distanceFromContainerBottom.toFixed(2)}px`);
    console.log(`      Selector visible: ${isSelectorVisible} (${borderBottomWidth}px ${borderBottomColor})`);
  });

  // Compare positions
  console.log('\n3. Position Comparison:');
  if (activeTab) {
    const activeData = result.tabs.find(t => t.isActive);
    const settingsData = result.tabs.find(t => t.isSettings);
    const manageData = result.tabs.find(t => t.isManage);
    
    if (activeData && settingsData) {
      const diff = Math.abs(activeData.position.distanceFromContainerBottom - settingsData.position.distanceFromContainerBottom);
      if (diff > 0.5) {
        result.issues.push(`Settings tab selector line is ${diff.toFixed(2)}px different from active tab`);
        console.log(`⚠️ Settings vs Active difference: ${diff.toFixed(2)}px`);
      }
    }
    
    if (activeData && manageData) {
      const diff = Math.abs(activeData.position.distanceFromContainerBottom - manageData.position.distanceFromContainerBottom);
      if (diff > 0.5) {
        result.issues.push(`Manage tab selector line is ${diff.toFixed(2)}px different from active tab`);
        console.log(`⚠️ Manage vs Active difference: ${diff.toFixed(2)}px`);
      }
    }
  }

  // Check if container border-bottom is interfering
  const containerBorderWidth = parseFloat(containerStyles.borderBottomWidth) || 0;
  if (containerBorderWidth > 0) {
    console.log('\n4. Container Border Impact:');
    console.log(`   Container border-bottom: ${containerBorderWidth}px ${containerStyles.borderBottomColor}`);
    console.log(`   This border sits at container bottom: ${containerBottomY.toFixed(2)}px`);
    console.log(`   Tab selector lines (4px) should align with this border`);
    
    if (hasScrollbar && scrollbarHeight > 0) {
      result.hypotheses.push({
        id: 1,
        title: 'Scrollbar overlapping container border-bottom',
        description: `Container has ${containerBorderWidth}px border-bottom. Scrollbar (${scrollbarHeight}px) may be overlapping this border, causing selector lines to appear at different positions.`
      });
      console.log(`   ⚠️ Scrollbar (${scrollbarHeight}px) may be overlapping border-bottom`);
    } else {
      result.hypotheses.push({
        id: 2,
        title: 'Container border-bottom causing visual misalignment',
        description: `Container has ${containerBorderWidth}px border-bottom. Tab selector lines (4px) should align with this border, but may appear above it for tabs at the edge.`
      });
      console.log(`   ⚠️ Container border-bottom may be causing visual misalignment`);
    }
  }

  // Summary
  console.log('\n==============================================');
  console.log('📋 SUMMARY');
  console.log('==============================================');
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


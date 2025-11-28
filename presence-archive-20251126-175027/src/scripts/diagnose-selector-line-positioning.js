/**
 * Diagnostic Script: Selector Line Positioning Inconsistency
 * 
 * Diagnoses why Settings and Manage tabs have different selector line
 * positioning relative to tab text compared to other tabs.
 * 
 * Usage: Copy and paste into browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Selector Line Positioning Analysis');
  console.log('================================================\n');

  const result = {
    timestamp: new Date().toISOString(),
    tabs: [],
    issues: [],
    hypotheses: []
  };

  if (typeof document === 'undefined') {
    console.log('❌ Document not available');
    return result;
  }

  // Get all tab buttons
  const allTabs = document.querySelectorAll('.main-nav-tab[data-tab]');
  console.log(`Found ${allTabs.length} tabs to analyze\n`);

  allTabs.forEach((tab, index) => {
    const tabElement = tab;
    const tabId = tabElement.getAttribute('data-tab');
    const isActive = tabElement.classList.contains('active');
    const isManage = tabElement.classList.contains('manage-button');
    const isSettings = tabId === 'settings-tab';
    
    const styles = window.getComputedStyle(tabElement);
    const rect = tabElement.getBoundingClientRect();
    
    // Get text element
    const textElement = tabElement.querySelector('.tab-label') || tabElement;
    const textRect = textElement.getBoundingClientRect();
    
    // Calculate distances
    const tabHeight = rect.height;
    const textBottom = textRect.bottom - rect.top; // Distance from top of tab to bottom of text
    const borderBottomY = tabHeight; // Border is at bottom of tab
    const distanceFromTextToBorder = tabHeight - textBottom;
    
    const tabData = {
      tabId: tabId || 'unknown',
      isActive: isActive,
      isManage: isManage,
      isSettings: isSettings,
      measurements: {
        tabHeight: tabHeight,
        textHeight: textRect.height,
        textBottom: textBottom,
        distanceFromTextToBorder: distanceFromTextToBorder,
        borderBottomWidth: parseFloat(styles.borderBottomWidth) || 0
      },
      styles: {
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        lineHeight: styles.lineHeight,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        boxSizing: styles.boxSizing,
        display: styles.display,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        borderBottom: styles.borderBottom,
        borderBottomColor: styles.borderBottomColor,
        borderBottomWidth: styles.borderBottomWidth,
        borderBottomStyle: styles.borderBottomStyle,
        height: styles.height,
        minHeight: styles.minHeight,
        maxHeight: styles.maxHeight
      }
    };
    
    result.tabs.push(tabData);
    
    console.log(`${index + 1}. ${tabId}${isActive ? ' (ACTIVE)' : ''}${isManage ? ' [MANAGE]' : ''}${isSettings ? ' [SETTINGS]' : ''}`);
    console.log(`   Distance from text to border: ${distanceFromTextToBorder.toFixed(2)}px`);
    console.log(`   Tab height: ${tabHeight.toFixed(2)}px`);
    console.log(`   Text bottom: ${textBottom.toFixed(2)}px`);
    console.log(`   Padding: ${styles.paddingTop} / ${styles.paddingBottom}`);
    console.log(`   Line-height: ${styles.lineHeight}`);
    console.log(`   Border-bottom: ${styles.borderBottomWidth} ${styles.borderBottomStyle} ${styles.borderBottomColor}`);
    console.log('');
  });

  // Analyze differences
  console.log('================================================');
  console.log('📊 ANALYSIS');
  console.log('================================================\n');

  // Get reference tab (first non-settings, non-manage tab)
  const referenceTab = result.tabs.find(t => !t.isSettings && !t.isManage);
  const settingsTab = result.tabs.find(t => t.isSettings);
  const manageTab = result.tabs.find(t => t.isManage);

  if (referenceTab && settingsTab) {
    const refDistance = referenceTab.measurements.distanceFromTextToBorder;
    const settingsDistance = settingsTab.measurements.distanceFromTextToBorder;
    const difference = Math.abs(settingsDistance - refDistance);
    
    if (difference > 1) { // More than 1px difference
      result.issues.push(`Settings tab has ${difference.toFixed(2)}px different positioning than reference tab`);
      console.log(`⚠️ Settings tab distance: ${settingsDistance.toFixed(2)}px`);
      console.log(`   Reference tab distance: ${refDistance.toFixed(2)}px`);
      console.log(`   Difference: ${difference.toFixed(2)}px\n`);
      
      // Hypothesis 1: Padding differences
      if (settingsTab.styles.paddingBottom !== referenceTab.styles.paddingBottom) {
        result.hypotheses.push({
          id: 1,
          title: 'Padding-bottom difference',
          description: `Settings tab has padding-bottom: ${settingsTab.styles.paddingBottom}, reference has ${referenceTab.styles.paddingBottom}`,
          evidence: {
            settings: settingsTab.styles.paddingBottom,
            reference: referenceTab.styles.paddingBottom
          }
        });
        console.log('🔍 HYPOTHESIS 1: Padding-bottom difference');
        console.log(`   Settings: ${settingsTab.styles.paddingBottom}`);
        console.log(`   Reference: ${referenceTab.styles.paddingBottom}\n`);
      }
      
      // Hypothesis 2: Line-height differences
      if (settingsTab.styles.lineHeight !== referenceTab.styles.lineHeight) {
        result.hypotheses.push({
          id: 2,
          title: 'Line-height difference',
          description: `Settings tab has line-height: ${settingsTab.styles.lineHeight}, reference has ${referenceTab.styles.lineHeight}`,
          evidence: {
            settings: settingsTab.styles.lineHeight,
            reference: referenceTab.styles.lineHeight
          }
        });
        console.log('🔍 HYPOTHESIS 2: Line-height difference');
        console.log(`   Settings: ${settingsTab.styles.lineHeight}`);
        console.log(`   Reference: ${referenceTab.styles.lineHeight}\n`);
      }
      
      // Hypothesis 3: Height/box-sizing differences
      if (settingsTab.measurements.tabHeight !== referenceTab.measurements.tabHeight) {
        result.hypotheses.push({
          id: 3,
          title: 'Tab height difference',
          description: `Settings tab has height: ${settingsTab.measurements.tabHeight}px, reference has ${referenceTab.measurements.tabHeight}px`,
          evidence: {
            settings: settingsTab.measurements.tabHeight,
            reference: referenceTab.measurements.tabHeight
          }
        });
        console.log('🔍 HYPOTHESIS 3: Tab height difference');
        console.log(`   Settings: ${settingsTab.measurements.tabHeight}px`);
        console.log(`   Reference: ${referenceTab.measurements.tabHeight}px\n`);
      }
    }
  }

  if (referenceTab && manageTab) {
    const refDistance = referenceTab.measurements.distanceFromTextToBorder;
    const manageDistance = manageTab.measurements.distanceFromTextToBorder;
    const difference = Math.abs(manageDistance - refDistance);
    
    if (difference > 1) {
      result.issues.push(`Manage tab has ${difference.toFixed(2)}px different positioning than reference tab`);
      console.log(`⚠️ Manage tab distance: ${manageDistance.toFixed(2)}px`);
      console.log(`   Reference tab distance: ${refDistance.toFixed(2)}px`);
      console.log(`   Difference: ${difference.toFixed(2)}px\n`);
      
      // Check same hypotheses for manage tab
      if (manageTab.styles.paddingBottom !== referenceTab.styles.paddingBottom) {
        result.hypotheses.push({
          id: 4,
          title: 'Manage tab padding-bottom difference',
          description: `Manage tab has padding-bottom: ${manageTab.styles.paddingBottom}, reference has ${referenceTab.styles.paddingBottom}`,
          evidence: {
            manage: manageTab.styles.paddingBottom,
            reference: referenceTab.styles.paddingBottom
          }
        });
        console.log('🔍 HYPOTHESIS 4: Manage tab padding-bottom difference');
        console.log(`   Manage: ${manageTab.styles.paddingBottom}`);
        console.log(`   Reference: ${referenceTab.styles.paddingBottom}\n`);
      }
      
      if (manageTab.styles.lineHeight !== referenceTab.styles.lineHeight) {
        result.hypotheses.push({
          id: 5,
          title: 'Manage tab line-height difference',
          description: `Manage tab has line-height: ${manageTab.styles.lineHeight}, reference has ${referenceTab.styles.lineHeight}`,
          evidence: {
            manage: manageTab.styles.lineHeight,
            reference: referenceTab.styles.lineHeight
          }
        });
        console.log('🔍 HYPOTHESIS 5: Manage tab line-height difference');
        console.log(`   Manage: ${manageTab.styles.lineHeight}`);
        console.log(`   Reference: ${referenceTab.styles.lineHeight}\n`);
      }
      
      if (manageTab.measurements.tabHeight !== referenceTab.measurements.tabHeight) {
        result.hypotheses.push({
          id: 6,
          title: 'Manage tab height difference',
          description: `Manage tab has height: ${manageTab.measurements.tabHeight}px, reference has ${referenceTab.measurements.tabHeight}px`,
          evidence: {
            manage: manageTab.measurements.tabHeight,
            reference: referenceTab.measurements.tabHeight
          }
        });
        console.log('🔍 HYPOTHESIS 6: Manage tab height difference');
        console.log(`   Manage: ${manageTab.measurements.tabHeight}px`);
        console.log(`   Reference: ${referenceTab.measurements.tabHeight}px\n`);
      }
    }
  }

  // Summary
  console.log('================================================');
  console.log('📋 SUMMARY');
  console.log('================================================');
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


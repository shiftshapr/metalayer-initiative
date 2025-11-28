/**
 * Diagnostic Script: Tab Structure Differences
 * 
 * Diagnoses structural differences between Settings/Manage tabs and other tabs
 * that might affect selector line positioning when active.
 * 
 * Usage: Copy and paste into browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Tab Structure Differences Analysis');
  console.log('==================================================\n');

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
    
    // Analyze DOM structure
    const hasIcon = !!tabElement.querySelector('.tab-icon');
    const hasLabel = !!tabElement.querySelector('.tab-label');
    const directText = tabElement.childNodes.length > 0 && 
                      Array.from(tabElement.childNodes).some(node => 
                        node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
                      );
    const textContent = tabElement.textContent.trim();
    
    // Get text element for measurements
    const textElement = tabElement.querySelector('.tab-label') || tabElement;
    const textRect = textElement.getBoundingClientRect();
    const textStyles = window.getComputedStyle(textElement);
    
    // Calculate positions relative to tab button
    const textTop = textRect.top - rect.top;
    const textBottom = textRect.bottom - rect.top;
    const textHeight = textRect.height;
    const tabHeight = rect.height;
    const borderBottomY = tabHeight;
    const distanceFromTextToBorder = tabHeight - textBottom;
    
    // Check for structural differences
    const structuralInfo = {
      hasIcon: hasIcon,
      hasLabel: hasLabel,
      directText: directText,
      childNodes: Array.from(tabElement.childNodes).map(node => ({
        type: node.nodeType === Node.TEXT_NODE ? 'TEXT' : node.nodeName,
        content: node.nodeType === Node.TEXT_NODE ? node.textContent.trim() : node.className || node.tagName
      })),
      innerHTML: tabElement.innerHTML.substring(0, 100) // First 100 chars
    };
    
    const tabData = {
      tabId: tabId || 'unknown',
      isActive: isActive,
      isManage: isManage,
      isSettings: isSettings,
      structure: structuralInfo,
      textContent: textContent,
      measurements: {
        tabHeight: tabHeight,
        textTop: textTop,
        textBottom: textBottom,
        textHeight: textHeight,
        distanceFromTextToBorder: distanceFromTextToBorder,
        borderBottomY: borderBottomY
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
        borderBottomWidth: styles.borderBottomWidth,
        height: styles.height,
        minHeight: styles.minHeight
      },
      textStyles: {
        lineHeight: textStyles.lineHeight,
        fontSize: textStyles.fontSize,
        fontWeight: textStyles.fontWeight,
        display: textStyles.display,
        verticalAlign: textStyles.verticalAlign
      }
    };
    
    result.tabs.push(tabData);
    
    console.log(`${index + 1}. ${tabId}${isActive ? ' (ACTIVE)' : ''}${isManage ? ' [MANAGE]' : ''}${isSettings ? ' [SETTINGS]' : ''}`);
    console.log(`   Structure: ${hasIcon ? 'HAS ICON' : 'NO ICON'} | ${hasLabel ? 'HAS LABEL SPAN' : 'NO LABEL SPAN'} | ${directText ? 'DIRECT TEXT' : 'NO DIRECT TEXT'}`);
    console.log(`   Text content: "${textContent}"`);
    console.log(`   Child nodes: ${structuralInfo.childNodes.length}`);
    structuralInfo.childNodes.forEach((node, i) => {
      console.log(`     ${i + 1}. ${node.type}: ${node.content.substring(0, 50)}`);
    });
    console.log(`   Distance from text to border: ${distanceFromTextToBorder.toFixed(2)}px`);
    console.log(`   Text top: ${textTop.toFixed(2)}px, Text bottom: ${textBottom.toFixed(2)}px`);
    console.log(`   Tab height: ${tabHeight.toFixed(2)}px`);
    console.log(`   Font-weight: ${styles.fontWeight} (tab) / ${textStyles.fontWeight} (text)`);
    console.log(`   Line-height: ${styles.lineHeight} (tab) / ${textStyles.lineHeight} (text)`);
    console.log('');
  });

  // Analyze differences
  console.log('==================================================');
  console.log('📊 STRUCTURAL ANALYSIS');
  console.log('==================================================\n');

  // Get reference tab (first non-settings, non-manage tab)
  const referenceTab = result.tabs.find(t => !t.isSettings && !t.isManage && t.isActive);
  if (!referenceTab) {
    const inactiveRef = result.tabs.find(t => !t.isSettings && !t.isManage);
    if (inactiveRef) {
      console.log('⚠️ No active reference tab found, using inactive tab for comparison');
    }
  }
  const refTab = referenceTab || result.tabs.find(t => !t.isSettings && !t.isManage);
  const settingsTab = result.tabs.find(t => t.isSettings);
  const manageTab = result.tabs.find(t => t.isManage);

  if (refTab && settingsTab) {
    console.log('Comparing Settings tab to reference tab:');
    
    // Check structural differences
    if (settingsTab.structure.hasLabel !== refTab.structure.hasLabel) {
      result.hypotheses.push({
        id: 1,
        title: 'Label structure difference',
        description: `Settings tab ${settingsTab.structure.hasLabel ? 'HAS' : 'LACKS'} label span, reference ${refTab.structure.hasLabel ? 'HAS' : 'LACKS'} label span`,
        evidence: {
          settings: settingsTab.structure.hasLabel,
          reference: refTab.structure.hasLabel
        }
      });
      console.log(`🔍 HYPOTHESIS 1: Label structure difference`);
      console.log(`   Settings: ${settingsTab.structure.hasLabel ? 'HAS label span' : 'NO label span'}`);
      console.log(`   Reference: ${refTab.structure.hasLabel ? 'HAS label span' : 'NO label span'}\n`);
    }
    
    if (settingsTab.structure.hasIcon !== refTab.structure.hasIcon) {
      result.hypotheses.push({
        id: 2,
        title: 'Icon presence difference',
        description: `Settings tab ${settingsTab.structure.hasIcon ? 'HAS' : 'LACKS'} icon, reference ${refTab.structure.hasIcon ? 'HAS' : 'LACKS'} icon`,
        evidence: {
          settings: settingsTab.structure.hasIcon,
          reference: refTab.structure.hasIcon
        }
      });
      console.log(`🔍 HYPOTHESIS 2: Icon presence difference`);
      console.log(`   Settings: ${settingsTab.structure.hasIcon ? 'HAS icon' : 'NO icon'}`);
      console.log(`   Reference: ${refTab.structure.hasIcon ? 'HAS icon' : 'NO icon'}\n`);
    }
    
    // Check font-weight difference when active
    if (settingsTab.isActive && refTab.isActive) {
      if (settingsTab.styles.fontWeight !== refTab.styles.fontWeight) {
        result.hypotheses.push({
          id: 3,
          title: 'Font-weight difference affecting text position',
          description: `When active, Settings tab has font-weight: ${settingsTab.styles.fontWeight}, reference has ${refTab.styles.fontWeight}. Bold text (700) may render differently than normal (400), affecting text baseline position.`,
          evidence: {
            settings: settingsTab.styles.fontWeight,
            reference: refTab.styles.fontWeight
          }
        });
        console.log(`🔍 HYPOTHESIS 3: Font-weight difference affecting text position`);
        console.log(`   Settings (active): ${settingsTab.styles.fontWeight}`);
        console.log(`   Reference (active): ${refTab.styles.fontWeight}`);
        console.log(`   Note: Bold text (700) may have different baseline than normal (400)\n`);
      }
    }
    
    // Check distance difference
    const refDistance = refTab.measurements.distanceFromTextToBorder;
    const settingsDistance = settingsTab.measurements.distanceFromTextToBorder;
    const difference = Math.abs(settingsDistance - refDistance);
    
    if (difference > 1) {
      result.issues.push(`Settings tab has ${difference.toFixed(2)}px different positioning than reference tab`);
      console.log(`⚠️ Distance difference: ${difference.toFixed(2)}px\n`);
    }
  }

  if (refTab && manageTab) {
    console.log('Comparing Manage tab to reference tab:');
    
    // Check structural differences
    if (manageTab.structure.hasLabel !== refTab.structure.hasLabel) {
      result.hypotheses.push({
        id: 4,
        title: 'Manage tab label structure difference',
        description: `Manage tab ${manageTab.structure.hasLabel ? 'HAS' : 'LACKS'} label span, reference ${refTab.structure.hasLabel ? 'HAS' : 'LACKS'} label span`,
        evidence: {
          manage: manageTab.structure.hasLabel,
          reference: refTab.structure.hasLabel
        }
      });
      console.log(`🔍 HYPOTHESIS 4: Manage tab label structure difference`);
      console.log(`   Manage: ${manageTab.structure.hasLabel ? 'HAS label span' : 'NO label span'}`);
      console.log(`   Reference: ${refTab.structure.hasLabel ? 'HAS label span' : 'NO label span'}\n`);
    }
    
    if (manageTab.structure.directText && !refTab.structure.directText) {
      result.hypotheses.push({
        id: 5,
        title: 'Manage tab uses direct text instead of label span',
        description: `Manage tab has direct text content, reference uses label span. Direct text may position differently.`,
        evidence: {
          manage: manageTab.structure.directText,
          reference: refTab.structure.directText
        }
      });
      console.log(`🔍 HYPOTHESIS 5: Manage tab uses direct text`);
      console.log(`   Manage: Direct text "${manageTab.textContent}"`);
      console.log(`   Reference: ${refTab.structure.hasLabel ? 'Label span' : 'Other structure'}\n`);
    }
    
    // Check distance difference
    const refDistance = refTab.measurements.distanceFromTextToBorder;
    const manageDistance = manageTab.measurements.distanceFromTextToBorder;
    const difference = Math.abs(manageDistance - refDistance);
    
    if (difference > 1) {
      result.issues.push(`Manage tab has ${difference.toFixed(2)}px different positioning than reference tab`);
      console.log(`⚠️ Distance difference: ${difference.toFixed(2)}px\n`);
    }
  }

  // Summary
  console.log('==================================================');
  console.log('📋 SUMMARY');
  console.log('==================================================');
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


/**
 * Diagnostic: Log computed CSS values for SVG icons
 * 
 * This script logs all computed CSS properties for SVG elements inside message buttons
 * to understand why they're not visible despite being in the DOM.
 */
(function() {
  'use strict';

  function diagnoseIconCSS() {
    const results = {
      buttons: [],
      issues: [],
      debug: {}
    };

    // Try multiple selectors to find buttons
    let buttons = document.querySelectorAll('.message-footer-actions button');
    
    if (buttons.length === 0) {
      // Try alternative selectors
      buttons = document.querySelectorAll('.message-footer button');
      console.log('🔍 Tried .message-footer button, found:', buttons.length);
    }
    
    if (buttons.length === 0) {
      buttons = document.querySelectorAll('button.inline-reply-btn, button.repost-btn, button.reaction-btn, button.bookmark-btn, button.share-btn');
      console.log('🔍 Tried specific button classes, found:', buttons.length);
    }
    
    if (buttons.length === 0) {
      // Debug: Check what's actually in the DOM - try ALL possible selectors
      const footerActions = document.querySelectorAll('.message-footer-actions');
      const messages = document.querySelectorAll('.message, [data-message-id]');
      const allButtons = document.querySelectorAll('button[data-message-id]');
      const chatContainers = document.querySelectorAll('.chat-messages, .focus-messages-container');
      const allSVGs = document.querySelectorAll('svg[viewBox]');
      const replyButtons = document.querySelectorAll('.inline-reply-btn, .repost-btn, .reaction-btn, .bookmark-btn, .share-btn');
      
      // Check if we're in the right context (sidepanel vs main page)
      const isSidepanel = window.location.pathname.includes('sidepanel') || document.querySelector('#sidepanel-container');
      
      results.debug = {
        footerActionsCount: footerActions.length,
        messagesCount: messages.length,
        allButtonsWithMessageId: allButtons.length,
        chatContainersCount: chatContainers.length,
        allSVGsCount: allSVGs.length,
        replyButtonsCount: replyButtons.length,
        isSidepanel: !!isSidepanel,
        location: window.location.href,
        chatContainersHTML: chatContainers.length > 0 ? chatContainers[0].innerHTML.substring(0, 1000) : 'NONE',
        footerActionsHTML: footerActions.length > 0 ? footerActions[0].innerHTML.substring(0, 500) : 'NONE',
        firstMessageHTML: messages.length > 0 ? messages[0].outerHTML.substring(0, 1000) : 'NONE',
        firstSVGHTML: allSVGs.length > 0 ? allSVGs[0].outerHTML.substring(0, 200) : 'NONE'
      };
      
      console.error('❌ No buttons found. Debug info:', results.debug);
      console.log('\n💡 Suggestions:');
      console.log('1. Make sure messages are loaded (check if .chat-messages container exists)');
      console.log('2. Try running this after messages have rendered');
      console.log('3. Check if you\'re in the correct frame/context');
      return results;
    }

    console.log(`\n🔍 Analyzing ${buttons.length} buttons for CSS issues...\n`);
    console.log('✅ Found buttons! Proceeding with CSS analysis...\n');

    buttons.forEach((btn, index) => {
      if (index >= 5) return; // Only analyze first 5 buttons
      
      const svg = btn.querySelector('svg');
      if (!svg) {
        console.warn(`⚠️ Button ${index + 1} has no SVG element`);
        return;
      }

      const btnStyle = window.getComputedStyle(btn);
      const svgStyle = window.getComputedStyle(svg);
      const path = svg.querySelector('path');
      const pathStyle = path ? window.getComputedStyle(path) : null;

      const buttonData = {
        index: index + 1,
        className: btn.className,
        buttonComputed: {
          display: btnStyle.display,
          visibility: btnStyle.visibility,
          opacity: btnStyle.opacity,
          width: btnStyle.width,
          height: btnStyle.height,
          color: btnStyle.color,
          backgroundColor: btnStyle.backgroundColor,
          position: btnStyle.position,
          zIndex: btnStyle.zIndex,
          overflow: btnStyle.overflow,
          clip: btnStyle.clip,
          clipPath: btnStyle.clipPath
        },
        svgComputed: {
          display: svgStyle.display,
          visibility: svgStyle.visibility,
          opacity: svgStyle.opacity,
          width: svgStyle.width,
          height: svgStyle.height,
          fill: svgStyle.fill,
          color: svgStyle.color,
          position: svgStyle.position,
          zIndex: svgStyle.zIndex,
          overflow: svgStyle.overflow,
          clip: svgStyle.clip,
          clipPath: svgStyle.clipPath,
          transform: svgStyle.transform,
          scale: svgStyle.scale
        },
        pathComputed: pathStyle ? {
          fill: pathStyle.fill,
          opacity: pathStyle.opacity,
          visibility: pathStyle.visibility,
          display: pathStyle.display
        } : null,
        svgAttributes: {
          viewBox: svg.getAttribute('viewBox'),
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          fill: svg.getAttribute('fill'),
          class: svg.getAttribute('class')
        },
        issues: []
      };

      // Check for visibility issues
      if (btnStyle.display === 'none') {
        buttonData.issues.push('Button display: none');
      }
      if (btnStyle.visibility === 'hidden') {
        buttonData.issues.push('Button visibility: hidden');
      }
      if (parseFloat(btnStyle.opacity) === 0) {
        buttonData.issues.push('Button opacity: 0');
      }
      if (btnStyle.width === '0px' || btnStyle.height === '0px') {
        buttonData.issues.push(`Button size: ${btnStyle.width} x ${btnStyle.height}`);
      }

      if (svgStyle.display === 'none') {
        buttonData.issues.push('SVG display: none');
      }
      if (svgStyle.visibility === 'hidden') {
        buttonData.issues.push('SVG visibility: hidden');
      }
      if (parseFloat(svgStyle.opacity) === 0) {
        buttonData.issues.push('SVG opacity: 0');
      }
      if (svgStyle.width === '0px' || svgStyle.height === '0px') {
        buttonData.issues.push(`SVG size: ${svgStyle.width} x ${svgStyle.height}`);
      }
      if (svgStyle.fill === 'none' || svgStyle.fill === 'transparent') {
        buttonData.issues.push(`SVG fill: ${svgStyle.fill}`);
      }
      if (svgStyle.color === 'transparent' || svgStyle.color === 'rgba(0, 0, 0, 0)') {
        buttonData.issues.push(`SVG color: ${svgStyle.color}`);
      }

      if (pathStyle) {
        if (pathStyle.fill === 'none' || pathStyle.fill === 'transparent') {
          buttonData.issues.push(`Path fill: ${pathStyle.fill}`);
        }
        if (parseFloat(pathStyle.opacity) === 0) {
          buttonData.issues.push('Path opacity: 0');
        }
      }

      // Check if button is actually visible and has space
      const rect = btn.getBoundingClientRect();
      buttonData.actualSize = {
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
        hasSpace: rect.width >= 18 && rect.height >= 18
      };

      const svgRect = svg.getBoundingClientRect();
      buttonData.svgActualSize = {
        width: svgRect.width,
        height: svgRect.height,
        visible: svgRect.width > 0 && svgRect.height > 0,
        hasSpace: svgRect.width >= 18 && svgRect.height >= 18
      };
      
      // Check parent container
      const footerActions = btn.closest('.message-footer-actions');
      if (footerActions) {
        const footerRect = footerActions.getBoundingClientRect();
        const footerStyle = window.getComputedStyle(footerActions);
        buttonData.footerActions = {
          width: footerRect.width,
          height: footerRect.height,
          display: footerStyle.display,
          flexDirection: footerStyle.flexDirection,
          justifyContent: footerStyle.justifyContent,
          alignItems: footerStyle.alignItems,
          gap: footerStyle.gap,
          padding: footerStyle.padding,
          hasSpace: footerRect.width > 0 && footerRect.height > 0
        };
      }

      results.buttons.push(buttonData);

      // Log first button in detail
      if (index === 0) {
        console.log('📊 First Button Analysis:');
        console.log('Button:', buttonData.className);
        console.log('Button Computed:', buttonData.buttonComputed);
        console.log('SVG Computed:', buttonData.svgComputed);
        console.log('SVG Attributes:', buttonData.svgAttributes);
        console.log('Path Computed:', buttonData.pathComputed);
        console.log('Actual Sizes:', {
          button: buttonData.actualSize,
          svg: buttonData.svgActualSize
        });
        if (buttonData.issues.length > 0) {
          console.error('❌ Issues found:', buttonData.issues);
        } else {
          console.log('✅ No obvious CSS issues detected');
        }
      }
    });

    // Summary
    const totalIssues = results.buttons.reduce((sum, b) => sum + b.issues.length, 0);
    console.log(`\n📊 Summary: ${results.buttons.length} buttons analyzed, ${totalIssues} issues found`);

    results.issues = results.buttons.flatMap(b => b.issues);
    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.diagnoseIconCSS = diagnoseIconCSS;
    console.log('✅ Icon CSS diagnostic loaded. Run: diagnoseIconCSS()');
  }
})();


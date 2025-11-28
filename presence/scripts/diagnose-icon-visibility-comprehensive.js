/**
 * Comprehensive Icon Visibility Diagnostic
 * 
 * Checks:
 * 1. Are icons in the HTML string?
 * 2. Are icons in the DOM?
 * 3. Are icons visible (CSS)?
 * 4. Are SVG elements present?
 * 5. Are buttons rendered?
 * 6. What's the actual HTML structure?
 */
(function() {
  'use strict';

  function diagnoseIconVisibility() {
    const results = {
      messages: [],
      summary: {},
      issues: []
    };

    // Get all message elements
    const allElements = document.querySelectorAll('[data-message-id]');
    const messages = Array.from(allElements).filter(el => {
      return el.classList.contains('message') || 
             el.querySelector('.message-content-wrapper') !== null ||
             (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
    });

    if (messages.length === 0) {
      results.issues.push({
        severity: 'ERROR',
        message: 'No messages found in DOM',
        recommendation: 'Ensure messages are being rendered'
      });
      return results;
    }

    let messagesWithFooterActions = 0;
    let messagesWithButtons = 0;
    let messagesWithSVG = 0;
    let messagesWithVisibleButtons = 0;
    let messagesWithIconHTML = 0;

    messages.forEach((msgEl, index) => {
      const messageId = msgEl.getAttribute('data-message-id');
      const footerActions = msgEl.querySelector('.message-footer-actions');
      
      const messageResult = {
        index: index + 1,
        messageId: messageId?.substring(0, 20),
        hasFooterActions: !!footerActions,
        buttons: [],
        svgElements: [],
        cssIssues: [],
        htmlStructure: {}
      };

      if (footerActions) {
        messagesWithFooterActions++;
        
        // Check for buttons
        const buttons = footerActions.querySelectorAll('button');
        messageResult.buttons = Array.from(buttons).map(btn => {
          const btnStyle = window.getComputedStyle(btn);
          const svg = btn.querySelector('svg');
          const svgStyle = svg ? window.getComputedStyle(svg) : null;
          
          return {
            className: btn.className,
            hasSVG: svg !== null,
            svgContent: svg?.outerHTML?.substring(0, 100) || 'NO SVG',
            innerHTML: btn.innerHTML.substring(0, 200),
            computedStyle: {
              display: btnStyle.display,
              visibility: btnStyle.visibility,
              opacity: btnStyle.opacity,
              width: btnStyle.width,
              height: btnStyle.height,
              color: btnStyle.color,
              backgroundColor: btnStyle.backgroundColor
            },
            svgComputedStyle: svgStyle ? {
              fill: svgStyle.fill,
              color: svgStyle.color,
              opacity: svgStyle.opacity,
              width: svgStyle.width,
              height: svgStyle.height
            } : null,
            isVisible: btnStyle.display !== 'none' && 
                      btnStyle.visibility !== 'hidden' &&
                      parseFloat(btnStyle.opacity) > 0,
            // Check if color might be invisible (same as background or transparent)
            colorIssue: btnStyle.color === 'rgba(0, 0, 0, 0)' || 
                       btnStyle.color === 'transparent' ||
                       btnStyle.color === btnStyle.backgroundColor
          };
        });

        if (buttons.length > 0) {
          messagesWithButtons++;
          
          // Check if buttons have SVG
          const hasSVG = Array.from(buttons).some(btn => btn.querySelector('svg') !== null);
          if (hasSVG) {
            messagesWithSVG++;
          }

          // Check if buttons are visible
          const visibleButtons = messageResult.buttons.filter(b => b.isVisible);
          if (visibleButtons.length > 0) {
            messagesWithVisibleButtons++;
          }

          // Check if HTML contains icon-like content
          const footerHTML = footerActions.innerHTML;
          if (footerHTML.includes('<svg') || footerHTML.includes('viewBox')) {
            messagesWithIconHTML++;
          }
        }

        // Check CSS issues
        const footerComputed = window.getComputedStyle(footerActions);
        if (footerComputed.display === 'none') {
          messageResult.cssIssues.push('Footer actions display: none');
        }
        if (footerComputed.visibility === 'hidden') {
          messageResult.cssIssues.push('Footer actions visibility: hidden');
        }
        if (parseFloat(footerComputed.opacity) === 0) {
          messageResult.cssIssues.push('Footer actions opacity: 0');
        }

        // Get HTML structure
        messageResult.htmlStructure = {
          footerHTML: footerActions.innerHTML.substring(0, 500),
          buttonCount: buttons.length,
          svgCount: footerActions.querySelectorAll('svg').length
        };
      } else {
        messageResult.cssIssues.push('No .message-footer-actions element found');
      }

      results.messages.push(messageResult);
    });

    // Check for color issues
    const colorIssues = results.messages.flatMap(msg => 
      msg.buttons.filter(btn => btn.colorIssue).map(btn => ({
        messageId: msg.messageId,
        buttonClass: btn.className,
        color: btn.computedStyle.color,
        backgroundColor: btn.computedStyle.backgroundColor,
        issue: 'Button color might be invisible (transparent or same as background)'
      }))
    );

    // Summary
    results.summary = {
      totalMessages: messages.length,
      messagesWithFooterActions,
      messagesWithButtons,
      messagesWithSVG,
      messagesWithVisibleButtons,
      messagesWithIconHTML,
      colorIssues: colorIssues.length,
      issues: []
    };

    // Identify issues
    if (messagesWithFooterActions < messages.length) {
      results.issues.push({
        severity: 'ERROR',
        message: `${messages.length - messagesWithFooterActions} messages missing .message-footer-actions`,
        recommendation: 'Ensure UnifiedMessageRenderer generates footer-actions div'
      });
    }

    if (messagesWithButtons < messages.length) {
      results.issues.push({
        severity: 'ERROR',
        message: `${messages.length - messagesWithButtons} messages missing buttons`,
        recommendation: 'Check button generation in UnifiedMessageRenderer'
      });
    }

    if (messagesWithSVG < messages.length) {
      results.issues.push({
        severity: 'ERROR',
        message: `${messages.length - messagesWithSVG} messages missing SVG icons`,
        recommendation: 'Check XIcons generation - SVG elements not present in buttons'
      });
    }

    if (messagesWithVisibleButtons < messages.length) {
      results.issues.push({
        severity: 'WARN',
        message: `${messages.length - messagesWithVisibleButtons} messages have invisible buttons`,
        recommendation: 'Check CSS - buttons may be hidden by display:none, visibility:hidden, or opacity:0'
      });
    }

    if (colorIssues.length > 0) {
      results.issues.push({
        severity: 'ERROR',
        message: `${colorIssues.length} buttons have color issues (transparent or same as background)`,
        recommendation: 'Check button color values - icons may be invisible due to color/contrast issues',
        details: colorIssues
      });
    }

    // Log first message details
    if (results.messages.length > 0) {
      console.log('\n🔍 First Message Analysis:');
      console.log('Message ID:', results.messages[0].messageId);
      console.log('Has Footer Actions:', results.messages[0].hasFooterActions);
      console.log('Button Count:', results.messages[0].buttons.length);
      console.log('Buttons:', results.messages[0].buttons.map(b => ({
        class: b.className,
        hasSVG: b.hasSVG,
        isVisible: b.isVisible,
        display: b.computedStyle.display,
        visibility: b.computedStyle.visibility
      })));
      console.log('CSS Issues:', results.messages[0].cssIssues);
      console.log('HTML Preview:', results.messages[0].htmlStructure.footerHTML.substring(0, 300));
    }

    console.log('\n📊 Summary:');
    console.log(results.summary);
    console.log('\n⚠️ Issues:');
    results.issues.forEach(issue => {
      console.log(`[${issue.severity}] ${issue.message}`);
      console.log(`   → ${issue.recommendation}`);
    });

    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.diagnoseIconVisibility = diagnoseIconVisibility;
    console.log('✅ Comprehensive icon visibility diagnostic loaded. Run: diagnoseIconVisibility()');
  }
})();


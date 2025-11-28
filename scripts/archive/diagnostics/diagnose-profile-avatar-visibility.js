/**
 * DIAGNOSTIC: Profile Avatar Visibility (CSS/DOM Issues)
 * 
 * This script diagnoses why the profile avatar is not visible in the UI:
 * 1. Checks DOM element existence and positioning
 * 2. Checks CSS properties (display, visibility, opacity, z-index)
 * 3. Checks container hierarchy and overflow
 * 4. Checks if element is off-screen or hidden
 * 5. Tests manual visibility fixes
 * 
 * Run in browser console on extension sidepanel
 */

async function diagnoseProfileAvatarVisibility() {
  console.log('🔍 ===== PROFILE AVATAR VISIBILITY DIAGNOSTIC =====');
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    cssIssues: [],
    rootCauses: [],
    recommendations: []
  };

  // CHECK 1: DOM Element Existence
  console.log('\n1️⃣ Checking DOM Element Existence...');
  const avatarContainer = document.getElementById('user-avatar-container');
  const userAvatar = avatarContainer?.querySelector('.user-avatar');
  const avatarContainerDiv = userAvatar?.querySelector('.avatar-container');
  const auraElement = userAvatar?.querySelector('.avatar-aura-background');
  const avatarImg = userAvatar?.querySelector('img');
  
  results.checks.dom = {
    avatarContainer: !!avatarContainer,
    userAvatar: !!userAvatar,
    avatarContainerDiv: !!avatarContainerDiv,
    auraElement: !!auraElement,
    avatarImg: !!avatarImg
  };

  console.log(`   ${results.checks.dom.avatarContainer ? '✅' : '❌'} user-avatar-container: ${results.checks.dom.avatarContainer ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.userAvatar ? '✅' : '❌'} .user-avatar: ${results.checks.dom.userAvatar ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarContainerDiv ? '✅' : '❌'} .avatar-container: ${results.checks.dom.avatarContainerDiv ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.auraElement ? '✅' : '❌'} .avatar-aura-background: ${results.checks.dom.auraElement ? 'Found' : 'Missing'}`);
  console.log(`   ${results.checks.dom.avatarImg ? '✅' : '❌'} img: ${results.checks.dom.avatarImg ? 'Found' : 'Missing'}`);

  if (!avatarContainer) {
    results.rootCauses.push('user-avatar-container element does not exist in DOM');
    console.log('\n✅ ===== DIAGNOSTIC COMPLETE (Cannot continue - container missing) =====');
    return results;
  }

  // CHECK 2: CSS Properties - Display, Visibility, Opacity
  console.log('\n2️⃣ Checking CSS Properties (Display, Visibility, Opacity)...');
  const containerStyle = window.getComputedStyle(avatarContainer);
  const userAvatarStyle = userAvatar ? window.getComputedStyle(userAvatar) : null;
  const avatarContainerDivStyle = avatarContainerDiv ? window.getComputedStyle(avatarContainerDiv) : null;
  const auraStyle = auraElement ? window.getComputedStyle(auraElement) : null;
  const imgStyle = avatarImg ? window.getComputedStyle(avatarImg) : null;

  results.checks.css = {
    container: {
      display: containerStyle.display,
      visibility: containerStyle.visibility,
      opacity: containerStyle.opacity,
      position: containerStyle.position,
      zIndex: containerStyle.zIndex,
      width: containerStyle.width,
      height: containerStyle.height,
      top: containerStyle.top,
      left: containerStyle.left,
      overflow: containerStyle.overflow
    },
    userAvatar: userAvatarStyle ? {
      display: userAvatarStyle.display,
      visibility: userAvatarStyle.visibility,
      opacity: userAvatarStyle.opacity,
      position: userAvatarStyle.position,
      zIndex: userAvatarStyle.zIndex,
      width: userAvatarStyle.width,
      height: userAvatarStyle.height
    } : null,
    avatarContainerDiv: avatarContainerDivStyle ? {
      display: avatarContainerDivStyle.display,
      visibility: avatarContainerDivStyle.visibility,
      opacity: avatarContainerDivStyle.opacity,
      position: avatarContainerDivStyle.position,
      zIndex: avatarContainerDivStyle.zIndex,
      width: avatarContainerDivStyle.width,
      height: avatarContainerDivStyle.height
    } : null,
    aura: auraStyle ? {
      display: auraStyle.display,
      visibility: auraStyle.visibility,
      opacity: auraStyle.opacity,
      position: auraStyle.position,
      zIndex: auraStyle.zIndex,
      backgroundColor: auraStyle.backgroundColor
    } : null,
    img: imgStyle ? {
      display: imgStyle.display,
      visibility: imgStyle.visibility,
      opacity: imgStyle.opacity,
      position: imgStyle.position,
      zIndex: imgStyle.zIndex,
      width: imgStyle.width,
      height: imgStyle.height,
      src: avatarImg.src
    } : null
  };

  console.log('   📋 Container CSS:');
  console.log(`      display: ${results.checks.css.container.display}`);
  console.log(`      visibility: ${results.checks.css.container.visibility}`);
  console.log(`      opacity: ${results.checks.css.container.opacity}`);
  console.log(`      position: ${results.checks.css.container.position}`);
  console.log(`      z-index: ${results.checks.css.container.zIndex}`);
  console.log(`      width: ${results.checks.css.container.width}, height: ${results.checks.css.container.height}`);
  console.log(`      top: ${results.checks.css.container.top}, left: ${results.checks.css.container.left}`);
  console.log(`      overflow: ${results.checks.css.container.overflow}`);

  if (userAvatarStyle) {
    console.log('   📋 .user-avatar CSS:');
    console.log(`      display: ${results.checks.css.userAvatar.display}`);
    console.log(`      visibility: ${results.checks.css.userAvatar.visibility}`);
    console.log(`      opacity: ${results.checks.css.userAvatar.opacity}`);
    console.log(`      z-index: ${results.checks.css.userAvatar.zIndex}`);
  }

  if (auraStyle) {
    console.log('   📋 .avatar-aura-background CSS:');
    console.log(`      display: ${results.checks.css.aura.display}`);
    console.log(`      visibility: ${results.checks.css.aura.visibility}`);
    console.log(`      opacity: ${results.checks.css.aura.opacity}`);
    console.log(`      position: ${results.checks.css.aura.position}`);
    console.log(`      z-index: ${results.checks.css.aura.zIndex}`);
    console.log(`      background-color: ${results.checks.css.aura.backgroundColor}`);
  }

  // Check for visibility issues
  if (containerStyle.display === 'none') {
    results.cssIssues.push('Container has display: none');
    results.rootCauses.push('user-avatar-container has display: none - element is hidden');
  }
  if (containerStyle.visibility === 'hidden') {
    results.cssIssues.push('Container has visibility: hidden');
    results.rootCauses.push('user-avatar-container has visibility: hidden - element is invisible');
  }
  if (parseFloat(containerStyle.opacity) < 0.01) {
    results.cssIssues.push(`Container has opacity: ${containerStyle.opacity} (too low)`);
    results.rootCauses.push(`user-avatar-container has opacity ${containerStyle.opacity} - element is nearly invisible`);
  }
  if (userAvatarStyle && userAvatarStyle.display === 'none') {
    results.cssIssues.push('.user-avatar has display: none');
    results.rootCauses.push('.user-avatar has display: none - element is hidden');
  }
  if (userAvatarStyle && userAvatarStyle.visibility === 'hidden') {
    results.cssIssues.push('.user-avatar has visibility: hidden');
    results.rootCauses.push('.user-avatar has visibility: hidden - element is invisible');
  }

  // CHECK 3: Element Position and Bounding Box
  console.log('\n3️⃣ Checking Element Position and Bounding Box...');
  const containerRect = avatarContainer.getBoundingClientRect();
  const userAvatarRect = userAvatar?.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  results.checks.position = {
    container: {
      x: containerRect.x,
      y: containerRect.y,
      width: containerRect.width,
      height: containerRect.height,
      top: containerRect.top,
      left: containerRect.left,
      right: containerRect.right,
      bottom: containerRect.bottom,
      visible: containerRect.width > 0 && containerRect.height > 0
    },
    userAvatar: userAvatarRect ? {
      x: userAvatarRect.x,
      y: userAvatarRect.y,
      width: userAvatarRect.width,
      height: userAvatarRect.height,
      top: userAvatarRect.top,
      left: userAvatarRect.left,
      right: userAvatarRect.right,
      bottom: userAvatarRect.bottom,
      visible: userAvatarRect.width > 0 && userAvatarRect.height > 0
    } : null,
    viewport: {
      width: viewportWidth,
      height: viewportHeight
    },
    isOffScreen: containerRect.right < 0 || containerRect.left > viewportWidth || 
                 containerRect.bottom < 0 || containerRect.top > viewportHeight,
    hasZeroSize: containerRect.width === 0 || containerRect.height === 0
  };

  console.log(`   📋 Container bounding box:`);
  console.log(`      x: ${containerRect.x}, y: ${containerRect.y}`);
  console.log(`      width: ${containerRect.width}, height: ${containerRect.height}`);
  console.log(`      top: ${containerRect.top}, left: ${containerRect.left}`);
  console.log(`      right: ${containerRect.right}, bottom: ${containerRect.bottom}`);
  console.log(`      Viewport: ${viewportWidth}x${viewportHeight}`);
  console.log(`      Is off-screen: ${results.checks.position.isOffScreen}`);
  console.log(`      Has zero size: ${results.checks.position.hasZeroSize}`);

  if (results.checks.position.isOffScreen) {
    results.rootCauses.push('Container is positioned off-screen (outside viewport)');
  }
  if (results.checks.position.hasZeroSize) {
    results.rootCauses.push('Container has zero width or height - element is not visible');
  }

  // CHECK 4: Parent Container Hierarchy
  console.log('\n4️⃣ Checking Parent Container Hierarchy...');
  let parent = avatarContainer.parentElement;
  let depth = 0;
  const parentChain = [];
  while (parent && depth < 10) {
    const parentStyle = window.getComputedStyle(parent);
    const parentRect = parent.getBoundingClientRect();
    parentChain.push({
      tag: parent.tagName,
      id: parent.id,
      className: parent.className,
      display: parentStyle.display,
      visibility: parentStyle.visibility,
      opacity: parentStyle.opacity,
      overflow: parentStyle.overflow,
      position: parentStyle.position,
      zIndex: parentStyle.zIndex,
      width: parentRect.width,
      height: parentRect.height,
      isVisible: parentRect.width > 0 && parentRect.height > 0 && 
                 parentStyle.display !== 'none' && 
                 parentStyle.visibility !== 'hidden'
    });
    if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
      results.cssIssues.push(`Parent ${parent.tagName}${parent.id ? '#' + parent.id : ''} has display: ${parentStyle.display} or visibility: ${parentStyle.visibility}`);
      results.rootCauses.push(`Parent container ${parent.tagName}${parent.id ? '#' + parent.id : ''} is hiding the avatar`);
    }
    parent = parent.parentElement;
    depth++;
  }

  results.checks.parentChain = parentChain;
  console.log(`   📋 Parent chain (${parentChain.length} levels):`);
  parentChain.forEach((p, i) => {
    console.log(`      ${i + 1}. ${p.tagName}${p.id ? '#' + p.id : ''}${p.className ? '.' + p.className.split(' ').join('.') : ''} - display: ${p.display}, visible: ${p.isVisible}`);
  });

  // CHECK 5: Test Manual Visibility Fix
  console.log('\n5️⃣ Testing Manual Visibility Fix...');
  try {
    const originalDisplay = containerStyle.display;
    const originalVisibility = containerStyle.visibility;
    const originalOpacity = containerStyle.opacity;

    // Try to make it visible
    avatarContainer.style.display = 'block';
    avatarContainer.style.visibility = 'visible';
    avatarContainer.style.opacity = '1';
    avatarContainer.style.position = 'relative';
    avatarContainer.style.zIndex = '1000';

    // Wait a moment for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    const newRect = avatarContainer.getBoundingClientRect();
    const isNowVisible = newRect.width > 0 && newRect.height > 0 && 
                        newRect.top >= 0 && newRect.left >= 0 &&
                        newRect.top < viewportHeight && newRect.left < viewportWidth;

    console.log(`   ${isNowVisible ? '✅' : '❌'} After manual fix, container is ${isNowVisible ? 'VISIBLE' : 'STILL HIDDEN'}`);
    console.log(`   📋 New bounding box: ${newRect.width}x${newRect.height} at (${newRect.left}, ${newRect.top})`);

    if (isNowVisible) {
      results.checks.manualFix = { success: true, message: 'Avatar became visible after manual CSS fix' };
      results.recommendations.push('Apply CSS fix: Ensure container has display: block, visibility: visible, opacity: 1, position: relative, z-index: 1000');
    } else {
      results.checks.manualFix = { success: false, message: 'Avatar still not visible after manual CSS fix' };
      results.rootCauses.push('Manual CSS fix did not make avatar visible - deeper issue (possibly parent container or layout)');
    }

    // Restore original styles
    avatarContainer.style.display = originalDisplay;
    avatarContainer.style.visibility = originalVisibility;
    avatarContainer.style.opacity = originalOpacity;
  } catch (error) {
    console.log(`   ❌ Error testing manual fix: ${error.message}`);
    results.checks.manualFix = { success: false, error: error.message };
  }

  // ROOT CAUSE ANALYSIS
  console.log('\n🔍 ===== ROOT CAUSE ANALYSIS =====');
  if (results.rootCauses.length === 0) {
    console.log('   ✅ No obvious root causes identified');
    console.log('   📋 Avatar should be visible. Check browser DevTools for additional CSS issues.');
  } else {
    results.rootCauses.forEach((cause, i) => {
      console.log(`\n   ${i + 1}. ${cause}`);
    });
  }

  // RECOMMENDATIONS
  console.log('\n💡 ===== RECOMMENDATIONS =====');
  if (results.cssIssues.length > 0) {
    results.recommendations.push('Fix CSS visibility issues: Ensure all containers in hierarchy have display: block/flex, visibility: visible, opacity: 1');
  }
  if (results.checks.position.isOffScreen) {
    results.recommendations.push('Fix positioning: Ensure container is within viewport bounds');
  }
  if (results.checks.position.hasZeroSize) {
    results.recommendations.push('Fix sizing: Ensure container has explicit width and height');
  }
  if (results.checks.parentChain.some(p => !p.isVisible)) {
    results.recommendations.push('Fix parent containers: Check all parent elements for display: none or visibility: hidden');
  }
  if (results.checks.manualFix?.success) {
    results.recommendations.push('Apply the manual CSS fix permanently in ProfileManager or CSS file');
  }

  results.recommendations.forEach((rec, i) => {
    console.log(`\n   ${i + 1}. ${rec}`);
  });

  console.log('\n✅ ===== DIAGNOSTIC COMPLETE =====');
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.diagnoseProfileAvatarVisibility = diagnoseProfileAvatarVisibility;
  console.log('✅ Profile Avatar Visibility Diagnostic loaded! Run: window.diagnoseProfileAvatarVisibility()');
}



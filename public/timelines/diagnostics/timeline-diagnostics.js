/**
 * Timeline Diagnostic Script
 * Comprehensive diagnostic tool to identify root causes of avatar, aura, and interaction display issues
 * 
 * Usage: Open browser console on timeline page and run:
 *   window.timelineDiagnostics.runFullDiagnostic()
 * 
 * Note: This is a debugging tool - kept as plain JavaScript for easy browser console access.
 * No TypeScript compilation needed.
 */

(function() {
  'use strict';

  const diagnostics = {
    /**
     * Run full diagnostic suite
     */
    async runFullDiagnostic() {
      console.log('🔍 ========================================');
      console.log('🔍 TIMELINE FULL DIAGNOSTIC');
      console.log('🔍 ========================================\n');

      const results = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        issues: [],
        warnings: [],
        data: {}
      };

      // 1. Check API Response
      console.log('📡 STEP 1: Checking API Response...');
      const apiResults = await this.checkAPIResponse();
      results.data.api = apiResults;
      if (apiResults.issues.length > 0) results.issues.push(...apiResults.issues);
      if (apiResults.warnings.length > 0) results.warnings.push(...apiResults.warnings);

      // 2. Check Timeline Data Structure
      console.log('\n📊 STEP 2: Checking Timeline Data Structure...');
      const dataResults = this.checkTimelineData();
      results.data.timeline = dataResults;
      if (dataResults.issues.length > 0) results.issues.push(...dataResults.issues);
      if (dataResults.warnings.length > 0) results.warnings.push(...dataResults.warnings);

      // 3. Check User Data in Activities
      console.log('\n👤 STEP 3: Checking User Data in Activities...');
      const userResults = this.checkUserData();
      results.data.users = userResults;
      if (userResults.issues.length > 0) results.issues.push(...userResults.issues);
      if (userResults.warnings.length > 0) results.warnings.push(...userResults.warnings);

      // 4. Check Avatar Rendering
      console.log('\n🖼️ STEP 4: Checking Avatar Rendering...');
      const avatarResults = this.checkAvatarRendering();
      results.data.avatars = avatarResults;
      if (avatarResults.issues.length > 0) results.issues.push(...avatarResults.issues);
      if (avatarResults.warnings.length > 0) results.warnings.push(...avatarResults.warnings);

      // 5. Check Aura Colors
      console.log('\n🎨 STEP 5: Checking Aura Colors...');
      const auraResults = this.checkAuraColors();
      results.data.aura = auraResults;
      if (auraResults.issues.length > 0) results.issues.push(...auraResults.issues);
      if (auraResults.warnings.length > 0) results.warnings.push(...auraResults.warnings);

      // 6. Check Message Interactions
      console.log('\n💬 STEP 6: Checking Message Interactions...');
      const interactionResults = this.checkMessageInteractions();
      results.data.interactions = interactionResults;
      if (interactionResults.issues.length > 0) results.issues.push(...interactionResults.issues);
      if (interactionResults.warnings.length > 0) results.warnings.push(...interactionResults.warnings);

      // 7. Check Profile Header
      console.log('\n👤 STEP 7: Checking Profile Header...');
      const profileResults = this.checkProfileHeader();
      results.data.profile = profileResults;
      if (profileResults.issues.length > 0) results.issues.push(...profileResults.issues);
      if (profileResults.warnings.length > 0) results.warnings.push(...profileResults.warnings);

      // 8. Check Database vs Display
      console.log('\n🗄️ STEP 8: Checking Database vs Display...');
      const dbResults = await this.checkDatabaseVsDisplay();
      results.data.database = dbResults;
      if (dbResults.issues.length > 0) results.issues.push(...dbResults.issues);
      if (dbResults.warnings.length > 0) results.warnings.push(...dbResults.warnings);

      // Summary
      console.log('\n📋 ========================================');
      console.log('📋 DIAGNOSTIC SUMMARY');
      console.log('📋 ========================================');
      console.log(`❌ Issues Found: ${results.issues.length}`);
      console.log(`⚠️ Warnings: ${results.warnings.length}`);
      
      if (results.issues.length > 0) {
        console.log('\n❌ ISSUES:');
        results.issues.forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue}`);
        });
      }

      if (results.warnings.length > 0) {
        console.log('\n⚠️ WARNINGS:');
        results.warnings.forEach((warning, i) => {
          console.log(`  ${i + 1}. ${warning}`);
        });
      }

      console.log('\n📊 Full Results:', results);
      window.timelineDiagnosticsResults = results;
      return results;
    },

    /**
     * Check API response data
     */
    async checkAPIResponse() {
      const results = { issues: [], warnings: [], data: null };
      
      try {
        const identifier = window.location.pathname.split('/').pop();
        if (!identifier) {
          results.issues.push('No identifier found in URL');
          return results;
        }

        const url = `/api/timelines/${identifier}`;
        console.log(`  Fetching: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(window.timelineApp?.query?.getAuthHeaders() || {})
          }
        });

        if (!response.ok) {
          results.issues.push(`API returned ${response.status}: ${response.statusText}`);
          return results;
        }

        const data = await response.json();
        results.data = data;

        // Check structure
        if (!data.timeline) {
          results.issues.push('API response missing timeline object');
        } else {
          if (!data.timeline.activities) {
            results.issues.push('API response missing activities array');
          } else {
            console.log(`  ✅ Found ${data.timeline.activities.length} activities`);
            
            // Check first few activities for user data
            data.timeline.activities.slice(0, 3).forEach((activity, i) => {
              if (!activity.data) {
                results.issues.push(`Activity ${i} missing data object`);
              } else if (!activity.data.user) {
                results.warnings.push(`Activity ${i} (${activity.type}) missing user object`);
              } else {
                const user = activity.data.user;
                if (!user.avatarUrl && !user.avatar_url) {
                  results.warnings.push(`Activity ${i} (${activity.type}) user missing avatarUrl`);
                }
                if (!user.auraColor && !user.aura_color) {
                  results.warnings.push(`Activity ${i} (${activity.type}) user missing auraColor`);
                }
                if (!user.name && !user.handle) {
                  results.warnings.push(`Activity ${i} (${activity.type}) user missing name/handle`);
                }
              }
            });
          }
        }

        // Check for reaction counts
        const messages = data.timeline?.activities?.filter(a => a.type === 'message') || [];
        messages.forEach((msg, i) => {
          if (msg.data.reactionCount === undefined) {
            results.warnings.push(`Message ${i} missing reactionCount`);
          }
          if (!msg.data.reactions) {
            results.warnings.push(`Message ${i} missing reactions array`);
          }
        });

      } catch (error) {
        results.issues.push(`API check failed: ${error.message}`);
      }

      return results;
    },

    /**
     * Check timeline data structure in memory
     */
    checkTimelineData() {
      const results = { issues: [], warnings: [], data: null };

      if (!window.timelineApp) {
        results.issues.push('window.timelineApp not found');
        return results;
      }

      const identifier = window.location.pathname.split('/').pop();
      const timeline = window.timelineApp.timelineManager?.getTimeline(identifier);
      
      if (!timeline) {
        results.issues.push('Timeline not found in TimelineManager');
        return results;
      }

      results.data = timeline;
      console.log(`  ✅ Timeline found with ${timeline.activities?.length || 0} activities`);

      // Check activities
      if (timeline.activities) {
        timeline.activities.forEach((activity, i) => {
          if (!activity.data?.user) {
            results.warnings.push(`Activity ${i} (${activity.type}) missing user data`);
          }
        });
      }

      return results;
    },

    /**
     * Check user data in activities
     */
    checkUserData() {
      const results = { issues: [], warnings: [], users: {} };

      if (!window.timelineApp) return results;

      const identifier = window.location.pathname.split('/').pop();
      const timeline = window.timelineApp.timelineManager?.getTimeline(identifier);
      
      if (!timeline || !timeline.activities) {
        results.issues.push('No timeline activities found');
        return results;
      }

      timeline.activities.forEach((activity, i) => {
        const user = activity.data?.user;
        if (!user) {
          results.warnings.push(`Activity ${i} (${activity.type}): No user data`);
          return;
        }

        const userId = user.id || activity.userId;
        if (!results.users[userId]) {
          results.users[userId] = {
            id: userId,
            name: user.name,
            handle: user.handle,
            avatarUrl: user.avatarUrl || user.avatar_url,
            auraColor: user.auraColor || user.aura_color,
            auraIntensity: user.auraIntensity || user.aura_intensity,
            activities: []
          };
        }

        results.users[userId].activities.push({
          index: i,
          type: activity.type,
          hasAvatar: !!(user.avatarUrl || user.avatar_url),
          hasAura: !!(user.auraColor || user.aura_color),
          avatarUrl: user.avatarUrl || user.avatar_url,
          auraColor: user.auraColor || user.aura_color
        });

        // Check for issues
        if (!user.avatarUrl && !user.avatar_url) {
          results.warnings.push(`Activity ${i} (${activity.type}): User ${userId} missing avatar`);
        }
        if (!user.auraColor && !user.aura_color) {
          results.warnings.push(`Activity ${i} (${activity.type}): User ${userId} missing aura color`);
        }
        if (!user.name && !user.handle) {
          results.warnings.push(`Activity ${i} (${activity.type}): User ${userId} missing name/handle`);
        }
      });

      console.log(`  ✅ Found ${Object.keys(results.users).length} unique users`);
      Object.values(results.users).forEach(user => {
        console.log(`    - ${user.name || user.handle || user.id}: avatar=${!!user.avatarUrl}, aura=${user.auraColor || 'none'}`);
      });

      return results;
    },

    /**
     * Check avatar rendering in DOM
     */
    checkAvatarRendering() {
      const results = { issues: [], warnings: [], avatars: [] };

      // Check profile header avatar
      const profileAvatar = document.getElementById('profile-header-avatar');
      if (profileAvatar) {
        const img = profileAvatar.querySelector('img');
        const fallback = profileAvatar.querySelector('.avatar-fallback');
        const computedStyle = window.getComputedStyle(profileAvatar);
        
        results.avatars.push({
          location: 'profile-header',
          hasImage: !!img,
          hasFallback: !!fallback,
          imageSrc: img?.src,
          imageDisplay: img ? window.getComputedStyle(img).display : null,
          fallbackDisplay: fallback ? window.getComputedStyle(fallback).display : null,
          containerWidth: computedStyle.width,
          containerHeight: computedStyle.height,
          containerDisplay: computedStyle.display,
          containerPosition: computedStyle.position,
          containerLeft: computedStyle.left,
          containerTop: computedStyle.top,
          containerTransform: computedStyle.transform
        });

        if (!img && !fallback) {
          results.issues.push('Profile header avatar has no image or fallback');
        }
        if (img && window.getComputedStyle(img).display === 'none') {
          results.warnings.push('Profile header avatar image is hidden');
        }
        if (computedStyle.left !== '0px' && computedStyle.left !== 'auto') {
          results.warnings.push(`Profile header avatar off-center: left=${computedStyle.left}`);
        }
      } else {
        results.issues.push('Profile header avatar element not found');
      }

      // Check timeline items
      const timelineItems = document.querySelectorAll('.timeline-item, .message');
      console.log(`  ✅ Found ${timelineItems.length} timeline items in DOM`);

      timelineItems.forEach((item, i) => {
        const avatar = item.querySelector('.activity-avatar, .avatar-container, .avatar');
        if (!avatar) {
          results.warnings.push(`Timeline item ${i} has no avatar element`);
          return;
        }

        const img = avatar.querySelector('img');
        const fallback = avatar.querySelector('.avatar-fallback, .avatar-fallback-text');
        const aura = avatar.querySelector('.avatar-aura');
        const computedStyle = window.getComputedStyle(avatar);

        results.avatars.push({
          location: `timeline-item-${i}`,
          hasImage: !!img,
          hasFallback: !!fallback,
          hasAura: !!aura,
          imageSrc: img?.src,
          imageDisplay: img ? window.getComputedStyle(img).display : null,
          fallbackDisplay: fallback ? window.getComputedStyle(fallback).display : null,
          auraBgColor: aura ? window.getComputedStyle(aura).backgroundColor : null,
          auraBorderColor: aura ? window.getComputedStyle(aura).borderColor : null,
          auraOpacity: aura ? window.getComputedStyle(aura).opacity : null
        });

        if (!img && !fallback) {
          results.issues.push(`Timeline item ${i} has no avatar image or fallback`);
        }
        if (img && window.getComputedStyle(img).display === 'none' && !fallback) {
          results.warnings.push(`Timeline item ${i} avatar image hidden and no fallback visible`);
        }
      });

      return results;
    },

    /**
     * Check aura colors
     */
    checkAuraColors() {
      const results = { issues: [], warnings: [], colors: {} };

      // Get expected aura colors from API/data
      if (window.timelineApp) {
        const identifier = window.location.pathname.split('/').pop();
        const timeline = window.timelineApp.timelineManager?.getTimeline(identifier);
        
        if (timeline && timeline.activities) {
          timeline.activities.forEach((activity, i) => {
            const user = activity.data?.user;
            if (user) {
              const userId = user.id || activity.userId;
              const expectedColor = user.auraColor || user.aura_color;
              
              if (expectedColor) {
                if (!results.colors[userId]) {
                  results.colors[userId] = {
                    userId,
                    name: user.name || user.handle,
                    expected: expectedColor,
                    displayed: []
                  };
                }
              }
            }
          });
        }
      }

      // Check displayed aura colors in DOM
      const auraElements = document.querySelectorAll('.avatar-aura');
      console.log(`  ✅ Found ${auraElements.length} aura elements in DOM`);

      auraElements.forEach((aura, i) => {
        const computedStyle = window.getComputedStyle(aura);
        const bgColor = computedStyle.backgroundColor;
        const borderColor = computedStyle.borderColor;
        const opacity = computedStyle.opacity;

        // Try to find associated user
        const avatarContainer = aura.closest('.avatar-container, .activity-avatar, .avatar');
        const userId = avatarContainer?.dataset?.userId || avatarContainer?.querySelector('[data-user-id]')?.dataset?.userId;

        if (userId && results.colors[userId]) {
          results.colors[userId].displayed.push({
            index: i,
            backgroundColor: bgColor,
            borderColor: borderColor,
            opacity: opacity,
            matches: this.colorsMatch(results.colors[userId].expected, bgColor)
          });

          if (!this.colorsMatch(results.colors[userId].expected, bgColor)) {
            results.issues.push(`Aura color mismatch for user ${userId}: expected ${results.colors[userId].expected}, got ${bgColor}`);
          }
        } else {
          results.warnings.push(`Aura element ${i} has no associated user ID`);
        }

        // Check for lavender (#e6e6fa, rgb(230, 230, 250), etc.)
        if (this.isLavenderColor(bgColor)) {
          results.issues.push(`Aura element ${i} has lavender color: ${bgColor} (likely fallback/default)`);
        }
      });

      return results;
    },

    /**
     * Check message interactions and counts
     */
    checkMessageInteractions() {
      const results = { issues: [], warnings: [], messages: [] };

      const messageElements = document.querySelectorAll('.message, .timeline-item[data-activity-type="message"]');
      console.log(`  ✅ Found ${messageElements.length} message elements in DOM`);

      messageElements.forEach((msg, i) => {
        const messageId = msg.dataset.messageId || msg.dataset.activityId;
        
        const interactions = {
          index: i,
          messageId,
          hasReplyButton: !!msg.querySelector('.inline-reply-btn'),
          hasReactionButton: !!msg.querySelector('.reaction-btn'),
          hasBookmarkButton: !!msg.querySelector('.bookmark-btn'),
          hasShareButton: !!msg.querySelector('.share-btn'),
          replyCount: null,
          reactionCount: null
        };

        // Check reply count
        const replyBtn = msg.querySelector('.inline-reply-btn');
        if (replyBtn) {
          const countEl = replyBtn.querySelector('.icon-count');
          if (countEl) {
            interactions.replyCount = parseInt(countEl.textContent) || 0;
            if (window.getComputedStyle(countEl).display === 'none' && interactions.replyCount > 0) {
              results.warnings.push(`Message ${i} reply count hidden but value is ${interactions.replyCount}`);
            }
          } else {
            results.warnings.push(`Message ${i} has reply button but no count element`);
          }
        } else {
          results.warnings.push(`Message ${i} missing reply button`);
        }

        // Check reaction count
        const reactionBtn = msg.querySelector('.reaction-btn');
        if (reactionBtn) {
          const countEl = reactionBtn.querySelector('.icon-count');
          if (countEl) {
            interactions.reactionCount = parseInt(countEl.textContent) || 0;
            if (window.getComputedStyle(countEl).display === 'none' && interactions.reactionCount > 0) {
              results.warnings.push(`Message ${i} reaction count hidden but value is ${interactions.reactionCount}`);
            }
          } else {
            results.warnings.push(`Message ${i} has reaction button but no count element`);
          }
        } else {
          results.warnings.push(`Message ${i} missing reaction button`);
        }

        results.messages.push(interactions);
      });

      return results;
    },

    /**
     * Check profile header
     */
    checkProfileHeader() {
      const results = { issues: [], warnings: [], data: {} };

      const header = document.getElementById('timeline-profile-header');
      if (!header) {
        results.issues.push('Profile header element not found');
        return results;
      }

      const avatar = document.getElementById('profile-header-avatar');
      const name = document.getElementById('profile-header-name');
      const handle = document.getElementById('profile-header-handle');
      const model = document.getElementById('profile-header-model');

      results.data = {
        hasAvatar: !!avatar,
        hasName: !!name,
        hasHandle: !!handle,
        hasModel: !!model,
        nameText: name?.textContent,
        handleText: handle?.textContent,
        modelText: model?.textContent
      };

      if (avatar) {
        const computedStyle = window.getComputedStyle(avatar);
        results.data.avatar = {
          width: computedStyle.width,
          height: computedStyle.height,
          position: computedStyle.position,
          left: computedStyle.left,
          top: computedStyle.top,
          transform: computedStyle.transform,
          marginLeft: computedStyle.marginLeft,
          marginTop: computedStyle.marginTop
        };

        // Check if off-center
        if (computedStyle.left !== '0px' && computedStyle.left !== 'auto') {
          results.issues.push(`Profile avatar off-center: left=${computedStyle.left}, transform=${computedStyle.transform}`);
        }
      }

      return results;
    },

    /**
     * Check database values vs what's displayed
     */
    async checkDatabaseVsDisplay() {
      const results = { issues: [], warnings: [], comparisons: [] };

      try {
        const identifier = window.location.pathname.split('/').pop();
        if (!identifier) return results;

        // Fetch user data from API
        const userId = window.timelineApp?.currentProfileId;
        if (!userId) {
          results.warnings.push('Cannot determine user ID for database check');
          return results;
        }

        const userResponse = await fetch(`/v1/users/${userId}`, {
          headers: window.timelineApp?.query?.getAuthHeaders() || {}
        });

        if (userResponse.ok) {
          const dbUser = await userResponse.json();
          
          // Compare with displayed values
          const displayedName = document.getElementById('profile-header-name')?.textContent;
          const displayedHandle = document.getElementById('profile-header-handle')?.textContent;
          const displayedAvatar = document.getElementById('profile-header-avatar')?.querySelector('img')?.src;

          results.comparisons.push({
            field: 'name',
            database: dbUser.name,
            displayed: displayedName,
            match: dbUser.name === displayedName
          });

          results.comparisons.push({
            field: 'handle',
            database: dbUser.handle,
            displayed: displayedHandle?.replace('@', ''),
            match: dbUser.handle === displayedHandle?.replace('@', '')
          });

          results.comparisons.push({
            field: 'avatarUrl',
            database: dbUser.avatarUrl || dbUser.avatar_url,
            displayed: displayedAvatar,
            match: (dbUser.avatarUrl || dbUser.avatar_url) === displayedAvatar
          });

          results.comparisons.push({
            field: 'auraColor',
            database: dbUser.auraColor || dbUser.aura_color,
            displayed: this.getDisplayedAuraColor(),
            match: this.colorsMatch(dbUser.auraColor || dbUser.aura_color, this.getDisplayedAuraColor())
          });

          // Check for mismatches
          results.comparisons.forEach(comp => {
            if (!comp.match) {
              results.issues.push(`${comp.field} mismatch: DB=${comp.database}, Display=${comp.displayed}`);
            }
          });
        }

      } catch (error) {
        results.issues.push(`Database check failed: ${error.message}`);
      }

      return results;
    },

    /**
     * Helper: Check if two colors match (handles hex, rgb, etc.)
     */
    colorsMatch(color1, color2) {
      if (!color1 || !color2) return false;
      
      // Convert to RGB for comparison
      const rgb1 = this.colorToRgb(color1);
      const rgb2 = this.colorToRgb(color2);
      
      if (!rgb1 || !rgb2) return color1 === color2;
      
      // Allow small differences (rounding errors)
      return Math.abs(rgb1.r - rgb2.r) < 2 &&
             Math.abs(rgb1.g - rgb2.g) < 2 &&
             Math.abs(rgb1.b - rgb2.b) < 2;
    },

    /**
     * Helper: Convert color to RGB
     */
    colorToRgb(color) {
      if (!color) return null;
      
      // If already rgb/rgba
      if (color.startsWith('rgb')) {
        const match = color.match(/\d+/g);
        if (match && match.length >= 3) {
          return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
        }
      }
      
      // If hex
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
      }
      
      return null;
    },

    /**
     * Helper: Check if color is lavender
     */
    isLavenderColor(color) {
      const rgb = this.colorToRgb(color);
      if (!rgb) return false;
      
      // Lavender is approximately rgb(230, 230, 250) or similar
      // Check if it's in the lavender range
      return rgb.r > 200 && rgb.r < 240 &&
             rgb.g > 200 && rgb.g < 240 &&
             rgb.b > 240 && rgb.b < 255;
    },

    /**
     * Helper: Get displayed aura color from profile header
     */
    getDisplayedAuraColor() {
      const avatar = document.getElementById('profile-header-avatar');
      if (!avatar) return null;
      
      // Check for aura element first
      const aura = avatar.querySelector('.avatar-aura');
      if (aura) {
        return window.getComputedStyle(aura).backgroundColor;
      }
      
      // Fallback: check border color (fallback rendering)
      const borderColor = window.getComputedStyle(avatar).borderColor;
      if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
        return borderColor;
      }
      
      return null;
    }
  };

  // Expose to window
  window.timelineDiagnostics = diagnostics;
  
  console.log('✅ Timeline Diagnostics loaded. Run window.timelineDiagnostics.runFullDiagnostic() to start.');
})();










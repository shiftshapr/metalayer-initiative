/**
 * Visibility Presence Diagnostic
 *
 * Targets:
 * 1. Profile status display (Last Seen vs Online) consistency
 * 2. Visibility tab access flow when user is invisible
 * 3. Go Invisible button behavior (should route to Discuss tab)
 * 4. Structured interaction logs for root cause analysis
 */

(function() {
  'use strict';

  // Helper to format last seen display (from VisibilityManager)
  function formatLastSeenDisplay(lastSeen) {
    if (!lastSeen) return 'Last seen unknown';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMs < 0) {
      return 'Last seen just now';
    }
    if (diffSeconds < 60) {
      return `Last seen ${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
    } else if (diffMinutes < 60) {
      return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
  }

  // Helper to format user display name (from Fallbacks)
  function formatUserDisplayName(user) {
    if (!user) return 'Unknown User';
    if (user.name) return user.name;
    if (user.displayName) return user.displayName;
    if (user.handle) return user.handle;
    if (user.email) return user.email.split('@')[0];
    return 'Unknown User';
  }

  class VisibilityPresenceDiagnostic {
    constructor() {
      this.interactionLogs = [];
      this.listenersAttached = false;
    }

    async run() {
      const timestamp = new Date().toISOString();
      
      console.group('🔍 Visibility Presence Diagnostic - Full Analysis');
      console.info('Timestamp:', timestamp);
      
      // 1. Check visibility data sources
      console.group('📊 Step 1: Visibility Data Sources');
      const visibilityData = window.currentVisibilityData;
      const visibilityDataUnfiltered = window.currentVisibilityDataUnfiltered;
      console.log('window.currentVisibilityData:', visibilityData);
      console.log('window.currentVisibilityDataUnfiltered:', visibilityDataUnfiltered);
      const contextUsers = this.getVisibilityUsers();
      console.log('Parsed users count:', contextUsers.length);
      if (contextUsers.length > 0) {
        console.log('Sample user:', contextUsers[0]);
      } else {
        console.warn('⚠️ No users found in visibility data!');
        console.log('Checking if data structure is different...');
        console.log('currentVisibilityData type:', typeof visibilityData);
        console.log('currentVisibilityData keys:', visibilityData ? Object.keys(visibilityData) : 'null');
        if (visibilityData?.active) {
          console.log('currentVisibilityData.active:', visibilityData.active);
          console.log('currentVisibilityData.active type:', typeof visibilityData.active);
          console.log('currentVisibilityData.active isArray:', Array.isArray(visibilityData.active));
        }
      }
      console.groupEnd();
      
      // 2. Check current user state
      console.group('👤 Step 2: Current User State');
      const currentUser = window.currentUser;
      console.log('window.currentUser:', currentUser);
      const userVisibility = this.getUserVisibilityState();
      console.log('User visibility state:', userVisibility);
      console.log('User isVisible:', currentUser?.isVisible);
      console.log('User visibilityEnabled:', currentUser?.visibilityEnabled);
      console.groupEnd();
      
      // 3. Check page context
      console.group('🌐 Step 3: Page Context');
      const currentPageId = this.resolveCurrentPageId();
      console.log('Current page ID:', currentPageId);
      console.log('window.currentUrlData:', window.currentUrlData);
      console.log('window.tabContextManager exists:', !!window.tabContextManager);
      console.groupEnd();
      
      // 4. Check DOM elements
      console.group('🏗️ Step 4: DOM Elements');
      const discussTab = document.getElementById('discuss-tab');
      const visibilityTab = document.getElementById('visibility-tab');
      const visibilityTabBtn = document.querySelector('[data-tab="visibility-tab"]');
      const goInvisibleBtn = document.getElementById('go-invisible-btn');
      const modal = document.getElementById('visibility-access-modal');
      
      console.log('discuss-tab element:', discussTab ? 'EXISTS' : 'MISSING');
      if (discussTab) {
        console.log('  - Display:', window.getComputedStyle(discussTab).display);
        console.log('  - Active class:', discussTab.classList.contains('active'));
        const discussUsers = discussTab.querySelectorAll('.item, .profile-row, li, [data-user-id]');
        console.log('  - User elements found:', discussUsers.length);
        if (discussUsers.length > 0) {
          console.log('  - Sample element:', discussUsers[0]);
          const sampleStatus = discussUsers[0].querySelector('.user-status');
          console.log('  - Sample status element:', sampleStatus ? sampleStatus.textContent : 'MISSING');
        }
      }
      
      console.log('visibility-tab element:', visibilityTab ? 'EXISTS' : 'MISSING');
      if (visibilityTab) {
        console.log('  - Display:', window.getComputedStyle(visibilityTab).display);
        console.log('  - Active class:', visibilityTab.classList.contains('active'));
        const visibilityUsers = visibilityTab.querySelectorAll('.item, .profile-row, li, [data-user-id]');
        console.log('  - User elements found:', visibilityUsers.length);
        if (visibilityUsers.length > 0) {
          console.log('  - Sample element:', visibilityUsers[0]);
          const sampleStatus = visibilityUsers[0].querySelector('.user-status');
          console.log('  - Sample status element:', sampleStatus ? sampleStatus.textContent : 'MISSING');
        }
      }
      
      console.log('visibility-tab button:', visibilityTabBtn ? 'EXISTS' : 'MISSING');
      console.log('go-invisible-btn:', goInvisibleBtn ? 'EXISTS' : 'MISSING');
      console.log('visibility-access-modal:', modal ? 'EXISTS' : 'MISSING');
      if (modal) {
        const modalDisplay = window.getComputedStyle(modal).display;
        console.log('  - Display:', modalDisplay);
        console.log('  - Z-index:', window.getComputedStyle(modal).zIndex);
      }
      console.groupEnd();
      
      // 5. Evaluate profile statuses
      console.group('📋 Step 5: Profile Status Evaluation');
      const expectations = this.evaluateProfileStatuses(contextUsers);
      console.log('Evaluated expectations:', expectations.length);
      
      if (expectations.length === 0) {
        console.warn('⚠️ No profile status expectations generated!');
        console.log('This means no users were found to evaluate.');
      } else {
        console.table(expectations.map(item => ({
          user: item.name,
          onSamePage: item.onSamePage ? 'YES' : 'NO',
          expectedType: item.expectedType,
          expected: item.expectedStatus,
          actual: item.domStatusText ?? '(missing)',
          matches: item.matches ? '✓' : '✗',
          reason: item.reason
        })));
      }
      
      const mismatches = expectations.filter(item => !item.matches);
      if (mismatches.length > 0) {
        console.warn('⚠️ Profile status mismatches detected:', mismatches.length);
        mismatches.forEach(mismatch => {
          console.warn('  ✗', mismatch.name);
          console.warn('    Expected:', mismatch.expectedStatus, `(${mismatch.expectedType})`);
          console.warn('    Found:', mismatch.domStatusText ?? '(missing)');
          console.warn('    Reason:', mismatch.reason);
          console.warn('    Selector:', mismatch.domStatusElementSelector ?? 'none');
        });
      } else if (expectations.length > 0) {
        console.log('✅ All profile statuses match expectations');
      }
      console.groupEnd();
      
      // 6. Interaction logs
      console.group('📝 Step 6: Interaction Logs');
      console.log('Total interactions logged:', this.interactionLogs.length);
      if (this.interactionLogs.length > 0) {
        console.table(this.interactionLogs.slice(-10));
      } else {
        console.log('No interactions logged yet. Try clicking Visibility tab or Go Invisible button.');
      }
      console.groupEnd();
      
      // 7. Summary
      console.group('📊 Summary');
      const result = {
        timestamp,
        visibleUserCount: contextUsers.length,
        profileStatusExpectations: expectations,
        mismatches: mismatches,
        interactionLogs: this.interactionLogs.slice(-20),
        modalState: this.getModalState(),
        goInvisibleButtonPresent: !!goInvisibleBtn,
        visibilityTabButtonPresent: !!visibilityTabBtn,
        discussTabExists: !!discussTab,
        visibilityTabExists: !!visibilityTab,
        currentUserVisible: userVisibility,
        currentPageId: currentPageId
      };
      
      console.log('Visible users found:', result.visibleUserCount);
      console.log('Status expectations:', result.profileStatusExpectations.length);
      console.log('Mismatches:', result.mismatches.length);
      console.log('Current user visible:', result.currentUserVisible);
      console.log('Current page ID:', result.currentPageId);
      console.log('Modal exists:', result.modalState.exists);
      console.log('Modal display:', result.modalState.display);
      console.log('Go Invisible button:', result.goInvisibleButtonPresent ? 'EXISTS' : 'MISSING');
      console.log('Visibility tab button:', result.visibilityTabButtonPresent ? 'EXISTS' : 'MISSING');
      
      console.groupEnd();
      console.groupEnd();

      window.visibilityPresenceInteractionLog = this.interactionLogs;
      window.visibilityPresenceDiagnosticResult = result;
      return result;
    }

    attachInteractionMonitors() {
      if (this.listenersAttached) {
        return;
      }
      this.listenersAttached = true;

      document.addEventListener('click', (event) => {
        const visibilityTabBtn = event.target.closest('[data-tab="visibility-tab"]');
        if (visibilityTabBtn) {
          this.captureInteraction('visibility_tab_click', 'Visibility tab clicked');
          setTimeout(() => {
            this.captureInteraction('visibility_tab_click', 'Post-click state');
          }, 400);
        }
      }, true);

      document.addEventListener('click', (event) => {
        const goInvisibleBtn = event.target.closest('#go-invisible-btn');
        if (goInvisibleBtn) {
          this.captureInteraction('go_invisible_click', 'Go Invisible clicked');
          setTimeout(() => {
            this.captureInteraction('go_invisible_click', 'Post-click state');
          }, 600);
        }
      }, true);
    }

    captureInteraction(action, note) {
      const entry = {
        timestamp: new Date().toISOString(),
        action,
        userVisible: this.getUserVisibilityState(),
        modalVisible: this.isModalVisible(),
        discussTabActive: this.isTabActive('discuss-tab'),
        visibilityTabActive: this.isTabActive('visibility-tab'),
        notes: note
      };
      this.interactionLogs.push(entry);
      if (this.interactionLogs.length > 200) {
        this.interactionLogs.shift();
      }
      console.log(`📝 Visibility Interaction (${action}):`, entry);
    }

    getVisibilityUsers() {
      const data = window.currentVisibilityData?.active || window.currentVisibilityDataUnfiltered?.active || [];
      return Array.isArray(data) ? data : [];
    }

    evaluateProfileStatuses(users) {
      const currentPageId = this.resolveCurrentPageId();
      const discussTab = document.getElementById('discuss-tab');
      const visibilityTab = document.getElementById('visibility-tab');

      return users.map((user, index) => {
        const userId = user.id || user.email || `unknown-${index}`;
        const name = formatUserDisplayName(user);
        const onSamePage = Boolean(user.page_id && currentPageId && user.page_id === currentPageId);
        const expectedType = user.isActive && onSamePage ? 'online' : 'last_seen';
        const expectedStatus = expectedType === 'online'
          ? 'Online on this page'
          : formatLastSeenDisplay(user.lastSeen || null);
        const domData = this.findStatusDomData(userId, user.email, name, discussTab, visibilityTab);
        const matches = !!domData.text && this.compareStatus(expectedType, expectedStatus, domData.text);

        const reason = matches
          ? 'Status matches expectation'
          : domData.text
            ? 'Status text mismatched expectation'
            : 'Status element missing in DOM';

        return {
          userId,
          name,
          onSamePage,
          expectedStatus,
          expectedType,
          domStatusText: domData.text,
          domStatusElementSelector: domData.selector,
          matches,
          reason
        };
      });
    }

    findStatusDomData(userId, email, name, discussTab, visibilityTab) {
      const selectors = [];
      const escapedUserId = userId ? this.escapeSelectorValue(userId) : null;
      const escapedEmail = email ? this.escapeSelectorValue(email) : null;
      const escapedName = this.escapeSelectorValue(name);

      if (escapedUserId) {
        selectors.push(`[data-user-id="${escapedUserId}"] .user-status`, `.user-status[data-user-id="${escapedUserId}"]`);
      }
      if (escapedEmail) {
        selectors.push(`[data-email="${escapedEmail}"] .user-status`, `.user-status[data-email="${escapedEmail}"]`);
      }
      selectors.push(`.user-status[data-name="${escapedName}"]`);

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return { text: element.textContent.trim(), selector };
        }
      }

      const sections = [visibilityTab, discussTab];
      for (const section of sections) {
        if (!section) continue;
        const items = Array.from(section.querySelectorAll('.item, .profile-row, li'));
        for (const item of items) {
          const nameEl = item.querySelector('.user-name, .profile-name, .user-display-name');
          const statusEl = item.querySelector('.user-status');
          if (nameEl && statusEl && nameEl.textContent?.trim() === name) {
            return {
              text: statusEl.textContent?.trim() || null,
              selector: this.buildSelectorPath(statusEl)
            };
          }
        }
      }

      return { text: null, selector: null };
    }

    compareStatus(expectedType, expectedText, actual) {
      const normalizedActual = actual.toLowerCase();
      if (expectedType === 'online') {
        return normalizedActual.includes('online');
      }
      if (normalizedActual.includes('last seen')) {
        return true;
      }
      const normalizedExpected = expectedText.toLowerCase().replace(/\s+/g, ' ').trim();
      return normalizedActual.includes(normalizedExpected.split(' ').slice(0, 3).join(' '));
    }

    getModalState() {
      const modal = document.getElementById('visibility-access-modal');
      if (!modal) {
        return { exists: false, display: null };
      }
      const display = window.getComputedStyle(modal).display;
      return { exists: true, display };
    }

    isModalVisible() {
      const modal = document.getElementById('visibility-access-modal');
      return modal ? window.getComputedStyle(modal).display !== 'none' : false;
    }

    isTabActive(tabId) {
      const tab = document.getElementById(tabId);
      if (!tab) return false;
      if (tab.classList.contains('active')) return true;
      return window.getComputedStyle(tab).display !== 'none';
    }

    getUserVisibilityState() {
      const currentUser = window.currentUser;
      if (!currentUser) return null;
      if (typeof currentUser.isVisible === 'boolean') return currentUser.isVisible;
      if (typeof currentUser.visibilityEnabled === 'boolean') return currentUser.visibilityEnabled;
      return null;
    }

    resolveCurrentPageId() {
      const tabContainer = window.tabContextManager?.getTabContainer('visibility-tab');
      if (tabContainer?.dataset.pageId) {
        return tabContainer.dataset.pageId;
      }
      const pageId = window.currentUrlData?.pageId;
      if (pageId) {
        return pageId;
      }
      const firstMessage = document.querySelector('[data-page-id]');
      const pageIdAttr = firstMessage?.getAttribute('data-page-id');
      return pageIdAttr || null;
    }

    buildSelectorPath(element) {
      const path = [];
      let current = element;
      while (current && path.length < 5) {
        const id = current.id ? `#${current.id}` : current.className ? `.${Array.from(current.classList).join('.')}` : current.tagName.toLowerCase();
        path.unshift(id);
        current = current.parentElement;
      }
      return path.join(' > ');
    }

    escapeSelectorValue(value) {
      if (typeof value !== 'string') {
        return '';
      }
      if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(value);
      }
      return value.replace(/["\\]/g, '\\$&');
    }
  }

  const visibilityPresenceDiagnostic = new VisibilityPresenceDiagnostic();

  async function runVisibilityPresenceDiagnostic() {
    visibilityPresenceDiagnostic.attachInteractionMonitors();
    return visibilityPresenceDiagnostic.run();
  }

  if (typeof window !== 'undefined') {
    window.runVisibilityPresenceDiagnostic = runVisibilityPresenceDiagnostic;
    visibilityPresenceDiagnostic.attachInteractionMonitors();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          runVisibilityPresenceDiagnostic();
        }, 1500);
      });
    } else {
      setTimeout(() => {
        runVisibilityPresenceDiagnostic();
      }, 1500);
    }

    console.log('✅ Visibility Presence Diagnostic script loaded. Run window.runVisibilityPresenceDiagnostic() for manual execution.');
  }
})();


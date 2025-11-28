/**
 * VISIBILITY TAB RENDERER
 * Renders the visibility tab UI with proper trace formatting and filtering
 * 
 * CRITICAL: Filters out entire user rows (avatar + status) when trace limit is 0 or exceeded
 */

import { VisibilityTraceFormatter, type TraceLimitConfig } from '../../../utils/VisibilityTraceFormatter.js';
import { Logger } from '../../../utils/Logger.js';

interface UserDisplayData {
  id: string;
  email?: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  auraColor?: string;
  lastSeen?: string;
  isActive?: boolean;
  page_id?: string;
  pageId?: string;
  enterTime?: string;
  onlineAt?: string;
  [key: string]: unknown;
}

/**
 * Update visible tab UI with proper trace formatting and filtering
 * CRITICAL: Filters out entire rows when trace limit is 0 or exceeded
 * 
 * @param avatars - Array of user display data (optional for backward compatibility)
 * @param currentPageId - Optional current page ID (will be resolved if not provided)
 * @param traceLimit - Optional trace limit (will be loaded from preferences if not provided)
 */
export async function updateVisibleTab(
  avatars?: UserDisplayData[],
  currentPageId?: string | null,
  traceLimit?: number
): Promise<void> {
  // Handle backward compatibility - if no avatars provided, try to get from window
  if (!avatars || avatars.length === 0) {
    const win = window as Window & {
      currentVisibilityData?: { active: UserDisplayData[] };
    };
    if (win.currentVisibilityData?.active) {
      avatars = win.currentVisibilityData.active;
    } else {
      Logger.warn?.('⚠️ VISIBILITY: No avatars provided and none in currentVisibilityData', null, 'visibility');
      return;
    }
  }

  Logger.debug?.('🔍 VISIBILITY: updateVisibleTab called with avatars:', { count: avatars.length }, 'visibility');

  // Store visibility data globally for real-time aura color access
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      currentVisibilityData?: { active: UserDisplayData[] };
      currentVisibilityDataUnfiltered?: { active: UserDisplayData[] };
      currentUser?: { id?: string; email?: string; [key: string]: unknown };
      currentUrlData?: { pageId?: string; [key: string]: unknown };
      tabContextManager?: {
        getTabContainer?: (tabId: string) => HTMLElement | null;
      };
      userPreferencesManager?: {
        getPreference: (key: string) => Promise<number | null>;
      };
      updateVisibleTab?: typeof updateVisibleTab;
      visibilityStatusRefreshInterval?: ReturnType<typeof setInterval>;
      setVisibilityStatus?: (visible: boolean) => Promise<void>;
      visibilitySettingsManager?: {
        visibilityToggle?: { checked: boolean };
        saveVisibility?: () => Promise<void>;
      };
      switchTab?: (tabId: string) => void;
    };

    win.currentVisibilityData = { active: avatars };
    win.currentVisibilityDataUnfiltered = { active: avatars };
  }

  Logger.debug?.('🔄 VISIBILITY: Stored visibility data globally for real-time aura access', null, 'visibility');

  // Clear any existing visibility update timer
  if (typeof window !== 'undefined' && (window as { visibilityUpdateTimer?: ReturnType<typeof setInterval> }).visibilityUpdateTimer) {
    clearInterval((window as { visibilityUpdateTimer?: ReturnType<typeof setInterval> }).visibilityUpdateTimer);
  }

  // Get visible tab
  let visibleTab: HTMLElement | null = null;
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      tabContextManager?: {
        getTabContainer?: (tabId: string) => HTMLElement | null;
      };
    };
    if (win.tabContextManager?.getTabContainer) {
      visibleTab = win.tabContextManager.getTabContainer('visibility-tab');
      if (!visibleTab) {
        Logger.warn?.('⚠️ VISIBILITY: visibility-tab not found or not active', null, 'visibility');
        visibleTab = typeof document !== 'undefined' ? document.getElementById('visibility-tab') : null;
      }
    } else {
      visibleTab = typeof document !== 'undefined' ? document.getElementById('visibility-tab') : null;
    }
  }

  if (!visibleTab) {
    Logger.debug?.('❌ VISIBILITY: visibleTab element not found', null, 'visibility');
    return;
  }

  // Ensure we're updating the correct tab
  if (visibleTab.id !== 'visibility-tab') {
    Logger.error?.('❌ VISIBILITY: Wrong tab element passed to updateVisibleTab', null, 'visibility');
    return;
  }

  const visibilityTab = document.getElementById('visibility-tab');
  if (!visibilityTab) {
    Logger.warn?.('⚠️ VISIBILITY: Visibility tab not found in DOM - SKIPPING', null, 'visibility');
    return;
  }

  // Get current user for filtering
  const win = window as Window & {
    currentUser?: { id?: string; email?: string; [key: string]: unknown };
    stateManager?: {
      getState: (path?: string) => unknown;
    };
  };

  const currentUser = win.currentUser || 
    (win.stateManager?.getState('currentUser') as { id?: string; email?: string } | undefined) ||
    null;
  const currentUserEmail = currentUser?.email || null;
  const currentUserId = currentUser?.id;

  // Get current page ID for status determination
  const resolveCurrentPageId = (): string | null => {
    const win = window as Window & {
      tabContextManager?: {
        getTabContainer?: (tabId: string) => HTMLElement | null;
      };
      currentUrlData?: { pageId?: string; [key: string]: unknown };
    };

    const tabContainer = win.tabContextManager?.getTabContainer?.('visibility-tab');
    if (tabContainer?.dataset.pageId) {
      return tabContainer.dataset.pageId;
    }

    const pageId = win.currentUrlData?.pageId;
    if (pageId) {
      return pageId as string;
    }

    const firstMessage = document.querySelector('[data-page-id]');
    const pageIdAttr = firstMessage?.getAttribute('data-page-id');
    return pageIdAttr || null;
  };

  const resolvedCurrentPageId = currentPageId !== undefined ? currentPageId : resolveCurrentPageId();

  // Filter out current user
  const usersWithoutCurrent = avatars.filter(avatar => {
    const avatarId = avatar.id;
    const isCurrentUser = (currentUserId && avatarId && String(avatarId) === String(currentUserId)) ||
      (!currentUserId && avatar.email === currentUserEmail) ||
      (currentUser !== null && currentUser !== undefined && avatar.id === currentUser.id);
    return !isCurrentUser;
  });

  Logger.debug?.('🔍 VISIBILITY: Filtered current user', {
    original: avatars.length,
    filtered: usersWithoutCurrent.length
  }, 'visibility');

  // Load trace limit from preferences (or use provided value)
  let resolvedTraceLimit = traceLimit;
  if (resolvedTraceLimit === undefined) {
    resolvedTraceLimit = 30; // Default
    try {
      const prefsWin = window as Window & {
        userPreferencesManager?: {
          getPreference: (key: string) => Promise<number | null>;
        };
      };
      if (prefsWin.userPreferencesManager) {
        const limit = await prefsWin.userPreferencesManager.getPreference('visibilityTraceLimit');
        // Validate and cast to number
        if (typeof limit === 'number') {
          resolvedTraceLimit = limit;
        } else if (limit !== null && limit !== undefined) {
          const numLimit = Number(limit);
          resolvedTraceLimit = isNaN(numLimit) ? 30 : numLimit;
        } else {
          resolvedTraceLimit = 30;
        }
      }
    } catch (error) {
      Logger.warn?.('⚠️ VISIBILITY: Failed to load trace limit, using default', error, 'visibility');
    }
  }

  const traceLimitConfig: TraceLimitConfig = { limit: resolvedTraceLimit };

  // CRITICAL: Filter users based on trace limit BEFORE rendering
  // If user has left page and trace limit is 0 or exceeded, hide entire row
  const usersToShow = usersWithoutCurrent.filter(user => {
    const isActive = user.isActive === true;
    const userPageId = user.page_id || user.pageId;
    const onSamePage = Boolean(userPageId && resolvedCurrentPageId && userPageId === resolvedCurrentPageId);
    const shouldShowOnline = isActive && onSamePage;

    // If user is active on same page, always show
    if (shouldShowOnline) {
      return true;
    }

    // User has left page - check trace limit
    // If limit is 0, hide all users who have left
    if (traceLimitConfig.limit === 0) {
      return false; // Hide entire row
    }

    // If unlimited (-1), show all
    if (traceLimitConfig.limit === -1) {
      return true;
    }

    // Check if within limit
    return VisibilityTraceFormatter.shouldShowTrace(user.lastSeen, traceLimitConfig);
  });

  Logger.debug?.('🔍 VISIBILITY: Filtered by trace limit', {
    before: usersWithoutCurrent.length,
    after: usersToShow.length,
    traceLimit: traceLimitConfig.limit
  }, 'visibility');

  Logger.debug?.('🔍 VISIBILITY: Current page ID:', { pageId: currentPageId }, 'visibility');

  // COMP METHOD: Create full UI structure with header, search, count, and Go Invisible button
  visibilityTab.innerHTML = '';

  // Create main container
  const visibleUsersContainer = document.createElement('div');
  visibleUsersContainer.className = 'visible-users';

  // COMP METHOD: Create header with count, search, and Go Invisible button
  const visibleHeader = document.createElement('div');
  visibleHeader.className = 'visible-header';
  visibleHeader.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; background: var(--background-secondary); border-radius: 6px;';

  // COMP METHOD: Create count display
  const visibleCount = document.createElement('div');
  visibleCount.className = 'visible-count';
  visibleCount.style.cssText = 'font-weight: bold; color: var(--text-primary);';
  visibleCount.textContent = `${usersToShow.length} visible`;
  visibleHeader.appendChild(visibleCount);

  // COMP METHOD: Create search input
  const visibleSearch = document.createElement('input');
  visibleSearch.type = 'text';
  visibleSearch.id = 'visible-search';
  visibleSearch.placeholder = 'Search users...';
  visibleSearch.style.cssText = 'flex: 1; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--background-primary); color: var(--text-primary); font-size: 12px;';
  visibleHeader.appendChild(visibleSearch);

  // COMP METHOD: Create Go Invisible button
  const goInvisibleBtn = document.createElement('button');
  goInvisibleBtn.id = 'go-invisible-btn';
  goInvisibleBtn.textContent = 'Go Invisible';
  goInvisibleBtn.style.cssText = 'padding: 4px 8px; background: var(--accent-color); color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;';
  visibleHeader.appendChild(goInvisibleBtn);
  visibleUsersContainer.appendChild(visibleHeader);

  // COMP METHOD: Create user list
  const itemList = document.createElement('ul');
  itemList.className = 'item-list';

  // Render each user
  if (usersToShow.length > 0) {
    for (const user of usersToShow) {
      try {
        const isActive = user.isActive === true;
        const userName = user.name || user.email?.split('@')[0] || 'Unknown';
        const avatarUrl = user.avatarUrl;
        const auraColor = user.auraColor || '#98d416';

        // Create list item
        const listItem = document.createElement('li');
        listItem.className = 'item';
        listItem.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-color);';

        // Create avatar container
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'avatar-container';
        avatarContainer.style.cssText = 'position: relative; width: 32px; height: 32px;';

        // Use AvatarUtils if available, otherwise use simple img
        const avatarUtils = (window as { AvatarUtils?: { createUnifiedAvatar?: (user: UserDisplayData, context: string, options: { size: number; showAura: boolean; showStatus: boolean }) => Promise<string> } }).AvatarUtils;
        if (avatarUtils && typeof avatarUtils.createUnifiedAvatar === 'function') {
          try {
            const avatarHTML = await avatarUtils.createUnifiedAvatar(user, 'visibility', {
              size: 32,
              showAura: true,
              showStatus: true
            });
            avatarContainer.innerHTML = avatarHTML;
          } catch (error) {
            Logger.warn?.('⚠️ VISIBILITY: Error creating unified avatar, using fallback', error, 'visibility');
            // Fallback to simple img
            const img = document.createElement('img');
            img.src = avatarUrl || '';
            img.alt = userName;
            img.style.cssText = `width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${auraColor};`;
            avatarContainer.appendChild(img);
          }
        } else {
          // Fallback: simple img
          const img = document.createElement('img');
          img.src = avatarUrl || '';
          img.alt = userName;
          img.style.cssText = `width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${auraColor};`;
          avatarContainer.appendChild(img);
        }

        listItem.appendChild(avatarContainer);

        // Create user info
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.style.cssText = 'flex: 1; min-width: 0;';

        const userNameEl = document.createElement('div');
        userNameEl.className = 'user-name';
        userNameEl.style.cssText = 'font-weight: bold; color: var(--text-primary); font-size: 14px;';
        userNameEl.textContent = userName;
        userInfo.appendChild(userNameEl);

        // CRITICAL: Create status element with new time formatting
        const userPageId = user.page_id || user.pageId;
        const onSamePage = Boolean(userPageId && currentPageId && userPageId === currentPageId);
        const shouldShowOnline = isActive && onSamePage;

        const statusEl = document.createElement('div');
        statusEl.className = 'user-status';
        statusEl.style.cssText = 'font-size: 12px; color: var(--text-secondary); margin-top: 2px;';

        if (shouldShowOnline) {
          // User is active and on the same page - use formatActiveTime
          const enterTime = user.enterTime || user.onlineAt;
          statusEl.textContent = VisibilityTraceFormatter.formatActiveTime(enterTime || null);
        } else {
          // User has left page - use formatLastSeen (already filtered by trace limit)
          statusEl.textContent = VisibilityTraceFormatter.formatLastSeen(user.lastSeen || null, traceLimitConfig);
        }

        userInfo.appendChild(statusEl);
        listItem.appendChild(userInfo);
        itemList.appendChild(listItem);
      } catch (error) {
        Logger.error?.('❌ VISIBILITY: Error rendering user', error, 'visibility');
      }
    }
  } else {
    // Show empty state
    const emptyState = document.createElement('div');
    emptyState.style.cssText = 'text-align: center; padding: 40px; color: var(--text-secondary);';
    emptyState.textContent = 'No other users visible on this page';
    itemList.appendChild(emptyState);
  }

  visibleUsersContainer.appendChild(itemList);
  visibilityTab.appendChild(visibleUsersContainer);

  // COMP METHOD: Add search functionality
  if (visibleSearch) {
    visibleSearch.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const searchTerm = target.value.toLowerCase();
      const items = visibilityTab.querySelectorAll('.item');
      items.forEach(item => {
        const userNameEl = item.querySelector('.user-name');
        if (userNameEl) {
          const userName = userNameEl.textContent?.toLowerCase() || '';
          const isVisible = userName.includes(searchTerm);
          (item as HTMLElement).style.display = isVisible ? 'flex' : 'none';
        }
      });
    });
  }

  // COMP METHOD: Add go invisible functionality
  if (goInvisibleBtn) {
    goInvisibleBtn.addEventListener('click', async () => {
      Logger.debug?.('🔍 VISIBILITY: Go invisible clicked', null, 'visibility');
      const win = window as Window & {
        setVisibilityStatus?: (visible: boolean) => Promise<void>;
        visibilitySettingsManager?: {
          visibilityToggle?: { checked: boolean };
          saveVisibility?: () => Promise<void>;
        };
        switchTab?: (tabId: string) => void;
      };

      // ROOT CAUSE FIX: Set visibility to false, update UI, save to storage/database, then navigate
      if (typeof win.setVisibilityStatus === 'function') {
        await win.setVisibilityStatus(false);
      } else if (win.visibilitySettingsManager?.visibilityToggle) {
        // Fallback: directly update toggle and save
        win.visibilitySettingsManager.visibilityToggle.checked = false;
        if (win.visibilitySettingsManager.saveVisibility) {
          await win.visibilitySettingsManager.saveVisibility();
        }
      }

      // CRITICAL FIX: Navigate to Discuss tab after going invisible
      if (win.switchTab) {
        try {
          win.switchTab('discuss-tab');
          Logger.debug?.('✅ VISIBILITY: Switched to Discuss tab after going invisible', null, 'visibility');
        } catch (error) {
          Logger.warn?.('⚠️ VISIBILITY: Failed to switch to Discuss tab', error, 'visibility');
        }
      }
    });

    // CRITICAL FIX: Ensure button is visible in light mode
    const updateButtonColor = (): void => {
      const theme = document.body.getAttribute('data-theme') || 'light';
      if (theme === 'light') {
        goInvisibleBtn.style.color = 'var(--text-primary, #333)';
      } else {
        goInvisibleBtn.style.color = 'white';
      }
    };
    updateButtonColor();

    // Watch for theme changes
    const observer = new MutationObserver(updateButtonColor);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    goInvisibleBtn.style.cssText = 'padding: 4px 8px; background: var(--accent-color); border: none; border-radius: 4px; font-size: 12px; cursor: pointer;';
  }

  Logger.debug?.('✅ VISIBILITY: Rendered', {
    count: usersToShow.length,
    traceLimit: traceLimitConfig.limit
  }, 'visibility');

  // CRITICAL FIX: Always set currentVisibilityData and refresh interval, even if rendering fails
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      visibilityStatusRefreshInterval?: ReturnType<typeof setInterval>;
      updateVisibleTab?: typeof updateVisibleTab;
      currentVisibilityData?: { active: UserDisplayData[] };
      currentPageId?: string | null;
    };

    // Always store currentVisibilityData (even if empty)
    win.currentVisibilityData = { active: usersToShow };
    win.currentPageId = resolvedCurrentPageId;

    // Clear any existing refresh interval
    if (win.visibilityStatusRefreshInterval) {
      clearInterval(win.visibilityStatusRefreshInterval);
    }

    // Start periodic status refresh for real-time updates
    // Update every 10 seconds for real-time time display updates
    win.visibilityStatusRefreshInterval = setInterval(async () => {
      const tab = document.getElementById('visibility-tab');
      const visibilityData = win.currentVisibilityData;
      if (tab && visibilityData?.active && Array.isArray(visibilityData.active) && visibilityData.active.length > 0) {
        Logger.debug?.('🔄 VISIBILITY: Periodic status refresh', null, 'visibility');
        try {
          const updateVisibleTabFn = win.updateVisibleTab;
          if (updateVisibleTabFn) {
            await updateVisibleTabFn(visibilityData.active, win.currentPageId || null, resolvedTraceLimit);
          }
        } catch (error) {
          Logger.error?.('❌ VISIBILITY: Error in periodic refresh', error, 'visibility');
        }
      }
    }, 10000); // Every 10 seconds for smoother real-time updates

    Logger.debug?.('✅ VISIBILITY: Refresh interval set up and currentVisibilityData stored', {
      userCount: usersToShow.length,
      pageId: resolvedCurrentPageId
    }, 'visibility');
  }
}

// Export for window assignment
export default updateVisibleTab;


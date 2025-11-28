/**
 * Visibility Presence Diagnostic
 *
 * Targets:
 * 1. Profile status display (Last Seen vs Online) consistency
 * 2. Visibility tab access flow when user is invisible
 * 3. Go Invisible button behavior (should route to Discuss tab)
 * 4. Structured interaction logs for root cause analysis
 */
import { VisibilityManager } from '../features/VisibilityManager.js';
import { formatUserDisplayName } from '../utils/Fallbacks.js';
class VisibilityPresenceDiagnostic {
    constructor() {
        this.interactionLogs = [];
        this.listenersAttached = false;
    }
    async run() {
        const timestamp = new Date().toISOString();
        const contextUsers = this.getVisibilityUsers();
        const expectations = this.evaluateProfileStatuses(contextUsers);
        const modalDetails = this.getModalState();
        const result = {
            timestamp,
            visibleUserCount: contextUsers.length,
            profileStatusExpectations: expectations,
            mismatches: expectations.filter(item => !item.matches),
            interactionLogs: this.interactionLogs.slice(-20),
            modalState: modalDetails,
            goInvisibleButtonPresent: !!document.getElementById('go-invisible-btn'),
            visibilityTabButtonPresent: !!document.querySelector('[data-tab="visibility-tab"]')
        };
        console.group('🔍 Visibility Presence Diagnostic');
        console.info('Timestamp:', timestamp);
        console.table(result.profileStatusExpectations.map(item => ({
            user: item.name,
            expected: item.expectedStatus,
            actual: item.domStatusText ?? '(missing)',
            matches: item.matches,
            reason: item.reason
        })));
        if (result.mismatches.length > 0) {
            console.warn('⚠️ Profile status mismatches detected:', result.mismatches.length);
            result.mismatches.forEach(mismatch => {
                console.warn(' -', mismatch.name, 'expected', mismatch.expectedStatus, 'but found', mismatch.domStatusText ?? '(missing)', mismatch.reason);
            });
        }
        console.log('Modal state:', modalDetails);
        console.log('Interaction logs (latest):', this.interactionLogs.slice(-5));
        console.groupEnd();
        window.visibilityPresenceInteractionLog = this.interactionLogs;
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
                : VisibilityManager.formatLastSeenDisplay(user.lastSeen || null);
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
            if (!section)
                continue;
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
        if (!tab)
            return false;
        if (tab.classList.contains('active'))
            return true;
        return window.getComputedStyle(tab).display !== 'none';
    }
    getUserVisibilityState() {
        const currentUser = window.currentUser;
        if (!currentUser)
            return null;
        if (typeof currentUser.isVisible === 'boolean')
            return currentUser.isVisible;
        if (typeof currentUser.visibilityEnabled === 'boolean')
            return currentUser.visibilityEnabled;
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
export async function runVisibilityPresenceDiagnostic() {
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
    }
    else {
        setTimeout(() => {
            runVisibilityPresenceDiagnostic();
        }, 1500);
    }
    console.log('✅ Visibility Presence Diagnostic script loaded. Run window.runVisibilityPresenceDiagnostic() for manual execution.');
}

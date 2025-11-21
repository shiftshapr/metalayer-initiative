/**
 * Attach COMP-accurate tab navigation listeners to the DOM.
 */
import { Logger } from '../utils/Logger.js';
const DEFAULT_SIDEBAR_SELECTOR = '.sidebar-content';
export function attachTabNavigation(options = {}) {
    const doc = options.document || (typeof document !== 'undefined' ? document : null);
    if (!doc)
        return;
    const addListener = options.addListener || ((el, evt, handler) => {
        el.addEventListener(evt, handler);
    });
    const logger = options.logger || Logger;
    const handlers = options.handlers || {};
    const sidebarContentSelector = options.sidebarContentSelector || DEFAULT_SIDEBAR_SELECTOR;
    const mainTabs = Array.from(doc.querySelectorAll('.main-nav-tab'));
    const mainTabContents = Array.from(doc.querySelectorAll('.main-tab-content'));
    const sidebarContent = () => doc.querySelector(sidebarContentSelector);
    mainTabs.forEach(tab => {
        addListener(tab, 'click', async () => {
            const targetTabId = tab.getAttribute('data-tab');
            if (!targetTabId) {
                logger.warn('❌ TAB_NAVIGATION: Missing data-tab attribute on tab element', tab);
                return;
            }
            logger.debug?.(`🔗 TAB_NAVIGATION: Switching to main tab ${targetTabId}`);
            mainTabs.forEach(t => t.classList.remove('active'));
            mainTabContents.forEach(content => content.classList.remove('active'));
            tab.classList.add('active');
            const targetTabContent = doc.getElementById(targetTabId);
            if (targetTabContent) {
                targetTabContent.classList.add('active');
                const sidebar = sidebarContent();
                if (sidebar) {
                    sidebar.classList.remove('agent-tab-active');
                }
                if (targetTabId === 'agent-tab' && handlers.onAgentTab) {
                    try {
                        sidebar?.classList.add('agent-tab-active');
                        await handlers.onAgentTab();
                        logger.debug?.('✅ TAB_NAVIGATION: Agent tab initialized');
                    }
                    catch (error) {
                        logger.error?.('❌ TAB_NAVIGATION: Agent tab initialization failed', error);
                    }
                }
                else if (targetTabId === 'people-tab' && handlers.onPeopleTab) {
                    try {
                        await handlers.onPeopleTab();
                        logger.debug?.('✅ TAB_NAVIGATION: People tab initialized');
                    }
                    catch (error) {
                        logger.error?.('❌ TAB_NAVIGATION: People tab initialization failed', error);
                    }
                }
            }
            else {
                logger.error?.(`❌ TAB_NAVIGATION: Target content #${targetTabId} not found`);
            }
        });
    });
    doc.querySelectorAll('.sub-nav-tab').forEach(subTab => {
        addListener(subTab, 'click', () => {
            const targetSubTabId = subTab.getAttribute('data-subtab');
            if (!targetSubTabId) {
                logger.warn('❌ TAB_NAVIGATION: Missing data-subtab attribute on sub-tab element', subTab);
                return;
            }
            const parentMainContent = subTab.closest('.main-tab-content');
            if (!parentMainContent) {
                logger.error?.("❌ TAB_NAVIGATION: Could not resolve parent .main-tab-content for sub-tab");
                return;
            }
            parentMainContent.querySelectorAll('.sub-nav-tab').forEach(tab => tab.classList.remove('active'));
            parentMainContent.querySelectorAll('.sub-tab-content').forEach(content => content.classList.remove('active'));
            subTab.classList.add('active');
            const targetSubTabContent = doc.getElementById(targetSubTabId);
            if (targetSubTabContent) {
                targetSubTabContent.classList.add('active');
            }
            else {
                logger.error?.(`❌ TAB_NAVIGATION: Sub-tab content #${targetSubTabId} not found`);
            }
        });
    });
    logger.debug?.('✅ TAB_NAVIGATION: Navigation handlers attached');
}
export default attachTabNavigation;

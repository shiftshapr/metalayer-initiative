/**
 * Tab Manager Module - Type Definitions
 */
// Default tab configuration
export const DEFAULT_TABS = [
    { id: 'discuss-tab', label: 'Discuss', builtIn: true, visible: true, order: 0, tabContentId: 'discuss-tab' },
    { id: 'visibility-tab', label: 'Visibility', builtIn: true, visible: true, order: 1, tabContentId: 'visibility-tab' },
    { id: 'rooms-tab', label: 'Rooms', builtIn: true, visible: true, order: 2, tabContentId: 'rooms-tab' },
    { id: 'people-tab', label: 'People', builtIn: true, visible: true, order: 3, tabContentId: 'people-tab' },
    { id: 'agent-tab', label: 'Agent', builtIn: true, visible: true, order: 4, tabContentId: 'agent-tab' },
    { id: 'timelines-tab', label: 'Timelines', builtIn: true, visible: true, order: 5, tabContentId: 'timelines-tab' },
    { id: 'settings-tab', label: 'Settings', builtIn: true, visible: true, order: 6, tabContentId: 'settings-tab' }
];
export const DEFAULT_STATE = {
    tabs: DEFAULT_TABS,
    visibleTabCount: 7, // All 7 built-in tabs visible by default
    userTabLimit: 10, // Default limit: 10 tabs
    isModalOpen: false,
    currentTab: 'discuss-tab', // Default active tab (first tab)
    previousTab: null // No previous tab at initial load
};

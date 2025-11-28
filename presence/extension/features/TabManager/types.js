/**
 * Tab Manager Types
 */
// CRITICAL FIX: Initialize default tabs with built-in tabs visible (regression fix)
// This ensures tabs are visible on first load
export const DEFAULT_STATE = {
    tabs: [
        { id: 'discuss-tab', label: 'Discuss', tabContentId: 'discuss-tab', builtIn: true, visible: true, order: 1 },
        { id: 'visibility-tab', label: 'Visibility', tabContentId: 'visibility-tab', builtIn: true, visible: true, order: 2 },
        { id: 'rooms-tab', label: 'Rooms', tabContentId: 'rooms-tab', builtIn: true, visible: true, order: 3 },
        { id: 'people-tab', label: 'People', tabContentId: 'people-tab', builtIn: true, visible: true, order: 4 },
        { id: 'agent-tab', label: 'Agent', tabContentId: 'agent-tab', builtIn: true, visible: true, order: 5 },
        { id: 'timelines-tab', label: 'Timelines', tabContentId: 'timelines-tab', builtIn: true, visible: true, order: 6 },
        { id: 'settings-tab', label: 'Settings', tabContentId: 'settings-tab', builtIn: true, visible: true, order: 7 },
        { id: 'manage-tab', label: 'Manage', tabContentId: 'manage-tab', builtIn: true, visible: true, order: 999, isPermanent: true }
    ],
    visibleTabCount: 7,
    userTabLimit: 10,
    isModalOpen: false,
    currentTab: null,
    previousTab: null
};

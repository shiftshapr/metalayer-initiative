/**
 * Tab Manager Types
 */

export interface TabConfig {
  id: string;
  label: string;
  tabContentId: string;
  icon?: string;
  builtIn?: boolean;
  visible?: boolean;
  order?: number;
  isDeveloperMode?: boolean;
  [key: string]: unknown;
}

export interface SDKApp {
  id: string;
  name: string;
  description: string;
  developer: string;
  category: string[];
  releaseDate: string;
  lastUpdated: string;
  downloadCount?: number;
  installed?: boolean;
  reviews?: unknown[];
  rating?: number;
  reviewCount?: number;
  icon?: string;
  digitalProvenance?: {
    verified: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AppStoreFilters {
  searchQuery?: string;
  categories?: string[];
  sortBy?: 'recent' | 'popular' | 'updated' | 'name';
  [key: string]: unknown;
}

export interface ReviewSubmission {
  appId: string;
  rating: number;
  comment?: string;
  [key: string]: unknown;
}

export interface DigitalProvenance {
  verified: boolean;
  [key: string]: unknown;
}

export interface TabManagerState {
  tabs: TabConfig[];
  visibleTabCount: number;
  userTabLimit: number;
  isModalOpen: boolean;
  currentTab: string | null;
  previousTab: string | null;
}

// CRITICAL FIX: Initialize default tabs with built-in tabs visible (regression fix)
// This ensures tabs are visible on first load
export const DEFAULT_STATE: TabManagerState = {
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


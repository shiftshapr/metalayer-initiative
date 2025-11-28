/**
 * Tab Manager Module - Type Definitions
 */

export interface TabConfig {
  id: string;                    // Unique identifier (e.g., "discuss-tab", "sdk-app-123")
  label: string;                 // Display name (e.g., "Discuss", "My Custom App")
  icon?: string;                 // Optional icon (emoji or icon class)
  builtIn: boolean;              // true for built-in apps, false for SDK apps
  visible: boolean;               // Whether tab is currently visible
  order: number;                  // Display order (0-based)
  sdkAppId?: string;             // For SDK apps: app store ID
  sdkAppVersion?: string;        // For SDK apps: installed version
  tabContentId: string;          // DOM ID for tab content (e.g., "discuss-tab")
  isDeveloperMode?: boolean;     // true if installed via "Load Unpacked"
  localPath?: string;            // For developer mode: local file path
  favorited?: boolean;           // Whether app is favorited (Phase 3)
}

export interface TabManagerState {
  tabs: TabConfig[];
  visibleTabCount: number;       // Number of tabs to display (1-10 or user limit)
  userTabLimit: number;          // Maximum tabs allowed for this user (default: 10)
  isModalOpen: boolean;          // Whether management modal is open
  currentTab: string | null;     // ID of currently active tab (e.g., "discuss-tab")
  previousTab: string | null;   // ID of previously active tab (null at initial load)
}

export interface SDKApp {
  id: string;                    // App store ID
  name: string;                   // App name
  description: string;            // App description
  icon?: string;                  // App icon URL
  version: string;                // App version
  developer: string;              // Developer name
  category: string[];             // Categories/tags
  releaseDate: string;            // ISO date string
  lastUpdated: string;            // ISO date string
  downloadCount?: number;         // Popularity metric
  rating?: number;                // Average rating (0-5)
  reviewCount?: number;           // Total number of reviews
  reviews?: AppReview[];          // Reviews array (paginated)
  manifest: AppManifest;          // SDK app manifest
  installed: boolean;             // Whether currently installed
  isDeveloperMode?: boolean;      // true if loaded unpacked
  digitalProvenance?: DigitalProvenance; // Code provenance/verification data
  favorited?: boolean;            // Whether app is favorited (Phase 3)
}

export interface AppReview {
  id: string;                     // Review ID
  userId: string;                  // Reviewer user ID
  userName: string;               // Reviewer display name
  userAvatar?: string;            // Reviewer avatar URL
  rating: number;                  // Rating (1-5 stars)
  title?: string;                  // Optional review title
  content: string;                // Review text content
  createdAt: string;              // ISO date string
  updatedAt?: string;             // ISO date string (if edited)
  helpfulCount?: number;           // Number of "helpful" votes
  verifiedPurchase?: boolean;      // Whether reviewer has installed app
  developerResponse?: {           // Optional developer response
    content: string;
    createdAt: string;
  };
}

export interface DigitalProvenance {
  verified: boolean;              // Whether code is verified
  verificationMethod: 'signature' | 'hash' | 'blockchain' | 'certificate' | 'none';
  signature?: string;              // Code signature (if signature-based)
  hash?: string;                   // Code hash (SHA-256, etc.)
  hashAlgorithm?: string;          // Hash algorithm used
  certificate?: {                  // Certificate info (if certificate-based)
    issuer: string;
    subject: string;
    validFrom: string;
    validTo: string;
    fingerprint: string;
  };
  blockchainProof?: {              // Blockchain proof (if blockchain-based)
    chain: string;                 // Blockchain name (e.g., "ethereum", "polygon")
    transactionHash: string;       // Transaction hash
    blockNumber: number;           // Block number
    timestamp: string;              // Block timestamp
  };
  sourceRepository?: {            // Source code repository info
    url: string;                   // Repository URL
    commitHash: string;            // Commit hash
    branch: string;                // Branch name
    verified: boolean;             // Whether repo is verified
  };
  buildInfo?: {                    // Build information
    buildDate: string;             // Build timestamp
    buildSystem: string;           // Build system used
    buildHash: string;             // Build hash
  };
  lastVerified: string;            // Last verification timestamp
  verifiedBy?: string;             // Entity that verified (e.g., "Canopi", "Developer")
}

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entryPoint: string;             // Main entry point for the app
  permissions?: string[];          // Required permissions
  [key: string]: unknown;          // Additional manifest fields
}

export interface AppStoreFilters {
  searchQuery?: string;           // Search text
  categories?: string[];          // Selected categories
  sortBy?: 'recent' | 'popular' | 'updated' | 'name'; // Sort order
  developerMode?: boolean;        // Show developer mode options
  favoritesOnly?: boolean;        // Filter to show only favorited apps (Phase 3)
}

export interface ReviewSubmission {
  appId: string;
  rating: number;              // 1-5 stars
  title?: string;             // Optional review title
  content: string;             // Review text
  verifiedPurchase: boolean;   // Whether user has installed app
}

// Default tab configuration
export const DEFAULT_TABS: TabConfig[] = [
  { id: 'discuss-tab', label: 'Discuss', builtIn: true, visible: true, order: 0, tabContentId: 'discuss-tab' },
  { id: 'visibility-tab', label: 'Visibility', builtIn: true, visible: true, order: 1, tabContentId: 'visibility-tab' },
  { id: 'rooms-tab', label: 'Rooms', builtIn: true, visible: true, order: 2, tabContentId: 'rooms-tab' },
  { id: 'people-tab', label: 'People', builtIn: true, visible: true, order: 3, tabContentId: 'people-tab' },
  { id: 'agent-tab', label: 'Agent', builtIn: true, visible: true, order: 4, tabContentId: 'agent-tab' },
  { id: 'timelines-tab', label: 'Timelines', builtIn: true, visible: true, order: 5, tabContentId: 'timelines-tab' },
  { id: 'settings-tab', label: 'Settings', builtIn: true, visible: true, order: 6, tabContentId: 'settings-tab' }
];

export const DEFAULT_STATE: TabManagerState = {
  tabs: DEFAULT_TABS,
  visibleTabCount: 7,            // All 7 built-in tabs visible by default
  userTabLimit: 10,              // Default limit: 10 tabs
  isModalOpen: false,
  currentTab: 'discuss-tab',     // Default active tab (first tab)
  previousTab: null              // No previous tab at initial load
};


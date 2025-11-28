# Tab Manager Module Design

## Overview
A tab management system that allows users to customize their sidebar navigation by reordering tabs, controlling visibility, and installing SDK-based sidebar applications.

## Core Requirements

### Display
- Display any number of tabs (up to user's limit) in the tab navigation bar
- "Manage" button always visible on the far right of the tab bar
- Full sidebar modal opens when "Manage" button is clicked

### Built-in Applications
All users start with these 7 built-in applications:
1. Discuss
2. Visibility
3. Rooms
4. People
5. Agent
6. Timelines (TBD - placeholder for future)
7. Settings

### SDK Applications
- Applications built with the Canopi SDK
- Available through the App Store (Canopi view)
- Can be installed/uninstalled
- Visually distinguished from built-in apps in the management interface

## Architecture

### Components

#### 1. TabDisplay Component
**Location:** Renders the visible tabs in the main navigation bar

**Responsibilities:**
- Render tabs based on `TabConfiguration` state
- Show "Manage" button (always visible, positioned on far right)
- Handle tab switching
- Apply visual styling (built-in vs SDK apps)

**Visual Structure:**
```
[Discuss] [Visibility] [Rooms] [People] [Agent] [Timelines] [Settings] [Manage]
```

#### 2. TabManagerModal Component
**Location:** Full sidebar modal overlay

**Responsibilities:**
- Display full sidebar modal when "Manage" button is clicked
- Show all available tabs (built-in + installed SDK apps)
- Provide drag-and-drop reordering
- Toggle visibility for each tab
- Control number of visible tabs (slider/input)
- App Store section for browsing/installing SDK apps

**Modal Sections:**
1. **Tab Management Section**
   - List of all tabs (built-in + SDK)
   - Drag handles for reordering
   - Visibility toggles
   - Visual distinction between built-in and SDK apps
   
2. **Display Settings Section**
   - Control for number of visible tabs (1-10, or user's limit)
   - Preview of visible tabs
   
3. **App Store Section**
   - Browse available SDK apps
   - **Search functionality** - Search apps by name, description, developer
   - **Filter by categories** - Filter apps by category tags
   - **Filter by recency** - Sort/filter by recently added, recently updated, most popular
   - **Filter by favorites** - Show only favorited apps (Phase 3)
   - **Favorite/Unfavorite** - Star icon to favorite apps for quick access (Phase 3)
   - **Developer Mode** - Toggle for advanced features
   - **Load Unpacked** - Install apps from local file system (developer mode)
   - Install/uninstall functionality
   - App metadata (name, icon, description, version, category, developer, release date)
   - **Reviews System** - View and submit reviews for apps
   - **Digital Provenance** - View code verification and provenance information

#### 3. TabConfiguration Service
**Location:** Core service managing tab state

**Responsibilities:**
- Store tab configuration in `chrome.storage.local`
- Manage tab order, visibility, and count
- **Track currentTab and previousTab** - Update on tab clicks
- Provide API for modules to register/unregister tabs
- Handle user-specific tab limits
- Default configuration for new users

**Tab Tracking Logic:**
```typescript
// When a tab is clicked:
function switchToTab(tabId: string) {
  const currentState = getState();
  
  // Update previousTab with current currentTab (if exists)
  const newState = {
    ...currentState,
    previousTab: currentState.currentTab,  // Previous becomes current
    currentTab: tabId                        // New current tab
  };
  
  setState(newState);
  persistToStorage(newState);
}
```

**Storage Structure:**
```typescript
{
  tabConfig: {
    tabs: TabConfig[],
    visibleTabCount: number,
    userTabLimit: number, // Default: 10, can be customized per user
    currentTab: string | null,   // Currently active tab ID
    previousTab: string | null   // Previously active tab ID (null at load)
  }
}
```

#### 4. AppStoreIntegration Service
**Location:** Handles SDK app lifecycle

**Responsibilities:**
- List available SDK apps from app store
- **Search functionality** - Search apps by name, description, developer, tags
- **Filter by categories** - Category-based filtering
- **Filter by recency** - Sort by date added, updated, popularity
- **Filter by favorites** - Show only favorited apps (Phase 3)
- **Favorites Management** - Add/remove favorites, persist favorite status (Phase 3)
- Install/uninstall SDK apps
- **Developer Mode** - Enable/disable developer features
- **Load Unpacked** - Install apps from local file system (requires developer mode)
- Validate SDK app compatibility and structure
- Handle app updates
- Register/unregister SDK apps with TabConfiguration
- **Reviews Management** - Fetch, submit, update reviews
- **Digital Provenance** - Verify and display code provenance information

## Data Structures

### TabConfig Interface
```typescript
interface TabConfig {
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
}
```

### SDKApp Interface
```typescript
interface SDKApp {
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
}
```

### AppReview Interface
```typescript
interface AppReview {
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
```

### DigitalProvenance Interface
```typescript
interface DigitalProvenance {
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
```

### AppStoreFilters Interface
```typescript
interface AppStoreFilters {
  searchQuery?: string;           // Search text
  categories?: string[];          // Selected categories
  sortBy?: 'recent' | 'popular' | 'updated' | 'name'; // Sort order
  developerMode?: boolean;        // Show developer mode options
  favoritesOnly?: boolean;        // Filter to show only favorited apps (Phase 3)
}
```

### TabManagerState Interface
```typescript
interface TabManagerState {
  tabs: TabConfig[];
  visibleTabCount: number;       // Number of tabs to display (1-10 or user limit)
  userTabLimit: number;          // Maximum tabs allowed for this user (default: 10)
  isModalOpen: boolean;          // Whether management modal is open
  currentTab: string | null;     // ID of currently active tab (e.g., "discuss-tab")
  previousTab: string | null;     // ID of previously active tab (null at initial load)
}
```

### Default Configuration
```typescript
const DEFAULT_TABS: TabConfig[] = [
  { id: 'discuss-tab', label: 'Discuss', builtIn: true, visible: true, order: 0, tabContentId: 'discuss-tab' },
  { id: 'visibility-tab', label: 'Visibility', builtIn: true, visible: true, order: 1, tabContentId: 'visibility-tab' },
  { id: 'rooms-tab', label: 'Rooms', builtIn: true, visible: true, order: 2, tabContentId: 'rooms-tab' },
  { id: 'people-tab', label: 'People', builtIn: true, visible: true, order: 3, tabContentId: 'people-tab' },
  { id: 'agent-tab', label: 'Agent', builtIn: true, visible: true, order: 4, tabContentId: 'agent-tab' },
  { id: 'timelines-tab', label: 'Timelines', builtIn: true, visible: true, order: 5, tabContentId: 'timelines-tab' },
  { id: 'settings-tab', label: 'Settings', builtIn: true, visible: true, order: 6, tabContentId: 'settings-tab' }
];

const DEFAULT_STATE: TabManagerState = {
  tabs: DEFAULT_TABS,
  visibleTabCount: 7,            // All 7 built-in tabs visible by default
  userTabLimit: 10,              // Default limit: 10 tabs
  isModalOpen: false,
  currentTab: 'discuss-tab',     // Default active tab (first tab)
  previousTab: null              // No previous tab at initial load
};
```

## User Experience Flow

### Initial State
1. User opens sidebar for first time
2. System loads default configuration (7 built-in tabs, all visible)
3. Tab bar shows: `[Discuss] [Visibility] [Rooms] [People] [Agent] [Timelines] [Settings] [Manage]`
4. `currentTab` = "discuss-tab" (first tab active by default)
5. `previousTab` = null (no previous tab at initial load)

### Managing Tabs
1. User clicks "Manage" button
2. Full sidebar modal opens (overlay)
3. Modal shows:
   - **Tab List Section:**
     - All tabs with drag handles
     - Built-in apps: Special badge/icon (e.g., "Built-in" label, different background)
     - SDK apps: "App Store" badge/icon, different styling
     - Visibility toggle for each tab
     - Drag to reorder
   - **Display Settings:**
     - Slider/input: "Show X tabs" (1 to user's limit, default 10)
     - Preview of which tabs will be visible
   - **App Store Section:**
     - List of available SDK apps
     - Install button for each
     - Shows installed status

### Tab Switching (with Tracking)
1. User clicks a tab (e.g., clicks "Settings")
2. System updates:
   - `previousTab` = current `currentTab` value (e.g., "discuss-tab")
   - `currentTab` = clicked tab ID (e.g., "settings-tab")
3. Tab content switches
4. Changes saved to storage
5. Other modules can access `currentTab` and `previousTab` for their logic

### Reordering Tabs
1. User drags a tab to new position
2. Order updates in real-time
3. Changes saved to storage
4. Tab bar updates immediately
5. **Note:** Reordering does NOT change `currentTab` or `previousTab` (only order changes)

### Changing Visible Tab Count
1. User adjusts slider/input (e.g., from 7 to 5)
2. Only first 5 tabs (by order) are shown in tab bar
3. Remaining tabs remain in configuration but hidden
4. Changes saved to storage

### Installing SDK App
1. User browses App Store section in modal
2. Can search for apps or filter by category/recency
3. Views app details including:
   - App metadata (description, version, developer)
   - **Digital Provenance** - Verification status, code signature/hash, source repository
   - **Reviews** - Average rating, review count, recent reviews
4. Clicks "Install" on an SDK app
5. System verifies digital provenance (if available)
6. App is downloaded and registered
7. App appears in tab list (with SDK app styling)
8. User can reorder, toggle visibility, etc.
9. App content is rendered in sidebar when tab is active

### Viewing App Reviews
1. User clicks on an app in App Store section
2. App detail view opens showing:
   - App information
   - **Reviews tab** - Shows all reviews with:
     - Star ratings
     - Review text
     - Reviewer info
     - Helpful votes
     - Developer responses (if any)
   - **Write Review** button (if user has installed the app)
3. User can filter reviews by:
   - Rating (1-5 stars)
   - Most helpful
   - Most recent
   - Verified purchases only
4. User can submit their own review (if app is installed)

### Viewing Digital Provenance
1. User clicks on an app in App Store section
2. App detail view shows **Digital Provenance** section:
   - **Verification Status** - Verified/Unverified badge
   - **Verification Method** - Signature, Hash, Blockchain, Certificate
   - **Source Repository** - Link to code repository with commit hash
   - **Build Information** - Build date, build system, build hash
   - **Blockchain Proof** - Transaction hash, block number (if applicable)
   - **Certificate Info** - Issuer, validity dates (if applicable)
3. User can click to view full provenance details
4. System displays verification status prominently (trust indicator)

### Developer Mode
1. User enables "Developer Mode" toggle in App Store section
2. Additional options appear:
   - "Load Unpacked" button
   - Developer tools/console access
   - App validation/debugging tools
3. User can select local folder containing unpacked SDK app
4. System validates app structure and manifest
5. If valid, app is installed and appears in tab list
6. Developer mode apps are visually distinguished

### Visual Distinction
**Built-in Apps:**
- Badge: "Built-in" or system icon
- Background: Slightly different shade or border
- Cannot be uninstalled (only hidden)

**SDK Apps:**
- Badge: "App Store" or store icon
- Background: Different styling (e.g., subtle gradient or border)
- Can be uninstalled
- May show version number

## Implementation Details

### File Structure
```
features/
  TabManager/
    TabManager.ts              # Main module class
    TabDisplay.ts              # Tab bar rendering
    TabManagerModal.ts         # Management modal component
    TabConfiguration.ts         # Configuration service (handles currentTab/previousTab tracking)
    AppStoreIntegration.ts     # SDK app integration
    types.ts                   # TypeScript interfaces
```

### Tab Tracking Implementation

**TabConfiguration Service Methods:**
```typescript
class TabConfiguration {
  private state: TabManagerState;
  
  // Get current tab state
  getCurrentTab(): string | null {
    return this.state.currentTab;
  }
  
  // Get previous tab state
  getPreviousTab(): string | null {
    return this.state.previousTab;
  }
  
  // Switch to a tab (updates currentTab and previousTab)
  switchToTab(tabId: string): void {
    const currentTab = this.state.currentTab;
    
    // Update state: previousTab gets current currentTab, currentTab gets new tabId
    this.state.previousTab = currentTab;  // Current becomes previous
    this.state.currentTab = tabId;         // New tab becomes current
    
    // Persist to storage
    this.persistState();
    
    // Emit event for other modules
    this.emit('tabSwitched', {
      currentTab: tabId,
      previousTab: currentTab
    });
  }
  
  // Initialize state (called on load)
  initialize(): void {
    // Load from storage or use defaults
    const stored = this.loadFromStorage();
    if (stored) {
      this.state = stored;
    } else {
      // Default state: currentTab = first tab, previousTab = null
      this.state = {
        ...DEFAULT_STATE,
        currentTab: 'discuss-tab',  // First tab active by default
        previousTab: null            // No previous tab at initial load
      };
    }
  }
}
```

**Integration with Tab Click Handler:**
```typescript
// In TabDisplay component or tabNavigation.ts
function handleTabClick(tabId: string) {
  // Update tab tracking BEFORE switching
  tabConfiguration.switchToTab(tabId);
  
  // Now other modules can access:
  // - tabConfiguration.getCurrentTab()  // Returns tabId
  // - tabConfiguration.getPreviousTab() // Returns previous tabId or null
  
  // Existing tab switching logic
  // ... (update DOM, show/hide content, etc.)
}
```

**Usage Example:**
```typescript
// In any module that needs to know tab changes
tabConfiguration.on('tabSwitched', ({ currentTab, previousTab }) => {
  console.log(`Switched from ${previousTab} to ${currentTab}`);
  
  // Example: Clean up previous tab resources
  if (previousTab === 'agent-tab') {
    cleanupAgentTab();
  }
  
  // Example: Initialize new tab
  if (currentTab === 'settings-tab') {
    initializeSettingsTab();
  }
});
```

### Integration Points
1. **HTML:** Update `sidepanel.html` to include manage button and modal container
2. **CSS:** Styles for tab management, modal, drag-and-drop, visual distinctions
3. **Tab Navigation:** Integrate with existing `tabNavigation.ts` system
4. **Storage:** Use `chrome.storage.local` for persistence
5. **SDK:** Integration with Canopi SDK for app discovery and installation

### Drag-and-Drop Library
- Consider using HTML5 Drag and Drop API or a lightweight library
- Ensure accessibility (keyboard navigation for reordering)

### Responsive Considerations
- Tab bar should scroll horizontally if tabs exceed visible area
- Modal should be responsive to sidebar width
- Touch-friendly drag handles for mobile

## Implementation Phases

### Phase 1: Core Tab Management (Low-Medium Risk, ~1-2 weeks)
**Scope:**
- Tab display with manage button
- Basic tab reordering (drag-and-drop)
- Visibility toggles
- Tab count control
- Storage persistence
- **Preserve existing styling** - Use current CSS classes and patterns

**Risk:** Low-Medium
- Well-defined scope
- Uses existing tab navigation system
- Minimal styling changes needed

### Phase 2: App Store Basic (Medium Risk, ~1-2 weeks)
**Scope:**
- App Store section in modal
- List available SDK apps
- Basic install/uninstall
- App metadata display
- **Preserve existing styling**

**Risk:** Medium
- Requires SDK app structure definition
- Need app store backend/API or mock data
- Integration with existing tab system

### Phase 3: App Store Advanced (Medium-High Risk, ~2-3 weeks)
**Scope:**
- Search functionality
- Category filtering
- Recency/sorting filters
- Developer mode toggle
- Load unpacked functionality
- File system access (Chrome extension APIs)
- App validation

**Risk:** Medium-High
- File system access requires careful security
- App validation logic needed
- More complex UI/UX
- Testing required for various app structures

### Total Estimated Timeline: 5-8 weeks
**Recommendation:** Start with Phase 1 to get core functionality working, then iterate.

## Styling Preservation Strategy
- **Reuse existing CSS classes** - Leverage `.main-nav-tab`, `.sidebar-nav-main` patterns
- **Extend, don't replace** - Add new classes that complement existing styles
- **Follow X pattern** - Maintain current design language (neon blue, spacing, typography)
- **CSS variables** - Use existing CSS variables for colors, spacing
- **Minimal changes** - Only add new styles, avoid modifying core tab styles
- **Preserve current tab look** - Maintain existing tab appearance, spacing, and blue underline styling
- **Manage button styling** - Match existing tab button style, positioned on far right

## Reviews System Implementation

### Review Submission
```typescript
interface ReviewSubmission {
  appId: string;
  rating: number;              // 1-5 stars
  title?: string;             // Optional review title
  content: string;             // Review text
  verifiedPurchase: boolean;   // Whether user has installed app
}
```

### Review Features
- **Rating System**: 1-5 star ratings with average calculation
- **Review Display**: Paginated reviews with sorting/filtering
- **Helpful Votes**: Users can mark reviews as helpful
- **Developer Responses**: App developers can respond to reviews
- **Verified Purchases**: Distinguish reviews from users who installed the app
- **Review Moderation**: Flag inappropriate reviews
- **Review Editing**: Users can edit their own reviews

### Review UI Components
- Star rating display (average + individual)
- Review list with pagination
- Review submission form
- Review filtering/sorting controls
- Developer response display

## Digital Provenance Implementation

### Verification Methods
1. **Code Signature**: Cryptographic signature verification
2. **Hash Verification**: SHA-256 or similar hash verification
3. **Blockchain Proof**: Immutable proof on blockchain
4. **Certificate**: Code signing certificate verification
5. **Source Repository**: Verified GitHub/GitLab repository link

### Provenance Display
- **Verification Badge**: Visual indicator (verified/unverified)
- **Provenance Details Panel**: Expandable section with full details
- **Source Link**: Direct link to source repository
- **Build Info**: Build timestamp, system, hash
- **Blockchain Explorer**: Link to blockchain transaction (if applicable)

### Security Considerations
- Verify provenance before installation
- Warn users about unverified apps
- Display provenance prominently in app details
- Allow users to filter by verification status

### Provenance Verification Service
```typescript
class ProvenanceVerificationService {
  // Verify app provenance
  async verifyProvenance(appId: string, appManifest: AppManifest): Promise<DigitalProvenance>;
  
  // Validate code signature
  async validateSignature(appId: string, signature: string): Promise<boolean>;
  
  // Verify blockchain proof
  async verifyBlockchainProof(proof: BlockchainProof): Promise<boolean>;
  
  // Check source repository
  async verifySourceRepository(repoUrl: string, commitHash: string): Promise<boolean>;
}
```

## Favorites System Implementation (Phase 3)

### Favorite Functionality
- **Star Icon** - Click to favorite/unfavorite an app
- **Visual Indicator** - Favorited apps show filled star, unfavorited show outline
- **Filter Toggle** - "Show Favorites Only" checkbox in App Store filters
- **Persistent Storage** - Favorite status saved in chrome.storage.local
- **Tab List Indicator** - Favorited apps show star badge in management modal

### Favorite UI Components
```typescript
interface FavoriteButton {
  appId: string;
  favorited: boolean;
  onClick: (appId: string, favorited: boolean) => void;
}
```

### Favorite Storage
```typescript
{
  tabConfig: {
    tabs: TabConfig[],  // Each tab has favorited?: boolean
    favorites: string[]  // Array of favorited app IDs
  }
}
```

### Favorite Features
- Toggle favorite status on any app (built-in or SDK)
- Filter App Store list to show only favorites
- Sort apps by favorite status (favorites first)
- Visual star indicator in app cards and tab list
- Quick access to favorited apps

## Future Enhancements
- Per-user tab limits (admin-controlled or subscription-based)
- Tab groups/categories
- Tab presets/profiles
- Tab analytics (usage tracking)
- App update notifications
- App permissions management
- Review analytics and insights for developers
- Provenance history tracking
- Multi-chain blockchain verification support

## Migration Strategy
- Existing users: Migrate current tab setup to new configuration
- Preserve tab order and visibility preferences
- Ensure backward compatibility during rollout


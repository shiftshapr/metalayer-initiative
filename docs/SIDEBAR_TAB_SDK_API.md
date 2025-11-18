# Sidebar Tab SDK API Specification

## Overview

The Canopi Sidebar Tab SDK provides a JavaScript/TypeScript API for developing sidebar tab modules. This document defines the complete API surface, including initialization, communication, permissions, storage, and lifecycle management.

**TypeScript Support**: Full TypeScript definitions are available in [`types/canopi-sdk.d.ts`](./types/canopi-sdk.d.ts). Install via npm or include the definitions file in your project.

## Table of Contents

1. [Initialization](#initialization)
2. [Tab Registration](#tab-registration)
3. [Bridge Communication](#bridge-communication)
4. [Permissions](#permissions)
5. [Storage](#storage)
6. [User Context](#user-context)
7. [Theme & Styling](#theme--styling)
8. [Diagnostics](#diagnostics)
9. [Lifecycle Hooks](#lifecycle-hooks)
10. [Error Handling](#error-handling)
11. [Type Definitions](#type-definitions)

---

## Initialization

### Loading the SDK

The SDK is automatically injected by the Canopi host when a tab module is loaded. Access it via the global `canopi` object:

```javascript
// JavaScript
// SDK is available as window.canopi
const { registerTab, bridge, permissions, storage, user, theme, diagnostics } = window.canopi;
```

```typescript
// TypeScript
import type { SDK } from 'canopi-sdk';

// SDK is available as window.canopi
const canopi: SDK = window.canopi;
const { registerTab, bridge, permissions, storage, user, theme, diagnostics } = canopi;
```

### SDK Version

```javascript
// Get SDK version
const version = canopi.version; // e.g., "1.0.0"

// Check SDK compatibility
if (canopi.version < "1.0.0") {
  console.warn("SDK version too old");
}
```

---

## Tab Registration

### registerTab()

Registers a tab module with the sidebar.

```typescript
interface TabConfig {
  id: string;                    // Tab ID (from manifest)
  title: string;                  // Display title
  icon: string;                   // Icon identifier
  render: (container: HTMLElement, context: TabContext) => void | Promise<void>;
  onActivate?: (context: TabContext) => void | Promise<void>;
  onDeactivate?: (context: TabContext) => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
  badge?: {
    getValue: () => number | string | null | Promise<number | string | null>;
    updateInterval?: number;      // Milliseconds between badge updates
  };
}

interface TabContext {
  container: HTMLElement;         // DOM container for tab content
  isActive: boolean;              // Whether tab is currently active
  userId: string | null;          // Current user ID (null if not authenticated)
  permissions: PermissionStatus; // Current permission status
}

function registerTab(config: TabConfig): TabInstance;
```

**Example:**

```javascript
const tab = canopi.registerTab({
  id: 'archive',
  title: 'Archive',
  icon: 'archive-icon',
  
  render: async (container, context) => {
    container.innerHTML = `
      <div class="archive-tab">
        <h2>Archive Assistant</h2>
        <button id="archive-btn">Archive Current Page</button>
        <div id="archive-status"></div>
      </div>
    `;
    
    // Set up event listeners
    document.getElementById('archive-btn').addEventListener('click', handleArchive);
  },
  
  onActivate: async (context) => {
    console.log('Archive tab activated');
    await refreshArchiveHistory();
  },
  
  onDeactivate: async (context) => {
    console.log('Archive tab deactivated');
  },
  
  badge: {
    getValue: async () => {
      const pendingCount = await getPendingArchiveCount();
      return pendingCount > 0 ? pendingCount : null;
    },
    updateInterval: 5000 // Update every 5 seconds
  }
});
```

### TabInstance Methods

```typescript
interface TabInstance {
  // Update tab title
  setTitle(title: string): void;
  
  // Update tab icon
  setIcon(icon: string): void;
  
  // Update badge value manually
  setBadge(value: number | string | null): void;
  
  // Show/hide tab
  show(): void;
  hide(): void;
  
  // Get tab state
  isVisible(): boolean;
  isActive(): boolean;
  
  // Destroy tab
  destroy(): void;
}
```

---

## Bridge Communication

The Bridge API enables secure communication between tab modules and the Canopi host.

### Bridge API

```typescript
interface Bridge {
  // Send request to host
  request<T = any>(event: string, payload?: any, options?: RequestOptions): Promise<T>;
  
  // Send notification to host (fire-and-forget)
  notify(event: string, payload?: any): void;
  
  // Listen for events from host
  on(event: string, handler: (payload: any) => void): () => void; // Returns unsubscribe function
  
  // Listen for events once
  once(event: string, handler: (payload: any) => void): void;
  
  // Remove event listener
  off(event: string, handler?: (payload: any) => void): void;
}

interface RequestOptions {
  timeout?: number;              // Request timeout in milliseconds (default: 30000)
  retries?: number;              // Number of retry attempts (default: 0)
  priority?: 'low' | 'normal' | 'high'; // Request priority (default: 'normal')
}
```

**Example: Archive Request**

```javascript
// Send archive request
const response = await canopi.bridge.request('archive:request', {
  url: window.location.href,
  services: ['wayback', 'ipfs'],
  options: {
    captureScreenshot: true,
    waitForLoad: true
  }
});

console.log('Archive result:', response);

// Listen for archive status updates
const unsubscribe = canopi.bridge.on('archive:status', (status) => {
  console.log('Archive progress:', status.progress);
  updateProgressBar(status.progress);
});

// Clean up listener when done
// unsubscribe();
```

### Standard Bridge Events

#### Host → Tab Events

- `archive:response` - Archive operation response
- `archive:status` - Archive operation status update
- `permission:granted` - Permission granted notification
- `permission:denied` - Permission denied notification
- `user:updated` - User profile updated
- `theme:changed` - Theme changed
- `settings:updated` - Settings updated
- `error:occurred` - Error notification

#### Tab → Host Events

- `archive:request` - Request archive operation
- `permission:request` - Request permission
- `settings:get` - Get setting value
- `settings:set` - Set setting value
- `diagnostics:report` - Report diagnostic information

---

## Permissions

### Permission API

```typescript
interface Permissions {
  // Check if permission is granted
  has(scope: string): boolean;
  
  // Request permission
  request(scope: string): Promise<boolean>;
  
  // Request multiple permissions
  requestMultiple(scopes: string[]): Promise<Record<string, boolean>>;
  
  // Get all granted permissions
  getAll(): string[];
  
  // Listen for permission changes
  onChanged(callback: (scopes: string[]) => void): () => void;
}

interface PermissionStatus {
  granted: string[];    // Granted permission scopes
  denied: string[];      // Denied permission scopes
  pending: string[];     // Pending permission requests
}
```

**Example:**

```javascript
// Check permission
if (canopi.permissions.has('archive:wayback')) {
  await archiveToWayback();
} else {
  // Request permission
  const granted = await canopi.permissions.request('archive:wayback');
  if (granted) {
    await archiveToWayback();
  } else {
    showPermissionDeniedMessage();
  }
}

// Request multiple permissions
const results = await canopi.permissions.requestMultiple([
  'archive:wayback',
  'archive:ipfs',
  'network:fetch'
]);

console.log('Permission results:', results);
// { 'archive:wayback': true, 'archive:ipfs': true, 'network:fetch': false }

// Listen for permission changes
canopi.permissions.onChanged((scopes) => {
  console.log('Permissions changed:', scopes);
  updateUI();
});
```

### Standard Permission Scopes

- `archive:wayback` - Wayback Machine archiving
- `archive:ipfs` - IPFS archiving
- `archive:ordinals` - Bitcoin Ordinals archiving
- `network:fetch` - External network requests
- `storage:local` - Local storage access
- `storage:sync` - Sync storage access
- `user:profile` - Read user profile
- `user:preferences` - Read/write preferences
- `page:content` - Access page content
- `page:url` - Access page URL
- `diagnostics:read` - Read diagnostics
- `diagnostics:write` - Write diagnostics
- `timeline:read` - Read timeline data
- `timeline:write` - Write timeline data

---

## Storage

### Storage API

```typescript
interface Storage {
  // Local storage (tab-specific, not synced)
  local: {
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: any): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    getAll(): Promise<Record<string, any>>;
    keys(): Promise<string[]>;
  };
  
  // Sync storage (synced across devices, tab-specific)
  sync: {
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: any): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    getAll(): Promise<Record<string, any>>;
    keys(): Promise<string[]>;
  };
  
  // Listen for storage changes
  onChanged(callback: (changes: StorageChanges) => void): () => void;
}

interface StorageChanges {
  local?: {
    [key: string]: { oldValue?: any; newValue?: any };
  };
  sync?: {
    [key: string]: { oldValue?: any; newValue?: any };
  };
}
```

**Example:**

```javascript
// Local storage (requires 'storage:local' permission)
await canopi.storage.local.set('archiveHistory', [
  { url: 'https://example.com', timestamp: Date.now() }
]);

const history = await canopi.storage.local.get('archiveHistory');
console.log('Archive history:', history);

// Sync storage (requires 'storage:sync' permission)
await canopi.storage.sync.set('userPreferences', {
  defaultServices: ['wayback', 'ipfs'],
  autoArchive: false
});

// Listen for storage changes
canopi.storage.onChanged((changes) => {
  if (changes.local?.archiveHistory) {
    console.log('Archive history changed');
    refreshUI();
  }
});
```

### Storage Namespacing

All storage keys are automatically namespaced by module ID to prevent conflicts:
- Module ID: `com.canopi.archive-assistant`
- Storage key: `archiveHistory`
- Actual key: `com.canopi.archive-assistant:archiveHistory`

---

## User Context

### User API

```typescript
interface User {
  // Get current user
  getCurrent(): Promise<UserProfile | null>;
  
  // Get user ID
  getId(): Promise<string | null>;
  
  // Check if user is authenticated
  isAuthenticated(): Promise<boolean>;
  
  // Listen for user changes
  onChanged(callback: (user: UserProfile | null) => void): () => void;
}

interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}
```

**Example:**

```javascript
// Get current user
const user = await canopi.user.getCurrent();
if (user) {
  console.log('User:', user.name, user.email);
} else {
  console.log('Not authenticated');
}

// Listen for user changes
canopi.user.onChanged((user) => {
  if (user) {
    console.log('User logged in:', user.name);
  } else {
    console.log('User logged out');
  }
  updateUI();
});
```

---

## Theme & Styling

### Theme API

```typescript
interface Theme {
  // Get current theme
  getCurrent(): Promise<'light' | 'dark' | 'auto'>;
  
  // Set theme
  set(theme: 'light' | 'dark' | 'auto'): Promise<void>;
  
  // Get theme tokens (CSS variables)
  getTokens(): Promise<ThemeTokens>;
  
  // Listen for theme changes
  onChanged(callback: (theme: 'light' | 'dark' | 'auto') => void): () => void;
}

interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}
```

**Example:**

```javascript
// Get current theme
const theme = await canopi.theme.getCurrent();
console.log('Current theme:', theme);

// Get theme tokens
const tokens = await canopi.theme.getTokens();
document.documentElement.style.setProperty('--primary-color', tokens.colors.primary);

// Use theme tokens in CSS
// CSS variables are automatically available:
// var(--canopi-color-primary)
// var(--canopi-color-background)
// var(--canopi-spacing-md)

// Listen for theme changes
canopi.theme.onChanged((newTheme) => {
  console.log('Theme changed to:', newTheme);
  updateStyles();
});
```

### Styling Best Practices

1. **Use Theme Tokens**: Always use theme tokens instead of hardcoded colors
2. **Respect User Preferences**: Don't override user theme choices
3. **CSS Variables**: Use CSS variables for dynamic theming
4. **Responsive Design**: Ensure UI works in both light and dark themes

**Example CSS:**

```css
.archive-tab {
  background: var(--canopi-color-surface);
  color: var(--canopi-color-text);
  padding: var(--canopi-spacing-md);
  border: 1px solid var(--canopi-color-border);
}

.archive-button {
  background: var(--canopi-color-primary);
  color: var(--canopi-color-text);
  padding: var(--canopi-spacing-sm) var(--canopi-spacing-md);
  border-radius: 4px;
}
```

---

## Diagnostics

### Diagnostics API

```typescript
interface Diagnostics {
  // Report diagnostic information
  report(level: 'error' | 'warn' | 'info' | 'debug', message: string, data?: any): void;
  
  // Report error
  error(message: string, error?: Error, context?: any): void;
  
  // Report warning
  warn(message: string, data?: any): void;
  
  // Report info
  info(message: string, data?: any): void;
  
  // Report debug
  debug(message: string, data?: any): void;
  
  // Create diagnostic session
  createSession(name: string): DiagnosticSession;
}

interface DiagnosticSession {
  start(): void;
  end(): void;
  report(level: string, message: string, data?: any): void;
}
```

**Example:**

```javascript
// Report errors
try {
  await archivePage();
} catch (error) {
  canopi.diagnostics.error('Archive failed', error, {
    url: window.location.href,
    services: ['wayback', 'ipfs']
  });
}

// Report warnings
if (!canopi.permissions.has('archive:wayback')) {
  canopi.diagnostics.warn('Wayback permission not granted', {
    action: 'archive:request'
  });
}

// Create diagnostic session
const session = canopi.diagnostics.createSession('archive-operation');
session.start();

try {
  await archivePage();
  session.report('info', 'Archive completed successfully');
} catch (error) {
  session.report('error', 'Archive failed', error);
} finally {
  session.end();
}
```

---

## Lifecycle Hooks

Lifecycle hooks are defined in the manifest and called automatically by the host.

### Hook Signatures

```typescript
// Called when module is loaded
function onInit(): void | Promise<void>;

// Called when tab is activated
function onActivate(context: TabContext): void | Promise<void>;

// Called when tab is deactivated
function onDeactivate(context: TabContext): void | Promise<void>;

// Called when module is unloaded
function onDestroy(): void | Promise<void>;
```

**Example:**

```javascript
// In your module entry point
export async function initialize() {
  console.log('Archive Assistant initializing...');
  // Initialize module state
  await loadSettings();
}

export async function onTabActivated(context) {
  console.log('Archive tab activated');
  // Refresh data when tab becomes active
  await refreshArchiveHistory();
  await updateBadge();
}

export async function onTabDeactivated(context) {
  console.log('Archive tab deactivated');
  // Clean up when tab becomes inactive
  clearInterval(updateInterval);
}

export async function cleanup() {
  console.log('Archive Assistant cleaning up...');
  // Clean up resources
  await saveSettings();
}
```

---

## Error Handling

### Error Types

```typescript
class CanopiError extends Error {
  code: string;
  details?: any;
}

// Permission errors
class PermissionError extends CanopiError {
  code: 'PERMISSION_DENIED' | 'PERMISSION_REQUIRED';
  scope: string;
}

// Bridge errors
class BridgeError extends CanopiError {
  code: 'BRIDGE_TIMEOUT' | 'BRIDGE_ERROR' | 'BRIDGE_INVALID_RESPONSE';
  event: string;
}

// Storage errors
class StorageError extends CanopiError {
  code: 'STORAGE_QUOTA_EXCEEDED' | 'STORAGE_ERROR';
  key?: string;
}
```

**Example:**

```javascript
try {
  await canopi.bridge.request('archive:request', { url: '...' });
} catch (error) {
  if (error instanceof PermissionError) {
    console.error('Permission denied:', error.scope);
    showPermissionPrompt();
  } else if (error instanceof BridgeError) {
    console.error('Bridge error:', error.code, error.event);
    showErrorMessage('Failed to communicate with host');
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## TypeScript Support

### Installation

TypeScript definitions are included with the SDK. If using TypeScript, you can:

1. **Include the definitions file directly**:
   ```typescript
   /// <reference path="./types/canopi-sdk.d.ts" />
   ```

2. **Install via npm** (when SDK is published):
   ```bash
   npm install @canopi/sdk
   ```

3. **Use the definitions from the documentation**:
   - See [`types/canopi-sdk.d.ts`](./types/canopi-sdk.d.ts) for complete type definitions

### TypeScript Example

```typescript
import type { SDK, TabConfig, TabContext } from 'canopi-sdk';

const canopi: SDK = window.canopi;

const tab = canopi.registerTab({
  id: 'archive',
  title: 'Archive',
  icon: 'archive-icon',
  
  render: async (container: HTMLElement, context: TabContext) => {
    container.innerHTML = '<div>Archive Assistant</div>';
  },
  
  onActivate: async (context: TabContext) => {
    console.log('Tab activated', context.userId);
  }
});

// Type-safe bridge requests
interface ArchiveRequest {
  url: string;
  services: string[];
}

interface ArchiveResponse {
  status: 'success' | 'error';
  results?: Record<string, any>;
  error?: string;
}

const response = await canopi.bridge.request<ArchiveResponse>(
  'archive:request',
  { url: 'https://example.com', services: ['wayback'] } as ArchiveRequest
);
```

### Type Definitions

Complete TypeScript definitions are available in [`types/canopi-sdk.d.ts`](./types/canopi-sdk.d.ts). The definitions include:

- All SDK interfaces and types
- Full type safety for API calls
- IntelliSense support in IDEs
- Compile-time error checking

---

## Complete Example: Archive Assistant

```javascript
// archive-assistant.js

const { registerTab, bridge, permissions, storage, user, theme, diagnostics } = window.canopi;

// Register the tab
const tab = registerTab({
  id: 'archive',
  title: 'Archive',
  icon: 'archive-icon',
  
  render: async (container, context) => {
    container.innerHTML = `
      <div class="archive-tab">
        <h2>Archive Assistant</h2>
        <div class="current-page">
          <p>Current page: <span id="current-url"></span></p>
        </div>
        <div class="services">
          <label>
            <input type="checkbox" id="wayback-check" checked>
            Wayback Machine
          </label>
          <label>
            <input type="checkbox" id="ipfs-check" checked>
            IPFS
          </label>
          <label>
            <input type="checkbox" id="ordinals-check">
            Bitcoin Ordinals
          </label>
        </div>
        <button id="archive-btn" class="archive-button">Archive Page</button>
        <div id="archive-status" class="status"></div>
        <div id="archive-history" class="history"></div>
      </div>
    `;
    
    // Set up event listeners
    setupEventListeners(container);
    
    // Load archive history
    await loadArchiveHistory(container);
  },
  
  onActivate: async (context) => {
    console.log('Archive tab activated');
    await refreshArchiveHistory();
  },
  
  badge: {
    getValue: async () => {
      const history = await storage.local.get('archiveHistory') || [];
      return history.length;
    },
    updateInterval: 10000
  }
});

// Set up event listeners
function setupEventListeners(container) {
  const archiveBtn = container.querySelector('#archive-btn');
  const waybackCheck = container.querySelector('#wayback-check');
  const ipfsCheck = container.querySelector('#ipfs-check');
  const ordinalsCheck = container.querySelector('#ordinals-check');
  const statusDiv = container.querySelector('#archive-status');
  
  archiveBtn.addEventListener('click', async () => {
    await handleArchive(waybackCheck, ipfsCheck, ordinalsCheck, statusDiv);
  });
  
  // Listen for archive status updates
  bridge.on('archive:status', (status) => {
    updateStatus(statusDiv, status);
  });
}

// Handle archive request
async function handleArchive(waybackCheck, ipfsCheck, ordinalsCheck, statusDiv) {
  try {
    // Check permissions
    const services = [];
    if (waybackCheck.checked) {
      if (!permissions.has('archive:wayback')) {
        const granted = await permissions.request('archive:wayback');
        if (!granted) {
          showError(statusDiv, 'Wayback Machine permission denied');
          return;
        }
      }
      services.push('wayback');
    }
    
    if (ipfsCheck.checked) {
      if (!permissions.has('archive:ipfs')) {
        const granted = await permissions.request('archive:ipfs');
        if (!granted) {
          showError(statusDiv, 'IPFS permission denied');
          return;
        }
      }
      services.push('ipfs');
    }
    
    if (ordinalsCheck.checked) {
      if (!permissions.has('archive:ordinals')) {
        const granted = await permissions.request('archive:ordinals');
        if (!granted) {
          showError(statusDiv, 'Ordinals permission denied');
          return;
        }
      }
      services.push('ordinals');
    }
    
    if (services.length === 0) {
      showError(statusDiv, 'Please select at least one archive service');
      return;
    }
    
    // Get current page URL
    const currentUrl = await bridge.request('page:getUrl');
    
    // Request archive
    showStatus(statusDiv, 'Archiving...', 'info');
    const response = await bridge.request('archive:request', {
      url: currentUrl,
      services: services,
      options: {
        captureScreenshot: true,
        waitForLoad: true
      }
    });
    
    if (response.status === 'success') {
      showStatus(statusDiv, 'Archive completed successfully!', 'success');
      
      // Save to history
      await saveToHistory(currentUrl, response.results);
      
      // Refresh history display
      await loadArchiveHistory();
    } else {
      showError(statusDiv, response.error || 'Archive failed');
    }
  } catch (error) {
    diagnostics.error('Archive failed', error);
    showError(statusDiv, 'Archive failed: ' + error.message);
  }
}

// Update status display
function updateStatus(statusDiv, status) {
  const progress = status.progress || 0;
  statusDiv.innerHTML = `
    <div class="status-info">
      <p>${status.status} (${status.service})</p>
      <progress value="${progress}" max="100">${progress}%</progress>
    </div>
  `;
}

function showStatus(statusDiv, message, type) {
  statusDiv.innerHTML = `<p class="status-${type}">${message}</p>`;
}

function showError(statusDiv, message) {
  showStatus(statusDiv, message, 'error');
}

// Load archive history
async function loadArchiveHistory(container) {
  const history = await storage.local.get('archiveHistory') || [];
  const historyDiv = container?.querySelector('#archive-history') || 
                     document.querySelector('#archive-history');
  
  if (history.length === 0) {
    historyDiv.innerHTML = '<p>No archive history</p>';
    return;
  }
  
  historyDiv.innerHTML = `
    <h3>Archive History</h3>
    <ul>
      ${history.map(item => `
        <li>
          <a href="${item.url}" target="_blank">${item.url}</a>
          <span class="timestamp">${new Date(item.timestamp).toLocaleString()}</span>
          ${item.results.wayback ? `<a href="${item.results.wayback.url}" target="_blank">Wayback</a>` : ''}
          ${item.results.ipfs ? `<a href="${item.results.ipfs.gatewayUrl}" target="_blank">IPFS</a>` : ''}
        </li>
      `).join('')}
    </ul>
  `;
}

// Save to history
async function saveToHistory(url, results) {
  const history = await storage.local.get('archiveHistory') || [];
  history.unshift({
    url: url,
    timestamp: Date.now(),
    results: results
  });
  
  // Keep only last 100 entries
  if (history.length > 100) {
    history.splice(100);
  }
  
  await storage.local.set('archiveHistory', history);
}

// Refresh archive history
async function refreshArchiveHistory() {
  const container = document.querySelector('.archive-tab');
  if (container) {
    await loadArchiveHistory(container);
  }
}

// Lifecycle hooks
export async function initialize() {
  console.log('Archive Assistant initializing...');
  // Initialize module
}

export async function onTabActivated(context) {
  console.log('Archive tab activated');
  await refreshArchiveHistory();
}

export async function onTabDeactivated(context) {
  console.log('Archive tab deactivated');
}

export async function cleanup() {
  console.log('Archive Assistant cleaning up...');
}
```

---

## Best Practices

1. **Error Handling**: Always wrap SDK calls in try-catch blocks
2. **Permissions**: Check permissions before using features
3. **Storage**: Use appropriate storage type (local vs sync)
4. **Theming**: Use theme tokens for consistent styling
5. **Diagnostics**: Report errors and important events
6. **Lifecycle**: Clean up resources in lifecycle hooks
7. **Performance**: Debounce frequent operations
8. **Security**: Never expose sensitive data in logs

---

## Migration Guide

### From v0.x to v1.0

- `canopi.tab.register()` → `canopi.registerTab()`
- `canopi.communicate()` → `canopi.bridge.request()`
- `canopi.storage.get()` → `canopi.storage.local.get()`
- Event listeners now return unsubscribe functions

---

## References

- [Manifest Schema](./SIDEBAR_TAB_SDK_MANIFEST_SCHEMA.md)
- [Store API](./CANOPI_STORE_API.md) (to be created)
- [Host Integration Guide](./SIDEBAR_TAB_SDK_HOST_INTEGRATION.md) (to be created)


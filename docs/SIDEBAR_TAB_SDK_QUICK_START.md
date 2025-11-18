# Sidebar Tab SDK Quick Start Guide

## Overview

This guide will walk you through creating your first Canopi Sidebar Tab module - the Archive Assistant. By the end, you'll have a working tab that can archive web pages to multiple services.

## Prerequisites

- Basic knowledge of JavaScript (ES2017+) or TypeScript
- Familiarity with HTML/CSS
- Node.js and npm (for building)
- A Canopi development environment
- (Optional) TypeScript for type-safe development

## Step 1: Project Setup

### Create Project Structure

```bash
mkdir archive-assistant
cd archive-assistant
npm init -y
```

### Install Dependencies

**JavaScript:**
```bash
npm install --save-dev webpack webpack-cli html-webpack-plugin css-loader style-loader
```

**TypeScript:**
```bash
npm install --save-dev webpack webpack-cli html-webpack-plugin css-loader style-loader typescript ts-loader @types/node
```

### Project Structure

**JavaScript:**
```
archive-assistant/
├── src/
│   ├── index.js          # Main entry point
│   ├── styles.css        # Tab styles
│   └── components/       # UI components (optional)
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── canopi-tab.json       # Module manifest
├── package.json
├── webpack.config.js
└── README.md
```

**TypeScript:**
```
archive-assistant/
├── src/
│   ├── index.ts          # Main entry point
│   ├── styles.css        # Tab styles
│   ├── types/
│   │   └── canopi-sdk.d.ts  # SDK type definitions
│   └── components/       # UI components (optional)
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── canopi-tab.json       # Module manifest
├── package.json
├── tsconfig.json         # TypeScript configuration
├── webpack.config.js
└── README.md
```

## Step 2: Create the Manifest

Create `canopi-tab.json`:

```json
{
  "$schema": "https://canopi.store/schemas/tab-manifest-v1.json",
  "manifestVersion": "1.0.0",
  
  "id": "com.canopi.archive-assistant",
  "name": "Archive Assistant",
  "version": "1.0.0",
  "description": "Archive web pages to Wayback Machine, IPFS, and Bitcoin Ordinals",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  
  "store": {
    "packageName": "archive-assistant",
    "category": "archive",
    "tags": ["archive", "wayback", "ipfs"],
    "icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  
  "sdk": {
    "minimumVersion": "1.0.0"
  },
  
  "host": {
    "minimumVersion": "0.1.0"
  },
  
  "tab": {
    "id": "archive",
    "title": "Archive",
    "icon": "archive-icon",
    "order": 10
  },
  
  "entry": {
    "main": "dist/index.js",
    "styles": ["dist/styles.css"]
  },
  
  "permissions": {
    "required": [
      "archive:wayback",
      "archive:ipfs",
      "page:url",
      "network:fetch"
    ],
    "optional": [
      "archive:ordinals",
      "storage:local"
    ]
  },
  
  "permissionScopes": {
    "archive:wayback": {
      "description": "Archive pages to Wayback Machine",
      "required": true,
      "userPrompt": "Allow Archive Assistant to save pages to Wayback Machine?"
    },
    "archive:ipfs": {
      "description": "Archive pages to IPFS",
      "required": true,
      "userPrompt": "Allow Archive Assistant to save pages to IPFS?"
    },
    "page:url": {
      "description": "Access current page URL",
      "required": true
    },
    "network:fetch": {
      "description": "Make network requests",
      "required": true
    }
  },
  
  "config": {
    "settings": {
      "defaultServices": {
        "type": "multiselect",
        "label": "Default Archive Services",
        "default": ["wayback", "ipfs"],
        "options": [
          { "value": "wayback", "label": "Wayback Machine" },
          { "value": "ipfs", "label": "IPFS" }
        ]
      }
    }
  },
  
  "lifecycle": {
    "onInit": "initialize",
    "onActivate": "onTabActivated"
  },
  
  "apis": {
    "bridge": {
      "events": {
        "archive:request": {
          "type": "request",
          "direction": "tab->host"
        },
        "archive:response": {
          "type": "response",
          "direction": "host->tab"
        }
      }
    }
  }
}
```

## Step 3: Create the Main Module

### JavaScript Version

Create `src/index.js`:

```javascript
// Archive Assistant Tab Module

const { registerTab, bridge, permissions, storage, diagnostics } = window.canopi;

// Archive history storage
let archiveHistory = [];

// Initialize module
export async function initialize() {
  console.log('Archive Assistant initializing...');
  
  // Load archive history
  try {
    archiveHistory = await storage.local.get('archiveHistory') || [];
  } catch (error) {
    diagnostics.error('Failed to load archive history', error);
  }
}

// Register the tab
const tab = registerTab({
  id: 'archive',
  title: 'Archive',
  icon: 'archive-icon',
  
  render: async (container, context) => {
    // Render tab UI
    container.innerHTML = `
      <div class="archive-tab">
        <h2>Archive Assistant</h2>
        
        <div class="current-page">
          <p><strong>Current Page:</strong></p>
          <p id="current-url" class="url-display">Loading...</p>
        </div>
        
        <div class="services-section">
          <h3>Archive Services</h3>
          <label class="service-option">
            <input type="checkbox" id="wayback-check" checked>
            <span>Wayback Machine</span>
          </label>
          <label class="service-option">
            <input type="checkbox" id="ipfs-check" checked>
            <span>IPFS</span>
          </label>
          <label class="service-option">
            <input type="checkbox" id="ordinals-check">
            <span>Bitcoin Ordinals</span>
          </label>
        </div>
        
        <button id="archive-btn" class="archive-button">Archive This Page</button>
        
        <div id="archive-status" class="status-container"></div>
        
        <div class="history-section">
          <h3>Archive History</h3>
          <div id="archive-history" class="history-list"></div>
        </div>
      </div>
    `;
    
    // Set up event listeners
    setupEventListeners(container);
    
    // Load current page URL
    await loadCurrentPageUrl(container);
    
    // Load archive history
    await renderArchiveHistory(container);
  },
  
  onActivate: async (context) => {
    console.log('Archive tab activated');
    await refreshArchiveHistory();
  },
  
  badge: {
    getValue: async () => {
      const history = await storage.local.get('archiveHistory') || [];
      return history.length > 0 ? history.length : null;
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
  
  archiveBtn.addEventListener('click', async () => {
    await handleArchiveClick(waybackCheck, ipfsCheck, ordinalsCheck, container);
  });
  
  // Listen for archive status updates
  bridge.on('archive:status', (status) => {
    updateArchiveStatus(container, status);
  });
  
  // Listen for archive responses
  bridge.on('archive:response', (response) => {
    handleArchiveResponse(container, response);
  });
}

// Load current page URL
async function loadCurrentPageUrl(container) {
  try {
    const url = await bridge.request('page:getUrl');
    const urlDisplay = container.querySelector('#current-url');
    if (urlDisplay) {
      urlDisplay.textContent = url;
      urlDisplay.title = url;
    }
  } catch (error) {
    diagnostics.error('Failed to get current page URL', error);
    const urlDisplay = container.querySelector('#current-url');
    if (urlDisplay) {
      urlDisplay.textContent = 'Error loading URL';
    }
  }
}

// Handle archive button click
async function handleArchiveClick(waybackCheck, ipfsCheck, ordinalsCheck, container) {
  const statusDiv = container.querySelector('#archive-status');
  
  try {
    // Collect selected services
    const services = [];
    if (waybackCheck.checked) {
      if (!permissions.has('archive:wayback')) {
        const granted = await permissions.request('archive:wayback');
        if (!granted) {
          showStatus(statusDiv, 'Wayback Machine permission denied', 'error');
          return;
        }
      }
      services.push('wayback');
    }
    
    if (ipfsCheck.checked) {
      if (!permissions.has('archive:ipfs')) {
        const granted = await permissions.request('archive:ipfs');
        if (!granted) {
          showStatus(statusDiv, 'IPFS permission denied', 'error');
          return;
        }
      }
      services.push('ipfs');
    }
    
    if (ordinalsCheck.checked) {
      if (!permissions.has('archive:ordinals')) {
        const granted = await permissions.request('archive:ordinals');
        if (!granted) {
          showStatus(statusDiv, 'Ordinals permission denied', 'error');
          return;
        }
      }
      services.push('ordinals');
    }
    
    if (services.length === 0) {
      showStatus(statusDiv, 'Please select at least one archive service', 'warning');
      return;
    }
    
    // Get current page URL
    const currentUrl = await bridge.request('page:getUrl');
    
    // Show loading status
    showStatus(statusDiv, 'Archiving...', 'info');
    
    // Request archive
    const response = await bridge.request('archive:request', {
      url: currentUrl,
      services: services,
      options: {
        captureScreenshot: true,
        waitForLoad: true
      }
    });
    
    // Handle response
    await handleArchiveResponse(container, response);
    
  } catch (error) {
    diagnostics.error('Archive failed', error);
    showStatus(statusDiv, `Archive failed: ${error.message}`, 'error');
  }
}

// Handle archive response
async function handleArchiveResponse(container, response) {
  const statusDiv = container.querySelector('#archive-status');
  
  if (response.status === 'success') {
    showStatus(statusDiv, 'Archive completed successfully!', 'success');
    
    // Get current URL
    const currentUrl = await bridge.request('page:getUrl');
    
    // Save to history
    await saveToHistory(currentUrl, response.results);
    
    // Refresh history display
    await renderArchiveHistory(container);
    
    // Update badge
    tab.setBadge(archiveHistory.length);
    
  } else {
    showStatus(statusDiv, response.error || 'Archive failed', 'error');
  }
}

// Update archive status (for progress updates)
function updateArchiveStatus(container, status) {
  const statusDiv = container.querySelector('#archive-status');
  if (!statusDiv) return;
  
  const progress = status.progress || 0;
  statusDiv.innerHTML = `
    <div class="status-info">
      <p>${status.status} (${status.service})</p>
      <progress value="${progress}" max="100">${progress}%</progress>
    </div>
  `;
}

// Show status message
function showStatus(container, message, type) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="status status-${type}">
      <p>${message}</p>
    </div>
  `;
}

// Render archive history
async function renderArchiveHistory(container) {
  const historyDiv = container.querySelector('#archive-history');
  if (!historyDiv) return;
  
  try {
    archiveHistory = await storage.local.get('archiveHistory') || [];
    
    if (archiveHistory.length === 0) {
      historyDiv.innerHTML = '<p class="empty-history">No archive history yet</p>';
      return;
    }
    
    historyDiv.innerHTML = `
      <ul class="history-items">
        ${archiveHistory.slice(0, 10).map(item => `
          <li class="history-item">
            <div class="history-url">
              <a href="${item.url}" target="_blank" title="${item.url}">
                ${truncateUrl(item.url, 50)}
              </a>
            </div>
            <div class="history-meta">
              <span class="history-time">${formatTime(item.timestamp)}</span>
              <div class="history-links">
                ${item.results.wayback ? `
                  <a href="${item.results.wayback.url}" target="_blank" class="archive-link">
                    Wayback
                  </a>
                ` : ''}
                ${item.results.ipfs ? `
                  <a href="${item.results.ipfs.gatewayUrl}" target="_blank" class="archive-link">
                    IPFS
                  </a>
                ` : ''}
                ${item.results.ordinals ? `
                  <a href="#" class="archive-link" title="Ordinal: ${item.results.ordinals.inscriptionId}">
                    Ordinal
                  </a>
                ` : ''}
              </div>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  } catch (error) {
    diagnostics.error('Failed to render archive history', error);
    historyDiv.innerHTML = '<p class="error">Failed to load history</p>';
  }
}

// Save to history
async function saveToHistory(url, results) {
  try {
    archiveHistory.unshift({
      url: url,
      timestamp: Date.now(),
      results: results
    });
    
    // Keep only last 100 entries
    if (archiveHistory.length > 100) {
      archiveHistory.splice(100);
    }
    
    await storage.local.set('archiveHistory', archiveHistory);
  } catch (error) {
    diagnostics.error('Failed to save archive history', error);
  }
}

// Refresh archive history
async function refreshArchiveHistory() {
  const container = document.querySelector('.archive-tab');
  if (container) {
    await renderArchiveHistory(container);
  }
}

// Utility functions
function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

// Lifecycle hooks
export async function onTabActivated(context) {
  console.log('Archive tab activated');
  await refreshArchiveHistory();
}

export async function onTabDeactivated(context) {
  console.log('Archive tab deactivated');
}
```

## Step 4: Create Styles

Create `src/styles.css`:

```css
.archive-tab {
  padding: var(--canopi-spacing-md);
  color: var(--canopi-color-text);
  background: var(--canopi-color-surface);
}

.archive-tab h2 {
  margin: 0 0 var(--canopi-spacing-md) 0;
  color: var(--canopi-color-text);
}

.current-page {
  margin-bottom: var(--canopi-spacing-lg);
  padding: var(--canopi-spacing-md);
  background: var(--canopi-color-background);
  border-radius: 4px;
  border: 1px solid var(--canopi-color-border);
}

.url-display {
  word-break: break-all;
  color: var(--canopi-color-text-secondary);
  font-size: var(--canopi-font-size-sm);
}

.services-section {
  margin-bottom: var(--canopi-spacing-lg);
}

.services-section h3 {
  margin: 0 0 var(--canopi-spacing-sm) 0;
  font-size: var(--canopi-font-size-md);
}

.service-option {
  display: flex;
  align-items: center;
  margin-bottom: var(--canopi-spacing-sm);
  cursor: pointer;
}

.service-option input[type="checkbox"] {
  margin-right: var(--canopi-spacing-sm);
}

.archive-button {
  width: 100%;
  padding: var(--canopi-spacing-sm) var(--canopi-spacing-md);
  background: var(--canopi-color-primary);
  color: var(--canopi-color-text);
  border: none;
  border-radius: 4px;
  font-size: var(--canopi-font-size-md);
  cursor: pointer;
  margin-bottom: var(--canopi-spacing-md);
}

.archive-button:hover {
  opacity: 0.9;
}

.archive-button:active {
  opacity: 0.8;
}

.status-container {
  margin-bottom: var(--canopi-spacing-lg);
  min-height: 40px;
}

.status {
  padding: var(--canopi-spacing-sm);
  border-radius: 4px;
  margin-bottom: var(--canopi-spacing-sm);
}

.status-info {
  padding: var(--canopi-spacing-sm);
}

.status-info progress {
  width: 100%;
  margin-top: var(--canopi-spacing-xs);
}

.status-success {
  background: var(--canopi-color-success);
  color: white;
}

.status-error {
  background: var(--canopi-color-error);
  color: white;
}

.status-warning {
  background: var(--canopi-color-warning);
  color: white;
}

.status-info {
  background: var(--canopi-color-primary);
  color: white;
}

.history-section {
  margin-top: var(--canopi-spacing-lg);
}

.history-section h3 {
  margin: 0 0 var(--canopi-spacing-sm) 0;
  font-size: var(--canopi-font-size-md);
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  padding: var(--canopi-spacing-sm);
  margin-bottom: var(--canopi-spacing-xs);
  background: var(--canopi-color-background);
  border-radius: 4px;
  border: 1px solid var(--canopi-color-border);
}

.history-url a {
  color: var(--canopi-color-primary);
  text-decoration: none;
}

.history-url a:hover {
  text-decoration: underline;
}

.history-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--canopi-spacing-xs);
  font-size: var(--canopi-font-size-sm);
  color: var(--canopi-color-text-secondary);
}

.history-links {
  display: flex;
  gap: var(--canopi-spacing-sm);
}

.archive-link {
  color: var(--canopi-color-primary);
  text-decoration: none;
  font-size: var(--canopi-font-size-xs);
}

.archive-link:hover {
  text-decoration: underline;
}

.empty-history {
  color: var(--canopi-color-text-secondary);
  font-style: italic;
  text-align: center;
  padding: var(--canopi-spacing-lg);
}
```

## Step 4: TypeScript Configuration (Optional)

If using TypeScript, create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "lib": ["ES2017", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Step 5: Configure Webpack

Create `webpack.config.js`:

**JavaScript:**
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'ArchiveAssistant',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false
    })
  ]
};
```

**TypeScript:**
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'ArchiveAssistant',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false
    })
  ]
};
```

## Step 6: Build Scripts

Update `package.json`:

```json
{
  "name": "archive-assistant",
  "version": "1.0.0",
  "scripts": {
    "build": "webpack",
    "watch": "webpack --watch"
  }
}
```

## Step 7: Build and Test

### Build the Module

```bash
npm run build
```

This creates `dist/index.js` and `dist/styles.css`.

### Test Locally

1. Copy the built files to your Canopi development environment
2. Load the module via the Canopi host's module loader
3. Test the archive functionality

## Step 8: Publish to Store

1. **Validate Manifest**: Ensure `canopi-tab.json` is valid
2. **Package Module**: Create a zip file with:
   - `canopi-tab.json`
   - `dist/index.js`
   - `dist/styles.css`
   - `icons/` directory
3. **Submit to Store**: Upload package to Canopi Store
4. **Review Process**: Wait for store review
5. **Publication**: Module becomes available

## Next Steps

- Read the [Full API Documentation](./SIDEBAR_TAB_SDK_API.md)
- Check the [Manifest Schema](./SIDEBAR_TAB_SDK_MANIFEST_SCHEMA.md)
- Explore [Example Modules](../examples/)
- Join the [Developer Community](https://canopi.org/developers)

## Troubleshooting

### Module Not Loading

- Check manifest validation
- Verify entry point path
- Check browser console for errors

### Permissions Not Working

- Ensure permissions are declared in manifest
- Check permission scope names match
- Verify user granted permissions

### Bridge Communication Failing

- Check event names match manifest
- Verify request/response schemas
- Check network connectivity

### Styling Issues

- Use theme tokens instead of hardcoded colors
- Check CSS variable names
- Verify stylesheet is loaded

## Resources

- [SDK API Reference](./SIDEBAR_TAB_SDK_API.md)
- [Manifest Schema](./SIDEBAR_TAB_SDK_MANIFEST_SCHEMA.md)
- [Canopi Developer Portal](https://canopi.org/developers)


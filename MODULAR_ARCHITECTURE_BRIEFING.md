# 🏗️ Modular Architecture Briefing
## Chrome Extension Sidepanel Development Guide

### 📋 Overview
This document provides a comprehensive guide for developers working on the **Agent**, **People**, and **Rooms** tabs of the Chrome extension sidepanel. The project has been refactored into a modular architecture following the **COMP method** for better maintainability and scalability.

---

## 🎯 Project Structure

### Core Architecture
```
presence/
├── sidepanel.html              # Main HTML entry point
├── sidepanel.js               # Main orchestration script
├── sidepanel.css              # Main stylesheet
├── manifest.json              # Chrome extension manifest
│
├── features/                  # 🎯 MAIN MODULES (Your Focus)
│   ├── AgentModule.js         # 🤖 AI Agent functionality
│   ├── PeopleModule.js        # 👥 People & connections
│   ├── RoomsModule.js         # 🏠 Room management
│   ├── CanopiModule.js        # 💬 Chat & messaging
│   ├── CommunitiesModule.js   # 🌐 Community management
│   ├── ProfileManager.js      # 👤 User profiles
│   └── UIManager.js           # 🎨 UI management
│
├── core/                      # Core system components
│   └── SidepanelCore.js       # Core sidepanel functionality
│
├── utils/                     # Utility modules
│   ├── AvatarUtils.js         # Avatar handling
│   ├── ErrorHandler.js        # Error management
│   └── Diagnostics.js         # Debug utilities
│
├── services/                  # Service layer
│   ├── SupabaseService.js     # Database operations
│   └── BackgroundService.js   # Background tasks
│
└── lib/                       # External libraries
    └── supabase.min.js        # Supabase client
```

---

## 🎯 Your Focus: Feature Modules

### 1. 🤖 AgentModule.js
**Purpose**: AI Agent functionality and automation
**Status**: ⚠️ **Needs Implementation**
**Key Responsibilities**:
- AI agent interactions
- Automation workflows
- Agent configuration
- AI response handling

**Current State**:
```javascript
class AgentModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }
  
  async initialize() {
    // TODO: Initialize agent and AI systems here
  }
}
```

### 2. 👥 PeopleModule.js
**Purpose**: People and connections management
**Status**: ⚠️ **Needs Implementation**
**Key Responsibilities**:
- User connections
- Contact management
- People search
- Social features

**Current State**:
```javascript
class PeopleModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }
  
  async initialize() {
    // TODO: Initialize people and connection systems here
  }
}
```

### 3. 🏠 RoomsModule.js
**Purpose**: Room and community management
**Status**: ⚠️ **Needs Implementation**
**Key Responsibilities**:
- Room creation/management
- Room settings
- Room permissions
- Room discovery

**Current State**:
```javascript
class RoomsModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }
  
  async initialize() {
    // TODO: Initialize room and community systems here
  }
}
```

---

## 🔧 Development Guidelines

### Module Structure Template
Each module should follow this structure:

```javascript
/**
 * MODULE_NAME - Brief Description
 * Handles all [module] functionality
 */

class ModuleName {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
    // Add module-specific properties
  }

  /**
   * Initialize Module
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'ModuleName already initialized');
      return;
    }

    this.log('INFO', 'Initializing ModuleName...');
    
    try {
      // TODO: Initialize module systems here
      
      this.isInitialized = true;
      this.log('INFO', 'ModuleName initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize ModuleName:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  log(level, message, ...args) {
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[${level}] ${message}`, ...args);
    }
  }

  // Add your module methods here
}

// Export for global access
window.ModuleName = ModuleName;
```

### Key Dependencies

#### 1. State Management
```javascript
// Access global state
const currentUser = window.currentUser;
const communities = window.getState?.('communities') || [];
const activeCommunities = window.getState?.('activeCommunities') || [];
```

#### 2. Supabase Integration
```javascript
// Database operations
const { data, error } = await window.supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value');
```

#### 3. Event System
```javascript
// Listen to events
window.addEventListener('customEvent', (event) => {
  // Handle event
});

// Emit events
window.dispatchEvent(new CustomEvent('customEvent', {
  detail: { data: 'value' }
}));
```

#### 4. Avatar System
```javascript
// Create avatars
const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(user, {
  size: 32,
  showAura: true,
  showStatus: true
});
```

---

## 🎨 UI/UX Guidelines

### HTML Structure
The main sidepanel structure is in `sidepanel.html`:

```html
<div id="sidepanel">
  <!-- Tab Navigation -->
  <div class="tab-navigation">
    <button class="tab-btn" data-tab="canopi-live-chat">💬</button>
    <button class="tab-btn" data-tab="agent">🤖</button>
    <button class="tab-btn" data-tab="people">👥</button>
    <button class="tab-btn" data-tab="rooms">🏠</button>
    <button class="tab-btn" data-tab="settings">⚙️</button>
  </div>

  <!-- Tab Content -->
  <div class="tab-content">
    <div id="canopi-live-chat" class="tab-pane active">...</div>
    <div id="agent" class="tab-pane">...</div>
    <div id="people" class="tab-pane">...</div>
    <div id="rooms" class="tab-pane">...</div>
    <div id="settings" class="tab-pane">...</div>
  </div>
</div>
```

### CSS Classes
Use these existing CSS classes for consistency:

```css
/* Tab styling */
.tab-btn { /* Tab buttons */ }
.tab-btn.active { /* Active tab */ }
.tab-pane { /* Tab content */ }
.tab-pane.active { /* Active tab content */ }

/* Card styling */
.card { /* General cards */ }
.card-header { /* Card headers */ }
.card-body { /* Card content */ }

/* Button styling */
.btn { /* General buttons */ }
.btn-primary { /* Primary buttons */ }
.btn-secondary { /* Secondary buttons */ }

/* Avatar styling */
.user-avatar { /* User avatars */ }
.avatar-container { /* Avatar containers */ }
```

### Responsive Design
- **Width**: 320px (fixed)
- **Height**: 600px (max)
- **Mobile**: Responsive within Chrome extension constraints

---

## 🔌 Integration Points

### 1. Authentication
```javascript
// Check if user is authenticated
if (window.currentUser) {
  // User is logged in
  const userEmail = window.currentUser.email;
  const userName = window.currentUser.name;
} else {
  // User needs to authenticate
  // Redirect to auth flow
}
```

### 2. Real-time Updates
```javascript
// Listen to real-time events
window.supabaseRealtimeClient.on('presence', (payload) => {
  // Handle presence updates
});

window.supabaseRealtimeClient.on('messages', (payload) => {
  // Handle message updates
});
```

### 3. API Calls
```javascript
// Make API calls (automatically redirected to VPS)
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-email': window.currentUser.email
  },
  body: JSON.stringify(data)
});
```

---

## 🚀 Getting Started

### 1. Development Setup
```bash
# Navigate to project
cd /home/ubuntu/metalayer-initiative

# Start backend server
node app.js

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the 'presence' folder
```

### 2. Module Development
1. **Choose your module** (Agent, People, or Rooms)
2. **Follow the template** structure above
3. **Implement the `initialize()` method**
4. **Add your specific functionality**
5. **Test with the existing UI structure**

### 3. Testing
```javascript
// Test your module
const module = new YourModule();
await module.initialize();

// Check if it's working
console.log('Module initialized:', module.isInitialized);
```

---

## 📚 Reference Modules

### Working Examples
- **CanopiModule.js**: Complete chat functionality
- **CommunitiesModule.js**: Community management
- **ProfileManager.js**: User profile management

### Key Patterns
1. **Async initialization** with error handling
2. **Event-driven architecture** using custom events
3. **State management** through StateManager
4. **Real-time updates** via Supabase
5. **Consistent logging** with log levels

---

## 🐛 Debugging

### Console Logs
All modules use consistent logging:
```javascript
this.log('INFO', 'Message');     // General info
this.log('WARN', 'Warning');     // Warnings
this.log('ERROR', 'Error');      // Errors
this.log('DEBUG', 'Debug info'); // Debug info
```

### Common Issues
1. **Module not loading**: Check for syntax errors
2. **State not available**: Ensure StateManager is loaded first
3. **API calls failing**: Check authentication and headers
4. **UI not updating**: Verify event listeners are attached

---

## 📞 Support

### Key Files to Reference
- `sidepanel.html` - Main UI structure
- `sidepanel.js` - Main orchestration
- `StateManager.js` - State management
- `SupabaseRealtimeClient.js` - Real-time functionality
- `AvatarUtils.js` - Avatar handling

### Development Tips
1. **Start simple** - Get basic functionality working first
2. **Follow patterns** - Use existing modules as templates
3. **Test frequently** - Reload extension after changes
4. **Use console logs** - Debug with consistent logging
5. **Check dependencies** - Ensure required modules are loaded

---

## 🎯 Next Steps

1. **Review existing modules** to understand patterns
2. **Choose your module** (Agent, People, or Rooms)
3. **Implement basic structure** following the template
4. **Add core functionality** specific to your module
5. **Integrate with UI** using existing CSS classes
6. **Test thoroughly** with real data and users

---

*This briefing covers the essential information needed to work effectively with the modular architecture. For specific implementation details, refer to the existing working modules and the codebase.*

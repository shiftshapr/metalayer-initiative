# SettingsModule Full Modularization Plan

## Executive Summary

This document outlines a plan to fully modularize `SettingsModule`, which currently exists as a skeleton with TODOs. The goal is to create a comprehensive settings orchestration module that coordinates all settings-related functionality.

**Current State**: SettingsModule is mostly empty (skeleton)
**Target State**: Fully functional settings orchestration module
**Timeline**: 1-2 weeks

---

## Current Settings Architecture Analysis

### Existing Settings Infrastructure

**Data Layer:**
- `UserPreferencesManager.js` - Unified preference management (theme, aura, visibility, status, headline, displayName)
- `UnifiedSettingsStorage.js` - Storage abstraction (Chrome storage + database)

**UI Layer (Feature-Specific):**
- `VisibilitySettingsManager.js` - Visibility settings UI (visible, status, aura, headline, display name)
- `SettingsHeadlineManager.js` - Headline CRUD operations
- `DisplayNameManager.js` - Display name management
- `StatusPickerModule.js` - Status selection
- `AuraColorModal.js` - Aura color picker
- `NotificationManager.js` - Notification settings (has own loadSettings/saveSettings)

**Orchestration Layer (Missing):**
- `SettingsModule.js` - Currently skeleton, should orchestrate all settings

### Current Gaps

1. **No General Settings API**: No unified way to:
   - Load all settings at once
   - Save all settings at once
   - Reset settings to defaults
   - Export/import settings
   - Validate settings
   - Show/hide settings UI

2. **Scattered Settings Logic**: Some settings logic may still be in `sidepanel.js` (per TODOs)

3. **No Settings Coordination**: No module to coordinate between different settings managers

---

## Target Architecture

### SettingsModule Responsibilities

**SettingsModule** should be the **orchestration layer** that:

1. **Coordinates Settings Managers**
   - Initialize all settings managers
   - Coordinate between UserPreferencesManager and UI managers
   - Handle settings lifecycle

2. **Provides Unified Settings API**
   - `loadAllSettings()` - Load all user settings
   - `saveAllSettings(settings)` - Save multiple settings
   - `resetSettings()` - Reset to defaults
   - `exportSettings()` - Export settings as JSON
   - `importSettings(data)` - Import settings from JSON
   - `validateSettings(settings)` - Validate settings object
   - `getDefaultSettings()` - Get all default settings

3. **Manages Settings UI**
   - `showSettings()` - Show settings panel
   - `hideSettings()` - Hide settings panel
   - `toggleSettings()` - Toggle settings visibility
   - `updateSettingsUI(settings)` - Update UI with settings

4. **Event Handling**
   - `handleSettingsChange(event)` - Handle settings change events
   - Subscribe to settings updates from all managers
   - Emit unified settings events

5. **Settings Validation & Defaults**
   - Centralized validation logic
   - Default settings definitions
   - Settings schema management

### Module Relationships

```
┌─────────────────────────────────────┐
│      SettingsModule                 │
│  (Orchestration Layer)              │
│  - loadAllSettings()                 │
│  - saveAllSettings()                 │
│  - resetSettings()                   │
│  - exportSettings()                  │
│  - importSettings()                 │
│  - showSettings() / hideSettings()  │
└──────────┬──────────────────────────┘
           │ coordinates
           ├──────────────────────────┐
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│ UserPreferencesManager│   │ VisibilitySettings   │
│ (Data Layer)         │   │ Manager (UI Layer)   │
└──────────────────────┘   └──────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│ UnifiedSettingsStorage│   │ SettingsHeadline     │
│ (Storage Layer)       │   │ Manager (UI Layer)   │
└──────────────────────┘   └──────────────────────┘
```

---

## Implementation Plan

### Phase 1: Core Settings API (Week 1, Days 1-3)

**Goal**: Implement core settings loading, saving, and validation

**Tasks**:
1. Implement `loadAllSettings()`
   - Load from UserPreferencesManager
   - Load from NotificationManager
   - Merge all settings
   - Return unified settings object

2. Implement `saveAllSettings(settings)`
   - Validate settings
   - Save via UserPreferencesManager
   - Save notification settings separately
   - Emit events

3. Implement `getDefaultSettings()`
   - Get defaults from UserPreferencesManager schema
   - Get defaults from NotificationManager
   - Merge and return

4. Implement `validateSettings(settings)`
   - Validate against UserPreferencesManager schema
   - Validate notification settings
   - Return validation results

**Code Structure**:
```javascript
class SettingsModule {
  async loadAllSettings() {
    // Load from UserPreferencesManager
    const preferences = await this.userPreferencesManager.getAllPreferences();
    
    // Load notification settings
    const notificationSettings = await this.notificationManager.getSettings();
    
    // Merge and return
    return {
      ...preferences,
      notifications: notificationSettings
    };
  }

  async saveAllSettings(settings) {
    // Validate first
    const validation = this.validateSettings(settings);
    if (!validation.valid) {
      throw new Error(`Settings validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Save preferences
    if (settings.theme || settings.auraColor || settings.isVisible) {
      await this.userPreferencesManager.savePreferences(settings);
    }
    
    // Save notification settings
    if (settings.notifications) {
      await this.notificationManager.updateSettings(settings.notifications);
    }
    
    // Emit event
    this.emitSettingsChange(settings);
  }

  getDefaultSettings() {
    // Get from UserPreferencesManager schema
    const defaults = {};
    Object.entries(this.userPreferencesManager.schema).forEach(([key, config]) => {
      defaults[key] = config.defaultValue;
    });
    
    // Add notification defaults
    defaults.notifications = this.notificationManager.getDefaultSettings();
    
    return defaults;
  }

  validateSettings(settings) {
    const errors = [];
    
    // Validate preferences
    Object.entries(settings).forEach(([key, value]) => {
      if (key === 'notifications') return; // Handle separately
      
      const schema = this.userPreferencesManager.schema[key];
      if (schema && schema.validator) {
        if (!schema.validator(value)) {
          errors.push(`Invalid value for ${key}: ${value}`);
        }
      }
    });
    
    // Validate notification settings
    if (settings.notifications) {
      // Add notification validation
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

### Phase 2: Settings UI Management (Week 1, Days 4-5)

**Goal**: Implement settings UI show/hide/toggle functionality

**Tasks**:
1. Implement `showSettings()`
   - Show settings panel/tab
   - Initialize settings managers if needed
   - Load and display current settings

2. Implement `hideSettings()`
   - Hide settings panel/tab
   - Save any pending changes

3. Implement `toggleSettings()`
   - Toggle visibility
   - Handle state management

4. Implement `updateSettingsUI(settings)`
   - Update all settings UI elements
   - Coordinate with individual managers
   - Handle UI state synchronization

**Code Structure**:
```javascript
showSettings() {
  const settingsTab = document.getElementById('settings-tab');
  const settingsContent = document.getElementById('settings-content');
  
  if (settingsTab) {
    settingsTab.classList.add('active');
  }
  if (settingsContent) {
    settingsContent.style.display = 'block';
  }
  
  // Initialize managers if needed
  this.ensureManagersInitialized();
  
  // Load and display settings
  this.loadAndDisplaySettings();
  
  // Emit event
  this.emit('settings:shown');
}

hideSettings() {
  // Save any pending changes
  this.savePendingChanges();
  
  const settingsTab = document.getElementById('settings-tab');
  const settingsContent = document.getElementById('settings-content');
  
  if (settingsTab) {
    settingsTab.classList.remove('active');
  }
  if (settingsContent) {
    settingsContent.style.display = 'none';
  }
  
  // Emit event
  this.emit('settings:hidden');
}

async updateSettingsUI(settings) {
  // Update visibility settings UI
  if (this.visibilitySettingsManager) {
    await this.visibilitySettingsManager.loadSettings();
  }
  
  // Update notification settings UI
  if (this.notificationManager) {
    await this.notificationManager.loadSettings();
  }
  
  // Update other UI elements
  this.updateThemeUI(settings.theme);
  this.updateAuraUI(settings.auraColor, settings.auraIntensity);
  
  // Emit event
  this.emit('settings:ui-updated', settings);
}
```

### Phase 3: Export/Import & Reset (Week 2, Days 1-2)

**Goal**: Implement settings export, import, and reset functionality

**Tasks**:
1. Implement `exportSettings()`
   - Get all current settings
   - Format as JSON
   - Include metadata (version, timestamp)
   - Return exportable object

2. Implement `importSettings(data)`
   - Validate imported data
   - Merge with current settings
   - Save imported settings
   - Update UI

3. Implement `resetSettings()`
   - Get default settings
   - Save defaults
   - Update UI
   - Emit events

**Code Structure**:
```javascript
async exportSettings() {
  const settings = await this.loadAllSettings();
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    settings: settings
  };
  
  // Create downloadable JSON
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `settings-export-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  
  return exportData;
}

async importSettings(data) {
  // Validate import data
  if (!data.settings) {
    throw new Error('Invalid settings import: missing settings object');
  }
  
  // Validate settings
  const validation = this.validateSettings(data.settings);
  if (!validation.valid) {
    throw new Error(`Settings validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Save imported settings
  await this.saveAllSettings(data.settings);
  
  // Update UI
  await this.updateSettingsUI(data.settings);
  
  // Emit event
  this.emit('settings:imported', data.settings);
  
  return true;
}

async resetSettings() {
  // Get defaults
  const defaults = this.getDefaultSettings();
  
  // Save defaults
  await this.saveAllSettings(defaults);
  
  // Update UI
  await this.updateSettingsUI(defaults);
  
  // Emit event
  this.emit('settings:reset', defaults);
  
  return defaults;
}
```

### Phase 4: Event Handling & Coordination (Week 2, Days 3-4)

**Goal**: Implement event handling and manager coordination

**Tasks**:
1. Implement `handleSettingsChange(event)`
   - Handle settings change events from all managers
   - Validate changes
   - Save changes
   - Emit unified events

2. Implement manager coordination
   - Initialize all managers
   - Subscribe to manager events
   - Coordinate between managers

3. Implement settings lifecycle
   - Initialization sequence
   - Cleanup on unload
   - Error handling

**Code Structure**:
```javascript
async initialize() {
  if (this.isInitialized) return;
  
  // Get managers
  this.userPreferencesManager = window.userPreferencesManager;
  this.visibilitySettingsManager = window.visibilitySettingsManagerInstance;
  this.notificationManager = window.notificationManager;
  
  // Initialize UserPreferencesManager if needed
  if (this.userPreferencesManager && !this.userPreferencesManager.isInitialized) {
    const userId = window.currentUser?.id;
    if (userId) {
      await this.userPreferencesManager.initialize(userId);
    }
  }
  
  // Initialize visibility settings manager
  if (this.visibilitySettingsManager) {
    await this.visibilitySettingsManager.initialize();
  }
  
  // Initialize notification manager
  if (this.notificationManager) {
    await this.notificationManager.initialize();
  }
  
  // Subscribe to events
  this.setupEventListeners();
  
  this.isInitialized = true;
}

setupEventListeners() {
  // Listen to visibility settings changes
  if (this.visibilitySettingsManager) {
    // Subscribe to visibility manager events
    document.addEventListener('visibility-settings:changed', (e) => {
      this.handleSettingsChange(e);
    });
  }
  
  // Listen to notification settings changes
  if (this.notificationManager) {
    // Subscribe to notification manager events
    document.addEventListener('notification-settings:changed', (e) => {
      this.handleSettingsChange(e);
    });
  }
  
  // Listen to UserPreferencesManager changes
  if (this.userPreferencesManager) {
    // Subscribe to preference changes
    document.addEventListener('preferences:changed', (e) => {
      this.handleSettingsChange(e);
    });
  }
}

handleSettingsChange(event) {
  const { setting, value, source } = event.detail || {};
  
  // Validate change
  const validation = this.validateSettings({ [setting]: value });
  if (!validation.valid) {
    console.warn(`Settings change validation failed: ${validation.errors.join(', ')}`);
    return;
  }
  
  // Save change
  this.saveSetting(setting, value).catch(error => {
    console.error(`Failed to save setting ${setting}:`, error);
  });
  
  // Emit unified event
  this.emit('settings:changed', {
    setting,
    value,
    source,
    timestamp: new Date().toISOString()
  });
}
```

### Phase 5: Integration & Testing (Week 2, Day 5)

**Goal**: Integrate SettingsModule and test all functionality

**Tasks**:
1. Update sidepanel.html to load SettingsModule
2. Update sidepanel.js to use SettingsModule
3. Remove any remaining settings code from sidepanel.js
4. Test all functionality
5. Update documentation

---

## Functions to Relocate to SettingsModule

### From sidepanel.js (if they exist):
- General settings loading/saving functions
- Settings UI show/hide functions
- Settings validation functions

### New Functions to Create:
- `loadAllSettings()` - Load all settings
- `saveAllSettings(settings)` - Save all settings
- `saveSetting(key, value)` - Save single setting
- `getSetting(key, defaultValue)` - Get single setting
- `resetSettings()` - Reset to defaults
- `exportSettings()` - Export settings
- `importSettings(data)` - Import settings
- `validateSettings(settings)` - Validate settings
- `getDefaultSettings()` - Get defaults
- `showSettings()` - Show settings UI
- `hideSettings()` - Hide settings UI
- `toggleSettings()` - Toggle settings UI
- `updateSettingsUI(settings)` - Update UI
- `handleSettingsChange(event)` - Handle changes
- `ensureManagersInitialized()` - Initialize managers
- `setupEventListeners()` - Setup event listeners

---

## Module Dependencies

### SettingsModule Depends On:
- `UserPreferencesManager` - For preference data
- `UnifiedSettingsStorage` - For storage (via UserPreferencesManager)
- `VisibilitySettingsManager` - For visibility settings UI
- `NotificationManager` - For notification settings
- `SettingsHeadlineManager` - For headline settings
- `DisplayNameManager` - For display name settings
- `StatusPickerModule` - For status settings
- `AuraColorModal` - For aura settings

### SettingsModule Provides:
- Unified settings API
- Settings orchestration
- Settings UI management
- Settings export/import
- Settings validation

---

## Implementation Details

### SettingsModule Class Structure

```javascript
/**
 * SETTINGS MODULE - Settings Orchestration
 * Coordinates all settings-related functionality
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { Logger } from '../utils/Logger.js';

export class SettingsModule {
  constructor() {
    this.logger = new Logger();
    this.isInitialized = false;
    
    // Manager references
    this.userPreferencesManager = null;
    this.visibilitySettingsManager = null;
    this.notificationManager = null;
    this.settingsHeadlineManager = null;
    this.displayNameManager = null;
    this.statusPickerModule = null;
    
    // State
    this.currentSettings = null;
    this.pendingChanges = {};
    this.eventListeners = [];
  }

  async initialize() {
    // Implementation from Phase 4
  }

  // Core API methods (Phase 1)
  async loadAllSettings() { }
  async saveAllSettings(settings) { }
  getDefaultSettings() { }
  validateSettings(settings) { }

  // UI Management (Phase 2)
  showSettings() { }
  hideSettings() { }
  toggleSettings() { }
  async updateSettingsUI(settings) { }

  // Export/Import/Reset (Phase 3)
  async exportSettings() { }
  async importSettings(data) { }
  async resetSettings() { }

  // Event Handling (Phase 4)
  handleSettingsChange(event) { }
  setupEventListeners() { }
  ensureManagersInitialized() { }
}

// Singleton instance
export const settingsModuleInstance = new SettingsModule();

// Export for global access
if (typeof window !== 'undefined') {
  window.settingsModule = settingsModuleInstance;
  window.SettingsModule = SettingsModule;
}
```

---

## Testing Strategy

### Unit Tests
- Test `loadAllSettings()` with mock managers
- Test `saveAllSettings()` with validation
- Test `validateSettings()` with various inputs
- Test `exportSettings()` / `importSettings()`
- Test `resetSettings()`

### Integration Tests
- Test coordination between managers
- Test event handling
- Test UI updates
- Test error handling

### Manual Testing Checklist
- [ ] Load all settings works
- [ ] Save all settings works
- [ ] Export settings works
- [ ] Import settings works
- [ ] Reset settings works
- [ ] Settings UI shows/hides correctly
- [ ] Settings changes propagate correctly
- [ ] Validation works correctly
- [ ] Error handling works correctly

---

## Migration Checklist

### Pre-Migration
- [ ] Document current settings code locations
- [ ] Identify all settings-related functions
- [ ] Create feature branch

### During Migration
- [ ] Implement Phase 1 (Core API)
- [ ] Implement Phase 2 (UI Management)
- [ ] Implement Phase 3 (Export/Import/Reset)
- [ ] Implement Phase 4 (Event Handling)
- [ ] Test each phase

### Post-Migration
- [ ] Update sidepanel.html
- [ ] Update sidepanel.js
- [ ] Remove old settings code
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Code review

---

## Success Criteria

- [ ] SettingsModule fully functional
- [ ] All settings functions relocated
- [ ] No settings code in sidepanel.js
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Performance maintained

---

## Timeline

**Week 1:**
- Days 1-3: Core Settings API
- Days 4-5: Settings UI Management

**Week 2:**
- Days 1-2: Export/Import & Reset
- Days 3-4: Event Handling & Coordination
- Day 5: Integration & Testing

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Ready for Implementation


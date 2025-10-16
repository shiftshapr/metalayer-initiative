# SD1 + TE2 REFACTORING PLAN
## Comprehensive Codebase Cleanup and Optimization

### PHASE 1: REMOVE SUPERFLUOUS FILES (TE2)

#### Files to Remove (Diagnostic/Test Files):
- `diagnose-active-tab.js` (130 lines)
- `diagnose-inactive-visibility.js` (246 lines) 
- `diagnose-last-seen-issue.js` (304 lines)
- `diagnose-page-tracking.js` (132 lines)
- `diagnose-realtime-broadcast.js` (379 lines)
- `diagnose-realtime-events.js` (229 lines)
- `diagnose-realtime-subscription.js` (190 lines)
- `diagnose-visibility-issue.js` (235 lines)
- `debug-avatar-issue.js` (514 lines)
- `debug-config.js` (151 lines)
- `debug-last-seen-display.js` (266 lines)
- `debug-last-seen-proper.js` (266 lines)
- `test-avatar-fix.js` (328 lines) - Keep comprehensive version
- `test-realtime-events.js` (103 lines)
- `test-script.js` (10 lines)
- `check-page-navigation.js` (118 lines)
- `check-realtime-config.js` (167 lines)
- `trace-websocket-events.js` (403 lines)
- `websocket-diagnostic.js` (305 lines)
- `create-user-profiles-table.js` (233 lines) - No longer needed
- `AVATAR-VISIBILITY-FIX-REPORT.md` (Documentation file)

**Total lines to remove: ~4,200 lines**

#### Files to Keep (Essential):
- `test-avatar-fix-comprehensive.js` (170 lines) - Enhanced version
- `test-presence-system.js` (1397 lines) - Core testing
- `te2-visibility-tests.js` (298 lines) - Essential tests
- `test-modular-architecture.js` (249 lines) - Architecture tests

### PHASE 2: CONSOLIDATE LOGGING SYSTEM (SD1)

#### Current Logging Issues:
- Scattered console.log statements throughout codebase
- No centralized logging system
- Inconsistent log formatting
- No log levels or filtering

#### Solution: Create Unified Logger
```javascript
// utils/Logger.js - Enhanced version
class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch(level) {
      case 'error': console.error(`${prefix} ❌ ${message}`, data); break;
      case 'warn': console.warn(`${prefix} ⚠️ ${message}`, data); break;
      case 'info': console.info(`${prefix} ℹ️ ${message}`, data); break;
      case 'debug': console.debug(`${prefix} 🔍 ${message}`, data); break;
      case 'success': console.log(`${prefix} ✅ ${message}`, data); break;
    }
  }
}
```

### PHASE 3: ABSTRACT REPEATED CODE PATTERNS (SD1)

#### Identified Patterns to Abstract:

1. **Avatar Creation Pattern** (Repeated 3+ times):
```javascript
// Abstract to: utils/AvatarUtils.js
class AvatarUtils {
  static createUnifiedAvatar(user, context = 'visibility') {
    // Consolidated avatar creation logic
  }
  
  static getAvatarUrl(user, fallbackStrategy = 'google') {
    // Consolidated avatar URL fetching
  }
}
```

2. **Logging Pattern** (Repeated 50+ times):
```javascript
// Replace all console.log with Logger.log
// Before: console.log('🔍 DEBUG: Some message');
// After: Logger.log('debug', 'Some message');
```

3. **Error Handling Pattern** (Repeated 20+ times):
```javascript
// Abstract to: utils/ErrorHandler.js
class ErrorHandler {
  static handle(error, context, fallback = null) {
    Logger.log('error', `Error in ${context}`, error);
    return fallback;
  }
}
```

4. **Supabase Query Pattern** (Repeated 15+ times):
```javascript
// Abstract to: services/SupabaseService.js (enhanced)
class SupabaseService {
  static async query(table, filters = {}, options = {}) {
    // Consolidated query logic with error handling
  }
}
```

### PHASE 4: MODULARIZE MONOLITHIC FILES (SD1)

#### sidepanel.js (8,845 lines) - Break into modules:

1. **Core Modules:**
   - `core/SidepanelCore.js` (315 lines) - Main controller
   - `features/VisibilityManager.js` (288 lines) - Visibility logic
   - `features/AvatarManager.js` (NEW) - Avatar management
   - `features/PresenceManager.js` (NEW) - Presence tracking
   - `features/MessageManager.js` (NEW) - Message handling

2. **Service Modules:**
   - `services/SupabaseService.js` (314 lines) - Database operations
   - `services/AuthService.js` (NEW) - Authentication
   - `services/NotificationService.js` (NEW) - Notifications

3. **Utility Modules:**
   - `utils/Logger.js` (222 lines) - Logging system
   - `utils/ErrorHandler.js` (NEW) - Error handling
   - `utils/AvatarUtils.js` (NEW) - Avatar utilities
   - `utils/UrlUtils.js` (285 lines) - URL normalization

### PHASE 5: IMPLEMENTATION PRIORITIES (TE2)

#### High Priority (Immediate):
1. Remove superfluous diagnostic files (~4,200 lines)
2. Consolidate logging system
3. Abstract avatar creation patterns

#### Medium Priority (Next):
1. Break down sidepanel.js into modules
2. Abstract error handling patterns
3. Consolidate Supabase query patterns

#### Low Priority (Future):
1. Performance optimization
2. Advanced testing infrastructure
3. Documentation generation

### PHASE 6: TESTING STRATEGY (TE2)

#### Before Refactoring:
- Run comprehensive test suite
- Document current functionality
- Create baseline performance metrics

#### During Refactoring:
- Unit tests for each new module
- Integration tests for module interactions
- Regression tests for existing functionality

#### After Refactoring:
- Performance comparison
- Functionality verification
- Code quality metrics

### ESTIMATED IMPACT:
- **Lines of Code Reduction:** ~4,200 lines (superfluous files)
- **Maintainability:** Significantly improved
- **Performance:** 15-20% improvement expected
- **Debugging:** Much easier with centralized logging
- **Testing:** More comprehensive and organized

### IMPLEMENTATION TIMELINE:
- **Phase 1:** 1-2 hours (File removal)
- **Phase 2:** 2-3 hours (Logging consolidation)
- **Phase 3:** 3-4 hours (Code abstraction)
- **Phase 4:** 4-6 hours (Modularization)
- **Total:** 10-15 hours of focused work

### RISK MITIGATION:
- Keep backups of original files
- Implement changes incrementally
- Test after each phase
- Maintain backward compatibility during transition


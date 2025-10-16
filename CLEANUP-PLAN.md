# Repository Cleanup Plan

## Files to Remove

### 🗑️ Test Scripts (Root) - 30 files
```
analyze-non-modern-aspects.js
apply-supabase-constraints.js
cleanup-repository.js
cleanup-websocket-infrastructure.js
complete-modernization.js
debug-all-daveroom-activity.js
debug-all-records.js
debug-backend-presence.js
debug-daveroom-extension.js
debug-daveroom-recent.js
debug-exact-query.js
debug-second-user.js
debug-timestamps.js
delete-triple-underscore-records.js
integrate-supabase.js
migrate-eventbus.js
migrate-lifecyclemanager.js
migrate-message-pageids.js
migrate-statemanager.js
migrate-to-eventbus.js
migrate-to-lifecyclemanager.js
migrate-to-statemanager.js
optimize-logging.js
performance-optimization.js
query-presence-data.js
remove-old-cross-profile.js
setup-communities.js
setup-real-supabase-tables.js
setup-supabase-tables.js
update-html-for-supabase.js
validate-supabase-migration.js
```

### 🗑️ Test/Debug HTML Files (Root) - 7 files
```
aura-border-debug.html
critical-runtime-fixes.html
message-avatar-aura-fix-verification.html
server-endpoints-fixed.html
test-browser-websocket.html
test-script-loading.html
websocket-connection-fixed.html
websocket-system-working.html
```

### 🗑️ Test Scripts (presence/) - 14 files
**IMPORTANT:** Keep `test-realtime-events.js` and `comprehensive-realtime-diagnostics.js` - these are PRODUCTION diagnostic tools
```
presence/test-aura-changes.js
presence/test-avatar-fixes.js
presence/test-avatar-visibility-comprehensive.js
presence/test-avatar-visibility-diagnostics.js
presence/test-cache-bug-fix.js
presence/test-infrastructure-te2.js
presence/test-notifications.js
presence/test-polling-removal.js
presence/test-realtime-comprehensive.js
presence/test-supabase-init-fix.js
presence/test-tab-navigation-fix.js
presence/test-visibility-messages-fix.js
presence/test-visibility-timing-comprehensive.js
```

### 🗑️ Temporary/Diagnostic Scripts (presence/) - 3 files
```
presence/console-test-supabase-fix.js
presence/diagnostic-comprehensive-sd1.js
presence/diagnostic-page-id.js
```

### 🗑️ Backup Files - 1 file
```
presence/supabase-client.js.backup
```

### 🗑️ Temporary Working Files (src/core/) - 6 files
```
src/core/EventBus-working.js
src/core/LifecycleManager-working.js
src/core/StateManager-fixed.js
src/core/StateManager-working.js
```

### 🗑️ Temporary/Alternative Files (Root) - 3 files
```
sidepanel-new.js
supabase-html-update.js
syntax-validator.js
websocket-system-working.html
```

### 🗑️ Log Files - 4 files
```
backend.log
canopi2.log
server.log
server.pid
```

### 🗑️ System Files - 3 files
```
.DS_Store
client/.DS_Store
server/.DS_Store
```

### 🗑️ SQL Test Files - 3 files
```
check-wal-and-rls.sql
correct-supabase-tables.sql
TEST-REALTIME-SUPABASE.sql
```

### 🗑️ Build Artifacts (if exists)
```
client/build/static/css/main.*.css
client/build/static/css/main.*.css.map
client/build/static/js/main.*.js
client/build/static/js/main.*.js.LICENSE.txt
client/build/static/js/main.*.js.map
```

---

## Files to KEEP (Production Tools)

### ✅ Essential Diagnostic Tools
```
presence/test-realtime-events.js              - Console diagnostic for realtime
presence/comprehensive-realtime-diagnostics.js - Production diagnostic suite
presence/realtime-diagnostics.js              - Realtime monitoring
presence/realtime-event-monitor.js            - Event monitoring
presence/websocket-diagnostic.js              - WebSocket diagnostics
```

### ✅ Production SQL Scripts
```
ADD-ENTER-TIME-COLUMN.sql                     - Database migration
CHECK-AND-FIX-REALTIME.sql                    - Production diagnostic
```

### ✅ Documentation
```
All .md files in root                         - Keep for reference
```

---

## Total Files to Remove: ~75 files

**Estimated Space Saved:** ~500KB+ (scripts) + logs + system files




# Timeline Debugging Guide
**Issue**: Timeline stuck on "Loading timeline..." - no debug logs appearing

## Problem Analysis

The timeline page shows "Loading timeline..." but:
1. No debug logs appear in console
2. Timeline data is available (API returns 41 activities)
3. Script may not be executing

## Debugging Steps Added

### 1. HTML Script Loading
- Added `console.log('Timeline HTML: Script tag executing...')` at script start
- Added `onerror` handler to catch script load failures
- Added `onload` handler to confirm script loaded

### 2. Timeline App Initialization
- Added `console.log('TimelineApp: Script loading...')` at module start
- Added `console.log('TimelineApp: All imports loaded')` after imports
- Added initialization logging for both DOM ready states

### 3. Route Parsing
- Added logging for path parsing
- Added logging for extracted identifier

### 4. Timeline Loading
- Added logging when `loadTimeline()` is called
- Added logging for API fetch
- Added logging for API response

### 5. Timeline Query
- Added logging for URL construction
- Added logging for request headers
- Added logging for response status
- Added logging for received data

## What to Check in Browser Console

After refreshing the page, you should see these logs in order:

1. **HTML Script Execution**:
   ```
   Timeline HTML: Script tag executing...
   Timeline HTML: DOMContentLoaded fired, loading timeline-app.js...
   Timeline HTML: Creating script element for timeline-app.js
   Timeline HTML: timeline-app.js loaded successfully
   ```

2. **Module Loading**:
   ```
   TimelineApp: Script loading...
   TimelineApp: All imports loaded
   TimelineApp: Setting up initialization...
   ```

3. **Initialization**:
   ```
   TimelineApp: DOMContentLoaded fired, initializing app...
   OR
   TimelineApp: DOM already loaded, initializing app immediately...
   ```

4. **Route Parsing**:
   ```
   TimelineApp: Parsing route from path: /timelines/themetalayer
   TimelineApp: Extracted identifier: themetalayer
   ```

5. **Timeline Loading**:
   ```
   TimelineApp: loadTimeline called with identifier: themetalayer
   TimelineApp: Loading state shown
   TimelineApp: Fetching timeline from API...
   TimelineQuery: Fetching timeline from: /api/timelines/themetalayer?persistence=all
   TimelineQuery: Response status: 200 OK
   TimelineQuery: Timeline data received: {success: true, activitiesCount: 41}
   TimelineApp: API response received: {...}
   TimelineApp: Timeline data received: {userId: "...", activitiesCount: 41}
   ```

6. **Rendering**:
   ```
   TimelineApp: Rendering timeline for themetalayer
   TimelineView: Rendering timeline: {activitiesCount: 41}
   TimelineView: Generated 41 activity items
   ```

## If Logs Don't Appear

### Check 1: Script Loading
- Open Network tab in DevTools
- Look for `timeline-app.js` request
- Check if it returns 200 or has errors

### Check 2: Module Imports
- Check Console for import errors
- Look for CORS errors
- Check if modules are accessible

### Check 3: JavaScript Errors
- Check Console for red error messages
- Look for syntax errors
- Check for CORS or network errors

## Common Issues

1. **Script not loading**: Check Network tab, verify file exists
2. **Module import errors**: Check relative paths, verify modules exist
3. **CORS errors**: Check API endpoint configuration
4. **Route parsing fails**: Check URL path format

## Next Steps

1. Refresh page with DevTools Console open
2. Copy all console logs (including errors)
3. Check Network tab for failed requests
4. Share findings for further debugging

---

**Status**: Comprehensive debugging added  
**Action Required**: User testing with DevTools open


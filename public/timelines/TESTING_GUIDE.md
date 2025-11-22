# Timeline TypeScript Testing Guide

## Quick Test Checklist

### 1. Build Verification
```bash
# Compile TypeScript
cd /home/ubuntu/metalayer-initiative
npx tsc -p tsconfig.timeline.json

# Verify compiled files exist
ls -la public/timelines/dist/*.js
```

### 2. File Structure Check
```bash
# Should NOT exist (old files):
ls public/timelines/timeline-app.js  # Should fail
ls public/timelines/components/*.js  # Should fail
ls public/timelines/modules/*.js     # Should fail

# SHOULD exist (compiled files):
ls public/timelines/dist/timeline-app.js  # Should succeed
ls public/timelines/dist/components/*.js  # Should succeed
ls public/timelines/dist/modules/*.js     # Should succeed
```

### 3. HTML Verification
```bash
# Check HTML loads from dist/
grep "dist/timeline-app.js" public/timelines/index.html
# Should output: <script type="module" src="dist/timeline-app.js"></script>
```

### 4. Browser Testing

#### Start the Server
```bash
# Make sure backend is running
bash start_backend.sh
```

#### Access Timeline Page
1. Open browser to: `http://localhost:3002/timelines/index.html` (or your server URL)
2. Open browser DevTools (F12)
3. Check Console tab for errors

#### Expected Console Output
```
TimelineApp: Script loading...
TimelineApp: DOM already loaded, initializing app immediately...
Timeline: Initializing Supabase...
```

#### What to Check:
- ✅ **No 404 errors** for `dist/timeline-app.js` or module files
- ✅ **No import errors** (should see "TimelineApp: Script loading...")
- ✅ **Timeline loads** (should see activities or "No timeline activities found")
- ✅ **No TypeScript compilation errors** in console

### 5. Diagnostic Script Testing

#### Load Diagnostic in Browser Console
```javascript
// In browser console on timeline page:
const script = document.createElement('script');
script.src = '/timelines/diagnostics/timeline-typescript-diagnostic.js';
document.head.appendChild(script);

// Wait a moment, then check results:
setTimeout(() => {
  console.log(window.timelineDiagnosticResults);
}, 2000);
```

#### Expected Diagnostic Results
```javascript
{
  issues: [],  // Should be empty
  warnings: [], // Should be empty or minimal
  passed: [
    { id: 'html-path', message: 'HTML correctly loads from dist/ directory: dist/timeline-app.js' },
    { id: 'compiled-output', message: 'Compiled timeline-app.js exists in dist/' }
  ]
}
```

### 6. Manual Feature Testing

#### Test Timeline Loading
1. **Profile Selection**: Click "Add Profile" button
2. **Search**: Type a username or UUID in search box
3. **Timeline Display**: Should show activities for selected profile
4. **Filters**: Test persistence dropdown (All Time, Last Year, etc.)
5. **Activity Types**: Test filtering by activity type
6. **Message Links**: Click on message-related activities (reactions, bookmarks) - should navigate to share page

#### Test Error Handling
1. **Invalid Profile**: Search for non-existent user - should show error
2. **Network Error**: Disconnect network - should show error state
3. **Empty Timeline**: Select profile with no activities - should show "No timeline activities found"

### 7. Module Import Testing

#### Check Module Resolution
In browser console, verify modules load:
```javascript
// Check if modules are accessible (they should be, but not as globals)
console.log('TimelineApp:', window.timelineApp);
// Should show TimelineApp instance

// Check for import errors
// Look in Network tab for failed module loads
```

### 8. TypeScript Compilation Test

```bash
# Run TypeScript compiler with strict checking
cd /home/ubuntu/metalayer-initiative
npx tsc -p tsconfig.timeline.json --noEmit

# Should output nothing (no errors)
# If errors appear, fix them before testing
```

### 9. Runtime Error Detection

#### Common Issues to Watch For:
- ❌ **Module not found**: Check import paths in compiled JS
- ❌ **Type errors**: Check browser console for runtime type errors
- ❌ **Missing dependencies**: Verify AvatarUtils, AuthManager, SupabaseService are accessible
- ❌ **CORS errors**: Check API endpoints are accessible

### 10. Performance Testing

#### Check Load Times
1. Open Network tab in DevTools
2. Reload timeline page
3. Check:
   - `dist/timeline-app.js` loads successfully
   - Module files load in parallel
   - Total load time < 2 seconds

#### Check Memory
1. Open Performance tab in DevTools
2. Record page load
3. Check for memory leaks (memory should stabilize)

## Automated Test Script

Create a test script to verify everything:

```bash
#!/bin/bash
# test-timeline.sh

echo "🧪 Testing Timeline TypeScript Migration..."

# 1. Check TypeScript compilation
echo "1. Checking TypeScript compilation..."
npx tsc -p tsconfig.timeline.json --noEmit
if [ $? -eq 0 ]; then
  echo "   ✅ TypeScript compilation passed"
else
  echo "   ❌ TypeScript compilation failed"
  exit 1
fi

# 2. Check HTML loads from dist/
echo "2. Checking HTML loads from dist/..."
if grep -q "dist/timeline-app.js" public/timelines/index.html; then
  echo "   ✅ HTML correctly loads from dist/"
else
  echo "   ❌ HTML does not load from dist/"
  exit 1
fi

# 3. Check old JS files are removed
echo "3. Checking old JS files are removed..."
if [ -f "public/timelines/timeline-app.js" ]; then
  echo "   ❌ Old timeline-app.js still exists in root"
  exit 1
else
  echo "   ✅ Old JS files removed"
fi

# 4. Check compiled files exist
echo "4. Checking compiled files exist..."
if [ -f "public/timelines/dist/timeline-app.js" ]; then
  echo "   ✅ Compiled timeline-app.js exists"
else
  echo "   ❌ Compiled timeline-app.js missing"
  exit 1
fi

echo "✅ All tests passed!"
```

## Troubleshooting

### Issue: 404 Error for dist/timeline-app.js
**Solution**: 
- Verify `npx tsc -p tsconfig.timeline.json` ran successfully
- Check `public/timelines/dist/timeline-app.js` exists
- Verify server is serving static files from `public/` directory

### Issue: Module Import Errors
**Solution**:
- Check import paths in `src/timeline-app.ts` use relative paths for local modules
- Verify external modules use absolute paths (`/presence/...`)
- Check browser console for specific import errors

### Issue: TypeScript Compilation Errors
**Solution**:
- Run `npx tsc -p tsconfig.timeline.json` to see errors
- Fix type errors in source files
- Recompile after fixes

### Issue: Timeline Doesn't Load
**Solution**:
- Check browser console for errors
- Verify backend API is running
- Check network tab for failed API requests
- Verify authentication is working

## Success Criteria

✅ **All tests pass if:**
1. TypeScript compiles without errors
2. HTML loads from `dist/timeline-app.js`
3. No old JS files in root/components/modules
4. Browser console shows no errors
5. Timeline page loads and displays activities
6. All features work (profile selection, filters, navigation)


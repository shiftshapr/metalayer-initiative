# Timeline Diagnostic Script Usage

## Quick Start

1. Open the timeline page in your browser (e.g., `https://app.canopi.live/timelines/themetalayer`)
2. Open browser console (F12 or Cmd+Option+I)
3. Run: `window.timelineDiagnostics.runFullDiagnostic()`

## What It Checks

### 1. API Response
- Verifies API returns proper structure
- Checks for user data in activities
- Validates reaction counts are included

### 2. Timeline Data Structure
- Checks in-memory timeline data
- Validates activities array structure

### 3. User Data in Activities
- Lists all unique users found
- Checks each user has: name, handle, avatarUrl, auraColor
- Identifies missing data

### 4. Avatar Rendering
- Checks profile header avatar positioning
- Checks all timeline item avatars
- Verifies images are loading
- Identifies off-center issues

### 5. Aura Colors
- Compares expected vs displayed aura colors
- Detects lavender fallback colors
- Lists all aura color mismatches

### 6. Message Interactions
- Checks for reply/reaction/bookmark/share buttons
- Verifies counts are displayed
- Checks if counts are hidden when 0

### 7. Profile Header
- Checks avatar positioning
- Verifies name/handle display
- Checks for off-center issues

### 8. Database vs Display
- Fetches user data from API
- Compares database values with displayed values
- Identifies mismatches

## Output

The diagnostic returns a comprehensive report object with:
- `issues`: Array of critical problems found
- `warnings`: Array of potential issues
- `data`: Detailed data from each check

Results are also stored in `window.timelineDiagnosticsResults` for further inspection.

## Example Output

```javascript
{
  timestamp: "2025-11-15T01:20:00.000Z",
  url: "https://app.canopi.live/timelines/themetalayer",
  issues: [
    "Activity 2 (reaction): User missing avatarUrl",
    "Aura color mismatch for user 550e8400...: expected #98d416, got rgb(102, 126, 234)"
  ],
  warnings: [
    "Activity 3 (bookmark): user missing auraColor"
  ],
  data: {
    api: { ... },
    timeline: { ... },
    users: { ... },
    avatars: [ ... ],
    aura: { ... },
    interactions: { ... },
    profile: { ... },
    database: { ... }
  }
}
```

## Troubleshooting

### If diagnostic script doesn't load:
- Check browser console for script loading errors
- Verify `/timelines/diagnostics/timeline-diagnostics.js` is accessible
- Check network tab for 404 errors

### If results show many issues:
1. Check the `data` object for detailed information
2. Look at `data.api` to see what the backend is returning
3. Check `data.users` to see which users are missing data
4. Review `data.avatars` to see DOM rendering issues

### Common Issues Found:

1. **"User missing avatarUrl"**: Backend not including user data in activity
2. **"Aura color mismatch"**: Chrome storage cache overriding database value
3. **"Avatar image hidden"**: Image failed to load, fallback not showing
4. **"Profile avatar off-center"**: CSS positioning issue
5. **"Message missing reaction button"**: CanopiModule not being used

## Next Steps After Running Diagnostic

1. Review the issues list
2. Check the detailed data for each issue
3. Fix backend data issues first (missing user data)
4. Fix frontend rendering issues second (CSS, AvatarUtils)
5. Re-run diagnostic to verify fixes


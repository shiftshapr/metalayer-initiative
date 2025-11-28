# Chrome Extension CORS Configuration

## Do We Need to Add the Extension Origin?

### ✅ YES - You Should Add It

When a Chrome extension makes `fetch()` requests to your API, it sends the origin as:
```
chrome-extension://<extension-id>
```

Your extension ID (from `manifest.json`): `bnbghmbiikibpkllpeehcmpjmbcnhhcb`

So the origin would be: `chrome-extension://bnbghmbiikibpkllpeehcmpjmbcnhhcb`

## Why Add It?

1. **CORS with Credentials**: Your server uses `credentials: true` in CORS config, which requires explicit origin whitelisting
2. **Cross-Origin Requests**: Extension making requests from `chrome-extension://` to `https://api.canopi.live` is cross-origin
3. **Better Security**: Explicitly allowing the extension origin is more secure than using wildcards

## How to Add It

### Option 1: Add to .env file (Recommended)

```env
ALLOWED_ORIGINS=https://app.canopi.live,https://share.canopi.live,https://api.canopi.live,chrome-extension://bnbghmbiikibpkllpeehcmpjmbcnhhcb
```

### Option 2: Update in app.js fallback

The code already has a fallback, but you should use the .env file instead.

## Important Notes

### Extension ID Changes
⚠️ **Warning**: The extension ID can change if:
- You change the extension's key in the manifest
- You publish to Chrome Web Store (they assign a new ID)
- You load it as an unpacked extension (ID changes per installation)

### Solution: Use Wildcard Pattern (Not Recommended for Production)

If the extension ID might change, you could use a pattern, but this is less secure:

```javascript
// In app.js - add to CORS origin function
const isChromeExtension = (origin) => {
  return origin && origin.startsWith('chrome-extension://');
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow if in whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    }
    // Allow if Chrome extension
    else if (isChromeExtension(origin)) {
      callback(null, true);
    }
    // Reject otherwise
    else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Better Solution: Use Environment Variable

Add the extension origin to your `.env` file so it's easy to update:

```env
ALLOWED_ORIGINS=https://app.canopi.live,https://share.canopi.live,https://api.canopi.live,chrome-extension://bnbghmbiikibpkllpeehcmpjmbcnhhcb
```

## Testing

After adding the extension origin, test that API calls work:

1. Open Chrome DevTools in the extension's sidepanel
2. Check Network tab for API requests
3. Verify no CORS errors in console
4. Check that requests include credentials (cookies, auth headers)

## Current Status

Your extension makes `fetch()` requests from `APIService.ts`, which means:
- ✅ Extension has `host_permissions` for your API domains
- ⚠️ But CORS still applies for cross-origin requests
- ✅ Adding the extension origin will ensure CORS works properly


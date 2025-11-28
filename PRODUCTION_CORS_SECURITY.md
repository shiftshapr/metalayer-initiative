# Production CORS Security - Chrome Extension

## ✅ Updated: Production-Specific Extension Allowlist

The CORS configuration now **only allows the specific published extension in production**, while allowing all extensions in development for flexibility.

## Configuration

### Production Behavior
- ✅ **Only allows**: `chrome-extension://bnbghmbiikibpkllpeehcmpjmbcnhhcb`
- ❌ **Rejects**: All other Chrome extension origins
- 🔒 **Security**: Prevents unauthorized extensions from accessing your API

### Development Behavior
- ✅ **Allows**: All `chrome-extension://` origins
- 🔧 **Flexibility**: Developers can use unpacked extensions with different IDs
- 🛠️ **Testing**: Easier to test with multiple extension versions

## Extension ID

**Production Extension ID:** `bnbghmbiikibpkllpeehcmpjmbcnhhcb`

This is the ID from your `manifest.json`. When you publish to Chrome Web Store, this ID will be assigned by Google.

## How It Works

```javascript
const isProduction = process.env.NODE_ENV === 'production';

if (origin.startsWith('chrome-extension://')) {
  if (isProduction) {
    // Only allow specific extension
    const expectedOrigin = `chrome-extension://${PRODUCTION_EXTENSION_ID}`;
    if (origin === expectedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Chrome extension not allowed in production'));
    }
  } else {
    // Development: allow all extensions
    callback(null, true);
  }
}
```

## Environment Variable

Make sure `NODE_ENV` is set correctly:

**Production:**
```env
NODE_ENV=production
```

**Development:**
```env
NODE_ENV=development
# or leave unset (defaults to development)
```

## Security Benefits

1. ✅ **Prevents Extension Spoofing**: Only your published extension can access the API
2. ✅ **Blocks Malicious Extensions**: Other extensions can't make requests to your API
3. ✅ **Maintains Flexibility**: Development still allows all extensions for testing

## Updating Extension ID

If your extension ID changes (e.g., after republishing), update the constant in `app.js`:

```javascript
const PRODUCTION_EXTENSION_ID = 'your-new-extension-id';
```

## Testing

### Production Mode
```bash
NODE_ENV=production npm start
```

Test that:
- ✅ Your extension works (correct ID)
- ❌ Other extensions are rejected
- ✅ Web origins still work

### Development Mode
```bash
NODE_ENV=development npm start
# or
npm run dev
```

Test that:
- ✅ All extensions work
- ✅ Web origins still work

## Logging

When an unauthorized extension tries to access in production, you'll see:
```
⚠️ CORS: Rejected Chrome extension origin: chrome-extension://<other-id> (expected: chrome-extension://bnbghmbiikibpkllpeehcmpjmbcnhhcb)
```

This helps you identify potential security issues or misconfigurations.

---

**Status:** ✅ Production security enabled - only specific extension allowed


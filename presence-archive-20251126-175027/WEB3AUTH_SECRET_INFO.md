# Web3Auth: Client ID vs Client Secret

## Quick Answer

**For your test page and extension: You only need the Client ID. No secret required.**

## Detailed Explanation

### Client ID (Required for Frontend)
- **What it is:** Public identifier for your Web3Auth project
- **Where to get it:** https://dashboard.web3auth.io → Your Project → Settings
- **Where to use it:** Frontend code (browser extension, test page)
- **Is it secret?** No, it's safe to include in client-side code
- **Required for:** Initializing Web3Auth SDK, user authentication flows

### Client Secret (Only for Backend)
- **What it is:** Private key for server-side operations
- **Where to get it:** https://dashboard.web3auth.io → Your Project → Settings
- **Where to use it:** Backend/server code only (never in frontend!)
- **Is it secret?** Yes, must be kept secure and never exposed
- **Required for:**
  - Verifying JWTs on your backend
  - Making server-side API calls to Web3Auth
  - Custom authentication flows that require server verification

## When Do You Need the Secret?

### ✅ You DON'T need it if:
- You're only doing client-side authentication (like our extension)
- Users authenticate directly in the browser
- You're not verifying tokens on your backend
- You're using Web3Auth's built-in authentication flow

### ❌ You DO need it if:
- You want to verify JWTs on your backend server
- You're making server-side API calls to Web3Auth
- You need to validate user sessions on the server
- You're implementing custom authentication that requires server verification

## Current Implementation

Our current implementation is **purely client-side**:
- Test page: Browser-based authentication
- Extension: Browser extension authentication
- No backend JWT verification needed

**Therefore: Client ID only, no secret required.**

## Future: If You Need Backend Verification

If you later need to verify JWTs on your backend (e.g., in `app.js` or API routes), you would:

1. Get the Client Secret from Web3Auth dashboard
2. Store it securely (environment variable, secrets manager)
3. Use it in your backend code to verify tokens:

```javascript
// Backend example (if needed in future)
const Web3Auth = require('@web3auth/node-sdk');

const web3auth = new Web3Auth({
  clientId: process.env.WEB3AUTH_CLIENT_ID,
  clientSecret: process.env.WEB3AUTH_CLIENT_SECRET, // Only on backend!
  web3AuthNetwork: 'sapphire_mainnet',
});

// Verify JWT token
const user = await web3auth.verifyIdToken({ idToken: token });
```

But for now, **you don't need this** - just the Client ID is sufficient.


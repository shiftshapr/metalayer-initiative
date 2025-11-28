# Web3Auth Client ID Setup Guide

## Client ID vs Client Secret

**For client-side usage (test page & extension):**
- ✅ **Client ID is required** - This is public and safe to use in frontend code
- ❌ **Client Secret is NOT needed** - Only required for server-side operations

**Client Secret is only needed if you:**
- Verify JWTs on your backend server
- Make server-side API calls to Web3Auth
- Implement custom authentication flows on the server

Since we're doing client-side authentication (browser extension), **you only need the Client ID**.

---

## Two Different Places

You need to set the Client ID in **two different places** depending on what you're testing:

### 1. For the Test HTML Page (`test-web3auth.html`)

**Location:** Directly in the HTML file (line 207)

```javascript
const WEB3AUTH_CLIENT_ID = 'YOUR_WEB3AUTH_CLIENT_ID'; // Replace this
```

**Why:** This is a standalone HTML file that runs directly in the browser. Environment variables (`.env`) won't work here because there's no build process.

**Action:** Open `test-web3auth.html` and replace `'YOUR_WEB3AUTH_CLIENT_ID'` with your actual Client ID.

---

### 2. For the Extension Integration (`src/core/auth/config.ts`)

**Location:** The code reads from multiple sources (in order of priority):

1. `window.CANOPI_WEB3AUTH_CLIENT_ID` (browser/extension context)
2. `process.env.WEB3AUTH_CLIENT_ID` (Node.js/server context)
3. Empty string (if neither is set)

**Options for Extension:**

#### Option A: Window Global (Recommended for Extension)
Set it in your extension's initialization code:

```typescript
// In sidepanel.ts or BootController.ts
(window as Window & { CANOPI_WEB3AUTH_CLIENT_ID?: string }).CANOPI_WEB3AUTH_CLIENT_ID = 'your_client_id_here';
```

#### Option B: Environment Variable (If using a build system)
If you're using a bundler (webpack, vite, etc.) that processes `.env` files:

1. Create `.env` file in the `presence/` directory:
   ```
   WEB3AUTH_CLIENT_ID=your_client_id_here
   ```

2. Make sure your build system is configured to inject `process.env` variables.

**Note:** Browser extensions don't have direct access to `process.env` at runtime, so you'd need a build step to inject it.

#### Option C: Config File (Not recommended for production)
You could hardcode it directly in `config.ts`, but this is not secure for production.

---

## Recommended Approach

### For Testing:
- Edit `test-web3auth.html` directly (line 207)

### For Extension:
- Use **Option A** (window global) - set it in your initialization code
- Or create a separate config file that's gitignored (e.g., `config.local.ts`)

---

## Example: Setting Window Global

Create a file like `src/config/auth-config.ts`:

```typescript
// This file should be gitignored or use environment variables
export const AUTH_CONFIG = {
  web3AuthClientId: process.env.WEB3AUTH_CLIENT_ID || 'your_client_id_here'
};

// Set it on window for the extension
if (typeof window !== 'undefined') {
  (window as Window & { CANOPI_WEB3AUTH_CLIENT_ID?: string }).CANOPI_WEB3AUTH_CLIENT_ID = 
    AUTH_CONFIG.web3AuthClientId;
}
```

Then import this in your boot sequence before initializing AuthProvider.

---

## Security Note

⚠️ **Important:** Never commit your actual Client ID to git. Use:
- `.gitignore` for `.env` files
- `.gitignore` for `config.local.ts` or similar
- Environment variables in production
- Secrets management for deployment


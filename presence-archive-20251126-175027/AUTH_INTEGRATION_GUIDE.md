# Auth Integration Guide - Loosely Coupled Architecture

This guide explains the new loosely coupled authentication system for Canopi that supports Web3Auth, DWeb login (Mastodon, ActivityPub, AT Protocol, Nostr), and SSO.

## Architecture Overview

The new auth system uses an adapter pattern:

```
AuthProvider (Manager)
    ├── AuthAdapter (Interface)
    │   ├── Web3AuthAdapter
    │   ├── MastodonAdapter (Future)
    │   ├── ActivityPubAdapter (Future)
    │   ├── ATProtocolAdapter (Future)
    │   ├── NostrAdapter (Future)
    │   └── SSOAdapter (Future)
```

## Files Created

1. **`test-web3auth.html`** - Standalone test page for Web3Auth
2. **`src/core/auth/AuthAdapter.ts`** - Interface for all auth adapters
3. **`src/core/auth/adapters/Web3AuthAdapter.ts`** - Web3Auth implementation
4. **`src/core/auth/AuthProvider.ts`** - Central auth provider manager
5. **`src/core/auth/config.ts`** - Configuration for auth adapters

## Testing Web3Auth

### Step 1: Get Web3Auth Client ID

1. Go to https://dashboard.web3auth.io
2. Sign up or log in
3. Create a new project (or use existing)
4. Copy your Client ID from the dashboard

### Step 2: Test on Standalone Page

1. Open `test-web3auth.html`
2. Replace `YOUR_WEB3AUTH_CLIENT_ID` with your actual Client ID
3. Open the file in a browser or serve it:
   ```bash
   # Option 1: Direct file open
   open test-web3auth.html
   
   # Option 2: Local server
   python3 -m http.server 8000
   # Then navigate to http://localhost:8000/test-web3auth.html
   ```
4. Click "Connect with Web3Auth" and test the flow

### Step 3: Verify Functionality

- ✅ User can connect with various login methods
- ✅ User information is displayed correctly
- ✅ Wallet address is retrieved
- ✅ Disconnect works properly

## Integration into Extension

### Step 1: Add Web3Auth SDK to Extension

Add the Web3Auth SDK to your extension's HTML files:

```html
<!-- In sidepanel.html or wherever auth is initialized -->
<script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@latest/dist/web3auth.umd.min.js"></script>
```

Or install via npm (if using a bundler):
```bash
npm install @web3auth/modal
```

### Step 2: Update Manifest

Add Web3Auth domains to `content_security_policy` in `manifest.json`:

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://*.web3auth.io https://*.web3auth.com wss://*.web3auth.io wss://*.web3auth.com ..."
  }
}
```

### Step 3: Initialize AuthProvider

Update your initialization code (e.g., in `BootController.ts` or `Sidepanel.ts`):

```typescript
import { authProviderInstance } from '../core/auth/AuthProvider.js';
import { getAuthConfigs } from '../core/auth/config.js';

// Initialize auth provider
const authConfigs = getAuthConfigs();
await authProviderInstance.initialize(authConfigs);

// Check if user is already authenticated
const isAuth = await authProviderInstance.isAuthenticated();
if (isAuth) {
  const user = await authProviderInstance.getCurrentUser();
  // Update UI with user
}
```

### Step 4: Update AuthModule

Modify `src/features/AuthModule.ts` to use the new AuthProvider:

```typescript
import { authProviderInstance } from '../core/auth/AuthProvider.js';

// Replace existing signInWithGoogle with:
async function signInWithWeb3Auth() {
  const result = await authProviderInstance.signIn();
  if (result.success && result.user) {
    // Handle successful login
    await authenticateWithSupabase(result.user);
    // Update UI
  }
}
```

### Step 5: Set Web3Auth Client ID

Set the Client ID in one of these ways:

**Option 1: Environment variable (recommended for production)**
```bash
export WEB3AUTH_CLIENT_ID=your_client_id_here
```

**Option 2: Window global (for testing)**
```javascript
window.CANOPI_WEB3AUTH_CLIENT_ID = 'your_client_id_here';
```

**Option 3: Update config.ts directly (not recommended for production)**

## Adding New Auth Providers

To add a new auth provider (e.g., Mastodon, Nostr):

1. **Create adapter class:**
   ```typescript
   // src/core/auth/adapters/MastodonAdapter.ts
   import type { AuthAdapter, AuthResult } from '../AuthAdapter.js';
   
   export class MastodonAdapter implements AuthAdapter {
     // Implement all required methods
     async initialize(): Promise<void> { ... }
     async signIn(): Promise<AuthResult> { ... }
     // ... etc
   }
   ```

2. **Register in AuthProvider:**
   ```typescript
   // In AuthProvider.ts initialize method
   case 'mastodon':
     adapter = new MastodonAdapter(config.config);
     this.registerAdapter(adapter);
     break;
   ```

3. **Add to config:**
   ```typescript
   // In config.ts
   configs.push({
     provider: 'mastodon',
     enabled: true,
     config: { /* mastodon config */ }
   });
   ```

## Benefits of This Architecture

1. **Loosely Coupled:** Each auth provider is independent
2. **Extensible:** Easy to add new providers
3. **Testable:** Each adapter can be tested separately
4. **Flexible:** Can switch between providers at runtime
5. **Type-Safe:** Full TypeScript support

## Migration Path

1. ✅ Test Web3Auth on standalone page
2. ⏳ Integrate into extension
3. ⏳ Update existing auth flows to use new system
4. ⏳ Add DWeb providers (Mastodon, ActivityPub, AT Protocol, Nostr)
5. ⏳ Add SSO support

## Notes

- The system maintains backward compatibility with existing auth flows
- StateManager is updated automatically when auth state changes
- All adapters follow the same interface, making them interchangeable


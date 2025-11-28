# Web3Auth SSO Adapters & Whitelist Guide

## Important Clarification: Web3Auth Already Includes SSO!

**Good News:** Web3Auth's **Plug and Play** product already includes SSO providers built-in:
- ✅ Google
- ✅ Facebook
- ✅ Twitter/X
- ✅ GitHub
- ✅ Discord
- ✅ Email (passwordless)
- ✅ Apple
- ✅ And more...

**You don't need to create adapters for these!** They're already part of Web3Auth.

---

## When You DO Need Custom SSO Adapters

You only need custom adapters for:

### 1. Enterprise SSO (SAML/OIDC)
- **SAML 2.0** (e.g., Okta, Azure AD, OneLogin)
- **OpenID Connect (OIDC)** (e.g., Auth0, Keycloak)
- **Active Directory Federation Services (ADFS)**

### 2. Custom SSO Providers
- Proprietary enterprise SSO systems
- Custom authentication systems
- Legacy SSO implementations

---

## Effort Required for Enterprise SSO Adapters

### Complexity: **Medium to High**

**Why it's complex:**
1. **Protocol Understanding:** Need to understand SAML/OIDC flows
2. **Security:** Must handle tokens, certificates, encryption correctly
3. **Integration:** Need to work with Web3Auth's architecture
4. **Testing:** Multiple SSO providers have different quirks

### Estimated Effort:

**For a single SSO adapter (e.g., SAML):**
- **Simple implementation:** 2-3 days
- **Production-ready with error handling:** 5-7 days
- **Full testing & edge cases:** 10-14 days

**For multiple adapters:**
- Each additional adapter: 3-5 days (can reuse patterns)
- Shared infrastructure: 2-3 days

---

## How Many SSO Adapters Do You Need?

### For Most Enterprise Situations: **2-3 Adapters**

#### Option 1: Universal Adapter Approach (Recommended)
Create **one generic adapter** that handles multiple protocols:

1. **SAML Adapter** (covers most enterprise SSO)
   - Supports: Okta, Azure AD, OneLogin, ADFS, etc.
   - **Effort:** ~1 week
   - **Covers:** ~70% of enterprise SSO

2. **OIDC Adapter** (covers modern SSO)
   - Supports: Auth0, Keycloak, Google Workspace SSO, etc.
   - **Effort:** ~1 week
   - **Covers:** ~25% of enterprise SSO

3. **Custom Adapter** (for edge cases)
   - For proprietary systems
   - **Effort:** Varies (1-2 weeks per system)

**Total:** 2-3 weeks for most enterprise coverage

#### Option 2: Provider-Specific Adapters
Create separate adapters for each provider:
- Okta Adapter
- Azure AD Adapter
- OneLogin Adapter
- Auth0 Adapter
- etc.

**Not recommended** - too much duplication, harder to maintain.

---

## Recommended Approach for Canopi

### Phase 1: Use Web3Auth's Built-in SSO (Now)
- ✅ Google, Facebook, Twitter, GitHub, Discord
- ✅ Already included, no work needed
- ✅ Covers 90%+ of consumer use cases

### Phase 2: Add Enterprise SSO (If Needed)
If you need enterprise SSO later:

1. **Start with OIDC Adapter** (most modern)
   - Covers Auth0, Keycloak, Google Workspace
   - Easier than SAML
   - ~1 week effort

2. **Add SAML Adapter** (if needed)
   - For legacy enterprise systems
   - ~1 week effort

3. **Total Enterprise SSO Coverage:** 2-3 weeks

---

## Whitelist URL for Browser Extension

### Answer: `chrome-extension://<extension-id>`

### Step-by-Step:

#### 1. Get Your Extension ID

**Option A: Load Unpacked Extension (Development)**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select your extension directory
5. Copy the Extension ID shown (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

**Option B: Use Consistent Extension ID (Production)**
Add a `key` field to `manifest.json` to keep the same ID:

```json
{
  "manifest_version": 3,
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...", // Your public key
  "name": "Canopi",
  // ... rest of manifest
}
```

Generate key:
```bash
# Generate a key pair
openssl genrsa -out key.pem 2048
openssl rsa -in key.pem -pubout -outform DER | openssl base64 -A
```

#### 2. Construct the Whitelist URL

Format: `chrome-extension://<extension-id>`

Example:
```
chrome-extension://abcdefghijklmnopqrstuvwxyz123456
```

#### 3. Add to Web3Auth Dashboard

1. Go to Web3Auth Dashboard
2. Navigate to: **Project Settings** → **Domains** tab
3. Click "Add Domain" or "Whitelist URL"
4. Enter: `chrome-extension://<your-extension-id>`
5. Save

#### 4. For Development/Testing

Also whitelist:
- `chrome-extension://<dev-extension-id>` (if different)
- `http://localhost:*` (for local testing)
- `http://127.0.0.1:*` (alternative localhost)

---

## Extension ID Management

### Problem: Extension IDs Change

**Issue:** Each time you load an unpacked extension, Chrome may assign a different ID.

### Solution: Use `key` Field in Manifest

Add to `manifest.json`:

```json
{
  "manifest_version": 3,
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  // ... rest of manifest
}
```

**Benefits:**
- ✅ Same extension ID every time
- ✅ Consistent whitelist URL
- ✅ Easier to manage

**Note:** The `key` field is optional but recommended for production.

---

## Complete Whitelist Setup Example

### For Development:
```
chrome-extension://abcdefghijklmnopqrstuvwxyz123456
http://localhost:8000
http://127.0.0.1:8000
```

### For Production:
```
chrome-extension://abcdefghijklmnopqrstuvwxyz123456
```

### For Both:
```
chrome-extension://*
http://localhost:*
```

**Note:** Some Web3Auth configurations may support wildcards, but check the dashboard.

---

## Implementation Priority

### Immediate (No Work Needed):
1. ✅ Use Web3Auth's built-in SSO (Google, Facebook, Twitter, etc.)
2. ✅ Whitelist extension URL in dashboard

### Future (If Needed):
1. ⏳ Add OIDC adapter for enterprise SSO (1 week)
2. ⏳ Add SAML adapter for legacy enterprise (1 week)

### Total SSO Coverage:
- **Consumer SSO:** ✅ Already done (via Web3Auth)
- **Enterprise SSO:** ⏳ 2-3 weeks if needed later

---

## Summary

### SSO Adapters:
- **Built-in SSO:** ✅ Already included (Google, Facebook, Twitter, etc.)
- **Enterprise SSO:** 2-3 adapters needed, ~2-3 weeks total
- **Most situations:** 2 adapters (OIDC + SAML) cover 95%+

### Whitelist URL:
- **Format:** `chrome-extension://<extension-id>`
- **Get ID:** From `chrome://extensions/` or use `key` in manifest
- **Add to:** Web3Auth Dashboard → Project Settings → Domains

### Recommendation:
1. Start with Web3Auth's built-in SSO (no work needed)
2. Add enterprise SSO adapters only if/when needed
3. Use `key` field in manifest for consistent extension ID
4. Whitelist extension URL in dashboard


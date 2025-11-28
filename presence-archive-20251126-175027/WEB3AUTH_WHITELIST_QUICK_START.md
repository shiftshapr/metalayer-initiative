# Web3Auth Whitelist URL - Quick Start

## Quick Answer

**Whitelist URL Format:** `chrome-extension://<your-extension-id>`

## How to Get Your Extension ID

### Method 1: Load Extension and Check (Easiest)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select your extension directory (`/home/ubuntu/metalayer-initiative/presence`)
5. **Copy the Extension ID** shown (looks like: `abcdefghijklmnopqrstuvwxyz123456`)
6. Your whitelist URL is: `chrome-extension://abcdefghijklmnopqrstuvwxyz123456`

### Method 2: Use Consistent Extension ID (Recommended for Production)

Add a `key` field to `manifest.json` to keep the same ID every time:

```json
{
  "manifest_version": 3,
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  "name": "Canopi",
  // ... rest of manifest
}
```

**Generate the key:**
```bash
# Generate key pair
openssl genrsa -out key.pem 2048

# Extract public key in base64 format
openssl rsa -in key.pem -pubout -outform DER | openssl base64 -A
```

Copy the output and add it as the `key` field in `manifest.json`.

**Note:** Keep `key.pem` private (don't commit to git). The public key in manifest is safe.

## Add to Web3Auth Dashboard

1. Go to https://dashboard.web3auth.io
2. Select your project (Canopi)
3. Navigate to: **Project Settings** → **Domains** tab
4. Click "Add Domain" or "Whitelist URL"
5. Enter: `chrome-extension://<your-extension-id>`
6. Click "Save"

## For Development

Also whitelist localhost for testing:
- `http://localhost:*`
- `http://127.0.0.1:*`

## Current Status

Your manifest.json currently **does not have a `key` field**, which means:
- ⚠️ Extension ID may change when reloading
- ✅ For development: Just get the ID from `chrome://extensions/` each time
- ✅ For production: Add `key` field to keep ID consistent

## Example Whitelist URLs

```
chrome-extension://abcdefghijklmnopqrstuvwxyz123456
http://localhost:8000
http://127.0.0.1:8000
```

---

**See `WEB3AUTH_SSO_ADAPTERS_GUIDE.md` for full details on SSO adapters and whitelisting.**


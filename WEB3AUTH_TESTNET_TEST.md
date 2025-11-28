# Web3Auth Mainnet Configuration - Support Response

**Note:** Mainnet is the default. Testnet is only for diagnostics - wallet addresses cannot transition from testnet to mainnet.

## Support Response Summary

Web3Auth support (Shana) responded with:
1. **May need to upgrade** (plan upgrade)
2. **Test on testnet** - Check if the same whitelabel issue occurs on testnet
3. **Try quick start examples** - Reference: https://github.com/Web3Auth/web3auth-examples/tree/main/quick-starts

## Quick Start Example Findings

From the official quick start examples, I found:

**File:** `react-quick-start/src/web3authContext.tsx`
```typescript
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Uses DEVNET (testnet)
  }
};
```

**Key Observations:**
- Quick start uses `SAPPHIRE_DEVNET` (testnet) by default
- Uses enum constant `WEB3AUTH_NETWORK.SAPPHIRE_DEVNET` (React/TypeScript)
- For vanilla JS (UMD build), use string: `'sapphire_devnet'`
- No `uiConfig` or whitelabel configuration in the example

## Changes Made

Updated `/home/ubuntu/canopi/public/web3auth-test/index.html`:
- Switched from `'sapphire_mainnet'` to `'sapphire_devnet'` (testnet)
- Added comments referencing the quick start examples
- Made network configurable via a constant for easy switching

## Important Note: Client ID

**Current Client ID:** `BMHv9VSoukKrDc-e9uVKql-oLEoX6DIs3neoVV5tnZ10WsrcwY2bGYUONsfQ36Fu9vkP13mETY42lTKqe-wMSSA`

**⚠️ Potential Issue:** This Client ID is likely configured for **mainnet** (`sapphire_mainnet`). When testing with `sapphire_devnet`, you may need:

1. **Option A:** Create a separate devnet project in Web3Auth dashboard and get a devnet Client ID
2. **Option B:** Check if your dashboard project supports both networks (some projects do)
3. **Option C:** The same Client ID might work for both (test first)

## Testing Steps

1. **Test with current Client ID on devnet:**
   - Visit: https://view.canopi.live/web3auth-test/
   - Check browser console for errors
   - If you see "Project not found" or similar, you need a devnet Client ID

2. **If devnet works:**
   - Check if whitelabel error still occurs
   - If no whitelabel error on devnet → issue is mainnet-specific
   - If whitelabel error persists on devnet → issue is project/dashboard configuration

3. **If you need a devnet Client ID:**
   - Go to Web3Auth Dashboard: https://dashboard.web3auth.io
   - Create a new project or check existing project settings
   - Ensure project is set to "Sapphire Devnet" network
   - Get the devnet Client ID
   - Update `.env` file with `WEB3AUTH_CLIENT_ID_DEVNET` (or create separate config)

## Next Steps Based on Results

### If testnet works without whitelabel error:
- The issue is mainnet-specific
- May need to upgrade plan for mainnet whitelabel features
- Or there's a dashboard setting difference between mainnet/devnet

### If testnet also has whitelabel error:
- Issue is project-level configuration
- Check dashboard for any whitelabel/branding settings
- May need support to disable whitelabel at project level
- Or upgrade plan if whitelabel is required

### If "Project not found" error:
- Need to create/get devnet Client ID
- Update code to use devnet Client ID when network is `sapphire_devnet`

## Code Location

Test page: `/home/ubuntu/canopi/public/web3auth-test/index.html`
- Line 323: Network configuration constant
- Easy to switch between `'sapphire_devnet'` and `'sapphire_mainnet'`

## References

- Quick Start Examples: https://github.com/Web3Auth/web3auth-examples/tree/main/quick-starts
- Web3Auth Dashboard: https://dashboard.web3auth.io
- Web3Auth Docs: https://web3auth.io/docs


# Testnet Diagnostic Test - Temporary

## Current Status
**TEMPORARILY using testnet (`sapphire_devnet`) for diagnostics only.**

## What to Test

1. **Visit:** https://view.canopi.live/web3auth-test/
2. **Open browser console** (F12 → Console tab)
3. **Try to connect** and watch for:

### Expected Outcomes:

#### Scenario A: "Project not found" error
- **Meaning:** Your Client ID is mainnet-only
- **Action:** Need to create a devnet project in dashboard or skip testnet test
- **Next:** Switch back to mainnet and continue debugging there

#### Scenario B: Works without whitelabel error
- **Meaning:** Issue is mainnet-specific
- **Action:** Switch back to mainnet and investigate mainnet configuration
- **Next:** Check dashboard for mainnet vs devnet settings differences

#### Scenario C: Same whitelabel error on testnet
- **Meaning:** Issue is project-level, not network-specific
- **Action:** Switch back to mainnet (same issue will persist)
- **Next:** Focus on dashboard settings or SDK configuration

## After Testing

**IMPORTANT:** Switch back to mainnet immediately after testing:

1. Edit `/home/ubuntu/canopi/public/web3auth-test/index.html`
2. Change line 323:
   ```javascript
   const WEB3AUTH_NETWORK = 'sapphire_mainnet'; // Production (mainnet)
   // const WEB3AUTH_NETWORK = 'sapphire_devnet'; // Testnet (for diagnostics only)
   ```
3. Restart server: `pm2 restart metalayer-api --update-env`

## Notes

- Testnet wallets cannot be used on mainnet
- This is diagnostic only - not for production use
- Test quickly and switch back to mainnet


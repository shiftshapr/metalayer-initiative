# Web3Auth Testnet vs Mainnet Test Results

## Test Results Summary

**Date:** 2025-11-28  
**Status:** Testnet works, Mainnet has whitelabel error

## Findings

### Testnet (sapphire_devnet)
- ✅ **Works without whitelabel error**
- ✅ Connection successful
- ✅ No 403 Forbidden errors
- ✅ SDK does not trigger whitelabel restrictions

### Mainnet (sapphire_mainnet)
- ❌ **Whitelabel error occurs**
- ❌ 403 Forbidden: "whitelabel features are not available on base plan"
- ❌ SDK sends `is_whitelabel=true` automatically
- ❌ Connection fails due to whitelabel restriction

## Conclusion

**The whitelabel issue is MAINNET-SPECIFIC, not project-level.**

This means:
- The issue is NOT in the dashboard project settings (would affect both networks)
- The issue is NOT in the code configuration (same code works on testnet)
- The issue IS related to mainnet-specific enforcement or SDK behavior

## Implications

1. **Mainnet has stricter whitelabel enforcement** than testnet
2. **SDK behavior differs** between mainnet and testnet networks
3. **Base plan restrictions** may be enforced differently on mainnet vs testnet
4. **Dashboard settings** may have network-specific configurations

## Next Steps

1. **Contact Web3Auth Support** with this finding:
   - Testnet works fine (no whitelabel error)
   - Mainnet fails with whitelabel error (same code, same Client ID pattern)
   - Request: Disable whitelabel for mainnet or investigate why mainnet enforces it differently

2. **Check Dashboard** for network-specific settings:
   - Look for mainnet vs testnet configuration differences
   - Check if there's a mainnet-specific whitelabel toggle

3. **Document for Support**:
   - Same code works on testnet
   - Same configuration works on testnet
   - Only difference is network (`sapphire_mainnet` vs `sapphire_devnet`)
   - SDK automatically sends `is_whitelabel=true` on mainnet but not testnet (or testnet ignores it)

## Test Configuration

- **Testnet URL:** `https://view.canopi.live/web3auth-test/?network=devnet`
- **Mainnet URL:** `https://view.canopi.live/web3auth-test/`
- **Client IDs:** Separate Client IDs for each network (configured in `.env`)
- **Code:** Identical configuration, only network parameter differs

## Support Ticket Information

When contacting support, include:
- Testnet works without whitelabel error
- Mainnet fails with whitelabel error
- Same code, same configuration, only network differs
- Request: Why does mainnet enforce whitelabel differently than testnet?
- Request: How to disable whitelabel for mainnet on base plan?


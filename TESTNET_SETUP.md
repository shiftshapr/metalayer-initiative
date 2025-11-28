# Testnet Setup Instructions

## Add Testnet Client ID to .env

Add this line to your `/home/ubuntu/canopi/.env` file:

```bash
WEB3AUTH_CLIENT_ID_DEVNET=your_testnet_client_id_here
```

Keep your existing mainnet Client ID:
```bash
WEB3AUTH_CLIENT_ID=BMHv9VSoukKrDc-e9uVKql-oLEoX6DIs3neoVV5tnZ10WsrcwY2bGYUONsfQ36Fu9vkP13mETY42lTKqe-wMSSA
```

## How to Test

### Test on Mainnet (Default)
Visit: https://view.canopi.live/web3auth-test/

### Test on Testnet
Visit: https://view.canopi.live/web3auth-test/?network=devnet

Or: https://view.canopi.live/web3auth-test/?network=testnet

## What to Look For

### If Testnet Works Without Whitelabel Error:
- Issue is **mainnet-specific**
- Mainnet may have stricter whitelabel enforcement
- Solution: Contact support about mainnet whitelabel settings

### If Testnet Also Has Whitelabel Error:
- Issue is **project-level** (not network-specific)
- Both networks have whitelabel enabled
- Solution: Dashboard settings or support escalation needed

### If "Project not found" on Testnet:
- Testnet Client ID is incorrect or not configured
- Check `.env` file has `WEB3AUTH_CLIENT_ID_DEVNET` set correctly

## After Testing

1. **Switch back to mainnet** by removing `?network=devnet` from URL
2. **Document results** - which network(s) show the whitelabel error
3. **Contact support** with findings

## Notes

- Testnet wallets cannot be used on mainnet
- Use testnet only for diagnostics
- Mainnet is production - keep it as default


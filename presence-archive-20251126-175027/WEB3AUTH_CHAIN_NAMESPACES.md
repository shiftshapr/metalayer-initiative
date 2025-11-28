# Web3Auth Chain Namespaces Explained

## What is a Chain Namespace?

A **chain namespace** in Web3Auth tells the system which blockchain ecosystem you want to support. It determines:
- What type of wallet addresses users will get
- Which blockchain networks are available
- How transactions and interactions work
- What RPC endpoints and tools you'll use

Think of it as choosing the "blockchain family" your app will work with.

---

## Available Namespaces

### 1. **EIP155 (Ethereum/EVM)** - `"eip155"`

**What it means:**
- Supports Ethereum and all **EVM-compatible chains** (Ethereum Virtual Machine)
- Users get Ethereum-style addresses (0x...)
- Most common choice for Web3 apps

**Supported Chains:**
- Ethereum Mainnet
- Polygon
- BSC (Binance Smart Chain)
- Avalanche
- Arbitrum
- Optimism
- Base
- And 100+ other EVM chains

**When to use:**
- ✅ You want to support Ethereum and its ecosystem
- ✅ You need compatibility with MetaMask, WalletConnect, etc.
- ✅ You're building a DeFi, NFT, or general Web3 app
- ✅ You want the widest ecosystem support

**Example Configuration:**
```typescript
chainConfig: {
  chainNamespace: 'eip155',
  chainId: '0x1', // Ethereum Mainnet
  rpcTarget: 'https://rpc.ankr.com/eth',
  displayName: 'Ethereum Mainnet',
  ticker: 'ETH',
  tickerName: 'Ethereum',
}
```

---

### 2. **Solana** - `"solana"`

**What it means:**
- Supports the Solana blockchain
- Users get Solana-style addresses (base58 encoded)
- Different transaction model than Ethereum

**Supported Chains:**
- Solana Mainnet
- Solana Devnet
- Solana Testnet

**When to use:**
- ✅ You're building a Solana-specific application
- ✅ You need fast, low-cost transactions
- ✅ You're working with Solana NFTs, DeFi, or dApps
- ✅ Your users primarily use Solana wallets (Phantom, etc.)

**Example Configuration:**
```typescript
chainConfig: {
  chainNamespace: 'solana',
  chainId: 'mainnet-beta', // or 'devnet' or 'testnet'
  rpcTarget: 'https://api.mainnet-beta.solana.com',
  displayName: 'Solana Mainnet',
  ticker: 'SOL',
  tickerName: 'Solana',
}
```

---

### 3. **Other Namespaces**

**What it means:**
- For non-EVM, non-Solana blockchains
- Examples: Cosmos, Tezos, Polkadot, etc.
- May require additional configuration
- Limited wallet support in Web3Auth dashboard

**When to use:**
- ✅ You're building on a specific non-EVM blockchain
- ✅ You need custom blockchain integration
- ⚠️ Note: May require more setup and have limited tooling

---

## What This Means for Canopi

### Current Configuration (EIP155/Ethereum)

Our current setup uses **EIP155 (Ethereum)**:

```typescript
chainConfig: {
  chainNamespace: 'eip155',  // Ethereum/EVM namespace
  chainId: '0x1',            // Ethereum Mainnet
  rpcTarget: 'https://rpc.ankr.com/eth',
  displayName: 'Ethereum Mainnet',
  ticker: 'ETH',
  tickerName: 'Ethereum',
}
```

**This means:**
- ✅ Users will get Ethereum addresses (0x...)
- ✅ Compatible with MetaMask, WalletConnect, Coinbase Wallet
- ✅ Can work with Polygon, BSC, Arbitrum, etc. (all EVM chains)
- ✅ Access to the largest Web3 ecosystem
- ✅ Most users already have wallets that work with this

### Why EIP155 is a Good Default Choice

1. **Largest Ecosystem:** Most Web3 users have EVM wallets
2. **Tooling:** Best developer tools and libraries
3. **Compatibility:** Works with most Web3 services
4. **Flexibility:** Can easily switch between EVM chains (Polygon, Arbitrum, etc.)

---

## Can You Support Multiple Namespaces?

**Short answer:** Not simultaneously in one Web3Auth instance.

**Long answer:**
- Each Web3Auth instance is configured for **one namespace**
- If you need multiple blockchains, you have options:

### Option 1: Multiple Web3Auth Instances (Recommended)
Create separate adapters for each namespace:

```typescript
// Ethereum adapter
const ethAdapter = new Web3AuthAdapter({
  clientId: '...',
  chainConfig: {
    chainNamespace: 'eip155',
    chainId: '0x1',
    // ...
  }
});

// Solana adapter
const solAdapter = new Web3AuthAdapter({
  clientId: '...', // Can use same Client ID
  chainConfig: {
    chainNamespace: 'solana',
    chainId: 'mainnet-beta',
    // ...
  }
});
```

### Option 2: Switch Namespaces Dynamically
Reinitialize Web3Auth with different chain config when user selects a chain.

### Option 3: Use Multi-Chain Wallets
Some wallets (like WalletConnect) can handle multiple chains, but Web3Auth still needs a primary namespace.

---

## Choosing the Right Namespace for Canopi

### Recommendation: **Stick with EIP155 (Ethereum)**

**Reasons:**
1. **User Base:** Most Web3 users have EVM wallets
2. **Flexibility:** Can support Polygon, Arbitrum, Base, etc. (all EVM)
3. **Ecosystem:** Largest tooling and service ecosystem
4. **Future-Proof:** Easy to add more EVM chains later

### When to Consider Solana:
- If you have specific Solana use cases
- If your users primarily use Solana
- If you need Solana-specific features (fast transactions, low fees)

### When to Consider Other Namespaces:
- If you're building on a specific non-EVM blockchain
- If you have custom blockchain requirements
- ⚠️ Be prepared for more setup and limited tooling

---

## Changing the Namespace

If you want to change from Ethereum to another namespace:

1. **Update the chainConfig in `Web3AuthAdapter.ts`:**
   ```typescript
   chainConfig: {
     chainNamespace: 'solana', // or 'eip155', etc.
     chainId: 'mainnet-beta',  // Solana mainnet
     rpcTarget: 'https://api.mainnet-beta.solana.com',
     // ...
   }
   ```

2. **Update the test page (`test-web3auth.html`):**
   ```javascript
   chainConfig: {
     chainNamespace: 'solana',
     chainId: 'mainnet-beta',
     rpcTarget: 'https://api.mainnet-beta.solana.com',
     // ...
   }
   ```

3. **Note:** Users will get different address formats:
   - EIP155: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
   - Solana: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

---

## Summary

- **Namespace = Blockchain ecosystem** (Ethereum, Solana, etc.)
- **EIP155 = Ethereum and all EVM chains** (recommended default)
- **Solana = Solana blockchain** (if you need Solana-specific features)
- **Current setup uses EIP155** (good choice for most apps)
- **You can support multiple namespaces** with separate adapters
- **For Canopi, EIP155 is recommended** unless you have specific needs

The namespace you choose determines what blockchain your users will interact with, but it doesn't limit your authentication options - users can still sign in with Google, Twitter, etc., regardless of the namespace.


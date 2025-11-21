# Canopi Personal Vault

User-controlled encrypted storage with Web3Auth integration for the Canopi platform.

## Overview

The Canopi Personal Vault provides:
- **User-controlled encryption keys** derived from Web3Auth wallet
- **Wallet address as identity** - no separate user IDs
- **Wallet signature-based approvals** for all data access
- **Personal vault storage** - local, cloud, or hybrid
- **Full data portability** and deletion capabilities
- **Personal AI integration** support
- **Data cooperative** support

## Installation

```bash
npm install @canopi/vault
```

## Quick Start

```typescript
import { VaultClient } from '@canopi/vault';
import { Web3Auth } from '@web3auth/modal';

const vault = new VaultClient();
const web3auth = new Web3Auth({ /* config */ });

await vault.authenticate('social');
await vault.initialize({ web3Auth: web3auth, /* ... */ });
```

## Architecture

See [CANOPI_PERSONAL_VAULT_ARCHITECTURE.md](../docs/CANOPI_PERSONAL_VAULT_ARCHITECTURE.md) for complete architecture documentation.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Type check
npm run type-check

# Test
npm test
```

## License

MIT







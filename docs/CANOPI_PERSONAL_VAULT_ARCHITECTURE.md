# Canopi Personal Vault Architecture - Design Document

## Executive Summary

This document outlines the architecture for a **user-controlled personal vault system** where all Canopi data is stored in the user's own vault, encrypted with user-controlled keys, and accessible only with explicit user approval. This architecture enables integration with personal AI systems and data cooperatives while maintaining full user sovereignty.

**Key Principles**:
- **Web3Auth + Wallet Address**: User authentication via Web3Auth, wallet address as identity
- **Wallet-based keys**: Encryption keys derived from wallet private key or address
- **Personal vault**: All web traffic and Canopi activities stored in user's personal vault
- **Wallet signature approvals**: User must sign all data access requests with wallet
- **Data portability**: Full export capabilities
- **Data deletion**: Complete user control over data lifecycle
- **Personal AI integration**: Vault can be accessed by user's personal AI
- **Data cooperatives**: Support for shared data pools with user control

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Personal Vault                    │
│                  (User-Controlled Storage)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Encryption Layer (User Keys)                      │    │
│  │  - Self-custody keys OR custodial wallet          │    │
│  │  - All data encrypted before storage              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Data Storage                                      │    │
│  │  - Messages & conversations                        │    │
│  │  - Web traffic & page visits                       │    │
│  │  - Canopi activities & interactions                │    │
│  │  - Module data                                     │    │
│  │  - Timeline & presence data                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Access Control Layer                              │    │
│  │  - Approval/request system                         │    │
│  │  - Permission management                           │    │
│  │  - Audit logging                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Integration Layer                                 │    │
│  │  - Personal AI access                              │    │
│  │  - Data cooperative interfaces                     │    │
│  │  - Export/import APIs                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ (Encrypted, Approved Access)
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                    Canopi Platform                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Canopi Host │  │   Modules    │  │  Personal AI │   │
│  │  (Client)    │  │  (SDK)       │  │  Integration │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Key Components

1. **Web3Auth**: Authentication and wallet management service
2. **Wallet Address**: User identity and vault identifier
3. **Personal Vault**: User's own storage (local, cloud, or hybrid), identified by wallet address
4. **Key Derivation**: Encryption keys derived from wallet private key or address
5. **Encryption Layer**: All data encrypted with derived keys before storage
6. **Access Control**: Wallet signature-based approval system for all data access
7. **Canopi Client**: Lightweight client that requests access to vault
8. **Integration APIs**: Personal AI and data cooperative interfaces

---

## 2. Key Management Architecture (Web3Auth + Wallet Address)

### 2.1 Web3Auth Integration

**Decision**: Use **Web3Auth** for authentication and wallet management, with **wallet address** as user identity and source for encryption keys.

#### Web3Auth Architecture
```
┌─────────────────────────────────────────────────┐
│  Web3Auth Service                               │
│  ┌──────────────────────────────────────────┐  │
│  │ Authentication Methods                    │  │
│  │ - Social login (Google, Twitter, etc.)   │  │
│  │ - Email/password                         │  │
│  │ - External wallet (MetaMask, etc.)        │  │
│  │ - SMS                                    │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Wallet Generation                         │  │
│  │ - Generates wallet address per user      │  │
│  │ - Manages private key (custodial/non-cust)│  │
│  │ - Provides key access via SDK            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │
         │ (Wallet address + private key access)
         ▼
┌─────────────────────────────────────────────────┐
│  Canopi Vault Client                             │
│  ┌──────────────────────────────────────────┐  │
│  │ Key Derivation                            │  │
│  │ - Derive encryption keys from wallet      │  │
│  │ - Wallet address = user identity         │  │
│  │ - Private key → encryption keys          │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Personal Vault                            │  │
│  │ - Encrypted with derived keys             │  │
│  │ - Wallet address as vault identifier     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Key Benefits**:
- ✅ **User-friendly**: Social login, email, or traditional Web3 wallets
- ✅ **Wallet address = identity**: No separate user ID needed
- ✅ **Key derivation**: Encryption keys derived from wallet private key
- ✅ **Flexible custody**: Web3Auth supports both custodial (social login) and non-custodial (external wallet) modes
- ✅ **Recovery**: Web3Auth handles key recovery for social/email logins
- ✅ **Standards-based**: Uses standard Web3 wallet protocols

### 2.2 Authentication Flow

```
┌─────────────────────────────────────────────────┐
│  1. User Initiates Login                        │
│     - Opens Canopi                              │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  2. Web3Auth Authentication                     │
│     - User chooses: Social / Email / Wallet     │
│     - Web3Auth authenticates                    │
│     - Web3Auth generates/connects wallet         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  3. Wallet Address Retrieved                    │
│     - walletAddress = web3auth.getUserInfo()    │
│     - This becomes user identity                │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  4. Encryption Key Derivation                   │
│     - Get private key from Web3Auth (if available)│
│     - OR derive from wallet address + secret     │
│     - Derive encryption keys using HKDF         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  5. Vault Access                                 │
│     - Vault identified by wallet address        │
│     - Data encrypted with derived keys          │
│     - User authenticated via wallet signature   │
└─────────────────────────────────────────────────┘
```

### 2.3 Key Derivation from Wallet

**Approach**: Derive encryption keys from wallet private key or wallet address.

```typescript
// Option A: Derive from private key (if available from Web3Auth)
const privateKey = await web3auth.getPrivateKey();
const masterKey = deriveEncryptionKey(privateKey, "canopi-vault-master");

// Option B: Derive from wallet address + user secret (if private key not available)
const walletAddress = web3auth.getUserInfo().walletAddress;
const userSecret = await getUserSecret(); // User-provided or derived
const masterKey = deriveEncryptionKey(walletAddress + userSecret, "canopi-vault-master");

// Derive data-type-specific keys
const messageKey = deriveKey(masterKey, "messages");
const timelineKey = deriveKey(masterKey, "timeline");
const moduleDataKey = deriveKey(masterKey, "modules");
const webTrafficKey = deriveKey(masterKey, "web-traffic");
```

**Security Considerations**:
- Private key access depends on Web3Auth login method:
  - **Social/Email login**: Web3Auth manages private key (custodial)
  - **External wallet (MetaMask)**: User controls private key (non-custodial)
- Encryption keys are derived, not the wallet private key itself
- Wallet private key never stored in Canopi vault
- Wallet address is public identifier (safe to use as vault ID)

### 2.4 Wallet Address as Identity

**Key Decision**: Wallet address serves as both user identity and vault identifier.

```typescript
interface UserIdentity {
  // Wallet address from Web3Auth
  walletAddress: string;           // e.g., "0x1234...5678"
  
  // Web3Auth user info
  web3AuthUser: {
    email?: string;
    name?: string;
    profileImage?: string;
    verifier: string;               // "google", "twitter", "email", etc.
    verifierId: string;            // User ID from verifier
  };
  
  // Vault identifier (same as wallet address)
  vaultId: string;                 // Same as walletAddress
  
  // Key derivation info
  keyDerivation: {
    method: 'private-key' | 'address-secret';
    keyVersion: number;
  };
}
```

**Benefits**:
- ✅ **No separate user ID**: Wallet address is unique identifier
- ✅ **Web3 native**: Compatible with Web3 ecosystem
- ✅ **Portable**: User can access vault from any device with same wallet
- ✅ **Privacy**: Wallet address doesn't reveal personal info (unless user chooses to link)

### 2.5 Key Types & Derivation

```typescript
interface KeyManagement {
  // Wallet-based identity
  walletAddress: string;           // From Web3Auth
  
  // Master encryption key (derived from wallet)
  masterKey: EncryptionKey;        // Derived from wallet private key or address+secret
  
  // Derived keys for different data types
  messageKey: EncryptionKey;       // Derived from masterKey + "messages"
  timelineKey: EncryptionKey;      // Derived from masterKey + "timeline"
  moduleDataKey: EncryptionKey;     // Derived from masterKey + "modules"
  webTrafficKey: EncryptionKey;    // Derived from masterKey + "web-traffic"
  
  // Key rotation support
  keyVersion: number;
  previousKeys: EncryptionKey[];   // For decryption of old data
}
```

**Key Derivation Process**:
1. **Get wallet private key** (from Web3Auth, if available)
2. **OR get wallet address + user secret** (if private key not available)
3. **Derive master key** using HKDF-SHA-256
4. **Derive data-type keys** from master key using HKDF
5. **Store key version** for rotation support

**Key Backup & Recovery**:
- **Social/Email login**: Web3Auth handles recovery (user can re-authenticate)
- **External wallet**: User manages recovery (seed phrase, hardware wallet)
- **Encryption keys**: Derived on-demand, not stored (except key version metadata)

---

## 3. Personal Vault Architecture

### 3.1 Vault Storage Options

#### Option A: Local-First (User's Device)
```
User Device
┌─────────────────────────────────┐
│  Local Storage                  │
│  - IndexedDB / File System      │
│  - Encrypted at rest            │
│  - User controls location       │
└─────────────────────────────────┘
```

**Pros**:
- Full user control
- No cloud dependency
- Fast access
- Privacy by default

**Cons**:
- Limited to single device
- User responsible for backups
- No cross-device sync (without additional setup)

#### Option B: User-Controlled Cloud Storage
```
User's Cloud Storage Account
┌─────────────────────────────────┐
│  (e.g., Dropbox, Google Drive,  │
│   S3, IPFS, etc.)                │
│  - Encrypted before upload      │
│  - User controls account        │
│  - Canopi never sees plaintext  │
└─────────────────────────────────┘
```

**Pros**:
- Cross-device sync
- User controls storage provider
- Scalable
- Backup handled by provider

**Cons**:
- Requires user cloud account
- Potential sync costs
- Dependency on third-party storage

#### Option C: Hybrid (Local + Cloud Sync)
```
┌─────────────────┐         ┌─────────────────┐
│  Local Storage  │ ◄─────► │  Cloud Storage  │
│  (Primary)      │  Sync   │  (Backup/Sync)  │
└─────────────────┘         └─────────────────┘
```

**Pros**:
- Best of both worlds
- Fast local access
- Cloud backup/sync
- User controls both

**Cons**:
- More complex
- Sync management needed

### 3.2 Vault Data Structure

```typescript
interface PersonalVault {
  // Vault metadata (wallet address = vault ID)
  vaultId: string;              // Same as walletAddress
  walletAddress: string;         // User's wallet address (identity)
  createdAt: Date;
  lastSynced: Date;
  
  // Encrypted data stores
  messages: EncryptedStore<Message[]>;
  conversations: EncryptedStore<Conversation[]>;
  webTraffic: EncryptedStore<PageVisit[]>;
  canopiActivities: EncryptedStore<Activity[]>;
  moduleData: EncryptedStore<Record<string, any>>;
  timeline: EncryptedStore<TimelineEntry[]>;
  presence: EncryptedStore<PresenceData>;
  
  // Access control
  accessLog: AccessLogEntry[];   // Includes wallet signatures
  permissions: PermissionGrant[]; // Signed permissions
  
  // Integration data
  personalAIConnections: AIConnection[];
  dataCooperativeMemberships: CooperativeMembership[];
}
```

### 3.3 Data Encryption Flow

```
┌─────────────────────────────────────────────────┐
│  1. User Action (e.g., send message)           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  2. Canopi Client Requests Access               │
│     - Request: "Write message to vault"         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  3. User Approval (if required)                │
│     - User sees: "Canopi wants to store message"│
│     - User approves/denies                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  4. Encryption                                  │
│     - Get user key (from keychain/wallet)       │
│     - Derive message key                        │
│     - Encrypt message data                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  5. Store in Personal Vault                     │
│     - Encrypted data → Vault storage            │
│     - Update access log                         │
└─────────────────────────────────────────────────┘
```

---

## 4. Access Control & Approval System

### 4.1 Approval Model

**Core Principle**: All data access requires explicit user approval (unless pre-approved via permissions).

```typescript
interface AccessRequest {
  requester: string;              // "canopi-host" | "module-id" | "personal-ai-id"
  action: AccessAction;           // "read" | "write" | "delete" | "export"
  dataType: DataType;             // "messages" | "timeline" | "web-traffic" | etc.
  scope: DataScope;               // Specific items or "all"
  reason?: string;                // Why access is needed
  timestamp: Date;
}

interface AccessApproval {
  requestId: string;
  approved: boolean;
  grantedPermissions: Permission[];
  expiresAt?: Date;               // Optional expiration
  conditions?: ApprovalCondition[]; // Optional conditions
}
```

### 4.2 Permission Types

```typescript
type Permission = 
  | 'messages:read'
  | 'messages:write'
  | 'messages:delete'
  | 'timeline:read'
  | 'timeline:write'
  | 'web-traffic:read'
  | 'web-traffic:write'
  | 'canopi-activities:read'
  | 'canopi-activities:write'
  | 'module-data:read'
  | 'module-data:write'
  | 'vault:export'
  | 'vault:delete'
  | 'personal-ai:access'
  | 'cooperative:share';
```

### 4.3 Approval UI Flow

```
┌─────────────────────────────────────────┐
│  Access Request                          │
├─────────────────────────────────────────┤
│                                          │
│  Canopi wants to:                        │
│  ✓ Read your messages                   │
│  ✓ Store new message                    │
│                                          │
│  Reason:                                │
│  "Display messages in sidebar"          │
│                                          │
│  Duration:                              │
│  [ ] One-time only                      │
│  [✓] Until revoked                      │
│  [ ] For 1 hour                         │
│                                          │
│  [Approve] [Deny] [Customize]           │
└─────────────────────────────────────────┘
```

### 4.4 Persistent Permissions

Users can grant persistent permissions that don't require approval for each request:

```typescript
interface PersistentPermission {
  requester: string;
  permissions: Permission[];
  grantedAt: Date;
  expiresAt?: Date;
  conditions: {
    requireExplicitApprovalFor: Permission[];  // Still require approval for sensitive actions
    maxDataScope: DataScope;                    // Limit scope
  };
}
```

---

## 5. Data Storage: All Activities to Vault

### 5.1 What Goes to Vault

**All of the following are stored in user's personal vault**:

1. **Web Traffic**
   - Page visits (URLs, titles, timestamps)
   - Time spent on pages
   - Scroll position, interactions
   - Form data (if user opts in)
   - Screenshots (if user opts in)

2. **Canopi Activities**
   - Messages sent/received
   - Conversations created
   - Reactions, bookmarks
   - Shared content
   - Module interactions
   - Timeline entries
   - Presence status changes

3. **Module Data**
   - Module-specific storage
   - Module configurations
   - Module-generated data
   - Module telemetry (if user approves)

4. **Metadata**
   - Relationships between data
   - Timestamps
   - Access logs
   - Permission grants

### 5.2 Data Flow: Web Traffic Capture

```
┌─────────────────────────────────────────────────┐
│  User Browsing Web                               │
│  - Visits example.com                           │
│  - Scrolls, clicks, interacts                   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Canopi Extension Captures                      │
│  - Page URL, title                              │
│  - Timestamp                                    │
│  - Interactions (if enabled)                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Request Vault Access                           │
│  "Store web traffic data"                       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  User Approval (if first time)                  │
│  "Canopi wants to store web traffic"            │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Encrypt & Store in Personal Vault              │
│  - Encrypt with web-traffic key                 │
│  - Store in vault                               │
│  - Update access log                            │
└─────────────────────────────────────────────────┘
```

### 5.3 Data Organization in Vault

```
Personal Vault
├── messages/
│   ├── conversations/
│   │   ├── conv-123.encrypted
│   │   └── conv-456.encrypted
│   └── index.encrypted
├── web-traffic/
│   ├── 2024/
│   │   ├── 01/
│   │   │   ├── 15.encrypted
│   │   │   └── 16.encrypted
│   │   └── index.encrypted
│   └── index.encrypted
├── canopi-activities/
│   ├── timeline.encrypted
│   ├── presence.encrypted
│   └── interactions.encrypted
├── modules/
│   ├── module-abc/
│   │   └── data.encrypted
│   └── module-xyz/
│       └── data.encrypted
└── metadata/
    ├── access-log.encrypted
    ├── permissions.encrypted
    └── vault-config.encrypted
```

---

## 6. Personal AI Integration

### 6.1 Personal AI Access Model

Users can connect their personal AI to their vault for analysis, insights, and assistance:

```typescript
interface PersonalAIConnection {
  aiId: string;
  aiName: string;
  aiProvider: string;              // "openai", "anthropic", "local", etc.
  permissions: Permission[];
  approvedAt: Date;
  lastAccess: Date;
  accessPattern: {
    readOnly: boolean;             // AI can only read, not modify
    dataTypes: DataType[];         // Which data types AI can access
    purpose: string;               // "analysis", "assistance", "search"
  };
}
```

### 6.2 Personal AI Use Cases

1. **Data Analysis**
   - Analyze message patterns
   - Identify trends in web browsing
   - Generate insights from timeline

2. **Search & Retrieval**
   - Semantic search across vault
   - "Find that conversation about X"
   - "What did I read about Y last week?"

3. **Assistance**
   - Help compose messages
   - Suggest based on history
   - Answer questions about user's data

4. **Privacy-Preserving AI**
   - AI runs locally or on user-controlled infrastructure
   - Data never leaves user's control
   - User can revoke AI access at any time

### 6.3 Personal AI Approval Flow

```
┌─────────────────────────────────────────┐
│  Connect Personal AI                    │
├─────────────────────────────────────────┤
│                                          │
│  AI Name: Claude                        │
│  Provider: Anthropic                    │
│                                          │
│  This AI wants to:                      │
│  ✓ Read your messages                   │
│  ✓ Read your timeline                   │
│  ✗ Write data (read-only)               │
│                                          │
│  Purpose:                               │
│  "Help you search and analyze your data"│
│                                          │
│  [Connect] [Cancel]                     │
└─────────────────────────────────────────┘
```

---

## 7. Data Cooperatives

### 7.1 Data Cooperative Concept

Data cooperatives allow users to pool anonymized/aggregated data for collective benefit while maintaining individual control:

```typescript
interface DataCooperative {
  cooperativeId: string;
  name: string;
  purpose: string;                  // "research", "insights", "collective-bargaining"
  membershipType: 'opt-in' | 'opt-out';
  
  dataSharing: {
    dataTypes: DataType[];
    anonymizationLevel: 'none' | 'pseudonymized' | 'aggregated' | 'fully-anonymous';
    aggregationMethod?: string;     // How data is aggregated
  };
  
  governance: {
    memberVoting: boolean;
    dataUsagePolicies: string[];
    profitSharing?: boolean;
  };
}
```

### 7.2 Cooperative Data Sharing

```
User's Personal Vault
┌─────────────────────────────────┐
│  User Data (Encrypted)          │
└──────────────┬──────────────────┘
               │
               │ (User-approved sharing)
               ▼
┌─────────────────────────────────┐
│  Anonymization/Aggregation       │
│  - Remove PII                    │
│  - Aggregate patterns            │
│  - Pseudonymize identifiers      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Data Cooperative Pool           │
│  - Aggregated insights           │
│  - Pattern analysis              │
│  - Collective benefits           │
└─────────────────────────────────┘
```

### 7.3 Cooperative Benefits

1. **Collective Insights**
   - "Users like you also..."
   - Trend analysis
   - Pattern recognition

2. **Collective Bargaining**
   - Negotiate better terms with services
   - Data monetization (if user chooses)
   - Shared benefits

3. **Research**
   - Contribute to research (anonymized)
   - Scientific insights
   - Public good

4. **User Control**
   - Opt-in/opt-out anytime
   - Choose what to share
   - See how data is used

---

## 8. Data Portability & Deletion

### 8.1 Data Export

**Full Export**:
```typescript
interface VaultExport {
  format: 'json' | 'sql' | 'csv' | 'encrypted';
  scope: {
    messages: boolean;
    webTraffic: boolean;
    canopiActivities: boolean;
    moduleData: boolean;
    timeline: boolean;
    metadata: boolean;
  };
  encryption: {
    encrypted: boolean;
    keyProvided: boolean;          // User provides key for encrypted export
  };
}
```

**Export Process**:
1. User requests export
2. System decrypts requested data (using user key)
3. Formats data according to requested format
4. Provides download or transfer to user-specified location
5. Logs export in access log

### 8.2 Data Deletion

**Deletion Options**:
```typescript
interface DeletionRequest {
  scope: 'all' | 'messages' | 'web-traffic' | 'module-data' | 'specific';
  specificItems?: string[];         // For 'specific' scope
  cascade: boolean;                 // Delete related data
  confirm: boolean;                 // User confirmation required
}
```

**Deletion Process**:
1. User requests deletion
2. System shows what will be deleted
3. User confirms
4. System deletes encrypted data from vault
5. System deletes encryption keys (if user requests)
6. System logs deletion
7. System confirms deletion completion

**Permanent Deletion**:
- Data removed from vault
- Encryption keys deleted (if requested)
- No recovery possible
- Confirmation provided to user

---

## 9. Technical Architecture: TypeScript & ES6 Modules

### 9.1 Module Structure

```
canopi-vault/
├── src/
│   ├── core/
│   │   ├── VaultClient.ts          // Main vault client
│   │   ├── EncryptionService.ts    // Encryption/decryption
│   │   └── KeyManager.ts           // Key management
│   ├── access/
│   │   ├── ApprovalManager.ts      // Approval system
│   │   ├── PermissionManager.ts    // Permission management
│   │   └── AccessLogger.ts        // Access logging
│   ├── storage/
│   │   ├── VaultStorage.ts         // Vault storage interface
│   │   ├── LocalStorage.ts        // Local storage implementation
│   │   ├── CloudStorage.ts        // Cloud storage implementation
│   │   └── HybridStorage.ts       // Hybrid storage implementation
│   ├── integrations/
│   │   ├── PersonalAI.ts           // Personal AI integration
│   │   └── DataCooperative.ts      // Data cooperative integration
│   ├── types/
│   │   ├── VaultTypes.ts           // Core types
│   │   ├── EncryptionTypes.ts      // Encryption types
│   │   └── AccessTypes.ts          // Access control types
│   └── utils/
│       ├── CryptoUtils.ts          // Cryptographic utilities
│       └── ValidationUtils.ts      // Validation utilities
├── package.json
├── tsconfig.json
└── README.md
```

### 9.2 Core Interfaces (TypeScript)

```typescript
// Core Vault Client Interface
export interface VaultClient {
  // Authentication (Web3Auth)
  authenticate(loginMethod: 'social' | 'email' | 'wallet'): Promise<WalletIdentity>;
  getCurrentUser(): Promise<WalletIdentity | null>;
  logout(): Promise<void>;
  
  // Vault management
  initialize(config: VaultConfig): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Data operations (require approval)
  requestAccess(request: AccessRequest): Promise<AccessApproval>;
  read<T>(dataType: DataType, scope: DataScope, approval?: AccessApproval): Promise<T>;
  write<T>(dataType: DataType, data: T, approval?: AccessApproval): Promise<void>;
  delete(dataType: DataType, scope: DataScope, approval?: AccessApproval): Promise<void>;
  
  // Export/Import
  export(options: ExportOptions): Promise<Blob>;
  import(data: Blob, options: ImportOptions): Promise<void>;
  
  // Key management
  getKeyManager(): KeyManager;
  
  // Access control
  getApprovalManager(): ApprovalManager;
  getPermissionManager(): PermissionManager;
}

// Wallet Identity (from Web3Auth)
export interface WalletIdentity {
  walletAddress: string;          // User's wallet address (identity)
  web3AuthUser: {
    email?: string;
    name?: string;
    profileImage?: string;
    verifier: string;              // "google", "twitter", "email", etc.
    verifierId: string;
  };
  privateKey?: string;             // Available if Web3Auth provides it
}

// Key Manager Interface (Web3Auth-based)
export interface KeyManager {
  // Wallet-based key derivation
  deriveMasterKey(walletAddress: string, privateKey?: string): Promise<EncryptionKey>;
  deriveKey(purpose: string): Promise<EncryptionKey>;
  rotateKey(): Promise<void>;
  
  // Key info (keys are derived, not stored)
  getKeyVersion(): number;
  getWalletAddress(): string;
  
  // Web3Auth integration
  getWeb3AuthInstance(): Web3Auth;
  isAuthenticated(): Promise<boolean>;
}

// Approval Manager Interface (Wallet Signature-based)
export interface ApprovalManager {
  // Request approval (requires wallet signature)
  requestApproval(request: AccessRequest): Promise<AccessApproval>;
  signApproval(request: AccessRequest): Promise<string>;  // Returns signature
  verifyApproval(approval: AccessApproval): Promise<boolean>;  // Verify signature
  
  checkApproval(requestId: string): Promise<AccessApproval | null>;
  revokeApproval(approvalId: string): Promise<void>;
  
  // Persistent permissions (also signed)
  grantPermission(permission: PersistentPermission, signature: string): Promise<void>;
  revokePermission(permissionId: string, signature: string): Promise<void>;
  listPermissions(): Promise<PersistentPermission[]>;
}

// Storage Interface
export interface VaultStorage {
  store(key: string, encryptedData: Uint8Array): Promise<void>;
  retrieve(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  
  // Sync (for cloud/hybrid)
  sync(): Promise<void>;
  getSyncStatus(): Promise<SyncStatus>;
}
```

### 9.3 ES6 Module Exports

```typescript
// Main entry point
export { VaultClient } from './core/VaultClient';
export { KeyManager } from './core/KeyManager';
export { EncryptionService } from './core/EncryptionService';

// Access control
export { ApprovalManager } from './access/ApprovalManager';
export { PermissionManager } from './access/PermissionManager';

// Storage
export { VaultStorage, LocalStorage, CloudStorage, HybridStorage } from './storage';

// Integrations
export { PersonalAIClient } from './integrations/PersonalAI';
export { DataCooperativeClient } from './integrations/DataCooperative';

// Types
export type {
  VaultConfig,
  AccessRequest,
  AccessApproval,
  Permission,
  DataType,
  DataScope,
  EncryptionKey,
  KeyStorage,
  WalletProvider,
  ExportOptions,
  ImportOptions,
} from './types';
```

### 9.4 Usage Example (TypeScript)

```typescript
import { VaultClient, VaultConfig, AccessRequest } from '@canopi/vault';
import { Web3Auth } from '@web3auth/modal';

// Initialize vault client
const vault = new VaultClient();

// Initialize Web3Auth
const web3auth = new Web3Auth({
  clientId: 'YOUR_WEB3AUTH_CLIENT_ID',
  chainConfig: {
    chainNamespace: 'eip155',
    chainId: '0x1',  // Ethereum mainnet (or testnet)
  },
  web3AuthNetwork: 'sapphire_mainnet',
});

// Authenticate user via Web3Auth
await vault.authenticate('social');  // or 'email' or 'wallet'
const user = await vault.getCurrentUser();
console.log('Wallet address:', user.walletAddress);

const config: VaultConfig = {
  storage: {
    type: 'hybrid',
    local: { type: 'indexeddb' },
    cloud: { 
      type: 's3',
      bucket: 'user-vault-bucket',
      credentials: userCredentials
    }
  },
  web3Auth: web3auth,  // Web3Auth instance
  approvalRequired: true
};

await vault.initialize(config);
await vault.connect();

// Request access to store a message
const request: AccessRequest = {
  requester: 'canopi-host',
  action: 'write',
  dataType: 'messages',
  scope: { conversationId: 'conv-123' },
  reason: 'Store new message in conversation',
  timestamp: new Date(),
  nonce: generateNonce()
};

// Request approval (user signs with wallet)
const approval = await vault.requestApproval(request);
// Approval includes wallet signature for verification

if (approval.approved && approval.signature) {
  // Verify signature before proceeding
  const isValid = await vault.getApprovalManager().verifyApproval(approval);
  if (isValid) {
    await vault.write('messages', messageData, approval);
  }
}

// Personal AI integration
const personalAI = vault.getPersonalAIClient();
await personalAI.connect({
  aiProvider: 'anthropic',
  permissions: ['messages:read', 'timeline:read'],
  readOnly: true
});

// Export data
const exportData = await vault.export({
  format: 'json',
  scope: { messages: true, timeline: true }
});
```

---

## 10. Implementation Phases

### Phase 1: Web3Auth Integration & Core Vault (Months 1-2)
- [ ] Web3Auth integration
- [ ] Wallet address as identity
- [ ] Key derivation from wallet
- [ ] Encryption service
- [ ] Basic vault storage (local-first)
- [ ] TypeScript module structure

### Phase 2: Wallet Signature-Based Approval (Months 2-3)
- [ ] Approval/request system with wallet signatures
- [ ] Signature verification
- [ ] Approval UI with wallet signing
- [ ] Access logging with signatures

### Phase 3: Storage & Sync (Months 3-4)
- [ ] Cloud storage integration
- [ ] Hybrid storage (local + cloud)
- [ ] Sync mechanism
- [ ] Conflict resolution
- [ ] Vault identified by wallet address

### Phase 4: Access Control (Months 4-5)
- [ ] Permission management (signed permissions)
- [ ] Persistent permissions
- [ ] Access logging
- [ ] Approval UI enhancements

### Phase 5: Data Capture (Months 5-6)
- [ ] Web traffic capture
- [ ] Canopi activities capture
- [ ] Module data storage
- [ ] Timeline data storage

### Phase 6: Integrations (Months 6-7)
- [ ] Personal AI integration
- [ ] Data cooperative support
- [ ] Export/import functionality
- [ ] Deletion functionality

---

## 11. Security Considerations

### 11.1 Encryption Standards
- **Algorithm**: AES-256-GCM for symmetric encryption
- **Key Derivation**: HKDF-SHA-256 for key derivation
- **Key Exchange**: ECDH (if needed for sharing)
- **Hashing**: SHA-256 for integrity

### 11.2 Key Security
- Keys never leave user's control (or custodial wallet)
- Keys encrypted at rest
- Key rotation support
- Secure key backup/recovery

### 11.3 Access Security
- All access logged
- Approval required for sensitive operations
- Time-limited permissions
- Revocable permissions

### 11.4 Storage Security
- Data encrypted before storage
- Encrypted in transit
- Secure deletion
- No plaintext storage

---

## 12. Open Questions

### 12.1 Technical
1. **Vault Storage Provider**: Which storage backends to support initially?
2. **Sync Strategy**: How to handle conflicts in hybrid storage?
3. **Performance**: How to maintain performance with encryption on every operation?
4. **Web3Auth Configuration**: Which Web3Auth network and chain to use?
5. **Key Derivation**: Private key access vs address+secret derivation?
6. **Signature Standard**: EIP-191, EIP-712, or custom message format?

### 12.2 User Experience
1. **Approval Frequency**: How often should users need to sign approvals?
2. **Web3Auth Login UX**: Which login methods to prioritize?
3. **Wallet Signing UX**: How to make wallet signing seamless?
4. **Vault Location**: How to help users choose storage location?
5. **Migration**: How to migrate existing Canopi data to vault?
6. **Social Login Flow**: How to explain wallet generation to non-Web3 users?

### 12.3 Business
1. **Web3Auth Plan**: Which Web3Auth plan/tier to use?
2. **Chain Selection**: Which blockchain network (mainnet vs testnet)?
3. **Data Cooperatives**: Which cooperatives to support initially?
4. **Personal AI**: Which AI providers to integrate?
5. **Pricing**: How to monetize while maintaining user control?
6. **Gas Costs**: Who pays for on-chain operations (if any)?

---

## 13. Next Steps

1. **Review & Refine**: Review this architecture with stakeholders
2. **Web3Auth Setup**: Set up Web3Auth account and configure
3. **Technical Proof of Concept**: Build minimal vault client with Web3Auth
4. **Key Derivation POC**: Test key derivation from wallet
5. **Signature POC**: Test wallet signature-based approvals
6. **Storage POC**: Test storage backends
7. **User Research**: Understand user needs for Web3Auth login flows
8. **Security Audit**: Review security architecture (especially key derivation)
9. **Implementation Planning**: Create detailed implementation plan

---

**Document Status**: Design Phase  
**Last Updated**: 2024-01-XX  
**Owner**: Product Management  
**Reviewers**: Engineering, Security, UX


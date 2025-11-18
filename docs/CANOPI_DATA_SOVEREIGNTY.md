# Canopi Data Sovereignty - Strategic Discussion

## Executive Summary

This document outlines data sovereignty considerations for the Canopi platform, addressing user control, data location, access rights, and compliance requirements. As Canopi enables third-party modules to access user data through the SDK, establishing clear data sovereignty principles is critical.

**⚠️ ARCHITECTURE UPDATE**: This document has been superseded by the [Personal Vault Architecture](./CANOPI_PERSONAL_VAULT_ARCHITECTURE.md), which implements a user-controlled vault system where:
- **All data stored in user's personal vault** (encrypted with user keys)
- **User maintains keys OR uses custodial wallet**
- **User must approve all data access requests**
- **All web traffic and Canopi activities go to personal vault**
- **Integration with personal AI and data cooperatives**
- **Full data portability and deletion**

See the Personal Vault Architecture document for the complete technical design.

---

## 1. Current Data Architecture

### 1.1 Data Types in Canopi

Based on the current architecture, Canopi handles several categories of data:

#### User Data
- **User Profile**: Identity, preferences, settings
- **Authentication**: Session tokens, credentials
- **User Preferences**: Theme, UI settings, module configurations

#### Content Data
- **Messages & Chat**: Conversation history, message content, reactions, bookmarks
- **Timeline Data**: User activity, page visits, interactions
- **Anchored Messages**: Messages linked to specific page content
- **Shared Content**: Shared pages, conversations via `share.canopi.live`

#### Module Data
- **Module Storage**: Local and sync storage per module (namespaced by module ID)
- **Module Configurations**: Settings, preferences per installed module
- **Module Telemetry**: Diagnostic data, error reports

#### Metadata
- **Page Context**: URLs, page titles, timestamps
- **Presence Data**: User online/offline status, visibility
- **Reactions**: Emoji reactions, bookmarks on messages

### 1.2 Target Architecture: Personal Vault System

**⚠️ NEW ARCHITECTURE**: The target architecture moves to a **Personal Vault** model where all data is stored in the user's own vault, encrypted with user-controlled keys.

```
┌─────────────────────────────────────────────────┐
│           User's Personal Vault                  │
│        (User-Controlled Storage)                 │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐   │
│  │ Encryption Layer (User Keys)             │   │
│  │ - Self-custody OR custodial wallet       │   │
│  └──────────────────────────────────────────┘   │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │ All Data (Encrypted)                      │   │
│  │ - Messages & conversations                │   │
│  │ - Web traffic & page visits               │   │
│  │ - Canopi activities                       │   │
│  │ - Module data                             │   │
│  │ - Timeline & presence                      │   │
│  └──────────────────────────────────────────┘   │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │ Access Control (Approval Required)        │   │
│  │ - User must approve all access            │   │
│  │ - Permission management                   │   │
│  │ - Audit logging                           │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                    ▲
                    │ (Encrypted, Approved Access)
                    │
┌───────────────────┴───────────────────────────┐
│         Canopi Platform (Client)                │
│  - Canopi Host                                  │
│  - Modules (via SDK)                           │
│  - Personal AI Integration                      │
│  - Data Cooperative Integration                 │
└─────────────────────────────────────────────────┘
```

**Key Principles**:
- ✅ **User-controlled keys**: User maintains keys OR uses custodial wallet
- ✅ **Personal vault**: All data in user's vault (local, cloud, or hybrid)
- ✅ **Approval required**: User must approve all data access
- ✅ **All activities captured**: Web traffic + Canopi activities → vault
- ✅ **Personal AI ready**: Vault accessible by user's personal AI
- ✅ **Data cooperatives**: Support for shared data pools
- ✅ **Portable & deletable**: Full export and deletion capabilities

See [Personal Vault Architecture](./CANOPI_PERSONAL_VAULT_ARCHITECTURE.md) for complete design.

### 1.3 Data Flow

1. **User → Canopi Host**: User interactions, messages, preferences
2. **Canopi Host → Backend**: Data synchronization, persistence
3. **Modules → SDK → Canopi Host**: Module data requests
4. **Canopi Host → Modules**: Data access via permissions
5. **Backend → External Services**: Shared content, integrations

---

## 2. Data Sovereignty Principles

### 2.1 Core Principles

#### User Ownership
- **Users own their data**: All user-generated content belongs to the user
- **User control**: Users should have granular control over what data is stored, where, and who can access it
- **Data portability**: Users can export all their data in standard formats
- **Data deletion**: Users can delete their data completely ("right to be forgotten")

#### Transparency
- **Clear data policies**: Users understand what data is collected, why, and how it's used
- **Module data access**: Users see which modules access which data
- **Data location**: Users know where their data is stored geographically
- **Third-party sharing**: Clear disclosure of any data sharing with third parties

#### Security & Privacy
- **Encryption**: Data encrypted at rest and in transit
- **Minimal data collection**: Only collect data necessary for functionality
- **Access controls**: Strict permission model for module data access
- **Audit trails**: Logging of data access and modifications

#### Compliance
- **GDPR compliance**: Right to access, rectification, erasure, portability
- **Regional regulations**: Compliance with local data protection laws
- **Data residency**: Options for data storage in specific regions
- **Breach notification**: Clear procedures for data breach handling

---

## 3. Critical Data Sovereignty Questions

### 3.1 Data Storage Location

**Question**: Where is user data physically stored?

**Current State**: 
- Backend appears to use Supabase (cloud-hosted)
- Local storage in browser
- Sync storage (location unclear)

**Considerations**:
- **Geographic location**: Which regions/countries?
- **Data residency requirements**: Some users/regions require data to stay in specific jurisdictions
- **Multi-region support**: Can users choose their data region?
- **Backup locations**: Where are backups stored?

**Recommendations**:
1. **Document current data locations** in user-facing privacy policy
2. **Offer regional data storage options** (EU, US, Asia-Pacific)
3. **Allow users to select data region** during onboarding
4. **Transparent data location indicators** in user settings

### 3.2 Third-Party Module Data Access

**Question**: How do third-party modules access user data, and what controls exist?

**Current State**:
- Modules access data via SDK with permission scopes
- Storage is namespaced per module
- Permission model exists but scope unclear

**Considerations**:
- **Module data access**: What data can modules read/write?
- **Module data ownership**: Who owns data created by modules?
- **Module data deletion**: What happens when a module is uninstalled?
- **Module data sharing**: Can modules send data to external services?
- **Module audit**: How do we audit what modules do with data?

**Recommendations**:
1. **Granular permission model**: 
   - `messages:read` - Read messages
   - `messages:write` - Create/edit messages
   - `user:profile:read` - Read user profile
   - `timeline:read` - Read timeline data
   - `storage:local` - Local storage (already exists)
   - `storage:sync` - Sync storage (already exists)
   - `data:export` - Export data
   - `data:delete` - Delete data

2. **Module data isolation**:
   - Module data clearly separated from core Canopi data
   - Module uninstall removes module data (with user confirmation)
   - Module data export available before uninstall

3. **Module transparency**:
   - Show users what permissions each module requests
   - Display module data access logs
   - Warn users when modules access sensitive data

4. **Module data policies**:
   - Require modules to declare data usage in manifest
   - Prohibit modules from sending data to external services without explicit user consent
   - Audit module behavior for compliance

### 3.3 Data Encryption

**Question**: Is user data encrypted, and who has access to encryption keys?

**Current State**: Unclear from documentation

**Considerations**:
- **Encryption at rest**: Is data encrypted in database/storage?
- **Encryption in transit**: TLS/HTTPS for all communications
- **End-to-end encryption**: Should messages be E2E encrypted?
- **Key management**: Who controls encryption keys?
- **Zero-knowledge architecture**: Can Canopi read user data if needed?

**Recommendations**:
1. **Encryption at rest**: All user data encrypted in database
2. **Encryption in transit**: TLS 1.3 for all API calls
3. **End-to-end encryption option**: 
   - Offer E2E encryption for messages (optional, user choice)
   - Users control their own encryption keys
   - Canopi cannot read E2E encrypted messages
4. **Key management**:
   - User-controlled keys for E2E encryption
   - Platform-managed keys for non-E2E data (with clear disclosure)

### 3.4 Data Portability

**Question**: Can users export all their data in a usable format?

**Current State**: No export functionality documented

**Considerations**:
- **Export formats**: JSON, CSV, SQL dump?
- **Export scope**: What data is included?
  - Messages
  - User profile
  - Module data
  - Timeline data
  - Shared content
- **Export frequency**: One-time or scheduled exports?
- **Import capability**: Can users import data back?

**Recommendations**:
1. **Comprehensive export**:
   - All user data in structured JSON format
   - Human-readable formats (CSV for messages, etc.)
   - Include metadata (timestamps, relationships)
   - Include module data (if user chooses)

2. **Export UI**:
   - User settings → Data & Privacy → Export Data
   - Select data types to export
   - Download or email export file
   - Scheduled exports (optional)

3. **Import capability**:
   - Allow users to import exported data
   - Useful for migration, backup restoration

### 3.5 Data Deletion

**Question**: Can users completely delete their data?

**Current State**: Unclear deletion process

**Considerations**:
- **Soft delete vs hard delete**: Is data truly deleted or just hidden?
- **Cascade deletion**: What happens to related data?
  - User messages in conversations
  - Shared content
  - Module data
  - Timeline entries
- **Backup retention**: How long are backups retained?
- **Third-party data**: Can users delete data shared with modules?
- **Deletion timeline**: How quickly is data deleted?

**Recommendations**:
1. **True deletion**:
   - Hard delete from primary database
   - Delete from backups within retention period
   - Clear audit trail of deletion

2. **Cascade options**:
   - Delete user account → delete all user data
   - Delete conversation → delete all messages in conversation
   - Delete message → delete reactions, bookmarks, etc.
   - Uninstall module → delete module data (with confirmation)

3. **Deletion UI**:
   - Clear deletion options in settings
   - Confirmation dialogs with data scope
   - Deletion timeline (e.g., "Data will be deleted within 30 days")

4. **GDPR compliance**:
   - Right to erasure ("right to be forgotten")
   - Deletion within 30 days of request
   - Confirmation of deletion

### 3.6 Data Sharing & Third-Party Services

**Question**: Is user data shared with third-party services, and under what conditions?

**Current State**: 
- Modules can potentially access data
- Shared content via `share.canopi.live`
- Unclear if data is shared with other services

**Considerations**:
- **Module data sharing**: Can modules send data to external APIs?
- **Analytics**: Is user data used for analytics?
- **Integrations**: What third-party services are integrated?
- **Advertising**: Is user data used for advertising?
- **Research**: Is anonymized data used for research?

**Recommendations**:
1. **Transparent data sharing**:
   - Clear privacy policy listing all third-party services
   - User consent for data sharing
   - Opt-out options where possible

2. **Module restrictions**:
   - Modules must declare external API usage in manifest
   - User consent required before module sends data externally
   - Audit module network requests

3. **Analytics**:
   - Anonymized analytics only
   - User opt-out option
   - Clear disclosure of analytics usage

4. **No advertising**:
   - Commit to not using user data for advertising
   - No sale of user data

---

## 4. Technical Implementation Considerations

### 4.1 Permission Model Enhancements

**Current**: Basic permission scopes exist

**Enhancements Needed**:
```typescript
// Enhanced permission model
interface PermissionScope {
  // Data access
  'messages:read': boolean;
  'messages:write': boolean;
  'messages:delete': boolean;
  'user:profile:read': boolean;
  'user:profile:write': boolean;
  'timeline:read': boolean;
  'timeline:write': boolean;
  
  // Storage
  'storage:local': boolean;
  'storage:sync': boolean;
  
  // Data sovereignty
  'data:export': boolean;  // NEW
  'data:delete': boolean;  // NEW
  'data:location:read': boolean;  // NEW - Know where data is stored
  
  // External sharing
  'external:api:request': boolean;  // NEW - Request to send data externally
}
```

### 4.2 Data Location API

**New SDK API**:
```typescript
// Allow users to query data location
const dataLocation = await canopi.data.getLocation();
// Returns: { region: 'eu-west-1', country: 'Ireland', provider: 'AWS' }

// Allow users to change data region (if supported)
await canopi.data.setRegion('eu-west-1');
```

### 4.3 Data Export API

**New SDK API**:
```typescript
// Export user data
const exportData = await canopi.data.export({
  includeMessages: true,
  includeProfile: true,
  includeTimeline: true,
  includeModuleData: false,  // User choice
  format: 'json' | 'csv'
});

// Download export
await canopi.data.downloadExport(exportData.id);
```

### 4.4 Data Deletion API

**New SDK API**:
```typescript
// Delete specific data
await canopi.data.delete({
  type: 'message' | 'conversation' | 'module-data' | 'all',
  id?: string,  // For specific items
  cascade: boolean  // Delete related data
});

// Delete account (requires confirmation)
await canopi.data.deleteAccount({
  confirm: true,
  reason?: string
});
```

### 4.5 Module Data Isolation

**Implementation**:
```typescript
// Module data is isolated
interface ModuleDataIsolation {
  // Module can only access its own storage
  storage: {
    local: StorageArea;  // Namespaced: `moduleId:key`
    sync: StorageArea;   // Namespaced: `moduleId:key`
  };
  
  // Module data access is logged
  audit: {
    logAccess(scope: string, dataType: string): void;
    getAccessLog(): AccessLog[];
  };
  
  // Module uninstall removes module data
  onUninstall: {
    exportData(): Promise<Blob>;  // Optional export before deletion
    deleteData(): Promise<void>;
  };
}
```

---

## 5. Compliance Requirements

### 5.1 GDPR (General Data Protection Regulation)

**Requirements**:
- ✅ Right to access: Users can request all their data
- ✅ Right to rectification: Users can correct their data
- ✅ Right to erasure: Users can delete their data
- ✅ Right to portability: Users can export their data
- ✅ Right to object: Users can object to data processing
- ✅ Data protection by design: Privacy built into architecture
- ✅ Data breach notification: Notify users within 72 hours

**Implementation Checklist**:
- [ ] Data export functionality
- [ ] Data deletion functionality
- [ ] Privacy policy
- [ ] Cookie consent (if applicable)
- [ ] Data processing agreements with third parties
- [ ] Data Protection Impact Assessment (DPIA)
- [ ] Data breach response plan

### 5.2 Regional Regulations

**Considerations**:
- **CCPA (California)**: Similar to GDPR, applies to California residents
- **PIPEDA (Canada)**: Canadian privacy law
- **LGPD (Brazil)**: Brazilian data protection law
- **Local laws**: Country-specific requirements

**Recommendations**:
- Design for highest standard (GDPR) to cover most cases
- Regional data storage options for compliance
- Localized privacy policies

---

## 6. User Experience Considerations

### 6.1 Privacy Settings UI

**Recommended Settings Page**:
```
┌─────────────────────────────────────────┐
│  Data & Privacy                         │
├─────────────────────────────────────────┤
│                                          │
│  Data Location                          │
│  ┌──────────────────────────────────┐  │
│  │ Region: [EU (Ireland) ▼]         │  │
│  │ Provider: AWS                     │  │
│  │ [Change Region]                   │  │
│  └──────────────────────────────────┘  │
│                                          │
│  Data Export                             │
│  ┌──────────────────────────────────┐  │
│  │ [Export All Data]                │  │
│  │ Last export: 2024-01-15          │  │
│  │ [Schedule Exports]               │  │
│  └──────────────────────────────────┘  │
│                                          │
│  Data Deletion                           │
│  ┌──────────────────────────────────┐  │
│  │ [Delete Account]                 │  │
│  │ [Delete All Messages]             │  │
│  │ [Delete Module Data]              │  │
│  └──────────────────────────────────┘  │
│                                          │
│  Module Permissions                      │
│  ┌──────────────────────────────────┐  │
│  │ Archive Assistant                 │  │
│  │   ✓ storage:local                │  │
│  │   ✓ messages:read                │  │
│  │   [Manage Permissions]            │  │
│  └──────────────────────────────────┘  │
│                                          │
│  Encryption                              │
│  ┌──────────────────────────────────┐  │
│  │ End-to-End Encryption: [Enable]   │  │
│  │ [Manage Encryption Keys]          │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 6.2 Module Installation Flow

**Enhanced Installation**:
1. User clicks "Install Module"
2. **Permission Request Screen**:
   ```
   Archive Assistant wants to:
   - Read your messages
   - Store data locally
   - Access your timeline
   
   [Allow] [Deny] [Customize Permissions]
   ```
3. User can customize permissions before installation
4. Installation proceeds with selected permissions

### 6.3 Data Access Transparency

**Module Activity Log**:
```
┌─────────────────────────────────────────┐
│  Module Activity                        │
├─────────────────────────────────────────┤
│  Archive Assistant                     │
│  ┌──────────────────────────────────┐  │
│  │ 2024-01-15 10:30                 │  │
│  │ Read 5 messages                  │  │
│  │ Stored data locally               │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 2024-01-15 09:15                 │  │
│  │ Accessed timeline data            │  │
│  └──────────────────────────────────┘  │
│  [View Full Log]                        │
└─────────────────────────────────────────┘
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Months 1-2)
- [ ] Document current data architecture
- [ ] Create privacy policy
- [ ] Implement data export API
- [ ] Implement data deletion API
- [ ] Add privacy settings UI

### Phase 2: Enhanced Permissions (Months 2-3)
- [ ] Enhance permission model
- [ ] Add module data access logging
- [ ] Implement module activity UI
- [ ] Add permission customization during installation

### Phase 3: Data Location (Months 3-4)
- [ ] Document data storage locations
- [ ] Implement data location API
- [ ] Add regional storage options (if needed)
- [ ] Add data location indicators in UI

### Phase 4: Encryption (Months 4-5)
- [ ] Implement encryption at rest
- [ ] Add E2E encryption option
- [ ] Implement key management
- [ ] Add encryption settings UI

### Phase 5: Compliance (Months 5-6)
- [ ] GDPR compliance audit
- [ ] Data breach response plan
- [ ] DPIA (Data Protection Impact Assessment)
- [ ] Regional compliance review

---

## 8. Open Questions for Discussion

### 8.1 Strategic Questions

1. **Data Residency**: Do we need to offer regional data storage, or is single-region acceptable?
2. **E2E Encryption**: Should we offer end-to-end encryption, or is platform-managed encryption sufficient?
3. **Module Data Sharing**: Should modules be allowed to send data to external services, or should all data stay within Canopi?
4. **Data Retention**: How long should we retain deleted data in backups?
5. **Analytics**: What level of analytics is acceptable while maintaining privacy?

### 8.2 Technical Questions

1. **Encryption Keys**: Who manages encryption keys - users or platform?
2. **Data Export Format**: What format(s) should we support for data export?
3. **Module Audit**: How detailed should module data access logging be?
4. **Performance**: What performance impact will encryption and audit logging have?
5. **Backup Strategy**: How do we handle data sovereignty in backups?

### 8.3 Business Questions

1. **Compliance Cost**: What is the cost of full GDPR compliance?
2. **Regional Expansion**: Which regions are priority for data residency?
3. **Module Ecosystem**: How do data sovereignty requirements affect module developer experience?
4. **Competitive Advantage**: Can strong data sovereignty be a differentiator?
5. **User Trust**: How do we communicate data sovereignty to build user trust?

---

## 9. Recommendations Summary

### Immediate Actions (Next 30 Days)
1. ✅ **Document current state**: Complete audit of where data is stored
2. ✅ **Create privacy policy**: Clear, user-friendly privacy policy
3. ✅ **Implement data export**: Basic export functionality
4. ✅ **Implement data deletion**: Basic deletion functionality

### Short-term (Next 90 Days)
1. ✅ **Enhance permission model**: Add data sovereignty permissions
2. ✅ **Add privacy settings UI**: User-facing privacy controls
3. ✅ **Module data isolation**: Ensure module data is properly isolated
4. ✅ **Data access logging**: Log module data access

### Medium-term (Next 6 Months)
1. ✅ **Regional data storage**: Offer data residency options
2. ✅ **E2E encryption**: Optional end-to-end encryption
3. ✅ **GDPR compliance**: Full compliance audit and implementation
4. ✅ **Comprehensive audit**: Security and privacy audit

---

## 10. Next Steps

1. **Review Personal Vault Architecture** - See [CANOPI_PERSONAL_VAULT_ARCHITECTURE.md](./CANOPI_PERSONAL_VAULT_ARCHITECTURE.md)
2. **Architecture alignment** - This document's recommendations should align with Personal Vault architecture
3. **Technical design** - TypeScript/ES6 module implementation (design phase complete, ready for implementation)
4. **Key management strategy** - Decide on self-custody vs custodial wallet approach
5. **Storage backend selection** - Choose initial storage backends (local, cloud, hybrid)
6. **User research** - Understand user needs for key management and approval flows

---

## 11. Related Documents

- **[Personal Vault Architecture](./CANOPI_PERSONAL_VAULT_ARCHITECTURE.md)** - Complete technical design for user-controlled vault system
- **[Sidebar Tab SDK Status](./SIDEBAR_TAB_SDK_STATUS.md)** - Current SDK implementation status
- **[Store Architecture](./CANOPI_STORE_UNIFIED_ARCHITECTURE.md)** - Module distribution architecture

---

**Document Status**: Superseded by Personal Vault Architecture  
**Last Updated**: 2024-01-XX  
**Owner**: Product Management  
**Reviewers**: Engineering, Legal, Compliance, Security


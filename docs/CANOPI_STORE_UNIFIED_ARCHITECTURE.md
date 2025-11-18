# Canopi Store Unified Architecture

## Overview

The Canopi Store provides a unified distribution platform for all Canopi extension types:
- **Sidebar Tab SDK** - Custom tabs in the Canopi sidebar
- **Smart Tag SDK** - Interactive tags/annotations on web pages
- **Overlay Application SDK** - Overlay UI applications on web pages
- **Meta-Domain SDK** - Domain-specific meta-layer functionality

## Unified Store Benefits

### Advantages

1. **Single Distribution Infrastructure**
   - One store backend to maintain
   - Unified authentication and authorization
   - Consistent versioning and compatibility checking
   - Shared analytics and telemetry

2. **Developer Experience**
   - One place to publish all extension types
   - Unified developer portal and documentation
   - Consistent publishing workflow
   - Shared developer tools and validation

3. **User Experience**
   - Single discovery interface
   - Unified installation and management
   - Consistent permission model
   - Centralized updates

4. **Security & Compliance**
   - Unified security review process
   - Consistent signing and verification
   - Shared permission model
   - Centralized audit trail

5. **Operational Efficiency**
   - Shared CDN and hosting
   - Unified monitoring and alerting
   - Consistent backup and recovery
   - Single point of maintenance

### Considerations

1. **Type-Specific Requirements**
   - Different manifest schemas per type
   - Different lifecycle requirements
   - Different integration points
   - Different permission scopes

2. **Complexity Management**
   - Manifest schema needs type discriminator
   - Store UI needs filtering by type
   - Host needs type-specific loaders
   - Documentation needs type-specific sections

## Proposed Architecture

### Unified Manifest Schema

All extension types use a unified manifest format with a `type` discriminator:

```json
{
  "$schema": "https://canopi.store/schemas/manifest-v1.json",
  "manifestVersion": "1.0.0",
  
  // Type discriminator (required)
  "type": "sidebar-tab" | "smart-tag" | "overlay-app" | "meta-domain",
  
  // Common fields (all types)
  "id": "string",
  "name": "string",
  "version": "string",
  "description": "string",
  "author": { ... },
  "store": { ... },
  "sdk": { ... },
  "host": { ... },
  "entry": { ... },
  "permissions": { ... },
  "security": { ... },
  "telemetry": { ... },
  
  // Type-specific configuration
  "config": {
    // Type-specific fields based on "type" field
  }
}
```

### Manifest File Names

While the schema is unified, manifest files can have type-specific names for clarity:

- **Sidebar Tab**: `canopi-tab.json` (backward compatible)
- **Smart Tag**: `canopi-tag.json`
- **Overlay App**: `canopi-overlay.json`
- **Unified**: `canopi-manifest.json` (works for all types)

All names are valid and refer to the same schema.

### Type-Specific Configuration

#### Sidebar Tab (`type: "sidebar-tab"`)

```json
{
  "type": "sidebar-tab",
  "config": {
    "tab": {
      "id": "string",
      "title": "string",
      "icon": "string",
      "order": "number",
      "badge": { ... },
      "defaultOpen": "boolean",
      "persistent": "boolean"
    }
  }
}
```

#### Smart Tag (`type: "smart-tag"`)

```json
{
  "type": "smart-tag",
  "config": {
    "tag": {
      "id": "string",
      "name": "string",
      "icon": "string",
      "trigger": {
        "type": "selector" | "regex" | "function",
        "value": "string"
      },
      "placement": "inline" | "overlay" | "tooltip",
      "styling": {
        "color": "string",
        "icon": "string",
        "badge": "string"
      },
      "interactions": {
        "onClick": "string",
        "onHover": "string",
        "onSelect": "string"
      }
    }
  }
}
```

#### Overlay Application (`type: "overlay-app"`)

```json
{
  "type": "overlay-app",
  "config": {
    "overlay": {
      "id": "string",
      "name": "string",
      "trigger": {
        "type": "manual" | "auto" | "selector" | "url-pattern",
        "value": "string"
      },
      "position": "top" | "bottom" | "left" | "right" | "center" | "custom",
      "size": {
        "width": "string",
        "height": "string",
        "maxWidth": "string",
        "maxHeight": "string"
      },
      "modal": "boolean",
      "dismissible": "boolean",
      "zIndex": "number"
    }
  }
}
```

#### Meta-Domain (`type: "meta-domain"`)

```json
{
  "type": "meta-domain",
  "config": {
    "metaDomain": {
      "id": "string",
      "name": "string",
      "domains": {
        "patterns": ["string (URL patterns, e.g., *.amazon.com/*)"],
        "exact": ["string (exact domains, e.g., github.com)"],
        "selectors": ["string (CSS selectors to match pages)"]
      },
      "features": {
        "dataExtraction": {
          "enabled": "boolean",
          "selectors": {
            "key": "string (CSS selector)"
          },
          "transformations": ["string (data transformation functions)"]
        },
        "metaLayer": {
          "enabled": "boolean",
          "dataStructures": {
            "key": {
              "type": "string",
              "schema": "object (JSON schema)"
            }
          },
          "apis": {
            "endpoint": {
              "method": "string",
              "handler": "string (function name)"
            }
          }
        },
        "workflows": {
          "workflowId": {
            "name": "string",
            "triggers": ["string"],
            "steps": ["object"]
          }
        }
      },
      "integration": {
        "onPageLoad": "string (function name)",
        "onContentChange": "string (function name)",
        "onUserAction": {
          "selector": "string",
          "handler": "string (function name)"
        }
      }
    }
  }
}
```

## Store API Design

### Unified Endpoints

```typescript
// List all extensions (filterable by type)
GET /api/store/extensions?type=sidebar-tab|smart-tag|overlay-app|meta-domain&category=...&search=...

// Get extension details
GET /api/store/extensions/:id

// Install extension
POST /api/store/extensions/:id/install

// Update extension
PUT /api/store/extensions/:id/update

// Uninstall extension
DELETE /api/store/extensions/:id/uninstall

// Get installed extensions
GET /api/store/installed?type=...

// Check for updates
GET /api/store/updates?type=...
```

### Type-Specific Endpoints

```typescript
// Sidebar Tab specific
GET /api/store/extensions?type=sidebar-tab
POST /api/store/extensions/:id/tabs/:tabId/activate

// Smart Tag specific
GET /api/store/extensions?type=smart-tag
POST /api/store/extensions/:id/tags/:tagId/enable

// Overlay App specific
GET /api/store/extensions?type=overlay-app
POST /api/store/extensions/:id/overlays/:overlayId/show

// Meta-Domain specific
GET /api/store/extensions?type=meta-domain
POST /api/store/extensions/:id/domains/:domainId/enable
GET /api/store/extensions/:id/domains/:domainId/data
```

## Host Integration

### Unified Module Loader

```typescript
interface ModuleLoader {
  // Discover and load modules
  discoverModules(type?: ExtensionType): Promise<Extension[]>;
  loadModule(id: string): Promise<LoadedModule>;
  unloadModule(id: string): Promise<void>;
  
  // Type-specific loaders
  loadSidebarTab(id: string): Promise<SidebarTab>;
  loadSmartTag(id: string): Promise<SmartTag>;
  loadOverlayApp(id: string): Promise<OverlayApp>;
  loadMetaDomain(id: string): Promise<MetaDomain>;
}

interface Extension {
  id: string;
  type: 'sidebar-tab' | 'smart-tag' | 'overlay-app';
  manifest: Manifest;
  installed: boolean;
  enabled: boolean;
  version: string;
}
```

### Type-Specific Integration Points

#### Sidebar Tab Integration
- Registers with `SidebarTabManager`
- Renders in sidebar container
- Uses `canopi.tab` SDK namespace

#### Smart Tag Integration
- Registers with `SmartTagManager`
- Injects into page DOM
- Uses `canopi.tag` SDK namespace

#### Overlay App Integration
- Registers with `OverlayAppManager`
- Renders in overlay container
- Uses `canopi.overlay` SDK namespace

#### Meta-Domain Integration
- Registers with `MetaDomainManager`
- Matches domains via URL patterns or domain lists
- Injects domain-specific functionality
- Uses `canopi.meta` SDK namespace

## SDK Namespace Design

### Unified Core API

All SDK types share common APIs:

```typescript
// Common to all types
canopi.version
canopi.bridge
canopi.permissions
canopi.storage
canopi.user
canopi.theme
canopi.diagnostics
```

### Type-Specific APIs

```typescript
// Sidebar Tab SDK
canopi.tab.registerTab(config)
canopi.tab.setBadge(value)

// Smart Tag SDK
canopi.tag.registerTag(config)
canopi.tag.highlight(selector)
canopi.tag.showTooltip(content, position)

// Overlay App SDK
canopi.overlay.registerOverlay(config)
canopi.overlay.show(id)
canopi.overlay.hide(id)
canopi.overlay.setPosition(position)

// Meta-Domain SDK
canopi.meta.registerDomain(config)
canopi.meta.extractData(selectors)
canopi.meta.storeData(key, data)
canopi.meta.getData(key)
canopi.meta.triggerWorkflow(workflowId, context)
```

## Store UI Design

### Discovery Interface

```
┌─────────────────────────────────────────┐
│  Canopi Store                            │
├─────────────────────────────────────────┤
│  [All] [Sidebar Tabs] [Smart Tags]      │
│  [Overlay Apps] [Meta-Domains]          │
│                                          │
│  ┌──────────┐  ┌──────────┐            │
│  │ Tab 1    │  │ Tag 1    │            │
│  │ [Install]│  │ [Install]│            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │ Overlay 1│  │ Tab 2    │            │
│  │ [Install]│  │ [Install]│            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Management Interface

```
┌─────────────────────────────────────────┐
│  Installed Extensions                    │
├─────────────────────────────────────────┤
│  Sidebar Tabs (3)                       │
│  ├─ Archive Assistant [v1.0.0] [Update] │
│  ├─ Analytics Dashboard [v2.1.0]        │
│  └─ Developer Tools [v1.5.0] [Update]  │
│                                          │
│  Smart Tags (2)                          │
│  ├─ Code Highlighter [v1.2.0]          │
│  └─ Link Preview [v1.0.0] [Update]     │
│                                          │
│  Overlay Apps (1)                        │
│  └─ Quick Notes [v1.0.0]                │
│                                          │
│  Meta-Domains (2)                        │
│  ├─ Amazon Meta-Layer [v1.2.0]          │
│  └─ GitHub Enhancer [v2.0.0] [Update]  │
└─────────────────────────────────────────┘
```

## Migration Strategy

### Phase 1: Unified Schema
1. Extend existing `canopi-tab.json` schema to support `type` field
2. Add type-specific configuration sections
3. Maintain backward compatibility with existing tab manifests

### Phase 2: Store Unification
1. Extend store API to support all types
2. Update store UI with type filters
3. Migrate existing tab modules to unified format

### Phase 3: SDK Unification
1. Create unified SDK core
2. Add type-specific SDK namespaces
3. Update documentation

### Phase 4: Host Integration
1. Implement unified module loader
2. Add type-specific integration points
3. Update host UI for all types

## Benefits Summary

### For Developers
- ✅ One store to publish to
- ✅ Consistent workflow across all types
- ✅ Shared documentation and tools
- ✅ Unified versioning and updates

### For Users
- ✅ Single discovery interface
- ✅ Unified installation experience
- ✅ Consistent permission model
- ✅ Centralized management

### For Platform
- ✅ Single infrastructure to maintain
- ✅ Consistent security model
- ✅ Unified analytics
- ✅ Easier to extend with new types

## Recommendations

**✅ YES - Use Unified Store Approach**

**Rationale:**
1. All three SDK types share core requirements (distribution, security, versioning)
2. Unified infrastructure reduces operational overhead
3. Better developer and user experience
4. Easier to maintain and extend
5. Type-specific requirements can be handled via configuration

**Implementation:**
1. Start with unified manifest schema (add `type` discriminator)
2. Extend existing store infrastructure
3. Add type-specific configuration sections
4. Implement type-specific SDK namespaces
5. Update host with unified loader

**Considerations:**
- Manifest schema needs careful design to support all types
- Store UI needs good filtering and categorization
- Host needs type-specific integration points
- Documentation needs clear type-specific sections

## Next Steps

1. **Design unified manifest schema** with type discriminator
2. **Extend store API** to support all types
3. **Design type-specific configurations** for Smart Tag and Overlay App
4. **Plan SDK namespace structure** for unified core + type-specific APIs
5. **Design host integration** for unified loading with type-specific handlers


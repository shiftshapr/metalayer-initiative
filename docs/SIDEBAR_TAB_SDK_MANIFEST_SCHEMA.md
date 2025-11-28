# Sidebar Tab SDK Module Manifest Schema

## Overview

This document defines the manifest schema for Canopi Sidebar Tab modules distributed via the Canopi Store. The manifest (`canopi-tab.json`) describes a tab module's metadata, permissions, entry points, and configuration.

## Manifest File Location

- **File Name**: `canopi-tab.json`
- **Location**: Root of the module package
- **Format**: JSON (strict schema validation)

## Schema Definition

```json
{
  "$schema": "https://canopi.store/schemas/tab-manifest-v1.json",
  "manifestVersion": "1.0.0",
  
  // Core Module Metadata
  "id": "string (required, UUID or reverse-domain format)",
  "name": "string (required, human-readable name)",
  "version": "string (required, semver format: major.minor.patch)",
  "description": "string (required, brief description)",
  "author": {
    "name": "string (required)",
    "email": "string (optional)",
    "url": "string (optional)"
  },
  
  // Store Metadata
  "store": {
    "packageName": "string (required, unique store identifier)",
    "category": "string (required, one of: utility, productivity, archive, analytics, social, developer, other)",
    "tags": ["string (optional, array of tags for discovery)"],
    "icon": {
      "16": "string (required, path to 16x16 icon)",
      "48": "string (required, path to 48x48 icon)",
      "128": "string (required, path to 128x128 icon)"
    },
    "screenshots": ["string (optional, array of screenshot URLs)"],
    "homepage": "string (optional, module homepage URL)",
    "repository": "string (optional, source code repository URL)",
    "license": "string (optional, license identifier)"
  },
  
  // SDK Requirements
  "sdk": {
    "minimumVersion": "string (required, minimum SDK version required, semver)",
    "targetVersion": "string (optional, preferred SDK version, semver)",
    "compatibleVersions": ["string (optional, array of compatible SDK versions)"]
  },
  
  // Canopi Host Requirements
  "host": {
    "minimumVersion": "string (required, minimum Canopi host version, semver)",
    "requiredFeatures": ["string (optional, array of required feature flags)"]
  },
  
  // Tab Configuration
  "tab": {
    "id": "string (required, unique tab identifier within module)",
    "title": "string (required, display name in sidebar)",
    "icon": "string (required, icon identifier or SVG path)",
    "order": "number (optional, display order in sidebar, lower = earlier)",
    "position": "string (optional, sidebar position: 'left' | 'right', default: 'right')",
    "badge": {
      "enabled": "boolean (optional, default: false)",
      "type": "string (optional, one of: count, dot, text, default: count)"
    },
    "defaultOpen": "boolean (optional, open by default, default: false)",
    "persistent": "boolean (optional, keep open across page navigations, default: false)"
  },
  
  // Entry Points
  "entry": {
    "main": "string (required, path to main module entry point)",
    "styles": ["string (optional, array of CSS file paths)"],
    "assets": ["string (optional, array of asset paths or glob patterns)"]
  },
  
  // Permissions & Scopes
  "permissions": {
    "required": ["string (optional, array of required permission scopes)"],
    "optional": ["string (optional, array of optional permission scopes)"]
  },
  
  // Permission Scope Definitions
  "permissionScopes": {
    "scope_name": {
      "description": "string (required, human-readable description)",
      "required": "boolean (required, whether scope is required or optional)",
      "userPrompt": "string (optional, user-facing permission prompt text)"
    }
  },
  
  // Standard Permission Scopes
  // Available scopes:
  // - "archive:wayback" - Access to Wayback Machine archiving
  // - "archive:ipfs" - Access to IPFS archiving
  // - "archive:ordinals" - Access to Bitcoin Ordinals archiving (future)
  // - "network:fetch" - Make external network requests (via proxy)
  // - "storage:local" - Local storage access
  // - "storage:sync" - Sync storage access
  // - "user:profile" - Read user profile data
  // - "user:preferences" - Read/write user preferences
  // - "page:content" - Access to current page content
  // - "page:url" - Access to current page URL
  // - "diagnostics:read" - Read diagnostic data
  // - "diagnostics:write" - Write diagnostic data
  // - "timeline:read" - Read timeline data
  // - "timeline:write" - Write timeline data
  
  // Module Configuration
  "config": {
    "settings": {
      "setting_key": {
        "type": "string (required, one of: string, number, boolean, select, multiselect, json)",
        "label": "string (required, display label)",
        "description": "string (optional, help text)",
        "default": "any (optional, default value)",
        "required": "boolean (optional, default: false)",
        "options": ["any (optional, for select/multiselect types)"],
        "validation": {
          "min": "number (optional, for number type)",
          "max": "number (optional, for number type)",
          "pattern": "string (optional, regex pattern for string type)",
          "enum": ["any (optional, allowed values)"]
        }
      }
    }
  },
  
  // Lifecycle Hooks
  "lifecycle": {
    "onInit": "string (optional, function name or path to init handler)",
    "onActivate": "string (optional, function name or path to activate handler)",
    "onDeactivate": "string (optional, function name or path to deactivate handler)",
    "onDestroy": "string (optional, function name or path to destroy handler)"
  },
  
  // API Surface
  "apis": {
    "bridge": {
      "events": {
        "event_name": {
          "type": "string (required, event type: request|response|notification)",
          "direction": "string (required, one of: host->tab, tab->host, bidirectional)",
          "schema": "object (optional, JSON schema for event payload)"
        }
      }
    }
  },
  
  // Dependencies
  "dependencies": {
    "modules": ["string (optional, array of required module IDs)"],
    "external": {
      "package_name": {
        "version": "string (required, semver version range)",
        "cdn": "string (optional, CDN URL if not bundled)"
      }
    }
  },
  
  // Security & Signing
  "security": {
    "contentSecurityPolicy": {
      "scriptSrc": ["string (optional, CSP script-src directives)"],
      "connectSrc": ["string (optional, CSP connect-src directives)"],
      "styleSrc": ["string (optional, CSP style-src directives)"],
      "imgSrc": ["string (optional, CSP img-src directives)"]
    },
    "signedBy": "string (optional, signing authority identifier)",
    "signature": "string (optional, manifest signature for verification)"
  },
  
  // Telemetry & Diagnostics
  "telemetry": {
    "enabled": "boolean (optional, default: true)",
    "events": ["string (optional, array of telemetry event names to track)"],
    "diagnostics": {
      "enabled": "boolean (optional, default: true)",
      "level": "string (optional, one of: none, error, warn, info, debug, default: info)"
    }
  },
  
  // Localization
  "localization": {
    "defaultLocale": "string (optional, default: 'en')",
    "supportedLocales": ["string (optional, array of supported locale codes)"],
    "messages": {
      "locale": {
        "key": "string (optional, localized string mappings)"
      }
    }
  },
  
  // Build & Distribution
  "build": {
    "target": "string (optional, build target: es2015|es2017|es2020|esnext, default: es2017)",
    "minify": "boolean (optional, default: true)",
    "sourceMap": "boolean (optional, default: false)"
  },
  
  // Update & Versioning
  "updates": {
    "autoUpdate": "boolean (optional, default: true)",
    "updateUrl": "string (optional, custom update check URL)",
    "rollbackOnError": "boolean (optional, default: true)"
  }
}
```

## Example: Archive Assistant Manifest

```json
{
  "$schema": "https://canopi.store/schemas/tab-manifest-v1.json",
  "manifestVersion": "1.0.0",
  
  "id": "com.canopi.archive-assistant",
  "name": "Archive Assistant",
  "version": "1.0.0",
  "description": "Archive web pages to multiple archive services including Wayback Machine, IPFS, and Bitcoin Ordinals",
  "author": {
    "name": "Canopi Team",
    "email": "dev@canopi.org"
  },
  
  "store": {
    "packageName": "archive-assistant",
    "category": "archive",
    "tags": ["archive", "wayback", "ipfs", "ordinals", "preservation"],
    "icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    },
    "screenshots": [
      "https://canopi.store/screenshots/archive-assistant-1.png"
    ],
    "homepage": "https://canopi.org/extensions/archive-assistant",
    "repository": "https://github.com/canopi/archive-assistant",
    "license": "MIT"
  },
  
  "sdk": {
    "minimumVersion": "1.0.0",
    "targetVersion": "1.0.0"
  },
  
  "host": {
    "minimumVersion": "0.1.0",
    "requiredFeatures": ["sidebar-tabs", "archive-services"]
  },
  
  "tab": {
    "id": "archive",
    "title": "Archive",
    "icon": "archive-icon",
    "order": 10,
    "position": "right",
    "badge": {
      "enabled": true,
      "type": "count"
    },
    "defaultOpen": false,
    "persistent": false
  },
  
  "entry": {
    "main": "dist/index.js",
    "styles": ["dist/styles.css"],
    "assets": ["icons/**/*", "images/**/*"]
  },
  
  "permissions": {
    "required": [
      "archive:wayback",
      "archive:ipfs",
      "page:url",
      "page:content",
      "network:fetch"
    ],
    "optional": [
      "archive:ordinals",
      "storage:local",
      "user:preferences"
    ]
  },
  
  "permissionScopes": {
    "archive:wayback": {
      "description": "Archive pages to Internet Archive Wayback Machine",
      "required": true,
      "userPrompt": "Allow Archive Assistant to save pages to Wayback Machine?"
    },
    "archive:ipfs": {
      "description": "Archive pages to IPFS (InterPlanetary File System)",
      "required": true,
      "userPrompt": "Allow Archive Assistant to save pages to IPFS?"
    },
    "archive:ordinals": {
      "description": "Archive pages to Bitcoin Ordinals (future feature)",
      "required": false,
      "userPrompt": "Allow Archive Assistant to save pages to Bitcoin Ordinals?"
    },
    "network:fetch": {
      "description": "Make network requests to archive services",
      "required": true,
      "userPrompt": "Allow Archive Assistant to make network requests?"
    },
    "page:url": {
      "description": "Access current page URL for archiving",
      "required": true
    },
    "page:content": {
      "description": "Access current page content for archiving",
      "required": true
    }
  },
  
  "config": {
    "settings": {
      "defaultArchiveServices": {
        "type": "multiselect",
        "label": "Default Archive Services",
        "description": "Services to use by default when archiving",
        "default": ["wayback", "ipfs"],
        "options": [
          { "value": "wayback", "label": "Wayback Machine" },
          { "value": "ipfs", "label": "IPFS" },
          { "value": "ordinals", "label": "Bitcoin Ordinals" }
        ]
      },
      "autoArchive": {
        "type": "boolean",
        "label": "Auto-archive on page load",
        "description": "Automatically archive pages when they load",
        "default": false
      },
      "archiveDelay": {
        "type": "number",
        "label": "Archive Delay (seconds)",
        "description": "Delay before archiving (to allow page to fully load)",
        "default": 5,
        "validation": {
          "min": 0,
          "max": 60
        }
      },
      "waybackApiKey": {
        "type": "string",
        "label": "Wayback Machine API Key",
        "description": "Optional API key for Wayback Machine (for authenticated saves)",
        "required": false
      },
      "ipfsGateway": {
        "type": "select",
        "label": "IPFS Gateway",
        "description": "IPFS gateway to use for content retrieval",
        "default": "ipfs.io",
        "options": [
          { "value": "ipfs.io", "label": "ipfs.io" },
          { "value": "cloudflare-ipfs.com", "label": "Cloudflare IPFS" },
          { "value": "gateway.pinata.cloud", "label": "Pinata Gateway" }
        ]
      }
    }
  },
  
  "lifecycle": {
    "onInit": "initialize",
    "onActivate": "onTabActivated",
    "onDeactivate": "onTabDeactivated",
    "onDestroy": "cleanup"
  },
  
  "apis": {
    "bridge": {
      "events": {
        "archive:request": {
          "type": "request",
          "direction": "tab->host",
          "schema": {
            "type": "object",
            "properties": {
              "url": { "type": "string", "format": "uri" },
              "services": {
                "type": "array",
                "items": { "type": "string", "enum": ["wayback", "ipfs", "ordinals"] }
              },
              "options": {
                "type": "object",
                "properties": {
                  "captureScreenshot": { "type": "boolean" },
                  "captureResources": { "type": "boolean" },
                  "waitForLoad": { "type": "boolean" }
                }
              }
            },
            "required": ["url", "services"]
          }
        },
        "archive:response": {
          "type": "response",
          "direction": "host->tab",
          "schema": {
            "type": "object",
            "properties": {
              "requestId": { "type": "string" },
              "status": { "type": "string", "enum": ["success", "error", "pending"] },
              "results": {
                "type": "object",
                "properties": {
                  "wayback": {
                    "type": "object",
                    "properties": {
                      "url": { "type": "string" },
                      "timestamp": { "type": "string", "format": "date-time" }
                    }
                  },
                  "ipfs": {
                    "type": "object",
                    "properties": {
                      "cid": { "type": "string" },
                      "gatewayUrl": { "type": "string" }
                    }
                  },
                  "ordinals": {
                    "type": "object",
                    "properties": {
                      "inscriptionId": { "type": "string" },
                      "status": { "type": "string" }
                    }
                  }
                }
              },
              "error": { "type": "string" }
            }
          }
        },
        "archive:status": {
          "type": "notification",
          "direction": "host->tab",
          "schema": {
            "type": "object",
            "properties": {
              "requestId": { "type": "string" },
              "progress": { "type": "number", "minimum": 0, "maximum": 100 },
              "status": { "type": "string" },
              "service": { "type": "string" }
            }
          }
        }
      }
    }
  },
  
  "dependencies": {
    "modules": [],
    "external": {}
  },
  
  "security": {
    "contentSecurityPolicy": {
      "scriptSrc": ["'self'"],
      "connectSrc": [
        "'self'",
        "https://web.archive.org",
        "https://*.ipfs.io",
        "https://*.ipfs.dweb.link",
        "https://api.pinata.cloud"
      ],
      "styleSrc": ["'self'", "'unsafe-inline'"],
      "imgSrc": ["'self'", "data:", "https://web.archive.org", "https://*.ipfs.io"]
    }
  },
  
  "telemetry": {
    "enabled": true,
    "events": [
      "archive:requested",
      "archive:completed",
      "archive:failed",
      "settings:changed"
    ],
    "diagnostics": {
      "enabled": true,
      "level": "info"
    }
  },
  
  "localization": {
    "defaultLocale": "en",
    "supportedLocales": ["en", "es", "fr", "de"]
  },
  
  "build": {
    "target": "es2017",
    "minify": true,
    "sourceMap": false
  },
  
  "updates": {
    "autoUpdate": true,
    "rollbackOnError": true
  }
}
```

## Manifest Validation

### Required Fields

The following fields are **required** in all manifests:

1. `manifestVersion`
2. `id`
3. `name`
4. `version`
5. `description`
6. `author.name`
7. `store.packageName`
8. `store.category`
9. `store.icon` (all sizes: 16, 48, 128)
10. `sdk.minimumVersion`
11. `host.minimumVersion`
12. `tab.id`
13. `tab.title`
14. `tab.icon`
15. `entry.main`

### Validation Rules

1. **Version Format**: Must follow semantic versioning (semver) format: `major.minor.patch`
2. **ID Format**: Must be unique, either UUID or reverse-domain format (e.g., `com.canopi.module-name`)
3. **Package Name**: Must be unique in the store, lowercase, alphanumeric with hyphens only
4. **Icon Paths**: Must be relative to manifest file location
5. **Entry Point**: Must be a valid file path relative to manifest
6. **Permission Scopes**: All scopes in `permissions.required` and `permissions.optional` must be defined in `permissionScopes`
7. **SDK Version**: Must be a valid semver version string
8. **Host Version**: Must be a valid semver version string

### Store Validation

Before a module is published to the store, the manifest must pass:

1. **Schema Validation**: JSON Schema validation against the official schema
2. **Security Audit**: Content Security Policy and permission review
3. **Signature Verification**: Digital signature verification (if signed)
4. **Dependency Resolution**: All dependencies must be resolvable
5. **Icon Verification**: All icon files must exist and be valid images
6. **Entry Point Verification**: Main entry point file must exist and be loadable

## Version Compatibility

### SDK Version Compatibility

Modules declare their SDK requirements via `sdk.minimumVersion`. The host will:

1. Check if installed SDK version meets minimum requirement
2. Auto-update SDK if needed (if user allows)
3. Reject module load if SDK version is incompatible

### Host Version Compatibility

Modules declare their host requirements via `host.minimumVersion`. The host will:

1. Check if Canopi version meets minimum requirement
2. Show warning if host is older than required
3. Reject module load if host version is too old

## Permission Model

### Permission Scopes

Permissions are declared in two ways:

1. **Required Permissions**: Module cannot function without these
2. **Optional Permissions**: Module can function with reduced features if denied

### Permission Prompts

When a module requests a permission scope:

1. Host checks if scope is already granted
2. If not granted, shows user prompt (if `permissionScopes[scope].userPrompt` is defined)
3. User can grant or deny
4. Module receives permission status via SDK API

### Standard Permission Scopes

The following permission scopes are available:

- **Archive Scopes**:
  - `archive:wayback` - Wayback Machine access
  - `archive:ipfs` - IPFS access
  - `archive:ordinals` - Bitcoin Ordinals access (future)

- **Network Scopes**:
  - `network:fetch` - External network requests (via proxy)

- **Storage Scopes**:
  - `storage:local` - Local storage access
  - `storage:sync` - Sync storage access

- **User Scopes**:
  - `user:profile` - Read user profile
  - `user:preferences` - Read/write preferences

- **Page Scopes**:
  - `page:content` - Access page content
  - `page:url` - Access page URL

- **Data Scopes**:
  - `diagnostics:read` - Read diagnostic data
  - `diagnostics:write` - Write diagnostic data
  - `timeline:read` - Read timeline data
  - `timeline:write` - Write timeline data

## Module Distribution

### Store Package Structure

```
module-package/
├── canopi-tab.json          # Manifest file (required)
├── dist/
│   ├── index.js            # Main entry point
│   ├── styles.css          # Styles (if any)
│   └── ...
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── README.md               # Module documentation
└── package.json           # NPM package metadata (optional)
```

### Publishing to Store

1. **Prepare Package**: Bundle module according to structure
2. **Validate Manifest**: Run validation against schema
3. **Sign Package**: Generate digital signature (optional but recommended)
4. **Upload to Store**: Submit package to Canopi Store
5. **Review Process**: Store reviews manifest, security, and functionality
6. **Publication**: Module becomes available in store

### Update Process

1. **Version Bump**: Increment version in manifest
2. **Update Package**: Rebuild and package updated module
3. **Re-validate**: Run validation again
4. **Re-sign**: Generate new signature
5. **Upload Update**: Submit update to store
6. **Auto-Update**: Hosts with `updates.autoUpdate: true` will receive update automatically

## Integration with Canopi Host

### Module Discovery

The Canopi host discovers modules via:

1. **Store Registry**: Queries store for available modules
2. **Local Cache**: Checks locally installed modules
3. **User Installs**: Modules installed by user

### Module Loading

1. **Download**: Host downloads module package from store (if not cached)
2. **Verify**: Validates manifest and signature
3. **Check Dependencies**: Resolves SDK and module dependencies
4. **Load Entry Point**: Loads main entry point file
5. **Initialize**: Calls `lifecycle.onInit` if defined
6. **Register Tab**: Registers tab in sidebar

### Module Lifecycle

1. **Init**: `lifecycle.onInit` called when module is loaded
2. **Activate**: `lifecycle.onActivate` called when tab is opened
3. **Deactivate**: `lifecycle.onDeactivate` called when tab is closed
4. **Destroy**: `lifecycle.onDestroy` called when module is unloaded

## Security Considerations

### Content Security Policy

Modules must declare their CSP requirements in `security.contentSecurityPolicy`. The host will:

1. Merge module CSP with host CSP
2. Apply strictest policy (most restrictive)
3. Reject module if CSP conflicts cannot be resolved

### Signature Verification

If a module includes a signature:

1. Host verifies signature against signing authority
2. Rejects module if signature is invalid
3. Warns user if signature is missing (but allows if user approves)

### Permission Isolation

Modules run in isolated contexts:

1. Each module has its own JavaScript execution context
2. Permissions are scoped to declared scopes only
3. Network requests go through host proxy (if `network:fetch` granted)
4. Storage is namespaced per module

## Future Extensions

The manifest schema is designed to be extensible. Future versions may add:

- **Widget Support**: Modules that provide sidebar widgets instead of full tabs
- **Content Scripts**: Modules that inject content scripts into web pages
- **Background Workers**: Modules that run background tasks
- **API Extensions**: Modules that extend Canopi APIs
- **Theme Customization**: Modules that provide theme variants

## References

- [Canopi SDK Documentation](./SIDEBAR_TAB_SDK_API.md) (to be created)
- [Canopi Store API](./CANOPI_STORE_API.md) (to be created)
- [Semantic Versioning](https://semver.org/)
- [JSON Schema](https://json-schema.org/)














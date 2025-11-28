# Sidebar Tab SDK Documentation Index

## Overview

The Canopi Sidebar Tab SDK enables developers to create custom sidebar tabs that integrate seamlessly with the Canopi platform. This documentation provides everything you need to build, test, and distribute tab modules.

## Documentation Structure

### 1. [Manifest Schema](./SIDEBAR_TAB_SDK_MANIFEST_SCHEMA.md)
**Complete reference for module manifests**

- Manifest file structure and schema
- Required and optional fields
- Permission scope definitions
- Configuration settings
- Security and signing
- Example: Archive Assistant manifest

**Use this when:**
- Creating a new module manifest
- Understanding manifest requirements
- Validating your manifest

### 2. [SDK API Specification](./SIDEBAR_TAB_SDK_API.md)
**Complete JavaScript API reference**

- Tab registration API
- Bridge communication
- Permissions management
- Storage APIs (local and sync)
- User context API
- Theme and styling
- Diagnostics and error handling
- Lifecycle hooks
- Complete type definitions

**Use this when:**
- Implementing module functionality
- Understanding available APIs
- Debugging integration issues

### 3. [Quick Start Guide](./SIDEBAR_TAB_SDK_QUICK_START.md)
**Step-by-step tutorial for building your first module**

- Project setup
- Creating the Archive Assistant module
- Building and testing
- Publishing to store

**Use this when:**
- Starting your first module
- Learning the SDK basics
- Following a complete example

### 4. [JSON Schema](./schemas/canopi-tab-manifest-v1.schema.json)
**Machine-readable manifest validation schema**

- JSON Schema for manifest validation
- Use with validation tools
- IDE autocomplete support

**Use this when:**
- Validating manifests programmatically
- Setting up IDE support
- Building validation tools

### 5. [Example Manifest](./examples/archive-assistant-manifest.json)
**Complete example manifest file**

- Real-world manifest example
- All fields populated
- Reference implementation

**Use this when:**
- Starting a new module
- Understanding field usage
- Copying as a template

## Quick Reference

### Core Concepts

**Module**: A packaged tab extension that adds functionality to the Canopi sidebar.

**Manifest**: The `canopi-tab.json` file that describes your module's metadata, permissions, and configuration.

**SDK**: The JavaScript API (`window.canopi`) that provides access to Canopi services.

**Bridge**: The communication layer between your module and the Canopi host.

**Store**: The distribution platform where modules are published and downloaded.

### Development Workflow

1. **Plan**: Define your module's functionality and required permissions
2. **Create**: Set up project structure and create manifest
3. **Develop**: Implement module using SDK APIs
4. **Test**: Test locally in Canopi development environment
5. **Build**: Package module for distribution
6. **Publish**: Submit to Canopi Store
7. **Maintain**: Update and improve based on user feedback

### Key APIs

```javascript
// Register a tab
const tab = canopi.registerTab({ ... });

// Communicate with host
const response = await canopi.bridge.request('event:name', payload);

// Check permissions
if (canopi.permissions.has('scope:name')) { ... }

// Store data
await canopi.storage.local.set('key', value);

// Get user info
const user = await canopi.user.getCurrent();

// Use theme
const theme = await canopi.theme.getCurrent();
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Canopi Host                      │
│  ┌───────────────────────────────────┐  │
│  │      Sidebar Tab Manager           │  │
│  │  ┌─────────────────────────────┐   │  │
│  │  │   Tab Module Loader         │   │  │
│  │  │   - Loads modules           │   │  │
│  │  │   - Injects SDK             │   │  │
│  │  │   - Manages lifecycle       │   │  │
│  │  └─────────────────────────────┘   │  │
│  │                                     │  │
│  │  ┌─────────────────────────────┐   │  │
│  │  │   Bridge Service            │   │  │
│  │  │   - Event routing           │   │  │
│  │  │   - Request/response        │   │  │
│  │  │   - Permission checks       │   │  │
│  │  └─────────────────────────────┘   │  │
│  │                                     │  │
│  │  ┌─────────────────────────────┐   │  │
│  │  │   Permission Manager        │   │  │
│  │  │   - Scope validation        │   │  │
│  │  │   - User prompts            │   │  │
│  │  └─────────────────────────────┘   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │
           │ Bridge API
           │
┌──────────▼──────────────────────────────┐
│      Tab Module (Your Code)            │
│  ┌──────────────────────────────────┐  │
│  │   canopi.registerTab()            │  │
│  │   canopi.bridge.request()         │  │
│  │   canopi.permissions.has()        │  │
│  │   canopi.storage.local.set()      │  │
│  │   canopi.user.getCurrent()        │  │
│  │   canopi.theme.getCurrent()       │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

## Common Use Cases

### Archive Assistant
Archive web pages to multiple services (Wayback Machine, IPFS, Ordinals).

**Key Features:**
- Multiple archive service support
- Archive history tracking
- Progress indicators
- Permission management

**See:** [Quick Start Guide](./SIDEBAR_TAB_SDK_QUICK_START.md)

### Analytics Dashboard
Display analytics and metrics for the current page.

**Key Features:**
- Real-time data updates
- Chart visualizations
- Data export
- Customizable views

### Content Tools
Tools for content creation, editing, or management.

**Key Features:**
- Rich text editing
- Media management
- Content preview
- Publishing workflows

### Developer Tools
Tools for developers working with web pages.

**Key Features:**
- DOM inspection
- Network monitoring
- Performance profiling
- Code analysis

## Best Practices

### Security
- ✅ Always check permissions before using features
- ✅ Validate all user input
- ✅ Use secure storage for sensitive data
- ✅ Never expose API keys or secrets
- ✅ Follow Content Security Policy guidelines

### Performance
- ✅ Lazy load heavy components
- ✅ Debounce frequent operations
- ✅ Cache data when appropriate
- ✅ Minimize bridge requests
- ✅ Use efficient data structures

### User Experience
- ✅ Provide clear error messages
- ✅ Show loading states
- ✅ Respect user preferences
- ✅ Use theme tokens for styling
- ✅ Make UI accessible

### Code Quality
- ✅ Use TypeScript for type safety
- ✅ Write unit tests
- ✅ Handle errors gracefully
- ✅ Document your code
- ✅ Follow semantic versioning

## Getting Help

### Documentation
- Read the [API Reference](./SIDEBAR_TAB_SDK_API.md)
- Check the [Manifest Schema](./SIDEBAR_TAB_SDK_MANIFEST_SCHEMA.md)
- Review [Examples](../examples/)

### Community
- [Developer Forum](https://canopi.org/developers/forum)
- [Discord Server](https://discord.gg/canopi)
- [GitHub Discussions](https://github.com/canopi/sdk/discussions)

### Support
- [Report Issues](https://github.com/canopi/sdk/issues)
- [Request Features](https://github.com/canopi/sdk/issues/new?template=feature.md)
- [Contact Support](mailto:dev@canopi.org)

## Version History

### SDK v1.0.0 (Current)
- Initial release
- Tab registration API
- Bridge communication
- Permission system
- Storage APIs
- Theme support
- Diagnostics

## Roadmap

### Upcoming Features
- Widget support (smaller sidebar components)
- Content script injection
- Background workers
- API extensions
- Enhanced theming

### Planned Improvements
- Better TypeScript support
- More examples
- Developer tools
- Performance optimizations

## License

The Canopi Sidebar Tab SDK is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

---

**Ready to get started?** Check out the [Quick Start Guide](./SIDEBAR_TAB_SDK_QUICK_START.md)!














# Social Share Module - Design Document

## Overview
An extensible social media sharing module that allows users to share messages to multiple platforms (X/Twitter, LinkedIn, Facebook, Reddit, Discord, Slack, BlueSky) with OAuth integration for connected accounts.

## Architecture

### Core Components

1. **SocialShareManager** - Main orchestrator
2. **Platform Adapters** - Individual platform implementations
3. **OAuth Service** - Handles authentication for connected accounts
4. **Share UI** - Modal/dropdown for platform selection
5. **Platform Registry** - Dynamic platform registration system

### Platform Support Matrix

| Platform | OAuth Required | Share Method | Status |
|----------|---------------|--------------|--------|
| X (Twitter) | Yes | API + OAuth | Planned |
| LinkedIn | Yes | API + OAuth | Planned |
| Facebook | Yes | API + OAuth | Planned |
| Reddit | Yes | API + OAuth | Planned |
| Discord | Yes | Webhook/API | Planned |
| Slack | Yes | Webhook/API | Planned |
| BlueSky | Yes | ATProto API | Planned |

## File Structure

```
presence/src/features/social-share/
├── core/
│   ├── SocialShareManager.ts       # Main orchestrator
│   ├── PlatformRegistry.ts          # Platform registration system
│   ├── ShareTypes.ts                # TypeScript types
│   └── ShareConfig.ts               # Configuration
├── platforms/
│   ├── base/
│   │   └── BasePlatformAdapter.ts   # Abstract base class
│   ├── twitter/
│   │   ├── TwitterAdapter.ts
│   │   └── TwitterOAuth.ts
│   ├── linkedin/
│   │   ├── LinkedInAdapter.ts
│   │   └── LinkedInOAuth.ts
│   ├── facebook/
│   │   ├── FacebookAdapter.ts
│   │   └── FacebookOAuth.ts
│   ├── reddit/
│   │   ├── RedditAdapter.ts
│   │   └── RedditOAuth.ts
│   ├── discord/
│   │   ├── DiscordAdapter.ts
│   │   └── DiscordOAuth.ts
│   ├── slack/
│   │   ├── SlackAdapter.ts
│   │   └── SlackOAuth.ts
│   └── bluesky/
│       ├── BlueSkyAdapter.ts
│       └── BlueSkyOAuth.ts
├── services/
│   ├── OAuthService.ts              # Unified OAuth handler
│   ├── ShareStorage.ts              # Store connected accounts
│   └── ShareAnalytics.ts            # Track share events
├── ui/
│   ├── ShareModal.ts                # Share platform selector
│   ├── PlatformConnectionStatus.ts  # Show connected platforms
│   └── ShareButton.ts               # Share button component
└── index.ts                         # Public API

```

## Implementation Plan

### Phase 1: Core Infrastructure
1. Base platform adapter interface
2. Platform registry system
3. OAuth service foundation
4. Share modal UI

### Phase 2: Core Platforms (OAuth Required)
1. X/Twitter
2. LinkedIn
3. Facebook

### Phase 3: Extended Platforms
1. Reddit
2. Discord
3. Slack
4. BlueSky

## Key Design Principles

1. **Extensibility**: Easy to add new platforms via adapter pattern
2. **OAuth Management**: Centralized OAuth handling with token refresh
3. **Graceful Degradation**: Fallback to share URLs if OAuth not connected
4. **User Experience**: Show connection status, easy connect/disconnect
5. **Privacy**: Store tokens securely, allow per-platform opt-out

## API Design

### SocialShareManager

```typescript
class SocialShareManager {
  // Register a new platform
  registerPlatform(platform: PlatformAdapter): void;
  
  // Get available platforms
  getAvailablePlatforms(): PlatformAdapter[];
  
  // Get connected platforms for current user
  getConnectedPlatforms(): Promise<PlatformAdapter[]>;
  
  // Share message to platform
  shareToPlatform(platformId: string, message: Message): Promise<ShareResult>;
  
  // Connect OAuth account
  connectPlatform(platformId: string): Promise<OAuthResult>;
  
  // Disconnect platform
  disconnectPlatform(platformId: string): Promise<void>;
  
  // Check if platform is connected
  isPlatformConnected(platformId: string): Promise<boolean>;
}
```

### Platform Adapter Interface

```typescript
interface PlatformAdapter {
  id: string;
  name: string;
  icon: string;
  requiresOAuth: boolean;
  
  // Share methods
  share(message: Message, options?: ShareOptions): Promise<ShareResult>;
  shareWithOAuth(message: Message, token: string): Promise<ShareResult>;
  shareWithURL(message: Message): Promise<ShareResult>; // Fallback
  
  // OAuth methods
  getOAuthUrl(): string;
  handleOAuthCallback(code: string): Promise<OAuthToken>;
  refreshToken(token: string): Promise<OAuthToken>;
  
  // Connection status
  isConnected(): Promise<boolean>;
  getConnectionStatus(): Promise<ConnectionStatus>;
}
```

## OAuth Flow

1. User clicks "Connect [Platform]"
2. Redirect to platform OAuth URL
3. User authorizes
4. Callback with code
5. Exchange code for token
6. Store token securely (encrypted)
7. Show connection status in UI

## Share Flow

1. User clicks share button on message
2. Share modal opens showing:
   - Connected platforms (highlighted)
   - Available platforms (with "Connect" option)
   - Quick share options (copy link, etc.)
3. User selects platform
4. If connected: Use OAuth API
5. If not connected: Offer to connect OR use URL share
6. Track share event
7. Show success/error feedback

## Security Considerations

1. **Token Storage**: Encrypt OAuth tokens in chrome.storage.local
2. **Token Refresh**: Automatic token refresh before expiry
3. **Scope Management**: Request minimal required scopes
4. **User Consent**: Clear consent for each platform connection
5. **Revocation**: Easy disconnect/revoke functionality

## Extensibility Example

Adding a new platform:

```typescript
// 1. Create adapter
class MastodonAdapter extends BasePlatformAdapter {
  id = 'mastodon';
  name = 'Mastodon';
  requiresOAuth = true;
  
  async share(message: Message, options?: ShareOptions) {
    // Implementation
  }
  
  // ... other methods
}

// 2. Register
socialShareManager.registerPlatform(new MastodonAdapter());
```

## UI/UX Considerations

1. **Share Button**: Icon with dropdown showing platforms
2. **Connection Status**: Visual indicators (connected/disconnected)
3. **Quick Actions**: One-click share for connected platforms
4. **Connect Flow**: Inline connection without leaving page
5. **Feedback**: Toast notifications for success/errors
6. **Settings**: Manage connected accounts in settings page

## Backend Requirements

1. **OAuth Endpoints**: 
   - `/api/oauth/[platform]/authorize` - Get OAuth URL
   - `/api/oauth/[platform]/callback` - Handle callback
   - `/api/oauth/[platform]/token` - Exchange code for token
   - `/api/oauth/[platform]/refresh` - Refresh token

2. **Share Endpoints**:
   - `/api/share/[platform]` - Share via API (if OAuth connected)
   - `/api/share/analytics` - Track share events

3. **Storage**:
   - User OAuth tokens (encrypted)
   - Connection status
   - Share history

## Implementation Priority

1. **MVP**: X, LinkedIn, Facebook with OAuth
2. **Phase 2**: Reddit, Discord, Slack
3. **Phase 3**: BlueSky (ATProto complexity)
4. **Future**: Mastodon, Threads, etc.

## Testing Strategy

1. **Unit Tests**: Each platform adapter
2. **Integration Tests**: OAuth flows
3. **E2E Tests**: Full share flow
4. **Mock Tests**: OAuth providers






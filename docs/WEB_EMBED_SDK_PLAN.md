# Web-Embed SDK Planning Document

## Executive Summary

This document outlines the architecture and implementation plan for a Web-Embed SDK that allows website owners to embed the Canopi sidebar on their websites. The SDK will be added to the `<head>` of a website and will display a customizable trigger icon/tab that opens the Canopi sidebar when clicked.

---

## 1. Overview & Goals

### Primary Goals
1. **Easy Integration**: One-line script tag in `<head>` to embed Canopi sidebar
2. **Page Targeting**: Configure which pages on a site get the sidebar (specific URLs, patterns, or entire site)
3. **Customizable Trigger**: Bouncing icon or corner tab with programmable position and hover message
4. **Admin Interface**: Dashboard where users can create "canopi" instances and get embed codes
5. **Seamless Experience**: Sidebar appears as if native to the website

### Use Cases
- **Support Forums**: Add Canopi sidebar to help pages for community support
- **Documentation Sites**: Enable discussions on specific documentation pages
- **E-commerce**: Add community features to product pages
- **Blogs**: Enable discussions on blog posts
- **SaaS Applications**: Add community sidebar to specific app pages

---

## 2. Architecture Overview

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                          │
│  - Create/Manage Canopi Instances                           │
│  - Configure Page Targeting Rules                           │
│  - Customize Trigger (Icon/Tab)                             │
│  - Generate Embed Code                                      │
└──────────────────────┬──────────────────────────────────────┘
                      │
                      │ API
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API & Database                         │
│  - Canopi Instance Management                               │
│  - Configuration Storage                                     │
│  - Embed Code Generation                                    │
│  - Analytics & Telemetry                                    │
└──────────────────────┬──────────────────────────────────────┘
                      │
                      │ CDN
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Web-Embed SDK (CDN)                            │
│  - Lightweight Loader Script                               │
│  - Configuration Parser                                     │
│  - Page Matching Engine                                     │
│  - Sidebar Loader & Renderer                               │
│  - Trigger Icon/Tab Component                               │
└──────────────────────┬──────────────────────────────────────┘
                      │
                      │ Injected
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Website (Customer Site)                        │
│  <head>                                                     │
│    <script src="https://cdn.canopi.live/embed/v1.js">      │
│      data-canopi-id="abc123"                                │
│      data-pages="/help/*,/docs/*"                           │
│      data-trigger-position="bottom-right"                  │
│      data-trigger-message="Need help? Chat with us!"        │
│    </script>                                                │
│  </head>                                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

1. **Admin creates Canopi instance** → Backend stores configuration
2. **Admin gets embed code** → Backend generates unique embed script tag
3. **Website owner adds script to `<head>`** → SDK loads from CDN
4. **SDK checks current page** → Matches against configured rules
5. **If match** → SDK injects trigger icon/tab
6. **User clicks trigger** → SDK loads and displays sidebar
7. **Sidebar connects** → Uses same backend as extension

---

## 3. Admin Dashboard Interface

### 3.1 Canopi Instance Management

#### Create New Canopi Instance
- **Instance Name**: Human-readable name (e.g., "Help Center Support")
- **Description**: Optional description
- **Domain(s)**: List of domains where this embed can be used (security)
- **Community**: Which Canopi community to connect to
- **Status**: Active/Inactive

#### Page Targeting Configuration
Multiple targeting options:

1. **Entire Site**
   - Simple toggle: "Enable on all pages"

2. **Specific URLs**
   - List of exact URLs (one per line)
   - Example:
     ```
     https://example.com/help
     https://example.com/help/getting-started
     https://example.com/docs/api
     ```

3. **URL Patterns**
   - Path patterns with wildcards
   - Example:
     ```
     /help/*
     /docs/*
     /products/*/support
     ```

4. **Advanced Rules** (Future)
   - Regex patterns
   - Query parameter matching
   - Hash-based routing support

#### Trigger Customization

**Trigger Type Selection:**
- **Bouncing Icon**: Animated icon that bounces to attract attention
- **Corner Tab**: Fixed tab in corner (like Intercom, Drift)

**Position Configuration:**
- **Corner Tab**: 
  - `top-left`, `top-right`, `bottom-left`, `bottom-right`
  - Custom offset (X, Y pixels from corner)
- **Bouncing Icon**:
  - Same corner options
  - Bounce animation intensity (subtle, normal, aggressive)

**Visual Customization:**
- **Icon**: Choose from preset icons or upload custom
- **Color**: Primary color for icon/tab
- **Size**: Small, Medium, Large
- **Hover Message**: Text to show on hover
  - Example: "Need help? Chat with us!"
  - Example: "Join the discussion"
  - Max length: 100 characters

**Behavior:**
- **Auto-show delay**: Show trigger after X seconds (0 = immediate)
- **Hide after click**: Hide trigger when sidebar opens (optional)
- **Show on mobile**: Toggle for mobile devices

### 3.2 Embed Code Generation

After configuration, admin gets embed code:

```html
<!-- Canopi Web Embed -->
<script 
  src="https://cdn.canopi.live/embed/v1.js"
  data-canopi-id="abc123xyz"
  data-pages="/help/*,/docs/*"
  data-trigger-type="corner-tab"
  data-trigger-position="bottom-right"
  data-trigger-message="Need help? Chat with us!"
  data-trigger-color="#007bff"
  data-trigger-size="medium"
  async
></script>
```

**Features:**
- Unique `data-canopi-id` per instance
- All configuration embedded in data attributes
- Async loading (non-blocking)
- Versioned CDN URL for cache busting

### 3.3 Analytics & Monitoring

Dashboard shows:
- **Page Views**: How many pages loaded the SDK
- **Trigger Impressions**: How many times trigger was shown
- **Sidebar Opens**: How many times sidebar was opened
- **Active Users**: Users who interacted with sidebar
- **Top Pages**: Which pages get most engagement

---

## 4. Web-Embed SDK Implementation

### 4.1 SDK Loader Script (`embed/v1.js`)

**Responsibilities:**
1. Parse configuration from data attributes
2. Check if current page matches targeting rules
3. Load main SDK bundle if match
4. Handle errors gracefully (fail silently if needed)

**Size Target:** < 2KB minified

**Code Structure:**
```javascript
(function() {
  'use strict';
  
  // Find script tag with canopi config
  const script = document.currentScript || 
    document.querySelector('script[data-canopi-id]');
  
  if (!script) return;
  
  // Parse configuration
  const config = {
    canopiId: script.getAttribute('data-canopi-id'),
    pages: script.getAttribute('data-pages')?.split(',') || ['*'],
    triggerType: script.getAttribute('data-trigger-type') || 'corner-tab',
    triggerPosition: script.getAttribute('data-trigger-position') || 'bottom-right',
    triggerMessage: script.getAttribute('data-trigger-message') || 'Open Canopi',
    triggerColor: script.getAttribute('data-trigger-color') || '#007bff',
    triggerSize: script.getAttribute('data-trigger-size') || 'medium'
  };
  
  // Check if current page matches
  if (!matchesPage(config.pages)) {
    return; // Don't load SDK
  }
  
  // Load main SDK bundle
  loadSDK(config);
})();
```

### 4.2 Main SDK Bundle (`embed/sdk.js`)

**Responsibilities:**
1. Create and inject trigger icon/tab
2. Handle trigger interactions (hover, click)
3. Load and render sidebar
4. Manage sidebar state (open/close)
5. Handle responsive behavior
6. Connect to Canopi backend

**Key Components:**

#### Trigger Component
- **Corner Tab**: Fixed position div with CSS styling
- **Bouncing Icon**: Animated icon with bounce effect
- **Hover Tooltip**: Shows message on hover
- **Click Handler**: Opens sidebar

#### Sidebar Loader
- **Lazy Loading**: Only load sidebar HTML/CSS/JS when opened
- **Iframe Option**: Load sidebar in iframe for isolation
- **Direct Injection**: Inject sidebar HTML directly (current approach)

**Decision Needed:** Iframe vs Direct Injection
- **Iframe Pros**: Isolation, security, easier updates
- **Iframe Cons**: Communication complexity, styling limitations
- **Direct Injection Pros**: Better integration, easier styling
- **Direct Injection Cons**: Potential conflicts, harder updates

**Recommendation:** Start with direct injection (reuse existing sidebar), consider iframe for v2.

#### Page Matching Engine
```javascript
function matchesPage(rules, currentUrl) {
  const url = new URL(currentUrl || window.location.href);
  const path = url.pathname;
  
  for (const rule of rules) {
    // Exact match
    if (rule === path) return true;
    
    // Wildcard match
    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -2);
      if (path.startsWith(prefix)) return true;
    }
    
    // All pages
    if (rule === '*' || rule === '/*') return true;
  }
  
  return false;
}
```

### 4.3 Sidebar Integration

**Reuse Existing Sidebar:**
- Load `sidepanel.html` content
- Inject into page (not iframe initially)
- Reuse existing JavaScript modules
- Connect to same backend/API

**Styling Considerations:**
- **Position**: Fixed to right side of page
- **Z-index**: High (9999+) to appear above content
- **Width**: Configurable (default: 400px)
- **Responsive**: Collapse on mobile or use bottom sheet
- **Animation**: Slide in from right

**State Management:**
- **Open/Close**: Track sidebar state
- **Persistence**: Remember state across page navigations (SPA support)
- **Multiple Instances**: Handle multiple Canopi instances (edge case)

### 4.4 Communication Bridge

**Between SDK and Sidebar:**
- Use `postMessage` API for iframe approach
- Use direct function calls for direct injection
- Event bus for state synchronization

**Between Sidebar and Backend:**
- Reuse existing API endpoints
- Same authentication flow
- Same realtime connections

---

## 5. Database Schema

### 5.1 Canopi Embed Instances Table

```sql
CREATE TABLE canopi_embed_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  community_id UUID REFERENCES communities(id),
  domain_whitelist TEXT[], -- Array of allowed domains
  page_rules JSONB NOT NULL, -- Targeting rules
  trigger_config JSONB NOT NULL, -- Trigger customization
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**page_rules JSONB structure:**
```json
{
  "type": "all" | "specific" | "patterns",
  "urls": ["/help", "/docs"],
  "patterns": ["/help/*", "/docs/*"]
}
```

**trigger_config JSONB structure:**
```json
{
  "type": "corner-tab" | "bouncing-icon",
  "position": "bottom-right",
  "offset": { "x": 0, "y": 0 },
  "message": "Need help? Chat with us!",
  "icon": "chat",
  "color": "#007bff",
  "size": "medium",
  "autoShowDelay": 0,
  "hideAfterClick": false,
  "showOnMobile": true
}
```

### 5.2 Embed Analytics Table

```sql
CREATE TABLE canopi_embed_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES canopi_embed_instances(id),
  event_type VARCHAR(50), -- 'page_view', 'trigger_impression', 'sidebar_open', 'sidebar_close'
  page_url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Additional event data
);
```

---

## 6. API Endpoints

### 6.1 Instance Management

```
POST   /api/embeds/instances          - Create new instance
GET    /api/embeds/instances          - List user's instances
GET    /api/embeds/instances/:id      - Get instance details
PUT    /api/embeds/instances/:id      - Update instance
DELETE /api/embeds/instances/:id      - Delete instance
```

### 6.2 Configuration

```
GET    /api/embeds/config/:canopiId   - Get public config for embed code
POST   /api/embeds/config/:canopiId   - Update config (admin only)
```

### 6.3 Analytics

```
GET    /api/embeds/analytics/:id      - Get analytics for instance
POST   /api/embeds/analytics/events   - Track event (from SDK)
```

---

## 7. Security Considerations

### 7.1 Domain Whitelisting
- Only allow embed on configured domains
- Validate `document.referrer` or `window.location.origin`
- CORS headers for API calls

### 7.2 Content Security Policy (CSP)
- SDK must work with common CSP settings
- Use nonce or hash for inline scripts if needed
- Document CSP requirements for website owners

### 7.3 Data Isolation
- Each embed instance is isolated
- User authentication scoped to instance
- No cross-instance data leakage

### 7.4 Rate Limiting
- Limit API calls from SDK
- Prevent abuse of analytics endpoints
- Throttle sidebar loading

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema and migrations
- [ ] Basic API endpoints (CRUD for instances)
- [ ] Admin dashboard UI (create instance form)
- [ ] Embed code generation

### Phase 2: SDK Core (Week 3-4)
- [ ] SDK loader script (`embed/v1.js`)
- [ ] Page matching engine
- [ ] Basic trigger component (corner tab)
- [ ] Sidebar loading and injection
- [ ] Basic styling and positioning

### Phase 3: Trigger Customization (Week 5)
- [ ] Bouncing icon option
- [ ] Position configuration
- [ ] Hover message tooltip
- [ ] Visual customization (color, size, icon)
- [ ] Admin UI for trigger customization

### Phase 4: Page Targeting (Week 6)
- [ ] URL pattern matching
- [ ] Admin UI for page targeting rules
- [ ] Testing on various URL patterns
- [ ] SPA support (hash routing, history API)

### Phase 5: Analytics & Polish (Week 7-8)
- [ ] Analytics tracking
- [ ] Admin dashboard analytics view
- [ ] Error handling and logging
- [ ] Performance optimization
- [ ] Documentation and examples

### Phase 6: Advanced Features (Future)
- [ ] Iframe isolation option
- [ ] Advanced targeting (regex, query params)
- [ ] A/B testing for triggers
- [ ] Custom CSS injection
- [ ] Multi-language support

---

## 9. Technical Decisions

### 9.1 Sidebar Loading Strategy

**Option A: Direct Injection (Recommended for MVP)**
- Inject sidebar HTML/CSS/JS directly into page
- Reuse existing `sidepanel.html` structure
- Faster initial load
- Easier styling integration
- **Risk**: Potential conflicts with site CSS/JS

**Option B: Iframe**
- Load sidebar in isolated iframe
- Better security and isolation
- Easier updates (just update iframe src)
- **Risk**: Communication complexity, styling limitations

**Decision**: Start with Option A, plan migration to Option B for v2.

### 9.2 Trigger Animation

**Bouncing Icon:**
- CSS keyframe animation
- Configurable intensity (subtle, normal, aggressive)
- Pause on hover
- Stop after first interaction

**Corner Tab:**
- Simple slide-in animation
- No bounce (less distracting)
- Smooth transitions

### 9.3 Mobile Experience

**Options:**
1. **Bottom Sheet**: Slide up from bottom (native feel)
2. **Full Screen Modal**: Overlay entire screen
3. **Collapsed Sidebar**: Narrow sidebar on mobile

**Decision**: Bottom sheet for mobile (better UX), full sidebar for desktop.

### 9.4 Authentication Flow

**Challenge**: Website visitors may not have Canopi accounts

**Options:**
1. **Guest Mode**: Allow anonymous viewing, require auth for posting
2. **Prompt on Open**: Show auth modal when sidebar opens
3. **Lazy Auth**: Only prompt when user tries to interact

**Decision**: Guest mode with lazy auth (prompt when posting/replying).

---

## 10. User Experience Flow

### 10.1 Admin Flow

1. **Login to Admin Dashboard**
2. **Create New Canopi Instance**
   - Enter name, description
   - Select community
   - Configure page targeting
   - Customize trigger
3. **Get Embed Code**
   - Copy generated script tag
   - See preview of trigger
4. **Add to Website**
   - Paste script in `<head>`
   - Test on target pages
5. **Monitor Analytics**
   - View engagement metrics
   - Adjust configuration as needed

### 10.2 End User Flow (Website Visitor)

1. **Visit Website Page**
   - SDK loads and checks page
   - If match, trigger appears
2. **See Trigger**
   - Corner tab or bouncing icon visible
   - Hover to see message
3. **Click Trigger**
   - Sidebar slides in from right
   - Shows Canopi interface
4. **Interact with Sidebar**
   - View messages/discussions
   - Post messages (if authenticated)
   - Close sidebar (trigger remains)

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Page matching engine
- Configuration parsing
- Trigger component rendering
- Analytics event tracking

### 11.2 Integration Tests
- SDK loading on various pages
- Sidebar injection and rendering
- API communication
- Authentication flow

### 11.3 E2E Tests
- Full admin flow (create instance → get code → embed)
- End user flow (visit page → see trigger → open sidebar)
- Multiple page targeting scenarios
- Mobile responsiveness

### 11.4 Browser Compatibility
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Test with various CSP policies

---

## 12. Documentation Requirements

### 12.1 Admin Documentation
- How to create a Canopi instance
- Page targeting guide
- Trigger customization options
- Analytics interpretation

### 12.2 Developer Documentation
- Embed code installation
- Configuration options
- Troubleshooting guide
- CSP compatibility
- API reference (if exposing APIs)

### 12.3 User Documentation
- What is Canopi sidebar?
- How to use the sidebar
- Authentication guide

---

## 13. Success Metrics

### 13.1 Adoption Metrics
- Number of Canopi instances created
- Number of websites using embed
- Active embed instances (30-day window)

### 13.2 Engagement Metrics
- Trigger impression rate
- Sidebar open rate (CTR from trigger)
- Average session duration in sidebar
- Messages posted via embed

### 13.3 Technical Metrics
- SDK load time
- Sidebar load time
- Error rate
- API response times

---

## 14. Open Questions & Decisions Needed

1. **Sidebar Loading**: Direct injection vs iframe? (Recommendation: Direct for MVP)
2. **Authentication**: Guest mode vs required auth? (Recommendation: Guest with lazy auth)
3. **Mobile Experience**: Bottom sheet vs full screen? (Recommendation: Bottom sheet)
4. **Versioning**: How to handle SDK updates? (CDN versioning)
5. **Caching**: How aggressive should caching be? (Long cache for SDK, short for config)
6. **Analytics Privacy**: What data to collect? (GDPR compliance)
7. **Pricing Model**: Free tier limits? (TBD)

---

## 15. Next Steps

1. **Review & Approve Plan**: Get stakeholder sign-off
2. **Set Up Project**: Create tickets, assign owners
3. **Start Phase 1**: Database and API foundation
4. **Design Mockups**: Admin dashboard UI/UX
5. **Technical Spike**: Prototype SDK loader and sidebar injection

---

## Appendix A: Example Embed Codes

### Minimal Configuration
```html
<script 
  src="https://cdn.canopi.live/embed/v1.js"
  data-canopi-id="abc123"
  async
></script>
```

### Full Configuration
```html
<script 
  src="https://cdn.canopi.live/embed/v1.js"
  data-canopi-id="abc123xyz"
  data-pages="/help/*,/docs/*,/support"
  data-trigger-type="bouncing-icon"
  data-trigger-position="bottom-right"
  data-trigger-message="Need help? Chat with us!"
  data-trigger-color="#007bff"
  data-trigger-size="large"
  data-auto-show-delay="3"
  data-hide-after-click="true"
  async
></script>
```

---

## Appendix B: Configuration Reference

### Data Attributes

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-canopi-id` | Yes | - | Unique instance identifier |
| `data-pages` | No | `*` | Comma-separated page rules |
| `data-trigger-type` | No | `corner-tab` | `corner-tab` or `bouncing-icon` |
| `data-trigger-position` | No | `bottom-right` | Corner position |
| `data-trigger-message` | No | `Open Canopi` | Hover message text |
| `data-trigger-color` | No | `#007bff` | Hex color code |
| `data-trigger-size` | No | `medium` | `small`, `medium`, `large` |
| `data-auto-show-delay` | No | `0` | Seconds before showing trigger |
| `data-hide-after-click` | No | `false` | Hide trigger when sidebar opens |

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Planning Phase - Awaiting Approval







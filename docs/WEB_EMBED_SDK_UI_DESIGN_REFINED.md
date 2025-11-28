# Web-Embed SDK UI Design - Refined

## Clarifications Received

1. **Canopi URL** = Domain where the Canopi community operates (e.g., `themetalayer.org`)
2. **Welcome Message** = Modal overlay shown first time sidebar opens
3. **Customize** = Icon image upload OR corner color picker (integrated, not separate section)
4. **Sidebar Name** = Customizable name to replace "CanopiBETA" at top of sidebar
5. **Domain Whitelist** = Security feature (explained below)

---

## Refined Form Design

### Complete Form Structure

```
┌─────────────────────────────────────────────────────────┐
│ Create Canopi Embed                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Basic Information                                       │
│ ─────────────────────────────────────                  │
│ Canopi Name *:                                         │
│ [Help Center Support                          ]         │
│ (Display name for this embed instance)                 │
│                                                         │
│ Canopi URL *:                                           │
│ [https://themetalayer.org                      ]       │
│ (Domain where your Canopi community operates)          │
│                                                         │
│ Sidebar Title *:                                        │
│ [Help Center Community                          ]       │
│ (Replaces "CanopiBETA" at top of sidebar)               │
│                                                         │
│                                                         │
│ Trigger Appearance                                      │
│ ─────────────────────────────────────                  │
│ Type:                                                   │
│ ○ Expandable Corner Tab                                │
│ ● Custom Icon                                           │
│                                                         │
│ [If "Custom Icon" selected:]                            │
│ Upload Icon: [Choose File] [Preview]                    │
│ Format: PNG, GIF (transparent background)              │
│ Recommended: 64x64px                                    │
│                                                         │
│ [If "Corner Tab" selected:]                             │
│ Tab Color: [Color Picker: #007bff]                      │
│                                                         │
│ Position:                                               │
│ Corner: [Bottom Right ▼]                                │
│   ○ Top Left    ○ Top Right                            │
│   ○ Bottom Left ● Bottom Right                         │
│                                                         │
│ Hover Message:                                          │
│ [Need help? Chat with us!                      ]        │
│ (Shown when user hovers over trigger)                   │
│                                                         │
│                                                         │
│ Welcome Message                                         │
│ ─────────────────────────────────────                  │
│ [Welcome to our Help Center community!         ]        │
│ (Modal shown first time sidebar opens - optional)      │
│                                                         │
│                                                         │
│ Page Targeting                                          │
│ ─────────────────────────────────────                  │
│ ● Enable on all pages                                   │
│ ○ Enable on specific pages only                         │
│                                                         │
│ [If "Enable on all pages" selected:]                    │
│ ☑ Except on pages below:                                │
│   + Add home page                                       │
│   + Add other pages                                      │
│                                                         │
│ [If "Enable on specific pages" selected:]               │
│ Pages:                                                  │
│   + Add home page                                       │
│   + Add page URL                                        │
│   + Add page pattern (e.g., /help/*)                   │
│                                                         │
│                                                         │
│ Security                                                │
│ ─────────────────────────────────────                  │
│ Website Domains *:                                      │
│ [example.com                                    ]       │
│ [+ Add domain]                                          │
│ (Where this embed code can be used - security)          │
│                                                         │
│                                                         │
│ [Cancel]  [Save & Get Embed Code]                       │
└─────────────────────────────────────────────────────────┘
```

---

## Field Explanations

### 1. Canopi Name
- **Purpose**: Internal name for this embed instance
- **Example**: "Help Center Support", "Product Docs Community"
- **Used for**: Admin dashboard organization, analytics labeling

### 2. Canopi URL
- **Purpose**: Domain where the Canopi community backend operates
- **Example**: `https://themetalayer.org`, `https://app.canopi.live`
- **Used for**: API connections, authentication, data storage
- **Note**: This is the backend domain, not the website where embed is used

### 3. Sidebar Title
- **Purpose**: Custom name shown at top of sidebar (replaces "CanopiBETA")
- **Example**: "Help Center Community", "Product Support"
- **Used for**: Branding, user recognition
- **Display**: Shown in sidebar header

### 4. Trigger Type
- **Expandable Corner Tab**: Standard corner tab (like Intercom, Drift)
  - Customizable color
  - 4 corner positions
- **Custom Icon**: Upload your own image/GIF
  - Transparent background recommended
  - 64x64px recommended size
  - Position relative to corner

### 5. Hover Message
- **Purpose**: Tooltip text shown when user hovers over trigger
- **Example**: "Need help? Chat with us!", "Join the discussion"
- **Display**: Small tooltip near trigger icon/tab
- **Max length**: 100 characters (suggested)

### 6. Welcome Message
- **Purpose**: Modal overlay shown first time user opens sidebar
- **Example**: "Welcome to our Help Center community!"
- **Display**: Modal/dialog overlay on top of sidebar
- **Behavior**: 
  - Shows only on first open
  - User can dismiss
  - Optional (can be left blank)

### 7. Page Targeting
- **Enable on all pages**: Show embed everywhere
  - Option to add exceptions
- **Enable on specific pages**: Show only on listed pages
  - Add home page, specific URLs, or patterns

### 8. Website Domains (Domain Whitelist)
- **Purpose**: Security - restrict where embed code can be used
- **Why needed**: 
  - Prevents unauthorized use of your embed code
  - Protects against code theft
  - Ensures embed only works on your domains
- **Example**: `example.com`, `www.example.com`, `docs.example.com`
- **Validation**: SDK checks current domain against whitelist before loading

---

## Domain Whitelist - Security Explanation

### Why Domain Whitelist is Important

**Problem Without Whitelist:**
1. Someone copies your embed code
2. Uses it on their website
3. Your community appears on their site (unauthorized)
4. They could spam your community
5. Analytics get polluted

**Solution With Whitelist:**
1. You specify: `example.com`, `www.example.com`
2. SDK checks: `window.location.hostname`
3. If domain matches → Load embed
4. If domain doesn't match → Don't load (silent fail)
5. Only your domains can use your embed code

### Implementation

```javascript
// In SDK loader
const allowedDomains = config.domainWhitelist; // ['example.com', 'www.example.com']
const currentDomain = window.location.hostname;

function isDomainAllowed(domain, whitelist) {
  // Exact match
  if (whitelist.includes(domain)) return true;
  
  // Subdomain match (e.g., docs.example.com matches example.com)
  return whitelist.some(allowed => 
    domain === allowed || domain.endsWith('.' + allowed)
  );
}

if (!isDomainAllowed(currentDomain, allowedDomains)) {
  console.warn('Canopi embed: Domain not whitelisted');
  return; // Don't load
}
```

### User Experience

- **Admin**: Adds domains when creating embed
- **Website Owner**: Gets embed code, adds to their site
- **SDK**: Validates domain on load
- **If mismatch**: Embed doesn't load (no error shown to end users)

---

## Welcome Message Modal Design

### Modal Appearance

```
┌─────────────────────────────────────────┐
│                    ✕                    │
├─────────────────────────────────────────┤
│                                         │
│   [Icon/Logo]                           │
│                                         │
│   Welcome to our Help Center            │
│   community!                            │
│                                         │
│   Get help, ask questions, and          │
│   connect with our team.               │
│                                         │
│   [Got it!]                             │
│                                         │
└─────────────────────────────────────────┘
```

### Behavior
- Shows on first sidebar open
- Overlays sidebar content
- User clicks "Got it!" or X to dismiss
- Dismissal stored in localStorage
- Won't show again for that user

### Implementation

```javascript
// In sidebar initialization
const welcomeMessage = config.welcomeMessage;
const hasSeenWelcome = localStorage.getItem(`canopi-welcome-${canopiId}`);

if (welcomeMessage && !hasSeenWelcome) {
  showWelcomeModal(welcomeMessage, () => {
    localStorage.setItem(`canopi-welcome-${canopiId}`, 'true');
  });
}
```

---

## Sidebar Title Customization

### Current Sidebar Header
```
┌─────────────────────────────────┐
│ CanopiBETA              [User] │
└─────────────────────────────────┘
```

### Customized Header
```
┌─────────────────────────────────┐
│ Help Center Community   [User] │
└─────────────────────────────────┘
```

### Implementation
- Replace hardcoded "CanopiBETA" text
- Use `config.sidebarTitle` from embed config
- Fallback to "Canopi" if not provided

---

## Complete Configuration Object

```javascript
{
  // Basic Info
  canopiId: "abc123xyz",
  canopiName: "Help Center Support",
  canopiUrl: "https://themetalayer.org",
  sidebarTitle: "Help Center Community",
  
  // Trigger
  triggerType: "custom-icon" | "corner-tab",
  triggerIcon: "https://cdn.example.com/icon.png", // if custom-icon
  triggerColor: "#007bff", // if corner-tab
  triggerPosition: "bottom-right",
  hoverMessage: "Need help? Chat with us!",
  
  // Messages
  welcomeMessage: "Welcome to our Help Center community!",
  
  // Targeting
  pageTargeting: {
    mode: "all" | "specific",
    exceptions: ["/", "/about"], // if mode: "all"
    pages: ["/help", "/docs/*"] // if mode: "specific"
  },
  
  // Security
  domainWhitelist: ["example.com", "www.example.com"]
}
```

---

## Updated Embed Code Format

```html
<script 
  src="https://cdn.canopi.live/embed/v1.js"
  data-canopi-id="abc123xyz"
  data-canopi-url="https://themetalayer.org"
  data-sidebar-title="Help Center Community"
  data-trigger-type="custom-icon"
  data-trigger-icon="https://cdn.example.com/icon.png"
  data-trigger-position="bottom-right"
  data-hover-message="Need help? Chat with us!"
  data-welcome-message="Welcome to our Help Center community!"
  data-pages="all"
  data-page-exceptions="/,/about"
  data-domains="example.com,www.example.com"
  async
></script>
```

---

## Database Schema Updates

### Updated `trigger_config` JSONB

```json
{
  "type": "custom-icon" | "corner-tab",
  "iconUrl": "https://...", // if type: "custom-icon"
  "color": "#007bff", // if type: "corner-tab"
  "position": "bottom-right",
  "hoverMessage": "Need help? Chat with us!"
}
```

### New Fields in `canopi_embed_instances`

```sql
ALTER TABLE canopi_embed_instances
  ADD COLUMN canopi_url TEXT NOT NULL,
  ADD COLUMN sidebar_title VARCHAR(255),
  ADD COLUMN welcome_message TEXT;
```

---

## Summary of Changes from Original Plan

1. ✅ **Canopi URL** = Backend domain (clarified)
2. ✅ **Welcome Message** = First-time modal (clarified)
3. ✅ **Customize** = Integrated into icon/corner selection (simplified)
4. ✅ **Sidebar Title** = Replaces "CanopiBETA" (new feature)
5. ✅ **Domain Whitelist** = Security feature (explained)

---

**Status**: Ready for implementation  
**Next Step**: Create wireframes/mockups based on this refined design







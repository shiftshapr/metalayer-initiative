# 🏗️ Modular Architecture Briefing
## Chrome Extension Sidepanel Development Guide

### 📋 Overview
This document provides a comprehensive guide for developers working on the **Agent**, **People**, and **Rooms** tabs of the Chrome extension sidepanel. The project has been refactored into a modular architecture following the **COMP method** for better maintainability and scalability.

---

## 🎯 Project Structure

### Core Architecture
```
presence/
├── sidepanel.html              # Main HTML entry point
├── sidepanel.js               # Main orchestration script
├── sidepanel.css              # Main stylesheet
├── manifest.json              # Chrome extension manifest
│
├── features/                  # 🎯 MAIN MODULES (Your Focus)
│   ├── AgentModule.js         # 🤖 AI Agent functionality
│   ├── PeopleModule.js        # 👥 People & connections
│   ├── RoomsModule.js         # 🏠 Room management
│   ├── CanopiModule.js        # 💬 Chat & messaging
│   ├── CommunitiesModule.js   # 🌐 Community management
│   ├── ProfileManager.js      # 👤 User profiles
│   └── UIManager.js           # 🎨 UI management
│
├── core/                      # Core system components
│   └── SidepanelCore.js       # Core sidepanel functionality
│
├── utils/                     # Utility modules
│   ├── AvatarUtils.js         # Avatar handling
│   ├── ErrorHandler.js        # Error management
│   └── Diagnostics.js         # Debug utilities
│
├── services/                  # Service layer
│   ├── SupabaseService.js     # Database operations
│   └── BackgroundService.js   # Background tasks
│
└── lib/                       # External libraries
    └── supabase.min.js        # Supabase client
```

---

## 🏗️ Backend Architecture

### Server Structure
```
metalayer-initiative/
├── app.js                    # Main Express server
├── canopi2-server.js         # Additional server instance
├── package.json              # Dependencies
├── .env                      # Environment variables
│
├── routes/                   # 🎯 API ENDPOINTS
│   ├── presence.js           # Presence tracking API
│   ├── reactions.js          # Reactions API
│   ├── communities.js        # Communities API
│   ├── auth.js              # Authentication API
│   ├── users.js             # User management API
│   └── chat.js              # Chat functionality API
│
├── services/                 # 🎯 BUSINESS LOGIC
│   ├── presenceService.js    # Presence business logic
│   ├── urlNormalizationService.js
│   └── [other services]
│
├── prisma/                   # 🎯 DATABASE
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── generated/            # Prisma client
│
└── controllers/              # 🎯 REQUEST HANDLERS
    ├── communitiesController.js
    └── [other controllers]
```

### Database Schema (Prisma)
```prisma
// Core Models
model appUser {
  id         String   @id @default(dbgenerated("gen_random_uuid()"))
  email      String   @unique
  name       String?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}

model user_presence {
  id              String    @id @default(dbgenerated("gen_random_uuid()"))
  user_email      String
  page_id         String
  is_active       Boolean   @default(true)
  last_seen       DateTime  @default(now())
  enter_time      DateTime  @default(now())
  availability    String?
  custom_label    String?
  aura_color      String?   @default("#ffffff")
  avatar_url      String?
  user_name       String?   // NEW: Google profile names
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  @@unique([user_email, page_id])
  @@index([page_id])
  @@index([user_email])
}

model messages {
  id           String    @id @default(dbgenerated("gen_random_uuid()"))
  page_id      String
  user_email   String
  content      String
  parent_id    String?   // For replies
  community_id String    @default("comm-001")
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt
  
  @@index([page_id, community_id])
  @@index([user_email])
  @@index([parent_id])
}

model reactions {
  id         String   @id @default(dbgenerated("gen_random_uuid()"))
  message_id String   @db.Uuid
  emoji      String
  user_email String
  created_at DateTime @default(now())
  
  @@unique([message_id, user_email, emoji])
  @@index([message_id])
}
```

### API Endpoints

#### Presence API (`/v1/presence/`)
```javascript
// Record presence event
POST /v1/presence/event
{
  "userId": "user@example.com",
  "pageId": "google_com_",
  "kind": "ENTER|EXIT|AVAILABILITY",
  "availability": "online|away|busy",
  "customLabel": "Custom status",
  "pageUrl": "https://google.com"
}

// Get active users for a page
GET /v1/presence/active?pageId=google_com_

// Get active users by communities
GET /v1/presence/communities?communityIds=comm-001,comm-002

// Update user presence
PUT /v1/presence/update
{
  "userEmail": "user@example.com",
  "pageId": "google_com_",
  "availability": "online",
  "customLabel": "Working",
  "auraColor": "#33aa33"
}
```

#### Reactions API (`/v1/reactions/`)
```javascript
// Add reaction to message
POST /v1/reactions
{
  "messageId": "uuid",
  "emoji": "👍",
  "userEmail": "user@example.com"
}

// Get reactions for message
GET /v1/reactions/:messageId

// Remove reaction
DELETE /v1/reactions/:messageId
{
  "emoji": "👍",
  "userEmail": "user@example.com"
}
```

#### Communities API (`/v1/communities/`)
```javascript
// Get user communities
GET /v1/communities/user/:userEmail

// Create community
POST /v1/communities
{
  "name": "Community Name",
  "description": "Description",
  "createdBy": "user@example.com"
}

// Join community
POST /v1/communities/:id/join
{
  "userEmail": "user@example.com"
}
```

### Environment Configuration
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://216.238.91.120:3001/auth/google/callback"

# Server
PORT=3002
SESSION_SECRET="your-session-secret"
```

### Backend Development Patterns

#### 1. Service Layer Pattern
```javascript
// services/presenceService.js
class PresenceService {
  constructor(prisma) {
    this.prisma = prisma;
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  async recordPresenceEvent(userId, pageId, kind, availability = null) {
    // Business logic here
  }

  async getActiveUsers(pageId) {
    // Database queries here
  }
}
```

#### 2. Route Handler Pattern
```javascript
// routes/presence.js
router.post('/event', async (req, res) => {
  try {
    const { userId, pageId, kind, availability } = req.body;
    const result = await presenceService.recordPresenceEvent(userId, pageId, kind, availability);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Presence event error:', error);
    res.status(500).json({ error: 'Failed to record presence event' });
  }
});
```

#### 3. Database Operations with Prisma
```javascript
// Using Prisma ORM
const user = await prisma.appUser.findUnique({
  where: { email: userEmail }
});

const presence = await prisma.user_presence.upsert({
  where: { 
    user_email_page_id: { 
      user_email: userEmail, 
      page_id: pageId 
    }
  },
  update: { 
    is_active: true, 
    last_seen: new Date(),
    user_name: googleProfileName
  },
  create: { 
    user_email: userEmail, 
    page_id: pageId, 
    is_active: true,
    user_name: googleProfileName
  }
});
```

---

## ⚡ Real-time Server Setup

### Overview
The system uses **Supabase** as the real-time backend, providing WebSocket connections for live updates across all modules. This section covers the complete real-time infrastructure setup.

### Real-time Architecture
```
Frontend (Chrome Extension)
    ↓ WebSocket Connection
Supabase Real-time (PostgreSQL + WebSockets)
    ↓ Database Changes
PostgreSQL Database
    ↓ API Calls
Express.js Backend Server
```

### Supabase Configuration

#### 1. Supabase Project Setup
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Get your project URL and anon key
# 3. Configure in .env file

SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

#### 2. Database Schema for Real-time
```sql
-- Enable Row Level Security (RLS) for real-time
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for real-time access
CREATE POLICY "Enable real-time for user_presence" ON user_presence
  FOR ALL USING (true);

CREATE POLICY "Enable real-time for messages" ON messages
  FOR ALL USING (true);

CREATE POLICY "Enable real-time for reactions" ON reactions
  FOR ALL USING (true);
```

#### 3. Real-time Channels Setup
```javascript
// Frontend: Initialize real-time client
class SupabaseRealtimeClient {
  constructor() {
    this.supabase = null;
    this.isConnected = false;
    this.channels = new Map();
  }

  async initialize(supabaseClient) {
    this.supabase = supabaseClient;
    this.isConnected = true;
    
    // Set up real-time subscriptions
    await this.setupPresenceChannel();
    await this.setupMessagesChannel();
    await this.setupReactionsChannel();
  }

  async setupPresenceChannel() {
    const channel = this.supabase
      .channel('user_presence')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => this.handlePresenceUpdate(payload)
      )
      .subscribe();
    
    this.channels.set('presence', channel);
  }

  async setupMessagesChannel() {
    const channel = this.supabase
      .channel('messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => this.handleNewMessage(payload)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => this.handleMessageUpdate(payload)
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => this.handleMessageDelete(payload)
      )
      .subscribe();
    
    this.channels.set('messages', channel);
  }
}
```

### Real-time Event Types

#### 1. Presence Events
```javascript
// User joins a page
{
  event: 'INSERT',
  table: 'user_presence',
  data: {
    user_email: 'user@example.com',
    page_id: 'google_com_',
    is_active: true,
    last_seen: '2025-01-26T00:00:00Z',
    aura_color: '#33aa33'
  }
}

// User leaves a page
{
  event: 'UPDATE',
  table: 'user_presence',
  data: {
    user_email: 'user@example.com',
    page_id: 'google_com_',
    is_active: false,
    last_seen: '2025-01-26T00:05:00Z'
  }
}
```

#### 2. Message Events
```javascript
// New message
{
  event: 'INSERT',
  table: 'messages',
  data: {
    id: 'uuid',
    page_id: 'google_com_',
    user_email: 'user@example.com',
    content: 'Hello world!',
    parent_id: null,
    created_at: '2025-01-26T00:00:00Z'
  }
}

// Message reply
{
  event: 'INSERT',
  table: 'messages',
  data: {
    id: 'uuid',
    page_id: 'google_com_',
    user_email: 'user@example.com',
    content: 'This is a reply',
    parent_id: 'parent-message-uuid',
    created_at: '2025-01-26T00:01:00Z'
  }
}
```

#### 3. Reaction Events
```javascript
// New reaction
{
  event: 'INSERT',
  table: 'reactions',
  data: {
    id: 'uuid',
    message_id: 'message-uuid',
    emoji: '👍',
    user_email: 'user@example.com',
    created_at: '2025-01-26T00:00:00Z'
  }
}
```

### Real-time Integration Patterns

#### 1. Frontend Real-time Setup
```javascript
// Initialize real-time in your module
class YourModule {
  async initialize() {
    // Wait for Supabase to be available
    await this.waitForSupabase();
    
    // Set up real-time listeners
    this.setupRealtimeListeners();
  }

  async waitForSupabase() {
    while (!window.supabase) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  setupRealtimeListeners() {
    // Listen to presence updates
    window.supabase
      .channel('user_presence')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => this.handlePresenceUpdate(payload)
      )
      .subscribe();

    // Listen to message updates
    window.supabase
      .channel('messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => this.handleNewMessage(payload)
      )
      .subscribe();
  }

  handlePresenceUpdate(payload) {
    console.log('Presence update:', payload);
    // Update UI with new presence data
    this.updatePresenceUI(payload.data);
  }

  handleNewMessage(payload) {
    console.log('New message:', payload);
    // Add message to chat UI
    this.addMessageToUI(payload.data);
  }
}
```

#### 2. Backend Real-time Publishing
```javascript
// In your service methods, changes automatically trigger real-time updates
class PresenceService {
  async recordPresenceEvent(userId, pageId, kind, availability = null) {
    // Database operation automatically triggers real-time update
    const presence = await this.prisma.user_presence.upsert({
      where: { 
        user_email_page_id: { 
          user_email: userId, 
          page_id: pageId 
        }
      },
      update: { 
        is_active: kind === 'ENTER',
        last_seen: new Date(),
        availability: availability
      },
      create: { 
        user_email: userId, 
        page_id: pageId, 
        is_active: kind === 'ENTER',
        availability: availability
      }
    });

    // Real-time update is automatically sent to all connected clients
    return presence;
  }
}
```

### Real-time Testing

#### 1. Test Real-time Connection
```javascript
// Test real-time connection
async function testRealtimeConnection() {
  try {
    const supabase = window.supabase;
    
    // Test presence channel
    const presenceChannel = supabase
      .channel('test_presence')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => console.log('Presence test:', payload)
      )
      .subscribe();

    console.log('✅ Real-time connection established');
    return true;
  } catch (error) {
    console.error('❌ Real-time connection failed:', error);
    return false;
  }
}
```

#### 2. Test Real-time Events
```bash
# Test presence event via API
curl -X POST "http://216.238.91.120:3002/v1/presence/event" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "pageId": "test_page",
    "kind": "ENTER"
  }'

# This should trigger a real-time update in the frontend
```

#### 3. Monitor Real-time Events
```javascript
// Add to your module for debugging
class RealtimeDebugger {
  constructor() {
    this.events = [];
  }

  logEvent(type, payload) {
    this.events.push({
      timestamp: new Date(),
      type,
      payload
    });
    
    console.log(`🔔 REALTIME ${type}:`, payload);
  }

  getEventHistory() {
    return this.events;
  }
}
```

### Real-time Troubleshooting

#### Common Issues
1. **Connection Failed**: Check Supabase URL and keys
2. **No Real-time Updates**: Verify RLS policies are enabled
3. **Duplicate Events**: Check for multiple channel subscriptions
4. **Memory Leaks**: Properly unsubscribe from channels

#### Debug Commands
```javascript
// Check Supabase connection
console.log('Supabase client:', window.supabase);

// Check active channels
console.log('Active channels:', window.supabaseRealtimeClient?.channels);

// Test database connection
window.supabase
  .from('user_presence')
  .select('*')
  .limit(1)
  .then(result => console.log('DB test:', result));
```

### Real-time Performance Optimization

#### 1. Channel Management
```javascript
// Properly manage channels to prevent memory leaks
class ChannelManager {
  constructor() {
    this.channels = new Map();
  }

  subscribe(channelName, config) {
    // Unsubscribe from existing channel if exists
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = window.supabase
      .channel(channelName)
      .on('postgres_changes', config, (payload) => {
        this.handleEvent(channelName, payload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  unsubscribe(channelName) {
    const channel = this.channels.get(channelName);
    if (channel) {
      window.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  cleanup() {
    this.channels.forEach((channel, name) => {
      this.unsubscribe(name);
    });
  }
}
```

#### 2. Event Debouncing
```javascript
// Debounce rapid real-time events
class EventDebouncer {
  constructor(delay = 100) {
    this.delay = delay;
    this.timeouts = new Map();
  }

  debounce(key, callback) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    const timeout = setTimeout(() => {
      callback();
      this.timeouts.delete(key);
    }, this.delay);

    this.timeouts.set(key, timeout);
  }
}
```

---

## 🎯 Your Focus: Feature Modules

### 1. 🤖 AgentModule.js
**Purpose**: AI Agent functionality and automation
**Status**: ⚠️ **Needs Implementation**
**Key Responsibilities**:
- AI agent interactions
- Automation workflows
- Agent configuration
- AI response handling

**Current State**:
```javascript
class AgentModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }
  
  async initialize() {
    // TODO: Initialize agent and AI systems here
  }
}
```

### 2. 👥 PeopleModule.js
**Purpose**: People and connections management
**Status**: ⚠️ **Needs Implementation**
**Key Responsibilities**:
- User connections
- Contact management
- People search
- Social features

**Current State**:
```javascript
class PeopleModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }
  
  async initialize() {
    // TODO: Initialize people and connection systems here
  }
}
```

### 3. 🏠 RoomsModule.js
**Purpose**: Room and community management
**Status**: ⚠️ **Needs Implementation**
**Key Responsibilities**:
- Room creation/management
- Room settings
- Room permissions
- Room discovery

**Current State**:
```javascript
class RoomsModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }
  
  async initialize() {
    // TODO: Initialize room and community systems here
  }
}
```

---

## 🔧 Development Guidelines

### Module Structure Template
Each module should follow this structure:

```javascript
/**
 * MODULE_NAME - Brief Description
 * Handles all [module] functionality
 */

class ModuleName {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
    // Add module-specific properties
  }

  /**
   * Initialize Module
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'ModuleName already initialized');
      return;
    }

    this.log('INFO', 'Initializing ModuleName...');
    
    try {
      // TODO: Initialize module systems here
      
      this.isInitialized = true;
      this.log('INFO', 'ModuleName initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize ModuleName:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  log(level, message, ...args) {
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[${level}] ${message}`, ...args);
    }
  }

  // Add your module methods here
}

// Export for global access
window.ModuleName = ModuleName;
```

### Key Dependencies

#### 1. State Management
```javascript
// Access global state
const currentUser = window.currentUser;
const communities = window.getState?.('communities') || [];
const activeCommunities = window.getState?.('activeCommunities') || [];
```

#### 2. Supabase Integration
```javascript
// Database operations
const { data, error } = await window.supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value');
```

#### 3. Event System
```javascript
// Listen to events
window.addEventListener('customEvent', (event) => {
  // Handle event
});

// Emit events
window.dispatchEvent(new CustomEvent('customEvent', {
  detail: { data: 'value' }
}));
```

#### 4. Avatar System
```javascript
// Create avatars
const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(user, {
  size: 32,
  showAura: true,
  showStatus: true
});
```

---

## 🎨 UI/UX Guidelines

### HTML Structure
The main sidepanel structure is in `sidepanel.html`:

```html
<div id="sidepanel">
  <!-- Tab Navigation -->
  <div class="tab-navigation">
    <button class="tab-btn" data-tab="canopi-live-chat">💬</button>
    <button class="tab-btn" data-tab="agent">🤖</button>
    <button class="tab-btn" data-tab="people">👥</button>
    <button class="tab-btn" data-tab="rooms">🏠</button>
    <button class="tab-btn" data-tab="settings">⚙️</button>
  </div>

  <!-- Tab Content -->
  <div class="tab-content">
    <div id="canopi-live-chat" class="tab-pane active">...</div>
    <div id="agent" class="tab-pane">...</div>
    <div id="people" class="tab-pane">...</div>
    <div id="rooms" class="tab-pane">...</div>
    <div id="settings" class="tab-pane">...</div>
  </div>
</div>
```

### CSS Classes
Use these existing CSS classes for consistency:

```css
/* Tab styling */
.tab-btn { /* Tab buttons */ }
.tab-btn.active { /* Active tab */ }
.tab-pane { /* Tab content */ }
.tab-pane.active { /* Active tab content */ }

/* Card styling */
.card { /* General cards */ }
.card-header { /* Card headers */ }
.card-body { /* Card content */ }

/* Button styling */
.btn { /* General buttons */ }
.btn-primary { /* Primary buttons */ }
.btn-secondary { /* Secondary buttons */ }

/* Avatar styling */
.user-avatar { /* User avatars */ }
.avatar-container { /* Avatar containers */ }
```

### Responsive Design
- **Width**: 320px (fixed)
- **Height**: 600px (max)
- **Mobile**: Responsive within Chrome extension constraints

---

## 🔌 Frontend-Backend Integration

### 1. Authentication Flow
```javascript
// Frontend: Check authentication status
if (window.currentUser) {
  const userEmail = window.currentUser.email;
  const userName = window.currentUser.name;
  const userAvatar = window.currentUser.picture;
} else {
  // Trigger Google OAuth flow
  window.location.href = 'http://216.238.91.120:3001/auth/google';
}

// Backend: Google OAuth callback
// routes/auth.js
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // User authenticated, redirect to extension
    res.redirect('chrome-extension://[extension-id]/sidepanel.html');
  }
);
```

### 2. API Communication Patterns

#### Frontend API Calls
```javascript
// All API calls are automatically redirected to VPS
const response = await fetch('/v1/presence/active', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-user-email': window.currentUser.email
  }
});

// Handle response
if (response.ok) {
  const data = await response.json();
  // Process data
} else {
  console.error('API Error:', response.status);
}
```

#### Backend API Response Format
```javascript
// Standard success response
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}

// Standard error response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### 3. Real-time Updates (Supabase)
```javascript
// Frontend: Listen to real-time events
window.supabaseRealtimeClient.on('presence', (payload) => {
  console.log('Presence update:', payload);
  // Update UI with new presence data
});

window.supabaseRealtimeClient.on('messages', (payload) => {
  console.log('New message:', payload);
  // Add message to chat UI
});

// Backend: Publish real-time events
// In your service methods
await this.supabase
  .from('user_presence')
  .insert(presenceData);

// This automatically triggers real-time updates
```

### 4. Database Integration Patterns

#### Frontend → Backend → Database
```javascript
// 1. Frontend makes API call
const addReaction = async (messageId, emoji) => {
  const response = await fetch('/v1/reactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messageId,
      emoji,
      userEmail: window.currentUser.email
    })
  });
  return response.json();
};

// 2. Backend route handler
router.post('/reactions', async (req, res) => {
  const { messageId, emoji, userEmail } = req.body;
  const result = await reactionsService.addReaction(messageId, emoji, userEmail);
  res.json({ success: true, data: result });
});

// 3. Backend service method
async addReaction(messageId, emoji, userEmail) {
  return await this.prisma.reactions.create({
    data: { messageId, emoji, user_email: userEmail }
  });
}
```

### 5. Error Handling Patterns

#### Frontend Error Handling
```javascript
try {
  const response = await fetch('/v1/api/endpoint');
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API call failed:', error);
  // Show user-friendly error message
  showNotification('Failed to load data. Please try again.', 'error');
  return null;
}
```

#### Backend Error Handling
```javascript
router.post('/endpoint', async (req, res) => {
  try {
    const result = await someService.doSomething(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Endpoint error:', error);
    
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid input data',
        details: error.details 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
```

### 6. State Synchronization

#### Frontend State Management
```javascript
// Global state management
window.currentUser = {
  email: 'user@example.com',
  name: 'User Name',
  picture: 'avatar-url'
};

// Module state
class YourModule {
  constructor() {
    this.state = {
      data: [],
      loading: false,
      error: null
    };
  }

  async loadData() {
    this.state.loading = true;
    try {
      const response = await fetch('/v1/your-endpoint');
      this.state.data = await response.json();
      this.state.error = null;
    } catch (error) {
      this.state.error = error.message;
    } finally {
      this.state.loading = false;
    }
  }
}
```

#### Backend State Management
```javascript
// Service-level state management
class YourService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getData(key) {
    // Check cache first
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Fetch from database
    const data = await this.prisma.yourModel.findMany();
    
    // Cache the result
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }
}
```

---

## 🚀 Getting Started

### 1. Full-Stack Development Setup

#### Backend Setup
```bash
# Navigate to project
cd /home/ubuntu/metalayer-initiative

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API keys

# Set up database
npx prisma generate
npx prisma migrate deploy

# Start backend server
node app.js
# Server runs on http://216.238.91.120:3002
```

#### Frontend Setup
```bash
# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the 'presence' folder

# Extension will automatically connect to backend
```

#### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

### 2. Module Development
1. **Choose your module** (Agent, People, or Rooms)
2. **Follow the template** structure above
3. **Implement the `initialize()` method**
4. **Add your specific functionality**
5. **Test with the existing UI structure**

### 3. Testing & Debugging

#### Frontend Testing
```javascript
// Test your module
const module = new YourModule();
await module.initialize();

// Check if it's working
console.log('Module initialized:', module.isInitialized);

// Test API integration
const testAPI = async () => {
  try {
    const response = await fetch('/v1/presence/active?pageId=test');
    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('API Test Failed:', error);
  }
};
```

#### Backend Testing
```bash
# Test API endpoints with curl
curl -X GET "http://216.238.91.120:3002/v1/presence/active?pageId=google_com_" \
  -H "Content-Type: application/json"

curl -X POST "http://216.238.91.120:3002/v1/presence/event" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "pageId": "google_com_",
    "kind": "ENTER"
  }'
```

#### Database Testing
```javascript
// Test database connection
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    const users = await prisma.appUser.findMany();
    console.log('Database connected:', users.length, 'users found');
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
```

#### Real-time Testing
```javascript
// Test Supabase real-time connection
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Listen to changes
supabase
  .channel('user_presence')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'user_presence' },
    (payload) => console.log('Real-time update:', payload)
  )
  .subscribe();
```

---

## 📚 Reference Modules

### Working Examples
- **CanopiModule.js**: Complete chat functionality
- **CommunitiesModule.js**: Community management
- **ProfileManager.js**: User profile management

### Key Patterns
1. **Async initialization** with error handling
2. **Event-driven architecture** using custom events
3. **State management** through StateManager
4. **Real-time updates** via Supabase
5. **Consistent logging** with log levels

---

## 🐛 Debugging

### Console Logs
All modules use consistent logging:
```javascript
this.log('INFO', 'Message');     // General info
this.log('WARN', 'Warning');     // Warnings
this.log('ERROR', 'Error');      // Errors
this.log('DEBUG', 'Debug info'); // Debug info
```

### Common Issues

#### Frontend Issues
1. **Module not loading**: Check for syntax errors
2. **State not available**: Ensure StateManager is loaded first
3. **API calls failing**: Check authentication and headers
4. **UI not updating**: Verify event listeners are attached

#### Backend Issues
1. **Database connection failed**: Check `DATABASE_URL` in `.env`
2. **Prisma client errors**: Run `npx prisma generate` after schema changes
3. **API endpoints returning 500**: Check server logs for detailed error messages
4. **CORS errors**: Verify CORS configuration in `app.js`
5. **Authentication failing**: Check Google OAuth credentials in `.env`

#### Database Issues
1. **Migration failed**: Check migration files in `prisma/migrations/`
2. **Schema out of sync**: Run `npx prisma db push` to sync schema
3. **Connection timeout**: Check database server status and credentials
4. **Unique constraint violations**: Check for duplicate data in database

#### Real-time Issues
1. **Supabase not connecting**: Check `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. **Real-time updates not working**: Verify table has RLS policies enabled
3. **WebSocket connection failed**: Check network connectivity and firewall settings

---

## 📞 Support

### Key Files to Reference

#### Frontend Files
- `sidepanel.html` - Main UI structure
- `sidepanel.js` - Main orchestration
- `StateManager.js` - State management
- `SupabaseRealtimeClient.js` - Real-time functionality
- `AvatarUtils.js` - Avatar handling

#### Backend Files
- `app.js` - Main Express server
- `routes/presence.js` - Presence API endpoints
- `routes/reactions.js` - Reactions API endpoints
- `services/presenceService.js` - Presence business logic
- `prisma/schema.prisma` - Database schema
- `.env` - Environment configuration

### Development Tips
1. **Start simple** - Get basic functionality working first
2. **Follow patterns** - Use existing modules as templates
3. **Test frequently** - Reload extension after changes
4. **Use console logs** - Debug with consistent logging
5. **Check dependencies** - Ensure required modules are loaded

---

## 🎯 Next Steps

1. **Review existing modules** to understand patterns
2. **Choose your module** (Agent, People, or Rooms)
3. **Implement basic structure** following the template
4. **Add core functionality** specific to your module
5. **Integrate with UI** using existing CSS classes
6. **Test thoroughly** with real data and users

---

*This briefing covers the essential information needed to work effectively with the modular architecture. For specific implementation details, refer to the existing working modules and the codebase.*


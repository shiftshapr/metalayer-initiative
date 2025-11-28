# Bike Panel Item 14 - Timelines Feature: Module Design & Architecture

## Overview
This document outlines the module architecture, file structure, and key scaffolding for implementing a high-performing, reliable, and extensible timelines feature.

## Architecture Principles

1. **Modular Design**: Separate concerns into focused modules
2. **Performance First**: Optimize for large datasets and real-time updates
3. **Extensibility**: Easy to add new activity types and features
4. **Reliability**: Robust error handling and fallback mechanisms
5. **Consistency**: Reuse extension patterns and infrastructure

## File Structure

```
metalayer-initiative/
├── routes/
│   └── timelines.js                    # Timeline API routes
├── controllers/
│   └── timelineController.js           # Timeline business logic
├── services/
│   └── timelineService.js              # Timeline data aggregation service
├── public/
│   └── timelines/
│       ├── index.html                  # Main timeline page
│       ├── timeline-app.js             # Main application entry
│       ├── components/
│       │   ├── TimelineView.js         # Core timeline display component
│       │   ├── TimelineItem.js         # Individual timeline item component
│       │   ├── MultiProfileView.js    # Multi-profile comparison component
│       │   ├── ProfileSelector.js      # Profile search/selector component
│       │   ├── TimelineFilters.js      # Filter controls component
│       │   └── ActivityTypeIcon.js     # Activity type icon/badge component
│       ├── modules/
│       │   ├── TimelineManager.js      # Core timeline state management
│       │   ├── TimelineRealtime.js      # Real-time subscription manager
│       │   ├── TimelineCache.js         # Caching layer
│       │   ├── TimelineQuery.js         # Query builder and API client
│       │   └── VisibilityManager.js    # Visibility rules engine
│       ├── utils/
│       │   ├── timelineFormatters.js   # Date/time/activity formatters
│       │   ├── timelineValidators.js    # Input validation
│       │   └── timelineHelpers.js      # Utility functions
│       └── styles/
│           └── timeline.css            # Timeline-specific styles (extends sidepanel.css)
└── tests/
    └── timelines/
        ├── timelineController.test.js
        ├── timelineService.test.js
        └── timelineManager.test.js
```

## Backend Architecture

### 1. Routes (`routes/timelines.js`)

```javascript
const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { authenticateUser } = require('../middleware/auth'); // Reuse existing auth

// GET /api/timelines/:identifier - Get timeline for user (UUID or username)
router.get('/:identifier', authenticateUser, timelineController.getTimeline);

// GET /api/timelines - Get multiple timelines (multi-profile view)
router.get('/', authenticateUser, timelineController.getMultipleTimelines);

module.exports = router;
```

### 2. Controller (`controllers/timelineController.js`)

**Key Responsibilities:**
- Request validation
- Authentication/authorization
- Visibility rule enforcement
- Response formatting
- Error handling

**Key Methods:**
```javascript
class TimelineController {
  /**
   * Get timeline for a single user
   * @param {string} identifier - UUID or username
   * @param {object} queryParams - Filters, pagination, persistence
   */
  async getTimeline(req, res) {
    // Validate identifier
    // Resolve UUID from username if needed
    // Check visibility permissions
    // Call timelineService
    // Format response
  }

  /**
   * Get timelines for multiple users (multi-profile view)
   * @param {string[]} profileIds - Array of user UUIDs
   */
  async getMultipleTimelines(req, res) {
    // Validate profile IDs
    // Check permissions for each profile
    // Parallel fetch timelines
    // Format response
  }
}
```

### 3. Service (`services/timelineService.js`)

**Key Responsibilities:**
- Data aggregation from multiple tables
- Query optimization
- Caching coordination
- Data transformation

**Key Methods:**
```javascript
class TimelineService {
  /**
   * Aggregate timeline data for a user
   */
  async getUserTimeline(userId, options) {
    // options: { persistence, communityFilter, activityTypes, search, pagination }
    // Parallel queries to:
    //   - messages table
    //   - reactions table
    //   - bookmarks table
    //   - user_audit_logs table
    //   - user_presence table
    //   - MetaCommunityMembership table
    // Merge and sort chronologically
    // Apply visibility filters
    // Return unified timeline
  }

  /**
   * Get timeline for multiple users
   */
  async getMultipleUserTimelines(userIds, options) {
    // Parallel calls to getUserTimeline for each user
    // Return array of timelines
  }

  /**
   * Query specific activity type
   */
  async getMessages(userId, options) { }
  async getReactions(userId, options) { }
  async getBookmarks(userId, options) { }
  async getProfileUpdates(userId, options) { }
  async getCommunityJoins(userId, options) { }
  // ... etc for each activity type
}
```

## Frontend Architecture

### 1. Main Application (`public/timelines/timeline-app.js`)

**Key Responsibilities:**
- Application initialization
- Route handling
- Global state coordination
- Module orchestration

```javascript
class TimelineApp {
  constructor() {
    this.timelineManager = new TimelineManager();
    this.realtimeManager = new TimelineRealtime();
    this.cache = new TimelineCache();
    this.query = new TimelineQuery();
    this.visibilityManager = new VisibilityManager();
  }

  async init() {
    // Initialize Supabase client
    // Parse route parameters
    // Load initial timeline data
    // Set up real-time subscriptions
    // Render UI
  }

  async loadTimeline(identifier, options) {
    // Check cache
    // Fetch from API
    // Update cache
    // Render timeline
  }
}
```

### 2. Timeline Manager (`modules/TimelineManager.js`)

**Key Responsibilities:**
- Timeline state management
- Data normalization
- Timeline merging/sorting
- Event coordination

```javascript
class TimelineManager {
  constructor() {
    this.timelines = new Map(); // userId -> TimelineData
    this.currentProfileId = null;
    this.multiProfileIds = [];
    this.filters = {
      persistence: 'all',
      community: null,
      activityTypes: [],
      search: ''
    };
  }

  /**
   * Load timeline for a user
   */
  async loadTimeline(userId, options) {
    // Fetch from API
    // Normalize data
    // Store in this.timelines
    // Emit 'timeline:loaded' event
  }

  /**
   * Add profile to multi-profile view
   */
  async addProfile(userId) {
    // Load timeline if not already loaded
    // Add to multiProfileIds
    // Emit 'profile:added' event
  }

  /**
   * Merge multiple timelines chronologically
   */
  mergeTimelines(userIds) {
    // Get timelines for each userId
    // Merge and sort by timestamp
    // Return unified timeline
  }

  /**
   * Apply filters to timeline
   */
  applyFilters(timeline, filters) {
    // Filter by persistence date range
    // Filter by community
    // Filter by activity types
    // Filter by search query
    // Return filtered timeline
  }

  /**
   * Update timeline with new real-time event
   */
  addRealtimeEvent(userId, event) {
    // Add event to timeline
    // Sort chronologically
    // Emit 'timeline:updated' event
  }
}
```

### 3. Real-time Manager (`modules/TimelineRealtime.js`)

**Key Responsibilities:**
- Supabase subscription management
- Event handling
- Connection management
- Subscription cleanup

```javascript
class TimelineRealtime {
  constructor(supabaseClient, timelineManager) {
    this.client = supabaseClient;
    this.timelineManager = timelineManager;
    this.subscriptions = new Map(); // userId -> Subscription[]
  }

  /**
   * Subscribe to real-time updates for a user
   */
  async subscribeToUser(userId) {
    if (this.subscriptions.has(userId)) {
      return; // Already subscribed
    }

    const subscriptions = [];

    // Subscribe to messages
    const messagesSub = this.client
      .channel(`timeline:${userId}:messages`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.handleMessageEvent(userId, payload);
      })
      .subscribe();

    subscriptions.push(messagesSub);

    // Subscribe to reactions
    const reactionsSub = this.client
      .channel(`timeline:${userId}:reactions`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.handleReactionEvent(userId, payload);
      })
      .subscribe();

    subscriptions.push(reactionsSub);

    // Subscribe to profile updates (audit logs)
    const profileSub = this.client
      .channel(`timeline:${userId}:profile`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_audit_logs',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.handleProfileUpdateEvent(userId, payload);
      })
      .subscribe();

    subscriptions.push(profileSub);

    // ... more subscriptions for other activity types

    this.subscriptions.set(userId, subscriptions);
  }

  /**
   * Unsubscribe from user updates
   */
  unsubscribeFromUser(userId) {
    const subscriptions = this.subscriptions.get(userId);
    if (subscriptions) {
      subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.delete(userId);
    }
  }

  /**
   * Handle real-time message event
   */
  handleMessageEvent(userId, payload) {
    const event = this.normalizeMessageEvent(payload);
    this.timelineManager.addRealtimeEvent(userId, event);
  }

  // ... similar handlers for other event types
}
```

### 4. Query Builder (`modules/TimelineQuery.js`)

**Key Responsibilities:**
- API request building
- Parameter serialization
- Response parsing
- Error handling

```javascript
class TimelineQuery {
  constructor(baseUrl = '/api/timelines') {
    this.baseUrl = baseUrl;
  }

  /**
   * Build query parameters
   */
  buildQueryParams(options) {
    const params = new URLSearchParams();
    
    if (options.persistence) params.set('persistence', options.persistence);
    if (options.community) params.set('community', options.community);
    if (options.search) params.set('search', options.search);
    if (options.activityTypes?.length) {
      params.set('type', options.activityTypes.join(','));
    }
    if (options.page) params.set('page', options.page);
    if (options.limit) params.set('limit', options.limit);

    return params.toString();
  }

  /**
   * Fetch timeline for user
   */
  async getTimeline(identifier, options = {}) {
    const params = this.buildQueryParams(options);
    const url = `${this.baseUrl}/${identifier}?${params}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-User-Id': this.getCurrentUserId(),
          // ... other auth headers
        }
      });

      if (!response.ok) {
        throw new Error(`Timeline fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Timeline query error:', error);
      throw error;
    }
  }

  /**
   * Fetch multiple timelines
   */
  async getMultipleTimelines(userIds, options = {}) {
    const params = this.buildQueryParams(options);
    params.set('profiles', userIds.join(','));
    const url = `${this.baseUrl}?${params}`;
    
    // Similar fetch logic
  }
}
```

### 5. Cache Manager (`modules/TimelineCache.js`)

**Key Responsibilities:**
- Timeline data caching
- Cache invalidation
- Cache expiration
- Memory management

```javascript
class TimelineCache {
  constructor() {
    this.cache = new Map(); // userId -> { data, timestamp, ttl }
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached timeline
   */
  get(userId) {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.cache.delete(userId);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached timeline
   */
  set(userId, data, ttl = this.defaultTTL) {
    this.cache.set(userId, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Invalidate cache for user
   */
  invalidate(userId) {
    this.cache.delete(userId);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }
}
```

### 6. Visibility Manager (`modules/VisibilityManager.js`)

**Key Responsibilities:**
- Visibility rule evaluation
- Permission checking
- Data filtering based on visibility

```javascript
class VisibilityManager {
  constructor(currentUserId, userCommunities) {
    this.currentUserId = currentUserId;
    this.userCommunities = userCommunities;
  }

  /**
   * Check if activity is visible to current user
   */
  isVisible(activity, activityType, targetUserId) {
    // Get visibility setting for activity type
    const visibility = this.getVisibilitySetting(activityType, targetUserId);
    
    switch (visibility) {
      case 'public':
        return true;
      case 'community':
        return this.isInSameCommunity(targetUserId);
      case 'private':
        return this.currentUserId === targetUserId;
      case 'group':
        // TBD - future feature
        return false;
      default:
        return false;
    }
  }

  /**
   * Filter timeline based on visibility
   */
  filterTimeline(timeline, targetUserId) {
    return timeline.filter(activity => {
      return this.isVisible(
        activity,
        activity.type,
        targetUserId
      );
    });
  }

  /**
   * Check if users share communities
   */
  isInSameCommunity(targetUserId) {
    // Check if targetUserId is in any of current user's communities
    // Implementation depends on how community membership is stored
  }
}
```

## Component Architecture

### 1. TimelineView Component

```javascript
class TimelineView {
  constructor(container, timelineManager) {
    this.container = container;
    this.timelineManager = timelineManager;
    this.renderMode = 'single'; // 'single' | 'multi' | 'merged'
  }

  /**
   * Render timeline
   */
  render(timeline, options = {}) {
    if (this.renderMode === 'multi') {
      this.renderMultiProfile(timeline, options);
    } else if (this.renderMode === 'merged') {
      this.renderMerged(timeline, options);
    } else {
      this.renderSingle(timeline, options);
    }
  }

  /**
   * Render single profile timeline
   */
  renderSingle(timeline, options) {
    const items = timeline.map(activity => {
      const item = new TimelineItem(activity);
      return item.render();
    });

    this.container.innerHTML = items.join('');
    this.setupEventListeners();
  }

  /**
   * Render multi-profile view
   */
  renderMultiProfile(timelines, options) {
    // Render side-by-side columns
    // Each column is a TimelineView for one profile
  }

  /**
   * Setup event listeners for timeline items
   */
  setupEventListeners() {
    // Click handlers, hover effects, etc.
  }
}
```

### 2. TimelineItem Component

```javascript
class TimelineItem {
  constructor(activity) {
    this.activity = activity;
    this.formatter = new TimelineFormatter();
  }

  /**
   * Render timeline item
   */
  render() {
    const template = this.getTemplate();
    return this.populateTemplate(template);
  }

  /**
   * Get template based on activity type
   */
  getTemplate() {
    const templates = {
      message: this.getMessageTemplate(),
      reaction: this.getReactionTemplate(),
      bookmark: this.getBookmarkTemplate(),
      profileUpdate: this.getProfileUpdateTemplate(),
      // ... etc
    };

    return templates[this.activity.type] || this.getDefaultTemplate();
  }

  /**
   * Populate template with activity data
   */
  populateTemplate(template) {
    return template
      .replace('{{timestamp}}', this.formatter.formatTimestamp(this.activity.timestamp))
      .replace('{{content}}', this.getContent())
      .replace('{{icon}}', this.getIcon())
      .replace('{{visibility}}', this.activity.visibility);
  }
}
```

## Data Models

### Timeline Activity Model

```javascript
class TimelineActivity {
  constructor(data) {
    this.id = data.id;
    this.type = data.type; // 'message', 'reaction', 'bookmark', etc.
    this.userId = data.userId;
    this.timestamp = new Date(data.timestamp);
    this.visibility = data.visibility; // 'public', 'community', 'private'
    this.data = data.data; // Type-specific data
    this.metadata = data.metadata || {};
  }

  /**
   * Normalize activity from different sources
   */
  static fromMessage(message) {
    return new TimelineActivity({
      id: message.id,
      type: 'message',
      userId: message.user_id,
      timestamp: message.created_at,
      visibility: this.determineVisibility(message),
      data: {
        content: message.content,
        communityId: message.community_id,
        communityName: message.community?.name
      }
    });
  }

  static fromReaction(reaction) {
    // Similar normalization
  }

  // ... static methods for each activity type
}
```

## Performance Optimizations

### 1. Database Query Optimization

```javascript
// Use efficient queries with proper indexes
// Parallel queries where possible
// Use database views for complex aggregations
// Implement pagination at database level
```

### 2. Frontend Optimization

```javascript
// Virtual scrolling for long timelines
// Debounced search/filter inputs
// Lazy loading of timeline items
// Request deduplication
// Efficient DOM updates (use DocumentFragment)
```

### 3. Caching Strategy

```javascript
// Cache timeline data with TTL
// Cache user profile data
// Cache community membership
// Invalidate cache on real-time updates
```

## Error Handling

### Error Types

```javascript
class TimelineError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

class TimelineNotFoundError extends TimelineError {
  constructor(userId) {
    super(`Timeline not found for user: ${userId}`, 'TIMELINE_NOT_FOUND');
  }
}

class TimelinePermissionError extends TimelineError {
  constructor(userId) {
    super(`No permission to view timeline: ${userId}`, 'PERMISSION_DENIED');
  }
}
```

## Testing Strategy

### Unit Tests
- TimelineManager methods
- TimelineQuery parameter building
- VisibilityManager rule evaluation
- TimelineFormatter formatting

### Integration Tests
- API endpoint responses
- Real-time subscription handling
- Multi-profile view functionality
- Cache invalidation

### E2E Tests
- Full timeline load and display
- Real-time updates
- Multi-profile comparison
- Filter and search functionality

## Extension Points

### Adding New Activity Types

1. Add query method in `TimelineService`
2. Add normalization in `TimelineActivity`
3. Add template in `TimelineItem`
4. Add real-time subscription in `TimelineRealtime`
5. Update activity type filter options

### Adding New Visibility Rules

1. Extend `VisibilityManager.isVisible()`
2. Update visibility configuration UI
3. Add backend validation

## Integration Points

### With Extension
- Share Supabase client configuration
- Reuse authentication system
- Share CSS/styling
- Reuse component patterns

### With Backend
- Use existing auth middleware
- Follow existing route patterns
- Use existing database connections
- Follow existing error handling patterns

## Next Steps

1. Create file structure
2. Implement backend routes and controller
3. Implement TimelineService with database queries
4. Implement frontend modules
5. Create UI components
6. Add real-time subscriptions
7. Implement caching
8. Add error handling
9. Write tests
10. Performance optimization


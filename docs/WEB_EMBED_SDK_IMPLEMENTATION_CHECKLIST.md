# Web-Embed SDK Implementation Checklist

## Phase 1: Foundation (Week 1-2)

### Database Setup
- [ ] Create `canopi_embed_instances` table
- [ ] Create `canopi_embed_analytics` table
- [ ] Create indexes for performance
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create helper functions (update_updated_at, generate_embed_code)
- [ ] Write and test database migrations
- [ ] Set up database backups

### Backend API
- [ ] Set up API route structure (`/api/embeds/*`)
- [ ] Implement authentication middleware
- [ ] Create instance CRUD endpoints:
  - [ ] `POST /api/embeds/instances` - Create
  - [ ] `GET /api/embeds/instances` - List
  - [ ] `GET /api/embeds/instances/:id` - Get
  - [ ] `PUT /api/embeds/instances/:id` - Update
  - [ ] `DELETE /api/embeds/instances/:id` - Delete
- [ ] Implement public config endpoint:
  - [ ] `GET /api/embeds/config/:canopiId` - Public config (no auth)
- [ ] Implement analytics endpoints:
  - [ ] `POST /api/embeds/analytics/events` - Track event
  - [ ] `GET /api/embeds/analytics/:id` - Get analytics
- [ ] Add input validation
- [ ] Add error handling
- [ ] Add rate limiting
- [ ] Write API tests
- [ ] Document API endpoints

### Admin Dashboard UI - Basic
- [ ] Create admin dashboard page/route
- [ ] Build instance list view
- [ ] Build create instance form:
  - [ ] Name and description fields
  - [ ] Community selector
  - [ ] Domain whitelist input
  - [ ] Basic page targeting (all pages option)
  - [ ] Basic trigger config (corner tab only)
- [ ] Build instance detail/edit view
- [ ] Implement embed code display
- [ ] Add copy-to-clipboard for embed code
- [ ] Add delete confirmation
- [ ] Style with existing design system
- [ ] Add loading states
- [ ] Add error handling UI

### Testing
- [ ] Unit tests for database functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for admin dashboard flow
- [ ] Test RLS policies
- [ ] Test error scenarios

---

## Phase 2: SDK Core (Week 3-4)

### SDK Loader Script
- [ ] Create `embed/v1.js` loader script
- [ ] Implement configuration parsing from data attributes
- [ ] Implement page matching engine
- [ ] Add error handling and logging
- [ ] Add CSP compatibility
- [ ] Minify and optimize (< 2KB target)
- [ ] Set up CDN deployment
- [ ] Add versioning strategy
- [ ] Test on multiple browsers

### Main SDK Bundle
- [ ] Create `embed/sdk.js` main bundle
- [ ] Implement trigger component (corner tab):
  - [ ] Create DOM element
  - [ ] Position styling (4 corners)
  - [ ] Basic hover tooltip
  - [ ] Click handler
- [ ] Implement sidebar loader:
  - [ ] Fetch sidebar HTML/CSS/JS
  - [ ] Inject into page
  - [ ] Handle CSS conflicts
  - [ ] Handle JS conflicts
- [ ] Implement sidebar state management:
  - [ ] Open/close state
  - [ ] Animation (slide in from right)
  - [ ] Z-index management
- [ ] Connect to backend API
- [ ] Implement authentication flow
- [ ] Add responsive behavior (mobile)
- [ ] Add error boundaries
- [ ] Test on various websites

### Sidebar Integration
- [ ] Extract sidebar HTML/CSS/JS for embedding
- [ ] Create embed-specific sidebar wrapper
- [ ] Handle iframe vs direct injection decision
- [ ] Implement communication bridge
- [ ] Test sidebar functionality in embed context
- [ ] Ensure all features work (chat, visibility, etc.)

### Testing
- [ ] Unit tests for page matching
- [ ] Unit tests for trigger component
- [ ] Integration tests for SDK loading
- [ ] E2E tests for full flow (load → trigger → sidebar)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Test on real websites

---

## Phase 3: Trigger Customization (Week 5)

### Bouncing Icon
- [ ] Implement bouncing icon component
- [ ] Add CSS animations (subtle, normal, aggressive)
- [ ] Add pause-on-hover behavior
- [ ] Add stop-after-interaction behavior
- [ ] Make it configurable via trigger config

### Position Configuration
- [ ] Add offset configuration (X, Y pixels)
- [ ] Update admin UI to include offset inputs
- [ ] Test edge cases (near viewport edges)
- [ ] Add position preview in admin

### Hover Message
- [ ] Enhance tooltip component
- [ ] Add customizable message text
- [ ] Add tooltip styling options
- [ ] Add delay configuration
- [ ] Test on various screen sizes

### Visual Customization
- [ ] Add icon selection (preset icons)
- [ ] Add custom icon upload
- [ ] Add color picker
- [ ] Add size options (small, medium, large)
- [ ] Update admin UI with all options
- [ ] Add live preview in admin

### Admin UI Updates
- [ ] Add trigger type selector
- [ ] Add position selector with visual preview
- [ ] Add message input field
- [ ] Add color picker
- [ ] Add size selector
- [ ] Add icon selector/upload
- [ ] Add bounce intensity selector (for bouncing icon)
- [ ] Add auto-show delay input
- [ ] Add hide-after-click toggle
- [ ] Add show-on-mobile toggle

### Testing
- [ ] Test all trigger configurations
- [ ] Test visual customizations
- [ ] Test on different screen sizes
- [ ] Test animation performance

---

## Phase 4: Page Targeting (Week 6)

### URL Pattern Matching
- [ ] Enhance page matching engine:
  - [ ] Wildcard support (`/help/*`)
  - [ ] Exact URL matching
  - [ ] Multiple pattern support
- [ ] Add pattern validation
- [ ] Add pattern testing tool

### Admin UI for Page Targeting
- [ ] Add page targeting section:
  - [ ] "All pages" toggle
  - [ ] "Specific URLs" textarea
  - [ ] "URL Patterns" textarea
- [ ] Add pattern validation UI
- [ ] Add pattern testing UI (test URL input)
- [ ] Add help text and examples
- [ ] Add pattern preview/list

### SPA Support
- [ ] Detect SPA navigation (History API)
- [ ] Re-check page match on navigation
- [ ] Handle hash-based routing
- [ ] Test with React Router
- [ ] Test with Vue Router
- [ ] Test with Angular Router

### Advanced Targeting (Future)
- [ ] Regex pattern support
- [ ] Query parameter matching
- [ ] Hash-based routing support
- [ ] Custom matching functions

### Testing
- [ ] Test all targeting scenarios
- [ ] Test SPA navigation
- [ ] Test edge cases (subdomains, ports, etc.)
- [ ] Test pattern validation

---

## Phase 5: Analytics & Polish (Week 7-8)

### Analytics Tracking
- [ ] Implement event tracking in SDK:
  - [ ] `page_view` - On SDK load
  - [ ] `trigger_impression` - When trigger shown
  - [ ] `trigger_hover` - On hover
  - [ ] `sidebar_open` - On open
  - [ ] `sidebar_close` - On close
  - [ ] `message_post` - On message sent
  - [ ] `auth_prompt` - When auth shown
  - [ ] `auth_complete` - When auth completed
- [ ] Add session tracking
- [ ] Add user tracking (anonymous + authenticated)
- [ ] Implement analytics API calls
- [ ] Add error handling for analytics
- [ ] Add batching for analytics events
- [ ] Add retry logic

### Admin Dashboard Analytics
- [ ] Create analytics view/page
- [ ] Display summary metrics:
  - [ ] Total page views
  - [ ] Total trigger impressions
  - [ ] Total sidebar opens
  - [ ] Open rate (CTR)
  - [ ] Total messages
  - [ ] Unique users
- [ ] Display time series chart
- [ ] Display top pages list
- [ ] Add date range selector
- [ ] Add export functionality
- [ ] Add real-time updates (optional)

### Error Handling & Logging
- [ ] Add comprehensive error logging
- [ ] Add error reporting to admin
- [ ] Add error boundaries in SDK
- [ ] Add graceful degradation
- [ ] Add error notifications

### Performance Optimization
- [ ] Optimize SDK bundle size
- [ ] Add lazy loading for sidebar
- [ ] Optimize analytics event batching
- [ ] Add CDN caching headers
- [ ] Optimize database queries
- [ ] Add query result caching
- [ ] Performance testing and profiling

### Documentation
- [ ] Write admin user guide
- [ ] Write developer integration guide
- [ ] Write troubleshooting guide
- [ ] Create example embed codes
- [ ] Document all configuration options
- [ ] Create video tutorials (optional)
- [ ] Update main documentation site

### Testing & QA
- [ ] Comprehensive testing across browsers
- [ ] Mobile device testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Accessibility testing
- [ ] Load testing
- [ ] User acceptance testing

---

## Phase 6: Advanced Features (Future)

### Iframe Isolation
- [ ] Research iframe approach
- [ ] Implement iframe option
- [ ] Add iframe communication bridge
- [ ] Test iframe isolation
- [ ] Add iframe toggle in admin

### Advanced Targeting
- [ ] Regex pattern support
- [ ] Query parameter matching
- [ ] Custom matching functions
- [ ] A/B testing support

### Custom Styling
- [ ] Custom CSS injection
- [ ] Theme customization
- [ ] Brand color matching

### Multi-language
- [ ] Internationalization support
- [ ] Language detection
- [ ] Translation system

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Backup strategy in place

### Deployment
- [ ] Deploy database migrations
- [ ] Deploy backend API
- [ ] Deploy admin dashboard
- [ ] Deploy SDK to CDN
- [ ] Update DNS if needed
- [ ] Enable monitoring

### Post-Deployment
- [ ] Verify all endpoints working
- [ ] Test embed on staging site
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Plan hotfixes if needed

---

## Success Criteria

### Technical
- [ ] SDK loads in < 100ms
- [ ] Sidebar opens in < 500ms
- [ ] 99.9% uptime
- [ ] < 1% error rate
- [ ] Works on all major browsers
- [ ] Mobile responsive

### Business
- [ ] At least 10 instances created in first month
- [ ] At least 5 websites using embed
- [ ] > 20% open rate (trigger → sidebar)
- [ ] Positive user feedback

---

## Notes

- Update this checklist as implementation progresses
- Mark items as complete with date and notes
- Add new items as needed
- Review weekly with team







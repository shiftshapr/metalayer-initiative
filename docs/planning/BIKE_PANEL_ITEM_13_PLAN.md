# Bike Panel Item 13 - Feature Enhancement Plan

## Overview
This plan covers the implementation of multiple message and profile features to enhance user experience and align with COMP standards.

## Features Breakdown

### 1. Enable Links in Messages
**Current State:**
- Basic URL detection exists via `convertUrlsToLinks()` function
- Only handles `http://` and `https://` URLs

**Requirements:**
- Enhance link detection to support:
  - Markdown-style links: `[text](url)`
  - Relative URLs
  - Email addresses: `mailto:` links
  - Better URL pattern matching (www.example.com)
- Add link preview/card support
- Ensure links open safely (existing `target="_blank" rel="noopener noreferrer"` is good)
- Support link editing when editing messages

**Implementation Location:**
- `/home/ubuntu/metalayer-initiative/presence/features/CanopiModule.js`
  - Function: `convertUrlsToLinks()` (lines 256, 2963)
  - Update both instances for consistency

**Tasks:**
1. Enhance `convertUrlsToLinks()` function
2. Add markdown link parsing
3. Add email link support
4. Test link detection with various URL formats
5. Update message edit functionality to preserve links

---

### 2. Enable @Mentions in Messages
**Current State:**
- No mention parsing exists
- Notification system exists (NotificationManager.js)
- User list available from visibility data

**Requirements:**
- Parse `@username` patterns in message content
- Detect mentions as user types (autocomplete dropdown)
- Create mention UI (highlighted text with user link)
- Store mentions in database (message_mentions table or similar)
- Send notifications to mentioned users
- Support mention click-through to user profiles

**Implementation Location:**
- `/home/ubuntu/metalayer-initiative/presence/features/CanopiModule.js`
  - Add `parseMentions()` function
  - Add `convertMentionsToHTML()` function
  - Update `addMessageToChat()` to process mentions
  - Update message input handler for autocomplete
- `/home/ubuntu/metalayer-initiative/presence/features/NotificationManager.js`
  - Add mention notification handler

**Tasks:**
1. Create mention parsing regex and function
2. Add mention autocomplete UI in message input
3. Create mention storage (database schema)
4. Add mention highlighting in messages
5. Integrate with notification system
6. Add mention click handlers

---

### 3. Enable Message Sharing
**Current State:**
- `handleShareMessage()` function exists (line 1652)
- Basic share types: 'link', 'focus', 'navigate', 'notify'
- Copy link functionality exists

**Requirements:**
- Enhance existing sharing functionality
- Add share menu/button to messages
- Support additional share methods:
  - Copy message link
  - Copy message text
  - Share to external services (if needed)
  - Share message to specific users/channels
- Ensure share links work across sessions

**Implementation Location:**
- `/home/ubuntu/metalayer-initiative/presence/features/CanopiModule.js`
  - Function: `handleShareMessage()` (line 1652)
  - Function: `handleCopyLink()` (line 1777)
  - Message action menu (line 1753)

**Tasks:**
1. Review and enhance `handleShareMessage()` function
2. Add share button to message UI
3. Improve share link generation
4. Add share to user/channel functionality
5. Test share link persistence

---

### 4. Activate Status Dot
**Current State:**
- Status dot rendering exists in `AvatarUtils.js` (lines 197, 215, 230)
- Status dot logic uses `user.is_active` flag
- Status dot color: green (#22c55e) for active, gray (#6b7280) for inactive
- Some avatars have `showStatus: false` (e.g., profile avatar in sidepanel.js line 1068)

**Requirements:**
- Ensure status dots are visible on all relevant avatars
- **Implement real-time status dot updates** (requires Supabase real-time subscription)
- Check status dot positioning and styling
- Enable status dots where currently disabled

**Implementation Location:**
- `/home/ubuntu/metalayer-initiative/presence/utils/AvatarUtils.js`
- `/home/ubuntu/metalayer-initiative/presence/sidepanel.js` (line 1068)
- `/home/ubuntu/metalayer-initiative/presence/features/CanopiModule.js` (message avatars)
- Real-time subscription handlers for user status updates

**Tasks:**
1. Review all avatar creation calls for `showStatus` flag
2. Enable status dots on profile avatars
3. **Set up real-time subscription for user status changes**
4. **Update status dots when user.is_active changes in real-time**
5. Test status dot visibility and positioning
6. Ensure consistent status dot styling

**Note:** This feature requires real-time updates and may be more complex than initially expected. Status changes must propagate immediately across all connected clients.

---

### 5. Align Visibility Settings with COMP (including Profile Headline)
**Current State:**
- Visibility settings exist in VisibilityManager.js
- COMP appears to be a reference implementation
- Headline API exists (`/routes/users.js` - lines 226-255, 292-311)
- Headline service exists (`/services/userService.js` - line 189)
- No UI for headline input in visibility settings

**Requirements:**
- Review COMP visibility settings structure (headline may be included)
- Match current visibility settings to COMP structure
- Add headline input field to COMP-aligned visibility settings UI
- Ensure consistent UI/UX with COMP
- Align settings terminology and behavior
- Display headline in user profile and visibility list
- Validate headline length/format

**Implementation Location:**
- `/home/ubuntu/metalayer-initiative/presence/features/VisibilityManager.js`
- `/home/ubuntu/metalayer-initiative/presence/features/SettingsModule.js`
- `/home/ubuntu/metalayer-initiative/presence/features/ProfileManager.js`
- Visibility settings UI components

**Tasks:**
1. Research/document COMP visibility settings structure (including headline)
2. Compare current settings with COMP
3. Identify gaps and differences
4. Align settings UI with COMP (incorporating headline field)
5. Integrate with existing headline API
6. Update settings behavior to match COMP
7. Add headline validation

---

### 7. Restructure Message UI Layout
**Current State:**
- Message input field is at bottom of container
- Messages display in chronological order (oldest first)
- Messages are displayed in current container structure

**Requirements:**
- Archive current message display implementation for later use
- Move message input field to top of container
- Reverse message order (latest messages at top)
- Maintain scroll behavior (auto-scroll to latest when new messages arrive)
- Ensure real-time updates work with new layout

**Implementation Location:**
- `/home/ubuntu/metalayer-initiative/presence/features/CanopiModule.js`
  - Message container structure
  - Message rendering (`addMessageToChat`)
  - Message input positioning
- Archive location: Create archived version of current message display

**Tasks:**
1. Create archive of current message display code
2. Restructure message container (input at top)
3. Reverse message order logic
4. Update scroll behavior for top-to-bottom flow
5. Test real-time message updates with new layout
6. Ensure message editing/actions still work correctly

---

### 8. Restructure Tab Navigation
**Current State:**
- Canopi tab exists containing Conversations and Visible
- Tab structure may be defined in sidepanel.js or main UI structure

**Requirements:**
- Remove Canopi tab
- Move Conversations to be its own tab (rename to "Discuss")
- Move Visible to be its own tab (rename to "Visibility")
- Ensure all functionality remains intact
- Update any navigation/routing logic

**Implementation Location:**
- Main UI structure file (likely `sidepanel.js` or main HTML/structure file)
- Tab navigation components
- Routing/navigation logic

**Tasks:**
1. Identify Canopi tab implementation
2. Extract Conversations functionality
3. Extract Visible functionality
4. Create new "Discuss" tab (renamed from Conversations)
5. Create new "Visibility" tab (renamed from Visible)
6. Remove Canopi tab
7. Update navigation/routing if needed
8. Test all tab functionality

---

### 9. Add Image Upload
**Current State:**
- No image upload functionality exists
- Message system supports text content only

**Requirements:**
- Add image file picker to message input
- Upload images to storage (Supabase Storage or similar)
- Display images in messages (inline or as attachments)
- Support image preview before sending
- Validate image file types and sizes
- Handle image loading errors gracefully

**Implementation Location:**
- `/home/ubuntu/metalayer-initiative/presence/features/CanopiModule.js`
  - Message input handler
  - Message rendering (`addMessageToChat`)
- New file: Image upload service/module
- Storage configuration (Supabase)

**Tasks:**
1. Add image file picker to message input UI
2. Create image upload service
3. Configure storage bucket/permissions
4. Add image display in messages
5. Add image preview functionality
6. Implement image size/type validation
7. Add error handling for failed uploads

---

### 10. Notifications with Real-time Updates
**Current State:**
- Notification system exists (NotificationManager.js)
- May have basic notification functionality
- Need to verify real-time update capabilities

**Requirements:**
- Display notifications UI/panel
- Subscribe to real-time notification updates via Supabase
- Show notification count/badge
- Display notification list with latest first
- Mark notifications as read/unread
- Support notification types (mentions, messages, etc.)
- Real-time updates when new notifications arrive
- Update notification count in real-time

**Implementation Location:**
- `/home/ubuntu/metalayer-initiative/presence/features/NotificationManager.js`
- Notification UI components (may need new component)
- Real-time subscription handlers

**Tasks:**
1. Review existing NotificationManager implementation
2. Create/update notifications UI component
3. Set up real-time subscription for notifications
4. Implement notification display (list/panel)
5. Add notification count/badge
6. Implement read/unread status
7. Test real-time notification updates
8. Integrate with @mentions and other notification sources

---

## Implementation Order (Recommended)

1. **Tab Navigation Restructure** (Quick structural change)
   - Remove Canopi tab, create Discuss and Visibility tabs
2. **Message UI Layout Restructure** (Better UX, should be early)
   - Archive current display, move input to top, reverse order
3. **Links Enhancement** (Builds on existing)
4. **Notifications with Real-time Updates** (Foundation for other features)
   - Enables real-time notifications for mentions, messages, etc.
5. **@Mentions** (Complex, requires autocomplete and notifications)
   - Depends on notifications real-time system
6. **Status Dot Activation** (Requires real-time updates - moderate complexity)
   - Needs real-time subscription for user status changes
7. **Visibility Settings Alignment with COMP** (Includes headline)
   - Combine headline with COMP alignment
8. **Image Upload** (New feature, requires storage setup)
9. **Message Sharing Enhancement** (Builds on existing)

## Technical Considerations

### Database Schema Changes
- May need `message_mentions` table for mentions
- May need `message_attachments` or extend messages table for images
- Headline already supported in user profiles
- May need `notifications` table or extend existing notification structure
- Ensure `user.is_active` field supports real-time updates

### Storage Requirements
- Image storage bucket configuration
- Storage quota management
- Image compression/optimization

### Performance
- Image upload size limits
- Lazy loading for message images
- Optimized mention autocomplete
- Real-time subscription management (avoid duplicate subscriptions)
- Efficient notification polling/updates
- Message list rendering performance with reversed order

### Security
- Image file type validation
- Image content scanning (optional)
- Secure storage access controls
- Link validation for security

## Testing Checklist

- [ ] Tab navigation works (Discuss and Visibility tabs, Canopi removed)
- [ ] Message input is at top, messages display latest-first
- [ ] Message layout archived correctly
- [ ] Links work correctly in messages
- [ ] Notifications display and update in real-time
- [ ] Notification count updates correctly
- [ ] @mentions parse and notify correctly
- [ ] Message sharing works across sessions
- [ ] Profile headline saves and displays in COMP-aligned settings
- [ ] Status dots appear and update in real-time
- [ ] Images upload and display correctly
- [ ] Visibility settings match COMP behavior
- [ ] All features work in real-time across multiple users

## Notes

- COMP appears to be a reference implementation - look for COMP-compatible patterns in codebase
- Existing code uses "COMP METHOD" comments indicating compatibility requirements
- Real-time updates are critical - ensure all features propagate via Supabase real-time
- Follow existing code patterns and module structure


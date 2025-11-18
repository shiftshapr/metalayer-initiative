# Message Display: Default Mode vs Focus Mode

## Overview

The Canopi extension uses a **unified rendering system** (`UnifiedMessageRenderer`) that handles both default and focus modes. The key principle is: **always render full HTML structure, use CSS classes for visibility control**.

## Default Mode

### How It Works

1. **Message Loading** (`loadChatHistory` in `CanopiModule.js`):
   - Fetches messages from Supabase/API ordered by `created_at DESC` (newest first)
   - **Filters out replies** - only thread starters (messages without `parentId`) are rendered
   - All messages (including replies) are stored in `window.currentChatData` for thread expansion

2. **Rendering Process**:
   ```javascript
   // Line 768-772: Filter replies
   const messagesToRender = allMessages.filter(msg => !msg.parentId);
   
   // Line 791: Render with isFocusMode: false
   const html = await UnifiedMessageRenderer.generateMessageHTML(message, {
       isReply: isReply,
       isFocusMode: false,  // ← Default mode
       // ... other options
   });
   ```

3. **HTML Structure** (from `UnifiedMessageRenderer.generateMessageHTML`):
   ```html
   <div class="avatar-container">[Avatar]</div>
   <div class="message-content-wrapper">
     <div class="message-header-new">
       <span class="message-sender-name">[Name]</span>
       <span class="message-time-new">[Time in header]</span>  <!-- ← Time in header -->
       <div class="message-actions-new">[Action menu]</div>
     </div>
     <div class="message-content">[Content]</div>
   </div>
   <div class="message-footer">
     <div class="message-footer-actions">
       [Reply, Repost, Reaction, Bookmark, Share buttons]
     </div>
   </div>
   ```

4. **Key Characteristics**:
   - **Time display**: In header (line 107: `showHeaderDate = !isFocusMode`)
   - **Replies**: Hidden by default (filtered out before rendering)
   - **Thread expansion**: Replies shown when thread toggle is clicked
   - **CSS classes**: `message thread-starter` for main messages

### Reply Visibility Logic

```javascript
// Line 820-835: Reply visibility check
if (isReply) {
    const threadToggle = document.querySelector(`[data-thread-id="${conversationId}"]`);
    if (threadToggle && threadToggle.dataset.expanded === 'true') {
        // Thread expanded - show reply
        messageDiv.classList.add('visible');
    } else if (window.focusedMessage) {
        // In focus mode - show all replies
        messageDiv.classList.add('visible');
    } else {
        // Replies collapsed by default
        // No 'visible' class = hidden by CSS
    }
}
```

## Focus Mode

### How It Works

1. **Trigger** (`handleMessageFocus` in `CanopiModule.js` line 499):
   - User clicks on a message or navigates to a message URL
   - Sets `window.focusedMessage` to the focused message
   - Sets `window.chatMessages` container to `data-focus-mode="true"` or adds `focus-mode-active` class

2. **Rendering Process**:
   ```javascript
   // When in focus mode, UnifiedMessageRenderer.renderMessage is called with:
   const html = await UnifiedMessageRenderer.renderMessage(message, {
       isReply: isReply,
       isFocusMode: true,  // ← Focus mode
       // ... other options
   });
   ```

3. **HTML Structure** (same structure, different time placement):
   ```html
   <div class="avatar-container">[Avatar]</div>
   <div class="message-content-wrapper">
     <div class="message-header-new">
       <span class="message-sender-name">[Name]</span>
       <!-- Time in header for replies, footer for thread starters -->
       <div class="message-actions-new">[Action menu]</div>
     </div>
     <div class="message-content">[Content]</div>
   </div>
   <div class="message-footer">
     <div class="focus-date-row">  <!-- ← Time in footer for thread starters -->
       <span class="message-time-new focus-date">[Time]</span>
     </div>
     <div class="message-footer-actions">
       [Reply, Repost, Reaction, Bookmark, Share buttons]
     </div>
   </div>
   ```

4. **Key Characteristics**:
   - **Time display**: 
     - Thread starters: In footer (line 108: `dateInFooter` for focus mode)
     - Replies: In header (line 106: `showHeaderDate = isFocusMode && isReplyMessage`)
   - **Replies**: **All replies are visible immediately** (line 202-204: `messageDiv.classList.add('visible', 'message-loaded')`)
   - **CSS classes**: `message message-reply thread-reply visible` for replies
   - **Container**: `chat-messages[data-focus-mode="true"]` or `.focus-mode-active`

### Time Formatting Logic

```javascript
// Line 172-175: Different time formats for focus mode
const isReplyMessage = isReply || !!(message.parentId);
const useDefaultFormat = isFocusMode && isReplyMessage;
const formattedTime = this.formatMessageTime(
    message.createdAt || message.created_at, 
    !useDefaultFormat && isFocusMode  // Focus mode uses relative time for thread starters
);
```

**Time Format** (`formatMessageTime` line 241-256):
- Default mode: Relative time (e.g., "5m", "2h", "3d")
- Focus mode thread starters: Relative time in footer
- Focus mode replies: Relative time in header (same as default)

## Key Differences Summary

| Feature | Default Mode | Focus Mode |
|---------|-------------|------------|
| **Replies** | Hidden (filtered out) | All visible immediately |
| **Time Location** | Header for all messages | Footer for thread starters, header for replies |
| **Time Format** | Relative (5m, 2h, 3d) | Relative (same format) |
| **Thread Expansion** | Required to see replies | Replies always visible |
| **Container Class** | `chat-messages` | `chat-messages[data-focus-mode="true"]` or `.focus-mode-active` |
| **Message Classes** | `message thread-starter` | `message thread-starter` (starters) or `message message-reply thread-reply visible` (replies) |
| **CSS Styling** | Standard spacing, borders | Removed borders, different spacing (line 1330-1350 in sidepanel.css) |

## Rendering Pipeline

### Default Mode Flow:
```
1. loadChatHistory() called
2. Fetch messages from API/Supabase (ordered DESC)
3. Filter: messagesToRender = allMessages.filter(msg => !msg.parentId)
4. For each message:
   - UnifiedMessageRenderer.generateMessageHTML(message, { isFocusMode: false })
   - Create messageDiv with class "message thread-starter"
   - Append to chatMessages container
5. Attach action listeners
6. Load reactions, reply counts, permissions
```

### Focus Mode Flow:
```
1. handleMessageFocus(message) called
2. Set window.focusedMessage = message
3. Set chatMessages container to focus mode (data-focus-mode="true")
4. Load all messages including replies
5. For each message:
   - UnifiedMessageRenderer.renderMessage(message, { isFocusMode: true })
   - If reply: add classes "visible message-loaded"
   - Append to focus container
6. All replies are immediately visible
```

## CSS Control

The system uses CSS classes to control visibility rather than `display: none`:

```css
/* Default mode: Replies hidden by default */
.message.message-reply.thread-reply:not(.visible) {
  display: none;  /* Hidden until thread expanded */
}

/* Focus mode: All replies visible */
.chat-messages[data-focus-mode="true"] .message.message-reply.thread-reply {
  display: block;  /* Always visible */
}

/* Focus mode styling */
.chat-messages[data-focus-mode="true"] .message.thread-starter {
  border: none;  /* Remove borders */
}
```

## Unified Rendering Principle

The `UnifiedMessageRenderer` is the **single source of truth** for message rendering. It:
- Generates the same HTML structure for both modes
- Uses the `isFocusMode` parameter to adjust time placement and formatting
- Ensures consistency between modes
- Prevents zero-height issues by always rendering full structure

This unified approach ensures that:
- Messages look consistent across modes
- CSS can control visibility without JavaScript manipulation
- The same rendering logic handles both modes
- No duplicate code for different modes


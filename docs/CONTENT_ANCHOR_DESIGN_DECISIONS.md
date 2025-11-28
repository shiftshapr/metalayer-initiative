# Content Anchor - Design Decision Options

**Date**: 2025-01-24

## Phase 7 Explanation

**Phase 7: Right-Click Context Menu (Future)** is about implementing **Chrome Extension Context Menu API** integration.

**Difference from Phase 2:**
- **Phase 2**: Custom context menu/widget that appears when you select content (JavaScript-based, appears on page)
- **Phase 7**: Native browser context menu integration using Chrome's `chrome.contextMenus` API (appears in browser's right-click menu)

**Example:**
- Phase 2: Select text → Custom widget appears on page → "Anchor Message" button
- Phase 7: Right-click anywhere → Browser context menu → "Anchor Message" option (native browser menu)

**Current Status**: Phase 7 is marked "Future" but Phase 2 already includes context menu work, creating confusion.

---

## Design Decision Options

### Decision 1: Focus Mode Behavior

**User Intention Context**:
When a user anchors a message, they are:
- **Responding to specific content** on a page (text, image, video, etc.)
- **Creating context** for their message by linking it to source material
- **Engaging with content** they want to discuss or reference

The user's goal is to **write a message that is clearly connected to the anchored content**. They want to ensure their message is properly associated with the content they selected.

**Question**: Should focus mode be automatic when anchor is attached, or user preference?

#### Option A: Automatic (Recommended)
- **Behavior**: Message composer automatically opens in focus mode when anchor is attached
- **User can exit**: User can manually exit focus mode if desired
- **User Intention Alignment**: 
  - ✅ Supports user's goal of creating a clear connection between message and content
  - ✅ Reduces distraction so user can focus on writing the anchored message
  - ✅ Makes it clear the message is in "anchor mode" - user knows context is preserved
- **Pros**:
  - ✅ Consistent UX - anchor always gets full attention
  - ✅ Reduces cognitive load - user knows they're in anchor mode
  - ✅ Clear visual indication that anchor is active
- **Cons**:
  - ❌ May interrupt user if they didn't want focus mode
  - ❌ Could feel intrusive for power users

#### Option B: User Preference
- **Behavior**: User sets preference in settings (always/never/ask)
- **Pros**:
  - ✅ User control
  - ✅ Flexible for different workflows
- **Cons**:
  - ❌ More complex to implement
  - ❌ Inconsistent experience across users
  - ❌ Requires settings UI

#### Option C: Smart Detection
- **Behavior**: Automatic if anchor is first action, manual if user already in composer
- **Pros**:
  - ✅ Best of both worlds
  - ✅ Context-aware
- **Cons**:
  - ❌ More complex logic
  - ❌ May be confusing (why sometimes automatic, sometimes not?)

**Recommendation**: **Option A (Automatic)** - Simple, consistent, user can always exit. Most users will appreciate the focused experience when anchoring.

---

### Decision 2: Anchor Indicator Placement

**Question**: Should indicator be above input (like "replying to") or inline with icon?

#### Option A: Above Input (Like "Replying to")
- **Layout**:
  ```
  ┌─────────────────────────────┐
  │ ⓘ Anchored to: "text..."   │
  │ [Message Input Field]      │
  └─────────────────────────────┘
  ```
- **Pros**:
  - ✅ Consistent with existing "replying to" pattern
  - ✅ Very visible - user always sees it
  - ✅ Easy to read full anchor preview
- **Cons**:
  - ❌ Takes vertical space
  - ❌ May feel cluttered in compact views

#### Option B: Inline Icon Only
- **Layout**:
  ```
  ┌─────────────────────────────┐
  │ [ⓘ] [Message Input Field]   │
  └─────────────────────────────┘
  ```
- **Pros**:
  - ✅ Minimal space usage
  - ✅ Clean, modern look
  - ✅ Good for mobile
- **Cons**:
  - ❌ Less discoverable
  - ❌ Requires hover/click to see details
  - ❌ May be missed

#### Option C: Hybrid (Recommended)
- **Layout**:
  ```
  ┌─────────────────────────────┐
  │ [ⓘ] [Message Input Field]   │  ← Line 1: Icon is INLINE with input field
  │    ⓘ Anchored to: "text..." │  ← Line 2: Expandable badge appears below
  └─────────────────────────────┘
  ```

- **What is "Inline"?**: 
  - Icon (ⓘ) appears on the **same line** as the message input field
  - Positioned to the left or right of the input field
  - Example: `[ⓘ] [Type your message here...]`

- **What is "Expandable Badge"?**:
  - A **collapsible UI component** that shows anchor details
  - **Default state**: Hidden/collapsed (saves space)
  - **Expanded state**: Shows full anchor preview (text snippet, image preview, source URL)
  - **Trigger**: User clicks icon OR hovers over icon
  - **Visual**: Appears below the input field, similar to how "Replying to [parent]" appears
  - **Example**: Like GitHub's expandable commit details or Slack's expandable message details

- **Behavior**: 
  1. Icon (ⓘ) always visible on same line as input field
  2. User clicks/hovers icon → Badge expands below showing anchor details
  3. User can collapse badge by clicking again or clicking [×]

- **Pros**:
  - ✅ Best of both worlds
  - ✅ Space-efficient by default (badge hidden)
  - ✅ Full details available on demand (badge expands)
  - ✅ Works well on mobile and desktop
  - ✅ Icon on same line = always visible, doesn't take extra vertical space
- **Cons**:
  - ❌ Slightly more complex to implement (need expand/collapse logic)
  - ❌ Requires interaction to see full preview (but icon is always visible)

**Recommendation**: **Option C (Hybrid)** - Icon always visible for discoverability, expandable badge for details. This matches modern UI patterns (like GitHub's expandable details).

---

### Decision 3: Hover Scroll Behavior

**Question**: Should hover always scroll to content, or only if content not visible?

#### Option A: Always Scroll
- **Behavior**: Hover over anchor icon → Always scrolls to content, even if already visible
- **Pros**:
  - ✅ Consistent behavior - user always knows what will happen
  - ✅ Simple implementation
  - ✅ Ensures content is centered/highlighted
- **Cons**:
  - ❌ Can be jarring if content already visible
  - ❌ May cause unwanted scrolling
  - ❌ Performance impact (unnecessary scrolls)

#### Option B: Viewport Check (Recommended)
- **Behavior**: Hover over anchor icon → Only scrolls if content not in viewport
- **Pros**:
  - ✅ Better UX - no unnecessary scrolling
  - ✅ Better performance - only scrolls when needed
  - ✅ Less jarring - respects user's current view
- **Cons**:
  - ❌ Slightly more complex (need viewport detection)
  - ❌ May not scroll if content is partially visible (edge case)

#### Option C: Smart Scroll with Offset
- **Behavior**: Scrolls if content not in viewport OR if content is too close to edges (needs padding)
- **Pros**:
  - ✅ Best UX - ensures content is comfortably visible
  - ✅ Handles edge cases (content at top/bottom of viewport)
- **Cons**:
  - ❌ Most complex to implement
  - ❌ Requires calculating optimal scroll position

**Recommendation**: **Option B (Viewport Check)** - Good balance of UX and performance. Only scrolls when necessary, avoids jarring movements.

---

### Decision 4: Highlight Duration

**Question**: How long should highlight persist on click?

#### Option A: Fixed Duration (2-3 seconds)
- **Behavior**: Highlight appears, fades out after 2-3 seconds
- **Pros**:
  - ✅ Simple, predictable
  - ✅ No cleanup needed
  - ✅ Consistent with hover behavior
- **Cons**:
  - ❌ May disappear before user sees it
  - ❌ Not enough time for slow readers
  - ❌ Too short for complex content

#### Option B: Until User Interaction (Recommended)
- **Behavior**: Highlight persists until user clicks, scrolls, or interacts with page
- **Pros**:
  - ✅ User controls duration
  - ✅ No time pressure
  - ✅ Good for complex content that needs study
- **Cons**:
  - ❌ May persist too long if user forgets
  - ❌ Requires cleanup on interaction
  - ❌ Slightly more complex

#### Option C: Fixed Duration with Maximum (Recommended Alternative)
- **Behavior**: Highlight persists until user interaction OR 30 seconds (whichever first)
- **Pros**:
  - ✅ Best of both worlds
  - ✅ User control + automatic cleanup
  - ✅ Prevents highlights from persisting forever
- **Cons**:
  - ❌ Most complex (needs timer + interaction detection)
  - ❌ May still disappear before user is done

#### Option D: User Preference
- **Behavior**: User sets duration in settings (5s/15s/30s/until interaction)
- **Pros**:
  - ✅ Maximum flexibility
  - ✅ Accommodates different user needs
- **Cons**:
  - ❌ Requires settings UI
  - ❌ Most complex to implement
  - ❌ May be overkill for this feature

**Recommendation**: **Option C (Fixed Duration with Maximum)** - 30 seconds or until interaction. Gives users time to read while preventing permanent highlights. If too complex, fall back to **Option B (Until User Interaction)**.

---

### Decision 5: Reply + Anchor Display

**Higher-Level Data/Architecture Decision**:

This is fundamentally about **how to represent multiple message relationships in the data model and UI**.

**Data Model Context**:
A message can have:
- **Reply relationship**: `message.parentId` → links to parent message
- **Anchor relationship**: `message.optionalContent` → contains `ContentAnchor` object

**Architecture Question**: How should the system handle messages that have **both relationships simultaneously**?

**Options from Data/Architecture Perspective**:

#### Option A: Stack Vertically (Equal Priority)
- **Data Model**: Both relationships stored, both displayed with equal prominence
- **UI Strategy**: Show both contexts in separate lines
- **Architecture**: Treats reply and anchor as **independent, equal relationships**
- **Pros**:
  - ✅ Clear data model - both relationships are first-class citizens
  - ✅ No prioritization logic needed
  - ✅ Both contexts fully visible
- **Cons**:
  - ❌ Takes more UI space
  - ❌ May feel cluttered

#### Option B: Inline with Separator (Equal Priority, Compact)
- **Data Model**: Both relationships stored, both displayed inline
- **UI Strategy**: Show both in one line with separator
- **Architecture**: Treats reply and anchor as **independent but compactly displayed**
- **Pros**:
  - ✅ Space-efficient
  - ✅ Both relationships visible
- **Cons**:
  - ❌ May be cramped
  - ❌ Harder to read

#### Option C: Icon Only for Anchor (Hierarchical Priority)
- **Data Model**: Both relationships stored, but **reply is primary, anchor is secondary**
- **UI Strategy**: Reply shows full text (primary), anchor shows icon (secondary)
- **Architecture**: Establishes **relationship hierarchy**:
  - Reply relationship = **primary context** (always shown in full)
  - Anchor relationship = **secondary context** (shown as icon, details on demand)
- **Data Implication**: System treats reply as more important than anchor when both exist
- **Pros**:
  - ✅ Clear hierarchy - reply is conversation context, anchor is content reference
  - ✅ Clean, compact
  - ✅ Both relationships preserved in data model
  - ✅ Anchor details available on demand (hover/click)
- **Cons**:
  - ❌ Anchor less prominent (but this may be intentional - reply is conversation context)
  - ❌ Requires hover for anchor details

#### Option D: Contextual (Dynamic Priority)
- **Data Model**: Both relationships stored, priority determined dynamically
- **UI Strategy**: Show most relevant relationship prominently
- **Architecture**: Requires **priority calculation logic**:
  - How to determine which is more important?
  - Based on user action? (Did they click reply first or anchor first?)
  - Based on content type? (Is anchor more important for media?)
  - Based on message content? (Does message text reference anchor more?)
- **Pros**:
  - ✅ Context-aware
  - ✅ Emphasizes what's most important
- **Cons**:
  - ❌ Complex logic needed (how to determine priority?)
  - ❌ Inconsistent experience (same data, different display)
  - ❌ May confuse users (why is anchor prominent sometimes but not others?)
  - ❌ Harder to test and maintain

**Architecture Recommendation**: **Option C (Hierarchical Priority)**

**Reasoning**:
1. **Clear Data Model**: Both relationships stored, but with clear hierarchy
2. **Semantic Meaning**: 
   - Reply = **conversation context** (who you're responding to)
   - Anchor = **content reference** (what you're referencing)
   - These serve different purposes, so different display makes sense
3. **Scalability**: If we add more relationships later (e.g., "tagged users", "related topics"), hierarchy pattern scales
4. **User Mental Model**: Users understand "replying to" as conversation flow, "anchored to" as content reference
5. **Implementation**: Simpler than Option D (no priority calculation), cleaner than Option A (less space)

**Data Structure**:
```typescript
interface Message {
  id: string;
  parentId?: string;        // Reply relationship (primary)
  optionalContent?: string;  // ContentAnchor JSON (secondary)
  // Display logic: if parentId exists, show "Replying to" prominently
  //                if optionalContent exists, show anchor icon
  //                if both exist, show "Replying to" + anchor icon
}
```

---

## Summary of Decisions

1. **Focus Mode**: Option A (Automatic) - Simple, consistent, user can exit
2. **Anchor Indicator**: Option C (Hybrid) - Icon inline + expandable badge below
3. **Hover Scroll**: **Option C (Smart Scroll with Offset)** - ✅ SELECTED - Best UX, ensures content comfortably visible
4. **Highlight Duration**: **Option C (30s or until interaction)** - ✅ SELECTED - Best balance
5. **Reply + Anchor**: **Option C (Hierarchical Priority)** - ✅ SELECTED - Reply primary, anchor secondary (icon)

---

## Implementation Complexity

**Easy (1-2 days)**:
- Decision 1: Option A (Automatic focus mode)
- Decision 2: Option A (Above input)
- Decision 3: Option A (Always scroll)

**Medium (3-5 days)**:
- Decision 2: Option C (Hybrid)
- Decision 3: Option B (Viewport check)
- Decision 4: Option B (Until interaction)
- Decision 5: Option C (Icon only)

**Complex (1+ weeks)**:
- Decision 1: Option B (User preference)
- Decision 3: Option C (Smart scroll with offset)
- Decision 4: Option C (Fixed + max) or Option D (User preference)
- Decision 5: Option D (Contextual)

---

**Next Step**: PM to review and select options for each decision.


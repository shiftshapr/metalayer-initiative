# Anchored Messages Implementation Plan

## Overview

This plan outlines the TypeScript implementation for anchoring messages to specific content on web pages. Messages can be anchored to text (full sentences only), images, videos, audio, quotes, headings, and links.

## Content Anchor Types

### Supported Types

1. **Text** (`text`) - Text selection, **must be a full sentence**
2. **Image** (`image`) - Image elements
3. **Video** (`video`) - Video elements  
4. **Audio** (`audio`) - Audio elements
5. **Quote** (`quote`) - Blockquote or citation elements
6. **Heading** (`heading`) - Heading elements (h1-h6)
7. **Link** (`link`) - Anchor/link elements

### Text Selection Rules

- **Full Sentence Requirement**: Text selections must be complete sentences
- **Auto-Expansion**: If user selects partial text, the selection automatically expands to include the full sentence(s)
- **Sentence Detection**: Uses regex pattern `/[.!?]+[\s\n]*/g` to detect sentence boundaries
- **Boundary Expansion**: Expands selection to nearest sentence boundaries before and after the selected text
- **Context Phrases**: Captures phrase before and after selection (up to 50 chars each, null if at paragraph boundary)

### Media Selection Rules

- **Audio/Video Timestamps**: Optional start and end timestamps (same pattern as image coordinates)
  - No timestamps: Anchor to entire media
  - Start only: Anchor to a specific point in time
  - Start + End: Anchor to a time range (end only valid if start is provided)
- **Image Coordinates**: Optional start and end coordinates (same pattern as timestamps)
  - No coordinates: Anchor to entire image
  - Start only: Anchor to a specific point
  - Start + End: Anchor to a rectangle region (end only valid if start is provided)
  - Coordinate system: Percentage (0-100) or pixels
- **Future AI Support**: Complex shapes and object detection (see `AI_ANCHOR_EVOLUTION.md`)

## Architecture

### Type Definitions

**File**: `src/types/anchors.ts`

- `AnchorContentType` - Union type of supported content types
- `ContentAnchor` - Complete anchor metadata structure
- `AnchoredMessage` - Message with optional anchor
- `TextSelectionValidation` - Validation result for text selections
- `ContentSelectionEvent` - Event structure for content selection

### Core Manager

**File**: `src/features/ContentAnchorManager.ts`

The `ContentAnchorManager` class provides:

1. **Text Selection Validation** (`validateTextSelection`)
   - Ensures selection is a full sentence
   - Expands partial selections to complete sentences
   - Returns validation result with expanded text

2. **Anchor Creation Methods**:
   - `createTextAnchor()` - Creates anchor from text selection
   - `createImageAnchor()` - Creates anchor from image element
   - `createVideoAnchor()` - Creates anchor from video element
   - `createAudioAnchor()` - Creates anchor from audio element

3. **Selector Generation**:
   - `generateSelector()` - Creates CSS selector for element
   - `generateXPath()` - Creates XPath for element

4. **Serialization**:
   - `serializeAnchor()` - Converts anchor to JSON string
   - `deserializeAnchor()` - Parses anchor from JSON string

## Implementation Phases

### Phase 1: Type System & Core Manager ✅

- [x] Create `src/types/anchors.ts` with all type definitions
- [x] Create `src/features/ContentAnchorManager.ts` with core functionality
- [x] Implement text selection validation with full sentence requirement
- [x] Implement anchor creation methods for all content types
- [x] Implement selector/XPath generation

### Phase 2: Content Script Integration

**File**: `src/content/ContentSelectionHandler.ts` (new TypeScript content script)

- [ ] Convert `content.js` to TypeScript
- [ ] Integrate `ContentAnchorManager` for validation
- [ ] Update selection widget to use TypeScript types
- [ ] Implement full sentence expansion UI feedback
- [ ] Add visual indicator when selection is expanded to full sentence
- [ ] **NEW**: Implement rectangle selection overlay for images
- [ ] **NEW**: Add drag-to-select rectangle functionality
- [ ] **NEW**: Implement context menu integration (right-click "Anchor Message")
- [ ] **NEW**: Add anchor icon (ⓘ) activation mode for selection

**Features**:
- Text selection automatically expands to full sentences
- Visual feedback shows original selection vs. expanded selection
- Selection widget shows anchor type and preview
- Support for image, video, audio selection via click
- **NEW**: Rectangle selection for images (drag-to-select)
- **NEW**: Context menu option for "Anchor Message"
- **NEW**: Anchor icon activation mode

### Phase 3: Message Composer Integration

**File**: `src/features/MessageComposer.ts` (new or update existing)

- [ ] Add anchor input field to message composer
- [ ] Handle `startMessageWithContent` action from content script
- [ ] Pre-populate composer with anchor data
- [ ] Display anchor preview in composer
- [ ] Serialize anchor to `optionalContent` field when sending
- [ ] **NEW**: Implement focus mode activation when anchor is attached
- [ ] **NEW**: Add anchor indicator UI near input field (similar to "replying to")
- [ ] **NEW**: Implement anchor icon (ⓘ) in input area
- [ ] **NEW**: Add anchor removal button ([×])
- [ ] **NEW**: Show anchor preview in expandable badge format
- [ ] **NEW**: Auto-focus message input field when anchor is attached

**Message Flow**:
1. User selects content on page
2. Content script validates and creates anchor
3. Sends `startMessageWithContent` action with anchor data
4. Sidepanel receives action and opens message composer in **focus mode**
5. Composer displays:
   - **Anchor indicator** near input field (icon + expandable badge)
   - Anchor preview (full sentence/media preview)
   - Source URL
   - Message input field (auto-focused)
6. User writes message
7. Message sent with anchor serialized in `optionalContent` field

### Phase 4: Message Display

**File**: `src/features/MessageRenderer.ts` (update existing)

- [ ] Update `Message` interface to include `anchor?: ContentAnchor`
- [ ] Deserialize `optionalContent` field to `ContentAnchor` when loading messages
- [ ] Render anchor preview in message display
- [ ] Add click handler to navigate to anchored content
- [ ] Show anchor type icon (ⓘ for all types - unified icon)
- [ ] **NEW**: Implement hover-to-preview functionality
- [ ] **NEW**: Implement scroll-to-highlight on hover
- [ ] **NEW**: Add temporary highlight effect (2-3 second fade)
- [ ] **NEW**: Implement click-to-navigate with persistent highlight
- [ ] **NEW**: Add tooltip on hover showing anchor preview
- [ ] **NEW**: Support multiple display options (see `ANCHOR_DISPLAY_OPTIONS.md`)

**Display Format Options** (see `ANCHOR_DISPLAY_OPTIONS.md` for full details):
- **Default**: Anchor icon (ⓘ) near timestamp/header
- **Hover**: Tooltip with preview + auto-scroll to content + highlight
- **Click**: Navigate to source + scroll + persistent highlight
- **Recommended**: Hybrid approach based on context (compact icon + expandable preview)

### Phase 5: Database Schema Update

**File**: `prisma/schema.current.prisma`

- [ ] Update `Message.optionalContent` field documentation
- [ ] Consider adding separate `anchorType` field for indexing
- [ ] Consider adding `anchorSourceUrl` field for querying
- [ ] Add migration if schema changes needed

**Current Schema**:
```prisma
model Message {
  optionalContent String? // JSON-serialized ContentAnchor
}
```

### Phase 6: API Integration

**File**: `src/services/APIService.ts` (update existing)

- [ ] Update `sendMessage` method to accept `ContentAnchor` type
- [ ] Serialize anchor before sending to API
- [ ] Update message fetching to deserialize anchors
- [ ] Add validation for anchor data


## User Experience Flow

### Text Selection Flow

**Primary Flow (Selection Widget):**
1. User selects text on a webpage
2. Selection widget appears
3. System automatically expands selection to full sentence(s)
4. Widget shows:
   - Original selection (highlighted)
   - Expanded selection (with indicator)
   - "Anchor Message" button
5. User clicks "Anchor Message"
6. Sidepanel opens with message composer in **focus mode**
7. Composer shows:
   - **Anchor indicator** near input field (similar to "replying to [parent]")
   - Anchor preview (full sentence)
   - Source URL
   - Message input field (focused)
8. User writes message and sends
9. Message appears with anchor icon (ⓘ)

**Alternative Flow (Context Menu):**
1. User selects text on a webpage
2. User right-clicks → Context menu appears
3. User selects "Anchor Message" option
4. System validates and expands to full sentence(s)
5. Sidepanel opens with message composer in focus mode
6. (Same as steps 7-9 above)

**Alternative Flow (Anchor Icon Activation):**
1. User clicks anchor icon (ⓘ) in message input area
2. Selection mode activates
3. User selects text on page
4. Selection automatically expands to full sentence(s)
5. Anchor data populates input form
6. Anchor icon changes to "anchored" state
7. User writes message and sends

### Image Selection Flow

**Primary Flow (Click Selection):**
1. User clicks on image element
2. Selection widget appears with image preview
3. Widget shows:
   - Image thumbnail
   - Alt text or description
   - "Anchor Message" button
4. User clicks "Anchor Message"
5. Sidepanel opens with message composer in **focus mode**
6. Composer shows:
   - **Anchor indicator** near input field
   - Image preview
   - Source URL
   - Message input field (focused)
7. User writes message and sends
8. Message appears with anchor icon (ⓘ)

**Alternative Flow (Rectangle Selection):**
1. User clicks image OR drags rectangle on image
2. **Rectangle selection overlay** appears:
   - Semi-transparent overlay
   - Draggable corners for adjustment
   - "Confirm" and "Cancel" buttons
3. User adjusts rectangle and confirms
4. System captures image URL + coordinates
5. "Anchor Message" option appears
6. User clicks "Anchor Message"
7. Sidepanel opens with message composer in focus mode
8. Composer shows:
   - **Anchor indicator** with coordinate info
   - Image preview with selection rectangle
   - Source URL
   - Message input field (focused)
9. User writes message and sends
10. Message appears with anchor icon (ⓘ)

### Media Selection Flow (Video/Audio)

1. User clicks on video/audio element OR selects time range
2. Selection widget appears with media preview
3. Widget shows:
   - Media thumbnail (if applicable)
   - Start/end timestamps (if selected)
   - "Anchor Message" button
4. User clicks "Anchor Message"
5. Sidepanel opens with message composer in **focus mode**
6. Composer shows:
   - **Anchor indicator** near input field
   - Media preview with timestamp info
   - Source URL
   - Message input field (focused)
7. User writes message and sends
8. Message appears with media anchor icon (ⓘ)

### Anchor Display & Interaction

**On Message Display:**
1. Message shows anchor icon (ⓘ) near timestamp or in message header
2. **Hover Interaction:**
   - User hovers over anchor icon
   - Page automatically scrolls to anchored content
   - Content highlights temporarily (2-3 second fade)
   - Tooltip shows anchor preview
3. **Click Interaction:**
   - User clicks anchor icon
   - Navigates to source page (if different)
   - Scrolls to and highlights anchored content
   - Highlights persist until user interaction

**Anchor Indicator in Input Field:**
- **Location**: Near message input or reply input field
- **Format Options**:
  - **Option A (Inline Badge)**: `📍 Anchored to: "selected text..." [×]`
  - **Option B (Icon)**: `[ⓘ]` icon with tooltip on hover
  - **Recommended**: Both - icon for compact, expandable badge for details
- **Removal**: Click [×] to remove anchor before sending
- **Visual State**: Icon changes to "anchored" state when active

## Technical Details

### Sentence Detection Algorithm

```typescript
// Find sentence boundaries using regex
const sentenceRegex = /[.!?]+[\s\n]*/g;

// Expand selection to include:
// 1. Last sentence boundary before selection start
// 2. First sentence boundary after selection end
// 3. All sentences in between
```

### Selector Generation

- **CSS Selector**: Uses ID, class, and nth-child for uniqueness
- **XPath**: Generates absolute XPath for precise targeting
- **Fallback**: Uses both for redundancy

### Anchor Serialization

```typescript
// Anchor stored as JSON string in optionalContent field
const serialized = JSON.stringify({
  type: 'text',
  content: 'Full sentence text...',
  sourceUrl: 'https://example.com/page',
  selector: '#content > p:nth-child(2)',
  xpath: '/html/body/div[1]/p[2]',
  textRange: { start: 0, end: 50 },
  timestamp: '2025-01-20T12:00:00Z'
});
```

## Testing Requirements

### Unit Tests

- [ ] `ContentAnchorManager.validateTextSelection()` - Various text selections
- [ ] `ContentAnchorManager.createTextAnchor()` - Anchor creation
- [ ] `ContentAnchorManager.createImageAnchor()` - Image anchor creation
- [ ] Sentence boundary detection edge cases
- [ ] Selector generation accuracy

### Integration Tests

- [ ] Content selection widget appearance
- [ ] Full sentence expansion UI
- [ ] Message composer anchor pre-population
- [ ] Message display with anchor
- [ ] Anchor navigation (click to scroll to content)

### E2E Tests

- [ ] Complete text selection flow
- [ ] Complete image selection flow
- [ ] Message creation with anchor
- [ ] Message display and anchor interaction

## Migration Notes

### From Current Implementation

1. **Database**: `optionalContent` field already exists - no migration needed
2. **API**: Already accepts `optionalContent` parameter - just needs proper serialization
3. **Display**: Already shows anchor with 📍 icon - needs deserialization and better formatting
4. **Content Script**: Already has selection widget - needs TypeScript conversion and full sentence validation

### Breaking Changes

- None expected - this is an enhancement to existing functionality
- Backward compatible with existing `optionalContent` strings (if they're not JSON, they'll be treated as plain text)

## Future Enhancements

1. **Rich Anchor Preview**: Show actual content snippet in message display
2. **Anchor Navigation**: Click anchor to scroll to content on source page
3. **Anchor Verification**: Verify anchor still exists and matches content hash
4. **Multiple Anchors**: Support multiple anchors per message
5. **Anchor Sharing**: Share messages with anchors to highlight specific content
6. **Anchor Analytics**: Track which content gets anchored most often

## Related Files

- `presence/content.js` - Current content script (to be converted to TypeScript)
- `presence/features/CanopiModule.js` - Message rendering (to be updated)
- `presence/features/APIModule.js` - API calls (to be updated)
- `prisma/schema.current.prisma` - Database schema
- `presence/src/types/index.ts` - Update Message interface
- `presence/src/services/APIService.ts` - API service (to be updated)

## Shared Types with Smart Tag SDK

**IMPORTANT**: The anchor types defined in `src/types/anchors.ts` are **shared** with the Smart Tag SDK (`canopi.tag`). 

- **Do NOT duplicate** anchor type definitions in the Smart Tag SDK
- Smart Tag SDK should **import** anchor types from `src/types/anchors.ts`
- This ensures consistency and maintainability across features
- Both anchored messages and smart tags use the same `ContentAnchor`, `TextAnchorContext`, `MediaTimestampRange`, `ImageCoordinateRange`, and `ObjectAnchor` types

See `docs/SIDEBAR_TAB_SDK_STATUS.md` for SDK implementation details.

## Merged Features from New Spec

This document has been updated to incorporate new UX ideas while maintaining the existing technical foundation. The following features have been added:

### New UX Features Added:
1. ✅ **Focus Mode Integration**: Message composer opens in focus mode when anchor is attached
2. ✅ **Anchor Indicator in Input Field**: Similar to "replying to [parent]" indicator
3. ✅ **Anchor Icon (ⓘ)**: Unified icon design for all anchor types
4. ✅ **Hover-to-Preview**: Auto-scroll and highlight on hover over anchor icon
5. ✅ **Rectangle Selection for Images**: Drag-to-select rectangle overlay
6. ✅ **Context Menu Integration**: Right-click "Anchor Message" option
7. ✅ **Anchor Icon Activation Mode**: Click icon to activate selection mode
8. ✅ **Expandable Badge**: Anchor preview in expandable format near input
9. ✅ **Auto-focus Input**: Message input field auto-focuses when anchor attached
10. ✅ **Multiple Display Options**: Support for various display styles (see `ANCHOR_DISPLAY_OPTIONS.md`)

### Technical Foundation Preserved:
- ✅ Full sentence requirement for text anchors
- ✅ Auto-expansion of partial text selections
- ✅ TypeScript implementation (Phase 1 complete)
- ✅ Selector/XPath generation for content re-finding
- ✅ All anchor types (text, image, video, audio, quote, heading, link)
- ✅ Existing data structure with `optionalContent` field
- ✅ Shared types with Smart Tag SDK

## Conflicts & Resolutions

### 🔴 CONFLICTS IDENTIFIED

#### Conflict 1: Icon Design
- **Existing Spec**: Uses different icons per type (📍 for text, 🖼️ for image, etc.)
- **New Spec**: Uses unified icon (ⓘ) for all types
- **Resolution**: ✅ **MERGED** - Use unified icon (ⓘ) for consistency, with type-specific tooltips

#### Conflict 2: Button Text
- **Existing Spec**: "Create message" button
- **New Spec**: "Anchor Message" button
- **Resolution**: ✅ **MERGED** - Use "Anchor Message" for clarity (more specific action)

#### Conflict 3: Display Format
- **Existing Spec**: Simple format below message content
- **New Spec**: Multiple display options with hover interactions
- **Resolution**: ✅ **MERGED** - Support multiple display options (see `ANCHOR_DISPLAY_OPTIONS.md`), default to compact icon with hover

#### Conflict 4: Selection Widget vs Context Menu
- **Existing Spec**: Primary flow uses selection widget
- **New Spec**: Emphasizes context menu/toolbar
- **Resolution**: ✅ **MERGED** - Support both flows:
  - Primary: Selection widget (existing)
  - Alternative: Context menu (new)
  - Alternative: Anchor icon activation (new)

#### Conflict 5: Image Selection Method
- **Existing Spec**: Click on image element
- **New Spec**: Click OR drag rectangle
- **Resolution**: ✅ **MERGED** - Support both:
  - Click: Select entire image
  - Drag: Select rectangle region

#### Conflict 6: Coordinate System
- **Existing Spec**: Percentage (0-100) OR pixels, with start-only option
- **New Spec**: x, y, width, height format
- **Resolution**: ✅ **MERGED** - Use existing spec's flexible pattern:
  - No coords = entire image
  - Start only = point
  - Start + End = rectangle
  - Store as percentage or pixels (specify in data structure)

### 🟡 DESIGN DECISIONS NEEDED

#### Decision 1: Focus Mode Behavior
- **Question**: Should focus mode be automatic or user preference?
- **Recommendation**: Automatic for anchor flow, but allow user to exit

#### Decision 2: Anchor Indicator Placement
- **Question**: Should indicator be above input (like "replying to") or inline with icon?
- **Recommendation**: Both - icon always visible, expandable badge on demand

#### Decision 3: Hover Scroll Behavior
- **Question**: Should hover always scroll, or only if content not visible?
- **Recommendation**: Only scroll if content not in viewport (performance)

#### Decision 4: Highlight Duration
- **Question**: How long should highlight persist on click?
- **Recommendation**: Until user interaction or 30 seconds (whichever first)

#### Decision 5: Reply vs New Message Anchors
- **Question**: How to display when message is both a reply AND has anchor?
- **Recommendation**: Stack indicators vertically: "Replying to [parent]" then "📍 Anchored to [content]"

### ✅ NO CONFLICTS (Successfully Merged)

1. ✅ Full sentence requirement - **PRESERVED** (critical feature)
2. ✅ Auto-expansion - **PRESERVED** (critical feature)
3. ✅ All anchor types - **PRESERVED** (quote, heading, link included)
4. ✅ Selector/XPath generation - **PRESERVED** (critical for re-finding)
5. ✅ TypeScript implementation - **PRESERVED** (Phase 1 complete)
6. ✅ Storage in `optionalContent` - **PRESERVED** (backward compatible)
7. ✅ Shared types with SDK - **PRESERVED** (architectural requirement)

## Status

- ✅ Phase 1: Type System & Core Manager - **COMPLETE**
- ⏳ Phase 2: Content Script Integration - **IN PROGRESS** (updated with new UX features)
- ⏳ Phase 3: Message Composer Integration - **PENDING** (updated with focus mode & indicators)
- ⏳ Phase 4: Message Display - **PENDING** (updated with hover interactions)
- ⏳ Phase 5: Database Schema Update - **PENDING**
- ⏳ Phase 6: API Integration - **PENDING**


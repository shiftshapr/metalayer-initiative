# X UI/UX Pattern Agent Documentation

## Overview

The **X Agent** (agent ID: `d7cd0c82-a2cb-4467-8e7f-5f0ebb3a1eb5`) is a specialized agent focused on mimicking X (formerly Twitter) UI/UX patterns. It ensures all components match X's design system exactly, including spacing, sizing, colors, typography, and interaction patterns.

## Agent Details

- **Name**: X UI/UX Pattern Agent
- **Short Name**: `x`
- **Status**: Active
- **Personality Traits**: 
  - Mimetic
  - Detail-oriented
  - Pattern-focused
  - Visual-perfectionist
  - Design-system-obsessed

- **Specializations**:
  - X (Twitter) UI/UX patterns
  - Component styling
  - Icon systems
  - Layout positioning
  - Typography
  - Color systems
  - Spacing systems
  - Interaction patterns

## Core Principles

1. **Exact Mimicry**: Match X's design patterns pixel-perfectly
2. **Icon Consistency**: Use X icons from the icon library exclusively
3. **Spacing Precision**: Follow X's 4px base unit spacing system
4. **Color Fidelity**: Use X's exact color palette
5. **Typography Match**: Match X's font family, sizes, and weights
6. **Interaction Patterns**: Replicate X's hover states, transitions, and animations

## X Design System

### Color Palette

```typescript
Backgrounds:
- Primary: #000000 (black)
- Secondary: #16181C
- Tertiary: #202327
- Hover: #181818

Text:
- Primary: #FFFFFF (white)
- Secondary: #71767A
- Tertiary: #536471

Accents:
- Primary: #1D9BF0 (X blue)
- Primary Hover: #1A8CD8
- Primary Disabled: #1D9BF0 (with opacity)

Borders:
- Default: #2F3336
- Hover: #536471
```

### Typography

- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Sizes**: 13px, 15px, 20px, 31px
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line Heights**: 1.2, 1.3125, 1.5

### Spacing System

X uses a 4px base unit:
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- xxl: 24px
- xxxl: 32px

### Component Sizes

**Avatars**:
- Small: 20px
- Medium: 40px (default in modal)
- Large: 48px

**Buttons**:
- Small: 36px height
- Medium: 39px height
- Large: 52px height

**Icons**:
- Small: 18.75px
- Medium: 20px (default)
- Large: 24px

## X Icon Library

Located at: `presence/src/utils/XIconLibrary.js` (or `.ts`)

**Available Icons** (20+ icons):
- close
- media
- gif
- poll
- emoji
- schedule
- location
- globe
- chevronDown
- bold
- italic
- camera
- reply
- repost
- like / likeFilled
- share
- bookmark / bookmarkFilled
- view
- quote
- more

**Usage**:
```typescript
import { getXIcon } from '../utils/XPatternSystem.js';

// In HTML template
${getXIcon('close', { width: 20, height: 20 })}
```

## X Pattern System

Located at: `presence/src/utils/XPatternSystem.ts`

### Key Exports

1. **XTokens**: Design tokens (colors, spacing, typography, component sizes)
2. **XModalLayout**: Modal layout specifications matching X exactly
3. **generateXStyles()**: Generates CSS matching X patterns
4. **getXIcon()**: Helper to get X icons
5. **XComponentFactory**: Factory for creating X-pattern components

### Usage Example

```typescript
import { XTokens, XModalLayout, getXIcon, XComponentFactory } from '../utils/XPatternSystem.js';

// Use design tokens
const buttonColor = XTokens.colors.accent.primary; // #1D9BF0

// Use layout specs
const avatarSize = XModalLayout.userSection.avatar.size; // 40px

// Get icons
const closeIcon = getXIcon('close', { width: 20, height: 20 });

// Create components
const button = XComponentFactory.createButton('Post', {
  variant: 'primary',
  size: 'md'
});
```

## UnifiedMessageModal - X Design

The message modal has been updated to match X's compose modal exactly:

### Layout Structure

1. **Top Bar** (53px height)
   - Close button (X icon) on left (34.75px circle)
   - "Drafts" button on right (blue text)

2. **User Section** (padding: 12px 16px)
   - Avatar (40px circle) on left
   - Audience selector ("Everyone" pill button) next to avatar

3. **Input Area** (padding: 12px 16px)
   - Large textarea (min-height: 120px)
   - Placeholder: "What's happening?"
   - Font: 15px, line-height: 1.3125

4. **Reply Settings** (padding: 12px 16px)
   - Globe icon + "Everyone can reply" text (blue)

5. **Toolbar** (padding: 12px 16px)
   - Icons: Media, GIF, Poll, List, Emoji, Schedule, Location, Bold, Italic
   - Icons are 20px, blue (#1D9BF0), circular hover states
   - Post button on right (36px height, pill shape, blue)

### CSS Classes

All X-pattern classes are prefixed with `x-`:
- `.x-design-pattern` - Main container
- `.x-close-btn` - Close button
- `.x-avatar` - Avatar styling
- `.x-audience-selector` - Audience dropdown
- `.x-input` - Text input/textarea
- `.x-toolbar-icon` - Toolbar icon buttons
- `.x-post-button` - Post button

## Implementation Status

### ✅ Completed

1. X Agent created in JAUmemory
2. XPatternSystem utility created
3. XIconLibrary exists (20+ icons)
4. UnifiedMessageModal updated with X patterns
5. CSS updated to match X design
6. Design tokens defined

### 🚧 In Progress

1. Complete icon library (some icons may be missing)
2. Apply X patterns to other components
3. Add X animations and transitions
4. Create X component library

### 📋 TODO

1. **Complete Icon Library**
   - Audit existing icons
   - Add missing X icons
   - Ensure all icons match X's exact SVGs

2. **Apply to Other Components**
   - Message display components
   - User profile components
   - Navigation components
   - Settings components

3. **X Animations**
   - Hover transitions (0.1s ease)
   - Button press animations
   - Modal open/close animations
   - Loading states

4. **Component Library**
   - XButton component
   - XInput component
   - XAvatar component
   - XCard component
   - XDropdown component

## Agent Prompts

The agent has these update prompts:
- Always match X (Twitter) design patterns exactly
- Use X icons from the icon library
- Follow X spacing, sizing, and positioning conventions
- Apply X color palette and typography
- Replicate X interaction patterns and animations
- Create new components based on X design language
- Ensure pixel-perfect alignment and sizing

## Usage

To use the X agent for component design:

1. **Reference X patterns**: Use XTokens and XModalLayout
2. **Use X icons**: Import from XIconLibrary via getXIcon()
3. **Apply X styles**: Use generateXStyles() or reference X CSS classes
4. **Create components**: Use XComponentFactory for common patterns

## Next Steps

1. Complete the icon library audit
2. Apply X patterns to message display
3. Create X component library
4. Add X animations
5. Document all X patterns in a style guide



# Context Engineering Guidelines

## CRITICAL RULES

### 1. NEVER HARDCODE COLORS
**ALWAYS** use CSS variables or theme-aware color functions instead of hardcoded hex values.

**BAD:**
```javascript
style.color = '#333'
style.backgroundColor = '#ddd'
style.borderColor = '#f1f3f4'
```

**GOOD:**
```javascript
style.color = 'var(--text-primary)'
style.backgroundColor = 'var(--background-secondary)'
style.borderColor = 'var(--border-color)'
```

### 2. CREATE ABSTRACTIONS FOR DUPLICATE CODE
When multiple code blocks do exactly the same thing, create reusable functions, components, or CSS classes.

**EXAMPLES OF DUPLICATE CODE TO ABSTRACT:**

#### Context Bar Styling (Found in multiple functions)
```javascript
// BAD - Repeated in multiple places
if (isDarkMode) {
  contextBar.style.background = '#2a4a5a';
  contextBar.style.borderBottom = '1px solid #4a6a7a';
  contextBar.style.color = '#88ccff';
} else {
  contextBar.style.background = '#e8f4fd';
  contextBar.style.borderBottom = '1px solid #b3d9ff';
  contextBar.style.color = '#0066cc';
}
```

**GOOD - Create abstraction:**
```javascript
function applyContextBarTheme(contextBar, isDarkMode) {
  contextBar.style.background = 'var(--background-secondary)';
  contextBar.style.borderBottom = '1px solid var(--border-color)';
  contextBar.style.color = 'var(--text-primary)';
}
```

#### Border Styling Logic
```javascript
// BAD - Repeated border logic
threadStarter.style.borderBottom = '1px solid var(--border-color)';
reply.style.borderBottom = '1px solid var(--border-color)';
```

**GOOD - Create abstraction:**
```javascript
function applyMessageBorders(threadStarter, replies) {
  // Centralized border logic
}
```

### 3. VISUAL HIERARCHY LESSONS LEARNED

#### CSS Pseudo-Elements vs JavaScript Manipulation
**BREAKTHROUGH INSIGHT**: Use CSS pseudo-elements (`::before`, `::after`) for visual elements instead of complex JavaScript border manipulation.

**BAD - Complex JavaScript approach:**
```javascript
// Complex border calculations and DOM manipulation
threadStarter.style.borderBottom = 'none';
threadStarter.style.setProperty('--short-line-width', '40%');
reply.style.borderBottom = '1px solid var(--border-color)';
```

**GOOD - CSS pseudo-element approach:**
```css
/* Thread starters get FULL width top line */
.message.thread-starter::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 1px;
  background-color: var(--border-color);
}

/* Replies get SHORT width top line (indented) */
.message-reply.thread-reply::before {
  content: '';
  position: absolute;
  top: 0;
  left: 32px;
  width: calc(100% - 32px) !important;
  height: 1px;
  background-color: var(--border-color);
}
```

#### CSS Specificity and !important Usage
**LESSON**: Use `!important` strategically to override existing CSS, especially for padding and positioning.

```css
/* Use !important to override existing padding */
.message.thread-starter {
  padding-top: 2px !important;
}

.message-reply.thread-reply {
  padding-top: 2px !important;
}
```

#### Conflicting CSS Rules
**CRITICAL**: Always check for conflicting CSS rules that override your intended styling.

**PROBLEM**: General CSS rules can override specific ones:
```css
/* This can override specific thread styling */
[data-theme="dark"] .message {
  border-bottom: 1px solid #555555;
}
```

**SOLUTION**: Remove conflicting rules or use more specific selectors:
```css
/* Remove conflicting rules */
/* REMOVED conflicting rule that was overriding thread-starter SHORT lines */
```

### 4. DEBUGGING VISUAL HIERARCHY

#### Console Logging Strategy
**BEST PRACTICE**: Add comprehensive logging to track visual element application:

```javascript
console.log('🔍 LINE DEBUG: Thread starter', messageId, 'gets SHORT line (40% width via CSS pseudo-element)');
console.log('🔍 LINE DEBUG: Last reply', messageId, 'gets FULL line (100% width via border-bottom)');
console.log('🔍 Vertical line calculation:', {
  threadStarterTop: threadStarterRect.top,
  avatarBottom: avatarBottom,
  lastReplyBottom: lastReplyRect.bottom,
  height
});
```

#### CSS Variable Debugging
**TIP**: Use CSS variables for dynamic values that need JavaScript calculation:

```css
.message.thread-starter.has-replies::after {
  height: var(--vertical-line-height, 100px);
}
```

```javascript
threadStarter.style.setProperty('--vertical-line-height', `${height}px`);
```

### 5. USER EXPERIENCE PRINCIPLES

#### Default States
**PRINCIPLE**: Design for the most common use case. Collapse complex elements by default.

**BAD**: Auto-expand all thread replies on load
**GOOD**: Collapse all thread replies by default, let users expand what they want

#### Visual Feedback
**PRINCIPLE**: Provide clear visual feedback for interactive elements.

- Thread toggles: 📂 (collapsed) ↔ 📁 (expanded)
- Count indicators: Show number of replies
- Hover states: Clear interaction feedback

### 6. EXAMPLES OF BAD PRACTICES TO AVOID:
- Hardcoded colors: `#333`, `#ddd`, `#f1f3f4`, `#e1e8ed`
- Complex JavaScript border manipulation
- Conflicting CSS rules without specificity
- Auto-expanding complex UI elements
- Missing visual feedback for interactions
- Inline styles with hardcoded values
- Duplicate context bar styling in multiple functions
- Repeated border styling logic
- Multiple functions doing identical theme detection

### 7. EXAMPLES OF GOOD PRACTICES:
- `style.color = 'var(--text-primary)'`
- CSS pseudo-elements for visual elements
- `padding-top: 2px !important` for override scenarios
- Comprehensive console logging for debugging
- CSS variables for dynamic values
- Collapsed default states for complex UI
- Clear visual feedback (📂/📁 icons)
- `createThemeAwareStyles(isDarkMode)` function
- `.theme-aware-border` CSS class
- `applyMessageBorders(threadStarter, replies)` function
- Centralized theme detection: `getCurrentTheme()`

### 8. BENEFITS:
- **Maintainability**: Change colors in one place
- **Consistency**: All elements use same theme variables
- **Light/Dark Mode**: Automatic theme switching
- **Code Reuse**: Less duplication, easier debugging
- **Performance**: Smaller bundle size, CSS-only visual elements
- **User Experience**: Intuitive default states and clear feedback
- **Debugging**: Comprehensive logging for troubleshooting

## IMPLEMENTATION CHECKLIST:
- [ ] Replace all hardcoded colors with CSS variables
- [ ] Identify duplicate code patterns
- [ ] Create reusable functions for repeated logic
- [ ] Extract common CSS into shared classes
- [ ] Use CSS pseudo-elements instead of JavaScript manipulation
- [ ] Add `!important` strategically for CSS overrides
- [ ] Remove conflicting CSS rules
- [ ] Add comprehensive debugging logs
- [ ] Design collapsed default states for complex UI
- [ ] Provide clear visual feedback for interactions
- [ ] Test theme switching works properly
- [ ] Verify no hardcoded values remain

## VISUAL HIERARCHY IMPLEMENTATION PATTERN:
1. **Design in CSS**: Use pseudo-elements for visual elements
2. **Override with !important**: When needed to override existing styles
3. **Remove conflicts**: Clean up conflicting CSS rules
4. **Debug with logs**: Add comprehensive console logging
5. **Test thoroughly**: Verify in both light and dark modes
6. **User-first defaults**: Collapse complex elements by default

---
*This prevents maintenance nightmares, ensures consistent theming, and creates intuitive user experiences.*


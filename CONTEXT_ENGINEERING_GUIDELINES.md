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

### 3. EXAMPLES OF BAD PRACTICES TO AVOID:
- Hardcoded colors: `#333`, `#ddd`, `#f1f3f4`, `#e1e8ed`
- Duplicate context bar styling in multiple functions
- Repeated border styling logic
- Multiple functions doing identical theme detection
- Inline styles with hardcoded values

### 4. EXAMPLES OF GOOD PRACTICES:
- `style.color = 'var(--text-primary)'`
- `createThemeAwareStyles(isDarkMode)` function
- `.theme-aware-border` CSS class
- `applyMessageBorders(threadStarter, replies)` function
- Centralized theme detection: `getCurrentTheme()`

### 5. BENEFITS:
- **Maintainability**: Change colors in one place
- **Consistency**: All elements use same theme variables
- **Light/Dark Mode**: Automatic theme switching
- **Code Reuse**: Less duplication, easier debugging
- **Performance**: Smaller bundle size

## IMPLEMENTATION CHECKLIST:
- [ ] Replace all hardcoded colors with CSS variables
- [ ] Identify duplicate code patterns
- [ ] Create reusable functions for repeated logic
- [ ] Extract common CSS into shared classes
- [ ] Test theme switching works properly
- [ ] Verify no hardcoded values remain

---
*This prevents maintenance nightmares and ensures consistent theming across the application.*


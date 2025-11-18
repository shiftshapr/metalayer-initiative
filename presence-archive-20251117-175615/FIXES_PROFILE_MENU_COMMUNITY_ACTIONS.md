# Fixes: Profile Menu and Community Action Dots

## Issues Fixed

### 1. Profile Menu Not Working
**Problem:** Profile menu was toggling but closing immediately after opening.

**Root Cause:** 
- Click-outside handler was being added too quickly (200ms delay)
- Duplicate event handlers were being attached on each avatar update
- The same click event that opened the menu was triggering the click-outside handler

**Fix:**
1. Increased click-outside handler delay from 200ms to 500ms
2. Removed duplicate handlers by cloning the avatar container before adding new handlers
3. Added proper event prevention (`stopPropagation`, `preventDefault`)

**Files Modified:**
- `presence/features/ProfileManager.js` (lines ~548-603)

**Changes:**
```javascript
// Remove existing handlers to prevent duplicates
const newContainer = userAvatarContainer.cloneNode(true);
userAvatarContainer.parentNode.replaceChild(newContainer, userAvatarContainer);

// Increased delay to 500ms
setTimeout(() => {
  this.addClickOutsideHandler();
}, 500);
```

---

### 2. Community Action Dots Not Active and Horizontal
**Problem:** 
- Action dots next to non-primary communities were not clickable/active
- Dots were horizontal (⋯) instead of vertical (⋮) like message action dots

**Root Cause:**
- Event handlers were not properly attached
- Using horizontal ellipsis character instead of vertical
- Missing proper styling to make dots visible and clickable

**Fix:**
1. Changed ellipsis from horizontal (⋯) to vertical (⋮)
2. Added proper click handlers with event prevention
3. Removed duplicate handlers by cloning button element
4. Added click-outside handler for menu
5. Styled action dots to match message action dots

**Files Modified:**
- `presence/features/CommunitiesModule.js` (lines ~399-483)
- `presence/sidepanel.css` (lines ~777-787)

**Changes:**
```javascript
// Changed to vertical ellipsis
<span class="action-dots">⋮</span>

// Added proper event handling
const newMenuBtn = menuBtn.cloneNode(true);
menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);

newMenuBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  e.preventDefault();
  // ... menu toggle logic
});
```

```css
.community-menu-btn .action-dots {
    opacity: 1 !important;
    display: inline-block !important;
    visibility: visible !important;
    font-size: 16px !important;
    color: var(--text-secondary) !important;
    pointer-events: auto !important;
    cursor: pointer !important;
}
```

---

## Testing

1. **Profile Menu:**
   - Click profile avatar
   - Menu should stay open
   - Click outside menu
   - Menu should close properly

2. **Community Action Dots:**
   - View communities dropdown
   - Non-primary communities should show vertical dots (⋮)
   - Click dots - menu should open
   - Click "Make primary" - should work
   - Click outside - menu should close

---

## Status

✅ Profile menu fixed - stays open when clicked
✅ Community action dots fixed - vertical, active, and clickable
✅ All changes tested and working


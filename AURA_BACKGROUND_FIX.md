# Aura Background Fix

## Issue
The aura ring was displaying, but the aura background behind the avatar was not visible when the avatar image was opaque.

## Solution
Modified `AvatarUtils.createUnifiedAvatar()` to:

1. **Extend aura background beyond image**: The aura background circle is now larger than the avatar image (extends by ~8% padding), making it visible as a border/glow around the edges even when the image is opaque.

2. **Add glow effects**: Added `box-shadow` effects to create a glow around:
   - The aura background (inner and outer glow)
   - The aura ring (outer glow)
   - The avatar image itself (subtle glow)

3. **Layered structure**:
   - **z-index: 0**: Aura background (largest, behind everything)
   - **z-index: 1**: Avatar image (on top of background)
   - **z-index: 2**: Aura ring (outermost border)

## Technical Details

- **Aura padding**: Scales with avatar size (8% of size, minimum 2px)
- **Glow size**: Scales with avatar size (12% of size, minimum 2px)
- **Aura background size**: `size + (auraPadding * 2)` to extend beyond image
- **Position**: Aura background positioned at `-auraPadding` to center it behind the image

## Result
The aura background is now visible as a colored border/glow around the avatar image, even when the image is completely opaque. The glow effect enhances visibility and creates a more prominent aura display.


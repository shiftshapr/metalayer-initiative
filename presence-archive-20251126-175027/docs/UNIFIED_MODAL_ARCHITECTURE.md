# Unified Modal Architecture Proposal

## Current State
- `UnifiedMessageModal` - Handles message creation/editing
- `GoVisibleModal` - Simple modal for visibility prompt
- Various other modals (aura, profile, etc.)

## Proposal: Unified Modal System

### Core Principles
1. **Base Modal Component** - Common structure, styling, animations
2. **Content Slots** - Extensible content areas
3. **Theme-Aware** - Automatic light/dark mode support
4. **Consistent UX** - Same close behavior, escape handling, overlay

### Architecture

```typescript
class UnifiedModal {
  // Base structure
  private overlay: HTMLElement;
  private content: HTMLElement;
  
  // Configurable slots
  private header?: HTMLElement;
  private body: HTMLElement;
  private footer?: HTMLElement;
  
  // Extensible content
  show(config: ModalConfig): void;
  setContent(content: string | HTMLElement): void;
  addAction(button: ModalAction): void;
}

interface ModalConfig {
  title?: string;
  content: string | HTMLElement;
  actions?: ModalAction[];
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  onClose?: () => void;
}
```

### Benefits
- Consistent styling across all modals
- Easy to extend with new modal types
- Centralized animation/behavior
- Theme-aware by default
- Reduced code duplication

### Migration Path
1. Create `UnifiedModal` base class
2. Refactor `UnifiedMessageModal` to extend it
3. Refactor `GoVisibleModal` to use it
4. Gradually migrate other modals

### Recommendation
**YES** - Implement unified modal architecture. It will:
- Reduce code duplication
- Ensure consistent UX
- Make adding new modals easier
- Centralize modal behavior and styling







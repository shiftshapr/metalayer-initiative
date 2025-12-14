/**
 * Action Menu Positioning
 * Calculates optimal positioning for action menus and dropdowns
 */
export class ActionMenuPositioning {
    static calculatePosition(options) {
        const { triggerElement, menuElement, container = document.body, preferredPosition = 'bottom', offset = 8, constrainToViewport = true } = options;
        const triggerRect = triggerElement.getBoundingClientRect();
        const menuRect = menuElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let position = { top: 0, left: 0 };
        switch (preferredPosition) {
            case 'bottom':
                position = {
                    top: triggerRect.bottom + offset,
                    left: triggerRect.left
                };
                break;
            case 'top':
                position = {
                    top: triggerRect.top - menuRect.height - offset,
                    left: triggerRect.left
                };
                break;
            case 'left':
                position = {
                    top: triggerRect.top,
                    left: triggerRect.left - menuRect.width - offset
                };
                break;
            case 'right':
                position = {
                    top: triggerRect.top,
                    left: triggerRect.right + offset
                };
                break;
            case 'auto':
            default:
                // Try bottom first, then top, then right, then left
                const positions = ['bottom', 'top', 'right', 'left'];
                for (const pos of positions) {
                    position = this.calculatePosition({
                        ...options,
                        preferredPosition: pos
                    });
                    if (this.isPositionValid(position, menuRect, viewportWidth, viewportHeight)) {
                        break;
                    }
                }
                break;
        }
        // Constrain to viewport if requested
        if (constrainToViewport) {
            position = this.constrainToViewport(position, menuRect, viewportWidth, viewportHeight);
        }
        // Constrain to container if provided
        if (container !== document.body) {
            position = this.constrainToContainer(position, menuRect, containerRect);
        }
        return position;
    }
    static isPositionValid(position, menuRect, viewportWidth, viewportHeight) {
        const menuRight = position.left + menuRect.width;
        const menuBottom = position.top + menuRect.height;
        return position.left >= 0 &&
            position.top >= 0 &&
            menuRight <= viewportWidth &&
            menuBottom <= viewportHeight;
    }
    static constrainToViewport(position, menuRect, viewportWidth, viewportHeight) {
        let { top, left } = position;
        // Constrain horizontally
        if (left < 0) {
            left = 0;
        }
        else if (left + menuRect.width > viewportWidth) {
            left = viewportWidth - menuRect.width;
        }
        // Constrain vertically
        if (top < 0) {
            top = 0;
        }
        else if (top + menuRect.height > viewportHeight) {
            top = viewportHeight - menuRect.height;
        }
        return { top, left };
    }
    static constrainToContainer(position, menuRect, containerRect) {
        let { top, left } = position;
        // Adjust for container offset
        top = Math.max(containerRect.top, Math.min(top, containerRect.bottom - menuRect.height));
        left = Math.max(containerRect.left, Math.min(left, containerRect.right - menuRect.width));
        return { top, left };
    }
    static applyPosition(menuElement, position) {
        menuElement.style.position = 'fixed';
        menuElement.style.top = `${position.top}px`;
        menuElement.style.left = `${position.left}px`;
        if (position.transform) {
            menuElement.style.transform = position.transform;
        }
        else {
            menuElement.style.transform = 'none';
        }
        menuElement.style.zIndex = '9999';
    }
    static hideMenu(menuElement) {
        menuElement.style.display = 'none';
    }
    static showMenu(menuElement) {
        menuElement.style.display = 'block';
    }
    static positionActionMenu(options) {
        return this.calculatePosition(options);
    }
}
// Export additional functions for convenience
export function positionActionMenu(options) {
    return ActionMenuPositioning.calculatePosition(options);
}
// Export singleton instance
let actionMenuPositioningInstance = null;
export function getActionMenuPositioning() {
    if (!actionMenuPositioningInstance) {
        actionMenuPositioningInstance = new ActionMenuPositioning();
    }
    return actionMenuPositioningInstance;
}
//# sourceMappingURL=actionMenuPositioning.js.map
/**
 * X Pattern System - Utilities for applying X (Twitter) UI/UX patterns
 * 
 * This module provides utilities to create components that match X's design system:
 * - Spacing and sizing conventions
 * - Color palette
 * - Typography
 * - Component positioning
 * - Icon usage
 * - Interaction patterns
 */

import { XIcons as XIconsModule } from './XIconLibrary.js';
import { Logger } from './Logger.js';

// Use imported XIcons, fallback to window if needed
let XIcons: typeof XIconsModule = XIconsModule;

/**
 * X Design Tokens
 * Based on X's actual design system
 */
export const XTokens = {
  // Colors (X's color palette)
  colors: {
    // Backgrounds
    background: {
      primary: '#000000',      // Main background (dark mode)
      secondary: '#16181C',    // Secondary background
      tertiary: '#202327',     // Tertiary background
      hover: '#181818',        // Hover state
    },
    // Text
    text: {
      primary: '#1D9BF0',      // Primary text (X neon blue - default for dark mode)
      primaryPremium: '#FFFFFF', // Premium white text option (requires premium subscription)
      secondary: '#71767A',    // Secondary text
      tertiary: '#536471',     // Tertiary text
    },
    // Accents
    accent: {
      primary: '#1D9BF0',      // X blue
      primaryHover: '#1A8CD8', // X blue hover
      primaryDisabled: '#1D9BF0', // Disabled state (with opacity)
    },
    // Borders
    border: {
      default: '#2F3336',      // Default border
      hover: '#536471',        // Hover border
    },
  },
  
  // Spacing (X uses 4px base unit)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },
  
  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    sizes: {
      xs: '13px',
      sm: '15px',
      md: '15px',
      lg: '20px',
      xl: '31px',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.3125,
      relaxed: 1.5,
    },
  },
  
  // Component sizes
  components: {
    avatar: {
      sm: '20px',
      md: '40px',
      lg: '48px',
    },
    tabs: {
      height: '53px', // X's tab bar height
      padding: '16px', // X's tab padding
      borderWidth: '4px', // Active tab underline thickness
      fontSize: '15px', // X's tab font size
      fontWeight: {
        inactive: 400,
        active: 700,
      },
    },
    button: {
      height: {
        sm: '36px',
        md: '39px',
        lg: '52px',
      },
      padding: {
        sm: '0 16px',
        md: '0 20px',
        lg: '0 32px',
      },
    },
    input: {
      minHeight: '120px',
      padding: '12px',
    },
    icon: {
      sm: '18.75px',
      md: '20px',
      lg: '24px',
    },
  },
  
  // Border radius
  radius: {
    sm: '4px',
    md: '16px',
    lg: '20px', // Modal corners
    xl: '9999px', // Pill shape (buttons, selectors)
  },
  
  // Shadows
  shadows: {
    sm: 'rgba(255, 255, 255, 0.03) 0px 0px 0px 1px inset',
    md: 'rgba(255, 255, 255, 0.03) 0px 0px 0px 1px inset, rgba(255, 255, 255, 0.15) 0px 3px 6px',
  },
  
  // Transitions
  transitions: {
    fast: '0.1s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
};

/**
 * X Modal Layout
 * Matches X's compose modal structure
 */
export interface XModalLayout {
  topBar: {
    height: string;
    padding: string;
    closeButton: {
      size: string;
      position: 'left';
    };
    rightAction: {
      position: 'right';
      color: string;
    };
  };
  userSection: {
    padding: string;
    avatar: {
      size: string;
      marginRight: string;
    };
    audienceSelector: {
      height: string;
      padding: string;
      borderRadius: string;
    };
  };
  inputArea: {
    minHeight: string;
    padding: string;
    fontSize: string;
    lineHeight: string;
  };
  toolbar: {
    padding: string;
    iconSize: string;
    iconSpacing: string;
  };
  actionButton: {
    height: string;
    padding: string;
    borderRadius: string;
    fontSize: string;
    fontWeight: number;
  };
}

export const XModalLayout: XModalLayout = {
  topBar: {
    height: '53px',
    padding: '0 16px',
    closeButton: {
      size: '20px',
      position: 'left',
    },
    rightAction: {
      position: 'right',
      color: XTokens.colors.accent.primary,
    },
  },
  userSection: {
    padding: '12px 16px',
    avatar: {
      size: '40px',
      marginRight: '12px',
    },
    audienceSelector: {
      height: '32px',
      padding: '0 12px',
      borderRadius: XTokens.radius.xl, // Fully rounded pill shape
    },
  },
  inputArea: {
    minHeight: '120px',
    padding: '12px 16px',
    fontSize: XTokens.typography.sizes.md,
    lineHeight: String(XTokens.typography.lineHeights.normal),
  },
  toolbar: {
    padding: '12px 16px',
    iconSize: '20px',
    iconSpacing: '20px',
  },
  actionButton: {
    height: '36px',
    padding: '0 16px',
    borderRadius: XTokens.radius.lg,
    fontSize: XTokens.typography.sizes.sm,
    fontWeight: XTokens.typography.weights.bold,
  },
};

/**
 * Generate X-style CSS classes
 */
export function generateXStyles(): string {
  return `
    /* X Design System Styles */
    .x-design-pattern {
      font-family: ${XTokens.typography.fontFamily};
      background: ${XTokens.colors.background.primary};
      color: ${XTokens.colors.text.primary};
    }
    
    .x-close-btn {
      width: 34.75px;
      height: 34.75px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${XTokens.colors.text.primary};
      transition: background-color ${XTokens.transitions.fast};
    }
    
    .x-close-btn:hover {
      background-color: ${XTokens.colors.background.hover};
    }
    
    .x-avatar {
      width: ${XModalLayout.userSection.avatar.size};
      height: ${XModalLayout.userSection.avatar.size};
      border-radius: 50%;
      object-fit: cover;
    }
    
    .x-audience-selector {
      height: ${XModalLayout.userSection.audienceSelector.height};
      padding: ${XModalLayout.userSection.audienceSelector.padding};
      border-radius: ${XModalLayout.userSection.audienceSelector.borderRadius};
      border: 1px solid ${XTokens.colors.border.default};
      background: transparent;
      color: ${XTokens.colors.accent.primary};
      font-size: ${XTokens.typography.sizes.sm};
      font-weight: ${XTokens.typography.weights.bold};
      cursor: pointer;
      transition: background-color ${XTokens.transitions.fast};
    }
    
    .x-audience-selector:hover {
      background-color: ${XTokens.colors.background.hover};
    }
    
    .x-input {
      min-height: ${XModalLayout.inputArea.minHeight};
      padding: ${XModalLayout.inputArea.padding};
      font-size: ${XModalLayout.inputArea.fontSize};
      line-height: ${XModalLayout.inputArea.lineHeight};
      background: transparent;
      border: none;
      color: ${XTokens.colors.text.primary};
      resize: none;
      outline: none;
    }
    
    .x-input::placeholder {
      color: ${XTokens.colors.text.secondary};
    }
    
    .x-toolbar-icon {
      width: ${XModalLayout.toolbar.iconSize};
      height: ${XModalLayout.toolbar.iconSize};
      color: ${XTokens.colors.accent.primary};
      cursor: pointer;
      border-radius: 50%;
      padding: 8px;
      transition: background-color ${XTokens.transitions.fast};
    }
    
    .x-toolbar-icon:hover {
      background-color: ${XTokens.colors.background.hover};
    }
    
    .x-post-button {
      height: ${XModalLayout.actionButton.height};
      padding: ${XModalLayout.actionButton.padding};
      border-radius: ${XModalLayout.actionButton.borderRadius};
      font-size: ${XModalLayout.actionButton.fontSize};
      font-weight: ${XModalLayout.actionButton.fontWeight};
      border: none;
      cursor: pointer;
      transition: background-color ${XTokens.transitions.fast};
    }
    
    .x-post-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .x-post-button:not(:disabled) {
      background-color: ${XTokens.colors.accent.primary};
      color: ${XTokens.colors.text.primary};
    }
    
    .x-post-button:not(:disabled):hover {
      background-color: ${XTokens.colors.accent.primaryHover};
    }
  `;
}

/**
 * Apply X pattern to a component
 */
export function applyXPattern(component: string, _options?: Record<string, unknown>): string {
  // This will be expanded to apply patterns to different component types
  return component;
}

/**
 * Get X icon by name
 */
export function getXIcon(name: keyof typeof XIconsModule, props?: { width?: number; height?: number; fill?: string; className?: string }): string {
  // Try imported XIcons first
  if (XIcons[name]) {
    return XIcons[name](props || {});
  }
  
  // Fallback to window (in case module loads after)
  if (typeof window !== 'undefined') {
    const win = window as Window & { XIcons?: typeof XIconsModule };
    if (win.XIcons && win.XIcons[name]) {
      return win.XIcons[name](props || {});
    }
  }
  
  // Fallback: return empty string if icon not found
  Logger.warn(`X icon "${name}" not found`, null, 'general');
  return '';
}

/**
 * X Component Factory
 * Creates components following X patterns
 */
export class XComponentFactory {
  /**
   * Create a button following X patterns
   */
  static createButton(text: string, options: {
    variant?: 'primary' | 'secondary' | 'text';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onClick?: () => void;
  } = {}): HTMLElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `x-button x-button-${options.variant || 'primary'} x-button-${options.size || 'md'}`;
    if (options.disabled) {
      button.disabled = true;
    }
    if (options.onClick) {
      button.addEventListener('click', options.onClick);
    }
    return button;
  }
  
  /**
   * Create an input following X patterns
   */
  static createInput(options: {
    placeholder?: string;
    value?: string;
    multiline?: boolean;
    rows?: number;
  } = {}): HTMLElement {
    const input = options.multiline 
      ? document.createElement('textarea')
      : document.createElement('input');
    
    input.className = 'x-input';
    if (options.placeholder) {
      input.setAttribute('placeholder', options.placeholder);
    }
    if (options.value) {
      (input as HTMLInputElement | HTMLTextAreaElement).value = options.value;
    }
    if (options.multiline && options.rows) {
      (input as HTMLTextAreaElement).rows = options.rows;
    }
    
    return input;
  }
  
  /**
   * Create an avatar following X patterns
   */
  static createAvatar(options: {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg';
    fallback?: string;
  }): HTMLElement {
    const avatar = document.createElement('div');
    avatar.className = `x-avatar x-avatar-${options.size || 'md'}`;
    
    if (options.src) {
      const img = document.createElement('img');
      img.src = options.src;
      img.alt = options.alt || '';
      img.className = 'x-avatar-img';
      avatar.appendChild(img);
    } else if (options.fallback) {
      avatar.textContent = options.fallback.charAt(0).toUpperCase();
      avatar.className += ' x-avatar-fallback';
    }
    
    return avatar;
  }
}

export default {
  XTokens,
  XModalLayout,
  generateXStyles,
  applyXPattern,
  getXIcon,
  XComponentFactory,
};


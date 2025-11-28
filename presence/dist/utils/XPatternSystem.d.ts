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
/**
 * X Design Tokens
 * Based on X's actual design system
 */
export declare const XTokens: {
    colors: {
        background: {
            primary: string;
            secondary: string;
            tertiary: string;
            hover: string;
        };
        text: {
            primary: string;
            primaryPremium: string;
            secondary: string;
            tertiary: string;
        };
        accent: {
            primary: string;
            primaryHover: string;
            primaryDisabled: string;
        };
        border: {
            default: string;
            hover: string;
        };
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
        xxxl: string;
    };
    typography: {
        fontFamily: string;
        sizes: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
        weights: {
            normal: number;
            medium: number;
            semibold: number;
            bold: number;
        };
        lineHeights: {
            tight: number;
            normal: number;
            relaxed: number;
        };
    };
    components: {
        avatar: {
            sm: string;
            md: string;
            lg: string;
        };
        tabs: {
            height: string;
            padding: string;
            borderWidth: string;
            fontSize: string;
            fontWeight: {
                inactive: number;
                active: number;
            };
        };
        button: {
            height: {
                sm: string;
                md: string;
                lg: string;
            };
            padding: {
                sm: string;
                md: string;
                lg: string;
            };
        };
        input: {
            minHeight: string;
            padding: string;
        };
        icon: {
            sm: string;
            md: string;
            lg: string;
        };
    };
    radius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    shadows: {
        sm: string;
        md: string;
    };
    transitions: {
        fast: string;
        normal: string;
        slow: string;
    };
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
export declare const XModalLayout: XModalLayout;
/**
 * Generate X-style CSS classes
 */
export declare function generateXStyles(): string;
/**
 * Apply X pattern to a component
 */
export declare function applyXPattern(component: string, _options?: Record<string, unknown>): string;
/**
 * Get X icon by name
 */
export declare function getXIcon(name: keyof typeof XIconsModule, props?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * X Component Factory
 * Creates components following X patterns
 */
export declare class XComponentFactory {
    /**
     * Create a button following X patterns
     */
    static createButton(text: string, options?: {
        variant?: 'primary' | 'secondary' | 'text';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
        onClick?: () => void;
    }): HTMLElement;
    /**
     * Create an input following X patterns
     */
    static createInput(options?: {
        placeholder?: string;
        value?: string;
        multiline?: boolean;
        rows?: number;
    }): HTMLElement;
    /**
     * Create an avatar following X patterns
     */
    static createAvatar(options: {
        src?: string;
        alt?: string;
        size?: 'sm' | 'md' | 'lg';
        fallback?: string;
    }): HTMLElement;
}
declare const _default: {
    XTokens: {
        colors: {
            background: {
                primary: string;
                secondary: string;
                tertiary: string;
                hover: string;
            };
            text: {
                primary: string;
                primaryPremium: string;
                secondary: string;
                tertiary: string;
            };
            accent: {
                primary: string;
                primaryHover: string;
                primaryDisabled: string;
            };
            border: {
                default: string;
                hover: string;
            };
        };
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            xxl: string;
            xxxl: string;
        };
        typography: {
            fontFamily: string;
            sizes: {
                xs: string;
                sm: string;
                md: string;
                lg: string;
                xl: string;
            };
            weights: {
                normal: number;
                medium: number;
                semibold: number;
                bold: number;
            };
            lineHeights: {
                tight: number;
                normal: number;
                relaxed: number;
            };
        };
        components: {
            avatar: {
                sm: string;
                md: string;
                lg: string;
            };
            tabs: {
                height: string;
                padding: string;
                borderWidth: string;
                fontSize: string;
                fontWeight: {
                    inactive: number;
                    active: number;
                };
            };
            button: {
                height: {
                    sm: string;
                    md: string;
                    lg: string;
                };
                padding: {
                    sm: string;
                    md: string;
                    lg: string;
                };
            };
            input: {
                minHeight: string;
                padding: string;
            };
            icon: {
                sm: string;
                md: string;
                lg: string;
            };
        };
        radius: {
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
        shadows: {
            sm: string;
            md: string;
        };
        transitions: {
            fast: string;
            normal: string;
            slow: string;
        };
    };
    XModalLayout: XModalLayout;
    generateXStyles: typeof generateXStyles;
    applyXPattern: typeof applyXPattern;
    getXIcon: typeof getXIcon;
    XComponentFactory: typeof XComponentFactory;
};
export default _default;
//# sourceMappingURL=XPatternSystem.d.ts.map
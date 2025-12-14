/**
 * ConfigModule - Configuration management
 */
export const AVATAR_FALLBACK_COLOR = '#6366f1';
/**
 * Public Square community UUID
 */
export const PUBLIC_SQUARE_UUID = '00000000-0000-0000-0000-000000000000';
/**
 * Configuration constants and utilities
 */
export const configManagerInstance = {
    get: (key) => {
        switch (key) {
            case 'apiUrl':
                return 'https://api.canopi.live';
            default:
                return undefined;
        }
    }
};
//# sourceMappingURL=ConfigModule.js.map
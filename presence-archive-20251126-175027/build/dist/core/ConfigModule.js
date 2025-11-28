import { Logger } from '../utils/Logger.js';
/**
 * CONFIG MODULE - Configuration Constants
 * TypeScript + ES6 Module for configuration values
 *
 * First module in TypeScript migration
 */
// Avatar fallback color constant
export const AVATAR_FALLBACK_COLOR = '#ffffff';
// Log initialization
if (typeof console !== 'undefined') {
    Logger.debug('✅ CONFIG MODULE: AVATAR_FALLBACK_COLOR exported:', AVATAR_FALLBACK_COLOR, 'config');
}
//# sourceMappingURL=ConfigModule.js.map
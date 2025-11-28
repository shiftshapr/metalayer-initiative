/**
 * CONFIG MODULE - Configuration Constants
 * TypeScript + ES6 Module for configuration values
 *
 * First module in TypeScript migration
 */
import { Logger } from '../utils/Logger.js';
// Avatar fallback color constant
export const AVATAR_FALLBACK_COLOR = '#ffffff';
// Public Square community UUID - default community for all users
export const PUBLIC_SQUARE_UUID = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4';
// Log initialization
if (typeof console !== 'undefined') {
    Logger.debug('✅ CONFIG MODULE: AVATAR_FALLBACK_COLOR exported:', AVATAR_FALLBACK_COLOR, 'config');
}

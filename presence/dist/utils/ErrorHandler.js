/**
 * Error handling utilities
 */
export function handleError(error, context) {
    console.error('Error:', error, context);
}
/**
 * Logger utilities
 */
export class Logger {
    static debug(message, data, context) {
        console.debug(`[${context || 'unknown'}] ${message}`, data);
    }
    static info(message, data, context) {
        console.info(`[${context || 'unknown'}] ${message}`, data);
    }
    static log(message, data, context) {
        console.log(`[${context || 'unknown'}] ${message}`, data);
    }
    static error(message, error, context) {
        console.error(`[${context || 'unknown'}] ${message}`, error);
    }
    static warn(message, data, context) {
        console.warn(`[${context || 'unknown'}] ${message}`, data);
    }
}
/**
 * Safe JSON parsing
 */
export class SafeJSON {
    static parse(jsonString, fallback = null, context) {
        try {
            return JSON.parse(jsonString);
        }
        catch (error) {
            console.warn(`[${context || 'SafeJSON'}] Failed to parse JSON:`, error);
            return fallback;
        }
    }
}
//# sourceMappingURL=ErrorHandler.js.map
/**
 * Error handling utilities
 */
export function handleError(error: unknown, context?: { log?: boolean; logLevel?: string; context?: any }): void {
  console.error('Error:', error, context);
}

/**
 * Logger utilities
 */
export class Logger {
  static debug(message: string, data?: any, context?: string): void {
    console.debug(`[${context || 'unknown'}] ${message}`, data);
  }

  static info(message: string, data?: any, context?: string): void {
    console.info(`[${context || 'unknown'}] ${message}`, data);
  }

  static log(message: string, data?: any, context?: string): void {
    console.log(`[${context || 'unknown'}] ${message}`, data);
  }

  static error(message: string, error?: any, context?: string): void {
    console.error(`[${context || 'unknown'}] ${message}`, error);
  }

  static warn(message: string, data?: any, context?: string): void {
    console.warn(`[${context || 'unknown'}] ${message}`, data);
  }
}

/**
 * Safe JSON parsing
 */
export class SafeJSON {
  static parse(jsonString: string, fallback: any = null, context?: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn(`[${context || 'SafeJSON'}] Failed to parse JSON:`, error);
      return fallback;
    }
  }
}
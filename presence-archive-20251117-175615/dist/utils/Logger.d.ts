/**
 * ENHANCED LOGGING SYSTEM - Centralized Logging
 * TypeScript + ES6 Module
 */
export interface LogEntry {
    timestamp: string;
    level: string;
    context: string;
    message: string;
    data: any;
    id: string;
}
declare class Logger {
    static readonly LOG_LEVELS: Record<string, number>;
    static currentLevel: number;
    static isEnabled: boolean;
    static logHistory: LogEntry[];
    static maxHistorySize: number;
    /**
     * Set the minimum log level to display
     */
    static setLevel(level: string): void;
    /**
     * Enable or disable logging
     */
    static setEnabled(enabled: boolean): void;
    /**
     * Core logging method
     */
    static log(level: string, message: string, data?: any, context?: string): void;
    /**
     * Format log message with emojis and structure
     */
    static formatMessage(logEntry: LogEntry): string;
    /**
     * Generate unique log ID
     */
    static generateLogId(): string;
    /**
     * Context-specific logging methods
     */
    static avatar(message: string, data?: any): void;
    static presence(message: string, data?: any): void;
    static auth(message: string, data?: any): void;
    static visibility(message: string, data?: any): void;
    static realtime(message: string, data?: any): void;
    /**
     * Standard logging methods (instance methods for interface compliance)
     */
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    setLevel(level: string): void;
    log(level: string, message: string, data?: any, context?: string): void;
    /**
     * Static convenience methods
     */
    static error(message: string, data?: any, context?: string): void;
    static warn(message: string, data?: any, context?: string): void;
    static info(message: string, data?: any, context?: string): void;
    static debug(message: string, data?: any, context?: string): void;
    static success(message: string, data?: any, context?: string): void;
    /**
     * Get log history
     */
    static getHistory(level?: string | null, context?: string | null, limit?: number): LogEntry[];
    /**
     * Clear log history
     */
    static clearHistory(): void;
    /**
     * Export logs as JSON
     */
    static exportLogs(): string;
    /**
     * Performance timing
     */
    static time(label: string): {
        end: () => void;
    };
    /**
     * Group related logs
     */
    static group<T>(label: string, fn: () => T): T;
    /**
     * Log function entry/exit
     */
    static trace(functionName: string, args?: any): {
        exit: (result?: any) => void;
    };
}
export { Logger };
export default Logger;
//# sourceMappingURL=Logger.d.ts.map
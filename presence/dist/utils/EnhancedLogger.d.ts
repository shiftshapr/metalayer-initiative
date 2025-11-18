/**
 * ENHANCED LOGGING SYSTEM - TypeScript Version
 *
 * Centralized logging system with levels, filtering, and structured output.
 * Replaces scattered console.log statements throughout the codebase.
 *
 * Note: This may conflict with existing Logger.ts - consider merging or renaming.
 */
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SUCCESS';
type LogContext = 'general' | 'avatar' | 'presence' | 'auth' | 'visibility' | 'realtime';
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    data: any;
    id: string;
}
interface TimerResult {
    end: () => void;
}
interface TraceResult {
    exit: (result?: any) => void;
}
declare class EnhancedLogger {
    static readonly LOG_LEVELS: Record<LogLevel, number>;
    private static currentLevel;
    private static isEnabled;
    private static logHistory;
    private static readonly maxHistorySize;
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
    static log(level: string, message: string, data?: any, context?: LogContext): void;
    /**
     * Format log message with emojis and structure
     */
    private static formatMessage;
    /**
     * Generate unique log ID
     */
    private static generateLogId;
    /**
     * Context-specific logging methods
     */
    static avatar(message: string, data?: any): void;
    static presence(message: string, data?: any): void;
    static auth(message: string, data?: any): void;
    static visibility(message: string, data?: any): void;
    static realtime(message: string, data?: any): void;
    static error(message: string, data?: any, context?: LogContext): void;
    static warn(message: string, data?: any, context?: LogContext): void;
    static info(message: string, data?: any, context?: LogContext): void;
    static debug(message: string, data?: any, context?: LogContext): void;
    static success(message: string, data?: any, context?: LogContext): void;
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
    static time(label: string): TimerResult;
    /**
     * Group related logs
     */
    static group<T>(label: string, fn: () => T): T;
    /**
     * Log function entry/exit
     */
    static trace(functionName: string, args?: any): TraceResult;
}
export default EnhancedLogger;
export { EnhancedLogger };
//# sourceMappingURL=EnhancedLogger.d.ts.map
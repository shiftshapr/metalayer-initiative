/**
 * ENHANCED LOGGING SYSTEM - Centralized Logging
 * TypeScript + ES6 Module
 *
 * Production Mode: In production (NODE_ENV=production), DEBUG logs are stripped at build time
 * or filtered at runtime. Only ERROR and WARN logs are emitted in production.
 *
 * Usage:
 *   Logger.debug('Debug message', data, 'context');  // Only in development
 *   Logger.info('Info message', data, 'context');    // Development only
 *   Logger.warn('Warning message', data, 'context'); // Always logged
 *   Logger.error('Error message', data, 'context');   // Always logged
 */
import type { LogLevel } from '../types/index.js';
export interface LogData {
    [key: string]: unknown;
}
export interface LogEntry {
    timestamp: string;
    level: string;
    context: string;
    message: string;
    data: unknown;
    id: string;
}
declare class Logger {
    static readonly LOG_LEVELS: Record<string, number>;
    private static readonly isProduction;
    static currentLevel: number;
    static isEnabled: boolean;
    static logHistory: LogEntry[];
    static maxHistorySize: number;
    private static debugContextAllowlist;
    static setLevel(level: string): void;
    static setEnabled(enabled: boolean): void;
    static log(level: string, message: string, data?: unknown, context?: string): void;
    static formatMessage(logEntry: LogEntry): string;
    static generateLogId(): string;
    static avatar(message: string, data?: unknown): void;
    static presence(message: string, data?: unknown): void;
    static auth(message: string, data?: unknown): void;
    static visibility(message: string, data?: unknown): void;
    static realtime(message: string, data?: unknown): void;
    error(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    setLevel(level: LogLevel): void;
    log(level: string, message: string, data?: unknown, context?: string): void;
    static error(message: string, data?: unknown, context?: string): void;
    static warn(message: string, data?: unknown, context?: string): void;
    static info(message: string, data?: unknown, context?: string): void;
    static debug(message: string, data?: unknown, context?: string): void;
    static success(message: string, data?: unknown, context?: string): void;
    static getHistory(level?: string | null, context?: string | null, limit?: number): LogEntry[];
    static clearHistory(): void;
    static exportLogs(): string;
    private static normalizeContext;
    static configureDebugContexts(contexts: string[] | null | undefined): void;
    private static loadDebugContextAllowlistFromWindow;
    static isDebugEnabled(context?: string): boolean;
    static time(label: string): {
        end: () => void;
    };
    static group<T>(label: string, fn: () => T): T;
    static trace(functionName: string, args?: unknown): {
        exit: (result?: unknown) => void;
    };
    /**
     * Check if Logger is in production mode
     */
    static isProductionMode(): boolean;
    /**
     * Initialize Logger with environment-based settings
     * Call this early in application startup
     */
    static initialize(): void;
}
export { Logger };
export default Logger;
//# sourceMappingURL=Logger.d.ts.map
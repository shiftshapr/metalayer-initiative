/**
 * ENHANCED LOGGING SYSTEM - Centralized Logging
 * TypeScript + ES6 Module
 */

import type { LogLevel } from '../types/index.js';

// Type definitions for logging
export type LogData = string | number | boolean | object | Error | null | undefined;

export interface LogMetadata {
    timestamp?: Date;
    level?: 'debug' | 'info' | 'warn' | 'error';
    context?: string;
    userId?: string;
    [key: string]: unknown; // Allow additional metadata
}

export interface LogEntry {
    timestamp: string;
    level: string;
    context: string;
    message: string;
    data: LogData;
    id: string;
}

class Logger {
    static readonly LOG_LEVELS: Record<string, number> = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
        SUCCESS: 4
    };
    
    static currentLevel: number = Logger.LOG_LEVELS.DEBUG;
    static isEnabled: boolean = true;
    static logHistory: LogEntry[] = [];
    static maxHistorySize: number = 1000;

    /**
     * Set the minimum log level to display
     */
    static setLevel(level: string): void {
        const levelKey = level.toUpperCase();
        this.currentLevel = this.LOG_LEVELS[levelKey] || this.LOG_LEVELS.DEBUG;
    }
    /**
     * Enable or disable logging
     */
    static setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }
    /**
     * Core logging method
     */
    static log(level: string, message: string, data: LogData = null, context: string = 'general'): void {
        if (!this.isEnabled)
            return;
        const levelKey = level.toUpperCase();
        const levelNum = this.LOG_LEVELS[levelKey];
        if (levelNum === undefined || levelNum > this.currentLevel)
            return;
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            context: context.toUpperCase(),
            message,
            data,
            id: this.generateLogId()
        };
        // Add to history
        this.logHistory.push(logEntry);
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory.shift();
        }
        // Format and output
        const formattedMessage = this.formatMessage(logEntry);
        switch (level.toUpperCase()) {
            case 'ERROR':
                console.error(formattedMessage, data);
                break;
            case 'WARN':
                console.warn(formattedMessage, data);
                break;
            case 'INFO':
                console.info(formattedMessage, data);
                break;
            case 'DEBUG':
                console.debug(formattedMessage, data);
                break;
            case 'SUCCESS':
                console.log(formattedMessage, data);
                break;
            default:
                console.log(formattedMessage, data);
        }
    }
    /**
     * Format log message with emojis and structure
     */
    static formatMessage(logEntry: LogEntry): string {
        const emojis: Record<string, string> = {
            ERROR: '❌',
            WARN: '⚠️',
            INFO: 'ℹ️',
            DEBUG: '🔍',
            SUCCESS: '✅'
        };
        const emoji = emojis[logEntry.level] || '📝';
        return `${emoji} ${logEntry.message}`;
    }
    /**
     * Generate unique log ID
     */
    static generateLogId(): string {
        return Math.random().toString(36).substring(2, 11);
    }
    /**
     * Context-specific logging methods
     */
    static avatar(message: string, data: LogData = null): void {
        this.log('debug', message, data, 'avatar');
    }
    static presence(message: string, data: LogData = null): void {
        this.log('debug', message, data, 'presence');
    }
    static auth(message: string, data: LogData = null): void {
        this.log('debug', message, data, 'auth');
    }
    static visibility(message: string, data: LogData = null): void {
        this.log('debug', message, data, 'visibility');
    }
    static realtime(message: string, data: LogData = null): void {
        this.log('debug', message, data, 'realtime');
    }
    /**
     * Standard logging methods (instance methods for interface compliance)
     */
    error(message: string, ...args: LogData[]): void {
        Logger.log('error', message, args.length > 0 ? args : null, 'general');
    }
    warn(message: string, ...args: LogData[]): void {
        Logger.log('warn', message, args.length > 0 ? args : null, 'general');
    }
    info(message: string, ...args: LogData[]): void {
        Logger.log('info', message, args.length > 0 ? args : null, 'general');
    }
    debug(message: string, ...args: LogData[]): void {
        Logger.log('debug', message, args.length > 0 ? args : null, 'general');
    }
    setLevel(level: LogLevel): void {
        Logger.setLevel(level);
    }
    log(level: string, message: string, data: LogData = null, context: string = 'general'): void {
        Logger.log(level, message, data, context);
    }
    /**
     * Static convenience methods
     */
    static error(message: string, data: LogData = null, context: string = 'general'): void {
        this.log('error', message, data, context);
    }
    static warn(message: string, data: LogData = null, context: string = 'general'): void {
        this.log('warn', message, data, context);
    }
    static info(message: string, data: LogData = null, context: string = 'general'): void {
        this.log('info', message, data, context);
    }
    static debug(message: string, data: LogData = null, context: string = 'general'): void {
        this.log('debug', message, data, context);
    }
    static success(message: string, data: LogData = null, context: string = 'general'): void {
        this.log('success', message, data, context);
    }
    /**
     * Get log history
     */
    static getHistory(level: string | null = null, context: string | null = null, limit: number = 100): LogEntry[] {
        let filtered = this.logHistory;
        if (level) {
            filtered = filtered.filter(entry => entry.level === level.toUpperCase());
        }
        if (context) {
            filtered = filtered.filter(entry => entry.context === context.toUpperCase());
        }
        return filtered.slice(-limit);
    }
    /**
     * Clear log history
     */
    static clearHistory(): void {
        this.logHistory = [];
    }
    /**
     * Export logs as JSON
     */
    static exportLogs(): string {
        return JSON.stringify(this.logHistory, null, 2);
    }
    /**
     * Performance timing
     */
    static time(label: string): { end: () => void } {
        console.time(`⏱️ ${label}`);
        return {
            end: () => {
                console.timeEnd(`⏱️ ${label}`);
                this.success(`Timer completed: ${label}`);
            }
        };
    }
    /**
     * Group related logs
     */
    static group<T>(label: string, fn: () => T): T {
        console.group(`📁 ${label}`);
        const result = fn();
        console.groupEnd();
        return result;
    }
    /**
     * Log function entry/exit
     */
    static trace(functionName: string, args: LogData = null): { exit: (result?: LogData) => void } {
        this.debug(`Entering: ${functionName}`, args);
        return {
            exit: (result: LogData = null) => {
                this.debug(`Exiting: ${functionName}`, result);
            }
        };
    }
}

// Initialize with default settings
Logger.setLevel('DEBUG');
Logger.setEnabled(true);

// Export as ES6 module
export { Logger };
export default Logger;

// Note: Window exports will be added in compiled JS for backward compatibility
// TypeScript source uses pure ES6 exports only

/**
 * SETTINGS MODULE - Settings and Configuration
 * Handles all settings and configuration functionality
 * TypeScript + ES6 Module
 */
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SILENT';
declare class SettingsModule {
    private logLevel;
    private isInitialized;
    constructor();
    /**
     * Initialize SettingsModule
     */
    initialize(): Promise<void>;
    /**
     * Logging utility
     */
    log(level: LogLevel, message: string, ...args: unknown[]): void;
}
declare const settingsModuleInstance: SettingsModule;
export { SettingsModule, settingsModuleInstance };
export default SettingsModule;
//# sourceMappingURL=SettingsModule.d.ts.map
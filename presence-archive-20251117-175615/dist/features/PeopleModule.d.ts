/**
 * PEOPLE MODULE - People and Connections
 * Handles all people and connection functionality
 */
type LogLevel = 'SILENT' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
declare class PeopleModule {
    private logLevel;
    private isInitialized;
    private logger;
    constructor();
    /**
     * Initialize PeopleModule
     */
    initialize(): Promise<void>;
    /**
     * Logging utility
     */
    log(level: LogLevel, message: string, ...args: any[]): void;
}
/**
 * Initialize People Tab - Load real users from Supabase
 */
export declare function initializePeopleTab(): Promise<void>;
declare const peopleModuleInstance: PeopleModule;
export { PeopleModule, peopleModuleInstance };
export default PeopleModule;
//# sourceMappingURL=PeopleModule.d.ts.map
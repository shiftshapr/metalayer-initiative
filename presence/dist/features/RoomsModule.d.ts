/**
 * ROOMS MODULE - Room Management
 * Handles all room and community functionality
 */
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SILENT';
declare class RoomsModule {
    private logLevel;
    private isInitialized;
    constructor();
    /**
     * Initialize RoomsModule
     */
    initialize(): Promise<void>;
    /**
     * Logging utility
     */
    log(level: LogLevel, message: string, ...args: unknown[]): void;
}
declare const roomsModuleInstance: RoomsModule;
export { RoomsModule, roomsModuleInstance };
export default RoomsModule;
//# sourceMappingURL=RoomsModule.d.ts.map
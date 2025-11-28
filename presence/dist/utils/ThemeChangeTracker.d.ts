/**
 * Theme Change Tracker
 * Comprehensive logging for all theme changes to identify root cause
 */
declare class ThemeChangeTracker {
    private observer;
    private isTracking;
    startTracking(): void;
    stopTracking(): void;
}
declare const themeChangeTracker: ThemeChangeTracker;
export { ThemeChangeTracker, themeChangeTracker };
export default themeChangeTracker;
//# sourceMappingURL=ThemeChangeTracker.d.ts.map
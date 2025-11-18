/**
 * Navigation Manager - Abstracted Navigation System
 * Handles URL navigation and target highlighting in Chrome extension
 */
interface NavigationTarget {
    selector?: string;
    id?: string;
    className?: string;
}
declare class NavigationManager {
    constructor();
    initialize(): Promise<void>;
    navigateToUrl(url: string, target?: NavigationTarget | string): Promise<void>;
    focusAndHighlight(target?: NavigationTarget | string): Promise<void>;
}
declare const navigationManager: NavigationManager;
export { NavigationManager, navigationManager };
export default NavigationManager;
//# sourceMappingURL=NavigationManager.d.ts.map
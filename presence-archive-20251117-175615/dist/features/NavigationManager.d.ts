/**
* NavigationManager.ts
*
* Handles navigation between tabs and views, including URL navigation and target highlighting.
* Also includes diagnostic functions for testing and debugging.
*/
export declare function quickStatus(): void;
export declare function testMessage(): Promise<void>;
export declare function testAura(color?: string): void;
export declare function testMessageSystem(): Promise<void>;
export declare function testVisibility(): Promise<void>;
export declare function checkSubscriptions(): void;
export declare function testDatabase(): Promise<void>;
export declare function testEventHandlers(): void;
export declare function testMessagePropagation(): Promise<void>;
export declare function testVisibilityUI(): Promise<void>;
export declare function runFullTest(): Promise<void>;
declare class NavigationManager {
    private logger;
    constructor();
    initialize(): Promise<void>;
    navigateToUrl(url: string, target?: string): Promise<void>;
    focusAndHighlight(target: string): Promise<void>;
}
declare const navigationManagerInstance: NavigationManager;
export { NavigationManager, navigationManagerInstance };
export default NavigationManager;
//# sourceMappingURL=NavigationManager.d.ts.map
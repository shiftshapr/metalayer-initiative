import { Logger } from '../utils/Logger.js';
export interface TabNavigationHandlers {
    onAgentTab?: () => void | Promise<void>;
    onPeopleTab?: () => void | Promise<void>;
}
export interface TabNavigationOptions {
    document: Document;
    addListener: (element: Element, event: string, handler: EventListener) => void;
    logger?: typeof Logger;
    handlers?: TabNavigationHandlers;
    sidebarContentSelector?: string;
}
/**
 * Attach COMP-accurate tab navigation listeners to the DOM.
 */
export declare function attachTabNavigation(options: TabNavigationOptions): void;
export default attachTabNavigation;
//# sourceMappingURL=tabNavigation.d.ts.map
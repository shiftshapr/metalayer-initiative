/**
 * Attach COMP-accurate tab navigation listeners to the DOM.
 */
import { Logger } from '../utils/Logger.js';
interface TabNavigationOptions {
    document?: Document;
    addListener?: (element: Element, event: string, handler: () => void) => void;
    logger?: typeof Logger;
    handlers?: {
        onAgentTab?: () => Promise<void>;
        onPeopleTab?: () => Promise<void>;
        onSettingsTab?: () => Promise<void>;
    };
    sidebarContentSelector?: string;
}
export declare function attachTabNavigation(options?: TabNavigationOptions): void;
export default attachTabNavigation;
//# sourceMappingURL=tabNavigation.d.ts.map
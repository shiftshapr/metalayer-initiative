import { User, Message, ApiResponse } from '../types/index.js';
import { AvatarUtils } from '../utils/AvatarUtils.js';
import { Logger } from '../utils/Logger.js';
export type UIState = {
    activeTab: string;
    isVisible: boolean;
    isLoading: boolean;
    hasError: boolean;
};
export type VisibleUser = {
    email?: string;
    name?: string;
    avatarUrl?: string;
    status?: string;
    isCurrentUser?: boolean;
    lastSeen?: string | Date;
    id?: string;
    auraColor?: string;
    isActive?: boolean;
};
interface MessageSendResult {
    success?: boolean;
    data?: Message;
}
interface MessagingService {
    sendMessage: (content: string, metadata?: Record<string, unknown>) => Promise<MessageSendResult | null>;
    addMessageToChat?: (message: Message) => Promise<void> | void;
    loadChatHistory?: () => Promise<void>;
}
interface NavigationService {
    initializeAgentTab?: () => void | Promise<void>;
    initializePeopleTab?: () => void | Promise<void>;
}
interface VisibilityService {
    updateVisibleTab: (users: VisibleUser[] | User[]) => Promise<void>;
}
interface ThemeService {
    updateThemeEverywhere?: (theme: string) => Promise<void>;
    getCurrentUserTheme?: () => Promise<string>;
}
interface ApiClient {
    request: <T = unknown>(url: string, options?: RequestInit & {
        headers?: Record<string, string>;
    }) => Promise<ApiResponse<T>>;
}
interface UIEnvironment {
    document?: Document;
    window?: UIManagerWindow;
}
interface Config {
    avatarFallbackColor: string;
}
interface UIManagerDependencies {
    env: UIEnvironment;
    avatarUtils: typeof AvatarUtils;
    config: Config;
    visibility: VisibilityService;
    navigation?: NavigationService;
    messaging: MessagingService;
    logger: typeof Logger;
    getCurrentUser: () => User | null;
    apiClient?: ApiClient;
    theme?: ThemeService;
}
type UIManagerWindow = Window & {
    uiManager?: UIManager;
    UIManager?: typeof UIManager;
    initializeUIManager?: () => UIManager | null;
    addMessageToChat?: (message: Message) => Promise<void> | void;
    initializeAgentTab?: () => void | Promise<void>;
    initializePeopleTab?: () => void | Promise<void>;
    updateThemeEverywhere?: (theme: string) => Promise<void>;
    getCurrentUserTheme?: () => Promise<string>;
    setupTabNavigation?: () => void;
    setupMessageInputEventListeners?: () => void;
    initializeTheme?: () => Promise<void>;
    setTheme?: (theme: string) => Promise<void>;
    toggleTheme?: () => Promise<void>;
    autoResize?: (textarea: HTMLTextAreaElement | null) => void;
    api?: ApiClient;
};
export declare class UIManager {
    private readonly document?;
    private readonly avatarUtils;
    private readonly logger;
    private readonly visibility;
    private readonly navigation?;
    private readonly messaging;
    private readonly apiClient?;
    private readonly theme?;
    private readonly getCurrentUserFn;
    private readonly config;
    private readonly eventListeners;
    private uiState;
    private uiCallbacks;
    constructor(deps: UIManagerDependencies);
    initializeUI(): void;
    setupTabNavigation(): void;
    private setupEventListeners;
    private initializeModals;
    private initializeCOMPMethodFixes;
    private fixMessageUIElements;
    private fixVisibleTab;
    private fixVisibleTabFallback;
    private fixProfileMenu;
    private fixMessageInput;
    switchTab(tabId: string): void;
    private updateVisibilityDisplay;
    private updateUserList;
    private createUserListItem;
    private createUserAvatar;
    private formatLastSeen;
    private handleProfileUpdate;
    private handleError;
    private showError;
    private createErrorModal;
    private createAuthPromptModal;
    updateUIState(): void;
    showLoading(message?: string): void;
    hideLoading(): void;
    onUIStateChange(callback: (state: UIState) => void): () => void;
    getUIState(): UIState;
    setupMessageInputEventListeners(): void;
    sendChatMessage(): Promise<void>;
    cleanup(): void;
    initializeTheme(): Promise<void>;
    setTheme(theme: string, saveToDatabase?: boolean): Promise<void>;
    toggleTheme(): Promise<void>;
    runUpdateVisualHierarchyDiagnostic(): void;
    runDebugHierarchyDiagnostic(): void;
    runForceRefreshCSSDiagnostic(): void;
    private getCurrentUser;
    private addEventListener;
}
declare const getUIManagerInstance: () => UIManager;
declare const updateVisualHierarchy: () => void;
declare const debugHierarchy: () => void;
declare const forceRefreshCSS: () => void;
declare const setupTabNavigation: () => void;
declare const setupMessageInputEventListeners: () => void;
declare const initializeTheme: () => Promise<void>;
declare const setTheme: (theme: string) => Promise<void>;
declare const toggleTheme: () => Promise<void>;
declare const initializeUIManager: () => UIManager | null;
declare const uiManagerApi: {
    initializeUIManager: () => UIManager | null;
    getUIManagerInstance: () => UIManager;
    updateVisualHierarchy: () => void;
    debugHierarchy: () => void;
    forceRefreshCSS: () => void;
    setupTabNavigation: () => void;
    setupMessageInputEventListeners: () => void;
    initializeTheme: () => Promise<void>;
    setTheme: (theme: string) => Promise<void>;
    toggleTheme: () => Promise<void>;
};
export { initializeUIManager, getUIManagerInstance, updateVisualHierarchy, debugHierarchy, forceRefreshCSS, setupTabNavigation, setupMessageInputEventListeners, initializeTheme, setTheme, toggleTheme };
export default uiManagerApi;
//# sourceMappingURL=UIManager.d.ts.map
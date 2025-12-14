// Chrome API type declarations for extension development
// This provides basic Chrome API types when @types/chrome is not available

declare global {
  interface Window {
    api?: any; // Application API object
    openQuoteModal?: Function;
    showReactionPicker?: Function;
    previousView?: any;
    openRepostModal?: Function;
    focusedMessage?: any;
  }

  const chrome: {
    runtime: {
      onMessage: {
        addListener: (callback: (message: any, sender: any, sendResponse: (response: any) => void) => void) => void;
        removeListener: (callback: Function) => void;
      };
      sendMessage: (message: any, callback?: (response: any) => void) => void;
      getURL: (path: string) => string;
      getManifest: () => any;
      lastError?: { message: string };
    };
    tabs: {
      query: (queryInfo: any, callback: (tabs: any[]) => void) => void;
      create: (createProperties: any, callback?: (tab: any) => void) => void;
      update: (tabId: number, updateProperties: any, callback?: (tab: any) => void) => void;
      onUpdated: {
        addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
      };
      onActivated: {
        addListener: (callback: (activeInfo: any) => void) => void;
      };
    };
    windows: {
      getCurrent: (callback: (window: any) => void) => void;
      create: (createData: any, callback?: (window: any) => void) => void;
    };
    storage: {
      local: {
        get: (keys: string[] | string, callback?: (result: any) => void) => Promise<any> | void;
        set: (items: any, callback?: () => void) => Promise<void> | void;
        remove: (keys: string[] | string, callback?: () => void) => Promise<void> | void;
      };
      sync: {
        get: (keys: string[] | string, callback?: (result: any) => void) => Promise<any> | void;
        set: (items: any, callback?: () => void) => Promise<void> | void;
        remove: (keys: string[] | string, callback?: () => void) => Promise<void> | void;
      };
    };
    permissions: {
      contains: (permissions: any, callback: (result: boolean) => void) => void;
      request: (permissions: any, callback?: (granted: boolean) => void) => void;
    };
    contextMenus: {
      create: (createProperties: any, callback?: () => void) => void;
      remove: (menuItemId: string, callback?: () => void) => void;
      removeAll: (callback?: () => void) => void;
    };
    notifications: {
      create: (notificationId: string, options: any, callback?: (notificationId: string) => void) => void;
      clear: (notificationId: string, callback?: (wasCleared: boolean) => void) => void;
    };
    [key: string]: any; // Allow other APIs
  };
}

// Ambient module declarations for dynamic imports
declare module "../../extension/utils/UrlResolution.js";
declare module "../../extension/features/messages/index.js";

export {};


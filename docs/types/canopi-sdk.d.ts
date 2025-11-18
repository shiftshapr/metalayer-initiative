/**
 * Canopi Sidebar Tab SDK TypeScript Definitions
 * @version 1.0.0
 */

declare namespace Canopi {
  /**
   * SDK Version
   */
  const version: string;

  /**
   * Tab Registration Configuration
   */
  interface TabConfig {
    /** Tab ID (from manifest) */
    id: string;
    /** Display title */
    title: string;
    /** Icon identifier */
    icon: string;
    /** Render function called when tab is displayed */
    render: (container: HTMLElement, context: TabContext) => void | Promise<void>;
    /** Called when tab is activated */
    onActivate?: (context: TabContext) => void | Promise<void>;
    /** Called when tab is deactivated */
    onDeactivate?: (context: TabContext) => void | Promise<void>;
    /** Called when tab is destroyed */
    onDestroy?: () => void | Promise<void>;
    /** Badge configuration */
    badge?: BadgeConfig;
  }

  /**
   * Tab Context
   */
  interface TabContext {
    /** DOM container for tab content */
    container: HTMLElement;
    /** Whether tab is currently active */
    isActive: boolean;
    /** Current user ID (null if not authenticated) */
    userId: string | null;
    /** Current permission status */
    permissions: PermissionStatus;
  }

  /**
   * Badge Configuration
   */
  interface BadgeConfig {
    /** Function that returns badge value */
    getValue: () => number | string | null | Promise<number | string | null>;
    /** Update interval in milliseconds */
    updateInterval?: number;
  }

  /**
   * Tab Instance
   */
  interface TabInstance {
    /** Update tab title */
    setTitle(title: string): void;
    /** Update tab icon */
    setIcon(icon: string): void;
    /** Update badge value manually */
    setBadge(value: number | string | null): void;
    /** Show tab */
    show(): void;
    /** Hide tab */
    hide(): void;
    /** Check if tab is visible */
    isVisible(): boolean;
    /** Check if tab is active */
    isActive(): boolean;
    /** Destroy tab */
    destroy(): void;
  }

  /**
   * Bridge Request Options
   */
  interface RequestOptions {
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Number of retry attempts (default: 0) */
    retries?: number;
    /** Request priority */
    priority?: 'low' | 'normal' | 'high';
  }

  /**
   * Bridge API
   */
  interface Bridge {
    /**
     * Send request to host
     * @param event Event name
     * @param payload Request payload
     * @param options Request options
     * @returns Promise resolving to response
     */
    request<T = any>(event: string, payload?: any, options?: RequestOptions): Promise<T>;
    
    /**
     * Send notification to host (fire-and-forget)
     * @param event Event name
     * @param payload Notification payload
     */
    notify(event: string, payload?: any): void;
    
    /**
     * Listen for events from host
     * @param event Event name
     * @param handler Event handler
     * @returns Unsubscribe function
     */
    on(event: string, handler: (payload: any) => void): () => void;
    
    /**
     * Listen for events once
     * @param event Event name
     * @param handler Event handler
     */
    once(event: string, handler: (payload: any) => void): void;
    
    /**
     * Remove event listener
     * @param event Event name
     * @param handler Optional handler to remove (removes all if not specified)
     */
    off(event: string, handler?: (payload: any) => void): void;
  }

  /**
   * Permission Status
   */
  interface PermissionStatus {
    /** Granted permission scopes */
    granted: string[];
    /** Denied permission scopes */
    denied: string[];
    /** Pending permission requests */
    pending: string[];
  }

  /**
   * Permissions API
   */
  interface Permissions {
    /**
     * Check if permission is granted
     * @param scope Permission scope
     * @returns True if granted
     */
    has(scope: string): boolean;
    
    /**
     * Request permission
     * @param scope Permission scope
     * @returns Promise resolving to true if granted
     */
    request(scope: string): Promise<boolean>;
    
    /**
     * Request multiple permissions
     * @param scopes Array of permission scopes
     * @returns Promise resolving to record of scope -> granted status
     */
    requestMultiple(scopes: string[]): Promise<Record<string, boolean>>;
    
    /**
     * Get all granted permissions
     * @returns Array of granted permission scopes
     */
    getAll(): string[];
    
    /**
     * Listen for permission changes
     * @param callback Callback function
     * @returns Unsubscribe function
     */
    onChanged(callback: (scopes: string[]) => void): () => void;
  }

  /**
   * Storage Changes
   */
  interface StorageChanges {
    local?: {
      [key: string]: { oldValue?: any; newValue?: any };
    };
    sync?: {
      [key: string]: { oldValue?: any; newValue?: any };
    };
  }

  /**
   * Storage API
   */
  interface Storage {
    /** Local storage (tab-specific, not synced) */
    local: StorageArea;
    /** Sync storage (synced across devices, tab-specific) */
    sync: StorageArea;
    /**
     * Listen for storage changes
     * @param callback Callback function
     * @returns Unsubscribe function
     */
    onChanged(callback: (changes: StorageChanges) => void): () => void;
  }

  /**
   * Storage Area
   */
  interface StorageArea {
    /**
     * Get value from storage
     * @param key Storage key
     * @returns Promise resolving to value or null
     */
    get<T = any>(key: string): Promise<T | null>;
    
    /**
     * Set value in storage
     * @param key Storage key
     * @param value Value to store
     */
    set(key: string, value: any): Promise<void>;
    
    /**
     * Remove value from storage
     * @param key Storage key
     */
    remove(key: string): Promise<void>;
    
    /**
     * Clear all storage
     */
    clear(): Promise<void>;
    
    /**
     * Get all storage values
     * @returns Promise resolving to record of all key-value pairs
     */
    getAll(): Promise<Record<string, any>>;
    
    /**
     * Get all storage keys
     * @returns Promise resolving to array of keys
     */
    keys(): Promise<string[]>;
  }

  /**
   * User Profile
   */
  interface UserProfile {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
    preferences?: Record<string, any>;
  }

  /**
   * User API
   */
  interface User {
    /**
     * Get current user
     * @returns Promise resolving to user profile or null
     */
    getCurrent(): Promise<UserProfile | null>;
    
    /**
     * Get user ID
     * @returns Promise resolving to user ID or null
     */
    getId(): Promise<string | null>;
    
    /**
     * Check if user is authenticated
     * @returns Promise resolving to true if authenticated
     */
    isAuthenticated(): Promise<boolean>;
    
    /**
     * Listen for user changes
     * @param callback Callback function
     * @returns Unsubscribe function
     */
    onChanged(callback: (user: UserProfile | null) => void): () => void;
  }

  /**
   * Theme Tokens
   */
  interface ThemeTokens {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      warning: string;
      success: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
    };
  }

  /**
   * Theme API
   */
  interface Theme {
    /**
     * Get current theme
     * @returns Promise resolving to current theme
     */
    getCurrent(): Promise<'light' | 'dark' | 'auto'>;
    
    /**
     * Set theme
     * @param theme Theme to set
     */
    set(theme: 'light' | 'dark' | 'auto'): Promise<void>;
    
    /**
     * Get theme tokens (CSS variables)
     * @returns Promise resolving to theme tokens
     */
    getTokens(): Promise<ThemeTokens>;
    
    /**
     * Listen for theme changes
     * @param callback Callback function
     * @returns Unsubscribe function
     */
    onChanged(callback: (theme: 'light' | 'dark' | 'auto') => void): () => void;
  }

  /**
   * Diagnostic Session
   */
  interface DiagnosticSession {
    /** Start diagnostic session */
    start(): void;
    /** End diagnostic session */
    end(): void;
    /**
     * Report diagnostic information
     * @param level Diagnostic level
     * @param message Diagnostic message
     * @param data Optional diagnostic data
     */
    report(level: string, message: string, data?: any): void;
  }

  /**
   * Diagnostics API
   */
  interface Diagnostics {
    /**
     * Report diagnostic information
     * @param level Diagnostic level
     * @param message Diagnostic message
     * @param data Optional diagnostic data
     */
    report(level: 'error' | 'warn' | 'info' | 'debug', message: string, data?: any): void;
    
    /**
     * Report error
     * @param message Error message
     * @param error Optional error object
     * @param context Optional context data
     */
    error(message: string, error?: Error, context?: any): void;
    
    /**
     * Report warning
     * @param message Warning message
     * @param data Optional data
     */
    warn(message: string, data?: any): void;
    
    /**
     * Report info
     * @param message Info message
     * @param data Optional data
     */
    info(message: string, data?: any): void;
    
    /**
     * Report debug
     * @param message Debug message
     * @param data Optional data
     */
    debug(message: string, data?: any): void;
    
    /**
     * Create diagnostic session
     * @param name Session name
     * @returns Diagnostic session
     */
    createSession(name: string): DiagnosticSession;
  }

  /**
   * Canopi Error Base Class
   */
  class CanopiError extends Error {
    code: string;
    details?: any;
  }

  /**
   * Permission Error
   */
  class PermissionError extends CanopiError {
    code: 'PERMISSION_DENIED' | 'PERMISSION_REQUIRED';
    scope: string;
  }

  /**
   * Bridge Error
   */
  class BridgeError extends CanopiError {
    code: 'BRIDGE_TIMEOUT' | 'BRIDGE_ERROR' | 'BRIDGE_INVALID_RESPONSE';
    event: string;
  }

  /**
   * Storage Error
   */
  class StorageError extends CanopiError {
    code: 'STORAGE_QUOTA_EXCEEDED' | 'STORAGE_ERROR';
    key?: string;
  }

  /**
   * Main SDK Interface
   */
  interface SDK {
    /** SDK version */
    readonly version: string;
    
    /**
     * Register a sidebar tab
     * @param config Tab configuration
     * @returns Tab instance
     */
    registerTab(config: TabConfig): TabInstance;
    
    /** Bridge communication API */
    readonly bridge: Bridge;
    
    /** Permissions API */
    readonly permissions: Permissions;
    
    /** Storage API */
    readonly storage: Storage;
    
    /** User API */
    readonly user: User;
    
    /** Theme API */
    readonly theme: Theme;
    
    /** Diagnostics API */
    readonly diagnostics: Diagnostics;
  }
}

/**
 * Global Canopi SDK instance
 */
declare const canopi: Canopi.SDK;

/**
 * Make SDK available on window object
 */
declare global {
  interface Window {
    canopi: Canopi.SDK;
  }
}

export = Canopi;
export as namespace Canopi;






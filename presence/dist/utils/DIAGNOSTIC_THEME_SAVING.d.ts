/**
 * Diagnostic script for theme saving and toggle issues
 * Run: diagnoseThemeSaving() in browser console
 */
interface ThemeToggleResults {
    exists: boolean;
    checked?: boolean;
    handlerAttached?: boolean;
    darkLabelExists?: boolean;
    darkLabelText?: string;
    darkLabelColor?: string;
    lightLabelExists?: boolean;
    eventListenerWorking?: boolean;
}
interface ProfileToggleResults {
    exists: boolean;
    handlerAttached?: boolean;
    disabled?: boolean;
    style?: {
        pointerEvents?: string;
        cursor?: string;
        opacity?: string;
        visibility?: string;
    };
}
interface UserPreferencesManagerResults {
    exists: boolean;
    isInitialized?: boolean;
    currentTheme?: string;
}
interface ChromeStorageResults {
    theme?: string;
    exists?: boolean;
    error?: string;
}
interface DatabaseResults {
    theme?: string;
    exists?: boolean;
    error?: string;
}
interface ConsistencyResults {
    allMatch: boolean;
    uniqueThemes: string[];
    allThemes: Record<string, string | undefined>;
}
interface AuraLayoutResults {
    flexWrap?: string;
    display?: string;
    width?: string;
    intensitySliderWidth?: string;
    allInOneRow?: boolean;
    sameRow?: boolean;
}
interface DiagnosticResults {
    timestamp: string;
    themeToggle: ThemeToggleResults;
    profileToggle: ProfileToggleResults;
    userPreferencesManager: UserPreferencesManagerResults;
    chromeStorage: ChromeStorageResults;
    database: DatabaseResults;
    domTheme?: string;
    consistency?: ConsistencyResults;
    auraLayout?: AuraLayoutResults;
    errors: Array<string | {
        type: string;
        message: string;
        recommendation?: string;
    }>;
}
/**
 * Diagnoses theme saving and toggle issues
 */
export declare function diagnoseThemeSaving(): Promise<DiagnosticResults>;
export {};
//# sourceMappingURL=DIAGNOSTIC_THEME_SAVING.d.ts.map
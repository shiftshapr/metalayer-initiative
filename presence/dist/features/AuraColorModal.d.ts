/**
 * AURA COLOR MODAL - Aura Color Management
 * Handles all aura color modal functionality
 */
declare class AuraColorModal {
    private logLevel;
    private isInitialized;
    private logger;
    constructor();
    /**
     * Initialize AuraColorModal
     */
    initialize(): Promise<void>;
    /**
     * Logging utility
     */
    private log;
}
export declare function getCurrentUserAvatarBgColor(): Promise<string>;
export declare function showColorPickerModal(): Promise<void>;
export declare function closeColorPickerModal(): void;
export declare function updateColorPreview(hex: string): void;
export declare function setCustomAvatarColor(color: string): Promise<void>;
export declare function resetUserAvatarBgColor(): Promise<void>;
export declare function broadcastAuraColorChange(color: string): Promise<void>;
export declare function updateUserAuraInUI(userId: string, auraColor: string, skipVisibilityRefresh?: boolean): Promise<void>;
export declare function updateAvatarAura(avatar: Element, auraColor: string): void;
export declare function updateAllVisibilityAvatars(userId: string, auraColor: string): void;
export declare function broadcastAuraChange(auraColor: string): Promise<void>;
export declare function isValidHex(hex: string): boolean;
declare const auraColorModalInstance: AuraColorModal;
export { AuraColorModal, auraColorModalInstance };
export default AuraColorModal;
//# sourceMappingURL=AuraColorModal.d.ts.map
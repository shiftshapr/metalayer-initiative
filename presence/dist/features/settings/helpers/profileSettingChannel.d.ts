export type ProfileSettingKey = 'displayName' | 'headline';
type ProfileSettingChannel = {
    read: () => Promise<string>;
    save: (value: string | null) => Promise<void>;
    delete: () => Promise<void>;
};
export declare function initializeProfileSettingHelpers(): boolean;
export declare function createProfileSettingChannel(setting: ProfileSettingKey): ProfileSettingChannel;
export declare const profileSettingHelpersApi: {
    initializeProfileSettingHelpers: typeof initializeProfileSettingHelpers;
    createProfileSettingChannel: typeof createProfileSettingChannel;
};
export default profileSettingHelpersApi;
//# sourceMappingURL=profileSettingChannel.d.ts.map
import type { Message, SupabaseClient } from './index.js';
import type { VisibilityUser } from '../features/visibility/core/VisibilityTypes.js';
export interface SupabaseRealtimeUserPayload {
    user_email: string;
    aura_color?: string;
    [key: string]: unknown;
}
export interface SupabaseRealtimeVisibilityPayload {
    user_email: string;
    is_visible: boolean;
    [key: string]: unknown;
}
export type SupabaseRealtimeMessagePayload = Message | ({
    user_email?: string;
    content?: string;
    [key: string]: unknown;
});
export interface SupabaseRealtimeClientBridge {
    initialize?: (client: SupabaseClient) => Promise<boolean>;
    isConnected?: boolean;
    sendMessage?: (content: string, parentId?: string | null, conversationId?: string | null) => Promise<boolean>;
    broadcastAuraColorChange?: (color: string) => Promise<boolean>;
    updatePresence?: (pageId: string, pageUrl: string, auraColor: string) => Promise<boolean>;
    setUserVisibility?: (visibility: boolean | {
        isVisible: boolean;
        pageUrl?: string;
    }, pageUrl?: string) => Promise<boolean>;
    setCurrentUser?: (primaryIdentifier?: string | null, secondaryIdentifier?: string | null, communityId?: string | null) => Promise<void>;
    joinPage?: (pageId: string, pageUrl: string) => Promise<void>;
    on?: (event: string, handler: (eventType: string, newRecord: unknown, oldRecord: unknown) => void) => void;
    onUserJoined?: (user: SupabaseRealtimeUserPayload) => void;
    onUserLeft?: (user: SupabaseRealtimeUserPayload) => void;
    onUserUpdated?: (user: SupabaseRealtimeUserPayload) => void;
    onNewMessage?: (message: SupabaseRealtimeMessagePayload) => Promise<void>;
    onVisibilityChanged?: (visibility: SupabaseRealtimeVisibilityPayload) => void;
    getPageUsers?: (pageId: string) => Promise<Array<VisibilityUser | Record<string, unknown>>>;
    [key: string]: unknown;
}
//# sourceMappingURL=realtime.d.ts.map
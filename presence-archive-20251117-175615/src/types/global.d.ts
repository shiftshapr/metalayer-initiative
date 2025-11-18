/**
 * Global Type Definitions
 * Extend Window interface for custom properties
 */

import { User, Message } from './index.js';
import type {
  DiagnosticLogEntry,
  MessageDisplayDiagnosticResult,
  ComprehensiveFormattingDiagnosticResult,
  RootCauseDiagnosticResult
} from '../utils/diagnostics/types.js';

declare global {
  interface Window {
    currentUser?: User | null;
    AVATAR_FALLBACK_COLOR?: string;
    AvatarUtils?: any;
    configManager?: any;
    supabaseRealtimeClient?: any;
    robustIntegration?: any;
    reactionsIntegration?: any;
    aurasIntegration?: any;
    api?: any;
    addMessageToChat?: (message: Partial<Message> | Record<string, any>) => Promise<void>;
    loadChatHistory?: (communityIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    loadMessageReactions?: (messageId: string, reactionBtn?: HTMLElement | null) => Promise<void>;
    handleMessageFocus?: (messageOrId: Message | string) => Promise<void>;
    createUnifiedMessageElement?: (message: Message) => Promise<HTMLElement>;
    updateReactionDisplay?: (messageId: string, reactions: any[]) => void;
    addMessageActionListeners?: (messageDiv: HTMLElement, message: Message) => void;
    refreshAllReactionDisplays?: () => void;
    refreshAllMessageAvatars?: () => void;
    currentChatData?: any[];
    currentVisibilityData?: any[];
    currentVisibilityDataUnfiltered?: any;
    currentUrlData?: any;
    activeCommunities?: string[];
    navigationManager?: any;
    notificationHistory?: any;
    logger?: any;
    messageDiagnostic?: any;
    StatusDotHelper?: any;
    runMessageDisplayDiagnostic?: () => Promise<MessageDisplayDiagnosticResult>;
    runComprehensiveFormattingDiagnostic?: () => Promise<ComprehensiveFormattingDiagnosticResult>;
    runRootCauseDiagnostic?: () => Promise<RootCauseDiagnosticResult>;
    messageDisplayDiagnosticResults?: MessageDisplayDiagnosticResult;
    formattingDiagnosticResults?: ComprehensiveFormattingDiagnosticResult;
    rootCauseDiagnosticResults?: RootCauseDiagnosticResult;
    canopiDiagnosticLog?: DiagnosticLogEntry[];
    canopiDiagnostics?: {
      runAll: () => Promise<Record<string, unknown>>;
    };
    [key: string]: any; // Allow dynamic properties
  }
}

export {};


import { Message } from '../types/index.js';

export interface LegacyMessagingResult {
  success?: boolean;
  data?: Message | any;
}

type MessagingWindow = Window & {
  sendMessageViaSupabase?: (
    content: string,
    parentId?: string | null,
    conversationId?: string | null
  ) => Promise<Message | null>;
  loadChatHistory?: () => Promise<void>;
};

const getMessagingWindow = (): MessagingWindow | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window as MessagingWindow;
};

export async function sendLegacyMessage(
  content: string,
  options: { parentId?: string | null; conversationId?: string | null } = {}
): Promise<LegacyMessagingResult | null> {
  const messagingWindow = getMessagingWindow();
  if (!messagingWindow || typeof messagingWindow.sendMessageViaSupabase !== 'function') {
    return null;
  }

  const data = await messagingWindow.sendMessageViaSupabase(
    content,
    options.parentId ?? null,
    options.conversationId ?? null
  );

  return data ? { success: true, data } : { success: false };
}

export async function reloadLegacyChatHistory(): Promise<void> {
  const messagingWindow = getMessagingWindow();
  if (!messagingWindow || typeof messagingWindow.loadChatHistory !== 'function') {
    return;
  }
  await messagingWindow.loadChatHistory();
}

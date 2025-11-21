/**
 * Message Display Diagnostic (TypeScript Module)
 * Comprehensive diagnostic for chat message rendering
 */

import { recordDiagnosticLog, withConsoleGroup } from './logger.js';
import {
  MessageDisplayDiagnosticResult,
  AvatarCheckResult,
  IconCheckResult,
  ActionCheckResult,
  OrderCheckResult,
  ReplyCheckResult,
  InfoCheckResult,
  RenderingCheckResult
} from './types.js';

type MessageElement = HTMLElement & { dataset: DOMStringMap };

const requireDocument = (): Document => {
  if (typeof document === 'undefined') {
    throw new Error('MessageDisplayDiagnostic requires a DOM environment');
  }
  return document;
};

const getMessages = (): MessageElement[] =>
  Array.from(requireDocument().querySelectorAll<MessageElement>('.message[data-message-id]'));

const checkAvatars = (messages: MessageElement[]): AvatarCheckResult => {
  const result: AvatarCheckResult = {
    totalMessages: messages.length,
    messagesWithAvatars: 0,
    messagesWithoutAvatars: 0,
    avatarIssues: []
  };

  messages.forEach((msg, index) => {
    const avatar = msg.querySelector<HTMLElement>('.avatar-container, .avatar, .message-avatar');
    const messageId = msg.dataset.messageId ?? null;

    if (avatar) {
      const img = avatar.querySelector<HTMLImageElement>('img');
      const hasImage = !!img && !!img.src && !img.src.includes('data:image/svg');
      const hasAura = !!avatar.querySelector('.aura-ring, .avatar-aura');

      if (hasImage || hasAura) {
        result.messagesWithAvatars++;
      } else {
        result.messagesWithoutAvatars++;
        result.avatarIssues.push({
          messageId,
          index,
          reason: 'Avatar container missing image or aura'
        });
      }
    } else {
      result.messagesWithoutAvatars++;
      result.avatarIssues.push({
        messageId,
        index,
        reason: 'Avatar container missing entirely'
      });
    }
  });

  return result;
};

const checkIcons = (messages: MessageElement[]): IconCheckResult => {
  const result: IconCheckResult = {
    totalMessages: messages.length,
    messagesWithIcons: 0,
    messagesWithoutIcons: 0,
    missingIcons: []
  };

  messages.forEach((msg, index) => {
    const messageId = msg.dataset.messageId ?? null;
    const replyBtn = msg.querySelector('.inline-reply-btn, .reply-btn');
    const reactionBtn = msg.querySelector('.reaction-btn, .emoji-btn');
    const bookmarkBtn = msg.querySelector('.bookmark-btn');
    const shareBtn = msg.querySelector('.share-btn');

    const hasIcons = !!(replyBtn || reactionBtn || bookmarkBtn || shareBtn);

    if (hasIcons) {
      result.messagesWithIcons++;
    } else {
      result.messagesWithoutIcons++;
      result.missingIcons.push({
        messageId,
        index,
        missing: {
          reply: !replyBtn,
          reaction: !reactionBtn,
          bookmark: !bookmarkBtn,
          share: !shareBtn
        }
      });
    }
  });

  return result;
};

const checkActions = (messages: MessageElement[]): ActionCheckResult => {
  const result: ActionCheckResult = {
    totalMessages: messages.length,
    messagesWithIcons: 0,
    messagesWithoutIcons: 0,
    missingIcons: []
  };

  messages.forEach((msg, index) => {
    const messageId = msg.dataset.messageId ?? null;
    const actionMenu = msg.querySelector('.message-actions-menu, .action-dots-btn');
    const editBtn = msg.querySelector('.edit-btn');
    const deleteBtn = msg.querySelector('.delete-btn');
    const hasActions = !!(actionMenu || editBtn || deleteBtn);

    if (hasActions) {
      result.messagesWithIcons++;
    } else {
      result.messagesWithoutIcons++;
      result.missingIcons.push({
        messageId,
        index,
        missing: {
          actionMenu: !actionMenu,
          edit: !editBtn,
          delete: !deleteBtn
        }
      });
    }
  });

  return result;
};

const checkOrder = (messages: MessageElement[]): OrderCheckResult => {
  const messageData = messages.map(msg => ({
    id: msg.dataset.messageId ?? null,
    createdAt: msg.dataset.createdAt ?? msg.getAttribute('data-created-at'),
    element: msg
  }));

  const orderIssues: OrderCheckResult['orderIssues'] = [];

  for (let i = 0; i < messageData.length - 1; i++) {
    const current = messageData[i];
    const next = messageData[i + 1];

    if (current.createdAt && next.createdAt) {
      const currentTime = new Date(current.createdAt).getTime();
      const nextTime = new Date(next.createdAt).getTime();
      if (currentTime < nextTime) {
        orderIssues.push({
          position: i,
          current: current.id,
          next: next.id,
          currentTime: current.createdAt,
          nextTime: next.createdAt
        });
      }
    }
  }

  return {
    totalMessages: messages.length,
    isDescending: orderIssues.length === 0,
    orderIssues
  };
};

const checkReplies = (messages: MessageElement[]): ReplyCheckResult => {
  const replies = messages.filter(msg => {
    const parentId = msg.dataset.parentId ?? msg.getAttribute('data-parent-id');
    const isReply = msg.classList.contains('message-reply') || msg.classList.contains('thread-reply');
    return !!parentId || isReply;
  });

  const visibleReplies = replies.filter(msg => {
    const style = window.getComputedStyle(msg);
    return style.display !== 'none' && !msg.classList.contains('hidden');
  });

  const result: ReplyCheckResult = {
    totalReplies: replies.length,
    visibleReplies: visibleReplies.length,
    hiddenReplies: replies.length - visibleReplies.length,
    threadStarters: messages.length - replies.length,
    visibleSample: visibleReplies.slice(0, 5).map(msg => ({
      messageId: msg.dataset.messageId ?? null,
      parentId: msg.dataset.parentId ?? msg.getAttribute('data-parent-id')
    }))
  };

  return result;
};

const checkInfo = (messages: MessageElement[]): InfoCheckResult => {
  const result: InfoCheckResult = {
    totalMessages: messages.length,
    messagesWithTime: 0,
    messagesWithSender: 0,
    messagesWithContent: 0,
    missingInfo: []
  };

  messages.forEach((msg, index) => {
    const messageId = msg.dataset.messageId ?? null;
    const timeEl = msg.querySelector('.message-time, .timestamp');
    const senderEl = msg.querySelector('.message-sender-name, .sender-name');
    const contentEl = msg.querySelector('.message-content, .content');

    const hasTime = !!timeEl && timeEl.textContent?.trim() !== '';
    const hasSender = !!senderEl && senderEl.textContent?.trim() !== '';
    const hasContent = !!contentEl && contentEl.textContent?.trim() !== '';

    if (hasTime) result.messagesWithTime++;
    if (hasSender) result.messagesWithSender++;
    if (hasContent) result.messagesWithContent++;

    if (!hasTime || !hasSender || !hasContent) {
      result.missingInfo.push({
        messageId,
        index,
        missing: {
          time: !hasTime,
          sender: !hasSender,
          content: !hasContent
        }
      });
    }
  });

  return result;
};

const checkRendering = (): RenderingCheckResult => {
  const globalWindow = window as typeof window & {
    UnifiedMessageRenderer?: Record<string, unknown>;
    AvatarUtils?: Record<string, unknown> & { createUnifiedAvatar?: (...args: any[]) => unknown };
    createUnifiedMessageElement?: (...args: any[]) => unknown;
    addMessageActionListeners?: (...args: any[]) => unknown;
  };

  const renderer = globalWindow.UnifiedMessageRenderer;
  const AvatarUtils = globalWindow.AvatarUtils;

  return {
    UnifiedMessageRenderer: typeof renderer !== 'undefined',
    createUnifiedMessageElement: typeof globalWindow.createUnifiedMessageElement === 'function',
    addMessageActionListeners: typeof globalWindow.addMessageActionListeners === 'function',
    AvatarUtils: typeof AvatarUtils !== 'undefined',
    createUnifiedAvatar: !!AvatarUtils && typeof AvatarUtils.createUnifiedAvatar === 'function'
  };
};

const logSection = (label: string, metrics: Record<string, unknown>): void => {
  withConsoleGroup(label, () => {
    Object.entries(metrics).forEach(([key, value]) => console.log(`${key}:`, value));
  });
};

export const runMessageDisplayDiagnostic = async (): Promise<MessageDisplayDiagnosticResult> => {
  const messages = getMessages();
  const timestamp = new Date().toISOString();

  const avatars = checkAvatars(messages);
  const icons = checkIcons(messages);
  const actions = checkActions(messages);
  const order = checkOrder(messages);
  const replies = checkReplies(messages);
  const info = checkInfo(messages);
  const rendering = checkRendering();

  logSection('📸 Message Avatars', {
    total: avatars.totalMessages,
    withAvatars: avatars.messagesWithAvatars,
    withoutAvatars: avatars.messagesWithoutAvatars,
    sampleIssues: avatars.avatarIssues.slice(0, 5)
  });

  logSection('🎨 Message Icons', {
    withIcons: icons.messagesWithIcons,
    withoutIcons: icons.messagesWithoutIcons,
    missingSample: icons.missingIcons.slice(0, 5)
  });

  logSection('⚙️ Message Actions', {
    withActions: actions.messagesWithIcons,
    withoutActions: actions.messagesWithoutIcons,
    missingSample: actions.missingIcons.slice(0, 5)
  });

  logSection('📊 Message Order', {
    total: order.totalMessages,
    isDescending: order.isDescending,
    issues: order.orderIssues.slice(0, 3)
  });

  logSection('💬 Replies', {
    totalReplies: replies.totalReplies,
    visibleReplies: replies.visibleReplies,
    hiddenReplies: replies.hiddenReplies,
    visibleSample: replies.visibleSample
  });

  logSection('ℹ️ Message Info', {
    messagesWithTime: info.messagesWithTime,
    messagesWithSender: info.messagesWithSender,
    messagesWithContent: info.messagesWithContent,
    missingSample: info.missingInfo.slice(0, 5)
  });

  logSection('🔧 Rendering Functions', rendering as unknown as Record<string, unknown>);

  const result: MessageDisplayDiagnosticResult = {
    timestamp,
    avatars,
    icons,
    actions,
    order,
    replies,
    info,
    rendering
  };

  (window as typeof window & { messageDisplayDiagnosticResults?: MessageDisplayDiagnosticResult }).messageDisplayDiagnosticResults =
    result;

  const issues: string[] = [];
  if (avatars.messagesWithoutAvatars > 0) issues.push(`${avatars.messagesWithoutAvatars} messages missing avatars`);
  if (icons.messagesWithoutIcons > 0) issues.push(`${icons.messagesWithoutIcons} messages missing icons`);
  if (actions.messagesWithoutIcons > 0) issues.push(`${actions.messagesWithoutIcons} messages missing actions`);
  if (!order.isDescending) issues.push('Messages not sorted descending');
  if (replies.visibleReplies > 0) issues.push(`${replies.visibleReplies} replies visible in default view`);
  if (info.missingInfo.length > 0) issues.push(`${info.missingInfo.length} messages missing info`);
  if (!rendering.UnifiedMessageRenderer || !rendering.createUnifiedMessageElement) {
    issues.push('Rendering functions missing');
  }

  recordDiagnosticLog({
    id: 'message-display',
    name: 'Message Display Diagnostic',
    status: issues.length === 0 ? 'pass' : 'fail',
    summary: issues.length === 0 ? 'All message display checks passed' : 'Message display issues detected',
    category: 'messages',
    metrics: {
      totalMessages: avatars.totalMessages,
      avatarsMissing: avatars.messagesWithoutAvatars,
      iconsMissing: icons.messagesWithoutIcons,
      actionsMissing: actions.messagesWithoutIcons,
      repliesVisible: replies.visibleReplies
    },
    issues
  });

  return result;
};



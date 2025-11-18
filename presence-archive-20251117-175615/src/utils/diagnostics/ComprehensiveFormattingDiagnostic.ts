/**
 * Comprehensive Formatting Diagnostic (TypeScript Module)
 * Evaluates UI formatting concerns spanning icons, auras, actions, focus links, visibility tab.
 */

import { recordDiagnosticLog, withConsoleGroup } from './logger.js';
import { ComprehensiveFormattingDiagnosticResult, FormattingRootCause } from './types.js';

interface RendererWindow extends Window {
  UnifiedMessageRenderer?: {
    generateMessageHTML?: (...args: unknown[]) => string;
  };
  AvatarUtils?: {
    createUnifiedAvatar?: (...args: unknown[]) => HTMLElement;
  };
  formattingDiagnosticResults?: ComprehensiveFormattingDiagnosticResult;
}

type MessageElement = HTMLElement & { dataset: DOMStringMap };

const getMessages = (): MessageElement[] =>
  Array.from(document.querySelectorAll<MessageElement>('.message[data-message-id]'));

const addFinding = (
  collection: FormattingRootCause[],
  finding: FormattingRootCause | null | undefined
): void => {
  if (finding) {
    collection.push(finding);
  }
};

const diagnoseMessageIcons = (messages: MessageElement[]): FormattingRootCause | null => {
  const messagesWithIcons = messages.filter(msg => {
    const replyBtn = msg.querySelector('.inline-reply-btn, .reply-btn');
    const reactionBtn = msg.querySelector('.reaction-btn, .emoji-btn');
    const bookmarkBtn = msg.querySelector('.bookmark-btn');
    const shareBtn = msg.querySelector('.share-btn');
    const hasIcon = replyBtn || reactionBtn || bookmarkBtn || shareBtn;
    return !!hasIcon && !!(replyBtn?.querySelector('svg, .icon') || reactionBtn?.querySelector('svg, .icon'));
  });

  console.log(`🎨 Message icons working: ${messagesWithIcons.length}/${messages.length}`);

  if (messagesWithIcons.length < messages.length) {
    return {
      severity: 'HIGH',
      issue: 'Message icons not rendering',
      rootCause: 'Icon SVG content missing or CSS hiding icons',
      evidence: {
        totalMessages: messages.length,
        messagesWithIcons: messagesWithIcons.length
      },
      fix: 'Verify UnifiedMessageRenderer generates action icons and CSS ensures visibility'
    };
  }

  return null;
};

const diagnoseAvatarAuras = (messages: MessageElement[]): FormattingRootCause | null => {
  const messagesWithAuras = messages.filter(msg => {
    const aura = msg.querySelector('.aura-ring, .avatar-aura');
    if (!aura) return false;
    const color = window.getComputedStyle(aura).backgroundColor;
    return !!color && !color.includes('255, 255, 255');
  });

  console.log(`🌈 Avatar auras valid: ${messagesWithAuras.length}/${messages.length}`);

  if (messagesWithAuras.length < messages.length) {
    const auraColors = Array.from(
      new Set(
        messages
          .map(msg => msg.querySelector('.aura-ring, .avatar-aura'))
          .filter(Boolean)
          .map(el => window.getComputedStyle(el as Element).backgroundColor)
      )
    );

    return {
      severity: 'HIGH',
      issue: 'Avatar auras defaulting to white',
      rootCause: 'Aura colors not supplied to AvatarUtils.createUnifiedAvatar',
      evidence: {
        auraColors
      },
      fix: 'Ensure aura color retrieved from user data and passed into avatar renderer'
    };
  }

  return null;
};

const diagnoseActionsMenu = (): FormattingRootCause | null => {
  const menus = Array.from(document.querySelectorAll('.message-actions-menu, .action-menu'));
  const offscreen = menus.filter(menu => {
    const rect = menu.getBoundingClientRect();
    return rect.right > window.innerWidth || rect.bottom > window.innerHeight || rect.left < 0 || rect.top < 0;
  });

  console.log(`📋 Actions menu off-screen: ${offscreen.length}/${menus.length}`);

  if (offscreen.length > 0) {
    return {
      severity: 'MEDIUM',
      issue: 'Actions menu positioned outside viewport',
      rootCause: 'Menu positioning not clamping to viewport bounds',
      evidence: {
        menusOffScreen: offscreen.length
      },
      fix: 'Add viewport boundary checks and flip menu when necessary'
    };
  }

  return null;
};

const diagnoseFocusModeLink = (): FormattingRootCause | null => {
  const bodies = Array.from(document.querySelectorAll('.message-content, .message-body'));
  const bodiesWithLink = bodies.filter(body => {
    const hasClick =
      !!body.getAttribute('onclick') || typeof (body as HTMLElement).onclick === 'function' || !!body.getAttribute('data-focus-mode');
    const parent = body.closest('.message');
    const parentHasClick =
      !!parent &&
      (typeof (parent as HTMLElement).onclick === 'function' ||
        !!parent.getAttribute('onclick') ||
        !!parent.getAttribute('data-focus-mode'));
    return hasClick || parentHasClick;
  });

  console.log(`🔗 Focus mode links: ${bodiesWithLink.length}/${bodies.length}`);

  if (bodiesWithLink.length < bodies.length) {
    return {
      severity: 'HIGH',
      issue: 'Message body does not navigate to focus mode',
      rootCause: 'Missing click handler on message body or parent element',
      evidence: {
        bodiesWithLink: bodiesWithLink.length,
        totalBodies: bodies.length
      },
      fix: 'Attach focus-mode click handler within CanopiModule message renderer'
    };
  }

  return null;
};

const diagnoseVisibilityTab = (): FormattingRootCause | null => {
  const visibilityTab = document.querySelector('#visibility-tab, .visibility-tab-content');
  if (!visibilityTab) {
    return {
      severity: 'MEDIUM',
      issue: 'Visibility tab element missing',
      rootCause: 'Visibility DOM not mounted or selector changed'
    };
  }

  const visibilityMessages = visibilityTab.querySelectorAll('.message, [data-message-id]');
  const visibilityUsers = visibilityTab.querySelectorAll('.user-avatar, .presence-user, [data-user-id]');

  console.log(`👁️ Visibility tab users=${visibilityUsers.length}, messages=${visibilityMessages.length}`);

  if (visibilityMessages.length > 0) {
    return {
      severity: 'CRITICAL',
      issue: 'Visibility tab rendering messages instead of users',
      rootCause: 'VisibilityManager rendering incorrect component',
      evidence: {
        visibilityMessages: visibilityMessages.length,
        visibilityUsers: visibilityUsers.length
      },
      fix: 'Ensure updateVisibleTab renders presence data only'
    };
  }

  return null;
};

const diagnoseRendererAvailability = (): FormattingRootCause | null => {
  const diagWindow = window as RendererWindow;
  const rendererAvailable = typeof diagWindow.UnifiedMessageRenderer !== 'undefined';
  const generateHTMLAvailable =
    rendererAvailable && typeof diagWindow.UnifiedMessageRenderer?.generateMessageHTML === 'function';
  const avatarUtilsAvailable = typeof diagWindow.AvatarUtils !== 'undefined';
  const createAvatarAvailable =
    !!diagWindow.AvatarUtils && typeof diagWindow.AvatarUtils.createUnifiedAvatar === 'function';

  console.log('🔧 Renderer availability', {
    rendererAvailable,
    generateHTMLAvailable,
    avatarUtilsAvailable,
    createAvatarAvailable
  });

  if (!generateHTMLAvailable || !createAvatarAvailable) {
    return {
      severity: 'CRITICAL',
      issue: 'Rendering helpers unavailable',
      rootCause: 'UnifiedMessageRenderer or AvatarUtils not loaded in sidepanel',
      fix: 'Verify script load order and exports in sidepanel.html'
    };
  }

  return null;
};

const diagnoseMessageStructure = (messages: MessageElement[]): FormattingRootCause | null => {
  if (messages.length === 0) return null;
  const sample = messages[0];
  const structure = {
    hasAvatar: !!sample.querySelector('.avatar-container'),
    hasContent: !!sample.querySelector('.message-content'),
    hasActions: !!sample.querySelector('.message-actions-new, .message-actions, .message-actions-menu'),
    hasTime: !!sample.querySelector('.message-time-new, .timestamp'),
    hasSender: !!sample.querySelector('.message-sender-name')
  };

  console.log('📐 Sample message structure', structure);

  if (!structure.hasActions) {
    return {
      severity: 'HIGH',
      issue: 'Message HTML missing actions container',
      rootCause: 'UnifiedMessageRenderer not injecting action buttons',
      fix: 'Ensure render pipeline appends `.message-actions` block'
    };
  }

  return null;
};

export const runComprehensiveFormattingDiagnostic = async (): Promise<ComprehensiveFormattingDiagnosticResult> => {
  if (typeof document === 'undefined') {
    throw new Error('Formatting diagnostic requires DOM');
  }

  const timestamp = new Date().toISOString();
  const messages = getMessages();

  const result: ComprehensiveFormattingDiagnosticResult = {
    timestamp,
    issues: [],
    rootCauses: [],
    recommendations: []
  };

  withConsoleGroup('🔍 Comprehensive Formatting Diagnostic', () => {
    addFinding(result.rootCauses, diagnoseMessageIcons(messages));
    addFinding(result.rootCauses, diagnoseAvatarAuras(messages));
    addFinding(result.rootCauses, diagnoseActionsMenu());
    addFinding(result.rootCauses, diagnoseFocusModeLink());
    addFinding(result.rootCauses, diagnoseVisibilityTab());
    addFinding(result.issues, diagnoseRendererAvailability());
    addFinding(result.rootCauses, diagnoseMessageStructure(messages));
  });

  (window as RendererWindow).formattingDiagnosticResults = result;

  const issues = [
    ...result.issues.map(issue => issue.issue),
    ...result.rootCauses.map(cause => cause.issue)
  ];

  recordDiagnosticLog({
    id: 'formatting-diagnostic',
    name: 'Comprehensive Formatting Diagnostic',
    status: issues.length === 0 ? 'pass' : 'fail',
    summary: issues.length === 0 ? 'No formatting blockers detected' : 'Formatting issues detected',
    category: 'formatting',
    metrics: {
      totalMessages: messages.length,
      criticalFindings: result.rootCauses.filter(rc => rc.severity === 'CRITICAL').length,
      highFindings: result.rootCauses.filter(rc => rc.severity === 'HIGH').length
    },
    issues
  });

  return result;
};



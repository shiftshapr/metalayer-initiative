/**
 * Root Cause Diagnostic (TypeScript Module)
 * Identifies upstream issues blocking message rendering.
 */
import { recordDiagnosticLog, withConsoleGroup } from './logger.js';
const addFinding = (bucket, finding) => {
    if (finding) {
        bucket.push(finding);
    }
};
const resolveState = async (value) => {
    if (typeof value === 'undefined' || value === null) {
        return null;
    }
    return typeof value.then === 'function' ? (await value) : value;
};
const getGlobal = () => window;
const checkModuleAvailability = () => {
    const global = getGlobal();
    const scripts = Array.from(document.querySelectorAll('script[src*="CanopiModule"]'));
    const loadChatHistoryAvailable = typeof global.loadChatHistory === 'function';
    const isTypeScriptClass = typeof global.CanopiModule !== 'undefined';
    console.log('📦 CanopiModule scripts', scripts.map(script => script.src));
    console.log('loadChatHistory available:', loadChatHistoryAvailable);
    if (!loadChatHistoryAvailable) {
        return {
            severity: 'CRITICAL',
            issue: 'loadChatHistory not exposed globally',
            rootCause: 'CanopiModule not exported or initialization aborted',
            location: 'sidepanel.html / CanopiModule.ts'
        };
    }
    if (!isTypeScriptClass) {
        return {
            severity: 'MEDIUM',
            issue: 'TypeScript CanopiModule not detected',
            rootCause: 'Legacy JS module still loading instead of TS build',
            location: 'sidepanel.html script order'
        };
    }
    return null;
};
const checkActiveCommunities = async () => {
    const global = getGlobal();
    const stateChecks = {};
    stateChecks['window.getState("ui.activeCommunities")'] =
        typeof global.getState === 'function' ? global.getState('ui.activeCommunities') : null;
    stateChecks['window.stateManager.getState("ui.activeCommunities")'] =
        global.stateManager?.getState('ui.activeCommunities') ?? null;
    stateChecks['window.activeCommunities'] = global.activeCommunities ?? null;
    for (const key of Object.keys(stateChecks)) {
        stateChecks[key] = await resolveState(stateChecks[key]);
    }
    console.log('👥 Active community checks', stateChecks);
    const candidate = Object.values(stateChecks).find(value => Array.isArray(value) && value.length > 0);
    if (!candidate || candidate.length === 0) {
        return {
            severity: 'CRITICAL',
            issue: 'No active communities available',
            rootCause: 'StateManager missing ui.activeCommunities or data not hydrated',
            evidence: stateChecks
        };
    }
    return null;
};
const gatherMessages = () => Array.from(document.querySelectorAll('.message[data-message-id]'));
const checkMessageOrder = (messages) => {
    const orderIssues = [];
    for (let i = 0; i < messages.length - 1; i++) {
        const current = messages[i];
        const next = messages[i + 1];
        const currentTime = current.getAttribute('data-created-at');
        const nextTime = next.getAttribute('data-created-at');
        if (currentTime && nextTime && new Date(currentTime).getTime() < new Date(nextTime).getTime()) {
            orderIssues.push({
                index: i,
                current: { id: current.getAttribute('data-message-id'), createdAt: currentTime },
                next: { id: next.getAttribute('data-message-id'), createdAt: nextTime }
            });
        }
    }
    if (orderIssues.length > 0) {
        return {
            severity: 'HIGH',
            issue: 'Messages rendered oldest-first',
            rootCause: 'Query ordering or DOM insertion mismatch',
            evidence: { orderIssues: orderIssues.slice(0, 3) }
        };
    }
    return null;
};
const checkMessageTimeDisplay = (messages) => {
    const messagesWithTime = messages.filter(msg => {
        const timeEl = msg.querySelector('.message-time-new, .timestamp, .message-time');
        return !!timeEl && timeEl.textContent?.trim() !== '';
    });
    if (messages.length > 0 && messagesWithTime.length === 0) {
        return {
            severity: 'HIGH',
            issue: 'Message timestamps not displayed',
            rootCause: 'formattedTime missing in UnifiedMessageRenderer output',
            location: 'CanopiModule.generateUnifiedMessageElement'
        };
    }
    return null;
};
const checkAvatarRendering = (messages) => {
    const messagesWithAvatars = messages.filter(msg => {
        const avatar = msg.querySelector('.avatar-container, .avatar');
        if (!avatar)
            return false;
        const img = avatar.querySelector('img');
        const hasImage = !!img && !!img.src && !img.src.includes('data:image/svg');
        const hasAura = !!avatar.querySelector('.aura-ring, .avatar-aura');
        return hasImage || hasAura;
    });
    if (messagesWithAvatars.length < messages.length) {
        return {
            severity: 'HIGH',
            issue: 'Messages missing avatars',
            rootCause: 'AvatarUtils.createUnifiedAvatar not called or missing data',
            evidence: {
                messagesMissing: messages.length - messagesWithAvatars.length
            }
        };
    }
    return null;
};
const checkActionButtons = (messages) => {
    const messagesWithIcons = messages.filter(msg => {
        const replyBtn = msg.querySelector('.inline-reply-btn');
        const reactionBtn = msg.querySelector('.reaction-btn');
        const bookmarkBtn = msg.querySelector('.bookmark-btn');
        const shareBtn = msg.querySelector('.share-btn');
        return !!(replyBtn || reactionBtn || bookmarkBtn || shareBtn);
    });
    const messagesWithActions = messages.filter(msg => !!msg.querySelector('.message-actions-menu, .action-dots-btn'));
    if (messagesWithIcons.length < messages.length || messagesWithActions.length < messages.length) {
        return {
            severity: 'HIGH',
            issue: 'Messages missing icons or action menus',
            rootCause: 'UnifiedMessageRenderer HTML missing action button block',
            evidence: {
                withIcons: messagesWithIcons.length,
                withActions: messagesWithActions.length,
                total: messages.length
            }
        };
    }
    return null;
};
const checkTypeScriptBuild = async () => {
    try {
        const response = await fetch('/features/CanopiModule.js');
        const text = await response.text();
        const hasImports = text.includes('import ');
        const hasSourceMap = text.includes('//# sourceMappingURL=');
        if (!hasImports) {
            return {
                severity: 'MEDIUM',
                issue: 'CanopiModule.js missing ES module syntax',
                rootCause: 'Outdated bundle served instead of TS build',
                evidence: { hasSourceMap }
            };
        }
    }
    catch (error) {
        console.warn('Unable to verify TypeScript build', error);
    }
    return null;
};
const checkApiEndpoints = () => {
    const apiBase = getGlobal().api?.baseURL;
    if (!apiBase) {
        return {
            severity: 'MEDIUM',
            issue: 'API base URL not configured',
            rootCause: 'window.api.baseURL missing'
        };
    }
    console.log('🌐 API Base URL', apiBase);
    return null;
};
export const runRootCauseDiagnostic = async () => {
    if (typeof document === 'undefined') {
        throw new Error('Root cause diagnostic requires DOM');
    }
    const timestamp = new Date().toISOString();
    const messages = gatherMessages();
    const result = {
        timestamp,
        issues: [],
        rootCauses: [],
        recommendations: [],
        context: {
            totalMessages: messages.length
        }
    };
    await withConsoleGroup('🔍 Root Cause Diagnostic', async () => {
        addFinding(result.issues, checkModuleAvailability());
        addFinding(result.rootCauses, await checkActiveCommunities());
        addFinding(result.rootCauses, checkMessageOrder(messages));
        addFinding(result.rootCauses, checkMessageTimeDisplay(messages));
        addFinding(result.rootCauses, checkAvatarRendering(messages));
        addFinding(result.rootCauses, checkActionButtons(messages));
        addFinding(result.issues, await checkTypeScriptBuild());
        addFinding(result.issues, checkApiEndpoints());
    });
    getGlobal().rootCauseDiagnosticResults = result;
    const issues = [
        ...result.issues.map(item => item.issue),
        ...result.rootCauses.map(item => item.issue)
    ];
    recordDiagnosticLog({
        id: 'root-cause-diagnostic',
        name: 'Root Cause Diagnostic',
        status: issues.length === 0 ? 'pass' : 'fail',
        summary: issues.length === 0 ? 'No blocking root causes detected' : `${issues.length} findings detected`,
        category: 'root-cause',
        metrics: {
            totalMessages: messages.length,
            criticalFindings: result.rootCauses.filter(rc => rc.severity === 'CRITICAL').length
        },
        issues
    });
    return result;
};
//# sourceMappingURL=RootCauseDiagnostic.js.map
/**
 * Timeline View Component
 * Renders timeline display
 */
export class TimelineView {
    constructor(container, timelineManager) {
        if (!container) {
            throw new Error('TimelineView: Container element is required');
        }
        this.container = container;
        this.timelineManager = timelineManager;
    }
    async render(timeline, options = {}) {
        console.log('TimelineView: Rendering timeline', {
            hasTimeline: !!timeline,
            activitiesCount: timeline?.activities?.length || 0,
            container: this.container
        });
        if (!timeline || !timeline.activities || timeline.activities.length === 0) {
            console.warn('TimelineView: No activities to render');
            this.renderEmpty();
            return;
        }
        // Render activities (now async)
        const itemPromises = timeline.activities.map(activity => this.renderActivity(activity));
        const items = await Promise.all(itemPromises);
        console.log('TimelineView: Generated', items.length, 'activity items');
        // Clear container first
        this.container.innerHTML = '';
        // Append each item (handles both HTML strings and DOM elements)
        items.forEach(itemHtml => {
            if (!itemHtml)
                return; // Skip null/undefined items
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = itemHtml;
            const itemElement = tempDiv.firstElementChild;
            if (itemElement) {
                this.container.appendChild(itemElement);
            }
        });
        this.setupEventListeners();
    }
    async renderActivity(activity) {
        // For messages, use the unified message element from CanopiModule (RED-LINE: imported, not window)
        const createUnifiedMessageElement = window.createUnifiedMessageElement;
        if (activity.type === 'message' && typeof createUnifiedMessageElement === 'function') {
            try {
                // Transform timeline activity to message format expected by createUnifiedMessageElement
                const user = activity.data.user || {};
                const message = {
                    id: activity.id,
                    body: activity.data.content || '',
                    content: activity.data.content || '',
                    createdAt: activity.timestamp,
                    created_at: activity.timestamp,
                    user_id: activity.userId,
                    communityId: activity.data.communityId,
                    community_id: activity.data.communityId,
                    author: {
                        id: user.id || activity.userId,
                        name: user.name || user.handle || 'Unknown',
                        handle: user.handle || '',
                        avatarUrl: user.avatarUrl || undefined,
                        auraColor: user.auraColor || undefined,
                        auraIntensity: user.auraIntensity || undefined
                    },
                    replyCount: activity.data.replyCount || 0,
                    reactionCount: activity.data.reactionCount || 0,
                    reactions: activity.data.reactions || []
                };
                // RED-LINE: Use window reference (functions loaded by CanopiModule.js script)
                const messageElement = createUnifiedMessageElement(message, {
                    isReply: false,
                    isInFocusMode: false,
                    showCommunity: true
                });
                // TIMELINE FIX: Store reactions in data attribute for timeline page
                if (message.reactions && Array.isArray(message.reactions)) {
                    messageElement.dataset.reactions = JSON.stringify(message.reactions);
                    messageElement.dataset.reactionCount = (message.reactionCount || message.reactions.length).toString();
                }
                // Attach action listeners (RED-LINE: use imported function)
                const addMessageActionListenersFn = window.addMessageActionListeners;
                if (typeof addMessageActionListenersFn === 'function') {
                    addMessageActionListenersFn(messageElement, message);
                }
                // TIMELINE FIX: After listeners are attached, manually update reaction display with timeline data
                if (message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0) {
                    setTimeout(async () => {
                        // RED-LINE: Use imported function, not window reference
                        const updateReactionDisplayFn = window.updateReactionDisplay;
                        if (typeof updateReactionDisplayFn === 'function') {
                            const reactionBtn = messageElement.querySelector('.reaction-btn');
                            await updateReactionDisplayFn(message.id, message.reactions || [], reactionBtn);
                        }
                    }, 200);
                }
                // CRITICAL FIX: Add click handler to link to share page (but not on action buttons)
                const shareUrl = `/share-message?id=${message.id}`;
                messageElement.style.cursor = 'pointer';
                messageElement.addEventListener('click', (e) => {
                    // Don't navigate if clicking on action buttons
                    if (e.target.closest('.message-actions-new, .message-footer-actions, button, .action-item, .action-dropdown')) {
                        return;
                    }
                    window.location.href = shareUrl;
                });
                // Wrap in timeline-message-wrapper for styling
                const wrapper = document.createElement('div');
                wrapper.className = 'timeline-message-wrapper';
                wrapper.appendChild(messageElement);
                return wrapper.outerHTML;
            }
            catch (error) {
                console.error('TimelineView: Error creating unified message element:', error);
                // Fall back to simple display
            }
        }
        // For non-message activities, use AvatarUtils to render avatar (reuse existing code)
        const user = activity.data?.user || {};
        // Use AvatarUtils for consistent avatar rendering across the app
        // RED-LINE: Use imported AvatarUtils, NOT window.AvatarUtils (extension may not be loaded)
        let avatarHTML = '';
        if (AvatarUtils && typeof AvatarUtils.createUnifiedAvatar === 'function') {
            try {
                const avatarData = await AvatarUtils.getAvatarUrl(user, 'message');
                avatarHTML = await AvatarUtils.createUnifiedAvatar({
                    ...user,
                    avatarUrl: avatarData.avatarUrl || user.avatarUrl || user.avatar_url,
                    avatar_url: avatarData.avatarUrl || user.avatarUrl || user.avatar_url
                }, 'message', {
                    size: 40,
                    showAura: true,
                    showStatus: false
                });
                // Wrap in avatar-container to match message structure
                if (avatarHTML && !avatarHTML.includes('avatar-container')) {
                    avatarHTML = `<div class="avatar-container">${avatarHTML}</div>`;
                }
            }
            catch (error) {
                console.error('TimelineView: AvatarUtils failed:', error);
                // If AvatarUtils fails, show a simple fallback (no aura, just initials)
                const userName = user.name || user.handle || 'Unknown';
                const userInitials = userName.charAt(0).toUpperCase();
                avatarHTML = `
          <div class="avatar-container">
            <div style="position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; font-size: 18px;" data-user-id="${user.id || activity.userId || ''}">
              ${userInitials}
            </div>
          </div>
        `;
            }
        }
        else {
            console.warn('TimelineView: AvatarUtils not available, using simple fallback');
            // Simple fallback if AvatarUtils is not loaded
            const userName = user.name || user.handle || 'Unknown';
            const userInitials = userName.charAt(0).toUpperCase();
            avatarHTML = `
        <div class="avatar-container">
          <div style="position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; font-size: 18px;" data-user-id="${user.id || activity.userId || ''}">
            ${userInitials}
          </div>
        </div>
      `;
        }
        const userName = user.name || user.handle || 'Unknown';
        const timestamp = this.formatTimestamp(activity.timestamp);
        const icon = this.getActivityIcon(activity.type);
        const visibilityBadge = this.getVisibilityBadge(activity.visibility);
        let contentHtml = '';
        switch (activity.type) {
            case 'message':
                // Should not reach here if createUnifiedMessageElement worked
                contentHtml = `<div class="activity-message-content">${this.escapeHtml(activity.data.content || '')}</div>`;
                break;
            case 'reaction':
                contentHtml = `<div class="activity-reaction">
          <span class="reaction-emoji">${activity.data.emoji || '👍'}</span>
          <span class="reaction-text">Reacted to a message</span>
        </div>`;
                break;
            case 'bookmark':
                contentHtml = `<div class="activity-bookmark">
          <span class="bookmark-icon">🔖</span>
          <span class="bookmark-text">Bookmarked a message</span>
        </div>`;
                break;
            case 'profileUpdate':
                contentHtml = `<div class="activity-profile-update">
          <span class="update-field">${this.escapeHtml(activity.data.fieldName || '')}</span>
          <span class="update-change">${this.escapeHtml(activity.data.oldValue || '')} → ${this.escapeHtml(activity.data.newValue || '')}</span>
        </div>`;
                break;
            case 'communityJoin':
                contentHtml = `<div class="activity-community-join">
          <span class="community-icon">👥</span>
          <span class="community-text">Joined ${activity.data.community?.name || 'a community'}</span>
        </div>`;
                break;
            case 'statusChange':
                contentHtml = `<div class="activity-status-change">
          <span class="status-icon">${this.getStatusIcon(activity.data.availability)}</span>
          <span class="status-text">Status changed to ${activity.data.availability || 'active'}</span>
        </div>`;
                break;
            case 'auraChange':
                contentHtml = `<div class="activity-aura-change">
          <span class="aura-icon">✨</span>
          <span class="aura-text">Aura ${activity.data.fieldName} changed</span>
        </div>`;
                break;
            default:
                contentHtml = `<div class="activity-generic">${this.escapeHtml(JSON.stringify(activity.data))}</div>`;
        }
        // CRITICAL FIX: Add click handler for message-related activities to link to share page
        // Activities that involve messages: reaction, bookmark (message type already handled above)
        const isMessageRelated = activity.type === 'reaction' || activity.type === 'bookmark';
        const messageId = isMessageRelated ? (activity.data?.messageId || activity.data?.message_id || activity.data?.message?.id || null) : null;
        const shareUrl = isMessageRelated && messageId ? `/share-message?id=${messageId}` : null;
        const clickAttr = shareUrl ? `onclick="window.location.href='${shareUrl}'" style="cursor: pointer;"` : '';
        return `
      <div class="timeline-item" data-activity-id="${activity.id}" data-activity-type="${activity.type}" ${clickAttr} tabindex="0">
        <div class="activity-header">
          ${avatarHTML}
          <div class="activity-info">
            <div class="activity-user-name">${this.escapeHtml(userName)}</div>
            <div class="activity-meta">
              <span class="activity-icon">${icon}</span>
              <span class="activity-timestamp">${timestamp}</span>
              ${visibilityBadge}
            </div>
          </div>
        </div>
        <div class="activity-body">
          ${contentHtml}
        </div>
      </div>
    `;
    }
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    getActivityIcon(type) {
        const icons = {
            message: '💬',
            reaction: '👍',
            bookmark: '🔖',
            profileUpdate: '✏️',
            communityJoin: '👥',
            statusChange: '🟢',
            auraChange: '✨',
            messageEdit: '✏️',
            messageDelete: '🗑️',
            threadCreate: '💬',
            login: '🔐',
            streak: '🔥'
        };
        return icons[type] || '📌';
    }
    getStatusIcon(availability) {
        const icons = {
            AVAILABLE: '🟢',
            BUSY: '🔴',
            AWAY: '🟡',
            OFFLINE: '⚫'
        };
        return icons[availability || ''] || '🟢';
    }
    getVisibilityBadge(visibility) {
        const badges = {
            public: '<span class="visibility-badge public" title="Public">🌐</span>',
            community: '<span class="visibility-badge community" title="Community">👥</span>',
            private: '<span class="visibility-badge private" title="Private">🔒</span>'
        };
        return badges[visibility] || '';
    }
    escapeHtml(text) {
        if (!text)
            return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    renderEmpty() {
        this.container.innerHTML = '<div class="empty-timeline">No activities found</div>';
    }
    setupEventListeners() {
        // Add click handlers to timeline items
        this.container.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const activityId = item.dataset.activityId;
                const activityType = item.dataset.activityType;
                this.handleActivityClick(activityId || '', activityType || '', item);
            });
            // Add keyboard support
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => {
                const keyEvent = e;
                if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }
    handleActivityClick(activityId, activityType, element) {
        // Navigate based on activity type
        switch (activityType) {
            case 'message':
                // Could navigate to message thread or open in extension
                console.log('Navigate to message:', activityId);
                break;
            case 'reaction':
            case 'bookmark':
                // Navigate to the related message
                const messageId = element.querySelector('[data-message-id]')?.getAttribute('data-message-id');
                if (messageId) {
                    console.log('Navigate to message:', messageId);
                }
                break;
            case 'profileUpdate':
                // Could show profile update details
                console.log('Show profile update:', activityId);
                break;
            case 'communityJoin':
                // Could navigate to community
                const communityId = element.querySelector('[data-community-id]')?.getAttribute('data-community-id');
                if (communityId) {
                    console.log('Navigate to community:', communityId);
                }
                break;
        }
    }
}
//# sourceMappingURL=TimelineView.js.map
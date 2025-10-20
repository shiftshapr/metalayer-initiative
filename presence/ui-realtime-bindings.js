(function(){
  try {
    console.log('🔗 UI REALTIME BINDINGS: initializing');

    // Short-lived dedupe cache for inserts
    const recentAdds = new Map(); // id -> timestamp
    function rememberAdd(id) {
      const now = Date.now();
      recentAdds.set(id, now);
      // Purge after 12s
      setTimeout(() => {
        const t = recentAdds.get(id);
        if (t && Date.now() - t >= 12000) recentAdds.delete(id);
      }, 12500);
    }
    function isRecentAdd(id) {
      const t = recentAdds.get(id);
      return !!t && (Date.now() - t) < 12000;
    }

    // If the UI defines addMessageToChat, wrap it to prevent duplicates from
    // (1) local optimistic add and (2) realtime INSERT arriving milliseconds later.
    const attachAddWrapper = () => {
      if (typeof window.addMessageToChat !== 'function') return;
      if (window.__addMessageToChatWrapped) return;
      const originalAdd = window.addMessageToChat.bind(window);
      window.addMessageToChat = (post) => {
        try {
          if (!post || !post.id) return originalAdd(post);
          const existing = document.querySelector(`.message[data-message-id="${post.id}"]`);
          if (existing || isRecentAdd(post.id)) {
            const bodyEl = getOrCreateBodyElement(existing || null);
            if (bodyEl) bodyEl.textContent = post.body || post.content || '';
            rememberAdd(post.id);
            console.log('🧊 UI REALTIME: wrapped add deduped', post.id);
            return;
          }
          const res = originalAdd(post);
          rememberAdd(post.id);
          return res;
        } catch (e) {
          console.log('⚠️ UI REALTIME: add wrapper error, falling back', e);
          return originalAdd(post);
        }
      };
      window.__addMessageToChatWrapped = true;
      console.log('✅ UI REALTIME: addMessageToChat wrapped for dedupe');
    };

    // Try now and also after a tick in case sidepanel sets it later
    attachAddWrapper();
    setTimeout(attachAddWrapper, 0);
    setTimeout(attachAddWrapper, 100);

    // Seed dedupe with any messages already in DOM (e.g., from initial history load)
    try {
      const existing = document.querySelectorAll('.message[data-message-id]');
      existing.forEach(el => rememberAdd(el.getAttribute('data-message-id')));
      if (existing.length) console.log('✅ UI REALTIME: seeded dedupe with existing messages:', existing.length);
      
      // Root cause fixed: Single source of truth in CleanRealtimeManager
      // No need for cleanup or deduplication
      console.log('✅ UI REALTIME: Root cause fixed - single source of truth implemented');
    } catch (e) {}

    function refreshChatSafely() {
      try {
        if (typeof window.loadChatHistory === 'function' && window.currentUrlData) {
          // Reuse the existing loader for the active communities
          const activeCommunities = (window.StateManager?.get?.('ui.activeCommunities')) || ['comm-001'];
          const rawUrl = window.location.href;
          console.log('🔗 UI REALTIME: refreshing chat for', window.currentUrlData, 'communities:', activeCommunities);
          // Use existing function already wired in sidepanel.js
          window.loadChatHistory(rawUrl, activeCommunities);
        } else {
          console.log('⚠️ UI REALTIME: loadChatHistory or currentUrlData not available');
        }
      } catch (e) {
        console.log('❌ UI REALTIME: refresh failed', e);
      }
    }

    function buildUiPostFromRecord(record) {
      // Record may come from PG (record/new/old) or broadcast payload
      const id = record.id || record.messageId || crypto.randomUUID();
      const content = record.content || record.newContent || record.body || '';
      const userEmail = record.user_email || record.authorId || 'unknown@unknown';
      const createdAt = record.created_at || record.timestamp || new Date().toISOString();
      const pageId = record.page_id || (window.currentUrlData && window.currentUrlData.pageId) || 'unknown';
      const communityId = record.community_id || (window.StateManager?.get?.('ui.primaryCommunity')) || 'comm-001';

      return {
        id: id,
        parentId: null,
        conversationId: `conv-${communityId}-${pageId}`,
        authorId: userEmail,
        body: content,
        createdAt: createdAt,
        editedAt: createdAt,
        author: {
          id: userEmail,
          name: userEmail,
          handle: userEmail.split('@')[0],
          avatarUrl: (window.currentUser && window.currentUser.avatarUrl) || null,
          email: userEmail,
          auraColor: (window.currentUser && window.currentUser.auraColor) || '#aa00aa'
        },
        conversation: {
          id: `conv-${communityId}-${pageId}`,
          communityId
        }
      };
    }

    function getOrCreateBodyElement(wrapper, clearContent = false) {
      if (!wrapper) return null;
      // Try common selectors
      let el = wrapper.querySelector('.message-body, [data-role="message-body"], [data-role="message-text"], .message-text');
      if (el) {
        // ROOT CAUSE FIX: Clear content if requested (for edits)
        if (clearContent) {
          el.innerHTML = '';
        }
        return el;
      }
      // Create a minimal, safe body container
      const created = document.createElement('div');
      created.setAttribute('data-role', 'message-body');
      // Prefer an existing content container if present
      const container = wrapper.querySelector('[data-role="message-content"], .message-content') || wrapper;
      container.appendChild(created);
      return created;
    }

    // Root cause fixed: Duplicates eliminated at source in CleanRealtimeManager
    // No need for UI-level deduplication

    function extractRecord(payload, preferred) {
      // Handles: PG changes {new, old}, custom broadcasts {payload:{...}}, custom {message:{...}}
      if (!payload) return null;
      // Prefer direct PG payloads
      const direct = preferred === 'old' ? (payload.old || payload.record || payload.message) : (payload.new || payload.record || payload.message);
      if (direct) return direct;
      // Nested under payload (PG changes forwarded as { event, payload })
      const nested = payload.payload;
      if (nested) {
        const nestedPg = preferred === 'old' ? (nested.old || nested.record || nested.message) : (nested.new || nested.record || nested.message);
        if (nestedPg) return nestedPg;
      }
      return payload;
    }

    function addMessageToUIFromPayload(payload) {
      const record = extractRecord(payload, 'new');
      if (!record) {
        console.log('⚠️ UI REALTIME: no record in payload', payload);
        return;
      }
      const post = buildUiPostFromRecord(record);
      // If we've just added this id or it already exists, update in place
      if (isRecentAdd(post.id)) {
        const existingWrapper = document.querySelector(`.message[data-message-id="${post.id}"]`);
        if (existingWrapper) {
          const bodyEl = getOrCreateBodyElement(existingWrapper);
          bodyEl.textContent = post.body || '';
          existingWrapper.setAttribute('data-realtime-updated', 'true');
          console.log('🔗 UI REALTIME: deduped recent add, updated existing', post.id);
          return;
        }
      }

      const existingWrapper = document.querySelector(`.message[data-message-id="${post.id}"]`);
      if (existingWrapper) {
        const bodyEl = getOrCreateBodyElement(existingWrapper);
        bodyEl.textContent = post.body || '';
        existingWrapper.setAttribute('data-realtime-updated', 'true');
        console.log('🔗 UI REALTIME: updated existing message (no duplicate)', post.id);
        // Root cause fixed: No need for reconcileDuplicates - deduplication handled at source
        return;
      }
      if (typeof window.addMessageToChat === 'function') {
        console.log('🔗 UI REALTIME: addMessageToChat(post)', post.id);
        window.addMessageToChat(post);
        rememberAdd(post.id);
        // Root cause fixed: No need for reconcileDuplicates - deduplication handled at source
      } else {
        console.log('⚠️ UI REALTIME: addMessageToChat not available, refreshing');
        refreshChatSafely();
      }
    }

    function editMessageInUIFromPayload(payload) {
      const record = extractRecord(payload, 'new');
      const messageId =
        (record && (record.id || record.messageId))
        || payload?.id
        || payload?.messageId
        || payload?.payload?.message?.id
        || payload?.message?.id;
      const newBody =
        (record && (record.content ?? record.newContent ?? record.body))
        || payload?.content
        || payload?.newContent
        || payload?.payload?.message?.content
        || payload?.message?.content
        || '';
      if (!messageId || !newBody) {
        console.log('⚠️ UI REALTIME: insufficient data to edit', {
          payloadKeys: Object.keys(payload || {}),
          recordKeys: Object.keys(record || {}),
          messageId,
          newBodyPreview: (typeof newBody === 'string' ? newBody : JSON.stringify(newBody)).slice(0, 100)
        });
        // Fallback to a safe refresh if we can't parse
        return refreshChatSafely();
      }
      // Prefer dedicated updater if present
      if (typeof window.updateMessageBodyInChat === 'function') {
        console.log('🔗 UI REALTIME: updateMessageBodyInChat', messageId);
        window.updateMessageBodyInChat(messageId, newBody);
        return;
      }
      // Fallback: mutate DOM safely
      const wrapper = document.querySelector(`.message[data-message-id="${messageId}"]`);
      const el = document.querySelector(`.message[data-message-id="${messageId}"] .message-body, .message[data-message-id="${messageId}"] [data-role="message-body"], .message[data-message-id="${messageId}"] [data-role="message-text"], .message[data-message-id="${messageId}"] .message-text`);
      if (el) {
        console.log('🔗 UI REALTIME: DOM edit for', messageId);
        // ROOT CAUSE FIX: Clear existing content completely before setting new content
        el.innerHTML = '';
        el.textContent = newBody;
        console.log('✅ UI REALTIME: Content replaced (not appended) for', messageId);
      } else if (wrapper) {
        // Create a missing body node and update in-place
        const created = getOrCreateBodyElement(wrapper, true); // clearContent = true for edits
        if (created) {
          console.log('🧩 UI REALTIME: created body node and updated', messageId);
          // Content already cleared by getOrCreateBodyElement
          created.textContent = newBody;
          console.log('✅ UI REALTIME: Content replaced (not appended) for', messageId);
        } else {
          console.log('⚠️ UI REALTIME: could not create body node; refreshing', messageId);
          refreshChatSafely();
        }
      } else {
        // Not in DOM yet: add
        addMessageToUIFromPayload(record);
      }
    }

    function deleteMessageInUIFromPayload(payload) {
      const record = extractRecord(payload, 'old');
      const messageId =
        (record && (record.id || record.messageId))
        || payload?.id
        || payload?.messageId
        || payload?.payload?.message?.id
        || payload?.message?.id;
      if (!messageId) {
        console.log('⚠️ UI REALTIME: insufficient data to delete', {
          payloadKeys: Object.keys(payload || {}),
          recordKeys: Object.keys(record || {}),
          messageId
        });
        return refreshChatSafely();
      }
      if (typeof window.removeMessageFromChat === 'function') {
        console.log('🔗 UI REALTIME: removeMessageFromChat', messageId);
        window.removeMessageFromChat(messageId);
        return;
      }
      const wrapper = document.querySelector(`.message[data-message-id="${messageId}"]`);
      if (wrapper && wrapper.parentElement) {
        console.log('🔗 UI REALTIME: DOM delete for', messageId);
        wrapper.parentElement.removeChild(wrapper);
      } else {
        refreshChatSafely();
      }
    }

    // CleanRealtimeManager emits these CustomEvents on window
    window.addEventListener('realtime-message', (e) => {
      console.log('📩 UI REALTIME: event realtime-message', e.detail);
      addMessageToUIFromPayload(e.detail);
    });
    window.addEventListener('realtime-message-edited', (e) => {
      console.log('✏️ UI REALTIME: event realtime-message-edited', e.detail);
      editMessageInUIFromPayload(e.detail);
    });
    window.addEventListener('realtime-message-deleted', (e) => {
      console.log('🗑️ UI REALTIME: event realtime-message-deleted', e.detail);
      deleteMessageInUIFromPayload(e.detail);
    });

    console.log('✅ UI REALTIME BINDINGS: ready');
  } catch (err) {
    console.log('❌ UI REALTIME BINDINGS: init error', err);
  }
})();

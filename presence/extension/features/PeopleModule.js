/**
 * PEOPLE MODULE - People and Connections
 * Handles all people and connection functionality
 */
import { Logger } from '../utils/Logger.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
class PeopleModule {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
        this.logger = new Logger();
    }
    async initialize() {
        if (this.isInitialized) {
            this.log('WARN', 'PeopleModule already initialized');
            return;
        }
        this.log('INFO', 'Initializing PeopleModule...');
        try {
            // TODO: Initialize people and connection systems here
            this.isInitialized = true;
            this.log('INFO', 'PeopleModule initialized successfully');
        }
        catch (error) {
            this.log('ERROR', 'Failed to initialize PeopleModule:', error);
            throw error;
        }
    }
    log(level, message, ...args) {
        if (this.logLevel === 'SILENT')
            return;
        const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
        if ((levels[level] ?? 999) <= (levels[this.logLevel] ?? 999)) {
            console.log(`[PeopleModule] [${level}] ${message}`, ...args);
        }
    }
}
/**
 * Initialize People Tab - Load real users from Supabase
 */
export async function initializePeopleTab() {
    console.log('👥 PEOPLE: Initializing People tab...');
    const peopleTab = typeof document !== 'undefined' ? document.getElementById('people-tab') : null;
    if (!peopleTab) {
        console.error('❌ PEOPLE: People tab element not found');
        return;
    }
    // Show loading state immediately
    peopleTab.innerHTML = `
    <ul class="item-list">
      <li style="padding: 20px; text-align: center; color: var(--text-secondary);">
        Loading users...
      </li>
    </ul>
  `;
    try {
        // Get Supabase client
        const supabase = supabaseServiceInstance.getClient();
        if (!supabase || typeof supabase.from !== 'function') {
            console.error('❌ PEOPLE: Supabase client not available');
            peopleTab.innerHTML = `
        <ul class="item-list">
          <li style="padding: 20px; text-align: center; color: var(--text-error);">
            Supabase client not available. Please refresh the page.
          </li>
        </ul>
      `;
            return;
        }
        console.log('👥 PEOPLE: Supabase client available, fetching users...');
        // Try different table name variations (PostgreSQL/Supabase case sensitivity)
        let users = null;
        let error = null;
        const tableNames = ['AppUser', 'appuser', 'Appuser', 'users', 'Users'];
        for (const tableName of tableNames) {
            console.log(`👥 PEOPLE: Trying table name: "${tableName}"`);
            const fromMethod = supabase.from(tableName);
            if (fromMethod && typeof fromMethod.select === 'function') {
                const result = await fromMethod.select('id, email, name, handle, avatarUrl, auraColor, createdAt')
                    .order('createdAt', { ascending: false });
                if (result.error) {
                    console.warn(`⚠️ PEOPLE: Error with table "${tableName}":`, result.error);
                    error = result.error;
                    continue;
                }
                if (result.data) {
                    console.log(`✅ PEOPLE: Successfully fetched from table "${tableName}"`);
                    users = result.data;
                    error = null;
                    break;
                }
            }
        }
        if (error) {
            console.error('❌ PEOPLE: Error fetching users from all table name variations:', error);
            peopleTab.innerHTML = `
        <ul class="item-list">
          <li style="padding: 20px; text-align: center; color: var(--text-error);">
            Error loading users: ${error.message || error.code || 'Unknown error'}<br>
            <small style="font-size: 11px; margin-top: 8px; display: block;">
              Check browser console for details
            </small>
          </li>
        </ul>
      `;
            return;
        }
        if (!users) {
            console.error('❌ PEOPLE: No users data returned');
            peopleTab.innerHTML = `
        <ul class="item-list">
          <li style="padding: 20px; text-align: center; color: var(--text-secondary);">
            No users found in database
          </li>
        </ul>
      `;
            return;
        }
        console.log(`✅ PEOPLE: Fetched ${users.length} users from Supabase`);
        // Filter out current user if available
        const currentUser = stateManagerInstance.getState('currentUser');
        const currentUserId = currentUser?.id;
        const currentUserEmail = currentUser?.email;
        const displayUsers = users.filter((user) => {
            if (currentUserId && user.id === currentUserId) {
                return false;
            }
            if (currentUserEmail && user.email && user.email === currentUserEmail) {
                return false;
            }
            return true;
        });
        // Get current user's presence data to determine online status
        let activeUserIds = new Set();
        if (displayUsers.length > 0) {
            try {
                const userEmails = displayUsers
                    .map((u) => u.email)
                    .filter((email) => !!email);
                if (userEmails.length > 0) {
                    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
                    try {
                        const presenceFrom = supabase.from('user_presence');
                        if (presenceFrom && typeof presenceFrom.select === 'function') {
                            const { data: presenceData, error: presenceError } = await presenceFrom.select('user_email, is_active, last_seen')
                                .in('user_email', userEmails)
                                .gte('last_seen', fiveMinutesAgo);
                            if (presenceError) {
                                console.warn('⚠️ PEOPLE: Presence query error (non-critical):', presenceError);
                            }
                            else if (presenceData) {
                                presenceData.forEach((p) => {
                                    if (p.is_active) {
                                        const user = displayUsers.find((u) => u.email === p.user_email);
                                        if (user) {
                                            activeUserIds.add(user.id);
                                        }
                                    }
                                });
                            }
                        }
                    }
                    catch (presenceQueryError) {
                        console.warn('⚠️ PEOPLE: Presence query exception (non-critical):', presenceQueryError);
                    }
                }
            }
            catch (presenceError) {
                console.warn('⚠️ PEOPLE: Could not fetch presence data:', presenceError);
            }
        }
        // Render users
        if (displayUsers.length === 0) {
            peopleTab.innerHTML = `
        <ul class="item-list">
          <li style="padding: 20px; text-align: center; color: var(--text-secondary);">
            No users found
          </li>
        </ul>
      `;
            return;
        }
        // Create user list HTML
        const usersHTML = displayUsers.map((user) => {
            const isActive = activeUserIds.has(user.id);
            const userName = user.name || user.handle || user.email || 'Unknown User';
            const avatarUrl = user.avatarUrl || '';
            const auraColor = user.auraColor || AVATAR_FALLBACK_COLOR;
            const initial = userName.charAt(0).toUpperCase();
            return `
        <li class="item" style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border-color); cursor: pointer;">
          <div class="item-avatar" style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid ${auraColor};
            background-color: ${auraColor};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;
          ">
            ${avatarUrl ?
                `<img src="${avatarUrl}" alt="${userName}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" referrerpolicy="no-referrer">` :
                ''}
            <div style="
              display: ${avatarUrl ? 'none' : 'flex'};
              width: 100%;
              height: 100%;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
            ">${initial}</div>
          </div>
          <div class="item-info" style="flex: 1; min-width: 0;">
            <div class="item-name" style="
              font-weight: 600;
              color: var(--text-primary);
              font-size: 14px;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            ">${userName}</div>
            <div class="item-status" style="
              color: ${isActive ? 'var(--success-color, #22c55e)' : 'var(--text-secondary)'};
              font-size: 12px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: ${isActive ? '#22c55e' : '#6b7280'};
                display: inline-block;
              "></span>
              ${isActive ? 'Online' : 'Offline'}
            </div>
          </div>
        </li>
      `;
        }).join('');
        peopleTab.innerHTML = `
      <ul class="item-list" style="list-style: none; padding: 0; margin: 0;">
        ${usersHTML}
      </ul>
    `;
        console.log(`✅ PEOPLE: People tab updated with ${displayUsers.length} users`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ PEOPLE: Error initializing People tab:', error);
        if (peopleTab) {
            peopleTab.innerHTML = `
        <ul class="item-list">
          <li style="padding: 20px; text-align: center; color: var(--text-error);">
            Error loading users: ${errorMessage || 'Unknown error'}<br>
            <small style="font-size: 11px; margin-top: 8px; display: block;">
              Check browser console (F12) for details
            </small>
          </li>
        </ul>
      `;
        }
    }
}
// Create singleton instance
const peopleModuleInstance = new PeopleModule();
// Export as ES6 module
export { PeopleModule, peopleModuleInstance };
export default PeopleModule;

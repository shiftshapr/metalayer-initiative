/**
 * PEOPLE MODULE - People and Connections
 * Handles all people and connection functionality
 */
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
class PeopleModule {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
        // Logger removed as unused
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
            Logger.debug(`[PeopleModule] [${level}] ${message}`, ...args, 'people');
        }
    }
}
const TABLE_NAME_VARIATIONS = ['AppUser', 'appuser', 'Appuser', 'users', 'Users'];
const PEOPLE_SELECT_COLUMNS = 'id, email, name, handle, avatarUrl, auraColor, createdAt';
const PEOPLE_LOG_CONTEXT = 'people';
let peopleModuleBootstrapRequested = false;
let peopleTabInitialized = false;
let peopleTabInitPromise = null;
function normalizePeopleUser(row) {
    // UUID ONLY - no email or handle fallback for id
    if (!row.id) {
        Logger.warn('⚠️ PEOPLE: User row missing id (UUID)', { email: row.email }, 'people');
    }
    return {
        id: row.id || '', // UUID only - empty string if missing
        email: row.email || undefined,
        name: row.name || undefined,
        handle: row.handle || undefined,
        avatarUrl: row.avatarUrl || undefined,
        auraColor: row.auraColor || undefined,
        createdAt: row.createdAt || undefined,
    };
}
async function fetchPeopleFromTables(client) {
    let lastError = null;
    for (const tableName of TABLE_NAME_VARIATIONS) {
        Logger.debug(`👥 PEOPLE: Trying table name: "${tableName}"`, null, 'people');
        try {
            const { data, error } = await client
                .from(tableName)
                .select(PEOPLE_SELECT_COLUMNS)
                .order('createdAt', { ascending: false });
            if (error) {
                Logger.warn(`⚠️ PEOPLE: Error with table "${tableName}":`, error, 'people');
                lastError = error;
                continue;
            }
            if (data && data.length > 0) {
                Logger.debug(`✅ PEOPLE: Successfully fetched from table "${tableName}"`, null, 'people');
                return { users: data.map(normalizePeopleUser), error: null };
            }
        }
        catch (tableError) {
            const formattedError = {
                message: tableError instanceof Error ? tableError.message : String(tableError),
            };
            handleError(tableError, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'fetchPeople',
                    component: 'People',
                    tableName
                }
            });
            ;
            lastError = formattedError;
        }
    }
    return { users: null, error: lastError };
}
// UUID ONLY - changed from userEmails to userIds
async function fetchActivePresenceIds(client, userIds, sinceIso, _displayUsers) {
    const activeUserIds = new Set();
    if (userIds.length === 0) {
        return activeUserIds;
    }
    try {
        // UUID ONLY - query by user_id, not user_email
        const { data, error } = await client
            .from('user_presence')
            .select('user_id, is_active, last_seen')
            .in('user_id', userIds)
            .gte('last_seen', sinceIso);
        if (error) {
            Logger.warn('⚠️ PEOPLE: Presence query error (non-critical):', error, 'people');
            return activeUserIds;
        }
        // UUID ONLY - match by id directly
        // Type assertion: query returns user_id even though SupabasePresenceStatusRow type doesn't include it
        data?.forEach((record) => {
            if (!record?.is_active || !record.user_id) {
                return;
            }
            // Direct match by UUID - no email lookup needed
            if (userIds.includes(record.user_id)) {
                activeUserIds.add(record.user_id);
            }
        });
    }
    catch (presenceQueryError) {
        handleError(presenceQueryError, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'fetchActivePresenceIds',
                component: 'PeopleModule'
            }
        });
        Logger.warn('⚠️ PEOPLE: Failed to query presence', presenceQueryError, 'people');
    }
    return activeUserIds;
}
async function renderPeopleTab() {
    if (typeof document === 'undefined') {
        Logger.debug('ℹ️ PEOPLE: Skipping People tab render (no DOM context)', null, PEOPLE_LOG_CONTEXT);
        return false;
    }
    Logger.debug('👥 PEOPLE: Initializing People tab...', null, PEOPLE_LOG_CONTEXT);
    const peopleTab = document.getElementById('people-tab');
    if (!peopleTab) {
        Logger.error('❌ PEOPLE: People tab element not found', null, PEOPLE_LOG_CONTEXT);
        return false;
    }
    peopleTab.innerHTML = `
    <ul class="item-list">
      <li style="padding: 20px; text-align: center; color: var(--text-secondary);">
        Loading users...
      </li>
    </ul>
  `;
    try {
        const supabase = supabaseServiceInstance.getClient();
        if (!supabase || typeof supabase.from !== 'function') {
            Logger.error('❌ PEOPLE: Supabase client not available', null, PEOPLE_LOG_CONTEXT);
            peopleTab.innerHTML = `
        <ul class="item-list">
          <li style="padding: 20px; text-align: center; color: var(--text-error);">
            Supabase client not available. Please refresh the page.
          </li>
        </ul>
      `;
            return false;
        }
        Logger.debug('👥 PEOPLE: Supabase client available, fetching users...', null, PEOPLE_LOG_CONTEXT);
        const { users, error } = await fetchPeopleFromTables(supabase);
        if (error) {
            Logger.error('❌ PEOPLE: Error fetching users from all table name variations:', error, PEOPLE_LOG_CONTEXT);
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
            return false;
        }
        if (!users) {
            Logger.error('❌ PEOPLE: No users data returned', null, PEOPLE_LOG_CONTEXT);
            peopleTab.innerHTML = `
        <ul class="item-list">
          <li style="padding: 20px; text-align: center; color: var(--text-secondary);">
            No users found in database
          </li>
        </ul>
      `;
            return false;
        }
        Logger.debug(`✅ PEOPLE: Fetched ${users.length} users from Supabase`, null, PEOPLE_LOG_CONTEXT);
        const currentUser = stateManagerInstance.getState('currentUser');
        const currentUserId = currentUser?.id;
        // UUID ONLY - filter by id only, not email
        const displayUsers = users.filter((user) => {
            if (currentUserId && user.id === currentUserId) {
                return false;
            }
            return true;
        });
        let activeUserIds = new Set();
        if (displayUsers.length > 0) {
            // UUID ONLY - use user IDs, not emails
            const userIds = displayUsers
                .map((u) => u.id)
                .filter((id) => !!id);
            if (userIds.length > 0) {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
                activeUserIds = await fetchActivePresenceIds(supabase, userIds, fiveMinutesAgo, displayUsers);
            }
        }
        if (displayUsers.length === 0) {
            peopleTab.innerHTML = `
        <ul class="item-list">
          <li style="padding: 20px; text-align: center; color: var(--text-secondary);">
            No users found
          </li>
        </ul>
      `;
            return false;
        }
        const usersHTML = displayUsers
            .map((user) => {
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
        })
            .join('');
        peopleTab.innerHTML = `
      <ul class="item-list" style="list-style: none; padding: 0; margin: 0;">
        ${usersHTML}
      </ul>
    `;
        Logger.debug(`✅ PEOPLE: People tab updated with ${displayUsers.length} users`, null, PEOPLE_LOG_CONTEXT);
        return true;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'renderPeopleTab',
                component: 'People',
            },
        });
        if (typeof document !== 'undefined') {
            const fallbackTab = document.getElementById('people-tab');
            if (fallbackTab) {
                fallbackTab.innerHTML = `
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
        Logger.warn('⚠️ PEOPLE: Failed to render People tab', error, PEOPLE_LOG_CONTEXT);
        return false;
    }
}
async function ensurePeopleTabInitialized() {
    if (peopleTabInitialized) {
        Logger.debug('ℹ️ PEOPLE: People tab already initialized; skipping duplicate render', null, PEOPLE_LOG_CONTEXT);
        return;
    }
    if (peopleTabInitPromise) {
        Logger.debug('ℹ️ PEOPLE: People tab initialization already in progress; joining promise', null, PEOPLE_LOG_CONTEXT);
        await peopleTabInitPromise;
        return;
    }
    peopleTabInitPromise = (async () => {
        const didRender = await renderPeopleTab();
        if (didRender) {
            peopleTabInitialized = true;
        }
    })().finally(() => {
        peopleTabInitPromise = null;
    });
    await peopleTabInitPromise;
}
/**
 * Initialize People Tab - Load real users from Supabase
 */
async function initializePeopleTab() {
    await ensurePeopleTabInitialized();
}
// Create singleton instance
const peopleModuleInstance = new PeopleModule();
function initializePeopleModule() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        Logger.debug('ℹ️ PEOPLE: Skipping PeopleModule bootstrap (no DOM context)', null, PEOPLE_LOG_CONTEXT);
        return;
    }
    if (peopleModuleBootstrapRequested) {
        Logger.debug('ℹ️ PEOPLE: initializePeopleModule already requested; skipping duplicate attach', null, PEOPLE_LOG_CONTEXT);
        return;
    }
    peopleModuleBootstrapRequested = true;
    const bootstrap = () => {
        void (async () => {
            try {
                await peopleModuleInstance.initialize();
                await ensurePeopleTabInitialized();
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'initializePeopleModule',
                        component: 'PeopleModule',
                    },
                });
                Logger.error('❌ PEOPLE: Failed to bootstrap PeopleModule', error, PEOPLE_LOG_CONTEXT);
            }
        })();
    };
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        bootstrap();
        return;
    }
    document.addEventListener('DOMContentLoaded', () => {
        bootstrap();
    }, { once: true });
}
const peopleModuleApi = {
    PeopleModule,
    peopleModuleInstance,
    initializePeopleModule,
    initializePeopleTab,
    ensurePeopleTabInitialized,
    fetchPeopleFromTables,
    fetchActivePresenceIds,
    normalizePeopleUser,
};
// Export as ES6 module
export { PeopleModule, peopleModuleInstance, initializePeopleModule, initializePeopleTab, ensurePeopleTabInitialized, fetchPeopleFromTables, fetchActivePresenceIds, normalizePeopleUser, peopleModuleApi, };
export default peopleModuleApi;

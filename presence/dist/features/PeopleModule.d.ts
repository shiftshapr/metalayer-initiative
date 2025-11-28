/**
 * PEOPLE MODULE - People and Connections
 * Handles all people and connection functionality
 */
import type { SupabaseClient, SupabasePeopleListRow, SupabaseQueryError } from '../types/index.js';
declare class PeopleModule {
    private logLevel;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    private log;
}
type PeopleDisplayUser = {
    id: string;
    email?: string;
    name?: string;
    handle?: string;
    avatarUrl?: string;
    auraColor?: string;
    createdAt?: string;
};
declare function normalizePeopleUser(row: SupabasePeopleListRow): PeopleDisplayUser;
declare function fetchPeopleFromTables(client: SupabaseClient): Promise<{
    users: PeopleDisplayUser[] | null;
    error: SupabaseQueryError | null;
}>;
declare function fetchActivePresenceIds(client: SupabaseClient, userIds: string[], sinceIso: string, _displayUsers: PeopleDisplayUser[]): Promise<Set<string>>;
declare function ensurePeopleTabInitialized(): Promise<void>;
/**
 * Initialize People Tab - Load real users from Supabase
 */
declare function initializePeopleTab(): Promise<void>;
declare const peopleModuleInstance: PeopleModule;
declare function initializePeopleModule(): void;
declare const peopleModuleApi: {
    PeopleModule: typeof PeopleModule;
    peopleModuleInstance: PeopleModule;
    initializePeopleModule: typeof initializePeopleModule;
    initializePeopleTab: typeof initializePeopleTab;
    ensurePeopleTabInitialized: typeof ensurePeopleTabInitialized;
    fetchPeopleFromTables: typeof fetchPeopleFromTables;
    fetchActivePresenceIds: typeof fetchActivePresenceIds;
    normalizePeopleUser: typeof normalizePeopleUser;
};
export { PeopleModule, peopleModuleInstance, initializePeopleModule, initializePeopleTab, ensurePeopleTabInitialized, fetchPeopleFromTables, fetchActivePresenceIds, normalizePeopleUser, peopleModuleApi, };
export default peopleModuleApi;
//# sourceMappingURL=PeopleModule.d.ts.map
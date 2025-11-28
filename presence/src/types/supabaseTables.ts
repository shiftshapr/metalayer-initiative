/**
 * Shared Supabase table interfaces used across modules.
 * Keeps query builders strongly typed without ad-hoc casts.
 */
export interface SupabaseQueryError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface SupabaseQueryResult<T> {
  data: T[] | null;
  error: SupabaseQueryError | null;
}

export interface SupabaseSingleResult<T> {
  data: T | null;
  error: SupabaseQueryError | null;
}

/**
 * Canonical representation of AppUser rows. Includes both
 * camelCase and snake_case so callers can normalize after fetching.
 */
export interface SupabaseAppUserRow {
  id?: string;
  email?: string;
  name?: string | null;
  handle?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  auraColor?: string | null;
  aura_color?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

/**
 * Minimal view for the People tab (list of users).
 */
export interface SupabasePeopleListRow extends SupabaseAppUserRow {
  avatarUrl?: string | null;
  auraColor?: string | null;
  createdAt?: string | null;
}

/**
 * Basic presence information for activity checks.
 */
export interface SupabasePresenceStatusRow {
  user_email?: string | null;
  is_active?: boolean | null;
  last_seen?: string | null;
  user_id?: string | null;
}

/**
 * Presence row with relation to AppUser (used by services).
 */
export interface SupabasePresenceRecord extends SupabasePresenceStatusRow {
  page_id?: string | null;
  AppUser?: SupabaseAppUserRow | null;
}

/**
 * Reaction row (fallback query when API not available).
 */
export interface SupabaseReactionRow {
  id?: string;
  message_id?: string;
  user_id?: string;
  emoji?: string;
  type?: string;
  value?: string;
  reaction?: string;
  created_at?: string;
  [key: string]: unknown;
}






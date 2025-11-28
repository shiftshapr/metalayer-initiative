/**
 * People Module Supabase Diagnostic
 *
 * Run in the sidepanel browser console before/after People tab changes:
 *   1. Validates available Supabase tables for user listings
 *   2. Confirms column shapes needed for strongly-typed builders
 *   3. Inspects recent presence activity for the same email set
 *
 * Usage:
 *   await window.diagnosePeopleModuleSupabase();
 */
(function () {
  'use strict';

  async function diagnosePeopleModuleSupabase(customOptions) {
    console.group('🔍 People Module Supabase Diagnostic');

    const options = {
      limit: 5,
      tableNames: ['AppUser', 'appuser', 'Appuser', 'users', 'Users'],
      presenceWindowMinutes: 5,
      ...(typeof customOptions === 'object' ? customOptions : {}),
    };

    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase client not found on window');
      console.groupEnd();
      return;
    }

    try {
      const client = window.supabase;
      const seenUsers = [];

      console.group('👥 Step 1: User table sampling');
      for (const tableName of options.tableNames) {
        try {
          console.log(`➡️ Querying ${tableName}`);
          const result = await client
            .from(tableName)
            .select('id, email, name, handle, avatarUrl, avatar_url, auraColor, aura_color, createdAt, created_at')
            .order('createdAt', { ascending: false })
            .limit(options.limit);

          if (result.error) {
            console.warn(`   ⚠️ ${tableName} error:`, result.error);
            continue;
          }

          if (Array.isArray(result.data) && result.data.length > 0) {
            console.log(`   ✅ ${tableName} returned ${result.data.length} rows`);
            console.table(
              result.data.map((row) => ({
                id: row.id,
                email: row.email,
                handle: row.handle,
                auraColor: row.auraColor || row.aura_color,
                avatarField: row.avatarUrl ? 'avatarUrl' : row.avatar_url ? 'avatar_url' : 'none',
                createdAtField: row.createdAt ? 'createdAt' : row.created_at ? 'created_at' : 'none',
              })),
            );
            result.data.forEach((row) => {
              if (row?.email) {
                seenUsers.push(row.email);
              }
            });
            break;
          } else {
            console.log(`   ℹ️ ${tableName} returned no rows`);
          }
        } catch (tableError) {
          console.error(`   ❌ ${tableName} exception:`, tableError);
        }
      }
      console.groupEnd();

      if (seenUsers.length === 0) {
        console.warn('⚠️ Could not sample any users; skipping presence checks');
        console.groupEnd();
        return;
      }

      const lookbackIso = new Date(Date.now() - options.presenceWindowMinutes * 60 * 1000).toISOString();
      console.group('🟢 Step 2: Presence sampling');
      try {
        const presenceResult = await client
          .from('user_presence')
          .select('user_email, is_active, last_seen')
          .in('user_email', seenUsers)
          .gte('last_seen', lookbackIso);

        if (presenceResult.error) {
          console.warn('⚠️ Presence query error:', presenceResult.error);
        } else if (Array.isArray(presenceResult.data) && presenceResult.data.length > 0) {
          console.table(
            presenceResult.data.map((row) => ({
              email: row.user_email,
              isActive: row.is_active,
              lastSeen: row.last_seen,
            })),
          );
        } else {
          console.log('ℹ️ No active presence rows returned for sampled users');
        }
      } catch (presenceErr) {
        console.error('❌ Presence query exception:', presenceErr);
      }
      console.groupEnd();
    } finally {
      console.groupEnd();
    }
  }

  if (typeof window !== 'undefined') {
    window.diagnosePeopleModuleSupabase = diagnosePeopleModuleSupabase;
    console.log('✅ Loaded diagnosePeopleModuleSupabase(). Run it from the console when needed.');
  }
})();



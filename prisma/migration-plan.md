# Migration Plan: Email Foreign Keys → UUID Foreign Keys

## Overview
Migrating from email-based foreign keys to UUID-based foreign keys for proper relational design, better performance, and future-proofing.

## Current State
- `AppUser.id`: UUID (primary key)
- `AppUser.email`: String, unique (business key)
- All tables: `user_email` → `AppUser.email` (non-standard FK)

## Target State
- `AppUser.id`: UUID (primary key) - unchanged
- `AppUser.email`: String, unique (business key) - unchanged
- All tables: `user_id` (UUID) → `AppUser.id` (standard FK)
- All tables: `user_email` (String) - kept for backward compatibility and readability

## Tables to Migrate

### 1. `messages` table
- Add: `user_id String @db.Uuid`
- Keep: `user_email String` (denormalized, indexed)
- Add: `AppUser AppUser @relation(fields: [user_id], references: [id])`
- Remove: Old foreign key relationship

### 2. `reactions` table
- Add: `user_id String @db.Uuid`
- Keep: `user_email String` (denormalized, indexed)
- Add: `AppUser AppUser @relation(fields: [user_id], references: [id])`
- Remove: Old foreign key relationship

### 3. `user_presence` table ⚠️ COMPLEX
- Current: Composite primary key `[user_email, page_id]`
- Add: `user_id String @db.Uuid`
- Keep: `user_email String` (for queries)
- Change: Primary key to `id` (already exists)
- Add unique constraint: `@@unique([user_email, page_id])`
- Add: `AppUser AppUser @relation(fields: [user_id], references: [id])`

### 4. `message_deletions` table
- Add: `user_id String @db.Uuid`
- Keep: `deleted_by String` (may contain email or UUID - needs validation)
- Add: `AppUser AppUser @relation(fields: [user_id], references: [id])`

## Migration Steps

### Phase 1: Schema Migration (Backward Compatible)
1. Add `user_id` columns (nullable initially)
2. Populate `user_id` from existing `user_email` by joining to `AppUser`
3. Keep `user_email` columns (denormalized)
4. Add foreign key constraints
5. Make `user_id` NOT NULL after population

### Phase 2: Code Migration
1. Update all INSERT statements to include both `user_id` and `user_email`
2. Update all UPDATE statements to maintain both fields
3. Update queries to use `user_id` for joins, `user_email` for readability
4. Update indexes for optimal performance

### Phase 3: Validation
1. Verify all records have valid `user_id`
2. Test foreign key constraints
3. Performance test joins vs denormalized lookups
4. Validate backward compatibility

## Backward Compatibility Strategy
- Keep `user_email` columns permanently (denormalized)
- All INSERT/UPDATE operations update both `user_id` and `user_email`
- Queries can use either field
- Maintain indexes on both fields

## Rollback Plan
- If migration fails, we can drop `user_id` columns
- `user_email` columns remain functional
- No data loss possible

## Performance Considerations
- UUID foreign keys: Fixed length, faster joins
- Email columns: Denormalized for read performance
- Indexes: Both fields indexed for optimal queries


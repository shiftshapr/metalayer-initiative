# Migration: Remove legacyId and Backward Compatibility

## Overview

This migration removes all backward compatibility code and the `legacyId` column from the database, enforcing RED-LINE compliance: "No backward compatibility in pre-launch phase."

## Database Changes

### 1. Remove `legacyId` Column

**SQL Migration:**
```sql
-- Remove legacyId column from MetaCommunity table
ALTER TABLE "MetaCommunity" DROP COLUMN IF EXISTS "legacyId";

-- Remove index on legacyId
DROP INDEX IF EXISTS "MetaCommunity_legacyId_key";
```

### 2. Update Prisma Schema

**File:** `prisma/schema.prisma`

**Before:**
```prisma
model MetaCommunity {
  id                    String   @id @default(uuid())
  legacyId               String?   // For backward compatibility (e.g., "comm-001")
  // ...
  @@index([legacyId])
}
```

**After:**
```prisma
model MetaCommunity {
  id                    String   @id @default(uuid())
  // legacyId removed - no backward compatibility
  // ...
}
```

## Code Changes Required

### 1. Backend: `controllers/communitiesController.js`

**Remove all `legacyId` queries and fallbacks:**

**Lines to fix:**
- Line 64: `where: { legacyId: 'comm-001' }` → Use UUID
- Line 68: `{ legacyId: 'comm-001' }` → Use UUID
- Line 89: `c.legacyId || c.id` → Use `c.id` only
- Line 127: `where: { legacyId: communityId }` → Use `where: { id: communityId }`
- Line 234: `legacyId || id` → Use `id` only
- Line 256: `legacyId || id` → Use `id` only
- Line 302: `legacyId || id` → Use `id` only
- Line 332: `where: { legacyId: id }` → Use `where: { id: id }`
- Line 358: `legacyId || id` → Use `id` only
- Line 475: `where: { legacyId: id }` → Use `where: { id: id }`

### 2. Frontend: `features/CommunitiesModule.js`

**Remove `'comm-001'` fallbacks:**

**Lines to fix:**
- Line 313: `updateCommunityDropdown([{ id: 'comm-001', name: 'Public Square' }])` → Fail fast
- Line 316-333: Remove `'comm-001'` fallback logic → Fail fast if no communities
- Line 776: `communityId: 'comm-001'` → Use actual communityId or fail
- Line 850: `communityId: 'comm-001'` → Use actual communityId or fail

### 3. Frontend: Remove Deprecated Functions

**Files with deprecated code:**
- `features/CanopiModule.js`:
  - Line 1178-1180: Remove deprecated reaction function
  - Line 2291-2296: Remove deprecated `loadMessageReplies` function

- `features/DisplayNameManager.js`:
  - Line 196: Remove DEPRECATED API fallback
  - Line 216: Remove DEPRECATED JSON fallback
  - Line 338: Remove DEPRECATED API save

- `features/SettingsHeadlineManager.js`:
  - Line 198: Remove DEPRECATED API fallback
  - Line 215: Remove DEPRECATED JSON fallback
  - Line 339: Remove DEPRECATED API save

### 4. Remove Backward Compatibility Comments

**Files with backward compatibility comments:**
- `features/CommunitiesModule.js`: Lines 249, 600, 968
- `features/UserHoverModal.js`: Lines 714, 744
- `presence/sidepanel.css`: Line 4554
- `utils/UserPreferencesManager.js`: Line 659
- `PreRenderInitializer.js`: Line 164

### 5. Remove Unnecessary Fallbacks

**Pattern to remove:** `|| null`, `|| []`, `|| {}`, `|| ''`

**Files to review:**
- `features/CommunitiesModule.js`: Lines 369, 421, 520, 531
- `features/CanopiModule.js`: Multiple locations with `|| null`, `|| []`, `|| ''`

**RED-LINE Rule:** Functions should fail fast if dependencies are missing, not use fallback values.

## Migration Steps

### Step 1: Data Migration (if needed)

If any data references `legacyId`, migrate it first:

```sql
-- Check if any data uses legacyId
SELECT id, "legacyId", name FROM "MetaCommunity" WHERE "legacyId" IS NOT NULL;

-- If needed, update any foreign key references
-- (Check messages, memberships, etc. for legacyId references)
```

### Step 2: Update Backend Code

1. Update `controllers/communitiesController.js`:
   - Remove all `legacyId` queries
   - Use UUID `id` only
   - Fail fast if community not found

2. Test backend endpoints:
   - Community lookup by UUID
   - Community creation
   - Community updates

### Step 3: Update Frontend Code

1. Remove `'comm-001'` fallbacks:
   - Update `CommunitiesModule.js`
   - Fail fast if no communities available

2. Remove deprecated functions:
   - Remove or update deprecated reaction functions
   - Remove deprecated `loadMessageReplies`

3. Remove backward compatibility comments:
   - Clean up all "backward compatibility" comments
   - Update function documentation

### Step 4: Database Migration

1. Run Prisma migration:
   ```bash
   npx prisma migrate dev --name remove_legacy_id
   ```

2. Or run SQL directly:
   ```sql
   ALTER TABLE "MetaCommunity" DROP COLUMN IF EXISTS "legacyId";
   DROP INDEX IF EXISTS "MetaCommunity_legacyId_key";
   ```

### Step 5: Update Prisma Schema

1. Remove `legacyId` field from `MetaCommunity` model
2. Remove `@@index([legacyId])`
3. Run `npx prisma format`

### Step 6: Testing

1. **Backend Tests:**
   - Community lookup by UUID
   - Community creation
   - Community updates
   - Error handling (fail fast)

2. **Frontend Tests:**
   - Community loading
   - Chat history loading
   - Reply loading
   - Error handling (fail fast)

## Rollback Plan

If rollback is needed:

```sql
-- Restore legacyId column
ALTER TABLE "MetaCommunity" ADD COLUMN "legacyId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "MetaCommunity_legacyId_key" ON "MetaCommunity"("legacyId");
```

## Risk Assessment

**High Risk:**
- If any data or code depends on `legacyId`
- If external systems reference `legacyId`

**Mitigation:**
- Check all references before migration
- Test thoroughly in staging
- Have rollback plan ready

## Status

- [ ] Data migration completed
- [ ] Backend code updated
- [ ] Frontend code updated
- [ ] Database migration run
- [ ] Prisma schema updated
- [ ] Tests passing
- [ ] Documentation updated

